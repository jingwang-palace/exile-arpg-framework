import { EventEmitter } from '../../../utils/EventEmitter';
import { TalentManager } from '../talents/TalentManager';

export interface LevelUpReward {
  talentPoints: number;
  attributePoints?: number;
  healthBonus?: number;
  manaBonus?: number;
}

export class PlayerLevelSystem extends EventEmitter {
  // 玩家当前等级
  private level: number = 1;
  
  // 玩家当前经验值
  private experience: number = 0;
  
  // 升级所需经验值基数和增长系数
  private baseExpForLevelUp: number = 100;
  private expGrowthFactor: number = 1.5;
  
  // 天赋管理器引用
  private talentManager: TalentManager;
  
  // 等级上限
  private maxLevel: number = 50;
  
  // 自定义等级奖励
  private levelRewards: Map<number, LevelUpReward> = new Map();
  
  constructor(talentManager: TalentManager) {
    super();
    this.talentManager = talentManager;
    
    // 初始化默认等级奖励
    this.initDefaultRewards();
  }
  
  // 初始化默认等级奖励
  private initDefaultRewards(): void {
    // 每个等级默认奖励1个天赋点
    for (let i = 2; i <= this.maxLevel; i++) {
      this.levelRewards.set(i, { talentPoints: 1 });
    }
    
    // 特殊等级的额外奖励
    const specialLevels = [5, 10, 15, 20, 25, 30, 40, 50];
    specialLevels.forEach(level => {
      this.levelRewards.set(level, { talentPoints: 2 });
    });
  }
  
  // 获取当前等级
  public getLevel(): number {
    return this.level;
  }
  
  // 获取当前经验值
  public getExperience(): number {
    return this.experience;
  }
  
  // 获取升级所需经验值
  public getExpForNextLevel(): number {
    return Math.floor(this.baseExpForLevelUp * Math.pow(this.expGrowthFactor, this.level - 1));
  }
  
  // 获取经验值进度百分比
  public getExpProgressPercentage(): number {
    if (this.level >= this.maxLevel) return 100;
    return (this.experience / this.getExpForNextLevel()) * 100;
  }
  
  // 添加经验值
  public addExperience(amount: number): void {
    // 已达到最大等级，不再获得经验
    if (this.level >= this.maxLevel) return;
    
    this.experience += amount;
    
    // 发送获得经验事件
    this.emit('expGained', amount);
    
    // 检查是否可以升级
    this.checkLevelUp();
  }
  
  // 检查是否可以升级
  private checkLevelUp(): void {
    const expNeeded = this.getExpForNextLevel();
    
    // 如果经验值足够且未达到最大等级
    while (this.experience >= expNeeded && this.level < this.maxLevel) {
      // 减去升级所需经验值
      this.experience -= expNeeded;
      
      // 升级
      this.level++;
      
      // 获取等级奖励
      const reward = this.levelRewards.get(this.level) || { talentPoints: 1 };
      
      // 发放奖励
      if (reward.talentPoints > 0) {
        this.talentManager.addTalentPoints(reward.talentPoints);
      }
      
      // 发送升级事件
      this.emit('levelUp', this.level, reward);
      
      // 如果已达到最大等级，清空经验值
      if (this.level >= this.maxLevel) {
        this.experience = 0;
        break;
      }
    }
  }
  
  // 设置自定义等级奖励
  public setLevelReward(level: number, reward: LevelUpReward): void {
    if (level > 1 && level <= this.maxLevel) {
      this.levelRewards.set(level, reward);
    }
  }
  
  // 获取等级奖励
  public getLevelReward(level: number): LevelUpReward | undefined {
    return this.levelRewards.get(level);
  }
  
  // 手动设置等级（用于测试或存档加载）
  public setLevel(level: number): void {
    if (level < 1 || level > this.maxLevel) return;
    
    const oldLevel = this.level;
    this.level = level;
    this.experience = 0;
    
    // 如果是升级，发送升级事件
    if (level > oldLevel) {
      // 计算获得的天赋点总数
      let totalTalentPoints = 0;
      for (let i = oldLevel + 1; i <= level; i++) {
        totalTalentPoints += this.levelRewards.get(i)?.talentPoints || 1;
      }
      
      // 添加天赋点
      if (totalTalentPoints > 0) {
        this.talentManager.addTalentPoints(totalTalentPoints);
      }
      
      // 发送升级事件
      this.emit('levelSet', level, totalTalentPoints);
    }
  }
} 