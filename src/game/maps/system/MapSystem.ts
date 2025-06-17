import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { MapManager } from '../management/MapManager';
import { MapFactoryConfig } from '../factory/MapFactory';
import { MapSerializer } from '../serialization/MapSerializer';
import { MapDeserializer } from '../serialization/MapDeserializer';

export class MapSystem {
  private manager: MapManager;
  private config: MapFactoryConfig;

  constructor(config: MapFactoryConfig) {
    this.config = config;
    this.manager = new MapManager(config);
  }

  async initialize(): Promise<void> {
    // 预加载一些基础地图
    await this.manager.preloadMaps('dungeon_1', 3);
    await this.manager.preloadMaps('boss_1', 2);
    await this.manager.preloadMaps('safe_1', 2);
  }

  async createMap(id: string, type: MapType = MapType.DUNGEON): Promise<IMap> {
    return await this.manager.createMap(id, type);
  }

  async createMapFromPrototype(prototypeId: string, modifications?: any): Promise<IMap> {
    return await this.manager.createMapFromPrototype(prototypeId, modifications);
  }

  async createMapFromBuilder(id: string, type: MapType): Promise<IMap> {
    return await this.manager.createMapFromBuilder(id, type);
  }

  async getMap(mapId: string): Promise<IMap | undefined> {
    return await this.manager.getMap(mapId);
  }

  async setCurrentMap(map: IMap): Promise<void> {
    await this.manager.setCurrentMap(map);
  }

  getCurrentMap(): IMap | null {
    return this.manager.getCurrentMap();
  }

  async saveMap(map: IMap): Promise<string> {
    const serialized = MapSerializer.serialize(map as DungeonMap);
    return JSON.stringify(serialized);
  }

  async loadMap(data: string): Promise<IMap> {
    const serialized = JSON.parse(data);
    const map = await MapDeserializer.deserialize(serialized);
    await this.manager.registerPrototype(map.id, map as DungeonMap);
    return map;
  }

  async preloadMaps(mapId: string, count: number): Promise<void> {
    await this.manager.preloadMaps(mapId, count);
  }

  clearAll(): void {
    this.manager.clearAll();
  }

  getRegisteredMaps(): IMap[] {
    return this.manager.getRegisteredMaps();
  }

  getRegisteredMapIds(): string[] {
    return this.manager.getRegisteredMapIds();
  }

  getPrototypeIds(): string[] {
    return this.manager.getPrototypeIds();
  }
} 