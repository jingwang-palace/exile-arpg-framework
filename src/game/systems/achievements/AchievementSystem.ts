import { EventEmitter } from 'events';
import { TalentManager } from '../talents/TalentManager';

// 成就类别枚举
export enum AchievementCategory {
  COMBAT = 'combat',         // 战斗相关
  EXPLORATION = 'exploration', // 探索相关
  COLLECTION = 'collection', // 收集相关
  SKILLS = 'skills',         // 技能相关
  SOCIAL = 'social',         // 社交相关
  SPECIAL = 'special'        // 特殊成就
}

// 成就接口
export interface Achievement {
  id: string;                       // 成就ID
  name: string;                     // 成就名称
  description: string;              // 成就描述
  category: AchievementCategory;    // 成就类别
  icon: string;                     // 成就图标
  isHidden: boolean;                // 是否隐藏成就（未解锁前不显示）
  isCompleted: boolean;             // 是否已完成
  progress: number;                 // 当前进度
  requiredProgress: number;         // 完成所需进度
  rewards: {
    talentPoints: number;           // 奖励天赋点
    experience?: number;            // 奖励经验值
    items?: Array<{id: string, quantity: number}>; // 奖励物品
  };
}

export class AchievementSystem extends EventEmitter {
  // 所有成就
  private achievements: Map<string, Achievement> = new Map();
  
  // 已完成的成就
  private completedAchievements: Set<string> = new Set();
  
  // 天赋管理器引用
  private talentManager: TalentManager;
  
  constructor(talentManager: TalentManager) {
    super();
    this.talentManager = talentManager;
  }
  
  // 注册成就
  public registerAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }
  
  // 批量注册成就
  public registerAchievements(achievements: Achievement[]): void {
    achievements.forEach(achievement => this.registerAchievement(achievement));
  }
  
  // 获取所有成就
  public getAchievements(): Map<string, Achievement> {
    return this.achievements;
  }
  
  // 获取玩家可见的成就
  public getVisibleAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(
      achievement => !achievement.isHidden || achievement.isCompleted
    );
  }
  
  // 获取已完成的成就
  public getCompletedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.isCompleted
    );
  }
  
  // 获取特定类别的成就
  public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.category === category
    );
  }
  
  // 更新成就进度
  public updateAchievementProgress(achievementId: string, progress: number): boolean {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement) {
      console.warn(`成就 ${achievementId} 不存在`);
      return false;
    }
    
    // 如果已完成，不再更新
    if (achievement.isCompleted) {
      return false;
    }
    
    // 更新进度
    const newProgress = Math.min(achievement.progress + progress, achievement.requiredProgress);
    achievement.progress = newProgress;
    
    // 触发进度更新事件
    this.emit('achievementProgressUpdated', achievement);
    
    // 检查是否完成
    if (newProgress >= achievement.requiredProgress && !achievement.isCompleted) {
      this.completeAchievement(achievementId);
    }
    
    return true;
  }
  
  // 完成成就
  private completeAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement || achievement.isCompleted) {
      return false;
    }
    
    // 标记为完成
    achievement.isCompleted = true;
    achievement.progress = achievement.requiredProgress;
    this.completedAchievements.add(achievementId);
    
    // 发放奖励
    if (achievement.rewards.talentPoints > 0) {
      this.talentManager.addTalentPoints(achievement.rewards.talentPoints);
    }
    
    // 触发完成事件
    this.emit('achievementCompleted', achievement);
    
    return true;
  }
  
  // 检查成就是否完成
  public isAchievementCompleted(achievementId: string): boolean {
    return this.completedAchievements.has(achievementId);
  }
  
  // 获取成就完成百分比
  public getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement) {
      return 0;
    }
    
    return (achievement.progress / achievement.requiredProgress) * 100;
  }
  
  // 手动完成成就（用于测试或特殊情况）
  public forceCompleteAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement) {
      console.warn(`成就 ${achievementId} 不存在`);
      return false;
    }
    
    // 设置为最大进度并完成
    achievement.progress = achievement.requiredProgress;
    return this.completeAchievement(achievementId);
  }
} 