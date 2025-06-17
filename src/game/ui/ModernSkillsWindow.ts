export default class ModernSkillsWindow {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private skillPointsText!: Phaser.GameObjects.Text;
    private visible: boolean = false;
    private gameScene: any;
    
    // 新技能学习系统相关
    private skillManager: any;
    private skillLearningSystem: any;
    
    constructor(scene: Phaser.Scene, x: number, y: number, gameScene?: any) {
        this.scene = scene;
        this.gameScene = gameScene;
        this.createWindow();
    }
    
    // 设置技能学习系统引用
    public setSkillSystems(skillManager: any, skillLearningSystem: any) {
        this.skillManager = skillManager;
        this.skillLearningSystem = skillLearningSystem;
    }
    
    private createWindow() {
        // 创建主容器
        this.container = this.scene.add.container(640, 360);
        this.container.setDepth(1000);
        
        // 创建背景 - 使用POE风格的深色背景
        const background = this.scene.add.rectangle(0, 0, 900, 650, 0x0f0f0f, 0.95);
        background.setStrokeStyle(3, 0x444444);
        this.container.add(background);
        
        // 内部装饰边框
        const innerBorder = this.scene.add.rectangle(0, 0, 860, 610, 0x000000, 0);
        innerBorder.setStrokeStyle(2, 0x666666);
        this.container.add(innerBorder);
        
        // 标题栏
        const titleBg = this.scene.add.rectangle(0, -300, 860, 50, 0x333333, 0.8);
        titleBg.setStrokeStyle(1, 0x666666);
        this.container.add(titleBg);
        
        const title = this.scene.add.text(0, -300, '野蛮人技能树', {
            fontSize: '24px',
            color: '#d4af37',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(title);
        
        // 技能点显示 - 更加突出
        const skillPointsBg = this.scene.add.rectangle(-300, -250, 200, 40, 0x222222, 0.8);
        skillPointsBg.setStrokeStyle(2, 0xffd700);
        this.container.add(skillPointsBg);
        
        this.skillPointsText = this.scene.add.text(-300, -250, '可用技能点: 0', {
            fontSize: '16px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(this.skillPointsText);
        
        // 关闭按钮 - 更美观的设计
        const closeButton = this.scene.add.container(400, -300);
        const closeBg = this.scene.add.circle(0, 0, 20, 0x880000);
        closeBg.setStrokeStyle(2, 0xff0000);
        const closeText = this.scene.add.text(0, 0, '✕', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        closeButton.add([closeBg, closeText]);
        closeButton.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains)
            .setData('cursor', 'pointer')
            .on('pointerdown', () => this.setVisible(false))
            .on('pointerover', () => {
                closeBg.setFillStyle(0xaa0000);
                this.scene.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                closeBg.setFillStyle(0x880000);
                this.scene.game.canvas.style.cursor = 'default';
            });
        
        this.container.add(closeButton);
        
        this.container.setVisible(false);
    }
    
    private updateDisplay() {
        if (!this.skillLearningSystem) {
            console.warn('技能学习系统未设置');
            return;
        }
        
        // 清除现有显示元素（保留背景、标题等固定元素）
        const fixedElements = 7; // 背景、边框、标题栏、标题、技能点背景、技能点文本、关闭按钮
        while (this.container.list.length > fixedElements) {
            const lastElement = this.container.list[this.container.list.length - 1];
            lastElement.destroy();
        }
        
        // 更新技能点显示
        const availablePoints = this.skillLearningSystem.getAvailableSkillPoints();
        this.skillPointsText.setText(`可用技能点: ${availablePoints}`);
        
        // 获取技能数据
        const learnedSkills = this.skillLearningSystem.getLearnedSkills();
        const availableSkills = this.skillLearningSystem.getAvailableSkills();
        
        let yOffset = -200;
        
        // 已学习技能区域
        if (learnedSkills.size > 0) {
            this.createSectionTitle('已掌握技能', -400, yOffset, '#4CAF50');
            yOffset += 50;
            
            Array.from(learnedSkills.entries()).forEach(([skillId, skillData]) => {
                this.createLearnedSkillDisplay(skillId, skillData, -400, yOffset);
                yOffset += 80;
            });
            
            yOffset += 20;
        }
        
        // 可学习技能区域
        if (availableSkills.length > 0) {
            this.createSectionTitle('可学习技能', -400, yOffset, '#2196F3');
            yOffset += 50;
            
            availableSkills.forEach(skill => {
                this.createAvailableSkillDisplay(skill, -400, yOffset);
                yOffset += 80;
            });
        }
        
        // 技能槽配置区域
        this.createSkillSlotConfig(200, -200);
    }
    
    private createSectionTitle(title: string, x: number, y: number, color: string) {
        const titleBg = this.scene.add.rectangle(x + 200, y, 400, 30, 0x333333, 0.6);
        titleBg.setStrokeStyle(1, color);
        this.container.add(titleBg);
        
        const titleText = this.scene.add.text(x + 200, y, title, {
            fontSize: '18px',
            color: color,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(titleText);
    }
    
    private createLearnedSkillDisplay(skillId: string, skillData: any, x: number, y: number) {
        const skillInfo = this.skillLearningSystem.getSkillInfo(skillId);
        
        // 技能卡片背景
        const cardBg = this.scene.add.rectangle(x + 200, y, 380, 70, 0x1a1a1a, 0.9);
        cardBg.setStrokeStyle(2, skillInfo.canUpgrade ? '#ffd700' : '#666666');
        this.container.add(cardBg);
        
        // 技能图标（占位符）
        const skillIcon = this.scene.add.circle(x + 50, y, 25, this.getSkillColor(skillId));
        skillIcon.setStrokeStyle(2, '#ffffff');
        this.container.add(skillIcon);
        
        // 技能名称
        const skillName = this.scene.add.text(x + 100, y - 15, skillInfo.name || skillId, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.container.add(skillName);
        
        // 技能等级和经验
        const levelText = this.scene.add.text(x + 100, y + 5, 
            `等级 ${skillInfo.level}  经验: ${skillInfo.experience}/${skillInfo.nextLevelExp}`, {
            fontSize: '12px',
            color: '#cccccc'
        });
        this.container.add(levelText);
        
        // 升级按钮（如果可升级）
        if (skillInfo.canUpgrade) {
            const upgradeBtn = this.scene.add.container(x + 320, y);
            const upgradeBg = this.scene.add.rectangle(0, 0, 60, 30, 0x4CAF50);
            upgradeBg.setStrokeStyle(1, '#66BB6A');
            const upgradeText = this.scene.add.text(0, 0, '升级', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            upgradeBtn.add([upgradeBg, upgradeText]);
            upgradeBtn.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 60, 30), Phaser.Geom.Rectangle.Contains)
                .setData('cursor', 'pointer')
                .on('pointerdown', () => {
                    if (this.skillLearningSystem.upgradeSkill(skillId)) {
                        this.updateDisplay();
                    }
                })
                .on('pointerover', () => {
                    upgradeBg.setFillStyle(0x66BB6A);
                    this.scene.game.canvas.style.cursor = 'pointer';
                })
                .on('pointerout', () => {
                    upgradeBg.setFillStyle(0x4CAF50);
                    this.scene.game.canvas.style.cursor = 'default';
                });
            
            this.container.add(upgradeBtn);
        }
        
        // 装备到技能槽按钮
        const equipBtn = this.scene.add.container(x + 250, y);
        const equipBg = this.scene.add.rectangle(0, 0, 60, 30, 0x2196F3);
        equipBg.setStrokeStyle(1, '#42A5F5');
        const equipText = this.scene.add.text(0, 0, '装备', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        equipBtn.add([equipBg, equipText]);
        equipBtn.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 60, 30), Phaser.Geom.Rectangle.Contains)
            .setData('cursor', 'pointer')
            .on('pointerdown', () => {
                this.showSkillSlotSelection(skillId);
            })
            .on('pointerover', () => {
                equipBg.setFillStyle(0x42A5F5);
                this.scene.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                equipBg.setFillStyle(0x2196F3);
                this.scene.game.canvas.style.cursor = 'default';
            });
        
        this.container.add(equipBtn);
    }
    
    private createAvailableSkillDisplay(skill: any, x: number, y: number) {
        // 技能卡片背景
        const cardBg = this.scene.add.rectangle(x + 200, y, 380, 70, 0x2a2a2a, 0.7);
        cardBg.setStrokeStyle(2, '#888888');
        this.container.add(cardBg);
        
        // 技能图标
        const skillIcon = this.scene.add.circle(x + 50, y, 25, this.getSkillColor(skill.id));
        skillIcon.setStrokeStyle(2, '#888888');
        this.container.add(skillIcon);
        
        // 技能名称
        const skillName = this.scene.add.text(x + 100, y - 15, skill.name, {
            fontSize: '16px',
            color: '#cccccc',
            fontStyle: 'bold'
        });
        this.container.add(skillName);
        
        // 学习要求
        const requirementText = this.scene.add.text(x + 100, y + 5, 
            `需要等级: ${skill.requiredLevel}  消耗: ${skill.skillPointCost} 技能点`, {
            fontSize: '12px',
            color: '#999999'
        });
        this.container.add(requirementText);
        
        // 学习按钮
        const canLearn = this.skillLearningSystem.canLearnSkill(skill.id);
        const learnBtn = this.scene.add.container(x + 320, y);
        const learnBg = this.scene.add.rectangle(0, 0, 60, 30, canLearn ? 0xFF9800 : 0x555555);
        learnBg.setStrokeStyle(1, canLearn ? '#FFB74D' : '#777777');
        const learnText = this.scene.add.text(0, 0, '学习', {
            fontSize: '12px',
            color: canLearn ? '#ffffff' : '#999999',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        learnBtn.add([learnBg, learnText]);
        
        if (canLearn) {
            learnBtn.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 60, 30), Phaser.Geom.Rectangle.Contains)
                .setData('cursor', 'pointer')
                .on('pointerdown', () => {
                    if (this.skillLearningSystem.learnSkill(skill.id)) {
                        this.updateDisplay();
                    }
                })
                .on('pointerover', () => {
                    learnBg.setFillStyle(0xFFB74D);
                    this.scene.game.canvas.style.cursor = 'pointer';
                })
                .on('pointerout', () => {
                    learnBg.setFillStyle(0xFF9800);
                    this.scene.game.canvas.style.cursor = 'default';
                });
        }
        
        this.container.add(learnBtn);
    }
    
    private createSkillSlotConfig(x: number, y: number) {
        // 技能槽配置标题
        this.createSectionTitle('技能槽配置', x, y, '#9C27B0');
        
        const slotNames = ['Q槽', 'E槽', 'R槽', 'T槽'];
        
        for (let i = 0; i < 4; i++) {
            const slotY = y + 60 + i * 60;
            
            // 槽位背景
            const slotBg = this.scene.add.rectangle(x, slotY, 300, 50, 0x333333, 0.8);
            slotBg.setStrokeStyle(1, '#666666');
            this.container.add(slotBg);
            
            // 槽位名称
            const slotName = this.scene.add.text(x - 120, slotY, slotNames[i], {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add(slotName);
            
            // 当前装备的技能
            const equippedSkill = this.skillManager ? this.skillManager.getEquippedSkill(i) : null;
            const skillText = this.scene.add.text(x, slotY, equippedSkill ? equippedSkill.name : '空', {
                fontSize: '12px',
                color: equippedSkill ? '#ffffff' : '#888888'
            }).setOrigin(0.5);
            this.container.add(skillText);
            
            // 配置按钮
            const configBtn = this.scene.add.container(x + 100, slotY);
            const configBg = this.scene.add.rectangle(0, 0, 50, 30, 0x9C27B0);
            configBg.setStrokeStyle(1, '#BA68C8');
            const configText = this.scene.add.text(0, 0, '配置', {
                fontSize: '10px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            configBtn.add([configBg, configText]);
            configBtn.setInteractive(new Phaser.Geom.Rectangle(-25, -15, 50, 30), Phaser.Geom.Rectangle.Contains)
                .setData('cursor', 'pointer')
                .on('pointerdown', () => {
                    this.showSkillSlotSelection(null, i);
                })
                .on('pointerover', () => {
                    configBg.setFillStyle(0xBA68C8);
                    this.scene.game.canvas.style.cursor = 'pointer';
                })
                .on('pointerout', () => {
                    configBg.setFillStyle(0x9C27B0);
                    this.scene.game.canvas.style.cursor = 'default';
                });
            
            this.container.add(configBtn);
        }
    }
    
    private showSkillSlotSelection(skillId: string | null, targetSlot?: number) {
        // 创建技能槽选择弹窗
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(1100);
        
        const popupBg = this.scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
        popupBg.setStrokeStyle(2, '#ffffff');
        popup.add(popupBg);
        
        const title = this.scene.add.text(0, -120, skillId ? '选择技能槽' : '选择技能', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);
        
        if (skillId) {
            // 显示技能槽选择
            const slotNames = ['Q槽', 'E槽', 'R槽', 'T槽'];
            for (let i = 0; i < 4; i++) {
                const slotBtn = this.scene.add.container(0, -60 + i * 40);
                const slotBg = this.scene.add.rectangle(0, 0, 200, 30, 0x333333);
                slotBg.setStrokeStyle(1, '#666666');
                const slotText = this.scene.add.text(0, 0, slotNames[i], {
                    fontSize: '14px',
                    color: '#ffffff'
                }).setOrigin(0.5);
                
                slotBtn.add([slotBg, slotText]);
                slotBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -15, 200, 30), Phaser.Geom.Rectangle.Contains)
                    .on('pointerdown', () => {
                        this.skillManager.equipSkill(skillId, i);
                        popup.destroy();
                        this.updateDisplay();
                    });
                popup.add(slotBtn);
            }
        } else if (targetSlot !== undefined) {
            // 显示已学习技能选择
            const learnedSkills = this.skillLearningSystem.getLearnedSkills();
            let yOffset = -80;
            
            // 清空槽位选项
            const clearBtn = this.scene.add.container(0, yOffset);
            const clearBg = this.scene.add.rectangle(0, 0, 200, 30, 0x880000);
            const clearText = this.scene.add.text(0, 0, '清空', {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            clearBtn.add([clearBg, clearText]);
            clearBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -15, 200, 30), Phaser.Geom.Rectangle.Contains)
                .on('pointerdown', () => {
                    this.skillManager.unequipSkill(targetSlot);
                    popup.destroy();
                    this.updateDisplay();
                });
            popup.add(clearBtn);
            yOffset += 40;
            
            // 技能选项
            Array.from(learnedSkills.keys()).forEach(skillId => {
                const skillBtn = this.scene.add.container(0, yOffset);
                const skillBg = this.scene.add.rectangle(0, 0, 200, 30, 0x333333);
                const skillText = this.scene.add.text(0, 0, skillId, {
                    fontSize: '14px',
                    color: '#ffffff'
                }).setOrigin(0.5);
                
                skillBtn.add([skillBg, skillText]);
                skillBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -15, 200, 30), Phaser.Geom.Rectangle.Contains)
                    .on('pointerdown', () => {
                        this.skillManager.equipSkill(skillId, targetSlot);
                        popup.destroy();
                        this.updateDisplay();
                    });
                popup.add(skillBtn);
                yOffset += 40;
            });
        }
        
        // 关闭按钮
        const closeBtn = this.scene.add.text(150, -120, '✕', {
            fontSize: '18px',
            color: '#ff0000'
        }).setInteractive()
            .on('pointerdown', () => popup.destroy());
        popup.add(closeBtn);
    }
    
    private getSkillColor(skillId: string): number {
        // 根据技能类型返回不同颜色
        if (skillId.includes('fire') || skillId.includes('burn')) return 0xff4444;
        if (skillId.includes('slam') || skillId.includes('strike')) return 0xffaa44;
        if (skillId.includes('call') || skillId.includes('ancestral')) return 0x44ff44;
        if (skillId.includes('intimidating') || skillId.includes('shout')) return 0x4444ff;
        return 0x888888;
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
    
    public getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }
    
    public setSkillPoints(points: number) {
        // 这个方法现在主要用于兼容性
        if (this.skillPointsText) {
            this.skillPointsText.setText(`可用技能点: ${points}`);
        }
    }
} 