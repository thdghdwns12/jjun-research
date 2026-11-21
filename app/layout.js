import './globals.css';
import './agent-overrides.css';

export const metadata = {
    title: 'HONGHAE RESEARCH | JJun Terminal',
    description: '수급·수출·공시·실적을 교차검증하는 멀티 에이전트 리서치 데스크',
};

export default function RootLayout({ children }) {
    return (
          <html lang="ko">
            <body>{children}</body>
      </html>
    );
}
