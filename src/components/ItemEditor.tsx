"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  Square,
  DoorOpen,
  Grid3X3,
  X,
  Check,
  Plus,
  Minus,
  Settings,
  Palette,
  Thermometer,
  Shield,
  Star,
  Eye,
  Trash,
  Calculator,
  Save,
  Download,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building,
  HomeIcon,
  Building2
} from "lucide-react";

interface Profile {
  id: string;
  profile_code: string;
  profile_name: string;
  Brand: string;
  price: number;
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  system_type?: string;
  glass_type?: string;
}

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

interface QuoteItem {
  id: string;
  uniqueId: string;
  type: 'window' | 'door' | 'skylight' | 'sunroom' | 'curtain_wall';
  system: string;
  quantity: number;
  width: number;
  height: number;
  leaves: number;
  glassType: 'single' | 'double';
  glassAppearance: string;
  color: string;
  argon: boolean;
  mosquito: boolean;
  arch: boolean;
  netType?: string;
  upperPanelType?: string;
  profile?: Profile;
  curtain?: CurtainWallData;
  svgPreview?: string;
  pricing?: {
    basePrice: number;
    areaPrice: number;
    optionsPrice: number;
    totalPrice: number;
    profit: number;
    profitRate: number;
  };
}

interface ItemEditorProps {
  item: QuoteItem;
  profiles: Profile[];
  onSave: (item: QuoteItem) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function ItemEditor({ item, profiles, onSave, onCancel, isOpen }: ItemEditorProps) {
  const [editedItem, setEditedItem] = useState<QuoteItem>(item);
  const [showCurtainDesigner, setShowCurtainDesigner] = useState(false);
  const [curtainMode, setCurtainMode] = useState<'structure' | 'window' | 'door'>('structure');
  const [selectedCurtainPanels, setSelectedCurtainPanels] = useState<string[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [showProfileSelection, setShowProfileSelection] = useState(false);
  const [showItemSummary, setShowItemSummary] = useState(false);

  useEffect(() => {
    if (item) {
      setEditedItem(item);
      if (item.type === 'curtain_wall' && !item.curtain) {
        initCurtainWallData();
      }
      updateAvailableProfiles();
    }
  }, [item]);

  // Don't render if no item is provided
  if (!item || !editedItem) {
    return null;
  }

  const initCurtainWallData = () => {
    const curtainData: CurtainWallData = {
      cols: 4,
      rows: 3,
      wallWidth: 4.0,
      wallHeight: 3.0,
      panels: [],
      frameMeters: 0,
      windowMeters: 0,
      glassArea: 0,
      cornerCount: 0,
      panelCount: 0,
      windowCount: 0,
      doorCount: 0,
      sharedEdges: 0,
      externalPerimeter: 0,
      internalDividers: 0
    };
    setEditedItem(prev => ({ ...prev, curtain: curtainData }));
  };

  const updateAvailableProfiles = () => {
    if (!editedItem.system || !editedItem.width || !editedItem.height) {
      setAvailableProfiles([]);
      return;
    }

    const filtered = profiles.filter(profile => {
      const matchesSystem = !profile.system_type || profile.system_type === editedItem.system;
      const matchesGlass = !profile.glass_type || profile.glass_type === editedItem.glassType;
      const matchesWidth = (!profile.min_width || editedItem.width >= profile.min_width) &&
                          (!profile.max_width || editedItem.width <= profile.max_width);
      const matchesHeight = (!profile.min_height || editedItem.height >= profile.min_height) &&
                           (!profile.max_height || editedItem.height <= profile.max_height);
      
      return matchesSystem && matchesGlass && matchesWidth && matchesHeight;
    });

    setAvailableProfiles(filtered);
    setShowProfileSelection(filtered.length > 0);
  };

  const updateItem = (updates: Partial<QuoteItem>) => {
    const updated = { ...editedItem, ...updates };
    setEditedItem(updated);
    
    // Update profiles when dimensions or system changes
    if (updates.width || updates.height || updates.system || updates.glassType) {
      setTimeout(() => updateAvailableProfiles(), 100);
    }
  };

  const selectProfile = (profile: Profile) => {
    updateItem({ profile });
    setShowProfileSelection(false);
  };

  const generateItemSVG = () => {
    // Generate SVG preview based on item configuration
    const svg = `<svg width="200" height="150" viewBox="0 0 200 150">
      <rect x="10" y="10" width="180" height="130" fill="none" stroke="#333" stroke-width="2"/>
      ${editedItem.leaves > 1 ? `<line x1="100" y1="10" x2="100" y2="140" stroke="#333" stroke-width="1"/>` : ''}
      ${editedItem.leaves > 2 ? `<line x1="50" y1="10" x2="50" y2="140" stroke="#333" stroke-width="1"/>` : ''}
      ${editedItem.leaves > 3 ? `<line x1="150" y1="10" x2="150" y2="140" stroke="#333" stroke-width="1"/>` : ''}
      <text x="100" y="80" text-anchor="middle" font-size="12" fill="#666">${editedItem.width}m × ${editedItem.height}m</text>
    </svg>`;
    return svg;
  };

  const handleSave = () => {
    const finalItem = {
      ...editedItem,
      svgPreview: generateItemSVG()
    };
    onSave(finalItem);
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'window': return <Square size={20} />;
      case 'door': return <DoorOpen size={20} />;
      case 'curtain_wall': return <Grid3X3 size={20} />;
      default: return <Building size={20} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Edit Item" size="lg">
      <div className="space-y-6">
        {/* Item Type Selection */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-[#303038]">Item Type</label>
          <div className="grid grid-cols-5 gap-3">
            {[
              { value: 'window', label: 'Window', icon: <Square size={20} /> },
              { value: 'door', label: 'Door', icon: <DoorOpen size={20} /> },
              { value: 'skylight', label: 'Skylight', icon: <Building size={20} /> },
              { value: 'sunroom', label: 'Sunroom', icon: <HomeIcon size={20} /> },
              { value: 'curtain_wall', label: 'Curtain Wall', icon: <Grid3X3 size={20} /> }
            ].map((type) => (
              <div
                key={type.value}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                  editedItem.type === type.value
                    ? 'border-[#A72036] bg-[#A72036]/5'
                    : 'border-gray-200 hover:border-[#A72036]/50'
                }`}
                onClick={() => updateItem({ type: type.value as QuoteItem['type'] })}
              >
                <div className="text-[#A72036] mb-1">{type.icon}</div>
                <span className="text-xs font-medium">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Item Summary Preview */}
        {showItemSummary && (
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">Item Design Preview</h4>
            <div className="text-center mb-3">
              <div dangerouslySetInnerHTML={{ __html: generateItemSVG() }} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium ml-2">{editedItem.width}m × {editedItem.height}m</span>
              </div>
              <div>
                <span className="text-gray-600">System:</span>
                <span className="font-medium ml-2">{editedItem.system}</span>
              </div>
              <div>
                <span className="text-gray-600">Leaves:</span>
                <span className="font-medium ml-2">{editedItem.leaves}</span>
              </div>
              <div>
                <span className="text-gray-600">Glass:</span>
                <span className="font-medium ml-2">{editedItem.glassType}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Basic Configuration */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Width (m)"
            type="number"
            value={editedItem.width}
            onChange={(e) => updateItem({ width: parseFloat(e.target.value) || 0 })}
            placeholder="1.5"
            min="0.1"
            step="0.1"
          />
          <Input
            label="Height (m)"
            type="number"
            value={editedItem.height}
            onChange={(e) => updateItem({ height: parseFloat(e.target.value) || 0 })}
            placeholder="2.0"
            min="0.1"
            step="0.1"
          />
          <Input
            label="Quantity"
            type="number"
            value={editedItem.quantity}
            onChange={(e) => updateItem({ quantity: parseInt(e.target.value) || 1 })}
            placeholder="1"
            min="1"
          />
        </div>

        {/* System Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">System Type</label>
            <select
              value={editedItem.system}
              onChange={(e) => updateItem({ system: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value="">Select system type</option>
              <option value="Sliding">Sliding</option>
              <option value="hinged">Hinged</option>
              <option value="folding">Folding</option>
              <option value="tilt">Tilt</option>
              <option value="tilt-turn">Tilt & Turn</option>
              <option value="lift-slide">Lift & Slide</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Leaves</label>
            <select
              value={editedItem.leaves}
              onChange={(e) => updateItem({ leaves: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value={2}>2 Leaves</option>
              <option value={3}>3 Leaves</option>
              <option value={4}>4 Leaves</option>
            </select>
          </div>
        </div>

        {/* Glass Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Glass Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="glassType"
                  value="single"
                  checked={editedItem.glassType === 'single'}
                  onChange={(e) => updateItem({ glassType: e.target.value as 'single' | 'double' })}
                  className="text-[#A72036]"
                />
                <span className="text-sm">Single</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="glassType"
                  value="double"
                  checked={editedItem.glassType === 'double'}
                  onChange={(e) => updateItem({ glassType: e.target.value as 'single' | 'double' })}
                  className="text-[#A72036]"
                />
                <span className="text-sm">Double</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Glass Appearance</label>
            <select
              value={editedItem.glassAppearance}
              onChange={(e) => updateItem({ glassAppearance: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value="clear">Clear</option>
              <option value="reflective-white">Reflective - White</option>
              <option value="reflective-grey">Reflective - Grey</option>
              <option value="reflective-blue">Reflective - Blue</option>
              <option value="reflective-black">Reflective - Black</option>
              <option value="smart-film">Smart Film</option>
            </select>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-[#303038]">Color</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: 'red', label: 'Red', color: '#dc2626' },
              { value: 'black', label: 'Black', color: '#000000' },
              { value: 'white', label: 'White', color: '#ffffff' },
              { value: 'grey', label: 'Grey', color: '#6b7280' }
            ].map((color) => (
              <div
                key={color.value}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                  editedItem.color === color.value
                    ? 'border-[#A72036] bg-[#A72036]/5'
                    : 'border-gray-200 hover:border-[#A72036]/50'
                }`}
                onClick={() => updateItem({ color: color.value })}
              >
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2 border border-gray-300"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs font-medium">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-[#303038]">Additional Options</label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#A72036]/50">
              <input
                type="checkbox"
                checked={editedItem.argon}
                onChange={(e) => updateItem({ argon: e.target.checked })}
                className="text-[#A72036]"
              />
              <Thermometer size={16} className="text-[#A72036]" />
              <span className="text-sm">Argon Heat Isolation</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#A72036]/50">
              <input
                type="checkbox"
                checked={editedItem.mosquito}
                onChange={(e) => updateItem({ mosquito: e.target.checked })}
                className="text-[#A72036]"
              />
              <Shield size={16} className="text-[#A72036]" />
              <span className="text-sm">Mosquito Net</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#A72036]/50">
              <input
                type="checkbox"
                checked={editedItem.arch}
                onChange={(e) => updateItem({ arch: e.target.checked })}
                className="text-[#A72036]"
              />
              <Star size={16} className="text-[#A72036]" />
              <span className="text-sm">Architrave</span>
            </label>
          </div>
        </div>

        {/* Conditional Fields */}
        {editedItem.mosquito && (
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Net Type</label>
            <select
              value={editedItem.netType || 'fixed'}
              onChange={(e) => updateItem({ netType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value="fixed">Fixed</option>
              <option value="plisse">Plisse</option>
              <option value="panda">Panda</option>
            </select>
          </div>
        )}

        {editedItem.system === 'hinged' && editedItem.leaves === 2 && (
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Upper Panel Type</label>
            <select
              value={editedItem.upperPanelType || 'hinged'}
              onChange={(e) => updateItem({ upperPanelType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value="hinged">Hinged</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
        )}

        {/* Profile Selection */}
        {showProfileSelection && (
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Available Profiles</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {availableProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    editedItem.profile?.id === profile.id
                      ? 'border-[#A72036] bg-[#A72036]/5'
                      : 'border-gray-200 hover:border-[#A72036]/50'
                  }`}
                  onClick={() => selectProfile(profile)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-[#303038]">{profile.Brand}</div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{profile.profile_code}</div>
                  </div>
                  <div className="text-[#A72036] font-semibold mb-2">{profile.profile_name}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    {profile.min_width && profile.max_width && `${profile.min_width}-${profile.max_width}m width`}
                    {profile.min_height && profile.max_height && ` • ${profile.min_height}-${profile.max_height}m height`}
                  </div>
                  <div className="text-center font-bold text-[#303038]">
                    ${profile.price}/m²
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curtain Wall Designer Button */}
        {editedItem.type === 'curtain_wall' && (
          <Button
            onClick={() => setShowCurtainDesigner(true)}
            className="w-full"
            variant="secondary"
          >
            <Grid3X3 size={16} className="mr-2" />
            Open Curtain Wall Designer
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button onClick={handleSave} className="flex-1">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>

      {/* Curtain Wall Designer Modal */}
      <Modal
        isOpen={showCurtainDesigner}
        onClose={() => setShowCurtainDesigner(false)}
        title="Curtain Wall Designer"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#303038]">Columns</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedItem.curtain?.cols || 4}
                onChange={(e) => updateItem({
                  curtain: { ...editedItem.curtain!, cols: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#303038]">Rows</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedItem.curtain?.rows || 3}
                onChange={(e) => updateItem({
                  curtain: { ...editedItem.curtain!, rows: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#303038]">Wall Width (m)</label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={editedItem.curtain?.wallWidth || 4.0}
                onChange={(e) => updateItem({
                  curtain: { ...editedItem.curtain!, wallWidth: parseFloat(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#303038]">Wall Height (m)</label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={editedItem.curtain?.wallHeight || 3.0}
                onChange={(e) => updateItem({
                  curtain: { ...editedItem.curtain!, wallHeight: parseFloat(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setShowCurtainDesigner(false)} className="flex-1">
              Apply Grid
            </Button>
            <Button variant="secondary" onClick={() => setShowCurtainDesigner(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
