import { IRegion } from '@/core/interfaces/IRegion';
import { BaseRegion } from '@/core/implementations/BaseRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

interface BossRegionConfig {
  id: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level?: number;
}

export class BossRegion extends BaseRegion implements IRegion {
  private bossSpawnPoint: Vector2D | null = null;
  private entities: Map<string, any> = new Map();
  private isLocked: boolean = true;
  private isVisible: boolean = false;
  private _isBossDefeated: boolean = false;

  constructor(config: BossRegionConfig) {
    super({
      id: config.id,
      type: 'boss',
      name: config.name,
      position: config.position,
      size: config.size,
      difficulty: config.difficulty,
      level: config.level
    });
  }

  async initialize(): Promise<void> {
    console.log(`Initializing boss region: ${this.id} with difficulty ${this.difficulty} and level ${this.level}`);
  }

  destroy(): void {
    console.log(`Destroying boss region: ${this.id}`);
  }

  isPositionInRegion(position: Vector2D): boolean {
    return position.x >= this.position.x && position.x <= this.position.x + this.size.width &&
           position.y >= this.position.y && position.y <= this.position.y + this.size.height;
  }

  getCenter(): Vector2D {
    return new Vector2D(
      this.position.x + this.size.width / 2,
      this.position.y + this.size.height / 2
    );
  }

  getBounds(): { min: Vector2D; max: Vector2D } {
    return {
      min: this.position,
      max: new Vector2D(this.position.x + this.size.width, this.position.y + this.size.height)
    };
  }

  overlaps(other: IRegion): boolean {
    const a = this.getBounds();
    const b = other.getBounds();
    return a.min.x < b.max.x && a.max.x > b.min.x && a.min.y < b.max.y && a.max.y > b.min.y;
  }

  getSpacing(other: IRegion): number {
    const a = this.getCenter();
    const b = other.getCenter();
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
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

  update(delta: number): void {
    super.update(delta);

    // 更新区域内的实体
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(delta);
      }
    });

    // 检查区域状态
    this.checkRegionState();
  }

  private checkRegionState(): void {
    // 检查Boss是否已被击败
    const isDefeated = this._isBossDefeated;
    
    if (isDefeated) {
      this.onBossDefeated();
    }
  }

  private onBossDefeated(): void {
    // Boss被击败后的处理
    this.isLocked = false;
    this.setProperty('isLocked', false);
  }

  setupCollisions(regions: IRegion[]): void {
    // 设置Boss区域的特殊碰撞
  }

  // Boss区域特有方法
  getBossSpawnPoint(): Vector2D | null {
    return this.bossSpawnPoint;
  }

  setBossSpawnPoint(point: Vector2D): void {
    this.bossSpawnPoint = point;
  }

  isRegionLocked(): boolean {
    return this.isLocked;
  }

  setRegionLocked(locked: boolean): void {
    this.isLocked = locked;
    this.setProperty('isLocked', locked);
  }

  isRegionVisible(): boolean {
    return this.isVisible;
  }

  setRegionVisible(visible: boolean): void {
    this.isVisible = visible;
    this.setProperty('isVisible', visible);
  }

  isBossDefeated(): boolean {
    return this._isBossDefeated;
  }

  setBossDefeated(defeated: boolean): void {
    this._isBossDefeated = defeated;
    this.setProperty('isBossDefeated', defeated);
  }
} 