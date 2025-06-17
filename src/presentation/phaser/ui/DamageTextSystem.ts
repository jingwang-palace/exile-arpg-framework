import { EventBus } from '../../../core/EventBus'

// 飘字类型枚举
export enum DamageTextType {
  PHYSICAL_DAMAGE = 'physical_damage',
  FIRE_DAMAGE = 'fire_damage',
  COLD_DAMAGE = 'cold_damage',
  LIGHTNING_DAMAGE = 'lightning_damage',
  CHAOS_DAMAGE = 'chaos_damage',
  CRITICAL_DAMAGE = 'critical_damage',
  HEAL = 'heal',
  MANA_RESTORE = 'mana_restore',
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  MISS = 'miss',
  IMMUNE = 'immune',
  BLOCK = 'block',
  DODGE = 'dodge',
  RESIST = 'resist'
}

// 飘字配置
export interface DamageTextConfig {
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeThickness: number
  duration: number
  fadeOutDuration: number
  moveDistance: number
  gravity: number
  scale: number
}

// 飘字实例
export interface DamageTextInstance {
  id: string
  text: Phaser.GameObjects.Text
  type: DamageTextType
  startTime: number
  duration: number
  startX: number
  startY: number
  velocityX: number
  velocityY: number
  gravity: number
  fadeOutDuration: number
}

/**
 * 伤害飘字系统
 * 显示战斗中的各种数值变化（伤害、治疗、经验等）
 */
export class DamageTextSystem extends Phaser.GameObjects.Container {
  private eventBus: EventBus
  
  // 飘字实例
  private activeTexts: Map<string, DamageTextInstance> = new Map()
  
  // 预设配置
  private configs: Map<DamageTextType, DamageTextConfig> = new Map()
  
