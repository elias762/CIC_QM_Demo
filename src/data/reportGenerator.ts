import type { Answer, CategoryScore } from '../types';
import { roles, categories } from './questions';

export function calculateCategoryScores(answers: Answer[]): CategoryScore[] {
  const categoryData: Record<string, { total: number; count: number }> = {};

  for (const cat of categories) {
    categoryData[cat] = { total: 0, count: 0 };
  }

  for (const role of roles) {
    for (const q of role.questions) {
      if (q.type === 'scale') {
        const answer = answers.find(a => a.questionId === q.id);
        if (answer && typeof answer.value === 'number') {
          if (categoryData[q.category]) {
            categoryData[q.category].total += answer.value;
            categoryData[q.category].count += 1;
          }
        }
      } else if (q.type === 'multiple-choice') {
        const answer = answers.find(a => a.questionId === q.id);
        if (answer && q.options) {
          const idx = q.options.indexOf(answer.value as string);
          if (idx >= 0) {
            const score = Math.round(((idx + 1) / q.options.length) * 10);
            if (categoryData[q.category]) {
              categoryData[q.category].total += score;
              categoryData[q.category].count += 1;
            }
          }
        }
      }
    }
  }

  return Object.entries(categoryData)
    .filter(([, data]) => data.count > 0)
    .map(([category, data]) => ({
      category,
      score: Math.round((data.total / data.count) * 10) / 10,
      maxScore: 10,
      percentage: Math.round((data.total / data.count / 10) * 100),
    }));
}

export function getOverallScore(scores: CategoryScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length);
}

export function getStrengths(scores: CategoryScore[]): CategoryScore[] {
  return [...scores].sort((a, b) => b.percentage - a.percentage).slice(0, 3);
}

export function getWeaknesses(scores: CategoryScore[]): CategoryScore[] {
  return [...scores].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
}

export function getOpenAnswers(answers: Answer[]): { role: string; question: string; answer: string }[] {
  const result: { role: string; question: string; answer: string }[] = [];
  for (const role of roles) {
    for (const q of role.questions) {
      if (q.type === 'open') {
        const answer = answers.find(a => a.questionId === q.id);
        if (answer && typeof answer.value === 'string' && answer.value.trim()) {
          result.push({
            role: role.title,
            question: q.text,
            answer: answer.value as string,
          });
        }
      }
    }
  }
  return result;
}

/** Berechnet Scores pro Rolle und Kategorie für den Rollenvergleich */
export function getRoleComparison(answers: Answer[]): {
  roleId: string;
  roleTitle: string;
  categories: { category: string; score: number; percentage: number }[];
  overallPercentage: number;
}[] {
  return roles.map(role => {
    const catData: Record<string, { total: number; count: number }> = {};
    for (const cat of categories) {
      catData[cat] = { total: 0, count: 0 };
    }
    for (const q of role.questions) {
      if (q.type === 'scale') {
        const answer = answers.find(a => a.questionId === q.id);
        if (answer && typeof answer.value === 'number' && catData[q.category]) {
          catData[q.category].total += answer.value;
          catData[q.category].count += 1;
        }
      } else if (q.type === 'multiple-choice') {
        const answer = answers.find(a => a.questionId === q.id);
        if (answer && q.options) {
          const idx = q.options.indexOf(answer.value as string);
          if (idx >= 0 && catData[q.category]) {
            catData[q.category].total += Math.round(((idx + 1) / q.options.length) * 10);
            catData[q.category].count += 1;
          }
        }
      }
    }
    const cats = Object.entries(catData)
      .filter(([, d]) => d.count > 0)
      .map(([category, d]) => ({
        category,
        score: Math.round((d.total / d.count) * 10) / 10,
        percentage: Math.round((d.total / d.count / 10) * 100),
      }));
    const avg = cats.length > 0 ? Math.round(cats.reduce((s, c) => s + c.percentage, 0) / cats.length) : 0;
    return { roleId: role.id, roleTitle: role.title, categories: cats, overallPercentage: avg };
  });
}

