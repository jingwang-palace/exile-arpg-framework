import { IConnection } from '@/core/interfaces/IConnection';
import { IRegion } from '@/core/interfaces/IRegion';
import { Position } from '@/core/interfaces/IMapSystem';
import { Vector2D } from '@/core/math/Vector2D';

export enum ConnectionType {
  NORMAL = 'normal',
  BOSS = 'boss',
  SECRET = 'secret',
  TELEPORT = 'teleport'
}

export class RegionConnection implements IConnection {
  public readonly id: string;
  public readonly type: string;
  public readonly source: IRegion;
  public readonly target: IRegion;
  public readonly difficulty: number;
  private properties: Map<string, any>;

  constructor(config: {
    id: string;
    type: ConnectionType;
    sourceRegion: IRegion;
    targetRegion: IRegion;
    difficulty: number;
  }) {
    if (!config.sourceRegion || !config.targetRegion) {
      throw new Error(`Invalid connection configuration: source or target region is undefined for connection ${config.id}`);
    }
    this.id = config.id;
    this.type = config.type;
    this.source = config.sourceRegion;
    this.target = config.targetRegion;
    this.difficulty = config.difficulty;
    this.properties = new Map();
  }

  async initialize(): Promise<void> {
    // 初始化区域连接
    const sourceId = this.source?.id ?? 'undefined';
    const targetId = this.target?.id ?? 'undefined';
    console.log(`Initializing connection: ${this.id} from ${sourceId} to ${targetId}`);
  }

  destroy(): void {
    // 清理区域连接
    console.log(`Destroying connection: ${this.id}`);
  }

  isConnected(region: IRegion): boolean {
    if (!region) return false;
    return this.source?.id === region.id || this.target?.id === region.id;
  }

  getConnectedRegion(region: IRegion): IRegion | undefined {
    if (!region) return undefined;
    if (this.source?.id === region.id) {
      return this.target;
    }
    if (this.target?.id === region.id) {
      return this.source;
    }
    return undefined;
  }

  activate(): void {
    // 激活连接
    console.log(`Activating connection: ${this.id}`);
  }

  deactivate(): void {
    // 停用连接
    console.log(`Deactivating connection: ${this.id}`);
  }

  isInRange(position: Position, range: number): boolean {
    if (!position || !this.source || !this.target) return false;
    const sourceCenter = this.source.getCenter();
    const targetCenter = this.target.getCenter();
    const sourceDistance = Math.sqrt(
      Math.pow(position.x - sourceCenter.x, 2) +
      Math.pow(position.y - sourceCenter.y, 2)
    );
    const targetDistance = Math.sqrt(
      Math.pow(position.x - targetCenter.x, 2) +
      Math.pow(position.y - targetCenter.y, 2)
    );
    return sourceDistance <= range || targetDistance <= range;
  }

  getTargetPosition(): Position {
    if (!this.target) {
      throw new Error(`Target region is undefined for connection ${this.id}`);
    }
    return this.target.getCenter();
  }
} 