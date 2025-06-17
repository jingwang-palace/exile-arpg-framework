import Phaser from 'phaser';
import { Character, CharacterClass } from '../../types/character';
import SaveManager from '../../services/SaveManager';

interface CharacterData {
  id: string;
  name: string;
  class: string;
  classEnum: CharacterClass;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
  };
  description: string;
  color: number;
  level?: number;
}

export default class CharacterSelectScene extends Phaser.Scene {
  private characters: CharacterData[] = [];
  private savedCharacters: Character[] = [];
  private selectedIndex: number = 0;
  private nameText!: Phaser.GameObjects.Text;
  private classText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private characterSprite!: Phaser.GameObjects.Graphics;
  private leftButton!: Phaser.GameObjects.Image;
  private rightButton!: Phaser.GameObjects.Image;
  private startButton!: Phaser.GameObjects.Text;
  private inputField!: Phaser.GameObjects.DOMElement;
  private selectMode: 'template' | 'saved' = 'template';
  private templateButton!: Phaser.GameObjects.Text;
  private savedButton!: Phaser.GameObjects.Text;
  private saveCharacterContainer!: Phaser.GameObjects.Container;
  private deleteButton!: Phaser.GameObjects.Text;
  private nameInput!: HTMLInputElement;

  constructor() {
    super('CharacterSelectScene');
  }

  init() {
    // 获取保存的角色
    this.savedCharacters = SaveManager.getCharacters();
    
    // 初始化新角色模板数据
    this.characters = [
      {
        id: 'marauder',
        name: '野蛮人',
        class: '力量型近战战士',
        classEnum: CharacterClass.Marauder,
        stats: {
          strength: 16,
          dexterity: 7,
          intelligence: 6,
          vitality: 14
        },
        description: '来自卡鲁部落的战士，擅长使用重武器和高生命值。他依靠蛮力解决一切问题。',
        color: 0xe74c3c
      },
      {
        id: 'ranger',
        name: '游侠',
        class: '敏捷型远程射手',
        classEnum: CharacterClass.Ranger,
        stats: {
          strength: 8,
          dexterity: 16,
          intelligence: 10,
          vitality: 9
        },
        description: '擅长使用弓箭的猎人，依靠敏捷和速度在战场上取胜。她的射击精准致命。',
        color: 0x2ecc71
      },
      {
        id: 'witch',
        name: '女巫',
        class: '智力型法术施法者',
        classEnum: CharacterClass.Witch,
        stats: {
          strength: 6,
          dexterity: 8,
          intelligence: 18,
          vitality: 8
        },
        description: '掌握元素和混沌魔法的施法者，她的法术可以摧毁一切。高智力使她成为法术大师。',
        color: 0x3498db
      },
      {
        id: 'duelist',
        name: '决斗者',
        class: '力敏混合型战士',
        classEnum: CharacterClass.Duelist,
        stats: {
          strength: 12,
          dexterity: 14,
          intelligence: 8,
          vitality: 10
        },
        description: '灵活的剑术大师，兼具力量和敏捷。他的战斗风格优雅而致命，擅长单体决斗。',
        color: 0xf1c40f
      },
      {
        id: 'shadow',
        name: '暗影',
        class: '敏智混合型刺客',
        classEnum: CharacterClass.Shadow,
        stats: {
          strength: 7,
          dexterity: 15,
          intelligence: 12,
          vitality: 8
        },
        description: '暗杀者和陷阱专家，依靠速度和隐蔽行动。他可以在敌人察觉之前给予致命一击。',
        color: 0x9b59b6
      },
      {
        id: 'templar',
        name: '圣堂武僧',
        classEnum: CharacterClass.Templar,
        class: '力智混合型圣骑士',
        stats: {
          strength: 14,
          dexterity: 6,
          intelligence: 14,
          vitality: 12
        },
        description: '虔诚的战士，兼具力量和魔法能力。他的信仰赋予他强大的力量和神圣魔法。',
        color: 0xf39c12
      },
      {
        id: 'scion',
        name: '贵族',
        class: '全能型战士',
        classEnum: CharacterClass.Scion,
        stats: {
          strength: 11,
          dexterity: 11,
          intelligence: 11,
          vitality: 10
        },
        description: '流放的贵族，技能全面但起点平庸。她的适应性使她能够走上任何道路。',
        color: 0x1abc9c
      }
    ];
    
    // 将已保存的角色转换为显示数据
    this.updateSavedCharactersDisplay();
  }
  
