import './assets/tailwind.css'
import './styles/base.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './presentation/vue/App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'

// 新架构导入
import { GameApplication } from './application/GameApplication'
import { Game } from 'phaser'
import { DemoConfig } from './presentation/phaser/config/DemoConfig'

// 创建游戏实例
let game: Game

async function initializeApp() {
  try {
    console.log('🚀 启动像素风流放之路...')
    
    // 初始化游戏应用
    const app = GameApplication.getInstance()
    await app.initialize()
    
    // 创建Vue应用
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    
    const vueApp = createApp(App)
    
    // 将游戏实例挂载到Vue应用上
    vueApp.config.globalProperties.$game = game
    
    vueApp.use(pinia)
    vueApp.use(router)
    vueApp.use(i18n)
    
    vueApp.mount('#app')
    
    console.log('✅ 应用启动完成')
    
    // 创建游戏实例
    game = new Game(DemoConfig)
    
  } catch (error: unknown) {
    console.error('❌ 应用启动失败:', error instanceof Error ? error.message : String(error))
    
    // 显示错误信息给用户
    document.body.innerHTML = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        font-family: Arial, sans-serif;
        background: #1a1a1a;
        color: #ff6b6b;
      ">
        <div style="text-align: center;">
          <h1>游戏启动失败</h1>
          <p>请刷新页面重试，或联系开发者</p>
          <details style="margin-top: 20px; color: #999;">
            <summary>错误详情</summary>
            <pre style="text-align: left; background: #333; padding: 10px; border-radius: 5px;">
${error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    `
  }
}

// 启动应用
initializeApp()

// 导出游戏实例供其他模块使用
export { game } 