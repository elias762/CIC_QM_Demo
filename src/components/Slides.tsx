import { useState } from 'react';
import type { Answer } from '../types';
import {
  calculateCategoryScores,
  getOverallScore,
  getStrengths,
  getWeaknesses,
  generateRecommendations,
  getMaturityLevel,
  getOpenAnswers,
  getRoleComparison,
} from '../data/reportGenerator';
import { exportToPptx } from '../data/exportPptx';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface SlidesProps {
  answers: Answer[];
  company: { name: string; industry: string; employees: string };
}

export default function Slides({ answers, company }: SlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exporting, setExporting] = useState(false);

  const scores = calculateCategoryScores(answers);
  const overall = getOverallScore(scores);
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);
  const recommendations = generateRecommendations(scores);
  const maturity = getMaturityLevel(overall);
  const openAnswers = getOpenAnswers(answers);
  const roleComparison = getRoleComparison(answers);

  const ROLE_COLORS = ['#0d7377', '#2d9ea2', '#e8a838'];

  const today = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalSlides = 9 + (openAnswers.length > 0 ? 1 : 0);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToPptx(answers, company);
    } finally {
      setExporting(false);
    }
  };

  const handlePrev = () => setCurrentSlide(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1));

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
  };

  // Chart data
  const radarData = scores.map(s => ({
    category: s.category.length > 14 ? s.category.slice(0, 14) + '.' : s.category,
    score: s.score,
  }));

  const barData = scores.map(s => ({
    name: s.category,
    value: s.percentage,
    color: getMaturityLevel(s.percentage).color,
  }));

  const gaugeData = [
    { name: 'score', value: overall },
    { name: 'remaining', value: 100 - overall },
  ];

  // Maturity distribution
  const maturityBuckets = scores.reduce((acc, s) => {
    const m = getMaturityLevel(s.percentage);
    acc[m.level] = (acc[m.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maturityPieData = Object.entries(maturityBuckets).map(([name, value]) => ({
    name,
    value,
    color: getMaturityLevel(
      name === 'Exzellent' ? 90 : name === 'Fortgeschritten' ? 75 : name === 'Entwickelt' ? 60 : name === 'Aufbauend' ? 40 : 20
    ).color,
  }));

  const renderSlide = () => {
    let slideIndex = currentSlide;

    // Slide 0: Title
    if (slideIndex === 0) {
      return (
        <div className="slide slide-title-page" key={slideIndex}>
          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.5, marginBottom: 16 }}>
            CIC Consulting | Impulsgeber | Coaching
          </div>
          <h1>Management Assessment</h1>
          <h2>{company.name}{company.industry ? ` | ${company.industry}` : ''}</h2>
          {company.employees && (
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>{company.employees} Mitarbeiter</div>
          )}
          <div className="slide-date">{today}</div>
          <div className="slide-footer">
            <span>CIC Consulting | Impulsgeber | Coaching</span>
            <span>Vertraulich</span>
          </div>
        </div>
      );
    }

    // Slide 1: Executive Summary with gauge + metrics
    if (slideIndex === 1) {
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Executive Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              {/* Left: Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={gaugeData}
                        cx="50%"
                        cy="70%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="60%"
                        outerRadius="85%"
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={maturity.color} />
                        <Cell fill="#e2e6ec" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ textAlign: 'center', marginTop: -40 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: maturity.color }}>{overall}%</div>
                  <div style={{ fontSize: 13, color: 'var(--cic-text-secondary)' }}>Gesamtbewertung</div>
                </div>
              </div>
              {/* Right: Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'center' }}>
                {[
                  { value: maturity.level, label: 'Reifegrad', color: maturity.color },
                  { value: `${scores.length}`, label: 'Kategorien', color: '#0d7377' },
                  { value: '3', label: 'Rollen befragt', color: '#0d7377' },
                  { value: `${strengths[0]?.percentage || 0}%`, label: `Top: ${strengths[0]?.category || '—'}`, color: '#2d8a4e' },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: 'var(--cic-bg)',
                    borderRadius: 8,
                    padding: '14px 12px',
                    textAlign: 'center',
                    border: '1px solid var(--cic-border)',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Slide 2: Bar Chart - Kategorien
    if (slideIndex === 2) {
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Bewertung nach Kategorien</h2>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 130, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={130} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Bewertung']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e6ec', fontSize: 13 }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Slide 3: Radar + Maturity Pie
    if (slideIndex === 3) {
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Kompetenzprofil</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, flex: 1 }}>
              <div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e6ec" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#5a6577' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="score" stroke="#0d7377" fill="#0d7377" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cic-teal)', marginBottom: 8 }}>Reifegrad-Verteilung</div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={maturityPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                        stroke="none"
                      >
                        {maturityPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {maturityPieData.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Slide 4: Rollenvergleich
    if (slideIndex === 4) {
      const roleRadarData = scores.map(s => {
        const entry: Record<string, string | number> = {
          category: s.category.length > 12 ? s.category.slice(0, 12) + '.' : s.category,
        };
        roleComparison.forEach(rc => {
          const cat = rc.categories.find(c => c.category === s.category);
          entry[rc.roleTitle] = cat ? cat.score : 0;
        });
        return entry;
      });
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Rollenvergleich</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr', gap: 16, flex: 1 }}>
              <div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={roleRadarData}>
                    <PolarGrid stroke="#e2e6ec" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: '#5a6577' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8 }} />
                    {roleComparison.map((rc, i) => (
                      <Radar key={rc.roleId} name={rc.roleTitle} dataKey={rc.roleTitle}
                        stroke={ROLE_COLORS[i]} fill={ROLE_COLORS[i]} fillOpacity={0.06} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                {roleComparison.map((rc, i) => (
                  <div key={rc.roleId} style={{
                    padding: '12px 14px', borderRadius: 6,
                    border: '1px solid var(--cic-border)',
                    borderLeft: `3px solid ${ROLE_COLORS[i]}`,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{rc.roleTitle}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: ROLE_COLORS[i] }}>{rc.overallPercentage}%</div>
                    <div style={{ fontSize: 10, color: 'var(--cic-text-secondary)' }}>
                      {getMaturityLevel(rc.overallPercentage).level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Slide 5: Strengths & Weaknesses
    if (slideIndex === 5) {
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Stärken & Handlungsfelder</h2>
            <div className="slide-two-col" style={{ flex: 1 }}>
              <div className="slide-col">
                <h3 style={{ color: 'var(--cic-success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3"/></svg>
                  Top Stärken
                </h3>
                {strengths.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'rgba(45,138,78,0.06)', borderRadius: 6, marginBottom: 8,
                    border: '1px solid rgba(45,138,78,0.12)',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cic-success)', minWidth: 50 }}>{s.percentage}%</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.category}</div>
                      <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)' }}>
                        Reifegrad: {getMaturityLevel(s.percentage).level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="slide-col">
                <h3 style={{ color: 'var(--cic-danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  Handlungsfelder
                </h3>
                {weaknesses.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'rgba(196,75,75,0.06)', borderRadius: 6, marginBottom: 8,
                    border: '1px solid rgba(196,75,75,0.12)',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cic-danger)', minWidth: 50 }}>{s.percentage}%</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.category}</div>
                      <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)' }}>
                        {getMaturityLevel(s.percentage).description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Slide 6 (optional): Qualitative Insights
    const hasQualitative = openAnswers.length > 0;
    if (hasQualitative && slideIndex === 6) {
      const topAnswers = openAnswers.slice(0, 3);
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Qualitative Erkenntnisse</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {topAnswers.map((oa, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderLeft: '3px solid var(--cic-teal-light)',
                  background: 'rgba(13,115,119,0.03)', borderRadius: '0 8px 8px 0', flex: 1,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cic-teal)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    {oa.role}
                  </div>
                  <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--cic-text-secondary)', lineHeight: 1.5 }}>
                    &bdquo;{oa.answer.length > 200 ? oa.answer.slice(0, 200) + '...' : oa.answer}&ldquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Adjust index for optional slide
    const recIdx = hasQualitative ? 7 : 6;
    const roadmapIdx = hasQualitative ? 8 : 7;
    const endIdx = hasQualitative ? 9 : 8;

    // Recommendations
    if (slideIndex === recIdx) {
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Handlungsempfehlungen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {recommendations.slice(0, 6).map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 14px', background: 'rgba(13,115,119,0.04)',
                  borderLeft: '3px solid var(--cic-teal)', borderRadius: '0 6px 6px 0',
                }}>
                  <div style={{
                    background: 'var(--cic-teal)', color: 'white', width: 24, height: 24,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{rec}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // Roadmap
    if (slideIndex === roadmapIdx) {
      const phases = [
        { phase: 'Q2 2026', title: 'Kurzfristig', desc: 'Strategieworkshop mit Führungsteam', color: '#0d7377' },
        { phase: 'Q3 2026', title: 'Mittelfristig', desc: 'Top-3 Maßnahmen umsetzen', color: '#2d9ea2' },
        { phase: 'Q4 2026+', title: 'Langfristig', desc: 'Quartals-Reviews & Follow-up', color: '#e8a838' },
        { phase: 'Laufend', title: 'Kontinuierlich', desc: 'Unternehmenszielplanung', color: '#5a6577' },
      ];
      return (
        <div className="slide" key={slideIndex}>
          <div className="slide-content">
            <h2 className="slide-heading">Nächste Schritte — Roadmap</h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Timeline */}
              <div style={{ position: 'relative', padding: '0 20px' }}>
                <div style={{
                  position: 'absolute', top: 20, left: 40, right: 40, height: 3,
                  background: 'linear-gradient(90deg, #0d7377, #2d9ea2, #e8a838, #5a6577)',
                  borderRadius: 2,
                }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, position: 'relative' }}>
                  {phases.map((p, i) => (
                    <div key={i} style={{ textAlign: 'center', paddingTop: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: p.color,
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 14, fontWeight: 700, position: 'relative', zIndex: 1,
                        boxShadow: `0 2px 8px ${p.color}40`,
                      }}>{i + 1}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.phase}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cic-text)', marginTop: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--cic-text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Key message */}
              <div style={{
                marginTop: 32, padding: '14px 20px', background: 'rgba(13,115,119,0.06)',
                borderRadius: 8, border: '1px solid rgba(13,115,119,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--cic-teal)', fontWeight: 600 }}>
                  Integration in die Unternehmenszielplanung — permanente Reflexion und Steuerung aller Prozesse
                </div>
              </div>
            </div>
          </div>
          <div className="slide-footer">
            <img src="/cic-logo.jpg" alt="CIC" className="slide-footer-logo" />
            <span>{company.name} — Management Assessment — {today}</span>
          </div>
        </div>
      );
    }

    // End slide
    if (slideIndex === endIdx) {
      return (
        <div className="slide slide-title-page" key={slideIndex}>
          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.5, marginBottom: 16 }}>
            CIC Consulting | Impulsgeber | Coaching
          </div>
          <h1>Vielen Dank</h1>
          <h2>Bereit für die nächsten Schritte</h2>
          <div style={{ marginTop: 32, display: 'flex', gap: 24, justifyContent: 'center' }}>
            {[
              { icon: '📞', label: 'Kontakt aufnehmen' },
              { icon: '📅', label: 'Workshop planen' },
              { icon: '📋', label: 'Maßnahmen starten' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 20px',
                textAlign: 'center', backdropFilter: 'blur(4px)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className="slide-footer">
            <span>CIC Consulting | Impulsgeber | Coaching</span>
            <span>Vertraulich</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="slides-container" onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: 'none' }}>
      {/* Controls */}
      <div className="slide-controls">
        <button className="btn btn-ghost btn-sm" onClick={handlePrev} disabled={currentSlide === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
        <span className="slide-counter">{currentSlide + 1} / {totalSlides}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleNext} disabled={currentSlide === totalSlides - 1}>
          Weiter
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--cic-border)', margin: '0 4px' }} />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleExport}
          disabled={exporting}
          style={{ opacity: exporting ? 0.6 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          {exporting ? 'Exportiert...' : 'PowerPoint Export'}
        </button>
      </div>

      {/* Slide */}
      {renderSlide()}

      {/* Thumbnails */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
        {Array.from({ length: totalSlides }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 4,
              border: currentSlide === i ? '2px solid var(--cic-teal)' : '1px solid var(--cic-border)',
              background: currentSlide === i ? 'rgba(13,115,119,0.1)' : 'var(--cic-white)',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              color: currentSlide === i ? 'var(--cic-teal)' : 'var(--cic-text-secondary)',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--cic-text-secondary)' }}>
        Pfeiltasten zur Navigation verwenden
      </div>
    </div>
  );
}
