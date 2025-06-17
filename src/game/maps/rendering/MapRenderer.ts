import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { Vector2D } from '@/core/math/Vector2D';
import { Size } from '@/core/math/Size';
import { MapType } from '@/core/interfaces/IMapSystem';

export class MapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number;
  private offset: Vector2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.scale = 1;
    this.offset = new Vector2D(0, 0);
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  setOffset(offset: Vector2D): void {
    this.offset = offset;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderMap(map: IMap): void {
    this.clear();

    // 渲染背景
    this.renderBackground(map);

    // 渲染连接
    for (const connection of map.connections) {
      this.renderConnection(connection);
    }

    // 渲染区域
    for (const region of map.regions) {
      this.renderRegion(region);
    }
  }

  private renderBackground(map: IMap): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderRegion(region: IRegion): void {
    const x = region.position.x * this.scale + this.offset.x;
    const y = region.position.y * this.scale + this.offset.y;
    const width = region.size.width * this.scale;
    const height = region.size.height * this.scale;

    // 设置区域颜色
    switch (region.type) {
      case 'spawn':
        this.ctx.fillStyle = '#00ff00';
        break;
      case 'dungeon':
        this.ctx.fillStyle = '#ff0000';
        break;
      case 'treasure':
        this.ctx.fillStyle = '#ffff00';
        break;
      case 'boss':
        this.ctx.fillStyle = '#ff00ff';
        break;
      default:
        this.ctx.fillStyle = '#ffffff';
    }

    // 绘制区域
    this.ctx.fillRect(x, y, width, height);

    // 绘制区域边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // 绘制区域名称
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      region.name,
      x + width / 2,
      y + height / 2
    );
  }

  private renderConnection(connection: IConnection): void {
    const sourceCenter = this.getRegionCenter(connection.sourceRegion);
    const targetCenter = this.getRegionCenter(connection.targetRegion);

    // 设置连接颜色
    switch (connection.type) {
      case 'normal':
        this.ctx.strokeStyle = '#ffffff';
        break;
      case 'boss':
        this.ctx.strokeStyle = '#ff00ff';
        break;
      case 'secret':
        this.ctx.strokeStyle = '#00ffff';
        break;
      case 'teleport':
        this.ctx.strokeStyle = '#ffff00';
        break;
      default:
        this.ctx.strokeStyle = '#ffffff';
    }

    // 绘制连接线
    this.ctx.beginPath();
    this.ctx.moveTo(sourceCenter.x, sourceCenter.y);
    this.ctx.lineTo(targetCenter.x, targetCenter.y);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private getRegionCenter(region: IRegion): Vector2D {
    return new Vector2D(
      region.position.x * this.scale + this.offset.x + (region.size.width * this.scale) / 2,
      region.position.y * this.scale + this.offset.y + (region.size.height * this.scale) / 2
    );
  }
} 