# 🎮 流放ARPG框架使用指南

## 📖 概述

流放ARPG框架是一个高度可配置的游戏开发框架，支持通过JSON配置文件快速定制游戏内容、平衡性和外观。所有游戏机制都通过配置驱动，方便开发者快速创建不同风格的ARPG游戏。

## ⚡ 快速开始

### 1. 初始化框架

```typescript
import { PixelARPGFramework } from './src/framework/PixelARPGFramework'

// 创建框架实例
const framework = PixelARPGFramework.getInstance()

// 初始化框架
await framework.initialize({
  theme: 'pixel_dark',           // 使用像素风暗色主题
  mods: ['enhanced_drops'],      // 启用掉落增强MOD
  enableDevTools: true          // 启用开发者工具
})

// 创建游戏实例
const game = await framework.createGame({
  title: '我的像素ARPG',
  enableAutoSave: true,
  saveInterval: 30000           // 30秒自动保存
})

// 启动游戏
await game.start()
```

### 2. 基本游戏流程

```typescript
import { useGameApp } from './src/presentation/vue/composables/useGameApp'

// 在Vue组件中使用
const {
  createCharacter,
  currentCharacter,
  gainExperience,
  useSkill
} = useGameApp()

// 创建角色
const character = await createCharacter('勇者', 'marauder')

// 获得经验
gainExperience(100)

// 使用技能
useSkill('heavy_strike', 'enemy_id')
```

## 🔧 配置系统

### 配置文件结构

```
config/
├── game.json           # 游戏主配置
├── characters.json     # 角色职业配置
├── skills.json         # 技能配置
├── monsters.json       # 怪物配置
├── equipment.json      # 装备配置
├── quests.json         # 任务配置
├── maps.json          # 地图配置
├── audio.json         # 音频配置
└── localization.json  # 本地化配置
```

### 核心配置类型

#### 1. 角色配置
```json
{
  "classes": {
    "marauder": {
      "name": "野蛮人",
      "startingAttributes": {
        "strength": 32,
        "dexterity": 16,
        "intelligence": 14,
        "vitality": 20
      },
      "startingSkills": ["heavy_strike"],
      "ascendancyClasses": ["juggernaut", "berserker"],
      "playstyle": "近战肉搏，高血量高护甲",
      "difficulty": "beginner"
    }
  }
}
```

#### 2. 技能配置
```json
{
  "activeSkills": {
    "fireball": {
      "name": "火球术",
      "manaCost": 12,
      "damage": {
        "base": 80,
        "scaling": 1.5,
        "type": "fire"
      },
      "effects": [
        {
          "type": "burn",
          "duration": 3000,
          "chance": 100
        }
      ]
    }
  }
}
```

#### 3. 平衡性配置
```json
{
  "balance": {
    "character": {
      "levelingCurve": {
        "experienceBase": 100,
        "experienceMultiplier": 1.5,
        "maxLevel": 100
      }
    },
    "combat": {
      "damageFormulas": {
        "criticalMultiplier": 1.5,
        "armorReduction": 0.1
      }
    }
  }
}
```

## 🎨 主题系统

### 创建自定义主题

1. **创建主题配置文件**
```json
// themes/cyberpunk.json
{
  "name": "赛博朋克",
  "colors": {
    "primary": "#00ffff",
    "secondary": "#ff00ff",
    "background": "#0a0a0a"
  },
  "fonts": {
    "primary": "Orbitron, sans-serif"
  },
  "effects": {
    "neon": true,
    "glitch": true
  }
}
```

2. **应用主题**
```typescript
await framework.changeTheme('cyberpunk')
```

### 内置主题

- `pixel_classic` - 经典像素风格
- `pixel_dark` - 暗色像素风格
- `modern` - 现代UI风格
- `fantasy` - 奇幻风格

## 🔧 MOD系统

### 创建MOD

1. **MOD配置文件**
```json
// mods/enhanced_drops/config.json
{
  "id": "enhanced_drops",
  "name": "增强掉落",
  "version": "1.0.0",
  "configOverrides": {
    "balance.economy.currency.goldDropRate": 1.5,
    "balance.economy.currency.currencyDropRates.chaos_orb": 0.1
  }
}
```

2. **加载MOD**
```typescript
await framework.loadMod('enhanced_drops')
```

### MOD类型

