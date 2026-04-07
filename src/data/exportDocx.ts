import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TableCell,
  TableRow,
  Table,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
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
  getCategoryAnalysis,
} from './reportGenerator';

const TEAL = '0D7377';
const TEAL_LIGHT = '2D9EA2';
const TEAL_BG = 'E8F4F5';
const TEXT_DARK = '1A2332';
const TEXT_SEC = '5A6577';
const SUCCESS = '2D8A4E';
const SUCCESS_BG = 'EFF8F2';
const DANGER = 'C44B4B';
const DANGER_BG = 'FDF0F0';
const STRIPE_BG = 'F7F8FA';
const WHITE = 'FFFFFF';

// ─── Helpers ────────────────────────────────────────────────────

function cell(
  text: string,
  o: {
    bold?: boolean; color?: string; bg?: string; width?: number; size?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    span?: number; borderLeft?: { color: string; size: number };
  } = {},
) {
  return new TableCell({
    width: o.width ? { size: o.width, type: WidthType.PERCENTAGE } : undefined,
    shading: o.bg ? { type: ShadingType.SOLID, color: o.bg } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: o.span,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    borders: o.borderLeft
      ? { left: { style: BorderStyle.SINGLE, size: o.borderLeft.size, color: o.borderLeft.color } }
      : undefined,
    children: [new Paragraph({
      alignment: o.align,
      spacing: { after: 0 },
      children: [new TextRun({
        text,
        font: 'Calibri',
        size: o.size ?? 20,
        bold: o.bold,
        color: o.color || TEXT_DARK,
      })],
    })],
  });
}

function multiCell(
  runs: { text: string; bold?: boolean; color?: string; italic?: boolean; size?: number }[],
  o: { bg?: string; width?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; span?: number } = {},
) {
  return new TableCell({
    width: o.width ? { size: o.width, type: WidthType.PERCENTAGE } : undefined,
    shading: o.bg ? { type: ShadingType.SOLID, color: o.bg } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: o.span,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: o.align,
      spacing: { after: 0 },
      children: runs.map(r => new TextRun({
        text: r.text,
        font: 'Calibri',
        size: r.size ?? 20,
        bold: r.bold,
        color: r.color || TEXT_DARK,
        italics: r.italic,
      })),
    })],
  });
}

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'DEE2E6' } as const;
const noBorderSide = { style: BorderStyle.NONE, size: 0, color: WHITE } as const;

function cleanTable(rows: TableRow[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBorder, bottom: thinBorder, left: noBorderSide, right: noBorderSide,
      insideHorizontal: thinBorder, insideVertical: noBorderSide,
    },
    rows,
  });
}

function sectionTitle(num: string, text: string) {
  return [
    new Paragraph({
      spacing: { before: 60, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 6 } },
      children: [
        new TextRun({ text: `${num}  `, font: 'Calibri', size: 32, color: TEAL_LIGHT }),
        new TextRun({ text, font: 'Calibri', size: 32, bold: true, color: TEAL }),
      ],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];
}

function bodyText(text: string, o?: { bold?: boolean; italic?: boolean; color?: string }) {
  return new Paragraph({
    spacing: { after: 100, line: 320 },
    children: [new TextRun({
      text,
      font: 'Calibri',
      size: 21,
      bold: o?.bold,
      italics: o?.italic,
      color: o?.color || TEXT_DARK,
    })],
  });
}

function richBody(runs: { text: string; bold?: boolean; italic?: boolean; color?: string }[]) {
  return new Paragraph({
    spacing: { after: 100, line: 320 },
    children: runs.map(r => new TextRun({
      text: r.text,
      font: 'Calibri',
      size: 21,
      bold: r.bold,
      italics: r.italic,
      color: r.color || TEXT_DARK,
    })),
  });
}

function gap(pts = 80) {
  return new Paragraph({ spacing: { after: pts }, children: [] });
}

function progressBar(pct: number): string {
  const filled = Math.round(pct / 5);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled);
}

// ─── Main Export ────────────────────────────────────────────────

