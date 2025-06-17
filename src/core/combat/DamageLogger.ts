import { IDamage, IDamageResult, DamageType, DamageSourceType } from './types/Damage';

/**
 * 伤害日志条目接口
 */
interface IDamageLogEntry {
  timestamp: number;
  damage: IDamage;
  result: IDamageResult;
  source: any;
  target: any;
}

/**
 * 伤害统计接口
 */
interface IDamageStats {
  totalDamage: number;
  criticalHits: number;
  totalHits: number;
  damageByType: Map<DamageType, number>;
  damageBySource: Map<DamageSourceType, number>;
  highestHit: number;
  averageDamage: number;
}

/**
 * 伤害日志系统
 * 负责记录和分析游戏中的伤害数据
 */
export class DamageLogger {
  private logs: IDamageLogEntry[];
  private stats: Map<string, IDamageStats>;
  private maxLogEntries: number;

  constructor(maxLogEntries: number = 1000) {
    this.logs = [];
    this.stats = new Map();
    this.maxLogEntries = maxLogEntries;
  }

  /**
   * 记录伤害
   * @param damage 伤害信息
   * @param result 伤害结果
   */
  public logDamage(damage: IDamage, result: IDamageResult): void {
    const entry: IDamageLogEntry = {
      timestamp: Date.now(),
      damage,
      result,
      source: damage.source,
      target: damage.target
    };

    // 添加日志
    this.logs.push(entry);
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }

    // 更新统计
    this.updateStats(entry);
  }

  /**
   * 更新伤害统计
   * @param entry 伤害日志条目
   */
  private updateStats(entry: IDamageLogEntry): void {
    const sourceId = entry.source.id;
    if (!this.stats.has(sourceId)) {
      this.stats.set(sourceId, {
        totalDamage: 0,
        criticalHits: 0,
        totalHits: 0,
        damageByType: new Map(),
        damageBySource: new Map(),
        highestHit: 0,
        averageDamage: 0
      });
    }

    const stats = this.stats.get(sourceId)!;
    stats.totalDamage += entry.result.finalAmount;
    stats.totalHits++;
    if (entry.result.isCritical) {
      stats.criticalHits++;
    }
    stats.highestHit = Math.max(stats.highestHit, entry.result.finalAmount);
    stats.averageDamage = stats.totalDamage / stats.totalHits;

    // 更新伤害类型统计
    const typeDamage = stats.damageByType.get(entry.damage.type) || 0;
    stats.damageByType.set(entry.damage.type, typeDamage + entry.result.finalAmount);

    // 更新伤害来源统计
    const sourceDamage = stats.damageBySource.get(entry.damage.sourceType) || 0;
    stats.damageBySource.set(entry.damage.sourceType, sourceDamage + entry.result.finalAmount);
  }

  /**
   * 获取伤害统计
   * @param sourceId 来源ID
   * @returns 伤害统计
   */
  public getStats(sourceId: string): IDamageStats | undefined {
    return this.stats.get(sourceId);
  }

  /**
   * 获取最近的伤害日志
   * @param count 日志数量
   * @returns 伤害日志列表
   */
  public getRecentLogs(count: number = 10): IDamageLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * 获取特定时间范围内的伤害日志
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 伤害日志列表
   */
  public getLogsInTimeRange(startTime: number, endTime: number): IDamageLogEntry[] {
    return this.logs.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * 获取特定目标的伤害日志
   * @param targetId 目标ID
   * @returns 伤害日志列表
   */
  public getTargetLogs(targetId: string): IDamageLogEntry[] {
    return this.logs.filter(entry => entry.target.id === targetId);
  }

  /**
   * 获取特定来源的伤害日志
   * @param sourceId 来源ID
   * @returns 伤害日志列表
   */
  public getSourceLogs(sourceId: string): IDamageLogEntry[] {
    return this.logs.filter(entry => entry.source.id === sourceId);
  }

  /**
   * 清除所有日志
   */
  public clearLogs(): void {
    this.logs = [];
    this.stats.clear();
  }

  /**
   * 导出伤害统计
   * @returns 伤害统计数据
   */
  public exportStats(): string {
    return JSON.stringify(Array.from(this.stats.entries()), null, 2);
  }

  /**
   * 导出伤害日志
   * @returns 伤害日志数据
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
} 