- **平衡性MOD** - 修改游戏数值
- **内容MOD** - 添加新职业、技能、怪物
- **视觉MOD** - 改变游戏外观
- **功能MOD** - 添加新功能

## 💾 数据管理

### 配置热重载

```typescript
// 开发过程中实时重载配置
await framework.reloadConfigs()
```

### 游戏数据导出/导入

```typescript
// 导出完整游戏数据
const gameData = await framework.exportGame()

// 导入游戏数据
await framework.importGame(gameData)
```

## 🛠️ 开发工具

### 浏览器控制台工具

启用开发者工具后，可在浏览器控制台使用：

```javascript
// 获取框架信息
PixelARPGFramework.getInfo()

// 切换主题
PixelARPGFramework.changeTheme('cyberpunk')

// 重载配置
PixelARPGFramework.reloadConfigs()

// 加载MOD
PixelARPGFramework.loadMod('debug_mode')
```

### 配置验证

框架会自动验证配置文件的完整性：

```typescript
// 验证角色起始技能是否存在
// 验证装备需求是否合理
// 验证怪物掉落配置
```

## 📱 响应式设计

### 屏幕适配

```json
{
  "ui": {
    "responsive": {
      "breakpoints": {
        "mobile": 768,
        "tablet": 1024,
        "desktop": 1440
      }
    }
  }
}
```

### UI组件

```vue
<template>
  <PixelButton 
    :theme="currentTheme"
    @click="handleClick"
  >
    {{ $t('ui.start_game') }}
  </PixelButton>
</template>
```

## 🌐 国际化

### 语言配置

```json
{
  "languages": {
    "zh-CN": {
      "name": "简体中文",
      "translations": {
        "character.marauder": "野蛮人",
        "skill.fireball": "火球术"
      }
    },
    "en-US": {
      "name": "English",
      "translations": {
        "character.marauder": "Marauder",
        "skill.fireball": "Fireball"
      }
    }
  }
}
```

## 🎯 扩展开发

### 添加新职业

1. **在characters.json中添加配置**
```json
{
  "classes": {
    "your_class": {
      "name": "你的职业",
      "startingAttributes": {...},
      "startingSkills": [...],
      "ascendancyClasses": [...]
    }
  }
}
```

2. **添加相关资源**
- 角色图标
- 技能图标
- 升华职业图标

### 添加新技能

1. **在skills.json中添加配置**
2. **实现技能效果逻辑**
3. **添加技能动画和音效**

### 创建新怪物

1. **在monsters.json中添加配置**
2. **设计AI行为模式**
3. **添加精灵图和动画**

## 🚀 性能优化

### 配置优化建议

- 合理设置怪物数量和刷新频率
- 优化技能效果的粒子数量
- 控制同屏最大物品数量
- 使用对象池管理频繁创建的对象

### 内存管理

- 及时清理不需要的资源
- 使用精灵图集减少纹理内存
- 优化音频文件大小和格式

## 📊 性能监控

```typescript
// 获取性能统计
const stats = framework.getFrameworkInfo().performance
console.log(`FPS: ${stats.fps}, 内存: ${stats.memoryUsage}MB`)
```

## 🧪 测试和调试

### 配置测试

```typescript
// 验证配置完整性
const isValid = await configLoader.validateAll()

// 测试特定功能
const character = testUtils.createTestCharacter('marauder')
const damage = combatDomain.calculateDamage(character, monster)
```

### 调试工具

- 配置文件语法检查
- 实时配置编辑器
- 游戏状态查看器
- 性能分析器

## 📦 部署和分发

### 构建配置

```typescript
// 生产环境构建
npm run build

// 打包资源
npm run package

// 生成发布版本
npm run release
```

### 版本管理

- 配置文件版本控制
- MOD兼容性检查
- 存档向前兼容性

## 🤝 社区和支持

### 分享内容

- 分享自定义主题
- 发布MOD作品
- 贡献配置模板

### 获取帮助

- 查看示例项目
- 参考API文档
- 加入开发者社区

---

## 🎉 开始创造你的像素ARPG世界！

这个框架为你提供了创建独特ARPG游戏所需的所有工具。通过简单的配置修改，你就能创造出完全不同风格和玩法的游戏体验。

**让创意自由发挥，打造属于你的像素世界！** 🌟 