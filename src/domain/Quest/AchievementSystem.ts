import { ConfigLoader } from '../services/ConfigLoader';

interface AchievementReward {
  talentPoints?: number;
  experience?: number;
  items?: Array<{id: string, quantity: number}>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isHidden: boolean;
  isCompleted: boolean;
  progress: number;
  requiredProgress: number;
  rewards: AchievementReward;
}

export class AchievementSystem {
  private player: any;
  private achievements: Achievement[] = [];
  private configPath = 'src/configs/achievements.json';
  
  constructor(player: any) {
    this.player = player;
    this.loadAchievements();
  }
  
  private async loadAchievements(): Promise<void> {
    try {
      const achievementData = await ConfigLoader.loadConfig<Achievement[]>(this.configPath);
      this.achievements = achievementData;
    } catch (error) {
      console.error('加载成就配置失败:', error);
    }
  }
  
  // 更新成就进度
  public updateAchievementProgress(category: string, action: string, amount: number = 1): void {
    this.achievements.forEach(achievement => {
      // 检查成就类别是否匹配当前动作
      if (achievement.category === category && !achievement.isCompleted) {
        // 这里可以根据不同的动作类型和成就ID进行更详细的匹配
        // 例如，检查成就ID是否包含特定的动作关键词
        if (this.shouldUpdateAchievement(achievement, action)) {
          achievement.progress += amount;
          
          // 检查成就是否完成
          if (achievement.progress >= achievement.requiredProgress) {
            this.completeAchievement(achievement);
          }
        }
      }
    });
  }
  
  private shouldUpdateAchievement(achievement: Achievement, action: string): boolean {
    // 根据成就ID和动作类型确定是否应该更新该成就
    // 这是一个简化的实现，实际应用中可能需要更复杂的逻辑
    
    const achievementId = achievement.id.toLowerCase();
    action = action.toLowerCase();
    
    // 示例：处理几种常见的成就类型
    if (achievementId.includes('combat') && action.includes('kill')) {
      return true;
    }
    
    if (achievementId.includes('exploration') && action.includes('discover')) {
      return true;
    }
    
    if (achievementId.includes('collection') && action.includes('collect')) {
      return true;
    }
    
    if (achievementId.includes('skills') && action.includes('use_skill')) {
      return true;
    }
    
    if (achievementId.includes('talent') && action.includes('allocate_talent')) {
      return true;
    }
    
    return false;
  }
  
  private completeAchievement(achievement: Achievement): void {
    achievement.isCompleted = true;
    achievement.progress = achievement.requiredProgress; // 确保进度不超过要求
    
    // 应用奖励
    this.applyAchievementRewards(achievement);
    
    // 显示成就完成通知
    this.showAchievementNotification(achievement);
  }
  
  private applyAchievementRewards(achievement: Achievement): void {
    const rewards = achievement.rewards;
    
    if (rewards.talentPoints) {
      this.player.talentPoints += rewards.talentPoints;
    }
    
    if (rewards.experience) {
      // 假设有一个玩家等级系统负责处理经验值
      // playerLevelSystem.addExperience(rewards.experience);
      this.player.experience += rewards.experience;
    }
    
    if (rewards.items) {
      // 假设有一个物品系统负责处理物品
      rewards.items.forEach(item => {
        // itemSystem.addItem(item.id, item.quantity);
        console.log(`添加物品: ${item.id} x ${item.quantity}`);
      });
    }
  }
  
  private showAchievementNotification(achievement: Achievement): void {
    // 这里可以实现成就完成的通知UI
    console.log(`成就解锁: ${achievement.name}`);
    console.log(achievement.description);
    
    // 显示奖励信息
    if (achievement.rewards.talentPoints) {
      console.log(`获得天赋点: ${achievement.rewards.talentPoints}`);
    }
    
    if (achievement.rewards.experience) {
      console.log(`获得经验值: ${achievement.rewards.experience}`);
    }
  }
  
  // 获取所有已解锁的成就
  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(achievement => 
      achievement.isCompleted && !achievement.isHidden
    );
  }
  
  // 获取特定类别的成就
  public getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(achievement => 
      achievement.category === category && (!achievement.isHidden || achievement.isCompleted)
    );
  }
  
  // 获取所有可见的成就（已解锁或非隐藏）
  public getVisibleAchievements(): Achievement[] {
    return this.achievements.filter(achievement => 
      !achievement.isHidden || achievement.isCompleted
    );
  }
  
  // 获取成就完成进度
  public getAchievementProgress(): {completed: number, total: number} {
    const visibleAchievements = this.getVisibleAchievements();
    const completedCount = visibleAchievements.filter(a => a.isCompleted).length;
    
    return {
      completed: completedCount,
      total: visibleAchievements.length
    };
  }
} 