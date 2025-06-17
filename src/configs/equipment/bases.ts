// 装备基础数据配置
export const EQUIPMENT_BASES = {
  // 武器
  crude_sword: {
    id: 'crude_sword',
    type: 'weapon',
    subType: 'sword',
    baseStats: {
      damage: { min: 2, max: 5 },
      attackSpeed: 1.5
    },
    requiredLevel: 1,
    requiredAttributes: {
      strength: 10
    }
  },
  
  rusty_axe: {
    id: 'rusty_axe',
    type: 'weapon',
    subType: 'axe',
    baseStats: {
      damage: { min: 3, max: 7 },
      attackSpeed: 1.2
    },
    requiredLevel: 1,
    requiredAttributes: {
      strength: 12
    }
  },
  
  simple_wand: {
    id: 'simple_wand',
    type: 'weapon',
    subType: 'wand',
    baseStats: {
      damage: { min: 1, max: 3 },
      attackSpeed: 1.4,
      spellPower: 5
    },
    requiredLevel: 1,
    requiredAttributes: {
      intelligence: 10
    }
  },
  
  // 防具
  leather_armor: {
    id: 'leather_armor',
    type: 'armor',
    subType: 'chest',
    baseStats: {
      armor: 5
    },
    requiredLevel: 1,
    requiredAttributes: {
      dexterity: 8
    }
  },
  
  cloth_gloves: {
    id: 'cloth_gloves',
    type: 'armor',
    subType: 'gloves',
    baseStats: {
      armor: 2
    },
    requiredLevel: 1
  },
  
  leather_boots: {
    id: 'leather_boots',
    type: 'armor',
    subType: 'boots',
    baseStats: {
      armor: 2,
      movementSpeed: 5
    },
    requiredLevel: 1
  }
} 