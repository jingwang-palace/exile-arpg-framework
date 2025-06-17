import { EventBus } from '../../../core/EventBus'
import { StateManager } from '../../../infrastructure/StateManager'

// 小地图显示模式
export enum MiniMapMode {
  STANDARD = 'standard',      // 标准模式
  COMBAT = 'combat',          // 战斗模式
  EXPLORATION = 'exploration', // 探索模式
  QUEST = 'quest'             // 任务模式
}

// 地图标记类型
export enum MapMarkerType {
  PLAYER = 'player',
  ALLY = 'ally',
  ENEMY = 'enemy',
  BOSS = 'boss',
  NPC = 'npc',
  QUEST_GIVER = 'quest_giver',
  QUEST_TARGET = 'quest_target',
  ITEM = 'item',
  RARE_ITEM = 'rare_item',
  UNIQUE_ITEM = 'unique_item',
  CURRENCY = 'currency',
  WAYPOINT = 'waypoint',
  PORTAL = 'portal',
  CHEST = 'chest',
  SHRINE = 'shrine',
  DANGER_ZONE = 'danger_zone',
  SAFE_ZONE = 'safe_zone'
}

// 地图标记接口
export interface MapMarker {
  id: string
  type: MapMarkerType
  x: number
  y: number
  worldX: number
  worldY: number
  name?: string
  description?: string
  color: number
  size: number
  pulse: boolean
  visible: boolean
  priority: number
  icon?: string
  data?: any
}

// 地图区域接口
export interface MapArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: number
  alpha: number
  type: 'explored' | 'unexplored' | 'safe' | 'danger'
}

// 小地图配置
export interface MiniMapConfig {
  size: number              // 小地图尺寸
  scale: number             // 缩放比例
  updateInterval: number    // 更新间隔（毫秒）
  fadeDistance: number      // 标记淡出距离
  maxMarkers: number        // 最大标记数量
  showFogOfWar: boolean     // 显示战争迷雾
  enableZoom: boolean       // 启用缩放
  enableRotation: boolean   // 启用旋转
}

/**
 * 小地图系统
 * 显示游戏世界的缩略图，包含玩家、敌人、物品等标记
 */
export class MiniMapSystem extends Phaser.GameObjects.Container {
  private eventBus: EventBus
  private stateManager: StateManager
  
  // 小地图图形
  private background!: Phaser.GameObjects.Graphics
  private mapGraphics!: Phaser.GameObjects.Graphics
  private markerGraphics!: Phaser.GameObjects.Graphics
  private fogGraphics!: Phaser.GameObjects.Graphics
  private borderGraphics!: Phaser.GameObjects.Graphics
  
  // 标记和区域
  private markers: Map<string, MapMarker> = new Map()
  private areas: Map<string, MapArea> = new Map()
  private markerSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()
  
  // 系统状态
  private enabled: boolean = true
  private visible: boolean = true
  private mode: MiniMapMode = MiniMapMode.STANDARD
  private position: { x: number; y: number } = { x: 0, y: 0 }
  private size: number = 200
  private scale: number = 0.1
  private zoom: number = 1
  private rotation: number = 0
  
  // 玩家相关
  private player: Phaser.Physics.Arcade.Sprite | null = null
  private playerMarker: MapMarker | null = null
  private viewRadius: number = 300
  
  // 配置
  private config: MiniMapConfig = {
    size: 200,
    scale: 0.1,
    updateInterval: 100,
    fadeDistance: 500,
    maxMarkers: 100,
    showFogOfWar: true,
    enableZoom: true,
    enableRotation: false
  }
  
