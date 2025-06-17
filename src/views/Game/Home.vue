<template>
  <div class="game-home">
    <div class="welcome">
      <h1>欢迎回来，{{ character.name }}</h1>
      <p>今天你想探索什么地方？</p>
    </div>
    
    <div class="sections">
      <!-- 当前任务 -->
      <div class="section quests">
        <h2 class="section-title">当前任务</h2>
        <div class="section-content">
          <div class="empty-state" v-if="!hasActiveQuests">
            <p>暂无任务</p>
            <button class="action-btn">寻找任务</button>
          </div>
          
          <div class="quest-list" v-else>
            <div class="quest-item" v-for="(quest, index) in activeQuests" :key="index">
              <div class="quest-name">{{ quest.name }}</div>
              <div class="quest-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${quest.progress}%` }"></div>
                </div>
                <div class="progress-text">{{ quest.progress }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 探索区域 -->
      <div class="section areas">
        <h2 class="section-title">探索区域</h2>
        <div class="section-content">
          <div class="area-grid">
            <div 
              v-for="area in availableAreas" 
              :key="area.id" 
              class="area-card"
              @click="exploreArea(area)"
            >
              <div class="area-image" :style="{ backgroundImage: `url(${area.image || '/assets/areas/placeholder.jpg'})` }"></div>
              <div class="area-info">
                <h3 class="area-name">{{ area.name }}</h3>
                <div class="area-level">区域等级: {{ area.level }}</div>
                <div class="area-description">{{ area.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 新闻通知 -->
      <div class="section news">
        <h2 class="section-title">最新消息</h2>
        <div class="section-content">
          <div class="news-item" v-for="(item, index) in newsItems" :key="index">
            <div class="news-date">{{ item.date }}</div>
            <div class="news-title">{{ item.title }}</div>
            <div class="news-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { monsterService } from '@/services/MonsterService'
import type { Monster } from '@/types/monster'
import type { CombatResult } from '@/types/combat'
import { useQuestStore } from '@/stores/quest'
import ReviveModal from '@/components/game/ReviveModal.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const character = computed(() => {
  if (!characterStore.currentCharacter) {
    router.push('/characters')
    return null
  }
  return characterStore.currentCharacter
})
const showBattle = ref(false)
const currentMonsters = ref<Monster[]>([])
const questStore = useQuestStore()

// 使用计算属性来获取任务列表
const quests = computed(() => questStore.quests)

// 检查是否有角色
if (!character) {
  router.push('/character/list')
}

// 模拟任务数据
const activeQuests = ref([
  { name: '击败海岸的暴徒', progress: 65 },
  { name: '收集10个卷轴碎片', progress: 30 }
])

const hasActiveQuests = computed(() => activeQuests.value.length > 0)

// 模拟区域数据
const availableAreas = ref([
  {
    id: 'strand',
    name: '海岸',
    level: 1,
    description: '离开流放地后的第一片区域，有少量敌人巡逻。',
    image: '/assets/areas/strand.jpg'
  },
  {
    id: 'forest',
    name: '迷雾森林',
    level: 3,
    description: '充满迷雾的森林，隐藏着许多危险生物。',
    image: '/assets/areas/forest.jpg'
  },
  {
    id: 'caves',
    name: '黑暗洞窟',
    level: 5,
    description: '幽深的洞窟系统，栖息着许多地下生物。',
    image: '/assets/areas/caves.jpg'
  }
])

// 模拟新闻数据
const newsItems = ref([
  {
    date: '2023-11-08',
    title: '游戏更新公告',
    content: '新增了3个新区域和10种新怪物，修复了多个已知问题。'
  },
  {
    date: '2023-11-05',
    title: '周末活动',
    content: '本周末所有怪物掉落率提升50%，不要错过！'
  }
])

const startExplore = () => {
  // 检查角色状态
  if (!character) {
    return
  }

  if (character.derivedAttributes.health <= 0) {
    const cooldown = characterStore.reviveCooldown
    if (cooldown > 0) {
      console.log(t('battle.death.cooldown', { time: cooldown }))
      return
    }
    // 尝试复活
    const success = characterStore.revive()
    if (!success) {
      return
    }
  }

  // 生成怪物并开始战斗
  const monsters = monsterService.generateMonsters(
    { min: 1, max: 3 },
    Math.floor(Math.random() * 2) + 1
  )
  currentMonsters.value = monsters
  showBattle.value = true
}

const closeBattle = () => {
  showBattle.value = false
  currentMonsters.value = []
}

const acceptQuest = (questId: string) => {
  const result = questStore.acceptQuest(questId)
  if (result) {
    console.log('Quest accepted:', questId)
  }
}

const completeQuest = (questId: string) => {
  questStore.completeQuest(questId)
}

// 探索区域
function exploreArea(area) {
  console.log(`探索区域: ${area.name}`)
  // TODO: 实现区域探索功能
  // 可以跳转到地图页面或打开战斗弹窗
  router.push({ name: 'GameMap', params: { areaId: area.id } })
}
</script>

<style scoped>
.game-home {
  @apply max-w-5xl mx-auto;
}

.welcome {
  @apply mb-8 text-center;
}

.welcome h1 {
  @apply text-3xl font-bold text-yellow-400 mb-2;
}

.welcome p {
  @apply text-gray-400;
}

.sections {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.section {
  @apply bg-gray-800 rounded-lg overflow-hidden;
}

.section-title {
  @apply p-4 bg-gray-700 text-lg font-bold border-b border-gray-600;
}

.section-content {
  @apply p-4;
}

.empty-state {
  @apply text-center py-6 text-gray-400;
}

.action-btn {
  @apply mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium;
  @apply transition-colors;
}

.quest-list {
  @apply space-y-4;
}

.quest-item {
  @apply bg-gray-700 p-3 rounded;
}

.quest-name {
  @apply font-medium mb-2;
}

.progress-bar {
  @apply h-2 bg-gray-600 rounded overflow-hidden;
}

.progress-fill {
  @apply h-full bg-green-500;
}

.progress-text {
  @apply text-xs text-gray-400 mt-1;
}

.area-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.area-card {
  @apply bg-gray-700 rounded overflow-hidden cursor-pointer hover:bg-gray-600;
  @apply transition-colors;
}

.area-image {
  @apply h-32 bg-center bg-cover;
}

.area-info {
  @apply p-3;
}

.area-name {
  @apply font-bold text-yellow-300 mb-1;
}

.area-level {
  @apply text-sm text-gray-400 mb-2;
}

.area-description {
  @apply text-sm text-gray-300;
}

.news {
  @apply col-span-1 md:col-span-2;
}

.news-item {
  @apply p-3 border-b border-gray-700 last:border-0;
}

.news-date {
  @apply text-xs text-gray-400 mb-1;
}

.news-title {
  @apply font-medium text-yellow-300 mb-1;
}

.news-content {
  @apply text-sm text-gray-300;
}
</style> 