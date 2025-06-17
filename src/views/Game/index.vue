<template>
  <div class="game-view">
    <GameContainer />
  </div>
</template>

<script setup lang="ts">
import GameContainer from '../../components/GameContainer.vue';
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>