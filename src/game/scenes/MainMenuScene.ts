import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 添加标题
    const title = this.add.text(width / 2, height / 4, '像素风流放之路', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 开始游戏按钮
    const startButton = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff',
      padding: { x: 20, y: 10 },
      backgroundColor: '#6b21a8'
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    
    // 添加悬停效果
    startButton.on('pointerover', () => {
      startButton.setBackgroundColor('#7c3aed');
    });
    
    startButton.on('pointerout', () => {
      startButton.setBackgroundColor('#6b21a8');
    });
    
    // 点击开始游戏
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
} 