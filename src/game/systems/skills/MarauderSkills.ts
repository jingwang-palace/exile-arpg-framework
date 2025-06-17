import { 
  SkillDescription, 
  SkillType, 
  ResourceType, 
  TargetType, 
  ElementType,
  SkillRarity
} from './SkillTypes';

// 野蛮人专精分支 - 玩家可以选择专精方向
export enum MarauderSpecialization {
  BERSERKER = 'berserker',     // 狂战士 - 高伤害、高风险、生命消耗
  JUGGERNAUT = 'juggernaut',   // 重甲战士 - 高防御、控制、稳定
  CHIEFTAIN = 'chieftain',     // 酋长 - 火焰、图腾、光环支援
  GLADIATOR = 'gladiator'      // 角斗士 - 流血、双持、暴击
}

// 技能流派标签 - 帮助玩家理解技能搭配
export enum BuildTag {
  // 核心流派
  PURE_STRENGTH = 'pure_strength',     // 纯力量流
  BERSERKER_FURY = 'berserker_fury',   // 狂战士之怒
  TANK_FORTRESS = 'tank_fortress',     // 要塞坦克
  FIRE_CHIEFTAIN = 'fire_chieftain',   // 火焰酋长
  BLEED_GLADIATOR = 'bleed_gladiator', // 流血角斗士
  
  // 混合流派
  FIRE_TANK = 'fire_tank',             // 火焰坦克
  BERSERKER_FIRE = 'berserker_fire',   // 狂战火焰
  TOTEM_SUPPORT = 'totem_support',     // 图腾辅助
  HYBRID_MELEE = 'hybrid_melee'        // 混合近战
}

// 技能类型
export enum SkillCategory {
  ATTACK = 'attack',           // 攻击技能
  MOVEMENT = 'movement',       // 移动技能
  BUFF = 'buff',              // 增益技能
  AURA = 'aura',              // 光环技能
  TOTEM = 'totem',            // 图腾技能
  SHOUT = 'shout'             // 战吼技能
}

