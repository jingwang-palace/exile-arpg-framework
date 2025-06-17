<template>
  <div class="game-layout">
    <!-- 顶部导航栏 -->
    <header class="game-header">
      <div class="character-info">
        <div class="avatar" :style="{ backgroundColor: getClassColor(character.class) }">
          {{ getClassNameInitial(character.class) }}
        </div>
        <div class="info">
          <div class="name">{{ character.name }}</div>
          <div class="level">等级 {{ character.level }}</div>
        </div>
      </div>
      
      <div class="resources">
        <div class="resource health">
          <div class="label">生命</div>
          <div class="bar">
            <div 
              class="fill" 
              :style="{ width: `${(character.derivedAttributes.currentHealth / character.derivedAttributes.maxHealth) * 100}%` }"
            ></div>
            <div class="value">{{ Math.floor(character.derivedAttributes.currentHealth) }}/{{ Math.floor(character.derivedAttributes.maxHealth) }}</div>
          </div>
        </div>
        
        <div class="resource mana">
          <div class="label">魔力</div>
          <div class="bar">
            <div 
              class="fill" 
              :style="{ width: `${(character.derivedAttributes.currentMana / character.derivedAttributes.maxMana) * 100}%` }"
            ></div>
            <div class="value">{{ Math.floor(character.derivedAttributes.currentMana) }}/{{ Math.floor(character.derivedAttributes.maxMana) }}</div>
          </div>
        </div>
        
        <div class="resource energy" v-if="character.derivedAttributes.maxEnergy > 0">
          <div class="label">能量护盾</div>
          <div class="bar">
            <div 
              class="fill" 
              :style="{ width: `${(character.derivedAttributes.currentEnergy / character.derivedAttributes.maxEnergy) * 100}%` }"
            ></div>
            <div class="value">{{ Math.floor(character.derivedAttributes.currentEnergy) }}/{{ Math.floor(character.derivedAttributes.maxEnergy) }}</div>
          </div>
        </div>
      </div>
      
      <div class="experience">
        <div class="bar">
          <div 
            class="fill" 
            :style="{ width: `${(character.experience / getRequiredExperience(character.level)) * 100}%` }"
          ></div>
        </div>
        <div class="value">
          经验: {{ character.experience }}/{{ getRequiredExperience(character.level) }}
        </div>
      </div>
      
      <div class="currency">
        <span class="gold">{{ character.gold }} 金币</span>
      </div>
    </header>
    
    <!-- 主导航菜单 -->
    <nav class="game-nav">
      <router-link :to="{ name: 'GameHome' }" class="nav-item">
        <i class="nav-icon">🏠</i>
        <span>主页</span>
      </router-link>
      <router-link :to="{ name: 'GameCharacter' }" class="nav-item">
        <i class="nav-icon">👤</i>
        <span>角色</span>
      </router-link>
      <router-link :to="{ name: 'GameInventory' }" class="nav-item">
        <i class="nav-icon">🎒</i>
        <span>背包</span>
      </router-link>
      <router-link :to="{ name: 'GameSkills' }" class="nav-item">
        <i class="nav-icon">✨</i>
        <span>技能</span>
      </router-link>
      <router-link :to="{ name: 'GameMap' }" class="nav-item">
        <i class="nav-icon">🗺️</i>
        <span>地图</span>
      </router-link>
      <button @click="exitGame" class="nav-item exit">
        <i class="nav-icon">🚪</i>
        <span>退出</span>
      </button>
    </nav>
    
    <!-- 主内容区域 -->
    <main class="game-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCharacterStore } from '@/stores/character';
import { computed } from 'vue';
import { CLASS_DESCRIPTIONS } from '@/constants/characterTemplates';

const router = useRouter();
const characterStore = useCharacterStore();

// 获取当前角色
const character = computed(() => {
  if (!characterStore.currentCharacter) {
    router.push('/characters');
    return null;
  }
  return characterStore.currentCharacter;
});

// 获取职业颜色
function getClassColor(characterClass) {
  const colors = {
    marauder: '#d63031',  // 红色
    duelist: '#0984e3',   // 蓝色
    ranger: '#00b894',    // 绿色
    shadow: '#6c5ce7',    // 紫色
    witch: '#8e44ad',     // 深紫色
    templar: '#fdcb6e',   // 金色
    scion: '#e17055'      // 橙色
  };
  return colors[characterClass] || '#ccc';
}

// 获取职业名称首字母
function getClassNameInitial(characterClass) {
  const names = {
    marauder: '野',
    duelist: '决',
    ranger: '游',
    shadow: '影',
    witch: '巫',
    templar: '圣',
    scion: '贵'
  };
  return names[characterClass] || 'C';
}

// 获取升级所需经验
function getRequiredExperience(level) {
  return characterStore.getRequiredExperience(level);
}

// 退出游戏
function exitGame() {
  router.push('/characters');
}
</script>

<style scoped>
.game-layout {
  @apply min-h-screen bg-gray-900 text-white flex flex-col;
}

.game-header {
  @apply flex items-center bg-gray-800 p-4 border-b border-gray-700;
}

.character-info {
  @apply flex items-center mr-4;
}

.avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3;
}

.info .name {
  @apply font-bold text-yellow-400;
}

.info .level {
  @apply text-sm text-gray-400;
}

.resources {
  @apply flex-grow flex space-x-3;
}

.resource {
  @apply flex-grow max-w-xs;
}

.resource .label {
  @apply text-xs text-gray-400 mb-1;
}

.resource .bar {
  @apply h-5 bg-gray-700 rounded overflow-hidden relative;
}

.resource.health .fill {
  @apply h-full bg-red-600;
}

.resource.mana .fill {
  @apply h-full bg-blue-600;
}

.resource.energy .fill {
  @apply h-full bg-purple-600;
}

.resource .value {
  @apply absolute inset-0 flex items-center justify-center text-xs font-medium;
}

.experience {
  @apply mx-4 w-48;
}

.experience .bar {
  @apply h-2 bg-gray-700 rounded overflow-hidden;
}

.experience .fill {
  @apply h-full bg-green-500;
}

.experience .value {
  @apply text-xs text-gray-400 mt-1;
}

.currency {
  @apply text-sm;
}

.gold {
  @apply text-yellow-400 font-medium;
}

.game-nav {
  @apply flex bg-gray-800 border-b border-gray-700;
}

.nav-item {
  @apply flex flex-col items-center py-3 px-6 text-gray-400 hover:text-white hover:bg-gray-700;
  @apply transition-colors;
}

.nav-item.router-link-active {
  @apply text-yellow-400 bg-gray-700;
}

.nav-icon {
  @apply text-xl mb-1;
}

.nav-item.exit {
  @apply ml-auto text-red-400 hover:text-red-300 bg-transparent hover:bg-red-900;
}

.game-content {
  @apply flex-grow p-6 overflow-auto;
}
</style> 