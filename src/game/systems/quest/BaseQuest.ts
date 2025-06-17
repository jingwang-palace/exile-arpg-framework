import { IQuest, QuestType, QuestStatus } from '@/core/interfaces/IQuest';
import { IQuestObjective } from '@/core/interfaces/IQuestObjective';
import { IQuestReward } from '@/core/interfaces/IQuestReward';
import { EventEmitter } from '@/utils/EventEmitter';

export abstract class BaseQuest extends EventEmitter implements IQuest {
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

  constructor(config: {
    id: string;
    type: QuestType;
    name: string;
    description: string;
    level: number;
    difficulty: number;
    objectives: IQuestObjective[];
    rewards: IQuestReward[];
    prerequisites?: string[];
    timeLimit?: number;
    isRepeatable?: boolean;
    repeatInterval?: number;
  }) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.name = config.name;
    this.description = config.description;
    this.level = config.level;
    this.difficulty = config.difficulty;
    this.status = QuestStatus.AVAILABLE;
    this.objectives = config.objectives;
    this.rewards = config.rewards;
    this.prerequisites = config.prerequisites || [];
    this.timeLimit = config.timeLimit;
    this.isRepeatable = config.isRepeatable || false;
    this.repeatInterval = config.repeatInterval;
    this.properties = new Map();
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): void;

  async start(): Promise<void> {
    if (!this.canStart()) {
      throw new Error(`Cannot start quest ${this.id}`);
    }

    this.status = QuestStatus.ACTIVE;
    this.startTime = Date.now();
    if (this.timeLimit) {
      this.endTime = this.startTime + this.timeLimit;
    }

    for (const objective of this.objectives) {
      await objective.initialize();
    }

    this.emit('started', this);
  }

  async complete(): Promise<void> {
    if (!this.canComplete()) {
      throw new Error(`Cannot complete quest ${this.id}`);
    }

    this.status = QuestStatus.COMPLETED;
    this.lastCompletedTime = Date.now();

    for (const objective of this.objectives) {
      await objective.destroy();
    }

    this.emit('completed', this);
  }

  async fail(): Promise<void> {
    if (!this.canFail()) {
      throw new Error(`Cannot fail quest ${this.id}`);
    }

    this.status = QuestStatus.FAILED;

    for (const objective of this.objectives) {
      await objective.destroy();
    }

    this.emit('failed', this);
  }

  async abandon(): Promise<void> {
    if (!this.canAbandon()) {
      throw new Error(`Cannot abandon quest ${this.id}`);
    }

    this.status = QuestStatus.ABANDONED;

    for (const objective of this.objectives) {
      await objective.destroy();
    }

    this.emit('abandoned', this);
  }

  updateObjective(objectiveId: string, progress: number): void {
    const objective = this.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found in quest ${this.id}`);
    }

    objective.update(progress);
    this.emit('objectiveUpdated', { quest: this, objectiveId, progress });
  }

  getProgress(): number {
    if (this.objectives.length === 0) {
      return 0;
    }

    const totalProgress = this.objectives.reduce((sum, objective) => {
      if (objective.isOptional) {
        return sum;
      }
      return sum + objective.getProgress();
    }, 0);

    return totalProgress / this.objectives.filter(obj => !obj.isOptional).length;
  }

  isComplete(): boolean {
    return this.objectives.every(objective => 
      objective.isOptional || objective.isComplete()
    );
  }

  isFailed(): boolean {
    return this.status === QuestStatus.FAILED;
  }

  canStart(): boolean {
    if (this.status !== QuestStatus.AVAILABLE) {
      return false;
    }

    if (this.timeLimit && this.endTime && Date.now() > this.endTime) {
      return false;
    }

    if (this.isRepeatable && this.lastCompletedTime) {
      if (this.repeatInterval && 
          Date.now() - this.lastCompletedTime < this.repeatInterval) {
        return false;
      }
    }

    return true;
  }

  canComplete(): boolean {
    if (this.status !== QuestStatus.ACTIVE) {
      return false;
    }

    return this.isComplete();
  }

  canFail(): boolean {
    if (this.status !== QuestStatus.ACTIVE) {
      return false;
    }

    if (this.timeLimit && this.endTime && Date.now() > this.endTime) {
      return true;
    }

    return false;
  }

  canAbandon(): boolean {
    return this.status === QuestStatus.ACTIVE;
  }

  hasUnclaimedRewards(): boolean {
    return this.rewards.some(reward => !reward.isClaimed);
  }

  async claimRewards(): Promise<void> {
    if (!this.hasUnclaimedRewards()) {
      throw new Error(`No unclaimed rewards for quest ${this.id}`);
    }

    for (const reward of this.rewards) {
      if (!reward.isClaimed) {
        await reward.claim();
      }
    }

    this.emit('rewardsClaimed', this);
  }
} 