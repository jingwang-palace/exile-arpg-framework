// 通货稀有度枚举
export enum CurrencyRarity {
  COMMON = 'common',           // 普通 - 白色
  UNCOMMON = 'uncommon',       // 不常见 - 蓝色  
  RARE = 'rare',               // 稀有 - 黄色
  EPIC = 'epic',               // 史诗 - 紫色
  LEGENDARY = 'legendary',     // 传说 - 橙色
  MYTHIC = 'mythic'           // 神话 - 红色
}

// 通货类型枚举
export enum CurrencyType {
  // 基础通货
  ORB_OF_ALTERATION = 'orb_of_alteration',
  CHAOS_ORB = 'chaos_orb',
  EXALTED_ORB = 'exalted_orb',
  DIVINE_ORB = 'divine_orb',
  MIRROR_OF_KALANDRA = 'mirror_of_kalandra',
  
  // 改造通货
  ORB_OF_TRANSMUTATION = 'orb_of_transmutation',
  ORB_OF_AUGMENTATION = 'orb_of_augmentation',
  ORB_OF_ALCHEMY = 'orb_of_alchemy',
  CHANCE_ORB = 'chance_orb',
  REGAL_ORB = 'regal_orb',
  
  // 品质通货
  BLACKSMITH_WHETSTONE = 'blacksmith_whetstone',
  ARMOURER_SCRAP = 'armourer_scrap',
  GLASSBLOWER_BAUBLE = 'glassblower_bauble',
  GEMCUTTER_PRISM = 'gemcutter_prism',
  
  // 地图通货
  CARTOGRAPHER_CHISEL = 'cartographer_chisel',
  ORB_OF_HORIZONS = 'orb_of_horizons',
  ORB_OF_SCOURING = 'orb_of_scouring',
  ORB_OF_BINDING = 'orb_of_binding',
  
  // 特殊通货
  VAAL_ORB = 'vaal_orb',
  BLESSED_ORB = 'blessed_orb',
  ETERNAL_ORB = 'eternal_orb',
  ANCIENT_ORB = 'ancient_orb',
  
  // 碎片通货
  EXALTED_SHARD = 'exalted_shard',
  MIRROR_SHARD = 'mirror_shard',
  DIVINE_SHARD = 'divine_shard',
  
  // 其他通货
  ORB_OF_FUSING = 'orb_of_fusing',
  ORB_OF_JEWELLERS = 'orb_of_jewellers',
  CHROMATIC_ORB = 'chromatic_orb',
  ORB_OF_CHANCE = 'orb_of_chance',
  ORB_OF_SCOURING = 'orb_of_scouring',
  ORB_OF_ALCHEMY = 'orb_of_alchemy',
  CHAOS_ORB = 'chaos_orb',
  REGAL_ORB = 'regal_orb',
  EXALTED_ORB = 'exalted_orb',
  DIVINE_ORB = 'divine_orb',
  MIRROR_OF_KALANDRA = 'mirror_of_kalandra'
}

// 通货配置接口
export interface CurrencyConfig {
  id: string;
  name: string;
  description: string;
  rarity: string;
  stackSize: number;
  value: number;
  sprite: string;
  soundEffect?: string;
  useEffect?: string;
}

// 通货颜色配置
export const CURRENCY_COLORS: Record<CurrencyRarity, number> = {
  [CurrencyRarity.COMMON]: 0xffffff,      // 白色
  [CurrencyRarity.UNCOMMON]: 0x6a9bd1,    // 蓝色
  [CurrencyRarity.RARE]: 0xf4d03f,        // 黄色
  [CurrencyRarity.EPIC]: 0x9b59b6,        // 紫色
  [CurrencyRarity.LEGENDARY]: 0xe67e22,   // 橙色
  [CurrencyRarity.MYTHIC]: 0xe74c3c       // 红色
};

// 所有通货配置
export const CURRENCY_CONFIGS: Record<CurrencyType, CurrencyConfig> = {
  [CurrencyType.ORB_OF_ALTERATION]: {
    id: 'orb_of_alteration',
    name: '改造石',
    description: '重新随机化普通物品的修饰符',
    rarity: 'common',
    stackSize: 20,
    value: 1,
    sprite: 'orb_of_alteration',
    soundEffect: 'orb_use',
    useEffect: 'alter_item_mods'
  },
  [CurrencyType.CHAOS_ORB]: {
    id: 'chaos_orb',
    name: '混沌石',
    description: '重新随机化稀有物品的所有修饰符',
    rarity: 'rare',
    stackSize: 10,
    value: 10,
    sprite: 'chaos_orb',
    soundEffect: 'orb_use',
    useEffect: 'reforge_rare_item'
  },
  [CurrencyType.EXALTED_ORB]: {
    id: 'exalted_orb',
    name: '崇高石',
    description: '添加一个新的随机修饰符到稀有物品',
    rarity: 'exalted',
    stackSize: 10,
    value: 100,
    sprite: 'exalted_orb',
    soundEffect: 'orb_use',
    useEffect: 'add_random_mod'
  },
  [CurrencyType.DIVINE_ORB]: {
    id: 'divine_orb',
    name: '神圣石',
    description: '重新随机化物品的修饰符数值',
    rarity: 'exalted',
    stackSize: 10,
    value: 50,
    sprite: 'divine_orb',
    soundEffect: 'orb_use',
    useEffect: 'reroll_mod_values'
  },
  [CurrencyType.MIRROR_OF_KALANDRA]: {
    id: 'mirror_of_kalandra',
    name: '卡兰德的魔镜',
    description: '复制一个物品',
    rarity: 'divine',
    stackSize: 1,
    value: 1000,
    sprite: 'mirror_of_kalandra',
    soundEffect: 'mirror_use',
    useEffect: 'mirror_item'
  },
  // ... 其他通货配置
};

