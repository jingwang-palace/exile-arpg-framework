/**
 * 配置文件类型定义
 * 确保所有配置都有明确的类型约束
 */

// 游戏核心配置
export interface GameConfig {
  meta: GameMetaConfig
  engine: GameEngineConfig
  ui: UIConfig
  balance: GameBalanceConfig
  features: GameFeaturesConfig
}

// 游戏元信息配置
export interface GameMetaConfig {
  title: string
  version: string
  author: string
  description: string
  genre: string
  targetAudience: string
  supportedLanguages: string[]
  defaultLanguage: string
}

// 游戏引擎配置
export interface GameEngineConfig {
  phaser: {
    width: number
    height: number
    backgroundColor: string
    physics: {
      default: string
      arcade: {
        gravity: { y: number }
        debug: boolean
      }
    }
    scale: {
      mode: string
      autoCenter: string
    }
  }
  performance: {
    maxFPS: number
    enableVSync: boolean
    particleLimit: number
    soundChannels: number
  }
  debug: {
    showFPS: boolean
    showCollisionBoxes: boolean
    enableConsoleLogging: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

// UI配置
export interface UIConfig {
  theme: UIThemeConfig
  layout: UILayoutConfig
  animations: UIAnimationConfig
  responsive: UIResponsiveConfig
}

export interface UIThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  hoverColor: string
  fonts: {
    primary: string
    secondary: string
    monospace: string
  }
  iconSet: string
}

export interface UILayoutConfig {
  headerHeight: number
  sidebarWidth: number
  footerHeight: number
  panelPadding: number
  buttonSpacing: number
  gridSize: number
}

export interface UIAnimationConfig {
  transitionDuration: number
  easeType: string
  hoverScale: number
  clickScale: number
  fadeSpeed: number
}

export interface UIResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
    ultrawide: number
  }
  scaleFactor: number
  minWidth: number
  minHeight: number
}

// 游戏平衡性配置
export interface GameBalanceConfig {
  character: CharacterBalanceConfig
  combat: CombatBalanceConfig
  economy: EconomyBalanceConfig
  progression: ProgressionBalanceConfig
}

export interface CharacterBalanceConfig {
  baseAttributes: {
    health: number
    mana: number
    strength: number
    dexterity: number
    intelligence: number
    vitality: number
  }
  levelingCurve: {
    experienceBase: number
    experienceMultiplier: number
    maxLevel: number
    attributePointsPerLevel: number
    skillPointsPerLevel: number
  }
  attributeEffects: {
    strengthDamageMultiplier: number
    dexteritySpeedMultiplier: number
    intelligenceManaMultiplier: number
    vitalityHealthMultiplier: number
  }
}

export interface CombatBalanceConfig {
  damageFormulas: {
    physicalDamageBase: number
    magicalDamageBase: number
    criticalChanceBase: number
    criticalMultiplier: number
    armorReduction: number
    resistanceReduction: number
  }
  timing: {
    attackSpeed: number
    castSpeed: number
    recoveryTime: number
    invulnerabilityFrames: number
  }
  statusEffects: {
    poisonDamagePerSecond: number
    burnDamagePerSecond: number
    freezeDuration: number
    stunDuration: number
  }
}

export interface EconomyBalanceConfig {
  currency: {
    goldDropRate: number
    currencyDropRates: Record<string, number>
    vendorPrices: Record<string, number>
    stackSizes: Record<string, number>
  }
  trading: {
    taxRate: number
    maxListings: number
    listingDuration: number
  }
}

export interface ProgressionBalanceConfig {
  quests: {
    experienceRewardMultiplier: number
    goldRewardMultiplier: number
    talentPointRewards: Record<string, number>
  }
  areas: {
    monsterLevelScaling: number
    dropRateBonus: number
    experienceBonus: number
  }
}

// 游戏功能配置
export interface GameFeaturesConfig {
  enabledFeatures: string[]
  monetization: MonetizationConfig
  social: SocialConfig
  accessibility: AccessibilityConfig
}

export interface MonetizationConfig {
  enableSkinShop: boolean
  enableBattlePass: boolean
  enablePremiumCurrency: boolean
  skinCategories: string[]
  pricingTiers: Record<string, number>
}

export interface SocialConfig {
  enableFriends: boolean
  enableGuilds: boolean
  enableChat: boolean
  enableLeaderboards: boolean
  maxFriends: number
  maxGuildMembers: number
}

export interface AccessibilityConfig {
  enableColorBlindSupport: boolean
  enableSubtitles: boolean
  enableScreenReader: boolean
  fontSizeMultiplier: number
  contrastMode: boolean
}

