import { IMap } from '@/core/interfaces/IMap';
import { Vector2D } from '@/core/math/Vector2D';
import { MapRenderer } from '../rendering/MapRenderer';

export class MapController {
  private renderer: MapRenderer;
  private map: IMap | null;
  private isDragging: boolean;
  private lastMousePosition: Vector2D;
  private scale: number;
  private offset: Vector2D;

  constructor(renderer: MapRenderer) {
    this.renderer = renderer;
    this.map = null;
    this.isDragging = false;
    this.lastMousePosition = new Vector2D(0, 0);
    this.scale = 1;
    this.offset = new Vector2D(0, 0);

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const canvas = this.renderer['canvas'];

    // 鼠标按下事件
    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.lastMousePosition = new Vector2D(event.clientX, event.clientY);
    });

    // 鼠标移动事件
    canvas.addEventListener('mousemove', (event) => {
      if (this.isDragging) {
        const currentPosition = new Vector2D(event.clientX, event.clientY);
        const delta = currentPosition.subtract(this.lastMousePosition);
        this.offset = this.offset.add(delta);
        this.lastMousePosition = currentPosition;
        this.updateRenderer();
      }
    });

    // 鼠标松开事件
    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 鼠标离开事件
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    // 鼠标滚轮事件
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      this.scale *= delta;
      this.updateRenderer();
    });
  }

  setMap(map: IMap): void {
    this.map = map;
    this.resetView();
    this.updateRenderer();
  }

  private resetView(): void {
    if (this.map) {
      this.scale = 1;
      this.offset = new Vector2D(0, 0);
      this.updateRenderer();
    }
  }

  private updateRenderer(): void {
    if (this.map) {
      this.renderer.setScale(this.scale);
      this.renderer.setOffset(this.offset);
      this.renderer.renderMap(this.map);
    }
  }

  zoomIn(): void {
    this.scale *= 1.1;
    this.updateRenderer();
  }

  zoomOut(): void {
    this.scale *= 0.9;
    this.updateRenderer();
  }

  resetZoom(): void {
    this.scale = 1;
    this.updateRenderer();
  }

  pan(delta: Vector2D): void {
    this.offset = this.offset.add(delta);
    this.updateRenderer();
  }

  centerOnPosition(position: Vector2D): void {
    const canvas = this.renderer['canvas'];
    this.offset = new Vector2D(
      canvas.width / 2 - position.x * this.scale,
      canvas.height / 2 - position.y * this.scale
    );
    this.updateRenderer();
  }

  getScale(): number {
    return this.scale;
  }

  getOffset(): Vector2D {
    return this.offset;
  }
} 