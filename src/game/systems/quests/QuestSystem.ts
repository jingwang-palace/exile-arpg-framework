import { EventEmitter } from 'events';
import { TalentManager } from '../talents/TalentManager';
import { PlayerLevelSystem } from '../player/PlayerLevelSystem';

// 任务类型枚举
export enum QuestType {
  MAIN = 'main',           // 主线任务
  SIDE = 'side',           // 支线任务
  DAILY = 'daily',         // 每日任务
  CHALLENGE = 'challenge'  // 挑战任务
}

// 任务目标类型
export enum QuestObjectiveType {
  KILL_ENEMY = 'kill_enemy',           // 击杀敌人
  COLLECT_ITEM = 'collect_item',       // 收集物品
  REACH_LOCATION = 'reach_location',   // 到达地点
  USE_SKILL = 'use_skill',             // 使用技能
  COMPLETE_DUNGEON = 'complete_dungeon' // 完成地下城
}

// 任务目标接口
export interface QuestObjective {
  id: string;                    // 目标ID
  type: QuestObjectiveType;      // 目标类型
  targetId: string;              // 目标对象ID（如怪物ID、物品ID等）
  targetName: string;            // 目标名称
  required: number;              // 需要完成的数量
  current: number;               // 当前完成的数量
  description: string;           // 目标描述
}

// 任务奖励接口
export interface QuestReward {
  experience: number;            // 经验值
  talentPoints: number;          // 天赋点
  gold?: number;                 // 金币
  items?: Array<{id: string, quantity: number}>; // 物品奖励
}

// 任务接口
export interface Quest {
  id: string;                    // 任务ID
  title: string;                 // 任务标题
  description: string;           // 任务描述
  type: QuestType;               // 任务类型
  level: number;                 // 推荐等级
  objectives: QuestObjective[];  // 任务目标
  rewards: QuestReward;          // 任务奖励
  isComplete: boolean;           // 是否完成
  isClaimed: boolean;            // 是否已领取奖励
  isTracked: boolean;            // 是否被追踪
  isAvailable: boolean;          // 是否可接取
  prerequisiteQuestIds: string[]; // 前置任务ID
}

export class QuestSystem extends EventEmitter {
  // 所有可用任务
  private availableQuests: Map<string, Quest> = new Map();
  
  // 玩家已接取的任务
  private activeQuests: Map<string, Quest> = new Map();
  
  // 玩家已完成的任务
  private completedQuests: Set<string> = new Set();
  
  // 系统引用
  private talentManager: TalentManager;
  private playerLevelSystem: PlayerLevelSystem;
  
  constructor(talentManager: TalentManager, playerLevelSystem: PlayerLevelSystem) {
    super();
    this.talentManager = talentManager;
    this.playerLevelSystem = playerLevelSystem;
  }
  
  // 注册任务
  public registerQuest(quest: Quest): void {
    this.availableQuests.set(quest.id, quest);
  }
  
  // 批量注册任务
  public registerQuests(quests: Quest[]): void {
    quests.forEach(quest => this.registerQuest(quest));
  }
  
  // 接取任务
  public acceptQuest(questId: string): boolean {
    const quest = this.availableQuests.get(questId);
    
    if (!quest || !quest.isAvailable) {
      console.warn(`任务 ${questId} 不可接取`);
      return false;
    }
    
    // 检查前置任务
    if (quest.prerequisiteQuestIds.length > 0) {
      for (const preQuestId of quest.prerequisiteQuestIds) {
        if (!this.completedQuests.has(preQuestId)) {
          console.warn(`任务 ${questId} 的前置任务未完成`);
          return false;
        }
      }
    }
    
    // 检查等级要求
    if (this.playerLevelSystem.getLevel() < quest.level) {
      console.warn(`玩家等级不足，无法接取任务 ${questId}`);
      return false;
    }
    
    // 复制任务到活跃任务列表
    const activeQuest = { ...quest };
    this.activeQuests.set(questId, activeQuest);
    
    // 触发事件
    this.emit('questAccepted', activeQuest);
    
    return true;
  }
  
