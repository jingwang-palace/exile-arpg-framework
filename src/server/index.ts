import express from 'express';
import path from 'path';
import testReportRouter from './routes/testReport';

const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/test-reports', express.static(path.join(__dirname, '../../test-reports')));

// API路由
app.use('/api/test', testReportRouter);

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`测试报告查看地址: http://localhost:${port}/api/test/reports/latest`);
}); 