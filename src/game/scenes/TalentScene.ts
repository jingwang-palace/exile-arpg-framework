import Phaser from 'phaser';
import { TalentManager } from '../systems/talents/TalentManager';
import { TalentTreeRenderer } from '../systems/talents/TalentTreeRenderer';
import { TALENT_TREES } from '../systems/talents/TalentDatabase';

export class TalentScene extends Phaser.Scene {
  private talentManager!: TalentManager;
  private treeRenderer!: TalentTreeRenderer;
  private treeSelector!: Phaser.GameObjects.Container;
  private player!: Phaser.Physics.Arcade.Sprite;
  
  constructor() {
    super({ key: 'TalentScene' });
  }
  
  init(data: any): void {
    // 如果有传入玩家对象，则使用它
    this.player = data.player;
  }
  
  create(): void {
    // 如果没有玩家对象，创建一个临时的
    if (!this.player) {
      this.player = this.physics.add.sprite(0, 0, 'player');
    }
    
    // 创建背景
    this.createBackground();
    
    // 创建天赋管理器
    this.talentManager = new TalentManager(this, this.player);
    
    // 注册天赋树
    this.talentManager.registerTalentTrees(TALENT_TREES);
    
    // 添加测试用天赋点
    this.talentManager.addTalentPoints(10);
    
    // 创建天赋树渲染器
    this.treeRenderer = new TalentTreeRenderer(this, this.talentManager);
    
    // 创建职业选择器
    this.createClassSelector();
    
    // 创建UI按钮
    this.createUIButtons();
    
    // 渲染初始天赋树
    const firstTree = TALENT_TREES[0];
    if (firstTree) {
      this.treeRenderer.renderTalentTree(firstTree);
    }
  }
  
  // 创建背景
  private createBackground(): void {
    // 创建渐变背景
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const background = this.add.graphics();
    background.fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1);
    background.fillRect(0, 0, width, height);
    
