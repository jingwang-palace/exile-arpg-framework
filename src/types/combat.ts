import type { Monster } from './monster'

// 伤害类型
export type DamageType = 'physical' | 'fire' | 'cold' | 'lightning' | 'chaos'

// 战斗角色接口
export interface Combatant {
  id: string;
  monsterId?: string;  // 怪物ID，仅用于怪物
  name: string;
  level: number;
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
  isDead: boolean;
  isElite?: boolean;  // 是否为精英怪物
  rewards?: {
    exp: number;
    gold: number;
    items: Array<{
      id: string;
      chance: number;
      quantity?: number;
      name?: string;
    }>;
  };
}

// 战斗日志条目
export interface CombatLogEntry {
  type: 'damage' | 'heal' | 'death' | 'victory' | 'defeat' | 'start' | 'end' | 'reward';
  message: string;
  timestamp?: number;
}

// 战斗结果
export interface CombatResult {
  victory: boolean;
  logs: CombatLogEntry[];
  rewards?: {
    exp: number;
    gold: number;
    items?: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  };
} 