<template>
  <div class="game-container" ref="gameContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createGame } from '../game';
import type { Game } from '../game';

const gameContainer = ref<HTMLElement | null>(null);
let game: Game | null = null;

onMounted(() => {
  if (gameContainer.value) {
    // 创建游戏实例
    game = createGame(gameContainer.value);
  }
});

onBeforeUnmount(() => {
  // 销毁游戏实例，避免内存泄漏
  if (game) {
    game.destroy(true);
    game = null;
  }
});
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  background-color: #111827;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 