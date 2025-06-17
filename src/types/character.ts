import type { Inventory } from './inventory'

// 角色职业类型
export enum CharacterClass {
  Marauder = 'marauder',    // 野蛮人
  Duelist = 'duelist',     // 决斗者
  Ranger = 'ranger',      // 游侠
  Shadow = 'shadow',      // 暗影
  Witch = 'witch',       // 女巫
  Templar = 'templar',     // 圣堂武僧
  Scion = 'scion'      // 贵族
}

// 物品接口(简化版)
export interface Item {
  id: string;
  name: string;
  type: string;
  level: number;
  rarity: 'normal' | 'magic' | 'rare' | 'unique';
  description?: string;
}

// 任务记录
export interface QuestLog {
  completed: string[];
  active: string[];
}

// 基础属性
export interface BaseAttributes {
  strength: number;     // 力量
  dexterity: number;    // 敏捷
  intelligence: number; // 智力
  vitality: number;     // 体力
}

// 衍生属性
export interface DerivedAttributes {
  // 基础属性
  maxHealth: number;    // 最大生命值
  currentHealth: number;// 当前生命值
  maxMana: number;      // 最大魔法值
  currentMana: number;  // 当前魔法值
  maxEnergy: number;    // 最大能量护盾
  currentEnergy: number;// 当前能量护盾
  
  // 战斗属性
  physicalDamage: number;   // 物理伤害
  elementalDamage: number;  // 元素伤害
  chaosDamage: number;      // 混沌伤害
  attackSpeed: number;      // 攻击速度
  castSpeed: number;        // 施法速度
  criticalChance: number;   // 暴击率
  criticalMultiplier: number;// 暴击伤害
  
  // 防御属性
  armor: number;            // 护甲
  evasion: number;          // 闪避
  energyShield: number;     // 能量护盾
  blockChance: number;      // 格挡率
  
  // 其他属性
  movementSpeed: number;    // 移动速度
  lifeRegeneration: number; // 生命恢复
  manaRegeneration: number; // 魔法恢复
}

// 抗性属性
export interface ResistanceAttributes {
  fireResistance: number;     // 火焰抗性
  coldResistance: number;     // 冰霜抗性
  lightningResistance: number; // 闪电抗性
  chaosResistance: number;    // 混沌抗性
}

// 任务类型
export interface Quest {
  id: string
  type: 'story' | 'daily' | 'weekly' | 'challenge'
  title: string
  description: string
  status: 'available' | 'inProgress' | 'completed'
  progress?: {
    current: number
    required: number
  }
  rewards: {
    experience?: number
    gold?: number
    items?: Array<{
      itemId: string
      quantity: number
    }>
  }
  unlockRequirements?: {
    level?: number
    previousQuests?: string[]  // 前置任务的 ID
    reputation?: number
  }
  resetTime?: number  // 用于日常/周常任务的重置时间
}

// 角色接口
export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  baseAttributes: BaseAttributes;
  derivedAttributes: DerivedAttributes;
  resistances: ResistanceAttributes;
  skillPoints: number;        // 技能点
  ascendancyPoints: number;   // 升华点数
  passivePoints: number;      // 天赋点数
  inventory: Inventory;
  gold: number;
  quests: QuestLog;
  
  // 时间属性
  created: number;            // 创建时间戳
  lastPlayed: number;         // 最后游戏时间戳
  playTime: number;           // 游戏时长(秒)
}