  // 放弃任务
  public abandonQuest(questId: string): boolean {
    if (!this.activeQuests.has(questId)) {
      console.warn(`任务 ${questId} 不在活跃任务列表中`);
      return false;
    }
    
    const quest = this.activeQuests.get(questId)!;
    this.activeQuests.delete(questId);
    
    // 触发事件
    this.emit('questAbandoned', quest);
    
    return true;
  }
  
  // 更新任务目标进度
  public updateObjective(questId: string, objectiveId: string, progress: number): boolean {
    if (!this.activeQuests.has(questId)) {
      return false;
    }
    
    const quest = this.activeQuests.get(questId)!;
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective) {
      return false;
    }
    
    // 更新进度
    objective.current = Math.min(objective.current + progress, objective.required);
    
    // 触发事件
    this.emit('objectiveUpdated', quest, objective);
    
    // 检查任务是否完成
    this.checkQuestCompletion(questId);
    
    return true;
  }
  
  // 检查任务是否完成
  private checkQuestCompletion(questId: string): void {
    if (!this.activeQuests.has(questId)) {
      return;
    }
    
    const quest = this.activeQuests.get(questId)!;
    
    // 检查所有目标是否完成
    const allObjectivesComplete = quest.objectives.every(
      obj => obj.current >= obj.required
    );
    
    // 如果任务已完成但之前未标记为完成
    if (allObjectivesComplete && !quest.isComplete) {
      quest.isComplete = true;
      
      // 触发事件
      this.emit('questCompleted', quest);
    }
  }
  
  // 领取任务奖励
  public claimQuestReward(questId: string): boolean {
    if (!this.activeQuests.has(questId)) {
      console.warn(`任务 ${questId} 不在活跃任务列表中`);
      return false;
    }
    
    const quest = this.activeQuests.get(questId)!;
    
    if (!quest.isComplete || quest.isClaimed) {
      console.warn(`任务 ${questId} 未完成或已领取奖励`);
      return false;
    }
    
    // 标记为已领取
    quest.isClaimed = true;
    
    // 发放奖励
    const rewards = quest.rewards;
    
    // 经验值奖励
    if (rewards.experience > 0) {
      this.playerLevelSystem.addExperience(rewards.experience);
    }
    
    // 天赋点奖励
    if (rewards.talentPoints > 0) {
      this.talentManager.addTalentPoints(rewards.talentPoints);
    }
    
    // 将任务从活跃列表移到已完成列表
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
    
    // 触发事件
    this.emit('questRewardClaimed', quest, rewards);
    
    return true;
  }
  
  // 获取所有可用任务
  public getAvailableQuests(): Map<string, Quest> {
    return this.availableQuests;
  }
  
  // 获取活跃任务
  public getActiveQuests(): Map<string, Quest> {
    return this.activeQuests;
  }
  
  // 获取已完成任务
  public getCompletedQuests(): Set<string> {
    return this.completedQuests;
  }
  
  // 设置任务追踪状态
  public setQuestTracked(questId: string, isTracked: boolean): boolean {
    if (!this.activeQuests.has(questId)) {
      return false;
    }
    
    const quest = this.activeQuests.get(questId)!;
    quest.isTracked = isTracked;
    
    // 触发事件
    this.emit('questTrackingChanged', quest);
    
    return true;
  }
  
  // 检查某个任务是否完成
  public isQuestCompleted(questId: string): boolean {
    return this.completedQuests.has(questId);
  }
  
  // 手动完成任务目标（用于调试或特殊情况）
  public completeObjective(questId: string, objectiveId: string): boolean {
    if (!this.activeQuests.has(questId)) {
      return false;
    }
    
    const quest = this.activeQuests.get(questId)!;
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective) {
      return false;
    }
    
    // 设置为完成
    objective.current = objective.required;
    
    // 触发事件
    this.emit('objectiveUpdated', quest, objective);
    
    // 检查任务是否完成
    this.checkQuestCompletion(questId);
    
    return true;
  }
} 