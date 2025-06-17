import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { PerformanceAnalyzer, PerformanceReport } from '../testing/PerformanceAnalyzer';

export interface OptimizationSuggestion {
  type: OptimizationType;
  priority: OptimizationPriority;
  description: string;
  impact: string;
  implementation: string;
  expectedImprovement: string;
  affectedRegions?: string[];
  affectedConnections?: string[];
}

export interface OptimizationReport {
  timestamp: number;
  mapId: string;
  suggestions: OptimizationSuggestion[];
  performanceReport: PerformanceReport;
  summary: {
    totalSuggestions: number;
    byPriority: {
      [key in OptimizationPriority]: number;
    };
    byType: {
      [key in OptimizationType]: number;
    };
  };
}

export enum OptimizationType {
  REGION_LAYOUT = 'region_layout',
  CONNECTION_STRUCTURE = 'connection_structure',
  PERFORMANCE = 'performance',
  GAMEPLAY = 'gameplay',
  BALANCE = 'balance'
}

export enum OptimizationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class MapOptimizer {
  private map: DungeonMap;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor(map: DungeonMap) {
    this.map = map;
    this.performanceAnalyzer = new PerformanceAnalyzer(map);
  }

  // 生成优化建议
  generateOptimizationReport(): OptimizationReport {
    const performanceReport = this.performanceAnalyzer.analyze();
    const suggestions = this.generateSuggestions(performanceReport);

    return {
      timestamp: Date.now(),
      mapId: this.map.id,
      suggestions,
      performanceReport,
      summary: this.generateSummary(suggestions)
    };
  }

  // 生成优化建议
  private generateSuggestions(performanceReport: PerformanceReport): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 分析区域布局
    this.analyzeRegionLayout(suggestions);

    // 分析连接结构
    this.analyzeConnectionStructure(suggestions);

    // 分析性能问题
    this.analyzePerformance(suggestions, performanceReport);

    // 分析游戏性
    this.analyzeGameplay(suggestions);

    // 分析平衡性
    this.analyzeBalance(suggestions);

