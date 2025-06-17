import { EventBus } from '../../../core/EventBus'

// 通知类型枚举
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ACHIEVEMENT = 'achievement',
  LEVEL_UP = 'level_up',
  QUEST = 'quest',
  ITEM = 'item',
  COMBAT = 'combat',
  CURRENCY = 'currency',
  SKILL = 'skill'
}

// 通知接口
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  color?: number
  duration: number
  priority: number
  persistent: boolean
  showProgress?: boolean
  progress?: number
  data?: any
  timestamp: number
}

// 通知配置
export interface NotificationConfig {
  maxNotifications: number
  defaultDuration: number
  fadeInDuration: number
  fadeOutDuration: number
  stackSpacing: number
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  enableSound: boolean
  enableAnimation: boolean
}

/**
 * 通知系统
 * 显示各种游戏消息、成就、等级提升等通知
 */
class NotificationSystem extends Phaser.GameObjects.Container {
  private eventBus: EventBus
  
  // 通知元素
  private notificationElements: Map<string, Phaser.GameObjects.Container> = new Map()
  
  // 通知队列
  private notifications: Map<string, Notification> = new Map()
  private notificationQueue: Notification[] = []
  
  // 配置
  private config: NotificationConfig = {
    maxNotifications: 5,
    defaultDuration: 3000,
    fadeInDuration: 300,
    fadeOutDuration: 500,
    stackSpacing: 80,
    position: 'top-right',
    enableSound: false,
    enableAnimation: true
  }
  
  // 位置计算
  private basePosition: { x: number; y: number } = { x: 0, y: 0 }
  
