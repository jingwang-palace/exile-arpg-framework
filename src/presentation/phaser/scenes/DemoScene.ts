import { Scene } from 'phaser';
import { UIManager } from '../ui/UIManager';
import NotificationSystem, { NotificationType } from '../ui/NotificationSystem';
import { DamageTextSystem, DamageTextType } from '../ui/DamageTextSystem';
import { MiniMapSystem, MapMarkerType } from '../ui/MiniMapSystem';
import { QuestSystem, QuestType, QuestStatus, QuestObjectiveType } from '../../../domain/Quest/QuestSystem';
import TooltipSystem from '../ui/TooltipSystem';

export class DemoScene extends Scene {
    private uiManager!: UIManager;
    private notificationSystem!: NotificationSystem;
    private damageTextSystem!: DamageTextSystem;
    private miniMapSystem!: MiniMapSystem;
    private questSystem!: QuestSystem;
    private tooltipSystem!: TooltipSystem;

    constructor() {
        super({ key: 'DemoScene' });
    }

    create() {
        // 设置背景色
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // 初始化UI管理器
        this.uiManager = UIManager.getInstance(this);
        
        // 初始化通知系统
        this.notificationSystem = new NotificationSystem(this);
        this.add.existing(this.notificationSystem);
        
        // 初始化伤害文本系统
        this.damageTextSystem = new DamageTextSystem(this);
        this.add.existing(this.damageTextSystem);
        
        // 初始化小地图系统
        this.miniMapSystem = new MiniMapSystem(this);
        this.add.existing(this.miniMapSystem);
        
        // 初始化任务系统
        this.questSystem = QuestSystem.getInstance();

        // 初始化工具提示系统
        this.tooltipSystem = new TooltipSystem(this);
        this.add.existing(this.tooltipSystem);

        // 创建演示用的精灵
        const player = this.add.sprite(400, 300, 'player');
        player.setInteractive();

        // 添加鼠标悬停事件
        player.on('pointerover', () => {
            this.tooltipSystem.showTooltip(player.x, player.y - 50, {
                title: '玩家角色',
                content: '这是一个演示用的玩家角色',
                rarity: 'unique',
                requirements: {
                    level: 1
                }
            });
        });

        player.on('pointerout', () => {
            this.tooltipSystem.hideTooltip();
        });

        // 添加鼠标移动事件
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.tooltipSystem.update(pointer.x, pointer.y);
        });

        // 添加演示用的任务
        this.questSystem.addQuestTemplate({
            id: 'demo_quest_1',
            name: '演示任务',
            description: '这是一个演示任务',
            type: QuestType.MAIN,
            status: QuestStatus.AVAILABLE,
            objectives: [
                {
                    id: 'kill_enemies',
                    type: QuestObjectiveType.KILL_ENEMIES,
                    target: 'enemy',
                    required: 5,
                    current: 0,
                    description: '击杀5个敌人',
                    completed: false,
                    optional: false,
                    hidden: false
                }
            ],
            rewards: [
                {
                    type: 'experience',
                    value: 'exp',
                    amount: 100,
                    description: '获得100点经验值'
                },
                {
                    type: 'gold',
                    value: 'gold',
                    amount: 50,
                    description: '获得50金币'
                }
            ],
            requirements: [],
            level: 1,
            priority: 1,
            repeatable: false,
            autoComplete: false,
            autoAccept: false
        });

        // 接受任务
        this.questSystem.acceptQuest('demo_quest_1');

        // 添加演示用的通知
        this.notificationSystem.showNotification(
            NotificationType.ACHIEVEMENT,
            '欢迎来到演示场景',
            '这是一个展示所有系统功能的演示场景',
            { duration: 5000 }
        );

        // 添加演示用的伤害文本
        this.damageTextSystem.showDamageText(100, DamageTextType.PHYSICAL_DAMAGE, 400, 300, true);

        // 添加演示用的小地图标记
        this.miniMapSystem.addMarker({
            id: 'demo_marker',
            type: MapMarkerType.QUEST_TARGET,
            x: 400,
            y: 300,
            worldX: 400,
            worldY: 300,
            name: '演示标记',
            color: 0xffff00,
            size: 10,
            pulse: true,
            visible: true,
            priority: 1
        });

        // 添加演示用的UI元素
        this.uiManager.showNotification(
            NotificationType.INFO,
            '演示场景',
            '这是一个展示所有系统功能的演示场景',
            { duration: 5000 }
        );

        // 添加键盘事件监听
        this.input.keyboard.on('keydown-SPACE', () => {
            this.notificationSystem.showNotification(
                NotificationType.LEVEL_UP,
                '等级提升',
                '你的角色等级提升了！',
                { duration: 3000 }
            );
        });

        this.input.keyboard.on('keydown-D', () => {
            console.log('尝试显示伤害文本');
            this.damageTextSystem.showDamageText(
                Math.floor(Math.random() * 1000),
                DamageTextType.PHYSICAL_DAMAGE,
                400,
                300,
                Math.random() > 0.7
            );
        });

        this.input.keyboard.on('keydown-M', () => {
            this.miniMapSystem.setVisible(!this.miniMapSystem.visible);
        });

        this.input.keyboard.on('keydown-Q', () => {
            this.notificationSystem.showNotification(
                NotificationType.INFO,
                '任务列表',
                '当前任务进度',
                { duration: 3000 }
            );
        });

        this.input.keyboard.on('keydown-T', () => {
            this.tooltipSystem.showTooltip(400, 300, {
                title: '测试物品',
                content: '这是一个测试用的物品描述',
                rarity: 'rare',
                requirements: {
                    level: 10,
                    strength: 20,
                    dexterity: 15
                }
            });
        });
    }

    update() {
        // 更新各个系统
        this.notificationSystem.update();
        this.damageTextSystem.update();
        this.miniMapSystem.update();
    }
} 