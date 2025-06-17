// 可插槽物品的接口
export interface ISocketable {
  // 基础属性
  id: string;
  name: string;
  description: string;
  
  // 插槽属性
  socketType: string;        // 插槽类型
  socketCount: number;       // 插槽数量
  socketedItems: any[];      // 已插入的物品
  
  // 效果系统
  effects: ISocketableEffect[];  // 效果列表
  
  // 生命周期方法
  onSocket(item: any): void;     // 插入物品时
  onUnsocket(item: any): void;   // 移除物品时
  onEffectChange(): void;        // 效果改变时
}

// 插槽效果接口
export interface ISocketableEffect {
  id: string;
  type: string;
  value: any;
  conditions?: ISocketableEffectCondition[];
  apply(target: any): void;
  remove(target: any): void;
}

// 效果条件接口
export interface ISocketableEffectCondition {
  type: string;
  check(target: any): boolean;
} 