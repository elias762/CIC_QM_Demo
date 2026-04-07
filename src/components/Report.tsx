import { useState } from 'react';
import type { Answer } from '../types';
import { exportToDocx } from '../data/exportDocx';
import {
  calculateCategoryScores,
  getOverallScore,
  getStrengths,
  getWeaknesses,
  getOpenAnswers,
  generateRecommendations,
  getMaturityLevel,
  getRoleComparison,
  getCategoryAnalysis,
} from '../data/reportGenerator';
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
  Legend,
  PieChart,
  Pie,
} from 'recharts';

interface ReportProps {
  answers: Answer[];
  company: { name: string; industry: string; employees: string };
}

const ROLE_COLORS = ['#0d7377', '#2d9ea2', '#e8a838'];

export default function Report({ answers, company }: ReportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToDocx(answers, company);
    } finally {
      setExporting(false);
    }
  };
  const scores = calculateCategoryScores(answers);
  const overall = getOverallScore(scores);
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);
  const openAnswers = getOpenAnswers(answers);
  const recommendations = generateRecommendations(scores);
  const maturity = getMaturityLevel(overall);
  const roleComparison = getRoleComparison(answers);
  const categoryAnalysis = getCategoryAnalysis(scores);

  const radarData = scores.map(s => ({
    category: s.category.length > 15 ? s.category.slice(0, 15) + '...' : s.category,
    score: s.score,
  }));

  const barData = scores.map(s => ({
    name: s.category.length > 18 ? s.category.slice(0, 18) + '...' : s.category,
    value: s.percentage,
    color: getMaturityLevel(s.percentage).color,
  }));

  // Role comparison radar data
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

  // Maturity distribution
  const maturityBuckets = scores.reduce((acc, s) => {
    const m = getMaturityLevel(s.percentage);
    acc[m.level] = (acc[m.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maturityPieData = Object.entries(maturityBuckets).map(([name, value]) => ({
    name, value,
    color: getMaturityLevel(
      name === 'Exzellent' ? 90 : name === 'Fortgeschritten' ? 75 : name === 'Entwickelt' ? 60 : name === 'Aufbauend' ? 40 : 20
    ).color,
  }));

  const today = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <h1>Management Assessment Report</h1>
        <p>{company.name}{company.industry ? ` | ${company.industry}` : ''}{company.employees ? ` | ${company.employees} Mitarbeiter` : ''}</p>
        <div className="report-date">{today}</div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            marginTop: 16, padding: '10px 24px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, fontWeight: 600,
            cursor: exporting ? 'wait' : 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 8, opacity: exporting ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!exporting) (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          {exporting ? 'Wird exportiert...' : 'Word Export (.docx)'}
        </button>
      </div>

      {/* 1. Executive Summary */}
      <div className="report-section">
        <h2>1. Executive Summary</h2>
        <div className="overall-score">
          <div className="overall-score-circle" style={{ borderColor: maturity.color }}>
            <div className="overall-score-value" style={{ color: maturity.color }}>{overall}%</div>
            <div className="overall-score-unit">Gesamtbewertung</div>
          </div>
          <div className="overall-score-info">
            <h3 style={{ color: maturity.color }}>Reifegrad: {maturity.level}</h3>
            <p>{maturity.description}</p>
          </div>
        </div>
        <p>
          Das Management Assessment bei <strong>{company.name}</strong> ergibt
          eine Gesamtbewertung von <strong>{overall}%</strong> (Reifegrad: „{maturity.level}").
          Die Analyse basiert auf strukturierten Bewertungen von {roleComparison.length} Führungsrollen
          ({roleComparison.map(r => r.roleTitle).join(', ')}) über {scores.length} Kategorien hinweg
          mit insgesamt {answers.length} ausgewerteten Antworten.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Zentrale Erkenntnis:</strong> Die größten Stärken liegen in den Bereichen{' '}
          {strengths.map(s => s.category).join(', ')} ({strengths.map(s => `${s.percentage}%`).join(', ')}).
          Prioritärer Handlungsbedarf besteht bei{' '}
          {weaknesses.map(s => s.category).join(', ')} ({weaknesses.map(s => `${s.percentage}%`).join(', ')}).
          Die Bewertungen der drei Führungsebenen zeigen eine{' '}
          {Math.max(...roleComparison.map(r => r.overallPercentage)) - Math.min(...roleComparison.map(r => r.overallPercentage)) > 15
            ? 'deutliche Divergenz in der Wahrnehmung, was auf Kommunikations- und Alignmentdefizite hindeutet.'
            : 'relative Übereinstimmung, was auf eine gemeinsame Wahrnehmung des Ist-Zustands hinweist.'}
        </p>

        {/* Maturity distribution */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 180, height: 140 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={maturityPieData} cx="50%" cy="50%" outerRadius="80%" dataKey="value" stroke="none">
                  {maturityPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Reifegrad-Verteilung der Kategorien:</div>
            {maturityPieData.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                <span><strong>{m.name}</strong>: {m.value} {m.value === 1 ? 'Kategorie' : 'Kategorien'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Rollenvergleich */}
      <div className="report-section">
        <h2>2. Rollenvergleich der Führungskräfte</h2>
        <p>Vergleich der Bewertungen aus Sicht der drei befragten Führungsrollen:</p>

        {/* Role overview cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          {roleComparison.map((rc, i) => {
            const rm = getMaturityLevel(rc.overallPercentage);
            return (
              <div key={rc.roleId} style={{
                padding: 16, borderRadius: 8, border: '1px solid var(--cic-border)',
                borderTop: `3px solid ${ROLE_COLORS[i]}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{rc.roleTitle}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: ROLE_COLORS[i], marginTop: 4 }}>{rc.overallPercentage}%</div>
                <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)' }}>Reifegrad: {rm.level}</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)' }}>
                    Stärkster Bereich: {rc.categories.sort((a, b) => b.percentage - a.percentage)[0]?.category} ({rc.categories.sort((a, b) => b.percentage - a.percentage)[0]?.percentage}%)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cic-text-secondary)' }}>
                    Schwächster Bereich: {rc.categories.sort((a, b) => a.percentage - b.percentage)[0]?.category} ({rc.categories.sort((a, b) => a.percentage - b.percentage)[0]?.percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-role radar */}
        <div className="chart-container" style={{ height: 340, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={roleRadarData}>
              <PolarGrid stroke="#e2e6ec" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#5a6577' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
              {roleComparison.map((rc, i) => (
                <Radar key={rc.roleId} name={rc.roleTitle} dataKey={rc.roleTitle}
                  stroke={ROLE_COLORS[i]} fill={ROLE_COLORS[i]} fillOpacity={0.08} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <p style={{ marginTop: 16 }}>
          Der Rollenvergleich zeigt, dass die <strong>{roleComparison.sort((a, b) => b.overallPercentage - a.overallPercentage)[0]?.roleTitle}</strong> die
          positivste Gesamteinschätzung abgibt ({roleComparison.sort((a, b) => b.overallPercentage - a.overallPercentage)[0]?.overallPercentage}%),
          während die <strong>{roleComparison.sort((a, b) => a.overallPercentage - b.overallPercentage)[0]?.roleTitle}</strong> die
          kritischste Perspektive einnimmt ({roleComparison.sort((a, b) => a.overallPercentage - b.overallPercentage)[0]?.overallPercentage}%).
          Diese Abweichungen sind aufschlussreich und sollten im Strategieworkshop thematisiert werden.
        </p>
      </div>

      {/* 3. Status Quo Analyse */}
      <div className="report-section">
        <h2>3. Status Quo — Analyse nach Kategorien</h2>
        <p>Bewertung aller {scores.length} Kategorien im Überblick:</p>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e6ec" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#5a6577' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar name="Bewertung" dataKey="score" stroke="#0d7377" fill="#0d7377" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ height: 320, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 130, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Bewertung']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e6ec' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                {barData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="score-grid" style={{ marginTop: 24 }}>
          {scores.map(s => {
            const m = getMaturityLevel(s.percentage);
            return (
              <div className="score-card" key={s.category}>
                <div className="score-card-value" style={{ color: m.color }}>{s.percentage}%</div>
                <div className="score-card-label">{s.category}</div>
                <div style={{ fontSize: 10, color: m.color, fontWeight: 600, marginTop: 2 }}>{m.level}</div>
                <div className="score-bar">
                  <div className="score-bar-fill" style={{ width: `${s.percentage}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Detaillierte Kategorie-Analyse */}
      <div className="report-section">
        <h2>4. Detaillierte Kategorie-Analyse</h2>
        <p>Bewertung und Einordnung jeder Kategorie mit kontextbezogenen Empfehlungen:</p>
        {categoryAnalysis.map((ca, i) => {
          const s = scores.find(sc => sc.category === ca.category);
          const m = s ? getMaturityLevel(s.percentage) : null;
          return (
            <div key={i} style={{
              marginTop: 16, padding: '16px 18px', borderRadius: 8,
              border: '1px solid var(--cic-border)',
              borderLeft: `4px solid ${m?.color || 'var(--cic-teal)'}`,
              background: 'var(--cic-white)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{ca.category}</div>
                {s && m && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{s.percentage}%</span>
                    <span style={{ fontSize: 11, color: m.color, fontWeight: 600, background: `${m.color}15`, padding: '2px 8px', borderRadius: 4 }}>{m.level}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--cic-text-secondary)', margin: 0 }}>{ca.text}</p>
            </div>
          );
        })}
      </div>

      {/* 5. Stärken & Schwächen */}
      <div className="report-section">
        <h2>5. Stärken & Schwächen</h2>

        <h3 style={{ color: 'var(--cic-success)' }}>Top Stärken</h3>
        <div className="sw-list">
          {strengths.map(s => (
            <div className="sw-item strength" key={s.category}>
              <span className="sw-item-score" style={{ color: 'var(--cic-success)' }}>{s.percentage}%</span>
              <div>
                <div style={{ fontWeight: 600 }}>{s.category}</div>
                <div style={{ fontSize: 12, color: 'var(--cic-text-secondary)' }}>Reifegrad: {getMaturityLevel(s.percentage).level}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ color: 'var(--cic-danger)', marginTop: 24 }}>Identifizierte Schwächen</h3>
        <div className="sw-list">
          {weaknesses.map(s => (
            <div className="sw-item weakness" key={s.category}>
              <span className="sw-item-score" style={{ color: 'var(--cic-danger)' }}>{s.percentage}%</span>
              <div>
                <div style={{ fontWeight: 600 }}>{s.category}</div>
                <div style={{ fontSize: 12, color: 'var(--cic-text-secondary)' }}>{getMaturityLevel(s.percentage).description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Qualitative Insights */}
      {openAnswers.length > 0 && (
        <div className="report-section">
          <h2>6. Qualitative Erkenntnisse der Führungskräfte</h2>
          <p>Zusammenfassung der offenen Antworten — diese geben Aufschluss über die subjektive Wahrnehmung und spezifische Herausforderungen:</p>
          <div style={{ marginTop: 16 }}>
            {openAnswers.map((oa, i) => (
              <div className="open-answer" key={i}>
                <div className="open-answer-role">{oa.role}</div>
                <div className="open-answer-question">{oa.question}</div>
                <div className="open-answer-text">&bdquo;{oa.answer}&ldquo;</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Handlungsempfehlungen */}
      <div className="report-section">
        <h2>7. Handlungsempfehlungen</h2>
        <p>
          Basierend auf den identifizierten Schwächen und der qualitativen Analyse ergeben sich
          folgende prioritäre Maßnahmen für die nächste Planungsperiode:
        </p>
        <div className="rec-list">
          {recommendations.map((rec, i) => (
            <div className="rec-item" key={i}>
              <strong>Maßnahme {i + 1}:</strong> {rec}
            </div>
          ))}
        </div>
      </div>

      {/* 8. Roadmap */}
      <div className="report-section">
        <h2>8. Nächste Schritte — Umsetzungs-Roadmap</h2>
        <p>Die Umsetzung der Handlungsempfehlungen sollte in drei Phasen erfolgen, eingebettet in den Prozess der Unternehmenszielplanung:</p>
        <div className="rec-list">
          <div className="rec-item">
            <strong>Phase 1 — Kurzfristig (Q2 2026):</strong> Strategieworkshop mit allen Führungskräften zur gemeinsamen Priorisierung der Handlungsfelder.
            Ergebnis: Verabschiedeter Maßnahmenplan mit Verantwortlichkeiten, Zeitkorridoren und Prioritäten (A+/A/B).
          </div>
          <div className="rec-item">
            <strong>Phase 2 — Mittelfristig (Q3–Q4 2026):</strong> Implementierung der Top-3-Maßnahmen mit quartalsweiser Reflexion.
            Begleitende Einführung der Regelkommunikation und des Controlling-Dashboards. Durchführung der INSIGHTS MDI®-Profile für das Führungsteam.
          </div>
          <div className="rec-item">
            <strong>Phase 3 — Langfristig (2027):</strong> Etablierung des kontinuierlichen Verbesserungsprozesses.
            Follow-up-Assessment zur Messung der Fortschritte. Integration aller Maßnahmen in die jährliche Unternehmenszielplanung
            mit Big Goals und Jahresmotto.
          </div>
          <div className="rec-item">
            <strong>Laufend:</strong> Quartalsmeetings zur Reflexion der Maßnahmen aus dem Strategieprozess.
            Monatliches Quantifizierungs-Controlling der eingeleiteten Veränderungen.
            Permanente Weiterentwicklung aller Beteiligten im Sinne der Adlerperspektive.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0 48px', color: 'var(--cic-text-secondary)', fontSize: 13 }}>
        <img src="/cic-logo.jpg" alt="CIC" style={{ height: 32, display: 'block', margin: '0 auto 8px' }} />
        CIC Consulting | Impulsgeber | Coaching &mdash; Management Assessment Report &mdash; {today}
        <br />
        <span style={{ fontSize: 11 }}>Dieses Dokument ist vertraulich und ausschließlich für den internen Gebrauch bestimmt.</span>
      </div>
    </div>
  );
}
