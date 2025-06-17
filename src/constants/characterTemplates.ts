import { 
  BaseAttributes, 
  DerivedAttributes, 
  ResistanceAttributes,
  CharacterClass
} from '@/types/character'

// 职业基础属性模板
export const CLASS_BASE_ATTRIBUTES: Record<CharacterClass, BaseAttributes> = {
  [CharacterClass.Marauder]: {
    strength: 32,
    dexterity: 14,
    intelligence: 14,
    vitality: 30
  },
  [CharacterClass.Duelist]: {
    strength: 23,
    dexterity: 23,
    intelligence: 14,
    vitality: 25
  },
  [CharacterClass.Ranger]: {
    strength: 14,
    dexterity: 32,
    intelligence: 14,
    vitality: 20
  },
  [CharacterClass.Shadow]: {
    strength: 14,
    dexterity: 23,
    intelligence: 23,
    vitality: 18
  },
  [CharacterClass.Witch]: {
    strength: 14,
    dexterity: 14,
    intelligence: 32,
    vitality: 15
  },
  [CharacterClass.Templar]: {
    strength: 23,
    dexterity: 14,
    intelligence: 23,
    vitality: 22
  },
  [CharacterClass.Scion]: {
    strength: 20,
    dexterity: 20,
    intelligence: 20,
    vitality: 20
  }
}

// 补充完整的职业属性成长
export const CLASS_ATTRIBUTES_GROWTH: Record<CharacterClass, BaseAttributes> = {
  [CharacterClass.Marauder]: {
    strength: 3.0,
    dexterity: 1.5,
    intelligence: 1.0,
    vitality: 2.5
  },
  [CharacterClass.Ranger]: {
    strength: 1.5,
    dexterity: 3.0,
    intelligence: 1.2,
    vitality: 2.0
  },
  [CharacterClass.Witch]: {
    strength: 1.0,
    dexterity: 1.2,
    intelligence: 3.0,
    vitality: 1.8
  },
  [CharacterClass.Shadow]: {
    strength: 1.2,
    dexterity: 3.0,
    intelligence: 1.5,
    vitality: 1.8
  },
  [CharacterClass.Templar]: {
    strength: 2.0,
    dexterity: 1.2,
    intelligence: 2.8,
    vitality: 2.2
  },
  [CharacterClass.Duelist]: {
    strength: 2.5,
    dexterity: 2.5,
    intelligence: 1.0,
    vitality: 2.0
  },
  [CharacterClass.Scion]: {
    strength: 2.0,
    dexterity: 2.0,
    intelligence: 2.0,
    vitality: 2.0
  }
}

// 每个职业的特性描述
export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  [CharacterClass.Marauder]: '来自卡鲁伊的野蛮人，擅长近战和高生命值。',
  [CharacterClass.Duelist]: '灵活的剑术大师，擅长物理伤害和格挡。',
  [CharacterClass.Ranger]: '远程射手，擅长高敏捷和闪避。',
  [CharacterClass.Shadow]: '刺客型角色，擅长暴击和速度。',
  [CharacterClass.Witch]: '元素法师，擅长法术和能量护盾。',
  [CharacterClass.Templar]: '圣武士，擅长混合攻击和防御。',
  [CharacterClass.Scion]: '全能型角色，属性平衡。'
}

// 职业推荐配置
export const CLASS_RECOMMENDATIONS: Record<CharacterClass, boolean> = {
  [CharacterClass.Marauder]: true,
  [CharacterClass.Ranger]: true,
  [CharacterClass.Witch]: false,
  [CharacterClass.Shadow]: false,
  [CharacterClass.Templar]: false,
  [CharacterClass.Duelist]: true,
  [CharacterClass.Scion]: false
}

// 职业初始技能ID配置
export const CLASS_INITIAL_SKILLS: Record<CharacterClass, string[]> = {
  [CharacterClass.Marauder]: ['heavyStrike', 'whirlwind'],
  [CharacterClass.Ranger]: ['quickShot', 'multipleArrow'],
  [CharacterClass.Witch]: ['fireball', 'frostNova'],
  [CharacterClass.Shadow]: ['backstab', 'shadowStrike'],
  [CharacterClass.Templar]: ['holyStrike', 'purifyingFlame'],
  [CharacterClass.Duelist]: ['slash', 'parry'],
  [CharacterClass.Scion]: ['versatileStrike', 'adaptiveDefense']
}

// 属性计算公式
export const ATTRIBUTE_FORMULAS = {
  health: (base: BaseAttributes) => 
    40 + (base.vitality * 12) + (base.strength * 2),
  
  mana: (base: BaseAttributes) => 
    40 + (base.intelligence * 6),
  
  physicalDamage: (base: BaseAttributes) => 
    (base.strength * 1.5) + (base.dexterity * 0.5),
  
  spellDamage: (base: BaseAttributes) => 
    base.intelligence * 1.8,
  
  attackSpeed: (base: BaseAttributes) => 
    100 + (base.dexterity * 0.3),
  
  criticalChance: (base: BaseAttributes) => 
    5 + (base.dexterity * 0.05)
}

