import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';
import { AutoAttackSystem, AttackShape } from '../systems/AutoAttackSystem';
import { RighteousFireSystem } from '../systems/RighteousFireSystem';
import { AutoPickupSystem } from '../systems/AutoPickupSystem';
import { LootSystem } from '../systems/LootSystem';

// 战斗状态枚举
export enum CombatState {
  IDLE = 'idle',
  COMBAT = 'combat',
  VICTORY = 'victory',
  DEFEATED = 'defeated'
}

// 专精类型枚举
export enum SpecializationType {
  MELEE_STRIKE = 'melee_strike',    // 打击专精
  RIGHTEOUS_FIRE = 'righteous_fire' // 正义之火专精
}

// 战斗统计
export interface CombatStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  enemiesKilled: number;
  itemsPickedUp: number;
  goldEarned: number;
  experienceGained: number;
  combatTime: number;
}

export class CombatManager extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  
  // 系统组件
  private autoAttackSystem: AutoAttackSystem;
  private righteousFireSystem: RighteousFireSystem;
  private autoPickupSystem: AutoPickupSystem;
  private lootSystem: LootSystem;
  
  // 战斗状态
  private currentState: CombatState = CombatState.IDLE;
  private currentSpecialization: SpecializationType | null = null;
  private combatStartTime: number = 0;
  private stats: CombatStats = {
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    enemiesKilled: 0,
    itemsPickedUp: 0,
    goldEarned: 0,
    experienceGained: 0,
    combatTime: 0
  };
  
  // 战斗设置
  private settings = {
    autoEngageCombat: true,     // 自动进入战斗
    combatRadius: 200,          // 战斗半径
    showCombatUI: true,         // 显示战斗UI
    pauseOnVictory: false,      // 胜利时暂停
    autoLoot: true,             // 自动拾取
    experienceMultiplier: 1.0   // 经验倍数
  };
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, enemies: Phaser.Physics.Arcade.Group) {
    super();
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    
    this.initializeSystems();
    this.setupEventListeners();
  }
  
  // 初始化所有系统
  private initializeSystems(): void {
    // 初始化自动拾取系统
    this.autoPickupSystem = new AutoPickupSystem(this.scene, this.player);
    
    // 初始化掉落系统
    this.lootSystem = new LootSystem(this.scene, this.autoPickupSystem);
    
    // 初始化自动攻击系统
    this.autoAttackSystem = new AutoAttackSystem(this.scene, this.player, this.enemies);
    
    // 初始化正义之火系统
    this.righteousFireSystem = new RighteousFireSystem(this.scene, this.player, this.enemies);
  }
  
  // 设置事件监听器
  private setupEventListeners(): void {
    // 自动攻击系统事件
    this.autoAttackSystem.on('attackExecuted', (config, targets) => {
      this.stats.totalDamageDealt += config.damage * targets.length;
      this.emit('damageDealt', config.damage * targets.length);
    });
    
    this.autoAttackSystem.on('damageDealt', (target, damage) => {
      this.checkEnemyDeath(target);
    });
    
    // 正义之火系统事件
    this.righteousFireSystem.on('damageDealt', (target, damage) => {
      this.stats.totalDamageDealt += damage;
      this.checkEnemyDeath(target);
      this.emit('damageDealt', damage);
    });
    
    this.righteousFireSystem.on('resourceConsumed', (costs) => {
      this.emit('resourceConsumed', costs);
    });
    
    // 自动拾取系统事件
    this.autoPickupSystem.on('itemPickedUp', (item) => {
      this.stats.itemsPickedUp++;
      if (item.type === 'currency' && item.currencyType === 'gold') {
        this.stats.goldEarned += item.stackSize;
      }
      this.emit('itemPickedUp', item);
    });
    
    // 掉落系统事件
    this.lootSystem.on('lootDropped', (data) => {
      this.emit('lootDropped', data);
    });
  }
  
  // 设置专精
  public setSpecialization(type: SpecializationType): boolean {
    // 停用当前专精
    if (this.currentSpecialization === SpecializationType.MELEE_STRIKE) {
      this.autoAttackSystem.setActiveSkill('');
    } else if (this.currentSpecialization === SpecializationType.RIGHTEOUS_FIRE) {
      this.righteousFireSystem.deactivate();
    }
    
    this.currentSpecialization = type;
    
    switch (type) {
      case SpecializationType.MELEE_STRIKE:
        // 激活打击专精 - 默认使用重击
        return this.autoAttackSystem.setActiveSkill('heavy_strike');
        
      case SpecializationType.RIGHTEOUS_FIRE:
        // 激活正义之火专精
        return this.righteousFireSystem.activate();
        
      default:
        this.currentSpecialization = null;
        return false;
    }
  }
  
  // 切换打击技能
  public switchMeleeSkill(skillId: string): boolean {
    if (this.currentSpecialization !== SpecializationType.MELEE_STRIKE) {
      console.warn('当前未选择打击专精');
      return false;
    }
    
    return this.autoAttackSystem.setActiveSkill(skillId);
  }
  
  // 获取可用的打击技能
  public getAvailableMeleeSkills(): Map<string, any> {
    return this.autoAttackSystem.getAllSkills();
  }
  
  // 切换正义之火状态（独立功能，不需要专精）
  public toggleRighteousFire(): boolean {
    return this.righteousFireSystem.toggle();
  }
  
  // 检查敌人死亡
  private checkEnemyDeath(enemy: Phaser.Physics.Arcade.Sprite): void {
    const enemyHealth = (enemy as any).health || (enemy as any).currentHealth;
    
    if (enemyHealth <= 0) {
      this.handleEnemyDeath(enemy);
    }
  }
  
  // 处理敌人死亡
  private handleEnemyDeath(enemy: Phaser.Physics.Arcade.Sprite): void {
    this.stats.enemiesKilled++;
    
    // 获取敌人信息
    const enemyId = (enemy as any).monsterId || (enemy as any).id || 'unknown';
    const enemyLevel = (enemy as any).level || 1;
    const isElite = (enemy as any).isElite || false;
    const isBoss = (enemy as any).isBoss || false;
    
    // 处理掉落
    if (this.settings.autoLoot) {
      this.lootSystem.processMonsterDeath(
        enemyId,
        enemy.x,
        enemy.y,
        enemyLevel,
        isElite,
        isBoss
      );
    }
    
    // 给予经验
    const baseExperience = enemyLevel * 10;
    let experience = Math.floor(baseExperience * this.settings.experienceMultiplier);
    
    if (isElite) experience *= 2;
    if (isBoss) experience *= 5;
    
    this.stats.experienceGained += experience;
    
    // 发出敌人死亡事件
    this.emit('enemyKilled', {
      enemy,
      enemyId,
      level: enemyLevel,
      experience,
      isElite,
      isBoss
    });
    
    // 检查战斗状态
    this.checkCombatState();
  }
  
  // 检查战斗状态
  private checkCombatState(): void {
    const nearbyEnemies = this.getNearbyEnemies();
    
    if (nearbyEnemies.length === 0 && this.currentState === CombatState.COMBAT) {
      this.endCombat(true);
    } else if (nearbyEnemies.length > 0 && this.currentState === CombatState.IDLE) {
      this.startCombat();
    }
  }
  
  // 开始战斗
  private startCombat(): void {
    this.currentState = CombatState.COMBAT;
    this.combatStartTime = Date.now();
    
    this.emit('combatStarted');
  }
  
  // 结束战斗
  private endCombat(victory: boolean): void {
    const endTime = Date.now();
    this.stats.combatTime += endTime - this.combatStartTime;
    
    if (victory) {
      this.currentState = CombatState.VICTORY;
      this.emit('combatVictory', this.stats);
    } else {
      this.currentState = CombatState.DEFEATED;
      this.emit('combatDefeated', this.stats);
    }
    
    // 暂停处理
    if (this.settings.pauseOnVictory && victory) {
      this.scene.scene.pause();
    }
    
    // 重置为空闲状态
    this.scene.time.delayedCall(1000, () => {
      this.currentState = CombatState.IDLE;
    });
  }
  
  // 获取附近敌人
  private getNearbyEnemies(): Phaser.Physics.Arcade.Sprite[] {
    const nearbyEnemies: Phaser.Physics.Arcade.Sprite[] = [];
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.enemies.children.getArray().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!enemySprite.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        enemySprite.x, enemySprite.y
      );
      
      if (distance <= this.settings.combatRadius) {
        nearbyEnemies.push(enemySprite);
      }
    });
    
    return nearbyEnemies;
  }
  
  // 更新所有系统
  public update(): void {
    // 更新自动攻击系统
    if (this.currentSpecialization === SpecializationType.MELEE_STRIKE) {
      this.autoAttackSystem.update();
    }
    
    // 总是更新正义之火系统（如果激活的话）
    this.righteousFireSystem.update();
    
    // 总是更新自动拾取系统
    this.autoPickupSystem.update();
    
    // 检查战斗状态
    if (this.settings.autoEngageCombat) {
      this.checkCombatState();
    }
  }
  
  // 手动添加掉落物品（用于测试）
  public addTestLoot(x: number, y: number): void {
    this.lootSystem.processMonsterDeath('test_monster', x, y, 10);
  }
  
  // 获取当前专精
  public getCurrentSpecialization(): SpecializationType | null {
    return this.currentSpecialization;
  }
  
  // 获取战斗状态
  public getCombatState(): CombatState {
    return this.currentState;
  }
  
  // 获取战斗统计
  public getCombatStats(): CombatStats {
    return { ...this.stats };
  }
  
  // 重置战斗统计
  public resetStats(): void {
    this.stats = {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      enemiesKilled: 0,
      itemsPickedUp: 0,
      goldEarned: 0,
      experienceGained: 0,
      combatTime: 0
    };
    
    this.emit('statsReset');
  }
  
  // 设置战斗设置
  public setSettings(newSettings: Partial<typeof this.settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('settingsChanged', this.settings);
  }
  
  // 获取当前设置
  public getSettings(): typeof this.settings {
    return { ...this.settings };
  }
  
  // 获取子系统引用
  public getAutoAttackSystem(): AutoAttackSystem {
    return this.autoAttackSystem;
  }
  
  public getRighteousFireSystem(): RighteousFireSystem {
    return this.righteousFireSystem;
  }
  
  public getAutoPickupSystem(): AutoPickupSystem {
    return this.autoPickupSystem;
  }
  
  public getLootSystem(): LootSystem {
    return this.lootSystem;
  }
  
  // 切换攻击范围显示
  public toggleAttackRangeDisplay(show?: boolean): void {
    this.autoAttackSystem.toggleRangeDisplay(show);
  }
  
  // 切换正义之火范围显示
  public toggleRighteousFireRange(show?: boolean): void {
    this.righteousFireSystem.toggleRadiusDisplay(show);
  }
  
  // 切换拾取范围显示
  public togglePickupRangeDisplay(show?: boolean): void {
    this.autoPickupSystem.toggleRangeDisplay(show);
  }
  
  // 销毁管理器
  public destroy(): void {
    this.autoAttackSystem.destroy();
    this.righteousFireSystem.destroy();
    this.autoPickupSystem.destroy();
    this.lootSystem.destroy();
    
    this.removeAllListeners();
  }
} 