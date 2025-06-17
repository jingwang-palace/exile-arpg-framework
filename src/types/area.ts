export interface Area {
  id: string;
  name: string;
  description: string;
  levelRange: {
    min: number;
    max: number;
  };
  monsters: {
    monsterId: string;
    weight: number;
    count?: {
      min: number;
      max: number;
    };
  }[];
  rewards?: {
    exp: number;
    gold: number;
  };
} 