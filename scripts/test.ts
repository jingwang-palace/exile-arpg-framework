import { TestGameFramework } from '../src/tests/TestGameFramework.js';
import { TestReporter } from '../src/tests/TestReporter.js';
import '../src/tests/mocks/localStorage.js';

async function runTests() {
  console.log('开始运行测试...');
  
  try {
    const framework = new TestGameFramework();
    const results = await framework.runTests();
    
    const reporter = new TestReporter();
    results.forEach(result => reporter.addResult(result));
    reporter.generateReport();
    
    console.log('测试完成！');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    process.exit(1);
  }
}

runTests(); 