// 升华职业枚举 - 针对野蛮人（Marauder）设计
export enum AscendancyClass {
  // 野蛮人升华（重点职业）
  JUGGERNAUT = 'juggernaut',     // 不朽之王
  BERSERKER = 'berserker',       // 狂战士  
  CHIEFTAIN = 'chieftain',       // 酋长
  
  // 决斗者升华
  GLADIATOR = 'gladiator',       // 角斗士
  CHAMPION = 'champion',         // 冠军
  
  // 游侠升华
  DEADEYE = 'deadeye',          // 神射手
  RAIDER = 'raider',            // 掠袭者
  PATHFINDER = 'pathfinder',    // 探路者
  
  // 暗影升华  
  ASSASSIN = 'assassin',        // 刺客
  TRICKSTER = 'trickster',      // 诡术师
  SABOTEUR = 'saboteur',        // 破坏者
  
  // 女巫升华
  NECROMANCER = 'necromancer',   // 死灵法师
  ELEMENTALIST = 'elementalist', // 元素使
  OCCULTIST = 'occultist',       // 秘术师
  
  // 圣堂武僧升华
  GUARDIAN = 'guardian',         // 守护者
  HIEROPHANT = 'hierophant',     // 教主
  INQUISITOR = 'inquisitor',     // 审判官
  
  // 贵族升华（通用）
  ASCENDANT = 'ascendant'        // 升华者
}

// 使用真实的CharacterClass替代BaseClass
import { CharacterClass } from './character'

// 升华节点类型
export enum AscendancyNodeType {
  MINOR = 'minor',        // 小型节点
  NOTABLE = 'notable',    // 重要节点  
  KEYSTONE = 'keystone'   // 核心节点
}

// 升华任务类型
export enum AscendancyQuestType {
  // 守护者任务
  PROTECTION = 'protection',           // 保护任务
  DEFENSE = 'defense',                // 防御任务
  SACRIFICE = 'sacrifice',            // 牺牲任务
  
  // 冠军任务
  ARENA_COMBAT = 'arena_combat',      // 竞技场战斗
  TRIAL_OF_STRENGTH = 'trial_of_strength', // 力量试炼
  HONOR_DUEL = 'honor_duel',          // 荣誉决斗
  
  // 角斗士任务
  BLOOD_TRIAL = 'blood_trial',        // 血腥试炼
  SURVIVAL_FIGHT = 'survival_fight',  // 生存战斗
  BERSERKER_RAGE = 'berserker_rage',  // 狂战士之怒
  
  // 元素使任务
  ELEMENTAL_MASTERY = 'elemental_mastery', // 元素掌控
  FIRE_TRIAL = 'fire_trial',          // 火焰试炼
  ICE_TRIAL = 'ice_trial',            // 冰霜试炼
  LIGHTNING_TRIAL = 'lightning_trial', // 雷电试炼
  
  // 咒术师任务
  DARK_RITUAL = 'dark_ritual',        // 黑暗仪式
  CURSE_MASTERY = 'curse_mastery',    // 诅咒掌控
  FORBIDDEN_KNOWLEDGE = 'forbidden_knowledge', // 禁忌知识
  
  // 召唤师任务
  NECROMANCY_TRIAL = 'necromancy_trial', // 死灵术试炼
  SPIRIT_COMMUNION = 'spirit_communion', // 与灵魂交流
  UNDEAD_MASTERY = 'undead_mastery',  // 不死族掌控
  
  // 死神任务
  STEALTH_TRIAL = 'stealth_trial',    // 潜行试炼
  ASSASSINATION = 'assassination',     // 刺杀任务
  SHADOW_MASTERY = 'shadow_mastery',  // 阴影掌控
  
  // 探路者任务
  EXPLORATION = 'exploration',         // 探索任务
  ALCHEMY_TRIAL = 'alchemy_trial',    // 炼金试炼
  NATURE_HARMONY = 'nature_harmony',  // 自然和谐
  
  // 驯兽师任务
  BEAST_COMMUNION = 'beast_communion', // 与野兽交流
  TOTEM_RITUAL = 'totem_ritual',      // 图腾仪式
  PRIMAL_BOND = 'primal_bond'         // 原始契约
}

