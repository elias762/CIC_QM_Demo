import pptxgen from 'pptxgenjs';
import type { Answer } from '../types';
import {
  calculateCategoryScores,
  getOverallScore,
  getStrengths,
  getWeaknesses,
  generateRecommendations,
  getMaturityLevel,
  getOpenAnswers,
} from './reportGenerator';

// LAYOUT_WIDE = 13.33" x 7.5"
const W = 13.33;
const H = 7.5;
const PAD = 0.6;          // page padding
const CONTENT_W = W - PAD * 2;  // 12.13"
const HEADING_Y = 0.4;
const HEADING_H = 0.55;
const LINE_Y = 0.9;
const BODY_Y = 1.15;
const BODY_H = H - BODY_Y - 0.7; // ~5.65"
const FOOTER_Y = H - 0.45;

const TEAL = '0D7377';
const TEAL_DARK = '095558';
const TEAL_LIGHT = '2D9EA2';
const TEXT_COLOR = '1A2332';
const TEXT_SEC = '5A6577';
const WHITE = 'FFFFFF';
const SUCCESS = '2D8A4E';
const DANGER = 'C44B4B';
const WARNING = 'E8A838';
const BG_LIGHT = 'F7F8FA';

function maturityColor(pct: number): string {
  if (pct >= 85) return TEAL;
  if (pct >= 70) return TEAL_LIGHT;
  if (pct >= 50) return WARNING;
  if (pct >= 30) return 'E07C3A';
  return DANGER;
}

function addSlideHeading(slide: pptxgen.Slide, title: string) {
  slide.addText(title, {
    x: PAD, y: HEADING_Y, w: CONTENT_W, h: HEADING_H,
    fontSize: 28, color: TEAL, bold: true, fontFace: 'Arial',
  });
  slide.addShape('line' as pptxgen.ShapeType, {
    x: PAD, y: LINE_Y, w: 3.5, h: 0,
    line: { color: TEAL, width: 2.5 },
  });
}

function addFooter(slide: pptxgen.Slide, companyName: string, today: string) {
  slide.addShape('line' as pptxgen.ShapeType, {
    x: PAD, y: FOOTER_Y - 0.1, w: CONTENT_W, h: 0,
    line: { color: 'E2E6EC', width: 0.5 },
  });
  slide.addText(`${companyName} — Management Assessment — ${today}`, {
    x: PAD, y: FOOTER_Y, w: CONTENT_W, h: 0.3,
    fontSize: 9, color: TEXT_SEC, align: 'right',
  });
}

