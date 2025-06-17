import Phaser from 'phaser';
import { 
  SkillDescription, 
  SkillEffect, 
  TargetType,
  ElementType
} from './SkillTypes';

export class SkillFactory {
  private scene: Phaser.Scene;
  private effectsGroup: Phaser.GameObjects.Group;
  private projectilesGroup: Phaser.Physics.Arcade.Group;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.effectsGroup = scene.add.group();
    this.projectilesGroup = scene.physics.add.group();
  }
  
  // 创建技能效果
  public createSkillEffect(
    skill: SkillDescription,
    skillLevel: number,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number
  ): void {
    // 根据技能类型和目标类型创建不同的效果
    const levelMultiplier = 1 + (skillLevel - 1) * 0.2; // 每级提升20%威力
    
    switch (skill.targetType) {
      case TargetType.SELF:
        this.createSelfEffect(skill, source, levelMultiplier);
        break;
        
      case TargetType.SINGLE:
        this.createSingleTargetEffect(skill, source, targetX, targetY, levelMultiplier);
        break;
        
      case TargetType.GROUND:
        this.createGroundEffect(skill, source, targetX, targetY, levelMultiplier);
        break;
        
      case TargetType.DIRECTION:
        this.createDirectionalEffect(skill, source, targetX, targetY, levelMultiplier);
        break;
        
      case TargetType.MULTI:
        this.createMultiTargetEffect(skill, source, targetX, targetY, levelMultiplier);
        break;
    }
  }
  
  // 自身效果（增益/治疗等）
  private createSelfEffect(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    levelMultiplier: number
  ): void {
    // 创建效果动画
    const effect = this.scene.add.sprite(source.x, source.y, 'skill_effects');
    effect.setDepth(source.depth + 1);
    
    // 根据技能元素类型选择动画
    const animKey = this.getAnimationKeyForElement(skill.effects[0]?.element || ElementType.NONE, 'self');
    
    // 播放动画
    effect.play(animKey);
    
    // 应用效果
    skill.effects.forEach(effect => {
      this.applyEffect(effect, source, source, levelMultiplier);
    });
    
    // 动画完成后移除
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }
  
  // 单体目标效果（射弹、直接伤害等）
  private createSingleTargetEffect(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    levelMultiplier: number
  ): void {
    const element = skill.effects[0]?.element || ElementType.NONE;
    
    // 根据距离判断是否需要创建投射物
    const distance = Phaser.Math.Distance.Between(source.x, source.y, targetX, targetY);
    
    if (distance > 50) {
      // 创建投射物
      this.createProjectile(skill, source, targetX, targetY, levelMultiplier);
    } else {
      // 距离近，直接创建命中效果
      const effect = this.scene.add.sprite(targetX, targetY, 'skill_effects');
      effect.setDepth(source.depth + 1);
      
      // 选择动画
      const animKey = this.getAnimationKeyForElement(element, 'impact');
      effect.play(animKey);
      
      // 应用效果
      skill.effects.forEach(effectData => {
        // 这里应该检测目标，但为简化代码先忽略
        // 实际项目中需要使用物理系统或其他方式检测目标
      });
      
      // 动画完成后移除
      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    }
  }
  
  // 地面效果（AOE、持续伤害区域等）
  private createGroundEffect(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    levelMultiplier: number
  ): void {
    const element = skill.effects[0]?.element || ElementType.NONE;
    const radius = skill.effects[0]?.radius || 100;
    
    // 创建地面效果
    const effect = this.scene.add.sprite(targetX, targetY, 'skill_effects');
    effect.setDepth(source.depth - 1); // 设置在角色下方
    effect.setScale(radius / 50); // 根据半径调整大小
    
    // 选择动画
    const animKey = this.getAnimationKeyForElement(element, 'ground');
    effect.play(animKey);
    
    // 对于持续效果，设置计时器
    const duration = skill.effects[0]?.duration || 1000;
    const tickRate = skill.effects[0]?.tickRate || 500;
    
    // 创建物理区域用于检测
    const areaCollider = this.scene.physics.add.circle(targetX, targetY, radius);
    const area = new Phaser.GameObjects.Zone(this.scene, targetX, targetY, radius * 2, radius * 2);
    this.scene.physics.world.enable(area);
    (area.body as Phaser.Physics.Arcade.Body).setCircle(radius);
    
    // 持续伤害定时器
    const timer = this.scene.time.addEvent({
      delay: tickRate,
      callback: () => {
        // 检测区域内的目标
        // 实际项目中需要检测敌人群组
        // this.scene.physics.overlap(area, enemiesGroup, (zone, enemy) => {
        //   skill.effects.forEach(effectData => {
        //     this.applyEffect(effectData, source, enemy, levelMultiplier);
        //   });
        // });
      },
      callbackScope: this,
      repeat: Math.floor(duration / tickRate) - 1
    });
    
    // 效果结束后清理
    this.scene.time.delayedCall(duration, () => {
      effect.destroy();
      area.destroy();
      timer.remove();
    });
  }
  
  // 方向性效果（锥形、直线等）
  private createDirectionalEffect(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    levelMultiplier: number
  ): void {
    const element = skill.effects[0]?.element || ElementType.NONE;
    
    // 计算方向角度
    const angle = Phaser.Math.Angle.Between(source.x, source.y, targetX, targetY);
    
    // 创建方向性效果精灵
    const effect = this.scene.add.sprite(source.x, source.y, 'skill_effects');
    effect.setDepth(source.depth + 1);
    effect.setRotation(angle);
    
    // 选择动画
    const animKey = this.getAnimationKeyForElement(element, 'directional');
    effect.play(animKey);
    
    // 应用效果
    // 实际项目中需要使用物理系统创建扇形或矩形区域进行检测
    
    // 动画完成后移除
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }
  
  // 多目标效果
  private createMultiTargetEffect(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    levelMultiplier: number
  ): void {
    // 多目标效果类似于地面效果，但目标检测逻辑不同
    this.createGroundEffect(skill, source, targetX, targetY, levelMultiplier);
  }
  
  // 创建投射物
  private createProjectile(
    skill: SkillDescription,
    source: Phaser.Physics.Arcade.Sprite,
    targetX: number,
    targetY: number,
    levelMultiplier: number
  ): void {
    const element = skill.effects[0]?.element || ElementType.NONE;
    
    // 创建投射物精灵
    const projectile = this.scene.physics.add.sprite(source.x, source.y, 'projectiles');
    projectile.setDepth(source.depth + 1);
    
    // 选择动画
    const animKey = this.getAnimationKeyForElement(element, 'projectile');
    projectile.play(animKey);
    
    // 计算方向和速度
    const angle = Phaser.Math.Angle.Between(source.x, source.y, targetX, targetY);
    projectile.setRotation(angle);
    
    const speed = 300;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    // 设置投射物速度
    projectile.body.velocity.x = velocityX;
    projectile.body.velocity.y = velocityY;
    
    // 将投射物添加到组
    this.projectilesGroup.add(projectile);
    
    // 存储技能信息
    projectile.setData('skill', skill);
    projectile.setData('source', source);
    projectile.setData('levelMultiplier', levelMultiplier);
    
    // 设置超时销毁
    this.scene.time.delayedCall(2000, () => {
      projectile.destroy();
    });
    
    // 添加碰撞检测
    // 实际项目中需要检测敌人群组
    // this.scene.physics.add.overlap(projectile, enemiesGroup, this.onProjectileHit, undefined, this);
  }
  
  // 投射物命中处理
  private onProjectileHit(
    projectile: Phaser.GameObjects.GameObject,
    target: Phaser.GameObjects.GameObject
  ): void {
    const projectileSprite = projectile as Phaser.Physics.Arcade.Sprite;
    const targetSprite = target as Phaser.Physics.Arcade.Sprite;
    
    // 获取技能数据
    const skill = projectileSprite.getData('skill') as SkillDescription;
    const source = projectileSprite.getData('source') as Phaser.Physics.Arcade.Sprite;
    const levelMultiplier = projectileSprite.getData('levelMultiplier') as number;
    
    // 应用效果
    skill.effects.forEach(effect => {
      this.applyEffect(effect, source, targetSprite, levelMultiplier);
    });
    
    // 创建命中效果
    const hitEffect = this.scene.add.sprite(targetSprite.x, targetSprite.y, 'skill_effects');
    hitEffect.setDepth(targetSprite.depth + 1);
    
    // 选择动画
    const element = skill.effects[0]?.element || ElementType.NONE;
    const animKey = this.getAnimationKeyForElement(element, 'impact');
    hitEffect.play(animKey);
    
    // 动画完成后移除
    hitEffect.once('animationcomplete', () => {
      hitEffect.destroy();
    });
    
    // 销毁投射物
    projectileSprite.destroy();
  }
  
  // 应用效果
  private applyEffect(
    effect: SkillEffect,
    source: Phaser.Physics.Arcade.Sprite,
    target: Phaser.Physics.Arcade.Sprite,
    levelMultiplier: number
  ): void {
    // 根据效果类型应用不同效果
    switch (effect.type) {
      case 'damage':
        // 计算伤害
        const damage = effect.value * levelMultiplier;
        
        // 实际项目中需要将伤害应用到目标
        // target.takeDamage(damage, effect.element);
        
        // 创建伤害数字
        this.createDamageNumber(target.x, target.y, Math.floor(damage), effect.element);
        break;
        
      case 'heal':
        // 治疗逻辑
        const healing = effect.value * levelMultiplier;
        
        // 实际项目中需要将治疗应用到目标
        // target.heal(healing);
        
        // 创建治疗数字
        this.createDamageNumber(target.x, target.y, Math.floor(healing), undefined, true);
        break;
        
      case 'buff':
      case 'debuff':
        // Buff/Debuff逻辑
        if (effect.duration) {
          // 实际项目中需要将buff/debuff应用到目标
          // target.addEffect(effect.type, effect.value, effect.duration);
        }
        break;
        
      case 'movement':
        // 移动效果
        if (target === source) {
          // 如果目标是自己，可能是瞬移或冲锋等
          // 实际项目中需要实现移动逻辑
        }
        break;
    }
  }
  
  // 创建伤害数字
  private createDamageNumber(
    x: number,
    y: number,
    value: number,
    element?: ElementType,
    isHealing: boolean = false
  ): void {
    // 选择颜色
    let color = '#ffffff';
    
    if (isHealing) {
      color = '#00ff00'; // 治疗为绿色
    } else if (element) {
      switch (element) {
        case ElementType.FIRE:
          color = '#ff4500';
          break;
        case ElementType.ICE:
          color = '#add8e6';
          break;
        case ElementType.LIGHTNING:
          color = '#ffff00';
          break;
        case ElementType.POISON:
          color = '#7cfc00';
          break;
        case ElementType.ARCANE:
          color = '#9932cc';
          break;
      }
    }
    
    // 创建文本
    const text = this.scene.add.text(x, y - 20, isHealing ? '+' + value : value.toString(), {
      fontSize: '16px',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    });
    text.setOrigin(0.5);
    
    // 创建上浮效果
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      }
    });
  }
  
  // 根据元素类型和效果类型获取动画键
  private getAnimationKeyForElement(element: ElementType, type: string): string {
    // 实际项目中需要定义这些动画
    const baseKey = `${element.toLowerCase()}_${type}`;
    
    // 检查动画是否存在，不存在则使用默认动画
    if (this.scene.anims.exists(baseKey)) {
      return baseKey;
    }
    
    // 默认动画
    return `physical_${type}`;
  }
  
  // 注册默认动画
  public registerDefaultAnimations(): void {
    // 在实际项目中需要注册各种技能动画
    // 这里只是一个示例
    const elements = Object.values(ElementType);
    const types = ['self', 'impact', 'ground', 'directional', 'projectile'];
    
    elements.forEach(element => {
      types.forEach(type => {
        const key = `${element.toLowerCase()}_${type}`;
        
        // 注册动画
        // 实际项目中需要添加相应的精灵表
        // this.scene.anims.create({
        //   key: key,
        //   frames: this.scene.anims.generateFrameNumbers('skill_effects', { start: 0, end: 5 }),
        //   frameRate: 10,
        //   repeat: 0
        // });
      });
    });
  }
} 