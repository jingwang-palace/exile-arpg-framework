import { CharacterAttributes } from '../character/CharacterAttributes';

export interface SkillEffects {
  healthMultiplier?: number;
  damageMultiplier?: number;
  duration?: number;
  cooldown?: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  level: number;
  damage: number;
  cooldown: number;
  manaCost: number;
  effects?: SkillEffects;
}

export class Skill {
  id: string;
  name: string;
  level: number;
  damage: number;
  cooldown: number;
  manaCost: number;
  effects?: SkillEffects;

  constructor(config: SkillConfig) {
    this.id = config.id;
    this.name = config.name;
    this.level = config.level;
    this.damage = config.damage;
    this.cooldown = config.cooldown;
    this.manaCost = config.manaCost;
    this.effects = config.effects;
  }

  levelUp(): void {
    this.level++;
    this.damage = Math.floor(this.damage * 1.2);
    this.manaCost = Math.floor(this.manaCost * 1.1);
  }

  calculateDamage(attributes: CharacterAttributes): number {
    let damage = this.damage;
    // 根据属性计算伤害
    damage += attributes.strength * 0.5;
    damage += attributes.intelligence * 0.3;
    // 应用技能等级加成
    damage *= (1 + (this.level - 1) * 0.1);
    return Math.floor(damage);
  }
} 