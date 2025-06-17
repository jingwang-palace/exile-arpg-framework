import Phaser from 'phaser';

// 直接创建新场景
class CharacterSelectStub extends Phaser.Scene {
  constructor() {
    super('CharacterSelectStub');
  }
  
  create() {
    this.add.text(640, 460, '角色选择页面加载中...', {
      color: '#ffffff',
      fontSize: '24px'
    }).setOrigin(0.5);
  }
}

class TownSceneStub extends Phaser.Scene {
  constructor() {
    super('TownSceneStub');
  }
  
  create() {
    this.add.text(640, 460, '尝试加载游戏...', {
      color: '#ffffff',
      fontSize: '24px'
    }).setOrigin(0.5);
  }
}

class GameSceneStub extends Phaser.Scene {
  constructor() {
    super('GameSceneStub');
  }
  
  create() {
    this.add.text(640, 460, '游戏场景加载中...', {
      color: '#ffffff',
      fontSize: '24px'
    }).setOrigin(0.5);
  }
}

// 配置游戏
const config = {
  type: Phaser.AUTO,
  width: 1280,     // 从1024增加到1280
  height: 920,     // 从768增加到920
  parent: 'game-container',
  pixelArt: true,
  dom: {
    createContainer: true  // 启用DOM支持，用于创建HTML元素
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  // 禁用默认音频系统，避免音频上下文错误
  audio: {
    noAudio: true
  },
  scene: [CharacterSelectStub, TownSceneStub, GameSceneStub]
};

// 模块级变量存储游戏实例
let gameInstance: Phaser.Game | null = null;

// 导出游戏工厂函数
export default {
  // 创建新游戏
  create: function() {
    try {
      console.log('创建游戏实例');
      if (gameInstance) {
        console.log('销毁旧游戏实例');
        gameInstance.destroy(true);
        gameInstance = null;
      }
      
      console.log('初始化新游戏实例');
      gameInstance = new Phaser.Game(config);
      console.log('游戏实例创建成功');
      
      // 加载真实场景
      this.loadRealScenes();
      
      return gameInstance;
    } catch (error) {
      console.error('创建游戏实例失败:', error);
      return null;
    }
  },
  
  // 获取游戏实例
  getInstance: function() {
    return gameInstance;
  },
  
  // 加载真实场景
  loadRealScenes: async function() {
    if (!gameInstance) return;
    
    try {
      // 动态导入真实场景
      const TownSceneModule = await import('./scenes/TownScene');
      const CharacterSelectModule = await import('./scenes/CharacterSelectScene');
      const GameSceneModule = await import('./scenes/GameScene');
      
      console.log('真实场景加载成功，准备替换');
      
      // 在游戏启动后添加真实场景
      gameInstance.scene.add('CharacterSelectScene', CharacterSelectModule.default);
      gameInstance.scene.add('TownScene', TownSceneModule.default);
      gameInstance.scene.add('GameScene', GameSceneModule.default);
      
      // 启动真实场景并停止占位场景
      gameInstance.scene.start('CharacterSelectScene');
      gameInstance.scene.stop('CharacterSelectStub');
      gameInstance.scene.stop('TownSceneStub');
      gameInstance.scene.stop('GameSceneStub');
      
      console.log('已启动真实角色选择场景');
    } catch (error) {
      console.error('加载真实场景失败:', error);
    }
  }
}; 