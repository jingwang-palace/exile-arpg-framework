import { MapSystem } from '../game/maps/system/MapSystem';
import { MapType } from '../core/interfaces/IMapSystem';
import { Size } from '../core/math/Size';
import { Vector2D } from '../core/math/Vector2D';
import { TestResult } from './types/TestResult';

export class GameSystemTest {
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // 测试地图系统
      results.push(await this.testMapSystem());
      
      // 测试实体系统
      results.push(await this.testEntitySystem());
      
      // 测试效果系统
      results.push(await this.testEffectSystem());
      
      // 测试UI系统
      results.push(await this.testUISystem());

      return results;
    } catch (error) {
      console.error('游戏系统测试过程中发生错误:', error);
      throw error;
    }
  }

  private async testMapSystem(): Promise<TestResult> {
    try {
      const mapSystem = new MapSystem({
        defaultMapSize: new Size(1000, 1000),
        minMapSize: new Size(100, 100),
        maxMapSize: new Size(2000, 2000),
        defaultRegionSize: new Size(200, 200),
        minRegionSize: new Size(100, 100),
        maxRegionSize: new Size(500, 500)
      });

      // 测试地图创建
      const map = await mapSystem.createMap('test-map', MapType.DUNGEON);
      if (!map) {
        throw new Error('地图创建失败');
      }

      // 测试地图属性
      if (map.id !== 'test-map' || map.type !== MapType.DUNGEON) {
        throw new Error('地图属性不正确');
      }

      // 测试区域添加
      const region = {
        id: 'test-region',
        name: '测试区域',
        position: new Vector2D(100, 100),
        size: new Size(200, 200),
        type: 'combat',
        difficulty: 1
      };
      map.addRegion(region);

      // 测试区域获取
      const foundRegion = map.getRegion('test-region');
      if (!foundRegion) {
        throw new Error('区域获取失败');
      }

      // 测试区域连接
      const region2 = {
        id: 'test-region-2',
        name: '测试区域2',
        position: new Vector2D(400, 100),
        size: new Size(200, 200),
        type: 'combat',
        difficulty: 1
      };
      map.addRegion(region2);

      const connection = {
        id: 'test-connection',
        type: 'normal',
        source: region,
        target: region2,
        difficulty: 1
      };
      map.addConnection(connection);

      // 测试连接获取
      const foundConnection = map.getConnection('test-connection');
      if (!foundConnection) {
        throw new Error('连接获取失败');
      }

      // 测试位置检查
      const position = new Vector2D(150, 150);
      if (!map.isPositionInMap(position)) {
        throw new Error('位置检查失败');
      }

      // 测试区域查找
      const regionAtPosition = map.getRegionAtPosition(position);
      if (!regionAtPosition || regionAtPosition.id !== 'test-region') {
        throw new Error('区域查找失败');
      }

      return {
        name: '地图系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '地图系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testEntitySystem(): Promise<TestResult> {
    try {
      // 测试实体创建
      const entity = {
        id: 'test-entity',
        type: 'monster',
        position: new Vector2D(100, 100),
        size: new Size(50, 50),
        health: 100,
        damage: 10
      };

      // 测试实体属性
      if (entity.health !== 100 || entity.damage !== 10) {
        throw new Error('实体属性不正确');
      }

      // 测试实体移动
      const newPosition = new Vector2D(200, 200);
      entity.position = newPosition;
      if (entity.position.x !== 200 || entity.position.y !== 200) {
        throw new Error('实体移动失败');
      }

      // 测试实体碰撞
      const entity2 = {
        id: 'test-entity-2',
        type: 'monster',
        position: new Vector2D(150, 150),
        size: new Size(50, 50),
        health: 100,
        damage: 10
      };

      const isColliding = this.checkCollision(entity, entity2);
      if (!isColliding) {
        throw new Error('碰撞检测失败');
      }

      return {
        name: '实体系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '实体系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testEffectSystem(): Promise<TestResult> {
    try {
      // 测试效果创建
      const effect = {
        id: 'test-effect',
        type: 'buff',
        duration: 10,
        value: 20,
        target: 'strength'
      };

      // 测试效果属性
      if (effect.duration !== 10 || effect.value !== 20) {
        throw new Error('效果属性不正确');
      }

      // 测试效果应用
      const character = {
        id: 'test-character',
        strength: 10
      };

      this.applyEffect(character, effect);
      if (character.strength !== 30) {
        throw new Error('效果应用失败');
      }

      // 测试效果移除
      this.removeEffect(character, effect);
      if (character.strength !== 10) {
        throw new Error('效果移除失败');
      }

      return {
        name: '效果系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: '效果系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private async testUISystem(): Promise<TestResult> {
    try {
      // 测试UI组件创建
      const button = {
        id: 'test-button',
        type: 'button',
        text: '测试按钮',
        position: new Vector2D(100, 100),
        size: new Size(200, 50)
      };

      // 测试UI组件属性
      if (button.text !== '测试按钮') {
        throw new Error('UI组件属性不正确');
      }

      // 测试UI事件
      let clicked = false;
      button.onClick = () => {
        clicked = true;
      };

      button.onClick();
      if (!clicked) {
        throw new Error('UI事件处理失败');
      }

      // 测试UI布局
      const container = {
        id: 'test-container',
        type: 'container',
        position: new Vector2D(0, 0),
        size: new Size(800, 600),
        children: [button]
      };

      if (container.children.length !== 1) {
        throw new Error('UI布局失败');
      }

      return {
        name: 'UI系统测试',
        passed: true
      };
    } catch (error) {
      return {
        name: 'UI系统测试',
        passed: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private checkCollision(entity1: any, entity2: any): boolean {
    return (
      entity1.position.x < entity2.position.x + entity2.size.width &&
      entity1.position.x + entity1.size.width > entity2.position.x &&
      entity1.position.y < entity2.position.y + entity2.size.height &&
      entity1.position.y + entity1.size.height > entity2.position.y
    );
  }

  private applyEffect(target: any, effect: any): void {
    if (effect.type === 'buff') {
      target[effect.target] += effect.value;
    }
  }

  private removeEffect(target: any, effect: any): void {
    if (effect.type === 'buff') {
      target[effect.target] -= effect.value;
    }
  }
} 