import { IRegion } from '@/core/interfaces/IRegion';
import { BaseRegion } from '@/core/implementations/BaseRegion';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';

interface SpawnRegionConfig {
  id: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level?: number;
}

export class SpawnRegion extends BaseRegion implements IRegion {
  public level: number;
  private spawnPoints: Vector2D[];
  private isInitialized: boolean;
  private entities: Map<string, any> = new Map();
  protected properties: Map<string, any> = new Map();
  protected isActive: boolean = false;
  protected lastUpdateTime: number = 0;

  constructor(config: SpawnRegionConfig) {
    super({
      id: config.id,
      type: 'spawn',
      name: config.name,
      position: config.position,
      size: config.size,
      difficulty: config.difficulty
    });

    this.spawnPoints = [];
    this.isInitialized = false;
    this.level = config.level ?? 1;
  }

  isPositionInRegion(position: Vector2D): boolean {
    return position.x >= this.position.x && position.x <= this.position.x + this.size.width &&
           position.y >= this.position.y && position.y <= this.position.y + this.size.height;
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
    // 检查区域状态
    // 例如：玩家是否都已离开出生点
    const allPlayersLeft = this.checkAllPlayersLeft();
    
    if (allPlayersLeft) {
      this.onAllPlayersLeft();
    }
  }

  private checkAllPlayersLeft(): boolean {
    // 检查是否所有玩家都已离开出生点
    return Array.from(this.entities.values()).every(entity => 
      entity.type !== 'player' || !this.isPositionInRegion(entity.position)
    );
  }

  private onAllPlayersLeft(): void {
    // 所有玩家离开出生点后的处理
    // 例如：关闭出生点、触发事件等
    console.log('All players have left the spawn region');
    this.properties.set('allPlayersLeft', true);
  }

  // 获取随机出生点
  getRandomSpawnPoint(): Vector2D {
    if (this.spawnPoints.length === 0) {
      // 如果没有预设的出生点，生成一个随机位置
      return this.generateRandomSpawnPoint();
    }
    
    // 从预设的出生点中随机选择一个
    const index = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[index];
  }

  private generateRandomSpawnPoint(): Vector2D {
    // 在区域内生成一个随机位置
    const x = this.position.x + Math.random() * this.size.width;
    const y = this.position.y + Math.random() * this.size.height;
    
    return new Vector2D(x, y);
  }

  // 添加出生点
  addSpawnPoint(position: Vector2D): void {
    if (this.isPositionInRegion(position)) {
      this.spawnPoints.push(position);
    }
  }

  // 移除出生点
  removeSpawnPoint(position: Vector2D): void {
    const index = this.spawnPoints.findIndex(
      p => p.x === position.x && p.y === position.y
    );
    
    if (index !== -1) {
      this.spawnPoints.splice(index, 1);
    }
  }

  // 初始化出生点
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 初始化生成点区域
    console.log(`Initializing spawn region: ${this.id}`);

    // 生成默认出生点
    this.generateDefaultSpawnPoints();
    
    this.isInitialized = true;
    this.properties.set('isInitialized', true);
  }

  private generateDefaultSpawnPoints(): void {
    // 生成默认的出生点
    // 例如：在区域中心生成一个出生点
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    
    this.addSpawnPoint(new Vector2D(centerX, centerY));
  }

  setupCollisions(regions: IRegion[]): void {
    // 设置出生点区域的特殊碰撞
    // 例如：出生点保护区域、传送门等
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

  destroy(): void {
    // 清理生成点区域
    console.log(`Destroying spawn region: ${this.id}`);
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
} 