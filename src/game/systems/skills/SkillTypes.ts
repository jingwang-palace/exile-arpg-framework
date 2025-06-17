// 技能类型枚举
export enum SkillType {
  MELEE = 'melee',         // 近战技能
  RANGED = 'ranged',       // 远程技能
  AOE = 'aoe',             // 范围技能
  BUFF = 'buff',           // 增益技能
  DEBUFF = 'debuff',       // 减益技能
  MOVEMENT = 'movement',   // 移动技能
  UTILITY = 'utility'      // 实用技能
}

// 技能资源类型
export enum ResourceType {
  MANA = 'mana',           // 魔法值
  HEALTH = 'health',       // 生命值
  RAGE = 'rage',           // 怒气
  ENERGY = 'energy',       // 能量
  NONE = 'none'            // 无消耗
}

// 技能目标类型
export enum TargetType {
  SELF = 'self',           // 自身
  SINGLE = 'single',       // 单体目标
  MULTI = 'multi',         // 多目标
  GROUND = 'ground',       // 地面指定位置
  DIRECTION = 'direction'  // 方向性
}

// 技能元素类型
export enum ElementType {
  PHYSICAL = 'physical',   // 物理
  FIRE = 'fire',           // 火焰
  ICE = 'ice',             // 冰霜
  LIGHTNING = 'lightning', // 闪电
  POISON = 'poison',       // 毒素
  ARCANE = 'arcane',       // 奥术
  NONE = 'none'            // 无元素
}

// 技能品质
export enum SkillRarity {
  COMMON = 'common',       // 普通
  UNCOMMON = 'uncommon',   // 非凡
  RARE = 'rare',           // 稀有
  EPIC = 'epic',           // 史诗
  LEGENDARY = 'legendary'  // 传奇
}

// 技能效果类型
export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'movement' | 'summon' | 'transform';
  value: number;
  duration?: number; // 持续时间（毫秒）
  tickRate?: number; // 生效间隔（毫秒）
  radius?: number;   // 作用半径
  element?: ElementType;
}

// 技能描述接口
export interface SkillDescription {
  id: string;              // 技能唯一ID
  name: string;            // 技能名称
  description: string;     // 技能描述
  icon: string;            // 技能图标
  type: SkillType;         // 技能类型
  rarity: SkillRarity;     // 技能品质
  resourceType: ResourceType; // 消耗资源类型
  resourceCost: number;    // 资源消耗量
  cooldown: number;        // 冷却时间（毫秒）
  castTime: number;        // 施法时间（毫秒）
  targetType: TargetType;  // 目标类型
  range: number;           // 施法距离
  effects: SkillEffect[];  // 技能效果
  requiredLevel: number;   // 需求等级
  maxLevel: number;        // 最高等级
}

// 已学习技能状态
export interface LearnedSkill {
  skillId: string;         // 技能ID
  level: number;           // 当前等级
  isEquipped: boolean;     // 是否已装备
  cooldownRemaining: number; // 剩余冷却时间
}

// 技能栏位置枚举
export enum SkillSlot {
  SLOT_1 = 0,
  SLOT_2 = 1,
  SLOT_3 = 2,
  SLOT_4 = 3,
  SLOT_5 = 4,
  SLOT_6 = 5,
  SLOT_7 = 6,
  SLOT_8 = 7,
  SLOT_9 = 8,
  SLOT_10 = 9
} 