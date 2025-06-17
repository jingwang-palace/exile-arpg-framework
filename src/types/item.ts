// 物品基础类型
export enum ItemType {
  EQUIPMENT = 'equipment',     // 装备
  CURRENCY = 'currency',      // 通货
  CONSUMABLE = 'consumable',  // 消耗品
  MATERIAL = 'material',      // 材料
  QUEST = 'quest',           // 任务物品
  GEM = 'gem'                // 宝石
}

// 物品品质
export enum ItemRarity {
  NORMAL = 'normal',         // 普通
  MAGIC = 'magic',          // 魔法
  RARE = 'rare',            // 稀有
  UNIQUE = 'unique',        // 暗金
  SET = 'set',              // 套装
  DIVINE = 'divine'         // 神圣
}

// 物品基础接口
export interface BaseItem {
  id: string;               // 物品ID
  name: string;             // 物品名称
  description: string;      // 物品描述
  type: ItemType;          // 物品类型
  rarity: ItemRarity;      // 物品品质
  level: number;           // 需求等级
  stackSize: number;       // 最大堆叠数量
  value: number;           // 基础价值
  icon: string;            // 图标资源
  model?: string;          // 3D模型资源
  soundEffects?: {         // 音效
    pickup: string;        // 拾取音效
    use: string;          // 使用音效
    drop: string;         // 丢弃音效
  };
  tags: string[];          // 物品标签
  isIdentified: boolean;   // 是否已鉴定
  isTradeable: boolean;    // 是否可交易
  isDroppable: boolean;    // 是否可丢弃
  isQuestItem: boolean;    // 是否任务物品
}

// 物品修饰符
export interface Mod {
  id: string;              // 修饰符ID
  type: ModType;          // 修饰符类型
  value: number;          // 修饰符数值
  tier: number;           // 修饰符等级
  isPrefix: boolean;      // 是否前缀
  isImplicit: boolean;    // 是否隐式
  isCrafted: boolean;     // 是否制作
  isEnchanted: boolean;   // 是否附魔
}

// 修饰符类型
export enum ModType {
  // 基础属性
  STRENGTH = 'strength',           // 力量
  DEXTERITY = 'dexterity',         // 敏捷
  INTELLIGENCE = 'intelligence',   // 智力
  VITALITY = 'vitality',           // 活力
  
  // 生命相关
  LIFE = 'life',                   // 生命
  LIFE_REGEN = 'life_regen',       // 生命回复
  LIFE_LEECH = 'life_leech',       // 生命偷取
  
  // 能量相关
  MANA = 'mana',                   // 魔法
  MANA_REGEN = 'mana_regen',       // 魔法回复
  MANA_LEECH = 'mana_leech',       // 魔法偷取
  
  // 防御相关
  ARMOR = 'armor',                 // 护甲
  EVASION = 'evasion',             // 闪避
  BLOCK = 'block',                 // 格挡
  RESISTANCE = 'resistance',       // 抗性
  
  // 伤害相关
  DAMAGE = 'damage',               // 伤害
  ATTACK_SPEED = 'attack_speed',   // 攻击速度
  CRIT_CHANCE = 'crit_chance',     // 暴击率
  CRIT_MULTIPLIER = 'crit_multiplier', // 暴击伤害
  
  // 特殊属性
  MOVEMENT_SPEED = 'movement_speed', // 移动速度
  ITEM_FIND = 'item_find',         // 物品发现
  GOLD_FIND = 'gold_find',         // 金币发现
  EXPERIENCE_GAIN = 'experience_gain' // 经验获取
}

// 物品堆叠
export interface ItemStack {
  item: BaseItem;          // 物品
  quantity: number;        // 数量
  quality?: number;        // 品质（0-20）
  durability?: number;     // 耐久度
  maxDurability?: number;  // 最大耐久度
  mods?: Mod[];           // 修饰符
}

// 物品栏槽位
export interface InventorySlot {
  id: string;             // 槽位ID
  type: ItemType[];       // 允许的物品类型
  isLocked: boolean;      // 是否锁定
  stack?: ItemStack;      // 物品堆叠
}

// 物品栏
export interface Inventory {
  id: string;             // 物品栏ID
  name: string;           // 物品栏名称
  size: number;           // 大小
  slots: InventorySlot[]; // 槽位
  isLocked: boolean;      // 是否锁定
  isShared: boolean;      // 是否共享
}

// 物品栏管理器
export interface InventoryManager {
  // 物品栏操作
  addItem(item: BaseItem, quantity: number): boolean;
  removeItem(itemId: string, quantity: number): boolean;
  moveItem(fromSlot: string, toSlot: string, quantity: number): boolean;
  splitStack(fromSlot: string, toSlot: string, quantity: number): boolean;
  mergeStacks(fromSlot: string, toSlot: string): boolean;
  
  // 物品栏查询
  getItem(itemId: string): ItemStack | undefined;
  getItemCount(itemId: string): number;
  hasItem(itemId: string, quantity: number): boolean;
  getEmptySlots(): InventorySlot[];
  getSlotsByType(type: ItemType): InventorySlot[];
  
  // 物品栏管理
  lockSlot(slotId: string): void;
  unlockSlot(slotId: string): void;
  lockInventory(): void;
  unlockInventory(): void;
  
  // 物品栏事件
  onItemAdded: (item: ItemStack) => void;
  onItemRemoved: (item: ItemStack) => void;
  onItemMoved: (fromSlot: string, toSlot: string, item: ItemStack) => void;
  onInventoryChanged: () => void;
}

// 装备槽位
export enum EquipmentSlot {
  WEAPON = 'weapon',
  HEAD = 'head',
  CHEST = 'chest',
  LEGS = 'legs',
  FEET = 'feet',
  HANDS = 'hands',
  RING = 'ring',
  NECKLACE = 'necklace'
}

// 添加装备基础属性接口
export interface EquipmentBase {
  type: ItemType
  slot: EquipmentSlot
  baseAttributes: {
    [key: string]: [number, number] // [最小值, 最大值]
  }
  implicitMods?: Mod[]
}

// 消耗品接口
export interface Consumable extends BaseItem {
  effects: {
    type: string
    value: number
    duration?: number
  }[]
}

// 物品掉落接口
export interface ItemDrop {
  itemId: string
  chance: number  // 0-1 之间的概率
  minQuantity?: number
  maxQuantity?: number
} 