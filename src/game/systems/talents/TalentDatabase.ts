import { 
  TalentTreeDefinition, 
  TalentNodeDescription, 
  TalentCategory, 
  TalentType,
  AttributeType
} from './TalentTypes';

// 战士天赋树
const warriorTalentTree: TalentTreeDefinition = {
  id: 'warrior_tree',
  name: '战士天赋树',
  description: '专注于力量和近战战斗的天赋树',
  characterClass: 'warrior',
  nodes: [
    // 核心节点
    {
      id: 'warrior_core_strength',
      name: '基础力量',
      description: '增加基础力量属性',
      icon: 'strength',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 5,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.STRENGTH,
          value: 2,
          description: '增加2点力量'
        },
        {
          type: 'attribute',
          target: AttributeType.ATTACK_DAMAGE,
          value: 3,
          description: '增加3点攻击伤害'
        }
      ],
      position: { x: 0, y: 0 },
      connections: ['warrior_armor_mastery', 'warrior_weapon_expertise']
    },
    {
      id: 'warrior_armor_mastery',
      name: '护甲精通',
      description: '提高护甲值和生命上限',
      icon: 'armor',
      category: TalentCategory.DEFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.ARMOR,
          value: 5,
          description: '增加5点护甲'
        },
        {
          type: 'attribute',
          target: AttributeType.MAX_HEALTH,
          value: 10,
          description: '增加10点最大生命值'
        }
      ],
      position: { x: -2, y: 1 },
      connections: ['warrior_core_strength', 'warrior_tough_skin']
    },
    {
      id: 'warrior_weapon_expertise',
      name: '武器专精',
      description: '提高攻击速度和暴击几率',
      icon: 'sword',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.ATTACK_SPEED,
          value: 0.05,
          isPercentage: true,
          description: '增加5%攻击速度'
        },
        {
          type: 'attribute',
          target: AttributeType.CRITICAL_CHANCE,
          value: 0.02,
          isPercentage: true,
          description: '增加2%暴击几率'
        }
      ],
      position: { x: 2, y: 1 },
      connections: ['warrior_core_strength', 'warrior_precise_strikes']
    },
    
    // 防御路线
    {
      id: 'warrior_tough_skin',
      name: '坚韧皮肤',
      description: '提高伤害减免',
      icon: 'tough_skin',
      category: TalentCategory.DEFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.DAMAGE_REDUCTION,
          value: 0.03,
          isPercentage: true,
          description: '增加3%伤害减免'
        }
      ],
      position: { x: -3, y: 2 },
      connections: ['warrior_armor_mastery', 'warrior_shield_wall']
    },
    {
      id: 'warrior_shield_wall',
      name: '盾墙',
      description: '大幅提高格挡几率',
      icon: 'shield',
      category: TalentCategory.DEFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.BLOCK_CHANCE,
          value: 0.05,
          isPercentage: true,
          description: '增加5%格挡几率'
        }
      ],
      position: { x: -4, y: 3 },
      connections: ['warrior_tough_skin', 'warrior_unyielding']
    },
    {
      id: 'warrior_unyielding',
      name: '坚不可摧',
      description: '受到致命伤害时，有几率保留1点生命值',
      icon: 'unyielding',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 0.2,
          isPercentage: true,
          description: '受到致命伤害时，有20%几率保留1点生命值，冷却时间30秒'
        }
      ],
      position: { x: -5, y: 4 },
      connections: ['warrior_shield_wall'],
      requiredPoints: 8
    },
    
    // 进攻路线
    {
      id: 'warrior_precise_strikes',
      name: '精准打击',
      description: '提高暴击伤害',
      icon: 'precise',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.CRITICAL_DAMAGE,
          value: 0.1,
          isPercentage: true,
          description: '增加10%暴击伤害'
        }
      ],
      position: { x: 3, y: 2 },
      connections: ['warrior_weapon_expertise', 'warrior_battle_rage']
    },
    {
      id: 'warrior_battle_rage',
      name: '战斗怒火',
      description: '攻击时有几率获得额外怒气',
      icon: 'rage',
      category: TalentCategory.UTILITY,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 3,
      effects: [
        {
          type: 'unique',
          value: 0.1,
          isPercentage: true,
          description: '攻击时有10%几率获得5点额外怒气'
        }
      ],
      position: { x: 4, y: 3 },
      connections: ['warrior_precise_strikes', 'warrior_berserker']
    },
    {
      id: 'warrior_berserker',
      name: '狂暴',
      description: '生命值低于30%时，攻击速度和攻击伤害提高',
      icon: 'berserker',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 0.25,
          isPercentage: true,
          description: '生命值低于30%时，攻击速度和攻击伤害提高25%'
        }
      ],
      position: { x: 5, y: 4 },
      connections: ['warrior_battle_rage'],
      requiredPoints: 8
    },
    
    // 技能强化
    {
      id: 'warrior_cleave_mastery',
      name: '横扫精通',
      description: '增强横扫技能的效果',
      icon: 'cleave',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'cleave',
          value: 0.15,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'cleave',
          value: 0.1,
          isPercentage: true,
          description: '范围提高'
        }
      ],
      position: { x: 0, y: 3 },
      connections: ['warrior_armor_mastery', 'warrior_weapon_expertise'],
      requiredPoints: 5
    },
    {
      id: 'warrior_whirlwind_mastery',
      name: '旋风斩精通',
      description: '增强旋风斩技能的效果',
      icon: 'whirlwind',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'whirlwind',
          value: 0.2,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'whirlwind',
          value: 1000,
          description: '持续时间提高'
        }
      ],
      position: { x: 0, y: 5 },
      connections: ['warrior_cleave_mastery'],
      requiredPoints: 10
    }
  ]
};

