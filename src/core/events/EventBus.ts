import { GameEvents } from '../types/GameEvents';

type EventHandler = (...args: any[]) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]>;

  private constructor() {
    this.handlers = new Map();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) return;
    const handlers = this.handlers.get(event)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.handlers.has(event)) return;
    this.handlers.get(event)!.forEach(handler => handler(...args));
  }

  clear(): void {
    this.handlers.clear();
  }
}

// 为了兼容性，提供静态方法
export const on = (event: string, handler: EventHandler) => EventBus.getInstance().on(event, handler);
export const off = (event: string, handler: EventHandler) => EventBus.getInstance().off(event, handler);
export const emit = (event: string, ...args: any[]) => EventBus.getInstance().emit(event, ...args);
export const clear = () => EventBus.getInstance().clear(); 