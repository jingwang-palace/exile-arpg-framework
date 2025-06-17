import { CharacterAttributes } from './CharacterAttributes';
import { Equipment } from '../equipment/Equipment';
import { EquipmentSlot } from '../equipment/EquipmentSlot';
import { Skill } from '../skills/Skill';
import { Inventory } from '../inventory/Inventory';
import { Item } from '../items/Item';
import { ICalculatedStats } from '../../core/interfaces/ICalculatedStats';

export interface CharacterConfig {
  id: string;
  name: string;
  level: number;
  attributes: CharacterAttributes;
  experience?: number;
  gold?: number;
}

export class Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  gold: number;
  attributes: CharacterAttributes;
  equipment: Map<EquipmentSlot, Equipment>;
  skills: Map<string, Skill>;
  inventory: Inventory;
  private stats: ICalculatedStats;

  constructor(config: CharacterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.level = config.level;
    this.experience = config.experience || 0;
    this.gold = config.gold || 0;
    this.attributes = config.attributes;
    this.equipment = new Map();
    this.skills = new Map();
    this.inventory = new Inventory();
    this.stats = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10,
      armor: 0,
      damage: 0,
      criticalChance: 0,
      criticalDamage: 0,
      attackSpeed: 0,
      movementSpeed: 0
    };
  }

  levelUp(): void {
    this.level++;
    // 每级增加属性点
    this.attributes.addAttributePoints(5);
  }

  addExp(amount: number): void {
    this.experience += amount;
    // 检查是否可以升级
    const expNeeded = this.getExpNeededForNextLevel();
    if (this.experience >= expNeeded) {
      this.levelUp();
      this.experience -= expNeeded;
    }
  }

  getExpNeededForNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  addAttributePoint(attribute: keyof CharacterAttributes, amount: number): void {
    this.attributes.addAttributePoint(attribute, amount);
  }

  equip(item: Equipment): void {
    if (this.level < item.level) {
      throw new Error('角色等级不足，无法装备该物品');
    }
    this.equipment.set(item.slot, item);
  }

  unequip(slot: EquipmentSlot): void {
    this.equipment.delete(slot);
  }

  learnSkill(skill: Skill): void {
    if (this.level < skill.level) {
      throw new Error('角色等级不足，无法学习该技能');
    }
    this.skills.set(skill.id, skill);
  }

  upgradeSkill(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error('技能不存在');
    }
    skill.levelUp();
  }

  useSkill(skillId: string): number {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error('技能不存在');
    }
    return skill.calculateDamage(this.attributes);
  }

  getMaxHealth(): number {
    let health = this.attributes.vitality * 10;
    // 计算装备加成
    for (const equipment of this.equipment.values()) {
      health += equipment.attributes.health || 0;
    }
    // 计算技能加成
    for (const skill of this.skills.values()) {
      if (skill.effects?.healthMultiplier) {
        health *= skill.effects.healthMultiplier;
      }
    }
    return Math.floor(health);
  }

  getTotalDamage(): number {
    let damage = this.attributes.strength * 2;
    // 计算装备加成
    for (const equipment of this.equipment.values()) {
      damage += equipment.attributes.damage || 0;
    }
    return damage;
  }

  addItem(item: Item, count: number = 1): void {
    this.inventory.addItem(item, count);
  }

  getItemCount(itemId: string): number {
    return this.inventory.getItemCount(itemId);
  }

  craftEquipment(recipe: {
    id: string;
    name: string;
    materials: Record<string, number>;
    result: Equipment;
  }): Equipment | null {
    // 检查材料是否足够
    for (const [itemId, count] of Object.entries(recipe.materials)) {
      if (this.getItemCount(itemId) < count) {
        return null;
      }
    }

    // 消耗材料
    for (const [itemId, count] of Object.entries(recipe.materials)) {
      this.inventory.removeItem(itemId, count);
    }

    // 创建装备
    const equipment = new Equipment({
      ...recipe.result,
      id: `${recipe.id}_${Date.now()}`,
      level: 1
    });

    // 添加到装备栏
    this.equipment.set(equipment.slot, equipment);

    return equipment;
  }

  enhanceEquipment(equipmentId: string): Equipment | null {
    const equipment = Array.from(this.equipment.values()).find(e => e.id === equipmentId);
    if (!equipment) {
      return null;
    }

    // 检查强化材料
    const enhanceMaterialId = 'enhance-stone';
    if (this.getItemCount(enhanceMaterialId) < 1) {
      return null;
    }

    // 消耗强化材料
    this.inventory.removeItem(enhanceMaterialId, 1);

    // 强化装备
    equipment.level++;
    
    // 更新装备属性
    if (equipment.modifiers) {
      equipment.modifiers.forEach(modifier => {
        if (modifier.value) {
          modifier.value = Math.floor(modifier.value * 1.1);
        }
      });
    }

    // 更新装备需求
    if (equipment.levelRequirement) {
      equipment.levelRequirement = Math.floor(equipment.levelRequirement * 1.1);
    }

    return equipment;
  }

  getEquipment(equipmentId: string): Equipment | undefined {
    return this.equipment.get(equipmentId);
  }

  getStats(): ICalculatedStats {
    return { ...this.stats };
  }
} 