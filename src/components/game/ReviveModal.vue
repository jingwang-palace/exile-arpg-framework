<template>
  <div v-if="showModal" class="revive-modal">
    <div class="revive-content">
      <h2 class="text-xl font-bold text-red-500 mb-4">
        {{ t('battle.death.title') }}
      </h2>
      
      <div class="death-info mb-6">
        <p class="text-gray-300 mb-2">
          {{ t('battle.death.description') }}
        </p>
        <div class="countdown text-2xl font-bold text-yellow-500">
          {{ formatTime(cooldown) }}
        </div>
      </div>

      <div class="actions">
        <label class="auto-revive-toggle mb-4 flex items-center">
          <input
            type="checkbox"
            v-model="autoRevive"
            class="form-checkbox h-5 w-5 text-blue-600"
          >
          <span class="ml-2 text-gray-300">
            {{ t('battle.death.autoRevive') }}
          </span>
        </label>

        <button
          @click="handleRevive"
          :disabled="cooldown > 0"
          :class="[
            'revive-btn',
            cooldown > 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          {{ t('battle.death.reviveButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'

const { t } = useI18n()
const characterStore = useCharacterStore()
const autoRevive = ref(false)
let timer: number | null = null

const showModal = computed(() => {
  const character = characterStore.currentCharacter
  return character && character.derivedAttributes.health <= 0
})

const cooldown = computed(() => characterStore.reviveCooldown)

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 处理复活
const handleRevive = () => {
  if (cooldown.value === 0) {
    const success = characterStore.revive()
    if (success) {
      // 可以添加提示信息
      console.log(t('battle.death.revived'))
    }
  }
}

// 自动复活检查
const checkAutoRevive = () => {
  if (autoRevive.value && cooldown.value === 0 && showModal.value) {
    handleRevive()
  }
}

// 设置定时器
onMounted(() => {
  timer = window.setInterval(checkAutoRevive, 1000)
})

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.revive-modal {
  @apply fixed inset-0 bg-black bg-opacity-75 
         flex items-center justify-center z-50;
}

.revive-content {
  @apply bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4;
}

.death-info {
  @apply text-center;
}

.countdown {
  @apply font-mono;
}

.actions {
  @apply flex flex-col items-center;
}

.revive-btn {
  @apply px-6 py-2 rounded-lg text-white font-bold
         transition-colors duration-200 w-full;
}

.auto-revive-toggle input {
  @apply rounded border-gray-600 bg-gray-700
         focus:ring-2 focus:ring-blue-500;
}
</style> 