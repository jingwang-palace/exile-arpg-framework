import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { MapRegistry } from '../registry/MapRegistry';
import { MapFactory, MapFactoryConfig } from '../factory/MapFactory';
import { MapBuilder } from '../builder/MapBuilder';
import { MapDirector } from '../builder/MapDirector';
import { MapPrototype } from '../prototype/MapPrototype';
import { MapCache } from '../caching/MapCache';
import { MapPool } from '../pooling/MapPool';

export class MapManager {
  private registry: MapRegistry;
  private factory: MapFactory;
  private cache: MapCache;
  private pool: MapPool;
  private builder: MapBuilder;
  private director: MapDirector;
  private prototypes: Map<string, MapPrototype> = new Map();

  constructor(config: MapFactoryConfig) {
    this.factory = new MapFactory(config);
    this.registry = new MapRegistry(config);
    this.cache = new MapCache();
    this.pool = new MapPool(config);
    this.builder = new MapBuilder('', { width: 800, height: 800 });
    this.director = new MapDirector(this.builder);
  }

  async createMap(id: string, type: MapType = MapType.DUNGEON): Promise<IMap> {
    const map = await this.factory.createMap(id, type);
    await this.registry.registerMap(map);
    return map;
  }

  async createMapFromPrototype(prototypeId: string, modifications?: any): Promise<IMap> {
    const prototype = this.prototypes.get(prototypeId);
    if (!prototype) {
      throw new Error(`Prototype ${prototypeId} not found`);
    }

    const map = modifications
      ? await prototype.cloneWithModifications(modifications)
      : await prototype.clone();

    await this.registry.registerMap(map);
    return map;
  }

  async createMapFromBuilder(id: string, type: MapType): Promise<IMap> {
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
        throw new Error(`Unknown map type: ${type}`);
    }

    await this.registry.registerMap(map);
    return map;
  }

  async getMap(mapId: string): Promise<IMap | undefined> {
    return await this.registry.getMap(mapId);
  }

  async setCurrentMap(map: IMap): Promise<void> {
    this.registry.setCurrentMap(map);
  }

  getCurrentMap(): IMap | null {
    return this.registry.getCurrentMap();
  }

  registerPrototype(id: string, map: DungeonMap): void {
    this.prototypes.set(id, new MapPrototype(map));
  }

  async preloadMaps(mapId: string, count: number): Promise<void> {
    await this.pool.preloadMaps(mapId, count);
  }

  clearAll(): void {
    this.registry.clearRegistry();
    this.cache.clearCache();
    this.pool.clearPool();
    this.prototypes.clear();
  }

  getRegisteredMaps(): IMap[] {
    return this.registry.getRegisteredMaps();
  }

  getRegisteredMapIds(): string[] {
    return this.registry.getRegisteredMapIds();
  }

  getPrototypeIds(): string[] {
    return Array.from(this.prototypes.keys());
  }
} 