  // 声音效果
  private soundEffects: Map<NotificationType, string> = new Map()

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)
    this.eventBus = EventBus.getInstance()
    
    this.initializeSystem()
  }

  private initializeSystem(): void {
    this.setScrollFactor(0) // 固定在屏幕上
    this.setDepth(2000) // 确保在最上层
    this.setupEventListeners()
    this.loadSoundEffects()
    this.calculateBasePosition()
    
    console.log('通知系统初始化完成')
  }

  private setupEventListeners(): void {
    // 监听游戏事件并显示相应通知
    this.eventBus.on('player:level_up', (data) => {
      this.showLevelUpNotification(data.newLevel)
    })

    this.eventBus.on('achievement:unlocked', (data) => {
      this.showAchievementNotification(data.achievement)
    })

    this.eventBus.on('quest:completed', (data) => {
      this.showQuestNotification('任务完成', data.quest.name, 'success')
    })

    this.eventBus.on('quest:failed', (data) => {
      this.showQuestNotification('任务失败', data.quest.name, 'error')
    })

    this.eventBus.on('item:rare_dropped', (data) => {
      this.showItemNotification(data.item)
    })

    this.eventBus.on('currency:gained', (data) => {
      this.showCurrencyNotification(data.type, data.amount)
    })

    this.eventBus.on('skill:learned', (data) => {
      this.showSkillNotification('学会新技能', data.skill.name)
    })

    this.eventBus.on('combat:boss_defeated', (data) => {
      this.showBossDefeatNotification(data.boss)
    })

    this.eventBus.on('error:game', (data) => {
      this.showErrorNotification(data.message)
    })

    // 监听屏幕尺寸变化
    this.scene.scale.on('resize', () => {
      this.calculateBasePosition()
      this.repositionNotifications()
    })
  }

  private loadSoundEffects(): void {
    // 设置不同类型通知的声音效果
    this.soundEffects.set(NotificationType.SUCCESS, 'notification_success')
    this.soundEffects.set(NotificationType.ERROR, 'notification_error')
    this.soundEffects.set(NotificationType.WARNING, 'notification_warning')
    this.soundEffects.set(NotificationType.ACHIEVEMENT, 'achievement_unlock')
    this.soundEffects.set(NotificationType.LEVEL_UP, 'level_up')
    this.soundEffects.set(NotificationType.QUEST, 'quest_complete')
    this.soundEffects.set(NotificationType.ITEM, 'item_pickup')
  }

  private calculateBasePosition(): void {
    const camera = this.scene.cameras.main
    const margin = 20
    
    switch (this.config.position) {
      case 'top-right':
        this.basePosition = { x: camera.width - margin, y: margin }
        break
      case 'top-left':
        this.basePosition = { x: margin, y: margin }
        break
      case 'bottom-right':
        this.basePosition = { x: camera.width - margin, y: camera.height - margin }
        break
      case 'bottom-left':
        this.basePosition = { x: margin, y: camera.height - margin }
        break
      case 'center':
        this.basePosition = { x: camera.width / 2, y: camera.height / 2 }
        break
    }
  }

  // ===========================================
  // 通知显示方法
  // ===========================================

  public showNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): string {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      icon: options.icon,
      color: options.color || this.getTypeColor(type),
      duration: options.duration || this.getTypeDuration(type),
      priority: options.priority || this.getTypePriority(type),
      persistent: options.persistent || false,
      showProgress: options.showProgress || false,
      progress: options.progress || 0,
      data: options.data,
      timestamp: Date.now()
    }

    this.addNotification(notification)
    return notification.id
  }

  public showLevelUpNotification(newLevel: number): void {
    this.showNotification(
      NotificationType.LEVEL_UP,
      '等级提升！',
      `恭喜你达到了 ${newLevel} 级！`,
      {
        icon: 'level_up',
        duration: 4000,
        priority: 90
      }
    )
  }

  public showAchievementNotification(achievement: any): void {
    this.showNotification(
      NotificationType.ACHIEVEMENT,
      '成就解锁！',
      achievement.name,
      {
        icon: 'achievement',
        duration: 5000,
        priority: 95,
        data: achievement
      }
    )
  }

  public showQuestNotification(title: string, questName: string, result: 'success' | 'error'): void {
    const type = result === 'success' ? NotificationType.SUCCESS : NotificationType.ERROR
    
    this.showNotification(
      type,
      title,
      questName,
      {
        icon: 'quest',
        duration: 3500,
        priority: 80
      }
    )
  }

  public showItemNotification(item: any): void {
    const rarity = item.rarity?.toLowerCase() || 'common'
    const color = this.getRarityColor(rarity)
    
    this.showNotification(
      NotificationType.ITEM,
      '获得物品',
      item.name,
      {
        icon: 'item',
        color: color,
        duration: 3000,
        priority: 60,
        data: item
      }
    )
  }

  public showCurrencyNotification(currencyType: string, amount: number): void {
    this.showNotification(
      NotificationType.CURRENCY,
      '获得通货',
      `${currencyType} x${amount}`,
      {
        icon: 'currency',
        duration: 2500,
        priority: 50
      }
    )
  }

  public showSkillNotification(title: string, skillName: string): void {
    this.showNotification(
      NotificationType.SKILL,
      title,
      skillName,
      {
        icon: 'skill',
        duration: 3000,
        priority: 70
      }
    )
  }

  public showBossDefeatNotification(boss: any): void {
    this.showNotification(
      NotificationType.SUCCESS,
      '击败BOSS！',
      boss.name || '强大的敌人',
      {
        icon: 'boss_defeat',
        duration: 4000,
        priority: 95
      }
    )
  }

  public showErrorNotification(message: string): void {
    this.showNotification(
      NotificationType.ERROR,
      '错误',
      message,
      {
        icon: 'error',
        duration: 4000,
        priority: 100,
        persistent: true
      }
    )
  }

  public showProgressNotification(
    title: string,
    message: string,
    progress: number
  ): string {
    return this.showNotification(
      NotificationType.INFO,
      title,
      message,
      {
        showProgress: true,
        progress: progress,
        persistent: true,
        duration: 0
      }
    )
  }

  // ===========================================
  // 通知管理
  // ===========================================

  private addNotification(notification: Notification): void {
    // 检查是否达到最大显示数量
    if (this.notifications.size >= this.config.maxNotifications) {
      this.removeOldestNotification()
    }

    this.notifications.set(notification.id, notification)
    this.createNotificationElement(notification)
    this.playNotificationSound(notification.type)
    
    // 设置自动移除定时器（非持久化通知）
    if (!notification.persistent && notification.duration > 0) {
      this.scene.time.delayedCall(notification.duration, () => {
        this.removeNotification(notification.id)
      })
    }

    console.log(`📢 显示通知: ${notification.title}`)
  }

  private removeNotification(notificationId: string): void {
    const notification = this.notifications.get(notificationId)
    if (!notification) return

    const element = this.notificationElements.get(notificationId)
    if (element) {
      this.animateNotificationOut(element, () => {
        element.destroy()
        this.notificationElements.delete(notificationId)
        this.notifications.delete(notificationId)
        this.repositionNotifications()
      })
    } else {
      this.notifications.delete(notificationId)
    }
  }

  private removeOldestNotification(): void {
    let oldestId: string | null = null
    let oldestTime = Date.now()

    for (const [id, notification] of this.notifications) {
      if (notification.persistent) continue
      
      if (notification.timestamp < oldestTime) {
        oldestTime = notification.timestamp
        oldestId = id
      }
    }

    if (oldestId) {
      this.removeNotification(oldestId)
    }
  }

  public removeNotificationById(notificationId: string): void {
    this.removeNotification(notificationId)
  }

  public updateNotificationProgress(notificationId: string, progress: number): void {
    const notification = this.notifications.get(notificationId)
    const element = this.notificationElements.get(notificationId)
    
    if (notification && element) {
      notification.progress = Math.max(0, Math.min(100, progress))
      this.updateProgressBar(element, notification.progress)
    }
  }

  public clearAllNotifications(): void {
    for (const id of this.notifications.keys()) {
      this.removeNotification(id)
    }
  }

  // ===========================================
  // UI元素创建
  // ===========================================

  private createNotificationElement(notification: Notification): void {
    const width = 320
    const height = 70
    
    // 创建容器
    const element = this.scene.add.container(0, 0)
    
    // 背景
    const background = this.scene.add.graphics()
    background.fillStyle(0x1a1a1a, 0.95)
    background.lineStyle(2, notification.color, 0.8)
    background.fillRoundedRect(-width/2, -height/2, width, height, 8)
    background.strokeRoundedRect(-width/2, -height/2, width, height, 8)
    element.add(background)
    
    // 图标
    if (notification.icon) {
      const icon = this.createNotificationIcon(notification)
      if (icon) {
        icon.setPosition(-width/2 + 25, 0)
        element.add(icon)
      }
    }
    
    // 标题
    const title = this.scene.add.text(-width/2 + 55, -15, notification.title, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    element.add(title)
    
    // 消息
    const message = this.scene.add.text(-width/2 + 55, 0, notification.message, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#cccccc',
      wordWrap: { width: width - 80 }
    })
    element.add(message)
    
    // 进度条（如果需要）
    if (notification.showProgress) {
      const progressBg = this.scene.add.graphics()
      progressBg.fillStyle(0x333333, 0.8)
      progressBg.fillRoundedRect(-width/2 + 55, 15, width - 80, 6, 3)
      element.add(progressBg)
      
      const progressBar = this.scene.add.graphics()
      progressBar.fillStyle(notification.color, 1)
      const progressWidth = (width - 80) * (notification.progress || 0) / 100
      progressBar.fillRoundedRect(-width/2 + 55, 15, progressWidth, 6, 3)
      element.add(progressBar)
      
      // 保存进度条引用
      element.setData('progressBar', progressBar)
      element.setData('progressWidth', width - 80)
    }
    
    // 关闭按钮
    const closeButton = this.scene.add.text(width/2 - 20, -height/2 + 10, '×', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888'
    })
    closeButton.setInteractive()
    closeButton.on('pointerdown', () => {
      this.removeNotification(notification.id)
    })
    closeButton.on('pointerover', () => {
      closeButton.setColor('#ffffff')
    })
    closeButton.on('pointerout', () => {
      closeButton.setColor('#888888')
    })
    element.add(closeButton)
    
    // 添加到主容器
    this.add(element)
    this.notificationElements.set(notification.id, element)
    
    // 设置初始位置并播放动画
    this.positionNotification(element, this.notifications.size - 1)
    this.animateNotificationIn(element)
  }

  private createNotificationIcon(notification: Notification): Phaser.GameObjects.Graphics | null {
    const icon = this.scene.add.graphics()
    icon.fillStyle(notification.color, 1)
    
    switch (notification.type) {
      case NotificationType.LEVEL_UP:
        // 绘制等级向上箭头
        icon.fillTriangle(0, -10, -8, 6, 8, 6)
        icon.fillRect(-2, -2, 4, 8)
        break
        
      case NotificationType.ACHIEVEMENT:
        // 绘制星形
        this.drawStar(icon, 0, 0, 8, 5)
        break
        
      case NotificationType.SUCCESS:
        // 绘制对勾
        icon.lineStyle(3, notification.color, 1)
        icon.moveTo(-6, 0)
        icon.lineTo(-2, 4)
        icon.lineTo(6, -4)
        icon.strokePath()
        break
        
      case NotificationType.ERROR:
        // 绘制X
        icon.lineStyle(3, notification.color, 1)
        icon.moveTo(-6, -6)
        icon.lineTo(6, 6)
        icon.moveTo(6, -6)
        icon.lineTo(-6, 6)
        icon.strokePath()
        break
        
      case NotificationType.WARNING:
        // 绘制感叹号
        icon.fillTriangle(0, -8, -6, 6, 6, 6)
        icon.fillCircle(0, -2, 2)
        icon.fillCircle(0, 3, 2)
        break
        
      default:
        // 默认圆形
        icon.fillCircle(0, 0, 8)
        break
    }
    
    return icon
  }

  private drawStar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, outerRadius: number, innerRadius: number): void {
    const points = []
    
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      points.push(x + Math.cos(angle) * radius)
      points.push(y + Math.sin(angle) * radius)
    }
    
    graphics.fillPoints(points, true)
  }

  // ===========================================
  // 动画系统
  // ===========================================

  private animateNotificationIn(element: Phaser.GameObjects.Container): void {
    if (!this.config.enableAnimation) return
    
    // 设置初始状态
    element.setAlpha(0)
    element.setScale(0.8)
    
    // 渐入动画
    this.scene.tweens.add({
      targets: element,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: this.config.fadeInDuration,
      ease: 'Back.easeOut'
    })
  }

  private animateNotificationOut(element: Phaser.GameObjects.Container, onComplete: () => void): void {
    if (!this.config.enableAnimation) {
      onComplete()
      return
    }
    
    // 渐出动画
    this.scene.tweens.add({
      targets: element,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      x: element.x + 50, // 向右滑出
      duration: this.config.fadeOutDuration,
      ease: 'Power2.easeIn',
      onComplete: onComplete
    })
  }

  private positionNotification(element: Phaser.GameObjects.Container, index: number): void {
    const isTopPosition = this.config.position.includes('top')
    const isRightPosition = this.config.position.includes('right')
    
    let x = this.basePosition.x
    let y = this.basePosition.y
    
    // 计算垂直位置
    if (isTopPosition) {
      y += index * this.config.stackSpacing
    } else {
      y -= index * this.config.stackSpacing
    }
    
    // 右对齐的通知需要调整X位置
    if (isRightPosition) {
      x -= 160 // 通知宽度的一半
    } else {
      x += 160
    }
    
    element.setPosition(x, y)
  }

  private repositionNotifications(): void {
    let index = 0
    
    // 按优先级和时间戳排序
    const sortedNotifications = Array.from(this.notifications.entries())
      .sort(([, a], [, b]) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority // 高优先级在前
        }
        return a.timestamp - b.timestamp // 早出现的在前
      })
    
    for (const [id, notification] of sortedNotifications) {
      const element = this.notificationElements.get(id)
      if (element) {
        this.positionNotification(element, index)
        index++
      }
    }
  }

  private updateProgressBar(element: Phaser.GameObjects.Container, progress: number): void {
    const progressBar = element.getData('progressBar') as Phaser.GameObjects.Graphics
    const progressWidth = element.getData('progressWidth') as number
    
    if (progressBar && progressWidth) {
      progressBar.clear()
      progressBar.fillStyle(0x00ff88, 1)
      const currentWidth = progressWidth * progress / 100
      progressBar.fillRoundedRect(-160 + 55, 15, currentWidth, 6, 3)
    }
  }

  // ===========================================
  // 辅助方法
  // ===========================================

  private getTypeColor(type: NotificationType): number {
    switch (type) {
      case NotificationType.SUCCESS:
      case NotificationType.ACHIEVEMENT:
        return 0x4CAF50
      case NotificationType.ERROR:
        return 0xF44336
      case NotificationType.WARNING:
        return 0xFF9800
      case NotificationType.LEVEL_UP:
        return 0x9C27B0
      case NotificationType.QUEST:
        return 0x2196F3
      case NotificationType.ITEM:
        return 0xFFEB3B
      case NotificationType.CURRENCY:
        return 0x00BCD4
      case NotificationType.SKILL:
        return 0x8BC34A
      default:
        return 0x607D8B
    }
  }

  private getTypeDuration(type: NotificationType): number {
    switch (type) {
      case NotificationType.ERROR:
        return 5000
      case NotificationType.ACHIEVEMENT:
      case NotificationType.LEVEL_UP:
        return 4000
      case NotificationType.SUCCESS:
      case NotificationType.QUEST:
        return 3500
      case NotificationType.ITEM:
      case NotificationType.SKILL:
        return 3000
      case NotificationType.CURRENCY:
        return 2500
      default:
        return this.config.defaultDuration
    }
  }

  private getTypePriority(type: NotificationType): number {
    switch (type) {
      case NotificationType.ERROR:
        return 100
      case NotificationType.ACHIEVEMENT:
      case NotificationType.LEVEL_UP:
        return 90
      case NotificationType.QUEST:
        return 80
      case NotificationType.SUCCESS:
        return 70
      case NotificationType.SKILL:
        return 60
      case NotificationType.ITEM:
        return 50
      case NotificationType.CURRENCY:
        return 40
      default:
        return 30
    }
  }

  private getRarityColor(rarity: string): number {
    switch (rarity) {
      case 'unique':
        return 0xFF8800
      case 'rare':
        return 0xFFFF00
      case 'magic':
        return 0x8888FF
      case 'currency':
        return 0x00FFFF
      default:
        return 0xFFFFFF
    }
  }

  private playNotificationSound(type: NotificationType): void {
    if (!this.config.enableSound) return;
    
    const soundKey = this.soundEffects.get(type);
    if (!soundKey) return;
    
    try {
      if (this.scene.sound && this.scene.sound.play) {
        this.scene.sound.play(soundKey);
      }
    } catch (error) {
      console.warn(`无法播放通知音效: ${soundKey}`, error);
    }
  }

  // ===========================================
  // 公共API
  // ===========================================

  public setConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config }
    this.calculateBasePosition()
    this.repositionNotifications()
  }

  public getActiveNotifications(): Notification[] {
    return Array.from(this.notifications.values())
  }

  public hasNotifications(): boolean {
    return this.notifications.size > 0
  }

  public destroy(): void {
    this.clearAllNotifications()
    
    if (this.notificationElements.size > 0) {
      for (const element of this.notificationElements.values()) {
        element.destroy()
      }
    }
    
    console.log('🧹 通知系统已清理')
  }
}

export default NotificationSystem; 