// 升华任务接口
export interface AscendancyQuest {
  id: string
  name: string
  description: string
  lore: string                        // 背景故事
  type: AscendancyQuestType
  ascendancyClass: AscendancyClass
  requiredLevel: number
  objectives: AscendancyQuestObjective[]
  rewards: AscendancyQuestReward
  isCompleted: boolean
  isUnlocked: boolean
  questGiver?: string                 // 任务给予者
  location?: string                   // 任务地点
  specialMechanics?: string[]         // 特殊机制
}

// 升华任务目标
export interface AscendancyQuestObjective {
  id: string
  type: 'kill' | 'protect' | 'survive' | 'collect' | 'interact' | 'channel' | 'stealth'
  description: string
  target: string | number
  current: number
  isCompleted: boolean
  isOptional?: boolean
  specialConditions?: string[]        // 特殊条件
}

// 升华任务奖励
export interface AscendancyQuestReward {
  ascendancyPoints: number
  experience?: number
  items?: string[]
  title?: string                      // 头衔
  unlock?: string[]                   // 解锁内容
}

// 升华节点接口
export interface AscendancyNode {
  id: string
  name: string
  description: string
  type: AscendancyNodeType
  cost: number                    // 升华点消耗
  position: { x: number; y: number }
  isAllocated: boolean
  requirements: string[]          // 前置节点ID
  effects: AscendancyEffect[]
  icon?: string
  lore?: string                   // 节点背景故事
}

// 升华效果接口
export interface AscendancyEffect {
  type: AscendancyEffectType
  value: number
  target?: string                 // 目标技能/属性
  description: string
}

// 升华效果类型
export enum AscendancyEffectType {
  // 属性提升
  INCREASED_LIFE = 'increased_life',
  INCREASED_MANA = 'increased_mana',
  INCREASED_DAMAGE = 'increased_damage',
  INCREASED_ATTACK_SPEED = 'increased_attack_speed',
  INCREASED_CAST_SPEED = 'increased_cast_speed',
  INCREASED_CRITICAL_CHANCE = 'increased_critical_chance',
  INCREASED_CRITICAL_MULTIPLIER = 'increased_critical_multiplier',
  
  // 抗性
  INCREASED_FIRE_RESISTANCE = 'increased_fire_resistance',
  INCREASED_COLD_RESISTANCE = 'increased_cold_resistance',
  INCREASED_LIGHTNING_RESISTANCE = 'increased_lightning_resistance',
  
  // 防御
  INCREASED_ARMOR = 'increased_armor',
  INCREASED_EVASION = 'increased_evasion',
  INCREASED_BLOCK_CHANCE = 'increased_block_chance',
  
  // 特殊效果
  SKILL_MODIFICATION = 'skill_modification',     // 技能修改
  PASSIVE_ABILITY = 'passive_ability',          // 被动能力
  TRIGGERED_EFFECT = 'triggered_effect',        // 触发效果
  MINION_BONUS = 'minion_bonus',               // 召唤物加成
  FLASK_EFFECT = 'flask_effect',               // 药剂效果
  ELEMENTAL_DAMAGE = 'elemental_damage'        // 元素伤害
}

// 升华树配置接口
export interface AscendancyTree {
  ascendancyClass: AscendancyClass
  baseClass: CharacterClass
  name: string
  description: string
  lore: string                       // 升华背景故事
  nodes: AscendancyNode[]
  maxPoints: number              // 最大升华点数（通常为8）
  unlockLevel: number            // 解锁等级
  questRequirements: string[]    // 升华任务要求
  questGiver: string             // 任务给予者
  questLocation: string          // 任务地点
}

// 玩家升华状态接口
export interface PlayerAscendancy {
  selectedClass?: AscendancyClass
  allocatedNodes: string[]       // 已分配的节点ID
  availablePoints: number        // 可用升华点
  completedQuests: string[]      // 已完成的升华任务
  isUnlocked: boolean           // 是否已解锁升华系统
  currentQuest?: string         // 当前进行的升华任务
  title?: string                // 获得的头衔
}

// 升华试炼接口（保留兼容性）
export interface AscendancyTrial {
  id: string
  name: string
  description: string
  difficulty: 'normal' | 'cruel' | 'merciless'
  requiredLevel: number
  rewards: {
    ascendancyPoints: number
    experience?: number
    items?: string[]
  }
  objectives: TrialObjective[]
  isCompleted: boolean
}

