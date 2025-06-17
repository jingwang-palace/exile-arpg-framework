import { IQuest } from './IQuest';
import { IQuestObjective } from './IQuestObjective';
import { IQuestReward } from './IQuestReward';

export interface IQuestSystem {
  // 任务管理
  quests: Map<string, IQuest>;
  activeQuests: Set<string>;
  completedQuests: Set<string>;
  
  // 基础方法
  registerQuest(quest: IQuest): void;
  unregisterQuest(questId: string): void;
  getQuest(questId: string): IQuest | undefined;
  
  // 任务状态
  startQuest(questId: string): Promise<void>;
  completeQuest(questId: string): Promise<void>;
  failQuest(questId: string): Promise<void>;
  abandonQuest(questId: string): Promise<void>;
  
  // 任务进度
  updateObjective(questId: string, objectiveId: string, progress: number): void;
  getQuestProgress(questId: string): number;
  
  // 任务查询
  getActiveQuests(): IQuest[];
  getCompletedQuests(): IQuest[];
  getAvailableQuests(): IQuest[];
  isQuestActive(questId: string): boolean;
  isQuestCompleted(questId: string): boolean;
  
  // 任务依赖
  getQuestPrerequisites(questId: string): IQuest[];
  canStartQuest(questId: string): boolean;
  
  // 任务奖励
  claimQuestReward(questId: string): Promise<void>;
  hasUnclaimedRewards(questId: string): boolean;
} 