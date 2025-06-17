import { JewelType, JewelEffect, AttributeModifier, ModifierType } from '../types/equipment';

// 禁断珠宝效果
export const FORBIDDEN_JEWEL_EFFECTS: { [key: string]: JewelEffect } = {
  // 战士类
  'berserker_rage': {
    type: JewelType.FORBIDDEN,
    stolenSkill: 'berserker_rage',
    skillModifiers: [{
      skillId: 'berserker_rage',
      modifiers: [
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'damage',
          value: 40,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'attack_speed',
          value: 20,
          tier: 1
        }
      ]
    }]
  },

  // 法师类
  'arcane_surge': {
    type: JewelType.FORBIDDEN,
    stolenSkill: 'arcane_surge',
    skillModifiers: [{
      skillId: 'arcane_surge',
      modifiers: [
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'spell_damage',
          value: 30,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'mana_regeneration',
          value: 50,
          tier: 1
        }
      ]
    }]
  },

  // 游侠类
  'precise_strike': {
    type: JewelType.FORBIDDEN,
    stolenSkill: 'precise_strike',
    skillModifiers: [{
      skillId: 'precise_strike',
      modifiers: [
        {
          type: ModifierType.FLAT,
          attribute: 'critical_strike_chance',
          value: 5,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'critical_strike_multiplier',
          value: 30,
          tier: 1
        }
      ]
    }]
  }
};

// 特殊珠宝效果
export const SPECIAL_JEWEL_EFFECTS: { [key: string]: JewelEffect } = {
  'blood_magic': {
    type: JewelType.SPECIAL,
    uniqueMechanic: {
      id: 'blood_magic',
      description: '技能消耗生命值而不是魔法值',
      effect: () => {
        // 实现血魔法机制
      }
    }
  },
  
  'eldritch_battery': {
    type: JewelType.SPECIAL,
    uniqueMechanic: {
      id: 'eldritch_battery',
      description: '能量护盾优先于生命值受到伤害',
      effect: () => {
        // 实现异能电池机制
      }
    }
  },
  
  'mind_over_matter': {
    type: JewelType.SPECIAL,
    uniqueMechanic: {
      id: 'mind_over_matter',
      description: '30%的伤害从生命值转移到魔法值',
      effect: () => {
        // 实现心胜于物机制
      }
    }
  }
};

// 普通珠宝效果
export const NORMAL_JEWEL_EFFECTS: { [key: string]: JewelEffect } = {
  'combat_jewel': {
    type: JewelType.NORMAL,
    skillModifiers: [{
      skillId: 'combat_skills',
      modifiers: [
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'physical_damage',
          value: 15,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'attack_speed',
          value: 8,
          tier: 1
        }
      ]
    }]
  },
  
  'spell_jewel': {
    type: JewelType.NORMAL,
    skillModifiers: [{
      skillId: 'spell_skills',
      modifiers: [
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'spell_damage',
          value: 15,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'cast_speed',
          value: 8,
          tier: 1
        }
      ]
    }]
  },
  
  'defense_jewel': {
    type: JewelType.NORMAL,
    skillModifiers: [{
      skillId: 'defense_skills',
      modifiers: [
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'armor',
          value: 15,
          tier: 1
        },
        {
          type: ModifierType.PERCENTAGE,
          attribute: 'evasion',
          value: 15,
          tier: 1
        }
      ]
    }]
  }
}; 