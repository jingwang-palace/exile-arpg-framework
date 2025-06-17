import { IRegion } from '@/core/interfaces/IRegion';
import { BaseRegion } from '@/core/implementations/BaseRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

interface DungeonRegionConfig {
  id: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level?: number;
}

export class DungeonRegion extends BaseRegion implements IRegion {
  private connections: Map<string, any> = new Map();
  private entities: Map<string, any> = new Map();
  private isCleared: boolean = false;
  private isLocked: boolean = false;
  private isVisible: boolean = true;
  private spawnPoints: Vector2D[] = [];
  private treasurePoints: Vector2D[] = [];
  private monsterPoints: Vector2D[] = [];

  constructor(config: DungeonRegionConfig) {
    super({
      id: config.id,
      type: 'dungeon',
      name: config.name,
      position: config.position,
      size: config.size,
      difficulty: config.difficulty,
      level: config.level
    });
  }

  async initialize(): Promise<void> {
    console.log(`Initializing dungeon region: ${this.id}`);
  }

  destroy(): void {
    console.log(`Destroying dungeon region: ${this.id}`);
  }

  getEntities(): any[] {
    return Array.from(this.entities.values());
  }

  addEntity(entity: any): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  addConnection(regionId: string): void {
    if (!this.connections.has(regionId)) {
      this.connections.set(regionId, true);
    }
  }

  getConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  update(delta: number): void {
    super.update(delta);
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(delta);
      }
    });
    this.checkRegionState();
  }

  private checkRegionState(): void {
    const isCleared = this.isRegionCleared();
    const isLocked = this.isRegionLocked();
    if (isCleared) {
      this.onRegionCleared();
    }
    if (!isLocked) {
      this.onRegionUnlocked();
    }
  }

  private isRegionCleared(): boolean {
    return Array.from(this.entities.values()).every(entity => 
      entity.type !== 'monster' || entity.isDead
    );
  }

  private isRegionLocked(): boolean {
    return this.isLocked;
  }

  private onRegionCleared(): void {
    console.log(`Region ${this.id} has been cleared`);
    this.isCleared = true;
    this.setProperty('isCleared', true);
  }

  private onRegionUnlocked(): void {
    console.log(`Region ${this.id} has been unlocked`);
    this.isLocked = false;
    this.setProperty('isLocked', false);
  }

  setupCollisions(regions: IRegion[]): void {
    this.connections.forEach((_, regionId) => {
      const connectedRegion = regions.find(r => r.id === regionId);
      if (connectedRegion) {
        // 设置碰撞检测
      }
    });
  }

  getSpawnPoints(): Vector2D[] {
    return [...this.spawnPoints];
  }

  addSpawnPoint(point: Vector2D): void {
    this.spawnPoints.push(point);
  }

  getTreasurePoints(): Vector2D[] {
    return [...this.treasurePoints];
  }

  addTreasurePoint(point: Vector2D): void {
    this.treasurePoints.push(point);
  }

  getMonsterPoints(): Vector2D[] {
    return [...this.monsterPoints];
  }

  addMonsterPoint(point: Vector2D): void {
    this.monsterPoints.push(point);
  }
} 