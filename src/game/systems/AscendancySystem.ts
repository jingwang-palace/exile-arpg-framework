import * as Phaser from 'phaser'
import { 
  AscendancyClass, 
  AscendancyTree, 
  AscendancyNode, 
  AscendancyNodeType,
  AscendancyEffect,
  AscendancyEffectType,
  PlayerAscendancy, 
  AscendancyTrial,
  AscendancyQuest,
  AscendancyQuestObjective,
  ASCENDANCY_MAPPING,
  ASCENDANCY_QUESTS
} from '../../types/ascendancy'
import { CharacterClass } from '../../types/character'

export class AscendancySystem {
  private scene: Phaser.Scene
  private ascendancyTrees: Map<AscendancyClass, AscendancyTree>
  private playerAscendancy: PlayerAscendancy
  private currentQuests: Map<string, AscendancyQuest>
  private questObjectives: Map<string, AscendancyQuestObjective[]>
  
  constructor(scene: Phaser.Scene, player?: any) {
    this.scene = scene
    this.ascendancyTrees = new Map()
    this.currentQuests = new Map()
    this.questObjectives = new Map()
    
    // 初始化玩家升华状态
    this.playerAscendancy = {
      allocatedNodes: [],
      availablePoints: 0,
      completedQuests: [],
      isUnlocked: false
    }
    
    this.initializeAscendancyTrees()
    this.initializeAscendancyQuests()
  }

  private initializeAscendancyTrees(): void {
    // 守护者升华树
    this.ascendancyTrees.set(AscendancyClass.GUARDIAN, {
      ascendancyClass: AscendancyClass.GUARDIAN,
      baseClass: CharacterClass.Templar,
      name: '守护者',
      description: '专精防御和保护盟友的战士',
      lore: '守护者以保护他人为己任，用自己的身躯为盟友挡下致命攻击。他们不是为了荣耀而战，而是为了身后珍视的生命。',
      nodes: this.createGuardianNodes(),
      maxPoints: 8,
      unlockLevel: 15,
      questRequirements: ['guardian_trial_of_protection'],
      questGiver: '老守卫长莱昂',
      questLocation: '边境哨所'
    })

    // 其他升华树...
    this.createOtherAscendancyTrees()
  }

  // 创建其他升华树
  private createOtherAscendancyTrees(): void {
    // 冠军
    this.ascendancyTrees.set(AscendancyClass.CHAMPION, {
      ascendancyClass: AscendancyClass.CHAMPION,
      baseClass: CharacterClass.Duelist,
      name: '冠军',
      description: '攻守兼备的完美战士',
      lore: '冠军是竞技场上的传奇。',
      nodes: this.createChampionNodes(),
      maxPoints: 8,
      unlockLevel: 15,
      questRequirements: ['champion_arena_trial'],
      questGiver: '竞技场管理员马库斯',
      questLocation: '斗兽场'
    })

    // 角斗士
    this.ascendancyTrees.set(AscendancyClass.GLADIATOR, {
      ascendancyClass: AscendancyClass.GLADIATOR,
      baseClass: CharacterClass.Duelist,
      name: '角斗士',
      description: '嗜血狂暴的近战杀手',
      lore: '角斗士在血腥的角斗场中成长。',
      nodes: this.createGladiatorNodes(),
      maxPoints: 8,
      unlockLevel: 15,
      questRequirements: ['gladiator_blood_trial'],
      questGiver: '前角斗士冠军巴尔',
      questLocation: '地下角斗场'
    })

    // 其他升华职业...（简化版本）
    // 这里可以添加更多升华职业的初始化
  }

  private initializeAscendancyQuests(): void {
    // 加载所有升华任务
    Object.entries(ASCENDANCY_QUESTS).forEach(([ascendancy, quests]) => {
      quests.forEach(quest => {
        this.currentQuests.set(quest.id, { ...quest })
        this.questObjectives.set(quest.id, [...quest.objectives])
      })
    })
  }

  // 获取可用的升华职业
  public getAvailableAscendancies(): AscendancyClass[] {
    // 暂时返回战士的升华职业
    return [AscendancyClass.GUARDIAN, AscendancyClass.CHAMPION, AscendancyClass.GLADIATOR]
  }

  // 获取可用的升华任务
  public getAvailableQuests(): AscendancyQuest[] {
    const quests: AscendancyQuest[] = []
    
    // 遍历所有任务，返回已解锁但未完成的任务
    this.currentQuests.forEach((quest) => {
      // 暂时让一些任务解锁用于测试
      if (!quest.isCompleted) {
        quest.isUnlocked = true
        quests.push(quest)
      }
    })
    
    return quests
  }

  // 获取升华树
  public getAscendancyTree(ascendancyClass: AscendancyClass): AscendancyTree | undefined {
    return this.ascendancyTrees.get(ascendancyClass)
  }

  // 获取玩家升华状态
  public getPlayerAscendancy(): PlayerAscendancy {
    return this.playerAscendancy
  }

  // 选择升华职业
  public selectAscendancy(ascendancyClass: AscendancyClass): boolean {
    this.playerAscendancy.selectedClass = ascendancyClass
    console.log(`选择了升华职业: ${ascendancyClass}`)
    return true
  }

  // 创建守护者节点（示例）
  private createGuardianNodes(): AscendancyNode[] {
    return [
      {
        id: 'guardian_bastion',
        name: '坚壁堡垒',
        description: '+12% 最大生命值\n+8% 元素抗性',
        type: AscendancyNodeType.NOTABLE,
        cost: 1,
        position: { x: 0.5, y: 0.2 },
        isAllocated: false,
        requirements: [],
        effects: [
          { type: AscendancyEffectType.INCREASED_LIFE, value: 12, description: '+12% 最大生命值' }
        ],
        lore: '如堡垒般坚不可摧的防御意志'
      }
    ]
  }

  // 创建冠军节点（示例）
  private createChampionNodes(): AscendancyNode[] {
    return [
      {
        id: 'champion_determination',
        name: '坚定意志',
        description: '+10% 攻击伤害\n+10% 最大生命值',
        type: AscendancyNodeType.NOTABLE,
        cost: 1,
        position: { x: 0.5, y: 0.2 },
        isAllocated: false,
        requirements: [],
        effects: [
          { type: AscendancyEffectType.INCREASED_DAMAGE, value: 10, description: '+10% 攻击伤害' }
        ],
        lore: '冠军的坚定意志，攻守兼备'
      }
    ]
  }

  // 创建角斗士节点（示例）
  private createGladiatorNodes(): AscendancyNode[] {
    return [
      {
        id: 'gladiator_blood_lust',
        name: '嗜血狂怒',
        description: '生命值低于50%时，+25% 攻击伤害',
        type: AscendancyNodeType.KEYSTONE,
        cost: 1,
        position: { x: 0.5, y: 0.2 },
        isAllocated: false,
        requirements: [],
        effects: [
          { type: AscendancyEffectType.TRIGGERED_EFFECT, value: 25, description: '生命值低于50%时，+25% 攻击伤害' }
        ],
        lore: '濒死时的狂怒让角斗士战力倍增'
      }
    ]
  }
} 