// 通用游戏数据存储管理器
export class GameStore {
  private static instance: GameStore;
  private readonly STORAGE_KEY = 'poe_game_data';
  
  // 游戏数据结构
  private gameData = {
    // 玩家基础信息
    player: {
      name: '流亡者',
      class: null as string | null, // 玩家选择的基础职业
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      gold: 0
    },
    
    // 属性数据
    stats: {
      strength: 16,
      dexterity: 7,
      intelligence: 6,
      vitality: 14,
      armor: 5,
      damage: "10-15",
      critChance: 5,
      attackSpeed: 1.0
    },
    
    // 技能数据
    skills: [] as any[],
    availableSkillPoints: 2,
    currentActiveStrikeSkill: null as string | null,
    
    // 天赋数据
    talents: [] as any[],
    availableTalentPoints: 1,
    
    // 背包数据
    inventory: [] as any[],
    
    // 升华数据
    ascendancy: {
      selectedClass: null as string | null,
      completedQuests: [] as string[],
      availablePoints: 0,
      allocatedNodes: [] as string[]
    },
    
    // 游戏进度
    progress: {
      currentArea: 'town',
      completedAreas: [] as string[],
      unlockedFeatures: ['skills', 'inventory', 'stats'] as string[]
    },
    
    // 时间戳
    lastSaved: Date.now(),
    playTime: 0
  };
  
  private constructor() {
    this.loadData();
  }
  