  // 更新定时器
  private updateTimer: Phaser.Time.TimerEvent | null = null

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)
    this.eventBus = EventBus.getInstance()
    this.initializeSystem()
    this.setupConfigs()
    this.setupEventListeners()
    this.startUpdateTimer()
  }

  private initializeSystem(): void {
    this.setDepth(1000) // 确保飘字显示在最上层
    this.setScrollFactor(0) // 固定在世界坐标中
    this.setVisible(true)
  }

  private setupConfigs(): void {
    // 物理伤害配置
    this.configs.set(DamageTextType.PHYSICAL_DAMAGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 火焰伤害配置
    this.configs.set(DamageTextType.FIRE_DAMAGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ff4400',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 冰霜伤害配置
    this.configs.set(DamageTextType.COLD_DAMAGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#00ffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 闪电伤害配置
    this.configs.set(DamageTextType.LIGHTNING_DAMAGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffff00',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 混沌伤害配置
    this.configs.set(DamageTextType.CHAOS_DAMAGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ff00ff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 暴击伤害配置
    this.configs.set(DamageTextType.CRITICAL_DAMAGE, {
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#ff0000',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1500,
      fadeOutDuration: 400,
      moveDistance: 70,
      gravity: 0.1,
      scale: 1.2
    })

    // 治疗配置
    this.configs.set(DamageTextType.HEAL, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#00ff00',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 魔法恢复配置
    this.configs.set(DamageTextType.MANA_RESTORE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#0000ff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 经验值配置
    this.configs.set(DamageTextType.EXPERIENCE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffff00',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 金币配置
    this.configs.set(DamageTextType.GOLD, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffd700',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 1000,
      fadeOutDuration: 300,
      moveDistance: 50,
      gravity: 0.1,
      scale: 1
    })

    // 未命中配置
    this.configs.set(DamageTextType.MISS, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 800,
      fadeOutDuration: 200,
      moveDistance: 30,
      gravity: 0.1,
      scale: 1
    })

    // 免疫配置
    this.configs.set(DamageTextType.IMMUNE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 800,
      fadeOutDuration: 200,
      moveDistance: 30,
      gravity: 0.1,
      scale: 1
    })

    // 格挡配置
    this.configs.set(DamageTextType.BLOCK, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 800,
      fadeOutDuration: 200,
      moveDistance: 30,
      gravity: 0.1,
      scale: 1
    })

    // 闪避配置
    this.configs.set(DamageTextType.DODGE, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 800,
      fadeOutDuration: 200,
      moveDistance: 30,
      gravity: 0.1,
      scale: 1
    })

    // 抵抗配置
    this.configs.set(DamageTextType.RESIST, {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeThickness: 4,
      duration: 800,
      fadeOutDuration: 200,
      moveDistance: 30,
      gravity: 0.1,
      scale: 1
    })
  }

  private setupEventListeners(): void {
    this.eventBus.on('damage', (data: { damage: number, type: DamageTextType, x: number, y: number, isCritical?: boolean }) => {
      this.showDamageText(data.damage, data.type, data.x, data.y, data.isCritical)
    })

    this.eventBus.on('heal', (data: { amount: number, x: number, y: number }) => {
      this.showHealText(data.amount, data.x, data.y)
    })

    this.eventBus.on('mana_restore', (data: { amount: number, x: number, y: number }) => {
      this.showManaRestoreText(data.amount, data.x, data.y)
    })

    this.eventBus.on('experience', (data: { amount: number, x: number, y: number }) => {
      this.showExperienceText(data.amount, data.x, data.y)
    })

    this.eventBus.on('gold', (data: { amount: number, x: number, y: number }) => {
      this.showGoldText(data.amount, data.x, data.y)
    })

    this.eventBus.on('miss', (data: { x: number, y: number }) => {
      this.showMissText(data.x, data.y)
    })

    this.eventBus.on('block', (data: { x: number, y: number }) => {
      this.showBlockText(data.x, data.y)
    })

    this.eventBus.on('immune', (data: { x: number, y: number }) => {
      this.showImmuneText(data.x, data.y)
    })

    this.eventBus.on('resist', (data: { x: number, y: number }) => {
      this.showResistText(data.x, data.y)
    })
  }

  private startUpdateTimer(): void {
    this.updateTimer = this.scene.time.addEvent({
      delay: 16, // 约60fps
      callback: this.update,
      callbackScope: this,
      loop: true
    })
  }

  private update(): void {
    const currentTime = Date.now()
    const textsToRemove: string[] = []

    for (const [id, textInstance] of this.activeTexts) {
      const elapsed = currentTime - textInstance.startTime
      
      if (elapsed >= textInstance.duration) {
        textsToRemove.push(id)
        continue
      }

      // 更新位置
      const progress = elapsed / textInstance.duration
      
      // 计算新位置（抛物线运动）
      textInstance.velocityY += textInstance.gravity
      
      const newX = textInstance.startX + textInstance.velocityX * elapsed * 0.1
      const newY = textInstance.startY + textInstance.velocityY * elapsed * 0.1
      
      textInstance.text.setPosition(newX, newY)

      // 更新透明度（渐出）
      const fadeStart = textInstance.duration - textInstance.fadeOutDuration
      if (elapsed >= fadeStart) {
        const fadeProgress = (elapsed - fadeStart) / textInstance.fadeOutDuration
        const alpha = 1 - fadeProgress
        textInstance.text.setAlpha(alpha)
      }

      // 更新缩放（稍微缩小）
      const scale = textInstance.text.getData('originalScale') || 1
      const newScale = scale * (1 - progress * 0.2)
      textInstance.text.setScale(newScale)
    }

    // 移除过期的文字
    for (const id of textsToRemove) {
      this.removeText(id)
    }
  }

  // ===========================================
  // 飘字显示方法
  // ===========================================

  public showDamageText(
    damage: number,
    type: DamageTextType,
    x: number,
    y: number,
    isCritical: boolean = false
  ): void {
    const text = isCritical ? `暴击! ${damage}` : damage.toString()
    this.createFloatingText(text, type, x, y)
  }

  public showHealText(amount: number, x: number, y: number): void {
    const text = `+${amount}`
    this.createFloatingText(text, DamageTextType.HEAL, x, y)
  }

  public showManaRestoreText(amount: number, x: number, y: number): void {
    const text = `+${amount} MP`
    this.createFloatingText(text, DamageTextType.MANA_RESTORE, x, y)
  }

  public showExperienceText(amount: number, x: number, y: number): void {
    const text = `+${amount} EXP`
    this.createFloatingText(text, DamageTextType.EXPERIENCE, x, y)
  }

  public showGoldText(amount: number, x: number, y: number): void {
    const text = `+${amount}g`
    this.createFloatingText(text, DamageTextType.GOLD, x, y)
  }

  public showMissText(x: number, y: number): void {
    this.createFloatingText('MISS', DamageTextType.MISS, x, y)
  }

  public showBlockText(x: number, y: number): void {
    this.createFloatingText('BLOCKED', DamageTextType.BLOCK, x, y)
  }

  public showImmuneText(x: number, y: number): void {
    this.createFloatingText('IMMUNE', DamageTextType.IMMUNE, x, y)
  }

  public showResistText(x: number, y: number): void {
    this.createFloatingText('RESIST', DamageTextType.RESIST, x, y)
  }

  public showCustomText(
    text: string,
    x: number,
    y: number,
    config?: Partial<DamageTextConfig>
  ): void {
    this.createFloatingText(text, DamageTextType.PHYSICAL_DAMAGE, x, y, config)
  }

  // ===========================================
  // 核心创建方法
  // ===========================================

  private createFloatingText(
    text: string,
    type: DamageTextType,
    x: number,
    y: number,
    customConfig?: Partial<DamageTextConfig>
  ): void {
    const config = this.configs.get(type)
    if (!config) {
      return
    }

    const finalConfig = { ...config, ...customConfig }
    const textObject = this.scene.add.text(x, y, text, {
      fontSize: `${finalConfig.fontSize}px`,
      fontFamily: finalConfig.fontFamily,
      color: finalConfig.color,
      stroke: finalConfig.strokeColor,
      strokeThickness: finalConfig.strokeThickness
    })

    // 设置文本对象的属性
    textObject.setOrigin(0.5)
    textObject.setDepth(this.depth + 1)
    textObject.setScrollFactor(0)
    textObject.setVisible(true)
    textObject.setAlpha(1)

    // 添加到容器
    this.add(textObject)

    // 创建飘字实例
    const instance: DamageTextInstance = {
      id: `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: textObject,
      type,
      startTime: Date.now(),
      duration: finalConfig.duration,
      startX: x,
      startY: y,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: -2,
      gravity: finalConfig.gravity,
      fadeOutDuration: finalConfig.fadeOutDuration
    }

    this.activeTexts.set(instance.id, instance)
  }

  private removeText(textId: string): void {
    const textInstance = this.activeTexts.get(textId)
    if (textInstance) {
      textInstance.text.destroy()
      this.activeTexts.delete(textId)
    }
  }

  // ===========================================
  // 配置管理
  // ===========================================

  public setConfig(type: DamageTextType, config: Partial<DamageTextConfig>): void {
    const currentConfig = this.configs.get(type)
    if (currentConfig) {
      this.configs.set(type, { ...currentConfig, ...config })
    }
  }

  public getConfig(type: DamageTextType): DamageTextConfig | undefined {
    return this.configs.get(type)
  }

  // ===========================================
  // 工具方法
  // ===========================================

  public clearAllTexts(): void {
    for (const [id, textInstance] of this.activeTexts) {
      textInstance.text.destroy()
    }
    this.activeTexts.clear()
  }

  public getActiveTextCount(): number {
    return this.activeTexts.size
  }

  public setEnabled(enabled: boolean): void {
    this.setVisible(enabled)
    if (!enabled) {
      this.clearAllTexts()
    }
  }

  // ===========================================
  // 批量显示方法
  // ===========================================

  public showMultipleDamage(damages: Array<{
    damage: number,
    type: DamageTextType,
    x: number,
    y: number,
    isCritical?: boolean
  }>): void {
    damages.forEach((damage, index) => {
      const offsetX = (index - damages.length / 2) * 20
      const offsetY = (index - damages.length / 2) * 20
      this.showDamageText(
        damage.damage,
        damage.type,
        damage.x + offsetX,
        damage.y + offsetY,
        damage.isCritical
      )
    })
  }

  public showComboText(combo: number, x: number, y: number): void {
    const text = `${combo} Combo!`
    this.createFloatingText(text, DamageTextType.PHYSICAL_DAMAGE, x, y, {
      fontSize: 32,
      color: '#ff00ff',
      duration: 1500,
      moveDistance: 100,
      scale: 1.5
    })
  }

  public destroy(): void {
    if (this.updateTimer) {
      this.updateTimer.remove()
      this.updateTimer = null
    }
    this.clearAllTexts()
    this.eventBus.off('damage')
    this.eventBus.off('heal')
    this.eventBus.off('mana_restore')
    this.eventBus.off('experience')
    this.eventBus.off('gold')
    this.eventBus.off('miss')
    this.eventBus.off('block')
    this.eventBus.off('immune')
    this.eventBus.off('resist')
    super.destroy()
  }
}

export default DamageTextSystem 