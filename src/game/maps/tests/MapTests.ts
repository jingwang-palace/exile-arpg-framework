import { DungeonMap } from '../DungeonMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';

export class MapTests {
  static async testMapCreation(): Promise<void> {
    console.log('Testing map creation...');

    // 创建地图
    const map = new DungeonMap('test_map', new Size(800, 800));
    console.log('Map created:', map.id);

    // 添加区域
    const spawnRegion = new SpawnRegion({
      id: 'spawn',
      name: '入口',
      position: new Vector2D(100, 100),
      size: new Size(200, 200)
    });
    map.addRegion(spawnRegion);
    console.log('Added spawn region');

    const dungeonRegion = new DungeonRegion({
      id: 'dungeon',
      name: '战斗区域',
      position: new Vector2D(400, 100),
      size: new Size(300, 300),
      difficulty: 2
    });
    map.addRegion(dungeonRegion);
    console.log('Added dungeon region');

    const treasureRegion = new TreasureRegion({
      id: 'treasure',
      name: '宝箱区域',
      position: new Vector2D(400, 400),
      size: new Size(200, 200)
    });
    map.addRegion(treasureRegion);
    console.log('Added treasure region');

    const bossRegion = new BossRegion({
      id: 'boss',
      name: 'Boss区域',
      position: new Vector2D(700, 700),
      size: new Size(400, 400),
      level: 1,
      difficulty: 5
    });
    map.addRegion(bossRegion);
    console.log('Added boss region');

    // 添加连接
    const connection1 = new RegionConnection({
      id: 'conn1',
      type: ConnectionType.NORMAL,
      sourceRegion: spawnRegion,
      targetRegion: dungeonRegion
    });
    map.addConnection(connection1);
    console.log('Added connection 1');

    const connection2 = new RegionConnection({
      id: 'conn2',
      type: ConnectionType.NORMAL,
      sourceRegion: dungeonRegion,
      targetRegion: treasureRegion
    });
    map.addConnection(connection2);
    console.log('Added connection 2');

    const connection3 = new RegionConnection({
      id: 'conn3',
      type: ConnectionType.BOSS,
      sourceRegion: treasureRegion,
      targetRegion: bossRegion
    });
    map.addConnection(connection3);
    console.log('Added connection 3');

    // 初始化地图
    await map.initialize();
    console.log('Map initialized');

    // 测试区域查找
    const foundRegion = map.getRegion('dungeon');
    console.log('Found region:', foundRegion?.name);

    // 测试连接查找
    const foundConnection = map.getConnection('conn1');
    console.log('Found connection:', foundConnection?.id);

    // 测试区域连接
    const connectedRegions = map.getConnectedRegions('dungeon');
    console.log('Connected regions:', connectedRegions.map(r => r.name));

    // 测试位置检查
    const position = new Vector2D(150, 150);
    const regionAtPosition = map.getRegionAtPosition(position);
    console.log('Region at position:', regionAtPosition?.name);

    // 清理地图
    map.destroy();
    console.log('Map destroyed');
  }

  static async runAllTests(): Promise<void> {
    console.log('Running all map tests...');
    await this.testMapCreation();
    console.log('All tests completed');
  }
} 