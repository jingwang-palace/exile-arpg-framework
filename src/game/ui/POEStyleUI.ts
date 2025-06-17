export default class POEStyleUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    
    // UI元素
    private healthGlobe!: Phaser.GameObjects.Container;
    private manaGlobe!: Phaser.GameObjects.Container;
    private skillBar!: Phaser.GameObjects.Container;
    private potionBar!: Phaser.GameObjects.Container;
    
    // 血量相关
    private healthText!: Phaser.GameObjects.Text;
    private healthFill!: Phaser.GameObjects.Graphics;
    private manaText!: Phaser.GameObjects.Text;
    private manaFill!: Phaser.GameObjects.Graphics;
    
    // 技能槽
    private skillSlotElements: Phaser.GameObjects.Container[] = [];
    private skillSlotTexts: Phaser.GameObjects.Text[] = [];
    
    // 药水槽
    private potionSlotElements: Phaser.GameObjects.Container[] = [];
    private potionSlotTexts: Phaser.GameObjects.Text[] = [];
    
    // 游戏数据
    private maxHealth: number = 100;
    private currentHealth: number = 100;
    private maxMana: number = 50;
    private currentMana: number = 50;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createUI();
    }
    
    private createUI() {
        // 创建主容器，固定在屏幕底部
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0); // 固定在屏幕上
        
        this.createHealthGlobe();
        this.createManaGlobe();
        this.createSkillBar();
        this.createPotionBar();
    }
    
    private createHealthGlobe() {
        const x = 80;
        const y = this.scene.cameras.main.height - 80;
        
        this.healthGlobe = this.scene.add.container(x, y);
        this.healthGlobe.setScrollFactor(0);
        
        // 血量球背景（深红色圆）
        const globeBg = this.scene.add.circle(0, 0, 35, 0x330000);
        globeBg.setStrokeStyle(2, 0x660000);
        this.healthGlobe.add(globeBg);
        
        // 血量填充（用Graphics绘制）
        this.healthFill = this.scene.add.graphics();
        this.healthGlobe.add(this.healthFill);
        
        // 血量文字
        this.healthText = this.scene.add.text(0, 0, '100/100', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.healthGlobe.add(this.healthText);
        
        this.container.add(this.healthGlobe);
        this.updateHealthGlobe();
    }
    
    private createManaGlobe() {
        const x = this.scene.cameras.main.width - 80;
        const y = this.scene.cameras.main.height - 80;
        
        this.manaGlobe = this.scene.add.container(x, y);
        this.manaGlobe.setScrollFactor(0);
        
        // 魔力球背景（深蓝色圆）
        const globeBg = this.scene.add.circle(0, 0, 35, 0x000033);
        globeBg.setStrokeStyle(2, 0x000066);
        this.manaGlobe.add(globeBg);
        
        // 魔力填充
        this.manaFill = this.scene.add.graphics();
        this.manaGlobe.add(this.manaFill);
        
        // 魔力文字
        this.manaText = this.scene.add.text(0, 0, '50/50', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.manaGlobe.add(this.manaText);
        
        this.container.add(this.manaGlobe);
        this.updateManaGlobe();
    }
    
    private createSkillBar() {
        const centerX = this.scene.cameras.main.width / 2;
        const y = this.scene.cameras.main.height - 120;
        
        this.skillBar = this.scene.add.container(centerX, y);
        this.skillBar.setScrollFactor(0);
        
        const skillKeys = ['Q', 'E', 'R', 'T'];
        const slotSize = 50;
        const spacing = 60;
        
        for (let i = 0; i < 4; i++) {
            const x = (i - 1.5) * spacing;
            
            // 创建技能槽容器
            const slotContainer = this.scene.add.container(x, 0);
            
            // 技能槽背景
            const slotBg = this.scene.add.rectangle(0, 0, slotSize, slotSize, 0x222222);
            slotBg.setStrokeStyle(2, 0x444444);
            slotContainer.add(slotBg);
            
            // 按键提示
            const keyText = this.scene.add.text(0, 20, skillKeys[i], {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            slotContainer.add(keyText);
            
            // 技能名称（初始为空）
            const skillText = this.scene.add.text(0, -15, '空', {
                fontSize: '10px',
                color: '#888888'
            }).setOrigin(0.5);
            slotContainer.add(skillText);
            
            this.skillSlotElements.push(slotContainer);
            this.skillSlotTexts.push(skillText);
            this.skillBar.add(slotContainer);
        }
        
        this.container.add(this.skillBar);
    }
    
    private createPotionBar() {
        const centerX = this.scene.cameras.main.width / 2;
        const y = this.scene.cameras.main.height - 60;
        
        this.potionBar = this.scene.add.container(centerX, y);
        this.potionBar.setScrollFactor(0);
        
        const potionKeys = ['1', '2', '3', '4', '5'];
        const slotSize = 40;
        const spacing = 50;
        
        for (let i = 0; i < 5; i++) {
            const x = (i - 2) * spacing;
            
            // 创建药水槽容器
            const slotContainer = this.scene.add.container(x, 0);
            
            // 药水槽背景
            const slotBg = this.scene.add.rectangle(0, 0, slotSize, slotSize, 0x331100);
            slotBg.setStrokeStyle(2, 0x663300);
            slotContainer.add(slotBg);
            
            // 按键提示
            const keyText = this.scene.add.text(0, 15, potionKeys[i], {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            slotContainer.add(keyText);
            
            // 药水数量（初始为空）
            const potionText = this.scene.add.text(0, -10, '', {
                fontSize: '10px',
                color: '#ffffff'
            }).setOrigin(0.5);
            slotContainer.add(potionText);
            
            this.potionSlotElements.push(slotContainer);
            this.potionSlotTexts.push(potionText);
            this.potionBar.add(slotContainer);
        }
        
        this.container.add(this.potionBar);
    }
    
    private updateHealthGlobe() {
        this.healthFill.clear();
        
        const percentage = this.currentHealth / this.maxHealth;
        const radius = 30;
        
        // 绘制血量填充（从底部开始的扇形）
        if (percentage > 0) {
            this.healthFill.fillStyle(0xff0000, 0.8);
            this.healthFill.beginPath();
            this.healthFill.moveTo(0, 0);
            this.healthFill.arc(0, 0, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * percentage), false);
            this.healthFill.closePath();
            this.healthFill.fillPath();
        }
        
        this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    }
    
    private updateManaGlobe() {
        this.manaFill.clear();
        
        const percentage = this.currentMana / this.maxMana;
        const radius = 30;
        
        // 绘制魔力填充
        if (percentage > 0) {
            this.manaFill.fillStyle(0x0000ff, 0.8);
            this.manaFill.beginPath();
            this.manaFill.moveTo(0, 0);
            this.manaFill.arc(0, 0, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * percentage), false);
            this.manaFill.closePath();
            this.manaFill.fillPath();
        }
        
        this.manaText.setText(`${this.currentMana}/${this.maxMana}`);
    }
    
    // 公共接口方法
    public updateHealth(current: number, max: number) {
        this.currentHealth = current;
        this.maxHealth = max;
        this.updateHealthGlobe();
    }
    
    public updateMana(current: number, max: number) {
        this.currentMana = current;
        this.maxMana = max;
        this.updateManaGlobe();
    }
    
    public updateSkillSlot(slotIndex: number, skill: any | null) {
        if (slotIndex >= 0 && slotIndex < this.skillSlotTexts.length) {
            const text = skill ? skill.name || '技能' : '空';
            const color = skill ? '#ffffff' : '#888888';
            this.skillSlotTexts[slotIndex].setText(text);
            this.skillSlotTexts[slotIndex].setColor(color);
        }
    }
    
    public updatePotionSlot(slotIndex: number, potion: any | null, quantity: number = 0) {
        if (slotIndex >= 0 && slotIndex < this.potionSlotTexts.length) {
            if (potion && quantity > 0) {
                this.potionSlotTexts[slotIndex].setText(`${quantity}`);
                this.potionSlotTexts[slotIndex].setColor('#ffffff');
                
                // 药水类型颜色
                if (potion.type === 'health') {
                    this.potionSlotElements[slotIndex].list[0].setFillStyle(0x550000);
                } else if (potion.type === 'mana') {
                    this.potionSlotElements[slotIndex].list[0].setFillStyle(0x000055);
                }
            } else {
                this.potionSlotTexts[slotIndex].setText('');
                this.potionSlotElements[slotIndex].list[0].setFillStyle(0x331100);
            }
        }
    }
    
    public setVisible(visible: boolean) {
        this.container.setVisible(visible);
    }
    
    public destroy() {
        this.container.destroy();
    }
} 