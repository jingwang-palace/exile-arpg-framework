import Phaser from 'phaser';
import { EventBus } from '../../infrastructure/events/EventBus';
import { ISkill, ISkillInstance, SkillType } from '../../core/combat/types/Skill';
import { IDamage, DamageSourceType } from '../../core/combat/types/Damage';
import { IStatusEffect } from '../../core/combat/types/StatusEffect';
import { ICalculatedStats } from '../../core/interfaces/ICalculatedStats';

// 技能基础接口
export interface BaseSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cooldown: number;
  manaCost: number;
  type: 'active' | 'passive' | 'toggle';
  category: 'attack' | 'defense' | 'support';
  buildPath: 'speed' | 'boss' | 'balance' | 'core'; // BD路线
  requiredLevel: number; // 所需角色等级
}

// 主动技能接口
export interface ActiveSkill extends BaseSkill {
  type: 'active';
  damage?: number;
  range: number;
  area?: number;
  element?: 'physical' | 'fire' | 'ice' | 'lightning' | 'chaos';
  targetType: 'self' | 'enemy' | 'area' | 'direction';
  effects: SkillEffect[];
  scaling?: SkillScaling[]; // 技能成长
}

// 被动技能接口
export interface PassiveSkill extends BaseSkill {
  type: 'passive';
  bonuses: StatBonus[];
  requirements?: EquipmentRequirement[]; // 装备需求
}

// 切换技能接口
export interface ToggleSkill extends BaseSkill {
  type: 'toggle';
  drainRate: number;
  effects: SkillEffect[];
  radius?: number;
  requirements?: EquipmentRequirement[];
}

// 技能成长
export interface SkillScaling {
  stat: 'strength' | 'dexterity' | 'intelligence' | 'weaponDamage';
  ratio: number; // 成长比例
}

// 装备需求
export interface EquipmentRequirement {
  type: 'weapon' | 'armor' | 'unique';
  subType?: string;
  name?: string;
}

// 技能效果
export interface SkillEffect {
  type: 'damage' | 'heal' | 'dot' | 'buff' | 'debuff' | 'knockback' | 'stun' | 'chain' | 'pierce' | 'splash';
  value: number;
  duration?: number;
  element?: string;
  chance?: number;
  range?: number; // 连锁/穿透范围
  count?: number; // 连锁次数等
}

// 属性加成
export interface StatBonus {
  stat: 'damage' | 'defense' | 'speed' | 'health' | 'mana' | 'critChance' | 'critMultiplier' | 'attackSpeed' | 'areaRadius' | 'cooldownReduction';
  type: 'flat' | 'percent' | 'more'; // more是乘法加成
  value: number;
  condition?: string; // 条件触发
}

export class SkillSystem {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  
  // 技能数据库
  private skills: Map<string, ISkill> = new Map();
  
  // 冷却时间追踪
  private cooldowns: Map<string, number> = new Map();
  
  // 活跃的切换技能
  private activeToggles: Map<string, Phaser.Time.TimerEvent> = new Map();
  
  // 活跃效果
  private activeEffects: Map<string, any> = new Map();

