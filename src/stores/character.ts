import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { Character, CharacterClass } from '@/types/character'
import { 
  CLASS_BASE_ATTRIBUTES, 
  calculateDerivedAttributes, 
  calculateResistances 
} from '@/constants/characterTemplates'
import { STORAGE_KEYS } from '@/constants/storage'
import { inventoryService } from '@/services/InventoryService'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  // 状态
  const characters = ref<Character[]>([])
  const currentCharacterId = ref<string | null>(null)
  const deathCount = ref(0)
  
  // 计算属性
  const currentCharacter = computed(() => {
    if (!currentCharacterId.value) return null
    return characters.value.find(char => char.id === currentCharacterId.value) || null
  })
  
  // 从本地存储初始化
  function initializeFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEYS.CHARACTER)
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        characters.value = data.characters || []
        currentCharacterId.value = data.currentCharacterId || null
        deathCount.value = data.deathCount || 0
      } catch (e) {
        console.error('Failed to parse character data:', e)
      }
    }
  }
  
  // 创建新角色
  function createCharacter(name: string, characterClass: CharacterClass): Character {
    // 获取职业基础属性
    const baseAttributes = { ...CLASS_BASE_ATTRIBUTES[characterClass] }
    
    // 计算派生属性
    const derivedAttributes = calculateDerivedAttributes(baseAttributes, 1)
    
    // 计算抗性
    const resistances = calculateResistances(baseAttributes)
    
    // 创建初始背包
    const inventory = inventoryService.createInventory(30)
    
    // 创建新角色
    const newCharacter: Character = {
      id: uuidv4(),
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      baseAttributes,
      derivedAttributes,
      resistances,
      skillPoints: 0,
      ascendancyPoints: 0,
      passivePoints: 0,
      inventory,
      gold: 0,
      quests: {
        completed: [],
        active: []
      },
      created: Date.now(),
      lastPlayed: Date.now(),
      playTime: 0
    }
    
    // 添加到角色列表
    characters.value.push(newCharacter)
    return newCharacter
  }
  
  // 选择角色
  function selectCharacter(id: string) {
    const character = characters.value.find(char => char.id === id)
    if (character) {
      currentCharacterId.value = id
      character.lastPlayed = Date.now()
      return true
    }
    return false
  }
  
  // 删除角色
  function deleteCharacter(id: string) {
    const index = characters.value.findIndex(char => char.id === id)
    if (index !== -1) {
      characters.value.splice(index, 1)
      if (currentCharacterId.value === id) {
        currentCharacterId.value = characters.value.length > 0 ? characters.value[0].id : null
      }
      return true
    }
    return false
  }
  
  // 角色升级
  function levelUp() {
    if (!currentCharacter.value) return false
    
    currentCharacter.value.level += 1
    
    // 更新属性
    currentCharacter.value.baseAttributes.strength += 1
    currentCharacter.value.baseAttributes.dexterity += 1
    currentCharacter.value.baseAttributes.intelligence += 1
    currentCharacter.value.baseAttributes.vitality += 1
    
    // 重新计算派生属性
    currentCharacter.value.derivedAttributes = calculateDerivedAttributes(
      currentCharacter.value.baseAttributes, 
      currentCharacter.value.level
    )
    
    // 重新计算抗性
    currentCharacter.value.resistances = calculateResistances(
      currentCharacter.value.baseAttributes
    )
    
    // 恢复满生命值和魔法值
    currentCharacter.value.derivedAttributes.currentHealth = currentCharacter.value.derivedAttributes.maxHealth
    currentCharacter.value.derivedAttributes.currentMana = currentCharacter.value.derivedAttributes.maxMana
    
    // 增加技能点
    currentCharacter.value.skillPoints += 1
    currentCharacter.value.passivePoints += 1
    
    return true
  }
  
  // 添加经验
  function addExperience(amount: number) {
    if (!currentCharacter.value) return false
    
    currentCharacter.value.experience += amount
    
    // 检查是否可以升级
    const requiredExp = getRequiredExperience(currentCharacter.value.level)
    if (currentCharacter.value.experience >= requiredExp) {
      currentCharacter.value.experience -= requiredExp
      levelUp()
      return true
    }
    
    return false
  }
  
  // 计算升级所需经验
  function getRequiredExperience(level: number): number {
    // 经验公式：基础100点，每级增加20%
    return Math.floor(100 * Math.pow(1.2, level - 1))
  }
  
  return {
    characters,
    currentCharacter,
    deathCount,
    
    initializeFromStorage,
    createCharacter,
    selectCharacter,
    deleteCharacter,
    levelUp,
    addExperience,
    getRequiredExperience
  }
}, {
  persist: {
    key: STORAGE_KEYS.CHARACTER,
    paths: ['characters', 'currentCharacterId', 'deathCount']
  }
}) 