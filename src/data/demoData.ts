import type { Answer } from '../types';

export const demoCompany = {
  name: 'Müller & Partner GmbH',
  industry: 'Dienstleistung',
  employees: '51-200',
};

export const demoAnswers: Answer[] = [
  // ═══════════════════════════════════
  // CEO — Geschäftsführung
  // ═══════════════════════════════════

  // Vision & Strategie
  { questionId: 'ceo-1', roleId: 'ceo', value: 7 },
  { questionId: 'ceo-2', roleId: 'ceo', value: 6 },

  // Führung & Organisation
  { questionId: 'ceo-3', roleId: 'ceo', value: 'Regelmäßig mit dokumentierten Ergebnissen' },
  { questionId: 'ceo-4', roleId: 'ceo', value: 7 },

  // Controlling & Performance
  { questionId: 'ceo-5', roleId: 'ceo', value: 5 },
  { questionId: 'ceo-6', roleId: 'ceo', value: 'Die größte Herausforderung war die Integration zweier neuer Geschäftsbereiche bei gleichzeitiger Aufrechterhaltung der Servicequalität. Zudem hat uns die Digitalisierung interner Prozesse stark beschäftigt — hier sind wir noch nicht dort, wo wir sein wollen. Das Controlling der neuen Bereiche war anfangs lückenhaft, da Kennzahlen nicht einheitlich definiert waren. Mittlerweile haben wir ein monatliches Reporting etabliert, allerdings fehlt noch die Integration in ein zentrales Dashboard.' },

  // Werte & Kultur
  { questionId: 'ceo-7', roleId: 'ceo', value: 8 },
  { questionId: 'ceo-8', roleId: 'ceo', value: 'Die Kommunikation zwischen den Abteilungen ist ein Schlüsselproblem. Informationen fließen zu langsam von der Führungsebene in die operativen Teams. Außerdem fehlt ein einheitliches Verständnis der strategischen Prioritäten bei den Teamleitern. Ein zweites Schlüsselproblem ist die mangelnde Standardisierung in der Projektabwicklung — je nach Berater unterscheidet sich die Qualität der Deliverables erheblich.' },

  // Kundenorientierung
  { questionId: 'ceo-9', roleId: 'ceo', value: 7 },

  // Personal & Ressourcen
  { questionId: 'ceo-10', roleId: 'ceo', value: 5 },

  // Prozesse & Qualität
  { questionId: 'ceo-11', roleId: 'ceo', value: 'Prozesse sind aktuell und werden regelmäßig überprüft' },

  // Innovation & Zukunft
  { questionId: 'ceo-12', roleId: 'ceo', value: 'Wir haben in ein neues CRM-System investiert und die ersten Module für digitale Beratungsformate entwickelt. Die Einführung eines Wissensmanagement-Tools ist geplant, wurde aber aufgrund fehlender Kapazitäten verschoben. Im Bereich KI haben wir ein Pilotprojekt zur automatisierten Report-Erstellung gestartet — die ersten Ergebnisse sind vielversprechend, aber noch nicht produktionsreif.' },

  // ═══════════════════════════════════
  // HEAD OF STRATEGY
  // ═══════════════════════════════════

  // Vision & Strategie
  { questionId: 'str-1', roleId: 'strategy', value: 6 },
  { questionId: 'str-2', roleId: 'strategy', value: 'Die Neupositionierung im B2B-Segment hat die größte Wirkung erzielt. Durch die Fokussierung auf drei Kernbranchen — Gesundheitswesen, Fertigung und Professional Services — konnten wir unsere Abschlussquote um 15% steigern. Auch der Aufbau des digitalen Beratungsangebots war ein wichtiger Meilenstein. Weniger erfolgreich war der Versuch, im öffentlichen Sektor Fuß zu fassen — die langen Entscheidungszyklen passen nicht zu unserem Modell.' },

  // Prozesse & Qualität
  { questionId: 'str-3', roleId: 'strategy', value: 5 },
  { questionId: 'str-4', roleId: 'strategy', value: 'Definiert – Prozesse existieren, werden aber nicht konsequent gelebt' },

  // Innovation & Zukunft
  { questionId: 'str-5', roleId: 'strategy', value: 4 },
  { questionId: 'str-6', roleId: 'strategy', value: 'KI-gestützte Beratungstools müssen weiter vorangetrieben werden — insbesondere automatisierte Analysen und Report-Generierung. Außerdem steht die Internationalisierung in den DACH-Raum auf der Agenda, beginnend mit Österreich ab Q3. Ein weiteres Zukunftsthema ist die Entwicklung von Subscription-Modellen für wiederkehrende Beratungsleistungen, um die Revenue-Predictability zu erhöhen. Schließlich müssen wir ESG-Beratung als eigenständiges Produktangebot aufbauen.' },

  // Markt & Wettbewerb
  { questionId: 'str-7', roleId: 'strategy', value: 6 },
  { questionId: 'str-8', roleId: 'strategy', value: 'Die strategische Ausrichtung ist zu breit gefächert. Wir müssen unsere Kernkompetenzen schärfer definieren und uns auf weniger, dafür profitablere Geschäftsfelder konzentrieren. Die Verknüpfung zwischen Strategie und operativer Umsetzung muss deutlich verbessert werden — es fehlt ein systematisches Strategy Deployment. Außerdem reagieren wir zu langsam auf Marktveränderungen, weil das strategische Monitoring nicht institutionalisiert ist.' },

  // Führung & Organisation
  { questionId: 'str-9', roleId: 'strategy', value: 5 },

  // Controlling & Performance
  { questionId: 'str-10', roleId: 'strategy', value: 4 },

  // Werte & Kultur
  { questionId: 'str-11', roleId: 'strategy', value: 6 },

  // Vertrieb & Umsatz
  { questionId: 'str-12', roleId: 'strategy', value: 5 },

  // ═══════════════════════════════════
  // HEAD OF SALES
  // ═══════════════════════════════════

  // Vertrieb & Umsatz
  { questionId: 'sal-1', roleId: 'sales', value: 6 },
  { questionId: 'sal-2', roleId: 'sales', value: 'Teilweise – Kernbotschaften sind bekannt' },
  { questionId: 'sal-3', roleId: 'sales', value: 'Wir haben im letzten Jahr einen strukturierten Sales-Funnel implementiert und unsere Online-Präsenz deutlich ausgebaut. Durch gezielte LinkedIn-Kampagnen konnten wir die Lead-Generierung um 30% steigern. Die Teilnahme an drei Branchenmessen (Zukunft Personal, DMEA, Hannover Messe) hat zusätzlich zur Sichtbarkeit beigetragen. Unser neues Webinar-Format „Management Impulse" läuft vielversprechend mit durchschnittlich 45 Teilnehmern pro Session. Der Aufbau eines Referenzkundenprogramms ist im Gange, aber noch nicht abgeschlossen.' },

  // Kundenorientierung
  { questionId: 'sal-4', roleId: 'sales', value: 5 },
  { questionId: 'sal-5', roleId: 'sales', value: 6 },
  { questionId: 'sal-6', roleId: 'sales', value: 6 },

  // Personal & Ressourcen
  { questionId: 'sal-7', roleId: 'sales', value: 4 },
  { questionId: 'sal-8', roleId: 'sales', value: 'Zwei Senior-Berater haben an einem externen Führungskräfte-Entwicklungsprogramm teilgenommen und setzen die Erkenntnisse bereits in der Teamführung um. Wir haben ein Mentoring-System für Junior-Berater eingeführt, das gut angenommen wird — die Einarbeitungszeit konnte um ca. 3 Monate verkürzt werden. Die Personaldecke ist allerdings zu dünn: Wir bräuchten mindestens zwei weitere erfahrene Vertriebsberater und einen Pre-Sales-Spezialisten, um das angestrebte Wachstum von 20% zu stemmen. Die Fluktuation im Junior-Bereich (2 Abgänge in 12 Monaten) ist besorgniserregend.' },

  // Markt & Wettbewerb
  { questionId: 'sal-9', roleId: 'sales', value: 5 },

  // Controlling & Performance
  { questionId: 'sal-10', roleId: 'sales', value: 5 },

  // Vision & Strategie
  { questionId: 'sal-11', roleId: 'sales', value: 6 },

  // Führung & Organisation
  { questionId: 'sal-12', roleId: 'sales', value: 'Die Schnittstelle zum Marketing funktioniert mittlerweile gut — seit der Einführung wöchentlicher Abstimmungen gibt es deutlich weniger Reibungsverluste. Problematisch ist nach wie vor die Zusammenarbeit mit der Delivery-Abteilung: Kundenfeedback aus dem Vertrieb kommt zu spät beim Projektteam an, und umgekehrt erfahren wir oft erst verspätet von Projektproblemen, die dann zu schwierigen Kundengesprächen führen. Die Zusammenarbeit mit der Strategieabteilung müsste enger werden — Marktinformationen aus dem Vertrieb fließen nicht systematisch in die Strategieentwicklung ein.' },
];
