export type QuestionType = 'scale' | 'multiple-choice' | 'open';

export interface Question {
  id: string;
  category: string;
  text: string;
  type: QuestionType;
  options?: string[];
  scaleLabels?: { min: string; max: string };
}

export interface Role {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  roleId: string;
  value: string | number;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export type AppStep = 'landing' | 'company-setup' | 'role-select' | 'questionnaire' | 'report' | 'slides';
