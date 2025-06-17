import Phaser from 'phaser';
import { SkillSystem, ActiveSkill, PassiveSkill, ToggleSkill } from '../systems/SkillSystem';

interface SkillNode {
  id: string;
  skill: ActiveSkill | PassiveSkill | ToggleSkill;
  x: number;
  y: number;
  level: number;
  maxLevel: number;
  prerequisites: string[];
  connections: string[];
  isUnlocked: boolean;
  isLearned: boolean;
  buildPath: 'speed' | 'boss' | 'balance' | 'core';
}

export class SkillTreeWindow {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private skillSystem: SkillSystem;
  private visible: boolean = false;
  
  // 技能节点数据
  private skillNodes: Map<string, SkillNode> = new Map();
  
  // UI元素
  private skillPointsText!: Phaser.GameObjects.Text;
  private skillNodesGroup!: Phaser.GameObjects.Group;
  private connectionsGraphics!: Phaser.GameObjects.Graphics;
  private detailPanel!: Phaser.GameObjects.Container;
  private selectedNode: SkillNode | null = null;
  private buildPathTabs!: Phaser.GameObjects.Container;
  private currentBuildPath: 'speed' | 'boss' | 'balance' | 'core' = 'core';
  
  // 视图控制
  private viewContainer!: Phaser.GameObjects.Container;
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };
  private zoomLevel: number = 1;
  
  // 玩家数据
  private availableSkillPoints: number = 10;
  private playerLevel: number = 1;

  constructor(scene: Phaser.Scene, skillSystem: SkillSystem) {
    this.scene = scene;
    this.skillSystem = skillSystem;
    
    this.initializeSkillNodes();
    this.createWindow();
  }

  // 添加getContainer方法以支持居中
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  private initializeSkillNodes() {
    // 获取所有技能并创建技能节点
    const skills = this.skillSystem.getAllSkills();
    
    // 简化的技能树布局
    const layouts = {
      core: [
        { id: 'weapon_mastery', x: 0, y: 0, prerequisites: [] }
      ],
      speed: [
        { id: 'speed_aura', x: -150, y: -80, prerequisites: ['weapon_mastery'] },
        { id: 'whirlwind', x: -150, y: -160, prerequisites: ['speed_aura'] },
        { id: 'area_mastery', x: -150, y: -240, prerequisites: ['whirlwind'] }
      ],
      boss: [
        { id: 'critical_mastery', x: 150, y: -80, prerequisites: ['weapon_mastery'] },
        { id: 'devastate', x: 150, y: -160, prerequisites: ['critical_mastery'] },
        { id: 'execute', x: 150, y: -240, prerequisites: ['devastate'] }
      ],
      balance: [
        { id: 'balanced_strike', x: 0, y: -120, prerequisites: ['weapon_mastery'] },
        { id: 'adaptation', x: 0, y: -200, prerequisites: ['balanced_strike'] }
      ]
    };

    // 创建所有节点
    Object.entries(layouts).forEach(([buildPath, nodeList]) => {
      nodeList.forEach(nodeData => {
        const skill = skills.find(s => s.id === nodeData.id);
        if (skill) {
          const node: SkillNode = {
            id: nodeData.id,
            skill: skill,
            x: nodeData.x,
            y: nodeData.y,
            level: 0,
            maxLevel: skill.maxLevel,
            prerequisites: nodeData.prerequisites,
            connections: this.calculateConnections(nodeData.id, layouts),
            isUnlocked: this.isNodeUnlocked(nodeData.id, nodeData.prerequisites),
            isLearned: false,
            buildPath: buildPath as any
          };
          this.skillNodes.set(nodeData.id, node);
        }
      });
    });
  }

  private calculateConnections(nodeId: string, allLayouts: any): string[] {
    const connections: string[] = [];
    Object.values(allLayouts).forEach((layout: any) => {
      layout.forEach((node: any) => {
        if (node.prerequisites.includes(nodeId)) {
          connections.push(node.id);
        }
      });
    });
    return connections;
  }

  private isNodeUnlocked(nodeId: string, prerequisites: string[]): boolean {
    if (prerequisites.length === 0) return true;
    
    return prerequisites.every(prereqId => {
      const prereqNode = this.skillNodes.get(prereqId);
      return prereqNode && prereqNode.isLearned;
    });
  }

  private createWindow() {
    // 创建主容器
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0); // 重要：确保窗口不会随相机滚动

    // 创建背景 - 合适的尺寸
    const background = this.scene.add.rectangle(0, 0, 1000, 600, 0x0f0f0f, 0.95);
    background.setStrokeStyle(3, 0x2a2a2a);
    this.container.add(background);

    // 创建标题栏
    const titleBg = this.scene.add.rectangle(0, -270, 1000, 50, 0x1a1a1a, 0.9);
    titleBg.setStrokeStyle(2, 0x444444);
    this.container.add(titleBg);

    const title = this.scene.add.text(0, -270, '野蛮人技能天赋树', {
      fontSize: '22px',
      color: '#d4af37',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);

    // 创建BD分支选择标签
    this.createBuildPathTabs();

    // 技能点显示
    this.createSkillPointsDisplay();

    // 创建视图容器
    this.viewContainer = this.scene.add.container(0, 30);
    this.container.add(this.viewContainer);

    // 创建连接线图形
    this.connectionsGraphics = this.scene.add.graphics();
    this.viewContainer.add(this.connectionsGraphics);

    // 创建技能节点组
    this.skillNodesGroup = this.scene.add.group();

    // 创建详情面板
    this.createDetailPanel();

    // 关闭按钮
    this.createCloseButton();

    // 创建所有技能节点
    this.createSkillNodes();

    // 绘制连接线
    this.drawConnections();

    // 设置交互
    this.setupInteractions();

    this.container.setVisible(false);
  }

  private createSkillPointsDisplay() {
    const pointsContainer = this.scene.add.container(-400, -220);
    
    const cardBg = this.scene.add.rectangle(0, 0, 180, 50, 0x222222, 0.9);
    cardBg.setStrokeStyle(2, 0xffd700);
    pointsContainer.add(cardBg);

    this.skillPointsText = this.scene.add.text(0, -10, `可用技能点: ${this.availableSkillPoints}`, {
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    pointsContainer.add(this.skillPointsText);

    const levelText = this.scene.add.text(0, 10, `角色等级: ${this.playerLevel}`, {
      fontSize: '12px',
      color: '#cccccc'
    }).setOrigin(0.5);
    pointsContainer.add(levelText);

    this.container.add(pointsContainer);
  }

  private createBuildPathTabs() {
    this.buildPathTabs = this.scene.add.container(0, -200);

    const builds = [
      { path: 'core', name: '核心', icon: '⚔️', color: 0x6c7b7f, x: -300 },
      { path: 'speed', name: '疾速', icon: '🌪️', color: 0x2e7d32, x: -100 },
      { path: 'boss', name: '攻坚', icon: '⚡', color: 0xc62828, x: 100 },
      { path: 'balance', name: '均衡', icon: '⚖️', color: 0x1565c0, x: 300 }
    ];

    builds.forEach(build => {
      const tabContainer = this.scene.add.container(build.x, 0);
      const isSelected = this.currentBuildPath === build.path;
      
      // 卡片背景
      const cardBg = this.scene.add.rectangle(0, 0, 120, 60, 
        isSelected ? build.color : 0x333333, 
        isSelected ? 0.9 : 0.7);
      cardBg.setStrokeStyle(2, isSelected ? 0xffffff : build.color);
      
      // 图标
      const icon = this.scene.add.text(0, -10, build.icon, {
        fontSize: '18px'
      }).setOrigin(0.5);
      
      // 名称
      const name = this.scene.add.text(0, 15, build.name, {
        fontSize: '12px',
        color: isSelected ? '#ffffff' : '#cccccc',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      tabContainer.add([cardBg, icon, name]);
      
      // 添加交互
      tabContainer.setInteractive(new Phaser.Geom.Rectangle(-60, -30, 120, 60), Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', () => {
          console.log(`切换到BD: ${build.name}`);
          this.switchBuildPath(build.path as any);
        })
        .on('pointerover', () => {
          this.scene.game.canvas.style.cursor = 'pointer';
          if (!isSelected) {
            cardBg.setFillStyle(build.color, 0.8);
            name.setColor('#ffffff');
          }
        })
        .on('pointerout', () => {
          this.scene.game.canvas.style.cursor = 'default';
          if (!isSelected) {
            cardBg.setFillStyle(0x333333, 0.7);
            name.setColor('#cccccc');
          }
        });

      this.buildPathTabs.add(tabContainer);
    });

    this.container.add(this.buildPathTabs);
  }

  private switchBuildPath(buildPath: 'speed' | 'boss' | 'balance' | 'core') {
    console.log(`切换BD路径: ${buildPath}`);
    this.currentBuildPath = buildPath;
    this.refreshBuildPathTabs();
    this.refreshDisplay();
  }

  private refreshBuildPathTabs() {
    this.buildPathTabs.destroy();
    this.createBuildPathTabs();
  }

  private refreshDisplay() {
    this.skillPointsText.setText(`可用技能点: ${this.availableSkillPoints}`);

    // 清理现有节点
    this.skillNodesGroup.clear(true, true);
    this.viewContainer.list.forEach((child: any) => {
      if (child !== this.connectionsGraphics && child.getData && child.getData('nodeId')) {
        child.destroy();
      }
    });
    
    this.createSkillNodes();
    this.drawConnections();
  }

  private createDetailPanel() {
    this.detailPanel = this.scene.add.container(350, 0);
    
    const panelBg = this.scene.add.rectangle(0, 0, 250, 400, 0x1a1a1a, 0.9);
    panelBg.setStrokeStyle(2, 0x444444);
    this.detailPanel.add(panelBg);

    const title = this.scene.add.text(0, -180, 'BD构筑指南', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.detailPanel.add(title);

    // 添加基本说明
    const guideText = this.scene.add.text(0, -140, 
      '• 核心：基础技能必学\n• 疾速：AOE清图专精\n• 攻坚：单体BOSS专精\n• 均衡：攻防兼备\n\n点击BD卡片切换分支\n点击技能节点学习技能', {
      fontSize: '12px',
      color: '#cccccc',
      wordWrap: { width: 220 },
      align: 'center'
    }).setOrigin(0.5, 0);
    this.detailPanel.add(guideText);

    this.container.add(this.detailPanel);
  }

  private createCloseButton() {
    const closeButton = this.scene.add.container(450, -270);
    
    const closeBg = this.scene.add.circle(0, 0, 18, 0x880000);
    closeBg.setStrokeStyle(2, 0xff0000);
    
    const closeText = this.scene.add.text(0, 0, '✕', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeButton.add([closeBg, closeText]);
    closeButton.setInteractive(new Phaser.Geom.Circle(0, 0, 18), Phaser.Geom.Circle.Contains)
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
  }

  private createSkillNodes() {
    console.log(`创建技能节点，当前BD: ${this.currentBuildPath}`);
    
    this.skillNodes.forEach((node, nodeId) => {
      if (node.buildPath === this.currentBuildPath || node.buildPath === 'core') {
        console.log(`创建节点: ${nodeId} (${node.buildPath}分支)`);
        const nodeContainer = this.createSkillNode(node);
        this.viewContainer.add(nodeContainer);
        this.skillNodesGroup.add(nodeContainer);
      }
    });
  }

  private createSkillNode(node: SkillNode): Phaser.GameObjects.Container {
    const nodeContainer = this.scene.add.container(node.x, node.y);
    nodeContainer.setData('nodeId', node.id);

    // 节点颜色
    let bgColor = 0x444444;
    let borderColor = 0x666666;
    
    if (node.isLearned) {
      bgColor = 0x4caf50;
      borderColor = 0x66bb6a;
    } else if (node.isUnlocked && this.playerLevel >= node.skill.requiredLevel) {
      bgColor = 0x2196f3;
      borderColor = 0x42a5f5;
    }

    // 创建节点
    const nodeBg = this.scene.add.circle(0, 0, 25, bgColor);
    nodeBg.setStrokeStyle(2, borderColor);
    nodeContainer.add(nodeBg);

    // 技能图标
    if (this.playerLevel < node.skill.requiredLevel) {
      const lockIcon = this.scene.add.text(0, 0, '🔒', {
        fontSize: '14px'
      }).setOrigin(0.5);
      nodeContainer.add(lockIcon);
    } else {
      const skillIcon = this.scene.add.text(0, 0, this.getSkillIcon(node.skill), {
        fontSize: '14px'
      }).setOrigin(0.5);
      nodeContainer.add(skillIcon);

      if (node.isLearned && node.level > 0) {
        const levelText = this.scene.add.text(15, -15, `${node.level}`, {
          fontSize: '10px',
          color: '#ffd700',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        nodeContainer.add(levelText);
      }
    }

    // 技能名称
    const skillName = this.scene.add.text(0, 35, node.skill.name, {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    nodeContainer.add(skillName);

    // 设置交互
    nodeContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 25), Phaser.Geom.Circle.Contains)
      .on('pointerdown', () => this.onNodeClick(node))
      .on('pointerover', () => {
        nodeContainer.setScale(1.1);
        this.scene.game.canvas.style.cursor = 'pointer';
      })
      .on('pointerout', () => {
        nodeContainer.setScale(1);
        this.scene.game.canvas.style.cursor = 'default';
      });

    return nodeContainer;
  }

  private getSkillIcon(skill: ActiveSkill | PassiveSkill | ToggleSkill): string {
    const iconMap: { [key: string]: string } = {
      'weapon_mastery': '⚔️',
      'whirlwind': '🌪️',
      'speed_aura': '💨',
      'area_mastery': '📐',
      'devastate': '💥',
      'critical_mastery': '🎯',
      'execute': '⚡',
      'balanced_strike': '⚖️',
      'adaptation': '🔄'
    };
    
    return iconMap[skill.id] || '⭐';
  }

  private drawConnections() {
    this.connectionsGraphics.clear();
    
    this.skillNodes.forEach(node => {
      if (node.buildPath !== this.currentBuildPath && node.buildPath !== 'core') return;
      
      node.connections.forEach(connectedNodeId => {
        const connectedNode = this.skillNodes.get(connectedNodeId);
        if (connectedNode && (connectedNode.buildPath === this.currentBuildPath || connectedNode.buildPath === 'core')) {
          let lineColor = 0x666666;
          
          if (node.isLearned && connectedNode.isUnlocked) {
            lineColor = 0x4caf50;
          } else if (node.isLearned) {
            lineColor = 0xffd700;
          }
          
          this.connectionsGraphics.lineStyle(2, lineColor, 0.8);
          this.connectionsGraphics.beginPath();
          this.connectionsGraphics.moveTo(node.x, node.y);
          this.connectionsGraphics.lineTo(connectedNode.x, connectedNode.y);
          this.connectionsGraphics.strokePath();
        }
      });
    });
  }

  private onNodeClick(node: SkillNode) {
    if (this.playerLevel < node.skill.requiredLevel) {
      console.log(`需要${node.skill.requiredLevel}级才能学习 ${node.skill.name}`);
      return;
    }

    if (node.isUnlocked && !node.isLearned && this.availableSkillPoints > 0) {
      this.learnSkill(node);
    } else if (node.isLearned && node.level < node.maxLevel && this.availableSkillPoints > 0) {
      this.upgradeSkill(node);
    }
  }

  private learnSkill(node: SkillNode) {
    if (this.availableSkillPoints <= 0) return;

    node.isLearned = true;
    node.level = 1;
    this.availableSkillPoints--;

    this.updateUnlockStatus();
    this.refreshDisplay();

    console.log(`学习技能: ${node.skill.name} (${node.buildPath}分支)`);
  }

  private upgradeSkill(node: SkillNode) {
    if (this.availableSkillPoints <= 0 || node.level >= node.maxLevel) return;

    node.level++;
    this.availableSkillPoints--;
    this.refreshDisplay();

    console.log(`升级技能: ${node.skill.name} 到等级 ${node.level}`);
  }

  private updateUnlockStatus() {
    this.skillNodes.forEach(node => {
      node.isUnlocked = this.isNodeUnlocked(node.id, node.prerequisites);
    });
  }

  private setupInteractions() {
    const interactiveArea = this.scene.add.rectangle(0, 0, 600, 350, 0x000000, 0.01);
    this.viewContainer.add(interactiveArea);
    
    interactiveArea.setInteractive()
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.isDragging = true;
        this.lastPointer = { x: pointer.x, y: pointer.y };
      })
      .on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.isDragging) {
          const deltaX = pointer.x - this.lastPointer.x;
          const deltaY = pointer.y - this.lastPointer.y;
          
          this.viewContainer.x += deltaX;
          this.viewContainer.y += deltaY;
          
          this.lastPointer = { x: pointer.x, y: pointer.y };
        }
      })
      .on('pointerup', () => {
        this.isDragging = false;
      });
  }

  // 公共方法
  public setVisible(visible: boolean) {
    this.visible = visible;
    this.container.setVisible(visible);
    
    if (visible) {
      this.refreshDisplay();
    }
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public addSkillPoints(points: number) {
    this.availableSkillPoints += points;
    this.refreshDisplay();
  }

  public setPlayerLevel(level: number) {
    this.playerLevel = level;
    this.refreshDisplay();
  }

  public destroy() {
    this.container.destroy();
  }
} 