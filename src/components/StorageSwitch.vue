<template>
  <div class="flex items-center justify-between">
    <!-- 存储模式切换开关 -->
    <div class="flex items-center space-x-2">
      <span class="text-[--text-secondary] text-sm">存储模式:</span>
      <button
        class="text-sm px-3 py-1 rounded-full transition-colors duration-200"
        :class="[
          isLocalMode 
            ? 'bg-primary text-[--text-primary]' 
            : 'bg-card text-[--text-secondary]'
        ]"
        @click="switchToLocal"
      >
        本地
      </button>
      <button
        class="text-sm px-3 py-1 rounded-full transition-colors duration-200"
        :class="[
          isChainMode 
            ? 'bg-primary text-[--text-primary]' 
            : 'bg-card text-[--text-secondary]'
        ]"
        @click="switchToChain"
      >
        链上
      </button>
    </div>

    <!-- 本地模式下的存档操作 -->
    <div v-if="isLocalMode" class="flex items-center space-x-2">
      <button
        class="text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors duration-200"
        @click="exportSaveData"
      >
        导出存档
      </button>
      <label class="text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors duration-200 cursor-pointer">
        导入存档
        <input
          type="file"
          class="hidden"
          accept=".save"
          @change="handleFileImport"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorageStore } from '@/stores/storage'
import { storeToRefs } from 'pinia'

const storage = useStorageStore()
const { isChainMode, isLocalMode } = storeToRefs(storage)

const switchToLocal = () => storage.switchMode('local')
const switchToChain = async () => {
  try {
    await storage.switchMode('chain')
  } catch (error) {
    // 处理错误，比如显示提示
    console.error('Failed to switch to chain mode:', error)
  }
}

const exportSaveData = () => {
  const saveString = storage.exportSave()
  const blob = new Blob([saveString], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `game-save-${Date.now()}.save`
  a.click()
  URL.revokeObjectURL(url)
}

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    await storage.importSave(text)
    // 显示成功提示
  } catch (error) {
    // 显示错误提示
    console.error('Failed to import save:', error)
  }
}
</script> 