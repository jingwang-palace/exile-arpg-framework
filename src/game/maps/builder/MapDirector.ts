import { MapBuilder } from './MapBuilder';
import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

export class MapDirector {
  private builder: MapBuilder;

  constructor(builder: MapBuilder) {
    this.builder = builder;
  }

  async constructDungeonMap(id: string): Promise<IMap> {
    const spawnRegion = new SpawnRegion({
      id: `${id}_spawn`,
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200),
      difficulty: 1
    });

    const combatRegion = new DungeonRegion({
      id: `${id}_combat_1`,
      name: '战斗区域1',
      position: new Vector2D(400, 100),
      size: new Size(300, 300),
      difficulty: 2
    });

    const treasureRegion = new TreasureRegion({
      id: `${id}_treasure`,
      name: '宝箱区域',
      position: new Vector2D(400, 400),
      size: new Size(200, 200),
      difficulty: 2
    });

    const bossRegion = new BossRegion({
      id: `${id}_boss`,
      name: 'Boss区域',
      position: new Vector2D(700, 700),
      size: new Size(400, 400),
      difficulty: 5
    });

    return this.builder
      .setType(MapType.DUNGEON)
      .setName(`地下城 ${id}`)
      .addRegion(spawnRegion)
      .addRegion(combatRegion)
      .addRegion(treasureRegion)
      .addRegion(bossRegion)
      .addConnection(new RegionConnection({
        id: `${id}_spawn_to_combat`,
        type: ConnectionType.NORMAL,
        sourceRegion: spawnRegion,
        targetRegion: combatRegion,
        difficulty: 1
      }))
      .addConnection(new RegionConnection({
        id: `${id}_combat_to_treasure`,
        type: ConnectionType.NORMAL,
        sourceRegion: combatRegion,
        targetRegion: treasureRegion,
        difficulty: 2
      }))
      .addConnection(new RegionConnection({
        id: `${id}_treasure_to_boss`,
        type: ConnectionType.BOSS,
        sourceRegion: treasureRegion,
        targetRegion: bossRegion,
        difficulty: 3
      }))
      .build();
  }

  async constructBossMap(id: string): Promise<IMap> {
    const spawnRegion = new SpawnRegion({
      id: `${id}_spawn`,
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200),
      difficulty: 1
    });

    const bossRegion = new BossRegion({
      id: `${id}_boss`,
      name: 'Boss区域',
      position: new Vector2D(400, 400),
      size: new Size(400, 400),
      difficulty: 5
    });

    return this.builder
      .setType(MapType.BOSS)
      .setName(`Boss地图 ${id}`)
      .addRegion(spawnRegion)
      .addRegion(bossRegion)
      .addConnection(new RegionConnection({
        id: `${id}_spawn_to_boss`,
        type: ConnectionType.BOSS,
        sourceRegion: spawnRegion,
        targetRegion: bossRegion,
        difficulty: 3
      }))
      .build();
  }

  async constructSafeMap(id: string): Promise<IMap> {
    const spawnRegion = new SpawnRegion({
      id: `${id}_spawn`,
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200),
      difficulty: 1
    });

    const treasureRegion = new TreasureRegion({
      id: `${id}_treasure`,
      name: '宝箱区域',
      position: new Vector2D(400, 400),
      size: new Size(200, 200),
      difficulty: 1
    });

    return this.builder
      .setType(MapType.SAFE)
      .setName(`安全区域 ${id}`)
      .addRegion(spawnRegion)
      .addRegion(treasureRegion)
      .addConnection(new RegionConnection({
        id: `${id}_spawn_to_treasure`,
        type: ConnectionType.NORMAL,
        sourceRegion: spawnRegion,
        targetRegion: treasureRegion,
        difficulty: 1
      }))
      .build();
  }
} 