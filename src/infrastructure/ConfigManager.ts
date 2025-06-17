/**
 * 配置管理器
 * 负责游戏配置的加载和管理
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config: GameConfig = {}
  
  private constructor() {}
  
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }
  
  /**
   * 初始化配置管理器
   */
  public async initialize(): Promise<void> {
    console.log('⚙️ 初始化配置管理器...')
    
    // 加载默认配置
    this.loadDefaultConfig()
    
    console.log('✅ 配置管理器初始化完成')
  }
  
  /**
   * 获取配置值
   */
  public get<T>(key: string, defaultValue?: T): T {
    return this.getNestedValue(this.config, key, defaultValue)
  }
  
  /**
   * 设置配置值
   */
  public set(key: string, value: any): void {
    this.setNestedValue(this.config, key, value)
  }
  
  /**
   * 加载默认配置
   */
  private loadDefaultConfig(): void {
    this.config = {
      game: {
        name: '像素风流放之路',
        version: '0.1.0',
        debugMode: true
      },
      phaser: {
        width: 1280,
        height: 920,
        pixelArt: true,
        parent: 'game-container'
      },
      character: {
        startingLevel: 1,
        maxLevel: 100,
        baseAttributePoints: 80
      },
      combat: {
        baseCriticalChance: 0.05,
        baseCriticalMultiplier: 1.5,
        baseAttackSpeed: 1.0
      }
    }
  }
  
  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current
  }
  
  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }
}

// 配置接口
interface GameConfig {
  game?: {
    name: string
    version: string
    debugMode: boolean
  }
  phaser?: {
    width: number
    height: number
    pixelArt: boolean
    parent: string
  }
  character?: {
    startingLevel: number
    maxLevel: number
    baseAttributePoints: number
  }
  combat?: {
    baseCriticalChance: number
    baseCriticalMultiplier: number
    baseAttackSpeed: number
  }
} 