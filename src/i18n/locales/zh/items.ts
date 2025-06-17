export default {
  // 武器
  wooden_sword: {
    name: '木剑',
    description: '一把普通的木剑',
    type: 'weapon',
    quality: 'common',
    stackable: false,
    maxStack: 1,
    sellPrice: 10,
    icon: '🗡️',
    slot: 'weapon',
    level: 1,
    attributes: {
      attack: 5,
      attackSpeed: 10
    }
  },
  rusty_sword: {
    name: '生锈的铁剑',
    description: '一把布满锈迹的铁剑',
    type: 'weapon',
    quality: 'common',
    stackable: false,
    maxStack: 1,
    sellPrice: 15,
    icon: '⚔️',
    slot: 'weapon',
    level: 2,
    attributes: {
      attack: 8,
      attackSpeed: 8
    }
  },
  magic_wand: {
    name: '魔法杖',
    description: '蕴含魔力的法杖',
    type: 'weapon',
    quality: 'uncommon',
    stackable: false,
    maxStack: 1,
    sellPrice: 100,
    icon: '🪄',
    slot: 'weapon',
    level: 5,
    attributes: {
      magicAttack: 15,
      intelligence: 5
    }
  },

  // 防具
  leather_helmet: {
    name: '皮革头盔',
    description: '简单的皮革头盔',
    type: 'armor',
    quality: 'common',
    stackable: false,
    maxStack: 1,
    sellPrice: 20,
    icon: '🪖',
    slot: 'head',
    level: 1,
    attributes: {
      defense: 3,
      health: 10
    }
  },
  chain_mail: {
    name: '锁子甲',
    description: '由金属环相扣制成的护甲',
    type: 'armor',
    quality: 'uncommon',
    stackable: false,
    maxStack: 1,
    sellPrice: 150,
    icon: '🛡️',
    slot: 'chest',
    level: 5,
    attributes: {
      defense: 12,
      health: 25
    }
  },

  // 饰品
  iron_ring: {
    name: '铁戒指',
    description: '普通的铁戒指',
    type: 'accessory',
    quality: 'common',
    stackable: false,
    maxStack: 1,
    sellPrice: 30,
    icon: '💍',
    slot: 'ring',
    level: 1,
    attributes: {
      health: 5,
      defense: 1
    }
  },
  magic_necklace: {
    name: '魔力项链',
    description: '能够增强魔力的项链',
    type: 'accessory',
    quality: 'rare',
    stackable: false,
    maxStack: 1,
    sellPrice: 300,
    icon: '📿',
    slot: 'necklace',
    level: 10,
    attributes: {
      mana: 30,
      magicAttack: 8
    }
  },

  // 消耗品
  health_potion: {
    id: 'health_potion',
    name: '生命药水',
    description: '恢复100点生命值',
    type: 'consumable',
    quality: 'common',
    stackable: true,
    maxStack: 99,
    sellPrice: 50,
    icon: '🧪',
    effects: [
      {
        type: 'heal',
        value: 100
      }
    ]
  },
  mana_potion: {
    name: '魔力药水',
    description: '恢复50点魔力值',
    type: 'consumable',
    quality: 'common',
    stackable: true,
    maxStack: 99,
    sellPrice: 50,
    icon: '🧪',
    effects: [
      {
        type: 'mana',
        value: 50
      }
    ]
  },
  strength_potion: {
    name: '力量药水',
    description: '暂时提升20%攻击力',
    type: 'consumable',
    quality: 'uncommon',
    stackable: true,
    maxStack: 20,
    sellPrice: 100,
    icon: '🧪',
    effects: [
      {
        type: 'attackBoost',
        value: 20,
        duration: 300 // 持续300秒
      }
    ]
  },

  // 材料
  slime_core: {
    name: '史莱姆核心',
    description: '从史莱姆身上掉落的核心',
    type: 'material',
    quality: 'common',
    stackable: true,
    maxStack: 99,
    sellPrice: 5,
    icon: '🫧'
  },
  wolf_fang: {
    name: '狼牙',
    description: '锋利的狼牙',
    type: 'material',
    quality: 'uncommon',
    stackable: true,
    maxStack: 50,
    sellPrice: 15,
    icon: '🦷'
  },
  magic_crystal: {
    name: '魔力水晶',
    description: '蕴含魔力的水晶',
    type: 'material',
    quality: 'rare',
    stackable: true,
    maxStack: 20,
    sellPrice: 100,
    icon: '💎'
  },

  items: {
    gold_coin: {
      name: '金币',
      description: '通用货币'
    },
    health_potion: {
      name: '生命药水',
      description: '恢复少量生命值'
    },
    mana_potion: {
      name: '魔法药水',
      description: '恢复少量魔法值'
    },
    wooden_sword: {
      name: '木剑',
      description: '普通的木制剑'
    },
    leather_armor: {
      name: '皮甲',
      description: '普通的皮革护甲'
    },
    wooden_shield: {
      name: '木盾',
      description: '普通的木制盾牌'
    },
    iron_sword: {
      name: '铁剑',
      description: '普通的铁制剑'
    },
    chain_mail: {
      name: '锁甲',
      description: '铁制链甲'
    },
    iron_shield: {
      name: '铁盾',
      description: '铁制盾牌'
    },
    steel_sword: {
      name: '精钢剑',
      description: '高质量的钢剑'
    },
    plate_armor: {
      name: '板甲',
      description: '全身板甲'
    },
    steel_shield: {
      name: '精钢盾',
      description: '高质量的钢盾'
    }
  },

  magic_scroll: {
    id: 'magic_scroll',
    name: '魔法卷轴',
    description: '蕴含神秘的魔法力量',
    type: 'quest',
    value: 100
  },
  rare_equipment_chest: {
    id: 'rare_equipment_chest',
    name: '稀有装备箱',
    description: '内含稀有装备',
    type: 'chest',
    value: 500
  },
  dragon_scale_armor: {
    id: 'dragon_scale_armor',
    name: '龙鳞护甲',
    description: '由远古巨龙鳞片打造的护甲',
    type: 'armor',
    value: 2000,
    stats: {
      defense: 50,
      magicResist: 30
    }
  },
  dragon_essence: {
    id: 'dragon_essence',
    name: '龙之精华',
    description: '蕴含龙之力量的精华',
    type: 'material',
    value: 1000
  },
  herb: {
    id: 'herb',
    name: '药草',
    description: '常见的药用草药',
    type: 'material',
    value: 10
  }
} as const 