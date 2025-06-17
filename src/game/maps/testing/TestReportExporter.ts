import { TestResult } from './TestResult';
import { PerformanceReport } from './PerformanceAnalyzer';
import { OptimizationReport, OptimizationType, OptimizationPriority } from '../optimization/MapOptimizer';
import { MapRating } from '../rating/MapRating';

export interface TestReport {
  timestamp: number;
  mapId: string;
  testResults: TestResult[];
  performanceReport: PerformanceReport;
  optimizationReport: OptimizationReport;
  mapRating: MapRating;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    performanceScore: number;
    optimizationScore: number;
    overallRating: number;
  };
}

export class TestReportExporter {
  // 导出为JSON格式
  exportToJson(report: TestReport): string {
    return JSON.stringify(report, null, 2);
  }

  // 导出为HTML格式
  exportToHtml(report: TestReport): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>地图测试报告 - ${report.mapId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-item {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
            }
            .summary-item h3 {
              margin: 0;
              color: #666;
            }
            .summary-item p {
              margin: 10px 0 0;
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #333;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .test-result {
              margin: 10px 0;
              padding: 10px;
              border-radius: 5px;
            }
            .test-result.passed {
              background-color: #d4edda;
              color: #155724;
            }
            .test-result.failed {
              background-color: #f8d7da;
              color: #721c24;
            }
            .test-result.skipped {
              background-color: #fff3cd;
              color: #856404;
            }
            .suggestion {
              margin: 10px 0;
              padding: 10px;
              background-color: #e2e3e5;
              border-radius: 5px;
            }
            .suggestion.high {
              border-left: 4px solid #dc3545;
            }
            .suggestion.medium {
              border-left: 4px solid #ffc107;
            }
            .suggestion.low {
              border-left: 4px solid #28a745;
            }
            .rating {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .rating-item {
              text-align: center;
              flex: 1;
            }
            .rating-item h4 {
              margin: 0;
              color: #666;
            }
            .rating-item p {
              margin: 5px 0 0;
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>地图测试报告</h1>
              <p>地图ID: ${report.mapId}</p>
              <p>测试时间: ${new Date(report.timestamp).toLocaleString()}</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <h3>总测试数</h3>
                <p>${report.summary.totalTests}</p>
              </div>
              <div class="summary-item">
                <h3>通过测试</h3>
                <p>${report.summary.passedTests}</p>
              </div>
              <div class="summary-item">
                <h3>失败测试</h3>
                <p>${report.summary.failedTests}</p>
              </div>
              <div class="summary-item">
                <h3>跳过测试</h3>
                <p>${report.summary.skippedTests}</p>
              </div>
              <div class="summary-item">
                <h3>性能评分</h3>
                <p>${report.summary.performanceScore.toFixed(1)}</p>
              </div>
              <div class="summary-item">
                <h3>优化评分</h3>
                <p>${report.summary.optimizationScore.toFixed(1)}</p>
              </div>
              <div class="summary-item">
                <h3>总体评分</h3>
                <p>${report.summary.overallRating.toFixed(1)}</p>
              </div>
            </div>

            <div class="section">
              <h2>测试结果</h2>
              ${report.testResults.map(result => `
                <div class="test-result ${result.status.toLowerCase()}">
                  <h3>${result.name}</h3>
                  <p>状态: ${result.status}</p>
                  <p>耗时: ${result.duration}ms</p>
                  ${result.error ? `<p>错误: ${result.error}</p>` : ''}
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>性能报告</h2>
              <div class="rating">
                <div class="rating-item">
                  <h4>区域数量</h4>
                  <p>${report.performanceReport.regionCount}</p>
                </div>
                <div class="rating-item">
                  <h4>连接数量</h4>
                  <p>${report.performanceReport.connectionCount}</p>
                </div>
                <div class="rating-item">
                  <h4>内存使用</h4>
                  <p>${(report.performanceReport.memoryUsage / 1024 / 1024).toFixed(2)}MB</p>
                </div>
              </div>
              ${report.performanceReport.bottlenecks.length > 0 ? `
                <h3>性能瓶颈</h3>
                ${report.performanceReport.bottlenecks.map(bottleneck => `
                  <div class="suggestion ${bottleneck.severity}">
                    <h4>${bottleneck.type}</h4>
                    <p>${bottleneck.description}</p>
                  </div>
                `).join('')}
              ` : ''}
            </div>

            <div class="section">
              <h2>优化建议</h2>
              <div class="summary">
                <div class="summary-item">
                  <h3>总建议数</h3>
                  <p>${report.optimizationReport.summary.totalSuggestions}</p>
                </div>
                ${Object.entries(report.optimizationReport.summary.byPriority).map(([priority, count]) => `
                  <div class="summary-item">
                    <h3>${priority}优先级</h3>
                    <p>${count}</p>
                  </div>
                `).join('')}
              </div>
              ${report.optimizationReport.suggestions.map(suggestion => `
                <div class="suggestion ${suggestion.priority}">
                  <h4>${suggestion.type}</h4>
                  <p>优先级: ${suggestion.priority}</p>
                  <p>${suggestion.description}</p>
                  <p>影响: ${suggestion.impact}</p>
                  <p>建议: ${suggestion.implementation}</p>
                  <p>预期改进: ${suggestion.expectedImprovement}</p>
                  ${suggestion.affectedRegions ? `
                    <p>受影响区域: ${suggestion.affectedRegions.join(', ')}</p>
                  ` : ''}
                  ${suggestion.affectedConnections ? `
                    <p>受影响连接: ${suggestion.affectedConnections.join(', ')}</p>
                  ` : ''}
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>地图评分</h2>
              <div class="rating">
                <div class="rating-item">
                  <h4>游戏性</h4>
                  <p>${report.mapRating.gameplay.toFixed(1)}</p>
                </div>
                <div class="rating-item">
                  <h4>平衡性</h4>
                  <p>${report.mapRating.balance.toFixed(1)}</p>
                </div>
                <div class="rating-item">
                  <h4>性能</h4>
                  <p>${report.mapRating.performance.toFixed(1)}</p>
                </div>
                <div class="rating-item">
                  <h4>布局</h4>
                  <p>${report.mapRating.layout.toFixed(1)}</p>
                </div>
                <div class="rating-item">
                  <h4>总体</h4>
                  <p>${report.mapRating.overall.toFixed(1)}</p>
                </div>
              </div>
              <div class="section">
                <h3>详细评分</h3>
                ${Object.entries(report.mapRating.details).map(([key, value]) => `
                  <div class="rating-item">
                    <h4>${key}</h4>
                    <p>${value.toFixed(1)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // 导出为Markdown格式
  exportToMarkdown(report: TestReport): string {
    return `
# 地图测试报告

## 基本信息
- 地图ID: ${report.mapId}
- 测试时间: ${new Date(report.timestamp).toLocaleString()}

## 测试摘要
- 总测试数: ${report.summary.totalTests}
- 通过测试: ${report.summary.passedTests}
- 失败测试: ${report.summary.failedTests}
- 跳过测试: ${report.summary.skippedTests}
- 性能评分: ${report.summary.performanceScore.toFixed(1)}
- 优化评分: ${report.summary.optimizationScore.toFixed(1)}
- 总体评分: ${report.summary.overallRating.toFixed(1)}

## 测试结果
${report.testResults.map(result => `
### ${result.name}
- 状态: ${result.status}
- 耗时: ${result.duration}ms
${result.error ? `- 错误: ${result.error}` : ''}
`).join('\n')}

## 性能报告
- 区域数量: ${report.performanceReport.regionCount}
- 连接数量: ${report.performanceReport.connectionCount}
- 内存使用: ${(report.performanceReport.memoryUsage / 1024 / 1024).toFixed(2)}MB

### 性能瓶颈
${report.performanceReport.bottlenecks.map(bottleneck => `
#### ${bottleneck.type}
- 严重程度: ${bottleneck.severity}
- ${bottleneck.description}
`).join('\n')}

## 优化建议
### 建议摘要
- 总建议数: ${report.optimizationReport.summary.totalSuggestions}
${Object.entries(report.optimizationReport.summary.byPriority).map(([priority, count]) => `
- ${priority}优先级: ${count}
`).join('\n')}

### 详细建议
${report.optimizationReport.suggestions.map(suggestion => `
#### ${suggestion.type}
- 优先级: ${suggestion.priority}
- 描述: ${suggestion.description}
- 影响: ${suggestion.impact}
- 建议: ${suggestion.implementation}
- 预期改进: ${suggestion.expectedImprovement}
${suggestion.affectedRegions ? `- 受影响区域: ${suggestion.affectedRegions.join(', ')}` : ''}
${suggestion.affectedConnections ? `- 受影响连接: ${suggestion.affectedConnections.join(', ')}` : ''}
`).join('\n')}

## 地图评分
- 游戏性: ${report.mapRating.gameplay.toFixed(1)}
- 平衡性: ${report.mapRating.balance.toFixed(1)}
- 性能: ${report.mapRating.performance.toFixed(1)}
- 布局: ${report.mapRating.layout.toFixed(1)}
- 总体: ${report.mapRating.overall.toFixed(1)}

### 详细评分
${Object.entries(report.mapRating.details).map(([key, value]) => `
- ${key}: ${value.toFixed(1)}
`).join('\n')}
    `;
  }
} 