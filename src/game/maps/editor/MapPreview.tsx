import React, { useEffect, useRef } from 'react';
import { MapEditor } from './MapEditor';
import { Position, Size } from '@/core/interfaces/IMapSystem';
import { ConnectionType } from '../connections/RegionConnection';

interface MapPreviewProps {
  editor: MapEditor;
  width: number;
  height: number;
  onRegionSelect?: (regionId: string) => void;
  onConnectionSelect?: (connectionId: string) => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  editor,
  width,
  height,
  onRegionSelect,
  onConnectionSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 获取地图数据
    const preview = editor.getMapPreview();

    // 绘制区域
    preview.regions.forEach((region: any) => {
      drawRegion(ctx, region, editor.selectedRegion === region.id);
    });

    // 绘制连接
    preview.connections.forEach((connection: any) => {
      drawConnection(ctx, connection, editor.selectedConnection === connection.id);
    });

    // 绘制传送点
    preview.teleporters.forEach((teleporter: any) => {
      drawTeleporter(ctx, teleporter);
    });

    // 添加点击事件监听
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 检查是否点击了区域
      const clickedRegion = preview.regions.find((region: any) =>
        isPointInRegion({ x, y }, region)
      );

      if (clickedRegion) {
        onRegionSelect?.(clickedRegion.id);
        return;
      }

      // 检查是否点击了连接
      const clickedConnection = preview.connections.find((connection: any) =>
        isPointNearConnection({ x, y }, connection)
      );

      if (clickedConnection) {
        onConnectionSelect?.(clickedConnection.id);
        return;
      }

      // 如果点击了空白处，取消选择
      onRegionSelect?.(null);
      onConnectionSelect?.(null);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [editor, width, height, onRegionSelect, onConnectionSelect]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #333',
        borderRadius: '4px'
      }}
    />
  );
};

// 绘制区域
function drawRegion(
  ctx: CanvasRenderingContext2D,
  region: { position: Position; size: Size; type: string; id: string },
  isSelected: boolean
): void {
  const { position, size, type } = region;

  // 设置区域颜色
  ctx.fillStyle = getRegionColor(type);
  ctx.strokeStyle = isSelected ? '#fff' : '#666';
  ctx.lineWidth = isSelected ? 2 : 1;

  // 绘制区域
  ctx.fillRect(position.x, position.y, size.width, size.height);
  ctx.strokeRect(position.x, position.y, size.width, size.height);

  // 绘制区域类型图标
  drawRegionIcon(ctx, type, position, size);
}

// 绘制连接
function drawConnection(
  ctx: CanvasRenderingContext2D,
  connection: {
    position: Position;
    type: ConnectionType;
    sourceRegion: string;
    targetRegion: string;
  },
  isSelected: boolean
): void {
  const { position, type } = connection;

  // 设置连接样式
  ctx.fillStyle = getConnectionColor(type);
  ctx.strokeStyle = isSelected ? '#fff' : '#666';
  ctx.lineWidth = isSelected ? 2 : 1;

  // 绘制连接点
  ctx.beginPath();
  ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 绘制连接类型图标
  drawConnectionIcon(ctx, type, position);
}

// 绘制传送点
function drawTeleporter(
  ctx: CanvasRenderingContext2D,
  teleporter: {
    position: Position;
    targetPosition: Position;
    isActive: boolean;
  }
): void {
  const { position, targetPosition, isActive } = teleporter;

  // 设置传送点样式
  ctx.fillStyle = isActive ? '#4CAF50' : '#666';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;

  // 绘制传送点
  ctx.beginPath();
  ctx.arc(position.x, position.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 绘制传送线
  ctx.beginPath();
  ctx.moveTo(position.x, position.y);
  ctx.lineTo(targetPosition.x, targetPosition.y);
  ctx.strokeStyle = isActive ? '#4CAF50' : '#666';
  ctx.stroke();
}

// 获取区域颜色
function getRegionColor(type: string): string {
  switch (type) {
    case 'combat':
      return '#f44336';
    case 'boss':
      return '#9c27b0';
    case 'treasure':
      return '#ffc107';
    case 'spawn':
      return '#4CAF50';
    default:
      return '#666';
  }
}

// 获取连接颜色
function getConnectionColor(type: ConnectionType): string {
  switch (type) {
    case ConnectionType.DOOR:
      return '#795548';
    case ConnectionType.PORTAL:
      return '#2196F3';
    case ConnectionType.STAIRS:
      return '#607D8B';
    case ConnectionType.TELEPORTER:
      return '#4CAF50';
    default:
      return '#666';
  }
}

// 绘制区域图标
function drawRegionIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  position: Position,
  size: Size
): void {
  const centerX = position.x + size.width / 2;
  const centerY = position.y + size.height / 2;
  const iconSize = Math.min(size.width, size.height) / 4;

  ctx.fillStyle = '#fff';
  ctx.font = `${iconSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (type) {
    case 'combat':
      ctx.fillText('⚔', centerX, centerY);
      break;
    case 'boss':
      ctx.fillText('👑', centerX, centerY);
      break;
    case 'treasure':
      ctx.fillText('💰', centerX, centerY);
      break;
    case 'spawn':
      ctx.fillText('🚪', centerX, centerY);
      break;
  }
}

// 绘制连接图标
function drawConnectionIcon(
  ctx: CanvasRenderingContext2D,
  type: ConnectionType,
  position: Position
): void {
  const iconSize = 10;

  ctx.fillStyle = '#fff';
  ctx.font = `${iconSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (type) {
    case ConnectionType.DOOR:
      ctx.fillText('🚪', position.x, position.y);
      break;
    case ConnectionType.PORTAL:
      ctx.fillText('🌀', position.x, position.y);
      break;
    case ConnectionType.STAIRS:
      ctx.fillText('⬆', position.x, position.y);
      break;
    case ConnectionType.TELEPORTER:
      ctx.fillText('⚡', position.x, position.y);
      break;
  }
}

// 检查点是否在区域内
function isPointInRegion(point: Position, region: { position: Position; size: Size }): boolean {
  return (
    point.x >= region.position.x &&
    point.x <= region.position.x + region.size.width &&
    point.y >= region.position.y &&
    point.y <= region.position.y + region.size.height
  );
}

// 检查点是否在连接附近
function isPointNearConnection(
  point: Position,
  connection: { position: Position }
): boolean {
  const dx = point.x - connection.position.x;
  const dy = point.y - connection.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= 10;
} 