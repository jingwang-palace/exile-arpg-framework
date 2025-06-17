import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { IMapEntity, MapType } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from './connections/RegionConnection';
import { BaseMap } from '@/core/implementations/BaseMap';
import { DungeonRegion } from './regions/DungeonRegion';
import { BossRegion } from './regions/BossRegion';
import { TreasureRegion } from './regions/TreasureRegion';
import { SpawnRegion } from './regions/SpawnRegion';
import { IMap } from '@/core/interfaces/IMap';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';
import { MapEvent, MapEventManager, MapEventTypes, MapEventFactory } from './events/MapEvents';
import { MapStateManager } from './state/MapState';
import { MapValidator } from './validation/MapValidator';

export class DungeonMap implements IMap {
  id: string;
  type: MapType;
  name: string;
  level: number;
  difficulty: number;
  size: Size;
  regions: IRegion[];
  connections: IConnection[];
  properties: Map<string, any>;
  entities: Map<string, IMapEntity>;

  private eventManager: MapEventManager;
  private stateManager: MapStateManager;

  constructor(id: string, size: Size) {
    this.id = id;
    this.type = MapType.DUNGEON;
    this.name = `地下城 ${id}`;
    this.level = 1;
    this.difficulty = 1;
    this.size = size;
    this.regions = [];
    this.connections = [];
    this.properties = new Map();
    this.entities = new Map();

    this.eventManager = new MapEventManager();
    this.stateManager = new MapStateManager(this);
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    this.eventManager.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    this.eventManager.removeEventListener(type, listener);
  }

  async initialize(): Promise<void> {
    // 初始化所有区域
    for (const region of this.regions) {
      await region.initialize();
    }

    // 初始化所有连接
    for (const connection of this.connections) {
      await connection.initialize();
    }

    this.eventManager.dispatchEvent(MapEventFactory.createMapInitializedEvent(this));
    console.log(`Initialized map: ${this.id}`);
  }

  destroy(): void {
    // 清理所有连接
    for (const connection of this.connections) {
      connection.destroy();
    }

    // 清理所有区域
    for (const region of this.regions) {
      region.destroy();
    }

    this.regions = [];
    this.connections = [];
    this.properties.clear();
    this.entities.clear();

    this.eventManager.dispatchEvent(MapEventFactory.createMapDestroyedEvent(this));
    console.log(`Destroyed map: ${this.id}`);
  }

  addRegion(region: IRegion): void {
    if (this.getRegion(region.id)) {
      throw new Error(`Region with id ${region.id} already exists`);
    }
    this.regions.push(region);
    this.eventManager.dispatchEvent(MapEventFactory.createRegionAddedEvent(region));
  }

  removeRegion(regionId: string): boolean {
    const index = this.regions.findIndex(r => r.id === regionId);
    if (index !== -1) {
      const region = this.regions[index];
      region.destroy();
      this.regions.splice(index, 1);

      // 移除相关的连接
      this.connections = this.connections.filter(conn => 
        conn.source.id !== regionId && conn.target.id !== regionId
      );

      this.eventManager.dispatchEvent(MapEventFactory.createRegionRemovedEvent(region));
      return true;
    }
    return false;
  }

  getRegion(regionId: string): IRegion | undefined {
    return this.regions.find(r => r.id === regionId);
  }

  getRegions(): IRegion[] {
    return [...this.regions];
  }

  getConnections(): IConnection[] {
    return [...this.connections];
  }

  addConnection(connection: IConnection): void {
    if (this.getConnection(connection.id)) {
      throw new Error(`Connection with id ${connection.id} already exists`);
    }
    this.connections.push(connection);
    this.eventManager.dispatchEvent(MapEventFactory.createConnectionAddedEvent(connection));
  }

  removeConnection(connectionId: string): boolean {
    const index = this.connections.findIndex(c => c.id === connectionId);
    if (index !== -1) {
      const connection = this.connections[index];
      connection.destroy();
      this.connections.splice(index, 1);
      this.eventManager.dispatchEvent(MapEventFactory.createConnectionRemovedEvent(connection));
      return true;
    }
    return false;
  }

  getConnection(connectionId: string): IConnection | undefined {
    return this.connections.find(c => c.id === connectionId);
  }

  getConnectionsByRegion(regionId: string): IConnection[] {
    return this.connections.filter(c => 
      c.source.id === regionId || c.target.id === regionId
    );
  }

  getConnectedRegions(regionId: string): IRegion[] {
    const connectedRegions: IRegion[] = [];
    for (const connection of this.connections) {
      if (connection.source.id === regionId) {
        connectedRegions.push(connection.target);
      } else if (connection.target.id === regionId) {
        connectedRegions.push(connection.source);
      }
    }
    return connectedRegions;
  }

