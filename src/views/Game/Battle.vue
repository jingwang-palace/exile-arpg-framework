<template>
  <div class="battle-scene">
    <!-- 添加顶部返回按钮 -->
    <div class="battle-header">
      <button class="close-btn" @click="$emit('close')">
        <span class="close-icon">×</span>
      </button>
    </div>

    <!-- 战斗状态区 -->
    <div class="battle-status">
      <div class="player-status">
        <h3>{{ player.name }}</h3>
        <div class="health-bar">
          <div 
            class="health-fill" 
            :style="{ width: `${(player.currentHealth / player.maxHealth) * 100}%` }"
          ></div>
          <span class="health-text">
            HP: {{ player.currentHealth }}/{{ player.maxHealth }}
          </span>
        </div>
      </div>

      <div class="monsters-status">
        <Monster 
          v-for="monster in monsters" 
          :key="monster.id" 
          :monster="monster"
          class="monster-item"
        />
      </div>
    </div>

    <!-- 战斗日志区 -->
    <div class="combat-log" ref="logContainer">
      <div 
        v-for="(log, index) in combatLogs" 
        :key="index"
        :class="['log-entry', `log-${log.type}`]"
      >
        {{ log.message }}
      </div>
    </div>

    <!-- 添加返回按钮 -->
    <div class="battle-controls">
      <button 
        class="return-btn"
        @click="emitBattleEnd"
      >
        返回
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { CombatLogEntry, Combatant } from '@/types/combat'
import { monsterService } from '@/services/MonsterService'
import { CombatService } from '@/services/CombatService'
import { useCharacterStore } from '@/stores/character'
import { useQuestStore } from '@/stores/quest'
import Monster from '@/components/game/Monster.vue'

const characterStore = useCharacterStore()
const questStore = useQuestStore()

// 使用当前角色的属性初始化战斗者
const player = ref<Combatant>({
  id: characterStore.currentCharacter?.id || 'player',
  name: characterStore.currentCharacter?.name || '冒险者',
  level: characterStore.currentCharacter?.level || 1,
  currentHealth: characterStore.currentCharacter?.derivedAttributes.health || 100,
  maxHealth: characterStore.currentCharacter?.derivedAttributes.maxHealth || 100,
  attack: characterStore.currentCharacter?.derivedAttributes.attack || 10,
  defense: characterStore.currentCharacter?.derivedAttributes.defense || 5,
  isDead: false
})

const monsters = ref<Combatant[]>([])
const combatLogs = ref<CombatLogEntry[]>([])
const logContainer = ref<HTMLElement>()

// 自动滚动日志到底部
watch(combatLogs, () => {
  if (logContainer.value) {
    setTimeout(() => {
      logContainer.value!.scrollTop = logContainer.value!.scrollHeight
    }, 0)
  }
}, { deep: true })

// 添加 emit 定义
const emit = defineEmits(['close'])

// 添加返回按钮处理函数
const emitBattleEnd = () => {
  emit('close', {
    victory: true,
    rewards: {
      exp: 0,
      gold: 0
    }
  })
}

onMounted(async () => {
  if (!characterStore.currentCharacter) return

  const generatedMonsters = monsterService.generateMonsters(
    { min: 1, max: 3 }, 
    2
  )
  
  const combatService = new CombatService(player.value, generatedMonsters)
  const result = await combatService.startCombat()
  
  combatLogs.value = result.logs
  
  if (result.victory) {
    // 更新任务进度
    generatedMonsters.forEach(monster => {
      questStore.updateQuestProgress(monster.id, 'kill')
    })
    
    // 处理战利品
    if (result.rewards) {
      // 经验值
      if (result.rewards.exp) {
        characterStore.gainExperience(result.rewards.exp)
        combatLogs.value.push({
          type: 'reward',
          message: `获得 ${result.rewards.exp} 经验值`
        })
      }
      
      // 金币
      if (result.rewards.gold) {
        characterStore.gainGold(result.rewards.gold)
        combatLogs.value.push({
          type: 'reward',
          message: `获得 ${result.rewards.gold} 金币`
        })
      }
      
      // 物品
      if (result.rewards.items) {
        result.rewards.items.forEach(item => {
          const added = characterStore.addItem(item.id, item.quantity)
          if (added) {
            combatLogs.value.push({
              type: 'reward',
              message: `获得 ${item.name} x${item.quantity}`
            })
          }
        })
      }
    }
    
    // 在处理完所有奖励后，可以选择自动触发返回
    // emit('battle-end', {
    //   victory: true,
    //   rewards: result.rewards || { exp: 0, gold: 0 }
    // })
  }
})
</script>

<style scoped>
.battle-scene {
  @apply min-h-screen bg-gray-900 p-4 flex flex-col gap-4;
}

.battle-header {
  @apply flex justify-end mb-4;
}

.close-btn {
  @apply w-8 h-8 flex items-center justify-center
         rounded-full bg-gray-700 text-gray-300
         hover:bg-gray-600 hover:text-white
         transition-colors;
}

.close-icon {
  @apply text-xl leading-none;
}

.battle-status {
  @apply flex justify-between items-start max-w-3xl mx-auto w-full;
}

.player-status {
  @apply bg-gray-800 rounded-lg p-4 w-64;
}

.monsters-status {
  @apply flex flex-col gap-4;
}

.health-bar {
  @apply w-full bg-gray-700 rounded h-4 relative overflow-hidden mt-2;
}

.health-fill {
  @apply absolute top-0 left-0 h-full bg-green-600 transition-all duration-300;
}

.health-text {
  @apply absolute inset-0 flex items-center justify-center text-xs text-white;
}

.combat-log {
  @apply bg-gray-800 rounded-lg p-4 max-w-3xl mx-auto w-full h-64 overflow-y-auto;
}

.log-entry {
  @apply text-sm mb-1;
}

.log-damage {
  @apply text-red-400;
}

.log-heal {
  @apply text-green-400;
}

.log-death {
  @apply text-gray-400;
}

.log-victory {
  @apply text-yellow-400 font-bold;
}

.log-defeat {
  @apply text-red-400 font-bold;
}

.log-reward {
  @apply text-green-400;
}

.log-start, .log-end {
  @apply text-blue-400;
}

.battle-controls {
  @apply mt-4 flex justify-center;
}

.return-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded
         hover:bg-blue-700 transition-colors;
}
</style> 