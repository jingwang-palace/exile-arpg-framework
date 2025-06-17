import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { PerformanceAnalyzer, PerformanceReport } from '../testing/PerformanceAnalyzer';
import { MapOptimizer, OptimizationReport } from '../optimization/MapOptimizer';

export interface MapRating {
  overall: number;
  gameplay: number;
  balance: number;
  performance: number;
  layout: number;
  details: {
    [key: string]: number;
  };
  timestamp: number;
  mapId: string;
}

export interface RatingCriteria {
  weight: number;
  minScore: number;
  maxScore: number;
  description: string;
}

export class MapRatingSystem {
  private map: DungeonMap;
  private performanceAnalyzer: PerformanceAnalyzer;
  private mapOptimizer: MapOptimizer;

  private readonly criteria: { [key: string]: RatingCriteria } = {
    // 游戏性评分标准
    pathLength: {
      weight: 0.15,
      minScore: 0,
      maxScore: 100,
      description: '从出生点到Boss的路径长度'
    },
    teleporterCount: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '传送点数量'
    },
    regionVariety: {
      weight: 0.15,
      minScore: 0,
      maxScore: 100,
      description: '区域类型多样性'
    },

    // 平衡性评分标准
    combatBalance: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '战斗区域平衡性'
    },
    treasureDistribution: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '宝箱分布'
    },
    difficultyProgression: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '难度递进'
    },

    // 性能评分标准
    regionCount: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '区域数量'
    },
    connectionCount: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '连接数量'
    },
    memoryUsage: {
      weight: 0.1,
      minScore: 0,
      maxScore: 100,
      description: '内存使用'
    }
  };

  constructor(map: DungeonMap) {
    this.map = map;
    this.performanceAnalyzer = new PerformanceAnalyzer(map);
    this.mapOptimizer = new MapOptimizer(map);
  }

  // 生成地图评分
  generateRating(): MapRating {
    const performanceReport = this.performanceAnalyzer.analyze();
    const optimizationReport = this.mapOptimizer.generateOptimizationReport();

    const details: { [key: string]: number } = {};

    // 计算游戏性评分
    details.pathLength = this.ratePathLength();
    details.teleporterCount = this.rateTeleporterCount();
    details.regionVariety = this.rateRegionVariety();

    // 计算平衡性评分
    details.combatBalance = this.rateCombatBalance();
    details.treasureDistribution = this.rateTreasureDistribution();
    details.difficultyProgression = this.rateDifficultyProgression();

    // 计算性能评分
    details.regionCount = this.rateRegionCount(performanceReport);
    details.connectionCount = this.rateConnectionCount(performanceReport);
    details.memoryUsage = this.rateMemoryUsage(performanceReport);

    // 计算总体评分
    const gameplay = this.calculateCategoryScore([
      details.pathLength,
      details.teleporterCount,
      details.regionVariety
    ], ['pathLength', 'teleporterCount', 'regionVariety']);

    const balance = this.calculateCategoryScore([
      details.combatBalance,
      details.treasureDistribution,
      details.difficultyProgression
    ], ['combatBalance', 'treasureDistribution', 'difficultyProgression']);

    const performance = this.calculateCategoryScore([
      details.regionCount,
      details.connectionCount,
      details.memoryUsage
    ], ['regionCount', 'connectionCount', 'memoryUsage']);

    const layout = this.calculateLayoutScore(optimizationReport);

    const overall = this.calculateOverallScore({
      gameplay,
      balance,
      performance,
      layout
    });

    return {
      overall,
      gameplay,
      balance,
      performance,
      layout,
      details,
      timestamp: Date.now(),
      mapId: this.map.id
    };
  }

  // 计算路径长度评分
  private ratePathLength(): number {
    const path = this.findPathToBoss();
    if (!path) return 0;

    const length = path.length;
    if (length <= 5) return 100;
    if (length <= 8) return 80;
    if (length <= 12) return 60;
    if (length <= 15) return 40;
    return 20;
  }

  // 计算传送点数量评分
  private rateTeleporterCount(): number {
    const teleporters = this.map.getConnections().filter(
      connection => connection.type === ConnectionType.TELEPORTER
    ).length;

    if (teleporters === 0) return 100;
    if (teleporters <= 2) return 80;
    if (teleporters <= 4) return 60;
    if (teleporters <= 6) return 40;
    return 20;
  }

  // 计算区域多样性评分
  private rateRegionVariety(): number {
    const regions = this.map.getRegions();
    const typeCount = new Set(regions.map(r => r.type)).size;
    const totalRegions = regions.length;

    if (typeCount >= 5) return 100;
    if (typeCount >= 4) return 80;
    if (typeCount >= 3) return 60;
    if (typeCount >= 2) return 40;
    return 20;
  }

  // 计算战斗平衡性评分
  private rateCombatBalance(): number {
    const regions = this.map.getRegions();
    const combatRegions = regions.filter(r => r.type === 'combat');
    const totalRegions = regions.length;

    const combatRatio = combatRegions.length / totalRegions;
    if (combatRatio >= 0.3 && combatRatio <= 0.5) return 100;
    if (combatRatio >= 0.2 && combatRatio <= 0.6) return 80;
    if (combatRatio >= 0.1 && combatRatio <= 0.7) return 60;
    if (combatRatio >= 0.05 && combatRatio <= 0.8) return 40;
    return 20;
  }

  // 计算宝箱分布评分
  private rateTreasureDistribution(): number {
    const regions = this.map.getRegions();
    const treasureRegions = regions.filter(r => r.type === 'treasure');
    const totalRegions = regions.length;

    const treasureRatio = treasureRegions.length / totalRegions;
    if (treasureRatio >= 0.1 && treasureRatio <= 0.2) return 100;
    if (treasureRatio >= 0.05 && treasureRatio <= 0.25) return 80;
    if (treasureRatio >= 0.02 && treasureRatio <= 0.3) return 60;
    if (treasureRatio >= 0.01 && treasureRatio <= 0.4) return 40;
    return 20;
  }

  // 计算难度递进评分
  private rateDifficultyProgression(): number {
    const regions = this.map.getRegions();
    const combatRegions = regions.filter(r => r.type === 'combat');
    
    if (combatRegions.length < 2) return 50;

    let isProgressive = true;
    for (let i = 1; i < combatRegions.length; i++) {
      if (combatRegions[i].difficulty <= combatRegions[i - 1].difficulty) {
        isProgressive = false;
        break;
      }
    }

    return isProgressive ? 100 : 50;
  }

  // 计算区域数量评分
  private rateRegionCount(performanceReport: PerformanceReport): number {
    const regionCount = this.map.getRegions().length;
    const bottleneck = performanceReport.bottlenecks.find(b => b.type === 'region_count');

    if (!bottleneck) return 100;
    if (bottleneck.severity === 'low') return 80;
    if (bottleneck.severity === 'medium') return 60;
    if (bottleneck.severity === 'high') return 40;
    return 20;
  }

  // 计算连接数量评分
  private rateConnectionCount(performanceReport: PerformanceReport): number {
    const connectionCount = this.map.getConnections().length;
    const bottleneck = performanceReport.bottlenecks.find(b => b.type === 'connection_count');

    if (!bottleneck) return 100;
    if (bottleneck.severity === 'low') return 80;
    if (bottleneck.severity === 'medium') return 60;
    if (bottleneck.severity === 'high') return 40;
    return 20;
  }

  // 计算内存使用评分
  private rateMemoryUsage(performanceReport: PerformanceReport): number {
    const bottleneck = performanceReport.bottlenecks.find(b => b.type === 'memory_usage');

    if (!bottleneck) return 100;
    if (bottleneck.severity === 'low') return 80;
    if (bottleneck.severity === 'medium') return 60;
    if (bottleneck.severity === 'high') return 40;
    return 20;
  }

  // 计算布局评分
  private calculateLayoutScore(optimizationReport: OptimizationReport): number {
    const layoutSuggestions = optimizationReport.suggestions.filter(
      s => s.type === 'region_layout' || s.type === 'connection_structure'
    );

    if (layoutSuggestions.length === 0) return 100;
    if (layoutSuggestions.length <= 2) return 80;
    if (layoutSuggestions.length <= 4) return 60;
    if (layoutSuggestions.length <= 6) return 40;
    return 20;
  }

  // 计算分类评分
  private calculateCategoryScore(
    scores: number[],
    criteriaKeys: string[]
  ): number {
    let totalWeight = 0;
    let weightedSum = 0;

    criteriaKeys.forEach((key, index) => {
      const criteria = this.criteria[key];
      totalWeight += criteria.weight;
      weightedSum += scores[index] * criteria.weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // 计算总体评分
  private calculateOverallScore(scores: {
    gameplay: number;
    balance: number;
    performance: number;
    layout: number;
  }): number {
    return (
      scores.gameplay * 0.4 +
      scores.balance * 0.3 +
      scores.performance * 0.2 +
      scores.layout * 0.1
    );
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
} 