    // 添加网格线
    const grid = this.add.grid(
      width / 2,
      height / 2,
      width,
      height,
      50,
      50,
      0,
      0,
      0x334155,
      0.2
    );
  }
  
  // 创建职业选择器
  private createClassSelector(): void {
    const width = this.cameras.main.width;
    
    // 创建容器
    this.treeSelector = this.add.container(width / 2, 50);
    
    // 标题
    const title = this.add.text(0, -25, '选择职业天赋树', {
      fontSize: '20px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    this.treeSelector.add(title);
    
    // 职业按钮
    const buttonWidth = 120;
    const buttonHeight = 40;
    const padding = 10;
    const startX = -(TALENT_TREES.length * (buttonWidth + padding)) / 2 + buttonWidth / 2;
    
    TALENT_TREES.forEach((tree, index) => {
      const x = startX + index * (buttonWidth + padding);
      
      // 创建按钮背景
      const button = this.add.rectangle(x, 0, buttonWidth, buttonHeight, 0x475569);
      button.setInteractive({ useHandCursor: true });
      
      // 创建按钮文本
      const text = this.add.text(x, 0, tree.name, {
        fontSize: '16px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);
      
      // 点击事件
      button.on('pointerdown', () => {
        this.talentManager.setCurrentTalentTree(tree.id);
        this.treeRenderer.renderTalentTree(tree);
        
        // 更新所有按钮颜色
        this.treeSelector.getAll().forEach(child => {
          if (child instanceof Phaser.GameObjects.Rectangle) {
            child.setFillStyle(0x475569);
          }
        });
        
        // 高亮当前按钮
        button.setFillStyle(0x3b82f6);
      });
      
      // 悬停效果
      button.on('pointerover', () => {
        if (button.fillColor !== 0x3b82f6) {
          button.setFillStyle(0x64748b);
        }
      });
      
      button.on('pointerout', () => {
        if (button.fillColor !== 0x3b82f6) {
          button.setFillStyle(0x475569);
        }
      });
      
      // 第一个按钮默认选中
      if (index === 0) {
        button.setFillStyle(0x3b82f6);
      }
      
      this.treeSelector.add(button);
      this.treeSelector.add(text);
    });
  }
  
  // 创建UI按钮
  private createUIButtons(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 返回按钮
    const backButton = this.add.rectangle(100, 50, 100, 40, 0x475569);
    backButton.setInteractive({ useHandCursor: true });
    
    const backText = this.add.text(100, 50, '返回游戏', {
      fontSize: '16px',
      color: '#ffffff'
    });
    backText.setOrigin(0.5);
    
    backButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x64748b);
    });
    
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x475569);
    });
    
    // 重置按钮
    const resetButton = this.add.rectangle(width - 100, 50, 100, 40, 0xdc2626);
    resetButton.setInteractive({ useHandCursor: true });
    
    const resetText = this.add.text(width - 100, 50, '重置天赋', {
      fontSize: '16px',
      color: '#ffffff'
    });
    resetText.setOrigin(0.5);
    
    resetButton.on('pointerdown', () => {
      // 显示确认对话框
      this.showConfirmDialog('确定要重置所有天赋点吗？', () => {
        this.talentManager.resetTalents();
      });
    });
    
    resetButton.on('pointerover', () => {
      resetButton.setFillStyle(0xef4444);
    });
    
    resetButton.on('pointerout', () => {
      resetButton.setFillStyle(0xdc2626);
    });
    
    // 添加说明文本
    const helpText = this.add.text(
      width - 20,
      height - 20,
      '点击节点分配点数 | 拖动移动视图 | 滚轮缩放视图',
      {
        fontSize: '14px',
        color: '#94a3b8'
      }
    );
    helpText.setOrigin(1, 1);
  }
  
  // 显示确认对话框
  private showConfirmDialog(message: string, onConfirm: () => void): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 对话框容器
    const dialog = this.add.container(width / 2, height / 2);
    dialog.setDepth(1000);
    
    // 背景遮罩
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setPosition(0, 0);
    overlay.setOrigin(0);
    
    // 对话框背景
    const dialogBg = this.add.rectangle(0, 0, 400, 200, 0x1e293b);
    dialog.add(dialogBg);
    
    // 对话框标题
    const title = this.add.text(0, -70, '确认', {
      fontSize: '24px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    dialog.add(title);
    
    // 对话框内容
    const content = this.add.text(0, -20, message, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    });
    content.setOrigin(0.5);
    dialog.add(content);
    
    // 确认按钮
    const confirmButton = this.add.rectangle(80, 60, 120, 40, 0xdc2626);
    confirmButton.setInteractive({ useHandCursor: true });
    
    const confirmText = this.add.text(80, 60, '确认', {
      fontSize: '16px',
      color: '#ffffff'
    });
    confirmText.setOrigin(0.5);
    
    dialog.add(confirmButton);
    dialog.add(confirmText);
    
    // 取消按钮
    const cancelButton = this.add.rectangle(-80, 60, 120, 40, 0x475569);
    cancelButton.setInteractive({ useHandCursor: true });
    
    const cancelText = this.add.text(-80, 60, '取消', {
      fontSize: '16px',
      color: '#ffffff'
    });
    cancelText.setOrigin(0.5);
    
    dialog.add(cancelButton);
    dialog.add(cancelText);
    
    // 按钮事件
    confirmButton.on('pointerdown', () => {
      onConfirm();
      overlay.destroy();
      dialog.destroy();
    });
    
    cancelButton.on('pointerdown', () => {
      overlay.destroy();
      dialog.destroy();
    });
    
    // 按钮悬停效果
    confirmButton.on('pointerover', () => {
      confirmButton.setFillStyle(0xef4444);
    });
    
    confirmButton.on('pointerout', () => {
      confirmButton.setFillStyle(0xdc2626);
    });
    
    cancelButton.on('pointerover', () => {
      cancelButton.setFillStyle(0x64748b);
    });
    
    cancelButton.on('pointerout', () => {
      cancelButton.setFillStyle(0x475569);
    });
    
    // 添加到场景
    this.add.existing(overlay);
  }
} 