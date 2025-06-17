import Phaser from 'phaser';
import { useStorageStore } from '../../stores/storage';

export default class StorageWindow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private tabsContainer!: Phaser.GameObjects.Container;
  private slotsContainer!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;
  private currentTab: string = 'general';
  private storageStore: any;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
    this.container.setVisible(false);
    this.storageStore = useStorageStore();
    
    this.createWindow();
    this.updateDisplay();
  }

  private createWindow() {
    // 创建背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(-400, -300, 800, 600);
    bg.lineStyle(3, 0x16213e, 1);
    bg.strokeRect(-400, -300, 800, 600);
    this.container.add(bg);

    // 标题
    const title = this.scene.add.text(0, -270, '仓库 (多角色共享)', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // 关闭按钮
    const closeBtn = this.scene.add.text(370, -280, '✕', {
      fontSize: '24px',
      color: '#ff6b6b'
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ cursor: 'pointer' });
    closeBtn.on('pointerdown', () => this.setVisible(false));
    this.container.add(closeBtn);

    // 金币显示
    this.goldText = this.scene.add.text(-370, -240, `仓库金币: ${this.storageStore.totalGold}`, {
      fontSize: '16px',
      color: '#ffd700'
    });
    this.container.add(this.goldText);

    // 创建标签容器
    this.tabsContainer = this.scene.add.container(0, -200);
    this.container.add(this.tabsContainer);

    // 创建物品格子容器
    this.slotsContainer = this.scene.add.container(0, 0);
    this.container.add(this.slotsContainer);
  }

  private createTabs() {
    // 清空现有标签
    this.tabsContainer.removeAll(true);

    const tabs = this.storageStore.tabs;
    const tabWidth = 120;
    const startX = -(tabs.length * tabWidth) / 2 + tabWidth / 2;

    tabs.forEach((tab: any, index: number) => {
      const x = startX + index * tabWidth;
      const isActive = tab.id === this.currentTab;

      // 标签背景
      const tabBg = this.scene.add.graphics();
      tabBg.fillStyle(isActive ? 0x0f3460 : 0x16213e, 1);
      tabBg.fillRect(x - tabWidth/2, -20, tabWidth, 40);
      tabBg.lineStyle(2, isActive ? 0x3498db : 0x7f8c8d, 1);
      tabBg.strokeRect(x - tabWidth/2, -20, tabWidth, 40);
      this.tabsContainer.add(tabBg);

      // 标签文本
      const tabText = this.scene.add.text(x, 0, tab.name, {
        fontSize: '14px',
        color: isActive ? '#3498db' : '#bdc3c7'
      });
      tabText.setOrigin(0.5);
      this.tabsContainer.add(tabText);

      // 使用情况
      const usage = this.storageStore.getTabUsage(tab.id);
      const usageText = this.scene.add.text(x, 12, `${usage.used}/${usage.total}`, {
        fontSize: '10px',
        color: '#95a5a6'
      });
      usageText.setOrigin(0.5);
      this.tabsContainer.add(usageText);

      // 点击区域
      const hitArea = new Phaser.GameObjects.Zone(this.scene, x, 0, tabWidth, 40);
      hitArea.setOrigin(0.5);
      hitArea.setInteractive({ cursor: 'pointer' });
      hitArea.on('pointerdown', () => {
        this.currentTab = tab.id;
        this.updateDisplay();
      });
      this.tabsContainer.add(hitArea);
    });
  }

  private createSlots() {
    // 清空现有格子
    this.slotsContainer.removeAll(true);

    const slots = this.storageStore.getTabSlots(this.currentTab);
    const slotSize = 50;
    const padding = 5;
    const columns = 12;

    slots.forEach((slot: any, index: number) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      const x = (col - 5.5) * (slotSize + padding);
      const y = -100 + row * (slotSize + padding);

      // 格子背景
      const slotBg = this.scene.add.graphics();
      slotBg.fillStyle(0x2c3e50, 1);
      slotBg.fillRect(x - slotSize/2, y - slotSize/2, slotSize, slotSize);
      slotBg.lineStyle(1, 0x34495e, 1);
      slotBg.strokeRect(x - slotSize/2, y - slotSize/2, slotSize, slotSize);
      this.slotsContainer.add(slotBg);

      // 如果有物品，显示物品
      if (slot.itemId) {
        // 物品图标
        const icon = this.scene.add.graphics();
        icon.fillStyle(this.getItemColor(slot.itemId), 1);
        icon.fillRect(x - 20, y - 20, 40, 40);
        this.slotsContainer.add(icon);

        // 数量
        if (slot.quantity > 1) {
          const quantityText = this.scene.add.text(x + 18, y + 18, slot.quantity.toString(), {
            fontSize: '12px',
            color: '#ffffff'
          });
          quantityText.setOrigin(1, 1);
          this.slotsContainer.add(quantityText);
        }

        // 点击交互
        const hitArea = new Phaser.GameObjects.Zone(this.scene, x, y, slotSize, slotSize);
        hitArea.setOrigin(0.5);
        hitArea.setInteractive({ cursor: 'pointer' });
        hitArea.on('pointerdown', () => {
          console.log(`点击了仓库物品: ${slot.itemId}`);
          // 这里可以添加物品信息显示或拖拽逻辑
        });
        this.slotsContainer.add(hitArea);
      }
    });
  }

  private getItemColor(itemId: string): number {
    // 根据物品类型返回不同颜色
    if (itemId.includes('weapon')) return 0xe74c3c;
    if (itemId.includes('armor')) return 0x3498db;
    if (itemId.includes('potion')) return 0x27ae60;
    if (itemId.includes('material')) return 0xf39c12;
    return 0x95a5a6;
  }

  public updateDisplay() {
    this.createTabs();
    this.createSlots();
    this.goldText.setText(`仓库金币: ${this.storageStore.totalGold}`);
  }

  public setVisible(visible: boolean) {
    this.visible = visible;
    this.container.setVisible(visible);
    if (visible) {
      this.updateDisplay();
    }
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public addItem(itemId: string, quantity: number = 1): boolean {
    const result = this.storageStore.addItem(this.currentTab, itemId, quantity);
    if (result.success) {
      this.updateDisplay();
      return true;
    }
    console.log('添加物品到仓库失败:', result.message);
    return false;
  }

  public removeItem(slotId: string, quantity: number = 1): boolean {
    const result = this.storageStore.removeItem(this.currentTab, slotId, quantity);
    if (result.success) {
      this.updateDisplay();
      return true;
    }
    console.log('从仓库移除物品失败:', result.message);
    return false;
  }
} 