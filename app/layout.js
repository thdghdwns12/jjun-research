import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: '쭌 | AI 리서치 어시스턴트',
  description: '매일 시황 · 리포트 · 기업분석을 한 곳에서',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Script src="https://s3.tradingview.com/tv.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