// 法师天赋树
const mageTalentTree: TalentTreeDefinition = {
  id: 'mage_tree',
  name: '法师天赋树',
  description: '专注于智力和法术的天赋树',
  characterClass: 'mage',
  nodes: [
    // 核心节点
    {
      id: 'mage_core_intelligence',
      name: '基础智力',
      description: '增加基础智力属性',
      icon: 'intelligence',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 5,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.INTELLIGENCE,
          value: 2,
          description: '增加2点智力'
        },
        {
          type: 'attribute',
          target: AttributeType.SPELL_DAMAGE,
          value: 3,
          description: '增加3点法术伤害'
        }
      ],
      position: { x: 0, y: 0 },
      connections: ['mage_mana_pool', 'mage_spell_weaving']
    },
    {
      id: 'mage_mana_pool',
      name: '魔力池',
      description: '增加最大魔法值和魔法恢复',
      icon: 'mana',
      category: TalentCategory.UTILITY,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.MAX_MANA,
          value: 15,
          description: '增加15点最大魔法值'
        },
        {
          type: 'attribute',
          target: AttributeType.RESOURCE_REGEN,
          value: 0.5,
          description: '增加0.5点每秒魔法恢复'
        }
      ],
      position: { x: -2, y: 1 },
      connections: ['mage_core_intelligence', 'mage_arcane_shield']
    },
    {
      id: 'mage_spell_weaving',
      name: '法术编织',
      description: '提高施法速度和法术效果',
      icon: 'spellweave',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.CAST_SPEED,
          value: 0.05,
          isPercentage: true,
          description: '增加5%施法速度'
        },
        {
          type: 'attribute',
          target: AttributeType.AREA_EFFECT,
          value: 0.03,
          isPercentage: true,
          description: '增加3%法术范围效果'
        }
      ],
      position: { x: 2, y: 1 },
      connections: ['mage_core_intelligence', 'mage_elemental_focus']
    },
    
    // 防御路线
    {
      id: 'mage_arcane_shield',
      name: '奥术护盾',
      description: '提高魔法抗性',
      icon: 'arcane_shield',
      category: TalentCategory.DEFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.MAGIC_RESIST,
          value: 5,
          description: '增加5点魔法抗性'
        }
      ],
      position: { x: -3, y: 2 },
      connections: ['mage_mana_pool', 'mage_mana_barrier']
    },
    {
      id: 'mage_mana_barrier',
      name: '法力屏障',
      description: '受到伤害时，部分伤害由魔法值承担',
      icon: 'mana_barrier',
      category: TalentCategory.DEFENSE,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 3,
      effects: [
        {
          type: 'unique',
          value: 0.1,
          isPercentage: true,
          description: '受到伤害时，10%的伤害由魔法值承担'
        }
      ],
      position: { x: -4, y: 3 },
      connections: ['mage_arcane_shield', 'mage_ice_block']
    },
    {
      id: 'mage_ice_block',
      name: '寒冰屏障',
      description: '激活时进入无敌状态，但无法移动和攻击',
      icon: 'ice_block',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 3,
          description: '激活时进入无敌状态持续3秒，但无法移动和攻击，冷却时间3分钟'
        }
      ],
      position: { x: -5, y: 4 },
      connections: ['mage_mana_barrier'],
      requiredPoints: 8
    },
    
    // 元素路线
    {
      id: 'mage_elemental_focus',
      name: '元素专注',
      description: '提高元素伤害和暴击几率',
      icon: 'elemental',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.SPELL_DAMAGE,
          value: 5,
          description: '增加5点法术伤害'
        },
        {
          type: 'attribute',
          target: AttributeType.CRITICAL_CHANCE,
          value: 0.02,
          isPercentage: true,
          description: '增加2%法术暴击几率'
        }
      ],
      position: { x: 3, y: 2 },
      connections: ['mage_spell_weaving', 'mage_elemental_harmony']
    },
    {
      id: 'mage_elemental_harmony',
      name: '元素和谐',
      description: '使用不同元素法术时获得增益效果',
      icon: 'harmony',
      category: TalentCategory.UTILITY,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 3,
      effects: [
        {
          type: 'unique',
          value: 0.08,
          isPercentage: true,
          description: '使用不同元素法术时，下一个法术的伤害提高8%，持续5秒'
        }
      ],
      position: { x: 4, y: 3 },
      connections: ['mage_elemental_focus', 'mage_archmage']
    },
    {
      id: 'mage_archmage',
      name: '大法师',
      description: '法术暴击后恢复部分魔法值',
      icon: 'archmage',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 0.05,
          isPercentage: true,
          description: '法术暴击后恢复5%最大魔法值'
        }
      ],
      position: { x: 5, y: 4 },
      connections: ['mage_elemental_harmony'],
      requiredPoints: 8
    },
    
    // 技能强化
    {
      id: 'mage_fireball_mastery',
      name: '火球术精通',
      description: '增强火球术技能的效果',
      icon: 'fireball',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'fireball',
          value: 0.15,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'fireball',
          value: 0.1,
          isPercentage: true,
          description: '爆炸范围提高'
        }
      ],
      position: { x: 0, y: 3 },
      connections: ['mage_mana_pool', 'mage_spell_weaving'],
      requiredPoints: 5
    },
    {
      id: 'mage_arcane_blast_mastery',
      name: '奥术爆炸精通',
      description: '增强奥术爆炸技能的效果',
      icon: 'arcane_blast',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'arcane_blast',
          value: 0.2,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'arcane_blast',
          value: -200,
          description: '施法时间减少200毫秒'
        }
      ],
      position: { x: 0, y: 5 },
      connections: ['mage_fireball_mastery'],
      requiredPoints: 10
    }
  ]
};

