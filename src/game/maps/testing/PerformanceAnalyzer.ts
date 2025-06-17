import { DungeonMap } from '../DungeonMap';
import { IRegion } from '@/core/interfaces/IMapSystem';
import { RegionConnection } from '../connections/RegionConnection';

export interface PerformanceMetrics {
  regionCount: number;
  connectionCount: number;
  averageRegionSize: number;
  averageConnectionsPerRegion: number;
  pathFindingTime: number;
  validationTime: number;
  memoryUsage: number;
  fps: number;
}

export interface PerformanceReport {
  timestamp: number;
  mapId: string;
  regionCount: number;
  connectionCount: number;
  memoryUsage: number;
  bottlenecks: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
}

export interface PerformanceBottleneck {
  type: BottleneckType;
  severity: BottleneckSeverity;
  description: string;
  impact: string;
  location?: string;
}

export interface PerformanceRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  expectedImprovement: string;
  implementation: string;
}

export enum BottleneckType {
  REGION_COUNT = 'region_count',
  CONNECTION_COUNT = 'connection_count',
  REGION_SIZE = 'region_size',
  PATH_FINDING = 'path_finding',
  MEMORY_USAGE = 'memory_usage',
  RENDERING = 'rendering'
}

export enum BottleneckSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RecommendationType {
  OPTIMIZE_REGIONS = 'optimize_regions',
  OPTIMIZE_CONNECTIONS = 'optimize_connections',
  IMPROVE_PATH_FINDING = 'improve_path_finding',
  REDUCE_MEMORY = 'reduce_memory',
  IMPROVE_RENDERING = 'improve_rendering'
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class PerformanceAnalyzer {
  constructor(private map: DungeonMap) {}

  analyze(): PerformanceReport {
    const regionCount = this.map.getRegions().length;
    const connectionCount = this.map.getConnections().length;
    const memoryUsage = this.estimateMemoryUsage();

    const bottlenecks = this.identifyBottlenecks(regionCount, connectionCount, memoryUsage);

    return {
      timestamp: Date.now(),
      mapId: this.map.id,
      regionCount,
      connectionCount,
      memoryUsage,
      bottlenecks: bottlenecks.map(bottleneck => ({
        type: bottleneck.type,
        severity: bottleneck.severity,
        description: bottleneck.description
      }))
    };
  }

  private estimateMemoryUsage(): number {
    // 简单估算内存使用
    const regions = this.map.getRegions();
    const connections = this.map.getConnections();

    // 每个区域大约使用 1KB 内存
    const regionMemory = regions.length * 1024;

    // 每个连接大约使用 512B 内存
    const connectionMemory = connections.length * 512;

    // 基础内存使用
    const baseMemory = 1024 * 1024; // 1MB

    return baseMemory + regionMemory + connectionMemory;
  }

  private identifyBottlenecks(
    regionCount: number,
    connectionCount: number,
    memoryUsage: number
  ): PerformanceReport['bottlenecks'] {
    const bottlenecks: PerformanceReport['bottlenecks'] = [];

    // 检查区域数量
    if (regionCount > 100) {
      bottlenecks.push({
        type: 'region_count',
        severity: 'high',
        description: '区域数量过多，可能影响性能'
      });
    } else if (regionCount > 50) {
      bottlenecks.push({
        type: 'region_count',
        severity: 'medium',
        description: '区域数量较多，建议优化'
      });
    }

    // 检查连接数量
    if (connectionCount > 200) {
      bottlenecks.push({
        type: 'connection_count',
        severity: 'high',
        description: '连接数量过多，可能影响寻路性能'
      });
    } else if (connectionCount > 100) {
      bottlenecks.push({
        type: 'connection_count',
        severity: 'medium',
        description: '连接数量较多，建议优化'
      });
    }

    // 检查内存使用
    const memoryThreshold = 500 * 1024 * 1024; // 500MB
    if (memoryUsage > memoryThreshold) {
      bottlenecks.push({
        type: 'memory_usage',
        severity: 'high',
        description: '内存使用过高，建议优化数据结构'
      });
    } else if (memoryUsage > memoryThreshold * 0.7) {
      bottlenecks.push({
        type: 'memory_usage',
        severity: 'medium',
        description: '内存使用较高，建议关注'
      });
    }

    return bottlenecks;
  }
} 