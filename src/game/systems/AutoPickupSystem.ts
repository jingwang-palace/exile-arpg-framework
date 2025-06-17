import Phaser from 'phaser';
import { EventEmitter } from '../../utils/EventEmitter';
import { CurrencyType, CurrencyConfig, CURRENCY_CONFIGS } from '../../types/currency';

// 拾取物品接口
export interface PickupItem {
  id: string;
  type: 'currency' | 'equipment' | 'consumable';
  currencyType?: CurrencyType;
  stackSize: number;
  value: number;
  sprite: Phaser.GameObjects.Sprite;
  autoPickup: boolean;
  rarity?: string;
}

// 拾取设置配置
export interface PickupSettings {
  enabled: boolean;              // 是否启用自动拾取
  range: number;                 // 拾取范围
  currency: {
    autoPickupGold: boolean;     // 自动拾取金币
    autoPickupSilver: boolean;   // 自动拾取银币
    autoPickupCopper: boolean;   // 自动拾取铜币
    autoPickupOrbs: boolean;     // 自动拾取宝珠
    autoPickupScrolls: boolean;  // 自动拾取卷轴
    autoPickupShards: boolean;   // 自动拾取碎片
    autoPickupEssences: boolean; // 自动拾取精髓
    autoPickupCatalysts: boolean; // 自动拾取催化剂
  };
  equipment: {
    autoPickupCommon: boolean;   // 自动拾取普通装备
    autoPickupMagic: boolean;    // 自动拾取魔法装备
    autoPickupRare: boolean;     // 自动拾取稀有装备
    autoPickupUnique: boolean;   // 自动拾取传奇装备
  };
  showPickupRange: boolean;      // 显示拾取范围
  pickupDelay: number;           // 拾取延迟（毫秒）
  playPickupSound: boolean;      // 播放拾取音效
  showPickupText: boolean;       // 显示拾取文本
}

