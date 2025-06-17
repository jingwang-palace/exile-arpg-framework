import { EventBus } from '../../infrastructure/events/EventBus';
import { IDamage, IDamageResult, DamageType, DamageSourceType } from './types/Damage';
import { DamageLogger } from './DamageLogger';

/**
 * 防御属性接口
 */
interface IDefenseStats {
  blockChance: number;
  blockValue: number;
  dodgeChance: number;
  absorbChance: number;
  absorbValue: number;
  armor: number;
}

/**
 * 伤害计算系统
 * 负责计算游戏中的伤害，包括物理伤害、元素伤害等
 */
export class DamageCalculator {
  private eventBus: EventBus;
  private criticalChance: number;
  private criticalMultiplier: number;
  private penetration: number;
  private resistances: Map<DamageType, number>;
  private damageLogger: DamageLogger;
  private defenseStats: Map<string, IDefenseStats>;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.criticalChance = 0;
    this.criticalMultiplier = 1.5;
    this.penetration = 0;
    this.resistances = new Map();
    this.damageLogger = new DamageLogger();
    this.defenseStats = new Map();
  }

  /**
   * 初始化伤害计算系统
   */
  public initialize(): void {
    // 注册伤害相关事件监听
    this.eventBus.on('damage:calculate', this.handleDamageCalculation.bind(this));
    this.eventBus.on('damage:resistance:update', this.handleResistanceUpdate.bind(this));
    this.eventBus.on('defense:update', this.handleDefenseUpdate.bind(this));
  }

  /**
   * 处理伤害计算
   * @param damage 伤害信息
   */
  private handleDamageCalculation(damage: IDamage): void {
    const result = this.calculateDamage(damage);
    this.damageLogger.logDamage(damage, result);
    this.eventBus.emit('damage:calculated', result);
  }

  /**
   * 处理抗性更新
   * @param data 抗性数据
   */
  private handleResistanceUpdate(data: { type: DamageType; value: number }): void {
    this.resistances.set(data.type, data.value);
  }

  /**
   * 处理防御属性更新
   * @param data 防御数据
   */
  private handleDefenseUpdate(data: { targetId: string; stats: IDefenseStats }): void {
    this.defenseStats.set(data.targetId, data.stats);
  }

  /**
   * 计算伤害
   * @param damage 伤害信息
   * @returns 伤害计算结果
   */
  public calculateDamage(damage: IDamage): IDamageResult {
    let finalAmount = damage.baseAmount;
    const modifiers = {
      increased: 0,
      more: 1,
      reduced: 0,
      less: 1
    };

    // 1. 检查闪避
    const isDodged = this.checkDodge(damage.target);
    if (isDodged) {
      return {
        originalDamage: damage,
        finalAmount: 0,
        isCritical: false,
        isBlocked: false,
        isDodged: true,
        isAbsorbed: false,
        resistances: {},
        modifiers
      };
    }

    // 2. 计算暴击
    const isCritical = this.calculateCritical(damage);
    if (isCritical) {
      finalAmount *= damage.criticalMultiplier;
    }

    // 3. 计算伤害修正
    this.calculateDamageModifiers(damage, modifiers);
    finalAmount *= (1 + modifiers.increased - modifiers.reduced);
    finalAmount *= modifiers.more * modifiers.less;

    // 4. 计算护甲减免
    finalAmount = this.calculateArmorReduction(damage.target, finalAmount);

    // 5. 计算抗性减免
    const resistance = this.calculateResistance(damage);
    finalAmount *= (1 - resistance);

    // 6. 检查格挡
    const isBlocked = this.checkBlock(damage.target, finalAmount);
    if (isBlocked) {
      finalAmount = Math.max(0, finalAmount - this.getBlockValue(damage.target));
    }

    // 7. 检查吸收
    const isAbsorbed = this.checkAbsorb(damage.target, finalAmount);
    if (isAbsorbed) {
      finalAmount = Math.max(0, finalAmount - this.getAbsorbValue(damage.target));
    }

    // 8. 计算穿透
    if (damage.penetration > 0) {
      finalAmount *= (1 + damage.penetration);
    }

    // 9. 确保最小伤害
    finalAmount = Math.max(1, Math.floor(finalAmount));

    return {
      originalDamage: damage,
      finalAmount,
      isCritical,
      isBlocked,
      isDodged,
      isAbsorbed,
      resistances: {
        [damage.type]: resistance
      },
      modifiers
    };
  }

  /**
   * 检查闪避
   * @param target 目标
   * @returns 是否闪避
   */
  private checkDodge(target: any): boolean {
    const stats = this.defenseStats.get(target.id);
    if (!stats) return false;
    return Math.random() < stats.dodgeChance;
  }

  /**
   * 检查格挡
   * @param target 目标
   * @param damage 伤害值
   * @returns 是否格挡
   */
  private checkBlock(target: any, damage: number): boolean {
    const stats = this.defenseStats.get(target.id);
    if (!stats) return false;
    return Math.random() < stats.blockChance;
  }

  /**
   * 获取格挡值
   * @param target 目标
   * @returns 格挡值
   */
  private getBlockValue(target: any): number {
    const stats = this.defenseStats.get(target.id);
    return stats?.blockValue || 0;
  }

  /**
   * 检查吸收
   * @param target 目标
   * @param damage 伤害值
   * @returns 是否吸收
   */
  private checkAbsorb(target: any, damage: number): boolean {
    const stats = this.defenseStats.get(target.id);
    if (!stats) return false;
    return Math.random() < stats.absorbChance;
  }

  /**
   * 获取吸收值
   * @param target 目标
   * @returns 吸收值
   */
  private getAbsorbValue(target: any): number {
    const stats = this.defenseStats.get(target.id);
    return stats?.absorbValue || 0;
  }

  /**
   * 计算护甲减免
   * @param target 目标
   * @param damage 伤害值
   * @returns 减免后的伤害
   */
  private calculateArmorReduction(target: any, damage: number): number {
    const stats = this.defenseStats.get(target.id);
    if (!stats) return damage;

    // 护甲减免公式：伤害 * (1 - 护甲/(护甲 + 100))
    const armor = stats.armor;
    const reduction = 1 - (armor / (armor + 100));
    return damage * reduction;
  }

  /**
   * 计算暴击
   * @param damage 伤害信息
   * @returns 是否暴击
   */
  private calculateCritical(damage: IDamage): boolean {
    if (damage.critical) {
      return true;
    }
    return Math.random() < this.criticalChance;
  }

  /**
   * 计算伤害修正
   * @param damage 伤害信息
   * @param modifiers 伤害修正对象
   */
  private calculateDamageModifiers(damage: IDamage, modifiers: any): void {
    // TODO: 实现更复杂的伤害修正计算
    // 例如：技能加成、装备加成、天赋加成等
  }

  /**
   * 计算抗性减免
   * @param damage 伤害信息
   * @returns 抗性减免值
   */
  private calculateResistance(damage: IDamage): number {
    const resistance = this.resistances.get(damage.type) || 0;
    // 抗性上限为75%
    return Math.min(0.75, resistance);
  }

  /**
   * 设置暴击几率
   * @param chance 暴击几率
   */
  public setCriticalChance(chance: number): void {
    this.criticalChance = Math.max(0, Math.min(1, chance));
  }

  /**
   * 设置暴击倍率
   * @param multiplier 暴击倍率
   */
  public setCriticalMultiplier(multiplier: number): void {
    this.criticalMultiplier = Math.max(1, multiplier);
  }

  /**
   * 设置穿透值
   * @param penetration 穿透值
   */
  public setPenetration(penetration: number): void {
    this.penetration = Math.max(0, penetration);
  }

  /**
   * 设置抗性值
   * @param type 伤害类型
   * @param value 抗性值
   */
  public setResistance(type: DamageType, value: number): void {
    this.resistances.set(type, Math.max(0, Math.min(1, value)));
  }

  /**
   * 获取抗性值
   * @param type 伤害类型
   * @returns 抗性值
   */
  public getResistance(type: DamageType): number {
    return this.resistances.get(type) || 0;
  }

  /**
   * 获取伤害统计
   * @param sourceId 来源ID
   * @returns 伤害统计
   */
  public getDamageStats(sourceId: string) {
    return this.damageLogger.getStats(sourceId);
  }

  /**
   * 获取最近的伤害日志
   * @param count 日志数量
   * @returns 伤害日志列表
   */
  public getRecentDamageLogs(count: number = 10) {
    return this.damageLogger.getRecentLogs(count);
  }

  /**
   * 导出伤害统计
   * @returns 伤害统计数据
   */
  public exportDamageStats() {
    return this.damageLogger.exportStats();
  }

  /**
   * 导出伤害日志
   * @returns 伤害日志数据
   */
  public exportDamageLogs() {
    return this.damageLogger.exportLogs();
  }
} 