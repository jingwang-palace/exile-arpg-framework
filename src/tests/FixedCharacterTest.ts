import { Character } from '../game/character/Character';
import { CharacterAttributes } from '../game/character/CharacterAttributes';
import { EquipmentItem, EquipmentSlot, AttributeType, ModifierType } from '../types/equipment';
import { Item, ItemType } from '../game/items/Item';
import { Skill } from '../game/skills/Skill';
import { Equipment } from '../game/equipment/Equipment';
import { TestResult } from './types/TestResult';

export class FixedCharacterTest {
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // 测试角色属性系统
      results.push(await this.testCharacterAttributes());
      
      // 测试装备系统
      results.push(await this.testEquipmentSystem());
      
      // 测试技能系统
      results.push(await this.testSkillSystem());
      
      // 测试装备制作
      results.push(await this.testEquipmentCrafting());

      return results;
    } catch (error) {
      console.error('角色系统测试过程中发生错误:', error);
      throw error;
    }
  }

  private async testCharacterAttributes(): Promise<TestResult> {
    try {
      const character = new Character({
        id: 'test-character',
        name: '测试角色',
        level: 1,
        attributes: new CharacterAttributes({
          strength: 10,
          dexterity: 10,
          intelligence: 10,
          vitality: 10
        })
      });

      // 测试基础属性
      if (character.attributes.strength !== 10) {
        throw new Error('基础属性设置不正确');
      }

      // 测试等级提升
      character.levelUp();
      if (character.level !== 2) {
        throw new Error('等级提升不正确');
      }

      return {
        name: '角色属性系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '角色属性系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
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

      // 测试装备创建 - 使用Equipment类
      const weapon = new Equipment({
        id: 'test-weapon',
        name: '测试武器',
        slot: EquipmentSlot.WEAPON,
        level: 1,
        attributes: {
          damage: 10
        }
      });

      // 测试装备穿戴
      character.equip(weapon);
      if (!character.equipment.get(EquipmentSlot.WEAPON)) {
        throw new Error('装备穿戴失败');
      }

      // 测试装备卸下
      character.unequip(EquipmentSlot.WEAPON);
      if (character.equipment.get(EquipmentSlot.WEAPON)) {
        throw new Error('装备卸下失败');
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

  private async testSkillSystem(): Promise<TestResult> {
    try {
      const character = new Character({
        id: 'test-character',
        name: '测试角色',
        level: 1,
        attributes: new CharacterAttributes()
      });

      // 测试技能创建
      const skill = new Skill({
        id: 'test-skill',
        name: '测试技能',
        level: 1,
        damage: 20,
        cooldown: 5,
        manaCost: 10
      });

      // 测试技能学习
      character.learnSkill(skill);
      if (!character.skills.has(skill.id)) {
        throw new Error('技能学习失败');
      }

      return {
        name: '技能系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '技能系统测试',
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

      // 测试装备制作
      const recipe = {
        id: 'iron-sword',
        name: '铁剑',
        materials: {
          'iron-ore': 3
        },
        result: new Equipment({
          id: 'iron-sword',
          name: '铁剑',
          slot: EquipmentSlot.WEAPON,
          level: 1,
          attributes: {
            damage: 15
          }
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