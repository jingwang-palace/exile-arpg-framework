export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'kill' | 'collect' | 'explore';
  category: 'story' | 'daily' | 'weekly' | 'challenge' | 'tutorial';
  requirements: {
    level?: number;
    prevQuests?: string[];
  };
  objectives: {
    target: string;
    count: number;
    current?: number;
  }[];
  rewards: {
    exp: number;
    gold: number;
    items?: {
      id: string;
      count: number;
    }[];
  };
  repeatable: boolean;
  resetType?: 'daily' | 'weekly';
} 