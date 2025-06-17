import type { Quest } from '@/types/quest'

export default {
  // 主线剧情任务
  village_savior: {
    id: 'village_savior',
    name: '村庄的救星',
    description: '调查村庄周边出现的怪物潮，找出背后的真相。',
    type: 'kill',
    category: 'story',
    requirements: {
      level: 5,
      prevQuests: ['slime_hunter']
    },
    objectives: [
      {
        target: 'goblin',
        count: 10
      },
      {
        target: 'dark_wizard',
        count: 1
      }
    ],
    rewards: {
      exp: 500,
      gold: 200,
      items: [
        {
          id: 'magic_scroll',
          count: 1
        }
      ]
    },
    repeatable: false
  },

  // 日常任务
  daily_herb_gathering: {
    id: 'daily_herb_gathering',
    name: '药草采集',
    description: '为村医采集治疗所需的药草。',
    type: 'collect',
    category: 'daily',
    requirements: {
      level: 1
    },
    objectives: [
      {
        target: 'herb',
        count: 10
      }
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: [
        {
          id: 'health_potion',
          count: 1
        }
      ]
    },
    repeatable: true,
    resetType: 'daily'
  },

  // 周常任务
  weekly_boss_hunt: {
    id: 'weekly_boss_hunt',
    name: '森林霸主',
    description: '击败盘踞在深林中的巨型魔物。',
    type: 'kill',
    category: 'weekly',
    requirements: {
      level: 10
    },
    objectives: [
      {
        target: 'forest_boss',
        count: 1
      }
    ],
    rewards: {
      exp: 1000,
      gold: 500,
      items: [
        {
          id: 'rare_equipment_chest',
          count: 1
        }
      ]
    },
    repeatable: true,
    resetType: 'weekly'
  },

  // 高难任务
  dragon_slayer: {
    id: 'dragon_slayer',
    name: '屠龙者',
    description: '挑战栖息在火山顶部的远古巨龙。',
    type: 'kill',
    category: 'challenge',
    requirements: {
      level: 30,
      prevQuests: ['village_savior']
    },
    objectives: [
      {
        target: 'ancient_dragon',
        count: 1
      }
    ],
    rewards: {
      exp: 5000,
      gold: 2000,
      items: [
        {
          id: 'dragon_scale_armor',
          count: 1
        },
        {
          id: 'dragon_essence',
          count: 3
        }
      ]
    },
    repeatable: false
  },

  // 保留原有的新手任务
  slime_hunter: {
    id: 'slime_hunter',
    name: '史莱姆猎人',
    description: '消灭附近的史莱姆，保护村庄安全。',
    type: 'kill',
    category: 'tutorial',
    requirements: {
      level: 1
    },
    objectives: [
      {
        target: 'slime',
        count: 5
      }
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: [
        {
          id: 'health_potion',
          count: 2
        }
      ]
    },
    repeatable: true
  }
} as Record<string, Quest> 