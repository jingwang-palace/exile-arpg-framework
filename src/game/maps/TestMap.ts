import { IMap } from '@/core/interfaces/IMapSystem';
import { SpawnRegion } from './regions/SpawnRegion';
import { DungeonRegion } from './regions/DungeonRegion';
import { TreasureRegion } from './regions/TreasureRegion';
import { BossRegion } from './regions/BossRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

export class TestMap implements IMap {
  private regions: Map<string, any> = new Map();
  private connections: Map<string, string[]> = new Map();
  private properties: Map<string, any> = new Map();
  private isActive: boolean = false;
  private lastUpdateTime: number = 0;

  constructor() {
    this.initializeRegions();
  }

  private initializeRegions(): void {
    // 创建出生点区域
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '出生点',
      position: new Vector2D(0, 0),
      size: new Size(100, 100),
      difficulty: 1
    });

    // 创建地下城区域
    const dungeonRegion = new DungeonRegion({
      id: 'dungeon',
      name: '地下城',
      position: new Vector2D(150, 0),
      size: new Size(200, 200),
      difficulty: 3
    });

    // 创建宝藏区域
    const treasureRegion = new TreasureRegion({
      id: 'treasure',
      name: '宝藏室',
      position: new Vector2D(0, 150),
      size: new Size(100, 100),
      difficulty: 2
    });

    // 创建Boss区域
    const bossRegion = new BossRegion({
      id: 'boss',
      name: 'Boss房间',
      position: new Vector2D(150, 150),
      size: new Size(200, 200),
      difficulty: 5
    });

    // 添加区域
    this.regions.set(spawnRegion.id, spawnRegion);
    this.regions.set(dungeonRegion.id, dungeonRegion);
    this.regions.set(treasureRegion.id, treasureRegion);
    this.regions.set(bossRegion.id, bossRegion);

    // 设置区域连接
    this.setupConnections();
  }

  private setupConnections(): void {
    // 设置区域之间的连接关系
    this.connections.set('spawn', ['dungeon', 'treasure']);
    this.connections.set('dungeon', ['spawn', 'boss']);
    this.connections.set('treasure', ['spawn', 'boss']);
    this.connections.set('boss', ['dungeon', 'treasure']);

    // 为每个区域设置连接
    this.connections.forEach((connectedRegions, regionId) => {
      const region = this.regions.get(regionId);
      if (region) {
        connectedRegions.forEach(connectedId => {
          region.addConnection(connectedId);
        });
      }
    });
  }

  async initialize(): Promise<void> {
    // 初始化所有区域
    for (const region of this.regions.values()) {
      await region.initialize();
    }
  }

  destroy(): void {
    // 清理所有区域
    for (const region of this.regions.values()) {
      region.destroy();
    }
  }

  getRegions(): any[] {
    return Array.from(this.regions.values());
  }

  getRegion(regionId: string): any {
    return this.regions.get(regionId);
  }

  getConnections(regionId: string): string[] {
    return this.connections.get(regionId) || [];
  }

  update(delta: number): void {
    this.lastUpdateTime = Date.now();
    this.isActive = true;

    // 更新所有区域
    for (const region of this.regions.values()) {
      region.update(delta);
    }
  }

  isMapActive(): boolean {
    return this.isActive;
  }

  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  getProperties(): Map<string, any> {
    return new Map(this.properties);
  }

  setProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }

  getProperty(key: string): any {
    return this.properties.get(key);
  }
} 