// 扩展后的野蛮人技能库
export const MARAUDER_SKILLS: SkillDescription[] = [
  
  // ==================== 基础通用技能 ====================
  {
    id: 'ground_slam',
    name: '大地猛击',
    description: '强力的地面攻击，每个野蛮人的起始技能',
    type: SkillType.ATTACK,
    rarity: SkillRarity.COMMON,
    maxLevel: 20,
    requiredLevel: 1,
    resourceType: ResourceType.MANA,
    resourceCost: 8,
    cooldown: 800,
    castTime: 0.8,
    range: 150,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.PURE_STRENGTH, BuildTag.HYBRID_MELEE]
  },

  {
    id: 'ancestral_call',
    name: '先祖战吼',
    description: '召唤先祖之灵协助攻击',
    type: SkillType.SUPPORT,
    rarity: SkillRarity.COMMON,
    maxLevel: 15,
    requiredLevel: 2,
    resourceType: ResourceType.MANA,
    resourceCost: 15,
    cooldown: 6000,
    castTime: 1.0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.PURE_STRENGTH, BuildTag.HYBRID_MELEE, BuildTag.TOTEM_SUPPORT]
  },

  // ==================== 狂战士专精技能 ====================
  {
    id: 'frenzy',
    name: '狂怒',
    description: '攻击时积累狂怒层数，提升攻击速度，消耗生命值',
    type: SkillType.ATTACK,
    rarity: SkillRarity.MAGIC,
    maxLevel: 20,
    requiredLevel: 4,
    resourceType: ResourceType.HEALTH,
    resourceCost: 3,
    cooldown: 0,
    castTime: 0.6,
    range: 100,
    targetType: 'enemy',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.BERSERKER_FURY],
    specialization: MarauderSpecialization.BERSERKER
  },

  {
    id: 'berserker_rage',
    name: '狂战士之怒',
    description: '生命值越低，伤害越高。低于50%血量时暴击率大幅提升',
    type: SkillType.BUFF,
    rarity: SkillRarity.RARE,
    maxLevel: 10,
    requiredLevel: 8,
    resourceType: ResourceType.MANA,
    resourceCost: 25,
    cooldown: 8000,
    castTime: 1.2,
    range: 0,
    targetType: 'self',
    elementType: ElementType.NONE,
    tags: [BuildTag.BERSERKER_FURY],
    specialization: MarauderSpecialization.BERSERKER
  },

  {
    id: 'blood_pact',
    name: '血之契约',
    description: '牺牲最大生命值的一定比例，永久提升伤害',
    type: SkillType.BUFF,
    rarity: SkillRarity.UNIQUE,
    maxLevel: 5,
    requiredLevel: 12,
    resourceType: ResourceType.HEALTH,
    resourceCost: 50,
    cooldown: 0,
    castTime: 2.0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.CHAOS,
    tags: [BuildTag.BERSERKER_FURY],
    specialization: MarauderSpecialization.BERSERKER
  },

  // ==================== 重甲战士专精技能 ====================
  {
    id: 'fortress_stance',
    name: '要塞姿态',
    description: '牺牲移动速度，获得大幅度防御提升和伤害减免',
    type: SkillType.BUFF,
    rarity: SkillRarity.MAGIC,
    maxLevel: 15,
    requiredLevel: 6,
    resourceType: ResourceType.MANA,
    resourceCost: 30,
    cooldown: 2000,
    castTime: 1.5,
    range: 0,
    targetType: 'self',
    elementType: ElementType.NONE,
    tags: [BuildTag.TANK_FORTRESS],
    specialization: MarauderSpecialization.JUGGERNAUT
  },

  {
    id: 'earthquake',
    name: '地震术',
    description: '延迟爆发的大范围地面攻击，伤害随延迟时间增加',
    type: SkillType.ATTACK,
    rarity: SkillRarity.RARE,
    maxLevel: 20,
    requiredLevel: 10,
    resourceType: ResourceType.MANA,
    resourceCost: 35,
    cooldown: 4000,
    castTime: 1.8,
    range: 250,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.TANK_FORTRESS, BuildTag.HYBRID_MELEE],
    specialization: MarauderSpecialization.JUGGERNAUT
  },

  {
    id: 'immortal_call',
    name: '不朽怒吼',
    description: '短时间内免疫所有物理伤害，并获得生命恢复',
    type: SkillType.BUFF,
    rarity: SkillRarity.UNIQUE,
    maxLevel: 8,
    requiredLevel: 16,
    resourceType: ResourceType.MANA,
    resourceCost: 60,
    cooldown: 25000,
    castTime: 1.0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.NONE,
    tags: [BuildTag.TANK_FORTRESS],
    specialization: MarauderSpecialization.JUGGERNAUT
  },

  // ==================== 酋长专精技能 ====================
  {
    id: 'flame_totem',
    name: '火焰图腾',
    description: '召唤一个火焰图腾，自动攻击附近敌人',
    type: SkillType.SUMMON,
    rarity: SkillRarity.MAGIC,
    maxLevel: 20,
    requiredLevel: 5,
    resourceType: ResourceType.MANA,
    resourceCost: 25,
    cooldown: 1000,
    castTime: 1.2,
    range: 300,
    targetType: 'area',
    elementType: ElementType.FIRE,
    tags: [BuildTag.FIRE_CHIEFTAIN, BuildTag.TOTEM_SUPPORT],
    specialization: MarauderSpecialization.CHIEFTAIN
  },

  {
    id: 'righteous_fire',
    name: '正义之火',
    description: '持续燃烧自身和周围敌人，基于最大生命值造成伤害',
    type: SkillType.AURA,
    rarity: SkillRarity.RARE,
    maxLevel: 18,
    requiredLevel: 8,
    resourceType: ResourceType.HEALTH,
    resourceCost: 15,
    cooldown: 0,
    castTime: 1.5,
    range: 150,
    targetType: 'aura',
    elementType: ElementType.FIRE,
    tags: [BuildTag.FIRE_CHIEFTAIN, BuildTag.FIRE_TANK],
    specialization: MarauderSpecialization.CHIEFTAIN
  },

  {
    id: 'chieftain_aura',
    name: '酋长光环',
    description: '为队友提供火焰伤害加成和抗性',
    type: SkillType.AURA,
    rarity: SkillRarity.RARE,
    maxLevel: 12,
    requiredLevel: 12,
    resourceType: ResourceType.MANA,
    resourceCost: 40,
    cooldown: 0,
    castTime: 2.0,
    range: 300,
    targetType: 'allies',
    elementType: ElementType.FIRE,
    tags: [BuildTag.FIRE_CHIEFTAIN, BuildTag.TOTEM_SUPPORT],
    specialization: MarauderSpecialization.CHIEFTAIN
  },

  // ==================== 角斗士专精技能 ====================
  {
    id: 'lacerate',
    name: '撕裂',
    description: '造成流血伤害，流血层数可叠加',
    type: SkillType.ATTACK,
    rarity: SkillRarity.MAGIC,
    maxLevel: 20,
    requiredLevel: 4,
    resourceType: ResourceType.MANA,
    resourceCost: 10,
    cooldown: 600,
    castTime: 0.7,
    range: 120,
    targetType: 'enemy',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.BLEED_GLADIATOR],
    specialization: MarauderSpecialization.GLADIATOR
  },

  {
    id: 'crimson_dance',
    name: '血舞',
    description: '双持攻击，每次攻击都有机会触发流血爆炸',
    type: SkillType.ATTACK,
    rarity: SkillRarity.RARE,
    maxLevel: 15,
    requiredLevel: 10,
    resourceType: ResourceType.MANA,
    resourceCost: 20,
    cooldown: 3000,
    castTime: 1.0,
    range: 100,
    targetType: 'enemy',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.BLEED_GLADIATOR],
    specialization: MarauderSpecialization.GLADIATOR
  },

  {
    id: 'gladiator_stance',
    name: '角斗士姿态',
    description: '提升暴击率和攻击速度，但降低防御力',
    type: SkillType.BUFF,
    rarity: SkillRarity.RARE,
    maxLevel: 10,
    requiredLevel: 8,
    resourceType: ResourceType.MANA,
    resourceCost: 25,
    cooldown: 5000,
    castTime: 1.0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.NONE,
    tags: [BuildTag.BLEED_GLADIATOR],
    specialization: MarauderSpecialization.GLADIATOR
  },

  // ==================== 混合/通用技能 ====================
  {
    id: 'leap_slam',
    name: '跳跃重击',
    description: '跳跃到目标位置造成区域伤害，距离越远伤害越高',
    type: SkillType.MOVEMENT,
    rarity: SkillRarity.MAGIC,
    maxLevel: 15,
    requiredLevel: 6,
    resourceType: ResourceType.MANA,
    resourceCost: 18,
    cooldown: 3000,
    castTime: 1.0,
    range: 400,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.HYBRID_MELEE, BuildTag.BERSERKER_FURY, BuildTag.TANK_FORTRESS]
  },

  {
    id: 'cyclone',
    name: '旋风斩',
    description: '持续旋转攻击，可以移动，攻击速度影响旋转速度',
    type: SkillType.CHANNELING,
    rarity: SkillRarity.RARE,
    maxLevel: 20,
    requiredLevel: 14,
    resourceType: ResourceType.MANA,
    resourceCost: 12,
    cooldown: 0,
    castTime: 0,
    range: 120,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.HYBRID_MELEE, BuildTag.BERSERKER_FURY]
  },

  {
    id: 'molten_strike',
    name: '熔岩打击',
    description: '近战攻击同时发射火球弹射物',
    type: SkillType.ATTACK,
    rarity: SkillRarity.RARE,
    maxLevel: 20,
    requiredLevel: 12,
    resourceType: ResourceType.MANA,
    resourceCost: 15,
    cooldown: 0,
    castTime: 0.8,
    range: 100,
    targetType: 'hybrid',
    elementType: ElementType.FIRE,
    tags: [BuildTag.BERSERKER_FIRE, BuildTag.FIRE_CHIEFTAIN]
  },

  {
    id: 'intimidating_shout',
    name: '威吓怒吼',
    description: '降低敌人攻击力和移动速度，增加自身威慑力',
    type: SkillType.DEBUFF,
    rarity: SkillRarity.MAGIC,
    maxLevel: 12,
    requiredLevel: 7,
    resourceType: ResourceType.MANA,
    resourceCost: 20,
    cooldown: 8000,
    castTime: 1.0,
    range: 250,
    targetType: 'enemies',
    elementType: ElementType.NONE,
    tags: [BuildTag.TANK_FORTRESS, BuildTag.TOTEM_SUPPORT, BuildTag.HYBRID_MELEE]
  }
];

