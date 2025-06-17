import { IRegion } from './IRegion';
import { IConnection } from './IConnection';
import { MapType } from './IMapSystem';
import { Vector2D } from '../math/Vector2D';
import { Size } from '../math/Size';
import { RegionConnection } from '@/game/maps/connections/RegionConnection';

export interface IMap {
  id: string;
  type: string;
  name: string;
  level: number;
  difficulty: number;
  size: Size;
  regions: IRegion[];
  connections: IConnection[];
  properties: Map<string, any>;

  initialize(): Promise<void>;
  destroy(): void;
  addRegion(region: IRegion): void;
  removeRegion(id: string): boolean;
  getRegion(id: string): IRegion | undefined;
  getRegions(): IRegion[];
  addConnection(connection: IConnection): void;
  removeConnection(id: string): boolean;
  getConnection(id: string): IConnection | undefined;
  getConnectionsByRegion(regionId: string): IConnection[];
  getConnectedRegions(regionId: string): IRegion[];
  isPositionInMap(position: Vector2D): boolean;
  getRegionAtPosition(position: Vector2D): IRegion | undefined;
  getConnections(): IConnection[];
} 