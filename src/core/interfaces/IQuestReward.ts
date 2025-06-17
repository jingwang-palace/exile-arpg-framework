export enum RewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  ITEM = 'item',
  CURRENCY = 'currency',
  REPUTATION = 'reputation',
  SKILL = 'skill',
  TITLE = 'title',
  CUSTOM = 'custom'
}

export interface IQuestReward {
  id: string;
  type: RewardType;
  description: string;
  amount: number;
  isClaimed: boolean;
  properties: Map<string, any>;

  initialize(): Promise<void>;
  destroy(): void;
  claim(): Promise<void>;
  reset(): void;
  isClaimable(): boolean;
} 