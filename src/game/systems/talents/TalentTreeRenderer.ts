import Phaser from 'phaser';
import { 
  TalentTreeDefinition, 
  TalentNodeDescription,
  TalentCategory
} from './TalentTypes';
import { TalentManager } from './TalentManager';

// 天赋节点渲染配置
interface NodeRenderConfig {
  baseColor: number;
  activeColor: number;
  hoverColor: number;
  textColor: string;
  textHoverColor: string;
  size: number;
  padding: number;
  lineColor: number;
  activeLineColor: number;
}

// 渲染天赋树的每个节点配置
const CategoryColors: Record<TalentCategory, { base: number, active: number }> = {
  [TalentCategory.OFFENSE]: { base: 0xb91c1c, active: 0xef4444 },
  [TalentCategory.DEFENSE]: { base: 0x1e40af, active: 0x3b82f6 },
  [TalentCategory.UTILITY]: { base: 0x047857, active: 0x10b981 },
  [TalentCategory.SPECIAL]: { base: 0x7e22ce, active: 0xa855f7 }
};

export class TalentTreeRenderer {
  private scene: Phaser.Scene;
  private talentManager: TalentManager;
  
  // 渲染配置
  private config: NodeRenderConfig = {
    baseColor: 0x666666,
    activeColor: 0x22c55e,
    hoverColor: 0xffffff,
    textColor: '#ffffff',
    textHoverColor: '#ffffff',
    size: 50,
    padding: 8,
    lineColor: 0x444444,
    activeLineColor: 0x22c55e
  };
  
  // 天赋树容器
  private container: Phaser.GameObjects.Container;
  
  // 节点映射
  private nodeObjects: Map<string, Phaser.GameObjects.Container> = new Map();
  
  // 连线映射
  private connectionLines: Map<string, Phaser.GameObjects.Graphics> = new Map();
  
  // 点数文本
  private pointsText: Phaser.GameObjects.Text;
  
  // 当前显示的天赋树
  private currentTree: TalentTreeDefinition | null = null;
  
  // 拖动控制
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  
  // 当前悬停的节点
  private hoverNode: string | null = null;
  
