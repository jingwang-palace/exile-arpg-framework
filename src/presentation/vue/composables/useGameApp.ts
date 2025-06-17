import { computed, ref } from 'vue'
import { GameApplication } from '../../../application/GameApplication'
import { StateManager } from '../../../infrastructure/StateManager'
import { EventBus } from '../../../core/EventBus'

/**
 * 游戏应用组合式函数
 * 为Vue组件提供新架构的访问接口
 */
export function useGameApp() {
  const gameApp = GameApplication.getInstance()
  const stateManager = StateManager.getInstance()
  const eventBus = EventBus.getInstance()
  
  // 响应式状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const gameState = computed(() => stateManager.getState())
  const currentCharacter = computed(() => gameState.value.currentCharacter)
  const hasCharacter = computed(() => currentCharacter.value !== null)
  const characterLevel = computed(() => currentCharacter.value?.level ?? 0)
  const characterGold = computed(() => currentCharacter.value?.gold ?? 0)
  const unlockedFeatures = computed(() => gameState.value.progress.unlockedFeatures)
  
  // 角色管理
  const createCharacter = async (name: string, characterClass: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const character = await gameApp.createCharacter(name, characterClass as any)
      console.log(`✅ 角色创建成功: ${character.name}`)
      
      return character
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建角色失败'
      console.error('❌ 创建角色失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  const gainExperience = (amount: number) => {
    try {
      gameApp.gainExperience(amount)
      console.log(`📈 获得经验: ${amount}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获得经验失败'
      console.error('❌ 获得经验失败:', err)
    }
  }
  
  const levelUpCharacter = () => {
    try {
      gameApp.levelUpCharacter()
      console.log('🎉 角色升级成功')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '角色升级失败'
      console.error('❌ 角色升级失败:', err)
    }
  }
  
  // 战斗系统
  const startCombat = (enemyId: string) => {
    try {
      gameApp.startCombat(enemyId)
      console.log(`⚔️ 开始战斗: vs ${enemyId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始战斗失败'
      console.error('❌ 开始战斗失败:', err)
    }
  }
  
  const attackEnemy = (enemyId: string, skillId?: string) => {
    try {
      gameApp.attackEnemy(enemyId, skillId)
      console.log(`⚔️ 攻击敌人: ${enemyId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '攻击失败'
      console.error('❌ 攻击失败:', err)
    }
  }
  
  const useSkill = (skillId: string, targetId?: string) => {
    try {
      gameApp.useSkill(skillId, targetId)
      console.log(`🔮 使用技能: ${skillId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '使用技能失败'
      console.error('❌ 使用技能失败:', err)
    }
  }
  
  // 任务系统
  const acceptQuest = (questId: string) => {
    try {
      gameApp.acceptQuest(questId)
      console.log(`📝 接受任务: ${questId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '接受任务失败'
      console.error('❌ 接受任务失败:', err)
    }
  }
  
  const completeQuest = (questId: string) => {
    try {
      gameApp.completeQuest(questId)
      console.log(`🎉 完成任务: ${questId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '完成任务失败'
      console.error('❌ 完成任务失败:', err)
    }
  }
  
  const getAvailableQuests = () => {
    try {
      return gameApp.getAvailableQuests()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取任务失败'
      console.error('❌ 获取任务失败:', err)
      return []
    }
  }
  
  // 物品和装备
  const pickupItem = (itemId: string) => {
    try {
      gameApp.pickupItem(itemId)
      console.log(`📦 拾取物品: ${itemId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '拾取物品失败'
      console.error('❌ 拾取物品失败:', err)
    }
  }
  
  const equipItem = (itemId: string, slot: string) => {
    try {
      gameApp.equipItem(itemId, slot)
      console.log(`🛡️ 装备物品: ${itemId} 到 ${slot}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '装备物品失败'
      console.error('❌ 装备物品失败:', err)
    }
  }
  
  // 场景管理
  const changeScene = (sceneName: string) => {
    try {
      gameApp.changeScene(sceneName)
      console.log(`🎬 切换场景: ${sceneName}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '切换场景失败'
      console.error('❌ 切换场景失败:', err)
    }
  }
  
  const enterTown = () => {
    try {
      gameApp.enterTown()
      console.log('🏘️ 进入城镇')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '进入城镇失败'
      console.error('❌ 进入城镇失败:', err)
    }
  }
  
  const enterMap = (mapId: string) => {
    try {
      gameApp.enterMap(mapId)
      console.log(`🗺️ 进入地图: ${mapId}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '进入地图失败'
      console.error('❌ 进入地图失败:', err)
    }
  }
  
  // 游戏设置
  const updateSettings = (path: string, value: any) => {
    try {
      gameApp.updateSettings(path, value)
      console.log(`⚙️ 更新设置: ${path} = ${value}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新设置失败'
      console.error('❌ 更新设置失败:', err)
    }
  }
  
  const getSettings = () => {
    try {
      return gameApp.getSettings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取设置失败'
      console.error('❌ 获取设置失败:', err)
      return {}
    }
  }
  
  // 数据持久化
  const saveGame = async () => {
    try {
      isLoading.value = true
      await gameApp.saveGame()
      console.log('💾 游戏保存成功')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存游戏失败'
      console.error('❌ 保存游戏失败:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const loadGame = async () => {
    try {
      isLoading.value = true
      await gameApp.loadGame()
      console.log('📂 游戏加载成功')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载游戏失败'
      console.error('❌ 加载游戏失败:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const resetGame = () => {
    try {
      gameApp.resetGame()
      console.log('🔄 游戏重置成功')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置游戏失败'
      console.error('❌ 重置游戏失败:', err)
    }
  }
  
  // 事件监听
  const onEvent = (event: string, callback: Function) => {
    return eventBus.on(event as any, callback as any)
  }
  
  // 清除错误
  const clearError = () => {
    error.value = null
  }
  
  return {
    // 状态
    gameState,
    currentCharacter,
    hasCharacter,
    characterLevel,
    characterGold,
    unlockedFeatures,
    isLoading,
    error,
    
    // 角色管理
    createCharacter,
    gainExperience,
    levelUpCharacter,
    
    // 战斗系统
    startCombat,
    attackEnemy,
    useSkill,
    
    // 任务系统
    acceptQuest,
    completeQuest,
    getAvailableQuests,
    
    // 物品和装备
    pickupItem,
    equipItem,
    
    // 场景管理
    changeScene,
    enterTown,
    enterMap,
    
    // 游戏设置
    updateSettings,
    getSettings,
    
    // 数据持久化
    saveGame,
    loadGame,
    resetGame,
    
    // 工具函数
    onEvent,
    clearError
  }
} 