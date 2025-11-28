import { NextRequest, NextResponse } from "next/server";
import { messagingApi, WebhookEvent } from "@line/bot-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// LINE Bot Config
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN!;
const channelSecret = process.env.CHANNEL_SECRET!;

const client = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

// Gemini Config
const geminiApiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(geminiApiKey);

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

  const userMessage = event.message.text;

  try {
    // ✅ ใช้รุ่นที่ “มีอยู่จริง” จาก ListModels
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-pro", 
      // หรือประหยัดกว่า/เร็วกว่า:
      // model: "models/gemini-2.5-flash"
    });

    const result = await model.generateContent(userMessage);
    const replyText = result.response.text();

    // Reply to LINE
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: replyText }],
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
