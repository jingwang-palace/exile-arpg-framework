// 浏览器兼容的EventEmitter实现
export class EventEmitter {
  private events: { [key: string]: Function[] } = {}
  
  // 监听事件
  public on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }
  
  // 触发事件
  public emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(...args)
      })
    }
  }
  
  // 移除事件监听
  public off(event: string, callback?: Function): void {
    if (!this.events[event]) return
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    } else {
      delete this.events[event]
    }
  }
  
  // 只监听一次
  public once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  // 移除所有事件监听器
  public removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  // 获取事件监听器数量
  public listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }

  // 获取所有事件名称
  public eventNames(): string[] {
    return Object.keys(this.events);
  }

  // 获取指定事件的所有监听器
  public listeners(event: string): Function[] {
    return this.events[event] ? this.events[event].slice() : [];
  }
} 