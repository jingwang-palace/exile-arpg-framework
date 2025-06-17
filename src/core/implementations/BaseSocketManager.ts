import { ISocketManager, ISocket } from '../interfaces/ISocket';

export abstract class BaseSocketManager implements ISocketManager {
  sockets: Map<string, ISocket>;

  constructor() {
    this.sockets = new Map();
  }

  addSocket(socket: ISocket): void {
    this.sockets.set(socket.id, socket);
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
  }

  getSocket(socketId: string): ISocket | undefined {
    return this.sockets.get(socketId);
  }

  socketItem(socketId: string, item: any): boolean {
    const socket = this.getSocket(socketId);
    if (!socket || socket.isOccupied) return false;

    socket.socketedItem = item;
    socket.isOccupied = true;
    socket.onItemSocketed(item);
    return true;
  }

  unsocketItem(socketId: string): any | null {
    const socket = this.getSocket(socketId);
    if (!socket || !socket.isOccupied) return null;

    const item = socket.socketedItem;
    socket.socketedItem = null;
    socket.isOccupied = false;
    socket.onItemUnsocketed(item);
    return item;
  }

  connectSockets(socketId1: string, socketId2: string): void {
    const socket1 = this.getSocket(socketId1);
    const socket2 = this.getSocket(socketId2);
    if (!socket1 || !socket2) return;

    socket1.connections.push(socketId2);
    socket2.connections.push(socketId1);
    socket1.onConnectionChanged();
    socket2.onConnectionChanged();
  }

  disconnectSockets(socketId1: string, socketId2: string): void {
    const socket1 = this.getSocket(socketId1);
    const socket2 = this.getSocket(socketId2);
    if (!socket1 || !socket2) return;

    const index1 = socket1.connections.indexOf(socketId2);
    const index2 = socket2.connections.indexOf(socketId1);
    if (index1 !== -1) socket1.connections.splice(index1, 1);
    if (index2 !== -1) socket2.connections.splice(index2, 1);
    socket1.onConnectionChanged();
    socket2.onConnectionChanged();
  }

  getConnectedEffects(socketId: string): any[] {
    const socket = this.getSocket(socketId);
    if (!socket) return [];

    return socket.connections
      .map(id => this.getSocket(id))
      .filter(s => s && s.socketedItem)
      .map(s => s!.socketedItem.effects)
      .flat();
  }

  applyEffects(socketId: string, target: any): void {
    const effects = this.getConnectedEffects(socketId);
    effects.forEach(effect => effect.apply(target));
  }

  removeEffects(socketId: string, target: any): void {
    const effects = this.getConnectedEffects(socketId);
    effects.forEach(effect => effect.remove(target));
  }
} 