/** Erzeugt kategoriespezifische Analysetexte */
export function getCategoryAnalysis(scores: CategoryScore[]): { category: string; text: string }[] {
  const texts: Record<string, (pct: number) => string> = {
    'Vision & Strategie': (p) => p >= 70
      ? `Die Vision und strategische Ausrichtung sind mit ${p}% gut verankert. Die Führungskräfte zeigen ein gemeinsames Verständnis der strategischen Ziele. Empfehlung: Regelmäßige Reflexionszyklen beibehalten und strategische Ziele in operative KPIs übersetzen.`
      : `Mit ${p}% besteht bei Vision und Strategie deutlicher Handlungsbedarf. Die strategischen Ziele sind nicht hinreichend klar definiert oder werden nicht durchgängig kommuniziert. Die Diskrepanz zwischen strategischem Anspruch und operativer Realität muss durch strukturierte Leitbild-Workshops und ein systematisches Strategy Deployment geschlossen werden.`,
    'Führung & Organisation': (p) => p >= 70
      ? `Führung und Organisation erreichen ${p}% — die Regelkommunikation funktioniert und Verantwortlichkeiten sind klar. Die Führungskräfte bewerten die Kommunikationsqualität als dokumentiert und ergebnisorientiert.`
      : `Der Bereich Führung und Organisation liegt bei ${p}%. Die Regelkommunikation findet statt, erreicht aber nicht die gewünschte Durchdringung. Informationskaskaden von der Führungsebene in operative Teams müssen beschleunigt und mit dokumentierten Ergebnissen versehen werden.`,
    'Controlling & Performance': (p) => p >= 70
      ? `Das Controlling ist mit ${p}% auf einem guten Niveau. Veränderungsmaßnahmen werden systematisch nachverfolgt und zeigen messbare Wirkung.`
      : `Controlling & Performance erreicht nur ${p}%. Qualitatives und quantitatives Controlling sind nicht ausreichend verzahnt. Es fehlen einheitliche KPI-Definitionen über Abteilungen hinweg und ein zentrales Dashboard zur Steuerung.`,
    'Werte & Kultur': (p) => p >= 70
      ? `Die Unternehmenskultur zeigt mit ${p}% eine starke Verankerung der definierten Werte. Die Kultur wird als veränderungsunterstützend wahrgenommen.`
      : `Mit ${p}% im Bereich Werte & Kultur werden die definierten Werte nicht konsequent gelebt. Es besteht eine Diskrepanz zwischen Leitbild und gelebter Praxis, die durch gezielte Werte-Workshops und verbale/nonverbale Kommunikation des Leitbildes adressiert werden sollte.`,
    'Prozesse & Qualität': (p) => p >= 70
      ? `Prozesse und Qualitätsmanagement erreichen ${p}%. Kernprozesse sind definiert, dokumentiert und werden regelmäßig überprüft.`
      : `Der Bereich Prozesse & Qualität liegt bei ${p}%. Prozesse existieren, werden aber nicht konsequent gelebt. Die Standardisierung ist unzureichend — Kunden erhalten je nach Mitarbeiter unterschiedliche Qualitätsniveaus. Eine Prozesslandkarte mit Checklisten für alle Kernprozesse ist dringend erforderlich.`,
    'Innovation & Zukunft': (p) => p >= 70
      ? `Innovation und Zukunftsthemen werden mit ${p}% systematisch vorangetrieben. Es existieren definierte Prozesse und Budgets für Innovationsprojekte.`
      : `Mit nur ${p}% besteht im Bereich Innovation erheblicher Nachholbedarf. Zukunftsthemen werden nicht systematisch identifiziert und verfolgt. Es fehlen ein dediziertes Innovationsbudget und eine klare Priorisierung von Digitalisierungs- und Zukunftsinitiativen.`,
    'Markt & Wettbewerb': (p) => p >= 70
      ? `Die Markt- und Wettbewerbskenntnis liegt bei ${p}%. Das Unternehmen verfügt über fundierte Analysen der Wettbewerbslandschaft.`
      : `Markt & Wettbewerb erreicht ${p}%. Die Wettbewerbsbeobachtung findet nicht systematisch statt. Die Differenzierung im Markt ist unklar, und Preis-/Vertriebsstrategien werden nicht regelmäßig an Marktbedingungen angepasst.`,
    'Vertrieb & Umsatz': (p) => p >= 70
      ? `Der Vertrieb zeigt mit ${p}% eine solide Verkaufsorientierung. USPs werden kommuniziert und der Sales-Funnel ist strukturiert.`
      : `Vertrieb & Umsatz liegt bei ${p}%. Die Verkaufsorientierung ist nicht durchgängig im Unternehmen verankert. Nicht alle Mitarbeiter kennen die zentralen Verkaufsargumente. Die Verknüpfung zwischen Marketing-generierten Leads und Vertriebsabschlüssen muss verbessert werden.`,
    'Kundenorientierung': (p) => p >= 70
      ? `Die Kundenorientierung erreicht ${p}%. Magic Moments werden bewusst gestaltet und der Kundendialog findet proaktiv statt.`
      : `Mit ${p}% ist die Kundenorientierung ausbaufähig. Magic Moments werden nicht systematisch geschaffen, der Kundendialog ist eher reaktiv. Die Servicequalität variiert je nach Mitarbeiter — ein einheitliches Customer Experience Design fehlt.`,
    'Personal & Ressourcen': (p) => p >= 70
      ? `Personal und Ressourcen werden mit ${p}% gut gemanagt. Schlüsselpositionen sind besetzt, Entwicklungsprogramme greifen.`
      : `Personal & Ressourcen erreicht nur ${p}%. Personelle Engpässe werden deutlich spürbar: Schlüsselpositionen sind schwer zu besetzen, die Fluktuation im Junior-Bereich ist bedenklich. Systematische Personalentwicklungspläne und ein strukturiertes Mitarbeiter-Feedbacksystem (SEP) sind dringend notwendig.`,
  };

  return scores.map(s => ({
    category: s.category,
    text: (texts[s.category] || (() => `${s.category}: ${s.percentage}%`))(s.percentage),
  }));
}