// 职业配置
export const CLASS_CONFIG: Record<CharacterClass, {
  recommended: boolean;
  initialSkills: string[];
  strengths: string[];
}> = {
  [CharacterClass.Marauder]: {
    recommended: true,
    initialSkills: ['heavyStrike', 'whirlwind'],
    strengths: [
      'character.classes.warrior.strengths.0',
      'character.classes.warrior.strengths.1',
      'character.classes.warrior.strengths.2'
    ]
  },
  [CharacterClass.Ranger]: {
    recommended: true,
    initialSkills: ['quickShot', 'multipleArrow'],
    strengths: [
      'character.classes.ranger.strengths.0',
      'character.classes.ranger.strengths.1',
      'character.classes.ranger.strengths.2'
    ]
  },
  [CharacterClass.Witch]: {
    recommended: false,
    initialSkills: ['fireball', 'frostNova'],
    strengths: [
      'character.classes.mage.strengths.0',
      'character.classes.mage.strengths.1',
      'character.classes.mage.strengths.2'
    ]
  },
  [CharacterClass.Shadow]: {
    recommended: false,
    initialSkills: ['backstab', 'shadowStrike'],
    strengths: [
      'character.classes.assassin.strengths.0',
      'character.classes.assassin.strengths.1',
      'character.classes.assassin.strengths.2'
    ]
  },
  [CharacterClass.Templar]: {
    recommended: false,
    initialSkills: ['holyStrike', 'purifyingFlame'],
    strengths: [
      'character.classes.templar.strengths.0',
      'character.classes.templar.strengths.1',
      'character.classes.templar.strengths.2'
    ]
  },
  [CharacterClass.Duelist]: {
    recommended: true,
    initialSkills: ['slash', 'parry'],
    strengths: [
      'character.classes.duelist.strengths.0',
      'character.classes.duelist.strengths.1',
      'character.classes.duelist.strengths.2'
    ]
  },
  [CharacterClass.Scion]: {
    recommended: false,
    initialSkills: ['versatileStrike', 'adaptiveDefense'],
    strengths: [
      'character.classes.scion.strengths.0',
      'character.classes.scion.strengths.1',
      'character.classes.scion.strengths.2'
    ]
  }
}

// 计算派生属性的函数
export function calculateDerivedAttributes(
  baseAttributes: BaseAttributes, 
  level: number
): DerivedAttributes {
  const { strength, dexterity, intelligence, vitality } = baseAttributes;
  
  // 基础值
  const baseHealth = 50 + vitality * 5;
  const baseMana = 40 + intelligence * 2;
  const baseEnergy = intelligence * 1.5;
  
  // 等级加成
  const levelHealthBonus = level * 10;
  const levelManaBonus = level * 5;
  const levelDamageBonus = level * 2;
  
  return {
    maxHealth: baseHealth + levelHealthBonus,
    currentHealth: baseHealth + levelHealthBonus,
    maxMana: baseMana + levelManaBonus,
    currentMana: baseMana + levelManaBonus,
    maxEnergy: baseEnergy,
    currentEnergy: baseEnergy,
    
    physicalDamage: strength * 1.5 + levelDamageBonus,
    elementalDamage: intelligence * 1.2 + levelDamageBonus,
    chaosDamage: (strength + intelligence) * 0.5,
    attackSpeed: 1 + dexterity * 0.002,
    castSpeed: 1 + intelligence * 0.002,
    criticalChance: 0.05 + dexterity * 0.001,
    criticalMultiplier: 1.5 + dexterity * 0.005,
    
    armor: strength * 2,
    evasion: dexterity * 2,
    energyShield: intelligence * 1,
    blockChance: strength * 0.1,
    
    movementSpeed: 1 + dexterity * 0.001,
    lifeRegeneration: vitality * 0.1,
    manaRegeneration: intelligence * 0.1
  };
}

// 计算基础抗性
export function calculateResistances(
  baseAttributes: BaseAttributes
): ResistanceAttributes {
  const { strength, dexterity, intelligence } = baseAttributes;
  
  return {
    fireResistance: strength * 0.2,
    coldResistance: dexterity * 0.2,
    lightningResistance: intelligence * 0.2,
    chaosResistance: 0 // 混沌抗性默认为0
  };
}

// 职业图标
export const CLASS_ICONS: Record<CharacterClass, string> = {
  [CharacterClass.Marauder]: 'marauder.png',
  [CharacterClass.Duelist]: 'duelist.png',
  [CharacterClass.Ranger]: 'ranger.png',
  [CharacterClass.Shadow]: 'shadow.png',
  [CharacterClass.Witch]: 'witch.png',
  [CharacterClass.Templar]: 'templar.png',
  [CharacterClass.Scion]: 'scion.png'
};

// 职业中文名称
export const CLASS_NAMES: Record<CharacterClass, string> = {
  [CharacterClass.Marauder]: '野蛮人',
  [CharacterClass.Duelist]: '决斗者',
  [CharacterClass.Ranger]: '游侠',
  [CharacterClass.Shadow]: '暗影',
  [CharacterClass.Witch]: '女巫',
  [CharacterClass.Templar]: '圣堂武僧',
  [CharacterClass.Scion]: '贵族'
}; 