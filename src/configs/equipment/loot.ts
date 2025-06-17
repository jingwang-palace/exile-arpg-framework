// 装备掉落配置
export const LOOT_CONFIG = {
  // 装备品质权重
  qualityWeights: {
    normal: 70,
    magic: 25,
    rare: 5,
    unique: 0.5
  },
  
  // 装备掉落概率基础配置
  baseProbability: 0.2,
  
  // 装备等级范围偏移
  levelRange: {
    min: -2,
    max: 2
  },
  
  // 怪物等级影响系数
  monsterLevelFactor: 0.05,
  
  // 装备类型权重
  typeWeights: {
    weapon: 40,
    armor: 40,
    accessory: 20
  },
  
  // 武器子类型权重
  weaponSubTypeWeights: {
    sword: 25,
    axe: 20,
    mace: 15,
    dagger: 15,
    wand: 10,
    staff: 10,
    bow: 5
  },
  
  // 防具子类型权重
  armorSubTypeWeights: {
    chest: 30,
    helmet: 20,
    gloves: 20,
    boots: 20,
    shield: 10
  }
} 