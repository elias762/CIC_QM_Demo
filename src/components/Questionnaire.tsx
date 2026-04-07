import { useState } from 'react';
import type { Role, Answer, Question } from '../types';
import { demoAnswers } from '../data/demoData';

interface QuestionnaireProps {
  role: Role;
  answers: Answer[];
  onAnswer: (questionId: string, roleId: string, value: string | number) => void;
  onComplete: (roleId: string) => void;
  onBack: () => void;
}

function ScaleInput({ question, value, onChange }: { question: Question; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="scale-input">
      <div className="scale-labels">
        <span>{question.scaleLabels?.min || '1'}</span>
        <span>{question.scaleLabels?.max || '10'}</span>
      </div>
      <div className="scale-buttons">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`scale-btn ${value === n ? 'selected' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultipleChoice({ question, value, onChange }: { question: Question; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="mc-options">
      {question.options?.map(option => (
        <div
          key={option}
          className={`mc-option ${value === option ? 'selected' : ''}`}
          onClick={() => onChange(option)}
        >
          <div className="mc-radio">
            <div className="mc-radio-inner" />
          </div>
          {option}
        </div>
      ))}
    </div>
  );
}

function OpenQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="form-textarea"
      placeholder="Ihre Antwort..."
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

export default function Questionnaire({ role, answers, onAnswer, onComplete, onBack }: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = role.questions[currentIndex];
  const totalQuestions = role.questions.length;

  const currentAnswer = answers.find(a => a.questionId === question.id);
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(role.id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const loadDemoForRole = () => {
    const roleAnswers = demoAnswers.filter(a => a.roleId === role.id);
    for (const a of roleAnswers) {
      onAnswer(a.questionId, a.roleId, a.value);
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasAnswer = currentAnswer !== undefined;

  return (
    <div className="questionnaire-container fade-in">
      <div className="questionnaire-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="questionnaire-role">
            <span className="questionnaire-role-icon">{role.icon}</span>
            <h2>{role.title}</h2>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadDemoForRole}
            style={{ fontSize: 12, color: 'var(--cic-teal)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Demo-Antworten laden
          </button>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-label">
          <span>Frage {currentIndex + 1} von {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="question-card" key={question.id}>
        <span className="question-category">{question.category}</span>
        <div className="question-text">{question.text}</div>

        {question.type === 'scale' && (
          <ScaleInput
            question={question}
            value={typeof currentAnswer?.value === 'number' ? currentAnswer.value : undefined}
            onChange={v => onAnswer(question.id, role.id, v)}
          />
        )}

        {question.type === 'multiple-choice' && (
          <MultipleChoice
            question={question}
            value={typeof currentAnswer?.value === 'string' ? currentAnswer.value : undefined}
            onChange={v => onAnswer(question.id, role.id, v)}
          />
        )}

        {question.type === 'open' && (
          <OpenQuestion
            value={typeof currentAnswer?.value === 'string' ? currentAnswer.value : ''}
            onChange={v => onAnswer(question.id, role.id, v)}
          />
        )}
      </div>

      <div className="nav-buttons">
        <button className="btn btn-ghost" onClick={currentIndex === 0 ? onBack : handlePrev}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {currentIndex === 0 ? 'Zurück zur Rollenauswahl' : 'Vorherige Frage'}
        </button>
        <button
          className={`btn ${isLastQuestion ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleNext}
          style={{ opacity: hasAnswer || question.type === 'open' ? 1 : 0.5 }}
        >
          {isLastQuestion ? 'Rolle abschließen' : 'Nächste Frage'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
