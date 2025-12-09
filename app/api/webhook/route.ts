import { NextRequest, NextResponse } from "next/server";
import { messagingApi, WebhookEvent, MessageEvent } from "@line/bot-sdk";
import { GoogleGenAI } from "@google/genai";

// LINE Bot Config
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN!;
const channelSecret = process.env.CHANNEL_SECRET!;

const client = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

// Gemini 3.0 Config
const geminiApiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// System Prompt สำหรับกำหนดบทบาท AI
const SYSTEM_PROMPT = `คุณคือผู้ช่วยด้านอาหารและสุขภาพ มีหน้าที่ตอบคำถามเกี่ยวกับ:
- อาหารและโภชนาการ
- สุขภาพและการดูแลสุขภาพ
- การออกกำลังกาย
- สูตรอาหารและการทำอาหาร
- ข้อมูลทางโภชนาการของอาหาร

หากมีคำถามที่ไม่เกี่ยวข้องกับอาหารและสุขภาพ ให้ตอบว่า "ขอโทษค่ะ ฉันสามารถตอบคำถามเกี่ยวกับอาหารและสุขภาพเท่านั้น หากคุณมีคำถามเกี่ยวกับการกิน โภชนาการ หรือสุขภาพ ยินดีช่วยเหลือค่ะ 🍎"

ตอบเป็นภาษาไทยที่เป็นกันเอง เข้าใจง่าย และให้ข้อมูลที่เป็นประโยชน์`;

// Rate Limiting: เก็บ timestamp ของการส่งข้อความล่าสุดของแต่ละ user
const userLastMessage = new Map<string, number>();
const SPAM_THRESHOLD_MS = 3000; // ห้ามส่งข้อความเร็วกว่า 3 วินาที

export async function POST(req: NextRequest) {
  if (!channelAccessToken || !channelSecret || !geminiApiKey) {
    return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
  }

  try {
    const bodyText = await req.text();
    const { events } = JSON.parse(bodyText);

    if (!events) {
      return NextResponse.json({ error: "No events" }, { status: 400 });
    }

    await Promise.all(events.map((event: WebhookEvent) => handleEvent(event)));

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleEvent(event: WebhookEvent) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const userId = event.source.userId || "unknown";
  const userMessage = event.message.text;

  // ✅ ป้องกันการสแปม
  const now = Date.now();
  const lastMessageTime = userLastMessage.get(userId) || 0;

  if (now - lastMessageTime < SPAM_THRESHOLD_MS) {
    console.log(`User ${userId} is sending messages too quickly`);
    try {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: "กรุณารอสักครู่ก่อนส่งข้อความถัดไป 😊",
          },
        ],
      });
    } catch (error) {
      console.error("Error sending rate limit message:", error);
    }
    return;
  }

  // อัปเดตเวลาส่งข้อความล่าสุด
  userLastMessage.set(userId, now);

  try {
    // ✅ ตรวจสอบว่าเป็นคำสั่งสร้างรูปภาพหรือไม่
    if (userMessage.toLowerCase().includes("สร้างรูป") ||
      userMessage.toLowerCase().includes("วาดรูป") ||
      userMessage.toLowerCase().includes("generate image")) {
      await handleImageGeneration(event, userMessage);
      return;
    }

    // ✅ ใช้ Gemini 2.5 Flash พร้อม System Prompt
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + "\n\nคำถาม: " + userMessage }]
        }
      ],
    });

    const replyText = response.text || "ขออภัย ไม่สามารถสร้างคำตอบได้";

    // ตัดข้อความถ้ายาวเกิน 5000 ตัวอักษร (ขีดจำกัดของ LINE)
    const truncatedText = replyText.length > 5000
      ? replyText.substring(0, 4950) + "...\n\n(ข้อความยาวเกินไป ตัดบางส่วน)"
      : replyText;

    // Reply to LINE
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: truncatedText }],
    });
  } catch (error) {
    console.error("Gemini or LINE Reply Error:", error);

    // ส่งข้อความ error กลับให้ user
    try {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: "ขออภัย ระบบเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏",
          },
        ],
      });
    } catch (replyError) {
      console.error("Error sending fallback message:", replyError);
    }
  }
}

// ✅ ฟังก์ชันสำหรับสร้างรูปภาพด้วย Gemini 3.0 (Imagen 3)
async function handleImageGeneration(event: MessageEvent, userMessage: string) {
  try {
    // ดึง prompt จากข้อความ (ตัดคำสั่งออก)
    const prompt = userMessage
      .replace(/สร้างรูป|วาดรูป|generate image/gi, "")
      .trim();

    // ✅ กรองให้สร้างเฉพาะรูปที่เกี่ยวกับอาหารและสุขภาพ
    const foodHealthKeywords = [
      "อาหาร", "ผัก", "ผลไม้", "เมนู", "สลัด", "น้ำ", "วิตามิน", "โปรตีน",
      "food", "healthy", "meal", "salad", "fruit", "vegetable", "nutrition",
      "ข้าว", "เนื้อ", "ปลา", "ไข่", "นม", "ธัญพืช"
    ];

    const isRelated = foodHealthKeywords.some(keyword =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isRelated) {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: "ขอโทษค่ะ ฉันสามารถสร้างรูปภาพเกี่ยวกับอาหารและสุขภาพเท่านั้น เช่น 'สร้างรูปสลัดผัก' หรือ 'สร้างรูปอาหารคลีน' 🥗",
          },
        ],
      });
      return;
    }

    if (!prompt) {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: "กรุณาระบุว่าต้องการสร้างรูปอะไร เช่น 'สร้างรูปสลัดผัก' หรือ 'วาดรูปผลไม้หลากสี' 🎨",
          },
        ],
      });
      return;
    }

    // ส่งข้อความรอสักครู่
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "กำลังสร้างรูปภาพ กรุณารอสักครู่... 🎨",
        },
      ],
    });

    // ✅ ใช้ Imagen 3 ผ่าน Gemini 3.0 API
    const response = await ai.models.generateContent({
      model: "imagen-3.0-generate-001",
      contents: prompt,
    });

    // ตรวจสอบว่ามีรูปภาพหรือไม่
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];

      // ดึงข้อมูลรูปภาพ (อาจเป็น base64 หรือ URL)
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if ('inlineData' in part && part.inlineData) {
            // กรณีเป็น base64 - ต้องมีระบบ upload
            const userId = event.source.userId;
            if (userId) {
              await client.pushMessage({
                to: userId,
                messages: [
                  {
                    type: "text",
                    text: "✅ สร้างรูปภาพสำเร็จแล้ว!\n\n⚠️ แต่ระบบยังไม่รองรับการส่งรูปผ่าน LINE\nกรุณาติดตั้ง Cloud Storage (เช่น Cloudinary, AWS S3) เพื่อใช้ฟีเจอร์นี้",
                  },
                ],
              });
            }
            return;
          }
        }
      }
    }

    // กรณีไม่มีรูปภาพ
    const userId = event.source.userId;
    if (userId) {
      await client.pushMessage({
        to: userId,
        messages: [
          {
            type: "text",
            text: "ขออภัย ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่อีกครั้ง 🙏",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
    const userId = event.source.userId;
    if (userId) {
      try {
        await client.pushMessage({
          to: userId,
          messages: [
            {
              type: "text",
              text: "ขออภัย ระบบสร้างรูปภาพเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง 🙏",
            },
          ],
        });
      } catch (pushError) {
        console.error("Error sending image error message:", pushError);
      }
    }
  }
}