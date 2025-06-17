import { DungeonMap } from '../DungeonMap';
import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { MapSerializer, SerializedMap } from '../serialization/MapSerializer';
import { MapDeserializer } from '../serialization/MapDeserializer';

export class MapPrototype {
  private prototype: SerializedMap;

  constructor(map: DungeonMap) {
    this.prototype = MapSerializer.serialize(map);
  }

  async clone(): Promise<IMap> {
    // 深拷贝原型数据
    const clonedData = JSON.parse(JSON.stringify(this.prototype));
    
    // 生成新的ID
    clonedData.id = `${clonedData.id}_clone_${Date.now()}`;
    
    // 反序列化生成新地图
    return await MapDeserializer.deserialize(clonedData);
  }

  async cloneWithModifications(modifications: Partial<SerializedMap>): Promise<IMap> {
    // 深拷贝原型数据
    const clonedData = JSON.parse(JSON.stringify(this.prototype));
    
    // 应用修改
    Object.assign(clonedData, modifications);
    
    // 生成新的ID
    clonedData.id = `${clonedData.id}_clone_${Date.now()}`;
    
    // 反序列化生成新地图
    return await MapDeserializer.deserialize(clonedData);
  }

  getPrototype(): SerializedMap {
    return this.prototype;
  }

  updatePrototype(map: DungeonMap): void {
    this.prototype = MapSerializer.serialize(map);
  }
} 