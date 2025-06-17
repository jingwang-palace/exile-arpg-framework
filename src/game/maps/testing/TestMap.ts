import { IMap } from '@/core/interfaces/IMapSystem';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

export class TestMap implements IMap {
  private regions: Map<string, any> = new Map();
  private connections: Map<string, string[]> = new Map();
  private properties: Map<string, any> = new Map();
  private isActive: boolean = false;
  private lastUpdateTime: number = 0;
  public readonly id: string = 'test-map';
  public readonly size: Size = new Size(800, 800); // 添加地图大小属性

  constructor() {
    this.initializeRegions();
  }

  private initializeRegions(): void {
    // 创建出生点区域 - 中心位置
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '出生点',
      position: new Vector2D(400, 300),
      size: new Size(100, 100),
      difficulty: 1
    });

    // 创建初级地下城区域 - 左上
    const dungeon1Region = new DungeonRegion({
      id: 'dungeon1',
      name: '初级地下城',
      position: new Vector2D(200, 100),
      size: new Size(150, 150),
      difficulty: 2
    });

    // 创建中级地下城区域 - 右上
    const dungeon2Region = new DungeonRegion({
      id: 'dungeon2',
      name: '中级地下城',
      position: new Vector2D(600, 100),
      size: new Size(150, 150),
      difficulty: 3
    });

    // 创建高级地下城区域 - 左下
    const dungeon3Region = new DungeonRegion({
      id: 'dungeon3',
      name: '高级地下城',
      position: new Vector2D(200, 500),
      size: new Size(150, 150),
      difficulty: 4
    });

    // 创建宝藏区域 - 右下
    const treasureRegion = new TreasureRegion({
      id: 'treasure',
      name: '宝藏室',
      position: new Vector2D(600, 500),
      size: new Size(150, 150),
      difficulty: 3
    });

    // 创建Boss区域 - 中心下方
    const bossRegion = new BossRegion({
      id: 'boss',
      name: 'Boss房间',
      position: new Vector2D(400, 600),
      size: new Size(200, 200),
      difficulty: 5
    });

    // 添加区域
    this.regions.set(spawnRegion.id, spawnRegion);
    this.regions.set(dungeon1Region.id, dungeon1Region);
    this.regions.set(dungeon2Region.id, dungeon2Region);
    this.regions.set(dungeon3Region.id, dungeon3Region);
    this.regions.set(treasureRegion.id, treasureRegion);
    this.regions.set(bossRegion.id, bossRegion);

    // 设置区域连接
    this.setupConnections();
  }

  private setupConnections(): void {
    // 设置区域之间的连接关系
    this.connections.set('spawn', ['dungeon1', 'dungeon2', 'dungeon3']); // 出生点可以通往三个地下城
    this.connections.set('dungeon1', ['spawn', 'dungeon2', 'treasure']); // 初级地下城可以通往中级地下城和宝藏室
    this.connections.set('dungeon2', ['spawn', 'dungeon1', 'dungeon3', 'boss']); // 中级地下城可以通往其他地下城和Boss
    this.connections.set('dungeon3', ['spawn', 'dungeon2', 'treasure', 'boss']); // 高级地下城可以通往中级地下城、宝藏室和Boss
    this.connections.set('treasure', ['dungeon1', 'dungeon3', 'boss']); // 宝藏室可以通往地下城和Boss
    this.connections.set('boss', ['dungeon2', 'dungeon3', 'treasure']); // Boss房间可以通往地下城和宝藏室

    // 为每个区域设置连接
    this.connections.forEach((connectedRegions, regionId) => {
      const region = this.regions.get(regionId);
      if (region) {
        // 将连接信息存储在区域的属性中
        region.setProperty('connections', connectedRegions);
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