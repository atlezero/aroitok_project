# วิธี Deploy AroiTok ไปยัง Vercel

## ขั้นตอนที่ 1: Login เข้า Vercel
```bash
vercel login
```

## ขั้นตอนที่ 2: Deploy โปรเจค
```bash
vercel
```

เลือก:
- **Set up and deploy?** → Yes
- **Which scope?** → เลือก account ของคุณ
- **Link to existing project?** → No
- **What's your project's name?** → aroitok (หรือชื่อที่ต้องการ)
- **In which directory is your code located?** → ./
- กด Enter เพื่อใช้ค่าเริ่มต้น

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables (สำคัญมาก!)

หลัง deploy เสร็จ ให้ไปที่:
1. เข้า [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจค **aroitok**
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่ม 3 ตัวแปรนี้:

| Name | Value |
|------|-------|
| `CHANNEL_ACCESS_TOKEN` | `UfukekBbYxSrZYstIOY8Jxa2YElaQImau0pwurjSQbGignl98UEXnIrrjApQh6S/VntL1+7RgNKEEvGI7R5dVGyn6zW2A9tzqfks9b3zCEDOdkfTFHtyHg0ltJSAj+OrSISPyVGIwHCeldlgbBY4RAdB04t89/1O/w1cDnyilFU=` |
| `CHANNEL_SECRET` | `145ad5f38e7a91156750f5dd196e5ffe` |
| `GEMINI_API_KEY` | `` |

5. คลิก **Save**
6. **สำคัญ:** ต้อง Redeploy โปรเจคใหม่เพื่อให้ตัวแปรมีผล (คลิก Deployments → คลิก ... → Redeploy)

## ขั้นตอนที่ 4: ตั้งค่า LINE Webhook URL

หลัง deploy เสร็จ คุณจะได้ URL เช่น: `https://aroitok.vercel.app`

ให้ไปตั้งค่าที่ [LINE Developers Console](https://developers.line.biz/console):
1. เลือกโปรเจค LINE Bot ของคุณ
2. ไปที่ **Messaging API**
3. ในส่วน **Webhook settings** → **Webhook URL** ใส่:
   ```
   https://aroitok.vercel.app/api/webhook
   ```
4. เปิด **Use webhook** (toggle สีเขียว)
5. คลิก **Verify** เพื่อทดสอบ (ควรขึ้น Success)

## ขั้นตอนที่ 5: ทดสอบ

ส่งข้อความไปที่ LINE Bot ของคุณ ควรได้คำตอบจาก Gemini!

## Deploy ครั้งต่อไป

เมื่อแก้โค้ดและต้องการ deploy ใหม่:
```bash
git add .
git commit -m "your message"
git push origin main
```

Vercel จะ auto-deploy ให้โดยอัตโนมัติ!

หรือใช้คำสั่ง:
```bash
vercel --prod
```

## หมายเหตุ

- Vercel Free tier รองรับ 100GB bandwidth/เดือน
- Serverless Functions มี limit 10 วินาที/request
- ถ้าต้องการ custom domain สามารถตั้งค่าได้ที่ Dashboard
