export interface GameEvents {
  // 怪物相关事件
  monsterKilled: {
    monsterId: string;
    killerId: string;
    position: { x: number; y: number };
  };
  monsterSpawned: {
    monsterId: string;
    position: { x: number; y: number };
  };
  monsterDamaged: {
    monsterId: string;
    damage: number;
    source: string;
  };

  // 物品相关事件
  itemGained: {
    itemId: string;
    amount: number;
    source: string;
    questId?: string;
  };
  itemUsed: {
    itemId: string;
    userId: string;
  };
  itemDropped: {
    itemId: string;
    position: { x: number; y: number };
  };

  // 经验值相关事件
  experienceGained: {
    amount: number;
    source: string;
    questId?: string;
  };
  levelUp: {
    level: number;
    newExperience: number;
  };

  // 金币相关事件
  goldGained: {
    amount: number;
    source: string;
    questId?: string;
  };
  goldSpent: {
    amount: number;
    purpose: string;
  };

  // 任务相关事件
  questStarted: {
    questId: string;
  };
  questCompleted: {
    questId: string;
  };
  questFailed: {
    questId: string;
  };
  questAbandoned: {
    questId: string;
  };
  objectiveUpdated: {
    questId: string;
    objectiveId: string;
    progress: number;
  };
  rewardsClaimed: {
    questId: string;
  };

  // 地图相关事件
  mapEntered: {
    mapId: string;
    position: { x: number; y: number };
  };
  mapExited: {
    mapId: string;
  };
  regionEntered: {
    regionId: string;
    position: { x: number; y: number };
  };
  regionExited: {
    regionId: string;
  };

  // 战斗相关事件
  combatStarted: {
    attackerId: string;
    defenderId: string;
  };
  combatEnded: {
    winnerId: string;
    loserId: string;
  };
  damageDealt: {
    attackerId: string;
    defenderId: string;
    damage: number;
    type: string;
  };
  healingReceived: {
    targetId: string;
    amount: number;
    source: string;
  };

  // 技能相关事件
  skillUsed: {
    skillId: string;
    userId: string;
    targetId?: string;
  };
  skillLearned: {
    skillId: string;
    userId: string;
  };
  skillUpgraded: {
    skillId: string;
    userId: string;
    newLevel: number;
  };

  // 状态相关事件
  statusEffectApplied: {
    targetId: string;
    effectId: string;
    duration: number;
  };
  statusEffectRemoved: {
    targetId: string;
    effectId: string;
  };
  statusEffectExpired: {
    targetId: string;
    effectId: string;
  };
} 