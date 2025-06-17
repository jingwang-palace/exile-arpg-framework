import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapGenerator, MapGenerationConfig } from '../generation/MapGenerator';

export class MapPool {
  private pool: Map<string, IMap[]> = new Map();
  private generator: MapGenerator;
  private config: MapGenerationConfig;

  constructor(config: MapGenerationConfig) {
    this.config = config;
    this.generator = new MapGenerator(config);
  }

  async getMap(mapId: string): Promise<IMap> {
    // 检查池中是否有可用的地图
    const availableMaps = this.pool.get(mapId) || [];
    if (availableMaps.length > 0) {
      const map = availableMaps.pop()!;
      await map.initialize();
      return map;
    }

    // 如果没有可用的地图，生成一个新的
    const map = this.generator.generateMap(mapId);
    await map.initialize();
    return map;
  }

  async returnMap(map: IMap): Promise<void> {
    // 重置地图状态
    map.destroy();
    await map.initialize();

    // 将地图放回池中
    const maps = this.pool.get(map.id) || [];
    maps.push(map);
    this.pool.set(map.id, maps);
  }

  async preloadMaps(mapId: string, count: number): Promise<void> {
    const maps: IMap[] = [];
    
    // 生成指定数量的地图
    for (let i = 0; i < count; i++) {
      const map = this.generator.generateMap(`${mapId}_${i}`);
      await map.initialize();
      maps.push(map);
    }

    // 将生成的地图放入池中
    this.pool.set(mapId, maps);
  }

  clearPool(): void {
    this.pool.clear();
  }

  getPoolSize(mapId: string): number {
    return (this.pool.get(mapId) || []).length;
  }

  getTotalPoolSize(): number {
    return Array.from(this.pool.values()).reduce(
      (total, maps) => total + maps.length,
      0
    );
  }
} 