  private eventBus: EventBus;
  private activeSkills: Map<string, ISkillInstance>;
  private playerStats: ICalculatedStats;

  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, enemies: Phaser.Physics.Arcade.Group, eventBus: EventBus, playerStats: ICalculatedStats) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    
    this.activeSkills = new Map();
    this.playerStats = playerStats;
    
    this.initializeSkills();
  }

  private initializeSkills() {
    // ====== 核心基础技能 ======
    this.addSkill('weapon_mastery', {
      id: 'weapon_mastery',
      name: '武器精通',
      description: '提升武器伤害，所有BD的基础',
      level: 0,
      maxLevel: 20,
      cooldown: 0,
      manaCost: 0,
      type: 'passive',
      category: 'attack',
      buildPath: 'core',
      requiredLevel: 1,
      bonuses: [
        { stat: 'damage', type: 'percent', value: 0.1 } // 每级10%武器伤害
      ]
    });

    // ====== 速刷BD路线 - 重范围清屏 ======
    this.addSkill('whirlwind', {
      id: 'whirlwind',
      name: '旋风斩',
      description: '围绕自身旋转攻击，完美的速刷技能',
      level: 0,
      maxLevel: 20,
      cooldown: 0,
      manaCost: 15,
      type: 'active',
      category: 'attack',
      buildPath: 'speed',
      requiredLevel: 12,
      damage: 120,
      range: 200,
      area: 200,
      element: 'physical',
      targetType: 'area',
      effects: [
        { type: 'damage', value: 120, element: 'physical' },
        { type: 'chain', value: 1, count: 3, range: 150 } // 可以连锁到附近敌人
      ],
      scaling: [
        { stat: 'strength', ratio: 1.5 },
        { stat: 'weaponDamage', ratio: 2.0 }
      ]
    });

    this.addSkill('speed_aura', {
      id: 'speed_aura',
      name: '疾行光环',
      description: '大幅提升移动和攻击速度，速刷必备',
      level: 0,
      maxLevel: 15,
      cooldown: 0,
      manaCost: 0,
      type: 'toggle',
      category: 'support',
      buildPath: 'speed',
      requiredLevel: 8,
      drainRate: 8,
      radius: 300,
      effects: [
        { type: 'buff', value: 1 }
      ]
    });

    this.addSkill('area_mastery', {
      id: 'area_mastery',
      name: '范围精通',
      description: '显著增加所有技能的作用范围',
      level: 0,
      maxLevel: 10,
      cooldown: 0,
      manaCost: 0,
      type: 'passive',
      category: 'support',
      buildPath: 'speed',
      requiredLevel: 15,
      bonuses: [
        { stat: 'areaRadius', type: 'percent', value: 0.2 } // 每级20%范围
      ]
    });

    this.addSkill('leap_slam', {
      id: 'leap_slam',
      name: '跳跃重击',
      description: '跳跃到目标位置造成范围伤害，机动性极强',
      level: 0,
      maxLevel: 20,
      cooldown: 3000,
      manaCost: 25,
      type: 'active',
      category: 'attack',
      buildPath: 'speed',
      requiredLevel: 10,
      damage: 200,
      range: 400,
      area: 150,
      element: 'physical',
      targetType: 'area',
      effects: [
        { type: 'damage', value: 200, element: 'physical' },
        { type: 'splash', value: 0.7, range: 100 } // 溅射70%伤害
      ]
    });

    // ====== 攻坚BD路线 - 重单体高伤 ======
    this.addSkill('devastate', {
      id: 'devastate',
      name: '毁灭打击',
      description: '蓄力重击，对单体造成巨额伤害',
      level: 0,
      maxLevel: 20,
      cooldown: 4000,
      manaCost: 40,
      type: 'active',
      category: 'attack',
      buildPath: 'boss',
      requiredLevel: 15,
      damage: 800,
      range: 120,
      element: 'physical',
      targetType: 'enemy',
      effects: [
        { type: 'damage', value: 800, element: 'physical' },
        { type: 'stun', value: 1, duration: 2000 },
        { type: 'debuff', value: 0.5, duration: 5000 } // 降低目标50%防御
      ],
      scaling: [
        { stat: 'strength', ratio: 3.0 },
        { stat: 'weaponDamage', ratio: 4.0 }
      ]
    });

    this.addSkill('fortress_stance', {
      id: 'fortress_stance',
      name: '要塞姿态',
      description: '大幅提升防御但降低移动速度，攻坚必备',
      level: 0,
      maxLevel: 15,
      cooldown: 0,
      manaCost: 0,
      type: 'toggle',
      category: 'defense',
      buildPath: 'boss',
      requiredLevel: 8,
      drainRate: 5,
      effects: [
        { type: 'buff', value: 1 }
      ]
    });

    this.addSkill('critical_mastery', {
      id: 'critical_mastery',
      name: '暴击精通',
      description: '大幅提升暴击率和暴击伤害',
      level: 0,
      maxLevel: 15,
      cooldown: 0,
      manaCost: 0,
      type: 'passive',
      category: 'attack',
      buildPath: 'boss',
      requiredLevel: 12,
      bonuses: [
        { stat: 'critChance', type: 'flat', value: 3 }, // 每级3%暴击
        { stat: 'critMultiplier', type: 'percent', value: 0.15 } // 每级15%暴击伤害
      ]
    });

    this.addSkill('execute', {
      id: 'execute',
      name: '处决',
      description: '对低血量敌人造成额外伤害，斩杀效果',
      level: 0,
      maxLevel: 10,
      cooldown: 8000,
      manaCost: 50,
      type: 'active',
      category: 'attack',
      buildPath: 'boss',
      requiredLevel: 20,
      damage: 400,
      range: 150,
      element: 'physical',
      targetType: 'enemy',
      effects: [
        { type: 'damage', value: 400, element: 'physical' },
        { type: 'damage', value: 1000, element: 'physical', condition: 'lowHealth' } // 低血量额外伤害
      ]
    });

    // ====== 平衡BD路线 - 均衡发展 ======
    this.addSkill('balanced_strike', {
      id: 'balanced_strike',
      name: '平衡打击',
      description: '攻防兼备的技能，适合各种情况',
      level: 0,
      maxLevel: 20,
      cooldown: 2000,
      manaCost: 20,
      type: 'active',
      category: 'attack',
      buildPath: 'balance',
      requiredLevel: 10,
      damage: 250,
      range: 150,
      area: 80,
      element: 'physical',
      targetType: 'area',
      effects: [
        { type: 'damage', value: 250, element: 'physical' },
        { type: 'heal', value: 50 } // 攻击时治疗自己
      ]
    });

    this.addSkill('adaptation', {
      id: 'adaptation',
      name: '适应性',
      description: '根据敌人数量调整伤害和防御',
      level: 0,
      maxLevel: 10,
      cooldown: 0,
      manaCost: 0,
      type: 'passive',
      category: 'support',
      buildPath: 'balance',
      requiredLevel: 15,
      bonuses: [
        { stat: 'damage', type: 'percent', value: 0.1, condition: 'multipleEnemies' },
        { stat: 'defense', type: 'percent', value: 0.2, condition: 'singleEnemy' }
      ]
    });

    this.addSkill('versatile_aura', {
      id: 'versatile_aura',
      name: '多面光环',
      description: '提供多种小幅加成的光环',
      level: 0,
      maxLevel: 15,
      cooldown: 0,
      manaCost: 0,
      type: 'toggle',
      category: 'support',
      buildPath: 'balance',
      requiredLevel: 12,
      drainRate: 6,
      radius: 250,
      effects: [
        { type: 'buff', value: 1 }
      ]
    });

    // ====== 特殊暗金装备相关技能 ======
    this.addSkill('berserker_rage', {
      id: 'berserker_rage',
      name: '狂战士之怒',
      description: '需要【狂战士之刃】，血量越低伤害越高',
      level: 0,
      maxLevel: 10,
      cooldown: 30000,
      manaCost: 0,
      type: 'toggle',
      category: 'attack',
      buildPath: 'boss',
      requiredLevel: 25,
      drainRate: 10,
      effects: [
        { type: 'buff', value: 1 }
      ],
      requirements: [
        { type: 'unique', name: '狂战士之刃' }
      ]
    });

    this.addSkill('storm_call', {
      id: 'storm_call',
      name: '风暴召唤',
      description: '需要【雷霆之杖】，召唤雷暴清理大范围敌人',
      level: 0,
      maxLevel: 15,
      cooldown: 12000,
      manaCost: 80,
      type: 'active',
      category: 'attack',
      buildPath: 'speed',
      requiredLevel: 22,
      damage: 600,
      range: 500,
      area: 300,
      element: 'lightning',
      targetType: 'area',
      effects: [
        { type: 'damage', value: 600, element: 'lightning' },
        { type: 'chain', value: 1, count: 5, range: 200 }
      ],
      requirements: [
        { type: 'unique', name: '雷霆之杖' }
      ]
    });

    this.addSkill('perfect_balance', {
      id: 'perfect_balance',
      name: '完美平衡',
      description: '需要【和谐之甲】，同时提供攻防加成',
      level: 0,
      maxLevel: 12,
      cooldown: 0,
      manaCost: 0,
      type: 'passive',
      category: 'support',
      buildPath: 'balance',
      requiredLevel: 20,
      bonuses: [
        { stat: 'damage', type: 'more', value: 0.25 },
        { stat: 'defense', type: 'more', value: 0.25 },
        { stat: 'cooldownReduction', type: 'percent', value: 0.1 }
      ],
      requirements: [
        { type: 'unique', name: '和谐之甲' }
      ]
    });
  }

  // 添加技能到数据库
  private addSkill(id: string, skill: ISkill) {
    this.skills.set(id, skill);
    console.log(`注册技能: ${skill.name} (${id})`);
  }

  // 添加公共的registerSkill方法以兼容测试
  public registerSkill(skill: ISkill) {
    this.addSkill(skill.id, skill);
  }

  /**
   * 初始化技能系统
   */
  public initialize(): void {
    // 初始化技能系统
    console.log('技能系统初始化完成');
    
    // 设置事件监听
    this.eventBus.on('skill-used', this.handleSkillUsed.bind(this));
    this.eventBus.on('skill-cooldown', this.handleSkillCooldown.bind(this));
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
   * 使用技能
   * @param skillId 技能ID
   * @param target 目标
   */
  public useSkill(skillId: string, target?: any): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return false;
    }

    // 检查冷却
    const activeSkill = this.activeSkills.get(skillId);
    if (activeSkill && activeSkill.cooldownRemaining > 0) {
      return false;
    }

    // 检查魔法消耗
    if (this.playerStats.mana < skill.manaCost) {
      return false;
    }

    // 创建技能实例
    const skillInstance: ISkillInstance = {
      id: skillId,
      cooldownRemaining: skill.cooldown,
      target: target
    };

    // 应用技能效果
    this.applySkillEffects(skill, target);

    // 更新状态
    this.activeSkills.set(skillId, skillInstance);
    this.playerStats.mana -= skill.manaCost;

    // 发送事件
    this.eventBus.emit('skill:used', {
      skillId: skillId,
      target: target
    });

    return true;
  }

  /**
   * 应用技能效果
   * @param skill 技能定义
   * @param target 目标
   */
  private applySkillEffects(skill: ISkill, target?: any): void {
    if (skill.effects.damage) {
      const damage: IDamage = {
        value: this.calculateSkillDamage(skill),
        type: DamageSourceType.SKILL,
        source: skill.id
      };
      this.eventBus.emit('damage:dealt', {
        damage: damage,
        target: target
      });
    }

    if (skill.effects.heal) {
      const healAmount = this.calculateSkillHeal(skill);
      this.eventBus.emit('heal:applied', {
        amount: healAmount,
        target: target
      });
    }

    if (skill.effects.buffs) {
      skill.effects.buffs.forEach(buffId => {
        this.eventBus.emit('buff:applied', {
          buffId: buffId,
          target: target
        });
      });
    }

    if (skill.effects.debuffs) {
      skill.effects.debuffs.forEach(debuffId => {
        this.eventBus.emit('debuff:applied', {
          debuffId: debuffId,
          target: target
        });
      });
    }
  }

  /**
   * 计算技能伤害
   * @param skill 技能定义
   */
  private calculateSkillDamage(skill: ISkill): number {
    if (!skill.effects.damage) {
      return 0;
    }

    let damage = skill.effects.damage.base;

    // 应用属性加成
    if (skill.effects.damage.scaling) {
      const scaling = skill.effects.damage.scaling;
      if (scaling.strength) {
        damage += this.playerStats.strength * scaling.strength;
      }
      if (scaling.dexterity) {
        damage += this.playerStats.dexterity * scaling.dexterity;
      }
      if (scaling.intelligence) {
        damage += this.playerStats.intelligence * scaling.intelligence;
      }
    }

    // 应用技能等级加成
    damage *= (1 + 0.1 * skill.level);

    return Math.floor(damage);
  }

  /**
   * 计算技能治疗量
   * @param skill 技能定义
   */
  private calculateSkillHeal(skill: ISkill): number {
    if (!skill.effects.heal) {
      return 0;
    }

    let heal = skill.effects.heal.base;

    // 应用智力加成
    if (skill.effects.heal.scaling?.intelligence) {
      heal += this.playerStats.intelligence * skill.effects.heal.scaling.intelligence;
    }

    // 应用技能等级加成
    heal *= (1 + 0.1 * skill.level);

    return Math.floor(heal);
  }

  /**
   * 处理技能使用事件
   */
  private handleSkillUsed(event: any): void {
    console.log(`技能 ${event.skillId} 被使用`);
  }

  /**
   * 处理技能冷却事件
   */
  private handleSkillCooldown(event: any): void {
    console.log(`技能 ${event.skillId} 冷却完成`);
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

  /**
   * 更新玩家属性
   * @param stats 新的属性值
   */
  public updatePlayerStats(stats: ICalculatedStats): void {
    this.playerStats = stats;
  }

  // 冷却时间管理
  private setCooldown(skillId: string, duration: number) {
    this.cooldowns.set(skillId, this.scene.time.now + duration);
  }

  private isOnCooldown(skillId: string): boolean {
    const cooldownEnd = this.cooldowns.get(skillId);
    return cooldownEnd ? this.scene.time.now < cooldownEnd : false;
  }

  public getCooldownRemaining(skillId: string): number {
    const cooldownEnd = this.cooldowns.get(skillId);
    if (!cooldownEnd) return 0;
    
    const remaining = cooldownEnd - this.scene.time.now;
    return Math.max(0, remaining);
  }

  // 魔力管理（简化版，实际应该连接到玩家属性系统）
  private hasEnoughMana(cost: number): boolean {
    // 这里应该检查实际的玩家魔力值
    return true; // 暂时总是返回true
  }

  private consumeMana(amount: number) {
    // 这里应该实际消耗玩家魔力
    console.log(`消耗魔力: ${amount}`);
  }

  public getAllSkills() {
    return Array.from(this.skills.values());
  }

  public getSkillsByBuildPath(buildPath: 'speed' | 'boss' | 'balance' | 'core') {
    return this.getAllSkills().filter(skill => skill.buildPath === buildPath);
  }

  public getSkillsByCategory(category: 'attack' | 'defense' | 'support') {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  public getActiveToggles() {
    return Array.from(this.activeToggles.keys());
  }

  // 更新系统
  public update() {
    // 清理过期的效果
    this.activeEffects.forEach((effect, id) => {
      if (!effect.active) {
        this.activeEffects.delete(id);
      }
    });
  }

  // 清理系统
  public destroy() {
    // 清理所有计时器
    this.activeToggles.forEach(timer => timer.destroy());
    this.activeToggles.clear();
    
    this.activeEffects.forEach(effect => {
      if (effect.destroy) effect.destroy();
    });
    this.activeEffects.clear();
    
    this.cooldowns.clear();
  }
}