  isPositionInMap(position: Vector2D): boolean {
    return (
      position.x >= 0 &&
      position.x < this.size.width &&
      position.y >= 0 &&
      position.y < this.size.height
    );
  }

  getRegionAtPosition(position: Vector2D): IRegion | undefined {
    return this.regions.find(region => region.isPositionInRegion(position));
  }

  setCurrentRegion(regionId: string): void {
    this.stateManager.setCurrentRegion(regionId);
  }

  getCurrentRegion(): string | null {
    return this.stateManager.getCurrentRegion();
  }

  visitRegion(regionId: string): void {
    this.stateManager.visitRegion(regionId);
  }

  clearRegion(regionId: string): void {
    this.stateManager.clearRegion(regionId);
  }

  exploreRegion(regionId: string): void {
    this.stateManager.exploreRegion(regionId);
  }

  exploreConnection(connectionId: string): void {
    this.stateManager.exploreConnection(connectionId);
  }

  traverseConnection(connectionId: string): void {
    this.stateManager.traverseConnection(connectionId);
  }

  isRegionVisited(regionId: string): boolean {
    return this.stateManager.isRegionVisited(regionId);
  }

  isRegionCleared(regionId: string): boolean {
    return this.stateManager.isRegionCleared(regionId);
  }

  isRegionExplored(regionId: string): boolean {
    return this.stateManager.isRegionExplored(regionId);
  }

  isConnectionExplored(connectionId: string): boolean {
    return this.stateManager.isConnectionExplored(connectionId);
  }

  isConnectionTraversed(connectionId: string): boolean {
    return this.stateManager.isConnectionTraversed(connectionId);
  }

  getVisitedRegions(): string[] {
    return this.stateManager.getVisitedRegions();
  }

  getClearedRegions(): string[] {
    return this.stateManager.getClearedRegions();
  }

  getExploredConnections(): string[] {
    return this.stateManager.getExploredConnections();
  }

  getRegionState(regionId: string): any {
    return this.stateManager.getRegionState(regionId);
  }

  getConnectionState(connectionId: string): any {
    return this.stateManager.getConnectionState(connectionId);
  }

  setRegionProperty(regionId: string, key: string, value: any): void {
    this.stateManager.setRegionProperty(regionId, key, value);
  }

  setConnectionProperty(connectionId: string, key: string, value: any): void {
    this.stateManager.setConnectionProperty(connectionId, key, value);
  }

  setMapProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }

  getRegionProperty(regionId: string, key: string): any {
    return this.stateManager.getRegionProperty(regionId, key);
  }

  getConnectionProperty(connectionId: string, key: string): any {
    return this.stateManager.getConnectionProperty(connectionId, key);
  }

  getMapProperty(key: string): any {
    return this.properties.get(key);
  }

  reset(): void {
    this.stateManager.reset();
  }

  validate(): string[] {
    return MapValidator.validateMap(this);
  }

  spawnEntity(entity: IMapEntity, position: Vector2D): void {
    if (!this.isPositionInMap(position)) {
      throw new Error('Entity position is outside map bounds');
    }
    this.entities.set(entity.id, entity);
    this.eventManager.dispatchEvent(MapEventFactory.createEntitySpawnedEvent(entity));
  }

  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      this.entities.delete(entityId);
      this.eventManager.dispatchEvent(MapEventFactory.createEntityRemovedEvent(entity));
    }
  }

  getEntitiesInArea(area: { position: Vector2D; size: Size }): IMapEntity[] {
    return Array.from(this.entities.values()).filter(entity => {
      const entityPos = entity.position;
      return (
        entityPos.x >= area.position.x &&
        entityPos.x < area.position.x + area.size.width &&
        entityPos.y >= area.position.y &&
        entityPos.y < area.position.y + area.size.height
      );
    });
  }

  protected async loadRegions(): Promise<void> {
    // 创建入口区域
    const spawnRegion = new SpawnRegion({
      id: `${this.id}_spawn`,
      name: '入口',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 }
    });

    // 创建Boss区域
    const bossRegion = new BossRegion({
      id: `${this.id}_boss`,
      name: 'Boss房间',
      position: { x: this.size.width - 200, y: this.size.height - 200 },
      size: { width: 200, height: 200 },
      level: this.level,
      difficulty: this.difficulty
    });

    // 创建宝箱区域
    const treasureRegion = new TreasureRegion({
      id: `${this.id}_treasure`,
      name: '宝箱房间',
      position: { x: this.size.width / 2, y: this.size.height / 2 },
      size: { width: 150, height: 150 }
    });

    // 创建战斗区域
    const combatRegions = this.generateCombatRegions();

    this.regions = [
      spawnRegion,
      bossRegion,
      treasureRegion,
      ...combatRegions
    ];

    // 连接区域
    this.connectRegions();
  }

  protected async loadEntities(): Promise<void> {
    // 为每个区域加载对应的实体
    this.regions.forEach(region => {
      if (region instanceof BossRegion) {
        this.loadBossEntities(region);
      } else if (region instanceof TreasureRegion) {
        this.loadTreasureEntities(region);
      } else if (region instanceof DungeonRegion) {
        this.loadCombatEntities(region);
      }
    });
  }

  protected async setupCollisions(): Promise<void> {
    // 设置区域之间的碰撞检测
    for (const region of this.regions) {
      for (const other of this.regions) {
        if (region !== other && region.overlaps(other)) {
          console.warn(`Region ${region.id} overlaps with ${other.id}`);
        }
      }
    }
  }

  update(delta: number): void {
    // 更新所有区域
    for (const region of this.regions) {
      // 区域不需要更新
    }

    // 更新所有实体
    for (const entity of this.entities.values()) {
      entity.update(delta);
    }

    this.eventManager.dispatchEvent(MapEventFactory.createMapUpdatedEvent(this));
  }

  private generateCombatRegions(): DungeonRegion[] {
    const regions: DungeonRegion[] = [];
    const minSize = new Size(100, 100);
    const maxSize = new Size(200, 200);
    const spacing = 50;

    for (let i = 0; i < 5; i++) {
      const size = new Size(
        Math.random() * (maxSize.width - minSize.width) + minSize.width,
        Math.random() * (maxSize.height - minSize.height) + minSize.height
      );

      const position = new Vector2D(
        Math.random() * (this.size.width - size.width),
        Math.random() * (this.size.height - size.height)
      );

      const region = new DungeonRegion({
        id: `combat_${i}`,
        name: `战斗区域 ${i}`,
        position,
        size,
        difficulty: this.difficulty
      });

      regions.push(region);
    }

    return regions;
  }

  private connectRegions(): void {
    // 连接相邻的区域
    for (let i = 0; i < this.regions.length; i++) {
      for (let j = i + 1; j < this.regions.length; j++) {
        const region1 = this.regions[i];
        const region2 = this.regions[j];

        if (this.areRegionsAdjacent(region1, region2)) {
          const connection = new RegionConnection({
            id: `connection_${region1.id}_${region2.id}`,
            type: ConnectionType.NORMAL,
            sourceRegion: region1,
            targetRegion: region2,
            difficulty: Math.max(region1.difficulty, region2.difficulty)
          });

          this.addConnection(connection);
        }
      }
    }
  }

  private areRegionsAdjacent(region1: IRegion, region2: IRegion): boolean {
    const bounds1 = region1.getBounds();
    const bounds2 = region2.getBounds();
    const spacing = 50;

    // 检查水平方向
    const horizontalOverlap = !(
      bounds1.max.x + spacing < bounds2.min.x ||
      bounds2.max.x + spacing < bounds1.min.x
    );

    // 检查垂直方向
    const verticalOverlap = !(
      bounds1.max.y + spacing < bounds2.min.y ||
      bounds2.max.y + spacing < bounds1.min.y
    );

    return horizontalOverlap && verticalOverlap;
  }

  private loadBossEntities(region: BossRegion): void {
    const center = region.getCenter();
    const boss = this.createBoss();
    boss.position = center;
    this.spawnEntity(boss, center);
  }

  private loadTreasureEntities(region: TreasureRegion): void {
    const center = region.getCenter();
    const treasure = this.createTreasure();
    treasure.position = center;
    this.spawnEntity(treasure, center);
  }

  private loadCombatEntities(region: DungeonRegion): void {
    const center = region.getCenter();
    const monster = this.createMonster();
    monster.position = center;
    this.spawnEntity(monster, center);
  }

  private createBoss(): any {
    return {
      id: `boss_${Date.now()}`,
      type: 'boss',
      position: { x: 0, y: 0 },
      properties: new Map(),
      update: (delta: number) => {},
      onCollision: (other: IMapEntity) => {},
      destroy: () => {}
    };
  }

  private createTreasure(): any {
    return {
      id: `treasure_${Date.now()}`,
      type: 'treasure',
      position: { x: 0, y: 0 },
      properties: new Map(),
      update: (delta: number) => {},
      onCollision: (other: IMapEntity) => {},
      destroy: () => {}
    };
  }

  private createMonster(): any {
    return {
      id: `monster_${Date.now()}`,
      type: 'monster',
      position: { x: 0, y: 0 },
      properties: new Map(),
      update: (delta: number) => {},
      onCollision: (other: IMapEntity) => {},
      destroy: () => {}
    };
  }

  private addBossRoomDecorations(region: BossRegion): void {
    // 添加Boss房间的装饰
  }

  private addTreasureRoomDecorations(region: TreasureRegion): void {
    // 添加宝箱房间的装饰
  }

  private addCombatRoomDecorations(region: DungeonRegion): void {
    // 添加战斗房间的装饰
  }
} 