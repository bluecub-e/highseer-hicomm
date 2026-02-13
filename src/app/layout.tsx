import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하이컴 (HiComm) — (주)하이시어 정보통신",
  description: "(주)하이시어에서 운영하는 온라인 정보통신 서비스 하이컴에 오신 것을 환영합니다.",
  keywords: ["하이컴", "HiComm", "하이시어", "정보통신", "온라인서비스"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="crt-effect">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