// 试炼目标接口（保留兼容性）
export interface TrialObjective {
  id: string
  type: 'kill_enemies' | 'survive_time' | 'collect_items' | 'reach_location'
  description: string
  target: string | number
  current: number
  isCompleted: boolean
}

// 升华配置映射 - 重点突出野蛮人
export const ASCENDANCY_MAPPING: Record<CharacterClass, AscendancyClass[]> = {
  [CharacterClass.Marauder]: [
    AscendancyClass.JUGGERNAUT,  // 不朽之王 - 极限防御和生存
    AscendancyClass.BERSERKER,   // 狂战士 - 极致攻击和伤害
    AscendancyClass.CHIEFTAIN    // 酋长 - 火焰和图腾专精
  ],
  [CharacterClass.Duelist]: [
    AscendancyClass.GLADIATOR,   // 角斗士 - 格挡和反击
    AscendancyClass.CHAMPION     // 冠军 - 威吓和坚韧
  ],
  [CharacterClass.Ranger]: [
    AscendancyClass.DEADEYE,     // 神射手 - 弹射和远程
    AscendancyClass.RAIDER,      // 掠袭者 - 狂怒和速度
    AscendancyClass.PATHFINDER  // 探路者 - 药剂和元素
  ],
  [CharacterClass.Shadow]: [
    AscendancyClass.ASSASSIN,    // 刺客 - 暴击和毒素
    AscendancyClass.TRICKSTER,   // 诡术师 - 闪避和能量护盾
    AscendancyClass.SABOTEUR     // 破坏者 - 陷阱和地雷
  ],
  [CharacterClass.Witch]: [
    AscendancyClass.NECROMANCER,  // 死灵法师 - 召唤和光环
    AscendancyClass.ELEMENTALIST, // 元素使 - 三元素掌控
    AscendancyClass.OCCULTIST     // 秘术师 - 诅咒和混沌
  ],
  [CharacterClass.Templar]: [
    AscendancyClass.GUARDIAN,     // 守护者 - 保护和辅助
    AscendancyClass.HIEROPHANT,   // 教主 - 法术图腾和链接
    AscendancyClass.INQUISITOR    // 审判官 - 元素伤害和穿透
  ],
  [CharacterClass.Scion]: [
    AscendancyClass.ASCENDANT     // 升华者 - 混合职业特性
  ]
}

