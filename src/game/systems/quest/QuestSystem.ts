import { IQuestSystem } from '@/core/interfaces/IQuestSystem';
import { IQuest, QuestType, QuestStatus } from '@/core/interfaces/IQuest';
import { IQuestObjective } from '@/core/interfaces/IQuestObjective';
import { IQuestReward } from '@/core/interfaces/IQuestReward';
import { EventEmitter } from '@/utils/EventEmitter';

export class QuestSystem extends EventEmitter implements IQuestSystem {
  quests: Map<string, IQuest>;
  activeQuests: Set<string>;
  completedQuests: Set<string>;

  constructor() {
    super();
    this.quests = new Map();
    this.activeQuests = new Set();
    this.completedQuests = new Set();
  }

  registerQuest(quest: IQuest): void {
    this.quests.set(quest.id, quest);
    this.emit('questRegistered', quest);
  }

  unregisterQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (quest) {
      this.quests.delete(questId);
      this.emit('questUnregistered', quest);
    }
  }

  getQuest(questId: string): IQuest | undefined {
    return this.quests.get(questId);
  }

  async startQuest(questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (!this.canStartQuest(questId)) {
      throw new Error(`Cannot start quest ${questId}`);
    }

    await quest.start();
    this.activeQuests.add(questId);
    this.emit('questStarted', quest);
  }

  async completeQuest(questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (!quest.canComplete()) {
      throw new Error(`Cannot complete quest ${questId}`);
    }

    await quest.complete();
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
    this.emit('questCompleted', quest);
  }

  async failQuest(questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (!quest.canFail()) {
      throw new Error(`Cannot fail quest ${questId}`);
    }

    await quest.fail();
    this.activeQuests.delete(questId);
    this.emit('questFailed', quest);
  }

  async abandonQuest(questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (!quest.canAbandon()) {
      throw new Error(`Cannot abandon quest ${questId}`);
    }

    await quest.abandon();
    this.activeQuests.delete(questId);
    this.emit('questAbandoned', quest);
  }

  updateObjective(questId: string, objectiveId: string, progress: number): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    quest.updateObjective(objectiveId, progress);
    this.emit('objectiveUpdated', { quest, objectiveId, progress });
  }

  getQuestProgress(questId: string): number {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    return quest.getProgress();
  }

  getActiveQuests(): IQuest[] {
    return Array.from(this.activeQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is IQuest => quest !== undefined);
  }

  getCompletedQuests(): IQuest[] {
    return Array.from(this.completedQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is IQuest => quest !== undefined);
  }

  getAvailableQuests(): IQuest[] {
    return Array.from(this.quests.values())
      .filter(quest => 
        quest.status === QuestStatus.AVAILABLE && 
        this.canStartQuest(quest.id)
      );
  }

  isQuestActive(questId: string): boolean {
    return this.activeQuests.has(questId);
  }

  isQuestCompleted(questId: string): boolean {
    return this.completedQuests.has(questId);
  }

  getQuestPrerequisites(questId: string): IQuest[] {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    return quest.prerequisites
      .map(id => this.quests.get(id))
      .filter((quest): quest is IQuest => quest !== undefined);
  }

  canStartQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      return false;
    }

    if (quest.status !== QuestStatus.AVAILABLE) {
      return false;
    }

    if (this.isQuestActive(questId)) {
      return false;
    }

    // 检查前置任务
    const prerequisites = this.getQuestPrerequisites(questId);
    return prerequisites.every(prereq => this.isQuestCompleted(prereq.id));
  }

  async claimQuestReward(questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (!quest.hasUnclaimedRewards()) {
      throw new Error(`No unclaimed rewards for quest ${questId}`);
    }

    await quest.claimRewards();
    this.emit('rewardsClaimed', quest);
  }

  hasUnclaimedRewards(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      return false;
    }

    return quest.hasUnclaimedRewards();
  }
} 