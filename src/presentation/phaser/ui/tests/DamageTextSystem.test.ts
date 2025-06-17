import { DamageTextSystem, DamageTextType } from '../DamageTextSystem';
import { EventBus } from '../../../../core/EventBus';

describe('DamageTextSystem', () => {
  let damageTextSystem: DamageTextSystem;
  let mockScene: any;
  let mockEventBus: any;

  beforeEach(() => {
    // 创建模拟场景
    mockScene = {
      add: {
        container: jest.fn(() => ({
          setDepth: jest.fn(),
          setScrollFactor: jest.fn(),
          setVisible: jest.fn()
        }))
      },
      time: {
        addEvent: jest.fn()
      }
    };

    // 创建模拟事件总线
    mockEventBus = {
      on: jest.fn(),
      emit: jest.fn(),
      off: jest.fn()
    };

    // 模拟 EventBus.getInstance
    (EventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);

    // 创建 DamageTextSystem 实例
    damageTextSystem = new DamageTextSystem(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('初始化', () => {
    test('应该正确初始化系统', () => {
      expect(damageTextSystem).toBeDefined();
      expect(mockScene.add.container).toHaveBeenCalled();
    });

    test('应该设置正确的事件监听器', () => {
      expect(mockEventBus.on).toHaveBeenCalled();
    });
  });

  describe('显示伤害文本', () => {
    test('应该正确显示物理伤害', () => {
      damageTextSystem.showDamageText(100, DamageTextType.PHYSICAL_DAMAGE, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });

    test('应该正确显示暴击伤害', () => {
      damageTextSystem.showDamageText(200, DamageTextType.CRITICAL_DAMAGE, 100, 100, true);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });
  });

  describe('显示其他类型文本', () => {
    test('应该正确显示治疗文本', () => {
      damageTextSystem.showHealText(50, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });

    test('应该正确显示魔法恢复文本', () => {
      damageTextSystem.showManaRestoreText(30, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });

    test('应该正确显示经验值文本', () => {
      damageTextSystem.showExperienceText(1000, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });
  });

  describe('配置管理', () => {
    test('应该能够更新配置', () => {
      const newConfig = {
        fontSize: 30,
        color: '#ff0000'
      };
      damageTextSystem.setConfig(DamageTextType.PHYSICAL_DAMAGE, newConfig);
      const config = damageTextSystem.getConfig(DamageTextType.PHYSICAL_DAMAGE);
      expect(config?.fontSize).toBe(30);
      expect(config?.color).toBe('#ff0000');
    });
  });

  describe('清理功能', () => {
    test('应该能够清理所有文本', () => {
      damageTextSystem.showDamageText(100, DamageTextType.PHYSICAL_DAMAGE, 100, 100);
      damageTextSystem.showHealText(50, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(2);
      
      damageTextSystem.clearAllTexts();
      expect(damageTextSystem.getActiveTextCount()).toBe(0);
    });
  });

  describe('启用/禁用', () => {
    test('应该能够禁用系统', () => {
      damageTextSystem.setEnabled(false);
      damageTextSystem.showDamageText(100, DamageTextType.PHYSICAL_DAMAGE, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(0);
    });

    test('应该能够重新启用系统', () => {
      damageTextSystem.setEnabled(false);
      damageTextSystem.setEnabled(true);
      damageTextSystem.showDamageText(100, DamageTextType.PHYSICAL_DAMAGE, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });
  });

  describe('组合功能', () => {
    test('应该能够显示多个伤害', () => {
      const damages = [
        { damage: 100, type: DamageTextType.PHYSICAL_DAMAGE, x: 100, y: 100 },
        { damage: 50, type: DamageTextType.FIRE_DAMAGE, x: 100, y: 100 }
      ];
      damageTextSystem.showMultipleDamage(damages);
      expect(damageTextSystem.getActiveTextCount()).toBe(2);
    });

    test('应该能够显示连击文本', () => {
      damageTextSystem.showComboText(5, 100, 100);
      expect(damageTextSystem.getActiveTextCount()).toBe(1);
    });
  });
}); 