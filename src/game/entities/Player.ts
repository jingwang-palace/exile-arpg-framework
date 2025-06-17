import * as Phaser from 'phaser'

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite
  public level: number = 1
  public experience: number = 0
  public nextLevelExp: number = 100
  public currentHealth: number = 100
  public maxHealth: number = 100
  public currentMana: number = 50
  public maxMana: number = 50
  
  // 基础属性
  public strength: number = 10
  public dexterity: number = 10
  public intelligence: number = 10
  public vitality: number = 10
  
  // 战斗属性
  public damage: string = "10-15"
  public armor: number = 5
  public critChance: number = 5
  public attackSpeed: number = 1.0
  
  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite
  }
  
  // 获取X坐标
  public get x(): number {
    return this.sprite.x
  }
  
  // 获取Y坐标
  public get y(): number {
    return this.sprite.y
  }
  
  // 获得经验值
  public gainExperience(amount: number): void {
    this.experience += amount
    console.log(`获得 ${amount} 点经验值`)
    
    // 检查升级
    while (this.experience >= this.nextLevelExp) {
      this.levelUp()
    }
  }
  
  // 升级
  private levelUp(): void {
    this.experience -= this.nextLevelExp
    this.level++
    this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5)
    
    // 升级时增加属性
    this.maxHealth += 10
    this.currentHealth = this.maxHealth
    this.maxMana += 5
    this.currentMana = this.maxMana
    
    console.log(`升级到 ${this.level} 级！`)
  }
  
  // 受到伤害
  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount)
  }
  
  // 治疗
  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount)
  }
  
  // 检查是否死亡
  public isDead(): boolean {
    return this.currentHealth <= 0
  }
} 