import React, { useState } from 'react';
import { MapEditor } from './MapEditor';
import { MapPreview } from './MapPreview';
import { Position, Size } from '@/core/interfaces/IMapSystem';
import { ConnectionType } from '../connections/RegionConnection';

export const MapEditorUI: React.FC = () => {
  const [editor] = useState(() => new MapEditor());
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成新地图
  const handleGenerateMap = () => {
    setIsGenerating(true);
    editor.generateMap({
      width: 1000,
      height: 1000,
      roomCount: 10,
      minRoomSize: 100,
      maxRoomSize: 200
    });
    setIsGenerating(false);
  };

  // 保存地图
  const handleSaveMap = () => {
    const data = editor.saveMap();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 加载地图
  const handleLoadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      editor.loadMap(data);
    };
    reader.readAsText(file);
  };

  // 添加区域
  const handleAddRegion = (type: string) => {
    const id = `region_${Date.now()}`;
    editor.addRegion({
      id,
      name: `新${type}区域`,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      type
    });
  };

  // 添加连接
  const handleAddConnection = (type: ConnectionType) => {
    if (!selectedRegion) return;

    const id = `connection_${Date.now()}`;
    editor.addConnection({
      id,
      sourceRegion: selectedRegion,
      targetRegion: selectedRegion, // 临时使用相同区域，实际应该选择目标区域
      position: { x: 200, y: 200 },
      type
    });
  };

  return (
    <div className="map-editor">
      <div className="toolbar">
        <button onClick={handleGenerateMap} disabled={isGenerating}>
          {isGenerating ? '生成中...' : '生成新地图'}
        </button>
        <button onClick={handleSaveMap}>保存地图</button>
        <input type="file" accept=".json" onChange={handleLoadMap} />
        
        <div className="region-tools">
          <h3>区域工具</h3>
          <button onClick={() => handleAddRegion('combat')}>添加战斗区域</button>
          <button onClick={() => handleAddRegion('boss')}>添加Boss区域</button>
          <button onClick={() => handleAddRegion('treasure')}>添加宝箱区域</button>
          <button onClick={() => handleAddRegion('spawn')}>添加出生点</button>
        </div>

        <div className="connection-tools">
          <h3>连接工具</h3>
          <button onClick={() => handleAddConnection(ConnectionType.DOOR)}>添加门</button>
          <button onClick={() => handleAddConnection(ConnectionType.PORTAL)}>添加传送门</button>
          <button onClick={() => handleAddConnection(ConnectionType.STAIRS)}>添加楼梯</button>
          <button onClick={() => handleAddConnection(ConnectionType.TELEPORTER)}>添加传送器</button>
        </div>
      </div>

      <div className="editor-content">
        <MapPreview
          editor={editor}
          width={800}
          height={600}
          onRegionSelect={setSelectedRegion}
          onConnectionSelect={setSelectedConnection}
        />

        <div className="properties-panel">
          <h3>属性面板</h3>
          {selectedRegion && (
            <div className="region-properties">
              <h4>区域属性</h4>
              {/* 区域属性编辑表单 */}
            </div>
          )}
          {selectedConnection && (
            <div className="connection-properties">
              <h4>连接属性</h4>
              {/* 连接属性编辑表单 */}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .map-editor {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 20px;
          background: #2a2a2a;
          color: #fff;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: #333;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .toolbar button {
          padding: 8px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .toolbar button:hover {
          background: #45a049;
        }

        .toolbar button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .editor-content {
          display: flex;
          gap: 20px;
          flex: 1;
        }

        .properties-panel {
          width: 300px;
          background: #333;
          padding: 20px;
          border-radius: 4px;
        }

        .region-tools,
        .connection-tools {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px;
          background: #444;
          border-radius: 4px;
        }

        h3 {
          margin: 0 0 10px 0;
          color: #fff;
        }

        h4 {
          margin: 0 0 10px 0;
          color: #fff;
        }
      `}</style>
    </div>
  );
}; 