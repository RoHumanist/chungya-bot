import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "청약알리미",
  description: "내 조건에 맞는 청약, 알아서 알려드립니다",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        <Providers>
          <div className="mx-auto max-w-lg min-h-dvh bg-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
