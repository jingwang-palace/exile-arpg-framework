import { IMap } from '@/core/interfaces/IMap';
import { IRegion } from '@/core/interfaces/IRegion';
import { IConnection } from '@/core/interfaces/IConnection';
import { Vector2D } from '@/core/math/Vector2D';
import { MapType } from '@/core/interfaces/IMapSystem';

export interface MapState {
  id: string;
  type: MapType;
  name: string;
  level: number;
  difficulty: number;
  regions: RegionState[];
  connections: ConnectionState[];
  properties: Map<string, any>;
  currentRegion: string | null;
  visitedRegions: Set<string>;
  clearedRegions: Set<string>;
  exploredConnections: Set<string>;
}

export interface RegionState {
  id: string;
  type: string;
  name: string;
  position: Vector2D;
  size: { width: number; height: number };
  properties: Map<string, any>;
  isVisited: boolean;
  isCleared: boolean;
  isExplored: boolean;
}

export interface ConnectionState {
  id: string;
  type: string;
  sourceRegionId: string;
  targetRegionId: string;
  properties: Map<string, any>;
  isExplored: boolean;
  isTraversed: boolean;
}

export class MapStateManager {
  private state: MapState;

  constructor(map: IMap) {
    this.state = this.createInitialState(map);
  }

  private createInitialState(map: IMap): MapState {
    return {
      id: map.id,
      type: map.type,
      name: map.name,
      level: map.level,
      difficulty: map.difficulty,
      regions: map.regions.map(region => this.createRegionState(region)),
      connections: map.connections.map(connection => this.createConnectionState(connection)),
      properties: new Map(map.properties),
      currentRegion: null,
      visitedRegions: new Set(),
      clearedRegions: new Set(),
      exploredConnections: new Set()
    };
  }

  private createRegionState(region: IRegion): RegionState {
    return {
      id: region.id,
      type: region.type,
      name: region.name,
      position: region.position,
      size: region.size,
      properties: new Map(region.properties),
      isVisited: false,
      isCleared: false,
      isExplored: false
    };
  }

  private createConnectionState(connection: IConnection): ConnectionState {
    return {
      id: connection.id,
      type: connection.type,
      sourceRegionId: connection.sourceRegion.id,
      targetRegionId: connection.targetRegion.id,
      properties: new Map(connection.properties),
      isExplored: false,
      isTraversed: false
    };
  }

  getState(): MapState {
    return this.state;
  }

  setCurrentRegion(regionId: string): void {
    this.state.currentRegion = regionId;
  }

  getCurrentRegion(): string | null {
    return this.state.currentRegion;
  }

  visitRegion(regionId: string): void {
    this.state.visitedRegions.add(regionId);
    const region = this.state.regions.find(r => r.id === regionId);
    if (region) {
      region.isVisited = true;
    }
  }

  clearRegion(regionId: string): void {
    this.state.clearedRegions.add(regionId);
    const region = this.state.regions.find(r => r.id === regionId);
    if (region) {
      region.isCleared = true;
    }
  }

  exploreRegion(regionId: string): void {
    const region = this.state.regions.find(r => r.id === regionId);
    if (region) {
      region.isExplored = true;
    }
  }

  exploreConnection(connectionId: string): void {
    this.state.exploredConnections.add(connectionId);
    const connection = this.state.connections.find(c => c.id === connectionId);
    if (connection) {
      connection.isExplored = true;
    }
  }

  traverseConnection(connectionId: string): void {
    const connection = this.state.connections.find(c => c.id === connectionId);
    if (connection) {
      connection.isTraversed = true;
    }
  }

  isRegionVisited(regionId: string): boolean {
    return this.state.visitedRegions.has(regionId);
  }

  isRegionCleared(regionId: string): boolean {
    return this.state.clearedRegions.has(regionId);
  }

  isRegionExplored(regionId: string): boolean {
    const region = this.state.regions.find(r => r.id === regionId);
    return region ? region.isExplored : false;
  }

  isConnectionExplored(connectionId: string): boolean {
    return this.state.exploredConnections.has(connectionId);
  }

  isConnectionTraversed(connectionId: string): boolean {
    const connection = this.state.connections.find(c => c.id === connectionId);
    return connection ? connection.isTraversed : false;
  }

  getVisitedRegions(): string[] {
    return Array.from(this.state.visitedRegions);
  }

  getClearedRegions(): string[] {
    return Array.from(this.state.clearedRegions);
  }

  getExploredConnections(): string[] {
    return Array.from(this.state.exploredConnections);
  }

  getRegionState(regionId: string): RegionState | undefined {
    return this.state.regions.find(r => r.id === regionId);
  }

  getConnectionState(connectionId: string): ConnectionState | undefined {
    return this.state.connections.find(c => c.id === connectionId);
  }

  setRegionProperty(regionId: string, key: string, value: any): void {
    const region = this.state.regions.find(r => r.id === regionId);
    if (region) {
      region.properties.set(key, value);
    }
  }

  setConnectionProperty(connectionId: string, key: string, value: any): void {
    const connection = this.state.connections.find(c => c.id === connectionId);
    if (connection) {
      connection.properties.set(key, value);
    }
  }

  setMapProperty(key: string, value: any): void {
    this.state.properties.set(key, value);
  }

  getRegionProperty(regionId: string, key: string): any {
    const region = this.state.regions.find(r => r.id === regionId);
    return region ? region.properties.get(key) : undefined;
  }

  getConnectionProperty(connectionId: string, key: string): any {
    const connection = this.state.connections.find(c => c.id === connectionId);
    return connection ? connection.properties.get(key) : undefined;
  }

  getMapProperty(key: string): any {
    return this.state.properties.get(key);
  }

  reset(): void {
    this.state.currentRegion = null;
    this.state.visitedRegions.clear();
    this.state.clearedRegions.clear();
    this.state.exploredConnections.clear();

    for (const region of this.state.regions) {
      region.isVisited = false;
      region.isCleared = false;
      region.isExplored = false;
    }

    for (const connection of this.state.connections) {
      connection.isExplored = false;
      connection.isTraversed = false;
    }
  }
} 