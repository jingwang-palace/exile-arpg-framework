import { Scene } from 'phaser';

interface TooltipOptions {
    title: string;
    content: string;
    rarity?: 'normal' | 'magic' | 'rare' | 'unique';
    requirements?: {
        level?: number;
        strength?: number;
        dexterity?: number;
        intelligence?: number;
    };
}

export default class TooltipSystem extends Phaser.GameObjects.Container {
    private isVisible: boolean = false;

    constructor(scene: Scene) {
        super(scene, 0, 0);
        this.setVisible(false);
        this.setDepth(1000);
    }

    showTooltip(x: number, y: number, options: TooltipOptions) {
        // 清除现有内容
        this.removeAll();

        // 创建背景
        const padding = 10;
        const titleText = this.scene.add.text(0, 0, options.title, {
            fontSize: '16px',
            color: this.getRarityColor(options.rarity || 'normal')
        });

        const contentText = this.scene.add.text(0, titleText.height + 5, options.content, {
            fontSize: '14px',
            color: '#ffffff'
        });

        // 计算背景大小
        const width = Math.max(titleText.width, contentText.width) + padding * 2;
        const height = titleText.height + contentText.height + padding * 2;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.9);
        background.setStrokeStyle(1, this.getRarityColor(options.rarity || 'normal'));

        // 添加需求信息
        if (options.requirements) {
            const requirementsText = this.scene.add.text(0, contentText.y + contentText.height + 5, 
                this.formatRequirements(options.requirements), {
                fontSize: '12px',
                color: '#888888'
            });
            this.add(requirementsText);
        }

        // 添加所有元素到容器
        this.add([background, titleText, contentText]);

        // 调整位置
        this.setPosition(x, y);

        // 确保提示框在屏幕内
        const bounds = this.getBounds();
        if (bounds.right > this.scene.cameras.main.width) {
            this.x -= bounds.width;
        }
        if (bounds.bottom > this.scene.cameras.main.height) {
            this.y -= bounds.height;
        }

        this.setVisible(true);
        this.isVisible = true;
    }

    hideTooltip() {
        this.setVisible(false);
        this.isVisible = false;
    }

    update(x: number, y: number) {
        if (this.isVisible) {
            this.setPosition(x, y);
        }
    }

    private getRarityColor(rarity: 'normal' | 'magic' | 'rare' | 'unique'): string {
        switch (rarity) {
            case 'normal': return '#ffffff';
            case 'magic': return '#8888ff';
            case 'rare': return '#ffff77';
            case 'unique': return '#af6025';
            default: return '#ffffff';
        }
    }

    private formatRequirements(requirements: TooltipOptions['requirements']): string {
        const reqs: string[] = [];
        if (requirements?.level) {
            reqs.push(`需要等级 ${requirements.level}`);
        }
        if (requirements?.strength) {
            reqs.push(`需要力量 ${requirements.strength}`);
        }
        if (requirements?.dexterity) {
            reqs.push(`需要敏捷 ${requirements.dexterity}`);
        }
        if (requirements?.intelligence) {
            reqs.push(`需要智力 ${requirements.intelligence}`);
        }
        return reqs.join('\n');
    }
} 