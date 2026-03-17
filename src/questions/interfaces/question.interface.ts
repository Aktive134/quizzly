export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
