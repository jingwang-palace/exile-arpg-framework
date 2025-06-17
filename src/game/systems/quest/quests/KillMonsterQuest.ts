import { BaseQuest } from '../BaseQuest';
import { QuestType } from '@/core/interfaces/IQuest';
import { KillMonsterObjective } from '../objectives/KillMonsterObjective';
import { ExperienceReward } from '../rewards/ExperienceReward';
import { GoldReward } from '../rewards/GoldReward';
import { ItemReward } from '../rewards/ItemReward';

export class KillMonsterQuest extends BaseQuest {
  constructor(config: {
    id: string;
    name: string;
    description: string;
    level: number;
    difficulty: number;
    monsterId: string;
    requiredKills: number;
    experienceReward: number;
    goldReward: number;
    itemReward?: {
      itemId: string;
      amount: number;
    };
  }) {
    const objectives = [
      new KillMonsterObjective({
        id: `${config.id}_objective`,
        description: `击杀 ${config.requiredKills} 只怪物`,
        target: config.monsterId,
        requiredAmount: config.requiredKills
      })
    ];

    const rewards = [
      new ExperienceReward({
        id: `${config.id}_exp_reward`,
        description: '经验值奖励',
        amount: config.experienceReward
      }),
      new GoldReward({
        id: `${config.id}_gold_reward`,
        description: '金币奖励',
        amount: config.goldReward
      })
    ];

    if (config.itemReward) {
      rewards.push(
        new ItemReward({
          id: `${config.id}_item_reward`,
          description: '物品奖励',
          amount: config.itemReward.amount,
          itemId: config.itemReward.itemId
        })
      );
    }

    super({
      id: config.id,
      type: QuestType.SIDE,
      name: config.name,
      description: config.description,
      level: config.level,
      difficulty: config.difficulty,
      objectives,
      rewards,
      isRepeatable: true,
      repeatInterval: 24 * 60 * 60 * 1000 // 24小时
    });
  }

  async initialize(): Promise<void> {
    for (const objective of this.objectives) {
      await objective.initialize();
    }
  }

  destroy(): void {
    for (const objective of this.objectives) {
      objective.destroy();
    }
  }
} 