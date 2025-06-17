import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { MapBuilder } from '../maps/builder/MapBuilder';
import { MapDirector } from '../maps/builder/MapDirector';

export class MapSystem {
  private maps: Map<string, IMap>;
  private builder: MapBuilder;
  private director: MapDirector;

  constructor() {
    this.maps = new Map();
    this.builder = new MapBuilder();
    this.director = new MapDirector(this.builder);
  }

  async createMap(type: MapType, id: string): Promise<IMap> {
    let map: IMap;

    switch (type) {
      case MapType.DUNGEON:
        map = await this.director.constructDungeonMap(id);
        break;
      case MapType.BOSS:
        map = await this.director.constructBossMap(id);
        break;
      case MapType.SAFE:
        map = await this.director.constructSafeMap(id);
        break;
      default:
        throw new Error(`未知的地图类型: ${type}`);
    }

    this.maps.set(id, map);
    return map;
  }

  getMap(id: string): IMap | undefined {
    return this.maps.get(id);
  }

  getAllMaps(): IMap[] {
    return Array.from(this.maps.values());
  }

  removeMap(id: string): boolean {
    return this.maps.delete(id);
  }

  clearMaps(): void {
    this.maps.clear();
  }
} 