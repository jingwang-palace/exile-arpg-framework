import { IQuest, QuestType, QuestStatus } from '@/core/interfaces/IQuest';
import { IQuestObjective } from '@/core/interfaces/IQuestObjective';
import { IQuestReward } from '@/core/interfaces/IQuestReward';

export interface QuestSaveData {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  level: number;
  difficulty: number;
  status: QuestStatus;
  objectives: {
    id: string;
    type: string;
    description: string;
    target: string;
    requiredAmount: number;
    currentAmount: number;
    isOptional: boolean;
    isHidden: boolean;
    isCompleted: boolean;
    properties: Record<string, any>;
  }[];
  rewards: {
    id: string;
    type: string;
    description: string;
    amount: number;
    isClaimed: boolean;
    properties: Record<string, any>;
  }[];
  prerequisites: string[];
  timeLimit?: number;
  startTime?: number;
  endTime?: number;
  isRepeatable: boolean;
  repeatInterval?: number;
  lastCompletedTime?: number;
  properties: Record<string, any>;
}

export class QuestStorage {
  private static readonly STORAGE_KEY = 'quest_save_data';
  private questData: Map<string, QuestSaveData>;

  constructor() {
    this.questData = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const savedData = localStorage.getItem(QuestStorage.STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData) as QuestSaveData[];
        data.forEach(quest => {
          this.questData.set(quest.id, quest);
        });
      }
    } catch (error) {
      console.error('Failed to load quest data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.questData.values());
      localStorage.setItem(QuestStorage.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save quest data:', error);
    }
  }

  public saveQuest(quest: IQuest): void {
    const saveData: QuestSaveData = {
      id: quest.id,
      type: quest.type,
      name: quest.name,
      description: quest.description,
      level: quest.level,
      difficulty: quest.difficulty,
      status: quest.status,
      objectives: quest.objectives.map(obj => ({
        id: obj.id,
        type: obj.type,
        description: obj.description,
        target: obj.target,
        requiredAmount: obj.requiredAmount,
        currentAmount: obj.currentAmount,
        isOptional: obj.isOptional,
        isHidden: obj.isHidden,
        isCompleted: obj.isCompleted,
        properties: Object.fromEntries(obj.properties)
      })),
      rewards: quest.rewards.map(reward => ({
        id: reward.id,
        type: reward.type,
        description: reward.description,
        amount: reward.amount,
        isClaimed: reward.isClaimed,
        properties: Object.fromEntries(reward.properties)
      })),
      prerequisites: quest.prerequisites,
      timeLimit: quest.timeLimit,
      startTime: quest.startTime,
      endTime: quest.endTime,
      isRepeatable: quest.isRepeatable,
      repeatInterval: quest.repeatInterval,
      lastCompletedTime: quest.lastCompletedTime,
      properties: Object.fromEntries(quest.properties)
    };

    this.questData.set(quest.id, saveData);
    this.saveToStorage();
  }

  public loadQuest(questId: string): IQuest | undefined {
    const saveData = this.questData.get(questId);
    if (!saveData) return undefined;

    // 创建基础任务对象
    const quest: IQuest = {
      id: saveData.id,
      type: saveData.type,
      name: saveData.name,
      description: saveData.description,
      level: saveData.level,
      difficulty: saveData.difficulty,
      status: saveData.status,
      objectives: saveData.objectives.map(obj => ({
        id: obj.id,
        type: obj.type,
        description: obj.description,
        target: obj.target,
        requiredAmount: obj.requiredAmount,
        currentAmount: obj.currentAmount,
        isOptional: obj.isOptional,
        isHidden: obj.isHidden,
        isCompleted: obj.isCompleted,
        properties: new Map(Object.entries(obj.properties)),
        initialize: async () => {},
        destroy: () => {},
        update: (amount: number) => {},
        complete: () => {},
        reset: () => {},
        getProgress: () => obj.currentAmount / obj.requiredAmount,
        isComplete: () => obj.isCompleted,
        canComplete: () => obj.currentAmount >= obj.requiredAmount
      })),
      rewards: saveData.rewards.map(reward => ({
        id: reward.id,
        type: reward.type,
        description: reward.description,
        amount: reward.amount,
        isClaimed: reward.isClaimed,
        properties: new Map(Object.entries(reward.properties)),
        initialize: async () => {},
        destroy: () => {},
        claim: async () => {},
        reset: () => {},
        isClaimable: () => !reward.isClaimed
      })),
      prerequisites: saveData.prerequisites,
      timeLimit: saveData.timeLimit,
      startTime: saveData.startTime,
      endTime: saveData.endTime,
      isRepeatable: saveData.isRepeatable,
      repeatInterval: saveData.repeatInterval,
      lastCompletedTime: saveData.lastCompletedTime,
      properties: new Map(Object.entries(saveData.properties)),
      initialize: async () => {},
      destroy: () => {},
      start: async () => {},
      complete: async () => {},
      fail: async () => {},
      abandon: async () => {},
      updateObjective: (objectiveId: string, progress: number) => {
        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (objective) {
          objective.currentAmount = progress;
          objective.isCompleted = progress >= objective.requiredAmount;
        }
      },
      getProgress: () => {
        const totalProgress = quest.objectives.reduce((sum, obj) => sum + (obj.currentAmount / obj.requiredAmount), 0);
        return totalProgress / quest.objectives.length;
      },
      isComplete: () => quest.objectives.every(obj => obj.isCompleted),
      isFailed: () => false,
      canStart: () => true,
      canComplete: () => quest.objectives.every(obj => obj.currentAmount >= obj.requiredAmount),
      canFail: () => false,
      canAbandon: () => true,
      hasUnclaimedRewards: () => quest.rewards.some(reward => !reward.isClaimed),
      claimRewards: async () => {
        quest.rewards.forEach(reward => {
          reward.isClaimed = true;
        });
      }
    };

    return quest;
  }

  public deleteQuest(questId: string): void {
    this.questData.delete(questId);
    this.saveToStorage();
  }

  public clearAll(): void {
    this.questData.clear();
    this.saveToStorage();
  }
} 