import { IRegion } from '@/core/interfaces/IMapSystem';
import { BaseRegion } from '@/core/implementations/BaseRegion';

export class Region extends BaseRegion implements IRegion {
  constructor(
    id: string,
    type: string,
    position: { x: number; y: number },
    size: { width: number; height: number },
    difficulty: number
  ) {
    super(id, type, position, size, difficulty);
  }
} 