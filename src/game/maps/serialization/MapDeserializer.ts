import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { SerializedMap, SerializedRegion, SerializedConnection } from './MapSerializer';
import { SpawnRegion } from '../regions/SpawnRegion';
import { DungeonRegion } from '../regions/DungeonRegion';
import { TreasureRegion } from '../regions/TreasureRegion';
import { BossRegion } from '../regions/BossRegion';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';

export class MapDeserializer {
  static async deserialize(data: SerializedMap): Promise<IMap> {
    const map = new DungeonMap(data.id, data.size);
    
    // 设置基本属性
    map.type = data.type;
    map.name = data.name;
    map.level = data.level;
    map.difficulty = data.difficulty;
    map.properties = data.properties;

    // 反序列化区域
    const regions = new Map<string, IRegion>();
    for (const regionData of data.regions) {
      const region = await this.deserializeRegion(regionData);
      regions.set(region.id, region);
      map.addRegion(region);
    }

    // 反序列化连接
    for (const connectionData of data.connections) {
      const connection = this.deserializeConnection(connectionData, regions);
      map.addConnection(connection);
    }

    // 初始化地图
    await map.initialize();

    return map;
  }

  private static async deserializeRegion(data: SerializedRegion): Promise<IRegion> {
    let region: IRegion;

    switch (data.type) {
      case 'spawn':
        region = new SpawnRegion({
          id: data.id,
          name: data.name,
          position: data.position,
          size: data.size
        });
        break;
      case 'dungeon':
        region = new DungeonRegion({
          id: data.id,
          name: data.name,
          position: data.position,
          size: data.size,
          difficulty: data.properties.get('difficulty') || 1
        });
        break;
      case 'treasure':
        region = new TreasureRegion({
          id: data.id,
          name: data.name,
          position: data.position,
          size: data.size
        });
        break;
      case 'boss':
        region = new BossRegion({
          id: data.id,
          name: data.name,
          position: data.position,
          size: data.size,
          level: data.properties.get('level') || 1,
          difficulty: data.properties.get('difficulty') || 5
        });
        break;
      default:
        throw new Error(`Unknown region type: ${data.type}`);
    }

    region.properties = data.properties;
    return region;
  }

  private static deserializeConnection(
    data: SerializedConnection,
    regions: Map<string, IRegion>
  ): IConnection {
    const sourceRegion = regions.get(data.sourceRegionId);
    const targetRegion = regions.get(data.targetRegionId);

    if (!sourceRegion || !targetRegion) {
      throw new Error(`Region not found for connection ${data.id}`);
    }

    const connection = new RegionConnection({
      id: data.id,
      type: data.type as ConnectionType,
      sourceRegion,
      targetRegion
    });

    connection.properties = data.properties;
    return connection;
  }
} 