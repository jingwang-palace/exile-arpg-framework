// 测试掉落配置文件
export default {
  // 掉落表
  tables: {
    // 普通怪物掉落表
    normal_monster: {
      rolls: { min: 1, max: 2 },
      groups: [
        { id: 'common_items', weight: 70 },
        { id: 'common_equipment', weight: 20 },
        { id: 'rare_items', weight: 10 }
      ]
    },
    
    // 精英怪物掉落表
    elite_monster: {
      rolls: { min: 2, max: 3 },
      groups: [
        { id: 'common_items', weight: 50 },
        { id: 'common_equipment', weight: 30 },
        { id: 'rare_items', weight: 20 }
      ]
    }
  },
  
  // 掉落组
  groups: {
    // 普通物品组
    common_items: {
      id: 'common_items',
      items: [
        { itemId: 'health_potion', weight: 70, quantityRange: { min: 1, max: 3 } },
        { itemId: 'mana_potion', weight: 70, quantityRange: { min: 1, max: 3 } },
        { itemId: 'scroll_identify', weight: 40, quantityRange: { min: 1, max: 2 } },
        { itemId: 'scroll_portal', weight: 30, quantityRange: { min: 1, max: 2 } }
      ]
    },
    
    // 普通装备组
    common_equipment: {
      id: 'common_equipment',
      items: [
        { itemId: 'crude_sword', weight: 25, quality: 'normal' },
        { itemId: 'rusty_axe', weight: 25, quality: 'normal' },
        { itemId: 'simple_wand', weight: 25, quality: 'normal' },
        { itemId: 'leather_armor', weight: 25, quality: 'normal' },
        { itemId: 'cloth_gloves', weight: 20, quality: 'normal' },
        { itemId: 'leather_boots', weight: 20, quality: 'normal' }
      ]
    },

    // 稀有物品组
    rare_items: {
      id: 'rare_items',
      items: [
        { itemId: 'orb_transmutation', weight: 50, quantityRange: { min: 1, max: 2 } },
        { itemId: 'orb_alteration', weight: 40, quantityRange: { min: 1, max: 1 } },
        { itemId: 'orb_alchemy', weight: 10, quantityRange: { min: 1, max: 1 } }
      ]
    }
  }
} 