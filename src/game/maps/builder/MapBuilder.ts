import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { MapType } from '@/core/interfaces/IMapSystem';

export class MapBuilder {
  private map: DungeonMap;
  private regions: IRegion[] = [];
  private connections: IConnection[] = [];

  constructor(id: string, size: { width: number; height: number }) {
    this.map = new DungeonMap(id, size);
  }

  addRegion(region: IRegion): MapBuilder {
    this.regions.push(region);
    return this;
  }

  addConnection(connection: IConnection): MapBuilder {
    this.connections.push(connection);
    return this;
  }

  setType(type: MapType): MapBuilder {
    this.map.type = type;
    return this;
  }

  setName(name: string): MapBuilder {
    this.map.name = name;
    return this;
  }

  setProperty(key: string, value: any): MapBuilder {
    this.map.properties.set(key, value);
    return this;
  }

  async build(): Promise<IMap> {
    // 添加区域
    this.regions.forEach(region => {
      this.map.addRegion(region);
    });

    // 添加连接
    this.connections.forEach(connection => {
      this.map.addConnection(connection);
    });

    // 初始化地图
    await this.map.initialize();

    return this.map;
  }
} 