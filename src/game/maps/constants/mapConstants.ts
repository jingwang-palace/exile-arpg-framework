export const MAP_CONSTANTS = {
  // 地图大小限制
  MIN_MAP_SIZE: 800,
  MAX_MAP_SIZE: 2000,

  // 区域大小限制
  MIN_REGION_SIZE: 100,
  MAX_REGION_SIZE: 500,

  // 房间数量限制
  MIN_ROOM_COUNT: 3,
  MAX_ROOM_COUNT: 10,

  // 难度范围
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,

  // 等级范围
  MIN_LEVEL: 1,
  MAX_LEVEL: 100,

  // 区域间距
  MIN_REGION_SPACING: 50,
  MAX_REGION_SPACING: 200,

  // 连接类型
  CONNECTION_TYPES: {
    DOOR: 'door',
    CORRIDOR: 'corridor',
    TELEPORTER: 'teleporter'
  },

  // 区域类型
  REGION_TYPES: {
    SPAWN: 'spawn',
    COMBAT: 'combat',
    TREASURE: 'treasure',
    BOSS: 'boss',
    SAFE: 'safe'
  },

  // 地图类型
  MAP_TYPES: {
    DUNGEON: 'dungeon',
    BOSS: 'boss',
    SAFE: 'safe'
  }
} as const; 