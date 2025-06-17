import { EventBus } from '../../core/EventBus'
import type { Quest } from '../../types/quest'

/**
 * 任务领域服务
 * 处理所有任务相关的业务逻辑
 */
export class QuestDomain {
  private eventBus: EventBus
  private activeQuests: Map<string, Quest> = new Map()
  private completedQuests: Set<string> = new Set()
  
  constructor() {
    this.eventBus = EventBus.getInstance()
  }
  
  /**
   * 初始化角色的任务系统
   */
  public initializeCharacterQuests(characterId: string): void {
    console.log(`📋 初始化角色任务系统: ${characterId}`)
    
    // 加载角色的活跃任务和已完成任务
    // TODO: 从存储中加载任务数据
    
    // 检查是否有新的可用任务
    this.checkNewAvailableQuests(characterId)
  }
  
  /**
   * 接受任务
   */
  public acceptQuest(characterId: string, questId: string): boolean {
    console.log(`📝 接受任务: ${questId}`)
    
    const quest = this.createQuestInstance(questId)
    if (!quest) {
      console.error(`任务不存在: ${questId}`)
      return false
    }
    
    this.activeQuests.set(questId, quest)
    
    this.eventBus.emit('quest:started', {
      characterId,
      questId
    })
    
    console.log(`✅ 任务已接受: ${quest.name}`)
    return true
  }
  
  /**
   * 更新任务进度
   */
  public updateQuestProgress(characterId: string, questId: string, progressType: string, amount: number = 1): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    // 根据任务类型更新进度
    let progressUpdated = false
    
    switch (progressType) {
      case 'kill_monster':
        if (quest.type === 'kill') {
          this.updateKillProgress(quest, amount)
          progressUpdated = true
        }
        break
        
      case 'collect_item':
        if (quest.type === 'collect') {
          this.updateCollectionProgress(quest, amount)
          progressUpdated = true
        }
        break
        
      case 'reach_location':
        if (quest.type === 'explore') {
          this.updateLocationProgress(quest)
          progressUpdated = true
        }
        break
    }
    
    if (progressUpdated) {
      this.eventBus.emit('quest:progressUpdated', {
        characterId,
        questId,
        progress: quest.objectives[0]?.current || 0
      })
      
      // 检查任务是否完成
      this.checkQuestCompletion(characterId, questId)
    }
  }
  
  /**
   * 完成任务
   */
  public completeQuest(characterId: string, questId: string): QuestReward | null {
    const quest = this.activeQuests.get(questId)
    if (!quest) {
      console.error(`任务不存在或未激活: ${questId}`)
      return null
    }
    
    // 检查任务是否真的完成了
    if (!this.isQuestCompleted(quest)) {
      console.error(`任务未完成: ${questId}`)
      return null
    }
    
    // 移动到已完成列表
    this.activeQuests.delete(questId)
    this.completedQuests.add(questId)
    
    // 发送完成事件
    this.eventBus.emit('quest:completed', {
      characterId,
      questId
    })
    
    console.log(`🎉 任务完成: ${quest.name}`)
    
    // 返回奖励
    return {
      experience: quest.rewards.exp || 0,
      gold: quest.rewards.gold || 0,
      items: (quest.rewards.items || []).map(item => ({
        itemId: item.id,
        quantity: item.count
      })),
      talentPoints: this.calculateTalentPointReward(quest),
      unlockFeatures: this.getUnlockFeatures(quest)
    }
  }
  
  /**
   * 获取角色的可用任务
   */
  public getAvailableQuests(characterId: string): Quest[] {
    return this.generateAvailableQuests(characterId)
  }
  
  /**
   * 获取角色的活跃任务
   */
  public getActiveQuests(characterId: string): Quest[] {
    return Array.from(this.activeQuests.values())
  }
  
  /**
   * 获取角色的已完成任务
   */
  public getCompletedQuests(characterId: string): string[] {
    return Array.from(this.completedQuests)
  }
  
  /**
   * 检查是否有新的可用任务
   */
  private checkNewAvailableQuests(characterId: string): void {
    console.log(`🔍 检查新任务...`)
  }
  
  /**
   * 创建任务实例
   */
  private createQuestInstance(questId: string): Quest | null {
    return {
      id: questId,
      type: 'story',
      title: '新手教程',
      description: '击败5只怪物',
      status: 'available',
      progress: {
        current: 0,
        required: 5
      },
      rewards: {
        experience: 100,
        gold: 50
      }
    }
  }
  
  /**
   * 更新击杀进度
   */
  private updateKillProgress(quest: Quest, amount: number): void {
    if (!quest.progress) return
    quest.progress.current = Math.min(quest.progress.current + amount, quest.progress.required)
    console.log(`⚔️ 击杀进度: ${quest.progress.current}/${quest.progress.required}`)
  }
  
  /**
   * 更新收集进度
   */
  private updateCollectionProgress(quest: Quest, amount: number): void {
    if (!quest.progress) return
    quest.progress.current = Math.min(quest.progress.current + amount, quest.progress.required)
    console.log(`📦 收集进度: ${quest.progress.current}/${quest.progress.required}`)
  }
  
  /**
   * 更新位置进度
   */
  private updateLocationProgress(quest: Quest): void {
    if (!quest.progress) return
    quest.progress.current = quest.progress.required
    console.log(`📍 到达目标位置`)
  }
  
  /**
   * 更新技能使用进度
   */
  private updateSkillProgress(quest: Quest, amount: number): void {
    if (!quest.progress) return
    quest.progress.current = Math.min(quest.progress.current + amount, quest.progress.required)
    console.log(`🔮 技能使用进度: ${quest.progress.current}/${quest.progress.required}`)
  }
  
  /**
   * 检查任务完成
   */
  private checkQuestCompletion(characterId: string, questId: string): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    if (this.isQuestCompleted(quest)) {
      quest.status = 'completed'
      console.log(`✅ 任务可以完成: ${quest.title}`)
    }
  }
  
  /**
   * 检查任务是否完成
   */
  private isQuestCompleted(quest: Quest): boolean {
    if (!quest.progress) return false
    return quest.progress.current >= quest.progress.required
  }
  
  /**
   * 计算天赋点奖励
   */
  private calculateTalentPointReward(quest: Quest): number {
    if (quest.type === 'story') return 1
    if (quest.type === 'challenge') return 2
    return 0
  }
  
  /**
   * 获取解锁功能
   */
  private getUnlockFeatures(quest: Quest): string[] {
    return []
  }
  
  /**
   * 生成可用任务
   */
  private generateAvailableQuests(characterId: string): Quest[] {
    return []
  }
}

// 任务奖励接口
export interface QuestReward {
  experience: number
  gold: number
  items: Array<{
    itemId: string
    quantity: number
  }>
  talentPoints: number
  unlockFeatures: string[]
} 