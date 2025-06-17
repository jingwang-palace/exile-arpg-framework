import * as Phaser from 'phaser'
import { AscendancyQuest, AscendancyQuestObjective, AscendancyClass } from '../../types/ascendancy'

export class AscendancyQuestWindow {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Graphics
  private titleText: Phaser.GameObjects.Text
  private questList: Phaser.GameObjects.Container
  private questDetailPanel: Phaser.GameObjects.Container
  private isVisible: boolean = false
  
  // 当前显示的任务
  private selectedQuest: AscendancyQuest | null = null
  private availableQuests: AscendancyQuest[] = []
  
  // UI元素
  private questItems: Phaser.GameObjects.Container[] = []
  private detailElements: { [key: string]: Phaser.GameObjects.GameObject } = {}

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.container = scene.add.container(0, 0)
    this.questList = scene.add.container(0, 0)
    this.questDetailPanel = scene.add.container(0, 0)
    
    this.createUI()
    this.container.setVisible(false)
    this.container.setDepth(1000)
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2
    const centerY = this.scene.cameras.main.height / 2
    
    // 主背景
    this.background = this.scene.add.graphics()
    this.background.fillStyle(0x000000, 0.8)
    this.background.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height)
    this.container.add(this.background)
    
    // 窗口背景
    const windowBg = this.scene.add.graphics()
    windowBg.fillStyle(0x2a2a2a, 0.95)
    windowBg.lineStyle(2, 0x8b4513)
    windowBg.fillRoundedRect(centerX - 500, centerY - 350, 1000, 700, 10)
    windowBg.strokeRoundedRect(centerX - 500, centerY - 350, 1000, 700, 10)
    this.container.add(windowBg)
    
    // 标题
    this.titleText = this.scene.add.text(centerX, centerY - 320, '升华试炼', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    })
    this.titleText.setOrigin(0.5)
    this.container.add(this.titleText)
    
    // 副标题
    const subtitleText = this.scene.add.text(centerX, centerY - 285, '选择你的升华道路，完成专属试炼', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#CCCCCC'
    })
    subtitleText.setOrigin(0.5)
    this.container.add(subtitleText)
    
    // 任务列表区域
    this.questList.setPosition(centerX - 480, centerY - 240)
    this.container.add(this.questList)
    
    // 任务详情面板
    this.questDetailPanel.setPosition(centerX - 100, centerY - 240)
    this.container.add(this.questDetailPanel)
    
    // 关闭按钮
    const closeButton = this.scene.add.text(centerX + 460, centerY - 320, '✕', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FF6B6B',
      fontStyle: 'bold'
    })
    closeButton.setOrigin(0.5)
    closeButton.setInteractive({ useHandCursor: true })
    closeButton.on('pointerdown', () => this.hide())
    closeButton.on('pointerover', () => closeButton.setScale(1.2))
    closeButton.on('pointerout', () => closeButton.setScale(1))
    this.container.add(closeButton)
  }

  // 显示窗口
  public show(availableQuests: AscendancyQuest[]): void {
    this.availableQuests = availableQuests
    this.updateQuestList()
    this.container.setVisible(true)
    this.isVisible = true
  }

  // 隐藏窗口
  public hide(): void {
    this.container.setVisible(false)
    this.isVisible = false
  }

  // 更新任务列表
  private updateQuestList(): void {
    // 清除现有任务项
    this.questItems.forEach(item => item.destroy())
    this.questItems = []
    
    // 按升华职业分组显示
    const questsByClass = this.groupQuestsByClass(this.availableQuests)
    
    let yOffset = 0
    
    Object.entries(questsByClass).forEach(([className, quests]) => {
      // 职业标题
      const classTitle = this.createClassTitle(className, yOffset)
      this.questList.add(classTitle)
      this.questItems.push(classTitle)
      yOffset += 40
      
      // 该职业的任务
      quests.forEach(quest => {
        const questItem = this.createQuestItem(quest, yOffset)
        this.questList.add(questItem)
        this.questItems.push(questItem)
        yOffset += 80
      })
      
      yOffset += 20 // 职业间距
    })
  }

  // 按升华职业分组任务
  private groupQuestsByClass(quests: AscendancyQuest[]): { [key: string]: AscendancyQuest[] } {
    const grouped: { [key: string]: AscendancyQuest[] } = {}
    
    quests.forEach(quest => {
      const className = this.getAscendancyClassName(quest.ascendancyClass)
      if (!grouped[className]) {
        grouped[className] = []
      }
      grouped[className].push(quest)
    })
    
    return grouped
  }

  // 获取升华职业中文名称
  private getAscendancyClassName(ascendancyClass: AscendancyClass): string {
    const names: { [key in AscendancyClass]: string } = {
      [AscendancyClass.GUARDIAN]: '守护者',
      [AscendancyClass.CHAMPION]: '冠军',
      [AscendancyClass.GLADIATOR]: '角斗士',
      [AscendancyClass.ELEMENTALIST]: '元素使',
      [AscendancyClass.OCCULTIST]: '咒术师',
      [AscendancyClass.NECROMANCER]: '召唤师',
      [AscendancyClass.ASSASSIN]: '死神',
      [AscendancyClass.PATHFINDER]: '探路者',
      [AscendancyClass.BEASTMASTER]: '驯兽师'
    }
    return names[ascendancyClass] || ascendancyClass
  }

  // 创建职业标题
  private createClassTitle(className: string, yOffset: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, yOffset)
    
    // 背景
    const bg = this.scene.add.graphics()
    bg.fillStyle(0x4a4a4a, 0.8)
    bg.fillRoundedRect(0, 0, 360, 35, 5)
    container.add(bg)
    
    // 文字
    const text = this.scene.add.text(180, 17, className, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    })
    text.setOrigin(0.5)
    container.add(text)
    
    return container
  }

  // 创建任务项
  private createQuestItem(quest: AscendancyQuest, yOffset: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, yOffset)
    
    // 背景
    const bg = this.scene.add.graphics()
    bg.fillStyle(quest.isCompleted ? 0x2a5c2a : 0x3a3a3a, 0.9)
    bg.lineStyle(2, quest.isCompleted ? 0x4CAF50 : 0x8b4513)
    bg.fillRoundedRect(0, 0, 360, 75, 8)
    bg.strokeRoundedRect(0, 0, 360, 75, 8)
    container.add(bg)
    
    // 任务名称
    const nameText = this.scene.add.text(15, 15, quest.name, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: quest.isCompleted ? '#4CAF50' : '#FFFFFF',
      fontStyle: 'bold'
    })
    container.add(nameText)
    
    // 任务给予者
    const giverText = this.scene.add.text(15, 35, `任务给予者: ${quest.questGiver}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#CCCCCC'
    })
    container.add(giverText)
    
    // 任务地点
    const locationText = this.scene.add.text(15, 50, `地点: ${quest.location}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#CCCCCC'
    })
    container.add(locationText)
    
    // 状态图标
    const statusIcon = this.scene.add.text(320, 15, 
      quest.isCompleted ? '✅' : quest.isUnlocked ? '🔓' : '🔒', {
      fontSize: '20px'
    })
    statusIcon.setOrigin(0.5)
    container.add(statusIcon)
    
    // 奖励文字
    const rewardText = this.scene.add.text(220, 50, `奖励: ${quest.rewards.ascendancyPoints}升华点`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#FFD700'
    })
    container.add(rewardText)
    
    // 交互
    if (quest.isUnlocked && !quest.isCompleted) {
      bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 360, 75), Phaser.Geom.Rectangle.Contains)
      
      container.on('pointerover', () => {
        bg.clear()
        bg.fillStyle(0x4a4a4a, 0.9)
        bg.lineStyle(2, 0xFFD700)
        bg.fillRoundedRect(0, 0, 360, 75, 8)
        bg.strokeRoundedRect(0, 0, 360, 75, 8)
        
        // 显示详情
        this.showQuestDetails(quest)
      })
      
      container.on('pointerout', () => {
        bg.clear()
        bg.fillStyle(0x3a3a3a, 0.9)
        bg.lineStyle(2, 0x8b4513)
        bg.fillRoundedRect(0, 0, 360, 75, 8)
        bg.strokeRoundedRect(0, 0, 360, 75, 8)
      })
      
      container.on('pointerdown', () => {
        this.selectQuest(quest)
      })
    }
    
    return container
  }

  // 显示任务详情
  private showQuestDetails(quest: AscendancyQuest): void {
    this.selectedQuest = quest
    this.updateQuestDetails()
  }

  // 更新任务详情面板
  private updateQuestDetails(): void {
    // 清除现有详情
    Object.values(this.detailElements).forEach(element => element.destroy())
    this.detailElements = {}
    
    if (!this.selectedQuest) return
    
    const quest = this.selectedQuest
    let yOffset = 0
    
    // 详情背景
    const detailBg = this.scene.add.graphics()
    detailBg.fillStyle(0x2a2a2a, 0.95)
    detailBg.lineStyle(2, 0x8b4513)
    detailBg.fillRoundedRect(0, 0, 460, 600, 10)
    detailBg.strokeRoundedRect(0, 0, 460, 600, 10)
    this.questDetailPanel.add(detailBg)
    this.detailElements['background'] = detailBg
    
    // 任务标题
    const title = this.scene.add.text(230, 20, quest.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5, 0)
    this.questDetailPanel.add(title)
    this.detailElements['title'] = title
    yOffset += 50
    
    // 任务背景故事
    const loreTitle = this.scene.add.text(20, yOffset, '背景故事:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      fontStyle: 'bold'
    })
    this.questDetailPanel.add(loreTitle)
    this.detailElements['loreTitle'] = loreTitle
    yOffset += 25
    
    const loreText = this.scene.add.text(20, yOffset, this.wrapText(quest.lore, 50), {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      wordWrap: { width: 420 }
    })
    this.questDetailPanel.add(loreText)
    this.detailElements['lore'] = loreText
    yOffset += loreText.height + 20
    
    // 任务描述
    const descTitle = this.scene.add.text(20, yOffset, '任务描述:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      fontStyle: 'bold'
    })
    this.questDetailPanel.add(descTitle)
    this.detailElements['descTitle'] = descTitle
    yOffset += 25
    
    const descText = this.scene.add.text(20, yOffset, quest.description, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      wordWrap: { width: 420 }
    })
    this.questDetailPanel.add(descText)
    this.detailElements['description'] = descText
    yOffset += descText.height + 20
    
    // 特殊机制
    if (quest.specialMechanics && quest.specialMechanics.length > 0) {
      const mechanicsTitle = this.scene.add.text(20, yOffset, '特殊机制:', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FF9800',
        fontStyle: 'bold'
      })
      this.questDetailPanel.add(mechanicsTitle)
      this.detailElements['mechanicsTitle'] = mechanicsTitle
      yOffset += 25
      
      quest.specialMechanics.forEach((mechanic, index) => {
        const mechanicText = this.scene.add.text(30, yOffset, `• ${mechanic}`, {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: '#FF9800'
        })
        this.questDetailPanel.add(mechanicText)
        this.detailElements[`mechanic${index}`] = mechanicText
        yOffset += 20
      })
      yOffset += 10
    }
    
    // 任务目标
    const objectivesTitle = this.scene.add.text(20, yOffset, '任务目标:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      fontStyle: 'bold'
    })
    this.questDetailPanel.add(objectivesTitle)
    this.detailElements['objectivesTitle'] = objectivesTitle
    yOffset += 25
    
    quest.objectives.forEach((objective, index) => {
      const objText = this.scene.add.text(30, yOffset, 
        `${objective.isCompleted ? '✅' : '⭕'} ${objective.description}`, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: objective.isCompleted ? '#4CAF50' : '#FFFFFF'
      })
      this.questDetailPanel.add(objText)
      this.detailElements[`objective${index}`] = objText
      yOffset += 20
      
      // 特殊条件
      if (objective.specialConditions && objective.specialConditions.length > 0) {
        objective.specialConditions.forEach((condition, condIndex) => {
          const condText = this.scene.add.text(50, yOffset, `⚠️ ${condition}`, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#FFC107'
          })
          this.questDetailPanel.add(condText)
          this.detailElements[`condition${index}_${condIndex}`] = condText
          yOffset += 18
        })
      }
    })
    
    // 奖励
    yOffset += 20
    const rewardsTitle = this.scene.add.text(20, yOffset, '任务奖励:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    })
    this.questDetailPanel.add(rewardsTitle)
    this.detailElements['rewardsTitle'] = rewardsTitle
    yOffset += 25
    
    const rewardsList = [
      `升华点数: ${quest.rewards.ascendancyPoints}`,
      quest.rewards.experience ? `经验值: ${quest.rewards.experience}` : null,
      quest.rewards.title ? `头衔: ${quest.rewards.title}` : null,
      quest.rewards.items ? `物品: ${quest.rewards.items.join(', ')}` : null
    ].filter(Boolean)
    
    rewardsList.forEach((reward, index) => {
      if (reward) {
        const rewardText = this.scene.add.text(30, yOffset, `• ${reward}`, {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: '#FFD700'
        })
        this.questDetailPanel.add(rewardText)
        this.detailElements[`reward${index}`] = rewardText
        yOffset += 18
      }
    })
    
    // 开始任务按钮
    if (quest.isUnlocked && !quest.isCompleted) {
      const startButton = this.scene.add.graphics()
      startButton.fillStyle(0x4CAF50, 0.8)
      startButton.lineStyle(2, 0x2E7D32)
      startButton.fillRoundedRect(150, yOffset + 20, 160, 40, 8)
      startButton.strokeRoundedRect(150, yOffset + 20, 160, 40, 8)
      this.questDetailPanel.add(startButton)
      this.detailElements['startButton'] = startButton
      
      const startText = this.scene.add.text(230, yOffset + 40, '开始试炼', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontStyle: 'bold'
      })
      startText.setOrigin(0.5)
      this.questDetailPanel.add(startText)
      this.detailElements['startText'] = startText
      
      startButton.setInteractive(new Phaser.Geom.Rectangle(150, yOffset + 20, 160, 40), Phaser.Geom.Rectangle.Contains)
      startButton.on('pointerdown', () => {
        this.startQuest(quest)
      })
      
      startButton.on('pointerover', () => {
        startButton.clear()
        startButton.fillStyle(0x66BB6A, 0.9)
        startButton.lineStyle(2, 0x2E7D32)
        startButton.fillRoundedRect(150, yOffset + 20, 160, 40, 8)
        startButton.strokeRoundedRect(150, yOffset + 20, 160, 40, 8)
      })
      
      startButton.on('pointerout', () => {
        startButton.clear()
        startButton.fillStyle(0x4CAF50, 0.8)
        startButton.lineStyle(2, 0x2E7D32)
        startButton.fillRoundedRect(150, yOffset + 20, 160, 40, 8)
        startButton.strokeRoundedRect(150, yOffset + 20, 160, 40, 8)
      })
    }
  }

  // 选择任务
  private selectQuest(quest: AscendancyQuest): void {
    this.selectedQuest = quest
    this.updateQuestDetails()
  }

  // 开始任务
  private startQuest(quest: AscendancyQuest): void {
    console.log(`开始升华任务: ${quest.name}`)
    this.scene.events.emit('start_ascendancy_quest', quest)
    this.hide()
  }

  // 文本换行
  private wrapText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    
    const words = text.split('')
    let result = ''
    let currentLine = ''
    
    for (const char of words) {
      if (currentLine.length + 1 > maxLength) {
        result += currentLine + '\n'
        currentLine = char
      } else {
        currentLine += char
      }
    }
    
    if (currentLine) {
      result += currentLine
    }
    
    return result
  }

  // 获取可见状态
  public getVisible(): boolean {
    return this.isVisible
  }
} 