// 角色职业配置
export interface CharacterClassConfig {
  id: string
  name: string
  description: string
  startingAttributes: {
    strength: number
    dexterity: number
    intelligence: number
    vitality: number
  }
  startingSkills: string[]
  ascendancyClasses: string[]
  icon: string
  themeColor: string
  playstyle: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// 技能配置
export interface SkillConfig {
  id: string
  name: string
  description: string
  type: 'active' | 'passive' | 'support'
  category: string
  icon: string
  manaCost: number
  cooldown: number
  castTime: number
  range: number
  areaOfEffect: number
  damage: {
    base: number
    scaling: number
    type: 'physical' | 'fire' | 'cold' | 'lightning' | 'chaos'
  }
  effects: SkillEffect[]
  requirements: {
    level: number
    attributes: Record<string, number>
    previousSkills: string[]
  }
  levelProgression: SkillLevelData[]
}

export interface SkillEffect {
  type: string
  value: number
  duration?: number
  chance?: number
}

export interface SkillLevelData {
  level: number
  damage: number
  manaCost: number
  cooldown: number
  additionalEffects: SkillEffect[]
}

// 装备配置
export interface EquipmentConfig {
  id: string
  name: string
  description: string
  type: string
  slot: string
  rarity: 'normal' | 'magic' | 'rare' | 'unique'
  level: number
  baseAttributes: Record<string, number>
  implicitModifiers: ModifierConfig[]
  explicitModifiers: ModifierConfig[]
  requirements: {
    level: number
    attributes: Record<string, number>
  }
  icon: string
  model: string
  soundEffects: {
    equip: string
    unequip: string
    drop: string
  }
}

export interface ModifierConfig {
  id: string
  name: string
  type: string
  tier: number
  value: number | [number, number]
  isPercentage: boolean
  affects: string[]
}

// 怪物配置
export interface MonsterConfig {
  id: string
  name: string
  type: string
  level: number
  health: number
  mana: number
  damage: number
  armor: number
  resistances: Record<string, number>
  speed: number
  attackSpeed: number
  skills: string[]
  ai: {
    aggroRange: number
    chaseRange: number
    behaviorType: string
    abilities: MonsterAbility[]
  }
  drops: DropConfig[]
  experience: number
  sprite: {
    sheet: string
    animations: Record<string, AnimationConfig>
  }
  sounds: {
    attack: string[]
    hurt: string[]
    death: string[]
    idle: string[]
  }
}

export interface MonsterAbility {
  id: string
  name: string
  cooldown: number
  trigger: string
  effect: string
}

export interface DropConfig {
  itemId: string
  quantity: number | [number, number]
  chance: number
  conditions?: Record<string, any>
}

export interface AnimationConfig {
  frames: number[]
  frameRate: number
  repeat: boolean
}

// 地图配置
export interface MapConfig {
  id: string
  name: string
  description: string
  type: 'town' | 'dungeon' | 'wilderness' | 'special'
  level: number
  tileset: string
  music: string
  ambientSounds: string[]
  weather?: string
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  monsters: MapMonsterSpawn[]
  npcs: MapNPCSpawn[]
  objects: MapObjectSpawn[]
  exits: MapExit[]
  playerSpawn: {
    x: number
    y: number
  }
  lighting: {
    ambient: string
    shadows: boolean
    torches: MapTorchSpawn[]
  }
}

export interface MapMonsterSpawn {
  monsterId: string
  spawnPoints: Array<{x: number, y: number}>
  maxCount: number
  respawnTime: number
  levelVariance: number
}

export interface MapNPCSpawn {
  npcId: string
  x: number
  y: number
  dialogue: string
  quests?: string[]
  shop?: string
}

export interface MapObjectSpawn {
  objectId: string
  x: number
  y: number
  interactive: boolean
  loot?: DropConfig[]
}

export interface MapExit {
  id: string
  x: number
  y: number
  width: number
  height: number
  targetMap: string
  targetX: number
  targetY: number
  requirements?: Record<string, any>
}

export interface MapTorchSpawn {
  x: number
  y: number
  radius: number
  color: string
  intensity: number
}

// 任务配置
export interface QuestConfig {
  id: string
  name: string
  description: string
  type: 'story' | 'side' | 'daily' | 'weekly' | 'challenge'
  category: string
  level: number
  objectives: QuestObjective[]
  rewards: QuestReward[]
  requirements: {
    level?: number
    previousQuests?: string[]
    items?: Array<{id: string, quantity: number}>
  }
  dialogues: QuestDialogue[]
  completionText: string
  icon: string
  isRepeatable: boolean
  timeLimit?: number
}

export interface QuestObjective {
  id: string
  type: 'kill' | 'collect' | 'interact' | 'visit' | 'escort'
  target: string
  quantity: number
  description: string
  optional: boolean
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'talentPoints' | 'unlock'
  id?: string
  quantity: number
}

export interface QuestDialogue {
  npcId: string
  stage: 'start' | 'progress' | 'complete'
  text: string[]
  choices?: Array<{
    text: string
    effect: string
  }>
}

// 音频配置
export interface AudioConfig {
  music: {
    volume: number
    tracks: Record<string, AudioTrackConfig>
  }
  sounds: {
    volume: number
    effects: Record<string, AudioEffectConfig>
  }
  voice: {
    volume: number
    enabled: boolean
    language: string
  }
}

export interface AudioTrackConfig {
  file: string
  loop: boolean
  volume: number
  fadeIn: number
  fadeOut: number
  tags: string[]
}

export interface AudioEffectConfig {
  file: string
  volume: number
  pitch: number
  variants?: string[]
  spatialAudio: boolean
}

// 本地化配置
export interface LocalizationConfig {
  languages: Record<string, LanguageConfig>
  fallbackLanguage: string
}

export interface LanguageConfig {
  name: string
  code: string
  direction: 'ltr' | 'rtl'
  font: string
  translations: Record<string, string>
} 