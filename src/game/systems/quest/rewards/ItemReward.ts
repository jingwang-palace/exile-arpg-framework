import { BaseQuestReward } from '../BaseQuestReward';
import { RewardType } from '../types';
import { EventBus } from '../../../../core/events/EventBus';

export class ItemReward extends BaseQuestReward {
  private itemId: string;

  constructor(config: {
    id: string;
    description: string;
    amount: number;
    itemId: string;
  }) {
    super({
      ...config,
      type: RewardType.ITEM as RewardType,
    });
    this.itemId = config.itemId;
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

    EventBus.getInstance().emit('itemGained', {
      itemId: this.itemId,
      amount: this.amount,
      source: 'quest',
      questId: this.id,
    });

    this.isClaimed = true;
  }
} 