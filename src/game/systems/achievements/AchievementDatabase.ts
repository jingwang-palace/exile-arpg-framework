import { Achievement, AchievementCategory } from './AchievementSystem';

// 预设成就列表
export const ACHIEVEMENTS: Achievement[] = [
  // 战斗相关成就
  {
    id: 'achievement_combat_1',
    name: '初露锋芒',
    description: '击败100个敌人',
    category: AchievementCategory.COMBAT,
    icon: 'combat_1',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 100,
    rewards: {
      talentPoints: 1
    }
  },
  {
    id: 'achievement_combat_2',
    name: '百战百胜',
    description: '击败500个敌人',
    category: AchievementCategory.COMBAT,
    icon: 'combat_2',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 500,
    rewards: {
      talentPoints: 2
    }
  },
  {
    id: 'achievement_combat_3',
    name: '屠龙勇士',
    description: '击败巨龙BOSS',
    category: AchievementCategory.COMBAT,
    icon: 'combat_3',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 3
    }
  },
  
  // 探索相关成就
  {
    id: 'achievement_exploration_1',
    name: '初级探险家',
    description: '探索5个不同地区',
    category: AchievementCategory.EXPLORATION,
    icon: 'exploration_1',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 5,
    rewards: {
      talentPoints: 1,
      experience: 200
    }
  },
  {
    id: 'achievement_exploration_2',
    name: '世界漫游者',
    description: '探索所有地区',
    category: AchievementCategory.EXPLORATION,
    icon: 'exploration_2',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 12,
    rewards: {
      talentPoints: 3,
      experience: 1000
    }
  },
  {
    id: 'achievement_exploration_3',
    name: '寻宝专家',
    description: '发现30个隐藏宝箱',
    category: AchievementCategory.EXPLORATION,
    icon: 'exploration_3',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 30,
    rewards: {
      talentPoints: 2,
      items: [{ id: 'treasure_map', quantity: 1 }]
    }
  },
  
  // 技能相关成就
  {
    id: 'achievement_skills_1',
    name: '技能学徒',
    description: '使用技能1000次',
    category: AchievementCategory.SKILLS,
    icon: 'skills_1',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1000,
    rewards: {
      talentPoints: 1
    }
  },
  {
    id: 'achievement_skills_2',
    name: '技能大师',
    description: '将5个技能升级到最高等级',
    category: AchievementCategory.SKILLS,
    icon: 'skills_2',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 5,
    rewards: {
      talentPoints: 2
    }
  },
  {
    id: 'achievement_skills_3',
    name: '元素掌控',
    description: '在一场战斗中使用全部元素类型的技能',
    category: AchievementCategory.SKILLS,
    icon: 'skills_3',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 2
    }
  },
  
  // 收集相关成就
  {
    id: 'achievement_collection_1',
    name: '收藏家',
    description: '收集50种不同的物品',
    category: AchievementCategory.COLLECTION,
    icon: 'collection_1',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 50,
    rewards: {
      talentPoints: 1
    }
  },
  {
    id: 'achievement_collection_2',
    name: '稀有收藏家',
    description: '收集20件稀有装备',
    category: AchievementCategory.COLLECTION,
    icon: 'collection_2',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 20,
    rewards: {
      talentPoints: 2
    }
  },
  
  // 特殊成就
  {
    id: 'achievement_special_1',
    name: '不败战神',
    description: '在不死亡的情况下完成一个高级地下城',
    category: AchievementCategory.SPECIAL,
    icon: 'special_1',
    isHidden: true,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 3,
      items: [{ id: 'legendary_equipment', quantity: 1 }]
    }
  },
  {
    id: 'achievement_special_2',
    name: '速通大师',
    description: '在10分钟内完成主线第一章',
    category: AchievementCategory.SPECIAL,
    icon: 'special_2',
    isHidden: true,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 2,
      experience: 500
    }
  },
  
  // 天赋相关成就
  {
    id: 'achievement_talent_1',
    name: '天赋入门',
    description: '分配第一个天赋点',
    category: AchievementCategory.SKILLS,
    icon: 'talent_1',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 1
    }
  },
  {
    id: 'achievement_talent_2',
    name: '天赋专精',
    description: '在一个天赋树中分配20个天赋点',
    category: AchievementCategory.SKILLS,
    icon: 'talent_2',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 20,
    rewards: {
      talentPoints: 2
    }
  },
  {
    id: 'achievement_talent_3',
    name: '天赋大师',
    description: '解锁一个职业的全部核心天赋',
    category: AchievementCategory.SKILLS,
    icon: 'talent_3',
    isHidden: false,
    isCompleted: false,
    progress: 0,
    requiredProgress: 1,
    rewards: {
      talentPoints: 3
    }
  }
];

// 获取所有成就
export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}

// 根据ID获取成就
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
}

// 获取指定类别的成就
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}

// 获取非隐藏成就
export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => !achievement.isHidden);
} 