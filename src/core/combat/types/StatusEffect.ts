/**
 * 状态效果类型
 */
export enum StatusEffectType {
  BUFF = 'buff',           // 增益效果
  DEBUFF = 'debuff',       // 减益效果
  DOT = 'dot',            // 持续伤害
  HOT = 'hot',            // 持续治疗
  CROWD_CONTROL = 'crowd_control' // 控制效果
}

/**
 * 状态效果接口
 */
export interface IStatusEffect {
  id: string;                 // 效果ID
  name: string;               // 效果名称
  description: string;        // 效果描述
  type: StatusEffectType;     // 效果类型
  duration: number;           // 持续时间（秒）
  isPermanent: boolean;       // 是否永久
  isStackable: boolean;       // 是否可叠加
  maxStacks: number;          // 最大叠加层数
  currentStacks: number;      // 当前叠加层数
  source: any;                // 效果来源
  target: any;                // 效果目标
  startTime: number;          // 开始时间
  endTime: number;            // 结束时间
  effects: {                  // 效果属性
    attributes?: {            // 属性修改
      strength?: number;
      dexterity?: number;
      intelligence?: number;
    };
    damage?: {               // 伤害效果
      amount: number;
      type: string;
      interval: number;      // 伤害间隔（秒）
    };
    healing?: {              // 治疗效果
      amount: number;
      interval: number;      // 治疗间隔（秒）
    };
    movement?: {             // 移动效果
      speedModifier: number;
      canMove: boolean;
    };
    crowdControl?: {         // 控制效果
      type: string;
      duration: number;
    };
  };
}

/**
 * 状态效果实例接口
 */
export interface IStatusEffectInstance {
  effect: IStatusEffect;      // 效果定义
  remainingDuration: number;  // 剩余持续时间
  isActive: boolean;          // 是否激活
  lastTickTime: number;       // 上次触发时间
} 