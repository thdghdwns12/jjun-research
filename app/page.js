'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── TradingView 차트 모달 ───
function ChartModal({ isOpen, onClose, symbol, name }) {
  useEffect(() => {
    if (!isOpen || !symbol) return;
    const container = document.getElementById('chartBody');
    if (!container) return;
    container.innerHTML = '';
    try {
      new window.TradingView.widget({
        autosize: true, symbol, interval: 'D', timezone: 'Asia/Seoul',
        theme: 'light', style: '1', locale: 'kr', toolbar_bg: '#f1f3f6',
        enable_publishing: false, allow_symbol_change: true,
        studies: ['MASimple@tv-basicstudies','MASimple@tv-basicstudies','MASimple@tv-basicstudies','Volume@tv-basicstudies'],
        container_id: 'chartBody', width: '100%', height: '100%',
      });
    } catch(e) {
      container.innerHTML = `<div class="error-msg">차트 로드 실패. <a href="https://tradingview.com/chart/?symbol=${symbol}" target="_blank" style="color:var(--accent)">TradingView에서 직접 보기 →</a></div>`;
    }
  }, [isOpen, symbol]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;
  return (
    <div className="chart-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chart-modal">
        <div className="chart-modal-header">
          <div className="chart-modal-title">{name} 차트 (5/20/60일 이동평균선)</div>
          <button className="chart-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="chart-modal-body" id="chartBody" />
      </div>
    </div>
  );
}

// ─── TradingView 마켓 위젯 ───
function MarketWidget() {
  useEffect(() => {
    const container = document.getElementById('tv-market-widget');
    if (!container || !window.TradingView) return;
    container.innerHTML = '';
    try {
      new window.TradingView.MediumWidget({
        symbols: [['KOSPI','KRX:KOSPI|12M'],['KOSDAQ','KRX:KOSDAQ|12M'],['S&P 500','SP:SPX|12M'],['USD/KRW','FX_IDC:USDKRW|12M'],['WTI','TVC:USOIL|12M']],
        chartOnly: false, width: '100%', height: 420, locale: 'kr', colorTheme: 'light',
        autosize: true, showVolume: false, chartType: 'area',
        lineColor: '#2563eb', bottomColor: 'rgba(37,99,235,0.04)', topColor: 'rgba(37,99,235,0.15)',
        container_id: 'tv-market-widget',
      });
    } catch(e) {}
  }, []);
  return <div id="tv-market-widget" style={{ height: 420 }} />;
}

// ─── MAIN PAGE ───
export default function Home() {
  const [market, setMarket] = useState(null);
  const [goldenCross, setGoldenCross] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartModal, setChartModal] = useState({ open: false, symbol: '', name: '' });

  const openChart = useCallback((symbol, name) => {
    setChartModal({ open: true, symbol, name });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/market').then(r => r.json()).catch(() => null),
      fetch('/api/golden-cross').then(r => r.json()).catch(() => null),
      fetch('/api/reports').then(r => r.json()).catch(() => null),
    ]).then(([m, g, r]) => {
      setMarket(m);
      setGoldenCross(g);
      setReports(r);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const days = ['일','월','화','수','목','금','토'];
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${days[now.getDay()]}요일`;

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="logo"><div className="logo-icon">쭌</div>AI 리서치 어시스턴트</a>
          <div className="nav-links">
            <a href="#market">시황</a><a href="#sector">주도섹터</a>
            <a href="#golden-cross">골든크로스</a><a href="#pick">쭌 Pick</a>
            <a href="#reports">리포트</a><a href="#modeling">기업모델링</a>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <div className="nav-live">실시간</div>
            <div className="nav-date">{dateStr}</div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <h1><span>쭌</span>이 정리하는 오늘의 시장</h1>
        <p>매일 시황 · 리포트 · 기업분석을 한 곳에서 — 실시간 연동</p>
      </div>

      <div className="container">

        {/* ═══ 1. 시황 ═══ */}
        <div className="section" id="market">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--accent-light)',color:'var(--accent)'}}>📊</div>
            <div className="section-title">실시간 시황</div>
            <div className="section-subtitle">TradingView 실시간 연동</div>
          </div>
          <div className="card" style={{padding:0,overflow:'hidden',marginBottom:'1rem'}}>
            <MarketWidget />
          </div>
          {market ? (
            <div className="market-summary">
              <div className="card">
                {Object.entries(market.indices).map(([key, data]) => (
                  <div className="index-row" key={key}>
                    <span className="index-name">{data.name}</span>
                    <span className="index-value">{data.price != null ? data.price.toLocaleString() : '—'}</span>
                    <span className={`index-change ${data.isUp ? 'up' : 'down'}`}>{data.changePct || '—'}</span>
                  </div>
                ))}
                <div style={{padding:'0.5rem 0',fontSize:'0.72rem',color:'#9ca3af',textAlign:'right'}}>
                  갱신: {new Date(market.updatedAt).toLocaleTimeString('ko-KR')}
                </div>
              </div>
              <div className="card">
                <div className="market-comment">
                  <strong>📡 실시간 시세 현황</strong><br/><br/>
                  위 데이터는 서버에서 5분마다 자동 갱신됩니다. 상단 TradingView 차트는 실시간으로 움직입니다.<br/><br/>
                  <strong>주요 종목 등락:</strong><br/>
                  {market.stocks && Object.entries(market.stocks).map(([key, s]) => (
                    <span key={key} style={{display:'inline-block',margin:'2px 4px',fontSize:'0.82rem'}}>
                      <span style={{cursor:'pointer',fontWeight:600}} onClick={() => openChart(`KRX:${key === 'samsung' ? '005930' : key === 'hynix' ? '000660' : key === 'hanwha' ? '012450' : key === 'doosan' ? '034020' : key === 'hyundai' ? '005380' : key === 'lgchem' ? '373220' : key === 'naver' ? '035420' : '068270'}`, s.name)}>
                        {s.name}
                      </span>
                      <span style={{color: s.isUp ? 'var(--red)' : '#2563eb', fontWeight:600, marginLeft:4}}>
                        {s.changePct || '—'}
                      </span>
                      {' · '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading">시세 데이터 로딩 중...</div>
          )}
        </div>

        {/* ═══ 2. 주도섹터 ═══ */}
        <div className="section" id="sector">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--green-bg)',color:'var(--green)'}}>🏭</div>
            <div className="section-title">주도 섹터</div>
            <div className="section-subtitle">주요 종목 기준 실시간</div>
          </div>
          <div className="card">
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {market?.stocks && Object.entries(market.stocks)
                .sort((a, b) => {
                  const pctA = parseFloat(a[1].changePct) || 0;
                  const pctB = parseFloat(b[1].changePct) || 0;
                  return pctB - pctA;
                })
                .map(([key, s]) => (
                <div className="sector-chip" key={key} onClick={() => openChart(`KRX:${key === 'samsung' ? '005930' : key === 'hynix' ? '000660' : key === 'hanwha' ? '012450' : key === 'doosan' ? '034020' : key === 'hyundai' ? '005380' : key === 'lgchem' ? '373220' : key === 'naver' ? '035420' : '068270'}`, s.name)} style={{cursor:'pointer'}}>
                  {s.name}{' '}
                  <span style={{fontWeight:700,color: s.isUp ? 'var(--red)' : '#2563eb'}}>
                    {s.changePct || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 3. 골든크로스 ═══ */}
        <div className="section" id="golden-cross">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--orange-bg)',color:'var(--orange)'}}>✨</div>
            <div className="section-title">골든크로스 / 이평선 시그널</div>
            <div className="section-subtitle">클릭하면 차트 · 자동 계산</div>
          </div>
          {goldenCross ? (
            <div className="grid-4">
              {goldenCross.stocks.map((s) => {
                const signalClass =
                  s.signal === 'golden_cross_5_20' ? 'signal-golden' :
                  s.signal === 'bullish_alignment' ? 'signal-bullish' :
                  s.signal === 'dead_cross' ? 'signal-dead' :
                  s.signal === 'bearish_alignment' ? 'signal-bearish' : 'signal-neutral';
                return (
                  <div className="gc-card" key={s.code} onClick={() => openChart(s.tvSymbol, s.name)}
                    style={s.signal === 'dead_cross' || s.signal === 'bearish_alignment' ? {opacity:0.65} : {}}>
                    <div className="gc-ticker">{s.name}</div>
                    <div className="gc-name">{s.code} · {s.sector}</div>
                    <div className={`gc-signal ${signalClass}`}>{s.signalText}</div>
                    {s.price && (
                      <div style={{fontSize:'0.72rem',color:'var(--text-sub)',marginTop:4}}>
                        {s.price.toLocaleString()}원 <span style={{color: s.isUp ? 'var(--red)' : '#2563eb'}}>{s.changePct}</span>
                      </div>
                    )}
                    {s.ma5 && (
                      <div style={{fontSize:'0.65rem',color:'#9ca3af',marginTop:2}}>
                        5MA:{s.ma5.toLocaleString()} · 20MA:{s.ma20.toLocaleString()} · 60MA:{s.ma60.toLocaleString()}
                      </div>
                    )}
                    <div className="gc-hint">클릭 → 차트</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="loading">골든크로스 분석 중...</div>
          )}
        </div>

        {/* ═══ 4. 쭌 Pick ═══ */}
        <div className="section" id="pick">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--purple-bg)',color:'var(--purple)'}}>💎</div>
            <div className="section-title">쭌이 픽하는 오늘의 종목</div>
          </div>
          {goldenCross?.stocks?.[0] && (() => {
            const top = goldenCross.stocks[0];
            return (
              <div className="pick-highlight">
                <div className="pick-label">⚡ Today&apos;s Pick by 쭌</div>
                <div className="pick-ticker" onClick={() => openChart(top.tvSymbol, top.name)}>{top.name}</div>
                <div className="pick-name">{top.code} · {top.sector} · 클릭하면 차트</div>
                <div className="pick-reason">
                  <strong>자동 선정 사유:</strong><br/>
                  이평선 시그널이 가장 강한 종목입니다. 현재 시그널: <strong>{top.signalText}</strong>.
                  현재가 {top.price?.toLocaleString()}원, 등락률 {top.changePct}.
                  5일 이평선 {top.ma5?.toLocaleString()}, 20일 {top.ma20?.toLocaleString()}, 60일 {top.ma60?.toLocaleString()}.
                </div>
                <div className="pick-tags">
                  <span className="pick-tag">{top.signalText}</span>
                  <span className="pick-tag">{top.sector}</span>
                  <span className="pick-tag">{top.changePct}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ═══ 5. 리포트 ═══ */}
        <div className="section" id="reports">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--purple-bg)',color:'var(--purple)'}}>📄</div>
            <div className="section-title">증권사 리포트</div>
            <div className="section-subtitle">네이버 리서치 자동 수집</div>
          </div>
          <div className="ext-links">
            <a className="ext-link" href="https://finance.naver.com/research/" target="_blank">📑 네이버 리서치</a>
            <a className="ext-link" href="https://www.hankyung.com/consensus" target="_blank">📊 한경 컨센서스</a>
            <a className="ext-link" href="https://bond.einfomax.co.kr" target="_blank">📈 본드웹</a>
            <a className="ext-link" href="https://www.wisereport.co.kr" target="_blank">📋 와이즈리포트</a>
          </div>
          {reports ? (
            <>
              {reports.marketReports?.length > 0 && (
                <>
                  <h3 style={{fontSize:'0.9rem',fontWeight:600,margin:'1rem 0 0.5rem',color:'var(--text-sub)'}}>시장 전망</h3>
                  <div className="grid-2" style={{marginBottom:'1rem'}}>
                    {reports.marketReports.slice(0, 4).map((r, i) => (
                      <div className="card report-card" key={i}>
                        <span className="report-source">{r.source}</span>
                        <div className="report-title">
                          {r.link ? <a href={r.link} target="_blank">{r.title}</a> : r.title}
                        </div>
                        <div className="report-meta">{r.date}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {reports.stockReports?.length > 0 && (
                <>
                  <h3 style={{fontSize:'0.9rem',fontWeight:600,margin:'1rem 0 0.5rem',color:'var(--text-sub)'}}>종목 분석</h3>
                  <div className="grid-2">
                    {reports.stockReports.slice(0, 10).map((r, i) => (
                      <div className="card report-card" key={i}>
                        <span className="report-source">{r.source}</span>
                        <div className="report-title">
                          {r.link ? <a href={r.link} target="_blank">{r.stockName}: {r.title}</a> : `${r.stockName}: ${r.title}`}
                        </div>
                        <div className="report-summary">
                          투자의견: <strong>{r.opinion}</strong> · 목표가: <strong>{r.targetPrice}</strong>
                        </div>
                        <div className="report-meta">{r.date} · {r.source}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div style={{textAlign:'center',marginTop:'1rem',fontSize:'0.78rem',color:'#9ca3af'}}>
                갱신: {new Date(reports.updatedAt).toLocaleTimeString('ko-KR')} · 30분마다 자동 수집
              </div>
            </>
          ) : (
            <div className="loading">리포트 수집 중...</div>
          )}
        </div>

        {/* ═══ 6. 기업 모델링 ═══ */}
        <div className="section" id="modeling">
          <div className="section-header">
            <div className="section-badge" style={{background:'var(--green-bg)',color:'var(--green)'}}>📈</div>
            <div className="section-title">기업 실시간 시세</div>
            <div className="section-subtitle">종목명 클릭 → 차트</div>
          </div>
          <div className="grid-2">
            {market?.stocks && Object.entries(market.stocks).map(([key, s]) => {
              const codeMap = {samsung:'005930',hynix:'000660',hanwha:'012450',doosan:'034020',hyundai:'005380',lgchem:'373220',naver:'035420',celltrion:'068270'};
              const code = codeMap[key];
              return (
                <div className="card" key={key}>
                  <div className="model-header">
                    <span className="model-ticker" onClick={() => openChart(`KRX:${code}`, s.name)}>{s.name}</span>
                    <span className="model-name">{code}</span>
                  </div>
                  <div className="model-grid">
                    <div className="model-metric"><div className="label">현재가</div><div className="value">{s.price != null ? s.price.toLocaleString() : '—'}</div></div>
                    <div className="model-metric"><div className="label">등락률</div><div className="value" style={{color: s.isUp ? 'var(--red)' : '#2563eb'}}>{s.changePct || '—'}</div></div>
                    <div className="model-metric"><div className="label">전일대비</div><div className="value" style={{color: s.isUp ? 'var(--red)' : '#2563eb'}}>{s.change || '—'}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <footer>
        <p>쭌 AI 리서치 어시스턴트 · 홍준님 전용</p>
        <p style={{marginTop:4}}>시세: Yahoo Finance API 5분 갱신 · 차트: TradingView 실시간 · 리포트: 네이버 리서치 30분 갱신</p>
        <p style={{marginTop:4}}>⚠️ 본 자료는 투자 권유가 아니며, 투자 판단의 책임은 본인에게 있습니다.</p>
      </footer>

      <ChartModal isOpen={chartModal.open} onClose={() => setChartModal({open:false,symbol:'',name:''})} symbol={chartModal.symbol} name={chartModal.name} />
    </>
  );
}
