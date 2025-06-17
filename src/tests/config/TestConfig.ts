import { QuestDifficulty } from '../../game/systems/quest/types';
import { Size } from '../../core/math/Size';
import { Vector2D } from '../../core/math/Vector2D';

export const TestConfig = {
  // 地图测试配置
  maps: {
    dungeon: {
      id: 'test_dungeon',
      name: '测试地下城',
      type: 'DUNGEON',
      regions: [
        {
          id: 'spawn',
          name: '入口',
          type: 'SPAWN',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 },
          difficulty: 1
        },
        {
          id: 'combat_1',
          name: '战斗区域1',
          type: 'DUNGEON',
          position: { x: 400, y: 100 },
          size: { width: 300, height: 300 },
          difficulty: 2
        },
        {
          id: 'treasure',
          name: '宝箱区域',
          type: 'TREASURE',
          position: { x: 400, y: 400 },
          size: { width: 200, height: 200 },
          difficulty: 2
        },
        {
          id: 'boss',
          name: 'Boss区域',
          type: 'BOSS',
          position: { x: 700, y: 700 },
          size: { width: 400, height: 400 },
          difficulty: 5
        }
      ]
    },
    boss: {
      id: 'test_boss',
      name: '测试Boss地图',
      type: 'BOSS',
      regions: [
        {
          id: 'spawn',
          name: '入口',
          type: 'SPAWN',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 200 },
          difficulty: 1
        },
        {
          id: 'boss',
          name: 'Boss区域',
          type: 'BOSS',
          position: { x: 400, y: 400 },
          size: { width: 400, height: 400 },
          difficulty: 5
        }
      ]
    }
  },

  // 物品测试配置
  items: {
    weapon: {
      id: 'test_weapon',
      name: '测试武器',
      type: 'weapon',
      rarity: 'rare',
      level: 1,
      properties: new Map([
        ['damage', 10],
        ['speed', 1.2],
        ['range', 2]
      ])
    },
    armor: {
      id: 'test_armor',
      name: '测试护甲',
      type: 'armor',
      rarity: 'uncommon',
      level: 1,
      properties: new Map([
        ['defense', 5],
        ['health', 20]
      ])
    }
  },

  // 任务测试配置
  quests: {
    killMonster: {
      id: 'test_kill_quest',
      name: '击杀测试怪物',
      description: '击杀10只测试怪物',
      level: 1,
      difficulty: QuestDifficulty.NORMAL,
      monsterId: 'test_monster',
      requiredKills: 10,
      experienceReward: 1000,
      goldReward: 500,
      itemReward: {
        itemId: 'test_reward_item',
        amount: 1
      }
    },
    collectItem: {
      id: 'test_collect_quest',
      name: '收集测试物品',
      description: '收集5个测试物品',
      level: 1,
      difficulty: QuestDifficulty.NORMAL,
      itemId: 'test_item',
      requiredAmount: 5,
      experienceReward: 800,
      goldReward: 400
    }
  },

  // 怪物测试配置
  monsters: {
    testMonster: {
      id: 'test_monster',
      name: '测试怪物',
      level: 1,
      health: 100,
      damage: 10,
      defense: 5,
      experience: 50,
      gold: 25,
      dropTable: [
        {
          itemId: 'test_item',
          chance: 0.5,
          minAmount: 1,
          maxAmount: 3
        }
      ]
    }
  },

  // 地图配置
  map: {
    defaultSize: new Size(1000, 1000),
    minSize: new Size(100, 100),
    maxSize: new Size(2000, 2000),
    defaultRegionSize: new Size(200, 200),
    minRegionSize: new Size(100, 100),
    maxRegionSize: new Size(500, 500)
  },

  // 角色配置
  character: {
    defaultHealth: 100,
    defaultMana: 100,
    defaultStrength: 10,
    defaultDexterity: 10,
    defaultIntelligence: 10,
    defaultVitality: 10,
    defaultEnergy: 10
  },

  // 装备配置
  equipment: {
    weapon: {
      minDamage: 5,
      maxDamage: 10,
      attackSpeed: 1.0
    },
    armor: {
      minDefense: 5,
      maxDefense: 10
    }
  },

  // 技能配置
  skill: {
    defaultCooldown: 5,
    defaultManaCost: 10,
    defaultDamage: 20
  },

  // 物品配置
  item: {
    defaultStackSize: 100,
    currencyStackSize: 1000
  },

  // 测试数据
  testData: {
    // 测试地图
    testMap: {
      id: 'test-map',
      name: '测试地图',
      type: 'dungeon',
      size: new Size(1000, 1000),
      regions: [
        {
          id: 'test-region-1',
          name: '测试区域1',
          position: new Vector2D(100, 100),
          size: new Size(200, 200),
          type: 'combat',
          difficulty: 1
        },
        {
          id: 'test-region-2',
          name: '测试区域2',
          position: new Vector2D(400, 100),
          size: new Size(200, 200),
          type: 'combat',
          difficulty: 2
        }
      ]
    },

    // 测试角色
    testCharacter: {
      id: 'test-character',
      name: '测试角色',
      level: 1,
      health: 100,
      mana: 100,
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10,
      energy: 10
    },

    // 测试装备
    testEquipment: {
      weapon: {
        id: 'test-weapon',
        name: '测试武器',
        type: 'weapon',
        level: 1,
        damage: 10,
        attackSpeed: 1.0
      },
      armor: {
        id: 'test-armor',
        name: '测试护甲',
        type: 'armor',
        level: 1,
        defense: 10
      }
    },

    // 测试技能
    testSkill: {
      id: 'test-skill',
      name: '测试技能',
      level: 1,
      damage: 20,
      cooldown: 5,
      manaCost: 10
    },

    // 测试物品
    testItem: {
      id: 'test-item',
      name: '测试物品',
      type: 'material',
      level: 1,
      stackable: true,
      maxStack: 100
    }
  }
}; 