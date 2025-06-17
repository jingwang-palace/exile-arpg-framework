import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import Home from '@/views/Home.vue'
import Battle from '@/views/Game/Battle.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/phaser-game'
    },
    {
      path: '/phaser-game',
      name: 'PhaserGame',
      component: () => import('@/views/Game/PhaserGame.vue')
    },
    {
      path: '/characters',
      name: 'CharacterSelect',
      component: () => import('../views/CharacterSelect.vue')
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/views/Game/Layout.vue'),
      meta: { requiresCharacter: true },
      children: [
        {
          path: '',
          name: 'GameHome',
          component: () => import('@/views/Game/Home.vue')
        },
        {
          path: 'character',
          name: 'GameCharacter',
          component: () => import('@/views/Game/Character.vue')
        },
        {
          path: 'inventory',
          name: 'GameInventory',
          component: () => import('@/views/Game/Inventory.vue')
        },
        {
          path: 'skills',
          name: 'GameSkills',
          component: () => import('@/views/Game/Skills.vue')
        },
        {
          path: 'map',
          name: 'GameMap',
          component: () => import('@/views/Game/Map.vue')
        }
      ]
    },
    {
      path: '/game/battle',
      name: 'battle',
      component: Battle
    }
  ]
})

// 添加导航守卫
router.beforeEach((to, from, next) => {
  // 如果是游戏页面，直接通过
  if (to.path === '/phaser-game') {
    next();
    return;
  }
  
  const characterStore = useCharacterStore()
  
  // 检查是否需要角色
  if (to.matched.some(record => record.meta.requiresCharacter)) {
    // 确保已选择角色
    if (!characterStore.currentCharacter) {
      next({ path: '/characters' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 