// 技能变体系统 - 允许同一技能有不同的进化方向
export const SKILL_VARIANTS: Record<string, SkillDescription[]> = {
  'frenzy': [
    {
      id: 'frenzy_blood',
      name: '血之狂怒',
      description: '狂怒的血腥变体，伤害更高但生命消耗更大',
      type: SkillType.ATTACK,
      rarity: SkillRarity.RARE,
      maxLevel: 20,
      requiredLevel: 8,
      resourceType: ResourceType.HEALTH,
      resourceCost: 8,
      cooldown: 0,
      castTime: 0.5,
      range: 100,
      targetType: 'enemy',
      elementType: ElementType.CHAOS,
      tags: [BuildTag.BERSERKER_FURY],
      specialization: MarauderSpecialization.BERSERKER
    },
    {
      id: 'frenzy_fire',
      name: '火焰狂怒',
      description: '狂怒的火焰变体，攻击附带燃烧效果',
      type: SkillType.ATTACK,
      rarity: SkillRarity.RARE,
      maxLevel: 20,
      requiredLevel: 8,
      resourceType: ResourceType.MANA,
      resourceCost: 12,
      cooldown: 0,
      castTime: 0.6,
      range: 100,
      targetType: 'enemy',
      elementType: ElementType.FIRE,
      tags: [BuildTag.BERSERKER_FIRE],
      specialization: MarauderSpecialization.BERSERKER
    }
  ],

  'flame_totem': [
    {
      id: 'flame_totem_rapid',
      name: '速射火焰图腾',
      description: '攻击速度更快但单次伤害较低',
      type: SkillType.SUMMON,
      rarity: SkillRarity.MAGIC,
      maxLevel: 20,
      requiredLevel: 8,
      resourceType: ResourceType.MANA,
      resourceCost: 20,
      cooldown: 800,
      castTime: 1.0,
      range: 300,
      targetType: 'area',
      elementType: ElementType.FIRE,
      tags: [BuildTag.FIRE_CHIEFTAIN],
      specialization: MarauderSpecialization.CHIEFTAIN
    },
    {
      id: 'flame_totem_explosive',
      name: '爆炸火焰图腾',
      description: '攻击会造成小范围爆炸伤害',
      type: SkillType.SUMMON,
      rarity: SkillRarity.RARE,
      maxLevel: 20,
      requiredLevel: 10,
      resourceType: ResourceType.MANA,
      resourceCost: 35,
      cooldown: 1500,
      range: 300,
      targetType: 'area',
      elementType: ElementType.FIRE,
      tags: [BuildTag.FIRE_CHIEFTAIN],
      specialization: MarauderSpecialization.CHIEFTAIN
    }
  ]
};

