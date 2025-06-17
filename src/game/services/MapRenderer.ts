import Phaser from 'phaser';
import { TileType } from './MapGenerator';

export interface TileMapping {
  floor: number[];
  wall: number[];
  door: number[];
  empty: number[];
}

export class MapRenderer {
  private scene: Phaser.Scene;
  private tileSize: number;
  private tileMapping: TileMapping;
  private tilemap?: Phaser.Tilemaps.Tilemap;
  private tileset?: Phaser.Tilemaps.Tileset;
  private layers: {
    floor?: Phaser.Tilemaps.TilemapLayer;
    walls?: Phaser.Tilemaps.TilemapLayer;
  };

  constructor(
    scene: Phaser.Scene, 
    tileSize: number = 32,
    tileMapping: TileMapping = {
      floor: [0, 1, 2],
      wall: [3, 4, 5],
      door: [6],
      empty: [7]
    }
  ) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.tileMapping = tileMapping;
    this.layers = {};
  }

  // 创建地图
  public createMap(mapData: TileType[][], tilesetKey: string): void {
    const height = mapData.length;
    const width = mapData[0]?.length || 0;

    if (width === 0 || height === 0) {
      console.error('地图数据无效');
      return;
    }

    // 创建空地图
    this.tilemap = this.scene.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width,
      height
    });

    // 添加图像集
    const tileset = this.tilemap.addTilesetImage(tilesetKey, tilesetKey, this.tileSize, this.tileSize, 0, 0);

    if (!tileset) {
      console.error('无法创建tileset，请确保已加载图像资源:', tilesetKey);
      return;
    }
    
    this.tileset = tileset;

    // 创建图层
    this.createLayers(mapData);
  }

  // 创建地图图层
  private createLayers(mapData: TileType[][]): void {
    if (!this.tilemap || !this.tileset) return;

    // 创建地板图层
    const floorLayer = this.tilemap.createBlankLayer('floor', this.tileset);
    
    if (!floorLayer) {
      console.error('无法创建地板图层');
      return;
    }
    
    this.layers.floor = floorLayer;
    
    // 创建墙壁图层
    const wallsLayer = this.tilemap.createBlankLayer('walls', this.tileset);
    
    if (!wallsLayer) {
      console.error('无法创建墙壁图层');
      return;
    }
    
    this.layers.walls = wallsLayer;

    // 填充图层
    this.fillLayers(mapData);

    // 设置碰撞
    if (this.layers.walls) {
      this.layers.walls.setCollisionByProperty({ collides: true });
    }
  }

  // 填充图层数据
  private fillLayers(mapData: TileType[][]): void {
    if (!this.layers.floor || !this.layers.walls || !this.tileset) return;

    const height = mapData.length;
    const width = mapData[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = mapData[y][x];
        
        if (tileType === 'floor' || tileType === 'door') {
          // 随机选择一个地板瓦片
          const tileIndex = this.getRandomTile(tileType);
          this.layers.floor.putTileAt(tileIndex, x, y);
        } else if (tileType === 'wall') {
          // 墙壁瓦片
          const tileIndex = this.getRandomTile(tileType);
          this.layers.walls.putTileAt(tileIndex, x, y);
          
          // 设置碰撞
          const tile = this.layers.walls.getTileAt(x, y);
          if (tile) {
            tile.properties.collides = true;
          }
        }
      }
    }

    // 更新地图外观
    this.updateEdgeTiles(mapData);
  }

  // 更新边缘瓦片（让墙壁看起来更美观）
  private updateEdgeTiles(mapData: TileType[][]): void {
    // 这个方法可以根据邻近瓦片情况更新边缘瓦片的外观
    // 此处简化处理，实际项目中可以根据需要实现更复杂的瓦片选择逻辑
  }

  // 从瓦片类型中随机选择一个瓦片索引
  private getRandomTile(tileType: TileType): number {
    const tileIndices = this.tileMapping[tileType];
    const randomIndex = Math.floor(Math.random() * tileIndices.length);
    return tileIndices[randomIndex];
  }

  // 获取地图物理图层
  public getCollisionLayer(): Phaser.Tilemaps.TilemapLayer | undefined {
    return this.layers.walls;
  }

  // 获取地图对象
  public getTilemap(): Phaser.Tilemaps.Tilemap | undefined {
    return this.tilemap;
  }
} 