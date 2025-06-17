export class ConfigLoader {
  /**
   * 加载配置文件
   * @param path 配置文件路径
   * @returns 解析后的配置对象
   */
  public static async loadConfig<T>(path: string): Promise<T> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`无法加载配置文件：${path}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`加载配置文件失败：${path}`, error);
      throw error;
    }
  }

  /**
   * 同步加载配置文件（用于Phaser场景中不支持异步的情况）
   * @param configObject 存储配置的对象引用
   * @param path 配置文件路径
   */
  public static loadConfigSync<T>(configObject: { data: T | null }, path: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path, false); // false表示同步请求
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          configObject.data = JSON.parse(xhr.responseText);
        } else {
          console.error(`同步加载配置文件失败：${path}`);
        }
      }
    };
    xhr.send();
  }
} 