import { EventBus } from '../../infrastructure/events/EventBus';
import { IStatusEffect, IStatusEffectInstance, StatusEffectType } from './types/StatusEffect';
import { IDamage, DamageType, DamageSourceType } from './types/Damage';

/**
 * 状态效果管理系统
 * 负责管理游戏中的状态效果，包括增益、减益、持续伤害等
 */
export class StatusEffectManager {
  private eventBus: EventBus;
  private activeEffects: Map<string, IStatusEffectInstance>;
  private effectTicks: Map<string, number>;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.activeEffects = new Map();
    this.effectTicks = new Map();
  }

  /**
   * 初始化状态效果管理系统
   */
  public initialize(): void {
    // 注册状态效果相关事件监听
    this.eventBus.on('status:apply', this.handleStatusApply.bind(this));
    this.eventBus.on('status:remove', this.handleStatusRemove.bind(this));
    this.eventBus.on('status:update', this.handleStatusUpdate.bind(this));
  }

  /**
   * 更新状态效果系统
   * @param deltaTime 帧间隔时间
   */
  public update(deltaTime: number): void {
    for (const [id, effect] of this.activeEffects) {
      if (!effect.isActive) continue;

      // 更新持续时间
      effect.remainingDuration -= deltaTime;
      
      // 检查效果是否结束
      if (effect.remainingDuration <= 0 && !effect.effect.isPermanent) {
        this.removeEffect(id, effect.effect.target);
        continue;
      }

      // 处理持续效果（DOT/HOT）
      if (effect.effect.effects.damage || effect.effect.effects.healing) {
        const lastTick = this.effectTicks.get(id) || 0;
        const currentTime = Date.now();
        
        if (currentTime - lastTick >= (effect.effect.effects.damage?.interval || effect.effect.effects.healing?.interval || 1000)) {
          this.processEffectTick(effect);
          this.effectTicks.set(id, currentTime);
        }
      }
    }
  }

  /**
   * 应用状态效果
   * @param effect 状态效果
   */
  public applyEffect(effect: IStatusEffect): void {
    const existingEffect = this.activeEffects.get(effect.id);
    
    if (existingEffect) {
      // 处理可叠加效果
      if (effect.isStackable) {
        if (existingEffect.effect.currentStacks < effect.maxStacks) {
          existingEffect.effect.currentStacks++;
          this.updateEffectStats(existingEffect);
        }
      } else {
        // 刷新持续时间
        existingEffect.remainingDuration = effect.duration;
      }
    } else {
      // 创建新效果
      const newEffect: IStatusEffectInstance = {
        effect: {
          ...effect,
          currentStacks: 1,
          startTime: Date.now(),
          endTime: effect.isPermanent ? Infinity : Date.now() + effect.duration * 1000
        },
        remainingDuration: effect.duration,
        isActive: true,
        lastTickTime: Date.now()
      };

      this.activeEffects.set(effect.id, newEffect);
      this.applyEffectStats(newEffect);
    }

    this.eventBus.emit('status:applied', { effect });
  }

  /**
   * 移除状态效果
   * @param effectId 效果ID
   * @param target 目标
   */
  public removeEffect(effectId: string, target: any): void {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      this.removeEffectStats(effect);
      this.activeEffects.delete(effectId);
      this.effectTicks.delete(effectId);
      this.eventBus.emit('status:removed', { effectId, target });
    }
  }

  /**
   * 处理状态效果应用事件
   * @param data 事件数据
   */
  private handleStatusApply(data: { effect: IStatusEffect }): void {
    this.applyEffect(data.effect);
  }

  /**
   * 处理状态效果移除事件
   * @param data 事件数据
   */
  private handleStatusRemove(data: { effectId: string; target: any }): void {
    this.removeEffect(data.effectId, data.target);
  }

  /**
   * 处理状态效果更新事件
   * @param data 事件数据
   */
  private handleStatusUpdate(data: { effectId: string; updates: Partial<IStatusEffect> }): void {
    const effect = this.activeEffects.get(data.effectId);
    if (effect) {
      Object.assign(effect.effect, data.updates);
      this.updateEffectStats(effect);
    }
  }

  /**
   * 处理效果触发
   * @param effect 效果实例
   */
  private processEffectTick(effect: IStatusEffectInstance): void {
    // 处理持续伤害
    if (effect.effect.effects.damage) {
      const damage: IDamage = {
        type: effect.effect.effects.damage.type as DamageType,
        sourceType: DamageSourceType.DOT,
        baseAmount: effect.effect.effects.damage.amount * effect.effect.currentStacks,
        critical: false,
        criticalMultiplier: 1,
        penetration: 0,
        source: effect.effect.source,
        target: effect.effect.target,
        timestamp: Date.now()
      };
      this.eventBus.emit('damage:calculate', damage);
    }

    // 处理持续治疗
    if (effect.effect.effects.healing) {
      const healAmount = effect.effect.effects.healing.amount * effect.effect.currentStacks;
      this.eventBus.emit('heal:apply', {
        amount: healAmount,
        target: effect.effect.target,
        source: effect.effect.source
      });
    }
  }

  /**
   * 应用效果属性
   * @param effect 效果实例
   */
  private applyEffectStats(effect: IStatusEffectInstance): void {
    if (effect.effect.effects.attributes) {
      const { attributes } = effect.effect.effects;
      Object.entries(attributes).forEach(([key, value]) => {
        if (effect.effect.target.attributes) {
          effect.effect.target.attributes[key] = (effect.effect.target.attributes[key] || 0) + value;
        }
      });
    }

    if (effect.effect.effects.movement) {
      const { movement } = effect.effect.effects;
      if (effect.effect.target.movement) {
        effect.effect.target.movement.speed *= movement.speedModifier;
        effect.effect.target.movement.canMove = movement.canMove;
      }
    }
  }

  /**
   * 移除效果属性
   * @param effect 效果实例
   */
  private removeEffectStats(effect: IStatusEffectInstance): void {
    if (effect.effect.effects.attributes) {
      const { attributes } = effect.effect.effects;
      Object.entries(attributes).forEach(([key, value]) => {
        if (effect.effect.target.attributes) {
          effect.effect.target.attributes[key] = (effect.effect.target.attributes[key] || 0) - value;
        }
      });
    }

    if (effect.effect.effects.movement) {
      const { movement } = effect.effect.effects;
      if (effect.effect.target.movement) {
        effect.effect.target.movement.speed /= movement.speedModifier;
        effect.effect.target.movement.canMove = true;
      }
    }
  }

  /**
   * 更新效果属性
   * @param effect 效果实例
   */
  private updateEffectStats(effect: IStatusEffectInstance): void {
    this.removeEffectStats(effect);
    this.applyEffectStats(effect);
  }

  /**
   * 获取目标的所有状态效果
   * @param target 目标
   * @returns 状态效果列表
   */
  public getTargetEffects(target: any): IStatusEffectInstance[] {
    return Array.from(this.activeEffects.values())
      .filter(effect => effect.effect.target === target);
  }

  /**
   * 检查目标是否有特定状态效果
   * @param target 目标
   * @param effectId 效果ID
   * @returns 是否存在效果
   */
  public hasEffect(target: any, effectId: string): boolean {
    return Array.from(this.activeEffects.values())
      .some(effect => effect.effect.target === target && effect.effect.id === effectId);
  }
} 