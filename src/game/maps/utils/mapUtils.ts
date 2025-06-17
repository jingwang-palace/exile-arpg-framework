import { IMap } from '@/core/interfaces/IMap.ts';
import { IRegion } from '@/core/interfaces/IRegion.ts';
import { IConnection } from '@/core/interfaces/IConnection.ts';
import { Vector2D } from '@/core/math/Vector2D.ts';
import { Size } from '@/core/math/Size.ts';
import { MAP_CONSTANTS } from '../constants/mapConstants.ts';

export class MapUtils {
  static validateMapSize(size: Size): boolean {
    return (
      size.width >= MAP_CONSTANTS.MIN_MAP_SIZE &&
      size.width <= MAP_CONSTANTS.MAX_MAP_SIZE &&
      size.height >= MAP_CONSTANTS.MIN_MAP_SIZE &&
      size.height <= MAP_CONSTANTS.MAX_MAP_SIZE
    );
  }

  static validateRegionSize(size: Size): boolean {
    return (
      size.width >= MAP_CONSTANTS.MIN_REGION_SIZE &&
      size.width <= MAP_CONSTANTS.MAX_REGION_SIZE &&
      size.height >= MAP_CONSTANTS.MIN_REGION_SIZE &&
      size.height <= MAP_CONSTANTS.MAX_REGION_SIZE
    );
  }

  static validateRoomCount(count: number): boolean {
    return (
      count >= MAP_CONSTANTS.MIN_ROOM_COUNT &&
      count <= MAP_CONSTANTS.MAX_ROOM_COUNT
    );
  }

  static validateDifficulty(difficulty: number): boolean {
    return (
      difficulty >= MAP_CONSTANTS.MIN_DIFFICULTY &&
      difficulty <= MAP_CONSTANTS.MAX_DIFFICULTY
    );
  }

  static validateLevel(level: number): boolean {
    return (
      level >= MAP_CONSTANTS.MIN_LEVEL &&
      level <= MAP_CONSTANTS.MAX_LEVEL
    );
  }

  static calculateRegionCenter(region: IRegion): Vector2D {
    return new Vector2D(
      region.position.x + region.size.width / 2,
      region.position.y + region.size.height / 2
    );
  }

  static calculateRegionBounds(region: IRegion): { min: Vector2D; max: Vector2D } {
    return {
      min: region.position,
      max: new Vector2D(
        region.position.x + region.size.width,
        region.position.y + region.size.height
      )
    };
  }

  static calculateRegionDistance(region1: IRegion, region2: IRegion): number {
    const center1 = this.calculateRegionCenter(region1);
    const center2 = this.calculateRegionCenter(region2);
    return center1.distance(center2);
  }

  static calculateRegionOverlap(region1: IRegion, region2: IRegion): number {
    const bounds1 = this.calculateRegionBounds(region1);
    const bounds2 = this.calculateRegionBounds(region2);

    const overlapX = Math.max(
      0,
      Math.min(bounds1.max.x, bounds2.max.x) - Math.max(bounds1.min.x, bounds2.min.x)
    );

    const overlapY = Math.max(
      0,
      Math.min(bounds1.max.y, bounds2.max.y) - Math.max(bounds1.min.y, bounds2.min.y)
    );

    return overlapX * overlapY;
  }

  static calculateRegionSpacing(region1: IRegion, region2: IRegion): number {
    const bounds1 = this.calculateRegionBounds(region1);
    const bounds2 = this.calculateRegionBounds(region2);

    const spacingX = Math.max(
      0,
      Math.max(bounds1.min.x, bounds2.min.x) - Math.min(bounds1.max.x, bounds2.max.x)
    );

    const spacingY = Math.max(
      0,
      Math.max(bounds1.min.y, bounds2.min.y) - Math.min(bounds1.max.y, bounds2.max.y)
    );

    return Math.max(spacingX, spacingY);
  }

  static calculateMapBounds(map: IMap): { min: Vector2D; max: Vector2D } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const region of map.regions) {
      const bounds = this.calculateRegionBounds(region);
      minX = Math.min(minX, bounds.min.x);
      minY = Math.min(minY, bounds.min.y);
      maxX = Math.max(maxX, bounds.max.x);
      maxY = Math.max(maxY, bounds.max.y);
    }

    return {
      min: new Vector2D(minX, minY),
      max: new Vector2D(maxX, maxY)
    };
  }

  static calculateMapCenter(map: IMap): Vector2D {
    const bounds = this.calculateMapBounds(map);
    return new Vector2D(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.y + bounds.max.y) / 2
    );
  }

  static calculateMapSize(map: IMap): Size {
    const bounds = this.calculateMapBounds(map);
    return new Size(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y
    );
  }

  static calculateMapArea(map: IMap): number {
    const size = this.calculateMapSize(map);
    return size.width * size.height;
  }

  static calculateMapPerimeter(map: IMap): number {
    const size = this.calculateMapSize(map);
    return 2 * (size.width + size.height);
  }

  static calculateMapAspectRatio(map: IMap): number {
    const size = this.calculateMapSize(map);
    return size.width / size.height;
  }

  static calculateMapDensity(map: IMap): number {
    const totalArea = this.calculateMapArea(map);
    const regionArea = map.regions.reduce(
      (sum, region) => sum + region.size.width * region.size.height,
      0
    );
    return regionArea / totalArea;
  }

  static calculateMapConnectivity(map: IMap): number {
    const maxConnections = (map.regions.length * (map.regions.length - 1)) / 2;
    return map.connections.length / maxConnections;
  }

  static calculateMapComplexity(map: IMap): number {
    return (
      map.regions.length * 0.4 +
      map.connections.length * 0.3 +
      map.difficulty * 0.2 +
      map.level * 0.1
    );
  }
} 