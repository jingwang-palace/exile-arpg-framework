import { IMap } from '@/core/interfaces/IMap';
import { MapType } from '@/core/interfaces/IMapSystem';
import { Size } from '@/core/math/Size';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { Vector2D } from '@/core/math/Vector2D';
import { RegionConnection } from '../connections/RegionConnection';

export interface MapFactoryConfig {
  defaultMapSize: Size;
  minMapSize: Size;
  maxMapSize: Size;
  defaultRegionSize: Size;
  minRegionSize: Size;
  maxRegionSize: Size;
}

export class MapFactory {
  private config: MapFactoryConfig;

  constructor(config: MapFactoryConfig) {
    this.config = config;
  }

  async createMap(id: string, type: MapType = MapType.DUNGEON): Promise<IMap> {
    switch (type) {
      case MapType.DUNGEON:
        return this.createDungeonMap(id);
      case MapType.BOSS:
        return this.createBossMap(id);
      case MapType.SAFE:
        return this.createSafeMap(id);
      default:
        throw new Error(`Unknown map type: ${type}`);
    }
  }

  private createDungeonMap(id: string): IMap {
    return {
      id,
      name: `地下城 ${id}`,
      type: MapType.DUNGEON,
      size: this.config.defaultMapSize,
      difficulty: 2,
      level: 1,
      regions: [],
      connections: [],
      properties: new Map(),

      async initialize(): Promise<void> {
        // 初始化地图
      },

      destroy(): void {
        // 清理地图资源
      },

      addRegion(region: IRegion): void {
        this.regions.push(region);
      },

      removeRegion(id: string): boolean {
        const index = this.regions.findIndex(r => r.id === id);
        if (index === -1) return false;
        this.regions.splice(index, 1);
        return true;
      },

      getRegion(id: string): IRegion | undefined {
        return this.regions.find(r => r.id === id);
      },

      getRegions(): IRegion[] {
        return [...this.regions];
      },

      addConnection(connection: RegionConnection): void {
        this.connections.push(connection);
      },

      removeConnection(id: string): boolean {
        const index = this.connections.findIndex(c => c.id === id);
        if (index === -1) return false;
        this.connections.splice(index, 1);
        return true;
      },

      getConnection(id: string): RegionConnection | undefined {
        return this.connections.find(c => c.id === id) as RegionConnection | undefined;
      },

      getConnectionsByRegion(regionId: string): IConnection[] {
        return this.connections.filter(c => 
          c.source.id === regionId || c.target.id === regionId
        );
      },

      getConnectedRegions(regionId: string): IRegion[] {
        const connections = this.getConnectionsByRegion(regionId);
        return connections.map(c => {
          const otherRegionId = c.source.id === regionId ? c.target.id : c.source.id;
          return this.getRegion(otherRegionId);
        }).filter((r): r is IRegion => r !== undefined);
      },

      isPositionInMap(position: Vector2D): boolean {
        return position.x >= 0 && position.x < this.size.width &&
               position.y >= 0 && position.y < this.size.height;
      },

      getRegionAtPosition(position: Vector2D): IRegion | undefined {
        return this.regions.find(r => r.isPositionInRegion(position));
      },

      getConnections(): RegionConnection[] {
        return [...this.connections] as RegionConnection[];
      }
    };
  }

  private createBossMap(id: string): IMap {
    return this.createDungeonMap(id);
  }

  private createSafeMap(id: string): IMap {
    return this.createDungeonMap(id);
  }
} 