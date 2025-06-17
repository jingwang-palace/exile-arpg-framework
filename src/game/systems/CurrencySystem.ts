import { CurrencyType, CURRENCY_CONFIGS } from '../../types/currency';
import { Equipment, Mod, ModType } from '../../types/item';

export class CurrencySystem {
    private scene: Phaser.Scene;
    private playerCurrencies: Map<CurrencyType, number> = new Map();
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializeCurrencies();
    }
    
    private initializeCurrencies() {
        // 初始化所有通货为0
        Object.values(CurrencyType).forEach(currencyType => {
            this.playerCurrencies.set(currencyType, 0);
        });
        
        // 设置一些初始通货用于测试
        this.playerCurrencies.set(CurrencyType.GOLD, 1000);
        this.playerCurrencies.set(CurrencyType.SILVER, 500);
        this.playerCurrencies.set(CurrencyType.COPPER, 2000);
        this.playerCurrencies.set(CurrencyType.TRANSMUTATION_ORB, 10);
        this.playerCurrencies.set(CurrencyType.ALTERATION_ORB, 5);
        this.playerCurrencies.set(CurrencyType.CHAOS_ORB, 3);
        this.playerCurrencies.set(CurrencyType.EXALTED_ORB, 1);
        this.playerCurrencies.set(CurrencyType.DIVINE_ORB, 1);
        this.playerCurrencies.set(CurrencyType.BLESSED_ORB, 2);
        this.playerCurrencies.set(CurrencyType.BLACKSMITH_WHETSTONE, 8);
        this.playerCurrencies.set(CurrencyType.ARMOURER_SCRAP, 6);
        this.playerCurrencies.set(CurrencyType.ESSENCE_OF_GREED, 2);
        this.playerCurrencies.set(CurrencyType.ESSENCE_OF_HATRED, 1);
        this.playerCurrencies.set(CurrencyType.ESSENCE_OF_WRATH, 1);
        this.playerCurrencies.set(CurrencyType.WISDOM_SCROLL, 20);
        this.playerCurrencies.set(CurrencyType.PORTAL_SCROLL, 15);
        this.playerCurrencies.set(CurrencyType.ENHANCEMENT_ORB, 4);
        this.playerCurrencies.set(CurrencyType.ALCHEMY_SHARD, 12);
        this.playerCurrencies.set(CurrencyType.REGAL_SHARD, 8);
        this.playerCurrencies.set(CurrencyType.ANCIENT_SHARD, 2);
        this.playerCurrencies.set(CurrencyType.FERTILE_CATALYST, 3);
        this.playerCurrencies.set(CurrencyType.PRISMATIC_CATALYST, 2);
        this.playerCurrencies.set(CurrencyType.UNSTABLE_CATALYST, 1);
    }
    
    public getCurrencyAmount(currencyType: CurrencyType): number {
        return this.playerCurrencies.get(currencyType) || 0;
    }
    
    public setCurrencyAmount(currencyType: CurrencyType, amount: number): void {
        this.playerCurrencies.set(currencyType, Math.max(0, amount));
        this.scene.events.emit('currencyChanged', currencyType, amount);
    }
    
    public addCurrency(currencyType: CurrencyType, amount: number): void {
        const currentAmount = this.getCurrencyAmount(currencyType);
        this.setCurrencyAmount(currencyType, currentAmount + amount);
    }
    
    public consumeCurrency(currencyType: CurrencyType, amount: number): boolean {
        const currentAmount = this.getCurrencyAmount(currencyType);
        if (currentAmount >= amount) {
            this.setCurrencyAmount(currencyType, currentAmount - amount);
            return true;
        }
        return false;
    }
    
    public canAfford(currencyType: CurrencyType, amount: number): boolean {
        return this.getCurrencyAmount(currencyType) >= amount;
    }
    
    // 制作系统相关方法
    public canUseCurrencyOnEquipment(currencyType: CurrencyType, equipment: Equipment): boolean {
        if (!equipment) return false;
        
        switch (currencyType) {
            case CurrencyType.TRANSMUTATION_ORB:
                return equipment.explicitMods.length === 0; // 普通装备（无显式词缀）
                
            case CurrencyType.ALTERATION_ORB:
                return equipment.explicitMods.length > 0 && equipment.explicitMods.length <= 2; // 魔法装备
                
            case CurrencyType.CHAOS_ORB:
                return equipment.explicitMods.length >= 3; // 稀有装备
                
            case CurrencyType.EXALTED_ORB:
                return equipment.explicitMods.length >= 3 && equipment.explicitMods.length < 6; // 稀有装备且有词缀空间
                
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
                
            case CurrencyType.ESSENCE_OF_GREED:
            case CurrencyType.ESSENCE_OF_HATRED:
            case CurrencyType.ESSENCE_OF_WRATH:
            case CurrencyType.ESSENCE_OF_FEAR:
                return true; // 精髓可以用于任何装备
                
            default:
                return false;
        }
    }
    
    public applyCraftingEffect(equipment: Equipment, currencyType: CurrencyType): Equipment {
        const newEquipment = JSON.parse(JSON.stringify(equipment)); // 深拷贝
        
        switch (currencyType) {
            case CurrencyType.TRANSMUTATION_ORB:
                // 普通 -> 魔法：添加1-2个随机词缀
                newEquipment.explicitMods = this.generateRandomMods(1, 2, equipment.itemLevel);
                break;
                
            case CurrencyType.ALTERATION_ORB:
                // 重随机魔法装备的词缀
                newEquipment.explicitMods = this.generateRandomMods(1, 2, equipment.itemLevel);
                break;
                
            case CurrencyType.CHAOS_ORB:
                // 重随机稀有装备的所有词缀
                newEquipment.explicitMods = this.generateRandomMods(4, 6, equipment.itemLevel);
                break;
                
            case CurrencyType.EXALTED_ORB:
                // 添加一个新的随机词缀
                if (newEquipment.explicitMods.length < 6) {
                    const newMod = this.generateRandomMods(1, 1, equipment.itemLevel)[0];
                    newEquipment.explicitMods.push(newMod);
                }
                break;
                
            case CurrencyType.DIVINE_ORB:
                // 重随机所有数值属性
                newEquipment.explicitMods = equipment.explicitMods.map(mod => ({
                    ...mod,
                    values: this.rerollModValues(mod)
                }));
                newEquipment.implicitMods = equipment.implicitMods.map(mod => ({
                    ...mod,
                    values: this.rerollModValues(mod)
                }));
                break;
                
            case CurrencyType.BLESSED_ORB:
                // 重随机隐式词缀数值
                newEquipment.implicitMods = equipment.implicitMods.map(mod => ({
                    ...mod,
                    values: this.rerollModValues(mod)
                }));
                break;
                
            case CurrencyType.BLACKSMITH_WHETSTONE:
                // 提升武器品质
                newEquipment.quality = Math.min(20, equipment.quality + Phaser.Math.Between(1, 5));
                break;
                
            case CurrencyType.ARMOURER_SCRAP:
                // 提升防具品质
                newEquipment.quality = Math.min(20, equipment.quality + Phaser.Math.Between(1, 5));
                break;
                
            case CurrencyType.WISDOM_SCROLL:
                // 鉴定装备
                newEquipment.isIdentified = true;
                break;
                
            case CurrencyType.ESSENCE_OF_GREED:
                // 强制添加生命词缀
                const lifeMod = this.createEssenceMod('life', equipment.itemLevel);
                newEquipment.explicitMods = this.replaceOrAddMod(equipment.explicitMods, lifeMod);
                break;
                
            case CurrencyType.ESSENCE_OF_HATRED:
                // 强制添加攻击速度词缀
                const speedMod = this.createEssenceMod('attack_speed', equipment.itemLevel);
                newEquipment.explicitMods = this.replaceOrAddMod(equipment.explicitMods, speedMod);
                break;
                
            case CurrencyType.ESSENCE_OF_WRATH:
                // 强制添加火焰伤害词缀
                const fireMod = this.createEssenceMod('fire_damage', equipment.itemLevel);
                newEquipment.explicitMods = this.replaceOrAddMod(equipment.explicitMods, fireMod);
                break;
        }
        
        return newEquipment;
    }
    
    private generateRandomMods(minCount: number, maxCount: number, itemLevel: number): Mod[] {
        const modCount = Phaser.Math.Between(minCount, maxCount);
        const mods: Mod[] = [];
        
        const availableModTypes = [
            'life', 'mana', 'strength', 'dexterity', 'intelligence', 
            'armor', 'evasion', 'damage', 'attack_speed', 'critical_chance',
            'fire_resistance', 'cold_resistance', 'lightning_resistance',
            'movement_speed', 'item_find', 'gold_find'
        ];
        
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
        const minValue = baseValue;
        const maxValue = baseValue + variance;
        const actualValue = Phaser.Math.Between(minValue, maxValue);
        
        return {
            id: `${modType}_${Date.now()}_${Math.random()}`,
            type: ModType.EXPLICIT,
            name: `mod.${modType}`,
            values: [actualValue],
            tier: Math.min(6, Math.floor(itemLevel / 10) + 1),
            attributes: { [modType]: [minValue, maxValue] }
        };
    }
    
    private createEssenceMod(modType: string, itemLevel: number): Mod {
        const baseValue = Math.max(10, Math.floor(itemLevel / 2) + 15); // 精髓词缀更强
        
        return {
            id: `essence_${modType}_${Date.now()}`,
            type: ModType.EXPLICIT,
            name: `essence.${modType}`,
            values: [baseValue],
            tier: 7, // 精髓词缀是特殊层级
            attributes: { [modType]: [baseValue, baseValue] }
        };
    }
    
    private replaceOrAddMod(existingMods: Mod[], newMod: Mod): Mod[] {
        const modType = Object.keys(newMod.attributes)[0];
        const existingIndex = existingMods.findIndex(mod => 
            Object.keys(mod.attributes).includes(modType)
        );
        
        if (existingIndex >= 0) {
            // 替换现有词缀
            const newMods = [...existingMods];
            newMods[existingIndex] = newMod;
            return newMods;
        } else if (existingMods.length < 6) {
            // 添加新词缀（如果还有空间）
            return [...existingMods, newMod];
        } else {
            // 如果没有空间，随机替换一个
            const newMods = [...existingMods];
            const randomIndex = Phaser.Math.Between(0, existingMods.length - 1);
            newMods[randomIndex] = newMod;
            return newMods;
        }
    }
    
    private rerollModValues(mod: Mod): number[] {
        return mod.values.map((_, index) => {
            const attrKey = Object.keys(mod.attributes)[0];
            const range = mod.attributes[attrKey];
            return Phaser.Math.Between(range[0], range[1]);
        });
    }
    
    // 掉落通货
    public dropCurrency(currencyType: CurrencyType, amount: number, x: number, y: number) {
        // 创建掉落物
        const currencyDrop = this.scene.add.container(x, y);
        
        // 通货图标
        const icon = this.scene.add.text(0, 0, this.getCurrencyIcon(currencyType), {
            fontSize: '24px'
        }).setOrigin(0.5);
        currencyDrop.add(icon);
        
        // 数量文本
        if (amount > 1) {
            const amountText = this.scene.add.text(15, 15, amount.toString(), {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 3, y: 2 }
            }).setOrigin(0.5);
            currencyDrop.add(amountText);
        }
        
        // 发光效果
        const config = CURRENCY_CONFIGS[currencyType];
        if (config.glowEffect) {
            const glow = this.scene.add.circle(0, 0, 30, 0xffffff, 0.2);
            currencyDrop.add(glow);
            currencyDrop.sendToBack(glow);
            
            // 闪烁动画
            this.scene.tweens.add({
                targets: glow,
                alpha: { from: 0.2, to: 0.6 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
        
        // 拾取检测
        const pickupRadius = 40;
        currencyDrop.setData('currencyType', currencyType);
        currencyDrop.setData('amount', amount);
        currencyDrop.setData('pickupRadius', pickupRadius);
        
        // 物理拾取逻辑（需要在游戏循环中检测）
        this.scene.events.emit('currencyDropped', {
            container: currencyDrop,
            currencyType,
            amount,
            x, y,
            pickupRadius
        });
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
    
    // 获取所有通货信息
    public getAllCurrencies(): Map<CurrencyType, number> {
        return new Map(this.playerCurrencies);
    }
    
    // 保存/加载通货数据
    public getCurrencySaveData(): { [key: string]: number } {
        const saveData: { [key: string]: number } = {};
        this.playerCurrencies.forEach((amount, currencyType) => {
            saveData[currencyType] = amount;
        });
        return saveData;
    }
    
    public loadCurrencySaveData(saveData: { [key: string]: number }): void {
        Object.entries(saveData).forEach(([currencyType, amount]) => {
            if (Object.values(CurrencyType).includes(currencyType as CurrencyType)) {
                this.playerCurrencies.set(currencyType as CurrencyType, amount);
            }
        });
    }
} 