import { IQuestObjective, ObjectiveType } from '@/core/interfaces/IQuestObjective';
import { EventEmitter } from '@/utils/EventEmitter';

export abstract class BaseQuestObjective extends EventEmitter implements IQuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string;
  requiredAmount: number;
  currentAmount: number;
  isOptional: boolean;
  isHidden: boolean;
  isCompleted: boolean;
  properties: Map<string, any>;

  constructor(config: {
    id: string;
    type: ObjectiveType;
    description: string;
    target: string;
    requiredAmount: number;
    isOptional?: boolean;
    isHidden?: boolean;
  }) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.description = config.description;
    this.target = config.target;
    this.requiredAmount = config.requiredAmount;
    this.currentAmount = 0;
    this.isOptional = config.isOptional || false;
    this.isHidden = config.isHidden || false;
    this.isCompleted = false;
    this.properties = new Map();
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): void;

  update(amount: number): void {
    if (this.isCompleted) {
      return;
    }

    this.currentAmount = Math.min(this.currentAmount + amount, this.requiredAmount);
    
    if (this.currentAmount >= this.requiredAmount) {
      this.complete();
    }

    this.emit('updated', this);
  }

  complete(): void {
    if (this.isCompleted) {
      return;
    }

    this.isCompleted = true;
    this.currentAmount = this.requiredAmount;
    this.emit('completed', this);
  }

  reset(): void {
    this.currentAmount = 0;
    this.isCompleted = false;
    this.emit('reset', this);
  }

  getProgress(): number {
    return this.currentAmount / this.requiredAmount;
  }

  isComplete(): boolean {
    return this.isCompleted;
  }

  canComplete(): boolean {
    return !this.isCompleted && this.currentAmount >= this.requiredAmount;
  }
} 