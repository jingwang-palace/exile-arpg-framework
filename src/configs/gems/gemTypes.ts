export enum GemType {
  // 主动技能宝石
  ACTIVE_SKILL = 'active_skill',
  // 辅助技能宝石
  SUPPORT_SKILL = 'support_skill',
  // 光环宝石
  AURA = 'aura',
  // 诅咒宝石
  CURSE = 'curse',
  // 触发宝石
  TRIGGER = 'trigger'
}

export enum GemColor {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  WHITE = 'white'
}

export interface GemConfig {
  id: string;
  name: string;
  description: string;
  type: GemType;
  color: GemColor;
  level: number;
  quality: number;
  experience: number;
  experienceToNextLevel: number;
  maxLevel: number;
  manaCost: number;
  cooldown: number;
  tags: string[];
  sprite: string;
  soundEffect?: string;
  useEffect?: string;
  supportTypes?: string[];
  supportedSkills?: string[];
}

export const GEM_CONFIGS: Record<string, GemConfig> = {
  // 主动技能宝石
  fireball: {
    id: 'fireball',
    name: '火球术',
    description: '发射一个火球，造成火焰伤害',
    type: GemType.ACTIVE_SKILL,
    color: GemColor.RED,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 15,
    cooldown: 0.8,
    tags: ['spell', 'fire', 'projectile'],
    sprite: 'fireball_gem',
    soundEffect: 'fireball_cast',
    useEffect: 'cast_fireball'
  },
  lightning_strike: {
    id: 'lightning_strike',
    name: '闪电打击',
    description: '用武器进行攻击，释放闪电链',
    type: GemType.ACTIVE_SKILL,
    color: GemColor.GREEN,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 20,
    cooldown: 1.2,
    tags: ['attack', 'lightning', 'melee'],
    sprite: 'lightning_strike_gem',
    soundEffect: 'lightning_strike',
    useEffect: 'cast_lightning_strike'
  },
  ice_nova: {
    id: 'ice_nova',
    name: '冰霜新星',
    description: '释放冰霜冲击波，造成范围冰霜伤害',
    type: GemType.ACTIVE_SKILL,
    color: GemColor.BLUE,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 25,
    cooldown: 1.5,
    tags: ['spell', 'cold', 'area'],
    sprite: 'ice_nova_gem',
    soundEffect: 'ice_nova_cast',
    useEffect: 'cast_ice_nova'
  },
  
  // 辅助技能宝石
  increased_area_of_effect: {
    id: 'increased_area_of_effect',
    name: '扩大范围',
    description: '增加技能效果范围',
    type: GemType.SUPPORT_SKILL,
    color: GemColor.RED,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 0,
    cooldown: 0,
    tags: ['support', 'area'],
    sprite: 'increased_aoe_gem',
    supportTypes: ['area'],
    supportedSkills: ['fireball', 'ice_nova']
  },
  faster_casting: {
    id: 'faster_casting',
    name: '快速施法',
    description: '增加施法速度',
    type: GemType.SUPPORT_SKILL,
    color: GemColor.BLUE,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 0,
    cooldown: 0,
    tags: ['support', 'cast'],
    sprite: 'faster_casting_gem',
    supportTypes: ['spell'],
    supportedSkills: ['fireball', 'ice_nova', 'lightning_strike']
  },
  
  // 光环宝石
  hatred: {
    id: 'hatred',
    name: '憎恨',
    description: '增加冰霜伤害',
    type: GemType.AURA,
    color: GemColor.GREEN,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 35,
    cooldown: 0,
    tags: ['aura', 'cold'],
    sprite: 'hatred_gem',
    soundEffect: 'aura_cast',
    useEffect: 'cast_hatred'
  },
  wrath: {
    id: 'wrath',
    name: '愤怒',
    description: '增加闪电伤害',
    type: GemType.AURA,
    color: GemColor.BLUE,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 35,
    cooldown: 0,
    tags: ['aura', 'lightning'],
    sprite: 'wrath_gem',
    soundEffect: 'aura_cast',
    useEffect: 'cast_wrath'
  },
  
  // 诅咒宝石
  elemental_weakness: {
    id: 'elemental_weakness',
    name: '元素要害',
    description: '降低目标元素抗性',
    type: GemType.CURSE,
    color: GemColor.RED,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 25,
    cooldown: 0,
    tags: ['curse', 'elemental'],
    sprite: 'elemental_weakness_gem',
    soundEffect: 'curse_cast',
    useEffect: 'cast_elemental_weakness'
  },
  
  // 触发宝石
  cast_on_crit: {
    id: 'cast_on_crit',
    name: '暴击时施放',
    description: '暴击时触发连接的技能',
    type: GemType.TRIGGER,
    color: GemColor.RED,
    level: 1,
    quality: 0,
    experience: 0,
    experienceToNextLevel: 1000,
    maxLevel: 20,
    manaCost: 0,
    cooldown: 0.5,
    tags: ['trigger', 'critical'],
    sprite: 'cast_on_crit_gem',
    supportTypes: ['spell'],
    supportedSkills: ['fireball', 'ice_nova', 'lightning_strike']
  }
}; 