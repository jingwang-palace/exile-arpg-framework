export interface TestResult {
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
} 