  // 单例模式
  public static getInstance(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore();
    }
    return GameStore.instance;
  }
  
  // === 数据持久化 ===
  
  // 保存数据到localStorage
  public saveData(): void {
    try {
      this.gameData.lastSaved = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.gameData));
      console.log('✅ 游戏数据已保存');
    } catch (error) {
      console.error('❌ 保存游戏数据失败:', error);
    }
  }
  
  // 从localStorage加载数据
  public loadData(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.gameData = { ...this.gameData, ...parsed };
        console.log('✅ 游戏数据已加载');
      }
    } catch (error) {
      console.error('❌ 加载游戏数据失败:', error);
    }
  }
  
  // 清空数据
  public clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.gameData = {
      ...this.gameData,
      player: {
        ...this.gameData.player,
        class: null
      },
      skills: [],
      availableSkillPoints: 10,
      talents: [],
      availableTalentPoints: 5,
      inventory: [],
      gold: 0,
      ascendancy: {
        selectedClass: null,
        completedQuests: [],
        availablePoints: 0,
        allocatedNodes: []
      }
    };
    console.log('✅ 游戏数据已重置');
  }
  
  // === 玩家基础数据操作 ===
  
  // 获取玩家数据
  public getPlayer() {
    return { ...this.gameData.player };
  }
  
  // 设置玩家职业
  public setPlayerClass(characterClass: string): void {
    this.gameData.player.class = characterClass;
    this.saveData();
    console.log('✅ 设置玩家职业:', characterClass);
  }
  
  // 更新玩家血量
  public updateHealth(health: number, maxHealth?: number): void {
    this.gameData.player.health = Math.max(0, health);
    if (maxHealth !== undefined) {
      this.gameData.player.maxHealth = maxHealth;
    }
    this.saveData();
  }
  
  // 加血
  public healPlayer(amount: number): void {
    const newHealth = Math.min(
      this.gameData.player.health + amount, 
      this.gameData.player.maxHealth
    );
    this.updateHealth(newHealth);
  }
  
  // 扣血
  public damagePlayer(amount: number): void {
    const newHealth = this.gameData.player.health - amount;
    this.updateHealth(newHealth);
  }
  
  // 更新金币
  public updateGold(amount: number): void {
    this.gameData.player.gold = Math.max(0, this.gameData.player.gold + amount);
    this.saveData();
  }
  
  // 获取金币
  public getGold(): number {
    return this.gameData.player.gold;
  }
  
  // === 技能系统操作 ===
  
  // 获取技能数据
  public getSkills() {
    return {
      skills: [...this.gameData.skills],
      availablePoints: this.gameData.availableSkillPoints,
      activeStrikeSkill: this.gameData.currentActiveStrikeSkill
    };
  }
  
  // 更新技能数据
  public updateSkills(skills: any[], availablePoints: number, activeStrikeSkill?: string | null): void {
    this.gameData.skills = [...skills];
    this.gameData.availableSkillPoints = availablePoints;
    if (activeStrikeSkill !== undefined) {
      this.gameData.currentActiveStrikeSkill = activeStrikeSkill;
    }
    this.saveData();
    console.log('✅ 技能数据已更新，剩余技能点:', availablePoints);
  }
  
  // 技能升级
  public upgradeSkill(skillId: string): boolean {
    const skill = this.gameData.skills.find(s => s.id === skillId);
    if (skill && !skill.locked && skill.level < skill.maxLevel && this.gameData.availableSkillPoints > 0) {
      skill.level++;
      this.gameData.availableSkillPoints--;
      this.saveData();
      console.log(`✅ 技能 ${skill.name} 升级到 ${skill.level} 级`);
      return true;
    }
    return false;
  }
  
  // === 天赋系统操作 ===
  
  // 获取天赋数据
  public getTalents() {
    return {
      talents: [...this.gameData.talents],
      availablePoints: this.gameData.availableTalentPoints
    };
  }
  
  // 更新天赋数据
  public updateTalents(talents: any[], availablePoints: number): void {
    this.gameData.talents = [...talents];
    this.gameData.availableTalentPoints = availablePoints;
    this.saveData();
  }
  
  // === 背包系统操作 ===
  
  // 获取背包
  public getInventory() {
    return [...this.gameData.inventory];
  }
  
  // 添加物品
  public addItem(item: any): boolean {
    if (this.gameData.inventory.length < 20) { // 背包上限
      this.gameData.inventory.push(item);
      this.saveData();
      console.log('✅ 获得物品:', item.name);
      return true;
    }
    console.log('❌ 背包已满');
    return false;
  }
  
  // 移除物品
  public removeItem(itemId: string): boolean {
    const index = this.gameData.inventory.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const item = this.gameData.inventory.splice(index, 1)[0];
      this.saveData();
      console.log('✅ 移除物品:', item.name);
      return true;
    }
    return false;
  }
  
  // === 升华系统操作 ===
  
  // 获取升华数据
  public getAscendancy() {
    return { ...this.gameData.ascendancy };
  }
  
  // 选择升华职业
  public selectAscendancy(ascendancyClass: string): void {
    this.gameData.ascendancy.selectedClass = ascendancyClass;
    this.saveData();
    console.log('✅ 选择升华职业:', ascendancyClass);
  }
  
  // 完成升华任务
  public completeAscendancyQuest(questId: string, reward: number = 2): void {
    if (!this.gameData.ascendancy.completedQuests.includes(questId)) {
      this.gameData.ascendancy.completedQuests.push(questId);
      this.gameData.ascendancy.availablePoints += reward;
      this.saveData();
      console.log('✅ 完成升华任务:', questId, '获得升华点:', reward);
    }
  }
  
  // === 游戏进度操作 ===
  
  // 更新当前区域
  public updateCurrentArea(area: string): void {
    this.gameData.progress.currentArea = area;
    this.saveData();
  }
  
  // 完成区域
  public completeArea(area: string): void {
    if (!this.gameData.progress.completedAreas.includes(area)) {
      this.gameData.progress.completedAreas.push(area);
      this.saveData();
      console.log('✅ 完成区域:', area);
    }
  }
  
  // 解锁功能
  public unlockFeature(feature: string): void {
    if (!this.gameData.progress.unlockedFeatures.includes(feature)) {
      this.gameData.progress.unlockedFeatures.push(feature);
      this.saveData();
      console.log('✅ 解锁功能:', feature);
    }
  }
  
  // === 战斗相关操作 ===
  
  // 处理战斗奖励
  public processCombatReward(exp: number, gold: number, items: any[] = []): void {
    // 经验值
    this.gameData.player.experience += exp;
    
    // 金币
    this.updateGold(gold);
    
    // 物品
    items.forEach(item => this.addItem(item));
    
    console.log(`✅ 战斗奖励: +${exp}经验 +${gold}金币 +${items.length}件物品`);
  }
  
  // === 数据查询 ===
  
  // 获取完整数据（调试用）
  public getAllData() {
    return { ...this.gameData };
  }
  
  // 获取数据摘要
  public getDataSummary() {
    return {
      playerLevel: this.gameData.player.level,
      playerClass: this.gameData.player.class || '未选择',
      health: `${this.gameData.player.health}/${this.gameData.player.maxHealth}`,
      gold: this.gameData.player.gold,
      skillPoints: this.gameData.availableSkillPoints,
      talentPoints: this.gameData.availableTalentPoints,
      inventoryCount: this.gameData.inventory.length,
      ascendancy: this.gameData.ascendancy.selectedClass || '未选择',
      lastSaved: new Date(this.gameData.lastSaved).toLocaleString()
    };
  }
}

// 导出单例实例
export const gameStore = GameStore.getInstance(); 