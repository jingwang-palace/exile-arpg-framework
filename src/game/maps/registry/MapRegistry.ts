import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { MapFactory, MapFactoryConfig } from '../factory/MapFactory';
import { MapCache } from '../caching/MapCache';
import { MapPool } from '../pooling/MapPool';

export class MapRegistry {
  private maps: Map<string, IMap> = new Map();
  private factory: MapFactory;
  private cache: MapCache;
  private pool: MapPool;
  private currentMap: IMap | null = null;

  constructor(config: MapFactoryConfig) {
    this.factory = new MapFactory(config);
    this.cache = new MapCache();
    this.pool = new MapPool(config);
  }

  async registerMap(map: IMap): Promise<void> {
    this.maps.set(map.id, map);
    await this.cache.cacheMap(map as DungeonMap);
  }

  async unregisterMap(mapId: string): Promise<void> {
    const map = this.maps.get(mapId);
    if (map) {
      map.destroy();
      this.maps.delete(mapId);
      this.cache.removeFromCache(mapId);
    }
  }

  async getMap(mapId: string): Promise<IMap | undefined> {
    // 先从内存中查找
    let map = this.maps.get(mapId);
    
    if (!map) {
      // 从缓存中查找
      map = await this.cache.getMap(mapId);
      
      if (!map) {
        // 从对象池中获取
        map = await this.pool.getMap(mapId);
      }
      
      if (map) {
        // 注册到内存中
        await this.registerMap(map);
      }
    }
    
    return map;
  }

  async createMap(id: string, type: MapType = MapType.DUNGEON): Promise<IMap> {
    const map = this.factory.createMap(id, type);
    await this.registerMap(map);
    return map;
  }

  setCurrentMap(map: IMap): void {
    this.currentMap = map;
  }

  getCurrentMap(): IMap | null {
    return this.currentMap;
  }

  getRegisteredMaps(): IMap[] {
    return Array.from(this.maps.values());
  }

  getRegisteredMapIds(): string[] {
    return Array.from(this.maps.keys());
  }

  clearRegistry(): void {
    this.maps.forEach(map => map.destroy());
    this.maps.clear();
    this.cache.clearCache();
    this.currentMap = null;
  }
} 