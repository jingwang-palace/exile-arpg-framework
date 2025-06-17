import { EventBus } from '../../../infrastructure/events/EventBus';
import { CombatSystem } from '../CombatSystem';
import { DamageCalculator } from '../DamageCalculator';
import { StatusEffectManager } from '../StatusEffectManager';
import { IDamage, DamageType, DamageSourceType } from '../types/Damage';
import { IStatusEffect, StatusEffectType } from '../types/StatusEffect';

/**
 * 测试数据生成器
 */
class TestDataGenerator {
  static createTestEntity(id: string, attributes: any = {}) {
    return {
      id,
      attributes: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        ...attributes
      },
      health: 1000,
      mana: 100,
      ...attributes
    };
  }

  static createTestDamage(source: any, target: any, overrides: Partial<IDamage> = {}): IDamage {
    return {
      type: DamageType.PHYSICAL,
      sourceType: DamageSourceType.SKILL,
      baseAmount: 100,
      critical: false,
      criticalMultiplier: 2.0,
      penetration: 0,
      source,
      target,
      timestamp: Date.now(),
      ...overrides
    };
  }

  static createTestStatusEffect(source: any, target: any, overrides: Partial<IStatusEffect> = {}): IStatusEffect {
    return {
      id: 'test_effect',
      name: 'Test Effect',
      description: 'Test Status Effect',
      type: StatusEffectType.DEBUFF,
      duration: 5,
      isPermanent: false,
      isStackable: false,
      maxStacks: 1,
      currentStacks: 1,
      source,
      target,
      startTime: Date.now(),
      endTime: Date.now() + 5000,
      effects: {
        attributes: {
          strength: -5
        },
        damage: {
          amount: 20,
          type: DamageType.FIRE,
          interval: 1
        }
      },
      ...overrides
    };
  }
}

/**
 * 测试结果分析器
 */
class TestResultAnalyzer {
  static analyzeDamageResult(expected: any, actual: any): string {
    const analysis: string[] = [];
    
    // 分析最终伤害
    if (Math.abs(expected.finalAmount - actual.finalAmount) > 0.01) {
      analysis.push(`伤害值不匹配: 预期 ${expected.finalAmount}, 实际 ${actual.finalAmount}`);
    }

    // 分析暴击
    if (expected.isCritical !== actual.isCritical) {
      analysis.push(`暴击状态不匹配: 预期 ${expected.isCritical}, 实际 ${actual.isCritical}`);
    }

    // 分析格挡
    if (expected.isBlocked !== actual.isBlocked) {
      analysis.push(`格挡状态不匹配: 预期 ${expected.isBlocked}, 实际 ${actual.isBlocked}`);
    }

    // 分析闪避
    if (expected.isDodged !== actual.isDodged) {
      analysis.push(`闪避状态不匹配: 预期 ${expected.isDodged}, 实际 ${actual.isDodged}`);
    }

    // 分析吸收
    if (expected.isAbsorbed !== actual.isAbsorbed) {
      analysis.push(`吸收状态不匹配: 预期 ${expected.isAbsorbed}, 实际 ${actual.isAbsorbed}`);
    }

    return analysis.join('\n');
  }

  static analyzeStatusEffect(expected: any, actual: any): string {
    const analysis: string[] = [];
    
    // 分析持续时间
    if (Math.abs(expected.remainingDuration - actual.remainingDuration) > 0.01) {
      analysis.push(`持续时间不匹配: 预期 ${expected.remainingDuration}, 实际 ${actual.remainingDuration}`);
    }

    // 分析叠加层数
    if (expected.currentStacks !== actual.currentStacks) {
      analysis.push(`叠加层数不匹配: 预期 ${expected.currentStacks}, 实际 ${actual.currentStacks}`);
    }

    // 分析效果属性
    if (JSON.stringify(expected.effects) !== JSON.stringify(actual.effects)) {
      analysis.push('效果属性不匹配');
    }

    return analysis.join('\n');
  }
}

/**
 * 战斗系统测试套件
 */
