import { DungeonMap } from '../DungeonMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';

export class MapExamples {
  static async createSimpleDungeon(): Promise<DungeonMap> {
    console.log('Creating simple dungeon...');

    const map = new DungeonMap('simple_dungeon', new Size(600, 600));

    // 添加入口区域
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200)
    });
    map.addRegion(spawnRegion);

    // 添加战斗区域
    const dungeonRegion = new DungeonRegion({
      id: 'dungeon',
      name: '战斗区域',
      position: new Vector2D(400, 100),
      size: new Size(300, 300),
      difficulty: 2
    });
    map.addRegion(dungeonRegion);

    // 添加宝箱区域
    const treasureRegion = new TreasureRegion({
      id: 'treasure',
      name: '宝箱区域',
      position: new Vector2D(400, 400),
      size: new Size(200, 200)
    });
    map.addRegion(treasureRegion);

    // 添加连接
    const connection1 = new RegionConnection({
      id: 'conn1',
      type: ConnectionType.NORMAL,
      sourceRegion: spawnRegion,
      targetRegion: dungeonRegion
    });
    map.addConnection(connection1);

    const connection2 = new RegionConnection({
      id: 'conn2',
      type: ConnectionType.NORMAL,
      sourceRegion: dungeonRegion,
      targetRegion: treasureRegion
    });
    map.addConnection(connection2);

    await map.initialize();
    console.log('Simple dungeon created');

    return map;
  }

  static async createBossDungeon(): Promise<DungeonMap> {
    console.log('Creating boss dungeon...');

    const map = new DungeonMap('boss_dungeon', new Size(800, 800));

    // 添加入口区域
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200)
    });
    map.addRegion(spawnRegion);

    // 添加战斗区域
    const dungeonRegion1 = new DungeonRegion({
      id: 'dungeon1',
      name: '战斗区域1',
      position: new Vector2D(400, 100),
      size: new Size(300, 300),
      difficulty: 3
    });
    map.addRegion(dungeonRegion1);

    const dungeonRegion2 = new DungeonRegion({
      id: 'dungeon2',
      name: '战斗区域2',
      position: new Vector2D(400, 400),
      size: new Size(300, 300),
      difficulty: 4
    });
    map.addRegion(dungeonRegion2);

    // 添加Boss区域
    const bossRegion = new BossRegion({
      id: 'boss',
      name: 'Boss区域',
      position: new Vector2D(700, 700),
      size: new Size(400, 400),
      level: 1,
      difficulty: 5
    });
    map.addRegion(bossRegion);

    // 添加连接
    const connection1 = new RegionConnection({
      id: 'conn1',
      type: ConnectionType.NORMAL,
      sourceRegion: spawnRegion,
      targetRegion: dungeonRegion1
    });
    map.addConnection(connection1);

    const connection2 = new RegionConnection({
      id: 'conn2',
      type: ConnectionType.NORMAL,
      sourceRegion: dungeonRegion1,
      targetRegion: dungeonRegion2
    });
    map.addConnection(connection2);

    const connection3 = new RegionConnection({
      id: 'conn3',
      type: ConnectionType.BOSS,
      sourceRegion: dungeonRegion2,
      targetRegion: bossRegion
    });
    map.addConnection(connection3);

    await map.initialize();
    console.log('Boss dungeon created');

    return map;
  }

  static async createTreasureDungeon(): Promise<DungeonMap> {
    console.log('Creating treasure dungeon...');

    const map = new DungeonMap('treasure_dungeon', new Size(600, 600));

    // 添加入口区域
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200)
    });
    map.addRegion(spawnRegion);

    // 添加宝箱区域
    const treasureRegion1 = new TreasureRegion({
      id: 'treasure1',
      name: '宝箱区域1',
      position: new Vector2D(400, 100),
      size: new Size(200, 200)
    });
    map.addRegion(treasureRegion1);

    const treasureRegion2 = new TreasureRegion({
      id: 'treasure2',
      name: '宝箱区域2',
      position: new Vector2D(400, 400),
      size: new Size(200, 200)
    });
    map.addRegion(treasureRegion2);

    // 添加连接
    const connection1 = new RegionConnection({
      id: 'conn1',
      type: ConnectionType.NORMAL,
      sourceRegion: spawnRegion,
      targetRegion: treasureRegion1
    });
    map.addConnection(connection1);

    const connection2 = new RegionConnection({
      id: 'conn2',
      type: ConnectionType.NORMAL,
      sourceRegion: treasureRegion1,
      targetRegion: treasureRegion2
    });
    map.addConnection(connection2);

    await map.initialize();
    console.log('Treasure dungeon created');

    return map;
  }
} 