"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Square,
  DoorOpen,
  Grid3X3,
  Calculator,
  Settings,
  RotateCcw,
  Group,
  Ungroup,
  Eye,
  X,
  Check,
  Plus,
  Minus
} from "lucide-react";

interface CurtainPanel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'structure' | 'window' | 'door';
  selected: boolean;
  merged: boolean;
  vertices: { x: number; y: number }[];
}

interface CurtainWallData {
  cols: number;
  rows: number;
  wallWidth: number;
  wallHeight: number;
  panels: CurtainPanel[];
  frameMeters: number;
  windowMeters: number;
  glassArea: number;
  cornerCount: number;
  panelCount: number;
  windowCount: number;
  doorCount: number;
  sharedEdges: number;
  externalPerimeter: number;
  internalDividers: number;
}

interface CurtainWallDesignerProps {
  data: CurtainWallData;
  onUpdate: (data: CurtainWallData) => void;
  onClose: () => void;
}

export function CurtainWallDesigner({ data, onUpdate, onClose }: CurtainWallDesignerProps) {
  const [curtainData, setCurtainData] = useState<CurtainWallData>(data);
  const [mode, setMode] = useState<'structure' | 'window' | 'door'>('structure');
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [columnSizes, setColumnSizes] = useState<number[]>([]);
  const [rowSizes, setRowSizes] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurtainData(data);
    generateColumnSizes();
    generateRowSizes();
    generatePanels();
  }, [data]);

  const generateColumnSizes = () => {
    const sizes = Array(curtainData.cols).fill(curtainData.wallWidth / curtainData.cols);
    setColumnSizes(sizes);
  };

  const generateRowSizes = () => {
    const sizes = Array(curtainData.rows).fill(curtainData.wallHeight / curtainData.rows);
    setRowSizes(sizes);
  };

  const generatePanels = () => {
    const panels: CurtainPanel[] = [];
    let xOffset = 0;
    
    for (let row = 0; row < curtainData.rows; row++) {
      let yOffset = row * (curtainData.wallHeight / curtainData.rows);
      
      for (let col = 0; col < curtainData.cols; col++) {
        const panelWidth = columnSizes[col] || curtainData.wallWidth / curtainData.cols;
        const panelHeight = rowSizes[row] || curtainData.wallHeight / curtainData.rows;
        
        panels.push({
          id: `panel-${row}-${col}`,
          x: xOffset,
          y: yOffset,
          width: panelWidth,
          height: panelHeight,
          type: 'structure',
          selected: false,
          merged: false,
          vertices: []
        });
        
        xOffset += panelWidth;
      }
      xOffset = 0;
    }

    const updatedData = {
      ...curtainData,
      panels,
      panelCount: panels.length
    };
    
    setCurtainData(updatedData);
    calculateMetrics(updatedData);
  };

  const calculateMetrics = (data: CurtainWallData) => {
    let frameMeters = 0;
    let windowMeters = 0;
    let glassArea = 0;
    let windowCount = 0;
    let doorCount = 0;
    let externalPerimeter = 0;
    let internalDividers = 0;

    // Calculate external perimeter
    externalPerimeter = 2 * (data.wallWidth + data.wallHeight);
    
    // Calculate internal dividers
    internalDividers = (data.cols - 1) * data.wallHeight + (data.rows - 1) * data.wallWidth;

    // Calculate panel-specific metrics
    data.panels.forEach(panel => {
      if (panel.type === 'window') {
        windowCount++;
        windowMeters += 2 * (panel.width + panel.height);
        glassArea += panel.width * panel.height;
      } else if (panel.type === 'door') {
        doorCount++;
        frameMeters += 2 * (panel.width + panel.height);
      } else {
        frameMeters += 2 * (panel.width + panel.height);
      }
    });

    const updatedData = {
      ...data,
      frameMeters,
      windowMeters,
      glassArea,
      windowCount,
      doorCount,
      externalPerimeter,
      internalDividers,
      cornerCount: 4
    };

    setCurtainData(updatedData);
    onUpdate(updatedData);
  };

  const handlePanelClick = (panelId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedPanels(prev => 
        prev.includes(panelId) 
          ? prev.filter(id => id !== panelId)
          : [...prev, panelId]
      );
    } else {
      // Single select
      setSelectedPanels([panelId]);
    }

    // Update panel type
    const updatedPanels = curtainData.panels.map(panel => ({
      ...panel,
      type: panel.id === panelId ? mode : panel.type,
      selected: panel.id === panelId
    }));

    const updatedData = { ...curtainData, panels: updatedPanels };
    setCurtainData(updatedData);
    calculateMetrics(updatedData);
  };

  const mergePanels = () => {
    if (selectedPanels.length < 2) return;

    const selectedPanelObjects = curtainData.panels.filter(p => selectedPanels.includes(p.id));
    const minX = Math.min(...selectedPanelObjects.map(p => p.x));
    const minY = Math.min(...selectedPanelObjects.map(p => p.y));
    const maxX = Math.max(...selectedPanelObjects.map(p => p.x + p.width));
    const maxY = Math.max(...selectedPanelObjects.map(p => p.y + p.height));

    const mergedPanel: CurtainPanel = {
      id: `merged-${Date.now()}`,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      type: mode,
      selected: false,
      merged: true,
      vertices: []
    };

    const updatedPanels = [
      ...curtainData.panels.filter(p => !selectedPanels.includes(p.id)),
      mergedPanel
    ];

    const updatedData = { ...curtainData, panels: updatedPanels };
    setCurtainData(updatedData);
    setSelectedPanels([]);
    calculateMetrics(updatedData);
  };

  const clearSelection = () => {
    setSelectedPanels([]);
    const updatedPanels = curtainData.panels.map(panel => ({
      ...panel,
      selected: false
    }));
    setCurtainData({ ...curtainData, panels: updatedPanels });
  };

  const getPanelStyle = (panel: CurtainPanel) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${(panel.x / curtainData.wallWidth) * 100}%`,
      top: `${(panel.y / curtainData.wallHeight) * 100}%`,
      width: `${(panel.width / curtainData.wallWidth) * 100}%`,
      height: `${(panel.height / curtainData.wallHeight) * 100}%`,
      border: '2px solid #ddd',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column' as const,
      fontSize: '0.75rem',
      fontWeight: '600',
      minWidth: '30px',
      minHeight: '30px',
      padding: '10px',
      boxSizing: 'border-box' as const,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    // Type-specific styling
    if (panel.type === 'structure') {
      return {
        ...baseStyle,
        backgroundColor: '#e9f7ef',
        borderColor: '#2ecc71'
      };
    } else if (panel.type === 'window') {
      return {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        borderColor: '#42a5f5'
      };
    } else if (panel.type === 'door') {
      return {
        ...baseStyle,
        backgroundColor: '#ffecb3',
        borderColor: '#ffca28'
      };
    }

    return baseStyle;
  };

  const getModeIcon = (modeType: string) => {
    switch (modeType) {
      case 'structure': return <Square size={16} style={{ color: '#2ecc71' }} />;
      case 'window': return <Eye size={16} style={{ color: '#42a5f5' }} />;
      case 'door': return <DoorOpen size={16} style={{ color: '#ffca28' }} />;
      default: return <Square size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#303038] flex items-center justify-center gap-2">
          <Grid3X3 size={24} />
          Curtain Wall Designer
        </h3>
        <p className="text-gray-600">Design your curtain wall structure and get precise measurements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="space-y-4">
          {/* Design Tools */}
          <Card className="p-4">
            <h4 className="font-semibold text-[#303038] mb-3 flex items-center gap-2">
              <Settings size={16} />
              Design Tools
            </h4>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { value: 'structure', label: 'Structure', icon: <Square size={16} style={{ color: '#2ecc71' }} /> },
                { value: 'window', label: 'Window', icon: <Eye size={16} style={{ color: '#42a5f5' }} /> },
                { value: 'door', label: 'Door', icon: <DoorOpen size={16} style={{ color: '#ffca28' }} /> }
              ].map((modeOption) => (
                <div
                  key={modeOption.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    mode === modeOption.value
                      ? 'border-[#A72036] bg-[#A72036]/5'
                      : 'border-gray-200 hover:border-[#A72036]/50'
                  }`}
                  onClick={() => setMode(modeOption.value as any)}
                >
                  <div className="mb-1">{modeOption.icon}</div>
                  <span className="text-xs font-medium">{modeOption.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={clearSelection}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <X size={16} className="mr-2" />
                Clear Selection
              </Button>
              <Button
                onClick={mergePanels}
                disabled={selectedPanels.length < 2}
                size="sm"
                className="w-full"
              >
                <Group size={16} className="mr-2" />
                Merge Panels
              </Button>
            </div>
          </Card>

          {/* Setup Parameters */}
          <Card className="p-4">
            <h4 className="font-semibold text-[#303038] mb-3 flex items-center gap-2">
              <Settings size={16} />
              Setup Parameters
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={curtainData.cols}
                    onChange={(e) => {
                      const newData = { ...curtainData, cols: parseInt(e.target.value) };
                      setCurtainData(newData);
                      generateColumnSizes();
                      generatePanels();
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={curtainData.rows}
                    onChange={(e) => {
                      const newData = { ...curtainData, rows: parseInt(e.target.value) };
                      setCurtainData(newData);
                      generateRowSizes();
                      generatePanels();
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Wall Width (m)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={curtainData.wallWidth}
                  onChange={(e) => {
                    const newData = { ...curtainData, wallWidth: parseFloat(e.target.value) };
                    setCurtainData(newData);
                    generatePanels();
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Wall Height (m)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={curtainData.wallHeight}
                  onChange={(e) => {
                    const newData = { ...curtainData, wallHeight: parseFloat(e.target.value) };
                    setCurtainData(newData);
                    generatePanels();
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                />
              </div>

              <Button
                onClick={generatePanels}
                size="sm"
                className="w-full"
              >
                <RotateCcw size={16} className="mr-2" />
                Apply Grid
              </Button>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <h4 className="font-semibold text-[#303038] mb-2">How to design your curtain wall:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Set the number of columns and rows</li>
              <li>• Enter exact sizes for each column and row</li>
              <li>• Enter your wall dimensions for accurate calculations</li>
              <li>• Select a tool (Structure, Window, or Door)</li>
              <li>• Click on panels to assign types</li>
              <li>• Select multiple panels to merge them</li>
              <li>• Everything refreshes automatically when you change dimensions</li>
            </ul>
          </Card>
        </div>

        {/* Design Area */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white min-h-[400px] p-4">
              <div
                ref={gridRef}
                className="relative w-full h-full min-h-[400px] bg-gray-50 rounded-lg p-2"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                {curtainData.panels.map((panel) => (
                  <div
                    key={panel.id}
                    style={getPanelStyle(panel)}
                    onClick={(e) => handlePanelClick(panel.id, e)}
                    className={`${panel.selected ? 'ring-2 ring-[#A72036] ring-offset-2' : ''} ${
                      panel.merged ? 'ring-2 ring-[#A72036] bg-[#A72036]/10' : ''
                    }`}
                  >
                    <div className="text-xs bg-black/20 text-white px-1 rounded absolute top-1 left-1">
                      {panel.id.split('-')[1]}
                    </div>
                    <div className="text-center">
                      <div className="mb-1">{getModeIcon(panel.type)}</div>
                      <div className="text-xs font-medium">{panel.type}</div>
                      <div className="text-xs text-gray-600">
                        {panel.width.toFixed(1)}×{panel.height.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                Hold Ctrl/Cmd and click to select multiple panels
              </div>
            </div>
          </Card>

          {/* Calculations */}
          <Card className="p-4 mt-4">
            <h4 className="font-semibold text-[#303038] mb-3 flex items-center gap-2">
              <Calculator size={16} />
              Calculations
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-[#A72036]/5 border-l-4 border-[#A72036] rounded">
                <div className="text-2xl font-bold text-[#A72036]">{curtainData.frameMeters.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Frame Meters</div>
              </div>
              <div className="text-center p-3 bg-[#A72036]/5 border-l-4 border-[#A72036] rounded">
                <div className="text-2xl font-bold text-[#A72036]">{curtainData.windowMeters.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Window/Door Meters</div>
              </div>
              <div className="text-center p-3 bg-[#A72036]/5 border-l-4 border-[#A72036] rounded">
                <div className="text-2xl font-bold text-[#A72036]">{curtainData.glassArea.toFixed(2)} m²</div>
                <div className="text-xs text-gray-600">Glass Area</div>
              </div>
              <div className="text-center p-3 bg-[#A72036]/5 border-l-4 border-[#A72036] rounded">
                <div className="text-2xl font-bold text-[#A72036]">{curtainData.cornerCount}</div>
                <div className="text-xs text-gray-600">Corners</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-[#303038] mb-2">Calculation Details</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Panels:</span>
                  <span className="font-medium">{curtainData.panelCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Windows:</span>
                  <span className="font-medium">{curtainData.windowCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doors:</span>
                  <span className="font-medium">{curtainData.doorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shared Edges:</span>
                  <span className="font-medium">{curtainData.sharedEdges.toFixed(2)} m</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          <Check size={16} className="mr-2" />
          Apply Design
        </Button>
      </div>
    </div>
  );
}
