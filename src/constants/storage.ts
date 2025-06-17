export const STORAGE_KEYS = {
  // 角色相关
  CHARACTER: 'poe-idle-game-character',
  
  // 游戏设置相关
  SETTINGS: 'poe-idle-game-settings',
  LANGUAGE: 'poe-idle-language',
  
  // 游戏进度相关
  STORY_PROGRESS: 'poe-idle-story-progress',
  TUTORIAL_PROGRESS: 'poe-idle-tutorial-progress',
  
  // 战斗相关
  BATTLE_STATE: 'poe-idle-battle-state',
  
  // 背包相关
  INVENTORY: 'poe-idle-inventory',
  EQUIPMENT: 'poe-idle-equipment',
  
  // 技能相关
  SKILLS: 'poe-idle-skills',
  
  // 地图相关
  MAP_PROGRESS: 'poe-idle-map-progress',
  
  // 交易相关
  MARKET_DATA: 'poe-idle-market-data',
  
  // 成就相关
  ACHIEVEMENTS: 'poe-idle-achievements',
  
  // 任务相关
  QUEST: 'poe-idle-quest',
  
  // 新增的游戏进度相关
  GAME_PROGRESS: 'poe-idle-game-progress'
} as const

// 为了类型安全，我们可以创建一个类型
export type StorageKey = keyof typeof STORAGE_KEYS 