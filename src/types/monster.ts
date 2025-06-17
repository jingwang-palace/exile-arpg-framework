export interface Monster {
  id: string;
  name: string;
  level: number;
  health: number;
  mana: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  skills: string[];
  drops?: {
    itemId: string;
    chance: number;
  }[];
} 