import { BaseQuestObjective } from '../BaseQuestObjective';
import { ObjectiveType } from '@/core/interfaces/IQuestObjective';
import { EventBus } from '@/core/EventBus';

export class KillMonsterObjective extends BaseQuestObjective {
  constructor(config: {
    id: string;
    description: string;
    target: string;
    requiredAmount: number;
  }) {
    super({
      id: config.id,
      type: ObjectiveType.KILL,
      description: config.description,
      target: config.target,
      requiredAmount: config.requiredAmount
    });
  }

  async initialize(): Promise<void> {
    // 监听怪物击杀事件
    EventBus.getInstance().on('monsterKilled', (data: { monsterId: string }) => {
      if (data.monsterId === this.target) {
        this.update(1);
      }
    });
  }

  destroy(): void {
    // 移除事件监听
    EventBus.getInstance().off('monsterKilled');
  }
} 