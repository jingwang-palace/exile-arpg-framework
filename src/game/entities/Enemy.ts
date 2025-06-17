import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public maxHealth: number = 100;
  public damage: number = 10;
  private aggroRange: number = 250;
  private attackRange: number = 50;
  private attackCooldown: number = 0;
  private moveSpeed: number = 80;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isAggressive: boolean = true;
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 设置物理属性
    this.setSize(24, 24);
    this.setOffset(4, 8);
    this.setCollideWorldBounds(true);
    this.setDepth(5);
    
    // 创建血条
    this.createHealthBar();
    
    // 播放初始动画
    const animKey = `${texture}-idle`;
    if (scene.anims.exists(animKey)) {
      this.play(animKey);
    }
  }
  
  // 设置生命值
  setHealth(value: number) {
    this.health = value;
    this.maxHealth = value;
    this.updateHealthBar();
  }
  
  // 设置伤害
  setDamage(value: number) {
    this.damage = value;
  }
  
  // 创建血条
  private createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }
  
  // 更新血条
  private updateHealthBar() {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    
    // 背景
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(-15, -20, 30, 5);
    
    // 填充部分
    const healthPercentage = Math.max(0, this.health / this.maxHealth);
    if (healthPercentage > 0) {
      // 根据血量百分比选择颜色
      const color = healthPercentage > 0.6 ? 0x00ff00 : 
                    healthPercentage > 0.3 ? 0xffff00 : 0xff0000;
                    
      this.healthBar.fillStyle(color, 1);
      this.healthBar.fillRect(-15, -20, 30 * healthPercentage, 5);
    }
  }
  
  // 受到伤害
  takeDamage(amount: number) {
    this.health -= amount;
    this.updateHealthBar();
    
    // 显示伤害数字
    this.showDamageNumber(amount);
    
    // 受击效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // 检查是否死亡
    if (this.health <= 0) {
      this.die();
    }
  }
  
  // 显示伤害数字
  private showDamageNumber(amount: number) {
    // 创建伤害文本
    const damageText = this.scene.add.text(this.x, this.y - 20, `-${amount}`, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });
    damageText.setOrigin(0.5);
    
    // 添加动画和自动销毁
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        damageText.destroy();
      }
    });
  }
  
  // 设置目标
  setTarget(target: Phaser.Physics.Arcade.Sprite) {
    this.target = target;
  }
  
  // 死亡处理
  die() {
    // 清理血条
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    
    // 播放死亡动画
    const deathAnim = `${this.texture.key}-death`;
    if (this.scene.anims.exists(deathAnim)) {
      this.play(deathAnim);
      this.once('animationcomplete', () => {
        this.destroy();
      });
    } else {
      // 如果没有死亡动画，添加一个简单的消失效果
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        onComplete: () => {
          this.destroy();
        }
      });
    }
  }
  
  // 每帧更新
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // 更新血条位置
    if (this.healthBar) {
      this.healthBar.x = this.x;
      this.healthBar.y = this.y;
    }
    
    // 如果没有目标，不做其他更新
    if (!this.target) return;
    
    // 计算与目标的距离
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );
    
    // 更新攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    
    // 如果在仇恨范围内，追踪目标
    if (distance < this.aggroRange && this.isAggressive) {
      // 如果在攻击范围内，攻击目标
      if (distance < this.attackRange) {
        // 停止移动
        this.setVelocity(0, 0);
        
        // 如果冷却完成，攻击
        if (this.attackCooldown <= 0) {
          this.attack();
          this.attackCooldown = 1500; // 1.5秒冷却
        }
      } else {
        // 向目标移动
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const vx = Math.cos(angle) * this.moveSpeed;
        const vy = Math.sin(angle) * this.moveSpeed;
        
        this.setVelocity(vx, vy);
        
        // 设置面向
        if (vx < 0) {
          this.flipX = true;
        } else if (vx > 0) {
          this.flipX = false;
        }
        
        // 播放移动动画
        const moveAnim = `${this.texture.key}-move`;
        if (this.scene.anims.exists(moveAnim) && !this.anims.isPlaying) {
          this.play(moveAnim);
        }
      }
    } else {
      // 如果不在仇恨范围内，停止移动
      this.setVelocity(0, 0);
      
      // 播放闲置动画
      const idleAnim = `${this.texture.key}-idle`;
      if (this.scene.anims.exists(idleAnim) && !this.anims.isPlaying) {
        this.play(idleAnim);
      }
    }
  }
  
  // 攻击处理
  private attack() {
    // 播放攻击动画
    const attackAnim = `${this.texture.key}-attack`;
    if (this.scene.anims.exists(attackAnim)) {
      this.play(attackAnim);
    }
    
    // 实际伤害应该由碰撞系统处理
    // 这里只是模拟攻击行为
  }
} 