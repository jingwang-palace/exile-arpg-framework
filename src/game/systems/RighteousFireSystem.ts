import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';

// 正义之火配置
export interface RighteousFireConfig {
  damage: number;              // 每秒伤害
  radius: number;              // 作用半径
  manaCostPerSecond: number;   // 每秒魔力消耗
  healthCostPerSecond: number; // 每秒生命消耗
  enabled: boolean;            // 是否激活
  level: number;               // 技能等级
  damageInterval: number;      // 伤害间隔（毫秒）
}

// 视觉效果配置
export interface RighteousFireVisuals {
  showRadius: boolean;         // 显示作用范围
  radiusColor: number;         // 范围颜色
  radiusAlpha: number;         // 范围透明度
  fireParticles: boolean;      // 显示火焰粒子
  burnEffect: boolean;         // 显示燃烧效果
  screenShake: boolean;        // 屏幕震动
}

export class RighteousFireSystem extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  
  // 技能配置
  private config: RighteousFireConfig = {
    damage: 15,
    radius: 150,
    manaCostPerSecond: 5,
    healthCostPerSecond: 2,
    enabled: false,
    level: 1,
    damageInterval: 500  // 每0.5秒造成一次伤害
  };
  
  // 视觉效果配置
  private visuals: RighteousFireVisuals = {
    showRadius: true,
    radiusColor: 0xff4400,
    radiusAlpha: 0.3,
    fireParticles: false, // 暂时禁用粒子
    burnEffect: true,     // 启用燃烧效果
    screenShake: true     // 启用屏幕震动
  };
  
  // 系统状态
  private isActive: boolean = false;
  private lastDamageTime: number = 0;
  private lastCostTime: number = 0;
  private costInterval: number = 1000; // 每秒消耗资源
  
  // 视觉效果对象
  private radiusGraphics: Phaser.GameObjects.Graphics | null = null;
  private fireParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private fireParticleManager: any = null; // 使用any类型避免版本差异
  private playerFireEffect: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | null = null;
  
  // 受影响的敌人追踪
  private affectedEnemies: Set<string> = new Set();
  private enemyBurnEffects: Map<string, Phaser.GameObjects.Sprite> = new Map();
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, enemies: Phaser.Physics.Arcade.Group) {
    super();
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    
    this.createVisualEffects();
  }
  
  // 创建视觉效果
  private createVisualEffects(): void {
    // 创建范围显示图形
    this.radiusGraphics = this.scene.add.graphics();
    this.radiusGraphics.setDepth(1);
    
    // 暂时不创建复杂的视觉效果，避免纹理问题
    console.log('正义之火视觉效果已创建（简化版本）');
  }
  
  // 创建火焰粒子效果
  private createFireParticles(): void {
    // 先创建一个简单的火焰粒子纹理
    if (!this.scene.textures.exists('fire_particle')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xff4400, 1);
      graphics.fillCircle(8, 8, 6);
      graphics.generateTexture('fire_particle', 16, 16);
      graphics.destroy();
    }
    
    try {
      // 创建粒子管理器
      this.fireParticleManager = this.scene.add.particles(0, 0, 'fire_particle', {
        speed: { min: 20, max: 60 },
        scale: { start: 0.3, end: 0.1 },
        alpha: { start: 0.8, end: 0.1 },
        tint: [0xff4400, 0xff6600, 0xff8800, 0xffaa00],
        lifespan: 800,
        quantity: 3,
        frequency: 100,
        angle: { min: 0, max: 360 },
        gravityY: -50,
        blendMode: 'ADD'
      });
      
      if (this.fireParticleManager && this.fireParticleManager.emitters) {
        this.fireParticleEmitter = this.fireParticleManager.emitters.getAt(0);
        this.fireParticleManager.setDepth(3);
        if (this.fireParticleEmitter) {
          this.fireParticleEmitter.stop();
        }
      }
    } catch (error) {
      console.warn('无法创建火焰粒子效果:', error);
      this.visuals.fireParticles = false;
    }
  }
  
  // 创建玩家火焰效果
  private createPlayerFireEffect(): void {
    // 先创建玩家火焰光环纹理
    if (!this.scene.textures.exists('player_fire_aura')) {
      const graphics = this.scene.add.graphics();
      
      // 创建一个火焰光环效果
      graphics.fillStyle(0xff4400, 0.6);
      graphics.fillCircle(32, 32, 30);
      
      // 添加内圈
      graphics.fillStyle(0xff8800, 0.4);
      graphics.fillCircle(32, 32, 20);
      
      graphics.generateTexture('player_fire_aura', 64, 64);
      graphics.destroy();
    }
    
    try {
      this.playerFireEffect = this.scene.add.sprite(0, 0, 'player_fire_aura');
      this.playerFireEffect.setScale(1.5);
      this.playerFireEffect.setAlpha(0.7);
      this.playerFireEffect.setDepth(2);
      this.playerFireEffect.setVisible(false);
      
      // 创建缩放脉冲效果
      this.scene.add.tween({
        targets: this.playerFireEffect,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } catch (error) {
      console.warn('无法创建玩家火焰效果:', error);
      // 如果失败，使用简单的Graphics对象
      this.playerFireEffect = null;
    }
  }
  
  // 激活正义之火
  public activate(): boolean {
    if (this.isActive) return false;
    
    // 检查是否有足够的魔力
    const playerStats = (this.player as any).stats;
    if (playerStats && playerStats.currentMana < this.config.manaCostPerSecond) {
      this.emit('activationFailed', 'insufficient_mana');
      return false;
    }
    
    this.isActive = true;
    this.config.enabled = true;
    
    // 启动视觉效果
    this.startVisualEffects();
    
    // 重置计时器
    this.lastDamageTime = Date.now();
    this.lastCostTime = Date.now();
    
    this.emit('activated');
    return true;
  }
  
  // 停用正义之火
  public deactivate(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.config.enabled = false;
    
    // 停止视觉效果
    this.stopVisualEffects();
    
    // 清理敌人燃烧效果
    this.clearAllBurnEffects();
    
    this.emit('deactivated');
  }
  
  // 切换正义之火状态
  public toggle(): boolean {
    if (this.isActive) {
      this.deactivate();
      return false;
    } else {
      return this.activate();
    }
  }
  
  // 启动视觉效果
  private startVisualEffects(): void {
    console.log('正义之火视觉效果已启动');
  }
  
  // 停止视觉效果
  private stopVisualEffects(): void {
    // 清理范围显示
    if (this.radiusGraphics) {
      this.radiusGraphics.clear();
    }
    console.log('正义之火视觉效果已停止');
  }
  
  // 更新系统
  public update(): void {
    if (!this.isActive || !this.config.enabled) return;
    
    const currentTime = Date.now();
    
    // 更新视觉效果位置
    this.updateVisualPositions();
    
    // 检查资源消耗
    if (currentTime - this.lastCostTime >= this.costInterval) {
      if (!this.consumeResources()) {
        this.deactivate();
        return;
      }
      this.lastCostTime = currentTime;
    }
    
    // 检查伤害输出
    if (currentTime - this.lastDamageTime >= this.config.damageInterval) {
      this.dealDamageToEnemies();
      this.lastDamageTime = currentTime;
    }
    
    // 更新范围显示
    this.updateRadiusDisplay();
  }
  
  // 更新视觉效果位置
  private updateVisualPositions(): void {
    // 暂时简化，只保留基本功能
  }
  
  // 消耗资源
  private consumeResources(): boolean {
    const playerStats = (this.player as any).stats;
    if (!playerStats) return false;
    
    // 检查魔力
    if (playerStats.currentMana < this.config.manaCostPerSecond) {
      this.emit('resourceDepleted', 'mana');
      return false;
    }
    
    // 检查生命值（不能低于1）
    if (playerStats.currentHealth <= this.config.healthCostPerSecond) {
      this.emit('resourceDepleted', 'health');
      return false;
    }
    
    // 消耗资源
    playerStats.currentMana -= this.config.manaCostPerSecond;
    playerStats.currentHealth -= this.config.healthCostPerSecond;
    
    // 发出资源消耗事件
    this.emit('resourceConsumed', {
      mana: this.config.manaCostPerSecond,
      health: this.config.healthCostPerSecond
    });
    
    return true;
  }
  
  // 对敌人造成伤害
  private dealDamageToEnemies(): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    const radius = this.config.radius;
    const damage = this.config.damage;
    
    const currentAffectedEnemies = new Set<string>();
    
    this.enemies.children.getArray().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!enemySprite.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        enemySprite.x, enemySprite.y
      );
      
      if (distance <= radius) {
        const enemyId = (enemySprite as any).id || enemySprite.name;
        currentAffectedEnemies.add(enemyId);
        
        // 对敌人造成伤害
        this.damageEnemy(enemySprite, damage);
        
        // 添加燃烧效果
        if (!this.enemyBurnEffects.has(enemyId)) {
          this.addBurnEffect(enemySprite, enemyId);
        }
      }
    });
    
    // 移除不再范围内的敌人的燃烧效果
    this.affectedEnemies.forEach(enemyId => {
      if (!currentAffectedEnemies.has(enemyId)) {
        this.removeBurnEffect(enemyId);
      }
    });
    
    this.affectedEnemies = currentAffectedEnemies;
  }
  
  // 对单个敌人造成伤害
  private damageEnemy(enemy: Phaser.Physics.Arcade.Sprite, damage: number): void {
    // 应用伤害
    if ((enemy as any).takeDamage) {
      (enemy as any).takeDamage(damage);
    }
    
    // 创建伤害文字
    this.createDamageText(enemy.x, enemy.y - 20, damage, true);
    
    // 发出伤害事件
    this.emit('damageDealt', enemy, damage);
    
    // 屏幕震动效果
    if (this.visuals.screenShake) {
      this.scene.cameras.main.shake(50, 0.005);
    }
  }
  
  // 创建伤害文字
  private createDamageText(x: number, y: number, damage: number, isFire: boolean = false): void {
    const color = isFire ? '#ff4400' : '#ff0000';
    const damageText = this.scene.add.text(x, y, damage.toString(), {
      fontSize: '16px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    damageText.setOrigin(0.5);
    damageText.setDepth(10);
    
    // 伤害文字动画
    this.scene.add.tween({
      targets: damageText,
      y: y - 30,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }
  
  // 添加燃烧效果
  private addBurnEffect(enemy: Phaser.Physics.Arcade.Sprite, enemyId: string): void {
    // 创建燃烧效果纹理（如果不存在）
    if (!this.scene.textures.exists('burn_effect')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xff4400, 0.8);
      graphics.fillCircle(16, 16, 12);
      graphics.fillStyle(0xff8800, 0.6);
      graphics.fillCircle(16, 16, 8);
      graphics.fillStyle(0xffaa00, 0.4);
      graphics.fillCircle(16, 16, 4);
      graphics.generateTexture('burn_effect', 32, 32);
      graphics.destroy();
    }
    
    const burnEffect = this.scene.add.sprite(enemy.x, enemy.y, 'burn_effect');
    burnEffect.setScale(0.8);
    burnEffect.setDepth(3);
    burnEffect.setAlpha(0.8);
    
    // 创建脉冲效果
    this.scene.add.tween({
      targets: burnEffect,
      alpha: 0.4,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.enemyBurnEffects.set(enemyId, burnEffect);
    
    // 更新燃烧效果位置
    const updateBurnPosition = () => {
      if (burnEffect && enemy.active) {
        burnEffect.setPosition(enemy.x, enemy.y);
      }
    };
    
    // 定时更新位置
    const updateTimer = this.scene.time.addEvent({
      delay: 50,
      callback: updateBurnPosition,
      repeat: -1
    });
    
    // 保存定时器引用以便清理
    (burnEffect as any).updateTimer = updateTimer;
  }
  
  // 移除燃烧效果
  private removeBurnEffect(enemyId: string): void {
    const burnEffect = this.enemyBurnEffects.get(enemyId);
    if (burnEffect) {
      // 清理定时器
      if ((burnEffect as any).updateTimer) {
        (burnEffect as any).updateTimer.destroy();
      }
      
      // 淡出动画
      this.scene.add.tween({
        targets: burnEffect,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          burnEffect.destroy();
        }
      });
      
      this.enemyBurnEffects.delete(enemyId);
    }
  }
  
  // 清理所有燃烧效果
  private clearAllBurnEffects(): void {
    this.enemyBurnEffects.forEach((burnEffect, enemyId) => {
      this.removeBurnEffect(enemyId);
    });
    this.affectedEnemies.clear();
  }
  
  // 更新范围显示
  private updateRadiusDisplay(): void {
    if (!this.radiusGraphics) return;
    
    this.radiusGraphics.clear();
    
    // 只有在技能激活且显示范围开启时才绘制
    if (!this.isActive || !this.visuals.showRadius) {
      return;
    }
    
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // 绘制范围圆圈 - 外圈边框
    this.radiusGraphics.lineStyle(3, this.visuals.radiusColor, 0.8);
    this.radiusGraphics.strokeCircle(playerX, playerY, this.config.radius);
    
    // 绘制范围填充 - 内部半透明区域
    this.radiusGraphics.fillStyle(this.visuals.radiusColor, this.visuals.radiusAlpha);
    this.radiusGraphics.fillCircle(playerX, playerY, this.config.radius);
    
    // 添加脉冲效果
    const pulseRadius = this.config.radius * (0.8 + 0.2 * Math.sin(Date.now() * 0.005));
    this.radiusGraphics.lineStyle(2, this.visuals.radiusColor, 0.4);
    this.radiusGraphics.strokeCircle(playerX, playerY, pulseRadius);
  }
  
  // 升级技能
  public levelUp(): void {
    this.config.level++;
    
    // 提升技能属性
    this.config.damage = Math.floor(this.config.damage * 1.2);
    this.config.radius = Math.min(this.config.radius + 10, 250); // 最大半径限制
    this.config.manaCostPerSecond = Math.floor(this.config.manaCostPerSecond * 1.1);
    
    this.emit('levelUp', this.config.level);
  }
  
  // 设置技能配置
  public setConfig(newConfig: Partial<RighteousFireConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configChanged', this.config);
  }
  
  // 设置视觉效果配置
  public setVisuals(newVisuals: Partial<RighteousFireVisuals>): void {
    this.visuals = { ...this.visuals, ...newVisuals };
    this.emit('visualsChanged', this.visuals);
  }
  
  // 获取当前配置
  public getConfig(): RighteousFireConfig {
    return { ...this.config };
  }
  
  // 获取视觉配置
  public getVisuals(): RighteousFireVisuals {
    return { ...this.visuals };
  }
  
  // 检查是否激活
  public isActivated(): boolean {
    return this.isActive;
  }
  
  // 切换范围显示
  public toggleRadiusDisplay(show?: boolean): void {
    this.visuals.showRadius = show !== undefined ? show : !this.visuals.showRadius;
    if (!this.visuals.showRadius && this.radiusGraphics) {
      this.radiusGraphics.clear();
    }
  }
  
  // 销毁系统
  public destroy(): void {
    this.deactivate();
    this.clearAllBurnEffects();
    
    if (this.radiusGraphics) {
      this.radiusGraphics.destroy();
      this.radiusGraphics = null;
    }
    
    if (this.fireParticleManager) {
      this.fireParticleManager.destroy();
      this.fireParticleManager = null;
      this.fireParticleEmitter = null;
    }
    
    if (this.playerFireEffect) {
      this.playerFireEffect.destroy();
      this.playerFireEffect = null;
    }
    
    this.removeAllListeners();
  }
} 