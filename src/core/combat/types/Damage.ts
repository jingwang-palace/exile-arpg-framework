/**
 * 伤害类型
 */
export enum DamageType {
  PHYSICAL = 'physical',   // 物理伤害
  FIRE = 'fire',          // 火焰伤害
  COLD = 'cold',          // 冰霜伤害
  LIGHTNING = 'lightning', // 闪电伤害
  CHAOS = 'chaos'         // 混沌伤害
}

/**
 * 伤害来源类型
 */
export enum DamageSourceType {
  SKILL = 'skill',        // 技能伤害
  ATTACK = 'attack',      // 普通攻击
  DOT = 'dot',           // 持续伤害
  REFLECT = 'reflect'    // 反弹伤害
}

/**
 * 伤害接口
 */
export interface IDamage {
  type: DamageType;           // 伤害类型
  sourceType: DamageSourceType; // 伤害来源
  baseAmount: number;         // 基础伤害值
  critical: boolean;          // 是否暴击
  criticalMultiplier: number; // 暴击倍率
  penetration: number;        // 穿透值
  source: any;               // 伤害来源（技能或实体）
  target: any;               // 伤害目标
  timestamp: number;         // 伤害时间戳
}

/**
 * 伤害计算结果接口
 */
export interface IDamageResult {
  originalDamage: IDamage;    // 原始伤害
  finalAmount: number;        // 最终伤害值
  isCritical: boolean;        // 是否暴击
  isBlocked: boolean;         // 是否被格挡
  isDodged: boolean;          // 是否被闪避
  isAbsorbed: boolean;        // 是否被吸收
  resistances: {              // 抗性减免
    [key in DamageType]?: number;
  };
  modifiers: {                // 伤害修正
    increased: number;        // 增加伤害
    more: number;            // 更多伤害
    reduced: number;         // 减少伤害
    less: number;           // 更少伤害
  };
} 