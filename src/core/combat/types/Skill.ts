/**
 * 技能类型
 */
export enum SkillType {
  ACTIVE = 'active',    // 主动技能
  PASSIVE = 'passive',  // 被动技能
  AURA = 'aura',       // 光环技能
  TRIGGER = 'trigger'  // 触发技能
}

/**
 * 技能目标类型
 */
export enum SkillTargetType {
  SELF = 'self',           // 自身
  SINGLE_ENEMY = 'single_enemy',    // 单个敌人
  MULTIPLE_ENEMIES = 'multiple_enemies', // 多个敌人
  AREA = 'area',          // 区域
  CHAIN = 'chain'         // 连锁
}

/**
 * 技能效果类型
 */
export enum SkillEffectType {
  DAMAGE = 'damage',           // 伤害
  HEAL = 'heal',              // 治疗
  BUFF = 'buff',              // 增益
  DEBUFF = 'debuff',          // 减益
  MOVEMENT = 'movement',      // 移动
  SUMMON = 'summon'           // 召唤
}

/**
 * 技能接口
 */
export interface ISkill {
  id: string;                 // 技能ID
  name: string;               // 技能名称
  description: string;        // 技能描述
  type: SkillType;           // 技能类型
  targetType: SkillTargetType; // 目标类型
  effectType: SkillEffectType; // 效果类型
  cooldown: number;          // 冷却时间（秒）
  manaCost: number;          // 魔法消耗
  range: number;             // 施法范围
  duration: number;          // 持续时间（秒）
  level: number;             // 技能等级
  maxLevel: number;          // 最大等级
  requirements: {            // 技能要求
    level: number;           // 角色等级要求
    attributes: {            // 属性要求
      strength?: number;
      dexterity?: number;
      intelligence?: number;
    };
  };
  effects: {                 // 技能效果
    damage?: {              // 伤害效果
      base: number;         // 基础伤害
      scaling: {            // 伤害加成
        strength?: number;
        dexterity?: number;
        intelligence?: number;
      };
    };
    heal?: {               // 治疗效果
      base: number;        // 基础治疗量
      scaling: {           // 治疗加成
        intelligence?: number;
      };
    };
    buffs?: string[];      // 增益效果ID列表
    debuffs?: string[];    // 减益效果ID列表
  };
}

/**
 * 技能实例接口
 */
export interface ISkillInstance {
  skill: ISkill;           // 技能定义
  owner: any;              // 技能拥有者
  cooldownRemaining: number; // 剩余冷却时间
  isActive: boolean;       // 是否激活
  lastUsedTime: number;    // 上次使用时间
} 