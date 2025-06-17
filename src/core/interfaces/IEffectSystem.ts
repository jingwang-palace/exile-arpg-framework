// 效果系统接口
export interface IEffectSystem {
  // 效果管理
  effects: Map<string, IEffect>;
  
  // 基础方法
  registerEffect(effect: IEffect): void;
  unregisterEffect(effectId: string): void;
  getEffect(effectId: string): IEffect | undefined;
  
  // 效果应用
  applyEffect(effectId: string, target: any): void;
  removeEffect(effectId: string, target: any): void;
  
  // 效果查询
  getActiveEffects(target: any): IEffect[];
  hasEffect(target: any, effectId: string): boolean;
  
  // 效果组合
  combineEffects(effects: IEffect[]): IEffect;
}

// 效果接口
export interface IEffect {
  id: string;
  type: string;
  value: any;
  duration?: number;
  stackable?: boolean;
  maxStacks?: number;
  
  // 生命周期方法
  onApply(target: any): void;
  onRemove(target: any): void;
  onTick(target: any): void;
  
  // 效果组合
  canStackWith(other: IEffect): boolean;
  combineWith(other: IEffect): IEffect;
} 