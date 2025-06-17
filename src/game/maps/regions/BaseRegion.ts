import { IRegion } from '@/core/interfaces/IRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

export abstract class BaseRegion implements IRegion {
  id: string;
  type: string;
  name: string;
  position: Vector2D;
  size: Size;
  properties: Map<string, any>;

  constructor(config: {
    id: string;
    type: string;
    name: string;
    position: Vector2D;
    size: Size;
  }) {
    this.id = config.id;
    this.type = config.type;
    this.name = config.name;
    this.position = config.position;
    this.size = config.size;
    this.properties = new Map();
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): void;
} 