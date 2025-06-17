import { EntityType, Position } from './IMapSystem';

export interface IMapEntity {
  id: string;
  type: EntityType;
  position: Position;
  properties: Map<string, any>;
  
  // 实体方法
  update(delta: number): void;
  onCollision(other: IMapEntity): void;
  destroy(): void;
} 