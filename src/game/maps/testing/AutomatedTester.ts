import { DungeonMap } from '../DungeonMap';
import { TestCaseManager, TestCategory, TestResult } from './TestCases';
import { MapValidator, ValidationResult } from '../validation/MapValidator';

export interface AutomatedTestResult {
  timestamp: number;
  mapId: string;
  validationResult: ValidationResult;
  testResults: Map<string, TestResult>;
  performance: {
    validationTime: number;
    testTime: number;
    totalTime: number;
  };
}

export interface TestReport {
  mapId: string;
  timestamp: number;
  passed: boolean;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    categories: {
      [key in TestCategory]: {
        total: number;
        passed: number;
        failed: number;
      };
    };
  };
  details: {
    validation: ValidationResult;
    tests: Map<string, TestResult>;
  };
  performance: {
    validationTime: number;
    testTime: number;
    totalTime: number;
  };
}

export class AutomatedTester {
  private testCaseManager: TestCaseManager;
  private results: AutomatedTestResult[];

  constructor() {
    this.testCaseManager = new TestCaseManager();
    this.results = [];
  }

  // 运行自动化测试
  async runAutomatedTests(map: DungeonMap): Promise<TestReport> {
    const startTime = performance.now();

    // 运行验证
    const validationStartTime = performance.now();
    const validator = new MapValidator(map);
    const validationResult = validator.validate();
    const validationTime = performance.now() - validationStartTime;

    // 运行测试
    const testStartTime = performance.now();
    const testResults = this.testCaseManager.runAllTests(map);
    const testTime = performance.now() - testStartTime;

    // 计算总时间
    const totalTime = performance.now() - startTime;

    // 创建测试结果
    const result: AutomatedTestResult = {
      timestamp: Date.now(),
      mapId: map.id,
      validationResult,
      testResults,
      performance: {
        validationTime,
        testTime,
        totalTime
      }
    };

    // 保存结果
    this.results.push(result);

    // 生成报告
    return this.generateReport(result);
  }

  // 运行批量测试
  async runBatchTests(maps: DungeonMap[]): Promise<TestReport[]> {
    const reports: TestReport[] = [];

    for (const map of maps) {
      const report = await this.runAutomatedTests(map);
      reports.push(report);
    }

    return reports;
  }

  // 运行定时测试
  async runScheduledTests(
    map: DungeonMap,
    interval: number,
    duration: number
  ): Promise<TestReport[]> {
    const reports: TestReport[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      const report = await this.runAutomatedTests(map);
      reports.push(report);
      await this.sleep(interval);
    }

    return reports;
  }

  // 获取测试历史
  getTestHistory(): AutomatedTestResult[] {
    return this.results;
  }

  // 获取最新的测试结果
  getLatestResult(): AutomatedTestResult | null {
    return this.results.length > 0 ? this.results[this.results.length - 1] : null;
  }

  // 获取测试统计
  getTestStatistics(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageValidationTime: number;
    averageTestTime: number;
    averageTotalTime: number;
  } {
    if (this.results.length === 0) {
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        averageValidationTime: 0,
        averageTestTime: 0,
        averageTotalTime: 0
      };
    }

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalValidationTime = 0;
    let totalTestTime = 0;
    let totalTime = 0;

    this.results.forEach(result => {
      result.testResults.forEach(testResult => {
        totalTests++;
        if (testResult.passed) {
          passedTests++;
        } else {
          failedTests++;
        }
      });

      totalValidationTime += result.performance.validationTime;
      totalTestTime += result.performance.testTime;
      totalTime += result.performance.totalTime;
    });

    const count = this.results.length;
    return {
      totalTests,
      passedTests,
      failedTests,
      averageValidationTime: totalValidationTime / count,
      averageTestTime: totalTestTime / count,
      averageTotalTime: totalTime / count
    };
  }

  // 生成测试报告
  private generateReport(result: AutomatedTestResult): TestReport {
    const testResults = result.testResults;
    const categories: { [key in TestCategory]: { total: number; passed: number; failed: number } } = {
      [TestCategory.VALIDATION]: { total: 0, passed: 0, failed: 0 },
      [TestCategory.BALANCE]: { total: 0, passed: 0, failed: 0 },
      [TestCategory.GAMEPLAY]: { total: 0, passed: 0, failed: 0 },
      [TestCategory.PERFORMANCE]: { total: 0, passed: 0, failed: 0 },
      [TestCategory.SECURITY]: { total: 0, passed: 0, failed: 0 }
    };

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    testResults.forEach((testResult, testName) => {
      const testCase = this.testCaseManager.getAllTestCases().find(t => t.name === testName);
      if (testCase) {
        const category = testCase.category;
        categories[category].total++;
        if (testResult.passed) {
          categories[category].passed++;
          passedTests++;
        } else {
          categories[category].failed++;
          failedTests++;
        }
        totalTests++;
      }
    });

    return {
      mapId: result.mapId,
      timestamp: result.timestamp,
      passed: result.validationResult.isValid && failedTests === 0,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        categories
      },
      details: {
        validation: result.validationResult,
        tests: testResults
      },
      performance: result.performance
    };
  }

  // 辅助方法：延时
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 