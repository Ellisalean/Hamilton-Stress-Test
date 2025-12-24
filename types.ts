export type OptionValue = 1 | 2 | 3 | 4;

export interface Question {
  id: number;
  text: string;
  isReverse: boolean; // If true, scoring is R=4, A=3, M=2, S=1
}

export interface TestResult {
  score: number;
  category: string;
  timestamp: string;
  answers: Record<number, number>;
}

export type TestStep = 'intro' | 'test' | 'results';

export interface SupabaseConfig {
  url: string;
  key: string;
}