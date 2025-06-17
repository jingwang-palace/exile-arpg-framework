import type { Area } from '@/types/area'

export default {
  starting_area: {
    id: 'starting_area',
    name: '初始之地',
    description: '这里是新手冒险者开始他们旅程的地方。周围的环境相对安全，适合熟悉基本的战斗技巧。',
    levelRange: {
      min: 1,
      max: 5
    },
    monsters: [
      { monsterId: 'slime', weight: 70, count: { min: 1, max: 3 } },
      { monsterId: 'wolf', weight: 30, count: { min: 1, max: 2 } }
    ],
    rewards: {
      exp: 50,
      gold: 20
    }
  }
} as Record<string, Area> 