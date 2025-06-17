<template>
  <div class="app-container">
    <div id="game"></div>
    <div class="ui-overlay">
      <!-- UI组件将在这里渲染 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { game } from '../../main';

onMounted(() => {
  // 游戏实例已经在main.ts中创建
  console.log('游戏已加载');
});
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

#game {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}
</style> 