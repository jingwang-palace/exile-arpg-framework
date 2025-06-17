import { Character } from '../game/character/Character';
import { CharacterAttributes } from '../game/character/CharacterAttributes';
import { EquipmentItem, EquipmentSlot, AttributeType, ModifierType } from '../types/equipment';
import { ItemType } from '../game/types/item';
import { Item } from '../game/items/Item';
import { TestResult } from './types/TestResult';
import { Equipment } from '../game/equipment/Equipment';

export class TestEquipment {
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // 测试装备系统
      results.push(await this.testEquipmentSystem());
      
      // 测试装备制作
      results.push(await this.testEquipmentCrafting());

      return results;
    } catch (error) {
      console.error('装备系统测试过程中发生错误:', error);
      throw error;
    }
  }

  private async testEquipmentSystem(): Promise<TestResult> {
    try {
      const character = new Character({
        id: 'test-character',
        name: '测试角色',
        level: 1,
        attributes: new CharacterAttributes()
      });

      // 测试装备创建
      const weapon = new Equipment({
        id: 'test-weapon',
        name: '测试武器',
        description: '测试用武器',
        slot: EquipmentSlot.WEAPON,
        quality: 'normal',
        levelRequirement: 1,
        modifiers: [{
          type: ModifierType.FLAT,
          attribute: AttributeType.DAMAGE,
          value: 10
        }],
        value: 100
      });

      // 测试装备穿戴
      character.equip(weapon);
      if (!character.equipment.get(EquipmentSlot.WEAPON)) {
        throw new Error('装备穿戴失败');
      }

      // 测试装备属性加成
      if (character.getTotalDamage() !== 10) {
        throw new Error('装备属性加成计算错误');
      }

      // 测试装备卸下
      character.unequip(EquipmentSlot.WEAPON);
      if (character.equipment.get(EquipmentSlot.WEAPON)) {
        throw new Error('装备卸下失败');
      }

      // 测试等级限制
      const highLevelWeapon = new Equipment({
        id: 'high-level-weapon',
        name: '高级武器',
        description: '高级测试用武器',
        slot: EquipmentSlot.WEAPON,
        quality: 'normal',
        levelRequirement: 10,
        modifiers: [{
          type: ModifierType.FLAT,
          attribute: AttributeType.DAMAGE,
          value: 50
        }],
        value: 1000
      });

      try {
        character.equip(highLevelWeapon);
        throw new Error('应该无法装备等级不足的装备');
      } catch (error) {
        // 预期抛出错误
      }

      return {
        name: '装备系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '装备系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testEquipmentCrafting(): Promise<TestResult> {
    try {
      const character = new Character({
        id: 'test-character',
        name: '测试角色',
        level: 1,
        attributes: new CharacterAttributes()
      });

      // 测试材料收集
      character.addItem(new Item({
        id: 'iron-ore',
        name: '铁矿石',
        type: ItemType.MATERIAL,
        level: 1,
        stackable: true,
        maxStack: 100
      }), 5);
      character.addItem(new Item({
        id: 'wood',
        name: '木材',
        type: ItemType.MATERIAL,
        level: 1,
        stackable: true,
        maxStack: 100
      }), 3);

      // 测试装备制作
      const recipe = {
        id: 'iron-sword',
        name: '铁剑',
        materials: {
          'iron-ore': 3,
          'wood': 2
        },
        result: new Equipment({
          id: 'iron-sword',
          name: '铁剑',
          description: '一把普通的铁剑',
          slot: EquipmentSlot.WEAPON,
          quality: 'normal',
          levelRequirement: 1,
          modifiers: [{
            type: ModifierType.FLAT,
            attribute: AttributeType.DAMAGE,
            value: 15
          }],
          value: 100
        })
      };

      const crafted = character.craftEquipment(recipe);
      if (!crafted) {
        throw new Error('装备制作失败');
      }

      // 测试材料消耗
      if (character.getItemCount('iron-ore') !== 2) {
        throw new Error('材料消耗计算错误');
      }

      // 测试装备强化
      character.addItem(new Item({
        id: 'enhance-stone',
        name: '强化石',
        type: ItemType.MATERIAL,
        level: 1,
        stackable: true,
        maxStack: 100
      }), 1);

      const enhanced = character.enhanceEquipment(crafted.id);
      if (!enhanced) {
        throw new Error('装备强化失败');
      }

      // 验证强化后的属性
      if (enhanced.level !== 2) {
        throw new Error('装备等级未正确提升');
      }

      if (!enhanced.modifiers || enhanced.modifiers[0].value !== 17) {
        throw new Error('装备属性未正确提升');
      }

      return {
        name: '装备制作测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '装备制作测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
} 