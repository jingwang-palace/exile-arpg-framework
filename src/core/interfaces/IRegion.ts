import { Vector2D } from '../math/Vector2D';
import { Size } from '../math/Size';

export interface IRegion {
  id: string;
  type: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level: number;
  initialize(): Promise<void>;
  destroy(): void;
  isPositionInRegion(position: Vector2D): boolean;
  getCenter(): Vector2D;
  getBounds(): { min: Vector2D; max: Vector2D };
  overlaps(other: IRegion): boolean;
  contains(other: IRegion): boolean;
  getSpacing(other: IRegion): number;
} 