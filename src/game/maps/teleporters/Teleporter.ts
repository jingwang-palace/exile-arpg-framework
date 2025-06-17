import { Position } from '@/core/interfaces/IMapSystem';
import { RegionConnection, ConnectionType } from '../connections/RegionConnection';

export interface ITeleporter {
  id: string;
  position: Position;
  targetPosition: Position;
  isActive: boolean;
  cooldown: number;
  lastUsed: number;
}

export class Teleporter implements ITeleporter {
  id: string;
  position: Position;
  targetPosition: Position;
  isActive: boolean;
  cooldown: number;
  lastUsed: number;

  constructor(config: {
    id: string;
    position: Position;
    targetPosition: Position;
    cooldown?: number;
  }) {
    this.id = config.id;
    this.position = config.position;
    this.targetPosition = config.targetPosition;
    this.isActive = true;
    this.cooldown = config.cooldown || 5000; // 默认5秒冷却
    this.lastUsed = 0;
  }

  canUse(): boolean {
    return this.isActive && Date.now() - this.lastUsed >= this.cooldown;
  }

  use(): Position | null {
    if (!this.canUse()) {
      return null;
    }

    this.lastUsed = Date.now();
    return this.targetPosition;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  isInRange(position: Position, range: number): boolean {
    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  getRemainingCooldown(): number {
    const elapsed = Date.now() - this.lastUsed;
    return Math.max(0, this.cooldown - elapsed);
  }

  setCooldown(cooldown: number): void {
    this.cooldown = cooldown;
  }

  resetCooldown(): void {
    this.lastUsed = 0;
  }
}

export class TeleporterManager {
  private teleporters: Map<string, Teleporter>;

  constructor() {
    this.teleporters = new Map();
  }

  addTeleporter(teleporter: Teleporter): void {
    this.teleporters.set(teleporter.id, teleporter);
  }

  removeTeleporter(id: string): void {
    this.teleporters.delete(id);
  }

  getTeleporter(id: string): Teleporter | undefined {
    return this.teleporters.get(id);
  }

  getAllTeleporters(): Teleporter[] {
    return Array.from(this.teleporters.values());
  }

  getTeleportersInRange(position: Position, range: number): Teleporter[] {
    return this.getAllTeleporters().filter(teleporter =>
      teleporter.isInRange(position, range)
    );
  }

  createTeleporterFromConnection(connection: RegionConnection): Teleporter {
    return new Teleporter({
      id: `teleporter_${connection.id}`,
      position: connection.position,
      targetPosition: connection.getTargetPosition(),
      cooldown: 5000
    });
  }

  update(): void {
    // 更新所有传送点的状态
    this.teleporters.forEach(teleporter => {
      // 可以在这里添加额外的更新逻辑
    });
  }
} 