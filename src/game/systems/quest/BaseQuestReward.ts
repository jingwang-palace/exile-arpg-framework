import { IQuestReward, RewardType } from '@/core/interfaces/IQuestReward';
import { EventEmitter } from '@/utils/EventEmitter';

export abstract class BaseQuestReward extends EventEmitter implements IQuestReward {
  id: string;
  type: RewardType;
  description: string;
  amount: number;
  isClaimed: boolean;
  properties: Map<string, any>;

  constructor(config: {
    id: string;
    type: RewardType;
    description: string;
    amount: number;
  }) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.description = config.description;
    this.amount = config.amount;
    this.isClaimed = false;
    this.properties = new Map();
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): void;

  async claim(): Promise<void> {
    if (!this.isClaimable()) {
      throw new Error(`Cannot claim reward ${this.id}`);
    }

    this.isClaimed = true;
    this.emit('claimed', this);
  }

  reset(): void {
    this.isClaimed = false;
    this.emit('reset', this);
  }

  isClaimable(): boolean {
    return !this.isClaimed;
  }
} 