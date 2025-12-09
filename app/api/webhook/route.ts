import { NextRequest, NextResponse } from "next/server";
import { messagingApi, WebhookEvent, MessageEvent } from "@line/bot-sdk";
import { GoogleGenAI } from "@google/genai";

// ===== LINE BOT CONFIG =====
const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
});

const channelSecret = process.env.CHANNEL_SECRET!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

// ===== GOOGLE GEN AI CLIENT =====
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// ===== SYSTEM PROMPT =====
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

// ===== RATE LIMIT MAP =====
const userLastMessage = new Map<string, number>();
const SPAM_THRESHOLD_MS = 3000;

// ====================================================================
// MAIN WEBHOOK
// ====================================================================
export async function POST(req: NextRequest) {
  try {
    if (!channelSecret || !geminiApiKey) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    const body = await req.text();
    const { events } = JSON.parse(body);

    if (!events) {
      return NextResponse.json({ error: "No events" }, { status: 400 });
    }

    await Promise.all(events.map((ev: WebhookEvent) => handleEvent(ev)));

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// ====================================================================
// HANDLE EVENT
// ====================================================================
async function handleEvent(event: WebhookEvent) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const userId = event.source.userId!;
  const userMessage = event.message.text;
  const now = Date.now();

  // Anti-spam
  const lastTime = userLastMessage.get(userId) || 0;
  if (now - lastTime < SPAM_THRESHOLD_MS) {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: "ใจเย็นๆ รอแป๊บนะเว้ย 😅" }],
    });
    return;
  }
  userLastMessage.set(userId, now);

  // ถ้าเป็นคำสั่งสร้างรูป → ยิงไปฟังก์ชัน generate image
  if (userMessage.includes("สร้างรูป") || userMessage.includes("วาดรูป")) {
    await handleImageGeneration(event, userMessage);
    return;
  }

  // ====================================================================
  // GEMINI 2.5 FLASH — TEXT MODEL
  // ====================================================================
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nคำถาม: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let reply = response.text ?? "ขออภัยค่ะ ระบบตอบไม่ได้ในตอนนี้";

    if (reply.length > 5000) {
      reply = reply.substring(0, 4900) + "\n\n(ข้อความยาวเกิน ตัดบางส่วนออก)";
    }

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: reply }],
    });
  } catch (err) {
    console.error("Gemini Text Error:", err);
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: "ระบบเอ๋อจ้า ลองใหม่ทีหลัง 🤣" }],
    });
  }
}

// ====================================================================
// HANDLE IMAGE GENERATION (IMAGEN 3)
// ====================================================================
async function handleImageGeneration(event: MessageEvent, userMessage: string) {
  const replyToken = event.replyToken;
  const prompt = userMessage.replace(/สร้างรูป|วาดรูป/gi, "").trim();
  const userId = event.source.userId!;

  if (!prompt) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "บอกมาก่อนว่าจะให้วาดอะไร 🤨" }],
    });
    return;
  }

  // อนุญาตแค่เรื่องอาหาร/สุขภาพ
  const allowed = [
    "อาหาร", "ผัก", "ผลไม้", "เมนู", "สลัด", "อาหารคลีน", "โปรตีน",
    "ไข่", "ปลา", "อาหารสุขภาพ", "nutrition", "food", "healthy", "meal",
  ];

  if (!allowed.some(k => prompt.includes(k))) {
    await client.replyMessage({
      replyToken,
      messages: [{
        type: "text",
        text: "ขอเฉพาะรูปที่เกี่ยวกับอาหาร/สุขภาพเท่านั้นนะ 🥗",
      }],
    });
    return;
  }

  // ส่งข้อความรอ
  await client.replyMessage({
    replyToken,
    messages: [{ type: "text", text: "กำลังวาดรูปให้แป๊บนะ 😎🎨" }],
  });

  try {
    // ยิง Imagen 3.0 รุ่นล่าสุด
    const res = await ai.models.generateContent({
      model: "imagen-3.0-generate-002",
      contents: prompt,
    });

    // ไม่มีระบบ upload → แจ้ง user
    await client.pushMessage({
      to: userId,
      messages: [{
        type: "text",
        text: "รูปสร้างเสร็จแล้ว แต่ระบบส่งรูปตรงใน LINE ยังไม่เปิดใช้ ต้องใส่ Cloud Storage ก่อนเด้อ 🤖📦",
      }],
    });
  } catch (err) {
    console.error("Image Error:", err);
    await client.pushMessage({
      to: userId,
      messages: [{ type: "text", text: "วาดรูปไม่ผ่านว่ะ ลองใหม่ทีหลัง 😭" }],
    });
  }
}
