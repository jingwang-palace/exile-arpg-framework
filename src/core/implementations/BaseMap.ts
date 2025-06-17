import { 
  IMap, 
  IRegion, 
  IMapEntity, 
  MapType, 
  Size 
} from '../interfaces/IMapSystem';

export abstract class BaseMap implements IMap {
  id: string;
  name: string;
  type: MapType;
  size: Size;
  regions: IRegion[];
  entities: Map<string, IMapEntity>;
  properties: Map<string, any>;

  constructor(config: {
    id: string;
    name: string;
    type: MapType;
    size: Size;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.size = config.size;
    this.regions = [];
    this.entities = new Map();
    this.properties = new Map();
  }

  async initialize(): Promise<void> {
    // 初始化地图
    await this.loadRegions();
    await this.loadEntities();
    await this.setupCollisions();
  }

  update(delta: number): void {
    // 更新所有实体
    this.entities.forEach(entity => {
      entity.update(delta);
    });

    // 更新区域
    this.regions.forEach(region => {
      this.updateRegion(region, delta);
    });
  }

  destroy(): void {
    // 清理所有实体
    this.entities.forEach(entity => {
      entity.destroy();
    });
    this.entities.clear();

    // 清理区域
    this.regions = [];
  }

  // 抽象方法，需要子类实现
  protected abstract loadRegions(): Promise<void>;
  protected abstract loadEntities(): Promise<void>;
  protected abstract setupCollisions(): Promise<void>;
  protected abstract updateRegion(region: IRegion, delta: number): void;
} 