export function generateRecommendations(scores: CategoryScore[]): string[] {
  const recs: string[] = [];
  const weaknesses = getWeaknesses(scores);

  const recMap: Record<string, string[]> = {
    'Vision & Strategie': [
      'Leitbild-Workshop mit allen Führungsebenen durchführen — Vision/Mission nach dem EFQM-Modell reflektieren und aktualisieren',
      'Strategische Ziele in messbare KPIs übersetzen und Quartalsmeetings zur Reflexion etablieren (Adlermodell)',
    ],
    'Führung & Organisation': [
      'Führungskräfte-Entwicklungsprogramm initiieren — idealerweise mit INSIGHTS MDI®-Profiling für das gesamte Führungsteam',
      'Regelkommunikation mit dokumentierten Ergebnissen, Protokollen und To-Do-Listen etablieren',
    ],
    'Controlling & Performance': [
      'Zentrales Dashboard-System für qualitatives und quantitatives Controlling implementieren',
      'Monatliches Performance-Review mit klaren Verantwortlichkeiten und Eskalationspfaden einführen',
    ],
    'Werte & Kultur': [
      'Werte-Workshops durchführen — verbale und nonverbale Kommunikation des Leitbildes an allen Touchpoints stärken',
      'Regelmäßige Reflexion der Vision/Mission in allen Unternehmensbereichen verankern (Was spricht für/gegen die Vision?)',
    ],
    'Prozesse & Qualität': [
      'Prozesslandkarte erstellen und Checklisten für Kernprozesse entwickeln — Ziel: gleiche Qualität unabhängig vom Mitarbeiter',
      'Qualitätsstandards operationalisieren und durch interne Audits regelmäßig überprüfen',
    ],
    'Innovation & Zukunft': [
      'Innovationsbudget definieren und Zukunftsthemen systematisch in die Strategieplanung integrieren',
      'Digitalisierungs-Roadmap mit klaren Meilensteinen und Verantwortlichkeiten aufsetzen',
    ],
    'Markt & Wettbewerb': [
      'Systematische Wettbewerbsanalyse etablieren — Quartalsweise Updates der Wettbewerbspositionierung',
      'Preis- und Vertriebsstrategie überprüfen und an aktuelle Marktbedingungen anpassen',
    ],
    'Vertrieb & Umsatz': [
      'Vertriebsschulungen für alle kundennahen Mitarbeiter durchführen — USP-Kommunikation unternehmensweit sicherstellen',
      'Sales-Funnel-Management professionalisieren und CRM-Nutzung standardisieren',
    ],
    'Kundenorientierung': [
      'Magic-Moments-Programm für alle Kundenkontaktpunkte entwickeln und implementieren',
      'Aktiven Kundendialog mit systematischem NPS-/Feedback-Prozess aufbauen',
    ],
    'Personal & Ressourcen': [
      'Personalentwicklungsplan für alle Schlüsselpositionen erstellen — INSIGHTS MDI® für Potenzialanalyse nutzen',
      'Mitarbeiter-Feedbacksystem (SEP) implementieren, Mentoring-Programm ausbauen und Employer Branding stärken',
    ],
  };

  for (const w of weaknesses) {
    const catRecs = recMap[w.category];
    if (catRecs) {
      recs.push(...catRecs);
    }
  }

  return recs;
}

export function getMaturityLevel(percentage: number): { level: string; color: string; description: string } {
  if (percentage >= 85) return { level: 'Exzellent', color: '#0d7377', description: 'Das Unternehmen zeigt herausragende Reife in diesem Bereich.' };
  if (percentage >= 70) return { level: 'Fortgeschritten', color: '#2d9ea2', description: 'Gute Basis vorhanden, gezielte Optimierung empfohlen.' };
  if (percentage >= 50) return { level: 'Entwickelt', color: '#e8a838', description: 'Grundstrukturen vorhanden, systematische Weiterentwicklung notwendig.' };
  if (percentage >= 30) return { level: 'Aufbauend', color: '#e07c3a', description: 'Erste Ansätze erkennbar, erheblicher Handlungsbedarf.' };
  return { level: 'Initial', color: '#c44b4b', description: 'Kritischer Handlungsbedarf, grundlegende Strukturen fehlen.' };
}
