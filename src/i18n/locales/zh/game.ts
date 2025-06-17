export default {
  noCharacter: '请先创建角色',
  resources: {
    health: '生命值',
    mana: '魔法值',
    gold: '金币',
    goldGained: '获得 {amount} 金币',
    notEnoughGold: '金币不足'
  },
  menus: {
    character: '角色',
    inventory: '背包',
    skills: '技能',
    exit: '退出游戏'
  },
  confirmExit: '确定要退出游戏吗？',
  area: {
    title: '初始之地',
    description: '这里是新手冒险者开始他们旅程的地方。周围的环境相对安全，适合熟悉基本的战斗技巧。',
    level: '等级范围：{level}',
    difficulty: '难度：{difficulty}'
  },
  difficulty: {
    normal: '普通',
    elite: '精英',
    boss: 'Boss'
  },
  activities: {
    title: '活动',
    explore: '探索',
    exploreDesc: '探索周边地区，可能遇到怪物或发现宝藏',
    quests: '任务',
    questsDesc: '接受和完成任务',
    shop: '商店',
    shopDesc: '购买装备和补给品'
  },
  actions: {
    start: '开始',
    viewQuests: '查看任务',
    openShop: '打开商店',
    startBattle: '开始战斗',
    explore: '探索'
  },
  character: {
    details: '角色详情',
    baseAttributes: '基础属性',
    derivedAttributes: '衍生属性',
    resistances: '抗性',
    experience: '经验值'
  },
  inventory: {
    title: '背包',
    empty: '背包是空的'
  },
  skills: {
    title: '技能',
    empty: '暂无可用技能'
  },
  quests: {
    title: '任务',
    empty: '暂无可用任务',
    available: '可接取',
    inProgress: '进行中',
    completed: '已完成',
    finished: '已结束',
    rewards: '奖励',
    accept: '接受任务',
    complete: '完成任务',
    categories: {
      story: '主线任务',
      daily: '日常任务',
      weekly: '周常任务',
      challenge: '挑战任务',
      tutorial: '新手任务'
    }
  },
  battle: {
    victory: '战斗胜利！',
    defeat: '战斗失败...',
    rewards: {
      exp: '获得经验值：',
      gold: '获得金币：',
      items: '获得物品：'
    }
  }
} as const 