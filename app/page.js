import Link from 'next/link';
import { agents, brief, dataRequests, disclosures, market, picks } from './research-data';

const statusLabel = { pass: '정상', partial: '보강 중', failed: '입력 필요' };

function Header() {
  return <header className="topbar"><div className="nav-shell">
    <Link className="brand" href="/"><span>J</span><div>JJun Research<small>AI 리서치 데스크</small></div></Link>
    <nav><a href="#ideas">오늘의 종목</a><a href="#agents">에이전트</a><a href="#requests">데이터 요청</a></nav>
    <div className="asof">기준일 {brief.asOf}</div>
  </div></header>;
}

function PickCard({ pick, index }) {
  return <article className={`pick-card rank-${index + 1}`}>
    <div className="pick-top"><span className="rank">0{index + 1}</span><span className={`priority ${pick.grade.toLowerCase()}`}>{pick.priority}</span></div>
    <h3>{pick.company}</h3>
    <div className="price-row"><strong>{pick.price}</strong><span className={pick.return20.startsWith('+') ? 'positive' : 'negative'}>20일 {pick.return20}</span></div>
    <p className="why"><b>왜 지금?</b>{pick.why}</p>
    <div className="metric-row"><span>PBR <b>{pick.pbr}</b></span><span>변동성 <b>{pick.volatility}</b></span></div>
    <div className="reject"><span>탈락 조건</span>{pick.reject}</div>
    <Link className="text-link" href="/agents/ideas">판단 근거 자세히 →</Link>
  </article>;
}

export default function Home() {
  return <>
    <Header />
    <main>
      <section className="hero-wrap">
        <div className="eyebrow">DAILY INVESTMENT BRIEF · {brief.asOf}</div>
        <div className="hero-grid">
          <div><h1>오늘은 매수보다<br/><em>검증이 먼저</em>입니다.</h1><p>{brief.summary}</p></div>
          <aside className="decision-card"><span className="decision-label">CIO 최종 판단</span><strong>신규매수 보류</strong><p>관찰 후보 3개 · 수급 데이터 확인 전</p><div className="confidence"><span>판단 완성도</span><b>72%</b></div><div className="bar"><i/></div></aside>
        </div>
        <div className="brief-strip"><div><span>핵심 기회</span><b>{brief.opportunity}</b></div><div><span>가장 큰 위험</span><b>{brief.risk}</b></div><div><span>다음 행동</span><b>{brief.next}</b></div></div>
      </section>

      <section className="section-shell" id="ideas">
        <div className="section-heading"><div><span className="section-kicker">RESEARCH QUEUE</span><h2>오늘 먼저 볼 종목</h2></div><p>추천이 아니라, 오늘 리서치 시간을 먼저 쓸 순서입니다.</p></div>
        <div className="pick-grid">{picks.map((pick, i) => <PickCard key={pick.company} pick={pick} index={i}/>)}</div>
      </section>

      <section className="dark-section">
        <div className="section-shell"><div className="section-heading light"><div><span className="section-kicker">MARKET PULSE</span><h2>시장 온도</h2></div><p>후보보다 먼저 확인해야 할 위험 환경입니다.</p></div>
          <div className="market-grid">{market.map(item => <div className="market-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></div>)}</div>
          <div className="market-callout"><b>해석</b><p>변동성 지표가 높고 장기금리도 부담스럽습니다. 강한 종목도 가격을 쫓기보다 공시 원문과 수급을 확인한 뒤 판단합니다.</p></div>
        </div>
      </section>

      <section className="section-shell" id="agents">
        <div className="section-heading"><div><span className="section-kicker">RESEARCH TEAM</span><h2>7개 에이전트 데스크</h2></div><p>각 에이전트의 결론과 막힌 이유를 따로 확인할 수 있습니다.</p></div>
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
    <footer><div><b>JJun Research</b><span>홍해서치 자동 리서치 시스템</span></div><p>본 자료는 리서치 우선순위이며 투자 권유가 아닙니다. 출처와 검증 로그는 각 에이전트 화면에서 확인할 수 있습니다.</p></footer>
  </>;
}
