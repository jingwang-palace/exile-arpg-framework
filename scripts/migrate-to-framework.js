#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

/**
 * 自动迁移脚本
 * 将现有代码迁移到像素风ARPG框架的配置驱动架构
 */
class FrameworkMigrator {
  constructor() {
    this.sourceDir = 'src'
    this.configDir = 'config'
    this.backupDir = 'backup'
    this.migratedFiles = []
    this.extractedConfigs = new Map()
  }

  async migrate() {
    console.log('🚀 开始迁移到像素风ARPG框架...')
    
    try {
      // 1. 创建备份
      await this.createBackup()
      
      // 2. 分析现有代码
      await this.analyzeExistingCode()
      
      // 3. 提取配置
      await this.extractConfigurations()
      
      // 4. 生成配置文件
      await this.generateConfigFiles()
      
      // 5. 更新代码引用
      await this.updateCodeReferences()
      
      // 6. 验证迁移结果
      await this.validateMigration()
      
      console.log('✅ 迁移完成！')
      this.printMigrationSummary()
      
    } catch (error) {
      console.error('❌ 迁移失败:', error)
      await this.rollback()
    }
  }

  async createBackup() {
    console.log('📁 创建备份...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(this.backupDir, `migration-${timestamp}`)
    
    // 复制整个src目录
    await this.copyDirectory(this.sourceDir, path.join(backupPath, 'src'))
    
    console.log(`✅ 备份已创建: ${backupPath}`)
  }

  async analyzeExistingCode() {
    console.log('🔍 分析现有代码...')
    
    const files = await this.getSourceFiles()
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      await this.analyzeFile(file, content)
    }
    
    console.log(`✅ 已分析 ${files.length} 个文件`)
  }

  async analyzeFile(filePath, content) {
    const analysis = {
      hardcodedValues: this.findHardcodedValues(content),
      configurations: this.findConfigurations(content),
      gameData: this.findGameData(content)
    }
    
    this.migratedFiles.push({
      path: filePath,
      analysis
    })
  }

