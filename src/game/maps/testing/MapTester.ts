import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { MapValidator, ValidationResult } from '../validation/MapValidator';

export interface TestResult {
  passed: boolean;
  tests: TestCase[];
  errors: TestError[];
}

export interface TestCase {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export interface TestError {
  message: string;
  testCase: string;
  details?: any;
}

export class MapTester {
  private map: DungeonMap;
  private validator: MapValidator;
  private results: TestResult;

  constructor(map: DungeonMap) {
    this.map = map;
    this.validator = new MapValidator(map);
    this.results = {
      passed: true,
      tests: [],
      errors: []
    };
  }

  runTests(): TestResult {
    // 重置测试结果
    this.results = {
      passed: true,
      tests: [],
      errors: []
    };

    // 运行所有测试
    this.testMapValidation();
    this.testRegionPlacement();
    this.testConnectionAccessibility();
    this.testTeleporterFunctionality();
    this.testPathFinding();
    this.testPerformance();

    // 更新测试状态
    this.results.passed = this.results.errors.length === 0;

    return this.results;
  }

  // 测试地图验证
  private testMapValidation(): void {
    const testCase: TestCase = {
      name: '地图验证',
      passed: true
    };

    try {
      const validationResult = this.validator.validate();
      testCase.passed = validationResult.isValid;
      
      if (!validationResult.isValid) {
        testCase.error = '地图验证失败';
        testCase.details = validationResult.errors;
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '地图验证过程出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 测试区域放置
  private testRegionPlacement(): void {
    const testCase: TestCase = {
      name: '区域放置',
      passed: true
    };

    try {
      const regions = this.map.getRegions();
      const spawnRegion = regions.find(region => region.type === 'spawn');
      const bossRegion = regions.find(region => region.type === 'boss');

      // 检查出生点和Boss区域的距离
      if (spawnRegion && bossRegion) {
        const distance = this.calculateRegionDistance(spawnRegion, bossRegion);
        if (distance < 500) {
          testCase.passed = false;
          testCase.error = '出生点和Boss区域距离过近';
          testCase.details = { distance };
        }
      }

      // 检查区域分布
      const distribution = this.checkRegionDistribution(regions);
      if (!distribution.isBalanced) {
        testCase.passed = false;
        testCase.error = '区域分布不均衡';
        testCase.details = distribution;
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '区域放置测试出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 测试连接可达性
  private testConnectionAccessibility(): void {
    const testCase: TestCase = {
      name: '连接可达性',
      passed: true
    };

    try {
      const regions = this.map.getRegions();
      const connections = this.map.getConnections();
      const visited = new Set<string>();

      // 从出生点开始遍历
      const spawnRegion = regions.find(region => region.type === 'spawn');
      if (!spawnRegion) {
        testCase.passed = false;
        testCase.error = '找不到出生点区域';
        return;
      }

      this.traverseRegions(spawnRegion, visited, connections);

      // 检查是否所有区域都可达
      const unreachableRegions = regions.filter(
        region => !visited.has(region.id)
      );

      if (unreachableRegions.length > 0) {
        testCase.passed = false;
        testCase.error = '存在不可达区域';
        testCase.details = {
          unreachableRegions: unreachableRegions.map(r => r.id)
        };
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '连接可达性测试出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 测试传送点功能
  private testTeleporterFunctionality(): void {
    const testCase: TestCase = {
      name: '传送点功能',
      passed: true
    };

    try {
      const connections = this.map.getConnections();
      const teleporters = connections.filter(
        connection => connection.type === ConnectionType.TELEPORTER
      );

      // 检查传送点循环
      const cycles = this.findTeleporterCycles(teleporters);
      if (cycles.length > 0) {
        testCase.passed = false;
        testCase.error = '存在传送点循环';
        testCase.details = { cycles };
      }

      // 检查传送点分布
      const distribution = this.checkTeleporterDistribution(teleporters);
      if (!distribution.isBalanced) {
        testCase.passed = false;
        testCase.error = '传送点分布不均衡';
        testCase.details = distribution;
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '传送点功能测试出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 测试寻路
  private testPathFinding(): void {
    const testCase: TestCase = {
      name: '寻路测试',
      passed: true
    };

    try {
      const regions = this.map.getRegions();
      const spawnRegion = regions.find(region => region.type === 'spawn');
      const bossRegion = regions.find(region => region.type === 'boss');

      if (spawnRegion && bossRegion) {
        const path = this.findPath(spawnRegion, bossRegion);
        if (!path) {
          testCase.passed = false;
          testCase.error = '无法找到从出生点到Boss的路径';
        } else if (path.length > 10) {
          testCase.passed = false;
          testCase.error = '从出生点到Boss的路径过长';
          testCase.details = { pathLength: path.length };
        }
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '寻路测试出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 测试性能
  private testPerformance(): void {
    const testCase: TestCase = {
      name: '性能测试',
      passed: true
    };

    try {
      const startTime = performance.now();

      // 执行一系列操作来测试性能
      this.map.getRegions();
      this.map.getConnections();
      this.validator.validate();
      this.findPath(
        this.map.getRegions()[0],
        this.map.getRegions()[this.map.getRegions().length - 1]
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 1000) {
        testCase.passed = false;
        testCase.error = '性能测试超时';
        testCase.details = { duration };
      }
    } catch (error) {
      testCase.passed = false;
      testCase.error = '性能测试出错';
      testCase.details = error;
    }

    this.addTestResult(testCase);
  }

  // 辅助方法：计算区域距离
  private calculateRegionDistance(region1: IRegion, region2: IRegion): number {
    const center1 = {
      x: region1.position.x + region1.size.width / 2,
      y: region1.position.y + region1.size.height / 2
    };
    const center2 = {
      x: region2.position.x + region2.size.width / 2,
      y: region2.position.y + region2.size.height / 2
    };

    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );
  }

  // 辅助方法：检查区域分布
  private checkRegionDistribution(regions: IRegion[]): {
    isBalanced: boolean;
    details: any;
  } {
    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    const centerX = this.map.size.width / 2;
    const centerY = this.map.size.height / 2;

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

    const total = regions.length;
    const expected = total / 4;
    const threshold = expected * 0.5;

    const isBalanced = Object.values(quadrants).every(
      count => Math.abs(count - expected) <= threshold
    );

    return {
      isBalanced,
      details: {
        quadrants,
        expected,
        threshold
      }
    };
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

  // 辅助方法：查找传送点循环
  private findTeleporterCycles(teleporters: RegionConnection[]): string[][] {
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

      const connectedTeleporters = teleporters.filter(
        t => t.sourceRegion.id === regionId || t.targetRegion.id === regionId
      );

      connectedTeleporters.forEach(teleporter => {
        const nextRegionId = teleporter.sourceRegion.id === regionId
          ? teleporter.targetRegion.id
          : teleporter.sourceRegion.id;
        findCycles(nextRegionId);
      });

      path.pop();
    };

    teleporters.forEach(teleporter => {
      if (!visited.has(teleporter.sourceRegion.id)) {
        findCycles(teleporter.sourceRegion.id);
      }
    });

    return cycles;
  }

  // 辅助方法：检查传送点分布
  private checkTeleporterDistribution(teleporters: RegionConnection[]): {
    isBalanced: boolean;
    details: any;
  } {
    const regionCounts = new Map<string, number>();

    teleporters.forEach(teleporter => {
      const sourceCount = regionCounts.get(teleporter.sourceRegion.id) || 0;
      const targetCount = regionCounts.get(teleporter.targetRegion.id) || 0;
      regionCounts.set(teleporter.sourceRegion.id, sourceCount + 1);
      regionCounts.set(teleporter.targetRegion.id, targetCount + 1);
    });

    const counts = Array.from(regionCounts.values());
    const average = counts.reduce((a, b) => a + b, 0) / counts.length;
    const threshold = average * 0.5;

    const isBalanced = counts.every(
      count => Math.abs(count - average) <= threshold
    );

    return {
      isBalanced,
      details: {
        counts: Object.fromEntries(regionCounts),
        average,
        threshold
      }
    };
  }

  // 辅助方法：寻路算法
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

  // 添加测试结果
  private addTestResult(testCase: TestCase): void {
    this.results.tests.push(testCase);

    if (!testCase.passed) {
      this.results.errors.push({
        message: testCase.error || '测试失败',
        testCase: testCase.name,
        details: testCase.details
      });
    }
  }
} 