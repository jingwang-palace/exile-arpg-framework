import { IRegion } from './IRegion';
import { Position } from './IMapSystem';

export interface IConnection {
  id: string;
  type: string;
  source: IRegion;
  target: IRegion;
  initialize(): void;
  destroy(): void;
  isConnected(region: IRegion): boolean;
  getConnectedRegion(region: IRegion): IRegion | undefined;

  // 连接方法
  activate(): void;
  deactivate(): void;
  isInRange(position: Position, range: number): boolean;
  getTargetPosition(): Position;
} 