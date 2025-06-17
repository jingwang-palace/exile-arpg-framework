import { IRegion } from '../interfaces/IRegion';
import { Vector2D } from '../math/Vector2D';
import { Size } from '../math/Size';

export interface BaseRegionConfig {
  id: string;
  type: string;
  name: string;
  position: Vector2D;
  size: Size;
  difficulty: number;
  level?: number;
}

export abstract class BaseRegion implements IRegion {
  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly position: Vector2D;
  public readonly size: Size;
  public readonly difficulty: number;
  public readonly level: number;
  protected properties: Map<string, any>;
  protected isActive: boolean = false;
  protected lastUpdateTime: number = 0;

  constructor(config: BaseRegionConfig) {
    this.id = config.id;
    this.type = config.type;
    this.name = config.name;
    this.position = config.position;
    this.size = config.size;
    this.difficulty = config.difficulty;
    this.level = config.level ?? 1;
    this.properties = new Map();
  }

  public abstract initialize(): Promise<void>;
  public abstract destroy(): void;

  public getProperty<T>(key: string): T | undefined {
    return this.properties.get(key) as T;
  }

  public setProperty<T>(key: string, value: T): void {
    this.properties.set(key, value);
  }

  public hasProperty(key: string): boolean {
    return this.properties.has(key);
  }

  public removeProperty(key: string): boolean {
    return this.properties.delete(key);
  }

  public clearProperties(): void {
    this.properties.clear();
  }

  isPositionInRegion(position: Vector2D): boolean {
    return (
      position.x >= this.position.x &&
      position.x <= this.position.x + this.size.width &&
      position.y >= this.position.y &&
      position.y <= this.position.y + this.size.height
    );
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
      max: new Vector2D(
        this.position.x + this.size.width,
        this.position.y + this.size.height
      )
    };
  }

  overlaps(region: IRegion): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = region.getBounds();
    return !(
      bounds1.max.x < bounds2.min.x ||
      bounds1.min.x > bounds2.max.x ||
      bounds1.max.y < bounds2.min.y ||
      bounds1.min.y > bounds2.max.y
    );
  }

  contains(region: IRegion): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = region.getBounds();
    return (
      bounds1.min.x <= bounds2.min.x &&
      bounds1.max.x >= bounds2.max.x &&
      bounds1.min.y <= bounds2.min.y &&
      bounds1.max.y >= bounds2.max.y
    );
  }

  intersects(region: IRegion): boolean {
    return this.overlaps(region) && !this.contains(region) && !region.contains(this);
  }

  // 获取区域面积
  getArea(): number {
    return this.size.width * this.size.height;
  }

  // 获取区域周长
  getPerimeter(): number {
    return 2 * (this.size.width + this.size.height);
  }

  // 检查区域是否有效
  isValid(): boolean {
    return (
      this.size.width > 0 &&
      this.size.height > 0 &&
      this.difficulty >= 1 &&
      this.difficulty <= 10
    );
  }

  // 更新区域
  update(delta: number): void {
    this.lastUpdateTime = Date.now();
    this.isActive = true;
  }

  // 获取区域属性
  getProperties(): Map<string, any> {
    return new Map(this.properties);
  }

  // 检查区域是否激活
  isRegionActive(): boolean {
    return this.isActive;
  }

  // 获取最后更新时间
  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  // 获取区域位置
  getPosition(): Vector2D {
    return this.position;
  }

  // 获取区域大小
  getSize(): Size {
    return this.size;
  }

  // 获取区域间距
  getSpacing(other: IRegion): number {
    const a = this.getCenter();
    const b = other.getCenter();
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
} 