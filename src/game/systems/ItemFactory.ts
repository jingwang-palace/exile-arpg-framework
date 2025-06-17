import { 
  BaseItem, 
  ItemType, 
  ItemRarity, 
  Mod, 
  ModType,
  ItemStack
} from '../../types/item';
import { CurrencyType } from '../../types/currency';
import { EQUIPMENT_TEMPLATES } from '../../configs/equipment/bases';
import { CURRENCY_CONFIGS } from '../../types/currency';

export class ItemFactory {
  private static instance: ItemFactory;
  
  private constructor() {}
  
  public static getInstance(): ItemFactory {
    if (!ItemFactory.instance) {
      ItemFactory.instance = new ItemFactory();
    }
    return ItemFactory.instance;
  }
  
  // 创建装备
  public createEquipment(templateId: string, level: number, rarity: ItemRarity = ItemRarity.NORMAL): BaseItem {
    const template = this.findEquipmentTemplate(templateId);
    if (!template) {
      throw new Error(`Equipment template not found: ${templateId}`);
    }
    
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      type: ItemType.EQUIPMENT,
      rarity,
      level,
      stackSize: 1,
      value: this.calculateEquipmentValue(template, level, rarity),
      icon: template.icon || 'default_equipment',
      model: template.model,
      soundEffects: template.soundEffects,
      tags: template.tags || [],
      isIdentified: rarity === ItemRarity.NORMAL,
      isTradeable: true,
      isDroppable: true,
      isQuestItem: false
    };
  }
  
  // 创建通货
  public createCurrency(type: CurrencyType, quantity: number = 1): BaseItem {
    const config = CURRENCY_CONFIGS[type];
    if (!config) {
      throw new Error(`Currency config not found: ${type}`);
    }
    
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      type: ItemType.CURRENCY,
      rarity: config.rarity,
      level: 1,
      stackSize: config.stackSize,
      value: config.value,
      icon: config.sprite,
      soundEffects: {
        pickup: config.soundEffect || 'default_pickup',
        use: 'default_use',
        drop: 'default_drop'
      },
      tags: ['currency'],
      isIdentified: true,
      isTradeable: true,
      isDroppable: true,
      isQuestItem: false
    };
  }
  
  // 创建消耗品
  public createConsumable(templateId: string, level: number): BaseItem {
    // TODO: 实现消耗品模板系统
    return {
      id: templateId,
      name: '消耗品',
      description: '这是一个消耗品',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.NORMAL,
      level,
      stackSize: 20,
      value: 10,
      icon: 'default_consumable',
      tags: ['consumable'],
      isIdentified: true,
      isTradeable: true,
      isDroppable: true,
      isQuestItem: false
    };
  }
  
  // 创建材料
  public createMaterial(templateId: string, level: number): BaseItem {
    // TODO: 实现材料模板系统
    return {
      id: templateId,
      name: '材料',
      description: '这是一个材料',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.NORMAL,
      level,
      stackSize: 100,
      value: 5,
      icon: 'default_material',
      tags: ['material'],
      isIdentified: true,
      isTradeable: true,
      isDroppable: true,
      isQuestItem: false
    };
  }
  
  // 创建任务物品
  public createQuestItem(templateId: string): BaseItem {
    // TODO: 实现任务物品模板系统
    return {
      id: templateId,
      name: '任务物品',
      description: '这是一个任务物品',
      type: ItemType.QUEST,
      rarity: ItemRarity.UNIQUE,
      level: 1,
      stackSize: 1,
      value: 0,
      icon: 'default_quest',
      tags: ['quest'],
      isIdentified: true,
      isTradeable: false,
      isDroppable: false,
      isQuestItem: true
    };
  }
  
  // 创建宝石
  public createGem(templateId: string, level: number): BaseItem {
    // TODO: 实现宝石模板系统
    return {
      id: templateId,
      name: '宝石',
      description: '这是一个宝石',
      type: ItemType.GEM,
      rarity: ItemRarity.MAGIC,
      level,
      stackSize: 1,
      value: 50,
      icon: 'default_gem',
      tags: ['gem'],
      isIdentified: true,
      isTradeable: true,
      isDroppable: true,
      isQuestItem: false
    };
  }
  
  // 创建随机修饰符
  public createRandomMods(rarity: ItemRarity, itemLevel: number): Mod[] {
    const mods: Mod[] = [];
    const modCount = this.getModCountByRarity(rarity);
    
    for (let i = 0; i < modCount; i++) {
      const mod = this.createRandomMod(itemLevel);
      if (mod) {
        mods.push(mod);
      }
    }
    
    return mods;
  }
  
  // 创建随机修饰符
  private createRandomMod(itemLevel: number): Mod | null {
    // TODO: 实现修饰符权重系统
    const modTypes = Object.values(ModType);
    const randomType = modTypes[Math.floor(Math.random() * modTypes.length)];
    
    return {
      id: `mod_${randomType}_${Math.random().toString(36).substr(2, 9)}`,
      type: randomType as ModType,
      value: Math.floor(Math.random() * 10) + 1,
      tier: Math.floor(Math.random() * 5) + 1,
      isPrefix: Math.random() > 0.5,
      isImplicit: false,
      isCrafted: false,
      isEnchanted: false
    };
  }
  
  // 根据品质获取修饰符数量
  private getModCountByRarity(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.NORMAL:
        return 0;
      case ItemRarity.MAGIC:
        return Math.floor(Math.random() * 2) + 1; // 1-2个
      case ItemRarity.RARE:
        return Math.floor(Math.random() * 4) + 3; // 3-6个
      case ItemRarity.UNIQUE:
        return Math.floor(Math.random() * 3) + 4; // 4-6个
      case ItemRarity.SET:
        return Math.floor(Math.random() * 2) + 5; // 5-6个
      case ItemRarity.DIVINE:
        return 6; // 固定6个
      default:
        return 0;
    }
  }
  
  // 查找装备模板
  private findEquipmentTemplate(templateId: string): any {
    // 在武器模板中查找
    for (const category of Object.values(EQUIPMENT_TEMPLATES.weapons)) {
      const template = category.find((t: any) => t.id === templateId);
      if (template) return template;
    }
    
    // 在防具模板中查找
    for (const category of Object.values(EQUIPMENT_TEMPLATES.armor)) {
      const template = category.find((t: any) => t.id === templateId);
      if (template) return template;
    }
    
    // 在饰品模板中查找
    const accessoryTemplate = EQUIPMENT_TEMPLATES.accessories.find((t: any) => t.id === templateId);
    if (accessoryTemplate) return accessoryTemplate;
    
    return null;
  }
  
  // 计算装备价值
  private calculateEquipmentValue(template: any, level: number, rarity: ItemRarity): number {
    let baseValue = template.baseValue || 10;
    
    // 根据等级调整
    baseValue *= (1 + level * 0.1);
    
    // 根据品质调整
    switch (rarity) {
      case ItemRarity.NORMAL:
        baseValue *= 1;
        break;
      case ItemRarity.MAGIC:
        baseValue *= 2;
        break;
      case ItemRarity.RARE:
        baseValue *= 5;
        break;
      case ItemRarity.UNIQUE:
        baseValue *= 10;
        break;
      case ItemRarity.SET:
        baseValue *= 8;
        break;
      case ItemRarity.DIVINE:
        baseValue *= 20;
        break;
    }
    
    return Math.floor(baseValue);
  }
  
  // 创建物品堆叠
  public createItemStack(item: BaseItem, quantity: number = 1): ItemStack {
    return {
      item,
      quantity: Math.min(quantity, item.stackSize),
      quality: item.type === ItemType.EQUIPMENT ? 0 : undefined,
      durability: item.type === ItemType.EQUIPMENT ? 100 : undefined,
      maxDurability: item.type === ItemType.EQUIPMENT ? 100 : undefined,
      mods: item.type === ItemType.EQUIPMENT ? this.createRandomMods(item.rarity, item.level) : undefined
    };
  }
} 