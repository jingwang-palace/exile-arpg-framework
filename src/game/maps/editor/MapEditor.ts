import { Position, Size } from '@/core/interfaces/IMapSystem';
import { DungeonMap } from '../DungeonMap';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';
import { Teleporter, TeleporterManager } from '../teleporters/Teleporter';

export interface IMapEditor {
  map: DungeonMap;
  selectedRegion: string | null;
  selectedConnection: string | null;
  isEditing: boolean;
}

export class MapEditor implements IMapEditor {
  map: DungeonMap;
  selectedRegion: string | null;
  selectedConnection: string | null;
  isEditing: boolean;
  private teleporterManager: TeleporterManager;

  constructor() {
    this.map = new DungeonMap({
      id: `map_${Date.now()}`,
      name: '新地图',
      size: { width: 1000, height: 1000 },
      roomCount: 10,
      difficulty: 1,
      level: 1
    });
    this.selectedRegion = null;
    this.selectedConnection = null;
    this.isEditing = false;
    this.teleporterManager = new TeleporterManager();
  }

  // 生成新地图
  generateMap(config: {
    width: number;
    height: number;
    roomCount: number;
    minRoomSize?: number;
    maxRoomSize?: number;
  }): void {
    const generator = new DungeonGenerator(config);
    this.map = generator.generate();
    this.selectedRegion = null;
    this.selectedConnection = null;
  }

  // 选择区域
  selectRegion(regionId: string): void {
    this.selectedRegion = regionId;
    this.selectedConnection = null;
  }

  // 选择连接
  selectConnection(connectionId: string): void {
    this.selectedConnection = connectionId;
    this.selectedRegion = null;
  }

  // 添加区域
  addRegion(config: {
    id: string;
    name: string;
    position: Position;
    size: Size;
    type: string;
  }): void {
    // 根据类型创建不同的区域
    switch (config.type) {
      case 'combat':
        this.map.addRegion({
          id: config.id,
          name: config.name,
          position: config.position,
          size: config.size,
          type: 'combat'
        });
        break;
      case 'boss':
        this.map.addRegion({
          id: config.id,
          name: config.name,
          position: config.position,
          size: config.size,
          type: 'boss'
        });
        break;
      case 'treasure':
        this.map.addRegion({
          id: config.id,
          name: config.name,
          position: config.position,
          size: config.size,
          type: 'treasure'
        });
        break;
      case 'spawn':
        this.map.addRegion({
          id: config.id,
          name: config.name,
          position: config.position,
          size: config.size,
          type: 'spawn'
        });
        break;
    }
  }

  // 移除区域
  removeRegion(regionId: string): void {
    this.map.removeRegion(regionId);
    if (this.selectedRegion === regionId) {
      this.selectedRegion = null;
    }
  }

  // 添加连接
  addConnection(config: {
    id: string;
    sourceRegion: string;
    targetRegion: string;
    position: Position;
    type: ConnectionType;
  }): void {
    const sourceRegion = this.map.getRegion(config.sourceRegion);
    const targetRegion = this.map.getRegion(config.targetRegion);

    if (sourceRegion && targetRegion) {
      const connection = new RegionConnection({
        id: config.id,
        sourceRegion,
        targetRegion,
        position: config.position,
        type: config.type
      });

      this.map.addConnection(connection);

      // 如果是传送器类型，创建对应的传送点
      if (config.type === ConnectionType.TELEPORTER) {
        const teleporter = this.teleporterManager.createTeleporterFromConnection(connection);
        this.teleporterManager.addTeleporter(teleporter);
      }
    }
  }

  // 移除连接
  removeConnection(connectionId: string): void {
    this.map.removeConnection(connectionId);
    if (this.selectedConnection === connectionId) {
      this.selectedConnection = null;
    }

    // 如果是传送器，同时移除对应的传送点
    const teleporter = this.teleporterManager.getTeleporter(`teleporter_${connectionId}`);
    if (teleporter) {
      this.teleporterManager.removeTeleporter(teleporter.id);
    }
  }

  // 移动区域
  moveRegion(regionId: string, newPosition: Position): void {
    const region = this.map.getRegion(regionId);
    if (region) {
      region.position = newPosition;
      // 更新相关的连接位置
      this.updateConnectionsForRegion(regionId);
    }
  }

  // 调整区域大小
  resizeRegion(regionId: string, newSize: Size): void {
    const region = this.map.getRegion(regionId);
    if (region) {
      region.size = newSize;
      // 更新相关的连接位置
      this.updateConnectionsForRegion(regionId);
    }
  }

  // 更新区域相关的连接
  private updateConnectionsForRegion(regionId: string): void {
    const connections = this.map.getConnectionsForRegion(regionId);
    connections.forEach(connection => {
      // 更新连接位置
      const newPosition = this.calculateConnectionPosition(connection);
      connection.position = newPosition;

      // 如果是传送器，更新传送点位置
      if (connection.type === ConnectionType.TELEPORTER) {
        const teleporter = this.teleporterManager.getTeleporter(`teleporter_${connection.id}`);
        if (teleporter) {
          teleporter.position = newPosition;
          teleporter.targetPosition = connection.getTargetPosition();
        }
      }
    });
  }

  // 计算连接位置
  private calculateConnectionPosition(connection: RegionConnection): Position {
    const sourceRegion = connection.sourceRegion;
    const targetRegion = connection.targetRegion;

    // 计算两个区域之间的中点
    const sourceCenter = {
      x: sourceRegion.position.x + sourceRegion.size.width / 2,
      y: sourceRegion.position.y + sourceRegion.size.height / 2
    };
    const targetCenter = {
      x: targetRegion.position.x + targetRegion.size.width / 2,
      y: targetRegion.position.y + targetRegion.size.height / 2
    };

    return {
      x: (sourceCenter.x + targetCenter.x) / 2,
      y: (sourceCenter.y + targetCenter.y) / 2
    };
  }

  // 保存地图
  saveMap(): string {
    return JSON.stringify({
      map: this.map,
      teleporters: Array.from(this.teleporterManager.getAllTeleporters())
    });
  }

  // 加载地图
  loadMap(data: string): void {
    const parsed = JSON.parse(data);
    this.map = DungeonMap.fromJSON(parsed.map);
    this.teleporterManager = new TeleporterManager();
    parsed.teleporters.forEach((teleporterData: any) => {
      const teleporter = new Teleporter(teleporterData);
      this.teleporterManager.addTeleporter(teleporter);
    });
  }

  // 获取地图预览数据
  getMapPreview(): any {
    return {
      regions: this.map.getRegions().map(region => ({
        id: region.id,
        name: region.name,
        position: region.position,
        size: region.size,
        type: region.type
      })),
      connections: this.map.getConnections().map(connection => ({
        id: connection.id,
        sourceRegion: connection.sourceRegion.id,
        targetRegion: connection.targetRegion.id,
        position: connection.position,
        type: connection.type
      })),
      teleporters: this.teleporterManager.getAllTeleporters().map(teleporter => ({
        id: teleporter.id,
        position: teleporter.position,
        targetPosition: teleporter.targetPosition,
        isActive: teleporter.isActive,
        cooldown: teleporter.cooldown
      }))
    };
  }
} 