    return suggestions;
  }

  // 分析区域布局
  private analyzeRegionLayout(suggestions: OptimizationSuggestion[]): void {
    const regions = this.map.getRegions();

    // 检查区域大小
    const smallRegions = regions.filter(
      region => region.size.width * region.size.height < 10000
    );
    if (smallRegions.length > 0) {
      suggestions.push({
        type: OptimizationType.REGION_LAYOUT,
        priority: OptimizationPriority.MEDIUM,
        description: '存在过小的区域',
        impact: '可能影响游戏体验和性能',
        implementation: '合并相邻的小区域或扩大区域尺寸',
        expectedImprovement: '提高区域可用性和性能',
        affectedRegions: smallRegions.map(r => r.id)
      });
    }

    // 检查区域分布
    const distribution = this.analyzeRegionDistribution(regions);
    if (!distribution.isBalanced) {
      suggestions.push({
        type: OptimizationType.REGION_LAYOUT,
        priority: OptimizationPriority.HIGH,
        description: '区域分布不均衡',
        impact: '可能导致游戏体验不一致',
        implementation: '调整区域位置使分布更均匀',
        expectedImprovement: '提高游戏体验的连贯性',
        affectedRegions: distribution.unbalancedRegions
      });
    }
  }

  // 分析连接结构
  private analyzeConnectionStructure(suggestions: OptimizationSuggestion[]): void {
    const connections = this.map.getConnections();
    const regions = this.map.getRegions();

    // 检查连接数量
    const connectionCounts = new Map<string, number>();
    connections.forEach(connection => {
      const sourceId = connection.sourceRegion.id;
      const targetId = connection.targetRegion.id;
      connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
      connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1);
    });

    // 检查连接过少的区域
    const underConnectedRegions = regions.filter(
      region => (connectionCounts.get(region.id) || 0) < 2
    );
    if (underConnectedRegions.length > 0) {
      suggestions.push({
        type: OptimizationType.CONNECTION_STRUCTURE,
        priority: OptimizationPriority.HIGH,
        description: '存在连接不足的区域',
        impact: '可能导致区域无法到达或游戏体验受限',
        implementation: '为这些区域添加更多连接',
        expectedImprovement: '提高地图的可访问性',
        affectedRegions: underConnectedRegions.map(r => r.id)
      });
    }

    // 检查连接过多的区域
    const overConnectedRegions = regions.filter(
      region => (connectionCounts.get(region.id) || 0) > 4
    );
    if (overConnectedRegions.length > 0) {
      suggestions.push({
        type: OptimizationType.CONNECTION_STRUCTURE,
        priority: OptimizationPriority.MEDIUM,
        description: '存在连接过多的区域',
        impact: '可能导致玩家选择困难',
        implementation: '减少不必要的连接',
        expectedImprovement: '提高游戏体验的清晰度',
        affectedRegions: overConnectedRegions.map(r => r.id)
      });
    }
  }

  // 分析性能问题
  private analyzePerformance(
    suggestions: OptimizationSuggestion[],
    performanceReport: PerformanceReport
  ): void {
    performanceReport.bottlenecks.forEach(bottleneck => {
      switch (bottleneck.type) {
        case 'region_count':
          suggestions.push({
            type: OptimizationType.PERFORMANCE,
            priority: this.getOptimizationPriority(bottleneck.severity),
            description: '区域数量过多',
            impact: '影响性能和内存使用',
            implementation: '合并相邻区域或删除不必要的区域',
            expectedImprovement: '提高性能和减少内存使用'
          });
          break;

        case 'connection_count':
          suggestions.push({
            type: OptimizationType.PERFORMANCE,
            priority: this.getOptimizationPriority(bottleneck.severity),
            description: '连接数量过多',
            impact: '影响寻路性能',
            implementation: '优化连接结构，删除冗余连接',
            expectedImprovement: '提高寻路性能'
          });
          break;

        case 'memory_usage':
          suggestions.push({
            type: OptimizationType.PERFORMANCE,
            priority: this.getOptimizationPriority(bottleneck.severity),
            description: '内存使用过高',
            impact: '可能导致游戏卡顿',
            implementation: '优化数据结构，减少内存占用',
            expectedImprovement: '降低内存使用'
          });
          break;
      }
    });
  }

  // 分析游戏性
  private analyzeGameplay(suggestions: OptimizationSuggestion[]): void {
    const regions = this.map.getRegions();
    const connections = this.map.getConnections();

    // 检查从出生点到Boss的路径
    const path = this.findPathToBoss();
    if (!path) {
      suggestions.push({
        type: OptimizationType.GAMEPLAY,
        priority: OptimizationPriority.CRITICAL,
        description: '无法找到从出生点到Boss的路径',
        impact: '地图无法完成',
        implementation: '添加必要的连接或调整区域位置',
        expectedImprovement: '确保地图可完成'
      });
    } else if (path.length > 10) {
      suggestions.push({
        type: OptimizationType.GAMEPLAY,
        priority: OptimizationPriority.HIGH,
        description: '从出生点到Boss的路径过长',
        impact: '可能导致游戏体验冗长',
        implementation: '优化路径，减少不必要的区域',
        expectedImprovement: '提高游戏体验的流畅性'
      });
    }

    // 检查传送点分布
    const teleporters = connections.filter(
      connection => connection.type === ConnectionType.TELEPORTER
    );
    if (teleporters.length > 5) {
      suggestions.push({
        type: OptimizationType.GAMEPLAY,
        priority: OptimizationPriority.MEDIUM,
        description: '传送点数量过多',
        impact: '可能影响游戏体验',
        implementation: '减少传送点数量，保留关键传送点',
        expectedImprovement: '提高游戏体验的连贯性'
      });
    }
  }

  // 分析平衡性
  private analyzeBalance(suggestions: OptimizationSuggestion[]): void {
    const regions = this.map.getRegions();

    // 检查区域类型分布
    const typeCounts = new Map<string, number>();
    regions.forEach(region => {
      typeCounts.set(region.type, (typeCounts.get(region.type) || 0) + 1);
    });

    // 检查战斗区域数量
    const combatRegions = typeCounts.get('combat') || 0;
    if (combatRegions < 3) {
      suggestions.push({
        type: OptimizationType.BALANCE,
        priority: OptimizationPriority.HIGH,
        description: '战斗区域数量不足',
        impact: '可能导致游戏体验不足',
        implementation: '添加更多战斗区域',
        expectedImprovement: '提高游戏体验的丰富度'
      });
    }

    // 检查宝箱区域数量
    const treasureRegions = typeCounts.get('treasure') || 0;
    if (treasureRegions === 0) {
      suggestions.push({
        type: OptimizationType.BALANCE,
        priority: OptimizationPriority.MEDIUM,
        description: '缺少宝箱区域',
        impact: '缺少奖励机制',
        implementation: '添加宝箱区域',
        expectedImprovement: '增加游戏奖励机制'
      });
    }
  }

  // 分析区域分布
  private analyzeRegionDistribution(regions: IRegion[]): {
    isBalanced: boolean;
    unbalancedRegions: string[];
  } {
    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    const centerX = this.map.size.width / 2;
    const centerY = this.map.size.height / 2;

    const unbalancedRegions: string[] = [];

    regions.forEach(region => {
      const center = {
        x: region.position.x + region.size.width / 2,
        y: region.position.y + region.size.height / 2
      };

      if (center.x < centerX && center.y < centerY) quadrants.topLeft++;
      else if (center.x >= centerX && center.y < centerY) quadrants.topRight++;
      else if (center.x < centerX && center.y >= centerY) quadrants.bottomLeft++;
      else quadrants.bottomRight++;

      // 检查区域是否过于偏离中心
      const distanceFromCenter = Math.sqrt(
        Math.pow(center.x - centerX, 2) + Math.pow(center.y - centerY, 2)
      );
      if (distanceFromCenter > this.map.size.width * 0.4) {
        unbalancedRegions.push(region.id);
      }
    });

    const values = Object.values(quadrants);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = average * 0.5;

    const isBalanced = values.every(value => Math.abs(value - average) <= threshold);

    return {
      isBalanced,
      unbalancedRegions
    };
  }

  // 查找到Boss的路径
  private findPathToBoss(): IRegion[] | null {
    const regions = this.map.getRegions();
    const spawnRegion = regions.find(r => r.type === 'spawn');
    const bossRegion = regions.find(r => r.type === 'boss');

    if (!spawnRegion || !bossRegion) return null;

    return this.findPath(spawnRegion, bossRegion);
  }

  // 寻路算法
  private findPath(start: IRegion, end: IRegion): IRegion[] | null {
    const queue: IRegion[][] = [[start]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current.id === end.id) {
        return path;
      }

      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const connections = this.map.getConnections().filter(
        connection => 
          connection.sourceRegion.id === current.id ||
          connection.targetRegion.id === current.id
      );

      connections.forEach(connection => {
        const nextRegion = connection.sourceRegion.id === current.id
          ? connection.targetRegion
          : connection.sourceRegion;

        if (!visited.has(nextRegion.id)) {
          queue.push([...path, nextRegion]);
        }
      });
    }

    return null;
  }

  // 生成报告摘要
  private generateSummary(suggestions: OptimizationSuggestion[]): {
    totalSuggestions: number;
    byPriority: { [key in OptimizationPriority]: number };
    byType: { [key in OptimizationType]: number };
  } {
    const byPriority: { [key in OptimizationPriority]: number } = {
      [OptimizationPriority.LOW]: 0,
      [OptimizationPriority.MEDIUM]: 0,
      [OptimizationPriority.HIGH]: 0,
      [OptimizationPriority.CRITICAL]: 0
    };

    const byType: { [key in OptimizationType]: number } = {
      [OptimizationType.REGION_LAYOUT]: 0,
      [OptimizationType.CONNECTION_STRUCTURE]: 0,
      [OptimizationType.PERFORMANCE]: 0,
      [OptimizationType.GAMEPLAY]: 0,
      [OptimizationType.BALANCE]: 0
    };

    suggestions.forEach(suggestion => {
      byPriority[suggestion.priority]++;
      byType[suggestion.type]++;
    });

    return {
      totalSuggestions: suggestions.length,
      byPriority,
      byType
    };
  }

  // 获取优化优先级
  private getOptimizationPriority(severity: string): OptimizationPriority {
    switch (severity) {
      case 'critical':
        return OptimizationPriority.CRITICAL;
      case 'high':
        return OptimizationPriority.HIGH;
      case 'medium':
        return OptimizationPriority.MEDIUM;
      case 'low':
        return OptimizationPriority.LOW;
      default:
        return OptimizationPriority.MEDIUM;
    }
  }
} 