<template>
  <div class="game-skills">
    <h1 class="page-title">技能</h1>
    
    <div class="skills-placeholder">
      <div class="message">
        <p>技能系统正在开发中...</p>
        <p class="info">这里将展示角色的技能和天赋树</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from '@/stores/character';

const characterStore = useCharacterStore();
const character = characterStore.currentCharacter;
</script>

<style scoped>
.game-skills {
  @apply max-w-5xl mx-auto;
}

.page-title {
  @apply text-2xl font-bold text-yellow-400 mb-6;
}

.skills-placeholder {
  @apply bg-gray-800 rounded-lg h-64 flex items-center justify-center mb-8;
  @apply border-2 border-dashed border-gray-700;
}

.message {
  @apply text-center;
}

.message p {
  @apply text-xl font-bold text-gray-400;
}

.message .info {
  @apply text-sm font-normal text-gray-500 mt-2;
}
</style> 