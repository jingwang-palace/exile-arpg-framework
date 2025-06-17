import { CurrencyType, CURRENCY_CONFIGS } from '../../types/currency';
import { Equipment, ItemQuality, Mod, ModType } from '../../types/item';
import { CurrencySystem } from '../systems/CurrencySystem';

export default class CraftingWindow {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private visible: boolean = false;
    
    // 当前选中的装备和通货
    private selectedEquipment: Equipment | null = null;
    private selectedCurrency: CurrencyType | null = null;
    
    // UI元素
    private equipmentSlot!: Phaser.GameObjects.Container;
    private currencySlots!: Phaser.GameObjects.Container;
    private craftButton!: Phaser.GameObjects.Text;
    private resultPreview!: Phaser.GameObjects.Container;
    private equipmentInfoText!: Phaser.GameObjects.Text;
    private currencyInfoText!: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createWindow();
    }
    
    private createWindow() {
        // 创建主容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);
        this.container.setScrollFactor(0);
        
        // 创建背景
        const background = this.scene.add.rectangle(0, 0, 1000, 700, 0x1a1a1a, 0.95);
        background.setStrokeStyle(3, 0x8b4513);
        this.container.add(background);
        
        // 标题栏
        const titleBg = this.scene.add.rectangle(0, -325, 1000, 50, 0x654321, 0.9);
        titleBg.setStrokeStyle(2, 0x8b4513);
        this.container.add(titleBg);
        
        const title = this.scene.add.text(0, -325, '🔨 通货制作工坊 🔨', {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(title);
        
        // 关闭按钮
        const closeButton = this.scene.add.text(450, -325, '✕', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.setVisible(false))
        .on('pointerover', () => closeButton.setScale(1.2))
        .on('pointerout', () => closeButton.setScale(1));
        this.container.add(closeButton);
        
        this.createEquipmentSection();
        this.createCurrencySection();
        this.createCraftingSection();
        this.createInfoSection();
        
        this.container.setVisible(false);
    }
    
    private createEquipmentSection() {
        // 装备区域标题
        const equipTitle = this.scene.add.text(-350, -250, '📦 选择装备', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.container.add(equipTitle);
        
        // 装备槽位
        this.equipmentSlot = this.scene.add.container(-350, -180);
        this.container.add(this.equipmentSlot);
        
        this.createEquipmentSlot();
    }
    
    private createEquipmentSlot() {
        this.equipmentSlot.removeAll(true);
        
        // 装备槽位背景
        const slotBg = this.scene.add.rectangle(0, 0, 80, 80, 0x444444, 0.8);
        slotBg.setStrokeStyle(2, 0x666666);
        slotBg.setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.openEquipmentSelection())
        .on('pointerover', () => slotBg.setStrokeStyle(2, 0x8b4513))
        .on('pointerout', () => slotBg.setStrokeStyle(2, 0x666666));
        this.equipmentSlot.add(slotBg);
        
        if (this.selectedEquipment) {
            // 显示装备图标
            const icon = this.scene.add.text(0, 0, this.getEquipmentIcon(this.selectedEquipment), {
                fontSize: '32px'
            }).setOrigin(0.5);
            this.equipmentSlot.add(icon);
            
            // 品质边框
            const qualityColor = this.getQualityColor(this.selectedEquipment.quality);
            slotBg.setStrokeStyle(3, qualityColor);
        } else {
            // 空槽位提示
            const placeholder = this.scene.add.text(0, 0, '+', {
                fontSize: '24px',
                color: '#888888'
            }).setOrigin(0.5);
            this.equipmentSlot.add(placeholder);
        }
    }
    
    private createCurrencySection() {
        // 通货区域标题
        const currencyTitle = this.scene.add.text(50, -250, '💰 选择通货', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.container.add(currencyTitle);
        
        // 通货槽位容器
        this.currencySlots = this.scene.add.container(200, -150);
        this.container.add(this.currencySlots);
        
        this.createCurrencySlots();
    }
    
    private createCurrencySlots() {
        this.currencySlots.removeAll(true);
        
        // 可用的制作通货
        const craftingCurrencies = [
            CurrencyType.TRANSMUTATION_ORB,
            CurrencyType.ALTERATION_ORB,
            CurrencyType.CHAOS_ORB,
            CurrencyType.EXALTED_ORB,
            CurrencyType.DIVINE_ORB,
            CurrencyType.BLESSED_ORB,
            CurrencyType.BLACKSMITH_WHETSTONE,
            CurrencyType.ARMOURER_SCRAP,
            CurrencyType.ESSENCE_OF_GREED,
            CurrencyType.ESSENCE_OF_HATRED,
            CurrencyType.ESSENCE_OF_WRATH,
            CurrencyType.WISDOM_SCROLL
        ];
        
        let x = 0;
        let y = 0;
        const slotsPerRow = 4;
        
        craftingCurrencies.forEach((currencyType, index) => {
            const config = CURRENCY_CONFIGS[currencyType];
            const slotContainer = this.scene.add.container(x, y);
            this.currencySlots.add(slotContainer);
            
            // 通货槽位背景
            const slotBg = this.scene.add.rectangle(0, 0, 60, 60, 0x333333, 0.8);
            const isSelected = this.selectedCurrency === currencyType;
            slotBg.setStrokeStyle(2, isSelected ? 0xffd700 : 0x555555);
            slotContainer.add(slotBg);
            
            // 通货图标
            const icon = this.scene.add.text(0, 0, this.getCurrencyIcon(currencyType), {
                fontSize: '20px'
            }).setOrigin(0.5);
            slotContainer.add(icon);
            
            // 通货数量（从玩家库存获取）
            const amount = this.getPlayerCurrencyAmount(currencyType);
            const amountText = this.scene.add.text(20, 20, amount.toString(), {
                fontSize: '10px',
                color: amount > 0 ? '#ffffff' : '#666666',
                backgroundColor: '#000000',
                padding: { x: 2, y: 2 }
            }).setOrigin(0.5);
            slotContainer.add(amountText);
            
            // 点击事件
            slotBg.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                if (amount > 0) {
                    this.selectCurrency(currencyType);
                }
            })
            .on('pointerover', () => {
                if (amount > 0) {
                    slotBg.setStrokeStyle(2, 0x8b4513);
                }
            })
            .on('pointerout', () => {
                slotBg.setStrokeStyle(2, isSelected ? 0xffd700 : 0x555555);
            });
            
            // 如果没有这个通货，显示为禁用状态
            if (amount === 0) {
                slotContainer.setAlpha(0.5);
            }
            
            // 计算下一个位置
            x += 80;
            if ((index + 1) % slotsPerRow === 0) {
                x = 0;
                y += 80;
            }
        });
    }
    
    private createCraftingSection() {
        // 制作按钮
        this.craftButton = this.scene.add.text(0, 100, '🔨 制作', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#2c5530',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.performCrafting())
        .on('pointerover', () => this.craftButton.setBackgroundColor('#4a7c59'))
        .on('pointerout', () => this.craftButton.setBackgroundColor('#2c5530'));
        
        this.container.add(this.craftButton);
        this.updateCraftButton();
        
        // 结果预览区域
        this.resultPreview = this.scene.add.container(0, 200);
        this.container.add(this.resultPreview);
        
        this.createResultPreview();
    }
    
    private createResultPreview() {
        this.resultPreview.removeAll(true);
        
        if (!this.selectedEquipment || !this.selectedCurrency) {
            const hintText = this.scene.add.text(0, 0, '选择装备和通货开始制作', {
                fontSize: '16px',
                color: '#888888'
            }).setOrigin(0.5);
            this.resultPreview.add(hintText);
            return;
        }
        
        // 显示制作效果预览
        const currencyConfig = CURRENCY_CONFIGS[this.selectedCurrency];
        const previewText = this.scene.add.text(0, -20, '制作效果预览:', {
            fontSize: '16px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.resultPreview.add(previewText);
        
        const effectText = this.scene.add.text(0, 10, currencyConfig.useDescription, {
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: 400 }
        }).setOrigin(0.5);
        this.resultPreview.add(effectText);
        
        // 风险提示
        const warningText = this.scene.add.text(0, 40, '⚠️ 制作结果是随机的，请谨慎操作', {
            fontSize: '12px',
            color: '#ff6b6b'
        }).setOrigin(0.5);
        this.resultPreview.add(warningText);
    }
    
    private createInfoSection() {
        // 装备信息显示
        this.equipmentInfoText = this.scene.add.text(-450, 50, '', {
            fontSize: '12px',
            color: '#ffffff',
            wordWrap: { width: 200 }
        });
        this.container.add(this.equipmentInfoText);
        
        // 通货信息显示
        this.currencyInfoText = this.scene.add.text(250, 50, '', {
            fontSize: '12px',
            color: '#ffffff',
            wordWrap: { width: 200 }
        });
        this.container.add(this.currencyInfoText);
        
        this.updateInfoDisplays();
    }
    
    private selectCurrency(currencyType: CurrencyType) {
        this.selectedCurrency = currencyType;
        this.createCurrencySlots(); // 重新创建以更新选中状态
        this.updateCraftButton();
        this.createResultPreview();
        this.updateInfoDisplays();
    }
    
    private updateCraftButton() {
        const canCraft = this.selectedEquipment && 
                        this.selectedCurrency && 
                        this.getPlayerCurrencyAmount(this.selectedCurrency) > 0 &&
                        this.canUseCurrencyOnEquipment(this.selectedCurrency, this.selectedEquipment);
        
        this.craftButton.setAlpha(canCraft ? 1 : 0.5);
        this.craftButton.setInteractive(canCraft);
    }
    
    private canUseCurrencyOnEquipment(currencyType: CurrencyType, equipment: Equipment | null): boolean {
        if (!equipment) return false;
        
        switch (currencyType) {
            case CurrencyType.TRANSMUTATION_ORB:
                return equipment.explicitMods.length === 0; // 普通装备（无显式词缀）
            case CurrencyType.ALTERATION_ORB:
                return equipment.explicitMods.length > 0 && equipment.explicitMods.length <= 2; // 魔法装备
            case CurrencyType.CHAOS_ORB:
                return equipment.explicitMods.length >= 3; // 稀有装备
            case CurrencyType.EXALTED_ORB:
                return equipment.explicitMods.length >= 3 && equipment.explicitMods.length < 6; // 稀有装备且有空间
            case CurrencyType.DIVINE_ORB:
                return equipment.explicitMods.length > 0 || equipment.implicitMods.length > 0; // 有词缀的装备
            case CurrencyType.BLESSED_ORB:
                return equipment.implicitMods.length > 0; // 有隐式词缀的装备
            case CurrencyType.BLACKSMITH_WHETSTONE:
                return equipment.slot === 'weapon' && equipment.quality < 20; // 武器且品质未满
            case CurrencyType.ARMOURER_SCRAP:
                return equipment.slot !== 'weapon' && equipment.quality < 20; // 防具且品质未满
            case CurrencyType.WISDOM_SCROLL:
                return !equipment.isIdentified; // 未鉴定装备
            default:
                return true; // 精髓等可以用于任何装备
        }
    }
    
    private performCrafting() {
        if (!this.selectedEquipment || !this.selectedCurrency) return;
        
        const currencyAmount = this.getPlayerCurrencyAmount(this.selectedCurrency);
        if (currencyAmount <= 0) return;
        
        // 消耗通货
        this.consumeCurrency(this.selectedCurrency, 1);
        
        // 应用制作效果
        const newEquipment = this.applyCraftingEffect(this.selectedEquipment, this.selectedCurrency);
        
        // 更新装备
        this.selectedEquipment = newEquipment;
        this.createEquipmentSlot();
        this.createCurrencySlots();
        this.updateCraftButton();
        this.createResultPreview();
        this.updateInfoDisplays();
        
        // 显示制作结果
        this.showCraftingResult(newEquipment);
        
        console.log(`使用 ${CURRENCY_CONFIGS[this.selectedCurrency].name} 制作装备完成`);
    }
    
    private applyCraftingEffect(equipment: Equipment, currencyType: CurrencyType): Equipment {
        // 简化版本的制作效果，实际项目中应该使用CurrencySystem
        const newEquipment = JSON.parse(JSON.stringify(equipment));
        
        switch (currencyType) {
            case CurrencyType.TRANSMUTATION_ORB:
                newEquipment.explicitMods = this.generateRandomMods(1, 2, equipment.itemLevel);
                break;
            case CurrencyType.ALTERATION_ORB:
                newEquipment.explicitMods = this.generateRandomMods(1, 2, equipment.itemLevel);
                break;
            case CurrencyType.CHAOS_ORB:
                newEquipment.explicitMods = this.generateRandomMods(4, 6, equipment.itemLevel);
                break;
            case CurrencyType.BLACKSMITH_WHETSTONE:
                newEquipment.quality = Math.min(20, equipment.quality + Phaser.Math.Between(1, 5));
                break;
            case CurrencyType.WISDOM_SCROLL:
                newEquipment.isIdentified = true;
                break;
        }
        
        return newEquipment;
    }
    
    private generateRandomMods(minCount: number, maxCount: number, itemLevel: number): Mod[] {
        const modCount = Phaser.Math.Between(minCount, maxCount);
        const mods: Mod[] = [];
        
        const availableModTypes = ['life', 'mana', 'strength', 'dexterity', 'intelligence', 
                                  'armor', 'evasion', 'damage', 'attack_speed', 'critical_chance'];
        
        for (let i = 0; i < modCount; i++) {
            const modType = Phaser.Utils.Array.GetRandom(availableModTypes);
            const mod = this.createRandomMod(modType, itemLevel);
            mods.push(mod);
        }
        
        return mods;
    }
    
    private createRandomMod(modType: string, itemLevel: number): Mod {
        const baseValue = Math.max(1, Math.floor(itemLevel / 2));
        const variance = Math.max(1, Math.floor(itemLevel / 4));
        
        return {
            id: `${modType}_${Date.now()}_${Math.random()}`,
            type: ModType.EXPLICIT,
            name: `mod.${modType}`,
            values: [Phaser.Math.Between(baseValue, baseValue + variance)],
            tier: Math.min(6, Math.floor(itemLevel / 10) + 1),
            attributes: { [modType]: [baseValue, baseValue + variance] }
        };
    }
    
    private showCraftingResult(equipment: Equipment) {
        // 创建结果弹窗
        const resultContainer = this.scene.add.container(0, 0);
        resultContainer.setDepth(3000);
        this.scene.add.existing(resultContainer);
        
        const resultBg = this.scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.9);
        resultBg.setStrokeStyle(3, 0xffd700);
        resultContainer.add(resultBg);
        
        const resultTitle = this.scene.add.text(0, -60, '制作完成！', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultContainer.add(resultTitle);
        
        const equipmentName = this.scene.add.text(0, -20, equipment.name || '未知装备', {
            fontSize: '16px',
            color: this.getQualityColorHex(equipment.quality)
        }).setOrigin(0.5);
        resultContainer.add(equipmentName);
        
        const okButton = this.scene.add.text(0, 40, '确定', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#4a7c59',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => resultContainer.destroy());
        resultContainer.add(okButton);
        
        // 3秒后自动关闭
        this.scene.time.delayedCall(3000, () => {
            if (resultContainer.active) {
                resultContainer.destroy();
            }
        });
    }
    
    private updateInfoDisplays() {
        // 更新装备信息
        if (this.selectedEquipment) {
            let equipInfo = `${this.selectedEquipment.name}\n`;
            equipInfo += `物品等级: ${this.selectedEquipment.itemLevel}\n`;
            equipInfo += `品质: +${this.selectedEquipment.quality}%\n`;
            if (this.selectedEquipment.explicitMods.length > 0) {
                equipInfo += `\n词缀:\n`;
                this.selectedEquipment.explicitMods.forEach(mod => {
                    equipInfo += `• ${mod.name}: ${mod.values.join('-')}\n`;
                });
            }
            this.equipmentInfoText.setText(equipInfo);
        } else {
            this.equipmentInfoText.setText('请选择一件装备');
        }
        
        // 更新通货信息
        if (this.selectedCurrency) {
            const config = CURRENCY_CONFIGS[this.selectedCurrency];
            let currencyInfo = `${config.name}\n`;
            currencyInfo += `拥有数量: ${this.getPlayerCurrencyAmount(this.selectedCurrency)}\n\n`;
            currencyInfo += `效果:\n${config.useDescription}`;
            this.currencyInfoText.setText(currencyInfo);
        } else {
            this.currencyInfoText.setText('请选择一种通货');
        }
    }
    
    private openEquipmentSelection() {
        // 创建一个测试装备
        const testEquipment: Equipment = {
            id: 'test_sword',
            name: '测试长剑',
            description: '一把用于测试的长剑',
            type: 'weapon' as any,
            slot: 'weapon' as any,
            quality: 0,
            itemLevel: 20,
            level: 15,
            stackable: false,
            maxStack: 1,
            sellPrice: 100,
            icon: '⚔️',
            attributes: { 'damage': 25, 'attack_speed': 10 },
            implicitMods: [],
            explicitMods: [],
            isIdentified: true
        };
        
        this.selectedEquipment = testEquipment;
        this.createEquipmentSlot();
        this.updateCraftButton();
        this.createResultPreview();
        this.updateInfoDisplays();
    }
    
    // 工具方法
    private getEquipmentIcon(equipment: Equipment): string {
        if (equipment.slot === 'weapon') return '⚔️';
        if (equipment.slot === 'head') return '🪖';
        if (equipment.slot === 'chest') return '🛡️';
        return '📦';
    }
    
    private getCurrencyIcon(currencyType: CurrencyType): string {
        const icons: { [key in CurrencyType]: string } = {
            [CurrencyType.GOLD]: '🪙',
            [CurrencyType.SILVER]: '🥈',
            [CurrencyType.COPPER]: '🥉',
            [CurrencyType.TRANSMUTATION_ORB]: '🔵',
            [CurrencyType.ALTERATION_ORB]: '🟦',
            [CurrencyType.CHAOS_ORB]: '🟨',
            [CurrencyType.EXALTED_ORB]: '🟩',
            [CurrencyType.DIVINE_ORB]: '🟪',
            [CurrencyType.BLESSED_ORB]: '⚪',
            [CurrencyType.BLACKSMITH_WHETSTONE]: '🔧',
            [CurrencyType.ARMOURER_SCRAP]: '🛠️',
            [CurrencyType.ESSENCE_OF_GREED]: '💚',
            [CurrencyType.ESSENCE_OF_HATRED]: '💜',
            [CurrencyType.ESSENCE_OF_WRATH]: '❤️',
            [CurrencyType.ESSENCE_OF_FEAR]: '🖤',
            [CurrencyType.WISDOM_SCROLL]: '📜',
            [CurrencyType.PORTAL_SCROLL]: '🌀',
            [CurrencyType.ENHANCEMENT_ORB]: '✨',
            [CurrencyType.ALCHEMY_SHARD]: '🔸',
            [CurrencyType.REGAL_SHARD]: '🔹',
            [CurrencyType.ANCIENT_SHARD]: '🔶',
            [CurrencyType.FERTILE_CATALYST]: '🌱',
            [CurrencyType.PRISMATIC_CATALYST]: '🌈',
            [CurrencyType.UNSTABLE_CATALYST]: '⚡'
        };
        return icons[currencyType] || '❓';
    }
    
    private getQualityColor(quality: number): number {
        if (quality >= 15) return 0xffd700; // 金色
        if (quality >= 10) return 0x9b59b6; // 紫色
        if (quality >= 5) return 0x3498db;  // 蓝色
        return 0x95a5a6; // 灰色
    }
    
    private getQualityColorHex(quality: number): string {
        if (quality >= 15) return '#ffd700';
        if (quality >= 10) return '#9b59b6';
        if (quality >= 5) return '#3498db';
        return '#95a5a6';
    }
    
    private getPlayerCurrencyAmount(currencyType: CurrencyType): number {
        // 简化版本，实际项目中应该从CurrencySystem获取
        const testAmounts: { [key in CurrencyType]: number } = {
            [CurrencyType.GOLD]: 1000,
            [CurrencyType.SILVER]: 500,
            [CurrencyType.COPPER]: 2000,
            [CurrencyType.TRANSMUTATION_ORB]: 10,
            [CurrencyType.ALTERATION_ORB]: 5,
            [CurrencyType.CHAOS_ORB]: 3,
            [CurrencyType.EXALTED_ORB]: 1,
            [CurrencyType.DIVINE_ORB]: 0,
            [CurrencyType.BLESSED_ORB]: 2,
            [CurrencyType.BLACKSMITH_WHETSTONE]: 8,
            [CurrencyType.ARMOURER_SCRAP]: 6,
            [CurrencyType.ESSENCE_OF_GREED]: 1,
            [CurrencyType.ESSENCE_OF_HATRED]: 1,
            [CurrencyType.ESSENCE_OF_WRATH]: 0,
            [CurrencyType.ESSENCE_OF_FEAR]: 0,
            [CurrencyType.WISDOM_SCROLL]: 20,
            [CurrencyType.PORTAL_SCROLL]: 15,
            [CurrencyType.ENHANCEMENT_ORB]: 4,
            [CurrencyType.ALCHEMY_SHARD]: 12,
            [CurrencyType.REGAL_SHARD]: 8,
            [CurrencyType.ANCIENT_SHARD]: 2,
            [CurrencyType.FERTILE_CATALYST]: 3,
            [CurrencyType.PRISMATIC_CATALYST]: 2,
            [CurrencyType.UNSTABLE_CATALYST]: 1
        };
        return testAmounts[currencyType] || 0;
    }
    
    private consumeCurrency(currencyType: CurrencyType, amount: number) {
        // 简化版本，实际项目中应该通过CurrencySystem处理
        console.log(`消耗 ${amount} 个 ${CURRENCY_CONFIGS[currencyType].name}`);
    }
    
    // 公共方法
    public setVisible(visible: boolean) {
        this.visible = visible;
        this.container.setVisible(visible);
        
        if (visible) {
            // 设置窗口位置到屏幕中心
            const screenCenterX = this.scene.cameras.main.width / 2;
            const screenCenterY = this.scene.cameras.main.height / 2;
            this.container.setPosition(screenCenterX, screenCenterY);
            
            // 刷新显示
            this.createCurrencySlots();
            this.updateInfoDisplays();
        }
    }
    
    public isVisible(): boolean {
        return this.visible;
    }
    
    public getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }
} 