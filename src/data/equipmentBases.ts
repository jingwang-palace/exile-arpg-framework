import { EquipmentBase, ItemType, EquipmentSlot, ModType } from '@/types/item'

export const EQUIPMENT_BASES: { [key: string]: EquipmentBase } = {
  // 武器
  'short_sword': {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    baseAttributes: {
      'physical_damage': [8, 12],
      'attack_speed': [1.4, 1.6]
    },
    implicitMods: [{
      id: 'base_crit',
      type: ModType.IMPLICIT,
      name: 'equipment.implicit.base_crit',
      values: [],
      tier: 1,
      attributes: { 'critical_strike_chance': [3, 5] }
    }]
  },
  'long_sword': {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    baseAttributes: {
      'physical_damage': [11, 18],
      'attack_speed': [1.3, 1.5]
    },
    implicitMods: [{
      id: 'base_accuracy',
      type: ModType.IMPLICIT,
      name: 'equipment.implicit.base_accuracy',
      values: [],
      tier: 1,
      attributes: { 'accuracy': [5, 8] }
    }]
  },
  'dagger': {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    baseAttributes: {
      'physical_damage': [4, 8],
      'attack_speed': [1.6, 1.8]
    },
    implicitMods: [{
      id: 'base_crit',
      type: ModType.IMPLICIT,
      name: 'equipment.implicit.base_crit',
      values: [],
      tier: 1,
      attributes: { 'critical_strike_chance': [5, 7] }
    }]
  },

  // 护甲
  'leather_chest': {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.CHEST,
    baseAttributes: {
      'armor': [8, 12],
      'evasion': [8, 12]
    },
    implicitMods: [{
      id: 'base_evasion',
      type: ModType.IMPLICIT,
      name: 'equipment.implicit.base_evasion',
      values: [],
      tier: 1,
      attributes: { 'evasion_rate': [2, 4] }
    }]
  },
  'plate_chest': {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.CHEST,
    baseAttributes: {
      'armor': [15, 20],
      'evasion': [0, 0]
    },
    implicitMods: [{
      id: 'base_block',
      type: ModType.IMPLICIT,
      name: 'equipment.implicit.base_block',
      values: [],
      tier: 1,
      attributes: { 'block_chance': [2, 4] }
    }]
  },

  // 饰品
  'iron_ring': {
    type: ItemType.ACCESSORY,
    slot: EquipmentSlot.RING,
    baseAttributes: {
      'strength': [1, 3]
    }
  },
  'silver_amulet': {
    type: ItemType.ACCESSORY,
    slot: EquipmentSlot.NECKLACE,
    baseAttributes: {
      'intelligence': [2, 4]
    }
  }
}

// 词缀池配置
export const MOD_POOLS = {
  prefix: {
    weapon: [
      {
        id: 'increased_physical_damage',
        type: ModType.PREFIX,
        name: 'equipment.modifiers.prefix.strong',
        values: [],
        tier: 1,
        attributes: { 'physical_damage_percent': [20, 40] }
      },
      {
        id: 'increased_attack_speed',
        type: ModType.PREFIX,
        name: 'equipment.modifiers.prefix.quick',
        values: [],
        tier: 1,
        attributes: { 'attack_speed_percent': [10, 20] }
      }
    ],
    armor: [
      {
        id: 'increased_armor',
        type: ModType.PREFIX,
        name: 'equipment.modifiers.prefix.protective',
        values: [],
        tier: 1,
        attributes: { 'armor_percent': [20, 40] }
      },
      {
        id: 'increased_life',
        type: ModType.PREFIX,
        name: 'equipment.modifiers.prefix.healthy',
        values: [],
        tier: 1,
        attributes: { 'life': [20, 40] }
      }
    ]
  },
  suffix: {
    weapon: [
      {
        id: 'increased_critical_strike',
        type: ModType.SUFFIX,
        name: 'equipment.modifiers.suffix.of_the_eagle',
        values: [],
        tier: 1,
        attributes: { 'critical_strike_chance': [10, 15] }
      }
    ],
    armor: [
      {
        id: 'increased_resistance',
        type: ModType.SUFFIX,
        name: 'equipment.modifiers.suffix.of_protection',
        values: [],
        tier: 1,
        attributes: { 'elemental_resistance': [10, 15] }
      }
    ]
  }
} 