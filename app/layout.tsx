import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AroiTok - ดูรีวิวร้านเด็ดผ่านวิดีโอสั้น",
  description: "รวมรีวิวร้านเด็ดจากครีเอเตอร์ทั่วไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${prompt.variable} font-sans antialiased bg-gray-50 text-brand-dark`}
      >
        {children}
      </body>
    </html>
  );
}
