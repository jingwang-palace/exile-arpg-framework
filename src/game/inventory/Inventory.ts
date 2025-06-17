import { Item } from '../items/Item';

export class Inventory {
  private items: Map<string, number>;

  constructor() {
    this.items = new Map();
  }

  addItem(item: Item, count: number = 1): void {
    const currentCount = this.items.get(item.id) || 0;
    this.items.set(item.id, currentCount + count);
  }

  removeItem(itemId: string, count: number = 1): void {
    const currentCount = this.items.get(itemId) || 0;
    if (currentCount < count) {
      throw new Error('物品数量不足');
    }
    this.items.set(itemId, currentCount - count);
  }

  getItemCount(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  getAllItems(): Map<string, number> {
    return new Map(this.items);
  }
} 