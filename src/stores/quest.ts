import { defineStore } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { STORAGE_KEYS } from '@/constants/storage'
import type { Quest } from '@/types/quest'
import questConfigs from '@/i18n/locales/zh/quests'

interface QuestProgress extends Quest {
  status: 'available' | 'inProgress' | 'completed' | 'finished'
  lastCompletedAt?: number
}

interface QuestState {
  quests: QuestProgress[]
  activeQuests: Record<string, QuestProgress>
}

export const useQuestStore = defineStore('quest', {
  state: (): QuestState => ({
    quests: Object.values(questConfigs).map(quest => ({
      ...quest,
      status: 'available',
      objectives: quest.objectives.map(obj => ({
        ...obj,
        current: 0
      }))
    })) as QuestProgress[],
    activeQuests: {}
  }),

  getters: {
    availableQuests: (state) => state.quests.filter(q => q.status === 'available'),
    activeQuestList: (state) => state.quests.filter(q => q.status === 'inProgress'),
    completedQuests: (state) => state.quests.filter(q => q.status === 'completed')
  },

  actions: {
    acceptQuest(questId: string) {
      const questIndex = this.quests.findIndex(q => q.id === questId)
      if (questIndex === -1 || this.quests[questIndex].status !== 'available') {
        console.log('Quest not available:', questId)
        return false
      }

      const quest = this.quests[questIndex]
      
      // 检查任务要求
      const characterStore = useCharacterStore()
      const character = characterStore.currentCharacter
      
      if (quest.requirements.level && character?.level < quest.requirements.level) {
        console.log('Character level too low for quest')
        return false
      }

      // 创建新的任务进度对象并更新状态
      const activeQuest = {
        ...quest,
        status: 'inProgress',
        objectives: quest.objectives.map(obj => ({
          ...obj,
          current: 0
        }))
      }

      // 更新状态
      this.quests[questIndex] = { ...activeQuest }
      this.activeQuests = {
        ...this.activeQuests,
        [questId]: activeQuest
      }

      console.log('Quest accepted:', activeQuest)
      console.log('Updated quests:', this.quests)
      console.log('Updated activeQuests:', this.activeQuests)
      return true
    },

    updateQuestProgress(targetId: string, progressType: 'kill' | 'collect' | 'explore' = 'kill') {
      console.log('Updating quest progress:', { targetId, progressType })
      
      const updatedActiveQuests = { ...this.activeQuests }
      let stateChanged = false

      Object.entries(this.activeQuests).forEach(([questId, quest]) => {
        if (quest.type !== progressType) return

        const updatedQuest = { ...quest }
        updatedQuest.objectives = quest.objectives.map(obj => {
          if (obj.target === targetId && (obj.current || 0) < obj.count) {
            return {
              ...obj,
              current: (obj.current || 0) + 1
            }
          }
          return obj
        })

        // 检查是否完成
        if (updatedQuest.objectives.every(obj => (obj.current || 0) >= obj.count)) {
          updatedQuest.status = 'completed'
          this.onQuestCompleted(questId)
        }

        updatedActiveQuests[questId] = updatedQuest
        stateChanged = true

        // 同步更新主任务列表
        const questIndex = this.quests.findIndex(q => q.id === questId)
        if (questIndex !== -1) {
          this.quests[questIndex] = { ...updatedQuest }
        }
      })

      if (stateChanged) {
        this.activeQuests = updatedActiveQuests
      }
    },

    onQuestCompleted(questId: string) {
      const quest = this.activeQuests[questId]
      if (!quest || quest.status !== 'completed') return

      console.log('Quest completed:', questId)
      
      const characterStore = useCharacterStore()
      
      // 发放奖励
      if (quest.rewards) {
        characterStore.gainExperience(quest.rewards.exp)
        characterStore.gainGold(quest.rewards.gold)
        
        if (quest.rewards.items) {
          quest.rewards.items.forEach(item => {
            characterStore.addItem(item.id, item.count)
          })
        }
      }

      // 更新主任务列表
      const questIndex = this.quests.findIndex(q => q.id === questId)
      if (questIndex !== -1) {
        if (quest.repeatable) {
          this.quests[questIndex] = {
            ...quest,
            status: 'available',
            objectives: quest.objectives.map(obj => ({
              ...obj,
              current: 0
            }))
          }
        } else {
          this.quests[questIndex] = {
            ...quest,
            status: 'finished'
          }
        }
      }

      // 从活动任务中移除
      const { [questId]: _, ...remainingQuests } = this.activeQuests
      this.activeQuests = remainingQuests
    },

    canAcceptQuest(questId: string): boolean {
      const quest = this.quests.find(q => q.id === questId)
      if (!quest || quest.status !== 'available') return false

      const characterStore = useCharacterStore()
      const character = characterStore.currentCharacter
      
      // 检查等级要求
      if (quest.requirements.level && character?.level < quest.requirements.level) {
        return false
      }

      // 检查前置任务
      if (quest.requirements.prevQuests) {
        const hasCompletedPrereqs = quest.requirements.prevQuests.every(preQuestId => {
          const preQuest = this.quests.find(q => q.id === preQuestId)
          return preQuest?.status === 'finished'
        })
        if (!hasCompletedPrereqs) return false
      }

      // 检查重置时间
      if (quest.resetType && quest.lastCompletedAt) {
        const now = Date.now()
        const resetInterval = quest.resetType === 'daily' ? 86400000 : 604800000 // 日常/周常的毫秒数
        if (now - quest.lastCompletedAt < resetInterval) {
          return false
        }
      }

      return true
    },

    completeQuest(questId: string) {
      const quest = this.activeQuests[questId]
      if (!quest || quest.status !== 'completed') return

      // 发放奖励
      const characterStore = useCharacterStore()
      if (quest.rewards) {
        characterStore.gainExperience(quest.rewards.exp)
        characterStore.gainGold(quest.rewards.gold)
        
        if (quest.rewards.items) {
          quest.rewards.items.forEach(item => {
            characterStore.addItem(item.id, item.count)
          })
        }
      }

      // 更新任务状态
      const questIndex = this.quests.findIndex(q => q.id === questId)
      if (questIndex !== -1) {
        const now = Date.now()
        if (quest.repeatable) {
          this.quests[questIndex] = {
            ...quest,
            status: 'available',
            lastCompletedAt: now,
            objectives: quest.objectives.map(obj => ({
              ...obj,
              current: 0
            }))
          }
        } else {
          this.quests[questIndex] = {
            ...quest,
            status: 'finished',
            lastCompletedAt: now
          }
        }
      }

      // 从活动任务中移除
      const { [questId]: _, ...remainingQuests } = this.activeQuests
      this.activeQuests = remainingQuests
    },

    resetQuests() {
      const now = Date.now()
      this.quests = this.quests.map(quest => {
        if (!quest.repeatable || !quest.lastCompletedAt) return quest

        const resetInterval = quest.resetType === 'daily' ? 86400000 : 604800000
        if (now - quest.lastCompletedAt >= resetInterval) {
          return {
            ...quest,
            status: 'available',
            objectives: quest.objectives.map(obj => ({
              ...obj,
              current: 0
            }))
          }
        }
        return quest
      })
    }
  },

  persist: {
    key: STORAGE_KEYS.QUEST,
    paths: ['quests', 'activeQuests']
  }
}) 