import { CoreSystemTest } from './CoreSystemTest';
import { GameSystemTest } from './GameSystemTest';
import { TestReportGenerator } from './TestReportGenerator';
import { TestResult } from './types/TestResult';

export class TestRunner {
  private reportGenerator: TestReportGenerator;

  constructor() {
    this.reportGenerator = new TestReportGenerator();
  }

  async runAllTests(): Promise<void> {
    try {
      console.log('开始运行所有测试...\n');

      // 运行核心系统测试
      console.log('运行核心系统测试...');
      const coreTest = new CoreSystemTest();
      const coreResults = await coreTest.runTests();
      coreResults.forEach(result => this.reportGenerator.addResult(result));

      // 运行游戏系统测试
      console.log('运行游戏系统测试...');
      const gameTest = new GameSystemTest();
      const gameResults = await gameTest.runTests();
      gameResults.forEach(result => this.reportGenerator.addResult(result));

      // 生成测试报告
      this.reportGenerator.generateReport();

      console.log('\n所有测试完成！');
    } catch (error) {
      console.error('测试运行过程中发生错误:', error);
      throw error;
    }
  }

  async runSpecificTest(testName: string): Promise<void> {
    try {
      console.log(`开始运行测试: ${testName}\n`);

      let results: TestResult[] = [];

      switch (testName.toLowerCase()) {
        case 'core':
          const coreTest = new CoreSystemTest();
          results = await coreTest.runTests();
          break;
        case 'game':
          const gameTest = new GameSystemTest();
          results = await gameTest.runTests();
          break;
        default:
          throw new Error(`未知的测试类型: ${testName}`);
      }

      results.forEach(result => this.reportGenerator.addResult(result));
      this.reportGenerator.generateReport();

      console.log(`\n${testName} 测试完成！`);
    } catch (error) {
      console.error(`运行 ${testName} 测试时发生错误:`, error);
      throw error;
    }
  }
} 