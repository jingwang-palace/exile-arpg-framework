import * as Phaser from 'phaser'
import { 
  AscendancyQuest, 
  AscendancyQuestObjective, 
  AscendancyQuestType,
  AscendancyClass 
} from '../../types/ascendancy'
import { Player } from '../entities/Player'
import { CharacterClass } from '../../types/character'

export class AscendancyQuestManager {
  private scene: Phaser.Scene
  private player: Player
  private activeQuests: Map<string, AscendancyQuest>
  private questStates: Map<string, any>
  private questTimers: Map<string, Phaser.Time.TimerEvent>
  private quests: Map<string, AscendancyQuest> = new Map()
  
  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene
    this.player = player
    this.activeQuests = new Map()
    this.questStates = new Map()
    this.questTimers = new Map()
    this.initializeMarauderQuests()
  }

  // 初始化野蛮人升华任务
  private initializeMarauderQuests() {
    // 不朽之王试炼
    const juggernautQuest: AscendancyQuest = {
      id: 'marauder_juggernaut_trial',
      name: '不朽试炼',
      description: '证明你的坚韧不拔，成为真正的不朽之王',
      lore: '在卡鲁族的传说中，不朽之王是能够承受任何打击而不倒下的战士。要获得这个荣誉，你必须在最危险的战斗中展现出绝对的坚韧。',
      type: AscendancyQuestType.DEFENSE,
      ascendancyClass: AscendancyClass.JUGGERNAUT,
      requiredLevel: 15,
      objectives: [
        {
          id: 'survive_damage',
          type: 'survive',
          description: '在单次战斗中承受1000点伤害而不死亡',
          target: 1000,
          current: 0,
          isCompleted: false,
          specialConditions: ['不能使用生命药水', '必须依靠护甲和体质']
        },
        {
          id: 'block_attacks',
          type: 'interact',
          description: '成功格挡50次攻击',
          target: 50,
          current: 0,
          isCompleted: false
        },
        {
          id: 'endure_debuffs',
          type: 'survive',
          description: '同时承受5种不同的负面状态效果',
          target: 5,
          current: 0,
          isCompleted: false,
          specialConditions: ['冰冻', '燃烧', '中毒', '诅咒', '虚弱']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 5000,
        items: ['不朽之王的徽章'],
        title: '不朽之王',
        unlock: ['不朽天赋树']
      },
      isCompleted: false,
      isUnlocked: true,
      questGiver: '石守卫塔维克',
      location: '卡鲁石窟',
      specialMechanics: ['坚韧测试', '伤害吸收', '状态抗性'],
    };
    
    // 狂战士试炼
    const berserkerQuest: AscendancyQuest = {
      id: 'marauder_berserker_trial',
      name: '血怒试炼',
      description: '释放内心的野性，成为无可匹敌的狂战士',
      lore: '狂战士是卡鲁族最可怕的战士，他们在战斗中完全失去理智，以极致的暴力摧毁一切敌人。但这种力量需要巨大的代价。',
      type: AscendancyQuestType.BERSERKER_RAGE,
      ascendancyClass: AscendancyClass.BERSERKER,
      requiredLevel: 15,
      objectives: [
        {
          id: 'kill_in_rage',
          type: 'kill',
          description: '在狂怒状态下击杀100个敌人',
          target: 100,
          current: 0,
          isCompleted: false,
          specialConditions: ['必须处于低生命值状态', '伤害增加50%', '承受伤害增加30%']
        },
        {
          id: 'survive_berserking',
          type: 'survive',
          description: '在生命值低于25%的情况下存活300秒',
          target: 300,
          current: 0,
          isCompleted: false
        },
        {
          id: 'chain_kills',
          type: 'kill',
          description: '连续击杀20个敌人而不停止攻击',
          target: 20,
          current: 0,
          isCompleted: false,
          specialConditions: ['击杀间隔不能超过3秒']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 5000,
        items: ['狂战士的战斧'],
        title: '血怒狂战士',
        unlock: ['狂战士天赋树']
      },
      isCompleted: false,
      isUnlocked: true,
      questGiver: '血战士格罗姆',
      location: '血怒竞技场',
      specialMechanics: ['狂怒状态', '低血量加成', '连击系统']
    };
    
    // 酋长试炼
    const chieftainQuest: AscendancyQuest = {
      id: 'marauder_chieftain_trial',
      name: '火焰图腾试炼',
      description: '与祖先之灵沟通，成为部落的精神领袖',
      lore: '酋长不仅是战士，更是部落的精神支柱。他们能够与祖先之灵沟通，召唤火焰图腾保护族人，并掌控原始的火焰力量。',
      type: AscendancyQuestType.TOTEM_RITUAL,
      ascendancyClass: AscendancyClass.CHIEFTAIN,
      requiredLevel: 15,
      objectives: [
        {
          id: 'summon_totems',
          type: 'interact',
          description: '召唤并维持火焰图腾10分钟',
          target: 600, // 600秒
          current: 0,
          isCompleted: false,
          specialConditions: ['图腾不能被摧毁', '必须同时维持3个图腾']
        },
        {
          id: 'fire_damage_dealt',
          type: 'kill',
          description: '用火焰伤害击杀50个敌人',
          target: 50,
          current: 0,
          isCompleted: false
        },
        {
          id: 'commune_with_spirits',
          type: 'channel',
          description: '与祖先之灵进行心灵交流',
          target: 1,
          current: 0,
          isCompleted: false,
          specialConditions: ['需要在圣火祭坛前冥想', '不能被打断']
        }
      ],
      rewards: {
        ascendancyPoints: 2,
        experience: 5000,
        items: ['酋长的图腾杖'],
        title: '火焰酋长',
        unlock: ['酋长天赋树']
      },
      isCompleted: false,
      isUnlocked: true,
      questGiver: '老萨满卡拉克',
      location: '祖先圣地',
      specialMechanics: ['图腾召唤', '火焰掌控', '灵魂交流']
    };
    
    // 将任务添加到管理器
    this.quests.set(juggernautQuest.id, juggernautQuest);
    this.quests.set(berserkerQuest.id, berserkerQuest);
    this.quests.set(chieftainQuest.id, chieftainQuest);
    
    console.log('✅ 野蛮人升华任务已初始化:', this.quests.size, '个任务');
  }

  // 开始特殊升华任务
  public startSpecialQuest(quest: AscendancyQuest): void {
    this.activeQuests.set(quest.id, quest)
    this.questStates.set(quest.id, this.initializeQuestState(quest))
    
    console.log(`\n=== 开始升华任务: ${quest.name} ===`)
    console.log(`任务给予者: ${quest.questGiver}`)
    console.log(`任务地点: ${quest.location}`)
    console.log(`背景故事: ${quest.lore}`)
    console.log(`描述: ${quest.description}`)
    
    // 根据任务类型设置特殊机制
    this.setupQuestMechanics(quest)
  }

  // 初始化任务状态
  private initializeQuestState(quest: AscendancyQuest): any {
    const state: any = {
      startTime: Date.now(),
      isActive: true,
      specialData: {}
    }

    // 根据升华职业初始化特殊状态
    switch (quest.ascendancyClass) {
      case AscendancyClass.GUARDIAN:
        state.protectedNPCs = []
        state.damageAbsorbed = 0
        break
        
      case AscendancyClass.CHAMPION:
        state.arenaWins = 0
        state.perfectCombat = false
        state.currentStreak = 0
        break
        
      case AscendancyClass.GLADIATOR:
        state.currentWave = 0
        state.lowHealthKills = 0
        state.bloodLustActive = false
        break
        
      case AscendancyClass.ELEMENTALIST:
        state.elementalMeditation = {
          fire: false,
          ice: false,
          lightning: false
        }
        state.meditationProgress = 0
        break
        
      case AscendancyClass.OCCULTIST:
        state.shadowEssence = 0
        state.ritualProgress = 0
        state.cursedState = false
        break
        
      case AscendancyClass.NECROMANCER:
        state.spiritsCommuned = 0
        state.skeletonSummoned = false
        state.skeletonAliveTime = 0
        break
        
      case AscendancyClass.ASSASSIN:
        state.stealthKills = 0
        state.infiltrationProgress = 0
        state.detected = false
        break
        
      case AscendancyClass.PATHFINDER:
        state.herbsCollected = new Set()
        state.potionBrewed = false
        state.nightTime = false
        break
        
      case AscendancyClass.BEASTMASTER:
        state.beastsCommuned = new Set()
        state.totemActive = false
        state.totemStartTime = 0
        break
    }

    return state
  }

  // 设置任务特殊机制
  private setupQuestMechanics(quest: AscendancyQuest): void {
    switch (quest.type) {
      case AscendancyQuestType.PROTECTION:
        this.setupProtectionMechanics(quest)
        break
        
      case AscendancyQuestType.ARENA_COMBAT:
        this.setupArenaMechanics(quest)
        break
        
      case AscendancyQuestType.BLOOD_TRIAL:
        this.setupBloodTrialMechanics(quest)
        break
        
      case AscendancyQuestType.ELEMENTAL_MASTERY:
        this.setupElementalMechanics(quest)
        break
        
      case AscendancyQuestType.DARK_RITUAL:
        this.setupDarkRitualMechanics(quest)
        break
        
      case AscendancyQuestType.SPIRIT_COMMUNION:
        this.setupSpiritMechanics(quest)
        break
        
      case AscendancyQuestType.STEALTH_TRIAL:
        this.setupStealthMechanics(quest)
        break
        
      case AscendancyQuestType.NATURE_HARMONY:
        this.setupNatureMechanics(quest)
        break
        
      case AscendancyQuestType.PRIMAL_BOND:
        this.setupPrimalMechanics(quest)
        break
    }
  }

  // 守护者保护任务机制
  private setupProtectionMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 守护者试炼开始 ---')
    console.log('特殊机制:')
    console.log('• 护盾机制: 受到伤害时有几率激活护盾')
    console.log('• 嘲讽效果: 自动吸引附近敌人的注意')
    console.log('• 伤害转移: 可以将盟友受到的伤害转移到自己身上')
    
    // 生成5个需要保护的村民NPC
    this.spawnProtectedNPCs(quest.id, 5)
    
    // 设置5分钟保护时间
    const protectionTimer = this.scene.time.delayedCall(300000, () => {
      this.checkProtectionSuccess(quest.id)
    })
    
    this.questTimers.set(quest.id, protectionTimer)
  }

  // 冠军竞技场机制
  private setupArenaMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 竞技场荣耀开始 ---')
    console.log('竞技场规则:')
    console.log('• 荣誉决斗: 必须公平单挑，不能使用药剂')
    console.log('• 观众加成: 连胜时获得观众欢呼加成')
    console.log('• 连击系统: 连续攻击可以获得额外伤害')
    
    this.spawnArenaOpponents(quest.id, 3)
  }

  // 角斗士血腥试炼机制
  private setupBloodTrialMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 血腥角斗开始 ---')
    console.log('角斗场机制:')
    console.log('• 嗜血效果: 击杀敌人时恢复生命值')
    console.log('• 低血量增伤: 生命值越低，伤害越高')
    console.log('• 狂怒状态: 连续击杀可进入狂怒状态')
    
    this.startWaveSpawning(quest.id, 10)
  }

  // 元素使元素掌控机制
  private setupElementalMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 元素觉醒试炼开始 ---')
    console.log('元素圣殿机制:')
    console.log('• 元素共鸣: 在对应元素区域内获得抗性和伤害加成')
    console.log('• 元素抗性考验: 必须抵抗对应元素的持续伤害')
    console.log('• 元素融合: 完成三元素冥想后可以融合元素力量')
    
    this.createElementalShrines(quest.id)
  }

  // 咒术师暗影仪式机制
  private setupDarkRitualMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 暗影仪式开始 ---')
    console.log('暗影仪式机制:')
    console.log('• 诅咒效果: 仪式期间会受到各种debuff')
    console.log('• 暗影庇护: 在黑暗中获得伤害减免')
    console.log('• 精神抗性: 需要抵抗精神污染效果')
    
    this.setupDarkRitualSites(quest.id)
  }

  // 召唤师灵魂交流机制
  private setupSpiritMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 亡灵交流试炼开始 ---')
    console.log('灵魂交流机制:')
    console.log('• 灵魂视觉: 可以看到普通人看不见的灵魂')
    console.log('• 亡灵召唤: 可以召唤和控制亡灵生物')
    console.log('• 生命汲取: 从亡灵身上汲取生命力')
    
    this.spawnWanderingSpirits(quest.id, 5)
  }

  // 死神潜行试炼机制
  private setupStealthMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 暗影试炼开始 ---')
    console.log('潜行机制:')
    console.log('• 隐身系统: 可以进入隐身状态避开敌人')
    console.log('• 暗杀机制: 从背后攻击可以造成致命伤害')
    console.log('• 敏捷考验: 需要快速移动避开巡逻路线')
    
    this.setupStealthArea(quest.id)
  }

  // 探路者自然和谐机制
  private setupNatureMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 自然之路试炼开始 ---')
    console.log('自然机制:')
    console.log('• 自然感知: 可以感知到稀有植物的位置')
    console.log('• 炼金专精: 制作药剂时有几率获得额外效果')
    console.log('• 药剂强化: 使用药剂时效果翻倍')
    
    this.spawnRareHerbs(quest.id, 10)
  }

  // 驯兽师原始契约机制
  private setupPrimalMechanics(quest: AscendancyQuest): void {
    console.log('\n--- 原始契约试炼开始 ---')
    console.log('原始机制:')
    console.log('• 野兽交流: 可以与野生动物进行心灵沟通')
    console.log('• 图腾力量: 建立图腾可以召唤野兽盟友')
    console.log('• 自然和谐: 在自然环境中获得各种加成')
    
    this.spawnWildBeasts(quest.id, 5)
  }

  // 更新任务进度
  public updateQuestProgress(questId: string, eventType: string, data: any): void {
    const quest = this.activeQuests.get(questId)
    const state = this.questStates.get(questId)
    
    if (!quest || !state) return

    switch (quest.type) {
      case AscendancyQuestType.PROTECTION:
        this.updateProtectionProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.ARENA_COMBAT:
        this.updateArenaProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.BLOOD_TRIAL:
        this.updateBloodTrialProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.ELEMENTAL_MASTERY:
        this.updateElementalProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.DARK_RITUAL:
        this.updateDarkRitualProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.SPIRIT_COMMUNION:
        this.updateSpiritProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.STEALTH_TRIAL:
        this.updateStealthProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.NATURE_HARMONY:
        this.updateNatureProgress(quest, state, eventType, data)
        break
        
      case AscendancyQuestType.PRIMAL_BOND:
        this.updatePrimalProgress(quest, state, eventType, data)
        break
    }
  }

  // 更新保护任务进度
  private updateProtectionProgress(quest: AscendancyQuest, state: any, eventType: string, data: any): void {
    switch (eventType) {
      case 'npc_died':
        console.log('❌ 村民死亡！任务失败！')
        this.failQuest(quest.id)
        break
        
      case 'damage_absorbed':
        state.damageAbsorbed += data.amount
        console.log(`护盾吸收伤害: ${data.amount} (总计: ${state.damageAbsorbed}/1000)`)
        
        if (state.damageAbsorbed >= 1000) {
          this.updateObjective(quest.id, 'absorb_damage', 1000)
        }
        break
        
      case 'protection_time_end':
        if (state.protectedNPCs.length === 5) {
          this.updateObjective(quest.id, 'protect_villagers', 5)
          console.log('✅ 成功保护所有村民!')
        }
        break
    }
  }

  // 更新竞技场进度
  private updateArenaProgress(quest: AscendancyQuest, state: any, eventType: string, data: any): void {
    switch (eventType) {
      case 'arena_victory':
        state.arenaWins++
        state.currentStreak++
        console.log(`竞技场胜利! (${state.arenaWins}/3)`)
        
        if (state.arenaWins >= 3) {
          this.updateObjective(quest.id, 'arena_victories', 3)
        }
        break
        
      case 'perfect_victory':
        state.perfectCombat = true
        console.log('✅ 完美战斗达成!')
        this.updateObjective(quest.id, 'perfect_combat', 1)
        break
        
      case 'took_damage':
        state.perfectCombat = false
        console.log('受到伤害，完美战斗失败')
        break
    }
  }

  // 更新血腥试炼进度
  private updateBloodTrialProgress(quest: AscendancyQuest, state: any, eventType: string, data: any): void {
    switch (eventType) {
      case 'wave_completed':
        state.currentWave++
        console.log(`完成第${state.currentWave}波 (${state.currentWave}/10)`)
        
        if (state.currentWave >= 10) {
          this.updateObjective(quest.id, 'survive_waves', 10)
        }
        break
        
      case 'low_health_kill':
        if (this.player.currentHealth / this.player.maxHealth <= 0.25) {
          state.lowHealthKills++
          console.log(`低血量击杀! (${state.lowHealthKills}/20)`)
          
          if (state.lowHealthKills >= 20) {
            this.updateObjective(quest.id, 'low_life_kills', 20)
          }
        }
        break
    }
  }

  // 更新元素掌控进度
  private updateElementalProgress(quest: AscendancyQuest, state: any, eventType: string, data: any): void {
    switch (eventType) {
      case 'meditation_progress':
        const element = data.element
        state.meditationProgress[element] = data.progress
        
        console.log(`${element}元素冥想进度: ${data.progress}/30秒`)
        
        if (data.progress >= 30) {
          state.elementalMeditation[element] = true
          console.log(`✅ ${element}元素掌控完成!`)
          
          this.updateObjective(quest.id, `${element}_mastery`, 30)
        }
        break
    }
  }

  // 检查任务完成
  private checkQuestCompletion(questId: string): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    const allCompleted = quest.objectives.every(obj => obj.isCompleted || obj.isOptional)
    
    if (allCompleted) {
      this.completeQuest(questId)
    }
  }

  // 完成任务
  private completeQuest(questId: string): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    quest.isCompleted = true
    
    console.log(`\n🎉 === 升华任务完成: ${quest.name} ===`)
    console.log(`获得升华点数: ${quest.rewards.ascendancyPoints}`)
    
    if (quest.rewards.title) {
      console.log(`获得头衔: ${quest.rewards.title}`)
    }
    
    if (quest.rewards.items) {
      console.log(`获得物品: ${quest.rewards.items.join(', ')}`)
    }
    
    // 清理任务状态
    this.cleanupQuest(questId)
    
    // 通知升华系统
    this.scene.events.emit('ascendancy_quest_completed', quest)
  }

  // 任务失败
  private failQuest(questId: string): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    console.log(`\n💀 === 升华任务失败: ${quest.name} ===`)
    console.log('可以重新尝试任务')
    
    this.cleanupQuest(questId)
    
    // 重置任务状态，允许重试
    quest.isCompleted = false
    quest.objectives.forEach(obj => {
      obj.current = 0
      obj.isCompleted = false
    })
  }

  // 清理任务
  private cleanupQuest(questId: string): void {
    const timer = this.questTimers.get(questId)
    if (timer) {
      timer.remove()
      this.questTimers.delete(questId)
    }
    
    this.questStates.delete(questId)
  }

  // 更新目标进度
  private updateObjective(questId: string, objectiveId: string, progress: number): void {
    const quest = this.activeQuests.get(questId)
    if (!quest) return
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId)
    if (!objective) return
    
    objective.current = progress
    
    if (objective.current >= objective.target) {
      objective.isCompleted = true
      console.log(`✅ 任务目标完成: ${objective.description}`)
    }
    
    this.checkQuestCompletion(questId)
  }

  // 辅助方法 - 生成保护对象
  private spawnProtectedNPCs(questId: string, count: number): void {
    console.log(`生成${count}个需要保护的村民...`)
    // 实际实现中在此创建NPC
  }

  // 辅助方法 - 生成竞技场对手
  private spawnArenaOpponents(questId: string, count: number): void {
    console.log(`生成${count}个竞技场对手...`)
    // 实际实现中在此创建对手
  }

  // 辅助方法 - 开始波次生成
  private startWaveSpawning(questId: string, waves: number): void {
    console.log(`开始${waves}波怪物攻击...`)
    // 实际实现中在此开始波次生成
  }

  // 辅助方法 - 创建元素圣殿
  private createElementalShrines(questId: string): void {
    console.log('创建火、冰、雷三个元素圣殿...')
    // 实际实现中在此创建圣殿
  }

  // 辅助方法 - 设置暗影仪式点
  private setupDarkRitualSites(questId: string): void {
    console.log('设置暗影仪式祭坛...')
    // 实际实现中在此设置仪式点
  }

  // 辅助方法 - 生成游荡灵魂
  private spawnWanderingSpirits(questId: string, count: number): void {
    console.log(`生成${count}个游荡的灵魂...`)
    // 实际实现中在此生成灵魂
  }

  // 辅助方法 - 设置潜行区域
  private setupStealthArea(questId: string): void {
    console.log('设置潜行试炼区域...')
    // 实际实现中在此设置潜行区域
  }

  // 辅助方法 - 生成稀有草药
  private spawnRareHerbs(questId: string, count: number): void {
    console.log(`在森林中散布${count}种稀有草药...`)
    // 实际实现中在此生成草药
  }

  // 辅助方法 - 生成野兽
  private spawnWildBeasts(questId: string, count: number): void {
    console.log(`在丛林中生成${count}种野兽...`)
    // 实际实现中在此生成野兽
  }

  // 检查保护成功
  private checkProtectionSuccess(questId: string): void {
    const state = this.questStates.get(questId)
    if (state && state.protectedNPCs.length === 5) {
      this.updateQuestProgress(questId, 'protection_time_end', {})
    }
  }

  // 获取任务状态
  public getQuestState(questId: string): any {
    return this.questStates.get(questId)
  }

  // 获取活跃任务
  public getActiveQuest(questId: string): AscendancyQuest | undefined {
    return this.activeQuests.get(questId)
  }

  // 获取指定升华职业的任务
  public getQuestForAscendancy(ascendancyClass: AscendancyClass): AscendancyQuest | undefined {
    for (const quest of this.quests.values()) {
      if (quest.ascendancyClass === ascendancyClass) {
        return quest;
      }
    }
    return undefined;
  }
  
  // 获取所有可用任务
  public getAvailableQuests(): AscendancyQuest[] {
    return Array.from(this.quests.values()).filter(quest => quest.isUnlocked);
  }
  
  // 开始任务
  public startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (quest && quest.isUnlocked && !quest.isCompleted) {
      console.log(`开始升华任务: ${quest.name}`);
      return true;
    }
    return false;
  }
  
  // 检查任务完成状态
  public isQuestCompleted(questId: string): boolean {
    const quest = this.quests.get(questId);
    return quest ? quest.isCompleted : false;
  }
} 