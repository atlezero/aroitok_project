// ====================================================================
// LINE BOT + GOOGLE GEMINI (TEXT = 2.5-FLASH, IMAGE = 2.0-FLASH-EXP)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { messagingApi, WebhookEvent, MessageEvent } from "@line/bot-sdk";
import { GoogleGenAI } from "@google/genai";

// ====================================================================
// ENV
// ====================================================================
const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
});
const channelSecret = process.env.CHANNEL_SECRET!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

// Google AI Client
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// ====================================================================
// SYSTEM PROMPT
// ====================================================================
const SYSTEM_PROMPT = `
คุณคือผู้ช่วยด้านอาหารและสุขภาพ มีหน้าที่ตอบคำถามเกี่ยวกับ:
- อาหารและโภชนาการ
- สุขภาพ
- ออกกำลังกาย
- สูตรอาหาร
- โภชนาการอาหาร

หากคำถามไม่เกี่ยวกับอาหารและสุขภาพ ให้ตอบว่า:
"ขอโทษค่ะ ฉันตอบได้เฉพาะเรื่องอาหาร สุขภาพ โภชนาการ และการกินนะคะ 🍎"
`;

// ====================================================================
// SPAM PROTECTION
// ====================================================================
const userLastMsg = new Map<string, number>();
const SPAM_MS = 3000;

// ====================================================================
// MAIN WEBHOOK
// ====================================================================
export async function POST(req: NextRequest) {
  try {
    if (!channelSecret || !geminiApiKey) {
      return NextResponse.json(
        { error: "Missing ENV variables" },
        { status: 500 }
      );
    }

    const raw = await req.text();
    const { events } = JSON.parse(raw);

    if (!events) {
      return NextResponse.json({ error: "No events" }, { status: 400 });
    }

    await Promise.all(events.map((ev: WebhookEvent) => handleEvent(ev)));

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ====================================================================
// HANDLE EVENT
// ====================================================================
async function handleEvent(event: WebhookEvent) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const userId = event.source.userId!;
  const text = event.message.text;
  const now = Date.now();

  // Anti-spam
  const last = userLastMsg.get(userId) ?? 0;
  if (now - last < SPAM_MS) {
    await reply(event.replyToken, "รอแป๊บเด้อ 😅");
    return;
  }
  userLastMsg.set(userId, now);

  // ถามเรื่องรูป
  if (/สร้างรูป|วาดรูป/.test(text)) {
    await handleImage(event, text);
    return;
  }

  // Otherwise → normal text generation
  await handleText(event, text);
}

// ====================================================================
// TEXT MODEL — Gemini 2.5 Flash
// ====================================================================
async function handleText(event: MessageEvent, userMessage: string) {
  const replyToken = event.replyToken;

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nคำถาม: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.text || "ตอบไม่ได้จ้า 😭";

    await reply(replyToken, text.length > 5000 ? text.substring(0, 4900) + "\n\n(ตัดบางส่วน)" : text);
  } catch (err) {
    console.error("Gemini Text Error:", err);
    await reply(replyToken, "ระบบงอแง ลองใหม่ทีหลังนะ 😂");
  }
}

// ====================================================================
// IMAGE GENERATION — Gemini 2.0 Flash EXP
// ====================================================================
async function handleImage(event: MessageEvent, userMessage: string) {
  const replyToken = event.replyToken;
  const userId = event.source.userId!;

  const prompt = userMessage.replace(/สร้างรูป|วาดรูป/gi, "").trim();
  if (!prompt) {
    await reply(replyToken, "บอกก่อนสิว่าจะให้วาดอะไร 🤨");
    return;
  }

  // อนุญาตเฉพาะอาหาร/สุขภาพ
  const allowed = [
    "อาหาร",
    "ผัก",
    "ผลไม้",
    "เมนู",
    "สลัด",
    "อาหารคลีน",
    "โภชนาการ",
    "food",
    "healthy",
    "meal",
  ];

  if (!allowed.some((k) => prompt.includes(k))) {
    await reply(replyToken, "รูปต้องเกี่ยวกับอาหารหรือสุขภาพเท่านั้นนะ 🥗");
    return;
  }

  // แจ้งกำลังวาด
  await reply(replyToken, "กำลังวาดรูปให้อยู่นะ 😎🎨");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: `Generate a food/health related image: ${prompt}` }] }],
    });

    const img = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!img) throw new Error("Image missing");

    // NOTE: LINE ต้องใช้ URL → ยังส่งรูปไม่ได้จนกว่าจะ upload ไป storage ก่อน
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: "text",
          text:
            "รูปสร้างเสร็จแล้ว 🎉\nแต่ต้องอัปโหลดไฟล์ไป storage ก่อน ถึงจะส่งใน LINE ได้เด้อ 📦",
        },
      ],
    });
  } catch (err) {
    console.error("Image Error:", err);
    await client.pushMessage({
      to: userId,
      messages: [{ type: "text", text: "วาดรูปไม่ผ่าน ลองใหม่ทีหลังนะ 😭" }],
    });
  }
}

// ====================================================================
// HELPERS
// ====================================================================
async function reply(replyToken: string, text: string) {
  return client.replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  });
}
