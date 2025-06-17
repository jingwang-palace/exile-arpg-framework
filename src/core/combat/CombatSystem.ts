import { EventBus } from '../../infrastructure/events/EventBus';
import { SkillSystem } from './SkillSystem';
import { DamageCalculator } from './DamageCalculator';
import { StatusEffectManager } from './StatusEffectManager';
import { ISkill } from './types/Skill';
import { IDamage } from './types/Damage';
import { IStatusEffect } from './types/StatusEffect';

/**
 * 战斗系统
 * 负责管理游戏中的战斗相关功能，包括技能系统、伤害计算和状态效果
 */
export class CombatSystem {
  private skillSystem: SkillSystem;
  private damageCalculator: DamageCalculator;
  private statusEffectManager: StatusEffectManager;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.skillSystem = new SkillSystem(eventBus);
    this.damageCalculator = new DamageCalculator(eventBus);
    this.statusEffectManager = new StatusEffectManager(eventBus);
  }

  /**
   * 初始化战斗系统
   */
  public initialize(): void {
    this.skillSystem.initialize();
    this.damageCalculator.initialize();
    this.statusEffectManager.initialize();
  }

  /**
   * 更新战斗系统
   * @param deltaTime 帧间隔时间
   */
  public update(deltaTime: number): void {
    this.skillSystem.update(deltaTime);
    this.statusEffectManager.update(deltaTime);
  }

  /**
   * 使用技能
   * @param skillId 技能ID
   * @param caster 施法者
   * @param target 目标
   */
  public useSkill(skillId: string, caster: any, target: any): void {
    this.skillSystem.useSkill(skillId, caster, target);
  }

  /**
   * 计算伤害
   * @param damage 伤害信息
   */
  public calculateDamage(damage: IDamage): void {
    this.damageCalculator.calculateDamage(damage);
  }

  /**
   * 应用状态效果
   * @param effect 状态效果
   */
  public applyStatusEffect(effect: IStatusEffect): void {
    this.statusEffectManager.applyEffect(effect);
  }

  /**
   * 移除状态效果
   * @param effectId 效果ID
   * @param target 目标
   */
  public removeStatusEffect(effectId: string, target: any): void {
    this.statusEffectManager.removeEffect(effectId, target);
  }

  /**
   * 获取技能系统
   */
  public getSkillSystem(): SkillSystem {
    return this.skillSystem;
  }

  /**
   * 获取伤害计算器
   */
  public getDamageCalculator(): DamageCalculator {
    return this.damageCalculator;
  }

  /**
   * 获取状态效果管理器
   */
  public getStatusEffectManager(): StatusEffectManager {
    return this.statusEffectManager;
  }
} 