export async function exportToDocx(
  answers: Answer[],
  company: { name: string; industry: string; employees: string },
) {
  const scores = calculateCategoryScores(answers);
  const overall = getOverallScore(scores);
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);
  const recommendations = generateRecommendations(scores);
  const maturity = getMaturityLevel(overall);
  const openAnswers = getOpenAnswers(answers);
  const roleComparison = getRoleComparison(answers);
  const categoryAnalysis = getCategoryAnalysis(scores);

  const today = new Date().toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const items: (Paragraph | Table)[] = [];
  const push = (...a: (Paragraph | Table)[]) => items.push(...a);

  // ━━━━━ TITLE PAGE ━━━━━
  // Top accent bar (simulated with table)
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: TEAL },
            margins: { top: 20, bottom: 20, left: 0, right: 0 },
            children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 8 })] })],
          }),
        ],
      })],
    }),
    gap(800),
  );

  push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'MANAGEMENT ASSESSMENT', font: 'Calibri', size: 52, bold: true, color: TEAL, characterSpacing: 200 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: 'REPORT', font: 'Calibri', size: 52, bold: true, color: TEAL_LIGHT, characterSpacing: 400 })],
    }),
    gap(100),
    // Separator line
    new Table({
      width: { size: 30, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
      rows: [new TableRow({
        children: [new TableCell({
          shading: { type: ShadingType.SOLID, color: TEAL },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 4 })] })],
        })],
      })],
    }),
    gap(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: company.name, font: 'Calibri', size: 36, color: TEXT_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({
        text: [company.industry, company.employees ? `${company.employees} Mitarbeiter` : ''].filter(Boolean).join('  \u00B7  '),
        font: 'Calibri', size: 22, color: TEXT_SEC,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: today, font: 'Calibri', size: 22, color: TEXT_SEC })],
    }),
    gap(600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CIC  Consulting  \u00B7  Impulsgeber  \u00B7  Coaching', font: 'Calibri', size: 20, color: TEAL, bold: true })],
    }),
    gap(60),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'VERTRAULICH', font: 'Calibri', size: 16, color: TEXT_SEC, italics: true, characterSpacing: 100 })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // ━━━━━ TABLE OF CONTENTS ━━━━━
  push(...sectionTitle('', 'Inhaltsverzeichnis'));
  const tocItems = [
    '1.   Executive Summary',
    '2.   Rollenvergleich der Führungskräfte',
    '3.   Status Quo — Analyse nach Kategorien',
    '4.   Detaillierte Kategorie-Analyse',
    '5.   Stärken & Schwächen',
    '6.   Qualitative Erkenntnisse',
    '7.   Handlungsempfehlungen',
    '8.   Nächste Schritte — Umsetzungs-Roadmap',
  ];
  for (const t of tocItems) {
    push(new Paragraph({
      spacing: { after: 80 },
      indent: { left: 200 },
      children: [new TextRun({ text: t, font: 'Calibri', size: 22, color: TEXT_DARK })],
    }));
  }
  push(new Paragraph({ children: [new PageBreak()] }));

  // ━━━━━ 1. EXECUTIVE SUMMARY ━━━━━
  push(...sectionTitle('01', 'Executive Summary'));

  // Key metrics table (4 column, borderless boxes)
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
      rows: [
        new TableRow({
          children: [
            cell(`${overall}%`, { bold: true, color: maturity.color.replace('#', ''), bg: TEAL_BG, width: 25, size: 36, align: AlignmentType.CENTER }),
            cell(maturity.level, { bold: true, color: maturity.color.replace('#', ''), bg: TEAL_BG, width: 25, size: 28, align: AlignmentType.CENTER }),
            cell(`${scores.length}`, { bold: true, color: TEAL, bg: TEAL_BG, width: 25, size: 36, align: AlignmentType.CENTER }),
            cell(`${roleComparison.length}`, { bold: true, color: TEAL, bg: TEAL_BG, width: 25, size: 36, align: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            cell('Gesamtbewertung', { color: TEXT_SEC, bg: TEAL_BG, width: 25, size: 16, align: AlignmentType.CENTER }),
            cell('Reifegrad', { color: TEXT_SEC, bg: TEAL_BG, width: 25, size: 16, align: AlignmentType.CENTER }),
            cell('Kategorien bewertet', { color: TEXT_SEC, bg: TEAL_BG, width: 25, size: 16, align: AlignmentType.CENTER }),
            cell('Führungsrollen befragt', { color: TEXT_SEC, bg: TEAL_BG, width: 25, size: 16, align: AlignmentType.CENTER }),
          ],
        }),
      ],
    }),
    gap(),
  );

  push(
    richBody([
      { text: 'Das Management Assessment bei ' },
      { text: company.name, bold: true },
      { text: ` ergibt eine Gesamtbewertung von ` },
      { text: `${overall}%`, bold: true, color: maturity.color.replace('#', '') },
      { text: ` (Reifegrad: \u201E${maturity.level}\u201C). ` },
      { text: `Die Analyse basiert auf strukturierten Bewertungen von ${roleComparison.length} Führungsrollen ` },
      { text: `(${roleComparison.map(r => r.roleTitle).join(', ')}) ` },
      { text: `über ${scores.length} Kategorien hinweg mit insgesamt ${answers.length} ausgewerteten Antworten.` },
    ]),
    gap(40),
    richBody([
      { text: 'Zentrale Erkenntnis:  ', bold: true, color: TEAL },
      { text: `Die größten Stärken liegen in den Bereichen ${strengths.map(s => `${s.category} (${s.percentage}%)`).join(', ')}. ` },
      { text: `Prioritärer Handlungsbedarf besteht bei ${weaknesses.map(s => `${s.category} (${s.percentage}%)`).join(', ')}.` },
    ]),
    gap(20),
    bodyText(maturity.description, { italic: true, color: maturity.color.replace('#', '') }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // ━━━━━ 2. ROLLENVERGLEICH ━━━━━
  push(
    ...sectionTitle('02', 'Rollenvergleich der Führungskräfte'),
    bodyText('Vergleich der Bewertungen aus Sicht der drei befragten Führungsrollen:'),
    gap(40),
  );

  // Role overview boxes (as table)
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
      rows: [
        new TableRow({
          children: roleComparison.map(rc => {
            const m = getMaturityLevel(rc.overallPercentage);
            return multiCell([
              { text: rc.roleTitle, bold: true, size: 22 },
              { text: '\n' },
              { text: `${rc.overallPercentage}%`, bold: true, color: m.color.replace('#', ''), size: 36 },
              { text: `  ${m.level}`, color: m.color.replace('#', ''), size: 18 },
            ], { bg: STRIPE_BG, width: 33, align: AlignmentType.CENTER });
          }),
        }),
      ],
    }),
    gap(),
  );

  // Detailed comparison table
  const rcHeaderRow = new TableRow({
    children: [
      cell('Kategorie', { bold: true, bg: TEAL, color: WHITE, width: 34 }),
      ...roleComparison.map(rc => cell(rc.roleTitle, { bold: true, bg: TEAL, color: WHITE, width: 22, align: AlignmentType.CENTER })),
    ],
  });
  const rcRows = [rcHeaderRow];

  // Overall
  rcRows.push(new TableRow({
    children: [
      cell('Gesamtbewertung', { bold: true, bg: TEAL_BG }),
      ...roleComparison.map(rc => {
        const m = getMaturityLevel(rc.overallPercentage);
        return cell(`${rc.overallPercentage}%`, { bold: true, color: m.color.replace('#', ''), bg: TEAL_BG, align: AlignmentType.CENTER });
      }),
    ],
  }));

  scores.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? WHITE : STRIPE_BG;
    rcRows.push(new TableRow({
      children: [
        cell(s.category, { bg }),
        ...roleComparison.map(rc => {
          const cat = rc.categories.find(c => c.category === s.category);
          const pct = cat?.percentage ?? 0;
          const m = getMaturityLevel(pct);
          return cell(pct > 0 ? `${pct}%` : '\u2014', { color: m.color.replace('#', ''), bg, align: AlignmentType.CENTER });
        }),
      ],
    }));
  });

  push(cleanTable(rcRows), gap());

  const sortedRoles = [...roleComparison].sort((a, b) => b.overallPercentage - a.overallPercentage);
  push(
    richBody([
      { text: 'Die ' },
      { text: sortedRoles[0].roleTitle, bold: true },
      { text: ` gibt die positivste Einschätzung ab (${sortedRoles[0].overallPercentage}%), während die ` },
      { text: sortedRoles[sortedRoles.length - 1].roleTitle, bold: true },
      { text: ` die kritischste Perspektive einnimmt (${sortedRoles[sortedRoles.length - 1].overallPercentage}%). ` },
      { text: 'Diese Abweichungen sind aufschlussreich und sollten im Strategieworkshop thematisiert werden.' },
    ]),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // ━━━━━ 3. STATUS QUO ━━━━━
  push(
    ...sectionTitle('03', 'Status Quo — Analyse nach Kategorien'),
    bodyText(`Bewertung aller ${scores.length} Kategorien, sortiert nach Ergebnis:`),
    gap(40),
  );

  const sqHeaderRow = new TableRow({
    children: [
      cell('Kategorie', { bold: true, bg: TEAL, color: WHITE, width: 28 }),
      cell('Score', { bold: true, bg: TEAL, color: WHITE, width: 10, align: AlignmentType.CENTER }),
      cell('Bewertung', { bold: true, bg: TEAL, color: WHITE, width: 12, align: AlignmentType.CENTER }),
      cell('Verlauf', { bold: true, bg: TEAL, color: WHITE, width: 30, align: AlignmentType.CENTER }),
      cell('Reifegrad', { bold: true, bg: TEAL, color: WHITE, width: 20, align: AlignmentType.CENTER }),
    ],
  });
  const sqRows = [sqHeaderRow];

  [...scores].sort((a, b) => b.percentage - a.percentage).forEach((s, idx) => {
    const m = getMaturityLevel(s.percentage);
    const bg = idx % 2 === 0 ? WHITE : STRIPE_BG;
    sqRows.push(new TableRow({
      children: [
        cell(s.category, { bold: true, bg }),
        cell(`${s.score}/10`, { bg, align: AlignmentType.CENTER }),
        cell(`${s.percentage}%`, { bold: true, color: m.color.replace('#', ''), bg, align: AlignmentType.CENTER, size: 22 }),
        cell(progressBar(s.percentage), { color: m.color.replace('#', ''), bg, align: AlignmentType.LEFT, size: 14 }),
        multiCell([
          { text: m.level, bold: true, color: m.color.replace('#', ''), size: 18 },
        ], { bg, align: AlignmentType.CENTER }),
      ],
    }));
  });

  push(cleanTable(sqRows), new Paragraph({ children: [new PageBreak()] }));

  // ━━━━━ 4. DETAILLIERTE KATEGORIE-ANALYSE ━━━━━
  push(
    ...sectionTitle('04', 'Detaillierte Kategorie-Analyse'),
    bodyText('Individuelle Bewertung und Einordnung jeder Kategorie:'),
    gap(40),
  );

  for (const ca of categoryAnalysis) {
    const s = scores.find(sc => sc.category === ca.category);
    const m = s ? getMaturityLevel(s.percentage) : null;
    const mColor = m?.color.replace('#', '') || TEAL;

    // Category header as 1-row table with left accent
    push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: thinBorder, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
        rows: [new TableRow({
          children: [
            new TableCell({
              width: { size: 1, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: mColor },
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 6 })] })],
            }),
            multiCell([
              { text: `  ${ca.category}`, bold: true, size: 24 },
            ], { width: 69 }),
            multiCell([
              { text: `${s?.percentage}%`, bold: true, color: mColor, size: 28 },
              { text: `  ${m?.level}`, color: mColor, size: 18 },
            ], { width: 30, align: AlignmentType.RIGHT }),
          ],
        })],
      }),
    );

    // Analysis text
    push(
      new Paragraph({
        spacing: { after: 140, line: 300 },
        indent: { left: 200 },
        children: [new TextRun({ text: ca.text, font: 'Calibri', size: 20, color: TEXT_SEC })],
      }),
    );
  }
  push(new Paragraph({ children: [new PageBreak()] }));

  // ━━━━━ 5. STÄRKEN & SCHWÄCHEN ━━━━━
  push(...sectionTitle('05', 'Stärken & Schwächen'));

  // Strengths table
  push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: '\u2713  ', font: 'Calibri', size: 26, bold: true, color: SUCCESS }),
        new TextRun({ text: 'Top Stärken', font: 'Calibri', size: 26, bold: true, color: SUCCESS }),
      ],
    }),
  );
  const strRows = strengths.map(s => new TableRow({
    children: [
      cell(`${s.percentage}%`, { bold: true, color: SUCCESS, bg: SUCCESS_BG, width: 12, size: 26, align: AlignmentType.CENTER }),
      multiCell([
        { text: s.category, bold: true, size: 22 },
        { text: `\nReifegrad: ${getMaturityLevel(s.percentage).level}`, color: TEXT_SEC, size: 18 },
      ], { bg: SUCCESS_BG, width: 88 }),
    ],
  }));
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: SUCCESS_BG }, insideVertical: noBorderSide },
      rows: strRows,
    }),
    gap(200),
  );

  // Weaknesses table
  push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: '\u26A0  ', font: 'Calibri', size: 26, bold: true, color: DANGER }),
        new TextRun({ text: 'Identifizierte Schwächen', font: 'Calibri', size: 26, bold: true, color: DANGER }),
      ],
    }),
  );
  const weakRows = weaknesses.map(s => new TableRow({
    children: [
      cell(`${s.percentage}%`, { bold: true, color: DANGER, bg: DANGER_BG, width: 12, size: 26, align: AlignmentType.CENTER }),
      multiCell([
        { text: s.category, bold: true, size: 22 },
        { text: `\n${getMaturityLevel(s.percentage).description}`, color: TEXT_SEC, size: 18 },
      ], { bg: DANGER_BG, width: 88 }),
    ],
  }));
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: DANGER_BG }, insideVertical: noBorderSide },
      rows: weakRows,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // ━━━━━ 6. QUALITATIVE ERKENNTNISSE ━━━━━
  if (openAnswers.length > 0) {
    push(
      ...sectionTitle('06', 'Qualitative Erkenntnisse'),
      bodyText('Zusammenfassung der offenen Antworten der Führungskräfte:'),
      gap(40),
    );

    for (const oa of openAnswers) {
      push(
        new Paragraph({
          spacing: { before: 140, after: 20 },
          children: [
            new TextRun({ text: oa.role.toUpperCase(), font: 'Calibri', size: 16, bold: true, color: TEAL, characterSpacing: 60 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: oa.question, font: 'Calibri', size: 20, bold: true, color: TEXT_DARK })],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
          rows: [new TableRow({
            children: [
              new TableCell({
                width: { size: 1, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: TEAL_LIGHT },
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 6 })] })],
              }),
              new TableCell({
                width: { size: 99, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: STRIPE_BG },
                margins: { top: 60, bottom: 60, left: 120, right: 100 },
                children: [new Paragraph({
                  spacing: { after: 0, line: 300 },
                  children: [new TextRun({
                    text: `\u201E${oa.answer}\u201C`,
                    font: 'Calibri', size: 20, italics: true, color: TEXT_SEC,
                  })],
                })],
              }),
            ],
          })],
        }),
        gap(60),
      );
    }
    push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ━━━━━ 7. HANDLUNGSEMPFEHLUNGEN ━━━━━
  push(
    ...sectionTitle('07', 'Handlungsempfehlungen'),
    bodyText('Basierend auf den identifizierten Schwächen ergeben sich folgende prioritäre Maßnahmen:'),
    gap(40),
  );

  const recRows = recommendations.map((rec, i) => new TableRow({
    children: [
      cell(`${i + 1}`, { bold: true, color: WHITE, bg: TEAL, width: 6, size: 22, align: AlignmentType.CENTER }),
      cell(rec, { bg: i % 2 === 0 ? WHITE : STRIPE_BG, width: 94 }),
    ],
  }));
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: thinBorder, bottom: thinBorder, left: noBorderSide, right: noBorderSide, insideHorizontal: thinBorder, insideVertical: noBorderSide },
      rows: recRows,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // ━━━━━ 8. ROADMAP ━━━━━
  push(
    ...sectionTitle('08', 'Nächste Schritte — Umsetzungs-Roadmap'),
    bodyText('Die Umsetzung erfolgt in vier Phasen, eingebettet in die Unternehmenszielplanung:'),
    gap(40),
  );

  const phases = [
    { phase: 'Q2 2026', title: 'Kurzfristig', text: 'Strategieworkshop mit allen Führungskräften zur gemeinsamen Priorisierung der Handlungsfelder. Verabschiedung des Maßnahmenplans mit Verantwortlichkeiten, Zeitkorridoren und Prioritäten (A+/A/B).' },
    { phase: 'Q3\u2013Q4 2026', title: 'Mittelfristig', text: 'Implementierung der Top-3-Maßnahmen mit quartalsweiser Reflexion. Einführung Regelkommunikation und Controlling-Dashboard. INSIGHTS MDI\u00AE-Profile für das Führungsteam.' },
    { phase: '2027', title: 'Langfristig', text: 'Etablierung des kontinuierlichen Verbesserungsprozesses. Follow-up-Assessment zur Fortschrittsmessung. Integration in die Unternehmenszielplanung mit Big Goals und Jahresmotto.' },
    { phase: 'Laufend', title: 'Kontinuierlich', text: 'Quartalsmeetings zur Maßnahmen-Reflexion. Monatliches Controlling. Permanente Weiterentwicklung im Sinne der Adlerperspektive.' },
  ];

  const phaseRows = phases.map((p, i) => new TableRow({
    children: [
      cell(p.phase, { bold: true, color: WHITE, bg: i < 2 ? TEAL : (i === 2 ? TEAL_LIGHT : TEXT_SEC), width: 14, size: 18, align: AlignmentType.CENTER }),
      cell(p.title, { bold: true, width: 16 }),
      cell(p.text, { width: 70, color: TEXT_SEC }),
    ],
  }));

  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: thinBorder, bottom: thinBorder, left: noBorderSide, right: noBorderSide, insideHorizontal: thinBorder, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'DEE2E6' } },
      rows: phaseRows,
    }),
    gap(300),
  );

  // Final footer
  push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorderSide, bottom: noBorderSide, left: noBorderSide, right: noBorderSide, insideHorizontal: noBorderSide, insideVertical: noBorderSide },
      rows: [new TableRow({
        children: [new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: TEAL },
          margins: { top: 10, bottom: 10, left: 0, right: 0 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 4 })] })],
        })],
      })],
    }),
    gap(100),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CIC  Consulting  \u00B7  Impulsgeber  \u00B7  Coaching', font: 'Calibri', size: 20, color: TEAL, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: `Management Assessment Report  \u00B7  ${today}`, font: 'Calibri', size: 16, color: TEXT_SEC })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Dieses Dokument ist vertraulich und ausschließlich für den internen Gebrauch bestimmt.', font: 'Calibri', size: 16, color: TEXT_SEC, italics: true })],
    }),
  );

  // ━━━━━ BUILD DOCUMENT ━━━━━
  const doc = new Document({
    creator: 'CIC Consulting',
    title: `Management Assessment \u2014 ${company.name}`,
    description: 'Automatisch generierter Management Assessment Report',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, bottom: 900, left: 1100, right: 1100 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DEE2E6', space: 4 } },
            children: [
              new TextRun({ text: company.name, font: 'Calibri', size: 16, color: TEAL, bold: true }),
              new TextRun({ text: '  \u00B7  Management Assessment', font: 'Calibri', size: 16, color: TEXT_SEC }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'DEE2E6', space: 4 } },
            children: [
              new TextRun({ text: 'CIC Consulting  \u00B7  Impulsgeber  \u00B7  Coaching', font: 'Calibri', size: 14, color: TEXT_SEC }),
            ],
          })],
        }),
      },
      children: items,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Management_Assessment_${company.name.replace(/\s+/g, '_')}.docx`);
}