export class AutoPickupSystem extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private pickupItems: Map<string, PickupItem> = new Map();
  
  // 拾取设置
  private settings: PickupSettings = {
    enabled: true,
    range: 120,
    currency: {
      autoPickupGold: true,
      autoPickupSilver: true,
      autoPickupCopper: true,
      autoPickupOrbs: true,
      autoPickupScrolls: true,
      autoPickupShards: true,
      autoPickupEssences: true,
      autoPickupCatalysts: true
    },
    equipment: {
      autoPickupCommon: false,
      autoPickupMagic: true,
      autoPickupRare: true,
      autoPickupUnique: true
    },
    showPickupRange: false,
    pickupDelay: 100,
    playPickupSound: true,
    showPickupText: true
  };
  
  // 系统状态
  private lastPickupTime: number = 0;
  private rangeGraphics: Phaser.GameObjects.Graphics | null = null;
  private playerInventory: Map<CurrencyType, number> = new Map();
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    super();
    this.scene = scene;
    this.player = player;
    
    this.createRangeGraphics();
    this.initializeInventory();
  }
  
  // 初始化玩家库存
  private initializeInventory(): void {
    // 初始化通货库存
    Object.values(CurrencyType).forEach(currencyType => {
      this.playerInventory.set(currencyType, 0);
    });
  }
  
  // 创建拾取范围显示
  private createRangeGraphics(): void {
    this.rangeGraphics = this.scene.add.graphics();
    this.rangeGraphics.setDepth(1);
    this.rangeGraphics.setAlpha(0.3);
  }
  
  // 添加拾取物品
  public addPickupItem(
    x: number, y: number,
    type: 'currency' | 'equipment' | 'consumable',
    currencyType?: CurrencyType,
    stackSize: number = 1,
    value: number = 1,
    rarity?: string
  ): string {
    const itemId = `pickup_${Date.now()}_${Math.random()}`;
    
    // 获取通货配置
    let config: CurrencyConfig | undefined;
    let spriteName = 'default_item';
    let autoPickup = false;
    
    if (type === 'currency' && currencyType) {
      config = CURRENCY_CONFIGS[currencyType];
      spriteName = config.sprite;
      autoPickup = config.autoPickup;
    }
    
    // 创建物品精灵
    const sprite = this.scene.add.sprite(x, y, spriteName);
    sprite.setDepth(2);
    
    // 添加发光效果（如果配置了）
    if (config?.glowEffect) {
      this.addGlowEffect(sprite, config.rarity);
    }
    
    // 添加稀有度颜色
    if (config) {
      this.applyRarityTint(sprite, config.rarity);
    }
    
    const pickupItem: PickupItem = {
      id: itemId,
      type,
      currencyType,
      stackSize,
      value,
      sprite,
      autoPickup,
      rarity
    };
    
    this.pickupItems.set(itemId, pickupItem);
    
    // 添加数量文本（如果大于1）
    if (stackSize > 1) {
      this.addStackText(sprite, stackSize);
    }
    
    return itemId;
  }
  
  // 添加发光效果
  private addGlowEffect(sprite: Phaser.GameObjects.Sprite, rarity: string): void {
    // 创建发光动画
    this.scene.add.tween({
      targets: sprite,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 添加旋转效果（对于高级通货）
    if (rarity === 'legendary' || rarity === 'mythic') {
      this.scene.add.tween({
        targets: sprite,
        rotation: Math.PI * 2,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
  
  // 应用稀有度颜色
  private applyRarityTint(sprite: Phaser.GameObjects.Sprite, rarity: string): void {
    const rarityColors: Record<string, number> = {
      'common': 0xffffff,
      'uncommon': 0x6a9bd1,
      'rare': 0xf4d03f,
      'epic': 0x9b59b6,
      'legendary': 0xe67e22,
      'mythic': 0xe74c3c
    };
    
    const color = rarityColors[rarity] || 0xffffff;
    sprite.setTint(color);
  }
  
  // 添加堆叠数量文本
  private addStackText(sprite: Phaser.GameObjects.Sprite, stackSize: number): void {
    const text = this.scene.add.text(
      sprite.x + 15,
      sprite.y + 15,
      stackSize.toString(),
      {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 2, y: 2 }
      }
    );
    text.setDepth(3);
    
    // 将文本绑定到精灵
    (sprite as any).stackText = text;
  }
  
  // 更新自动拾取逻辑
  public update(): void {
    if (!this.settings.enabled) return;
    
    const currentTime = Date.now();
    if (currentTime - this.lastPickupTime < this.settings.pickupDelay) return;
    
    this.updateRangeDisplay();
    this.processAutoPickup();
  }
  
  // 处理自动拾取
  private processAutoPickup(): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    const pickupRange = this.settings.range;
    
    const itemsToPickup: PickupItem[] = [];
    
    this.pickupItems.forEach((item) => {
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        item.sprite.x, item.sprite.y
      );
      
      if (distance <= pickupRange && this.shouldAutoPickup(item)) {
        itemsToPickup.push(item);
      }
    });
    
    // 按优先级排序（价值高的优先）
    itemsToPickup.sort((a, b) => b.value - a.value);
    
    // 拾取物品
    itemsToPickup.forEach(item => {
      this.pickupItem(item);
    });
  }
  
  // 判断是否应该自动拾取
  private shouldAutoPickup(item: PickupItem): boolean {
    if (!item.autoPickup) return false;
    
    if (item.type === 'currency' && item.currencyType) {
      return this.shouldPickupCurrency(item.currencyType);
    }
    
    if (item.type === 'equipment') {
      return this.shouldPickupEquipment(item.rarity || 'common');
    }
    
    return false;
  }
  
  // 判断是否拾取通货
  private shouldPickupCurrency(currencyType: CurrencyType): boolean {
    const { currency } = this.settings;
    
    switch (currencyType) {
      case CurrencyType.GOLD:
        return currency.autoPickupGold;
      case CurrencyType.SILVER:
        return currency.autoPickupSilver;
      case CurrencyType.COPPER:
        return currency.autoPickupCopper;
      case CurrencyType.ENHANCEMENT_ORB:
      case CurrencyType.BLESSED_ORB:
      case CurrencyType.DIVINE_ORB:
      case CurrencyType.CHAOS_ORB:
      case CurrencyType.EXALTED_ORB:
        return currency.autoPickupOrbs;
      case CurrencyType.PORTAL_SCROLL:
      case CurrencyType.WISDOM_SCROLL:
        return currency.autoPickupScrolls;
      case CurrencyType.ALCHEMY_SHARD:
      case CurrencyType.REGAL_SHARD:
      case CurrencyType.ANCIENT_SHARD:
        return currency.autoPickupShards;
      case CurrencyType.ESSENCE_OF_GREED:
      case CurrencyType.ESSENCE_OF_HATRED:
      case CurrencyType.ESSENCE_OF_WRATH:
      case CurrencyType.ESSENCE_OF_FEAR:
        return currency.autoPickupEssences;
      case CurrencyType.FERTILE_CATALYST:
      case CurrencyType.PRISMATIC_CATALYST:
      case CurrencyType.UNSTABLE_CATALYST:
        return currency.autoPickupCatalysts;
      default:
        return true;
    }
  }
  
  // 判断是否拾取装备
  private shouldPickupEquipment(rarity: string): boolean {
    const { equipment } = this.settings;
    
    switch (rarity) {
      case 'common':
        return equipment.autoPickupCommon;
      case 'magic':
        return equipment.autoPickupMagic;
      case 'rare':
        return equipment.autoPickupRare;
      case 'unique':
      case 'legendary':
        return equipment.autoPickupUnique;
      default:
        return false;
    }
  }
  
  // 拾取物品
  private pickupItem(item: PickupItem): void {
    // 添加到库存
    if (item.type === 'currency' && item.currencyType) {
      const currentAmount = this.playerInventory.get(item.currencyType) || 0;
      this.playerInventory.set(item.currencyType, currentAmount + item.stackSize);
    }
    
    // 播放音效
    if (this.settings.playPickupSound) {
      this.playPickupSound(item);
    }
    
    // 显示拾取文本
    if (this.settings.showPickupText) {
      this.showPickupText(item);
    }
    
    // 创建拾取动画
    this.createPickupAnimation(item);
    
    // 发出拾取事件
    this.emit('itemPickedUp', item);
    
    // 移除物品
    this.removePickupItem(item.id);
    
    this.lastPickupTime = Date.now();
  }
  
  // 播放拾取音效
  private playPickupSound(item: PickupItem): void {
    let soundKey = 'item_pickup';
    
    if (item.type === 'currency' && item.currencyType) {
      const config = CURRENCY_CONFIGS[item.currencyType];
      soundKey = config.soundEffect || 'item_pickup';
    }
    
    // 播放音效（如果音频资源存在）
    if (this.scene.cache.audio.exists(soundKey)) {
      this.scene.sound.play(soundKey, { volume: 0.3 });
    }
  }
  
  // 显示拾取文本
  private showPickupText(item: PickupItem): void {
    let text = `获得 ${item.stackSize}`;
    
    if (item.type === 'currency' && item.currencyType) {
      const config = CURRENCY_CONFIGS[item.currencyType];
      text = `获得 ${config.name} x${item.stackSize}`;
    }
    
    const pickupText = this.scene.add.text(
      item.sprite.x,
      item.sprite.y - 30,
      text,
      {
        fontSize: '14px',
        color: '#00ff00',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    );
    pickupText.setOrigin(0.5);
    pickupText.setDepth(10);
    
    // 文本动画
    this.scene.add.tween({
      targets: pickupText,
      y: pickupText.y - 20,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        pickupText.destroy();
      }
    });
  }
  
  // 创建拾取动画
  private createPickupAnimation(item: PickupItem): void {
    // 物品向玩家移动的动画
    this.scene.add.tween({
      targets: item.sprite,
      x: this.player.x,
      y: this.player.y,
      scaleX: 0.3,
      scaleY: 0.3,
      alpha: 0.8,
      duration: 200,
      ease: 'Power2'
    });
    
    // 如果有堆叠文本，也要移动
    if ((item.sprite as any).stackText) {
      this.scene.add.tween({
        targets: (item.sprite as any).stackText,
        x: this.player.x + 15,
        y: this.player.y + 15,
        alpha: 0,
        duration: 200,
        ease: 'Power2'
      });
    }
  }
  
  // 移除拾取物品
  private removePickupItem(itemId: string): void {
    const item = this.pickupItems.get(itemId);
    if (!item) return;
    
    // 销毁精灵和文本
    item.sprite.destroy();
    if ((item.sprite as any).stackText) {
      (item.sprite as any).stackText.destroy();
    }
    
    this.pickupItems.delete(itemId);
  }
  
  // 更新拾取范围显示
  private updateRangeDisplay(): void {
    if (!this.rangeGraphics || !this.settings.showPickupRange) {
      if (this.rangeGraphics) {
        this.rangeGraphics.clear();
      }
      return;
    }
    
    this.rangeGraphics.clear();
    this.rangeGraphics.lineStyle(2, 0x00ff00, 0.8);
    this.rangeGraphics.strokeCircle(this.player.x, this.player.y, this.settings.range);
  }
  
  // 获取库存中的通货数量
  public getCurrencyAmount(currencyType: CurrencyType): number {
    return this.playerInventory.get(currencyType) || 0;
  }
  
  // 设置库存中的通货数量
  public setCurrencyAmount(currencyType: CurrencyType, amount: number): void {
    this.playerInventory.set(currencyType, Math.max(0, amount));
    this.emit('currencyChanged', currencyType, amount);
  }
  
  // 获取所有库存
  public getInventory(): Map<CurrencyType, number> {
    return new Map(this.playerInventory);
  }
  
  // 更新拾取设置
  public updateSettings(newSettings: Partial<PickupSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('settingsChanged', this.settings);
  }
  
  // 获取当前设置
  public getSettings(): PickupSettings {
    return { ...this.settings };
  }
  
  // 切换拾取范围显示
  public toggleRangeDisplay(show?: boolean): void {
    this.settings.showPickupRange = show !== undefined ? show : !this.settings.showPickupRange;
    if (!this.settings.showPickupRange && this.rangeGraphics) {
      this.rangeGraphics.clear();
    }
  }
  
  // 手动拾取指定物品
  public manualPickup(itemId: string): boolean {
    const item = this.pickupItems.get(itemId);
    if (!item) return false;
    
    this.pickupItem(item);
    return true;
  }
  
  // 获取范围内的所有物品
  public getItemsInRange(): PickupItem[] {
    const playerX = this.player.x;
    const playerY = this.player.y;
    const items: PickupItem[] = [];
    
    this.pickupItems.forEach(item => {
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        item.sprite.x, item.sprite.y
      );
      
      if (distance <= this.settings.range) {
        items.push(item);
      }
    });
    
    return items;
  }
  
  // 清理所有物品
  public clearAllItems(): void {
    this.pickupItems.forEach(item => {
      item.sprite.destroy();
      if ((item.sprite as any).stackText) {
        (item.sprite as any).stackText.destroy();
      }
    });
    this.pickupItems.clear();
  }
  
  // 销毁系统
  public destroy(): void {
    this.clearAllItems();
    if (this.rangeGraphics) {
      this.rangeGraphics.destroy();
      this.rangeGraphics = null;
    }
    this.removeAllListeners();
  }
} 