interface LandingProps {
  onStart: () => void;
  onLoadDemo: () => void;
}

export default function Landing({ onStart, onLoadDemo }: LandingProps) {
  return (
    <div className="landing">
      <img src="/cic-logo.jpg" alt="CIC Consulting" className="landing-logo fade-in" />
      <h1 className="fade-in">
        Management <span>Assessment</span>
        <br />& Report Builder
      </h1>
      <p className="landing-subtitle fade-in">
        Strukturierte Analyse Ihres Unternehmens auf allen Führungsebenen.
        Automatische Generierung professioneller Management-Reports und Consulting-Slides.
      </p>

      <div className="landing-features fade-in">
        <div className="landing-feature">
          <div className="landing-feature-icon">📋</div>
          <h3>Strategie-Check</h3>
          <p>Strukturierte Fragen an alle Führungsebenen</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">📊</div>
          <h3>Analyse</h3>
          <p>Automatische Auswertung nach Kategorien</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">📄</div>
          <h3>Report</h3>
          <p>Professioneller Management-Report</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">🎯</div>
          <h3>Slides</h3>
          <p>Consulting-Slides im Beratungsstil</p>
        </div>
      </div>

      <div className="fade-in" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onStart}>
          Assessment starten
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onLoadDemo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Demo laden
        </button>
      </div>
    </div>
  );
}
