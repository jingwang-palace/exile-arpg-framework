import { CurrencyType } from '../../types/currency';
import { ItemStack } from '../../types/item';
import { Scene } from 'phaser';

interface UseEffect {
  execute: (scene: Scene, item: ItemStack, quantity: number) => void;
  animation?: string;
  soundEffect?: string;
  particleEffect?: string;
}

export const ITEM_USE_EFFECTS = {
  // 消耗品效果
  consumables: {
    health_potion: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 恢复生命值
        const player = scene.registry.get('player');
        if (player) {
          const healAmount = 50 * quantity;
          player.heal(healAmount);
        }
      },
      animation: 'drink_potion',
      soundEffect: 'potion_use',
      particleEffect: 'heal_particles'
    },
    mana_potion: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 恢复魔法值
        const player = scene.registry.get('player');
        if (player) {
          const manaAmount = 30 * quantity;
          player.restoreMana(manaAmount);
        }
      },
      animation: 'drink_potion',
      soundEffect: 'potion_use',
      particleEffect: 'mana_particles'
    },
    strength_potion: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 增加力量
        const player = scene.registry.get('player');
        if (player) {
          const duration = 30 * quantity; // 30秒 * 数量
          player.addBuff('strength', duration);
        }
      },
      animation: 'drink_potion',
      soundEffect: 'potion_use',
      particleEffect: 'strength_particles'
    }
  },
  
  // 通货效果
  currency: {
    [CurrencyType.ORB_OF_ALTERATION]: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 重新随机化普通物品的修饰符
        const selectedItem = scene.registry.get('selectedItem');
        if (selectedItem && selectedItem.rarity === 'NORMAL') {
          selectedItem.rollNewMods();
        }
      },
      animation: 'use_orb',
      soundEffect: 'orb_use',
      particleEffect: 'alteration_particles'
    },
    [CurrencyType.CHAOS_ORB]: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 重新随机化稀有物品的所有修饰符
        const selectedItem = scene.registry.get('selectedItem');
        if (selectedItem && selectedItem.rarity === 'RARE') {
          selectedItem.rollNewMods();
        }
      },
      animation: 'use_orb',
      soundEffect: 'orb_use',
      particleEffect: 'chaos_particles'
    },
    [CurrencyType.EXALTED_ORB]: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 添加一个新的随机修饰符到稀有物品
        const selectedItem = scene.registry.get('selectedItem');
        if (selectedItem && selectedItem.rarity === 'RARE') {
          selectedItem.addRandomMod();
        }
      },
      animation: 'use_orb',
      soundEffect: 'orb_use',
      particleEffect: 'exalt_particles'
    }
  },
  
  // 装备效果
  equipment: {
    // 特殊装备效果
    unique_sword: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 激活特殊技能
        const player = scene.registry.get('player');
        if (player) {
          player.activateSpecialSkill('unique_sword_skill');
        }
      },
      animation: 'weapon_skill',
      soundEffect: 'unique_sword_skill',
      particleEffect: 'sword_particles'
    }
  },
  
  // 宝石效果
  gems: {
    fireball_gem: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 施放火球术
        const player = scene.registry.get('player');
        if (player) {
          player.castSpell('fireball');
        }
      },
      animation: 'cast_spell',
      soundEffect: 'fireball_cast',
      particleEffect: 'fire_particles'
    },
    lightning_gem: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 施放闪电术
        const player = scene.registry.get('player');
        if (player) {
          player.castSpell('lightning');
        }
      },
      animation: 'cast_spell',
      soundEffect: 'lightning_cast',
      particleEffect: 'lightning_particles'
    }
  },
  
  // 任务物品效果
  questItems: {
    ancient_key: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 打开特殊宝箱
        const chest = scene.registry.get('selectedChest');
        if (chest && chest.requiresKey === 'ancient_key') {
          chest.unlock();
        }
      },
      animation: 'use_key',
      soundEffect: 'key_use',
      particleEffect: 'unlock_particles'
    }
  },
  
  // 材料效果
  materials: {
    crafting_essence: {
      execute: (scene: Scene, item: ItemStack, quantity: number) => {
        // 用于 crafting 系统
        const craftingSystem = scene.registry.get('craftingSystem');
        if (craftingSystem) {
          craftingSystem.addMaterial('essence', quantity);
        }
      },
      animation: 'use_material',
      soundEffect: 'material_use',
      particleEffect: 'crafting_particles'
    }
  }
}; 