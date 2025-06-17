import { EventBus } from '../../core/EventBus'
import { StateManager } from '../../infrastructure/StateManager'

// 任务类型枚举
export enum QuestType {
  MAIN = 'main',           // 主线任务
  SIDE = 'side',           // 支线任务
  DAILY = 'daily',         // 每日任务
  WEEKLY = 'weekly',       // 每周任务
  ACHIEVEMENT = 'achievement', // 成就任务
  TUTORIAL = 'tutorial',   // 教程任务
  EVENT = 'event'          // 活动任务
}

// 任务状态枚举
export enum QuestStatus {
  LOCKED = 'locked',       // 未解锁
  AVAILABLE = 'available', // 可接取
  ACTIVE = 'active',       // 进行中
  COMPLETED = 'completed', // 已完成
  TURNED_IN = 'turned_in', // 已提交
  FAILED = 'failed',       // 已失败
  EXPIRED = 'expired'      // 已过期
}

// 任务目标类型
export enum QuestObjectiveType {
  KILL_ENEMIES = 'kill_enemies',     // 击杀敌人
  COLLECT_ITEMS = 'collect_items',   // 收集物品
  REACH_LOCATION = 'reach_location', // 到达地点
  USE_SKILL = 'use_skill',           // 使用技能
  CRAFT_ITEMS = 'craft_items',       // 制作物品
  GAIN_EXPERIENCE = 'gain_experience', // 获得经验
  LEVEL_UP = 'level_up',             // 升级
  COMPLETE_QUEST = 'complete_quest', // 完成其他任务
  INTERACT_NPC = 'interact_npc',     // 与NPC交互
  SURVIVE_TIME = 'survive_time'      // 生存时间
}

// 任务目标接口
export interface QuestObjective {
  id: string
  type: QuestObjectiveType
  target: string | number      // 目标值（敌人ID、物品ID、位置等）
  required: number             // 需要数量
  current: number              // 当前进度
  description: string          // 目标描述
  completed: boolean           // 是否完成
  optional: boolean            // 是否可选
  hidden: boolean              // 是否隐藏
}

// 任务奖励接口
export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'skill_point' | 'talent_point' | 'currency'
  value: string | number       // 奖励值或物品ID
  amount: number               // 数量
  description: string          // 奖励描述
}

// 任务条件接口
export interface QuestRequirement {
  type: 'level' | 'quest' | 'item' | 'class' | 'stat'
  value: string | number
  description: string
}

// 任务接口
export interface Quest {
  id: string
  name: string
  description: string
  type: QuestType
  status: QuestStatus
  
  // 任务内容
  objectives: QuestObjective[]
  rewards: QuestReward[]
  requirements: QuestRequirement[]
  
  // 时间相关
  startTime?: number
  completeTime?: number
  expireTime?: number
  duration?: number            // 持续时间（毫秒）
  
  // 任务属性
  level: number                // 推荐等级
  priority: number             // 优先级
  repeatable: boolean          // 可重复
  autoComplete: boolean        // 自动完成
  autoAccept: boolean          // 自动接受
  
  // UI相关
  icon?: string
  color?: string
  category?: string
  
  // 关联数据
  nextQuestId?: string         // 后续任务
  questChainId?: string        // 任务链ID
  location?: string            // 任务地点
  npcId?: string              // 任务NPC
}

// 任务事件类型
export interface QuestEvents {
  'quest:available': { quest: Quest }
  'quest:accepted': { quest: Quest }
  'quest:completed': { quest: Quest }
  'quest:failed': { quest: Quest }
  'quest:expired': { quest: Quest }
  'quest:turned_in': { quest: Quest; rewards: QuestReward[] }
  'quest:objective_updated': { quest: Quest; objective: QuestObjective }
  'quest:progress_updated': { quest: Quest; progress: number }
}

/**
 * 任务系统
 * 负责管理游戏中的所有任务
 */
export class QuestSystem {
  private static instance: QuestSystem
  
  private eventBus: EventBus
  private stateManager: StateManager
  
  // 任务数据
  private questTemplates: Map<string, Quest> = new Map()
  private activeQuests: Map<string, Quest> = new Map()
  private completedQuests: Set<string> = new Set()
  private failedQuests: Set<string> = new Set()
  
