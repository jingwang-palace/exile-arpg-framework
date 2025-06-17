import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

// 静态文件服务
app.use(express.static(path.join(process.cwd(), 'test-reports')));

// 主页路由
app.get('/', (req, res) => {
  const reportsDir = path.join(process.cwd(), 'test-reports');
  const reports = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'))
    .sort()
    .reverse();

  if (reports.length === 0) {
    res.send('没有找到测试报告');
    return;
  }

  // 重定向到最新的报告
  res.redirect(`/${reports[0]}`);
});

// 启动服务器
app.listen(port, () => {
  console.log(`测试报告服务器运行在 http://localhost:${port}`);
}); 