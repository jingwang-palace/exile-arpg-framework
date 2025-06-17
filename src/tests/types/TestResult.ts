export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
  details?: {
    [key: string]: any;
  };
} 