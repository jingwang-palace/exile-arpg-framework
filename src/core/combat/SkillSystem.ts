import { EventBus } from '../../infrastructure/events/EventBus';
import { ISkill, ISkillInstance, SkillType } from './types/Skill';
import { IDamage, DamageSourceType } from './types/Damage';
import { IStatusEffect } from './types/StatusEffect';

/**
 * 技能系统
 * 负责管理游戏中的技能，包括技能的释放、冷却和效果应用
 */
export class SkillSystem {
  private eventBus: EventBus;
  private skills: Map<string, ISkill>;
  private activeSkills: Map<string, ISkillInstance>;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.skills = new Map();
    this.activeSkills = new Map();
  }

  /**
   * 初始化技能系统
   */
  public initialize(): void {
    // 注册技能相关事件监听
    this.eventBus.on('skill:used', this.handleSkillUsed.bind(this));
    this.eventBus.on('skill:cooldown', this.handleSkillCooldown.bind(this));
  }

  /**
   * 更新技能系统
   * @param deltaTime 帧间隔时间
   */
  public update(deltaTime: number): void {
    // 更新所有激活技能的冷却时间
    for (const [id, skillInstance] of this.activeSkills) {
      if (skillInstance.cooldownRemaining > 0) {
        skillInstance.cooldownRemaining -= deltaTime;
        if (skillInstance.cooldownRemaining <= 0) {
          skillInstance.cooldownRemaining = 0;
          this.eventBus.emit('skill:ready', { skillId: id });
        }
      }
    }
  }

  /**
   * 注册技能
   * @param skill 技能定义
   */
  public registerSkill(skill: ISkill): void {
    this.skills.set(skill.id, skill);
  }

  /**
   * 使用技能
   * @param skillId 技能ID
   * @param caster 施法者
   * @param target 目标
   */
  public useSkill(skillId: string, caster: any, target: any): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      console.error(`Skill not found: ${skillId}`);
      return;
    }

    // 检查技能是否可用
    const skillInstance = this.activeSkills.get(skillId);
    if (skillInstance && skillInstance.cooldownRemaining > 0) {
      console.warn(`Skill ${skillId} is on cooldown`);
      return;
    }

    // 检查施法者魔法值
    if (caster.mana < skill.manaCost) {
      console.warn(`Not enough mana to cast skill ${skillId}`);
      return;
    }

    // 消耗魔法值
    caster.mana -= skill.manaCost;

    // 创建技能实例
    const newSkillInstance: ISkillInstance = {
      skill,
      owner: caster,
      cooldownRemaining: skill.cooldown,
      isActive: true,
      lastUsedTime: Date.now()
    };

    // 更新技能实例
    this.activeSkills.set(skillId, newSkillInstance);

    // 触发技能效果
    this.applySkillEffects(skill, caster, target);

    // 发送技能使用事件
    this.eventBus.emit('skill:used', {
      skillId,
      caster,
      target,
      timestamp: Date.now()
    });
  }

  /**
   * 应用技能效果
   * @param skill 技能定义
   * @param caster 施法者
   * @param target 目标
   */
  private applySkillEffects(skill: ISkill, caster: any, target: any): void {
    // 应用伤害效果
    if (skill.effects.damage) {
      const damage: IDamage = {
        type: skill.effects.damage.type || 'physical',
        sourceType: DamageSourceType.SKILL,
        baseAmount: skill.effects.damage.base,
        critical: false,
        criticalMultiplier: 1,
        penetration: 0,
        source: caster,
        target,
        timestamp: Date.now()
      };
      this.eventBus.emit('damage:calculate', damage);
    }

    // 应用治疗效果
    if (skill.effects.heal) {
      const healAmount = skill.effects.heal.base;
      this.eventBus.emit('heal:apply', {
        amount: healAmount,
        target,
        source: caster
      });
    }

    // 应用增益效果
    if (skill.effects.buffs) {
      for (const buffId of skill.effects.buffs) {
        const buff: IStatusEffect = {
          id: buffId,
          type: 'buff',
          duration: skill.duration,
          source: caster,
          target
        };
        this.eventBus.emit('status:apply', buff);
      }
    }

    // 应用减益效果
    if (skill.effects.debuffs) {
      for (const debuffId of skill.effects.debuffs) {
        const debuff: IStatusEffect = {
          id: debuffId,
          type: 'debuff',
          duration: skill.duration,
          source: caster,
          target
        };
        this.eventBus.emit('status:apply', debuff);
      }
    }
  }

  /**
   * 处理技能使用事件
   * @param data 事件数据
   */
  private handleSkillUsed(data: any): void {
    // 处理技能使用后的逻辑
  }

  /**
   * 处理技能冷却事件
   * @param data 事件数据
   */
  private handleSkillCooldown(data: any): void {
    // 处理技能冷却相关的逻辑
  }

  /**
   * 获取技能定义
   * @param skillId 技能ID
   */
  public getSkill(skillId: string): ISkill | undefined {
    return this.skills.get(skillId);
  }

  /**
   * 获取技能实例
   * @param skillId 技能ID
   */
  public getSkillInstance(skillId: string): ISkillInstance | undefined {
    return this.activeSkills.get(skillId);
  }
} 