  // 任务计时器
  private questTimers: Map<string, NodeJS.Timeout> = new Map()
  
  // 配置
  private config = {
    maxActiveQuests: 20,
    autoSaveInterval: 30000,    // 30秒自动保存
    maxQuestHistory: 100,       // 最大任务历史记录
    enableNotifications: true   // 启用通知
  }

  private constructor() {
    this.eventBus = EventBus.getInstance()
    this.stateManager = StateManager.getInstance()
    
    this.initializeSystem()
  }

  static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem()
    }
    return QuestSystem.instance
  }

  private initializeSystem(): void {
    // 注册事件监听器
    this.setupEventListeners()
    
    // 加载任务模板
    this.loadQuestTemplates()
    
    // 恢复任务状态
    this.loadQuestState()
    
    // 启动定时器
    this.startAutoSave()
    
    console.log('🎯 任务系统初始化完成')
  }

  private setupEventListeners(): void {
    // 监听游戏事件，更新任务进度
    this.eventBus.on('enemy:killed', (data) => {
      this.updateObjectiveProgress('kill_enemies', data.enemyType, 1)
    })

    this.eventBus.on('item:collected', (data) => {
      this.updateObjectiveProgress('collect_items', data.itemId, data.amount)
    })

    this.eventBus.on('player:reached_location', (data) => {
      this.updateObjectiveProgress('reach_location', data.location, 1)
    })

    this.eventBus.on('skill:used', (data) => {
      this.updateObjectiveProgress('use_skill', data.skillId, 1)
    })

    this.eventBus.on('player:level_up', (data) => {
      this.updateObjectiveProgress('level_up', 'any', 1)
      this.checkLevelRequirements(data.newLevel)
    })

    this.eventBus.on('experience:gained', (data) => {
      this.updateObjectiveProgress('gain_experience', 'any', data.amount)
    })

    this.eventBus.on('quest:completed', (data) => {
      this.updateObjectiveProgress('complete_quest', data.quest.id, 1)
    })
  }

  // ===========================================
  // 任务模板管理
  // ===========================================

  private loadQuestTemplates(): void {
    // 加载默认任务模板
    const defaultQuests = this.getDefaultQuests()
    defaultQuests.forEach(quest => {
      this.questTemplates.set(quest.id, quest)
    })
  }

  private getDefaultQuests(): Quest[] {
    return [
      // 教程任务
      {
        id: 'tutorial_001',
        name: '初入世界',
        description: '欢迎来到像素风流放之路！让我们开始你的冒险之旅。',
        type: QuestType.TUTORIAL,
        status: QuestStatus.AVAILABLE,
        level: 1,
        priority: 100,
        repeatable: false,
        autoComplete: false,
        autoAccept: true,
        objectives: [
          {
            id: 'obj_001',
            type: QuestObjectiveType.KILL_ENEMIES,
            target: 'any',
            required: 3,
            current: 0,
            description: '击败3个敌人',
            completed: false,
            optional: false,
            hidden: false
          },
          {
            id: 'obj_002',
            type: QuestObjectiveType.LEVEL_UP,
            target: 'any',
            required: 1,
            current: 0,
            description: '提升到2级',
            completed: false,
            optional: false,
            hidden: false
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 100,
            amount: 1,
            description: '获得100点经验'
          },
          {
            type: 'gold',
            value: 50,
            amount: 1,
            description: '获得50金币'
          },
          {
            type: 'skill_point',
            value: 1,
            amount: 1,
            description: '获得1技能点'
          }
        ],
        requirements: [],
        icon: 'tutorial',
        color: '#4CAF50',
        category: '新手指引'
      },

      // 主线任务
      {
        id: 'main_001',
        name: '寻找古老传说',
        description: '传说中的力量觉醒了，你需要探索这个世界的秘密。',
        type: QuestType.MAIN,
        status: QuestStatus.LOCKED,
        level: 5,
        priority: 90,
        repeatable: false,
        autoComplete: false,
        autoAccept: false,
        objectives: [
          {
            id: 'obj_main_001',
            type: QuestObjectiveType.REACH_LOCATION,
            target: 'ancient_ruins',
            required: 1,
            current: 0,
            description: '到达古代遗迹',
            completed: false,
            optional: false,
            hidden: false
          },
          {
            id: 'obj_main_002',
            type: QuestObjectiveType.KILL_ENEMIES,
            target: 'guardian',
            required: 1,
            current: 0,
            description: '击败遗迹守护者',
            completed: false,
            optional: false,
            hidden: false
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 500,
            amount: 1,
            description: '获得500点经验'
          },
          {
            type: 'item',
            value: 'ancient_artifact',
            amount: 1,
            description: '获得古代神器'
          },
          {
            type: 'talent_point',
            value: 2,
            amount: 1,
            description: '获得2天赋点'
          }
        ],
        requirements: [
          {
            type: 'level',
            value: 5,
            description: '需要达到5级'
          },
          {
            type: 'quest',
            value: 'tutorial_001',
            description: '完成新手教程'
          }
        ],
        nextQuestId: 'main_002',
        icon: 'quest',
        color: '#FF9800',
        category: '主线剧情'
      },

      // 每日任务
      {
        id: 'daily_001',
        name: '日常狩猎',
        description: '每日的狩猎活动，击败指定数量的敌人。',
        type: QuestType.DAILY,
        status: QuestStatus.AVAILABLE,
        level: 3,
        priority: 50,
        repeatable: true,
        autoComplete: true,
        autoAccept: false,
        duration: 24 * 60 * 60 * 1000, // 24小时
        objectives: [
          {
            id: 'obj_daily_001',
            type: QuestObjectiveType.KILL_ENEMIES,
            target: 'any',
            required: 20,
            current: 0,
            description: '击败20个敌人',
            completed: false,
            optional: false,
            hidden: false
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 300,
            amount: 1,
            description: '获得300点经验'
          },
          {
            type: 'gold',
            value: 100,
            amount: 1,
            description: '获得100金币'
          },
          {
            type: 'currency',
            value: 'alchemy_orb',
            amount: 1,
            description: '获得1个炼金石'
          }
        ],
        requirements: [
          {
            type: 'level',
            value: 3,
            description: '需要达到3级'
          }
        ],
        icon: 'daily',
        color: '#2196F3',
        category: '每日任务'
      },

      // 成就任务
      {
        id: 'achievement_001',
        name: '战斗大师',
        description: '在战斗中展现你的实力，击败大量敌人。',
        type: QuestType.ACHIEVEMENT,
        status: QuestStatus.AVAILABLE,
        level: 1,
        priority: 30,
        repeatable: false,
        autoComplete: true,
        autoAccept: true,
        objectives: [
          {
            id: 'obj_achievement_001',
            type: QuestObjectiveType.KILL_ENEMIES,
            target: 'any',
            required: 100,
            current: 0,
            description: '击败100个敌人',
            completed: false,
            optional: false,
            hidden: false
          }
        ],
        rewards: [
          {
            type: 'talent_point',
            value: 3,
            amount: 1,
            description: '获得3天赋点'
          },
          {
            type: 'item',
            value: 'achievement_trophy',
            amount: 1,
            description: '获得成就奖杯'
          }
        ],
        requirements: [],
        icon: 'achievement',
        color: '#9C27B0',
        category: '成就挑战'
      }
    ]
  }

  // ===========================================
  // 任务管理方法
  // ===========================================

  public getQuestTemplate(questId: string): Quest | undefined {
    return this.questTemplates.get(questId)
  }

  public addQuestTemplate(quest: Quest): void {
    this.questTemplates.set(quest.id, quest)
    console.log(`📋 添加任务模板: ${quest.name}`)
  }

  public getAvailableQuests(): Quest[] {
    const playerLevel = this.stateManager.getState().currentCharacter?.level || 1
    
    return Array.from(this.questTemplates.values())
      .filter(quest => {
        if (quest.status !== QuestStatus.AVAILABLE && quest.status !== QuestStatus.LOCKED) {
          return false
        }
        
        // 检查是否已经完成（非重复任务）
        if (!quest.repeatable && this.completedQuests.has(quest.id)) {
          return false
        }
        
        // 检查是否已经在进行中
        if (this.activeQuests.has(quest.id)) {
          return false
        }
        
        // 检查要求
        return this.checkQuestRequirements(quest, playerLevel)
      })
  }

  public getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests.values())
      .sort((a, b) => b.priority - a.priority)
  }

  public getQuestById(questId: string): Quest | undefined {
    return this.activeQuests.get(questId) || this.questTemplates.get(questId)
  }

  // ===========================================
  // 任务操作方法
  // ===========================================

  public acceptQuest(questId: string): boolean {
    const template = this.questTemplates.get(questId)
    if (!template) {
      console.warn(`❌ 未找到任务模板: ${questId}`)
      return false
    }

    // 检查是否已经接受
    if (this.activeQuests.has(questId)) {
      console.warn(`⚠️ 任务已经在进行中: ${questId}`)
      return false
    }

    // 检查活跃任务数量限制
    if (this.activeQuests.size >= this.config.maxActiveQuests) {
      console.warn(`⚠️ 活跃任务数量已达上限: ${this.config.maxActiveQuests}`)
      return false
    }

    // 检查要求
    const playerLevel = this.stateManager.getState().currentCharacter?.level || 1
    if (!this.checkQuestRequirements(template, playerLevel)) {
      console.warn(`⚠️ 不满足任务要求: ${questId}`)
      return false
    }

    // 创建任务实例
    const quest: Quest = {
      ...template,
      status: QuestStatus.ACTIVE,
      startTime: Date.now(),
      objectives: template.objectives.map(obj => ({ ...obj, current: 0, completed: false }))
    }

    // 设置过期时间
    if (quest.duration) {
      quest.expireTime = Date.now() + quest.duration
      this.setQuestTimer(quest)
    }

    // 添加到活跃任务
    this.activeQuests.set(questId, quest)

    // 触发事件
    this.eventBus.emit('quest:accepted', { quest })

    console.log(`✅ 接受任务: ${quest.name}`)
    return true
  }

  public abandonQuest(questId: string): boolean {
    const quest = this.activeQuests.get(questId)
    if (!quest) {
      console.warn(`❌ 未找到活跃任务: ${questId}`)
      return false
    }

    // 移除任务
    this.activeQuests.delete(questId)
    
    // 清除计时器
    this.clearQuestTimer(questId)

    // 更新状态
    quest.status = QuestStatus.FAILED
    this.failedQuests.add(questId)

    // 触发事件
    this.eventBus.emit('quest:failed', { quest })

    console.log(`❌ 放弃任务: ${quest.name}`)
    return true
  }

  public completeQuest(questId: string): boolean {
    const quest = this.activeQuests.get(questId)
    if (!quest) {
      console.warn(`❌ 未找到活跃任务: ${questId}`)
      return false
    }

    // 检查是否所有必需目标都已完成
    const requiredObjectives = quest.objectives.filter(obj => !obj.optional)
    const allCompleted = requiredObjectives.every(obj => obj.completed)

    if (!allCompleted) {
      console.warn(`⚠️ 任务目标尚未完成: ${questId}`)
      return false
    }

    // 更新状态
    quest.status = QuestStatus.COMPLETED
    quest.completeTime = Date.now()

    // 移除活跃任务，添加到完成列表
    this.activeQuests.delete(questId)
    this.completedQuests.add(questId)

    // 清除计时器
    this.clearQuestTimer(questId)

    // 触发事件
    this.eventBus.emit('quest:completed', { quest })

    console.log(`🎉 完成任务: ${quest.name}`)

    // 自动提交奖励（如果设置了自动完成）
    if (quest.autoComplete) {
      this.turnInQuest(questId)
    }

    return true
  }

  public turnInQuest(questId: string): boolean {
    const quest = this.getQuestById(questId)
    if (!quest || quest.status !== QuestStatus.COMPLETED) {
      console.warn(`❌ 无法提交任务: ${questId}`)
      return false
    }

    // 分发奖励
    const rewards = this.distributeRewards(quest.rewards)

    // 更新状态
    quest.status = QuestStatus.TURNED_IN

    // 触发事件
    this.eventBus.emit('quest:turned_in', { quest, rewards })

    // 检查后续任务
    if (quest.nextQuestId) {
      this.unlockQuest(quest.nextQuestId)
    }

    console.log(`💰 提交任务奖励: ${quest.name}`)
    return true
  }

  // ===========================================
  // 任务进度更新
  // ===========================================

  public updateObjectiveProgress(
    objectiveType: string, 
    target: string | number, 
    amount: number
  ): void {
    const activeQuests = Array.from(this.activeQuests.values())

    for (const quest of activeQuests) {
      let questUpdated = false

      for (const objective of quest.objectives) {
        if (objective.completed) continue

        const matchesType = objective.type === objectiveType
        const matchesTarget = objective.target === target || 
                             objective.target === 'any' || 
                             target === 'any'

        if (matchesType && matchesTarget) {
          const oldCurrent = objective.current
          objective.current = Math.min(objective.current + amount, objective.required)

          if (objective.current !== oldCurrent) {
            questUpdated = true

            // 检查目标是否完成
            if (objective.current >= objective.required) {
              objective.completed = true
              console.log(`✅ 任务目标完成: ${quest.name} - ${objective.description}`)
            }

            // 触发目标更新事件
            this.eventBus.emit('quest:objective_updated', { quest, objective })
          }
        }
      }

      if (questUpdated) {
        // 计算整体进度
        const totalObjectives = quest.objectives.filter(obj => !obj.optional).length
        const completedObjectives = quest.objectives.filter(obj => !obj.optional && obj.completed).length
        const progress = totalObjectives > 0 ? completedObjectives / totalObjectives : 0

        // 触发进度更新事件
        this.eventBus.emit('quest:progress_updated', { quest, progress })

        // 检查任务是否完成
        if (progress >= 1.0) {
          this.completeQuest(quest.id)
        }
      }
    }
  }

  // ===========================================
  // 任务要求检查
  // ===========================================

  private checkQuestRequirements(quest: Quest, playerLevel: number): boolean {
    for (const requirement of quest.requirements) {
      switch (requirement.type) {
        case 'level':
          if (playerLevel < requirement.value) {
            return false
          }
          break

        case 'quest':
          if (!this.completedQuests.has(requirement.value as string)) {
            return false
          }
          break

        case 'item':
          // TODO: 检查背包中是否有指定物品
          break

        case 'class':
          const currentClass = this.stateManager.getState().currentCharacter?.characterClass
          if (currentClass !== requirement.value) {
            return false
          }
          break

        case 'stat':
          // TODO: 检查角色属性
          break
      }
    }
    return true
  }

  private checkLevelRequirements(newLevel: number): void {
    // 检查是否有新任务因等级提升而解锁
    const unlockedQuests = Array.from(this.questTemplates.values())
      .filter(quest => {
        if (quest.status !== QuestStatus.LOCKED) return false
        return this.checkQuestRequirements(quest, newLevel)
      })

    for (const quest of unlockedQuests) {
      this.unlockQuest(quest.id)
    }
  }

  private unlockQuest(questId: string): void {
    const quest = this.questTemplates.get(questId)
    if (quest && quest.status === QuestStatus.LOCKED) {
      quest.status = QuestStatus.AVAILABLE
      
      // 自动接受任务（如果设置）
      if (quest.autoAccept) {
        this.acceptQuest(questId)
      } else {
        this.eventBus.emit('quest:available', { quest })
        console.log(`🔓 解锁任务: ${quest.name}`)
      }
    }
  }

  // ===========================================
  // 奖励系统
  // ===========================================

  private distributeRewards(rewards: QuestReward[]): QuestReward[] {
    const distributedRewards: QuestReward[] = []

    for (const reward of rewards) {
      try {
        switch (reward.type) {
          case 'experience':
            this.eventBus.emit('experience:gain', { amount: reward.value })
            break

          case 'gold':
            this.eventBus.emit('gold:gain', { amount: reward.value })
            break

          case 'skill_point':
            this.eventBus.emit('skill_points:gain', { amount: reward.value })
            break

          case 'talent_point':
            this.eventBus.emit('talent_points:gain', { amount: reward.value })
            break

          case 'item':
            this.eventBus.emit('item:add', { 
              itemId: reward.value, 
              amount: reward.amount 
            })
            break

          case 'currency':
            this.eventBus.emit('currency:add', { 
              currencyType: reward.value, 
              amount: reward.amount 
            })
            break
        }

        distributedRewards.push(reward)
        console.log(`💰 分发奖励: ${reward.description}`)
      } catch (error) {
        console.error(`❌ 分发奖励失败:`, reward, error)
      }
    }

    return distributedRewards
  }

  // ===========================================
  // 计时器管理
  // ===========================================

  private setQuestTimer(quest: Quest): void {
    if (!quest.expireTime) return

    const timeLeft = quest.expireTime - Date.now()
    if (timeLeft <= 0) {
      this.expireQuest(quest.id)
      return
    }

    const timer = setTimeout(() => {
      this.expireQuest(quest.id)
    }, timeLeft)

    this.questTimers.set(quest.id, timer)
  }

  private clearQuestTimer(questId: string): void {
    const timer = this.questTimers.get(questId)
    if (timer) {
      clearTimeout(timer)
      this.questTimers.delete(questId)
    }
  }

  private expireQuest(questId: string): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return

    quest.status = QuestStatus.EXPIRED
    this.activeQuests.delete(questId)
    this.clearQuestTimer(questId)

    this.eventBus.emit('quest:expired', { quest })
    console.log(`⏰ 任务过期: ${quest.name}`)
  }

  // ===========================================
  // 数据持久化
  // ===========================================

  private startAutoSave(): void {
    setInterval(() => {
      this.saveQuestState()
    }, this.config.autoSaveInterval)
  }

  private saveQuestState(): void {
    const questState = {
      activeQuests: Array.from(this.activeQuests.entries()),
      completedQuests: Array.from(this.completedQuests),
      failedQuests: Array.from(this.failedQuests)
    };
    
    this.stateManager.saveState('quests', questState);
  }

  private loadQuestState(): void {
    const questState = this.stateManager.loadState('quests');
    
    if (questState) {
      // 恢复活跃任务
      if (questState.activeQuests) {
        this.activeQuests = new Map(questState.activeQuests);
      }
      
      // 恢复已完成任务
      if (questState.completedQuests) {
        this.completedQuests = new Set(questState.completedQuests);
      }
      
      // 恢复失败任务
      if (questState.failedQuests) {
        this.failedQuests = new Set(questState.failedQuests);
      }
    }
  }

  // ===========================================
  // 公共API
  // ===========================================

  public getQuestStats() {
    return {
      totalQuests: this.questTemplates.size,
      activeQuests: this.activeQuests.size,
      completedQuests: this.completedQuests.size,
      failedQuests: this.failedQuests.size,
      availableQuests: this.getAvailableQuests().length
    }
  }

  public getQuestProgress(questId: string): number {
    const quest = this.activeQuests.get(questId)
    if (!quest) return 0

    const requiredObjectives = quest.objectives.filter(obj => !obj.optional)
    const completedObjectives = requiredObjectives.filter(obj => obj.completed).length
    
    return requiredObjectives.length > 0 ? completedObjectives / requiredObjectives.length : 0
  }

  public resetDailyQuests(): void {
    // 重置每日任务
    const dailyQuests = Array.from(this.questTemplates.values())
      .filter(quest => quest.type === QuestType.DAILY)

    for (const quest of dailyQuests) {
      if (this.completedQuests.has(quest.id)) {
        this.completedQuests.delete(quest.id)
        quest.status = QuestStatus.AVAILABLE
        
        // 重置目标进度
        quest.objectives.forEach(obj => {
          obj.current = 0
          obj.completed = false
        })
      }
    }

    console.log('🔄 每日任务已重置')
  }

  public destroy(): void {
    // 清理所有计时器
    for (const timer of this.questTimers.values()) {
      clearTimeout(timer)
    }
    this.questTimers.clear()

    // 保存状态
    this.saveQuestState()

    console.log('🧹 任务系统已清理')
  }
}

// 创建全局实例
export const questSystem = QuestSystem.getInstance() 