import { BaseQuestReward } from '../BaseQuestReward';
import { RewardType } from '../types';
import { EventBus } from '../../../../core/events/EventBus';

export class GoldReward extends BaseQuestReward {
  constructor(config: {
    id: string;
    description: string;
    amount: number;
  }) {
    super({
      ...config,
      type: RewardType.GOLD as RewardType,
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

    EventBus.getInstance().emit('goldGained', {
      amount: this.amount,
      source: 'quest',
      questId: this.id,
    });

    this.isClaimed = true;
  }
} 