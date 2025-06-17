import { TestResult } from './types/TestResult';
import fs from 'fs';
import path from 'path';

export class TestReportGenerator {
  private results: TestResult[] = [];
  private startTime: number = 0;
  private endTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  generateReport(): void {
    this.endTime = Date.now();
    const duration = this.endTime - this.startTime;

    const report = this.formatReport(duration);
    this.saveReport(report);
  }

  private formatReport(duration: number): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = '# 测试报告\n\n';
    report += `## 测试概览\n\n`;
    report += `- 总测试数: ${totalTests}\n`;
    report += `- 通过测试: ${passedTests}\n`;
    report += `- 失败测试: ${failedTests}\n`;
    report += `- 测试耗时: ${duration}ms\n\n`;

    report += `## 详细结果\n\n`;

    // 按系统分组显示结果
    const systemResults = this.groupResultsBySystem();
    for (const [system, results] of Object.entries(systemResults)) {
      report += `### ${system}\n\n`;
      results.forEach(result => {
        report += `#### ${result.name}\n\n`;
        report += `- 状态: ${result.passed ? '通过' : '失败'}\n`;
        if (!result.passed && result.error) {
          report += `- 错误: ${result.error}\n`;
        }
        report += '\n';
      });
    }

    return report;
  }

  private groupResultsBySystem(): { [key: string]: TestResult[] } {
    const groups: { [key: string]: TestResult[] } = {};

    this.results.forEach(result => {
      const system = this.getSystemFromTestName(result.name);
      if (!groups[system]) {
        groups[system] = [];
      }
      groups[system].push(result);
    });

    return groups;
  }

  private getSystemFromTestName(name: string): string {
    if (name.includes('核心系统')) return '核心系统';
    if (name.includes('游戏系统')) return '游戏系统';
    if (name.includes('角色系统')) return '角色系统';
    if (name.includes('装备系统')) return '装备系统';
    if (name.includes('技能系统')) return '技能系统';
    if (name.includes('物品系统')) return '物品系统';
    return '其他系统';
  }

  private saveReport(report: string): void {
    const reportDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `test-report-${timestamp}.md`);

    fs.writeFileSync(reportPath, report);
    console.log(`测试报告已保存到: ${reportPath}`);
  }
} 