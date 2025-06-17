import type { Monster } from '@/types/monster'

export default {
  // 基础怪物
  slime: {
    id: 'slime',
    name: '史莱姆',
    level: 1,
    health: 50,
    mana: 0,
    attack: 5,
    defense: 2,
    exp: 10,
    gold: 5,
    skills: [],
    drops: [
      { itemId: 'slime_core', chance: 0.5 }
    ]
  },
  
  rat: {
    id: 'rat',
    name: '巨鼠',
    level: 1,
    health: 40,
    mana: 0,
    attack: 6,
    defense: 1,
    exp: 8,
    gold: 3,
    skills: [],
    drops: [
      { itemId: 'rat_tail', chance: 0.6 }
    ]
  },
  
  zombie: {
    id: 'zombie',
    name: '僵尸',
    level: 2,
    health: 80,
    mana: 0,
    attack: 8,
    defense: 3,
    exp: 15,
    gold: 8,
    skills: [],
    drops: [
      { itemId: 'rotten_flesh', chance: 0.7 },
      { itemId: 'zombie_eye', chance: 0.3 }
    ]
  },
  
  skeleton: {
    id: 'skeleton',
    name: '骷髅',
    level: 3,
    health: 70,
    mana: 0,
    attack: 10,
    defense: 4,
    exp: 18,
    gold: 10,
    skills: ['boneShard'],
    drops: [
      { itemId: 'bone', chance: 0.8 },
      { itemId: 'skeleton_skull', chance: 0.2 }
    ]
  },
  
  wolf: {
    id: 'wolf',
    name: '野狼',
    level: 3,
    health: 60,
    mana: 0,
    attack: 12,
    defense: 2,
    exp: 20,
    gold: 8,
    skills: ['bite'],
    drops: [
      { itemId: 'wolf_fang', chance: 0.5 },
      { itemId: 'wolf_pelt', chance: 0.4 }
    ]
  },
  
  spider: {
    id: 'spider',
    name: '大蜘蛛',
    level: 4,
    health: 65,
    mana: 10,
    attack: 9,
    defense: 3,
    exp: 22,
    gold: 12,
    skills: ['poisonBite'],
    drops: [
      { itemId: 'spider_silk', chance: 0.6 },
      { itemId: 'spider_eye', chance: 0.3 }
    ]
  },
  
  goblin: {
    id: 'goblin',
    name: '地精',
    level: 5,
    health: 90,
    mana: 15,
    attack: 11,
    defense: 5,
    exp: 30,
    gold: 20,
    skills: ['quickStab'],
    drops: [
      { itemId: 'goblin_ear', chance: 0.5 },
      { itemId: 'crude_dagger', chance: 0.3 }
    ]
  },
  
  bandit: {
    id: 'bandit',
    name: '强盗',
    level: 6,
    health: 100,
    mana: 20,
    attack: 13,
    defense: 6,
    exp: 35,
    gold: 25,
    skills: ['slash', 'stab'],
    drops: [
      { itemId: 'bandit_mask', chance: 0.4 },
      { itemId: 'stolen_goods', chance: 0.5 }
    ]
  },
  
  // 精英怪物
  goblin_shaman: {
    id: 'goblin_shaman',
    name: '地精萨满',
    level: 8,
    health: 150,
    mana: 80,
    attack: 12,
    defense: 8,
    exp: 60,
    gold: 40,
    skills: ['fireBolt', 'heal'],
    drops: [
      { itemId: 'magic_scroll', chance: 0.6 },
      { itemId: 'shaman_staff', chance: 0.3 }
    ],
    isElite: true
  },
  
  dire_wolf: {
    id: 'dire_wolf',
    name: '冰原狼',
    level: 9,
    health: 180,
    mana: 30,
    attack: 16,
    defense: 7,
    exp: 70,
    gold: 35,
    skills: ['howl', 'frostBite'],
    drops: [
      { itemId: 'dire_wolf_heart', chance: 0.5 },
      { itemId: 'thick_fur', chance: 0.7 }
    ],
    isElite: true
  },

  dark_wizard: {
    id: 'dark_wizard',
    name: '黑暗法师',
    level: 10,
    hp: 200,
    attack: 30,
    defense: 10,
    exp: 100,
    gold: 50
  },

  forest_boss: {
    id: 'forest_boss',
    name: '森林巨兽',
    level: 15,
    hp: 500,
    attack: 45,
    defense: 20,
    exp: 200,
    gold: 100
  },

  ancient_dragon: {
    id: 'ancient_dragon',
    name: '远古巨龙',
    level: 30,
    hp: 1000,
    attack: 100,
    defense: 50,
    exp: 1000,
    gold: 500
  }
} as const 