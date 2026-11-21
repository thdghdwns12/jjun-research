import Link from 'next/link';
import { agents, brief, dataRequests, disclosures, market, picks } from './research-data';

const statusLabel = { pass: '정상', partial: '보강 중', failed: '입력 필요' };

function Header() {
  return <header className="topbar"><div className="nav-shell">
    <Link className="brand" href="/"><span>H</span><div>HONGHAE RESEARCH<small>JJun Terminal · Agent Desk</small></div></Link>
    <nav><a href="#flow">오늘의 흐름</a><a href="#ideas">검증 후보</a><a href="#agents">에이전트</a><a href="#requests">필요 데이터</a></nav>
    <div className="asof">기준일 {brief.asOf}</div>
  </div></header>;
}

function PickCard({ pick, index }) {
  return <article className={`pick-card rank-${index + 1}`}>
    <div className="pick-top"><span className="rank">0{index + 1}</span><span className={`priority ${pick.grade.toLowerCase()}`}>{pick.priority}</span></div>
    <h3>{pick.company}</h3>
    <div className="price-row"><strong>{pick.price}</strong><span className={pick.return20.startsWith('+') ? 'positive' : 'negative'}>20일 {pick.return20}</span></div>
    <p className="why"><b>WHY NOW</b>{pick.why}</p>
    <div className="metric-row"><span>PBR <b>{pick.pbr}</b></span><span>변동성 <b>{pick.volatility}</b></span></div>
    <div className="confirm"><span>CONFIRM</span>{pick.confirm}</div>
    <div className="reject"><span>KILL</span>{pick.reject}</div>
    <Link className="text-link" href="/agents/ideas">검증 카드 열기 →</Link>
  </article>;
}

export default function Home() {
  return <>
    <Header />
    <main>
      <section className="hero-wrap">
        <div className="eyebrow">DAILY MONEY FLOW BRIEF · {brief.asOf}</div>
        <div className="hero-grid">
          <div><h1>오늘 돈은<br/><em>어디로 몰렸나.</em></h1><p>{brief.summary}</p></div>
          <aside className="decision-card"><span className="decision-label">CIO VERDICT</span><strong>{brief.verdict}</strong><p>확인된 것과 아직 모르는 것을 분리합니다.</p><div className="confidence"><span>핵심 판단 공백</span><b>{brief.risk}</b></div><div className="bar"><i/></div></aside>
        </div>
        <div className="brief-strip" id="flow"><div><span>오늘 볼 곳</span><b>{brief.opportunity}</b></div><div><span>아직 모르는 것</span><b>{brief.risk}</b></div><div><span>다음 행동</span><b>{brief.next}</b></div></div>
      </section>

      <section className="section-shell" id="ideas">
        <div className="section-heading"><div><span className="section-kicker">CROSS-CHECK QUEUE</span><h2>오늘 검증할 종목</h2></div><p>수급·공시·실적·가격이 만나는지 확인할 순서입니다.</p></div>
        <div className="pick-grid">{picks.map((pick, i) => <PickCard key={pick.company} pick={pick} index={i}/>)}</div>
      </section>

      <section className="dark-section">
        <div className="section-shell"><div className="section-heading light"><div><span className="section-kicker">MARKET PULSE</span><h2>시장 온도</h2></div><p>후보보다 먼저 확인해야 할 위험 환경입니다.</p></div>
          <div className="market-grid">{market.map(item => <div className="market-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></div>)}</div>
          <div className="market-callout"><b>해석</b><p>변동성 지표가 높고 장기금리도 부담스럽습니다. 강한 종목도 가격을 쫓기보다 공시 원문과 수급을 확인한 뒤 판단합니다.</p></div>
        </div>
      </section>

      <section className="section-shell" id="agents">
        <div className="section-heading"><div><span className="section-kicker">RESEARCH AGENTS</span><h2>7개 전문 데스크</h2></div><p>각 데스크는 결론·변화·확인 조건·폐기 조건만 보고합니다.</p></div>
        <div className="agent-grid">{agents.map(agent => <Link href={`/agents/${agent.slug}`} className="agent-card" key={agent.slug}>
          <div className="agent-icon">{agent.icon}</div><div className="agent-name"><h3>{agent.name}</h3><span>{agent.role}</span></div><span className={`status ${agent.status}`}>{statusLabel[agent.status]}</span>
          <p>{agent.headline}</p><div className="agent-go">데스크 열기 <b>→</b></div>
        </Link>)}</div>
      </section>

      <section className="section-shell split-section">
        <div><div className="section-heading compact"><div><span className="section-kicker">DISCLOSURES</span><h2>오늘 확인할 공시</h2></div></div>
          <div className="list-card">{disclosures.map((d, i) => <div className="disclosure-row" key={i}><span className={i === 0 ? 'hot-dot' : 'dot'}/><div><b>{d.company}</b><p>{d.title}</p></div><time>{d.date}</time></div>)}</div>
        </div>
        <div id="requests"><div className="section-heading compact"><div><span className="section-kicker">ACTION NEEDED</span><h2>데이터 보강 요청</h2></div></div>
          <div className="request-stack">{dataRequests.map(r => <article className={`request-card ${r.level}`} key={r.title}><div><span>{r.badge}</span><h3>{r.title}</h3></div><p>{r.reason}</p><b>{r.action}</b></article>)}</div>
        </div>
      </section>
    </main>
    <footer><div><b>HONGHAE RESEARCH</b><span>JJun Terminal · Multi-Agent Desk</span></div><p>리서치 우선순위 자료입니다. 원본 출처와 검증 로그는 각 데스크의 접힌 영역에서 확인할 수 있습니다.</p></footer>
  </>;
}