// 升华任务数据
export const ASCENDANCY_QUESTS: Record<AscendancyClass, AscendancyQuest[]> = {
  [AscendancyClass.GUARDIAN]: [
    {
      id: 'guardian_trial_of_protection',
      name: '守护试炼',
      description: '证明你拥有保护他人的决心和能力',
      lore: '真正的守护者不是为了荣耀而战，而是为了保护身后的生命。在这个试炼中，你将面对最严峻的考验。',
      type: AscendancyQuestType.PROTECTION,
      ascendancyClass: AscendancyClass.GUARDIAN,
      requiredLevel: 15,
      objectives: [
        {
          id: 'protect_villagers',
          type: 'protect',
          description: '保护村民免受怪物攻击（0/5 村民存活）',
          target: 5,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能让任何村民死亡', '持续5分钟']
        },
        {
          id: 'absorb_damage',
          type: 'survive',
          description: '吸收总计1000点伤害',
          target: 1000,
          current: 0,
          isCompleted: false
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '守护者',
        unlock: ['guardian_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '老守卫长莱昂',
      location: '边境哨所',
      specialMechanics: ['护盾机制', '嘲讽效果', '伤害转移']
    }
  ],
  
  [AscendancyClass.CHAMPION]: [
    {
      id: 'champion_arena_trial',
      name: '竞技场荣耀',
      description: '在竞技场中证明你的实力和荣誉',
      lore: '冠军不是天生的，而是在无数次战斗中锤炼出来的。踏入竞技场，用你的武艺赢得所有人的尊敬。',
      type: AscendancyQuestType.ARENA_COMBAT,
      ascendancyClass: AscendancyClass.CHAMPION,
      requiredLevel: 15,
      objectives: [
        {
          id: 'arena_victories',
          type: 'kill',
          description: '在竞技场中连续击败3个对手',
          target: 3,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能使用药剂', '必须单挑']
        },
        {
          id: 'perfect_combat',
          type: 'survive',
          description: '完成一场完美战斗（不受伤害）',
          target: 1,
          current: 0,
          isCompleted: false
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '竞技场冠军',
        items: ['冠军之剑'],
        unlock: ['champion_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '竞技场管理员马库斯',
      location: '斗兽场',
      specialMechanics: ['荣誉决斗规则', '观众加成', '连击系统']
    }
  ],
  
  [AscendancyClass.GLADIATOR]: [
    {
      id: 'gladiator_blood_trial',
      name: '血腥角斗',
      description: '在生死搏斗中觉醒内心的野性',
      lore: '只有在死亡的边缘，才能真正理解生命的可贵。血腥的角斗场将唤醒你内心最原始的战斗本能。',
      type: AscendancyQuestType.BLOOD_TRIAL,
      ascendancyClass: AscendancyClass.GLADIATOR,
      requiredLevel: 15,
      objectives: [
        {
          id: 'survive_waves',
          type: 'survive',
          description: '在角斗场存活10波怪物攻击',
          target: 10,
          current: 0,
          isCompleted: false,
          specialConditions: ['每波敌人越来越强', '生命值低于25%时伤害翻倍']
        },
        {
          id: 'low_life_kills',
          type: 'kill',
          description: '在生命值低于25%时击杀20个敌人',
          target: 20,
          current: 0,
          isCompleted: false
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '血腥角斗士',
        items: ['嗜血之刃'],
        unlock: ['gladiator_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '前角斗士冠军巴尔',
      location: '地下角斗场',
      specialMechanics: ['嗜血效果', '低血量增伤', '狂怒状态']
    }
  ],
  
  [AscendancyClass.ELEMENTALIST]: [
    {
      id: 'elementalist_mastery_trial',
      name: '元素觉醒',
      description: '掌握火、冰、雷三元素的力量',
      lore: '元素的力量存在于世界的每一个角落。火焰的激情，冰霜的宁静，雷电的狂暴——学会聆听它们的声音。',
      type: AscendancyQuestType.ELEMENTAL_MASTERY,
      ascendancyClass: AscendancyClass.ELEMENTALIST,
      requiredLevel: 15,
      objectives: [
        {
          id: 'fire_mastery',
          type: 'channel',
          description: '在火元素圣殿中冥想30秒',
          target: 30,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能被打断', '需要抵抗火焰伤害']
        },
        {
          id: 'ice_mastery',
          type: 'channel',
          description: '在冰元素圣殿中冥想30秒',
          target: 30,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能被打断', '需要抵抗冰霜伤害']
        },
        {
          id: 'lightning_mastery',
          type: 'channel',
          description: '在雷元素圣殿中冥想30秒',
          target: 30,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能被打断', '需要抵抗雷电伤害']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '元素掌控者',
        items: ['元素法杖'],
        unlock: ['elementalist_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '元素法师艾莉娅',
      location: '元素圣殿',
      specialMechanics: ['元素共鸣', '元素抗性考验', '元素融合']
    }
  ],
  
  [AscendancyClass.OCCULTIST]: [
    {
      id: 'occultist_dark_ritual',
      name: '暗影仪式',
      description: '探索被禁忌的黑暗魔法',
      lore: '有些知识被世人视为禁忌，但真正的求知者从不畏惧黑暗。在暗影中，你将找到力量的真谛。',
      type: AscendancyQuestType.DARK_RITUAL,
      ascendancyClass: AscendancyClass.OCCULTIST,
      requiredLevel: 15,
      objectives: [
        {
          id: 'collect_shadow_essence',
          type: 'collect',
          description: '收集5个暗影精华',
          target: 5,
          current: 0,
          isCompleted: false,
          specialConditions: ['只能在夜晚收集', '需要击败暗影生物']
        },
        {
          id: 'perform_ritual',
          type: 'channel',
          description: '在暗影祭坛上完成仪式',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['仪式期间会受到诅咒', '需要抵抗混乱效果']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '暗影行者',
        items: ['诅咒之书'],
        unlock: ['occultist_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '神秘学者薇拉',
      location: '被遗忘的地下室',
      specialMechanics: ['诅咒效果', '暗影庇护', '精神抗性']
    }
  ],
  
  [AscendancyClass.NECROMANCER]: [
    {
      id: 'necromancer_spirit_communion',
      name: '亡灵交流',
      description: '与死者的灵魂建立联系',
      lore: '死亡并非终点，而是另一个开始。学会与逝者对话，你将掌握生死之间的秘密。',
      type: AscendancyQuestType.SPIRIT_COMMUNION,
      ascendancyClass: AscendancyClass.NECROMANCER,
      requiredLevel: 15,
      objectives: [
        {
          id: 'commune_with_spirits',
          type: 'interact',
          description: '与5个游荡的灵魂对话',
          target: 5,
          current: 0,
          isCompleted: false,
          specialConditions: ['只能在墓地进行', '需要特殊仪式道具']
        },
        {
          id: 'summon_skeleton',
          type: 'channel',
          description: '召唤并控制一个骷髅战士',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['骷髅必须存活1分钟', '不能使用其他召唤物']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '死灵法师',
        items: ['亡者之杖'],
        unlock: ['necromancer_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '墓园守护者莫里斯',
      location: '古老墓园',
      specialMechanics: ['灵魂视觉', '亡灵召唤', '生命汲取']
    }
  ],
  
  [AscendancyClass.ASSASSIN]: [
    {
      id: 'assassin_shadow_trial',
      name: '暗影试炼',
      description: '掌握潜行和暗杀的艺术',
      lore: '真正的刺客如同夜晚的阴影，无声无息，致命一击。学会与黑暗共舞，成为敌人的噩梦。',
      type: AscendancyQuestType.STEALTH_TRIAL,
      ascendancyClass: AscendancyClass.ASSASSIN,
      requiredLevel: 15,
      objectives: [
        {
          id: 'stealth_kills',
          type: 'kill',
          description: '在隐身状态下击杀10个敌人',
          target: 10,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能被发现', '必须一击必杀']
        },
        {
          id: 'infiltrate_fortress',
          type: 'stealth',
          description: '潜入敌方要塞而不被发现',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能杀死守卫', '不能触发警报']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '暗影刺客',
        items: ['影刃双匕'],
        unlock: ['assassin_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '退隐刺客瑞文',
      location: '暗影训练场',
      specialMechanics: ['隐身系统', '暗杀机制', '敏捷考验']
    }
  ],
  
  [AscendancyClass.PATHFINDER]: [
    {
      id: 'pathfinder_nature_trial',
      name: '自然之路',
      description: '探索自然的奥秘和炼金的艺术',
      lore: '自然中蕴含着无穷的智慧，每一片叶子，每一滴露水都诉说着古老的秘密。成为自然的朋友，发现隐藏的力量。',
      type: AscendancyQuestType.NATURE_HARMONY,
      ascendancyClass: AscendancyClass.PATHFINDER,
      requiredLevel: 15,
      objectives: [
        {
          id: 'collect_herbs',
          type: 'collect',
          description: '采集10种稀有草药',
          target: 10,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能伤害自然生物', '需要在特定时间采集']
        },
        {
          id: 'brew_potion',
          type: 'interact',
          description: '制作大师级治疗药剂',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['需要完美的配方', '不能失败']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '自然行者',
        items: ['大师炼金套装'],
        unlock: ['pathfinder_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '草药学者瑟琳娜',
      location: '翡翠森林',
      specialMechanics: ['自然感知', '炼金专精', '药剂强化']
    }
  ],
  
  [AscendancyClass.BEASTMASTER]: [
    {
      id: 'beastmaster_primal_bond',
      name: '原始契约',
      description: '与野兽建立心灵联系',
      lore: '在文明诞生之前，人类与野兽是平等的伙伴。重新找回这种原始的纽带，与自然界的灵魂建立联系。',
      type: AscendancyQuestType.PRIMAL_BOND,
      ascendancyClass: AscendancyClass.BEASTMASTER,
      requiredLevel: 15,
      objectives: [
        {
          id: 'commune_with_beasts',
          type: 'interact',
          description: '与5种不同的野兽建立心灵联系',
          target: 5,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能伤害野兽', '需要特殊的交流仪式']
        },
        {
          id: 'summon_totem',
          type: 'channel',
          description: '建立并激活原始图腾',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['图腾必须吸引野兽前来', '维持5分钟']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 500,
        title: '野兽之友',
        items: ['原始图腾'],
        unlock: ['beastmaster_ascendancy']
      },
      isCompleted: false,
      isUnlocked: false,
      questGiver: '德鲁伊长老塔尔',
      location: '原始丛林',
      specialMechanics: ['野兽交流', '图腾力量', '自然和谐']
    }
  ]
} 