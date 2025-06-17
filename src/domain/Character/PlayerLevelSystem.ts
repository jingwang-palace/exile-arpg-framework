import { ConfigLoader } from '../services/ConfigLoader';

interface LevelRewards {
  talentPoints?: number;
  healthBonus?: number;
  manaBonus?: number;
  attributePoints?: number;
}

interface LevelConfig {
  baseReward: LevelRewards;
  specialLevels: Record<string, LevelRewards>;
  maxLevel: number;
}

export class PlayerLevelSystem {
  private player: any;
  private levelConfig: LevelConfig | null = null;
  private configPath = 'src/configs/levelRewards.json';

  constructor(player: any) {
    this.player = player;
    this.loadConfig();
  }

  private loadConfig(): void {
    ConfigLoader.loadConfigSync<LevelConfig>(
      { data: this.levelConfig }, 
      this.configPath
    );
  }

  public addExperience(exp: number): void {
    if (!this.levelConfig) {
      console.error('等级配置尚未加载');
      return;
    }

    this.player.experience += exp;
    
    // 检查是否升级
    while (
      this.player.level < this.levelConfig.maxLevel && 
      this.player.experience >= this.getExperienceForNextLevel()
    ) {
      this.levelUp();
    }
    
    // 经验值上限处理
    if (this.player.level >= this.levelConfig.maxLevel) {
      this.player.experience = this.getExperienceForNextLevel();
    }
  }

  private levelUp(): void {
    if (!this.levelConfig) return;
    
    this.player.level++;
    
    // 应用基础奖励
    this.applyRewards(this.levelConfig.baseReward);
    
    // 检查是否有特殊等级奖励
    const level = this.player.level.toString();
    if (level in this.levelConfig.specialLevels) {
      this.applyRewards(this.levelConfig.specialLevels[level]);
    }
    
    // 升级通知
    this.showLevelUpNotification();
    
    // 更新玩家属性
    this.updatePlayerAttributes();
  }

  private applyRewards(rewards: LevelRewards): void {
    if (rewards.talentPoints) {
      this.player.talentPoints += rewards.talentPoints;
    }
    
    if (rewards.healthBonus) {
      this.player.maxHealth += rewards.healthBonus;
      this.player.health = this.player.maxHealth; // 升级时恢复生命值
    }
    
    if (rewards.manaBonus) {
      this.player.maxMana += rewards.manaBonus;
      this.player.mana = this.player.maxMana; // 升级时恢复法力值
    }
    
    if (rewards.attributePoints) {
      this.player.attributePoints += rewards.attributePoints;
    }
  }

  private getExperienceForNextLevel(): number {
    // 简单的经验值计算公式，可以根据需要调整
    return Math.floor(100 * Math.pow(1.5, this.player.level));
  }

  private showLevelUpNotification(): void {
    // 这里可以实现升级通知UI
    console.log(`恭喜！你升级到了 ${this.player.level} 级`);
    
    // 显示获得的奖励
    console.log(`获得了 ${this.getLevelRewards()} 点天赋点`);
  }

  private getLevelRewards(): number {
    if (!this.levelConfig) return 0;
    
    let rewards = this.levelConfig.baseReward.talentPoints || 0;
    
    const level = this.player.level.toString();
    if (level in this.levelConfig.specialLevels && this.levelConfig.specialLevels[level].talentPoints) {
      rewards = this.levelConfig.specialLevels[level].talentPoints;
    }
    
    return rewards;
  }

  private updatePlayerAttributes(): void {
    // 更新玩家的各种属性，如攻击力、防御力等
    // 可能需要调用其他系统来更新
  }

  public getLevel(): number {
    return this.player.level;
  }

  public getExperience(): number {
    return this.player.experience;
  }

  public getRequiredExperience(): number {
    return this.getExperienceForNextLevel();
  }

  public getTalentPoints(): number {
    return this.player.talentPoints;
  }
} 