export enum QuestType {
  KILL_MONSTER = 'KILL_MONSTER',
  COLLECT_ITEM = 'COLLECT_ITEM',
  EXPLORE_AREA = 'EXPLORE_AREA',
  TALK_TO_NPC = 'TALK_TO_NPC',
  ESCORT_NPC = 'ESCORT_NPC',
  DEFEND_AREA = 'DEFEND_AREA',
  CRAFT_ITEM = 'CRAFT_ITEM',
  CUSTOM = 'CUSTOM'
}

export enum QuestStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED'
}

export enum QuestDifficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER'
}

export enum ObjectiveType {
  KILL_MONSTER = 'KILL_MONSTER',
  COLLECT_ITEM = 'COLLECT_ITEM',
  REACH_LOCATION = 'REACH_LOCATION',
  TALK_TO_NPC = 'TALK_TO_NPC',
  ESCORT_NPC = 'ESCORT_NPC',
  DEFEND_AREA = 'DEFEND_AREA',
  CRAFT_ITEM = 'CRAFT_ITEM',
  CUSTOM = 'CUSTOM'
}

export enum RewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  ITEM = 'item',
  CURRENCY = 'currency',
  REPUTATION = 'reputation',
  SKILL = 'skill',
  TITLE = 'title',
  CUSTOM = 'custom'
} 