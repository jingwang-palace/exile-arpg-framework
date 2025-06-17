export enum ObjectiveType {
  KILL = 'kill',
  COLLECT = 'collect',
  EXPLORE = 'explore',
  TALK = 'talk',
  ESCORT = 'escort',
  DEFEND = 'defend',
  CRAFT = 'craft',
  CUSTOM = 'custom'
}

export interface IQuestObjective {
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

  initialize(): Promise<void>;
  destroy(): void;
  update(amount: number): void;
  complete(): void;
  reset(): void;
  getProgress(): number;
  isComplete(): boolean;
  canComplete(): boolean;
} 