import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// 获取所有测试报告列表
router.get('/reports', (req, res) => {
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    return res.json([]);
  }

  const reports = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'))
    .sort()
    .reverse()
    .map(file => ({
      name: file,
      path: `/test-reports/${file}`,
      date: fs.statSync(path.join(reportsDir, file)).mtime
    }));

  res.json(reports);
});

// 获取最新的测试报告
router.get('/reports/latest', (req, res) => {
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    return res.status(404).send('没有找到测试报告');
  }

  const reports = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'))
    .sort()
    .reverse();

  if (reports.length === 0) {
    return res.status(404).send('没有找到测试报告');
  }

  res.redirect(`/test-reports/${reports[0]}`);
});

// 获取指定测试报告
router.get('/reports/:filename', (req, res) => {
  const { filename } = req.params;
  const reportPath = path.join(process.cwd(), 'test-reports', filename);

  if (!fs.existsSync(reportPath)) {
    return res.status(404).send('测试报告不存在');
  }

  res.sendFile(reportPath);
});

export default router; 