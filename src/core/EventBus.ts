/**
 * 事件总线 - 用于系统间的解耦通信
 * 采用发布-订阅模式，支持类型安全的事件处理
 */

export type EventCallback<T = any> = (data: T) => void

export interface GameEvents {
  // 引擎事件
  'engine:initialized': void
  'game:started': void
  'game:paused': void
  'game:resumed': void
  'game:stopped': void
  'error:global': Error
  
  // 角色事件
  'character:created': { characterId: string }
  'character:levelUp': { characterId: string; newLevel: number }
  'character:died': { characterId: string }
  'character:attributeChanged': { characterId: string; attribute: string; oldValue: number; newValue: number }
  
  // 战斗事件
  'combat:started': { attackerId: string; targetId: string }
  'combat:ended': { winnerId: string; loserId: string }
  'combat:damage': { attackerId: string; targetId: string; damage: number; damageType: string }
  'combat:heal': { targetId: string; amount: number }
  
  // 装备事件
  'equipment:equipped': { characterId: string; itemId: string; slot: string }
  'equipment:unequipped': { characterId: string; itemId: string; slot: string }
  'equipment:modified': { itemId: string; modificationType: string }
  
  // 物品事件
  'item:acquired': { characterId: string; itemId: string; quantity: number }
  'item:used': { characterId: string; itemId: string }
  'item:dropped': { characterId: string; itemId: string; quantity: number }
  
  // 技能事件
  'skill:learned': { characterId: string; skillId: string }
  'skill:upgraded': { characterId: string; skillId: string; newLevel: number }
  'skill:used': { characterId: string; skillId: string; targetId?: string }
  
  // 任务事件
  'quest:started': { characterId: string; questId: string }
  'quest:completed': { characterId: string; questId: string }
  'quest:failed': { characterId: string; questId: string }
  'quest:progressUpdated': { characterId: string; questId: string; progress: number }
  
  // 升华事件
  'ascendancy:selected': { characterId: string; ascendancyId: string }
  'ascendancy:nodeAllocated': { characterId: string; nodeId: string }
  'ascendancy:questCompleted': { characterId: string; questId: string }
  
  // 场景事件
  'scene:loaded': { sceneName: string }
  'scene:unloaded': { sceneName: string }
  'scene:changed': { fromScene: string; toScene: string }
  
  // UI事件
  'ui:menuOpened': { menuType: string }
  'ui:menuClosed': { menuType: string }
  'ui:notificationShown': { message: string; type: string }
}

export class EventBus {
  private static instance: EventBus
  private listeners: Map<keyof GameEvents, EventCallback[]> = new Map()
  
  private constructor() {}
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }
  
  /**
   * 订阅事件
   */
  public on<K extends keyof GameEvents>(
    event: K, 
    callback: EventCallback<GameEvents[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    const callbacks = this.listeners.get(event)!
    callbacks.push(callback as EventCallback)
    
    // 返回取消订阅函数
    return () => {
      const index = callbacks.indexOf(callback as EventCallback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  /**
   * 订阅事件（只执行一次）
   */
  public once<K extends keyof GameEvents>(
    event: K, 
    callback: EventCallback<GameEvents[K]>
  ): () => void {
    const unsubscribe = this.on(event, (data) => {
      callback(data)
      unsubscribe()
    })
    
    return unsubscribe
  }
  
  /**
   * 发布事件
   */
  public emit<K extends keyof GameEvents>(
    event: K, 
    data?: GameEvents[K]
  ): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks || callbacks.length === 0) {
      return
    }
    
    // 异步执行回调，避免阻塞
    setTimeout(() => {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件回调执行失败 [${event}]:`, error)
        }
      })
    }, 0)
  }
  
  /**
   * 取消订阅所有事件
   */
  public off<K extends keyof GameEvents>(event: K): void {
    this.listeners.delete(event)
  }
  
  /**
   * 清空所有事件监听器
   */
  public clear(): void {
    this.listeners.clear()
  }
  
  /**
   * 获取事件监听器数量
   */
  public getListenerCount<K extends keyof GameEvents>(event: K): number {
    const callbacks = this.listeners.get(event)
    return callbacks ? callbacks.length : 0
  }
  
  /**
   * 获取所有已注册的事件
   */
  public getRegisteredEvents(): (keyof GameEvents)[] {
    return Array.from(this.listeners.keys())
  }
  
  /**
   * 调试信息
   */
  public debug(): void {
    console.log('EventBus 调试信息:')
    this.listeners.forEach((callbacks, event) => {
      console.log(`  ${String(event)}: ${callbacks.length} 个监听器`)
    })
  }
} 