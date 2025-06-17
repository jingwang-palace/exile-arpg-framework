import { GameEngine } from '../core/GameEngine';
import { EventBus, on, off, emit } from '../core/events/EventBus';
import { Vector2D } from '../core/math/Vector2D';
import { Size } from '../core/math/Size';
import { TestResult } from './types/TestResult';

export class CoreSystemTest {
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // 测试游戏引擎
      results.push(await this.testGameEngine());
      
      // 测试事件系统
      results.push(await this.testEventSystem());
      
      // 测试数学系统
      results.push(await this.testMathSystem());

      return results;
    } catch (error) {
      console.error('核心系统测试过程中发生错误:', error);
      throw error;
    }
  }

  private async testGameEngine(): Promise<TestResult> {
    try {
      const engine = new GameEngine();
      
      // 测试引擎初始化
      await engine.initialize();
      if (!engine.isInitialized) {
        throw new Error('游戏引擎初始化失败');
      }

      // 测试系统注册
      engine.registerSystem('test-system', {
        initialize: async () => {},
        update: () => {},
        destroy: () => {}
      });

      if (!engine.hasSystem('test-system')) {
        throw new Error('系统注册失败');
      }

      // 测试系统更新
      let updateCount = 0;
      engine.registerSystem('counter-system', {
        initialize: async () => {},
        update: () => { updateCount++; },
        destroy: () => {}
      });

      await engine.update();
      if (updateCount !== 1) {
        throw new Error('系统更新失败');
      }

      // 测试引擎销毁
      await engine.destroy();
      if (engine.isInitialized) {
        throw new Error('游戏引擎销毁失败');
      }

      return {
        name: '游戏引擎测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '游戏引擎测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testEventSystem(): Promise<TestResult> {
    try {
      // 测试事件监听
      let eventReceived = false;
      const handler = () => {
        eventReceived = true;
      };
      on('test-event', handler);

      // 测试事件触发
      emit('test-event');
      if (!eventReceived) {
        throw new Error('事件系统未正确响应');
      }

      // 测试事件移除
      off('test-event', handler);
      eventReceived = false;
      emit('test-event');
      if (eventReceived) {
        throw new Error('事件监听器未被正确移除');
      }

      // 测试事件参数传递
      let receivedData: any = null;
      on('data-event', (data) => {
        receivedData = data;
      });
      emit('data-event', { test: 'data' });
      if (receivedData?.test !== 'data') {
        throw new Error('事件数据传递失败');
      }

      // 测试事件优先级
      const results: number[] = [];
      on('priority-event', () => results.push(1), 1);
      on('priority-event', () => results.push(2), 2);
      emit('priority-event');
      if (results[0] !== 2 || results[1] !== 1) {
        throw new Error('事件优先级处理失败');
      }

      return {
        name: '事件系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '事件系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testMathSystem(): Promise<TestResult> {
    try {
      // 测试 Vector2D
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(3, 4);

      // 测试向量加法
      const sum = v1.add(v2);
      if (sum.x !== 4 || sum.y !== 6) {
        throw new Error('向量加法计算错误');
      }

      // 测试向量减法
      const diff = v2.subtract(v1);
      if (diff.x !== 2 || diff.y !== 2) {
        throw new Error('向量减法计算错误');
      }

      // 测试向量乘法
      const scaled = v1.multiply(2);
      if (scaled.x !== 2 || scaled.y !== 4) {
        throw new Error('向量乘法计算错误');
      }

      // 测试向量除法
      const divided = v2.divide(2);
      if (divided.x !== 1.5 || divided.y !== 2) {
        throw new Error('向量除法计算错误');
      }

      // 测试向量长度
      const length = v1.length();
      if (Math.abs(length - Math.sqrt(5)) > 0.0001) {
        throw new Error('向量长度计算错误');
      }

      // 测试向量标准化
      const normalized = v1.normalize();
      const expectedLength = 1;
      if (Math.abs(normalized.length() - expectedLength) > 0.0001) {
        throw new Error('向量标准化计算错误');
      }

      // 测试 Size
      const s1 = new Size(10, 20);
      const s2 = new Size(5, 10);

      // 测试尺寸加法
      const sumSize = s1.add(s2);
      if (sumSize.width !== 15 || sumSize.height !== 30) {
        throw new Error('尺寸加法计算错误');
      }

      // 测试尺寸减法
      const diffSize = s1.subtract(s2);
      if (diffSize.width !== 5 || diffSize.height !== 10) {
        throw new Error('尺寸减法计算错误');
      }

      // 测试尺寸乘法
      const scaledSize = s1.multiply(2);
      if (scaledSize.width !== 20 || scaledSize.height !== 40) {
        throw new Error('尺寸乘法计算错误');
      }

      // 测试尺寸除法
      const dividedSize = s1.divide(2);
      if (dividedSize.width !== 5 || dividedSize.height !== 10) {
        throw new Error('尺寸除法计算错误');
      }

      // 测试尺寸面积
      const area = s1.area();
      if (area !== 200) {
        throw new Error('尺寸面积计算错误');
      }

      // 测试尺寸周长
      const perimeter = s1.perimeter();
      if (perimeter !== 60) {
        throw new Error('尺寸周长计算错误');
      }

      return {
        name: '数学系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '数学系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
} 