import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { MapStorage } from '../storage/MapStorage';
import { MapState } from '../state/MapState';
import { MapStateManager } from '../state/MapState';
import { MapValidator } from '../validation/MapValidator';
import { MapEvents, MapEventManager, MapEventTypes, MapEventFactory } from '../events/MapEvents';

export class MapLoader {
  private eventManager: MapEventManager;

  constructor() {
    this.eventManager = new MapEventManager();
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    this.eventManager.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    this.eventManager.removeEventListener(type, listener);
  }

  async loadMap(mapId: string): Promise<{ map: IMap; state: MapState } | null> {
    try {
      // 加载地图
      const map = await MapStorage.loadMap(mapId);
      if (!map) {
        console.error(`Map ${mapId} not found`);
        return null;
      }

      // 验证地图
      const errors = MapValidator.validateMap(map);
      if (errors.length > 0) {
        console.error(`Map ${mapId} validation failed:`, errors);
        return null;
      }

      // 加载地图状态
      const state = await MapStorage.loadMapState(mapId);
      if (!state) {
        console.log(`No saved state found for map ${mapId}, creating new state`);
        return { map, state: new MapStateManager(map).getState() };
      }

      // 验证状态
      if (state.id !== map.id) {
        console.error(`State ID mismatch for map ${mapId}`);
        return null;
      }

      this.eventManager.dispatchEvent(MapEventFactory.createMapInitializedEvent(map));
      return { map, state };
    } catch (error) {
      console.error(`Error loading map ${mapId}:`, error);
      return null;
    }
  }

  async saveMap(map: IMap, state: MapState): Promise<boolean> {
    try {
      // 验证地图
      const errors = MapValidator.validateMap(map);
      if (errors.length > 0) {
        console.error(`Map ${map.id} validation failed:`, errors);
        return false;
      }

      // 保存地图
      await MapStorage.saveMap(map);

      // 保存状态
      await MapStorage.saveMapState(map.id, state);

      this.eventManager.dispatchEvent(MapEventFactory.createMapUpdatedEvent(map));
      return true;
    } catch (error) {
      console.error(`Error saving map ${map.id}:`, error);
      return false;
    }
  }

  async deleteMap(mapId: string): Promise<boolean> {
    try {
      // 删除地图
      await MapStorage.deleteMap(mapId);

      // 删除状态
      await MapStorage.deleteMapState(mapId);

      return true;
    } catch (error) {
      console.error(`Error deleting map ${mapId}:`, error);
      return false;
    }
  }

  async listSavedMaps(): Promise<string[]> {
    return await MapStorage.listSavedMaps();
  }

  async listSavedMapStates(): Promise<string[]> {
    return await MapStorage.listSavedMapStates();
  }

  async clearAll(): Promise<void> {
    await MapStorage.clearAll();
  }

  async exportMap(map: IMap, state: MapState): Promise<string> {
    try {
      const mapData = await MapStorage.exportMap(map);
      const stateData = await MapStorage.exportMapState(state);
      return JSON.stringify({
        map: JSON.parse(mapData),
        state: JSON.parse(stateData)
      });
    } catch (error) {
      console.error('Error exporting map:', error);
      throw error;
    }
  }

  async importMap(data: string): Promise<{ map: IMap; state: MapState } | null> {
    try {
      const { map: mapData, state: stateData } = JSON.parse(data);
      const map = await MapStorage.importMap(JSON.stringify(mapData));
      const state = await MapStorage.importMapState(JSON.stringify(stateData));

      if (!map || !state) {
        return null;
      }

      // 验证地图
      const errors = MapValidator.validateMap(map);
      if (errors.length > 0) {
        console.error(`Imported map validation failed:`, errors);
        return null;
      }

      // 验证状态
      if (state.id !== map.id) {
        console.error(`Imported state ID mismatch`);
        return null;
      }

      this.eventManager.dispatchEvent(MapEventFactory.createMapInitializedEvent(map));
      return { map, state };
    } catch (error) {
      console.error('Error importing map:', error);
      return null;
    }
  }
} 