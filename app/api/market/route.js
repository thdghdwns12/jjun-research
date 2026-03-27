// /api/market - 실시간 시세 데이터 API
// Yahoo Finance (무료, API키 불필요)에서 KOSPI, KOSDAQ, S&P500, 환율, 유가 등을 가져옴

export const revalidate = 300; // 5분마다 캐시 갱신

const SYMBOLS = {
  kospi:   { symbol: '^KS11',   name: 'KOSPI' },
  kosdaq:  { symbol: '^KQ11',   name: 'KOSDAQ' },
  sp500:   { symbol: '^GSPC',   name: 'S&P 500' },
  nasdaq:  { symbol: '^IXIC',   name: 'NASDAQ' },
  usdkrw:  { symbol: 'KRW=X',  name: '원/달러' },
  wti:     { symbol: 'CL=F',   name: 'WTI' },
  brent:   { symbol: 'BZ=F',   name: 'Brent' },
};

async function fetchYahoo(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const closes = result.indicators.quote[0].close;

    const current = meta.regularMarketPrice;
    const prevClose = meta.previousClose || closes[closes.length - 2];
    const change = current - prevClose;
    const changePct = ((change / prevClose) * 100).toFixed(2);

    return {
      price: current,
      change: change.toFixed(2),
      changePct: `${changePct > 0 ? '+' : ''}${changePct}%`,
      isUp: change >= 0,
    };
  } catch (e) {
    return { price: null, change: null, changePct: null, isUp: false, error: e.message };
  }
}

export async function GET() {
  const results = {};

  const entries = Object.entries(SYMBOLS);
  const fetches = await Promise.all(
    entries.map(([key, { symbol }]) => fetchYahoo(symbol))
  );

  entries.forEach(([key, { name }], i) => {
    results[key] = { name, ...fetches[i] };
  });

  // 주요 종목 시세도 추가
  const stocks = {
    samsung:  { symbol: '005930.KS', name: '삼성전자' },
    hynix:    { symbol: '000660.KS', name: 'SK하이닉스' },
    hanwha:   { symbol: '012450.KS', name: '한화에어로스페이스' },
    doosan:   { symbol: '034020.KS', name: '두산에너빌리티' },
    hyundai:  { symbol: '005380.KS', name: '현대차' },
    lgchem:   { symbol: '373220.KS', name: 'LG에너지솔루션' },
    naver:    { symbol: '035420.KS', name: 'NAVER' },
    celltrion:{ symbol: '068270.KS', name: '셀트리온' },
  };

  const stockEntries = Object.entries(stocks);
  const stockFetches = await Promise.all(
    stockEntries.map(([key, { symbol }]) => fetchYahoo(symbol))
  );

  const stockResults = {};
  stockEntries.forEach(([key, { name }], i) => {
    stockResults[key] = { name, ...stockFetches[i] };
  });

  return Response.json({
    indices: results,
    stocks: stockResults,
    updatedAt: new Date().toISOString(),
  });
}
