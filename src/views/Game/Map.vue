<template>
  <div class="game-map">
    <h1 class="page-title">{{ selectedAreaData ? selectedAreaData.name : '世界地图' }}</h1>
    
    <!-- 世界地图 - 用于选择区域 -->
    <div v-if="!activeArea" class="world-map">
      <div 
        v-for="area in availableAreas" 
        :key="area.id" 
        class="map-area"
        :class="{ 'area-available': true, 'area-selected': selectedArea === area.id }"
        :style="{ left: `${area.position.x}%`, top: `${area.position.y}%` }"
        @click="selectArea(area)"
      >
        <div class="area-icon">{{ area.name.substring(0, 1) }}</div>
      </div>
      
      <!-- 区域详情 -->
      <div class="area-details" v-if="selectedAreaData">
        <div class="area-header">
          <h2>{{ selectedAreaData.name }}</h2>
          <div class="area-level">区域等级: <span>{{ selectedAreaData.level }}</span></div>
          <div class="area-difficulty" :class="getDifficultyClass(selectedAreaData.level)">
            {{ getDifficultyLabel(selectedAreaData.level) }}
          </div>
        </div>
        
        <p class="area-description">{{ selectedAreaData.description }}</p>
        
        <div class="monsters-section">
          <h3>出没的怪物:</h3>
          <ul class="monster-list">
            <li v-for="monster in selectedAreaData.monsters" :key="monster">
              {{ monster }}
            </li>
          </ul>
        </div>
        
        <button class="explore-btn" @click="enterArea(selectedAreaData)">
          进入区域
        </button>
      </div>
    </div>
    
    <!-- 游戏场景 - ARPG风格的游戏界面 -->
    <div v-else class="game-scene">
      <!-- Phaser游戏容器 -->
      <div id="game-container" class="game-container"></div>
      
      <!-- 界面元素 -->
      <div class="game-ui">
        <!-- 角色状态 -->
        <div class="player-status">
          <div class="player-info">
            <span class="player-name">{{ character.name }}</span>
            <span class="player-level">Lv.{{ character.level }}</span>
          </div>
          <div class="health-bar">
            <div 
              class="health-fill" 
              :style="{ width: `${(character.derivedAttributes.currentHealth / character.derivedAttributes.maxHealth) * 100}%` }"
            ></div>
            <span class="health-text">{{ Math.floor(character.derivedAttributes.currentHealth) }}/{{ Math.floor(character.derivedAttributes.maxHealth) }}</span>
          </div>
          <div class="mana-bar">
            <div 
              class="mana-fill" 
              :style="{ width: `${(character.derivedAttributes.currentMana / character.derivedAttributes.maxMana) * 100}%` }"
            ></div>
            <span class="mana-text">{{ Math.floor(character.derivedAttributes.currentMana) }}/{{ Math.floor(character.derivedAttributes.maxMana) }}</span>
          </div>
        </div>
        
        <!-- 技能栏 -->
        <div class="skill-bar">
          <div class="skill-slot" v-for="n in 5" :key="n">
            <div class="skill-icon">{{ n }}</div>
            <div class="skill-key">{{ n }}</div>
          </div>
        </div>
        
        <!-- 退出按钮 -->
        <button class="exit-btn" @click="exitArea">
          返回世界地图
        </button>
      </div>
      
      <!-- 战斗日志 -->
      <div class="combat-log">
        <div v-for="(log, index) in combatLogs" :key="index" class="log-entry">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useCharacterStore } from '@/stores/character';
import { useRouter } from 'vue-router';
import { monsterService } from '@/services/MonsterService';
import type { Combatant } from '@/types/combat';
import Phaser from 'phaser';

// 导入GameScene
const GameScene = () => import('@/game/scenes/GameScene').then(m => m.default);

const characterStore = useCharacterStore();
const router = useRouter();
const character = characterStore.currentCharacter;

// 游戏状态
const activeArea = ref(null);
const gameInstance = ref<Phaser.Game | null>(null);
const combatLogs = ref<string[]>([]);

// 区域管理
const selectedArea = ref('');
const selectedAreaData = computed(() => {
  return availableAreas.value.find(area => area.id === selectedArea.value);
});

// 区域数据
const availableAreas = ref([
  {
    id: 'strand',
    name: '海岸',
    level: 1,
    position: { x: 30, y: 40 },
    description: '离开流放地后的第一片区域，有少量敌人巡逻。',
    monsters: ['史莱姆', '巨鼠', '僵尸'],
    monsterIds: ['slime', 'rat', 'zombie'],
    background: 'beach',
    music: 'beach_ambient'
  },
  {
    id: 'forest',
    name: '迷雾森林',
    level: 3,
    position: { x: 50, y: 30 },
    description: '充满迷雾的森林，隐藏着许多危险生物。',
    monsters: ['野狼', '大蜘蛛', '骷髅'],
    monsterIds: ['wolf', 'spider', 'skeleton'],
    background: 'forest',
    music: 'forest_ambient'
  },
  {
    id: 'caves',
    name: '黑暗洞窟',
    level: 5,
    position: { x: 70, y: 45 },
    description: '幽深的洞窟系统，栖息着许多地下生物。',
    monsters: ['地精', '大蜘蛛', '骷髅'],
    monsterIds: ['goblin', 'spider', 'skeleton'],
    background: 'cave',
    music: 'cave_ambient'
  },
  {
    id: 'ruins',
    name: '古代遗迹',
    level: 8,
    position: { x: 60, y: 60 },
    description: '一处年代久远的遗迹，隐藏着神秘的力量。',
    monsters: ['强盗', '地精萨满', '冰原狼'],
    monsterIds: ['bandit', 'goblin_shaman', 'dire_wolf'],
    background: 'ruins',
    music: 'ruins_ambient'
  }
]);

