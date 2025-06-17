import { 
  SkillDescription, 
  SkillType, 
  ResourceType, 
  TargetType, 
  ElementType,
  SkillRarity
} from './SkillTypes';

// 所有技能的集合
export const SKILLS: SkillDescription[] = [
  // 战士技能
  {
    id: 'cleave',
    name: '横扫',
    description: '向前方挥动武器，对周围敌人造成伤害',
    icon: 'cleave',
    type: SkillType.MELEE,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.RAGE,
    resourceCost: 15,
    cooldown: 3000,
    castTime: 300,
    targetType: TargetType.DIRECTION,
    range: 100,
    effects: [
      {
        type: 'damage',
        value: 30,
        element: ElementType.PHYSICAL,
        radius: 80
      }
    ],
    requiredLevel: 1,
    maxLevel: 5
  },
  {
    id: 'charge',
    name: '冲锋',
    description: '向目标冲锋，并造成伤害',
    icon: 'charge',
    type: SkillType.MOVEMENT,
    rarity: SkillRarity.UNCOMMON,
    resourceType: ResourceType.RAGE,
    resourceCost: 25,
    cooldown: 10000,
    castTime: 100,
    targetType: TargetType.GROUND,
    range: 300,
    effects: [
      {
        type: 'movement',
        value: 300
      },
      {
        type: 'damage',
        value: 20,
        element: ElementType.PHYSICAL,
        radius: 60
      }
    ],
    requiredLevel: 5,
    maxLevel: 3
  },
  {
    id: 'whirlwind',
    name: '旋风斩',
    description: '旋转武器，对周围敌人造成持续伤害',
    icon: 'whirlwind',
    type: SkillType.AOE,
    rarity: SkillRarity.RARE,
    resourceType: ResourceType.RAGE,
    resourceCost: 40,
    cooldown: 15000,
    castTime: 500,
    targetType: TargetType.SELF,
    range: 0,
    effects: [
      {
        type: 'damage',
        value: 10,
        duration: 3000,
        tickRate: 500,
        radius: 120,
        element: ElementType.PHYSICAL
      }
    ],
    requiredLevel: 10,
    maxLevel: 5
  },
  
  // 法师技能
  {
    id: 'fireball',
    name: '火球术',
    description: '向目标发射一个火球，造成爆炸伤害',
    icon: 'fireball',
    type: SkillType.RANGED,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.MANA,
    resourceCost: 20,
    cooldown: 3000,
    castTime: 800,
    targetType: TargetType.SINGLE,
    range: 400,
    effects: [
      {
        type: 'damage',
        value: 40,
        radius: 60,
        element: ElementType.FIRE
      }
    ],
    requiredLevel: 1,
    maxLevel: 5
  },
  {
    id: 'frostbolt',
    name: '寒冰箭',
    description: '发射一支寒冰箭，造成伤害并减速目标',
    icon: 'frostbolt',
    type: SkillType.RANGED,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.MANA,
    resourceCost: 15,
    cooldown: 2000,
    castTime: 500,
    targetType: TargetType.SINGLE,
    range: 350,
    effects: [
      {
        type: 'damage',
        value: 25,
        element: ElementType.ICE
      },
      {
        type: 'debuff',
        value: 0.3, // 减速30%
        duration: 3000
      }
    ],
    requiredLevel: 1,
    maxLevel: 5
  },
  {
    id: 'lightning_nova',
    name: '闪电新星',
    description: '释放闪电能量，对周围敌人造成伤害',
    icon: 'lightning_nova',
    type: SkillType.AOE,
    rarity: SkillRarity.UNCOMMON,
    resourceType: ResourceType.MANA,
    resourceCost: 35,
    cooldown: 8000,
    castTime: 1000,
    targetType: TargetType.SELF,
    range: 0,
    effects: [
      {
        type: 'damage',
        value: 60,
        radius: 200,
        element: ElementType.LIGHTNING
      }
    ],
    requiredLevel: 5,
    maxLevel: 5
  },
  {
    id: 'arcane_blast',
    name: '奥术爆炸',
    description: '在目标区域引发奥术爆炸，造成大量伤害',
    icon: 'arcane_blast',
    type: SkillType.AOE,
    rarity: SkillRarity.RARE,
    resourceType: ResourceType.MANA,
    resourceCost: 50,
    cooldown: 12000,
    castTime: 1500,
    targetType: TargetType.GROUND,
    range: 300,
    effects: [
      {
        type: 'damage',
        value: 100,
        radius: 150,
        element: ElementType.ARCANE
      }
    ],
    requiredLevel: 10,
    maxLevel: 5
  },
  
  // 弓箭手技能
  {
    id: 'quick_shot',
    name: '快速射击',
    description: '快速射出一箭，造成伤害',
    icon: 'quick_shot',
    type: SkillType.RANGED,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.ENERGY,
    resourceCost: 10,
    cooldown: 1000,
    castTime: 200,
    targetType: TargetType.SINGLE,
    range: 400,
    effects: [
      {
        type: 'damage',
        value: 25,
        element: ElementType.PHYSICAL
      }
    ],
    requiredLevel: 1,
    maxLevel: 5
  },
  {
    id: 'arrow_rain',
    name: '箭雨',
    description: '向指定区域射出箭雨，造成持续伤害',
    icon: 'arrow_rain',
    type: SkillType.AOE,
    rarity: SkillRarity.UNCOMMON,
    resourceType: ResourceType.ENERGY,
    resourceCost: 30,
    cooldown: 10000,
    castTime: 1000,
    targetType: TargetType.GROUND,
    range: 500,
    effects: [
      {
        type: 'damage',
        value: 8,
        duration: 4000,
        tickRate: 500,
        radius: 150,
        element: ElementType.PHYSICAL
      }
    ],
    requiredLevel: 5,
    maxLevel: 5
  },
  {
    id: 'poison_arrow',
    name: '毒箭',
    description: '射出一支淬毒的箭，造成持续毒素伤害',
    icon: 'poison_arrow',
    type: SkillType.RANGED,
    rarity: SkillRarity.UNCOMMON,
    resourceType: ResourceType.ENERGY,
    resourceCost: 25,
    cooldown: 8000,
    castTime: 500,
    targetType: TargetType.SINGLE,
    range: 350,
    effects: [
      {
        type: 'damage',
        value: 15,
        element: ElementType.POISON
      },
      {
        type: 'damage',
        value: 5,
        duration: 6000,
        tickRate: 1000,
        element: ElementType.POISON
      }
    ],
    requiredLevel: 5,
    maxLevel: 5
  },
  
  // 通用技能
  {
    id: 'first_aid',
    name: '急救',
    description: '恢复一定量的生命值',
    icon: 'first_aid',
    type: SkillType.BUFF,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.NONE,
    resourceCost: 0,
    cooldown: 30000,
    castTime: 1000,
    targetType: TargetType.SELF,
    range: 0,
    effects: [
      {
        type: 'heal',
        value: 50
      }
    ],
    requiredLevel: 1,
    maxLevel: 3
  },
  {
    id: 'dash',
    name: '闪避',
    description: '快速移动一小段距离，可以躲避攻击',
    icon: 'dash',
    type: SkillType.MOVEMENT,
    rarity: SkillRarity.COMMON,
    resourceType: ResourceType.ENERGY,
    resourceCost: 10,
    cooldown: 5000,
    castTime: 0,
    targetType: TargetType.DIRECTION,
    range: 150,
    effects: [
      {
        type: 'movement',
        value: 150
      }
    ],
    requiredLevel: 1,
    maxLevel: 3
  }
];

// 获取所有技能
export function getAllSkills(): SkillDescription[] {
  return SKILLS;
}

// 根据ID获取技能
export function getSkillById(id: string): SkillDescription | undefined {
  return SKILLS.find(skill => skill.id === id);
}

// 根据类型获取技能
export function getSkillsByType(type: SkillType): SkillDescription[] {
  return SKILLS.filter(skill => skill.type === type);
}

// 获取特定等级要求的技能
export function getSkillsByRequiredLevel(level: number): SkillDescription[] {
  return SKILLS.filter(skill => skill.requiredLevel <= level);
}

// 根据稀有度获取技能
export function getSkillsByRarity(rarity: SkillRarity): SkillDescription[] {
  return SKILLS.filter(skill => skill.rarity === rarity);
} 