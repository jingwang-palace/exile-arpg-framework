import { IQuestObjective } from './IQuestObjective';
import { IQuestReward } from './IQuestReward';

export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  EVENT = 'event'
}

export enum QuestStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned'
}

export interface IQuest {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  level: number;
  difficulty: number;
  status: QuestStatus;
  objectives: IQuestObjective[];
  rewards: IQuestReward[];
  prerequisites: string[];
  timeLimit?: number;
  startTime?: number;
  endTime?: number;
  isRepeatable: boolean;
  repeatInterval?: number;
  lastCompletedTime?: number;
  properties: Map<string, any>;

  initialize(): Promise<void>;
  destroy(): void;
  start(): Promise<void>;
  complete(): Promise<void>;
  fail(): Promise<void>;
  abandon(): Promise<void>;
  updateObjective(objectiveId: string, progress: number): void;
  getProgress(): number;
  isComplete(): boolean;
  isFailed(): boolean;
  canStart(): boolean;
  canComplete(): boolean;
  canFail(): boolean;
  canAbandon(): boolean;
  hasUnclaimedRewards(): boolean;
  claimRewards(): Promise<void>;
} 