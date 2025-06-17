<template>
  <div id="app" class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCharacterStore } from './stores/character';

const characterStore = useCharacterStore();

onMounted(() => {
  // 初始化角色数据
  characterStore.initializeFromStorage();
});
</script>

<style>
html, body {
  @apply m-0 p-0 w-full h-full;
  @apply bg-gray-900 text-white;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#app {
  @apply w-full h-full;
}

.app {
  @apply min-h-screen flex flex-col;
}
</style> 