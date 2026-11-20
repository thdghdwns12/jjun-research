import latest from '../data/latest.json';

const number = (value, digits = 1) => value == null ? '-' : Number(value).toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const signed = value => value == null ? '-' : `${Number(value) >= 0 ? '+' : ''}${number(value)}%`;
const reportNames = { cio: 'cio', supply: 'supply', industry: 'industry', market: 'market_highs', disclosures: 'news_disclosure', company: 'company_analysis', ideas: 'stock_ideas' };
const reportByName = Object.fromEntries((latest.agents || []).map(item => [item.agent, item]));
const indicatorByName = Object.fromEntries((latest.indicators || []).map(item => [item.indicator, item]));

export const brief = {
  asOf: String(latest.as_of || '-').replaceAll('-', '.'),
  summary: latest.cio?.summary || '오늘의 최종 판단을 준비 중입니다.',
  opportunity: latest.ideas?.[0] ? `${latest.ideas[0].company} 우선 검증` : '후보 탐색 중',
  risk: latest.cio?.missing_data?.includes('krx_investor_flow') ? '세부 투자주체 수급 공백' : '시장 변동성',
  next: '공시 원문 + 수급 교차검증',
};

export const picks = (latest.ideas || []).slice(0, 3).map(item => ({
  company: item.company,
  price: item.close == null ? '-' : `${number(item.close, 0)}원`,
  return20: signed(item.return_20d_pct),
  pbr: item.price_to_book == null ? '-' : `${number(item.price_to_book, 2)}배`,
  volatility: signed(item.volatility_20d_pct).replace('+', ''),
  grade: String(item.research_priority || 'C').slice(0, 1),
  priority: String(item.research_priority || '화면 신호').replace(/^[A-C]\s*-\s*/, ''),
  why: item.why_now || '후보 신호를 확인 중입니다.',
  reject: item.first_rejection || item.kill_conditions || '핵심 근거가 사라질 때',
}));

export const market = [
  { key: 'VIXCLS', label: 'VIX', note: '경계 구간' }, { key: 'DEXKOUS', label: '원/달러', note: 'KRW / USD' },
  { key: 'DGS10', label: '미국 10년', note: '밸류에이션 부담', suffix: '%' }, { key: 'WTI', label: 'WTI', note: '원가 압력 관찰', prefix: '$' },
].map(item => ({ ...item, value: `${item.prefix || ''}${number(indicatorByName[item.key]?.value, 2)}${item.suffix || ''}` }));

const agentBase = [
  { slug: 'cio', icon: '◎', name: 'CIO', role: '최종 판단·검증', status: 'partial', headline: '수급 공백 때문에 신규매수 판단을 보류했습니다.' },
  { slug: 'supply', icon: '↕', name: '수급', role: '투자주체 흐름', status: 'failed', headline: '세부 투자주체 원본이 필요합니다.' },
  { slug: 'industry', icon: '◇', name: '산업', role: '수출·원자재·금리', status: 'partial', headline: '거시 환경은 확인, 수출·운임·DRAM은 보강 중입니다.' },
  { slug: 'market', icon: '⌁', name: '시장·신고가', role: '가격·추세 탐색', status: 'pass', headline: '17개 지수·종목의 52주 고점 근접도를 확인했습니다.' },
  { slug: 'disclosures', icon: '▤', name: '공시·뉴스', role: '이벤트 탐지', status: 'pass', headline: '관심종목 공시·뉴스 70건을 분류했습니다.' },
  { slug: 'company', icon: '▦', name: '기업분석', role: '실적·밸류에이션', status: 'pass', headline: '12개 기업의 공식 시세와 DART 재무를 결합했습니다.' },
  { slug: 'ideas', icon: '✦', name: '아이디어', role: '후보 선별', status: 'partial', headline: '관찰 후보 5개를 선별했고 상위 3개를 우선 배치했습니다.' },
];
export const agents = agentBase.map(agent => {
  const report = reportByName[reportNames[agent.slug]];
  return report ? { ...agent, status: report.status, headline: report.summary } : agent;
});

export const disclosures = (latest.disclosures || []).slice(0, 4).map(item => ({ company: item.corp_name, title: String(item.report_name || '').trim(), date: String(item.received_date || '').slice(4, 6) + '.' + String(item.received_date || '').slice(6, 8) }));

export const dataRequests = [
  { level: 'urgent', badge: '사용자 입력 필요', title: 'TRASS 수출 품목통계', reason: '반도체·화장품 업종의 실제 수출 방향을 확인하는 데 필요합니다.', action: '회원 접근 또는 HS코드 통계 파일 요청 예정' },
  { level: 'urgent', badge: '사용자 입력 필요', title: 'KRX 세부 투자주체 수급', reason: '외국인·연기금·투신 등 주체별 매매를 확인해야 후보를 최종 판단할 수 있습니다.', action: '로그인 접근 또는 내려받은 CSV 필요' },
  { level: 'auto', badge: '자동 보강 중', title: '전 종목 20일 이력', reason: '전 시장 스크리닝을 위해 매일 데이터를 누적하고 있습니다.', action: '별도 조치 없음' },
];

