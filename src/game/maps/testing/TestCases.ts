import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';

export interface TestCase {
  name: string;
  description: string;
  category: TestCategory;
  run: (map: DungeonMap) => TestResult;
}

export interface TestResult {
  passed: boolean;
  message?: string;
  details?: any;
}

export enum TestCategory {
  VALIDATION = 'validation',
  BALANCE = 'balance',
  GAMEPLAY = 'gameplay',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

export class TestCaseManager {
  private testCases: TestCase[];

  constructor() {
    this.testCases = this.initializeTestCases();
  }

  private initializeTestCases(): TestCase[] {
    return [
      // 验证类测试
      {
        name: '地图大小验证',
        description: '验证地图尺寸是否在合理范围内',
        category: TestCategory.VALIDATION,
        run: (map: DungeonMap) => {
          const { width, height } = map.size;
          if (width <= 0 || height <= 0) {
            return {
              passed: false,
              message: '地图尺寸无效',
              details: { width, height }
            };
          }
          if (width > 2000 || height > 2000) {
            return {
              passed: false,
              message: '地图尺寸过大',
              details: { width, height }
            };
          }
          return { passed: true };
        }
      },

      // 平衡性测试
      {
        name: '区域分布平衡',
        description: '检查区域在地图中的分布是否均衡',
        category: TestCategory.BALANCE,
        run: (map: DungeonMap) => {
          const regions = map.getRegions();
          const quadrants = this.analyzeRegionDistribution(regions, map.size);
          const isBalanced = this.checkDistributionBalance(quadrants);

          return {
            passed: isBalanced,
            message: isBalanced ? '区域分布均衡' : '区域分布不均衡',
            details: { quadrants }
          };
        }
      },

      // 游戏性测试
      {
        name: '路径长度测试',
        description: '检查从出生点到Boss的路径长度是否合理',
        category: TestCategory.GAMEPLAY,
        run: (map: DungeonMap) => {
          const path = this.findPathToBoss(map);
          if (!path) {
            return {
              passed: false,
              message: '无法找到从出生点到Boss的路径'
            };
          }

          const isReasonable = path.length >= 3 && path.length <= 10;
          return {
            passed: isReasonable,
            message: isReasonable ? '路径长度合理' : '路径长度不合理',
            details: { pathLength: path.length }
          };
        }
      },

      // 性能测试
      {
        name: '区域数量测试',
        description: '检查区域数量是否在合理范围内',
        category: TestCategory.PERFORMANCE,
        run: (map: DungeonMap) => {
          const regions = map.getRegions();
          const isReasonable = regions.length >= 5 && regions.length <= 20;

          return {
            passed: isReasonable,
            message: isReasonable ? '区域数量合理' : '区域数量不合理',
            details: { regionCount: regions.length }
          };
        }
      },

      // 安全性测试
      {
        name: '区域隔离测试',
        description: '检查是否存在完全隔离的区域',
        category: TestCategory.SECURITY,
        run: (map: DungeonMap) => {
          const isolatedRegions = this.findIsolatedRegions(map);
          return {
            passed: isolatedRegions.length === 0,
            message: isolatedRegions.length === 0 ? '没有隔离区域' : '存在隔离区域',
            details: { isolatedRegions }
          };
        }
      },

      // 更多验证类测试
      {
        name: '必需区域验证',
        description: '检查地图是否包含所有必需的区域类型',
        category: TestCategory.VALIDATION,
        run: (map: DungeonMap) => {
          const regions = map.getRegions();
          const hasSpawn = regions.some(r => r.type === 'spawn');
          const hasBoss = regions.some(r => r.type === 'boss');
          const hasTreasure = regions.some(r => r.type === 'treasure');

          const missing = [];
          if (!hasSpawn) missing.push('出生点');
          if (!hasBoss) missing.push('Boss区域');
          if (!hasTreasure) missing.push('宝箱区域');

          return {
            passed: missing.length === 0,
            message: missing.length === 0 ? '包含所有必需区域' : '缺少必需区域',
            details: { missing }
          };
        }
      },

      // 更多平衡性测试
      {
        name: '难度曲线测试',
        description: '检查区域难度是否呈现合理的递进关系',
        category: TestCategory.BALANCE,
        run: (map: DungeonMap) => {
          const difficultyCurve = this.analyzeDifficultyCurve(map);
          const isReasonable = this.checkDifficultyCurve(difficultyCurve);

          return {
            passed: isReasonable,
            message: isReasonable ? '难度曲线合理' : '难度曲线不合理',
            details: { difficultyCurve }
          };
        }
      },

      // 更多游戏性测试
      {
        name: '传送点分布测试',
        description: '检查传送点的分布是否合理',
        category: TestCategory.GAMEPLAY,
        run: (map: DungeonMap) => {
          const teleporterDistribution = this.analyzeTeleporterDistribution(map);
          const isReasonable = this.checkTeleporterDistribution(teleporterDistribution);

          return {
            passed: isReasonable,
            message: isReasonable ? '传送点分布合理' : '传送点分布不合理',
            details: { teleporterDistribution }
          };
        }
      },

      // 更多性能测试
      {
        name: '连接数量测试',
        description: '检查区域连接数量是否合理',
        category: TestCategory.PERFORMANCE,
        run: (map: DungeonMap) => {
          const connectionCounts = this.analyzeConnectionCounts(map);
          const isReasonable = this.checkConnectionCounts(connectionCounts);

          return {
            passed: isReasonable,
            message: isReasonable ? '连接数量合理' : '连接数量不合理',
            details: { connectionCounts }
          };
        }
      },

      // 更多安全性测试
      {
        name: '循环路径测试',
        description: '检查是否存在不合理的循环路径',
        category: TestCategory.SECURITY,
        run: (map: DungeonMap) => {
          const cycles = this.findCycles(map);
          const isReasonable = this.checkCycles(cycles);

          return {
            passed: isReasonable,
            message: isReasonable ? '循环路径合理' : '存在不合理的循环路径',
            details: { cycles }
          };
        }
      }
    ];
  }

