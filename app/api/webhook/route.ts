import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// LINE Bot Configuration
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.CHANNEL_SECRET || '';

const client = new messagingApi.MessagingApiClient({
    channelAccessToken,
});

// Gemini Configuration
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(req: NextRequest) {
    if (!channelAccessToken || !channelSecret || !geminiApiKey) {
        return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('x-line-signature') as string;

        const events: WebhookEvent[] = JSON.parse(body).events;

        await Promise.all(events.map(async (event: WebhookEvent) => {
            return handleEvent(event);
        }));

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function handleEvent(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userMessage = event.message.text;

    try {
        // Call Gemini API - เปลี่ยนเป็น gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(userMessage);
        const response = result.response;
        const text = response.text();

        // Reply to LINE
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
                {
                    type: 'text',
                    text: text,
                },
            ],
        });
    } catch (error) {
        console.error('Error calling Gemini or replying to LINE:', error);
        // Optional: Reply with an error message to the user
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
                {
                    type: 'text',
                    text: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
                },
            ],
        });
    }
}
