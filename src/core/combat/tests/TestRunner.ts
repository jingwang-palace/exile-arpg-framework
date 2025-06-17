import { EventBus } from '../../../infrastructure/events/EventBus';
import { CombatSystem } from '../CombatSystem';
import { TestDataGenerator } from './CombatSystemTest';

/**
 * 测试结果接口
 */
interface ITestResult {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  analysis?: string;
  duration: number;
}

/**
 * 测试运行器
 * 用于运行和管理测试用例
 */
export class TestRunner {
  private eventBus: EventBus;
  private combatSystem: CombatSystem;
  private results: Map<string, ITestResult[]>;
  private baselineResults: Map<string, any>;

  constructor() {
    this.eventBus = new EventBus();
    this.combatSystem = new CombatSystem(this.eventBus);
    this.results = new Map();
    this.baselineResults = new Map();
  }

  /**
   * 运行所有测试
   */
  public async runAllTests(): Promise<void> {
    console.log('开始运行测试...\n');

    // 运行伤害计算测试
    await this.runDamageTests();
    
    // 运行状态效果测试
    await this.runStatusEffectTests();
    
    // 运行集成测试
    await this.runIntegrationTests();
    
    // 运行性能测试
    await this.runPerformanceTests();

    // 输出测试报告
    this.generateReport();
  }

  /**
   * 运行伤害计算测试
   */
  private async runDamageTests(): Promise<void> {
    console.log('运行伤害计算测试...');
    const player = TestDataGenerator.createTestEntity('player1');
    const enemy = TestDataGenerator.createTestEntity('enemy1');

    // 基础伤害测试
    const damage = TestDataGenerator.createTestDamage(player, enemy);
    const result = this.combatSystem.getDamageCalculator().calculateDamage(damage);
    
    this.recordResult('基础伤害', {
      expected: { finalAmount: 100, isCritical: false },
      actual: { finalAmount: result.finalAmount, isCritical: result.isCritical }
    });

    // 暴击伤害测试
    const criticalDamage = TestDataGenerator.createTestDamage(player, enemy, {
      critical: true,
      criticalMultiplier: 2.0
    });
    const criticalResult = this.combatSystem.getDamageCalculator().calculateDamage(criticalDamage);
    
    this.recordResult('暴击伤害', {
      expected: { finalAmount: 200, isCritical: true },
      actual: { finalAmount: criticalResult.finalAmount, isCritical: criticalResult.isCritical }
    });

    // 更多伤害测试...
  }

  /**
   * 运行状态效果测试
   */
  private async runStatusEffectTests(): Promise<void> {
    console.log('运行状态效果测试...');
    const player = TestDataGenerator.createTestEntity('player1');
    const enemy = TestDataGenerator.createTestEntity('enemy1');

    // 状态效果应用测试
    const effect = TestDataGenerator.createTestStatusEffect(player, enemy);
    this.combatSystem.getStatusEffectManager().applyEffect(effect);
    
    const targetEffects = this.combatSystem.getStatusEffectManager().getTargetEffects(enemy);
    this.recordResult('状态效果应用', {
      expected: { count: 1, id: effect.id },
      actual: { count: targetEffects.length, id: targetEffects[0]?.effect.id }
    });

    // 更多状态效果测试...
  }

  /**
   * 运行集成测试
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('运行集成测试...');
    // 实现集成测试...
  }

  /**
   * 运行性能测试
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('运行性能测试...');
    // 实现性能测试...
  }

  /**
   * 记录测试结果
   * @param testName 测试名称
   * @param data 测试数据
   */
  private recordResult(testName: string, data: { expected: any; actual: any }): void {
    const result: ITestResult = {
      name: testName,
      passed: this.compareResults(data.expected, data.actual),
      expected: data.expected,
      actual: data.actual,
      analysis: this.analyzeDifference(data.expected, data.actual),
      duration: 0 // TODO: 实现测试持续时间记录
    };

    if (!this.results.has(testName)) {
      this.results.set(testName, []);
    }
    this.results.get(testName)!.push(result);
  }

  /**
   * 比较测试结果
   * @param expected 预期结果
   * @param actual 实际结果
   */
  private compareResults(expected: any, actual: any): boolean {
    if (typeof expected !== typeof actual) return false;
    
    if (typeof expected === 'object') {
      return JSON.stringify(expected) === JSON.stringify(actual);
    }
    
    return expected === actual;
  }

  /**
   * 分析结果差异
   * @param expected 预期结果
   * @param actual 实际结果
   */
  private analyzeDifference(expected: any, actual: any): string {
    const analysis: string[] = [];

    if (typeof expected === 'object') {
      Object.keys(expected).forEach(key => {
        if (expected[key] !== actual[key]) {
          analysis.push(`${key}: 预期 ${expected[key]}, 实际 ${actual[key]}`);
        }
      });
    } else if (expected !== actual) {
      analysis.push(`预期 ${expected}, 实际 ${actual}`);
    }

    return analysis.join('\n');
  }

  /**
   * 生成测试报告
   */
  private generateReport(): void {
    console.log('\n测试报告:');
    console.log('==========');

    let totalTests = 0;
    let passedTests = 0;

    this.results.forEach((results, category) => {
      console.log(`\n${category}:`);
      results.forEach(result => {
        totalTests++;
        if (result.passed) passedTests++;

        console.log(`  ${result.name}: ${result.passed ? '通过' : '失败'}`);
        if (!result.passed) {
          console.log('    差异分析:');
          console.log(`    ${result.analysis}`);
        }
      });
    });

    console.log('\n总结:');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过数: ${passedTests}`);
    console.log(`失败数: ${totalTests - passedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  }

  /**
   * 保存基准测试结果
   */
  public saveBaseline(): void {
    this.results.forEach((results, category) => {
      this.baselineResults.set(category, results);
    });
  }

  /**
   * 比较当前结果与基准结果
   */
  public compareWithBaseline(): void {
    console.log('\n与基准测试比较:');
    console.log('===============');

    this.results.forEach((results, category) => {
      const baseline = this.baselineResults.get(category);
      if (!baseline) {
        console.log(`\n${category}: 无基准数据`);
        return;
      }

      console.log(`\n${category}:`);
      results.forEach((result, index) => {
        const baselineResult = baseline[index];
        if (result.passed !== baselineResult.passed) {
          console.log(`  ${result.name}: 结果与基准不一致`);
          console.log('    基准结果:', baselineResult.actual);
          console.log('    当前结果:', result.actual);
        }
      });
    });
  }
} 