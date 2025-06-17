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

// 增强版野蛮人技能库 - 更多选择和变化
export const ENHANCED_MARAUDER_SKILLS: SkillDescription[] = [
  
  // ==================== 基础通用技能 ====================
  {
    id: 'ground_slam',
    name: '大地猛击',
    description: '强力的地面攻击，野蛮人的经典技能。可以打断敌人技能释放。',
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
    description: '召唤先祖之灵协助攻击。每级增加先祖持续时间和伤害。',
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
    description: '每次攻击积累狂怒层数，提升攻击速度但消耗生命值。最多10层。',
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
    description: '生命值越低，伤害越高。低于50%血量时暴击率大幅提升。',
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
    description: '永久牺牲10%最大生命值，换取25%伤害提升。可重复使用但效果递减。',
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

  {
    id: 'rampage',
    name: '暴走模式',
    description: '击杀敌人后获得暴走层数，每层提升移动和攻击速度5%，最多20层。',
    type: SkillType.BUFF,
    rarity: SkillRarity.RARE,
    maxLevel: 12,
    requiredLevel: 16,
    resourceType: ResourceType.NONE,
    resourceCost: 0,
    cooldown: 0,
    castTime: 0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.NONE,
    tags: [BuildTag.BERSERKER_FURY],
    specialization: MarauderSpecialization.BERSERKER
  },

  // ==================== 重甲战士专精技能 ====================
  {
    id: 'fortress_stance',
    name: '要塞姿态',
    description: '牺牲50%移动速度，获得75%伤害减免和每秒3%生命恢复。',
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
    description: '延迟2秒爆发的大范围攻击。延迟期间伤害增加，可被其他攻击提前引爆。',
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
    description: '3秒内免疫所有物理伤害，并获得快速生命恢复。期间不能攻击。',
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

  {
    id: 'enduring_cry',
    name: '坚毅怒吼',
    description: '获得耐力充能，每个充能提供4%物理伤害减免，最多10个充能。',
    type: SkillType.BUFF,
    rarity: SkillRarity.MAGIC,
    maxLevel: 15,
    requiredLevel: 8,
    resourceType: ResourceType.MANA,
    resourceCost: 20,
    cooldown: 6000,
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
    description: '召唤火焰图腾自动攻击。图腾生命值基于召唤者最大生命值。',
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
    description: '持续燃烧自身和周围敌人。对敌人的伤害基于你的最大生命值。',
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
    description: '为300范围内盟友提供火焰伤害加成和火焰抗性。效果不叠加。',
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

  {
    id: 'avatar_of_fire',
    name: '火焰化身',
    description: '所有伤害转化为火焰伤害，火焰伤害提升100%，但无法造成非火焰伤害。',
    type: SkillType.BUFF,
    rarity: SkillRarity.UNIQUE,
    maxLevel: 1,
    requiredLevel: 18,
    resourceType: ResourceType.MANA,
    resourceCost: 100,
    cooldown: 0,
    castTime: 3.0,
    range: 0,
    targetType: 'self',
    elementType: ElementType.FIRE,
    tags: [BuildTag.FIRE_CHIEFTAIN],
    specialization: MarauderSpecialization.CHIEFTAIN
  },

  // ==================== 角斗士专精技能 ====================
  {
    id: 'lacerate',
    name: '撕裂',
    description: '造成物理伤害并施加流血。流血伤害可叠加，最多10层。',
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
    id: 'gladiator_stance',
    name: '角斗士姿态',
    description: '暴击率+30%，攻击速度+25%，但受到伤害+50%。与要塞姿态互斥。',
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

  {
    id: 'crimson_dance',
    name: '血舞',
    description: '双持攻击技能。每次攻击都可能引爆敌人身上的流血效果。',
    type: SkillType.ATTACK,
    rarity: SkillRarity.RARE,
    maxLevel: 15,
    requiredLevel: 12,
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
    id: 'blood_explosion',
    name: '血爆',
    description: '引爆目标敌人的流血效果，造成基于流血层数的区域伤害。',
    type: SkillType.ATTACK,
    rarity: SkillRarity.RARE,
    maxLevel: 12,
    requiredLevel: 16,
    resourceType: ResourceType.MANA,
    resourceCost: 30,
    cooldown: 8000,
    castTime: 1.5,
    range: 200,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.BLEED_GLADIATOR],
    specialization: MarauderSpecialization.GLADIATOR
  },

  // ==================== 混合/通用技能 ====================
  {
    id: 'leap_slam',
    name: '跳跃重击',
    description: '跳跃到目标位置造成区域伤害。距离越远伤害越高，最远距离500。',
    type: SkillType.MOVEMENT,
    rarity: SkillRarity.MAGIC,
    maxLevel: 15,
    requiredLevel: 6,
    resourceType: ResourceType.MANA,
    resourceCost: 18,
    cooldown: 3000,
    castTime: 1.0,
    range: 500,
    targetType: 'area',
    elementType: ElementType.PHYSICAL,
    tags: [BuildTag.HYBRID_MELEE, BuildTag.BERSERKER_FURY, BuildTag.TANK_FORTRESS]
  },

  {
    id: 'cyclone',
    name: '旋风斩',
    description: '持续施法技能。旋转攻击周围敌人，可以移动，攻击速度影响旋转速度。',
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
    description: '混合技能。近战攻击的同时发射3个火球弹射物攻击附近敌人。',
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
    description: '降低敌人30%攻击力和移动速度，持续8秒。增加自身15%威慑力。',
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
  },

  {
    id: 'war_cry',
    name: '战争怒吼',
    description: '为自己和盟友提供20%攻击力加成，持续15秒。效果不叠加。',
    type: SkillType.BUFF,
    rarity: SkillRarity.MAGIC,
    maxLevel: 12,
    requiredLevel: 5,
    resourceType: ResourceType.MANA,
    resourceCost: 25,
    cooldown: 10000,
    castTime: 1.2,
    range: 300,
    targetType: 'allies',
    elementType: ElementType.NONE,
    tags: [BuildTag.TOTEM_SUPPORT, BuildTag.HYBRID_MELEE]
  }
];

// BD构建推荐系统 - 给玩家明确的构建指导
export const BUILD_ARCHETYPES: Record<string, {
  name: string;
  description: string;
  playstyle: string;
  coreSkills: string[];
  supportSkills: string[];
  keystone: string;
  specialization: MarauderSpecialization;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: BuildTag[];
  pros: string[];
  cons: string[];
}> = {
  berserker_pure: {
    name: '血性狂战士',
    description: '以血换力的极致输出流派',
    playstyle: '血量越低战斗力越强，追求极限伤害',
    coreSkills: ['frenzy', 'berserker_rage', 'blood_pact', 'rampage'],
    supportSkills: ['leap_slam', 'war_cry'],
    keystone: 'blood_pact',
    specialization: MarauderSpecialization.BERSERKER,
    difficulty: 'advanced',
    tags: [BuildTag.BERSERKER_FURY],
    pros: ['极高伤害输出', '快速清怪', '击杀回复机制'],
    cons: ['生存能力低', '需要精确操作', '装备需求高']
  },

  tank_fortress: {
    name: '不朽要塞',
    description: '极致防御的耐久战流派',
    playstyle: '以防代攻，通过持久战获胜',
    coreSkills: ['fortress_stance', 'earthquake', 'enduring_cry', 'immortal_call'],
    supportSkills: ['intimidating_shout', 'ground_slam'],
    keystone: 'fortress_stance',
    specialization: MarauderSpecialization.JUGGERNAUT,
    difficulty: 'beginner',
    tags: [BuildTag.TANK_FORTRESS],
    pros: ['超高生存能力', '稳定输出', '适合新手'],
    cons: ['伤害较低', '清怪速度慢', '移动缓慢']
  },

  fire_chieftain: {
    name: '烈焰酋长',
    description: '火焰与图腾的远程控制流派',
    playstyle: '远程控制，策略性战斗',
    coreSkills: ['flame_totem', 'righteous_fire', 'chieftain_aura', 'avatar_of_fire'],
    supportSkills: ['molten_strike', 'war_cry'],
    keystone: 'avatar_of_fire',
    specialization: MarauderSpecialization.CHIEFTAIN,
    difficulty: 'intermediate',
    tags: [BuildTag.FIRE_CHIEFTAIN, BuildTag.TOTEM_SUPPORT],
    pros: ['安全的远程输出', '强力的元素伤害', '团队支援能力'],
    cons: ['魔力消耗大', '前期较弱', '依赖图腾生存']
  },

  bleed_gladiator: {
    name: '血舞角斗士',
    description: '流血暴击的技巧流派',
    playstyle: '快速攻击叠加流血，技巧性爆发',
    coreSkills: ['lacerate', 'gladiator_stance', 'crimson_dance', 'blood_explosion'],
    supportSkills: ['leap_slam', 'intimidating_shout'],
    keystone: 'gladiator_stance',
    specialization: MarauderSpecialization.GLADIATOR,
    difficulty: 'intermediate',
    tags: [BuildTag.BLEED_GLADIATOR],
    pros: ['高暴击输出', '持续伤害', '灵活的战斗方式'],
    cons: ['需要技巧操作', '对装备有要求', '生存能力中等']
  },

  hybrid_fire_tank: {
    name: '烈焰守护者',
    description: '火焰与防御的混合流派',
    playstyle: '坦克型火焰战士，攻守平衡',
    coreSkills: ['righteous_fire', 'fortress_stance', 'molten_strike', 'enduring_cry'],
    supportSkills: ['flame_totem', 'intimidating_shout'],
    keystone: 'righteous_fire',
    specialization: MarauderSpecialization.CHIEFTAIN,
    difficulty: 'intermediate',
    tags: [BuildTag.FIRE_TANK],
    pros: ['攻守平衡', '独特的战斗风格', '适应性强'],
    cons: ['专精度不够', '升级路线复杂', '技能点需求高']
  },

  starter_warrior: {
    name: '新手战士',
    description: '平衡发展的入门流派',
    playstyle: '全面发展，适应各种情况',
    coreSkills: ['ground_slam', 'ancestral_call', 'leap_slam', 'war_cry'],
    supportSkills: ['intimidating_shout'],
    keystone: 'ground_slam',
    specialization: MarauderSpecialization.JUGGERNAUT,
    difficulty: 'beginner',
    tags: [BuildTag.HYBRID_MELEE],
    pros: ['容易上手', '技能点需求低', '全面发展'],
    cons: ['没有特色', '后期可能乏力', '缺乏专精']
  }
};

// 专精解锁系统
export const SPECIALIZATION_INFO: Record<MarauderSpecialization, {
  name: string;
  description: string;
  unlockLevel: number;
  unlockQuest?: string;
  passiveEffects: string[];
  keystoneSkill: string;
  playstyle: string;
  difficulty: string;
  recommendedBuild: string;
}> = {
  [MarauderSpecialization.BERSERKER]: {
    name: '狂战士',
    description: '以血换力，越危险越强大的战斗狂人',
    unlockLevel: 10,
    unlockQuest: '在低于25%生命值时击杀50个敌人',
    passiveEffects: [
      '低血量时伤害提升（最多100%）',
      '击杀敌人回复5%生命值',
      '攻击速度随受伤程度提升',
      '生命值低于25%时免疫控制效果',
      '暴击时有机会获得狂怒充能'
    ],
    keystoneSkill: 'berserker_rage',
    playstyle: '高风险高回报，追求极限伤害',
    difficulty: '困难 - 需要精确的血量控制',
    recommendedBuild: 'berserker_pure'
  },
  
  [MarauderSpecialization.JUGGERNAUT]: {
    name: '重甲战士',
    description: '不可撼动的钢铁堡垒，防御的化身',
    unlockLevel: 8,
    unlockQuest: '在单次战斗中承受1000点伤害而不死亡',
    passiveEffects: [
      '受到攻击时获得护甲层数（最多10层）',
      '移动时不会被击退或减速',
      '每秒恢复2%最大生命值',
      '格挡时减少所有技能1秒冷却',
      '重甲装备提供额外30%防御'
    ],
    keystoneSkill: 'fortress_stance',
    playstyle: '防守反击，稳扎稳打',
    difficulty: '简单 - 容错率高，适合新手',
    recommendedBuild: 'tank_fortress'
  },
  
  [MarauderSpecialization.CHIEFTAIN]: {
    name: '烈焰酋长',
    description: '火焰与图腾的守护者，元素力量的主宰',
    unlockLevel: 12,
    unlockQuest: '同时维持3个不同类型的图腾',
    passiveEffects: [
      '火焰伤害提升50%',
      '最多可召唤3个图腾',
      '光环效果提升25%',
      '每个存活图腾提供5%火焰抗性',
      '火焰技能有机会不消耗魔力'
    ],
    keystoneSkill: 'flame_totem',
    playstyle: '远程控制，策略战斗',
    difficulty: '中等 - 需要位置控制技巧',
    recommendedBuild: 'fire_chieftain'
  },
  
  [MarauderSpecialization.GLADIATOR]: {
    name: '血舞角斗士',
    description: '流血与暴击的艺术家，竞技场的王者',
    unlockLevel: 10,
    unlockQuest: '使用流血效果击杀100个敌人',
    passiveEffects: [
      '攻击有25%概率造成流血',
      '对流血敌人暴击率提升20%',
      '双持武器时攻击速度提升15%',
      '击杀流血敌人时获得狂怒充能',
      '暴击时流血伤害提升200%'
    ],
    keystoneSkill: 'lacerate',
    playstyle: '技巧性输出，追求暴击爆发',
    difficulty: '中等 - 需要时机把握',
    recommendedBuild: 'bleed_gladiator'
  }
};

// 技能学习需求和限制
export interface EnhancedSkillRequirement {
  requiredSkills: string[];
  requiredLevel: number;
  skillPoints: number;
  specialization?: MarauderSpecialization;
  mutuallyExclusive?: string[];  // 互斥技能
  questRequirement?: string;     // 任务需求
  attributeRequirement?: {       // 属性需求
    strength?: number;
    level?: number;
  };
}

export const ENHANCED_SKILL_REQUIREMENTS: Record<string, EnhancedSkillRequirement> = {
  // 基础技能
  'ground_slam': { 
    requiredSkills: [], 
    requiredLevel: 1, 
    skillPoints: 0 
  },
  
  'ancestral_call': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 2, 
    skillPoints: 1 
  },
  
  // 狂战士分支
  'frenzy': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 4, 
    skillPoints: 1, 
    specialization: MarauderSpecialization.BERSERKER 
  },
  
  'berserker_rage': { 
    requiredSkills: ['frenzy'], 
    requiredLevel: 8, 
    skillPoints: 2, 
    specialization: MarauderSpecialization.BERSERKER,
    questRequirement: '在低血量状态下击杀10个敌人'
  },
  
  'blood_pact': { 
    requiredSkills: ['berserker_rage'], 
    requiredLevel: 12, 
    skillPoints: 3, 
    specialization: MarauderSpecialization.BERSERKER,
    questRequirement: '将生命值降低到1点并生存30秒'
  },
  
  // 重甲战士分支
  'fortress_stance': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 6, 
    skillPoints: 1, 
    specialization: MarauderSpecialization.JUGGERNAUT,
    mutuallyExclusive: ['gladiator_stance']
  },
  
  'earthquake': { 
    requiredSkills: ['fortress_stance'], 
    requiredLevel: 10, 
    skillPoints: 2, 
    specialization: MarauderSpecialization.JUGGERNAUT 
  },
  
  'enduring_cry': { 
    requiredSkills: ['fortress_stance'], 
    requiredLevel: 8, 
    skillPoints: 2, 
    specialization: MarauderSpecialization.JUGGERNAUT 
  },
  
  'immortal_call': { 
    requiredSkills: ['earthquake', 'enduring_cry'], 
    requiredLevel: 16, 
    skillPoints: 5, 
    specialization: MarauderSpecialization.JUGGERNAUT,
    questRequirement: '在不朽怒吼状态下生存致命伤害'
  },
  
  // 酋长分支
  'flame_totem': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 5, 
    skillPoints: 1, 
    specialization: MarauderSpecialization.CHIEFTAIN 
  },
  
  'righteous_fire': { 
    requiredSkills: ['flame_totem'], 
    requiredLevel: 8, 
    skillPoints: 2, 
    specialization: MarauderSpecialization.CHIEFTAIN 
  },
  
  'chieftain_aura': { 
    requiredSkills: ['righteous_fire'], 
    requiredLevel: 12, 
    skillPoints: 3, 
    specialization: MarauderSpecialization.CHIEFTAIN 
  },
  
  'avatar_of_fire': { 
    requiredSkills: ['chieftain_aura'], 
    requiredLevel: 18, 
    skillPoints: 5, 
    specialization: MarauderSpecialization.CHIEFTAIN,
    questRequirement: '使用火焰伤害击杀500个敌人'
  },
  
  // 角斗士分支
  'lacerate': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 4, 
    skillPoints: 1, 
    specialization: MarauderSpecialization.GLADIATOR 
  },
  
  'gladiator_stance': { 
    requiredSkills: ['lacerate'], 
    requiredLevel: 8, 
    skillPoints: 2, 
    specialization: MarauderSpecialization.GLADIATOR,
    mutuallyExclusive: ['fortress_stance']
  },
  
  'crimson_dance': { 
    requiredSkills: ['gladiator_stance'], 
    requiredLevel: 12, 
    skillPoints: 3, 
    specialization: MarauderSpecialization.GLADIATOR 
  },
  
  'blood_explosion': { 
    requiredSkills: ['crimson_dance'], 
    requiredLevel: 16, 
    skillPoints: 4, 
    specialization: MarauderSpecialization.GLADIATOR 
  },
  
  // 通用技能
  'leap_slam': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 6, 
    skillPoints: 2 
  },
  
  'cyclone': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 14, 
    skillPoints: 4,
    attributeRequirement: { strength: 100 }
  },
  
  'molten_strike': { 
    requiredSkills: ['ground_slam'], 
    requiredLevel: 12, 
    skillPoints: 3 
  },
  
  'intimidating_shout': { 
    requiredSkills: ['ancestral_call'], 
    requiredLevel: 7, 
    skillPoints: 2 
  },
  
  'war_cry': { 
    requiredSkills: ['ancestral_call'], 
    requiredLevel: 5, 
    skillPoints: 1 
  }
};

// 技能组合效果系统
export const SKILL_SYNERGIES: Record<string, {
  name: string;
  description: string;
  requiredSkills: string[];
  bonusEffect: string;
}> = {
  blood_warrior: {
    name: '血性战士',
    description: '狂怒 + 血之契约的完美结合',
    requiredSkills: ['frenzy', 'blood_pact'],
    bonusEffect: '狂怒层数为血之契约提供额外伤害加成'
  },
  
  fortress_master: {
    name: '要塞主宰',
    description: '防御技能的完美搭配',
    requiredSkills: ['fortress_stance', 'enduring_cry', 'immortal_call'],
    bonusEffect: '所有防御技能效果提升25%'
  },
  
  fire_lord: {
    name: '烈焰领主',
    description: '火焰系技能的至高境界',
    requiredSkills: ['flame_totem', 'righteous_fire', 'avatar_of_fire'],
    bonusEffect: '所有火焰技能获得连锁效果'
  },
  
  bleed_master: {
    name: '流血大师',
    description: '流血系技能的终极形态',
    requiredSkills: ['lacerate', 'crimson_dance', 'blood_explosion'],
    bonusEffect: '流血层数上限提升到15层'
  }
}; 