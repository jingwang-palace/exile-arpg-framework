<template>
  <div class="home">
    <div class="content">
      <h1 class="title">像素风流放之路</h1>
      <p class="subtitle">踏上流亡之路，挑战命运</p>
      
      <div class="actions">
        <button class="play-btn" @click="goToCharacterSelect">开始游戏</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToCharacterSelect() {
  router.push('/characters')
}
</script>

<style scoped>
.home {
  @apply min-h-screen bg-gray-900 flex items-center justify-center;
  background-image: url('/assets/background.jpg');
  background-size: cover;
  background-position: center;
}

.content {
  @apply text-center p-8 bg-black/70 rounded-lg;
}

.title {
  @apply text-4xl md:text-6xl font-bold text-yellow-400 mb-4;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.subtitle {
  @apply text-xl text-gray-300 mb-12;
}

.actions {
  @apply flex justify-center;
}

.play-btn {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg;
  @apply transition-colors text-xl font-bold;
}
</style> 