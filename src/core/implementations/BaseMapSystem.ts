import { 
  IMapSystem, 
  IMapInterface, 
  IRegion, 
  IMapEntity
} from '../interfaces/IMapSystem';
import { Vector2D } from '../math/Vector2D';
import { Size } from '../math/Size';

export abstract class BaseMapSystem implements IMapSystem {
  maps: Map<string, IMapInterface>;
  currentMap: IMapInterface | null;
  
  // 事件回调
  onMapLoad: (map: IMapInterface) => void = () => {};
  onMapUnload: (map: IMapInterface) => void = () => {};
  onEntitySpawn: (entity: IMapEntity) => void = () => {};
  onEntityRemove: (entity: IMapEntity) => void = () => {};

  constructor() {
    this.maps = new Map();
    this.currentMap = null;
  }

  async loadMap(mapId: string): Promise<void> {
    const map = this.maps.get(mapId);
    if (!map) {
      throw new Error(`Map ${mapId} not found`);
    }

    // 如果当前有地图，先卸载
    if (this.currentMap) {
      await this.unloadMap(this.currentMap.id);
    }

    // 初始化新地图
    await map.initialize();
    this.currentMap = map;
    this.onMapLoad(map);
  }

  unloadMap(mapId: string): void {
    const map = this.maps.get(mapId);
    if (!map) return;

    map.destroy();
    this.onMapUnload(map);
    
    if (this.currentMap?.id === mapId) {
      this.currentMap = null;
    }
  }

  getMap(mapId: string): IMapInterface | undefined {
    return this.maps.get(mapId);
  }

  getRegions(mapId: string): IRegion[] {
    const map = this.maps.get(mapId);
    return map ? map.regions : [];
  }

  getRegion(regionId: string): IRegion | undefined {
    for (const map of this.maps.values()) {
      const region = map.regions.find(r => r.id === regionId);
      if (region) return region;
    }
    return undefined;
  }

  spawnEntity(entity: IMapEntity, position: Vector2D): void {
    if (!this.currentMap) return;

    // 设置实体位置
    entity.position = position;

    // 添加到地图
    this.currentMap.entities.set(entity.id, entity);

    // 添加到对应区域
    const region = this.getRegionAtPosition(position);
    if (region) {
      region.addEntity(entity);
    }

    this.onEntitySpawn(entity);
  }

  removeEntity(entityId: string): void {
    if (!this.currentMap) return;

    const entity = this.currentMap.entities.get(entityId);
    if (!entity) return;

    // 从地图移除
    this.currentMap.entities.delete(entityId);

    // 从区域移除
    const region = this.getRegionAtPosition(entity.position);
    if (region) {
      region.removeEntity(entityId);
    }

    // 销毁实体
    entity.destroy();
    this.onEntityRemove(entity);
  }

  getEntitiesInArea(area: { position: Vector2D; size: Size }): IMapEntity[] {
    if (!this.currentMap) return [];

    return Array.from(this.currentMap.entities.values()).filter(entity => 
      this.isEntityInArea(entity, area)
    );
  }

  // 辅助方法
  protected getRegionAtPosition(position: Vector2D): IRegion | undefined {
    if (!this.currentMap) return undefined;

    return this.currentMap.regions.find(region => 
      region.isPositionInRegion(position)
    );
  }

  protected isEntityInArea(entity: IMapEntity, area: { position: Vector2D; size: Size }): boolean {
    return (
      entity.position.x >= area.position.x &&
      entity.position.x < area.position.x + area.size.width &&
      entity.position.y >= area.position.y &&
      entity.position.y < area.position.y + area.size.height
    );
  }

  getRegions(): IRegion[] {
    if (!this.currentMap) return [];
    return this.currentMap.regions;
  }

  async loadMapFromData(data: string): Promise<IMapInterface> {
    const map = JSON.parse(data);
    this.maps.set(map.id, map);
    return map;
  }
} 