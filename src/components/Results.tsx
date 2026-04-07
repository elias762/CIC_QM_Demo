import { useState, useEffect } from 'react';
import type { Answer, AppStep } from '../types';
import Report from './Report';
import Slides from './Slides';

interface ResultsProps {
  answers: Answer[];
  company: { name: string; industry: string; employees: string };
  currentView: AppStep;
  onSwitchView: (view: AppStep) => void;
}

export default function Results({ answers, company, currentView, onSwitchView }: ResultsProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <div className="loading-text">Report wird generiert...</div>
        <div className="loading-subtext">Analyse der Führungskräfte-Bewertungen</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="view-tabs-wrapper">
        <div className="view-tabs">
          <button
            className={`view-tab ${currentView === 'report' ? 'active' : ''}`}
            onClick={() => onSwitchView('report')}
          >
            Management Report
          </button>
          <button
            className={`view-tab ${currentView === 'slides' ? 'active' : ''}`}
            onClick={() => onSwitchView('slides')}
          >
            Consulting Slides
          </button>
        </div>
      </div>

      {currentView === 'report' && (
        <Report answers={answers} company={company} />
      )}

      {currentView === 'slides' && (
        <Slides answers={answers} company={company} />
      )}
    </div>
  );
}