// BD构建推荐系统
export const BUILD_ARCHETYPES: Record<string, {
  name: string;
  description: string;
  playstyle: string;
  coreSkills: string[];
  supportSkills: string[];
  specialization: MarauderSpecialization;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: BuildTag[];
}> = {
  berserker_pure: {
    name: '纯血狂战士',
    description: '极致的攻击力，以命换命的战斗方式',
    playstyle: '高风险高回报，血量越低战斗力越强',
    coreSkills: ['frenzy', 'berserker_rage', 'blood_pact'],
    supportSkills: ['leap_slam', 'ancestral_call'],
    specialization: MarauderSpecialization.BERSERKER,
    difficulty: 'advanced',
    tags: [BuildTag.BERSERKER_FURY]
  },

  tank_fortress: {
    name: '不动要塞',
    description: '极致的防御力，通过耐久战获胜',
    playstyle: '低风险稳定输出，适合新手',
    coreSkills: ['fortress_stance', 'earthquake', 'immortal_call'],
    supportSkills: ['intimidating_shout', 'ground_slam'],
    specialization: MarauderSpecialization.JUGGERNAUT,
    difficulty: 'beginner',
    tags: [BuildTag.TANK_FORTRESS]
  },

  fire_chieftain: {
    name: '火焰酋长',
    description: '火焰与图腾的完美结合',
    playstyle: '远程控制，策略性战斗',
    coreSkills: ['flame_totem', 'righteous_fire', 'chieftain_aura'],
    supportSkills: ['molten_strike', 'intimidating_shout'],
    specialization: MarauderSpecialization.CHIEFTAIN,
    difficulty: 'intermediate',
    tags: [BuildTag.FIRE_CHIEFTAIN, BuildTag.TOTEM_SUPPORT]
  },

  bleed_gladiator: {
    name: '流血角斗士',
    description: '持续流血伤害的刺客风格',
    playstyle: '快速攻击，叠加流血层数',
    coreSkills: ['lacerate', 'crimson_dance', 'gladiator_stance'],
    supportSkills: ['leap_slam', 'intimidating_shout'],
    specialization: MarauderSpecialization.GLADIATOR,
    difficulty: 'intermediate',
    tags: [BuildTag.BLEED_GLADIATOR]
  },

  fire_berserker: {
    name: '火焰狂战士',
    description: '狂战士与火焰的混合流派',
    playstyle: '火焰伤害与狂战士特性结合',
    coreSkills: ['frenzy_fire', 'molten_strike', 'berserker_rage'],
    supportSkills: ['righteous_fire', 'leap_slam'],
    specialization: MarauderSpecialization.BERSERKER,
    difficulty: 'advanced',
    tags: [BuildTag.BERSERKER_FIRE]
  },

  hybrid_warrior: {
    name: '全能战士',
    description: '平衡发展的万金油流派',
    playstyle: '适应各种情况，平衡发展',
    coreSkills: ['ground_slam', 'cyclone', 'leap_slam'],
    supportSkills: ['ancestral_call', 'intimidating_shout'],
    specialization: MarauderSpecialization.JUGGERNAUT,
    difficulty: 'beginner',
    tags: [BuildTag.HYBRID_MELEE]
  }
};