  updateSavedCharactersDisplay() {
    // 将保存的角色转换为显示格式
    if (this.savedCharacters.length === 0) {
      // 如果没有保存的角色，则保持选择模板
      this.selectMode = 'template';
    }
  }

  create() {
    // 创建背景
    this.createBackground();
    
    // 标题
    const title = this.add.text(640, 80, '选择你的角色', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    // 创建模式切换按钮
    this.createModeSwitchButtons();
    
    // 创建角色显示区域
    this.createCharacterDisplay();
    
    // 创建导航按钮
    this.createNavigationButtons();
    
    // 创建名称输入框（仅在模板模式下显示）
    this.createNameInput();
    
    // 创建开始游戏按钮
    this.createStartButton();
    
    // 创建删除按钮（仅在保存模式下显示）
    this.createDeleteButton();
    
    // 初始更新显示
    this.updateCharacterDisplay();
    this.updateUIVisibility();
  }
  
  private createModeSwitchButtons() {
    // 创建模式切换容器
    const modeContainer = this.add.container(640, 140);
    
    // 创建新角色按钮
    const templateBg = this.add.graphics();
    templateBg.fillStyle(0x333333, 0.8);
    templateBg.fillRoundedRect(-120, -20, 110, 40, 5);
    
    this.templateButton = this.add.text(-65, 0, '新角色', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.templateButton.setOrigin(0.5);
    this.templateButton.setInteractive();
    this.templateButton.on('pointerdown', () => {
      this.selectMode = 'template';
      this.updateModeButtons();
      this.updateUIVisibility();
      this.selectedIndex = 0;
      this.updateCharacterDisplay();
    });
    
    // 创建已保存角色按钮
    const savedBg = this.add.graphics();
    savedBg.fillStyle(0x333333, 0.8);
    savedBg.fillRoundedRect(10, -20, 110, 40, 5);
    
    this.savedButton = this.add.text(65, 0, '已保存角色', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.savedButton.setOrigin(0.5);
    this.savedButton.setInteractive();
    this.savedButton.on('pointerdown', () => {
      if (this.savedCharacters.length > 0) {
        this.selectMode = 'saved';
        this.updateModeButtons();
        this.updateUIVisibility();
        this.selectedIndex = 0;
        this.updateCharacterDisplay();
      } else {
        // 如果没有保存的角色，显示提示
        this.showMessage('没有找到已保存的角色!');
      }
    });
    
    modeContainer.add([templateBg, this.templateButton, savedBg, this.savedButton]);
    this.updateModeButtons();
  }
  
  private updateModeButtons() {
    // 更新按钮样式以指示当前选择的模式
    if (this.selectMode === 'template') {
      this.templateButton.setColor('#ffffff');
      this.savedButton.setColor('#888888');
    } else {
      this.templateButton.setColor('#888888');
      this.savedButton.setColor('#ffffff');
    }
  }
  
  private createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2a3a, 0x1a2a3a, 0x0a1a2a, 0x0a1a2a, 1);
    bg.fillRect(0, 0, 1280, 920);
    
    // 添加一些装饰元素
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 920);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
      
      const star = this.add.graphics();
      star.fillStyle(0xffffff, alpha);
      star.fillCircle(x, y, size);
    }
  }
  
  private createCharacterDisplay() {
    // 角色图形容器
    const characterContainer = this.add.container(640, 350);
    
    // 角色图形
    this.characterSprite = this.add.graphics();
    characterContainer.add(this.characterSprite);
    
    // 角色名称
    this.nameText = this.add.text(0, 120, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    });
    this.nameText.setOrigin(0.5);
    characterContainer.add(this.nameText);
    
    // 角色职业
    this.classText = this.add.text(0, 155, '', {
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    });
    this.classText.setOrigin(0.5);
    characterContainer.add(this.classText);
    
    // 角色描述
    this.descriptionText = this.add.text(0, 220, '', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: 600 }
    });
    this.descriptionText.setOrigin(0.5);
    characterContainer.add(this.descriptionText);
    
    // 角色属性
    this.statsText = this.add.text(0, 300, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    });
    this.statsText.setOrigin(0.5);
    characterContainer.add(this.statsText);
  }
  
  private createNameInput() {
    // 创建角色名称输入区域
    const inputContainer = this.add.container(640, 600);
    
    const inputLabel = this.add.text(-100, -15, '角色名称:', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // 创建HTML输入元素
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.style.width = '200px';
    inputElement.style.height = '30px';
    inputElement.style.borderRadius = '5px';
    inputElement.style.border = 'none';
    inputElement.style.padding = '0 10px';
    inputElement.style.fontSize = '16px';
    inputElement.placeholder = '输入你的角色名称';
    inputElement.maxLength = 20;
    
    // 保存引用以便后续访问
    this.nameInput = inputElement;
    
    this.inputField = this.add.dom(0, 0, inputElement);
    inputContainer.add([inputLabel, this.inputField]);
    
    // 创建一个包装容器，以便我们可以控制显示/隐藏
    this.saveCharacterContainer = this.add.container(0, 0, [inputContainer]);
  }
  
  private createNavigationButtons() {
    // 左箭头按钮
    const leftBtn = this.add.graphics();
    leftBtn.fillStyle(0x333333, 0.8);
    leftBtn.fillCircle(340, 350, 30);
    leftBtn.lineStyle(2, 0xffffff, 1);
    leftBtn.strokeCircle(340, 350, 30);
    
    const leftArrow = this.add.graphics();
    leftArrow.fillStyle(0xffffff, 1);
    leftArrow.fillTriangle(350, 335, 350, 365, 330, 350);
    
    const leftHitArea = new Phaser.GameObjects.Zone(this, 340, 350, 60, 60);
    leftHitArea.setOrigin(0.5);
    leftHitArea.setInteractive();
    leftHitArea.on('pointerdown', () => {
      this.navigateToPreviousCharacter();
    });
    
    // 右箭头按钮
    const rightBtn = this.add.graphics();
    rightBtn.fillStyle(0x333333, 0.8);
    rightBtn.fillCircle(940, 350, 30);
    rightBtn.lineStyle(2, 0xffffff, 1);
    rightBtn.strokeCircle(940, 350, 30);
    
    const rightArrow = this.add.graphics();
    rightArrow.fillStyle(0xffffff, 1);
    rightArrow.fillTriangle(930, 335, 930, 365, 950, 350);
    
    const rightHitArea = new Phaser.GameObjects.Zone(this, 940, 350, 60, 60);
    rightHitArea.setOrigin(0.5);
    rightHitArea.setInteractive();
    rightHitArea.on('pointerdown', () => {
      this.navigateToNextCharacter();
    });
  }
  
  private createStartButton() {
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x27ae60, 1);
    buttonBg.fillRoundedRect(540, 700, 200, 60, 10);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.strokeRoundedRect(540, 700, 200, 60, 10);
    
    this.startButton = this.add.text(640, 730, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.startButton.setOrigin(0.5);
    
    const startHitArea = new Phaser.GameObjects.Zone(this, 640, 730, 200, 60);
    startHitArea.setOrigin(0.5);
    startHitArea.setInteractive();
    startHitArea.on('pointerdown', () => {
      this.startGame();
    });
    
    // 悬停效果
    startHitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x2ecc71, 1);
      buttonBg.fillRoundedRect(540, 700, 200, 60, 10);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.strokeRoundedRect(540, 700, 200, 60, 10);
    });
    
    startHitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x27ae60, 1);
      buttonBg.fillRoundedRect(540, 700, 200, 60, 10);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.strokeRoundedRect(540, 700, 200, 60, 10);
    });
  }
  
  private createDeleteButton() {
    const deleteBg = this.add.graphics();
    deleteBg.fillStyle(0xe74c3c, 1);
    deleteBg.fillRoundedRect(1050, 700, 140, 40, 8);
    deleteBg.lineStyle(2, 0xffffff, 0.8);
    deleteBg.strokeRoundedRect(1050, 700, 140, 40, 8);
    
    this.deleteButton = this.add.text(1120, 720, '删除角色', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.deleteButton.setOrigin(0.5);
    
    const deleteHitArea = new Phaser.GameObjects.Zone(this, 1120, 720, 140, 40);
    deleteHitArea.setOrigin(0.5);
    deleteHitArea.setInteractive();
    deleteHitArea.on('pointerdown', () => {
      if (this.selectMode === 'saved' && this.savedCharacters.length > 0) {
        this.deleteSelectedCharacter();
      }
    });
    
    // 悬停效果
    deleteHitArea.on('pointerover', () => {
      deleteBg.clear();
      deleteBg.fillStyle(0xc0392b, 1);
      deleteBg.fillRoundedRect(1050, 700, 140, 40, 8);
      deleteBg.lineStyle(2, 0xffffff, 0.8);
      deleteBg.strokeRoundedRect(1050, 700, 140, 40, 8);
    });
    
    deleteHitArea.on('pointerout', () => {
      deleteBg.clear();
      deleteBg.fillStyle(0xe74c3c, 1);
      deleteBg.fillRoundedRect(1050, 700, 140, 40, 8);
      deleteBg.lineStyle(2, 0xffffff, 0.8);
      deleteBg.strokeRoundedRect(1050, 700, 140, 40, 8);
    });
    
    // 初始隐藏删除按钮
    this.deleteButton.setVisible(false);
    deleteBg.setVisible(false);
    deleteHitArea.setVisible(false);
    
    // 保存引用，以便后续控制
    this.deleteButton.setData('bg', deleteBg);
    this.deleteButton.setData('hitArea', deleteHitArea);
  }
  
  private updateCharacterDisplay() {
    let character: CharacterData;
    
    if (this.selectMode === 'template') {
      character = this.characters[this.selectedIndex];
    } else {
      if (this.savedCharacters.length === 0) {
        return;
      }
      
      const savedChar = this.savedCharacters[this.selectedIndex];
      
      // 找到对应职业的模板获取描述信息
      const classTemplate = this.characters.find(c => c.classEnum === savedChar.class) || this.characters[0];
      
      character = {
        id: savedChar.id,
        name: savedChar.name,
        class: classTemplate.class,
        classEnum: savedChar.class,
        stats: savedChar.baseAttributes,
        description: classTemplate.description,
        color: classTemplate.color,
        level: savedChar.level
      };
    }
    
    // 更新角色图形
    this.characterSprite.clear();
    this.characterSprite.fillStyle(character.color, 1);
    
    // 不同职业的不同形状
    switch (character.classEnum) {
      case CharacterClass.Marauder: // 野蛮人
        // 战士 - 盾牌形状
        this.characterSprite.fillCircle(0, 0, 60);
        this.characterSprite.lineStyle(6, 0xffffff, 0.7);
        this.characterSprite.strokeCircle(0, 0, 60);
        
        // 添加剑和盾
        this.characterSprite.fillStyle(0xffffff, 1);
        this.characterSprite.fillRect(-8, -40, 16, 80);
        this.characterSprite.fillCircle(0, -10, 20);
        break;
        
      case CharacterClass.Ranger: // 游侠
        // 游侠 - 细长形状
        this.characterSprite.fillCircle(0, 0, 50);
        
        // 添加弓箭
        this.characterSprite.lineStyle(4, 0xffffff, 1);
        this.characterSprite.beginPath();
        this.characterSprite.arc(0, 0, 40, Phaser.Math.DegToRad(-30), Phaser.Math.DegToRad(30), false);
        this.characterSprite.strokePath();
        
        // 箭
        this.characterSprite.lineStyle(2, 0xffffff, 1);
        this.characterSprite.lineBetween(-35, 0, 35, 0);
        break;
        
      case CharacterClass.Witch: // 女巫
        // 法师 - 星形
        this.characterSprite.fillCircle(0, 0, 50);
        
        // 添加法杖和魔法元素
        this.characterSprite.lineStyle(3, 0xffffff, 1);
        this.characterSprite.lineBetween(0, 20, 0, -50);
        
        this.characterSprite.fillStyle(0xffffff, 0.8);
        this.characterSprite.fillCircle(-30, -30, 10);
        this.characterSprite.fillCircle(30, -30, 10);
        this.characterSprite.fillCircle(0, -60, 15);
        break;
        
      case CharacterClass.Duelist: // 决斗者
        this.characterSprite.fillCircle(0, 0, 55);
        
        // 添加剑
        this.characterSprite.lineStyle(3, 0xffffff, 1);
        this.characterSprite.lineBetween(-40, 40, 40, -40);
        
        // 添加剑柄
        this.characterSprite.lineStyle(5, 0xffffff, 1);
        this.characterSprite.lineBetween(30, -30, 50, -50);
        break;
        
      case CharacterClass.Shadow: // 暗影
        this.characterSprite.fillCircle(0, 0, 50);
        
        // 添加匕首
        this.characterSprite.fillStyle(0xffffff, 1);
        this.characterSprite.fillTriangle(-40, -40, -20, -20, -35, -15);
        this.characterSprite.fillTriangle(40, -40, 20, -20, 35, -15);
        break;
        
      case CharacterClass.Templar: // 圣堂武僧
        this.characterSprite.fillCircle(0, 0, 55);
        
        // 添加锤子
        this.characterSprite.fillStyle(0xffffff, 1);
        this.characterSprite.fillRect(-8, -50, 16, 40);
        this.characterSprite.fillRect(-20, -60, 40, 20);
        
        // 添加光环
        this.characterSprite.lineStyle(3, 0xffffff, 0.6);
        this.characterSprite.strokeCircle(0, 0, 70);
        break;
        
      case CharacterClass.Scion: // 贵族
        this.characterSprite.fillCircle(0, 0, 50);
        
        // 添加皇冠
        this.characterSprite.fillStyle(0xffffff, 1);
        this.characterSprite.fillTriangle(-30, -40, -20, -60, -10, -40);
        this.characterSprite.fillTriangle(-10, -40, 0, -60, 10, -40);
        this.characterSprite.fillTriangle(10, -40, 20, -60, 30, -40);
        this.characterSprite.fillRect(-30, -40, 60, 10);
        break;
        
      default:
        // 默认形状
        this.characterSprite.fillCircle(0, 0, 50);
        break;
    }
    
    // 更新文本
    this.nameText.setText(character.name + (character.level ? ` (等级 ${character.level})` : ''));
    this.classText.setText(character.class);
    this.descriptionText.setText(character.description);
    
    // 更新属性
    const stats = character.stats;
    this.statsText.setText([
      `力量: ${stats.strength}   敏捷: ${stats.dexterity}`,
      `智力: ${stats.intelligence}   体力: ${stats.vitality}`
    ]);
    
    // 更新输入框中的名称（仅在模板模式下）
    if (this.selectMode === 'template' && this.nameInput) {
      this.nameInput.value = character.name;
    }
  }
  
  private updateUIVisibility() {
    // 根据当前模式更新UI元素可见性
    if (this.selectMode === 'template') {
      // 显示名称输入
      this.saveCharacterContainer.setVisible(true);
      
      // 隐藏删除按钮
      this.deleteButton.setVisible(false);
      this.deleteButton.getData('bg').setVisible(false);
      this.deleteButton.getData('hitArea').setVisible(false);
    } else {
      // 隐藏名称输入
      this.saveCharacterContainer.setVisible(false);
      
      // 显示删除按钮（仅当有已保存角色时）
      const hasCharacters = this.savedCharacters.length > 0;
      this.deleteButton.setVisible(hasCharacters);
      this.deleteButton.getData('bg').setVisible(hasCharacters);
      this.deleteButton.getData('hitArea').setVisible(hasCharacters);
    }
  }
  
  private navigateToPreviousCharacter() {
    const characterList = this.selectMode === 'template' ? this.characters : this.savedCharacters;
    if (characterList.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex - 1 + characterList.length) % characterList.length;
    this.updateCharacterDisplay();
  }
  
  private navigateToNextCharacter() {
    const characterList = this.selectMode === 'template' ? this.characters : this.savedCharacters;
    if (characterList.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % characterList.length;
    this.updateCharacterDisplay();
  }
  
  private startGame() {
    if (this.selectMode === 'template') {
      // 创建新角色
      const selectedTemplate = this.characters[this.selectedIndex];
      const characterName = this.nameInput && this.nameInput.value.trim();
      
      // 验证角色名称
      if (!characterName) {
        // 名字为空，显示提示信息
        this.showMessage('请输入角色名称');
        // 聚焦到输入框
        if (this.nameInput) {
          this.nameInput.focus();
        }
        return;
      }
      
      // 使用保存管理器创建新角色
      const newCharacter = SaveManager.createCharacter(characterName, selectedTemplate.classEnum);
      
      // 保存新角色
      SaveManager.saveCharacter(newCharacter);
      
      // 跳转到城镇场景，传递选择的角色数据
      this.scene.start('TownScene', { 
        characterId: newCharacter.id,
        characterName: newCharacter.name,
        stats: newCharacter.baseAttributes,
        gold: newCharacter.gold
      });
    } else if (this.savedCharacters.length > 0) {
      // 使用已保存的角色
      const selectedCharacter = this.savedCharacters[this.selectedIndex];
      
      // 更新最后游戏时间
      selectedCharacter.lastPlayed = Date.now();
      SaveManager.saveCharacter(selectedCharacter);
      
      // 跳转到城镇场景，传递选择的角色数据
      this.scene.start('TownScene', { 
        characterId: selectedCharacter.id,
        characterName: selectedCharacter.name,
        stats: selectedCharacter.baseAttributes,
        gold: selectedCharacter.gold
      });
    }
  }
  
  private deleteSelectedCharacter() {
    if (this.savedCharacters.length === 0 || this.selectMode !== 'saved') return;
    
    const characterToDelete = this.savedCharacters[this.selectedIndex];
    
    // 显示确认对话框
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x000000, 0.8);
    confirmBg.fillRect(0, 0, 1280, 920);
    
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x2c3e50, 1);
    dialogBg.fillRoundedRect(440, 360, 400, 200, 10);
    dialogBg.lineStyle(2, 0x34495e, 1);
    dialogBg.strokeRoundedRect(440, 360, 400, 200, 10);
    
    const confirmText = this.add.text(640, 400, `确定要删除角色 "${characterToDelete.name}" 吗？`, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 380 }
    });
    confirmText.setOrigin(0.5);
    
    // 确认按钮
    const confirmButtonBg = this.add.graphics();
    confirmButtonBg.fillStyle(0xe74c3c, 1);
    confirmButtonBg.fillRoundedRect(490, 480, 120, 40, 8);
    
    const confirmButton = this.add.text(550, 500, '删除', {
      fontSize: '18px',
      color: '#ffffff'
    });
    confirmButton.setOrigin(0.5);
    confirmButton.setInteractive();
    confirmButton.on('pointerdown', () => {
      // 删除角色
      SaveManager.deleteCharacter(characterToDelete.id);
      
      // 重新加载角色列表
      this.savedCharacters = SaveManager.getCharacters();
      
      // 如果没有更多角色，切换到模板模式
      if (this.savedCharacters.length === 0) {
        this.selectMode = 'template';
        this.selectedIndex = 0;
        this.updateUIVisibility();
        this.updateModeButtons();
      } else {
        // 调整选择索引
        this.selectedIndex = Math.min(this.selectedIndex, this.savedCharacters.length - 1);
      }
      
      // 更新显示
      this.updateCharacterDisplay();
      
      // 移除确认对话框
      confirmBg.destroy();
      dialogBg.destroy();
      confirmText.destroy();
      confirmButtonBg.destroy();
      confirmButton.destroy();
      cancelButtonBg.destroy();
      cancelButton.destroy();
      
      // 显示删除成功消息
      this.showMessage('角色已删除');
    });
    
    // 取消按钮
    const cancelButtonBg = this.add.graphics();
    cancelButtonBg.fillStyle(0x7f8c8d, 1);
    cancelButtonBg.fillRoundedRect(670, 480, 120, 40, 8);
    
    const cancelButton = this.add.text(730, 500, '取消', {
      fontSize: '18px',
      color: '#ffffff'
    });
    cancelButton.setOrigin(0.5);
    cancelButton.setInteractive();
    cancelButton.on('pointerdown', () => {
      // 移除确认对话框
      confirmBg.destroy();
      dialogBg.destroy();
      confirmText.destroy();
      confirmButtonBg.destroy();
      confirmButton.destroy();
      cancelButtonBg.destroy();
      cancelButton.destroy();
    });
  }
  
  private showMessage(message: string) {
    const messageText = this.add.text(640, 820, message, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: {
        left: 15,
        right: 15,
        top: 10,
        bottom: 10
      }
    });
    messageText.setOrigin(0.5);
    
    // 淡出效果
    this.tweens.add({
      targets: messageText,
      alpha: 0,
      y: 780,
      duration: 2000,
      onComplete: () => {
        messageText.destroy();
      }
    });
  }
} 