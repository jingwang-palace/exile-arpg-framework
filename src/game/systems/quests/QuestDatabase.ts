import { Quest, QuestType, QuestObjectiveType } from './QuestSystem';

// 预设任务列表
export const QUESTS: Quest[] = [
  // 主线任务
  {
    id: 'main_quest_1',
    title: '新手历练',
    description: '完成基础训练，学习游戏操作和战斗技巧。',
    type: QuestType.MAIN,
    level: 1,
    objectives: [
      {
        id: 'main_quest_1_obj_1',
        type: QuestObjectiveType.KILL_ENEMY,
        targetId: 'training_dummy',
        targetName: '训练假人',
        required: 3,
        current: 0,
        description: '击败3个训练假人'
      },
      {
        id: 'main_quest_1_obj_2',
        type: QuestObjectiveType.USE_SKILL,
        targetId: 'any',
        targetName: '任意技能',
        required: 5,
        current: 0,
        description: '使用技能5次'
      }
    ],
    rewards: {
      experience: 100,
      talentPoints: 1
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: []
  },
  
  {
    id: 'main_quest_2',
    title: '危险的森林',
    description: '探索森林地区，消灭威胁村庄的怪物。',
    type: QuestType.MAIN,
    level: 3,
    objectives: [
      {
        id: 'main_quest_2_obj_1',
        type: QuestObjectiveType.KILL_ENEMY,
        targetId: 'forest_wolf',
        targetName: '森林狼',
        required: 5,
        current: 0,
        description: '击败5只森林狼'
      },
      {
        id: 'main_quest_2_obj_2',
        type: QuestObjectiveType.COLLECT_ITEM,
        targetId: 'wolf_pelt',
        targetName: '狼皮',
        required: 3,
        current: 0,
        description: '收集3张狼皮'
      }
    ],
    rewards: {
      experience: 300,
      talentPoints: 1,
      gold: 50
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: ['main_quest_1']
  },
  
  // 支线任务
  {
    id: 'side_quest_1',
    title: '草药收集',
    description: '为村庄的医师收集治疗所需的草药。',
    type: QuestType.SIDE,
    level: 2,
    objectives: [
      {
        id: 'side_quest_1_obj_1',
        type: QuestObjectiveType.COLLECT_ITEM,
        targetId: 'healing_herb',
        targetName: '治疗草药',
        required: 8,
        current: 0,
        description: '收集8株治疗草药'
      }
    ],
    rewards: {
      experience: 150,
      talentPoints: 1,
      items: [
        { id: 'minor_health_potion', quantity: 3 }
      ]
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: []
  },
  
  {
    id: 'side_quest_2',
    title: '迷路的商人',
    description: '护送迷路的商人安全返回城镇。',
    type: QuestType.SIDE,
    level: 4,
    objectives: [
      {
        id: 'side_quest_2_obj_1',
        type: QuestObjectiveType.REACH_LOCATION,
        targetId: 'merchant_camp',
        targetName: '商人营地',
        required: 1,
        current: 0,
        description: '找到商人营地'
      },
      {
        id: 'side_quest_2_obj_2',
        type: QuestObjectiveType.REACH_LOCATION,
        targetId: 'town_gate',
        targetName: '城镇大门',
        required: 1,
        current: 0,
        description: '护送商人到城镇大门'
      }
    ],
    rewards: {
      experience: 250,
      talentPoints: 1,
      gold: 100
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: []
  },
  
  // 每日任务
  {
    id: 'daily_quest_1',
    title: '日常狩猎',
    description: '完成今日的狩猎配额。',
    type: QuestType.DAILY,
    level: 5,
    objectives: [
      {
        id: 'daily_quest_1_obj_1',
        type: QuestObjectiveType.KILL_ENEMY,
        targetId: 'any',
        targetName: '任意敌人',
        required: 20,
        current: 0,
        description: '击败20个敌人'
      }
    ],
    rewards: {
      experience: 200,
      talentPoints: 1
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: []
  },
  
  // 挑战任务
  {
    id: 'challenge_quest_1',
    title: '高难度挑战',
    description: '在不使用药水的情况下击败强大的BOSS。',
    type: QuestType.CHALLENGE,
    level: 10,
    objectives: [
      {
        id: 'challenge_quest_1_obj_1',
        type: QuestObjectiveType.KILL_ENEMY,
        targetId: 'forest_guardian',
        targetName: '森林守护者',
        required: 1,
        current: 0,
        description: '不使用药水击败森林守护者'
      }
    ],
    rewards: {
      experience: 500,
      talentPoints: 2,
      gold: 200,
      items: [
        { id: 'rare_equipment', quantity: 1 }
      ]
    },
    isComplete: false,
    isClaimed: false,
    isTracked: false,
    isAvailable: true,
    prerequisiteQuestIds: ['main_quest_2']
  }
];

// 获取所有任务
export function getAllQuests(): Quest[] {
  return QUESTS;
}

// 根据ID获取任务
export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find(quest => quest.id === id);
}

// 获取指定类型的任务
export function getQuestsByType(type: QuestType): Quest[] {
  return QUESTS.filter(quest => quest.type === type);
}

// 获取特定等级范围的任务
export function getQuestsByLevelRange(minLevel: number, maxLevel: number): Quest[] {
  return QUESTS.filter(quest => quest.level >= minLevel && quest.level <= maxLevel);
} 