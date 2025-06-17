import { Position, Size } from '@/core/interfaces/IMapSystem';
import { DungeonMap } from '../DungeonMap';

interface Room {
  id: string;
  position: Position;
  size: Size;
  type: RoomType;
  connections: string[];
}

enum RoomType {
  SPAWN = 'spawn',
  COMBAT = 'combat',
  BOSS = 'boss',
  TREASURE = 'treasure',
  CORRIDOR = 'corridor'
}

export class DungeonGenerator {
  private width: number;
  private height: number;
  private roomCount: number;
  private minRoomSize: number;
  private maxRoomSize: number;
  private rooms: Room[];
  private grid: boolean[][];

  constructor(config: {
    width: number;
    height: number;
    roomCount: number;
    minRoomSize?: number;
    maxRoomSize?: number;
  }) {
    this.width = config.width;
    this.height = config.height;
    this.roomCount = config.roomCount;
    this.minRoomSize = config.minRoomSize || 100;
    this.maxRoomSize = config.maxRoomSize || 200;
    this.rooms = [];
    this.grid = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
  }

  generate(): DungeonMap {
    // 1. 生成房间
    this.generateRooms();
    
    // 2. 连接房间
    this.connectRooms();
    
    // 3. 创建走廊
    this.createCorridors();
    
    // 4. 创建地图实例
    return this.createDungeonMap();
  }

  private generateRooms(): void {
    let attempts = 0;
    const maxAttempts = this.roomCount * 3;

    while (this.rooms.length < this.roomCount && attempts < maxAttempts) {
      const room = this.generateRandomRoom();
      
      if (this.isRoomValid(room)) {
        this.rooms.push(room);
        this.markRoomOnGrid(room);
      }
      
      attempts++;
    }

    // 确保至少有一个出生点房间和一个Boss房间
    this.ensureRequiredRooms();
  }

  private generateRandomRoom(): Room {
    const width = this.getRandomSize();
    const height = this.getRandomSize();
    const x = Math.floor(Math.random() * (this.width - width));
    const y = Math.floor(Math.random() * (this.height - height));

    return {
      id: `room_${this.rooms.length}`,
      position: { x, y },
      size: { width, height },
      type: RoomType.COMBAT,
      connections: []
    };
  }

  private getRandomSize(): number {
    return Math.floor(
      this.minRoomSize + Math.random() * (this.maxRoomSize - this.minRoomSize)
    );
  }

  private isRoomValid(room: Room): boolean {
    // 检查房间是否超出边界
    if (
      room.position.x < 0 ||
      room.position.y < 0 ||
      room.position.x + room.size.width > this.width ||
      room.position.y + room.size.height > this.height
    ) {
      return false;
    }

    // 检查房间是否与其他房间重叠
    for (const existingRoom of this.rooms) {
      if (this.doRoomsOverlap(room, existingRoom)) {
        return false;
      }
    }

    return true;
  }

  private doRoomsOverlap(room1: Room, room2: Room): boolean {
    return !(
      room1.position.x + room1.size.width < room2.position.x ||
      room1.position.x > room2.position.x + room2.size.width ||
      room1.position.y + room1.size.height < room2.position.y ||
      room1.position.y > room2.position.y + room2.size.height
    );
  }

  private markRoomOnGrid(room: Room): void {
    for (let y = room.position.y; y < room.position.y + room.size.height; y++) {
      for (let x = room.position.x; x < room.position.x + room.size.width; x++) {
        this.grid[y][x] = true;
      }
    }
  }

  private ensureRequiredRooms(): void {
    // 确保有出生点房间
    if (!this.rooms.some(room => room.type === RoomType.SPAWN)) {
      const spawnRoom = this.rooms[0];
      spawnRoom.type = RoomType.SPAWN;
    }

    // 确保有Boss房间
    if (!this.rooms.some(room => room.type === RoomType.BOSS)) {
      const bossRoom = this.rooms[this.rooms.length - 1];
      bossRoom.type = RoomType.BOSS;
    }

    // 添加宝箱房间
    const treasureRoom = this.rooms[Math.floor(this.rooms.length / 2)];
    treasureRoom.type = RoomType.TREASURE;
  }

  private connectRooms(): void {
    // 使用最小生成树算法连接房间
    const edges: { room1: Room; room2: Room; distance: number }[] = [];

    // 计算所有房间之间的距离
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const room1 = this.rooms[i];
        const room2 = this.rooms[j];
        const distance = this.calculateRoomDistance(room1, room2);
        edges.push({ room1, room2, distance });
      }
    }

    // 按距离排序
    edges.sort((a, b) => a.distance - b.distance);

    // 使用并查集实现最小生成树
    const parent = new Map<string, string>();
    this.rooms.forEach(room => parent.set(room.id, room.id));

    const find = (id: string): string => {
      if (parent.get(id) === id) return id;
      return find(parent.get(id)!);
    };

    const union = (id1: string, id2: string): void => {
      const root1 = find(id1);
      const root2 = find(id2);
      parent.set(root1, root2);
    };

    // 连接房间
    edges.forEach(({ room1, room2 }) => {
      if (find(room1.id) !== find(room2.id)) {
        union(room1.id, room2.id);
        room1.connections.push(room2.id);
        room2.connections.push(room1.id);
      }
    });
  }

  private calculateRoomDistance(room1: Room, room2: Room): number {
    const center1 = {
      x: room1.position.x + room1.size.width / 2,
      y: room1.position.y + room1.size.height / 2
    };
    const center2 = {
      x: room2.position.x + room2.size.width / 2,
      y: room2.position.y + room2.size.height / 2
    };

    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );
  }

  private createCorridors(): void {
    // 为每个房间连接创建走廊
    this.rooms.forEach(room => {
      room.connections.forEach(connectedRoomId => {
        const connectedRoom = this.rooms.find(r => r.id === connectedRoomId);
        if (connectedRoom) {
          this.createCorridor(room, connectedRoom);
        }
      });
    });
  }

  private createCorridor(room1: Room, room2: Room): void {
    const start = {
      x: room1.position.x + room1.size.width / 2,
      y: room1.position.y + room1.size.height / 2
    };
    const end = {
      x: room2.position.x + room2.size.width / 2,
      y: room2.position.y + room2.size.height / 2
    };

    // 创建L形走廊
    const corridor: Room = {
      id: `corridor_${room1.id}_${room2.id}`,
      position: { x: 0, y: 0 },
      size: { width: 20, height: 20 },
      type: RoomType.CORRIDOR,
      connections: [room1.id, room2.id]
    };

    // 水平走廊
    if (start.x < end.x) {
      corridor.position.x = start.x;
      corridor.position.y = start.y;
      corridor.size.width = end.x - start.x;
    } else {
      corridor.position.x = end.x;
      corridor.position.y = start.y;
      corridor.size.width = start.x - end.x;
    }

    // 垂直走廊
    if (start.y < end.y) {
      corridor.position.y = start.y;
      corridor.size.height = end.y - start.y;
    } else {
      corridor.position.y = end.y;
      corridor.size.height = start.y - end.y;
    }

    this.rooms.push(corridor);
    this.markRoomOnGrid(corridor);
  }

  private createDungeonMap(): DungeonMap {
    return new DungeonMap({
      id: `dungeon_${Date.now()}`,
      name: '随机地下城',
      size: { width: this.width, height: this.height },
      roomCount: this.roomCount,
      difficulty: 1,
      level: 1
    });
  }
} 