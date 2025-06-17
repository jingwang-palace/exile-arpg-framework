// 玩家数据管理器，用于处理数据的保存和加载
export class PlayerDataManager {
  private static readonly STORAGE_KEY = 'poe_player_data';
  
  // 保存玩家数据
  static savePlayerData(data: any): void {
    try {
      const playerData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playerData));
      console.log('✅ 玩家数据已保存');
    } catch (error) {
      console.error('❌ 保存玩家数据失败:', error);
    }
  }
  
  // 加载玩家数据
  static loadPlayerData(): any | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const playerData = JSON.parse(savedData);
        console.log('✅ 玩家数据已加载，保存时间:', new Date(playerData.timestamp || 0).toLocaleString());
        return playerData;
      } else {
        console.log('ℹ️ 没有找到保存的数据');
        return null;
      }
    } catch (error) {
      console.error('❌ 加载玩家数据失败:', error);
      return null;
    }
  }
  
  // 清空保存的数据
  static clearPlayerData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ 玩家数据已清空');
    } catch (error) {
      console.error('❌ 清空玩家数据失败:', error);
    }
  }
  
  // 更新特定字段
  static updatePlayerData(updates: Partial<any>): void {
    const currentData = this.loadPlayerData() || {};
    const newData = { ...currentData, ...updates };
    this.savePlayerData(newData);
  }
  
  // 获取特定字段
  static getPlayerDataField(field: string): any {
    const data = this.loadPlayerData();
    return data ? data[field] : undefined;
  }
} 