export function exportToPptx(
  answers: Answer[],
  company: { name: string; industry: string; employees: string },
) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'CIC Consulting';
  pptx.title = `Management Assessment — ${company.name}`;

  const scores = calculateCategoryScores(answers);
  const overall = getOverallScore(scores);
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);
  const recommendations = generateRecommendations(scores);
  const maturity = getMaturityLevel(overall);
  const openAnswers = getOpenAnswers(answers);

  const today = new Date().toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ===== SLIDE 1: Title =====
  const s1 = pptx.addSlide();
  s1.background = { fill: TEAL_DARK };
  // Decorative accent bar
  s1.addShape('rect' as pptxgen.ShapeType, {
    x: 0, y: 0, w: 0.15, h: H,
    fill: { color: TEAL_LIGHT },
  });
  s1.addText('VERTRAULICH', {
    x: W - 2.5, y: 0.35, w: 2, h: 0.3,
    fontSize: 9, color: WHITE, align: 'right', transparency: 45,
    fontFace: 'Arial',
  });
  s1.addText('Management Assessment', {
    x: 1, y: 2.0, w: W - 2, h: 1.2,
    fontSize: 44, color: WHITE, bold: true, align: 'center',
    fontFace: 'Arial',
  });
  s1.addText(company.name + (company.industry ? `  |  ${company.industry}` : ''), {
    x: 1, y: 3.3, w: W - 2, h: 0.7,
    fontSize: 22, color: WHITE, align: 'center',
    fontFace: 'Arial', transparency: 12,
  });
  if (company.employees) {
    s1.addText(`${company.employees} Mitarbeiter`, {
      x: 1, y: 4.0, w: W - 2, h: 0.5,
      fontSize: 16, color: WHITE, align: 'center', transparency: 30,
    });
  }
  s1.addText(today, {
    x: 1, y: 4.7, w: W - 2, h: 0.5,
    fontSize: 14, color: WHITE, align: 'center', transparency: 40,
  });
  // Bottom bar
  s1.addShape('rect' as pptxgen.ShapeType, {
    x: 0, y: H - 0.6, w: W, h: 0.6,
    fill: { color: TEAL },
  });
  s1.addText('CIC Consulting  |  Impulsgeber  |  Coaching', {
    x: 1, y: H - 0.55, w: W - 2, h: 0.5,
    fontSize: 11, color: WHITE, align: 'center', transparency: 20,
  });

  // ===== SLIDE 2: Executive Summary =====
  const s2 = pptx.addSlide();
  s2.background = { fill: WHITE };
  addSlideHeading(s2, 'Executive Summary');

  const metricBoxW = 2.6;
  const metricBoxH = 1.7;
  const metricGap = 0.3;
  const metrics = [
    { value: `${overall}%`, label: 'Gesamtbewertung', color: maturity.color.replace('#', '') },
    { value: maturity.level, label: 'Reifegrad', color: maturity.color.replace('#', '') },
    { value: `${scores.length}`, label: 'Kategorien bewertet', color: TEAL },
    { value: '3', label: 'Führungsrollen befragt', color: TEAL },
  ];
  const totalMetricW = metrics.length * metricBoxW + (metrics.length - 1) * metricGap;
  const metricStartX = (W - totalMetricW) / 2;

  metrics.forEach((m, i) => {
    const x = metricStartX + i * (metricBoxW + metricGap);
    const y = BODY_Y + 0.3;
    s2.addShape('roundRect' as pptxgen.ShapeType, {
      x, y, w: metricBoxW, h: metricBoxH,
      fill: { color: BG_LIGHT }, rectRadius: 0.1,
      line: { color: 'E2E6EC', width: 0.75 },
    });
    s2.addText(m.value, {
      x, y: y + 0.15, w: metricBoxW, h: 0.9,
      fontSize: 36, color: m.color, bold: true, align: 'center', fontFace: 'Arial',
      valign: 'middle',
    });
    s2.addText(m.label, {
      x, y: y + metricBoxH - 0.5, w: metricBoxW, h: 0.4,
      fontSize: 13, color: TEXT_SEC, align: 'center',
    });
  });

  // Summary text
  s2.addText(
    `Das Assessment bei ${company.name} ergibt eine Gesamtbewertung von ${overall}%. ` +
    `Das Unternehmen befindet sich im Reifegrad „${maturity.level}". ` +
    maturity.description,
    {
      x: PAD + 0.5, y: BODY_Y + metricBoxH + 0.8, w: CONTENT_W - 1, h: 1.2,
      fontSize: 13, color: TEXT_SEC, align: 'center',
      lineSpacingMultiple: 1.4,
    }
  );
  addFooter(s2, company.name, today);

  // ===== SLIDE 3: Bar Chart =====
  const s3 = pptx.addSlide();
  s3.background = { fill: WHITE };
  addSlideHeading(s3, 'Bewertung nach Kategorien');

  const chartData = [{
    name: 'Bewertung (%)',
    labels: scores.map(s => s.category),
    values: scores.map(s => s.percentage),
  }];

  s3.addChart('bar' as pptxgen.ChartType, chartData as pptxgen.IOptsChartData[], {
    x: PAD, y: BODY_Y, w: CONTENT_W, h: BODY_H,
    barDir: 'bar',
    showValue: true,
    valueFontSize: 10,
    valueFontColor: TEXT_COLOR,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 10,
    valAxisMaxVal: 100,
    chartColors: scores.map(s => maturityColor(s.percentage)),
    showLegend: false,
    catAxisOrientation: 'minMax',
    valAxisOrientation: 'minMax',
    barGapWidthPct: 80,
  } as pptxgen.IChartOpts);
  addFooter(s3, company.name, today);

  // ===== SLIDE 4: Radar =====
  const s4 = pptx.addSlide();
  s4.background = { fill: WHITE };
  addSlideHeading(s4, 'Kompetenzprofil — Radar');

  const radarData = [{
    name: 'Ist-Zustand',
    labels: scores.map(s => s.category),
    values: scores.map(s => s.score),
  }];

  s4.addChart('radar' as pptxgen.ChartType, radarData as pptxgen.IOptsChartData[], {
    x: (W - 8) / 2, y: BODY_Y, w: 8, h: BODY_H,
    chartColors: [TEAL],
    showLegend: false,
    valAxisMaxVal: 10,
    catAxisLabelFontSize: 10,
    lineDataSymbolSize: 6,
  } as pptxgen.IChartOpts);
  addFooter(s4, company.name, today);

  // ===== SLIDE 5: Strengths & Weaknesses =====
  const s5 = pptx.addSlide();
  s5.background = { fill: WHITE };
  addSlideHeading(s5, 'Stärken & Handlungsfelder');

  const colW = (CONTENT_W - 0.8) / 2;
  const leftX = PAD;
  const rightX = PAD + colW + 0.8;
  const cardH = 1.0;
  const cardGap = 0.2;

  // Left column: Strengths
  s5.addText('Top Stärken', {
    x: leftX, y: BODY_Y, w: colW, h: 0.45,
    fontSize: 18, color: SUCCESS, bold: true, fontFace: 'Arial',
  });
  strengths.forEach((s, i) => {
    const y = BODY_Y + 0.6 + i * (cardH + cardGap);
    s5.addShape('roundRect' as pptxgen.ShapeType, {
      x: leftX, y, w: colW, h: cardH,
      fill: { color: 'F0FAF3' }, rectRadius: 0.08,
      line: { color: 'C8E6D0', width: 0.75 },
    });
    s5.addText(`${s.percentage}%`, {
      x: leftX + 0.3, y, w: 1.2, h: cardH,
      fontSize: 26, color: SUCCESS, bold: true, valign: 'middle', fontFace: 'Arial',
    });
    s5.addText(s.category, {
      x: leftX + 1.6, y: y + 0.1, w: colW - 2.2, h: 0.4,
      fontSize: 14, color: TEXT_COLOR, bold: true, valign: 'middle',
    });
    s5.addText(`Reifegrad: ${getMaturityLevel(s.percentage).level}`, {
      x: leftX + 1.6, y: y + 0.5, w: colW - 2.2, h: 0.35,
      fontSize: 11, color: TEXT_SEC, valign: 'middle',
    });
  });

  // Right column: Weaknesses
  s5.addText('Handlungsfelder', {
    x: rightX, y: BODY_Y, w: colW, h: 0.45,
    fontSize: 18, color: DANGER, bold: true, fontFace: 'Arial',
  });
  weaknesses.forEach((s, i) => {
    const y = BODY_Y + 0.6 + i * (cardH + cardGap);
    s5.addShape('roundRect' as pptxgen.ShapeType, {
      x: rightX, y, w: colW, h: cardH,
      fill: { color: 'FDF0F0' }, rectRadius: 0.08,
      line: { color: 'F0C8C8', width: 0.75 },
    });
    s5.addText(`${s.percentage}%`, {
      x: rightX + 0.3, y, w: 1.2, h: cardH,
      fontSize: 26, color: DANGER, bold: true, valign: 'middle', fontFace: 'Arial',
    });
    s5.addText(s.category, {
      x: rightX + 1.6, y: y + 0.1, w: colW - 2.2, h: 0.4,
      fontSize: 14, color: TEXT_COLOR, bold: true, valign: 'middle',
    });
    s5.addText(getMaturityLevel(s.percentage).description, {
      x: rightX + 1.6, y: y + 0.5, w: colW - 2.2, h: 0.35,
      fontSize: 10, color: TEXT_SEC, valign: 'middle',
    });
  });
  addFooter(s5, company.name, today);

  // ===== SLIDE 6: Qualitative Insights =====
  if (openAnswers.length > 0) {
    const s6 = pptx.addSlide();
    s6.background = { fill: WHITE };
    addSlideHeading(s6, 'Qualitative Erkenntnisse');

    const topAnswers = openAnswers.slice(0, 4);
    const quoteH = Math.min(1.3, BODY_H / topAnswers.length - 0.15);
    topAnswers.forEach((oa, i) => {
      const y = BODY_Y + 0.15 + i * (quoteH + 0.15);
      // Accent bar
      s6.addShape('roundRect' as pptxgen.ShapeType, {
        x: PAD, y, w: CONTENT_W, h: quoteH,
        fill: { color: BG_LIGHT }, rectRadius: 0.06,
      });
      s6.addShape('rect' as pptxgen.ShapeType, {
        x: PAD, y, w: 0.1, h: quoteH,
        fill: { color: TEAL_LIGHT },
      });
      // Role
      s6.addText(oa.role.toUpperCase(), {
        x: PAD + 0.35, y: y + 0.08, w: CONTENT_W - 0.7, h: 0.3,
        fontSize: 10, color: TEAL, bold: true, fontFace: 'Arial',
      });
      // Question (short)
      s6.addText(oa.question.length > 80 ? oa.question.slice(0, 80) + '...' : oa.question, {
        x: PAD + 0.35, y: y + 0.35, w: CONTENT_W - 0.7, h: 0.25,
        fontSize: 10, color: TEXT_COLOR, bold: true,
      });
      // Answer
      const maxLen = 200;
      s6.addText(`\u201E${oa.answer.length > maxLen ? oa.answer.slice(0, maxLen) + '...' : oa.answer}\u201C`, {
        x: PAD + 0.35, y: y + 0.6, w: CONTENT_W - 0.7, h: quoteH - 0.7,
        fontSize: 11, color: TEXT_SEC, italic: true,
        lineSpacingMultiple: 1.3, valign: 'top',
      });
    });
    addFooter(s6, company.name, today);
  }

  // ===== SLIDE 7: Recommendations =====
  const s7 = pptx.addSlide();
  s7.background = { fill: WHITE };
  addSlideHeading(s7, 'Handlungsempfehlungen');

  const recs = recommendations.slice(0, 6);
  const recH = Math.min(0.75, BODY_H / recs.length - 0.12);
  recs.forEach((rec, i) => {
    const y = BODY_Y + 0.15 + i * (recH + 0.12);
    // Number circle
    s7.addShape('ellipse' as pptxgen.ShapeType, {
      x: PAD + 0.1, y: y + (recH - 0.45) / 2, w: 0.45, h: 0.45,
      fill: { color: TEAL },
    });
    s7.addText(`${i + 1}`, {
      x: PAD + 0.1, y: y + (recH - 0.45) / 2, w: 0.45, h: 0.45,
      fontSize: 14, color: WHITE, bold: true, align: 'center', valign: 'middle',
    });
    // Background bar
    s7.addShape('roundRect' as pptxgen.ShapeType, {
      x: PAD + 0.7, y, w: CONTENT_W - 0.7, h: recH,
      fill: { color: BG_LIGHT }, rectRadius: 0.06,
    });
    s7.addShape('rect' as pptxgen.ShapeType, {
      x: PAD + 0.7, y, w: 0.08, h: recH,
      fill: { color: TEAL },
    });
    s7.addText(rec, {
      x: PAD + 1.0, y, w: CONTENT_W - 1.3, h: recH,
      fontSize: 13, color: TEXT_COLOR, valign: 'middle',
      lineSpacingMultiple: 1.2,
    });
  });
  addFooter(s7, company.name, today);

  // ===== SLIDE 8: Roadmap =====
  const s8 = pptx.addSlide();
  s8.background = { fill: WHITE };
  addSlideHeading(s8, 'Nächste Schritte — Roadmap');

  const phases = [
    { phase: 'Q2 2026', title: 'Kurzfristig', desc: 'Strategieworkshop mit Führungsteam zur Priorisierung der identifizierten Handlungsfelder', color: TEAL },
    { phase: 'Q3 2026', title: 'Mittelfristig', desc: 'Top-3 Maßnahmen mit klaren Verantwortlichkeiten und Zeitkorridoren umsetzen', color: TEAL_LIGHT },
    { phase: 'Q4 2026+', title: 'Langfristig', desc: 'Quartals-Reviews etablieren und Follow-up-Assessment durchführen', color: WARNING },
    { phase: 'Laufend', title: 'Kontinuierlich', desc: 'Integration in die Unternehmenszielplanung und permanente Reflexion', color: TEXT_SEC },
  ];

  const phaseW = 2.5;
  const phaseGap = 0.4;
  const totalPhaseW = phases.length * phaseW + (phases.length - 1) * phaseGap;
  const phaseStartX = (W - totalPhaseW) / 2;
  const timelineY = BODY_Y + 1.0;
  const circleSize = 0.55;

  // Timeline line
  s8.addShape('line' as pptxgen.ShapeType, {
    x: phaseStartX + phaseW / 2, y: timelineY + circleSize / 2,
    w: totalPhaseW - phaseW, h: 0,
    line: { color: TEAL, width: 3 },
  });

  phases.forEach((p, i) => {
    const x = phaseStartX + i * (phaseW + phaseGap);
    // Circle
    s8.addShape('ellipse' as pptxgen.ShapeType, {
      x: x + (phaseW - circleSize) / 2, y: timelineY,
      w: circleSize, h: circleSize,
      fill: { color: p.color },
      shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.15 },
    });
    s8.addText(`${i + 1}`, {
      x: x + (phaseW - circleSize) / 2, y: timelineY,
      w: circleSize, h: circleSize,
      fontSize: 16, color: WHITE, bold: true, align: 'center', valign: 'middle',
    });
    // Phase label
    s8.addText(p.phase, {
      x, y: timelineY + circleSize + 0.2, w: phaseW, h: 0.35,
      fontSize: 12, color: p.color, bold: true, align: 'center', fontFace: 'Arial',
    });
    // Title
    s8.addText(p.title, {
      x, y: timelineY + circleSize + 0.55, w: phaseW, h: 0.35,
      fontSize: 16, color: TEXT_COLOR, bold: true, align: 'center',
    });
    // Description box
    s8.addShape('roundRect' as pptxgen.ShapeType, {
      x: x + 0.1, y: timelineY + circleSize + 1.0, w: phaseW - 0.2, h: 1.4,
      fill: { color: BG_LIGHT }, rectRadius: 0.06,
      line: { color: 'E2E6EC', width: 0.5 },
    });
    s8.addText(p.desc, {
      x: x + 0.25, y: timelineY + circleSize + 1.1, w: phaseW - 0.5, h: 1.2,
      fontSize: 11, color: TEXT_SEC, align: 'center', valign: 'top',
      lineSpacingMultiple: 1.3,
    });
  });

  // Bottom key message
  const msgY = timelineY + circleSize + 2.6;
  s8.addShape('roundRect' as pptxgen.ShapeType, {
    x: PAD + 1, y: msgY, w: CONTENT_W - 2, h: 0.55,
    fill: { color: BG_LIGHT }, rectRadius: 0.06,
    line: { color: TEAL_LIGHT, width: 0.75 },
  });
  s8.addText('Ziel: Nachhaltige Durchdringung aller Prozesse durch die Unternehmenszielplanung', {
    x: PAD + 1.2, y: msgY, w: CONTENT_W - 2.4, h: 0.55,
    fontSize: 12, color: TEAL, bold: true, align: 'center', valign: 'middle',
  });
  addFooter(s8, company.name, today);

  // ===== SLIDE 9: Thank You =====
  const s9 = pptx.addSlide();
  s9.background = { fill: TEAL_DARK };
  // Decorative accent bar
  s9.addShape('rect' as pptxgen.ShapeType, {
    x: 0, y: 0, w: 0.15, h: H,
    fill: { color: TEAL_LIGHT },
  });
  s9.addText('Vielen Dank', {
    x: 1, y: 1.8, w: W - 2, h: 1.3,
    fontSize: 48, color: WHITE, bold: true, align: 'center', fontFace: 'Arial',
  });
  s9.addText('Bereit für die nächsten Schritte', {
    x: 1, y: 3.2, w: W - 2, h: 0.7,
    fontSize: 22, color: WHITE, align: 'center', transparency: 15,
  });

  // CTA boxes
  const ctas = [
    { icon: '\u260E', label: 'Kontakt aufnehmen' },
    { icon: '\uD83D\uDCC5', label: 'Workshop planen' },
    { icon: '\uD83D\uDCCB', label: 'Maßnahmen starten' },
  ];
  const ctaW = 2.8;
  const ctaGap = 0.5;
  const ctaTotalW = ctas.length * ctaW + (ctas.length - 1) * ctaGap;
  const ctaStartX = (W - ctaTotalW) / 2;
  ctas.forEach((c, i) => {
    const x = ctaStartX + i * (ctaW + ctaGap);
    s9.addShape('roundRect' as pptxgen.ShapeType, {
      x, y: 4.3, w: ctaW, h: 1.1,
      fill: { color: TEAL }, rectRadius: 0.1,
    });
    s9.addText(c.label, {
      x, y: 4.35, w: ctaW, h: 1.0,
      fontSize: 14, color: WHITE, align: 'center', valign: 'middle',
      bold: true,
    });
  });

  // Bottom bar
  s9.addShape('rect' as pptxgen.ShapeType, {
    x: 0, y: H - 0.6, w: W, h: 0.6,
    fill: { color: TEAL },
  });
  s9.addText('CIC Consulting  |  Impulsgeber  |  Coaching', {
    x: 1, y: H - 0.55, w: W - 2, h: 0.5,
    fontSize: 11, color: WHITE, align: 'center', transparency: 20,
  });

  return pptx.writeFile({ fileName: `Management_Assessment_${company.name.replace(/\s+/g, '_')}.pptx` });
}
