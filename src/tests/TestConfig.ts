export interface TestConfig {
  maps: {
    id: string;
    type: string;
    name: string;
    regions: {
      id: string;
      type: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      difficulty: number;
    }[];
  }[];
  items: {
    id: string;
    type: string;
    name: string;
    rarity: string;
    level: number;
    stats: Record<string, number>;
  }[];
  quests: {
    id: string;
    type: string;
    name: string;
    description: string;
    level: number;
    objectives: {
      type: string;
      target: string;
      amount: number;
    }[];
    rewards: {
      type: string;
      amount: number;
    }[];
  }[];
  monsters: {
    id: string;
    type: string;
    name: string;
    level: number;
    health: number;
    damage: number;
    defense: number;
    drops: {
      itemId: string;
      chance: number;
    }[];
  }[];
}

export const testConfig: TestConfig = {
  maps: [
    {
      id: 'test_dungeon_1',
      type: 'dungeon',
      name: '测试地下城1',
      regions: [
        {
          id: 'spawn_1',
          type: 'spawn',
          name: '入口区域',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 },
          difficulty: 1
        },
        {
          id: 'combat_1',
          type: 'combat',
          name: '战斗区域1',
          position: { x: 400, y: 100 },
          size: { width: 300, height: 300 },
          difficulty: 2
        }
      ]
    }
  ],
  items: [
    {
      id: 'test_sword_1',
      type: 'weapon',
      name: '测试剑',
      rarity: 'common',
      level: 1,
      stats: {
        damage: 10,
        attackSpeed: 1.2
      }
    }
  ],
  quests: [
    {
      id: 'test_quest_1',
      type: 'kill',
      name: '测试任务1',
      description: '击杀10个测试怪物',
      level: 1,
      objectives: [
        {
          type: 'kill',
          target: 'test_monster_1',
          amount: 10
        }
      ],
      rewards: [
        {
          type: 'experience',
          amount: 100
        },
        {
          type: 'gold',
          amount: 50
        }
      ]
    }
  ],
  monsters: [
    {
      id: 'test_monster_1',
      type: 'normal',
      name: '测试怪物1',
      level: 1,
      health: 100,
      damage: 10,
      defense: 5,
      drops: [
        {
          itemId: 'test_sword_1',
          chance: 0.1
        }
      ]
    }
  ]
}; 