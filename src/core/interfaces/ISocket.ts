// 插槽接口
export interface ISocket {
  // 基础属性
  id: string;
  type: string;
  position: { x: number, y: number };
  
  // 状态
  isOccupied: boolean;
  socketedItem: any | null;
  
  // 连接
  connections: string[];  // 连接的节点ID
  
  // 生命周期方法
  onItemSocketed(item: any): void;
  onItemUnsocketed(item: any): void;
  onConnectionChanged(): void;
}

// 插槽管理器接口
export interface ISocketManager {
  // 插槽管理
  sockets: Map<string, ISocket>;
  
  // 基础方法
  addSocket(socket: ISocket): void;
  removeSocket(socketId: string): void;
  getSocket(socketId: string): ISocket | undefined;
  
  // 物品操作
  socketItem(socketId: string, item: any): boolean;
  unsocketItem(socketId: string): any | null;
  
  // 连接管理
  connectSockets(socketId1: string, socketId2: string): void;
  disconnectSockets(socketId1: string, socketId2: string): void;
  
  // 效果管理
  getConnectedEffects(socketId: string): any[];
  applyEffects(socketId: string, target: any): void;
  removeEffects(socketId: string, target: any): void;
} 