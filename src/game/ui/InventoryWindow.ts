import Phaser from 'phaser';

export default class InventoryWindow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private slotsContainer!: Phaser.GameObjects.Container;
  private capacityText!: Phaser.GameObjects.Text;
  private inventory: any[] = [];
  private inventorySize: number = 20;
  private onItemClick: ((item: any, index: number) => void) | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0); // 确保UI不随相机移动
    this.container.setVisible(false);
    
    this.createWindow();
  }
  
  private createWindow() {
    // 创建背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(-300, -350, 600, 700);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeRect(-300, -350, 600, 700);
    this.container.add(bg);
    
    // 标题
    const title = this.scene.add.text(0, -320, '背包', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.container.add(title);
    
    // 添加关闭按钮
    const closeBtn = this.scene.add.text(280, -330, 'X', {
      fontSize: '20px',
      color: '#ffffff'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.setVisible(false));
    this.container.add(closeBtn);
    
    // 背包容量文本
    this.capacityText = this.scene.add.text(0, -280, `物品: ${this.inventory.length}/${this.inventorySize}`, {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    this.capacityText.setOrigin(0.5);
    this.container.add(this.capacityText);
    
    // 创建物品格子容器
    this.slotsContainer = this.scene.add.container(0, 0);
    this.container.add(this.slotsContainer);
  }
  
  // 更新背包内容
  updateInventory() {
    // 更新容量文本
    this.capacityText.setText(`物品: ${this.inventory.length}/${this.inventorySize}`);
    
    // 确保容器存在并移除旧的物品格子
    if (this.slotsContainer) {
      this.slotsContainer.removeAll(true);
    } else {
      // 如果容器不存在，重新创建它
      this.slotsContainer = this.scene.add.container(0, 0);
      this.container.add(this.slotsContainer);
    }
    
    // 创建物品格子
    const slotSize = 60;
    const padding = 10;
    const columns = 5;
    
    for (let i = 0; i < this.inventorySize; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      
      const x = (col - 2) * (slotSize + padding);
      const y = -220 + row * (slotSize + padding);
      
      // 创建格子背景
      const slotBg = this.scene.add.graphics();
      slotBg.fillStyle(0x333333, 1);
      slotBg.lineStyle(1, 0x666666, 1);
      slotBg.fillRect(x - slotSize/2, y - slotSize/2, slotSize, slotSize);
      slotBg.strokeRect(x - slotSize/2, y - slotSize/2, slotSize, slotSize);
      if (this.slotsContainer) {
        this.slotsContainer.add(slotBg);
      }
      
      // 如果有物品，显示物品
      if (i < this.inventory.length) {
        const item = this.inventory[i];
        
        // 物品图标(使用简单的颜色块表示不同类型物品)
        const icon = this.scene.add.graphics();
        if (item.type === 'weapon') {
          icon.fillStyle(0xe74c3c, 1); // 武器为红色
        } else if (item.type === 'armor') {
          icon.fillStyle(0x3498db, 1); // 护甲为蓝色
        } else if (item.type === 'consumable') {
          icon.fillStyle(0x2ecc71, 1); // 消耗品为绿色
        } else {
          icon.fillStyle(0xf1c40f, 1); // 其他为黄色
        }
        icon.fillRect(x - 20, y - 20, 40, 40);
        if (this.slotsContainer) {
          this.slotsContainer.add(icon);
        }
        
        // 物品名称(只显示前几个字符)
        let displayName = item.name;
        if (displayName.length > 8) displayName = displayName.substring(0, 7) + '..';
        
        const nameText = this.scene.add.text(x, y + 30, displayName, {
          fontSize: '12px',
          color: '#ffffff',
          align: 'center'
        });
        nameText.setOrigin(0.5);
        if (this.slotsContainer) {
          this.slotsContainer.add(nameText);
        }
        
        // 添加交互
        const hitArea = new Phaser.GameObjects.Zone(this.scene, x, y, 60, 60);
        hitArea.setOrigin(0.5);
        hitArea.setInteractive();
        hitArea.on('pointerdown', () => {
          console.log(`点击了物品: ${item.name}`);
          if (this.onItemClick) {
            this.onItemClick(item, i);
          }
        });
        if (this.slotsContainer) {
          this.slotsContainer.add(hitArea);
        }
      }
    }
    
    // 手动触发深度排序
    if (this.container && this.container.scene) {
      this.container.scene.children.depthSort();
    }
  }
  
  // 设置背包内容
  setInventory(items: any[]) {
    this.inventory = items.slice(0, this.inventorySize);
    this.updateInventory();
  }
  
  // 添加物品
  addItem(item: any): boolean {
    if (this.inventory.length >= this.inventorySize) {
      return false; // 背包已满
    }
    
    this.inventory.push(item);
    this.updateInventory();
    return true;
  }
  
  // 移除物品
  removeItem(index: number): any | null {
    if (index < 0 || index >= this.inventory.length) {
      return null;
    }
    
    const item = this.inventory.splice(index, 1)[0];
    this.updateInventory();
    return item;
  }
  
  // 设置物品点击回调
  setItemClickCallback(callback: (item: any, index: number) => void) {
    this.onItemClick = callback;
  }
  
  setVisible(visible: boolean) {
    this.container.setVisible(visible);
    if (visible) {
      this.updateInventory();
    }
  }
  
  isVisible(): boolean {
    return this.container.visible;
  }
  
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
} 