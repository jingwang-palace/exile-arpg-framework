import { TestResult } from './types/TestResult.js';

export class TestReporter {
  private results: TestResult[];

  constructor() {
    this.results = [];
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  generateReport(): void {
    console.log('\n=== 测试报告 ===\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    this.results.forEach(result => {
      totalTests++;
      if (result.passed) {
        passedTests++;
        console.log(`✅ ${result.name}: 通过`);
      } else {
        failedTests++;
        console.log(`❌ ${result.name}: 失败`);
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n=== 测试统计 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  }
} 