  // 获取所有测试用例
  getAllTestCases(): TestCase[] {
    return this.testCases;
  }

  // 按类别获取测试用例
  getTestCasesByCategory(category: TestCategory): TestCase[] {
    return this.testCases.filter(test => test.category === category);
  }

  // 运行所有测试
  runAllTests(map: DungeonMap): Map<string, TestResult> {
    const results = new Map<string, TestResult>();
    this.testCases.forEach(test => {
      results.set(test.name, test.run(map));
    });
    return results;
  }

  // 运行指定类别的测试
  runTestsByCategory(map: DungeonMap, category: TestCategory): Map<string, TestResult> {
    const results = new Map<string, TestResult>();
    this.getTestCasesByCategory(category).forEach(test => {
      results.set(test.name, test.run(map));
    });
    return results;
  }

  // 辅助方法：分析区域分布
  private analyzeRegionDistribution(regions: IRegion[], mapSize: { width: number; height: number }): {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  } {
    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    const centerX = mapSize.width / 2;
    const centerY = mapSize.height / 2;

    regions.forEach(region => {
      const center = {
        x: region.position.x + region.size.width / 2,
        y: region.position.y + region.size.height / 2
      };

      if (center.x < centerX && center.y < centerY) quadrants.topLeft++;
      else if (center.x >= centerX && center.y < centerY) quadrants.topRight++;
      else if (center.x < centerX && center.y >= centerY) quadrants.bottomLeft++;
      else quadrants.bottomRight++;
    });

    return quadrants;
  }

  // 辅助方法：检查分布平衡
  private checkDistributionBalance(quadrants: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  }): boolean {
    const values = Object.values(quadrants);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = average * 0.5;

    return values.every(value => Math.abs(value - average) <= threshold);
  }

  // 辅助方法：查找到Boss的路径
  private findPathToBoss(map: DungeonMap): IRegion[] | null {
    const regions = map.getRegions();
    const spawnRegion = regions.find(r => r.type === 'spawn');
    const bossRegion = regions.find(r => r.type === 'boss');

    if (!spawnRegion || !bossRegion) return null;

    return this.findPath(spawnRegion, bossRegion, map);
  }

