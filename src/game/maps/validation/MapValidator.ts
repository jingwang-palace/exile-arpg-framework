import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { MapUtils } from '../utils/mapUtils';
import { MAP_CONSTANTS } from '../constants/mapConstants';

export class MapValidator {
  static validateMap(map: IMap): string[] {
    const errors: string[] = [];

    // 验证地图大小
    if (!MapUtils.validateMapSize(map.size)) {
      errors.push(`Invalid map size: ${map.size.width}x${map.size.height}`);
    }

    // 验证区域数量
    if (!MapUtils.validateRoomCount(map.regions.length)) {
      errors.push(`Invalid room count: ${map.regions.length}`);
    }

    // 验证难度
    if (!MapUtils.validateDifficulty(map.difficulty)) {
      errors.push(`Invalid difficulty: ${map.difficulty}`);
    }

    // 验证等级
    if (!MapUtils.validateLevel(map.level)) {
      errors.push(`Invalid level: ${map.level}`);
    }

    // 验证区域
    for (const region of map.regions) {
      const regionErrors = this.validateRegion(region, map);
      errors.push(...regionErrors);
    }

    // 验证连接
    for (const connection of map.connections) {
      const connectionErrors = this.validateConnection(connection, map);
      errors.push(...connectionErrors);
    }

    // 验证区域重叠
    const overlapErrors = this.validateRegionOverlaps(map);
    errors.push(...overlapErrors);

    // 验证区域间距
    const spacingErrors = this.validateRegionSpacing(map);
    errors.push(...spacingErrors);

    // 验证连接有效性
    const connectionErrors = this.validateConnections(map);
    errors.push(...connectionErrors);

    // 验证地图密度
    const density = MapUtils.calculateMapDensity(map);
    if (density < 0.1 || density > 0.9) {
      errors.push(`Invalid map density: ${density}`);
    }

    // 验证地图连通性
    const connectivity = MapUtils.calculateMapConnectivity(map);
    if (connectivity < 0.1 || connectivity > 1.0) {
      errors.push(`Invalid map connectivity: ${connectivity}`);
    }

    // 验证地图复杂度
    const complexity = MapUtils.calculateMapComplexity(map);
    if (complexity < 1 || complexity > 10) {
      errors.push(`Invalid map complexity: ${complexity}`);
    }

    return errors;
  }

  private static validateRegion(region: IRegion, map: IMap): string[] {
    const errors: string[] = [];

    // 验证区域大小
    if (!MapUtils.validateRegionSize(region.size)) {
      errors.push(`Invalid region size for ${region.id}: ${region.size.width}x${region.size.height}`);
    }

    // 验证区域位置
    if (
      region.position.x < 0 ||
      region.position.y < 0 ||
      region.position.x + region.size.width > map.size.width ||
      region.position.y + region.size.height > map.size.height
    ) {
      errors.push(`Region ${region.id} is outside map bounds`);
    }

    // 验证区域ID唯一性
    const duplicateId = map.regions.find(
      r => r.id === region.id && r !== region
    );
    if (duplicateId) {
      errors.push(`Duplicate region ID: ${region.id}`);
    }

    return errors;
  }

  private static validateConnection(connection: IConnection, map: IMap): string[] {
    const errors: string[] = [];

    // 验证连接ID唯一性
    const duplicateId = map.connections.find(
      c => c.id === connection.id && c !== connection
    );
    if (duplicateId) {
      errors.push(`Duplicate connection ID: ${connection.id}`);
    }

    // 验证源区域存在
    const sourceRegion = map.regions.find(r => r.id === connection.sourceRegion.id);
    if (!sourceRegion) {
      errors.push(`Source region not found for connection ${connection.id}`);
    }

    // 验证目标区域存在
    const targetRegion = map.regions.find(r => r.id === connection.targetRegion.id);
    if (!targetRegion) {
      errors.push(`Target region not found for connection ${connection.id}`);
    }

    // 验证自连接
    if (connection.sourceRegion.id === connection.targetRegion.id) {
      errors.push(`Connection ${connection.id} connects a region to itself`);
    }

    return errors;
  }

  private static validateRegionOverlaps(map: IMap): string[] {
    const errors: string[] = [];

    for (let i = 0; i < map.regions.length; i++) {
      for (let j = i + 1; j < map.regions.length; j++) {
        const region1 = map.regions[i];
        const region2 = map.regions[j];
        const overlap = MapUtils.calculateRegionOverlap(region1, region2);

        if (overlap > 0) {
          errors.push(
            `Regions ${region1.id} and ${region2.id} overlap by ${overlap} square units`
          );
        }
      }
    }

    return errors;
  }

  private static validateRegionSpacing(map: IMap): string[] {
    const errors: string[] = [];

    for (let i = 0; i < map.regions.length; i++) {
      for (let j = i + 1; j < map.regions.length; j++) {
        const region1 = map.regions[i];
        const region2 = map.regions[j];
        const spacing = MapUtils.calculateRegionSpacing(region1, region2);

        if (
          spacing < MAP_CONSTANTS.MIN_ROOM_SPACING ||
          spacing > MAP_CONSTANTS.MAX_ROOM_SPACING
        ) {
          errors.push(
            `Invalid spacing between regions ${region1.id} and ${region2.id}: ${spacing}`
          );
        }
      }
    }

    return errors;
  }

  private static validateConnections(map: IMap): string[] {
    const errors: string[] = [];

    // 验证每个区域至少有一个连接
    for (const region of map.regions) {
      const connections = map.connections.filter(
        c => c.sourceRegion.id === region.id || c.targetRegion.id === region.id
      );

      if (connections.length === 0) {
        errors.push(`Region ${region.id} has no connections`);
      }
    }

    // 验证连接不重复
    const connectionPairs = new Set<string>();
    for (const connection of map.connections) {
      const pair = [connection.sourceRegion.id, connection.targetRegion.id]
        .sort()
        .join('-');
      if (connectionPairs.has(pair)) {
        errors.push(
          `Duplicate connection between regions ${connection.sourceRegion.id} and ${connection.targetRegion.id}`
        );
      }
      connectionPairs.add(pair);
    }

    return errors;
  }
} 