  // 更新计时器
  private updateTimer: Phaser.Time.TimerEvent | null = null

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)
    this.eventBus = EventBus.getInstance()
    this.stateManager = StateManager.getInstance()
    
    this.initializeSystem()
  }

  private initializeSystem(): void {
    this.createMiniMap()
    this.setupEventListeners()
    this.startUpdateTimer()
    
    console.log('🗺️ 小地图系统初始化完成')
  }

  private createMiniMap(): void {
    // 计算位置（右上角）
    const centerX = this.scene.cameras.main.width - this.config.size / 2 - 20
    const centerY = this.config.size / 2 + 20

    // 设置容器位置
    this.setPosition(centerX, centerY)
    this.setScrollFactor(0) // 固定在屏幕上
    this.setDepth(1000)

    // 创建背景
    this.createBackground()
    
    // 创建地图图层
    this.createMapGraphics()
    
    // 创建标记图层
    this.createMarkerGraphics()
    
    // 创建战争迷雾图层
    this.createFogOfWar()
    
    // 创建边框
    this.createBorder()
    
    // 添加玩家标记
    this.addPlayerMarker()
    
    // 设置交互
    this.setupInteraction()
  }

  private createBackground(): void {
    this.background = this.scene.add.graphics()
    this.background.fillStyle(0x000000, 0.8)
    this.background.fillCircle(0, 0, this.config.size / 2)
    this.add(this.background)
  }

  private createMapGraphics(): void {
    this.mapGraphics = this.scene.add.graphics()
    this.add(this.mapGraphics)
  }

  private createMarkerGraphics(): void {
    this.markerGraphics = this.scene.add.graphics()
    this.add(this.markerGraphics)
  }

  private createFogOfWar(): void {
    if (!this.config.showFogOfWar) return
    
    this.fogGraphics = this.scene.add.graphics()
    this.add(this.fogGraphics)
  }

  private createBorder(): void {
    this.borderGraphics = this.scene.add.graphics()
    this.borderGraphics.lineStyle(3, 0x00ff88, 1)
    this.borderGraphics.strokeCircle(0, 0, this.config.size / 2)
    
    // 添加装饰性角标
    this.borderGraphics.lineStyle(2, 0x00ff88, 0.8)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const x1 = Math.cos(angle) * (this.config.size / 2 - 10)
      const y1 = Math.sin(angle) * (this.config.size / 2 - 10)
      const x2 = Math.cos(angle) * (this.config.size / 2 + 5)
      const y2 = Math.sin(angle) * (this.config.size / 2 + 5)
      
      this.borderGraphics.moveTo(x1, y1)
      this.borderGraphics.lineTo(x2, y2)
    }
    
    this.add(this.borderGraphics)
  }

  private setupInteraction(): void {
    // 设置点击区域
    const hitArea = new Phaser.Geom.Circle(0, 0, this.config.size / 2)
    this.setInteractive(hitArea, Phaser.Geom.Circle.Contains)
    
    // 点击事件
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleMapClick(pointer)
    })
    
    // 滚轮缩放
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      if (this.config.enableZoom && this.isPointerOverMiniMap(pointer)) {
        this.handleZoom(deltaY)
      }
    })
  }

  private setupEventListeners(): void {
    // 监听游戏事件
    this.eventBus.on('enemy:spawned', (data) => {
      this.addEnemyMarker(data.enemy)
    })

    this.eventBus.on('enemy:killed', (data) => {
      this.removeMarker(`enemy_${data.enemy.id}`)
    })

    this.eventBus.on('item:dropped', (data) => {
      this.addItemMarker(data.item, data.x, data.y)
    })

    this.eventBus.on('item:picked_up', (data) => {
      this.removeMarker(`item_${data.item.id}`)
    })

    this.eventBus.on('npc:spawned', (data) => {
      this.addNPCMarker(data.npc)
    })

    this.eventBus.on('quest:target_updated', (data) => {
      this.updateQuestMarkers(data.quest)
    })

    this.eventBus.on('player:moved', () => {
      this.updatePlayerMarker()
    })

    this.eventBus.on('combat:started', () => {
      this.setMode(MiniMapMode.COMBAT)
    })

    this.eventBus.on('combat:ended', () => {
      this.setMode(MiniMapMode.STANDARD)
    })
  }

  // ===========================================
  // 标记管理
  // ===========================================

  private addPlayerMarker(): void {
    if (!this.player) return
    
    this.playerMarker = {
      id: 'player',
      type: MapMarkerType.PLAYER,
      x: 0, // 玩家始终在中心
      y: 0,
      worldX: this.player.x,
      worldY: this.player.y,
      name: '玩家',
      color: 0x00ff88,
      size: 8,
      pulse: false,
      visible: true,
      priority: 100,
      icon: 'player'
    }
    
    this.markers.set('player', this.playerMarker)
  }

  public addMarker(marker: MapMarker): void {
    // 检查标记数量限制
    if (this.markers.size >= this.config.maxMarkers) {
      this.removeOldestMarker()
    }
    
    // 转换世界坐标到小地图坐标
    this.updateMarkerPosition(marker)
    
    this.markers.set(marker.id, marker)
    console.log(`📍 添加地图标记: ${marker.name || marker.type}`)
  }

  public removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId)
    if (marker) {
      this.markers.delete(markerId)
      
      // 移除精灵
      const sprite = this.markerSprites.get(markerId)
      if (sprite) {
        sprite.destroy()
        this.markerSprites.delete(markerId)
      }
      
      console.log(`🗑️ 移除地图标记: ${marker.name || marker.type}`)
    }
  }

  public addEnemyMarker(enemy: any): void {
    const markerType = enemy.isBoss ? MapMarkerType.BOSS : MapMarkerType.ENEMY
    const color = enemy.isBoss ? 0xff0000 : 0xff6666
    
    const marker: MapMarker = {
      id: `enemy_${enemy.id}`,
      type: markerType,
      x: 0,
      y: 0,
      worldX: enemy.x,
      worldY: enemy.y,
      name: enemy.name || '敌人',
      color: color,
      size: enemy.isBoss ? 10 : 6,
      pulse: enemy.isBoss,
      visible: true,
      priority: enemy.isBoss ? 80 : 60,
      data: enemy
    }
    
    this.addMarker(marker)
  }

  public addItemMarker(item: any, x: number, y: number): void {
    let markerType = MapMarkerType.ITEM
    let color = 0xffffff
    let size = 4
    
    // 根据物品稀有度设置不同的标记
    switch (item.rarity?.toLowerCase()) {
      case 'rare':
        markerType = MapMarkerType.RARE_ITEM
        color = 0xffff00
        size = 6
        break
      case 'unique':
        markerType = MapMarkerType.UNIQUE_ITEM
        color = 0xff8800
        size = 8
        break
      case 'currency':
        markerType = MapMarkerType.CURRENCY
        color = 0x00ffff
        size = 5
        break
    }
    
    const marker: MapMarker = {
      id: `item_${item.id}`,
      type: markerType,
      x: 0,
      y: 0,
      worldX: x,
      worldY: y,
      name: item.name,
      color: color,
      size: size,
      pulse: item.rarity === 'unique',
      visible: true,
      priority: 40,
      data: item
    }
    
    this.addMarker(marker)
  }

  public addNPCMarker(npc: any): void {
    const hasQuest = npc.hasQuest || false
    const markerType = hasQuest ? MapMarkerType.QUEST_GIVER : MapMarkerType.NPC
    const color = hasQuest ? 0xffff00 : 0x00ffff
    
    const marker: MapMarker = {
      id: `npc_${npc.id}`,
      type: markerType,
      x: 0,
      y: 0,
      worldX: npc.x,
      worldY: npc.y,
      name: npc.name,
      color: color,
      size: 7,
      pulse: hasQuest,
      visible: true,
      priority: 70,
      data: npc
    }
    
    this.addMarker(marker)
  }

  public addQuestMarker(questId: string, x: number, y: number, name: string): void {
    const marker: MapMarker = {
      id: `quest_${questId}`,
      type: MapMarkerType.QUEST_TARGET,
      x: 0,
      y: 0,
      worldX: x,
      worldY: y,
      name: name,
      color: 0xffaa00,
      size: 10,
      pulse: true,
      visible: true,
      priority: 90,
      icon: 'quest_target'
    }
    
    this.addMarker(marker)
  }

  private removeOldestMarker(): void {
    let oldestMarker: MapMarker | null = null
    let oldestTime = Date.now()
    
    for (const marker of this.markers.values()) {
      if (marker.type === MapMarkerType.PLAYER) continue
      
      const markerTime = marker.data?.createdTime || 0
      if (markerTime < oldestTime) {
        oldestTime = markerTime
        oldestMarker = marker
      }
    }
    
    if (oldestMarker) {
      this.removeMarker(oldestMarker.id)
    }
  }

  // ===========================================
  // 更新系统
  // ===========================================

  private startUpdateTimer(): void {
    this.updateTimer = this.scene.time.addEvent({
      delay: this.config.updateInterval,
      callback: this.update,
      callbackScope: this,
      loop: true
    })
  }

  private update(): void {
    if (!this.enabled || !this.visible) return
    
    this.updatePlayerMarker()
    this.updateMarkersVisibility()
    this.updateMarkersPosition()
    this.renderMarkers()
    this.updateFogOfWar()
  }

  private updatePlayerMarker(): void {
    if (!this.player || !this.playerMarker) return
    
    this.playerMarker.worldX = this.player.x
    this.playerMarker.worldY = this.player.y
    
    // 玩家始终在小地图中心
    this.playerMarker.x = 0
    this.playerMarker.y = 0
  }

  private updateMarkersPosition(): void {
    if (!this.player) return
    
    const playerWorldX = this.player.x
    const playerWorldY = this.player.y
    
    for (const marker of this.markers.values()) {
      if (marker.type === MapMarkerType.PLAYER) continue
      
      this.updateMarkerPosition(marker, playerWorldX, playerWorldY)
    }
  }

  private updateMarkerPosition(marker: MapMarker, playerX?: number, playerY?: number): void {
    if (!this.player) return
    
    const pX = playerX ?? this.player.x
    const pY = playerY ?? this.player.y
    
    // 计算相对位置
    const deltaX = marker.worldX - pX
    const deltaY = marker.worldY - pY
    
    // 应用缩放和旋转
    const scaledX = deltaX * this.config.scale * this.zoom
    const scaledY = deltaY * this.config.scale * this.zoom
    
    if (this.config.enableRotation) {
      const cos = Math.cos(this.rotation)
      const sin = Math.sin(this.rotation)
      marker.x = scaledX * cos - scaledY * sin
      marker.y = scaledX * sin + scaledY * cos
    } else {
      marker.x = scaledX
      marker.y = scaledY
    }
  }

  private updateMarkersVisibility(): void {
    if (!this.player) return
    
    for (const marker of this.markers.values()) {
      if (marker.type === MapMarkerType.PLAYER) continue
      
      // 计算距离
      const distance = Math.sqrt(marker.x * marker.x + marker.y * marker.y)
      const mapRadius = this.config.size / 2
      
      // 基于距离和模式决定可见性
      marker.visible = this.shouldMarkerBeVisible(marker, distance, mapRadius)
    }
  }

  private shouldMarkerBeVisible(marker: MapMarker, distance: number, mapRadius: number): boolean {
    // 超出小地图范围
    if (distance > mapRadius) return false
    
    // 基于模式过滤
    switch (this.mode) {
      case MiniMapMode.COMBAT:
        return marker.type === MapMarkerType.ENEMY || 
               marker.type === MapMarkerType.BOSS ||
               marker.type === MapMarkerType.ALLY
               
      case MiniMapMode.QUEST:
        return marker.type === MapMarkerType.QUEST_TARGET ||
               marker.type === MapMarkerType.QUEST_GIVER ||
               marker.type === MapMarkerType.NPC
               
      case MiniMapMode.EXPLORATION:
        return marker.type !== MapMarkerType.ENEMY || marker.priority > 70
        
      default:
        return true
    }
  }

  private renderMarkers(): void {
    this.markerGraphics.clear()
    
    // 按优先级排序
    const sortedMarkers = Array.from(this.markers.values())
      .filter(marker => marker.visible)
      .sort((a, b) => a.priority - b.priority)
    
    for (const marker of sortedMarkers) {
      this.renderMarker(marker)
    }
  }

  private renderMarker(marker: MapMarker): void {
    const alpha = this.calculateMarkerAlpha(marker)
    if (alpha <= 0) return
    
    // 脉冲效果
    let size = marker.size
    if (marker.pulse) {
      const pulseScale = 1 + 0.3 * Math.sin(Date.now() * 0.005)
      size *= pulseScale
    }
    
    // 绘制标记
    this.markerGraphics.fillStyle(marker.color, alpha)
    
    switch (marker.type) {
      case MapMarkerType.PLAYER:
        this.renderPlayerMarker(marker, size, alpha)
        break
        
      case MapMarkerType.ENEMY:
      case MapMarkerType.BOSS:
        this.markerGraphics.fillTriangle(
          marker.x, marker.y - size,
          marker.x - size * 0.8, marker.y + size * 0.5,
          marker.x + size * 0.8, marker.y + size * 0.5
        )
        break
        
      case MapMarkerType.QUEST_TARGET:
        this.renderQuestMarker(marker, size, alpha)
        break
        
      default:
        this.markerGraphics.fillCircle(marker.x, marker.y, size)
        break
    }
    
    // 绘制边框
    if (marker.type === MapMarkerType.BOSS || marker.pulse) {
      this.markerGraphics.lineStyle(2, 0xffffff, alpha * 0.8)
      this.markerGraphics.strokeCircle(marker.x, marker.y, size + 2)
    }
  }

  private renderPlayerMarker(marker: MapMarker, size: number, alpha: number): void {
    // 玩家箭头指示方向
    const angle = this.config.enableRotation ? 0 : this.player?.rotation || 0
    
    this.markerGraphics.fillStyle(marker.color, alpha)
    
    // 绘制箭头
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    const points = [
      { x: 0, y: -size },      // 前端
      { x: -size * 0.6, y: size * 0.5 },  // 左后
      { x: 0, y: size * 0.2 },   // 中间
      { x: size * 0.6, y: size * 0.5 }    // 右后
    ]
    
    const rotatedPoints = points.map(p => ({
      x: marker.x + p.x * cos - p.y * sin,
      y: marker.y + p.x * sin + p.y * cos
    }))
    
    this.markerGraphics.fillPoints(rotatedPoints, true)
    
    // 绘制边框
    this.markerGraphics.lineStyle(2, 0xffffff, alpha)
    this.markerGraphics.strokePoints(rotatedPoints, true)
  }

  private renderQuestMarker(marker: MapMarker, size: number, alpha: number): void {
    // 绘制星形
    const points = []
    const outerRadius = size
    const innerRadius = size * 0.5
    
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      points.push({
        x: marker.x + Math.cos(angle) * radius,
        y: marker.y + Math.sin(angle) * radius
      })
    }
    
    this.markerGraphics.fillPoints(points, true)
  }

  private calculateMarkerAlpha(marker: MapMarker): number {
    const distance = Math.sqrt(marker.x * marker.x + marker.y * marker.y)
    const fadeStart = this.config.size * 0.3
    const fadeEnd = this.config.size * 0.45
    
    if (distance < fadeStart) return 1
    if (distance > fadeEnd) return 0
    
    return 1 - ((distance - fadeStart) / (fadeEnd - fadeStart))
  }

  private updateFogOfWar(): void {
    if (!this.config.showFogOfWar || !this.fogGraphics) return
    
    // TODO: 实现战争迷雾效果
    // 基于玩家探索过的区域显示/隐藏地图部分
  }

  // ===========================================
  // 交互处理
  // ===========================================

  private handleMapClick(pointer: Phaser.Input.Pointer): void {
    // 计算点击在小地图中的相对位置
    const localX = pointer.x - this.x
    const localY = pointer.y - this.y
    
    // 转换为世界坐标
    const worldX = this.player!.x + (localX / (this.config.scale * this.zoom))
    const worldY = this.player!.y + (localY / (this.config.scale * this.zoom))
    
    // 发送移动事件
    this.eventBus.emit('minimap:clicked', { worldX, worldY })
    console.log(`🗺️ 小地图点击: (${worldX.toFixed(0)}, ${worldY.toFixed(0)})`)
  }

  private handleZoom(deltaY: number): void {
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1
    this.zoom = Phaser.Math.Clamp(this.zoom * zoomFactor, 0.5, 3.0)
    
    console.log(`🔍 小地图缩放: ${this.zoom.toFixed(2)}x`)
  }

  private isPointerOverMiniMap(pointer: Phaser.Input.Pointer): boolean {
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.x, this.y
    )
    return distance <= this.config.size / 2
  }

  // ===========================================
  // 公共API
  // ===========================================

  public setMode(mode: MiniMapMode): void {
    this.mode = mode
    console.log(`🗺️ 小地图模式: ${mode}`)
  }

  public setVisible(visible: boolean): void {
    this.visible = visible
    super.setVisible(visible)
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  public setSize(size: number): void {
    this.config.size = size
    // TODO: 重新创建小地图组件
  }

  public setScale(scale: number): void {
    this.config.scale = scale
  }

  public updateQuestMarkers(quest: any): void {
    // 移除旧的任务标记
    const oldMarkers = Array.from(this.markers.keys())
      .filter(id => id.startsWith(`quest_${quest.id}`))
    
    oldMarkers.forEach(id => this.removeMarker(id))
    
    // 添加新的任务目标标记
    if (quest.objectives) {
      quest.objectives.forEach((objective: any, index: number) => {
        if (objective.type === 'reach_location' && objective.location) {
          this.addQuestMarker(
            `${quest.id}_${index}`,
            objective.location.x,
            objective.location.y,
            objective.description
          )
        }
      })
    }
  }

  public getVisibleMarkers(): MapMarker[] {
    return Array.from(this.markers.values()).filter(marker => marker.visible)
  }

  public getMarkerAt(x: number, y: number, tolerance: number = 10): MapMarker | null {
    for (const marker of this.markers.values()) {
      if (!marker.visible) continue
      
      const distance = Math.sqrt(
        Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2)
      )
      
      if (distance <= tolerance) {
        return marker
      }
    }
    
    return null
  }

  public destroy(): void {
    if (this.updateTimer) {
      this.updateTimer.destroy()
    }
    
    this.markers.clear()
    this.markerSprites.forEach(sprite => sprite.destroy())
    this.markerSprites.clear()
    
    if (this.background) {
      this.background.destroy()
    }
    
    if (this.mapGraphics) {
      this.mapGraphics.destroy()
    }
    
    if (this.markerGraphics) {
      this.markerGraphics.destroy()
    }
    
    if (this.fogGraphics) {
      this.fogGraphics.destroy()
    }
    
    if (this.borderGraphics) {
      this.borderGraphics.destroy()
    }
    
    console.log('🧹 小地图系统已清理')
  }

  public toggleVisibility(): void {
    this.setVisible(!this.visible);
  }

  public isVisible(): boolean {
    return this.visible;
  }
}

export default MiniMapSystem 