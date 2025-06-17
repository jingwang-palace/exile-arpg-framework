export const ITEM_USE_COOLDOWNS = {
  // 消耗品冷却时间（毫秒）
  health_potion: 5000, // 5秒
  mana_potion: 5000, // 5秒
  strength_potion: 30000, // 30秒
  
  // 通货冷却时间
  [CurrencyType.ORB_OF_ALTERATION]: 1000, // 1秒
  [CurrencyType.CHAOS_ORB]: 1000, // 1秒
  [CurrencyType.EXALTED_ORB]: 1000, // 1秒
  
  // 装备技能冷却时间
  unique_sword: 15000, // 15秒
  
  // 宝石技能冷却时间
  fireball_gem: 3000, // 3秒
  lightning_gem: 4000, // 4秒
  
  // 任务物品冷却时间
  ancient_key: 0, // 无冷却
  
  // 材料冷却时间
  crafting_essence: 0 // 无冷却
}; 