// 选择区域
function selectArea(area: any) {
  selectedArea.value = area.id;
}

// 获取区域难度等级
function getDifficultyClass(areaLevel: number) {
  const charLevel = character?.level || 1;
  const diff = areaLevel - charLevel;
  
  if (diff >= 4) return 'very-hard';
  if (diff >= 2) return 'hard';
  if (diff >= -1) return 'normal';
  return 'easy';
}

// 获取难度标签
function getDifficultyLabel(areaLevel: number) {
  const charLevel = character?.level || 1;
  const diff = areaLevel - charLevel;
  
  if (diff >= 4) return '极难';
  if (diff >= 2) return '困难';
  if (diff >= -1) return '普通';
  return '简单';
}

// 进入选中的区域
async function enterArea(area: any) {
  if (!area) return;
  
  activeArea.value = area;
  combatLogs.value = [`进入 ${area.name}...`];
  
  // 在下一个循环创建游戏实例，确保DOM已更新
  setTimeout(async () => {
    await initGame(area);
  }, 0);
}

// 退出当前区域
function exitArea() {
  if (gameInstance.value) {
    gameInstance.value.destroy(true);
    gameInstance.value = null;
  }
  
  activeArea.value = null;
  combatLogs.value = [];
}

// 初始化Phaser游戏
async function initGame(area: any) {
  if (!character) return;

  // 动态导入GameScene
  const SceneClass = await GameScene();

  // 游戏配置
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [SceneClass]
  };

  // 创建游戏实例
  gameInstance.value = new Phaser.Game(config);
  
  // 等待游戏加载完成
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 获取场景
  try {
    const scene = gameInstance.value.scene.getScene('GameScene');
    
    if (scene) {
      // 设置场景数据
      scene.scene.restart({
        area: area,
        enemies: area.monsterIds
      });
      
      // 监听游戏事件
      // @ts-ignore
      const events = scene.getEventEmitter();
      
      // 监听场景创建事件
      events.on('scene-created', (data: any) => {
        combatLogs.value.push(`加载完成，准备探索 ${data.areaName}`);
        combatLogs.value.push(`区域中有 ${data.enemyCount} 个敌人`);
      });
      
      // 监听敌人生成事件
      events.on('enemies-spawned', (data: any) => {
        combatLogs.value.push(`遭遇了 ${data.count} 个怪物！`);
      });
      
      // 监听攻击事件
      events.on('enemy-hit', (data: any) => {
        combatLogs.value.push(`你击中了 ${data.enemyName}，造成 ${data.damage} 点伤害！`);
      });
      
      // 监听玩家受击事件
      events.on('player-hit', (data: any) => {
        combatLogs.value.push(`${data.enemyName} 攻击了你，造成 ${data.damage} 点伤害！`);
        
        // 更新角色生命值
        if (character) {
          character.derivedAttributes.currentHealth = Math.max(
            0, 
            character.derivedAttributes.currentHealth - data.damage
          );
          
          // 检查角色是否死亡
          if (character.derivedAttributes.currentHealth <= 0) {
            combatLogs.value.push('你已经死亡！即将返回世界地图...');
            setTimeout(() => {
              exitArea();
            }, 3000);
          }
        }
      });
      
      // 监听击杀事件
      events.on('enemy-killed', (data: any) => {
        combatLogs.value.push(`你击败了 ${data.enemyName}！`);
        
        // 更新经验值
        const exp = 10 + data.enemyLevel * 5;
        characterStore.addExperience(exp);
        combatLogs.value.push(`获得 ${exp} 点经验值！`);
      });
      
      // 监听区域清理事件
      events.on('area-cleared', () => {
        combatLogs.value.push('区域已清理完毕！');
      });
      
      // 监听掉落物事件
      events.on('loot-dropped', (data: any) => {
        const itemsList = data.items.map((item: any) => `${item.name} x${item.quantity}`).join(', ');
        combatLogs.value.push(`获得战利品: ${itemsList}`);
      });
      
      // 监听技能使用事件
      events.on('skill-used', (data: any) => {
        combatLogs.value.push(`使用了技能 ${data.skillIndex}`);
      });
      
      // 监听攻击未命中事件
      events.on('attack-missed', () => {
        combatLogs.value.push('你的攻击没有命中任何目标！');
      });
    }
  } catch (error) {
    console.error('获取场景时出错:', error);
    combatLogs.value.push('游戏加载出错，请尝试重新进入区域。');
  }
}

