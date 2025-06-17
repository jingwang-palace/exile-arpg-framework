import { CharacterClass, Character } from '../types/character';
import { Inventory, InventorySlot } from '../types/inventory';

// 存储键
const SAVE_KEY_CHARACTERS = 'poe_characters';
const SAVE_KEY_SETTINGS = 'poe_settings';

// 创建默认背包格子
function createDefaultInventorySlots(size: number): InventorySlot[] {
  const slots: InventorySlot[] = [];
  for (let i = 0; i < size; i++) {
    slots.push({
      id: `slot_${i}`,
      itemId: null,
      quantity: 0
    });
  }
  return slots;
}

// 默认角色数据
const DEFAULT_CHARACTERS: Character[] = [
  {
    id: '1',
    name: '默认战士',
    class: CharacterClass.Marauder,
    level: 1,
    experience: 0,
    baseAttributes: {
      strength: 15,
      dexterity: 8,
      intelligence: 5,
      vitality: 12
    },
    derivedAttributes: {
      maxHealth: 120,
      currentHealth: 120,
      maxMana: 50,
      currentMana: 50,
      maxEnergy: 30,
      currentEnergy: 30,
      physicalDamage: 15,
      elementalDamage: 5,
      chaosDamage: 0,
      attackSpeed: 1.0,
      castSpeed: 0.8,
      criticalChance: 5,
      criticalMultiplier: 150,
      armor: 20,
      evasion: 10,
      energyShield: 5,
      blockChance: 10,
      movementSpeed: 100,
      lifeRegeneration: 1.5,
      manaRegeneration: 0.8
    },
    resistances: {
      fireResistance: 0,
      coldResistance: 0,
      lightningResistance: 0,
      chaosResistance: 0
    },
    skillPoints: 0,
    ascendancyPoints: 0,
    passivePoints: 0,
    inventory: {
      slots: createDefaultInventorySlots(30),
      gold: 50,
      size: 30
    },
    gold: 50,
    quests: {
      completed: [],
      active: []
    },
    created: Date.now(),
    lastPlayed: Date.now(),
    playTime: 0
  }
];

/**
 * 游戏存档管理器
 */
export default class SaveManager {
  /**
   * 获取所有保存的角色
   */
  static getCharacters(): Character[] {
    try {
      const savedData = localStorage.getItem(SAVE_KEY_CHARACTERS);
      if (!savedData) {
        return [];
      }
      return JSON.parse(savedData);
    } catch (error) {
      console.error('读取角色数据失败:', error);
      return [];
    }
  }

  /**
   * 获取角色数据
   * 如果没有保存的角色，则返回默认角色
   */
  static getCharactersOrDefault(): Character[] {
    const characters = this.getCharacters();
    return characters.length > 0 ? characters : DEFAULT_CHARACTERS;
  }

  /**
   * 保存角色数据
   */
  static saveCharacter(character: Character): boolean {
    try {
      // 获取现有角色
      const characters = this.getCharacters();
      
      // 检查是否已存在该角色
      const existingIndex = characters.findIndex(c => c.id === character.id);
      
      if (existingIndex >= 0) {
        // 更新现有角色
        characters[existingIndex] = character;
      } else {
        // 添加新角色
        characters.push(character);
      }
      
      // 保存角色数据
      localStorage.setItem(SAVE_KEY_CHARACTERS, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('保存角色数据失败:', error);
      return false;
    }
  }

  /**
   * 创建新角色
   */
  static createCharacter(name: string, characterClass: CharacterClass): Character {
    const newId = Date.now().toString();
    
    // 基于职业类型设置初始属性
    let baseAttributes = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10
    };
    
    switch (characterClass) {
      case CharacterClass.Marauder: // 野蛮人
        baseAttributes = {
          strength: 16,
          dexterity: 7,
          intelligence: 6,
          vitality: 14
        };
        break;
      case CharacterClass.Ranger: // 游侠
        baseAttributes = {
          strength: 8,
          dexterity: 16,
          intelligence: 10,
          vitality: 9
        };
        break;
      case CharacterClass.Witch: // 女巫
        baseAttributes = {
          strength: 6,
          dexterity: 8,
          intelligence: 18,
          vitality: 8
        };
        break;
      // 可以添加更多职业的初始属性
    }
    
    // 计算衍生属性
    const maxHealth = baseAttributes.vitality * 10;
    const maxMana = baseAttributes.intelligence * 5;
    
    const newCharacter: Character = {
      id: newId,
      name: name,
      class: characterClass,
      level: 1,
      experience: 0,
      baseAttributes: baseAttributes,
      derivedAttributes: {
        maxHealth: maxHealth,
        currentHealth: maxHealth,
        maxMana: maxMana,
        currentMana: maxMana,
        maxEnergy: 30,
        currentEnergy: 30,
        physicalDamage: baseAttributes.strength,
        elementalDamage: baseAttributes.intelligence * 0.5,
        chaosDamage: 0,
        attackSpeed: 1.0,
        castSpeed: 0.8 + (baseAttributes.dexterity * 0.01),
        criticalChance: 5,
        criticalMultiplier: 150,
        armor: baseAttributes.strength * 1.5,
        evasion: baseAttributes.dexterity * 1.5,
        energyShield: baseAttributes.intelligence,
        blockChance: 5,
        movementSpeed: 100,
        lifeRegeneration: baseAttributes.vitality * 0.1,
        manaRegeneration: baseAttributes.intelligence * 0.05
      },
      resistances: {
        fireResistance: 0,
        coldResistance: 0,
        lightningResistance: 0,
        chaosResistance: 0
      },
      skillPoints: 0,
      ascendancyPoints: 0,
      passivePoints: 0,
      inventory: {
        slots: createDefaultInventorySlots(30),
        gold: 50,
        size: 30
      },
      gold: 50,
      quests: {
        completed: [],
        active: []
      },
      created: Date.now(),
      lastPlayed: Date.now(),
      playTime: 0
    };
    
    return newCharacter;
  }
  
  /**
   * 删除角色
   */
  static deleteCharacter(characterId: string): boolean {
    try {
      const characters = this.getCharacters();
      const filteredCharacters = characters.filter(c => c.id !== characterId);
      
      if (characters.length === filteredCharacters.length) {
        return false; // 没有找到要删除的角色
      }
      
      localStorage.setItem(SAVE_KEY_CHARACTERS, JSON.stringify(filteredCharacters));
      return true;
    } catch (error) {
      console.error('删除角色失败:', error);
      return false;
    }
  }
} 