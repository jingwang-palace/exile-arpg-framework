import { BaseQuestReward } from '../BaseQuestReward';
import { RewardType } from '../types';
import { EventBus } from '../../../../core/events/EventBus';

export class ExperienceReward extends BaseQuestReward {
  constructor(config: {
    id: string;
    description: string;
    amount: number;
  }) {
    super({
      ...config,
      type: RewardType.EXPERIENCE as RewardType,
    });
  }

  public async initialize(): Promise<void> {
    // 初始化逻辑
  }

  public destroy(): void {
    // 清理逻辑
  }

  public async claim(): Promise<void> {
    if (!this.isClaimable()) {
      return;
    }

    EventBus.getInstance().emit('experienceGained', {
      amount: this.amount,
      source: 'quest',
      questId: this.id,
    });

    this.isClaimed = true;
  }
} 