export const agentDetails = {
  cio: { conclusion: '신규매수 보류. 상위 후보는 유지하되 수급 확인 전 확신 단계로 올리지 않습니다.', why: ['셀트리온은 가격·실적 신호가 같은 방향입니다.', 'VIX 25.46과 미국 10년물 5.10%는 위험자산에 부담입니다.', '수급 에이전트 실패가 최종 판단의 핵심 차단 조건입니다.'], next: '상위 3개 후보의 공시 원문과 투자주체 수급을 교차검증', risk: '부분 데이터로 후보를 추천으로 오해하는 것', sources: ['KRX 공식 종가', 'OpenDART 공시·재무', 'FRED 거시지표', 'Yahoo 보조 시계열'] },
  supply: { conclusion: '판단 불가. 데이터가 없는데 의견을 만들어내지 않도록 차단했습니다.', why: ['금융투자·보험·투신·사모·은행·연기금·개인·외국인 흐름이 필요합니다.', '현재 KRX Open API 키만으로는 이 세부 화면이 제공되지 않습니다.', '원본이 들어오면 5·20일 누적, 방향 전환, 가격과의 괴리를 계산합니다.'], next: 'KRX 투자자별 거래실적 CSV 또는 허용된 로그인 접근 연결', risk: '전체 외국인 수치만으로 세부 주체의 의도를 추정하는 것', sources: ['KRX 정보데이터시스템 [12009] 예정'] },
  industry: { conclusion: '거시 환경은 경계. 업종 결론은 수출·운임·메모리 가격 보강 전까지 부분 판단입니다.', why: ['VIX 25.46으로 변동성 경계 구간입니다.', '미국 10년 금리 5.10%로 성장주 할인율 부담이 큽니다.', 'WTI 89.62달러로 운송·화학 원가 민감도를 지켜봐야 합니다.'], next: 'TRASS 반도체·화장품 HS코드 수출과 DRAM 현물가 연결', risk: '지연된 원자재 수치로 당일 업종 방향을 단정하는 것', sources: ['FRED', 'EIA/DataHub 미러', 'TRASS 예정', 'DRAMeXchange 예정'] },
  market: { conclusion: '감시 종목 중 셀트리온이 52주 고점에 가장 가깝고, 지수 환경은 추격 매수에 불리합니다.', why: ['셀트리온은 52주 고점 대비 약 -9.4%입니다.', '17개 지수·종목의 최신 종가를 확인했습니다.', '관심종목 다수의 20·60일 수익률이 아직 음수입니다.'], next: '전 종목 이력 누적 후 신고가·모멘텀 후보를 시장 전체로 확대', risk: '보조 시세를 공식 체결가로 오인하는 것', sources: ['Yahoo Finance 보조 시계열', 'KRX 공식 종가 교차검증'] },
  disclosures: { conclusion: '카카오 대량보유 보고와 POSCO홀딩스 해명을 우선 읽어야 합니다.', why: ['관심종목 공시·뉴스 70건을 확인했습니다.', '제목 기반 분류이므로 원문 해석은 아직 남아 있습니다.', '공급계약·최대주주 등 중요 키워드를 별도 표시합니다.'], next: '상위 후보 관련 공시 본문을 읽고 실적·지배구조 영향 분류', risk: '기사 제목만으로 호재·악재를 확정하는 것', sources: ['OpenDART', 'Google News RSS'] },
  company: { conclusion: '12개 관심기업의 공식 가격과 DART 재무를 결합했습니다. 셀트리온이 현재 우선 검토 대상입니다.', why: ['KRX 공식 종가 12건을 교차검증했습니다.', 'DART 주요 재무계정 72건을 결합했습니다.', '밸류에이션은 가능한 공식 계정만 사용하고 없는 값은 비워뒀습니다.'], next: '셀트리온·카카오 공시 원문 기반 이익의 질과 밸류에이션 심층 검토', risk: '중간 실적을 무리하게 연환산하거나 빈 값을 추정하는 것', sources: ['KRX Open API', 'OpenDART 주요계정 API'] },
  ideas: { conclusion: '리서치 순서는 셀트리온 → 카카오 → SK하이닉스입니다. 매수 추천은 아닙니다.', why: ['셀트리온은 20·60일 상승과 이익 개선이 함께 확인됐습니다.', '카카오는 단기 반등과 공시 집중이 잡혔지만 중기 추세는 약합니다.', 'SK하이닉스는 이익 신호와 달리 가격 변동성이 89%로 높습니다.'], next: '각 후보의 반대 근거부터 확인하고 통과한 종목만 심층 리서치', risk: '스크리닝 점수를 목표가격이나 기대수익률로 해석하는 것', sources: ['KRX 공식 시세', 'OpenDART', '뉴스·가격 시그널 결합'] },
};

Object.entries(reportNames).forEach(([slug, reportName]) => {
  const report = reportByName[reportName];
  if (report?.summary && agentDetails[slug]) agentDetails[slug].conclusion = report.summary;
});
