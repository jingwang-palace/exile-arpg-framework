import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

export interface MapGenerationConfig {
  width: number;
  height: number;
  roomCount: number;
  difficulty: number;
  level: number;
}

export class MapGenerator {
  private config: MapGenerationConfig;

  constructor(config: MapGenerationConfig) {
    this.config = config;
  }

  generateMap(id: string): DungeonMap {
    const map = new DungeonMap(id, new Size(this.config.width, this.config.height));

    // 生成入口区域
    const spawnRegion = new SpawnRegion({
      id: `${id}_spawn`,
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200),
      difficulty: this.config.difficulty,
      level: this.config.level
    });
    map.addRegion(spawnRegion);

    // 生成战斗区域
    const combatRegions: DungeonRegion[] = [];
    for (let i = 0; i < this.config.roomCount; i++) {
      const region = new DungeonRegion({
        id: `${id}_combat_${i + 1}`,
        name: `战斗区域 ${i + 1}`,
        position: new Vector2D(100 + (i + 1) * 300, 100 + (i % 2) * 300),
        size: new Size(300, 300),
        difficulty: this.config.difficulty,
        level: this.config.level
      });
      combatRegions.push(region);
      map.addRegion(region);
    }

    // 生成宝箱区域
    const treasureRegion = new TreasureRegion({
      id: `${id}_treasure`,
      name: '宝箱区域',
      position: new Vector2D(100 + (this.config.roomCount + 1) * 300, 100),
      size: new Size(200, 200),
      difficulty: this.config.difficulty,
      level: this.config.level
    });
    map.addRegion(treasureRegion);

    // 生成Boss区域
    const bossRegion = new BossRegion({
      id: `${id}_boss`,
      name: 'Boss区域',
      position: new Vector2D(100 + (this.config.roomCount + 1) * 300, 400),
      size: new Size(400, 400),
      difficulty: this.config.difficulty + 2,
      level: this.config.level
    });
    map.addRegion(bossRegion);

    // 添加区域连接
    if (combatRegions.length > 0) {
      // 入口连接到第一个战斗区域
      const spawnToCombat = new RegionConnection({
        id: `${id}_conn_0`,
        type: ConnectionType.NORMAL,
        sourceRegion: spawnRegion,
        targetRegion: combatRegions[0],
        difficulty: this.config.difficulty
      });
      map.addConnection(spawnToCombat);

      // 战斗区域之间相互连接
      for (let i = 0; i < combatRegions.length - 1; i++) {
        const combatToCombat = new RegionConnection({
          id: `${id}_conn_${i + 1}`,
          type: ConnectionType.NORMAL,
          sourceRegion: combatRegions[i],
          targetRegion: combatRegions[i + 1],
          difficulty: this.config.difficulty
        });
        map.addConnection(combatToCombat);
      }

      // 最后一个战斗区域连接到宝箱区域
      const combatToTreasure = new RegionConnection({
        id: `${id}_conn_treasure`,
        type: ConnectionType.NORMAL,
        sourceRegion: combatRegions[combatRegions.length - 1],
        targetRegion: treasureRegion,
        difficulty: this.config.difficulty
      });
      map.addConnection(combatToTreasure);
    } else {
      // 如果没有战斗区域，直接连接入口和宝箱区域
      const spawnToTreasure = new RegionConnection({
        id: `${id}_conn_treasure`,
        type: ConnectionType.NORMAL,
        sourceRegion: spawnRegion,
        targetRegion: treasureRegion,
        difficulty: this.config.difficulty
      });
      map.addConnection(spawnToTreasure);
    }

    // 宝箱区域连接到Boss区域
    const treasureToBoss = new RegionConnection({
      id: `${id}_conn_boss`,
      type: ConnectionType.BOSS,
      sourceRegion: treasureRegion,
      targetRegion: bossRegion,
      difficulty: this.config.difficulty + 2
    });
    map.addConnection(treasureToBoss);

    return map;
  }

  generateRegions(): IRegion[] {
    const regions: IRegion[] = [];
    const roomSize = { width: 150, height: 150 };
    const padding = 50;

    // 生成战斗区域
    for (let i = 0; i < this.config.roomCount; i++) {
      const x = Math.random() * (this.config.width - roomSize.width - padding * 2) + padding;
      const y = Math.random() * (this.config.height - roomSize.height - padding * 2) + padding;

      // 这里需要根据你的具体实现来创建区域
      // regions.push(new DungeonRegion({...}));
    }

    return regions;
  }

  generateConnections(regions: IRegion[]): any[] {
    const connections: any[] = [];

    // 连接相邻的区域
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const region1 = regions[i];
        const region2 = regions[j];

        if (this.areRegionsAdjacent(region1, region2)) {
          // 这里需要根据你的具体实现来创建连接
          // connections.push(new RegionConnection({...}));
        }
      }
    }

    return connections;
  }

  private areRegionsAdjacent(region1: IRegion, region2: IRegion): boolean {
    const distance = Math.sqrt(
      Math.pow(region1.position.x - region2.position.x, 2) +
      Math.pow(region1.position.y - region2.position.y, 2)
    );

    return distance < 300; // 可以根据需要调整这个阈值
  }
} 