import Link from 'next/link';
import { notFound } from 'next/navigation';
import { agentDetails, agents, brief } from '../../research-data';

export function generateStaticParams() {
  return agents.map(({ slug }) => ({ slug }));
}

export default async function AgentPage({ params }) {
  const { slug } = await params;
  const agent = agents.find(item => item.slug === slug);
  const detail = agentDetails[slug];
  if (!agent || !detail) notFound();
  const statusText = agent.status === 'pass' ? '정상' : agent.status === 'partial' ? '보강 중' : '입력 필요';

  return <>
    <header className="topbar"><div className="nav-shell"><Link className="brand" href="/"><span>J</span><div>JJun Research<small>AI 리서치 데스크</small></div></Link><Link className="back-link" href="/">← 종합 브리핑</Link><div className="asof">기준일 {brief.asOf}</div></div></header>
    <main className="agent-page">
      <div className="agent-hero">
        <div className="agent-symbol">{agent.icon}</div><div><span className="section-kicker">AGENT DESK</span><h1>{agent.name}</h1><p>{agent.role}</p></div><span className={`status large ${agent.status}`}>{statusText}</span>
      </div>
      <section className="conclusion-card"><span>오늘의 결론</span><h2>{detail.conclusion}</h2></section>
      <div className="agent-layout">
        <section className="detail-card"><div className="number-title"><span>01</span><h2>판단 근거</h2></div><ol className="reason-list">{detail.why.map(item => <li key={item}>{item}</li>)}</ol></section>
        <aside className="detail-side">
          <section className="next-card"><span>다음 작업</span><p>{detail.next}</p></section>
          <section className="risk-card"><span>주의할 점</span><p>{detail.risk}</p></section>
        </aside>
      </div>
      <details className="sources"><summary>출처·데이터 확인 <span>펼치기</span></summary><div>{detail.sources.map(source => <span key={source}>{source}</span>)}</div></details>
      <div className="agent-switcher"><span>다른 에이전트</span><div>{agents.filter(a => a.slug !== agent.slug).map(a => <Link href={`/agents/${a.slug}`} key={a.slug}>{a.icon} {a.name}</Link>)}</div></div>
    </main>
    <footer><div><b>JJun Research</b><span>홍해서치 자동 리서치 시스템</span></div><p>본 자료는 리서치 우선순위이며 투자 권유가 아닙니다.</p></footer>
  </>;
}