  // 辅助方法：寻路算法
  private findPath(start: IRegion, end: IRegion, map: DungeonMap): IRegion[] | null {
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

      const connections = map.getConnections().filter(
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

  // 辅助方法：查找隔离区域
  private findIsolatedRegions(map: DungeonMap): IRegion[] {
    const regions = map.getRegions();
    const connections = map.getConnections();
    const visited = new Set<string>();

    // 从出生点开始遍历
    const spawnRegion = regions.find(r => r.type === 'spawn');
    if (spawnRegion) {
      this.traverseRegions(spawnRegion, visited, connections);
    }

    // 返回未访问的区域
    return regions.filter(region => !visited.has(region.id));
  }

  // 辅助方法：遍历区域
  private traverseRegions(
    region: IRegion,
    visited: Set<string>,
    connections: RegionConnection[]
  ): void {
    if (visited.has(region.id)) return;

    visited.add(region.id);

    const connectedRegions = connections
      .filter(connection => 
        connection.sourceRegion.id === region.id ||
        connection.targetRegion.id === region.id
      )
      .map(connection =>
        connection.sourceRegion.id === region.id
          ? connection.targetRegion
          : connection.sourceRegion
      );

    connectedRegions.forEach(connectedRegion => {
      this.traverseRegions(connectedRegion, visited, connections);
    });
  }

  // 辅助方法：分析难度曲线
  private analyzeDifficultyCurve(map: DungeonMap): number[] {
    const regions = map.getRegions();
    const spawnRegion = regions.find(r => r.type === 'spawn');
    if (!spawnRegion) return [];

    const path = this.findPathToBoss(map);
    if (!path) return [];

    return path.map(region => {
      switch (region.type) {
        case 'combat':
          return 1;
        case 'boss':
          return 3;
        case 'treasure':
          return 0.5;
        default:
          return 0;
      }
    });
  }

  // 辅助方法：检查难度曲线
  private checkDifficultyCurve(curve: number[]): boolean {
    if (curve.length < 3) return false;

    // 检查难度是否总体呈上升趋势
    let increasing = true;
    for (let i = 1; i < curve.length; i++) {
      if (curve[i] < curve[i - 1]) {
        increasing = false;
        break;
      }
    }

    return increasing;
  }

  // 辅助方法：分析传送点分布
  private analyzeTeleporterDistribution(map: DungeonMap): {
    count: number;
    distribution: { [key: string]: number };
  } {
    const connections = map.getConnections();
    const teleporters = connections.filter(
      connection => connection.type === ConnectionType.TELEPORTER
    );

    const distribution: { [key: string]: number } = {};
    teleporters.forEach(teleporter => {
      const sourceId = teleporter.sourceRegion.id;
      const targetId = teleporter.targetRegion.id;
      distribution[sourceId] = (distribution[sourceId] || 0) + 1;
      distribution[targetId] = (distribution[targetId] || 0) + 1;
    });

    return {
      count: teleporters.length,
      distribution
    };
  }

  // 辅助方法：检查传送点分布
  private checkTeleporterDistribution(distribution: {
    count: number;
    distribution: { [key: string]: number };
  }): boolean {
    // 检查传送点总数
    if (distribution.count > 5) return false;

    // 检查每个区域的传送点数量
    const values = Object.values(distribution.distribution);
    const maxPerRegion = Math.max(...values);
    return maxPerRegion <= 2;
  }

  // 辅助方法：分析连接数量
  private analyzeConnectionCounts(map: DungeonMap): {
    total: number;
    perRegion: { [key: string]: number };
  } {
    const connections = map.getConnections();
    const perRegion: { [key: string]: number } = {};

    connections.forEach(connection => {
      const sourceId = connection.sourceRegion.id;
      const targetId = connection.targetRegion.id;
      perRegion[sourceId] = (perRegion[sourceId] || 0) + 1;
      perRegion[targetId] = (perRegion[targetId] || 0) + 1;
    });

    return {
      total: connections.length,
      perRegion
    };
  }

  // 辅助方法：检查连接数量
  private checkConnectionCounts(counts: {
    total: number;
    perRegion: { [key: string]: number };
  }): boolean {
    // 检查总连接数
    if (counts.total < 5 || counts.total > 30) return false;

    // 检查每个区域的连接数
    const values = Object.values(counts.perRegion);
    const maxPerRegion = Math.max(...values);
    const minPerRegion = Math.min(...values);

    return maxPerRegion <= 4 && minPerRegion >= 1;
  }

  // 辅助方法：查找循环
  private findCycles(map: DungeonMap): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const path: string[] = [];

    const findCycles = (regionId: string) => {
      if (path.includes(regionId)) {
        const cycle = path.slice(path.indexOf(regionId));
        cycles.push(cycle);
        return;
      }

      if (visited.has(regionId)) return;

      visited.add(regionId);
      path.push(regionId);

      const connections = map.getConnections().filter(
        connection => 
          connection.sourceRegion.id === regionId ||
          connection.targetRegion.id === regionId
      );

      connections.forEach(connection => {
        const nextRegionId = connection.sourceRegion.id === regionId
          ? connection.targetRegion.id
          : connection.sourceRegion.id;
        findCycles(nextRegionId);
      });

      path.pop();
    };

    map.getRegions().forEach(region => {
      if (!visited.has(region.id)) {
        findCycles(region.id);
      }
    });

    return cycles;
  }

  // 辅助方法：检查循环
  private checkCycles(cycles: string[][]): boolean {
    // 检查循环长度
    return cycles.every(cycle => cycle.length >= 3 && cycle.length <= 5);
  }
} 