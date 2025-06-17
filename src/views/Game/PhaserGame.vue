<template>
  <div class="game-container">
    <div id="game-container" class="phaser-container"></div>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="reload" class="reload-btn">重新加载</button>
    </div>
    <div v-if="loading" class="loading-overlay">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
// 导入游戏工厂
import gameFactory from '../../game';

const error = ref('');
const loading = ref(true);
let game = null;

onMounted(() => {
  // 添加加载状态
  loading.value = true;
  console.log('组件挂载，准备创建游戏');
  
  try {
    // 使用工厂方法创建游戏
    console.log('调用游戏工厂create方法');
    game = gameFactory.create();
    
    if (!game) {
      error.value = '游戏创建失败，请刷新页面重试';
      loading.value = false;
      console.error('游戏实例创建失败');
      return;
    }
    
    console.log('游戏实例创建成功，等待加载完成');
    
    // 设置超时检查
    setTimeout(() => {
      if (loading.value) {
        console.log('游戏加载超时，隐藏加载状态');
        loading.value = false;
      }
    }, 5000);
    
    // 如果游戏已启动，则隐藏加载状态
    if (game.isBooted) {
      console.log('游戏已启动，隐藏加载状态');
      loading.value = false;
    }
    
    // 监听游戏错误
    window.addEventListener('error', (e) => {
      console.error('Game error:', e);
      // 只显示Phaser相关错误
      if (e.message && (e.message.includes('Phaser') || e.message.includes('Scene'))) {
        error.value = '游戏运行错误: ' + e.message;
      }
    });
  } catch (e: any) {
    error.value = '游戏加载出错: ' + (e.message || '未知错误');
    console.error('Error in game setup:', e);
    loading.value = false;
  }
});

onUnmounted(() => {
  // 获取当前游戏实例
  const currentGame = gameFactory.getInstance();
  
  // 销毁游戏实例
  if (currentGame) {
    try {
      console.log('组件卸载，销毁游戏实例');
      currentGame.destroy(true);
    } catch (e) {
      console.error('Error destroying game:', e);
    }
  }
});

// 重新加载页面
const reload = () => {
  window.location.reload();
};
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  position: relative;
}

.phaser-container {
  width: 1024px;
  height: 768px;
  margin: 0 auto;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #ff5555;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 80%;
}

.reload-btn {
  background-color: #4a5568;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.reload-btn:hover {
  background-color: #2d3748;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
}
</style> 