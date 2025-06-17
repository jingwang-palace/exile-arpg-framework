import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IMapEntity } from '@/core/interfaces/IMapEntity';
import { IConnection } from '@/core/interfaces/IConnection';

export class MapUpdater {
  private map: DungeonMap;
  private lastUpdateTime: number = 0;
  private isUpdating: boolean = false;

  constructor(map: DungeonMap) {
    this.map = map;
  }

  start(): void {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.lastUpdateTime = Date.now();
    this.update();
  }

  stop(): void {
    this.isUpdating = false;
  }

  private update(): void {
    if (!this.isUpdating) return;

    const currentTime = Date.now();
    const delta = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;

    // 更新地图
    this.map.update(delta);

    // 更新区域
    this.updateRegions(delta);

    // 更新实体
    this.updateEntities(delta);

    // 更新连接
    this.updateConnections(delta);

    // 检查碰撞
    this.checkCollisions();

    // 继续更新循环
    requestAnimationFrame(() => this.update());
  }

  private updateRegions(delta: number): void {
    this.map.regions.forEach(region => {
      region.update(delta);
    });
  }

  private updateEntities(delta: number): void {
    this.map.entities.forEach(entity => {
      entity.update(delta);
    });
  }

  private updateConnections(delta: number): void {
    this.map.getConnections().forEach(connection => {
      // 这里可以添加连接的更新逻辑
    });
  }

  private checkCollisions(): void {
    // 检查实体之间的碰撞
    const entities = Array.from(this.map.entities.values());
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        if (this.checkEntityCollision(entity1, entity2)) {
          entity1.onCollision(entity2);
          entity2.onCollision(entity1);
        }
      }
    }

    // 检查实体与区域的碰撞
    entities.forEach(entity => {
      this.map.regions.forEach(region => {
        if (region.isInRegion(entity.position)) {
          // 这里可以添加实体进入区域的逻辑
        }
      });
    });
  }

  private checkEntityCollision(entity1: IMapEntity, entity2: IMapEntity): boolean {
    const dx = entity1.position.x - entity2.position.x;
    const dy = entity1.position.y - entity2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 这里可以根据实体的实际大小来调整碰撞检测
    const collisionDistance = 10; // 假设实体半径为5

    return distance < collisionDistance;
  }
} 