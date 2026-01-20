import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D Printer Study - 스마트 학습 시스템",
  description: "3D 프린터 운용기능사 실기 및 필기 완벽 대비를 위한 스마트 학습 플랫폼",
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uuyd9i6oo9");
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-none`}
      >
        <div id="capture-protect-overlay" className="hidden fixed inset-0 bg-[#020617] z-[99999] flex-col items-center justify-center text-center p-6">
          <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 backdrop-blur-xl">
            <h2 className="text-2xl font-black text-blue-400 mb-4">🔒 보안 보호 활성화</h2>
            <p className="text-slate-400 mb-2">화면 캡처 및 외부 검색 시도가 감지되어 화면을 보호합니다.</p>
            <p className="text-blue-500/60 text-sm italic">"학습은 정직할 때 가장 빛납니다."</p>
            <div className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold animate-pulse">
              다시 앱을 클릭하여 계속하기
            </div>
          </div>
        </div>
        <ToastProvider>
          <div id="main-content-area" className="transition-all duration-300">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
