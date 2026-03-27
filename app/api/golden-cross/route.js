// /api/golden-cross - 골든크로스 자동 감지 API
// 각 종목의 최근 60일 데이터를 가져와서 5일/20일/60일 이동평균선 교차를 계산

export const revalidate = 3600; // 1시간 캐시

const WATCHLIST = [
  { symbol: '005930.KS', name: '삼성전자',         code: '005930', sector: '반도체' },
  { symbol: '000660.KS', name: 'SK하이닉스',       code: '000660', sector: '반도체' },
  { symbol: '012450.KS', name: '한화에어로스페이스', code: '012450', sector: '방산' },
  { symbol: '034020.KS', name: '두산에너빌리티',    code: '034020', sector: '에너지' },
  { symbol: '005380.KS', name: '현대차',           code: '005380', sector: '자동차' },
  { symbol: '373220.KS', name: 'LG에너지솔루션',   code: '373220', sector: '2차전지' },
  { symbol: '035420.KS', name: 'NAVER',           code: '035420', sector: '플랫폼' },
  { symbol: '068270.KS', name: '셀트리온',         code: '068270', sector: '바이오' },
  { symbol: '035720.KS', name: '카카오',           code: '035720', sector: '플랫폼' },
  { symbol: '005490.KS', name: '포스코홀딩스',     code: '005490', sector: '철강' },
  { symbol: '096770.KS', name: 'SK이노베이션',     code: '096770', sector: '에너지' },
  { symbol: '010950.KS', name: 'S-Oil',           code: '010950', sector: '정유' },
];

function calcMA(closes, period) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

async function analyzeStock(stock) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=3mo`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await res.json();
    const result = data.chart.result[0];
    const closes = result.indicators.quote[0].close.filter(c => c != null);

    if (closes.length < 60) {
      return { ...stock, signal: 'insufficient_data', ma5: null, ma20: null, ma60: null };
    }

    const ma5 = calcMA(closes, 5);
    const ma20 = calcMA(closes, 20);
    const ma60 = calcMA(closes, 60);
    const currentPrice = closes[closes.length - 1];

    // 전일 이평선도 계산 (교차 감지용)
    const prevCloses = closes.slice(0, -1);
    const prevMa5 = calcMA(prevCloses, 5);
    const prevMa20 = calcMA(prevCloses, 20);

    // 등락률
    const prevClose = closes[closes.length - 2];
    const changePct = ((currentPrice - prevClose) / prevClose * 100).toFixed(2);

    let signal = 'neutral';
    let signalText = '모니터링';

    // 골든크로스: 5MA가 20MA를 상향돌파
    if (prevMa5 <= prevMa20 && ma5 > ma20) {
      signal = 'golden_cross_5_20';
      signalText = '골든크로스 (5MA ▲ 20MA)';
    }
    // 5MA > 20MA > 60MA = 정배열
    else if (ma5 > ma20 && ma20 > ma60) {
      signal = 'bullish_alignment';
      signalText = '정배열 (5>20>60)';
    }
    // 데드크로스: 5MA가 20MA를 하향이탈
    else if (prevMa5 >= prevMa20 && ma5 < ma20) {
      signal = 'dead_cross';
      signalText = '데드크로스 (5MA ▼ 20MA)';
    }
    // 역배열
    else if (ma5 < ma20 && ma20 < ma60) {
      signal = 'bearish_alignment';
      signalText = '역배열 (5<20<60)';
    }

    return {
      ...stock,
      price: Math.round(currentPrice),
      changePct: `${changePct > 0 ? '+' : ''}${changePct}%`,
      isUp: changePct >= 0,
      ma5: Math.round(ma5),
      ma20: Math.round(ma20),
      ma60: Math.round(ma60),
      signal,
      signalText,
      tvSymbol: `KRX:${stock.code}`,
    };
  } catch (e) {
    return { ...stock, signal: 'error', signalText: '데이터 오류', error: e.message };
  }
}

export async function GET() {
  const results = await Promise.all(WATCHLIST.map(analyzeStock));

  // 시그널 우선순위로 정렬: 골든크로스 > 정배열 > 중립 > 역배열 > 데드크로스
  const priority = {
    golden_cross_5_20: 0,
    bullish_alignment: 1,
    neutral: 2,
    bearish_alignment: 3,
    dead_cross: 4,
    error: 5,
    insufficient_data: 6,
  };

  results.sort((a, b) => (priority[a.signal] || 5) - (priority[b.signal] || 5));

  return Response.json({
    stocks: results,
    updatedAt: new Date().toISOString(),
  });
}
