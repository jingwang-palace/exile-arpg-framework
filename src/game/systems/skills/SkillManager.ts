import Phaser from 'phaser';
import { 
  SkillDescription, 
  LearnedSkill, 
  SkillSlot,
  TargetType,
  ResourceType
} from './SkillTypes';
import { SkillCastEvent } from './SkillEvents';
import { SkillFactory } from './SkillFactory';
import { EventEmitter } from '../../../utils/EventEmitter';

const MAX_SKILL_SLOTS = 10;

export class SkillManager extends EventEmitter {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  
  // 所有可用技能的字典
  private availableSkills: Map<string, SkillDescription> = new Map();
  
  // 已学习的技能
  private learnedSkills: Map<string, LearnedSkill> = new Map();
  
  // 技能栏（装备的技能）
  private equippedSkills: Array<string | null> = Array(MAX_SKILL_SLOTS).fill(null);
  
  // 技能工厂
  private skillFactory: SkillFactory;
  
  // 冷却计时器
  private cooldownTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  
  // 当前玩家资源
  private playerResources: Map<ResourceType, number> = new Map();
  
  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    super();
    this.scene = scene;
    this.player = player;
    this.skillFactory = new SkillFactory(scene);
    
    // 初始化玩家资源
    this.playerResources.set(ResourceType.MANA, 100);
    this.playerResources.set(ResourceType.HEALTH, 100);
    this.playerResources.set(ResourceType.ENERGY, 100);
    this.playerResources.set(ResourceType.RAGE, 0);
  }
  
  // 注册技能到可用技能列表
  public registerSkill(skill: SkillDescription): void {
    this.availableSkills.set(skill.id, skill);
  }
  
  // 批量注册技能
  public registerSkills(skills: SkillDescription[]): void {
    skills.forEach(skill => this.registerSkill(skill));
  }
  
  // 学习技能
  public learnSkill(skillId: string): boolean {
    const skill = this.availableSkills.get(skillId);
    
    if (!skill) {
      console.error(`技能 ${skillId} 不存在`);
      return false;
    }
    
    // 检查是否已学习此技能
    if (this.learnedSkills.has(skillId)) {
      const learnedSkill = this.learnedSkills.get(skillId)!;
      
      // 检查是否可以升级
      if (learnedSkill.level >= skill.maxLevel) {
        console.warn(`技能 ${skill.name} 已达到最高等级`);
        return false;
      }
      
      // 升级技能
      learnedSkill.level++;
      return true;
    } else {
      // 学习新技能
      const newSkill: LearnedSkill = {
        skillId: skillId,
        level: 1,
        isEquipped: false,
        cooldownRemaining: 0
      };
      
      this.learnedSkills.set(skillId, newSkill);
      return true;
    }
  }
  
  // 装备技能到指定栏位
  public equipSkill(skillId: string, slot: SkillSlot): boolean {
    if (slot < 0 || slot >= MAX_SKILL_SLOTS) {
      console.error(`无效的技能栏位: ${slot}`);
      return false;
    }
    
    const learnedSkill = this.learnedSkills.get(skillId);
    
    if (!learnedSkill) {
      console.error(`未学习技能 ${skillId}`);
      return false;
    }
    
    // 检查技能是否已在其他栏位
    const currentSlot = this.equippedSkills.indexOf(skillId);
    if (currentSlot !== -1) {
      this.equippedSkills[currentSlot] = null;
    }
    
    // 移除当前栏位的技能
    const currentSkillId = this.equippedSkills[slot];
    if (currentSkillId) {
      const currentSkill = this.learnedSkills.get(currentSkillId);
      if (currentSkill) {
        currentSkill.isEquipped = false;
      }
    }
    
    // 装备新技能
    this.equippedSkills[slot] = skillId;
    learnedSkill.isEquipped = true;
    
    return true;
  }
  
  // 卸下技能
  public unequipSkill(slot: SkillSlot): boolean {
    if (slot < 0 || slot >= MAX_SKILL_SLOTS) {
      console.error(`无效的技能栏位: ${slot}`);
      return false;
    }
    
    const skillId = this.equippedSkills[slot];
    if (!skillId) {
      return false;
    }
    
    const skill = this.learnedSkills.get(skillId);
    if (skill) {
      skill.isEquipped = false;
    }
    
    this.equippedSkills[slot] = null;
    return true;
  }
  
  // 使用技能
  public useSkill(slot: SkillSlot, targetX?: number, targetY?: number): boolean {
    if (slot < 0 || slot >= MAX_SKILL_SLOTS) {
      console.error(`无效的技能栏位: ${slot}`);
      return false;
    }
    
    const skillId = this.equippedSkills[slot];
    if (!skillId) {
      console.warn(`技能栏 ${slot} 未装备技能`);
      return false;
    }
    
    const learnedSkill = this.learnedSkills.get(skillId);
    if (!learnedSkill) {
      console.error(`未找到已学习的技能: ${skillId}`);
      return false;
    }
    
    const skillDescription = this.availableSkills.get(skillId);
    if (!skillDescription) {
      console.error(`未找到技能描述: ${skillId}`);
      return false;
    }
    
    // 检查冷却
    if (learnedSkill.cooldownRemaining > 0) {
      console.warn(`技能 ${skillDescription.name} 正在冷却中 (${learnedSkill.cooldownRemaining}ms)`);
      return false;
    }
    
    // 检查资源消耗
    const resourceType = skillDescription.resourceType;
    const currentResource = this.playerResources.get(resourceType) || 0;
    const resourceCost = skillDescription.resourceCost;
    
    if (currentResource < resourceCost) {
      console.warn(`资源不足: 需要 ${resourceCost} ${resourceType}`);
      return false;
    }
    
    // 消耗资源
    this.playerResources.set(resourceType, currentResource - resourceCost);
    
    // 准备目标位置
    let finalTargetX = targetX;
    let finalTargetY = targetY;
    
    // 获取玩家位置
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // 如果是自身目标类型或没有提供目标位置，则使用玩家位置
    if (skillDescription.targetType === 'self' || (!finalTargetX && !finalTargetY)) {
      finalTargetX = playerX;
      finalTargetY = playerY;
    }
    
    // 发布技能释放事件
    const castEvent = new SkillCastEvent(
      skillId,
      learnedSkill.level,
      playerX,
      playerY,
      finalTargetX!,
      finalTargetY!
    );
    
    // 使用技能工厂创建并执行技能效果
    this.skillFactory.createSkillEffect(
      skillDescription,
      learnedSkill.level,
      this.player,
      finalTargetX!,
      finalTargetY!
    );
    
    // 设置冷却
    this.startCooldown(skillId, skillDescription.cooldown);
    
    // 发送技能使用事件
    this.emit('skillUsed', skillId, { x: finalTargetX, y: finalTargetY });
    
    return true;
  }
  
  // 启动冷却计时器
  private startCooldown(skillId: string, duration: number): void {
    const learnedSkill = this.learnedSkills.get(skillId);
    if (!learnedSkill) return;
    
    // 设置冷却时间
    learnedSkill.cooldownRemaining = duration;
    
    // 清除现有计时器
    if (this.cooldownTimers.has(skillId)) {
      this.cooldownTimers.get(skillId)?.remove();
    }
    
    // 创建新计时器
    const timer = this.scene.time.addEvent({
      delay: duration,
      callback: () => {
        const skill = this.learnedSkills.get(skillId);
        if (skill) {
          skill.cooldownRemaining = 0;
        }
        this.cooldownTimers.delete(skillId);
      }
    });
    
    this.cooldownTimers.set(skillId, timer);
  }
  
  // 更新冷却时间（每帧调用）
  public update(time: number, delta: number): void {
    // 更新所有技能的冷却时间
    this.learnedSkills.forEach(skill => {
      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - delta);
      }
    });
  }
  
  // 获取所有已学习的技能
  public getLearnedSkills(): Map<string, LearnedSkill> {
    return this.learnedSkills;
  }
  
  // 获取已装备的技能
  public getEquippedSkills(): Array<string | null> {
    return [...this.equippedSkills];
  }
  
  // 获取指定槽位的装备技能
  public getEquippedSkill(slot: SkillSlot): SkillDescription | null {
    if (slot < 0 || slot >= MAX_SKILL_SLOTS) {
      return null;
    }
    
    const skillId = this.equippedSkills[slot];
    if (!skillId) {
      return null;
    }
    
    return this.availableSkills.get(skillId) || null;
  }
  
  // 获取技能描述
  public getSkillDescription(skillId: string): SkillDescription | undefined {
    return this.availableSkills.get(skillId);
  }
  
  // 设置资源值
  public setResource(type: ResourceType, value: number): void {
    this.playerResources.set(type, value);
  }
  
  // 获取资源值
  public getResource(type: ResourceType): number {
    return this.playerResources.get(type) || 0;
  }
  
  // 检查是否已学习技能
  public hasSkill(skillId: string): boolean {
    return this.learnedSkills.has(skillId);
  }
  
  // 获取技能等级
  public getSkillLevel(skillId: string): number | null {
    const learnedSkill = this.learnedSkills.get(skillId);
    return learnedSkill ? learnedSkill.level : null;
  }
} 