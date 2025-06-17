import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { MapSerializer, SerializedMap } from '../serialization/MapSerializer';
import { MapDeserializer } from '../serialization/MapDeserializer';

export class MapCache {
  private cache: Map<string, SerializedMap> = new Map();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 10, maxAge: number = 3600000) { // 默认缓存10个地图，1小时过期
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  async cacheMap(map: DungeonMap): Promise<void> {
    const serialized = MapSerializer.serialize(map);
    this.cache.set(map.id, serialized);

    // 检查缓存大小
    if (this.cache.size > this.maxSize) {
      // 删除最旧的缓存
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  async getMap(mapId: string): Promise<DungeonMap | null> {
    const serialized = this.cache.get(mapId);
    if (!serialized) {
      return null;
    }

    try {
      return await MapDeserializer.deserialize(serialized);
    } catch (error) {
      console.error(`Error deserializing map ${mapId}:`, error);
      this.cache.delete(mapId);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeFromCache(mapId: string): void {
    this.cache.delete(mapId);
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCachedMapIds(): string[] {
    return Array.from(this.cache.keys());
  }
} 