// 技能学习需求系统
export interface SkillRequirement {
  requiredSkills: string[];
  requiredLevel: number;
  skillPoints: number;
  specialization?: MarauderSpecialization;
  mutuallyExclusive?: string[]; // 互斥技能
}

export const SKILL_REQUIREMENTS: Record<string, SkillRequirement> = {
  'ground_slam': { requiredSkills: [], requiredLevel: 1, skillPoints: 0 },
  'ancestral_call': { requiredSkills: ['ground_slam'], requiredLevel: 2, skillPoints: 1 },
  
  // 狂战士分支
  'frenzy': { requiredSkills: ['ground_slam'], requiredLevel: 4, skillPoints: 1, specialization: MarauderSpecialization.BERSERKER },
  'berserker_rage': { requiredSkills: ['frenzy'], requiredLevel: 8, skillPoints: 2, specialization: MarauderSpecialization.BERSERKER },
  'blood_pact': { requiredSkills: ['berserker_rage'], requiredLevel: 12, skillPoints: 3, specialization: MarauderSpecialization.BERSERKER },
  
  // 重甲战士分支
  'fortress_stance': { requiredSkills: ['ground_slam'], requiredLevel: 6, skillPoints: 1, specialization: MarauderSpecialization.JUGGERNAUT, mutuallyExclusive: ['gladiator_stance'] },
  'earthquake': { requiredSkills: ['fortress_stance'], requiredLevel: 10, skillPoints: 2, specialization: MarauderSpecialization.JUGGERNAUT },
  'immortal_call': { requiredSkills: ['earthquake'], requiredLevel: 16, skillPoints: 4, specialization: MarauderSpecialization.JUGGERNAUT },
  
  // 酋长分支
  'flame_totem': { requiredSkills: ['ground_slam'], requiredLevel: 5, skillPoints: 1, specialization: MarauderSpecialization.CHIEFTAIN },
  'righteous_fire': { requiredSkills: ['flame_totem'], requiredLevel: 8, skillPoints: 2, specialization: MarauderSpecialization.CHIEFTAIN },
  'chieftain_aura': { requiredSkills: ['righteous_fire'], requiredLevel: 12, skillPoints: 3, specialization: MarauderSpecialization.CHIEFTAIN },
  
  // 角斗士分支
  'lacerate': { requiredSkills: ['ground_slam'], requiredLevel: 4, skillPoints: 1, specialization: MarauderSpecialization.GLADIATOR },
  'gladiator_stance': { requiredSkills: ['lacerate'], requiredLevel: 8, skillPoints: 2, specialization: MarauderSpecialization.GLADIATOR, mutuallyExclusive: ['fortress_stance'] },
  'crimson_dance': { requiredSkills: ['gladiator_stance'], requiredLevel: 10, skillPoints: 3, specialization: MarauderSpecialization.GLADIATOR },
  
  // 混合技能
  'leap_slam': { requiredSkills: ['ground_slam'], requiredLevel: 6, skillPoints: 2 },
  'cyclone': { requiredSkills: ['ground_slam'], requiredLevel: 14, skillPoints: 4 },
  'molten_strike': { requiredSkills: ['ground_slam'], requiredLevel: 12, skillPoints: 3 },
  'intimidating_shout': { requiredSkills: ['ancestral_call'], requiredLevel: 7, skillPoints: 2 }
};