// 弓箭手天赋树
const archerTalentTree: TalentTreeDefinition = {
  id: 'archer_tree',
  name: '弓箭手天赋树',
  description: '专注于敏捷和远程攻击的天赋树',
  characterClass: 'archer',
  nodes: [
    // 核心节点
    {
      id: 'archer_core_dexterity',
      name: '基础敏捷',
      description: '增加基础敏捷属性',
      icon: 'dexterity',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 5,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.DEXTERITY,
          value: 2,
          description: '增加2点敏捷'
        },
        {
          type: 'attribute',
          target: AttributeType.ATTACK_DAMAGE,
          value: 2,
          description: '增加2点攻击伤害'
        }
      ],
      position: { x: 0, y: 0 },
      connections: ['archer_agility', 'archer_marksmanship']
    },
    {
      id: 'archer_agility',
      name: '灵巧',
      description: '提高移动速度和闪避几率',
      icon: 'agility',
      category: TalentCategory.UTILITY,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.MOVEMENT_SPEED,
          value: 0.03,
          isPercentage: true,
          description: '增加3%移动速度'
        },
        {
          type: 'attribute',
          target: AttributeType.DODGE_CHANCE,
          value: 0.02,
          isPercentage: true,
          description: '增加2%闪避几率'
        }
      ],
      position: { x: -2, y: 1 },
      connections: ['archer_core_dexterity', 'archer_evasion']
    },
    {
      id: 'archer_marksmanship',
      name: '精准射击',
      description: '提高远程攻击伤害和射程',
      icon: 'marksmanship',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.ATTACK_DAMAGE,
          value: 5,
          description: '增加5点攻击伤害'
        },
        {
          type: 'attribute',
          target: AttributeType.PROJECTILE_SPEED,
          value: 0.1,
          isPercentage: true,
          description: '增加10%投射物速度'
        }
      ],
      position: { x: 2, y: 1 },
      connections: ['archer_core_dexterity', 'archer_deadly_aim']
    },
    
    // 闪避路线
    {
      id: 'archer_evasion',
      name: '回避',
      description: '进一步提高闪避几率',
      icon: 'evasion',
      category: TalentCategory.DEFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.DODGE_CHANCE,
          value: 0.03,
          isPercentage: true,
          description: '增加3%闪避几率'
        }
      ],
      position: { x: -3, y: 2 },
      connections: ['archer_agility', 'archer_acrobatics']
    },
    {
      id: 'archer_acrobatics',
      name: '杂技',
      description: '闪避后短时间内移动速度提高',
      icon: 'acrobatics',
      category: TalentCategory.UTILITY,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 3,
      effects: [
        {
          type: 'unique',
          value: 0.15,
          isPercentage: true,
          description: '闪避后移动速度提高15%，持续2秒'
        }
      ],
      position: { x: -4, y: 3 },
      connections: ['archer_evasion', 'archer_shadow_step']
    },
    {
      id: 'archer_shadow_step',
      name: '影步',
      description: '闪避致命攻击后短暂隐身',
      icon: 'shadow_step',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 1.5,
          description: '闪避致命攻击后隐身1.5秒，冷却时间45秒'
        }
      ],
      position: { x: -5, y: 4 },
      connections: ['archer_acrobatics'],
      requiredPoints: 8
    },
    
    // 精准路线
    {
      id: 'archer_deadly_aim',
      name: '致命瞄准',
      description: '提高暴击几率和暴击伤害',
      icon: 'deadly_aim',
      category: TalentCategory.OFFENSE,
      type: TalentType.STAT_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'attribute',
          target: AttributeType.CRITICAL_CHANCE,
          value: 0.03,
          isPercentage: true,
          description: '增加3%暴击几率'
        },
        {
          type: 'attribute',
          target: AttributeType.CRITICAL_DAMAGE,
          value: 0.1,
          isPercentage: true,
          description: '增加10%暴击伤害'
        }
      ],
      position: { x: 3, y: 2 },
      connections: ['archer_marksmanship', 'archer_focus_shot']
    },
    {
      id: 'archer_focus_shot',
      name: '专注射击',
      description: '静止不动时提高伤害',
      icon: 'focus',
      category: TalentCategory.OFFENSE,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 3,
      effects: [
        {
          type: 'unique',
          value: 0.05,
          isPercentage: true,
          description: '静止不动1秒后，每秒增加5%伤害，最多15%'
        }
      ],
      position: { x: 4, y: 3 },
      connections: ['archer_deadly_aim', 'archer_sniper']
    },
    {
      id: 'archer_sniper',
      name: '狙击手',
      description: '距离目标越远，造成的伤害越高',
      icon: 'sniper',
      category: TalentCategory.SPECIAL,
      type: TalentType.UNIQUE_EFFECT,
      maxPoints: 1,
      effects: [
        {
          type: 'unique',
          value: 0.5,
          isPercentage: true,
          description: '距离目标每100像素增加5%伤害，最多增加50%'
        }
      ],
      position: { x: 5, y: 4 },
      connections: ['archer_focus_shot'],
      requiredPoints: 8
    },
    
    // 技能强化
    {
      id: 'archer_quick_shot_mastery',
      name: '快速射击精通',
      description: '增强快速射击技能的效果',
      icon: 'quick_shot',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'quick_shot',
          value: 0.15,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'quick_shot',
          value: -100,
          description: '冷却时间减少100毫秒'
        }
      ],
      position: { x: 0, y: 3 },
      connections: ['archer_agility', 'archer_marksmanship'],
      requiredPoints: 5
    },
    {
      id: 'archer_arrow_rain_mastery',
      name: '箭雨精通',
      description: '增强箭雨技能的效果',
      icon: 'arrow_rain',
      category: TalentCategory.OFFENSE,
      type: TalentType.SKILL_BOOST,
      maxPoints: 3,
      effects: [
        {
          type: 'skill',
          target: 'arrow_rain',
          value: 0.2,
          isPercentage: true,
          description: '伤害提高'
        },
        {
          type: 'skill',
          target: 'arrow_rain',
          value: 1000,
          description: '持续时间提高1000毫秒'
        }
      ],
      position: { x: 0, y: 5 },
      connections: ['archer_quick_shot_mastery'],
      requiredPoints: 10
    }
  ]
};

// 导出所有天赋树
export const TALENT_TREES: TalentTreeDefinition[] = [
  warriorTalentTree,
  mageTalentTree,
  archerTalentTree
];

// 获取所有天赋树
export function getAllTalentTrees(): TalentTreeDefinition[] {
  return TALENT_TREES;
}

// 根据ID获取天赋树
export function getTalentTreeById(id: string): TalentTreeDefinition | undefined {
  return TALENT_TREES.find(tree => tree.id === id);
}

// 根据职业获取天赋树
export function getTalentTreesByClass(characterClass: string): TalentTreeDefinition[] {
  return TALENT_TREES.filter(tree => tree.characterClass === characterClass);
}

// 根据ID获取天赋节点
export function getTalentNodeById(treeId: string, nodeId: string): TalentNodeDescription | undefined {
  const tree = getTalentTreeById(treeId);
  if (!tree) return undefined;
  
  return tree.nodes.find(node => node.id === nodeId);
} 