import { AscendancySystem } from '../systems/AscendancySystem';
import { AscendancyClass } from '../../types/ascendancy';
import { CharacterClass } from '../../types/character';

class AscendancyWindow {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private visible: boolean = false;
  private ascendancySystem?: AscendancySystem;
  private selectedClass: CharacterClass = CharacterClass.MARAUDER; // 默认野蛮人

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createWindow();
  }
  
  public setAscendancySystem(ascendancySystem: AscendancySystem) {
    this.ascendancySystem = ascendancySystem;
  }
  
  private createWindow() {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setVisible(false);
    
    const background = this.scene.add.rectangle(0, 0, 900, 700, 0x1a1a1a, 0.95);
    background.setStrokeStyle(4, 0xffd700);
    this.container.add(background);
    
    const titleText = this.scene.add.text(0, -320, '升华系统', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(titleText);
    
    const closeButton = this.scene.add.text(430, -320, '✕', {
      fontSize: '20px',
      color: '#ff6b6b'
    }).setOrigin(0.5)
    .setInteractive({ cursor: 'pointer' })
    .on('pointerdown', () => this.setVisible(false));
    this.container.add(closeButton);
    
    // 创建职业选择区域
    this.createClassSelection();
    
    // 创建升华选项区域
    this.createAscendancyOptions();
  }
  
  private createClassSelection() {
    const classTitle = this.scene.add.text(0, -270, '选择职业:', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.container.add(classTitle);
    
    // 职业数据
    const classes = [
      { id: CharacterClass.MARAUDER, name: '野蛮人', color: '#cc3333' },
      { id: CharacterClass.WITCH, name: '女巫', color: '#3366cc' },
      { id: CharacterClass.RANGER, name: '游侠', color: '#33cc33' },
      { id: CharacterClass.DUELIST, name: '决斗者', color: '#cc9933' },
      { id: CharacterClass.TEMPLAR, name: '圣堂武士', color: '#9933cc' },
      { id: CharacterClass.SHADOW, name: '暗影', color: '#333333' },
      { id: CharacterClass.SCION, name: '贵族', color: '#cccc33' }
    ];
    
    const startX = -300;
    const spacing = 100;
    
    classes.forEach((cls, index) => {
      const x = startX + (index * spacing);
      const y = -230;
      
      // 职业按钮
      const classButton = this.scene.add.rectangle(x, y, 90, 35, 
        cls.id === this.selectedClass ? 0x444444 : 0x2a2a2a, 0.8);
      classButton.setStrokeStyle(2, cls.color);
      if (cls.id === this.selectedClass) {
        classButton.setStrokeStyle(3, '#ffd700');
      }
      this.container.add(classButton);
      
      const classText = this.scene.add.text(x, y, cls.name, {
        fontSize: '12px',
        color: cls.id === this.selectedClass ? '#ffd700' : '#ffffff'
      }).setOrigin(0.5);
      this.container.add(classText);
      
      // 按钮交互
      classButton.setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
          if (cls.id !== this.selectedClass) {
            classButton.setFillStyle(0x3a3a3a);
            classText.setColor(cls.color);
          }
        })
        .on('pointerout', () => {
          if (cls.id !== this.selectedClass) {
            classButton.setFillStyle(0x2a2a2a);
            classText.setColor('#ffffff');
          }
        })
        .on('pointerdown', () => {
          this.selectClass(cls.id);
        });
    });
  }
  
  private selectClass(characterClass: CharacterClass) {
    this.selectedClass = characterClass;
    console.log('选择职业:', characterClass);
    
    // 重新创建窗口以更新选中状态
    this.container.removeAll(true);
    this.createWindow();
  }
  
  private createAscendancyOptions() {
    const ascendancyTitle = this.scene.add.text(0, -170, `${this.getClassName(this.selectedClass)} - 升华道路:`, {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.container.add(ascendancyTitle);
    
    // 根据选择的职业显示对应的升华选项
    const ascendancies = this.getAscendanciesForClass(this.selectedClass);
    
    ascendancies.forEach((asc, index) => {
      const yOffset = -80 + (index * 120);
      this.createAscendancyOption(asc.id, asc.name, asc.description, asc.color, yOffset);
    });
  }
  
  private getClassName(characterClass: CharacterClass): string {
    const names = {
      [CharacterClass.MARAUDER]: '野蛮人',
      [CharacterClass.WITCH]: '女巫',
      [CharacterClass.RANGER]: '游侠',
      [CharacterClass.DUELIST]: '决斗者',
      [CharacterClass.TEMPLAR]: '圣堂武士',
      [CharacterClass.SHADOW]: '暗影',
      [CharacterClass.SCION]: '贵族'
    };
    return names[characterClass] || '未知';
  }
  
  private getAscendanciesForClass(characterClass: CharacterClass) {
    const ascendancyMap = {
      [CharacterClass.MARAUDER]: [
        {
          id: AscendancyClass.JUGGERNAUT,
          name: '不朽之王',
          description: '坚不可摧的防御者\n免疫眩晕，极高生命和护甲\n专精：防御、生存、减伤',
          color: '#8B4513'
        },
        {
          id: AscendancyClass.BERSERKER,
          name: '狂战士',
          description: '极致攻击的毁灭者\n更多伤害但承受更多伤害\n专精：伤害、攻速、狂怒',
          color: '#DC143C'
        },
        {
          id: AscendancyClass.CHIEFTAIN,
          name: '酋长',
          description: '火焰与图腾的大师\n火焰伤害和图腾增益\n专精：火焰、图腾、生命恢复',
          color: '#FF8C00'
        }
      ],
      [CharacterClass.WITCH]: [
        {
          id: AscendancyClass.NECROMANCER,
          name: '死灵法师',
          description: '亡灵召唤的主宰\n强大的召唤物和诅咒\n专精：召唤、诅咒、能量护盾',
          color: '#8A2BE2'
        },
        {
          id: AscendancyClass.ELEMENTALIST,
          name: '元素使',
          description: '元素魔法的大师\n强大的元素伤害和抗性\n专精：元素伤害、反射、元素专精',
          color: '#4169E1'
        },
        {
          id: AscendancyClass.OCCULTIST,
          name: '秘术师',
          description: '混沌与诅咒的专家\n强大的DOT和能量护盾\n专精：混沌伤害、诅咒、能量护盾',
          color: '#9400D3'
        }
      ],
      [CharacterClass.RANGER]: [
        {
          id: AscendancyClass.DEADEYE,
          name: '神射手',
          description: '远程攻击的专家\n精准和连锁攻击\n专精：投射物、连锁、精准',
          color: '#228B22'
        },
        {
          id: AscendancyClass.RAIDER,
          name: '掠袭者',
          description: '速度与机动的化身\n极高的攻击和移动速度\n专精：速度、闪避、狂怒球',
          color: '#32CD32'
        },
        {
          id: AscendancyClass.PATHFINDER,
          name: '药剂师',
          description: '药剂效果的大师\n强大的药剂增益和持续时间\n专精：药剂、元素伤害、状态免疫',
          color: '#7CFC00'
        }
      ],
      // 其他职业的升华选项...
      [CharacterClass.DUELIST]: [
        { id: AscendancyClass.GLADIATOR, name: '角斗士', description: '盾牌与格挡专家', color: '#B8860B' },
        { id: AscendancyClass.CHAMPION, name: '冠军', description: '攻防兼备的战士', color: '#DAA520' },
        { id: AscendancyClass.SLAYER, name: '处刑者', description: '双手武器大师', color: '#FF8C00' }
      ],
      [CharacterClass.TEMPLAR]: [
        { id: AscendancyClass.GUARDIAN, name: '守护者', description: '保护与增益专家', color: '#FFD700' },
        { id: AscendancyClass.HIEROPHANT, name: '大祭司', description: '图腾与法力专家', color: '#FFA500' },
        { id: AscendancyClass.INQUISITOR, name: '审判者', description: '元素暴击专家', color: '#FF4500' }
      ],
      [CharacterClass.SHADOW]: [
        { id: AscendancyClass.ASSASSIN, name: '刺客', description: '暴击与毒素专家', color: '#2F4F4F' },
        { id: AscendancyClass.TRICKSTER, name: '诡术师', description: '闪避与能量护盾专家', color: '#696969' },
        { id: AscendancyClass.SABOTEUR, name: '破坏者', description: '陷阱与地雷专家', color: '#708090' }
      ],
      [CharacterClass.SCION]: [
        { id: AscendancyClass.ASCENDANT, name: '升华者', description: '多职业混合专精', color: '#FFB6C1' }
      ]
    };
    
    return ascendancyMap[characterClass] || [];
  }
  
  private createAscendancyOption(
    id: AscendancyClass, 
    name: string, 
    description: string, 
    color: string, 
    yOffset: number
  ) {
    const y = yOffset;
    
    // 升华名称
    const nameText = this.scene.add.text(0, y, name, {
      fontSize: '18px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(nameText);
    
    // 升华描述
    const descText = this.scene.add.text(0, y + 25, description, {
      fontSize: '12px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
    this.container.add(descText);
    
    // 选择按钮
    const selectButton = this.scene.add.rectangle(0, y + 60, 180, 30, 0x2a2a2a, 0.8);
    selectButton.setStrokeStyle(2, color);
    this.container.add(selectButton);
    
    const buttonText = this.scene.add.text(0, y + 60, '选择此升华', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(buttonText);
    
    // 按钮交互
    selectButton.setInteractive({ cursor: 'pointer' })
      .on('pointerover', () => {
        selectButton.setFillStyle(0x3a3a3a);
        buttonText.setColor(color);
      })
      .on('pointerout', () => {
        selectButton.setFillStyle(0x2a2a2a);
        buttonText.setColor('#ffffff');
      })
      .on('pointerdown', () => {
        this.selectAscendancy(id, name);
      });
  }
  
  private selectAscendancy(ascendancy: AscendancyClass, name: string) {
    console.log('选择升华职业:', ascendancy, name);
    console.log('基础职业:', this.selectedClass);
    
    // 使用GameStore保存选择
    const { gameStore } = require('../../stores/GameStore');
    gameStore.selectAscendancy(ascendancy);
    
    // 同时保存基础职业
    const playerData = gameStore.getPlayer();
    playerData.class = this.selectedClass;
    
    // 显示确认消息
    const confirmText = this.scene.add.text(0, 250, `已选择: ${this.getClassName(this.selectedClass)} - ${name}`, {
      fontSize: '16px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(confirmText);
    
    // 3秒后移除确认文字
    this.scene.time.delayedCall(3000, () => {
      if (confirmText.active) {
        confirmText.destroy();
      }
    });
  }
  
  public setVisible(visible: boolean) {
    this.visible = visible;
    this.container.setVisible(visible);
    if (visible) {
      this.container.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
    }
  }
  
  public isVisible(): boolean {
    return this.visible;
  }
  
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}

export default AscendancyWindow;