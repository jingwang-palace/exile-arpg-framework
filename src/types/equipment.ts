// 装备系统类型定义

// 装备部位枚举
export enum EquipmentSlot {
  HELMET = 'helmet',
  CHEST = 'chest',
  GLOVES = 'gloves',
  BOOTS = 'boots',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  AMULET = 'amulet',
  RING1 = 'ring1',
  RING2 = 'ring2',
  BELT = 'belt',
  JEWEL = 'jewel'
}

// 装备品质枚举
export enum EquipmentQuality {
  NORMAL = 'normal',
  MAGIC = 'magic',
  RARE = 'rare',
  UNIQUE = 'unique',
  LEGENDARY = 'legendary'
}

// 属性类型枚举
export enum AttributeType {
  STRENGTH = 'strength',
  DEXTERITY = 'dexterity',
  INTELLIGENCE = 'intelligence',
  VITALITY = 'vitality',
  ARMOR = 'armor',
  DAMAGE = 'damage',
  CRITICAL_CHANCE = 'criticalChance',
  CRITICAL_DAMAGE = 'criticalDamage',
  ATTACK_SPEED = 'attackSpeed',
  MOVEMENT_SPEED = 'movementSpeed'
}

// 属性修饰符类型
export enum ModifierType {
  FLAT = 'flat',           // 固定值
  PERCENTAGE = 'percentage', // 百分比
  MULTIPLIER = 'multiplier'  // 乘数
}

// 属性修饰符
export interface AttributeModifier {
  type: ModifierType;
  attribute: string;
  value: number;
  tier?: number;        // 词缀等级
  isImplicit?: boolean; // 是否为固有词缀
}

// 珠宝类型
export enum JewelType {
  NORMAL = 'normal',     // 普通珠宝
  FORBIDDEN = 'forbidden', // 禁断珠宝
  SPECIAL = 'special'    // 特殊珠宝
}

// 珠宝效果
export interface JewelEffect {
  type: JewelType;
  stolenSkill?: string;  // 偷取的技能/特性
  skillModifiers?: {     // 技能修饰符
    skillId: string;
    modifiers: AttributeModifier[];
  }[];
  uniqueMechanic?: {     // 独特机制
    id: string;
    description: string;
    effect: () => void;
  };
}

// 装备基础接口
export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  quality: EquipmentQuality;
  
  // 等级需求
  levelRequirement: number;
  strengthRequirement?: number;
  dexterityRequirement?: number;
  intelligenceRequirement?: number;
  
  // 属性修饰符
  modifiers: AttributeModifier[];
  
  // 珠宝特有属性
  jewelType?: JewelType;
  jewelEffect?: JewelEffect;
  
  // 耐久度系统
  durability?: number;
  maxDurability?: number;
  
  // 价值
  value: number;
  
  // 图标
  iconTexture?: string;
  iconColor?: number;
}

// 武器特定属性
export interface WeaponItem extends EquipmentItem {
  slot: EquipmentSlot.WEAPON;
  weaponType: WeaponType;
  minDamage: number;
  maxDamage: number;
  attackSpeed: number;
  range?: number;
}

// 武器类型枚举
export enum WeaponType {
  SWORD = 'sword',
  AXE = 'axe',
  MACE = 'mace',
  DAGGER = 'dagger',
  STAFF = 'staff',
  BOW = 'bow',
  WAND = 'wand'
}

// 防具特定属性
export interface ArmorItem extends EquipmentItem {
  slot: EquipmentSlot.HELMET | EquipmentSlot.CHEST | EquipmentSlot.GLOVES | EquipmentSlot.BOOTS;
  armorType: ArmorType;
  armorValue?: number;
  evasionValue?: number;
  energyShieldValue?: number;
}

// 防具类型枚举
export enum ArmorType {
  CLOTH = 'cloth',
  LEATHER = 'leather',
  MAIL = 'mail',
  PLATE = 'plate'
}

// 饰品特定属性
export interface AccessoryItem extends EquipmentItem {
  slot: EquipmentSlot.AMULET | EquipmentSlot.RING1 | EquipmentSlot.RING2 | EquipmentSlot.BELT;
  accessoryType: AccessoryType;
  implicitModifiers: AttributeModifier[];
}

// 饰品类型枚举
export enum AccessoryType {
  AMULET = 'amulet',
  RING = 'ring',
  BELT = 'belt'
}

// 珠宝特有属性
export interface JewelItem extends EquipmentItem {
  jewelType: JewelType;
  jewelEffect: JewelEffect;
  radius: number;  // 影响范围
}

// 装备配置
export interface EquipmentConfig {
  // 品质颜色配置
  qualityColors: Record<EquipmentQuality, number>;
  
  // 默认装备数据
  startingEquipment: Record<string, EquipmentItem[]>;
  
  // 随机生成配置
  randomGeneration: {
    baseChances: Record<EquipmentQuality, number>;
    modifierRanges: Record<AttributeType, { min: number; max: number }>;
  };
  
  // 耐久度配置
  durabilitySettings: {
    enabled: boolean;
    degradationRate: number;
    repairCostMultiplier: number;
  };
}

