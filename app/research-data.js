import latest from '../data/latest.json';

const number = (value, digits = 1) => value == null ? '-' : Number(value).toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const signed = value => value == null ? '-' : (Number(value) >= 0 ? '+' : '') + number(value) + '%';
const reportByName = Object.fromEntries((latest.agents || []).map(item => [item.agent, item]));
const indicatorByName = Object.fromEntries((latest.indicators || []).map(item => [item.indicator, item]));
const missing = new Set(latest.cio?.missing_data || []);

const topIdeas = (latest.ideas || []).slice(0, 5);
const topNames = topIdeas.slice(0, 3).map(item => item.company).filter(Boolean);
const flowRows = latest.investor_flows || [];
const exportRows = latest.export_signals || [];

export const brief = {
  asOf: String(latest.as_of || '-').replaceAll('-', '.'),
  summary: missing.has('krx_investor_flow')
    ? '종목 후보는 잡혔습니다. 다만 오늘의 핵심 질문인 “누가 샀는가”가 확인되기 전에는 확신 단계로 올리지 않습니다.'
    : (latest.cio?.summary || '오늘의 최종 판단을 준비 중입니다.'),
  verdict: missing.has('krx_investor_flow') ? '수급 연결 전' : latest.cio?.status === 'pass' ? '교차검증 통과' : '보강 중',
  opportunity: topNames.length ? topNames.join(' · ') : '후보 탐색 중',
  risk: missing.has('krx_investor_flow') ? '수급 주체 공백' : '가격·실적 엇박자',
  next: missing.has('krx_investor_flow') ? '고정 IP 연결 → 키움 수급 수집' : '상위 후보 원문 검증',
};

export const picks = topIdeas.slice(0, 3).map(item => ({
  company: item.company,
  price: item.close == null ? '-' : number(item.close, 0) + '원',
  return20: signed(item.return_20d_pct),
  pbr: item.price_to_book == null ? '-' : number(item.price_to_book, 2) + '배',
  volatility: signed(item.volatility_20d_pct).replace('+', ''),
  grade: String(item.research_priority || 'C').slice(0, 1),
  priority: String(item.research_priority || '화면 신호').replace(/^[A-C]\s*-\s*/, ''),
  why: item.why_now || '후보 신호를 확인 중입니다.',
  confirm: item.investable_if || '공시·수급·가격이 같은 방향인지 확인',
  reject: item.first_rejection || item.kill_conditions || '핵심 근거가 사라질 때',
}));

export const market = [
  { key: 'VIXCLS', label: 'VIX', note: '위험 선호' },
  { key: 'DEXKOUS', label: '원/달러', note: '외국인 환경' },
  { key: 'DGS10', label: '미국 10년', note: '할인율', suffix: '%' },
  { key: 'WTI', label: 'WTI', note: '원가 압력', prefix: '$' },
].map(item => ({ ...item, value: (item.prefix || '') + number(indicatorByName[item.key]?.value, 2) + (item.suffix || '') }));

const reportFor = name => reportByName[name] || {};
const agentBase = [
  { slug: 'cio', icon: '◎', name: 'CIO DESK', role: '최종 판단·우선순위', report: 'cio' },
  { slug: 'supply', icon: '↕', name: 'FLOW DESK', role: '수급원별 집중 종목', report: 'supply' },
  { slug: 'industry', icon: '◇', name: 'EXPORT DESK', role: '반도체·전자 수출판', report: 'industry' },
  { slug: 'market', icon: '⌁', name: 'MARKET DESK', role: '가격·신고가·거래대금', report: 'market_highs' },
  { slug: 'disclosures', icon: '▤', name: 'CATALYST DESK', role: '공시·이벤트 변화', report: 'news_disclosure' },
  { slug: 'company', icon: '▦', name: 'FUNDAMENTAL DESK', role: '실적·밸류에이션', report: 'company_analysis' },
  { slug: 'ideas', icon: '✦', name: 'IDEA DESK', role: '교차검증 후보 선별', report: 'stock_ideas' },
];

const fallbackHeadline = {
  cio: '오늘 볼 것과 버릴 것을 정합니다.',
  supply: '외국인·연기금·투신 등 수급원별 집중을 찾습니다.',
  industry: 'DRAM·NAND·기판·MLCC·장비 수출을 분리해 봅니다.',
  market: '가격이 아니라 변화율과 거래대금의 조합을 봅니다.',
  disclosures: '공시를 호재·악재가 아닌 이익 영향으로 분류합니다.',
  company: '실적의 방향과 가격에 반영된 기대를 비교합니다.',
  ideas: 'WHY NOW·CONFIRM·KILL이 있는 후보만 올립니다.',
};

export const agents = agentBase.map(agent => {
  const report = reportFor(agent.report);
  return {
    ...agent,
    status: report.status || 'failed',
    headline: report.summary || fallbackHeadline[agent.slug],
  };
});

export const disclosures = (latest.disclosures || []).slice(0, 5).map(item => ({
  company: item.corp_name,
  title: String(item.report_name || '').trim(),
  date: String(item.received_date || '').slice(4, 6) + '.' + String(item.received_date || '').slice(6, 8),
}));