describe('Combat System Tests', () => {
  let eventBus: EventBus;
  let combatSystem: CombatSystem;
  let damageCalculator: DamageCalculator;
  let statusEffectManager: StatusEffectManager;
  let player: any;
  let enemy: any;

  beforeEach(() => {
    eventBus = new EventBus();
    combatSystem = new CombatSystem(eventBus);
    damageCalculator = combatSystem.getDamageCalculator();
    statusEffectManager = combatSystem.getStatusEffectManager();
    
    // 创建测试实体
    player = TestDataGenerator.createTestEntity('player1', {
      attributes: {
        strength: 20,
        dexterity: 15,
        intelligence: 10
      }
    });

    enemy = TestDataGenerator.createTestEntity('enemy1', {
      attributes: {
        strength: 15,
        dexterity: 10,
        intelligence: 5
      }
    });

    // 初始化系统
    combatSystem.initialize();
  });

  describe('Damage Calculation Tests', () => {
    test('基础伤害计算', () => {
      const damage = TestDataGenerator.createTestDamage(player, enemy);
      const result = damageCalculator.calculateDamage(damage);
      
      expect(result.finalAmount).toBeGreaterThan(0);
      expect(result.isCritical).toBeDefined();
      expect(result.isBlocked).toBeDefined();
      expect(result.isDodged).toBeDefined();
    });

    test('暴击伤害计算', () => {
      const damage = TestDataGenerator.createTestDamage(player, enemy, {
        critical: true,
        criticalMultiplier: 2.0
      });
      const result = damageCalculator.calculateDamage(damage);
      
      expect(result.isCritical).toBe(true);
      expect(result.finalAmount).toBeGreaterThan(damage.baseAmount);
    });

    test('格挡伤害计算', () => {
      // 设置格挡属性
      damageCalculator.handleDefenseUpdate({
        targetId: enemy.id,
        stats: {
          blockChance: 1.0,
          blockValue: 50,
          dodgeChance: 0,
          absorbChance: 0,
          absorbValue: 0,
          armor: 0
        }
      });

      const damage = TestDataGenerator.createTestDamage(player, enemy);
      const result = damageCalculator.calculateDamage(damage);
      
      expect(result.isBlocked).toBe(true);
      expect(result.finalAmount).toBeLessThanOrEqual(damage.baseAmount - 50);
    });

    test('闪避伤害计算', () => {
      // 设置闪避属性
      damageCalculator.handleDefenseUpdate({
        targetId: enemy.id,
        stats: {
          blockChance: 0,
          blockValue: 0,
          dodgeChance: 1.0,
          absorbChance: 0,
          absorbValue: 0,
          armor: 0
        }
      });

      const damage = TestDataGenerator.createTestDamage(player, enemy);
      const result = damageCalculator.calculateDamage(damage);
      
      expect(result.isDodged).toBe(true);
      expect(result.finalAmount).toBe(0);
    });
  });

  describe('Status Effect Tests', () => {
    test('状态效果应用', () => {
      const effect = TestDataGenerator.createTestStatusEffect(player, enemy);
      statusEffectManager.applyEffect(effect);
      
      const targetEffects = statusEffectManager.getTargetEffects(enemy);
      expect(targetEffects.length).toBe(1);
      expect(targetEffects[0].effect.id).toBe(effect.id);
    });

    test('状态效果叠加', () => {
      const effect = TestDataGenerator.createTestStatusEffect(player, enemy, {
        isStackable: true,
        maxStacks: 3
      });

      // 应用三次效果
      for (let i = 0; i < 3; i++) {
        statusEffectManager.applyEffect(effect);
      }

      const targetEffects = statusEffectManager.getTargetEffects(enemy);
      expect(targetEffects[0].effect.currentStacks).toBe(3);
    });

    test('状态效果持续时间', () => {
      const effect = TestDataGenerator.createTestStatusEffect(player, enemy, {
        duration: 5
      });

      statusEffectManager.applyEffect(effect);
      
      // 模拟时间流逝
      statusEffectManager.update(4);
      expect(statusEffectManager.hasEffect(enemy, effect.id)).toBe(true);

      statusEffectManager.update(2);
      expect(statusEffectManager.hasEffect(enemy, effect.id)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('完整战斗流程', () => {
      // 1. 设置防御属性
      damageCalculator.handleDefenseUpdate({
        targetId: enemy.id,
        stats: {
          blockChance: 0.2,
          blockValue: 30,
          dodgeChance: 0.1,
          absorbChance: 0.15,
          absorbValue: 20,
          armor: 50
        }
      });

      // 2. 应用状态效果
      const effect = TestDataGenerator.createTestStatusEffect(player, enemy);
      statusEffectManager.applyEffect(effect);

      // 3. 计算伤害
      const damage = TestDataGenerator.createTestDamage(player, enemy);
      const result = damageCalculator.calculateDamage(damage);

      // 4. 验证结果
      expect(result.finalAmount).toBeGreaterThan(0);
      expect(statusEffectManager.hasEffect(enemy, effect.id)).toBe(true);

      // 5. 检查伤害日志
      const logs = damageCalculator.getRecentDamageLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Regression Tests', () => {
    test('伤害计算一致性', () => {
      const damage = TestDataGenerator.createTestDamage(player, enemy);
      const result1 = damageCalculator.calculateDamage(damage);
      const result2 = damageCalculator.calculateDamage(damage);

      const analysis = TestResultAnalyzer.analyzeDamageResult(result1, result2);
      expect(analysis).toBe('');
    });

    test('状态效果一致性', () => {
      const effect = TestDataGenerator.createTestStatusEffect(player, enemy);
      statusEffectManager.applyEffect(effect);
      
      const effects1 = statusEffectManager.getTargetEffects(enemy);
      const effects2 = statusEffectManager.getTargetEffects(enemy);

      const analysis = TestResultAnalyzer.analyzeStatusEffect(effects1[0], effects2[0]);
      expect(analysis).toBe('');
    });
  });

  describe('Performance Tests', () => {
    test('大量伤害计算性能', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const damage = TestDataGenerator.createTestDamage(player, enemy);
        damageCalculator.calculateDamage(damage);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 确保每次计算平均时间不超过1ms
      expect(duration / iterations).toBeLessThan(1);
    });

    test('大量状态效果性能', () => {
      const startTime = Date.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const effect = TestDataGenerator.createTestStatusEffect(player, enemy);
        statusEffectManager.applyEffect(effect);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 确保每次应用效果平均时间不超过2ms
      expect(duration / iterations).toBeLessThan(2);
    });
  });
}); 