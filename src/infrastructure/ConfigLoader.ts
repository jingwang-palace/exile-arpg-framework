import type {
  GameConfig,
  CharacterClassConfig,
  SkillConfig,
  MonsterConfig,
  EquipmentConfig,
  QuestConfig,
  MapConfig,
  AudioConfig,
  LocalizationConfig
} from '../config/schema/ConfigSchema'

/**
 * 配置加载器
 * 统一管理所有游戏配置文件的加载、验证和缓存
 */
export class ConfigLoader {
  private static instance: ConfigLoader
  private configs: Map<string, any> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()
  
  private constructor() {}
  
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader()
    }
    return ConfigLoader.instance
  }
  
  /**
   * 初始化配置系统，加载所有配置文件
   */
  public async initialize(): Promise<void> {
    console.log('📁 初始化配置系统...')
    
    try {
      // 并行加载所有配置文件
      await Promise.all([
        this.loadGameConfig(),
        this.loadCharacterConfigs(),
        this.loadSkillConfigs(),
        this.loadMonsterConfigs(),
        this.loadEquipmentConfigs(),
        this.loadQuestConfigs(),
        this.loadMapConfigs(),
        this.loadAudioConfigs(),
        this.loadLocalizationConfigs()
      ])
      
      console.log('✅ 配置系统初始化完成')
      
      // 验证配置完整性
      this.validateConfigs()
      
    } catch (error) {
      console.error('❌ 配置系统初始化失败:', error)
      throw error
    }
  }
  
  /**
   * 加载游戏主配置
   */
  private async loadGameConfig(): Promise<void> {
    const config = await this.loadConfigFile<GameConfig>('game.json')
    this.configs.set('game', config)
    console.log('📋 游戏主配置已加载')
  }
  
  /**
   * 加载角色职业配置
   */
  private async loadCharacterConfigs(): Promise<void> {
    const config = await this.loadConfigFile('characters.json')
    this.configs.set('characters', config)
    console.log('👤 角色配置已加载')
  }
  
  /**
   * 加载技能配置
   */
  private async loadSkillConfigs(): Promise<void> {
    const config = await this.loadConfigFile('skills.json')
    this.configs.set('skills', config)
    console.log('🔮 技能配置已加载')
  }
  
  /**
   * 加载怪物配置
   */
  private async loadMonsterConfigs(): Promise<void> {
    const config = await this.loadConfigFile('monsters.json')
    this.configs.set('monsters', config)
    console.log('👹 怪物配置已加载')
  }
  
  /**
   * 加载装备配置
   */
  private async loadEquipmentConfigs(): Promise<void> {
    const config = await this.loadConfigFile('equipment.json')
    this.configs.set('equipment', config)
    console.log('⚔️ 装备配置已加载')
  }
  
  /**
   * 加载任务配置
   */
  private async loadQuestConfigs(): Promise<void> {
    const config = await this.loadConfigFile('quests.json')
    this.configs.set('quests', config)
    console.log('📜 任务配置已加载')
  }
  
  /**
   * 加载地图配置
   */
  private async loadMapConfigs(): Promise<void> {
    const config = await this.loadConfigFile('maps.json')
    this.configs.set('maps', config)
    console.log('🗺️ 地图配置已加载')
  }
  
  /**
   * 加载音频配置
   */
  private async loadAudioConfigs(): Promise<void> {
    const config = await this.loadConfigFile('audio.json')
    this.configs.set('audio', config)
    console.log('🔊 音频配置已加载')
  }
  
  /**
   * 加载本地化配置
   */
  private async loadLocalizationConfigs(): Promise<void> {
    const config = await this.loadConfigFile('localization.json')
    this.configs.set('localization', config)
    console.log('🌐 本地化配置已加载')
  }
  
  /**
   * 通用配置文件加载器
   */
  private async loadConfigFile<T = any>(filename: string): Promise<T> {
    const cacheKey = filename
    
    // 如果正在加载，返回加载Promise
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!
    }
    
    // 如果已缓存，直接返回
    if (this.configs.has(cacheKey)) {
      return this.configs.get(cacheKey)
    }
    
    // 创建加载Promise
    const loadingPromise = this.performConfigLoad<T>(filename)
    this.loadingPromises.set(cacheKey, loadingPromise)
    
    try {
      const config = await loadingPromise
      this.configs.set(cacheKey, config)
      return config
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }
  
  /**
   * 执行实际的配置文件加载
   */
  private async performConfigLoad<T>(filename: string): Promise<T> {
    try {
      // 在生产环境中，配置文件可能需要从服务器获取
      // 在开发环境中，我们直接导入
      const configPath = `/config/${filename}`
      
      const response = await fetch(configPath)
      if (!response.ok) {
        throw new Error(`Failed to load config file: ${filename}`)
      }
      
      const config = await response.json()
      
      // 验证配置格式
      this.validateConfigStructure(filename, config)
      
      return config as T
    } catch (error) {
      console.error(`❌ 加载配置文件失败: ${filename}`, error)
      
      // 返回默认配置或抛出错误
      return this.getDefaultConfig<T>(filename)
    }
  }
  
  /**
   * 验证配置文件结构
   */
  private validateConfigStructure(filename: string, config: any): void {
    if (!config || typeof config !== 'object') {
      throw new Error(`Invalid config structure in ${filename}`)
    }
    
    // 根据文件类型进行特定验证
    switch (filename) {
      case 'game.json':
        this.validateGameConfig(config)
        break
      case 'characters.json':
        this.validateCharacterConfig(config)
        break
      case 'skills.json':
        this.validateSkillConfig(config)
        break
      default:
        // 通用验证
        break
    }
  }
  
  /**
   * 验证游戏主配置
   */
  private validateGameConfig(config: any): void {
    const requiredFields = ['meta', 'engine', 'ui', 'balance', 'features']
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field in game config: ${field}`)
      }
    }
  }
  
  /**
   * 验证角色配置
   */
  private validateCharacterConfig(config: any): void {
    if (!config.classes || typeof config.classes !== 'object') {
      throw new Error('Invalid character classes configuration')
    }
  }
  
  /**
   * 验证技能配置
   */
  private validateSkillConfig(config: any): void {
    const requiredSections = ['activeSkills', 'passiveSkills']
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`Missing skill section: ${section}`)
      }
    }
  }
  
  /**
   * 获取默认配置
   */
  private getDefaultConfig<T>(filename: string): T {
    const defaultConfigs: Record<string, any> = {
      'game.json': {
        meta: { title: 'Default Game', version: '1.0.0' },
        engine: { phaser: { width: 1920, height: 1080 } },
        ui: { theme: { primaryColor: '#000000' } },
        balance: { character: { baseAttributes: {} } },
        features: { enabledFeatures: [] }
      }
    }
    
    const defaultConfig = defaultConfigs[filename]
    if (defaultConfig) {
      console.warn(`⚠️ 使用默认配置: ${filename}`)
      return defaultConfig as T
    }
    
    throw new Error(`No default config available for ${filename}`)
  }
  
  /**
   * 验证所有配置的完整性
   */
  private validateConfigs(): void {
    console.log('🔍 验证配置完整性...')
    
    // 检查配置间的引用关系
    this.validateConfigReferences()
    
    console.log('✅ 配置完整性验证通过')
  }
  
  /**
   * 验证配置间的引用关系
   */
  private validateConfigReferences(): void {
    // 验证角色起始技能是否存在
    const characters = this.getConfig('characters')
    const skills = this.getConfig('skills')
    
    if (characters?.classes && skills?.activeSkills) {
      for (const [classId, classConfig] of Object.entries(characters.classes)) {
        const startingSkills = (classConfig as any).startingSkills || []
        for (const skillId of startingSkills) {
          if (!skills.activeSkills[skillId] && !skills.passiveSkills[skillId]) {
            console.warn(`⚠️ 角色 ${classId} 的起始技能不存在: ${skillId}`)
          }
        }
      }
    }
  }
  
  /**
   * 获取配置
   */
  public getConfig<T = any>(configType: string): T | null {
    return this.configs.get(`${configType}.json`) || this.configs.get(configType) || null
  }
  
  /**
   * 获取游戏主配置
   */
  public getGameConfig(): GameConfig {
    return this.getConfig<GameConfig>('game') || this.getDefaultConfig('game.json')
  }
  
  /**
   * 获取角色配置
   */
  public getCharacterConfig(classId: string): CharacterClassConfig | null {
    const characters = this.getConfig('characters')
    return characters?.classes?.[classId] || null
  }
  
  /**
   * 获取所有角色配置
   */
  public getAllCharacterConfigs(): Record<string, CharacterClassConfig> {
    const characters = this.getConfig('characters')
    return characters?.classes || {}
  }
  
  /**
   * 获取技能配置
   */
  public getSkillConfig(skillId: string): SkillConfig | null {
    const skills = this.getConfig('skills')
    return skills?.activeSkills?.[skillId] || 
           skills?.passiveSkills?.[skillId] || 
           skills?.supportGems?.[skillId] || null
  }
  
  /**
   * 获取怪物配置
   */
  public getMonsterConfig(monsterId: string): MonsterConfig | null {
    const monsters = this.getConfig('monsters')
    return monsters?.monsters?.[monsterId] || null
  }
  
  /**
   * 获取装备配置
   */
  public getEquipmentConfig(itemId: string): EquipmentConfig | null {
    const equipment = this.getConfig('equipment')
    return equipment?.items?.[itemId] || null
  }
  
  /**
   * 获取任务配置
   */
  public getQuestConfig(questId: string): QuestConfig | null {
    const quests = this.getConfig('quests')
    return quests?.quests?.[questId] || null
  }
  
  /**
   * 获取地图配置
   */
  public getMapConfig(mapId: string): MapConfig | null {
    const maps = this.getConfig('maps')
    return maps?.maps?.[mapId] || null
  }
  
  /**
   * 热重载配置文件
   */
  public async reloadConfig(configType: string): Promise<void> {
    console.log(`🔄 热重载配置: ${configType}`)
    
    const filename = configType.endsWith('.json') ? configType : `${configType}.json`
    
    // 清除缓存
    this.configs.delete(filename)
    this.configs.delete(configType)
    
    // 重新加载
    await this.loadConfigFile(filename)
    
    console.log(`✅ 配置重载完成: ${configType}`)
  }
  
  /**
   * 获取配置缓存统计
   */
  public getCacheStats(): { totalConfigs: number; loadedConfigs: string[] } {
    return {
      totalConfigs: this.configs.size,
      loadedConfigs: Array.from(this.configs.keys())
    }
  }
} 