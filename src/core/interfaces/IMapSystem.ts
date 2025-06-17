import { IMap as IMapInterface } from './IMap';
import { IRegion } from './IRegion';
import { IConnection } from './IConnection';
import { Vector2D } from '../math/Vector2D';
import { Size } from '../math/Size';

// 地图系统接口
export interface IMapSystem {
  // 地图管理
  maps: Map<string, IMapInterface>;
  currentMap: IMapInterface | null;
  
  // 基础方法
  loadMap(mapId: string): Promise<void>;
  unloadMap(mapId: string): void;
  getMap(mapId: string): IMapInterface | undefined;
  
  // 区域管理
  getRegions(mapId: string): IRegion[];
  getRegion(regionId: string): IRegion | undefined;
  
  // 实体管理
  spawnEntity(entity: IMapEntity, position: Vector2D): void;
  removeEntity(entityId: string): void;
  getEntitiesInArea(area: { position: Vector2D; size: Size }): IMapEntity[];
  
  // 事件系统
  onMapLoad: (map: IMapInterface) => void;
  onMapUnload: (map: IMapInterface) => void;
  onEntitySpawn: (entity: IMapEntity) => void;
  onEntityRemove: (entity: IMapEntity) => void;

  id: string;
  size: Size;
  getRegions(): IRegion[];
  addRegion(region: IRegion): void;
  removeRegion(id: string): void;
  getConnections(): IConnection[];
  getConnection(id: string): IConnection | undefined;
  addConnection(connection: IConnection): void;
  removeConnection(id: string): void;

  initialize(): Promise<void>;
  createMap(id: string, type: MapType): Promise<IMapInterface>;
  getMap(mapId: string): Promise<IMapInterface | undefined>;
  setCurrentMap(map: IMapInterface): Promise<void>;
  getCurrentMap(): IMapInterface | null;
  saveMap(map: IMapInterface): Promise<string>;
  loadMapFromData(data: string): Promise<IMapInterface>;
  preloadMaps(mapId: string, count: number): Promise<void>;
  clearAll(): void;
  getRegisteredMaps(): IMapInterface[];
  getRegisteredMapIds(): string[];
  getPrototypeIds(): string[];
}

// 地图接口
export interface IMap {
  id: string;
  name: string;
  type: MapType;
  size: Size;
  regions: IRegion[];
  entities: Map<string, IMapEntity>;
  properties: Map<string, any>;
  
  // 生命周期方法
  initialize(): Promise<void>;
  update(delta: number): void;
  destroy(): void;
}

// 地图实体接口
export interface IMapEntity {
  id: string;
  type: EntityType;
  position: Vector2D;
  properties: Map<string, any>;
  
  // 实体方法
  update(delta: number): void;
  onCollision(other: IMapEntity): void;
  destroy(): void;
}

// 类型定义
export enum MapType {
  DUNGEON = 'dungeon',
  BOSS = 'boss',
  SAFE = 'safe',
  NORMAL = 'normal'
}

export enum RegionType {
  SPAWN = 'spawn',
  COMBAT = 'combat',
  SAFE = 'safe',
  TRANSITION = 'transition'
}

export enum EntityType {
  PLAYER = 'player',
  MONSTER = 'monster',
  NPC = 'npc',
  ITEM = 'item',
  TRIGGER = 'trigger'
} 