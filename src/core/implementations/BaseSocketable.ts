import { ISocketable, ISocketableEffect, ISocketableEffectCondition } from '../interfaces/ISocketable';

export abstract class BaseSocketable implements ISocketable {
  id: string;
  name: string;
  description: string;
  socketType: string;
  socketCount: number;
  socketedItems: any[];
  effects: ISocketableEffect[];

  constructor(config: {
    id: string;
    name: string;
    description: string;
    socketType: string;
    socketCount: number;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.socketType = config.socketType;
    this.socketCount = config.socketCount;
    this.socketedItems = [];
    this.effects = [];
  }

  onSocket(item: any): void {
    if (this.socketedItems.length >= this.socketCount) {
      throw new Error('No available sockets');
    }
    this.socketedItems.push(item);
    this.onEffectChange();
  }

  onUnsocket(item: any): void {
    const index = this.socketedItems.indexOf(item);
    if (index !== -1) {
      this.socketedItems.splice(index, 1);
      this.onEffectChange();
    }
  }

  onEffectChange(): void {
    // 重新计算效果
    this.effects = this.calculateEffects();
  }

  protected abstract calculateEffects(): ISocketableEffect[];
} 