import { useState, useCallback } from 'react';
import type { AppStep, Answer } from './types';
import { roles } from './data/questions';
import { demoCompany, demoAnswers } from './data/demoData';
import Landing from './components/Landing';
import CompanySetup from './components/CompanySetup';
import RoleSelect from './components/RoleSelect';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';

interface CompanyInfo {
  name: string;
  industry: string;
  employees: string;
}

const stepLabels: { step: AppStep; label: string }[] = [
  { step: 'landing', label: 'Start' },
  { step: 'company-setup', label: 'Unternehmen' },
  { step: 'role-select', label: 'Rollen' },
  { step: 'questionnaire', label: 'Assessment' },
  { step: 'report', label: 'Report' },
];

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [company, setCompany] = useState<CompanyInfo>({ name: '', industry: '', employees: '' });
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [completedRoles, setCompletedRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const handleAnswer = useCallback((questionId: string, roleId: string, value: string | number) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, roleId, value }];
    });
  }, []);

  const handleCompleteRole = useCallback((roleId: string) => {
    setCompletedRoles(prev => prev.includes(roleId) ? prev : [...prev, roleId]);
    setActiveRole(null);
    setCurrentStep('role-select');
  }, []);

  const handleSelectRole = useCallback((roleId: string) => {
    setActiveRole(roleId);
    setCurrentStep('questionnaire');
  }, []);

  const loadDemo = useCallback(() => {
    setCompany(demoCompany);
    setAnswers(demoAnswers);
    setCompletedRoles(roles.map(r => r.id));
    setCurrentStep('report');
  }, []);

  const allRolesCompleted = completedRoles.length === roles.length;

  const getStepIndex = (step: AppStep) => stepLabels.findIndex(s => s.step === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="app-container">
      {currentStep !== 'landing' && (
        <header className="header">
          <img
            src="/cic-logo.jpg"
            alt="CIC"
            className="header-logo"
            onClick={() => setCurrentStep('landing')}
          />
          <nav className="header-nav">
            {stepLabels.map((s, i) => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  className={`header-step ${
                    currentStep === s.step || (s.step === 'report' && currentStep === 'slides')
                      ? 'active'
                      : i < currentIndex
                        ? 'completed'
                        : ''
                  }`}
                >
                  <span className="header-step-dot" />
                  {s.label}
                </div>
                {i < stepLabels.length - 1 && <div className="header-step-divider" />}
              </div>
            ))}
          </nav>
        </header>
      )}

      {currentStep === 'landing' && (
        <Landing onStart={() => setCurrentStep('company-setup')} onLoadDemo={loadDemo} />
      )}

      {currentStep === 'company-setup' && (
        <CompanySetup
          company={company}
          onChange={setCompany}
          onNext={() => setCurrentStep('role-select')}
        />
      )}

      {currentStep === 'role-select' && (
        <RoleSelect
          completedRoles={completedRoles}
          onSelectRole={handleSelectRole}
          onGenerateReport={() => setCurrentStep('report')}
          allCompleted={allRolesCompleted}
          companyName={company.name}
        />
      )}

      {currentStep === 'questionnaire' && activeRole && (
        <Questionnaire
          role={roles.find(r => r.id === activeRole)!}
          answers={answers}
          onAnswer={handleAnswer}
          onComplete={handleCompleteRole}
          onBack={() => { setActiveRole(null); setCurrentStep('role-select'); }}
        />
      )}

      {(currentStep === 'report' || currentStep === 'slides') && (
        <Results
          answers={answers}
          company={company}
          currentView={currentStep}
          onSwitchView={(view) => setCurrentStep(view)}
        />
      )}
    </div>
  );
}

export default App;
