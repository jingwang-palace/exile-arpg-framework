import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 加载资源
    this.load.setBaseURL('./assets/');
    
    // 加载基础资源
    this.load.image('logo', 'images/logo.png');
    
    // 加载天赋图标（实际项目中需要替换为实际资源）
    this.load.image('strength', 'icons/placeholder.png');
    this.load.image('armor', 'icons/placeholder.png');
    this.load.image('sword', 'icons/placeholder.png');
    this.load.image('tough_skin', 'icons/placeholder.png');
    this.load.image('shield', 'icons/placeholder.png');
    this.load.image('unyielding', 'icons/placeholder.png');
    this.load.image('precise', 'icons/placeholder.png');
    this.load.image('rage', 'icons/placeholder.png');
    this.load.image('berserker', 'icons/placeholder.png');
    this.load.image('cleave', 'icons/placeholder.png');
    this.load.image('whirlwind', 'icons/placeholder.png');
    
    // 法师天赋图标
    this.load.image('intelligence', 'icons/placeholder.png');
    this.load.image('mana', 'icons/placeholder.png');
    this.load.image('spellweave', 'icons/placeholder.png');
    this.load.image('arcane_shield', 'icons/placeholder.png');
    this.load.image('mana_barrier', 'icons/placeholder.png');
    this.load.image('ice_block', 'icons/placeholder.png');
    this.load.image('elemental', 'icons/placeholder.png');
    this.load.image('harmony', 'icons/placeholder.png');
    this.load.image('archmage', 'icons/placeholder.png');
    this.load.image('fireball', 'icons/placeholder.png');
    this.load.image('arcane_blast', 'icons/placeholder.png');
    
    // 弓箭手天赋图标
    this.load.image('dexterity', 'icons/placeholder.png');
    this.load.image('agility', 'icons/placeholder.png');
    this.load.image('marksmanship', 'icons/placeholder.png');
    this.load.image('evasion', 'icons/placeholder.png');
    this.load.image('acrobatics', 'icons/placeholder.png');
    this.load.image('shadow_step', 'icons/placeholder.png');
    this.load.image('deadly_aim', 'icons/placeholder.png');
    this.load.image('focus', 'icons/placeholder.png');
    this.load.image('sniper', 'icons/placeholder.png');
    this.load.image('quick_shot', 'icons/placeholder.png');
    this.load.image('arrow_rain', 'icons/placeholder.png');
    
    // 加载进度条
    this.load.on('progress', (value: number) => {
      console.log(`加载进度: ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      console.log('资源加载完成');
    });
  }

  create() {
    this.scene.start('MainMenuScene');
  }
} 