export const dataRequests = [
  missing.has('krx_investor_flow') && {
    level: 'urgent', badge: '내일 이어서', title: '키움 고정 IP 연결',
    reason: 'App Key 등록은 끝났습니다. 무료 서버의 고정 IP만 연결하면 외국인·연기금·투신 등 전 수급원이 매일 자동 집계됩니다.',
    action: 'Oracle 가입 재시도 → 서버 IP를 키움에 1회 등록',
  },
  (missing.has('semiconductor_exports') || exportRows.length === 0) && {
    level: 'urgent', badge: '파일 1회 필요', title: 'TRASS 품목통계',
    reason: 'DRAM/HBM·NAND·기판·MLCC·장비·부품·웨이퍼를 각각 월별 금액·중량·단가로 분리합니다.',
    action: 'TRASS에서 CSV 또는 XLSX 내려받아 전달',
  },
  missing.has('market_universe_history') && {
    level: 'auto', badge: '자동 누적', title: '전 종목 20일 이력',
    reason: '시장 전체에서 신규 수급·신고가 후보를 찾기 위한 가격 이력을 매일 쌓고 있습니다.',
    action: '사용자 조치 없음',
  },
].filter(Boolean);

const flowWhy = flowRows.length
  ? flowRows.slice(0, 5).map(row => (row.name || row.stock_code) + ' · ' + signed(row.net_1d_market_cap_pct) + ' · ' + number(row.net_1d_krw_mn, 0) + '백만원')
  : ['키움 App Key·Secret 등록 완료', '투자주체별 순위 계산 코드 완료', '고정 IP 실행기 연결만 남음'];

const exportWhy = exportRows.length
  ? exportRows.slice(0, 6).map(row => (row.label || row.basket) + ' · $' + number(Number(row.export_value_usd || 0) / 1000000, 0) + 'm')
  : ['DRAM/HBM·NAND·기판·MLCC 분류표 준비 완료', '장비·부품·웨이퍼까지 별도 바스켓 구성', 'TRASS 원본이 들어오면 금액·중량·단가를 동시에 계산'];

const ideaWhy = topIdeas.slice(0, 3).map(item => item.company + ' · ' + (item.why_now || '추가 검증 중'));
const disclosureWhy = disclosures.slice(0, 4).map(item => item.company + ' · ' + item.title);
const marketWhy = market.map(item => item.label + ' ' + item.value + ' · ' + item.note);

export const agentDetails = {
  cio: {
    conclusion: brief.summary,
    why: [
      topNames.length ? '우선 검증: ' + topNames.join(' → ') : '조건 통과 후보를 탐색 중',
      '기회: ' + brief.opportunity,
      '가장 큰 판단 공백: ' + brief.risk,
    ],
    next: brief.next,
    risk: '점수나 뉴스 개수를 추천으로 오해하지 않습니다.',
    sources: ['상세 출처는 데이터 검증 로그에만 보관'],
  },
  supply: {
    conclusion: flowRows.length ? '수급원별 시가총액 대비 순매수 상위 종목을 집계했습니다.' : '키는 준비됐고 고정 IP 연결만 남았습니다. 연결 전에는 수급 의견을 만들지 않습니다.',
    why: flowWhy,
    next: flowRows.length ? '1·5·20일 동행 여부와 업종 군집 확인' : '무료 서버 생성 후 공개 IP를 키움에 등록',
    risk: '순매수 금액만 보면 대형주가 과대평가되므로 시가총액 대비 비율을 우선합니다.',
    sources: ['키움 ka10066 장마감후 투자자별 매매'],
  },
  industry: {
    conclusion: exportRows.length ? '품목별 수출 금액과 단가 변화를 분리했습니다.' : '거시는 읽히지만 업종 판단의 핵심인 품목별 수출 원본이 아직 없습니다.',
    why: exportWhy,
    next: exportRows.length ? '전월·전년 대비 금액/중량/단가 분해' : 'TRASS 품목통계 CSV/XLSX 1회 전달',
    risk: '반도체 전체 합계 하나로 DRAM·NAND·기판·MLCC를 같은 사이클로 보지 않습니다.',
    sources: ['TRASS 품목통계', 'FRED', 'EIA'],
  },
  market: {
    conclusion: '추격 여부보다 위험 환경과 가격 확인 조건을 먼저 봅니다.',
    why: marketWhy,
    next: '전 종목 20일 이력 누적 후 신고가·거래대금 동시 돌파 탐색',
    risk: '52주 고점 근접만으로 매수 신호를 만들지 않습니다.',
    sources: ['KRX 공식 종가', 'Yahoo 보조 시계열'],
  },
  disclosures: {
    conclusion: disclosures.length ? '오늘 원문을 먼저 읽을 공시를 추렸습니다.' : '당일 확인된 주요 공시가 없습니다.',
    why: disclosureWhy.length ? disclosureWhy : ['공시 원문 수집 대기'],
    next: '상위 후보 공시의 매출·이익·지배구조 영향을 분리',
    risk: '제목만 보고 호재·악재를 확정하지 않습니다.',
    sources: ['OpenDART', 'Google News RSS'],
  },
  company: {
    conclusion: topIdeas.length ? '가격·DART 재무·공시를 묶어 검증 순서를 정했습니다.' : '기업별 교차검증을 준비 중입니다.',
    why: ideaWhy.length ? ideaWhy : ['기업별 데이터 결합 대기'],
    next: '상위 후보의 기대 반영 수준과 실적 훼손 조건 확인',
    risk: '중간 실적을 임의 연환산하거나 빈 밸류에이션을 추정하지 않습니다.',
    sources: ['KRX', 'OpenDART'],
  },
  ideas: {
    conclusion: topNames.length ? '오늘의 리서치 순서는 ' + topNames.join(' → ') + '입니다.' : '조건을 통과한 후보가 없습니다.',
    why: ideaWhy.length ? ideaWhy : ['후보 생성 대기'],
    next: '각 후보의 CONFIRM 조건과 KILL 조건을 먼저 검증',
    risk: '리서치 순위를 매수 등급으로 사용하지 않습니다.',
    sources: ['수급·공시·실적·가격 교차검증'],
  },
};
