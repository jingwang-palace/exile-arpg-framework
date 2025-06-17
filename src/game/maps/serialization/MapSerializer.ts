import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { MapType } from '@/core/interfaces/IMapSystem';

export interface SerializedMap {
  id: string;
  type: MapType;
  name: string;
  level: number;
  difficulty: number;
  size: {
    width: number;
    height: number;
  };
  regions: SerializedRegion[];
  connections: SerializedConnection[];
  properties: Map<string, any>;
}

export interface SerializedRegion {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  properties: Map<string, any>;
}

export interface SerializedConnection {
  id: string;
  type: string;
  sourceRegionId: string;
  targetRegionId: string;
  properties: Map<string, any>;
}

export class MapSerializer {
  static serialize(map: DungeonMap): SerializedMap {
    return {
      id: map.id,
      type: map.type,
      name: map.name,
      level: map.level,
      difficulty: map.difficulty,
      size: map.size,
      regions: map.regions.map(region => this.serializeRegion(region)),
      connections: map.connections.map(connection => this.serializeConnection(connection)),
      properties: map.properties
    };
  }

  private static serializeRegion(region: IRegion): SerializedRegion {
    return {
      id: region.id,
      type: region.type,
      name: region.name,
      position: region.position,
      size: region.size,
      properties: region.properties
    };
  }

  private static serializeConnection(connection: IConnection): SerializedConnection {
    return {
      id: connection.id,
      type: connection.type,
      sourceRegionId: connection.sourceRegion.id,
      targetRegionId: connection.targetRegion.id,
      properties: connection.properties
    };
  }
} 