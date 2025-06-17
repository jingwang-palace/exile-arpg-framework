export interface ItemConfig {
  id: string;
  name: string;
  type: ItemType;
  level?: number;
  stackable?: boolean;
  maxStack?: number;
}

export enum ItemType {
  MATERIAL = 'material',
  CONSUMABLE = 'consumable',
  QUEST = 'quest',
  CURRENCY = 'currency'
}

export class Item {
  id: string;
  name: string;
  type: ItemType;
  level: number;
  stackable: boolean;
  maxStack: number;

  constructor(config: ItemConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.level = config.level || 1;
    this.stackable = config.stackable ?? true;
    this.maxStack = config.maxStack || 999;
  }
} 