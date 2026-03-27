// /api/reports - 네이버 리서치 리포트 자동 수집 API
// 네이버 증권 리서치 페이지에서 최신 리포트 목록을 가져옴

import * as cheerio from 'cheerio';

export const revalidate = 1800; // 30분 캐시

async function fetchNaverReports(page = 1) {
  try {
    // 네이버 증권 리서치 - 종목분석
    const url = `https://finance.naver.com/research/company_list.naver?&page=${page}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const reports = [];
    $('table.type_1 tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 5) {
        const stockName = $(tds[0]).text().trim();
        const title = $(tds[1]).find('a').text().trim();
        const link = $(tds[1]).find('a').attr('href');
        const source = $(tds[2]).text().trim();
        const opinion = $(tds[3]).text().trim();
        const targetPrice = $(tds[4]).text().trim();
        const date = $(tds[5]).text().trim();

        if (stockName && title) {
          reports.push({
            stockName,
            title,
            link: link ? `https://finance.naver.com/research/${link}` : null,
            source,
            opinion,
            targetPrice,
            date,
          });
        }
      }
    });

    return reports;
  } catch (e) {
    return [];
  }
}

async function fetchNaverMarketReports() {
  try {
    // 네이버 증권 리서치 - 시장전망
    const url = `https://finance.naver.com/research/market_info_list.naver`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const reports = [];
    $('table.type_1 tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 3) {
        const title = $(tds[0]).find('a').text().trim();
        const link = $(tds[0]).find('a').attr('href');
        const source = $(tds[1]).text().trim();
        const date = $(tds[2]).text().trim();

        if (title) {
          reports.push({
            title,
            link: link ? `https://finance.naver.com/research/${link}` : null,
            source,
            date,
            type: 'market',
          });
        }
      }
    });

    return reports;
  } catch (e) {
    return [];
  }
}

export async function GET() {
  const [stockReports, marketReports] = await Promise.all([
    fetchNaverReports(),
    fetchNaverMarketReports(),
  ]);

  return Response.json({
    stockReports: stockReports.slice(0, 20),
    marketReports: marketReports.slice(0, 10),
    updatedAt: new Date().toISOString(),
    sources: {
      naver: 'https://finance.naver.com/research/',
      hankyung: 'https://www.hankyung.com/consensus',
      bondweb: 'https://bond.einfomax.co.kr',
      wisereport: 'https://www.wisereport.co.kr',
    },
  });
}
