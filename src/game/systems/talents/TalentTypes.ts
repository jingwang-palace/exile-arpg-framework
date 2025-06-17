// 天赋类别枚举
export enum TalentCategory {
  OFFENSE = 'offense',       // 攻击类
  DEFENSE = 'defense',       // 防御类
  UTILITY = 'utility',       // 实用类
  SPECIAL = 'special'        // 特殊类
}

// 天赋类型枚举
export enum TalentType {
  STAT_BOOST = 'stat_boost',     // 属性提升
  SKILL_BOOST = 'skill_boost',   // 技能增强
  UNIQUE_EFFECT = 'unique_effect' // 独特效果
}

// 属性类型枚举
export enum AttributeType {
  STRENGTH = 'strength',     // 力量
  DEXTERITY = 'dexterity',   // 敏捷
  INTELLIGENCE = 'intelligence', // 智力
  VITALITY = 'vitality',     // 体力
  
  // 战斗属性
  ATTACK_DAMAGE = 'attack_damage', // 攻击伤害
  SPELL_DAMAGE = 'spell_damage',   // 法术伤害
  ATTACK_SPEED = 'attack_speed',   // 攻击速度
  CAST_SPEED = 'cast_speed',       // 施法速度
  CRITICAL_CHANCE = 'critical_chance', // 暴击几率
  CRITICAL_DAMAGE = 'critical_damage', // 暴击伤害
  
  // 防御属性
  MAX_HEALTH = 'max_health',      // 最大生命值
  MAX_MANA = 'max_mana',          // 最大魔法值
  ARMOR = 'armor',                // 护甲
  MAGIC_RESIST = 'magic_resist',  // 魔法抗性
  DODGE_CHANCE = 'dodge_chance',  // 闪避几率
  BLOCK_CHANCE = 'block_chance',  // 格挡几率
  
  // 特殊属性
  COOLDOWN_REDUCTION = 'cooldown_reduction', // 冷却缩减
  MOVEMENT_SPEED = 'movement_speed',         // 移动速度
  RESOURCE_REGEN = 'resource_regen',         // 资源恢复
  DAMAGE_REDUCTION = 'damage_reduction',     // 伤害减免
  AREA_EFFECT = 'area_effect',               // 范围效果提升
  PROJECTILE_SPEED = 'projectile_speed'      // 投射物速度
}

// 天赋效果类型
export interface TalentEffect {
  type: 'attribute' | 'skill' | 'unique';  // 效果类型
  target?: string;                         // 目标（属性名或技能ID）
  value: number;                           // 效果值
  isPercentage?: boolean;                  // 是否为百分比
  description: string;                     // 效果描述
}

// 天赋节点描述
export interface TalentNodeDescription {
  id: string;                    // 唯一ID
  name: string;                  // 天赋名称
  description: string;           // 天赋描述
  icon: string;                  // 天赋图标
  category: TalentCategory;      // 天赋类别
  type: TalentType;              // 天赋类型
  maxPoints: number;             // 最大点数
  effects: TalentEffect[];       // 天赋效果
  position: { x: number, y: number }; // 天赋树上的位置
  connections: string[];         // 相连节点的ID
  requiredPoints?: number;       // 激活所需的总天赋点数
  requiredNodes?: string[];      // 前置条件节点
}

// 天赋树定义
export interface TalentTreeDefinition {
  id: string;                   // 天赋树ID
  name: string;                 // 天赋树名称
  description: string;          // 天赋树描述
  characterClass: string;       // 对应角色职业
  nodes: TalentNodeDescription[]; // 天赋节点列表
}

// 已激活的天赋节点
export interface AllocatedTalent {
  nodeId: string;       // 天赋节点ID
  points: number;       // 已分配点数
}

// 天赋职业特性
export interface ClassSpecialization {
  id: string;           // 特性ID
  name: string;         // 特性名称
  description: string;  // 特性描述
  characterClass: string; // 对应职业
  talentTreeIds: string[]; // 相关天赋树ID
  defaultEffects: TalentEffect[]; // 默认效果
} 