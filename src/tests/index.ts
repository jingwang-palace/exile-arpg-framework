import { TestRunner } from './TestRunner';

async function main() {
  try {
    const runner = new TestRunner();

    // 获取命令行参数
    const args = process.argv.slice(2);
    const testType = args[0];

    if (testType) {
      // 运行特定类型的测试
      await runner.runSpecificTest(testType);
    } else {
      // 运行所有测试
      await runner.runAllTests();
    }
  } catch (error) {
    console.error('测试运行失败:', error);
    process.exit(1);
  }
}

main(); 