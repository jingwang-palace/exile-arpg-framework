import { IMap } from '@/core/interfaces/IMapSystem';

interface PerformanceMetrics {
  timestamp: number;
  mapId: string;
  regionCount: number;
  connectionCount: number;
  memoryUsage: number;
  cpuUsage: number;
  fps: number;
  loadTime: number;
  renderTime: number;
  updateTime: number;
  bottlenecks?: string[];
}

interface PerformanceStats {
  average: PerformanceMetrics;
  min: PerformanceMetrics;
  max: PerformanceMetrics;
}

export class PerformanceMonitor {
  private map: IMap;
  private isMonitoring: boolean = false;
  private metrics: PerformanceMetrics[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastSecondTime: number = 0;
  private currentFPS: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private fpsInterval: NodeJS.Timeout | null = null;

  constructor(map: IMap) {
    this.map = map;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = Date.now();
    this.lastSecondTime = this.lastFrameTime;
    this.frameCount = 0;
    this.currentFPS = 0;

    // 每100ms收集一次性能数据
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 100);

    // 开始帧率计算
    this.calculateFPS();
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
  }

  private calculateFPS(): void {
    if (!this.isMonitoring) return;

    const now = Date.now();
    this.frameCount++;

    // 每秒更新一次FPS
    if (now - this.lastSecondTime >= 1000) {
      this.currentFPS = Math.round(this.frameCount * 1000 / (now - this.lastSecondTime));
      this.frameCount = 0;
      this.lastSecondTime = now;

      // 检查帧率是否过低
      if (this.currentFPS < 30) {
        console.warn('性能警报:', [`帧率过低: ${this.currentFPS.toFixed(1)}FPS`]);
      }
    }

    // 继续下一帧
    this.fpsInterval = setTimeout(() => this.calculateFPS(), 16); // 约60FPS
  }

  private collectMetrics(): void {
    const now = Date.now();
    const regions = this.map.getRegions();
    const connections = new Set<string>();
    
    // 收集所有连接
    regions.forEach(region => {
      const regionConnections = this.map.getConnections(region.id);
      regionConnections.forEach(conn => connections.add(conn));
    });

    const metrics: PerformanceMetrics = {
      timestamp: now,
      mapId: this.map.id,
      regionCount: regions.length,
      connectionCount: connections.size,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: process.cpuUsage().user / 1000, // 转换为毫秒
      fps: this.currentFPS,
      loadTime: 0, // 暂时不计算
      renderTime: 0, // 暂时不计算
      updateTime: now - this.lastFrameTime
    };

    this.metrics.push(metrics);
    this.lastFrameTime = now;

    // 只保留最近100个指标
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  getPerformanceReport(): { currentMetrics: PerformanceMetrics | undefined; trends: any; stats: PerformanceStats } {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    const trends = this.getPerformanceTrends();
    const stats = this.getPerformanceStats();

    return {
      currentMetrics,
      trends,
      stats
    };
  }

  getPerformanceTrends(): any {
    return {
      memoryUsage: this.metrics.map(m => m.memoryUsage),
      cpuUsage: this.metrics.map(m => m.cpuUsage),
      fps: this.metrics.map(m => m.fps),
      loadTime: this.metrics.map(m => m.loadTime),
      renderTime: this.metrics.map(m => m.renderTime),
      updateTime: this.metrics.map(m => m.updateTime)
    };
  }

  getPerformanceStats(): PerformanceStats {
    const metrics = this.metrics;
    if (metrics.length === 0) {
      return {
        average: this.createEmptyMetrics(),
        min: this.createEmptyMetrics(),
        max: this.createEmptyMetrics()
      };
    }

    const sum = metrics.reduce((acc, curr) => ({
      timestamp: acc.timestamp + curr.timestamp,
      mapId: curr.mapId,
      regionCount: acc.regionCount + curr.regionCount,
      connectionCount: acc.connectionCount + curr.connectionCount,
      memoryUsage: acc.memoryUsage + curr.memoryUsage,
      cpuUsage: acc.cpuUsage + curr.cpuUsage,
      fps: acc.fps + curr.fps,
      loadTime: acc.loadTime + curr.loadTime,
      renderTime: acc.renderTime + curr.renderTime,
      updateTime: acc.updateTime + curr.updateTime
    }));

    const count = metrics.length;
    const average: PerformanceMetrics = {
      timestamp: sum.timestamp / count,
      mapId: sum.mapId,
      regionCount: sum.regionCount / count,
      connectionCount: sum.connectionCount / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      fps: sum.fps / count,
      loadTime: sum.loadTime / count,
      renderTime: sum.renderTime / count,
      updateTime: sum.updateTime / count
    };

    const min: PerformanceMetrics = {
      timestamp: Math.min(...metrics.map(m => m.timestamp)),
      mapId: metrics[0].mapId,
      regionCount: Math.min(...metrics.map(m => m.regionCount)),
      connectionCount: Math.min(...metrics.map(m => m.connectionCount)),
      memoryUsage: Math.min(...metrics.map(m => m.memoryUsage)),
      cpuUsage: Math.min(...metrics.map(m => m.cpuUsage)),
      fps: Math.min(...metrics.map(m => m.fps)),
      loadTime: Math.min(...metrics.map(m => m.loadTime)),
      renderTime: Math.min(...metrics.map(m => m.renderTime)),
      updateTime: Math.min(...metrics.map(m => m.updateTime))
    };

    const max: PerformanceMetrics = {
      timestamp: Math.max(...metrics.map(m => m.timestamp)),
      mapId: metrics[0].mapId,
      regionCount: Math.max(...metrics.map(m => m.regionCount)),
      connectionCount: Math.max(...metrics.map(m => m.connectionCount)),
      memoryUsage: Math.max(...metrics.map(m => m.memoryUsage)),
      cpuUsage: Math.max(...metrics.map(m => m.cpuUsage)),
      fps: Math.max(...metrics.map(m => m.fps)),
      loadTime: Math.max(...metrics.map(m => m.loadTime)),
      renderTime: Math.max(...metrics.map(m => m.renderTime)),
      updateTime: Math.max(...metrics.map(m => m.updateTime))
    };

    return { average, min, max };
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      mapId: this.map.id,
      regionCount: 0,
      connectionCount: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      fps: 0,
      loadTime: 0,
      renderTime: 0,
      updateTime: 0
    };
  }
} 