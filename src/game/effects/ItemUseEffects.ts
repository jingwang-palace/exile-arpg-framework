import { Scene } from 'phaser';
import { ItemStack } from '../../types/item';
import { ITEM_USE_EFFECTS } from '../../configs/items/useEffects';

export class ItemUseEffects {
  private scene: Scene;
  
  constructor(scene: Scene) {
    this.scene = scene;
  }
  
  // 播放使用动画
  public playUseAnimation(itemId: string, x: number, y: number): void {
    const effect = this.findEffect(itemId);
    if (!effect || !effect.animation) return;
    
    const animation = this.scene.add.sprite(x, y, effect.animation);
    animation.play(effect.animation);
    
    // 动画完成后销毁
    animation.once('animationcomplete', () => {
      animation.destroy();
    });
  }
  
  // 播放使用音效
  public playUseSound(itemId: string): void {
    const effect = this.findEffect(itemId);
    if (!effect || !effect.soundEffect) return;
    
    this.scene.sound.play(effect.soundEffect);
  }
  
  // 播放粒子效果
  public playParticleEffect(itemId: string, x: number, y: number): void {
    const effect = this.findEffect(itemId);
    if (!effect || !effect.particleEffect) return;
    
    const particles = this.scene.add.particles(x, y, effect.particleEffect, {
      speed: 100,
      lifespan: 1000,
      scale: { start: 0.5, end: 0 },
      quantity: 20,
      emitting: false
    });
    
    particles.explode();
    
    // 粒子效果完成后销毁
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }
  
  // 执行使用效果
  public executeEffect(item: ItemStack, quantity: number): void {
    const effect = this.findEffect(item.item.id);
    if (!effect) return;
    
    // 播放动画和音效
    const player = this.scene.registry.get('player');
    if (player) {
      this.playUseAnimation(item.item.id, player.x, player.y);
      this.playUseSound(item.item.id);
      this.playParticleEffect(item.item.id, player.x, player.y);
    }
    
    // 执行效果
    effect.execute(this.scene, item, quantity);
  }
  
  // 查找效果配置
  private findEffect(itemId: string): any {
    // 在消耗品中查找
    if (ITEM_USE_EFFECTS.consumables[itemId]) {
      return ITEM_USE_EFFECTS.consumables[itemId];
    }
    
    // 在通货中查找
    if (ITEM_USE_EFFECTS.currency[itemId]) {
      return ITEM_USE_EFFECTS.currency[itemId];
    }
    
    // 在装备中查找
    if (ITEM_USE_EFFECTS.equipment[itemId]) {
      return ITEM_USE_EFFECTS.equipment[itemId];
    }
    
    // 在宝石中查找
    if (ITEM_USE_EFFECTS.gems[itemId]) {
      return ITEM_USE_EFFECTS.gems[itemId];
    }
    
    // 在任务物品中查找
    if (ITEM_USE_EFFECTS.questItems[itemId]) {
      return ITEM_USE_EFFECTS.questItems[itemId];
    }
    
    // 在材料中查找
    if (ITEM_USE_EFFECTS.materials[itemId]) {
      return ITEM_USE_EFFECTS.materials[itemId];
    }
    
    return null;
  }
  
  // 预加载效果资源
  public preloadEffects(): void {
    // 预加载动画
    this.preloadAnimations();
    
    // 预加载音效
    this.preloadSounds();
    
    // 预加载粒子效果
    this.preloadParticles();
  }
  
  // 预加载动画
  private preloadAnimations(): void {
    const animations = new Set<string>();
    
    // 收集所有动画
    Object.values(ITEM_USE_EFFECTS).forEach(category => {
      Object.values(category).forEach(effect => {
        if (effect.animation) {
          animations.add(effect.animation);
        }
      });
    });
    
    // 加载动画
    animations.forEach(animation => {
      this.scene.load.spritesheet(animation, `assets/animations/${animation}.png`, {
        frameWidth: 32,
        frameHeight: 32
      });
    });
  }
  
  // 预加载音效
  private preloadSounds(): void {
    const sounds = new Set<string>();
    
    // 收集所有音效
    Object.values(ITEM_USE_EFFECTS).forEach(category => {
      Object.values(category).forEach(effect => {
        if (effect.soundEffect) {
          sounds.add(effect.soundEffect);
        }
      });
    });
    
    // 加载音效
    sounds.forEach(sound => {
      this.scene.load.audio(sound, `assets/sounds/${sound}.mp3`);
    });
  }
  
  // 预加载粒子效果
  private preloadParticles(): void {
    const particles = new Set<string>();
    
    // 收集所有粒子效果
    Object.values(ITEM_USE_EFFECTS).forEach(category => {
      Object.values(category).forEach(effect => {
        if (effect.particleEffect) {
          particles.add(effect.particleEffect);
        }
      });
    });
    
    // 加载粒子效果
    particles.forEach(particle => {
      this.scene.load.image(particle, `assets/particles/${particle}.png`);
    });
  }
  
  // 创建动画
  public createAnimations(): void {
    // 创建消耗品动画
    this.scene.anims.create({
      key: 'drink_potion',
      frames: this.scene.anims.generateFrameNumbers('drink_potion', {}),
      frameRate: 10,
      repeat: 0
    });
    
    // 创建通货动画
    this.scene.anims.create({
      key: 'use_orb',
      frames: this.scene.anims.generateFrameNumbers('use_orb', {}),
      frameRate: 15,
      repeat: 0
    });
    
    // 创建技能动画
    this.scene.anims.create({
      key: 'weapon_skill',
      frames: this.scene.anims.generateFrameNumbers('weapon_skill', {}),
      frameRate: 12,
      repeat: 0
    });
    
    this.scene.anims.create({
      key: 'cast_spell',
      frames: this.scene.anims.generateFrameNumbers('cast_spell', {}),
      frameRate: 12,
      repeat: 0
    });
    
    // 创建其他动画
    this.scene.anims.create({
      key: 'use_key',
      frames: this.scene.anims.generateFrameNumbers('use_key', {}),
      frameRate: 8,
      repeat: 0
    });
    
    this.scene.anims.create({
      key: 'use_material',
      frames: this.scene.anims.generateFrameNumbers('use_material', {}),
      frameRate: 8,
      repeat: 0
    });
  }
} 