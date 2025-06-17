import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';
import { 
  EquipmentItem, 
  EquipmentSlot, 
  EquipmentQuality, 
  AttributeModifier, 
  AttributeType,
  DEFAULT_EQUIPMENT_CONFIG,
  WeaponItem,
  ArmorItem,
  AccessoryItem,
  SetBonus,
  JewelType,
  JewelEffect
} from '../../types/equipment';
import { FORBIDDEN_JEWEL_EFFECTS, SPECIAL_JEWEL_EFFECTS, NORMAL_JEWEL_EFFECTS } from '../../data/jewelEffects';
import { IEquipment } from '../../core/interfaces/IEquipment';
import { IAttributeModifier } from '../../core/interfaces/IAttributeModifier';
import { ICalculatedStats } from '../../core/interfaces/ICalculatedStats';

// 装备槽位状态
interface EquipmentSlots {
  [EquipmentSlot.HELMET]: EquipmentItem | null;
  [EquipmentSlot.CHEST]: EquipmentItem | null;
  [EquipmentSlot.GLOVES]: EquipmentItem | null;
  [EquipmentSlot.BOOTS]: EquipmentItem | null;
  [EquipmentSlot.WEAPON]: EquipmentItem | null;
  [EquipmentSlot.SHIELD]: EquipmentItem | null;
  [EquipmentSlot.AMULET]: EquipmentItem | null;
  [EquipmentSlot.RING1]: EquipmentItem | null;
  [EquipmentSlot.RING2]: EquipmentItem | null;
  [EquipmentSlot.BELT]: EquipmentItem | null;
  [EquipmentSlot.JEWEL]: EquipmentItem | null;
}

// 计算后的属性
interface CalculatedStats {
  // 基础属性
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  
  // 生命和魔力
  life: number;
  mana: number;
  
  // 防御
  armor: number;
  evasion: number;
  blockChance: number;
  
  // 攻击
  damage: { min: number; max: number };
  attackSpeed: number;
  criticalChance: number;
  criticalMultiplier: number;
  
  // 抗性
  fireResistance: number;
  coldResistance: number;
  lightningResistance: number;
  chaosResistance: number;
  
  // 特殊属性
  movementSpeed: number;
  itemFind: number;
  goldFind: number;
  experienceGain: number;
}