// 游戏说明
function showGameHelp() {
  combatLogs.value = [
    "ARPG操作说明:",
    "- 点击地面: 移动角色",
    "- 右键点击: 普通攻击",
    "- 空格键: 向前攻击",
    "- 数字键1-5: 使用技能",
    "- 方向键: 移动角色",
    "击败所有怪物以清理区域!"
  ];
}

// 生命周期钩子
onMounted(() => {
  // 显示游戏操作说明
  showGameHelp();
});

// 清理
onBeforeUnmount(() => {
  if (gameInstance.value) {
    gameInstance.value.destroy(true);
  }
});
</script>

<style scoped>
.game-map {
  @apply max-w-5xl mx-auto relative;
}

.page-title {
  @apply text-2xl font-bold text-yellow-400 mb-6;
}

/* 世界地图 */
.world-map {
  @apply bg-gray-800 rounded-lg h-96 relative mb-8;
  @apply border-2 border-gray-700;
  background-image: url('/assets/map-background.jpg');
  background-size: cover;
  background-position: center;
}

.map-area {
  @apply absolute w-12 h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply transform -translate-x-1/2 -translate-y-1/2;
  @apply cursor-pointer transition-all duration-200;
  @apply border-2;
}

.area-available {
  @apply bg-gray-700 border-gray-500;
  @apply hover:bg-gray-600 hover:border-yellow-500;
}

.area-selected {
  @apply bg-blue-700 border-yellow-400;
  @apply hover:bg-blue-600;
}

.area-icon {
  @apply text-xl font-bold text-white;
}

/* 区域详情 */
.area-details {
  @apply bg-gray-800 rounded-lg p-6 absolute bottom-8 left-8 right-8;
  @apply border border-gray-700;
}

.area-header {
  @apply flex flex-wrap items-center gap-4 mb-4;
}

.area-header h2 {
  @apply text-xl font-bold text-yellow-300;
}

.area-level {
  @apply text-gray-400 text-sm;
}

.area-level span {
  @apply text-white font-medium;
}

.area-difficulty {
  @apply px-2 py-1 rounded text-xs font-bold;
}

.area-difficulty.easy {
  @apply bg-green-800 text-green-200;
}

.area-difficulty.normal {
  @apply bg-blue-800 text-blue-200;
}

.area-difficulty.hard {
  @apply bg-orange-800 text-orange-200;
}

.area-difficulty.very-hard {
  @apply bg-red-800 text-red-200;
}

.area-description {
  @apply text-gray-300 mb-4;
}

.monsters-section h3 {
  @apply text-lg font-bold mb-2;
}

.monster-list {
  @apply list-disc pl-5 mb-6;
}

.monster-list li {
  @apply text-gray-300;
}

.explore-btn {
  @apply w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded;
  @apply transition-colors font-medium text-lg;
}

/* 游戏场景 */
.game-scene {
  @apply relative;
}

.game-container {
  @apply h-[600px] bg-gray-900 rounded-lg overflow-hidden;
  @apply border-2 border-gray-700;
}

/* 游戏UI */
.game-ui {
  @apply absolute top-0 left-0 right-0 p-4;
  @apply flex justify-between items-start;
  pointer-events: none;
}

.player-status {
  @apply bg-gray-900 bg-opacity-70 rounded p-2;
  @apply flex flex-col gap-1 w-52;
}

.player-info {
  @apply flex justify-between mb-1;
}

.player-name {
  @apply font-bold text-white;
}

.player-level {
  @apply text-yellow-400 font-medium;
}

.health-bar, .mana-bar {
  @apply w-full h-4 rounded bg-gray-800 relative overflow-hidden;
}

.health-fill {
  @apply absolute inset-0 bg-red-600 origin-left;
  height: 100%;
}

.mana-fill {
  @apply absolute inset-0 bg-blue-600 origin-left;
  height: 100%;
}

.health-text, .mana-text {
  @apply absolute inset-0 flex items-center justify-center text-xs text-white font-medium;
}

/* 技能栏 */
.skill-bar {
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
  @apply flex gap-2;
  pointer-events: all;
}

.skill-slot {
  @apply w-12 h-12 bg-gray-800 bg-opacity-80 rounded relative;
  @apply flex items-center justify-center;
  @apply border border-gray-600;
}

.skill-icon {
  @apply text-xl text-gray-400;
}

.skill-key {
  @apply absolute -bottom-1 -right-1 w-5 h-5;
  @apply bg-gray-700 rounded-full text-xs;
  @apply flex items-center justify-center text-white;
}

/* 退出按钮 */
.exit-btn {
  @apply bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded;
  @apply transition-colors;
  pointer-events: all;
}

/* 战斗日志 */
.combat-log {
  @apply absolute bottom-4 left-4 w-60 h-40;
  @apply bg-gray-900 bg-opacity-70 rounded p-2;
  @apply overflow-y-auto text-sm;
}

.log-entry {
  @apply text-gray-300 mb-1;
}
</style> 