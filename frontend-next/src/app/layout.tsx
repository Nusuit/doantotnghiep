import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tri Thức Vị Giác Pro - AI Assistant",
  description: "Ứng dụng trợ lý AI thông minh giúp bạn tìm kiếm thông tin, học tập và giải quyết vấn đề một cách hiệu quả",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.variable} ${geist.variable} font-sans antialiased bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