// 专精选择系统
export const SPECIALIZATION_INFO: Record<MarauderSpecialization, {
  name: string;
  description: string;
  unlockLevel: number;
  passiveEffects: string[];
  playstyle: string;
  difficulty: string;
}> = {
  [MarauderSpecialization.BERSERKER]: {
    name: '狂战士',
    description: '以血换力，越危险越强大',
    unlockLevel: 10,
    passiveEffects: [
      '低血量时伤害提升最多100%',
      '击杀敌人回复5%生命值',
      '攻击速度随受伤程度提升',
      '生命值低于25%时免疫控制效果'
    ],
    playstyle: '高风险高回报，适合喜欢刺激的玩家',
    difficulty: '困难'
  },
  
  [MarauderSpecialization.JUGGERNAUT]: {
    name: '重甲战士',
    description: '不可撼动的钢铁堡垒',
    unlockLevel: 8,
    passiveEffects: [
      '受到伤害时获得10%伤害减免(可叠加)',
      '移动时不会被击退或减速',
      '每秒恢复2%最大生命值',
      '格挡时减少所有技能1秒冷却时间'
    ],
    playstyle: '稳定坦克，适合新手玩家',
    difficulty: '简单'
  },
  
  [MarauderSpecialization.CHIEFTAIN]: {
    name: '酋长',
    description: '火焰与图腾的守护者',
    unlockLevel: 12,
    passiveEffects: [
      '火焰伤害提升50%',
      '最多可召唤3个图腾',
      '光环效果提升25%',
      '每个图腾提供5%火焰抗性'
    ],
    playstyle: '策略控制，适合团队作战',
    difficulty: '中等'
  },
  
  [MarauderSpecialization.GLADIATOR]: {
    name: '角斗士',
    description: '流血与暴击的艺术家',
    unlockLevel: 10,
    passiveEffects: [
      '攻击有25%概率造成流血',
      '对流血敌人暴击率提升20%',
      '双持武器时攻击速度提升15%',
      '击杀流血敌人时获得狂怒充能'
    ],
    playstyle: '技巧性输出，适合进阶玩家',
    difficulty: '中等'
  }
};

export default {
  MARAUDER_SKILLS,
  SKILL_REQUIREMENTS,
  SPECIALIZATION_INFO
}; 