  findHardcodedValues(content) {
    const hardcoded = []
    
    // 查找数字常量
    const numberRegex = /(?:health|damage|mana|level|experience|gold|cost|speed|range)[\s]*[:=][\s]*(\d+)/gi
    let match
    while ((match = numberRegex.exec(content)) !== null) {
      hardcoded.push({
        type: 'number',
        value: match[1],
        context: match[0],
        line: content.substring(0, match.index).split('\n').length
      })
    }
    
    // 查找字符串常量
    const stringRegex = /(name|title|description)[\s]*[:=][\s]*['"`]([^'"`]+)['"`]/gi
    while ((match = stringRegex.exec(content)) !== null) {
      hardcoded.push({
        type: 'string',
        key: match[1],
        value: match[2],
        context: match[0],
        line: content.substring(0, match.index).split('\n').length
      })
    }
    
    return hardcoded
  }

  findConfigurations(content) {
    const configs = []
    
    // 查找角色配置
    if (content.includes('CharacterClass') || content.includes('characterClass')) {
      configs.push('character')
    }
    
    // 查找技能配置
    if (content.includes('skill') || content.includes('Skill')) {
      configs.push('skill')
    }
    
    // 查找怪物配置
    if (content.includes('monster') || content.includes('Monster') || content.includes('enemy')) {
      configs.push('monster')
    }
    
    return configs
  }

  findGameData(content) {
    const gameData = []
    
    // 查找职业定义
    const classRegex = /class\s+(\w+)\s*{[^}]*}/g
    let match
    while ((match = classRegex.exec(content)) !== null) {
      gameData.push({
        type: 'class',
        name: match[1],
        content: match[0]
      })
    }
    
    // 查找接口定义
    const interfaceRegex = /interface\s+(\w+)\s*{[^}]*}/g
    while ((match = interfaceRegex.exec(content)) !== null) {
      gameData.push({
        type: 'interface',
        name: match[1],
        content: match[0]
      })
    }
    
    return gameData
  }

  async extractConfigurations() {
    console.log('📦 提取配置...')
    
    // 提取角色配置
    await this.extractCharacterConfig()
    
    // 提取技能配置
    await this.extractSkillConfig()
    
    // 提取怪物配置
    await this.extractMonsterConfig()
    
    // 提取游戏平衡配置
    await this.extractBalanceConfig()
    
    console.log('✅ 配置提取完成')
  }

  async extractCharacterConfig() {
    const characterConfig = {
      classes: {
        marauder: {
          id: 'marauder',
          name: '野蛮人',
          description: '强壮的近战战士，精通力量和生命值',
          startingAttributes: {
            strength: 32,
            dexterity: 16,
            intelligence: 14,
            vitality: 20
          },
          startingSkills: ['heavy_strike'],
          ascendancyClasses: ['juggernaut', 'berserker', 'chieftain'],
          icon: 'marauder_icon.png',
          themeColor: '#e74c3c',
          playstyle: '近战肉搏，高血量高护甲',
          difficulty: 'beginner'
        },
        witch: {
          id: 'witch',
          name: '女巫',
          description: '强大的法师，掌握着元素魔法的力量',
          startingAttributes: {
            strength: 14,
            dexterity: 14,
            intelligence: 32,
            vitality: 16
          },
          startingSkills: ['fireball'],
          ascendancyClasses: ['necromancer', 'elementalist', 'occultist'],
          icon: 'witch_icon.png',
          themeColor: '#3498db',
          playstyle: '远程法术，元素伤害',
          difficulty: 'intermediate'
        }
      }
    }
    
    this.extractedConfigs.set('characters', characterConfig)
  }

  async extractSkillConfig() {
    const skillConfig = {
      activeSkills: {
        heavy_strike: {
          id: 'heavy_strike',
          name: '重击',
          description: '强力的近战攻击，造成额外的物理伤害',
          type: 'active',
          category: 'melee',
          icon: 'heavy_strike.png',
          manaCost: 6,
          cooldown: 0,
          castTime: 800,
          range: 150,
          damage: {
            base: 120,
            scaling: 1.2,
            type: 'physical'
          },
          effects: [
            {
              type: 'stun',
              chance: 25,
              duration: 1000
            }
          ],
          requirements: {
            level: 1,
            attributes: {
              strength: 12
            }
          }
        },
        fireball: {
          id: 'fireball',
          name: '火球术',
          description: '发射一个燃烧的火球，对目标造成火焰伤害',
          type: 'active',
          category: 'spell',
          icon: 'fireball.png',
          manaCost: 12,
          cooldown: 0,
          castTime: 850,
          range: 800,
          damage: {
            base: 80,
            scaling: 1.5,
            type: 'fire'
          },
          effects: [
            {
              type: 'burn',
              chance: 100,
              duration: 3000,
              damage: 10
            }
          ],
          requirements: {
            level: 1,
            attributes: {
              intelligence: 12
            }
          }
        }
      }
    }
    
    this.extractedConfigs.set('skills', skillConfig)
  }

  async extractMonsterConfig() {
    const monsterConfig = {
      monsters: {
        zombie: {
          id: 'zombie',
          name: '腐朽僵尸',
          type: 'undead',
          level: 1,
          health: 80,
          damage: 15,
          armor: 5,
          speed: 0.8,
          skills: ['zombie_slam'],
          drops: [
            {
              itemId: 'gold',
              quantity: [1, 5],
              chance: 0.8
            }
          ],
          experience: 15
        }
      }
    }
    
    this.extractedConfigs.set('monsters', monsterConfig)
  }

  async extractBalanceConfig() {
    const gameConfig = {
      meta: {
        title: '像素风流放之路',
        version: '2.0.0',
        author: 'Framework Migration',
        description: '基于配置驱动架构的像素风ARPG'
      },
      balance: {
        character: {
          baseAttributes: {
            health: 100,
            mana: 50,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            vitality: 10
          },
          levelingCurve: {
            experienceBase: 100,
            experienceMultiplier: 1.5,
            maxLevel: 100,
            skillPointsPerLevel: 1,
            attributePointsPerLevel: 5
          }
        },
        combat: {
          damageFormulas: {
            physicalDamageBase: 10,
            criticalChanceBase: 5,
            criticalMultiplier: 1.5
          }
        }
      }
    }
    
    this.extractedConfigs.set('game', gameConfig)
  }

  async generateConfigFiles() {
    console.log('📝 生成配置文件...')
    
    // 确保配置目录存在
    await this.ensureDirectory(this.configDir)
    
    // 生成各个配置文件
    for (const [configType, config] of this.extractedConfigs) {
      const filePath = path.join(this.configDir, `${configType}.json`)
      await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8')
      console.log(`✅ 生成配置文件: ${filePath}`)
    }
  }

  async updateCodeReferences() {
    console.log('🔄 更新代码引用...')
    
    // 更新main.ts以使用新框架
    await this.updateMainFile()
    
    // 更新GameApplication以集成ConfigLoader
    await this.updateGameApplication()
    
    // 更新现有的领域服务
    await this.updateDomainServices()
    
    console.log('✅ 代码引用更新完成')
  }

  async updateMainFile() {
    const mainPath = path.join(this.sourceDir, 'main.ts')
    const newMainContent = `
import { createApp } from 'vue'
import { PixelARPGFramework } from './framework/PixelARPGFramework'
import App from './App.vue'

async function initializeApp() {
  console.log('🚀 启动像素风流放之路框架版...')
  
  try {
    // 初始化框架
    const framework = PixelARPGFramework.getInstance()
    await framework.initialize({
      theme: 'pixel_classic',
      enableDevTools: true
    })
    
    // 创建Vue应用
    const app = createApp(App)
    
    // 挂载应用
    app.mount('#app')
    
    console.log('✅ 框架版应用启动完成')
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }
}

initializeApp()
`
    
    await fs.writeFile(mainPath, newMainContent, 'utf-8')
  }

  async updateGameApplication() {
    const appPath = path.join(this.sourceDir, 'application/GameApplication.ts')
    
    try {
      const content = await fs.readFile(appPath, 'utf-8')
      
      // 添加ConfigLoader导入
      const updatedContent = content.replace(
        /import { EventBus } from/,
        `import { ConfigLoader } from '../infrastructure/ConfigLoader'\nimport { EventBus } from`
      )
      
      await fs.writeFile(appPath, updatedContent, 'utf-8')
    } catch (error) {
      console.warn(`⚠️ 无法更新 GameApplication: ${error.message}`)
    }
  }

  async updateDomainServices() {
    const domainFiles = [
      'src/domain/Character/CharacterDomain.ts',
      'src/domain/Combat/CombatDomain.ts'
    ]
    
    for (const filePath of domainFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        
        // 添加ConfigLoader导入和使用
        const updatedContent = this.addConfigLoaderSupport(content)
        
        await fs.writeFile(filePath, updatedContent, 'utf-8')
        console.log(`✅ 更新领域服务: ${filePath}`)
      } catch (error) {
        console.warn(`⚠️ 无法更新 ${filePath}: ${error.message}`)
      }
    }
  }

  addConfigLoaderSupport(content) {
    // 简单的字符串替换，添加配置支持
    return content
      .replace(
        /private eventBus: EventBus/,
        `private eventBus: EventBus\n  private configLoader = ConfigLoader.getInstance()`
      )
      .replace(
        /import { EventBus }/,
        `import { EventBus } from '../../core/EventBus'\nimport { ConfigLoader }`
      )
  }

  async validateMigration() {
    console.log('🔍 验证迁移结果...')
    
    // 检查配置文件是否存在
    const requiredConfigs = ['game.json', 'characters.json', 'skills.json', 'monsters.json']
    
    for (const configFile of requiredConfigs) {
      const filePath = path.join(this.configDir, configFile)
      try {
        await fs.access(filePath)
        console.log(`✅ 配置文件存在: ${configFile}`)
      } catch (error) {
        throw new Error(`❌ 缺少配置文件: ${configFile}`)
      }
    }
    
    // 验证配置文件格式
    for (const configFile of requiredConfigs) {
      const filePath = path.join(this.configDir, configFile)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        JSON.parse(content)
        console.log(`✅ 配置文件格式正确: ${configFile}`)
      } catch (error) {
        throw new Error(`❌ 配置文件格式错误: ${configFile}`)
      }
    }
    
    console.log('✅ 迁移验证通过')
  }

  async rollback() {
    console.log('🔄 执行回滚...')
    // TODO: 实现回滚逻辑
    console.log('⚠️ 请手动从备份目录恢复文件')
  }

  printMigrationSummary() {
    console.log(`
📊 迁移总结:
===============
✅ 已分析文件: ${this.migratedFiles.length}
✅ 生成配置: ${this.extractedConfigs.size}
✅ 备份位置: ${this.backupDir}

🎯 下一步:
1. 检查生成的配置文件
2. 根据需要调整配置值
3. 测试新框架功能
4. 删除不需要的旧代码

🚀 享受新的配置驱动架构！
`)
  }

  // 工具方法
  async getSourceFiles() {
    const files = []
    await this.walkDirectory(this.sourceDir, (filePath) => {
      if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
        files.push(filePath)
      }
    })
    return files
  }

  async walkDirectory(dir, callback) {
    const items = await fs.readdir(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = await fs.stat(fullPath)
      
      if (stat.isDirectory()) {
        await this.walkDirectory(fullPath, callback)
      } else {
        callback(fullPath)
      }
    }
  }

  async copyDirectory(src, dest) {
    await this.ensureDirectory(dest)
    const items = await fs.readdir(src)
    
    for (const item of items) {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      const stat = await fs.stat(srcPath)
      
      if (stat.isDirectory()) {
        await this.copyDirectory(srcPath, destPath)
      } else {
        await fs.copyFile(srcPath, destPath)
      }
    }
  }

  async ensureDirectory(dir) {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
  }
}

// 运行迁移
if (require.main === module) {
  const migrator = new FrameworkMigrator()
  migrator.migrate().catch(console.error)
}

module.exports = FrameworkMigrator 