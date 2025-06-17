import { MapType } from '@/core/interfaces/IMapSystem';
import { Size } from '@/core/math/Size';

export interface MapConfig {
  type: MapType;
  size: Size;
  roomCount: number;
  difficulty: number;
  level: number;
}

export const mapConfigs: Record<MapType, MapConfig> = {
  [MapType.DUNGEON]: {
    type: MapType.DUNGEON,
    size: new Size(800, 800),
    roomCount: 3,
    difficulty: 2,
    level: 1
  },
  [MapType.BOSS]: {
    type: MapType.BOSS,
    size: new Size(1000, 1000),
    roomCount: 1,
    difficulty: 5,
    level: 1
  },
  [MapType.SAFE]: {
    type: MapType.SAFE,
    size: new Size(400, 400),
    roomCount: 1,
    difficulty: 1,
    level: 1
  },
  [MapType.NORMAL]: {
    type: MapType.NORMAL,
    size: new Size(600, 600),
    roomCount: 2,
    difficulty: 2,
    level: 1
  }
}; 