// 通货掉落等级配置
export interface CurrencyDropTier {
  minLevel: number;
  maxLevel: number;
  currencies: Array<{
    type: CurrencyType;
    weight: number;
    minStack: number;
    maxStack: number;
  }>;
}

// 按等级分层的掉落配置
export const CURRENCY_DROP_TIERS: CurrencyDropTier[] = [
  // 1-10级区域
  {
    minLevel: 1,
    maxLevel: 10,
    currencies: [
      { type: CurrencyType.COPPER, weight: 40, minStack: 1, maxStack: 5 },
      { type: CurrencyType.SILVER, weight: 25, minStack: 1, maxStack: 3 },
      { type: CurrencyType.GOLD, weight: 15, minStack: 1, maxStack: 2 },
      { type: CurrencyType.WISDOM_SCROLL, weight: 12, minStack: 1, maxStack: 2 },
      { type: CurrencyType.PORTAL_SCROLL, weight: 8, minStack: 1, maxStack: 1 }
    ]
  },
  
  // 11-25级区域  
  {
    minLevel: 11,
    maxLevel: 25,
    currencies: [
      { type: CurrencyType.SILVER, weight: 30, minStack: 2, maxStack: 5 },
      { type: CurrencyType.GOLD, weight: 25, minStack: 1, maxStack: 3 },
      { type: CurrencyType.TRANSMUTATION_ORB, weight: 15, minStack: 1, maxStack: 2 },
      { type: CurrencyType.ENHANCEMENT_ORB, weight: 10, minStack: 1, maxStack: 1 },
      { type: CurrencyType.BLACKSMITH_WHETSTONE, weight: 8, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ARMOURER_SCRAP, weight: 8, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ALCHEMY_SHARD, weight: 4, minStack: 1, maxStack: 2 }
    ]
  },
  
  // 26-50级区域
  {
    minLevel: 26,
    maxLevel: 50,
    currencies: [
      { type: CurrencyType.GOLD, weight: 35, minStack: 2, maxStack: 5 },
      { type: CurrencyType.ALTERATION_ORB, weight: 15, minStack: 1, maxStack: 2 },
      { type: CurrencyType.ENHANCEMENT_ORB, weight: 12, minStack: 1, maxStack: 2 },
      { type: CurrencyType.BLESSED_ORB, weight: 8, minStack: 1, maxStack: 1 },
      { type: CurrencyType.CHAOS_ORB, weight: 5, minStack: 1, maxStack: 1 },
      { type: CurrencyType.REGAL_SHARD, weight: 6, minStack: 1, maxStack: 3 },
      { type: CurrencyType.FERTILE_CATALYST, weight: 4, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ESSENCE_OF_GREED, weight: 3, minStack: 1, maxStack: 1 }
    ]
  },
  
  // 51+级区域
  {
    minLevel: 51,
    maxLevel: 999,
    currencies: [
      { type: CurrencyType.GOLD, weight: 30, minStack: 3, maxStack: 8 },
      { type: CurrencyType.CHAOS_ORB, weight: 12, minStack: 1, maxStack: 2 },
      { type: CurrencyType.BLESSED_ORB, weight: 10, minStack: 1, maxStack: 2 },
      { type: CurrencyType.EXALTED_ORB, weight: 3, minStack: 1, maxStack: 1 },
      { type: CurrencyType.DIVINE_ORB, weight: 1, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ANCIENT_SHARD, weight: 5, minStack: 1, maxStack: 2 },
      { type: CurrencyType.ESSENCE_OF_HATRED, weight: 4, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ESSENCE_OF_WRATH, weight: 3, minStack: 1, maxStack: 1 },
      { type: CurrencyType.ESSENCE_OF_FEAR, weight: 1, minStack: 1, maxStack: 1 },
      { type: CurrencyType.UNSTABLE_CATALYST, weight: 2, minStack: 1, maxStack: 1 }
    ]
  }
]; 