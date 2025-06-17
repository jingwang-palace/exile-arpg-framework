import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';

export interface MapIndexEntry {
  id: string;
  type: MapType;
  name: string;
  level: number;
  difficulty: number;
  regions: string[];
  connections: string[];
  properties: Map<string, any>;
}

export class MapIndex {
  private index: Map<string, MapIndexEntry> = new Map();
  private typeIndex: Map<MapType, Set<string>> = new Map();
  private levelIndex: Map<number, Set<string>> = new Map();
  private difficultyIndex: Map<number, Set<string>> = new Map();

  indexMap(map: IMap): void {
    const entry: MapIndexEntry = {
      id: map.id,
      type: map.type,
      name: map.name,
      level: map.level,
      difficulty: map.difficulty,
      regions: map.regions.map(r => r.id),
      connections: map.connections.map(c => c.id),
      properties: map.properties
    };

    // 更新主索引
    this.index.set(map.id, entry);

    // 更新类型索引
    if (!this.typeIndex.has(map.type)) {
      this.typeIndex.set(map.type, new Set());
    }
    this.typeIndex.get(map.type)!.add(map.id);

    // 更新等级索引
    if (!this.levelIndex.has(map.level)) {
      this.levelIndex.set(map.level, new Set());
    }
    this.levelIndex.get(map.level)!.add(map.id);

    // 更新难度索引
    if (!this.difficultyIndex.has(map.difficulty)) {
      this.difficultyIndex.set(map.difficulty, new Set());
    }
    this.difficultyIndex.get(map.difficulty)!.add(map.id);
  }

  removeFromIndex(mapId: string): void {
    const entry = this.index.get(mapId);
    if (entry) {
      // 从主索引中移除
      this.index.delete(mapId);

      // 从类型索引中移除
      this.typeIndex.get(entry.type)?.delete(mapId);

      // 从等级索引中移除
      this.levelIndex.get(entry.level)?.delete(mapId);

      // 从难度索引中移除
      this.difficultyIndex.get(entry.difficulty)?.delete(mapId);
    }
  }

  getMapEntry(mapId: string): MapIndexEntry | undefined {
    return this.index.get(mapId);
  }

  getMapsByType(type: MapType): string[] {
    return Array.from(this.typeIndex.get(type) || []);
  }

  getMapsByLevel(level: number): string[] {
    return Array.from(this.levelIndex.get(level) || []);
  }

  getMapsByDifficulty(difficulty: number): string[] {
    return Array.from(this.difficultyIndex.get(difficulty) || []);
  }

  getMapsByLevelRange(minLevel: number, maxLevel: number): string[] {
    const maps: string[] = [];
    for (let level = minLevel; level <= maxLevel; level++) {
      maps.push(...this.getMapsByLevel(level));
    }
    return maps;
  }

  getMapsByDifficultyRange(minDifficulty: number, maxDifficulty: number): string[] {
    const maps: string[] = [];
    for (let difficulty = minDifficulty; difficulty <= maxDifficulty; difficulty++) {
      maps.push(...this.getMapsByDifficulty(difficulty));
    }
    return maps;
  }

  clearIndex(): void {
    this.index.clear();
    this.typeIndex.clear();
    this.levelIndex.clear();
    this.difficultyIndex.clear();
  }

  getIndexedMapIds(): string[] {
    return Array.from(this.index.keys());
  }

  getIndexedMapCount(): number {
    return this.index.size;
  }
} 