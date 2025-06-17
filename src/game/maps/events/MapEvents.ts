import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { IMapEntity } from '@/core/interfaces/IMapSystem';
import { Vector2D } from '@/core/math/Vector2D';

export class MapEvent {
  type: string;
  target: IMap | IRegion | IConnection | IMapEntity;
  data: any;

  constructor(type: string, target: IMap | IRegion | IConnection | IMapEntity, data: any = {}) {
    this.type = type;
    this.target = target;
    this.data = data;
  }
}

export class MapEventManager {
  private listeners: Map<string, Set<(event: MapEvent) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type: string, listener: (event: MapEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (event: MapEvent) => void): void {
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.delete(listener);
    }
  }

  dispatchEvent(event: MapEvent): void {
    if (this.listeners.has(event.type)) {
      for (const listener of this.listeners.get(event.type)!) {
        listener(event);
      }
    }
  }
}

export class MapEventTypes {
  // 地图事件
  static MAP_INITIALIZED = 'map:initialized';
  static MAP_DESTROYED = 'map:destroyed';
  static MAP_UPDATED = 'map:updated';

  // 区域事件
  static REGION_ADDED = 'region:added';
  static REGION_REMOVED = 'region:removed';
  static REGION_UPDATED = 'region:updated';
  static REGION_ENTERED = 'region:entered';
  static REGION_EXITED = 'region:exited';

  // 连接事件
  static CONNECTION_ADDED = 'connection:added';
  static CONNECTION_REMOVED = 'connection:removed';
  static CONNECTION_UPDATED = 'connection:updated';
  static CONNECTION_TRAVERSED = 'connection:traversed';

  // 实体事件
  static ENTITY_SPAWNED = 'entity:spawned';
  static ENTITY_REMOVED = 'entity:removed';
  static ENTITY_UPDATED = 'entity:updated';
  static ENTITY_MOVED = 'entity:moved';

  // 交互事件
  static REGION_CLICKED = 'region:clicked';
  static CONNECTION_CLICKED = 'connection:clicked';
  static MAP_CLICKED = 'map:clicked';
  static MAP_DRAGGED = 'map:dragged';
  static MAP_ZOOMED = 'map:zoomed';
}

export class MapEventFactory {
  static createMapInitializedEvent(map: IMap): MapEvent {
    return new MapEvent(MapEventTypes.MAP_INITIALIZED, map);
  }

  static createMapDestroyedEvent(map: IMap): MapEvent {
    return new MapEvent(MapEventTypes.MAP_DESTROYED, map);
  }

  static createMapUpdatedEvent(map: IMap): MapEvent {
    return new MapEvent(MapEventTypes.MAP_UPDATED, map);
  }

  static createRegionAddedEvent(region: IRegion): MapEvent {
    return new MapEvent(MapEventTypes.REGION_ADDED, region);
  }

  static createRegionRemovedEvent(region: IRegion): MapEvent {
    return new MapEvent(MapEventTypes.REGION_REMOVED, region);
  }

  static createRegionUpdatedEvent(region: IRegion): MapEvent {
    return new MapEvent(MapEventTypes.REGION_UPDATED, region);
  }

  static createRegionEnteredEvent(region: IRegion, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.REGION_ENTERED, region, { position });
  }

  static createRegionExitedEvent(region: IRegion, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.REGION_EXITED, region, { position });
  }

  static createConnectionAddedEvent(connection: IConnection): MapEvent {
    return new MapEvent(MapEventTypes.CONNECTION_ADDED, connection);
  }

  static createConnectionRemovedEvent(connection: IConnection): MapEvent {
    return new MapEvent(MapEventTypes.CONNECTION_REMOVED, connection);
  }

  static createConnectionUpdatedEvent(connection: IConnection): MapEvent {
    return new MapEvent(MapEventTypes.CONNECTION_UPDATED, connection);
  }

  static createConnectionTraversedEvent(connection: IConnection, direction: 'forward' | 'backward'): MapEvent {
    return new MapEvent(MapEventTypes.CONNECTION_TRAVERSED, connection, { direction });
  }

  static createEntitySpawnedEvent(entity: IMapEntity): MapEvent {
    return new MapEvent(MapEventTypes.ENTITY_SPAWNED, entity);
  }

  static createEntityRemovedEvent(entity: IMapEntity): MapEvent {
    return new MapEvent(MapEventTypes.ENTITY_REMOVED, entity);
  }

  static createEntityUpdatedEvent(entity: IMapEntity): MapEvent {
    return new MapEvent(MapEventTypes.ENTITY_UPDATED, entity);
  }

  static createEntityMovedEvent(entity: IMapEntity, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.ENTITY_MOVED, entity, { position });
  }

  static createRegionClickedEvent(region: IRegion, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.REGION_CLICKED, region, { position });
  }

  static createConnectionClickedEvent(connection: IConnection, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.CONNECTION_CLICKED, connection, { position });
  }

  static createMapClickedEvent(map: IMap, position: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.MAP_CLICKED, map, { position });
  }

  static createMapDraggedEvent(map: IMap, delta: Vector2D): MapEvent {
    return new MapEvent(MapEventTypes.MAP_DRAGGED, map, { delta });
  }

  static createMapZoomedEvent(map: IMap, scale: number): MapEvent {
    return new MapEvent(MapEventTypes.MAP_ZOOMED, map, { scale });
  }
} 