  // 提示框
  private tooltip: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene, talentManager: TalentManager) {
    this.scene = scene;
    this.talentManager = talentManager;
    
    // 创建容器
    this.container = scene.add.container(
      scene.cameras.main.width / 2, 
      scene.cameras.main.height / 2
    );
    
    // 设置交互性
    this.setupInteraction();
    
    // 创建可用点数文本
    this.pointsText = scene.add.text(10, 10, '可用天赋点: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.pointsText.setScrollFactor(0);
    
    // 创建提示框
    this.tooltip = this.createTooltip();
    this.tooltip.setVisible(false);
    
    // 监听天赋管理器事件
    this.talentManager.on('pointsChanged', this.updatePointsText.bind(this));
    this.talentManager.on('pointAllocated', this.onPointAllocated.bind(this));
    this.talentManager.on('talentsReset', this.onTalentsReset.bind(this));
  }
  
  // 设置交互性
  private setupInteraction(): void {
    // 拖动功能
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        // 点击时记录开始位置，但不立即设置isDragging为true
        this.dragStartX = pointer.x - this.container.x;
        this.dragStartY = pointer.y - this.container.y;
        
        // 使用标志来区分点击和拖动
        const startTime = Date.now();
        const startX = pointer.x;
        const startY = pointer.y;
        
        // 监听一次性的pointermove事件，如果在短时间内移动超过一定距离，则认为是拖动
        const moveListener = this.scene.input.once('pointermove', (p: Phaser.Input.Pointer) => {
          const distance = Phaser.Math.Distance.Between(startX, startY, p.x, p.y);
          const timeDiff = Date.now() - startTime;
          
          // 如果在100ms内移动超过5像素，则认为是拖动
          if (timeDiff < 100 && distance > 5) {
            this.isDragging = true;
          }
        });
        
        // 监听一次性的pointerup事件，如果快速抬起，则认为是点击
        this.scene.input.once('pointerup', (p: Phaser.Input.Pointer) => {
          const timeDiff = Date.now() - startTime;
          const distance = Phaser.Math.Distance.Between(startX, startY, p.x, p.y);
          
          // 如果快速点击（不超过200ms）且移动距离很小（不超过5像素），则认为是点击而非拖动
          if (timeDiff < 200 && distance < 5) {
            this.isDragging = false;
          } else {
            this.isDragging = false;
          }
        });
      }
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.container.x = pointer.x - this.dragStartX;
        this.container.y = pointer.y - this.dragStartY;
      }
    });
    
    this.scene.input.on('pointerup', () => {
      this.isDragging = false;
    });
    
    // 鼠标滚轮缩放
    this.scene.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const scaleFactor = deltaY > 0 ? 0.9 : 1.1;
      const newScale = Phaser.Math.Clamp(
        this.container.scale * scaleFactor,
        0.5,
        1.5
      );
      this.container.setScale(newScale);
    });
  }
  
  // 渲染天赋树
  public renderTalentTree(talentTree: TalentTreeDefinition): void {
    // 清除现有内容
    this.clearTree();
    
    this.currentTree = talentTree;
    
    // 计算缩放因子
    const scaleFactor = 100; // 调整位置缩放
    
    // 先创建连线
    const linesGraphics = this.scene.add.graphics();
    this.container.add(linesGraphics);
    
    // 渲染所有连线
    talentTree.nodes.forEach(node => {
      node.connections.forEach(connectedId => {
        const connectedNode = talentTree.nodes.find(n => n.id === connectedId);
        if (connectedNode) {
          this.drawConnection(
            linesGraphics,
            node,
            connectedNode,
            scaleFactor
          );
        }
      });
    });
    
    // 渲染所有节点
    talentTree.nodes.forEach(node => {
      const nodeContainer = this.createNodeContainer(node, scaleFactor);
      this.container.add(nodeContainer);
      this.nodeObjects.set(node.id, nodeContainer);
    });
    
    // 更新点数文本
    this.updatePointsText();
    
    // 更新节点状态
    this.updateAllNodeStates();
  }
  
  // 清除当前树
  private clearTree(): void {
    this.container.removeAll(true);
    this.nodeObjects.clear();
    this.connectionLines.clear();
    
    // 重置容器位置和缩放
    this.container.setPosition(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2
    );
    this.container.setScale(1);
  }
  
  // 创建节点容器
  private createNodeContainer(node: TalentNodeDescription, scaleFactor: number): Phaser.GameObjects.Container {
    const x = node.position.x * scaleFactor;
    const y = node.position.y * scaleFactor;
    
    const container = this.scene.add.container(x, y);
    
    // 获取节点颜色
    const categoryColors = CategoryColors[node.category] || { 
      base: this.config.baseColor, 
      active: this.config.activeColor 
    };
    
    // 创建节点背景
    const circle = this.scene.add.circle(0, 0, this.config.size / 2, categoryColors.base);
    container.add(circle);
    
    // 创建节点图标（实际项目中需要加载图标）
    const iconText = this.scene.add.text(0, 0, node.name.charAt(0), {
      fontSize: '20px',
      color: this.config.textColor
    });
    iconText.setOrigin(0.5);
    container.add(iconText);
    
    // 创建节点名称
    const nameText = this.scene.add.text(0, this.config.size / 2 + 5, node.name, {
      fontSize: '14px',
      color: this.config.textColor
    });
    nameText.setOrigin(0.5, 0);
    container.add(nameText);
    
    // 创建点数显示
    const pointsText = this.scene.add.text(
      this.config.size / 2 - 5,
      -this.config.size / 2 + 5,
      '0/' + node.maxPoints,
      {
        fontSize: '12px',
        color: this.config.textColor
      }
    );
    pointsText.setOrigin(1, 0);
    container.add(pointsText);
    
    // 存储引用
    container.setData('node', node);
    container.setData('circle', circle);
    container.setData('nameText', nameText);
    container.setData('pointsText', pointsText);
    
    // 设置交互
    container.setSize(this.config.size, this.config.size);
    container.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停
    container.on('pointerover', () => {
      if (this.isDragging) return;
      
      this.hoverNode = node.id;
      
      // 只有可分配的节点才显示悬停效果
      if (this.canAllocatePoint(node.id)) {
        circle.setFillStyle(this.config.hoverColor);
        nameText.setColor(this.config.textHoverColor);
      }
      
      // 显示提示框
      this.showTooltip(node);
    });
    
    // 鼠标离开
    container.on('pointerout', () => {
      this.hoverNode = null;
      this.updateNodeState(node.id);
      this.tooltip.setVisible(false);
    });
    
    // 点击分配点数
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && this.canAllocatePoint(node.id)) {
        this.talentManager.allocatePoint(node.id);
      }
    });
    
    return container;
  }
  
  // 绘制节点连接线
  private drawConnection(
    graphics: Phaser.GameObjects.Graphics,
    node1: TalentNodeDescription,
    node2: TalentNodeDescription,
    scaleFactor: number
  ): void {
    const x1 = node1.position.x * scaleFactor;
    const y1 = node1.position.y * scaleFactor;
    const x2 = node2.position.x * scaleFactor;
    const y2 = node2.position.y * scaleFactor;
    
    // 绘制连线
    graphics.lineStyle(3, this.config.lineColor);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.strokePath();
    
    // 创建连接ID
    const connectionId = this.getConnectionId(node1.id, node2.id);
    this.connectionLines.set(connectionId, graphics);
  }
  
  // 获取连接ID
  private getConnectionId(node1Id: string, node2Id: string): string {
    return [node1Id, node2Id].sort().join('-');
  }
  
  // 更新点数文本
  private updatePointsText(): void {
    const available = this.talentManager.getAvailablePoints();
    const total = this.talentManager.getTotalPoints();
    this.pointsText.setText(`可用天赋点: ${available}/${total}`);
  }
  
  // 更新所有节点状态
  private updateAllNodeStates(): void {
    if (!this.currentTree) return;
    
    this.currentTree.nodes.forEach(node => {
      this.updateNodeState(node.id);
    });
  }
  
  // 更新单个节点状态
  private updateNodeState(nodeId: string): void {
    const nodeContainer = this.nodeObjects.get(nodeId);
    if (!nodeContainer) return;
    
    const node = nodeContainer.getData('node') as TalentNodeDescription;
    const circle = nodeContainer.getData('circle') as Phaser.GameObjects.Shape;
    const nameText = nodeContainer.getData('nameText') as Phaser.GameObjects.Text;
    const pointsText = nodeContainer.getData('pointsText') as Phaser.GameObjects.Text;
    
    // 获取节点颜色
    const categoryColors = CategoryColors[node.category] || { 
      base: this.config.baseColor, 
      active: this.config.activeColor 
    };
    
    // 获取已分配点数
    const allocatedPoints = this.talentManager.getNodePoints(nodeId);
    
    // 更新点数文本
    pointsText.setText(`${allocatedPoints}/${node.maxPoints}`);
    
    // 更新节点状态
    if (allocatedPoints > 0) {
      // 已分配点数的节点
      circle.setFillStyle(categoryColors.active);
    } else if (this.hoverNode === nodeId && this.canAllocatePoint(nodeId)) {
      // 悬停状态且可分配
      circle.setFillStyle(this.config.hoverColor);
    } else {
      // 未分配点数的节点
      circle.setFillStyle(categoryColors.base);
    }
    
    // 更新连接线状态
    this.updateConnectionsForNode(nodeId);
  }
  
  // 更新节点的所有连接线
  private updateConnectionsForNode(nodeId: string): void {
    if (!this.currentTree) return;
    
    const node = this.currentTree.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    node.connections.forEach(connectedId => {
      const connectionId = this.getConnectionId(nodeId, connectedId);
      const graphics = this.connectionLines.get(connectionId);
      
      if (graphics) {
        // 如果两个节点都已分配点数，则高亮连接线
        const node1Allocated = this.talentManager.isNodeAllocated(nodeId);
        const node2Allocated = this.talentManager.isNodeAllocated(connectedId);
        
        if (node1Allocated && node2Allocated) {
          graphics.lineStyle(3, this.config.activeLineColor);
        } else {
          graphics.lineStyle(3, this.config.lineColor);
        }
      }
    });
  }
  
  // 检查是否可以为节点分配点数
  private canAllocatePoint(nodeId: string): boolean {
    if (!this.currentTree) return false;
    
    const node = this.currentTree.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    // 如果已达到最大点数，则不能再分配
    const currentPoints = this.talentManager.getNodePoints(nodeId);
    if (currentPoints >= node.maxPoints) return false;
    
    // 检查可用点数
    if (this.talentManager.getAvailablePoints() <= 0) return false;
    
    // 检查节点要求
    return this.talentManager.checkNodeRequirements(node);
  }
  
  // 点数分配回调
  private onPointAllocated(nodeId: string): void {
    this.updateNodeState(nodeId);
    this.updateAllNodeStates();
  }
  
  // 天赋重置回调
  private onTalentsReset(): void {
    this.updateAllNodeStates();
  }
  
  // 创建提示框
  private createTooltip(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    container.setScrollFactor(0);
    
    // 背景
    const background = this.scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
    background.setOrigin(0);
    container.add(background);
    
    // 标题
    const title = this.scene.add.text(10, 10, '', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    container.add(title);
    
    // 描述
    const description = this.scene.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: 280 }
    });
    container.add(description);
    
    // 效果列表
    const effectsTitle = this.scene.add.text(10, 100, '效果:', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    container.add(effectsTitle);
    
    const effectsList = this.scene.add.text(10, 125, '', {
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: 280 }
    });
    container.add(effectsList);
    
    // 点数
    const pointsInfo = this.scene.add.text(10, 180, '', {
      fontSize: '14px',
      color: '#ffffff'
    });
    container.add(pointsInfo);
    
    // 存储引用
    container.setData('background', background);
    container.setData('title', title);
    container.setData('description', description);
    container.setData('effectsList', effectsList);
    container.setData('pointsInfo', pointsInfo);
    
    return container;
  }
  
  // 显示提示框
  private showTooltip(node: TalentNodeDescription): void {
    const title = this.tooltip.getData('title') as Phaser.GameObjects.Text;
    const description = this.tooltip.getData('description') as Phaser.GameObjects.Text;
    const effectsList = this.tooltip.getData('effectsList') as Phaser.GameObjects.Text;
    const pointsInfo = this.tooltip.getData('pointsInfo') as Phaser.GameObjects.Text;
    const background = this.tooltip.getData('background') as Phaser.GameObjects.Rectangle;
    
    // 设置内容
    title.setText(node.name);
    description.setText(node.description);
    
    // 设置效果列表
    let effectsText = '';
    node.effects.forEach(effect => {
      effectsText += `• ${effect.description}\n`;
    });
    effectsList.setText(effectsText);
    
    // 设置点数信息
    const currentPoints = this.talentManager.getNodePoints(node.id);
    pointsInfo.setText(`已分配: ${currentPoints}/${node.maxPoints}`);
    
    // 调整背景大小
    const contentHeight = 125 + effectsList.height + 30;
    background.setSize(300, contentHeight);
    
    // 定位提示框
    const pointer = this.scene.input.activePointer;
    const tooltipX = pointer.x + 20;
    const tooltipY = pointer.y + 20;
    
    // 确保提示框不超出屏幕
    const maxX = this.scene.cameras.main.width - 300;
    const maxY = this.scene.cameras.main.height - contentHeight;
    
    this.tooltip.setPosition(
      Phaser.Math.Clamp(tooltipX, 0, maxX),
      Phaser.Math.Clamp(tooltipY, 0, maxY)
    );
    
    // 显示提示框
    this.tooltip.setVisible(true);
    this.tooltip.setDepth(1000);
  }
} 