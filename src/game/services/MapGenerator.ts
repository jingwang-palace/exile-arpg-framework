export type TileType = 'floor' | 'wall' | 'door' | 'empty';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Corridor {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export class MapGenerator {
  private width: number;
  private height: number;
  private minRoomSize: number;
  private maxRoomSize: number;
  private maxRooms: number;
  private map: TileType[][];
  private rooms: Room[];
  private corridors: Corridor[];

  constructor(width: number, height: number, options?: {
    minRoomSize?: number;
    maxRoomSize?: number;
    maxRooms?: number;
  }) {
    this.width = width;
    this.height = height;
    this.minRoomSize = options?.minRoomSize || 4;
    this.maxRoomSize = options?.maxRoomSize || 10;
    this.maxRooms = options?.maxRooms || 15;
    this.map = [];
    this.rooms = [];
    this.corridors = [];

    // 初始化地图为空
    this.initializeMap();
  }

  private initializeMap(): void {
    this.map = Array(this.height).fill(null).map(() => 
      Array(this.width).fill('wall')
    );
  }

  // 生成随机地图
  public generate(): TileType[][] {
    this.initializeMap();
    this.rooms = [];
    this.corridors = [];

    // 尝试创建房间
    for (let i = 0; i < this.maxRooms; i++) {
      this.tryCreateRoom();
    }

    // 连接房间
    this.connectRooms();
    
    return this.map;
  }

  // 尝试创建一个新房间
  private tryCreateRoom(): void {
    // 随机房间大小
    const roomWidth = this.randomBetween(this.minRoomSize, this.maxRoomSize);
    const roomHeight = this.randomBetween(this.minRoomSize, this.maxRoomSize);
    
    // 随机房间位置
    const x = this.randomBetween(1, this.width - roomWidth - 1);
    const y = this.randomBetween(1, this.height - roomHeight - 1);
    
    const newRoom: Room = { x, y, width: roomWidth, height: roomHeight };
    
    // 检查是否与其他房间重叠
    if (!this.doesRoomOverlap(newRoom)) {
      this.rooms.push(newRoom);
      this.carveRoom(newRoom);
    }
  }
  
  // 检查房间是否与已存在的房间重叠
  private doesRoomOverlap(room: Room): boolean {
    return this.rooms.some(existingRoom => {
      // 为了避免房间太近，添加1格边距
      return !(
        room.x + room.width + 1 < existingRoom.x ||
        room.x > existingRoom.x + existingRoom.width + 1 ||
        room.y + room.height + 1 < existingRoom.y ||
        room.y > existingRoom.y + existingRoom.height + 1
      );
    });
  }
  
  // 在地图上挖出房间
  private carveRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.map[y][x] = 'floor';
      }
    }
  }
  
  // 连接房间
  private connectRooms(): void {
    if (this.rooms.length <= 1) return;
    
    // 对每个房间（除了最后一个）
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA = this.rooms[i];
      const roomB = this.rooms[i + 1];
      
      // 获取房间中心点
      const centerA = {
        x: Math.floor(roomA.x + roomA.width / 2),
        y: Math.floor(roomA.y + roomA.height / 2)
      };
      
      const centerB = {
        x: Math.floor(roomB.x + roomB.width / 2),
        y: Math.floor(roomB.y + roomB.height / 2)
      };
      
      // 随机决定先水平还是先垂直挖掘通道
      if (Math.random() < 0.5) {
        this.createHorizontalCorridor(centerA.x, centerB.x, centerA.y);
        this.createVerticalCorridor(centerA.y, centerB.y, centerB.x);
      } else {
        this.createVerticalCorridor(centerA.y, centerB.y, centerA.x);
        this.createHorizontalCorridor(centerA.x, centerB.x, centerB.y);
      }
    }
  }
  
  // 创建水平通道
  private createHorizontalCorridor(startX: number, endX: number, y: number): void {
    const corridor: Corridor = {
      startX: Math.min(startX, endX),
      startY: y,
      endX: Math.max(startX, endX),
      endY: y
    };
    
    this.corridors.push(corridor);
    
    for (let x = corridor.startX; x <= corridor.endX; x++) {
      this.map[y][x] = 'floor';
    }
  }
  
  // 创建垂直通道
  private createVerticalCorridor(startY: number, endY: number, x: number): void {
    const corridor: Corridor = {
      startX: x,
      startY: Math.min(startY, endY),
      endX: x,
      endY: Math.max(startY, endY)
    };
    
    this.corridors.push(corridor);
    
    for (let y = corridor.startY; y <= corridor.endY; y++) {
      this.map[y][x] = 'floor';
    }
  }
  
  // 在指定范围内生成随机数
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  // 获取生成的房间列表
  public getRooms(): Room[] {
    return this.rooms;
  }
  
  // 获取生成的走廊列表
  public getCorridors(): Corridor[] {
    return this.corridors;
  }
} 