<template>
  <div class="battle-scene">
    <!-- 战斗状态区 -->
    <div class="battle-status">
      <!-- 玩家状态 -->
      <div class="player-status">
        <div class="status-header">
          <h3>{{ character?.name }}</h3>
          <span class="level">Lv.{{ character?.level }}</span>
        </div>
        <div class="health-bar">
          <div 
            class="health-fill" 
            :style="{ width: `${(character?.derivedAttributes.health / character?.derivedAttributes.maxHealth) * 100}%` }"
          ></div>
          <span class="health-text">
            HP: {{ character?.derivedAttributes.health }}/{{ character?.derivedAttributes.maxHealth }}
          </span>
        </div>
      </div>

      <!-- VS 标志 -->
      <div class="vs-sign">VS</div>

      <!-- 怪物状态 -->
      <div class="monsters-status">
        <Monster 
          v-for="monster in monsters" 
          :key="monster.id" 
          :monster="monster" 
        />
      </div>
    </div>

    <!-- 战斗日志区 -->
    <div class="combat-log-container">
      <h4 class="log-title">战斗日志</h4>
      <div class="combat-log" ref="logContainer">
        <div 
          v-for="(log, index) in combatLogs" 
          :key="index"
          :class="['log-entry', `log-${log.type}`]"
        >
          {{ log.message }}
        </div>
      </div>
    </div>

    <!-- 修改战斗结束后的按钮容器样式 -->
    <div v-if="battleEnded" class="battle-end-actions">
      <button 
        @click="closeBattle"
        class="close-button"
      >
        返回
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { useQuestStore } from '@/stores/quest'
import Monster from './Monster.vue'
import { monsterService } from '@/services/MonsterService'
import { CombatService } from '@/services/CombatService'
import type { CombatLog } from '@/types/combat'
import type { Monster as MonsterType } from '@/types/monster'

const router = useRouter()
const characterStore = useCharacterStore()
const questStore = useQuestStore()
const character = ref(characterStore.currentCharacter)
const monsters = ref<MonsterType[]>([])
const combatLogs = ref<CombatLog[]>([])
const logContainer = ref<HTMLElement | null>(null)
const battleEnded = ref(false)

const emit = defineEmits(['close'])

// 自动滚动日志到底部
const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 监听日志更新，自动滚动
watch(combatLogs, () => {
  nextTick(scrollToBottom)
}, { deep: true })

// 更新战斗日志的方法
const updateCombatLog = (log: CombatLog) => {
  combatLogs.value.push(log)
}

// 处理战斗结果
const handleCombatResult = async (result: any) => {
  battleEnded.value = true
  
  if (result.victory && result.rewards) {
    // 添加经验值
    if (result.rewards.exp) {
      characterStore.gainExperience(result.rewards.exp)
    }
    
    // 添加金币
    if (result.rewards.gold) {
      characterStore.gainGold(result.rewards.gold)
    }
    
    // 添加物品到背包
    if (result.rewards.items && result.rewards.items.length > 0) {
      console.log('Adding items:', result.rewards.items)
      for (const item of result.rewards.items) {
        await characterStore.addItem(item.id, item.quantity)
      }
    }
  }
}

// 开始战斗
const startBattle = async () => {
  if (!character.value) {
    console.error('No character found')
    return
  }

  const generatedMonsters = monsterService.generateMonsters(
    { min: 1, max: 3 }, 
    2
  )
  monsters.value = generatedMonsters
  
  console.log('Starting battle with monsters:', generatedMonsters)

  const combatService = new CombatService(character.value, generatedMonsters)
  combatService.onLogUpdate(updateCombatLog)
  
  const result = await combatService.startCombat()
  await handleCombatResult(result)
  
  // 更新角色状态
  if (character.value) {
    characterStore.setHealth(character.value.derivedAttributes.health)
  }
  
  if (result.victory) {
    console.log('Processing victory rewards:', result.rewards)
    // 更新任务进度
    generatedMonsters.forEach(monster => {
      questStore.updateQuestProgress(monster.id, 'kill')
    })
  }
}

// 关闭战斗页面
const closeBattle = () => {
  emit('close')
}

onMounted(() => {
  startBattle()
})
</script>

<style scoped>
.battle-scene {
  @apply bg-gray-900 p-6 rounded-lg;
  min-width: 480px;
}

.battle-status {
  @apply flex items-center justify-between mb-4;
}

.player-status {
  @apply flex-none;
}

.monsters-status {
  @apply flex-none space-y-4;
}

.vs-sign {
  @apply text-3xl font-bold text-yellow-500 mx-8;
}

.status-header {
  @apply flex items-center gap-2 mb-2;
}

.status-header h3 {
  @apply text-xl font-bold text-white;
}

.level {
  @apply text-base text-yellow-400;
}

.health-bar {
  @apply relative h-8 bg-red-900/50 rounded overflow-hidden;
  width: 220px;
}

.health-fill {
  @apply absolute inset-0 bg-red-600 transition-all duration-200;
}

.health-text {
  @apply absolute inset-0 flex items-center justify-center text-white text-base font-bold;
}

.combat-log-container {
  @apply mt-4;
}

.log-title {
  @apply text-lg font-bold text-white mb-2;
}

.combat-log {
  @apply bg-gray-800/50 rounded-lg p-4 border border-gray-700 
         h-[300px] overflow-y-auto;
}

.log-entry {
  @apply mb-1 text-base text-gray-300;
}

.log-damage {
  @apply text-red-400;
}

.log-death {
  @apply text-purple-400 font-bold;
}

.log-victory {
  @apply text-yellow-400 font-bold text-lg;
}

.log-defeat {
  @apply text-red-500 font-bold text-lg;
}

.log-separator {
  @apply text-blue-400 font-bold;
}

.log-reward {
  @apply text-green-400;
}

.log-reward-rare {
  @apply text-yellow-400 font-bold;
}

.battle-end-actions {
  @apply mt-4 flex justify-center;
}

.close-button {
  @apply px-6 py-2 bg-blue-600 text-white rounded-lg 
         hover:bg-blue-700 transition-colors duration-200
         font-bold text-base;
}

:deep(.monster-status) {
  @apply text-lg;
}

:deep(.monster-health-bar) {
  @apply h-7;
}

:deep(.monster-health-text) {
  @apply text-base;
}
</style> 