import { IMap } from '@/core/interfaces/IMap';
import { MapState } from '../state/MapState';
import { MapSerializer, SerializedMap } from '../serialization/MapSerializer';
import { MapDeserializer } from '../serialization/MapDeserializer';

export class MapStorage {
  private static readonly STORAGE_KEY_PREFIX = 'map_';
  private static readonly STATE_KEY_PREFIX = 'map_state_';

  static async saveMap(map: IMap): Promise<void> {
    const serialized = MapSerializer.serialize(map as any);
    const key = this.STORAGE_KEY_PREFIX + map.id;
    localStorage.setItem(key, JSON.stringify(serialized));
  }

  static async loadMap(mapId: string): Promise<IMap | null> {
    const key = this.STORAGE_KEY_PREFIX + mapId;
    const data = localStorage.getItem(key);
    if (!data) {
      return null;
    }

    try {
      const serialized = JSON.parse(data) as SerializedMap;
      return await MapDeserializer.deserialize(serialized);
    } catch (error) {
      console.error(`Error loading map ${mapId}:`, error);
      return null;
    }
  }

  static async deleteMap(mapId: string): Promise<void> {
    const key = this.STORAGE_KEY_PREFIX + mapId;
    localStorage.removeItem(key);
  }

  static async saveMapState(mapId: string, state: MapState): Promise<void> {
    const key = this.STATE_KEY_PREFIX + mapId;
    localStorage.setItem(key, JSON.stringify(state));
  }

  static async loadMapState(mapId: string): Promise<MapState | null> {
    const key = this.STATE_KEY_PREFIX + mapId;
    const data = localStorage.getItem(key);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as MapState;
    } catch (error) {
      console.error(`Error loading map state ${mapId}:`, error);
      return null;
    }
  }

  static async deleteMapState(mapId: string): Promise<void> {
    const key = this.STATE_KEY_PREFIX + mapId;
    localStorage.removeItem(key);
  }

  static async listSavedMaps(): Promise<string[]> {
    const maps: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        maps.push(key.slice(this.STORAGE_KEY_PREFIX.length));
      }
    }
    return maps;
  }

  static async listSavedMapStates(): Promise<string[]> {
    const states: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STATE_KEY_PREFIX)) {
        states.push(key.slice(this.STATE_KEY_PREFIX.length));
      }
    }
    return states;
  }

  static async clearAllMaps(): Promise<void> {
    const maps = await this.listSavedMaps();
    for (const mapId of maps) {
      await this.deleteMap(mapId);
    }
  }

  static async clearAllMapStates(): Promise<void> {
    const states = await this.listSavedMapStates();
    for (const mapId of states) {
      await this.deleteMapState(mapId);
    }
  }

  static async clearAll(): Promise<void> {
    await this.clearAllMaps();
    await this.clearAllMapStates();
  }

  static async exportMap(map: IMap): Promise<string> {
    const serialized = MapSerializer.serialize(map as any);
    return JSON.stringify(serialized);
  }

  static async importMap(data: string): Promise<IMap | null> {
    try {
      const serialized = JSON.parse(data) as SerializedMap;
      return await MapDeserializer.deserialize(serialized);
    } catch (error) {
      console.error('Error importing map:', error);
      return null;
    }
  }

  static async exportMapState(state: MapState): Promise<string> {
    return JSON.stringify(state);
  }

  static async importMapState(data: string): Promise<MapState | null> {
    try {
      return JSON.parse(data) as MapState;
    } catch (error) {
      console.error('Error importing map state:', error);
      return null;
    }
  }
} 