export class EquipmentSystem extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  
  // 装备槽位
  private equippedItems: Map<EquipmentSlot, IEquipment> = new Map();
  
  // 激活的珠宝效果
  private activeJewelEffects: Map<string, JewelEffect> = new Map();
  
  // 基础属性（未装备时）
  private baseStats: Partial<CalculatedStats> = {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    vitality: 10,
    life: 100,
    mana: 50,
    armor: 0,
    evasion: 10,
    blockChance: 0,
    attackSpeed: 1.0,
    criticalChance: 5,
    criticalMultiplier: 150,
    fireResistance: 0,
    coldResistance: 0,
    lightningResistance: 0,
    chaosResistance: 0,
    movementSpeed: 100,
    itemFind: 0,
    goldFind: 0,
    experienceGain: 0
  };
  
  // 套装效果
  private activeSets: Map<string, SetBonus> = new Map();
  private setItemCounts: Map<string, number> = new Map();
  
  // 计算后的最终属性
  private calculatedStats: CalculatedStats;
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    super();
    this.scene = scene;
    this.player = player;
    
    // 初始化计算后的属性
    this.calculatedStats = this.calculateTotalStats();
    
    console.log('装备系统初始化完成');
  }
  
  // 装备物品
  public equipItem(item: IEquipment): boolean {
    if (!this.canEquipItem(item)) {
      return false;
    }

    // 如果槽位已有装备，先卸下
    const currentItem = this.equippedItems.get(item.slot);
    if (currentItem) {
      this.unequipItem(item.slot);
    }

    // 装备新物品
    this.equippedItems.set(item.slot, item);
    this.scene.events.emit('itemEquipped', item);
    return true;
  }
  
  // 卸下装备
  public unequipItem(slot: EquipmentSlot): IEquipment | null {
    const item = this.equippedItems.get(slot);
    if (!item) {
      return null;
    }
    
    this.equippedItems.delete(slot);
    
    // 如果是珠宝，移除珠宝效果
    if (slot === EquipmentSlot.JEWEL && item.jewelType && item.jewelEffect) {
      this.removeJewelEffect(item as EquipmentItem);
    }
    
    // 更新套装计数
    this.updateSetCounts();
    
    // 重新计算属性
    this.calculatedStats = this.calculateTotalStats();
    
    // 发送卸装事件
    this.emit('itemUnequipped', {
      item: item,
      slot: slot,
      stats: this.calculatedStats
    });
    
    console.log(`卸下了 ${item.name}`);
    return item;
  }
  
  // 处理珠宝效果
  private handleJewelEffect(jewel: EquipmentItem): void {
    if (!jewel.jewelEffect) return;
    
    const effect = jewel.jewelEffect;
    
    // 根据珠宝类型处理效果
    switch (effect.type) {
      case JewelType.FORBIDDEN:
        // 处理禁断珠宝效果
        if (effect.stolenSkill) {
          this.activeJewelEffects.set(effect.stolenSkill, effect);
          console.log(`激活了禁断珠宝效果: ${effect.stolenSkill}`);
        }
        break;
        
      case JewelType.SPECIAL:
        // 处理特殊珠宝效果
        if (effect.uniqueMechanic) {
          this.activeJewelEffects.set(effect.uniqueMechanic.id, effect);
          effect.uniqueMechanic.effect();
          console.log(`激活了特殊珠宝效果: ${effect.uniqueMechanic.id}`);
        }
        break;
        
      case JewelType.NORMAL:
        // 处理普通珠宝效果
        if (effect.skillModifiers) {
          this.activeJewelEffects.set(jewel.id, effect);
          console.log(`激活了普通珠宝效果: ${jewel.id}`);
        }
        break;
    }
  }
  
  // 移除珠宝效果
  private removeJewelEffect(jewel: EquipmentItem): void {
    if (!jewel.jewelEffect) return;
    
    const effect = jewel.jewelEffect;
    
    // 根据珠宝类型移除效果
    switch (effect.type) {
      case JewelType.FORBIDDEN:
        if (effect.stolenSkill) {
          this.activeJewelEffects.delete(effect.stolenSkill);
          console.log(`移除了禁断珠宝效果: ${effect.stolenSkill}`);
        }
        break;
        
      case JewelType.SPECIAL:
        if (effect.uniqueMechanic) {
          this.activeJewelEffects.delete(effect.uniqueMechanic.id);
          console.log(`移除了特殊珠宝效果: ${effect.uniqueMechanic.id}`);
        }
        break;
        
      case JewelType.NORMAL:
        this.activeJewelEffects.delete(jewel.id);
        console.log(`移除了普通珠宝效果: ${jewel.id}`);
        break;
    }
  }
  
  // 获取激活的珠宝效果
  public getActiveJewelEffects(): Map<string, JewelEffect> {
    return new Map(this.activeJewelEffects);
  }
  
  // 检查是否激活了特定珠宝效果
  public hasJewelEffect(effectId: string): boolean {
    return this.activeJewelEffects.has(effectId);
  }
  
  // 检查装备需求
  private checkRequirements(item: EquipmentItem): boolean {
    // 这里应该检查玩家等级和属性需求
    // 暂时简化，只检查等级
    const playerLevel = (this.player as any).level || 1;
    
    if (playerLevel < item.levelRequirement) {
      return false;
    }
    
    // 检查属性需求
    if (item.strengthRequirement && this.calculatedStats.strength < item.strengthRequirement) {
      return false;
    }
    
    if (item.dexterityRequirement && this.calculatedStats.dexterity < item.dexterityRequirement) {
      return false;
    }
    
    if (item.intelligenceRequirement && this.calculatedStats.intelligence < item.intelligenceRequirement) {
      return false;
    }
    
    return true;
  }
  
  // 更新套装计数
  private updateSetCounts(): void {
    this.setItemCounts.clear();
    
    this.equippedItems.forEach((item, slot) => {
      if (item && item.isSet && item.setId) {
        const currentCount = this.setItemCounts.get(item.setId) || 0;
        this.setItemCounts.set(item.setId, currentCount + 1);
      }
    });
  }
  
  // 计算总属性
  private calculateTotalStats(): CalculatedStats {
    // 从基础属性开始
    const stats: CalculatedStats = {
      strength: this.baseStats.strength || 10,
      dexterity: this.baseStats.dexterity || 10,
      intelligence: this.baseStats.intelligence || 10,
      vitality: this.baseStats.vitality || 10,
      life: this.baseStats.life || 100,
      mana: this.baseStats.mana || 50,
      armor: this.baseStats.armor || 0,
      evasion: this.baseStats.evasion || 10,
      blockChance: this.baseStats.blockChance || 0,
      damage: { min: 1, max: 3 },
      attackSpeed: this.baseStats.attackSpeed || 1.0,
      criticalChance: this.baseStats.criticalChance || 5,
      criticalMultiplier: this.baseStats.criticalMultiplier || 150,
      fireResistance: this.baseStats.fireResistance || 0,
      coldResistance: this.baseStats.coldResistance || 0,
      lightningResistance: this.baseStats.lightningResistance || 0,
      chaosResistance: this.baseStats.chaosResistance || 0,
      movementSpeed: this.baseStats.movementSpeed || 100,
      itemFind: this.baseStats.itemFind || 0,
      goldFind: this.baseStats.goldFind || 0,
      experienceGain: this.baseStats.experienceGain || 0
    };
    
    // 应用装备修饰符
    this.equippedItems.forEach((item, slot) => {
      if (item) {
        this.applyItemModifiers(stats, item as EquipmentItem);
      }
    });
    
    // 应用套装效果
    this.applySetBonuses(stats);
    
    // 计算衍生属性
    this.calculateDerivedStats(stats);
    
    return stats;
  }
  
  // 应用单件装备的修饰符
  private applyItemModifiers(stats: CalculatedStats, item: EquipmentItem): void {
    item.modifiers.forEach(modifier => {
      this.applyModifier(stats, modifier);
    });
    
    // 如果是武器，应用武器特定属性
    if (item.slot === EquipmentSlot.WEAPON) {
      const weapon = item as WeaponItem;
      stats.damage.min += weapon.minDamage;
      stats.damage.max += weapon.maxDamage;
      stats.attackSpeed *= weapon.attackSpeed;
    }
    
    // 如果是防具，应用防具特定属性
    if ([EquipmentSlot.HELMET, EquipmentSlot.CHEST, EquipmentSlot.GLOVES, EquipmentSlot.BOOTS].includes(item.slot)) {
      const armor = item as ArmorItem;
      if (armor.armorValue) stats.armor += armor.armorValue;
      if (armor.evasionValue) stats.evasion += armor.evasionValue;
    }
  }
  
  // 应用单个修饰符
  private applyModifier(stats: CalculatedStats, modifier: AttributeModifier): void {
    const value = modifier.isPercentage ? 
      (this.getAttributeValue(modifier.type) * modifier.value / 100) : 
      modifier.value;

    switch (modifier.type) {
      case AttributeType.STRENGTH:
        stats.strength += value;
        break;
      case AttributeType.DEXTERITY:
        stats.dexterity += value;
        break;
      case AttributeType.INTELLIGENCE:
        stats.intelligence += value;
        break;
      case AttributeType.VITALITY:
        stats.vitality += value;
        break;
      case AttributeType.LIFE:
        stats.life += value;
        break;
      case AttributeType.MANA:
        stats.mana += value;
        break;
      case AttributeType.ARMOR:
        stats.armor += value;
        break;
      case AttributeType.DAMAGE:
        if (modifier.isPercentage) {
          stats.damage.min *= (1 + value / 100);
          stats.damage.max *= (1 + value / 100);
        } else {
          stats.damage.min += value;
          stats.damage.max += value;
        }
        break;
      case AttributeType.ATTACK_SPEED:
        stats.attackSpeed += value;
        break;
      case AttributeType.CRITICAL_CHANCE:
        stats.criticalChance += value;
        break;
      case AttributeType.FIRE_RESISTANCE:
        stats.fireResistance += value;
        break;
      case AttributeType.COLD_RESISTANCE:
        stats.coldResistance += value;
        break;
      case AttributeType.LIGHTNING_RESISTANCE:
        stats.lightningResistance += value;
        break;
      case AttributeType.CHAOS_RESISTANCE:
        stats.chaosResistance += value;
        break;
      case AttributeType.MOVEMENT_SPEED:
        stats.movementSpeed += value;
        break;
      case AttributeType.ITEM_FIND:
        stats.itemFind += value;
        break;
      case AttributeType.GOLD_FIND:
        stats.goldFind += value;
        break;
      case AttributeType.EXPERIENCE_GAIN:
        stats.experienceGain += value;
        break;
    }
  }
  
  // 应用套装效果
  private applySetBonuses(stats: CalculatedStats): void {
    this.setItemCounts.forEach((count, setId) => {
      const setBonus = this.activeSets.get(setId);
      if (setBonus && count >= setBonus.requiredPieces) {
        setBonus.bonusModifiers.forEach(modifier => {
          this.applyModifier(stats, modifier);
        });
      }
    });
  }
  
  // 计算衍生属性
  private calculateDerivedStats(stats: CalculatedStats): void {
    // 生命值基于体力
    const bonusLife = (stats.vitality - 10) * 5;
    stats.life += bonusLife;
    
    // 魔力基于智力
    const bonusMana = (stats.intelligence - 10) * 3;
    stats.mana += bonusMana;
    
    // 限制属性范围
    stats.criticalChance = Math.min(95, Math.max(0, stats.criticalChance));
    stats.blockChance = Math.min(75, Math.max(0, stats.blockChance));
    
    // 抗性限制
    stats.fireResistance = Math.min(75, Math.max(-100, stats.fireResistance));
    stats.coldResistance = Math.min(75, Math.max(-100, stats.coldResistance));
    stats.lightningResistance = Math.min(75, Math.max(-100, stats.lightningResistance));
    stats.chaosResistance = Math.min(75, Math.max(-100, stats.chaosResistance));
    
    // 攻击速度限制
    stats.attackSpeed = Math.max(0.1, stats.attackSpeed);
    
    // 移动速度限制
    stats.movementSpeed = Math.max(10, stats.movementSpeed);
  }
  
  // 获取装备的物品
  public getEquippedItem(slot: EquipmentSlot): IEquipment | null {
    return this.equippedItems.get(slot) || null;
  }
  
  // 获取所有装备
  public getAllEquippedItems(): EquipmentSlots {
    const slots: EquipmentSlots = {
      [EquipmentSlot.HELMET]: null,
      [EquipmentSlot.CHEST]: null,
      [EquipmentSlot.GLOVES]: null,
      [EquipmentSlot.BOOTS]: null,
      [EquipmentSlot.WEAPON]: null,
      [EquipmentSlot.SHIELD]: null,
      [EquipmentSlot.AMULET]: null,
      [EquipmentSlot.RING1]: null,
      [EquipmentSlot.RING2]: null,
      [EquipmentSlot.BELT]: null,
      [EquipmentSlot.JEWEL]: null
    };
    
    this.equippedItems.forEach((item, slot) => {
      slots[slot] = item as EquipmentItem;
    });
    
    return slots;
  }
  
  // 获取计算后的属性
  public getCalculatedStats(): ICalculatedStats {
    const stats: ICalculatedStats = {
      strength: this.player.strength,
      dexterity: this.player.dexterity,
      intelligence: this.player.intelligence,
      vitality: this.player.vitality,
      armor: 0,
      damage: 0,
      criticalChance: 0,
      criticalDamage: 0,
      attackSpeed: 0,
      movementSpeed: 0
    };

    // 计算装备加成
    for (const item of this.equippedItems.values()) {
      for (const modifier of item.modifiers) {
        this.applyModifier(stats, modifier);
      }
    }

    return stats;
  }
  
  // 获取基础属性
  public getBaseStats(): Partial<CalculatedStats> {
    return { ...this.baseStats };
  }
  
  // 设置基础属性
  public setBaseStats(newBaseStats: Partial<CalculatedStats>): void {
    this.baseStats = { ...this.baseStats, ...newBaseStats };
    this.calculatedStats = this.calculateTotalStats();
    
    this.emit('statsChanged', this.calculatedStats);
  }
  
  // 获取装备槽位是否为空
  public isSlotEmpty(slot: EquipmentSlot): boolean {
    return !this.equippedItems.has(slot);
  }
  
  // 获取装备总分
  public getEquipmentScore(): number {
    let totalScore = 0;
    
    this.equippedItems.forEach((item, slot) => {
      if (item) {
        // 基础分数基于品质
        let itemScore = 0;
        switch (item.quality) {
          case EquipmentQuality.NORMAL: itemScore = 10; break;
          case EquipmentQuality.MAGIC: itemScore = 25; break;
          case EquipmentQuality.RARE: itemScore = 50; break;
          case EquipmentQuality.UNIQUE: itemScore = 100; break;
          case EquipmentQuality.SET: itemScore = 150; break;
          case EquipmentQuality.DIVINE: itemScore = 300; break;
        }
        
        // 修饰符数量加分
        itemScore += item.modifiers.length * 5;
        
        // 等级需求加分
        itemScore += item.levelRequirement * 2;
        
        totalScore += itemScore;
      }
    });
    
    return totalScore;
  }
  
  // 销毁系统
  public destroy(): void {
    this.removeAllListeners();
    console.log('装备系统已销毁');
  }

  private getAttributeValue(type: AttributeType): number {
    switch (type) {
      case AttributeType.STRENGTH:
        return this.player.strength;
      case AttributeType.DEXTERITY:
        return this.player.dexterity;
      case AttributeType.INTELLIGENCE:
        return this.player.intelligence;
      case AttributeType.VITALITY:
        return this.player.vitality;
      default:
        return 0;
    }
  }

  private canEquipItem(item: IEquipment): boolean {
    // 检查等级要求
    if (this.player.level < item.levelRequirement) {
      return false;
    }

    // 检查属性要求
    for (const modifier of item.modifiers) {
      if (modifier.requirement) {
        const attribute = this.getAttributeValue(modifier.requirement.type);
        if (attribute < modifier.requirement.value) {
          return false;
        }
      }
    }

    return true;
  }
} 