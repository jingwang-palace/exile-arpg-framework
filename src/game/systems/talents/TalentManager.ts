import Phaser from 'phaser';
import { 
  TalentNodeDescription, 
  AllocatedTalent, 
  TalentTreeDefinition,
  TalentEffect,
  AttributeType
} from './TalentTypes';
import { EventEmitter } from '../../../utils/EventEmitter';

export class TalentManager extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  
  // 所有可用的天赋树
  private availableTalentTrees: Map<string, TalentTreeDefinition> = new Map();
  
  // 当前选择的天赋树
  private currentTalentTreeId: string | null = null;
  
  // 已分配的天赋点
  private allocatedTalents: Map<string, AllocatedTalent> = new Map();
  
  // 可用天赋点
  private availablePoints: number = 0;
  
  // 总共获得的天赋点
  private totalPoints: number = 0;
  
  // 玩家属性修饰符
  private attributeModifiers: Map<AttributeType, number> = new Map();
  
  // 技能修饰符
  private skillModifiers: Map<string, Map<string, number>> = new Map();
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    super();
    this.scene = scene;
    this.player = player;
    
    // 初始化属性修饰符
    Object.values(AttributeType).forEach(attr => {
      this.attributeModifiers.set(attr as AttributeType, 0);
    });
  }
  
  // 注册天赋树
  public registerTalentTree(talentTree: TalentTreeDefinition): void {
    this.availableTalentTrees.set(talentTree.id, talentTree);
    
    // 如果没有当前选择的天赋树，默认选择第一个
    if (!this.currentTalentTreeId) {
      this.currentTalentTreeId = talentTree.id;
    }
  }
  
  // 批量注册天赋树
  public registerTalentTrees(talentTrees: TalentTreeDefinition[]): void {
    talentTrees.forEach(tree => this.registerTalentTree(tree));
  }
  
  // 设置当前天赋树
  public setCurrentTalentTree(treeId: string): boolean {
    if (!this.availableTalentTrees.has(treeId)) {
      console.error(`天赋树 ${treeId} 不存在`);
      return false;
    }
    
    this.currentTalentTreeId = treeId;
    this.emit('talentTreeChanged', treeId);
    return true;
  }
  
  // 获取当前天赋树
  public getCurrentTalentTree(): TalentTreeDefinition | null {
    if (!this.currentTalentTreeId) return null;
    return this.availableTalentTrees.get(this.currentTalentTreeId) || null;
  }
  
  // 获取所有可用天赋树
  public getAvailableTalentTrees(): Map<string, TalentTreeDefinition> {
    return this.availableTalentTrees;
  }
  
  // 添加天赋点
  public addTalentPoints(points: number): void {
    this.availablePoints += points;
    this.totalPoints += points;
    this.emit('pointsChanged', this.availablePoints, this.totalPoints);
  }
  
  // 获取可用天赋点
  public getAvailablePoints(): number {
    return this.availablePoints;
  }
  
  // 获取总天赋点
  public getTotalPoints(): number {
    return this.totalPoints;
  }
  
  // 分配天赋点到指定节点
  public allocatePoint(nodeId: string): boolean {
    const currentTree = this.getCurrentTalentTree();
    if (!currentTree) {
      console.error('没有选择天赋树');
      return false;
    }
    
    // 查找节点
    const node = currentTree.nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`天赋节点 ${nodeId} 不存在于当前天赋树`);
      return false;
    }
    
    // 检查可用点数
    if (this.availablePoints <= 0) {
      console.warn('没有可用的天赋点');
      return false;
    }
    
    // 检查节点是否已经达到最大点数
    const allocated = this.allocatedTalents.get(nodeId);
    if (allocated && allocated.points >= node.maxPoints) {
      console.warn(`天赋节点 ${node.name} 已达到最大点数`);
      return false;
    }
    
    // 检查是否满足前置条件
    if (!this.checkNodeRequirements(node)) {
      console.warn(`不满足天赋节点 ${node.name} 的前置条件`);
      return false;
    }
    
    // 分配点数
    if (allocated) {
      allocated.points++;
    } else {
      this.allocatedTalents.set(nodeId, {
        nodeId: nodeId,
        points: 1
      });
    }
    
    // 减少可用点数
    this.availablePoints--;
    
    // 应用天赋效果
    this.applyNodeEffects(node);
    
    // 发送事件
    this.emit('pointAllocated', nodeId, this.allocatedTalents.get(nodeId)?.points);
    this.emit('pointsChanged', this.availablePoints, this.totalPoints);
    
    return true;
  }
  
  // 重置天赋点
  public resetTalents(): void {
    // 恢复所有点数
    this.availablePoints = this.totalPoints;
    
    // 清除所有已分配的天赋
    this.allocatedTalents.clear();
    
    // 重置属性修饰符
    Object.values(AttributeType).forEach(attr => {
      this.attributeModifiers.set(attr as AttributeType, 0);
    });
    
    // 重置技能修饰符
    this.skillModifiers.clear();
    
    // 发送事件
    this.emit('talentsReset');
    this.emit('pointsChanged', this.availablePoints, this.totalPoints);
  }
  
  // 检查节点是否满足分配条件
  public checkNodeRequirements(node: TalentNodeDescription): boolean {
    // 检查是否需要特定总点数
    if (node.requiredPoints && this.totalPoints - this.availablePoints < node.requiredPoints) {
      return false;
    }
    
    // 检查是否需要前置节点
    if (node.requiredNodes && node.requiredNodes.length > 0) {
      for (const requiredId of node.requiredNodes) {
        if (!this.allocatedTalents.has(requiredId)) {
          return false;
        }
      }
    }
    
    // 检查是否可以通过路径连接到已激活的节点
    if (this.allocatedTalents.size > 0) {
      const connectedToActive = this.isConnectedToActiveNode(node);
      if (!connectedToActive) return false;
    }
    
    return true;
  }
  
  // 检查节点是否与已激活的节点相连
  private isConnectedToActiveNode(node: TalentNodeDescription): boolean {
    // 如果是第一个要激活的节点，则允许
    if (this.allocatedTalents.size === 0) return true;
    
    // 检查直接连接
    for (const connectedId of node.connections) {
      if (this.allocatedTalents.has(connectedId)) {
        return true;
      }
    }
    
    return false;
  }
  
  // 应用节点效果
  private applyNodeEffects(node: TalentNodeDescription): void {
    const points = this.allocatedTalents.get(node.id)?.points || 0;
    
    node.effects.forEach(effect => {
      // 根据点数缩放效果值
      const scaledValue = effect.value * points;
      
      this.applyEffect(effect, scaledValue);
    });
  }
  
  // 应用单个效果
  private applyEffect(effect: TalentEffect, value: number): void {
    switch (effect.type) {
      case 'attribute':
        if (effect.target) {
          const attr = effect.target as AttributeType;
          const currentMod = this.attributeModifiers.get(attr) || 0;
          this.attributeModifiers.set(attr, currentMod + value);
        }
        break;
        
      case 'skill':
        if (effect.target) {
          const skillId = effect.target;
          
          if (!this.skillModifiers.has(skillId)) {
            this.skillModifiers.set(skillId, new Map());
          }
          
          const skillMods = this.skillModifiers.get(skillId)!;
          const modType = effect.description;
          const currentMod = skillMods.get(modType) || 0;
          skillMods.set(modType, currentMod + value);
        }
        break;
        
      case 'unique':
        // 唯一效果需要特殊处理
        this.applyUniqueEffect(effect, value);
        break;
    }
  }
  
  // 应用唯一效果
  private applyUniqueEffect(effect: TalentEffect, value: number): void {
    // 这里可以处理特殊的唯一效果
    // 例如改变技能行为、添加特殊能力等
    console.log(`应用唯一效果: ${effect.description}, 值: ${value}`);
    
    // 发出唯一效果事件
    this.emit('uniqueEffectApplied', effect, value);
  }
  
  // 获取属性修饰值
  public getAttributeModifier(attribute: AttributeType): number {
    return this.attributeModifiers.get(attribute) || 0;
  }
  
  // 获取技能修饰值
  public getSkillModifier(skillId: string, modifierType: string): number {
    const skillMods = this.skillModifiers.get(skillId);
    if (!skillMods) return 0;
    
    return skillMods.get(modifierType) || 0;
  }
  
  // 获取已分配的天赋点
  public getAllocatedTalents(): Map<string, AllocatedTalent> {
    return this.allocatedTalents;
  }
  
  // 检查节点是否已分配点数
  public isNodeAllocated(nodeId: string): boolean {
    return this.allocatedTalents.has(nodeId);
  }
  
  // 获取节点已分配的点数
  public getNodePoints(nodeId: string): number {
    return this.allocatedTalents.get(nodeId)?.points || 0;
  }
} 