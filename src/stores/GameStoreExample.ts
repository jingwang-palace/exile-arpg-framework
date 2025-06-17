// GameStore使用示例
import { gameStore } from './GameStore';

// === 使用示例 ===

export function exampleUsage() {
  console.log('=== GameStore 使用示例 ===');
  
  // 1. 获取玩家数据
  const player = gameStore.getPlayer();
  console.log('当前玩家:', player);
  
  // 2. 战斗系统使用 - 处理掉血
  console.log('\n🔥 战斗中...');
  gameStore.damagePlayer(20);
  console.log('玩家受到20点伤害');
  
  // 3. 使用药剂加血
  console.log('\n💊 使用药剂...');
  gameStore.healPlayer(15);
  console.log('玩家恢复15点生命');
  
  // 4. 战斗胜利奖励
  console.log('\n🏆 战斗胜利！');
  const loot = [
    { id: 'sword1', name: '铁剑', rarity: 'common' },
    { id: 'potion1', name: '生命药剂', rarity: 'common' }
  ];
  gameStore.processCombatReward(50, 25, loot);
  
  // 5. 技能升级
  console.log('\n⚡ 技能升级...');
  const skillUpgradeSuccess = gameStore.upgradeSkill('strike');
  console.log('技能升级结果:', skillUpgradeSuccess);
  
  // 6. 选择升华职业
  console.log('\n🔱 选择升华...');
  gameStore.selectAscendancy('JUGGERNAUT');
  
  // 7. 完成升华任务
  console.log('\n📜 完成升华任务...');
  gameStore.completeAscendancyQuest('immortal_trial', 2);
  
  // 8. 查看数据摘要
  console.log('\n📊 数据摘要:');
  const summary = gameStore.getDataSummary();
  console.table(summary);
  
  // 9. 解锁新功能
  console.log('\n🔓 解锁功能...');
  gameStore.unlockFeature('ascendancy');
  gameStore.completeArea('twilight_strand');
  
  console.log('\n✅ 所有操作完成，数据已自动保存到localStorage');
}

// === 在各个系统中的使用方法 ===

// 技能系统示例
export class SkillSystemExample {
  upgradeSkill(skillId: string) {
    // 直接使用gameStore升级技能
    const success = gameStore.upgradeSkill(skillId);
    if (success) {
      // 更新UI显示
      this.refreshSkillUI();
    }
    return success;
  }
  
  private refreshSkillUI() {
    const skillData = gameStore.getSkills();
    console.log('刷新技能UI:', skillData);
  }
}

// 战斗系统示例
export class CombatSystemExample {
  playerTakeDamage(damage: number) {
    gameStore.damagePlayer(damage);
    
    // 检查玩家是否死亡
    const player = gameStore.getPlayer();
    if (player.health <= 0) {
      this.handlePlayerDeath();
    }
  }
  
  onEnemyKilled(enemy: any) {
    // 计算奖励
    const exp = enemy.level * 10;
    const gold = enemy.level * 5;
    const loot = this.generateLoot(enemy);
    
    // 通过gameStore处理奖励
    gameStore.processCombatReward(exp, gold, loot);
  }
  
  private handlePlayerDeath() {
    console.log('💀 玩家死亡');
    // 复活逻辑...
  }
  
  private generateLoot(enemy: any) {
    // 掉落物生成逻辑...
    return [];
  }
}

// 背包系统示例
export class InventorySystemExample {
  pickupItem(item: any) {
    const success = gameStore.addItem(item);
    if (!success) {
      console.log('❌ 背包已满，无法拾取:', item.name);
      // 显示背包已满提示
    }
    return success;
  }
  
  sellItem(itemId: string, sellPrice: number) {
    const success = gameStore.removeItem(itemId);
    if (success) {
      gameStore.updateGold(sellPrice);
      console.log(`💰 出售物品获得 ${sellPrice} 金币`);
    }
    return success;
  }
}

// 升华系统示例
export class AscendancySystemExample {
  selectAscendancy(ascendancyClass: string) {
    gameStore.selectAscendancy(ascendancyClass);
    console.log('✅ 升华职业已选择:', ascendancyClass);
  }
  
  completeQuest(questId: string) {
    gameStore.completeAscendancyQuest(questId, 2);
    
    // 检查是否有足够的升华点
    const ascendancy = gameStore.getAscendancy();
    if (ascendancy.availablePoints >= 2) {
      console.log('🔱 可以分配升华天赋点了！');
    }
  }
}

console.log('✅ GameStore示例已加载，可以调用 exampleUsage() 查看演示'); 