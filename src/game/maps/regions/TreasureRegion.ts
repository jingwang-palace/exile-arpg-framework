import { IRegion } from '@/core/interfaces/IRegion';
import { BaseRegion } from '@/core/implementations/BaseRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

interface TreasureRegionConfig {
  id: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level?: number;
}

export class TreasureRegion extends BaseRegion implements IRegion {
  public level: number;
  private treasurePoints: Vector2D[] = [];
  private entities: Map<string, any> = new Map();
  private isActive: boolean = false;
  private lastUpdateTime: number = 0;
  private isLocked: boolean = false;
  private isVisible: boolean = true;

  constructor(config: TreasureRegionConfig) {
    super({
      id: config.id,
      type: 'treasure',
      name: config.name,
      position: config.position,
      size: config.size,
      difficulty: config.difficulty
    });
    this.level = config.level ?? 1;
    this.properties.set('level', this.level);
  }

  async initialize(): Promise<void> {
    // 初始化宝藏区域
    console.log(`Initializing treasure region: ${this.id} with difficulty ${this.difficulty}`);
  }

  destroy(): void {
    // 清理宝藏区域
    console.log(`Destroying treasure region: ${this.id}`);
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

  contains(other: IRegion): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();
    return (
      bounds1.min.x <= bounds2.min.x &&
      bounds1.max.x >= bounds2.max.x &&
      bounds1.min.y <= bounds2.min.y &&
      bounds1.max.y >= bounds2.max.y
    );
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
    this.lastUpdateTime = Date.now();
    this.isActive = true;

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
    // 检查宝藏是否已被发现
    const isDiscovered = this.isTreasureDiscovered();
    
    if (isDiscovered) {
      this.onTreasureDiscovered();
    }
  }

  private isTreasureDiscovered(): boolean {
    // 检查是否所有宝藏都已被发现
    return Array.from(this.entities.values()).every(entity => 
      entity.type !== 'treasure' || entity.isDiscovered
    );
  }

  private onTreasureDiscovered(): void {
    // 宝藏被发现后的处理
    // 例如：生成奖励、解锁新区域等
    this.isLocked = false;
    this.properties.set('isLocked', false);
  }

  setupCollisions(regions: IRegion[]): void {
    // 设置宝藏区域的特殊碰撞
    // 例如：宝箱、陷阱等
  }

  // 新增方法
  getTreasurePoints(): Vector2D[] {
    return [...this.treasurePoints];
  }

  addTreasurePoint(point: Vector2D): void {
    this.treasurePoints.push(point);
  }

  isRegionLocked(): boolean {
    return this.isLocked;
  }

  setRegionLocked(locked: boolean): void {
    this.isLocked = locked;
    this.properties.set('isLocked', locked);
  }

  isRegionVisible(): boolean {
    return this.isVisible;
  }

  setRegionVisible(visible: boolean): void {
    this.isVisible = visible;
    this.properties.set('isVisible', visible);
  }

  isRegionActive(): boolean {
    return this.isActive;
  }

  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  getProperties(): Map<string, any> {
    return new Map(this.properties);
  }

  setProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }

  getProperty(key: string): any {
    return this.properties.get(key);
  }
} 