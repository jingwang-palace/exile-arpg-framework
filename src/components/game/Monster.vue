<template>
  <div class="monster-status">
    <div class="monster-header">
      <div class="monster-name">{{ monster.name }}</div>
      <div class="monster-level">Lv.{{ monster.level }}</div>
    </div>
    <div class="monster-health-bar">
      <div 
        class="monster-health-fill" 
        :style="{ width: `${(monster.currentHealth / monster.maxHealth) * 100}%` }"
      ></div>
      <span class="monster-health-text">
        HP: {{ monster.currentHealth }}/{{ monster.maxHealth }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Monster } from '@/types/monster'

defineProps<{
  monster: Monster
}>()
</script>

<style scoped>
.monster-status {
  @apply bg-gray-800/50 rounded-lg p-4;
  min-width: 240px;
}

.monster-header {
  @apply flex items-center justify-between mb-3;
}

.monster-name {
  @apply text-xl font-bold text-white;
}

.monster-level {
  @apply text-lg text-red-400 font-bold;
}

.monster-health-bar {
  @apply relative h-8 bg-red-900/50 rounded overflow-hidden;
  width: 220px;
}

.monster-health-fill {
  @apply absolute inset-0 bg-red-600 transition-all duration-200;
}

.monster-health-text {
  @apply absolute inset-0 flex items-center justify-center text-white text-lg font-bold;
}
</style> 