// 默认装备配置
export const DEFAULT_EQUIPMENT_CONFIG: EquipmentConfig = {
  qualityColors: {
    [EquipmentQuality.NORMAL]: 0xffffff,
    [EquipmentQuality.MAGIC]: 0x4fc3f7,
    [EquipmentQuality.RARE]: 0xfdd835,
    [EquipmentQuality.UNIQUE]: 0xff8f00,
    [EquipmentQuality.LEGENDARY]: 0xe91e63
  },
  
  startingEquipment: {
    marauder: [
      {
        id: 'starter_sword',
        name: '新手剑',
        description: '一把基础的铁剑',
        slot: EquipmentSlot.WEAPON,
        quality: EquipmentQuality.NORMAL,
        levelRequirement: 1,
        modifiers: [
          {
            type: AttributeType.DAMAGE,
            value: 15,
            isPercentage: false,
            description: '+15 伤害'
          }
        ],
        value: 50,
        iconColor: 0x8e8e93
      }
    ]
  },
  
  randomGeneration: {
    baseChances: {
      [EquipmentQuality.NORMAL]: 0.6,
      [EquipmentQuality.MAGIC]: 0.25,
      [EquipmentQuality.RARE]: 0.1,
      [EquipmentQuality.UNIQUE]: 0.04,
      [EquipmentQuality.LEGENDARY]: 0.002
    },
    modifierRanges: {
      // 基础属性
      [AttributeType.STRENGTH]: { min: 5, max: 30 },
      [AttributeType.DEXTERITY]: { min: 5, max: 30 },
      [AttributeType.INTELLIGENCE]: { min: 5, max: 30 },
      [AttributeType.VITALITY]: { min: 5, max: 30 },
      
      // 生命和魔力
      [AttributeType.ARMOR]: { min: 10, max: 150 },
      [AttributeType.DAMAGE]: { min: 5, max: 50 },
      [AttributeType.ATTACK_SPEED]: { min: 5, max: 25 },
      [AttributeType.MOVEMENT_SPEED]: { min: 5, max: 20 },
      
      // 防御属性
      [AttributeType.EVASION]: { min: 10, max: 100 },
      [AttributeType.CRITICAL_CHANCE]: { min: 2, max: 12 },
      [AttributeType.CRITICAL_DAMAGE]: { min: 10, max: 50 },
      
      // 抗性
      [AttributeType.ARMOR]: { min: 10, max: 150 },
      
      // 特殊属性
      [AttributeType.ITEM_FIND]: { min: 10, max: 50 },
      [AttributeType.GOLD_FIND]: { min: 20, max: 100 },
      [AttributeType.EXPERIENCE_GAIN]: { min: 10, max: 30 }
    }
  },
  
  durabilitySettings: {
    enabled: true,
    degradationRate: 0.01,
    repairCostMultiplier: 0.1
  }
};

// 装备模板数据
export const EQUIPMENT_TEMPLATES = {
  weapons: {
    swords: [
      {
        id: 'iron_sword',
        name: '铁剑',
        baseType: WeaponType.SWORD,
        levelRequirement: 5,
        baseDamage: { min: 8, max: 15 },
        attackSpeed: 1.2
      },
      {
        id: 'steel_sword',  
        name: '钢剑',
        baseType: WeaponType.SWORD,
        levelRequirement: 15,
        baseDamage: { min: 20, max: 35 },
        attackSpeed: 1.3
      }
    ],
    axes: [
      {
        id: 'hand_axe',
        name: '手斧',
        baseType: WeaponType.AXE,
        levelRequirement: 8,
        baseDamage: { min: 12, max: 20 },
        attackSpeed: 1.0
      }
    ]
  },
  
  armor: {
    helmets: [
      {
        id: 'leather_cap',
        name: '皮帽',
        baseType: ArmorType.LEATHER,
        levelRequirement: 3,
        baseArmor: 8,
        baseEvasion: 15
      },
      {
        id: 'iron_helmet',
        name: '铁盔',
        baseType: ArmorType.MAIL,
        levelRequirement: 12,
        baseArmor: 25,
        baseEvasion: 5
      }
    ],
    chests: [
      {
        id: 'leather_armor',
        name: '皮甲',
        baseType: ArmorType.LEATHER,
        levelRequirement: 5,
        baseArmor: 20,
        baseEvasion: 30
      }
    ]
  },
  
  accessories: [
    {
      id: 'iron_ring',
      name: '铁戒指',
      baseType: AccessoryType.RING,
      levelRequirement: 1
    },
    {
      id: 'leather_belt',
      name: '皮带',
      baseType: AccessoryType.BELT,
      levelRequirement: 1
    }
  ]
};

export interface EquipmentSlots {
  [EquipmentSlot.HELMET]: any;
  [EquipmentSlot.CHEST]: any;
  [EquipmentSlot.GLOVES]: any;
  [EquipmentSlot.BOOTS]: any;
  [EquipmentSlot.WEAPON]: any;
  [EquipmentSlot.SHIELD]: any;
  [EquipmentSlot.AMULET]: any;
  [EquipmentSlot.RING1]: any;
  [EquipmentSlot.RING2]: any;
  [EquipmentSlot.BELT]: any;
  [EquipmentSlot.JEWEL]: any;
} 