"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ItemEditor } from "@/components/ItemEditor";
import { CurtainWallDesigner } from "@/components/CurtainWallDesigner";
import {
  FileText,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Square,
  DoorOpen,
  Grid3X3,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Calendar,
  DollarSign,
  Download,
  Save,
  Eye,
  Trash,
  Calculator,
  History,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  Palette,
  Thermometer,
  Shield,
  Star,
  Clock,
  Users,
  Home,
  Building2,
  HomeIcon,
  CreditCard,
  FileSpreadsheet,
  Printer
} from "lucide-react";

// Types
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

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  method: 'phone' | 'email' | 'whatsapp' | 'visit';
  location: string;
  notes: string;
}

interface Quote {
  id: string;
  name?: string;
  description?: string;
  projectType: 'commercial' | 'villa' | 'apartment';
  items: QuoteItem[];
  contactInfo: ContactInfo;
  createdAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  totalAmount: number;
  totalArea: number;
  totalProfit: number;
  averageProfitRate: number;
  pricePerM2: number;
  paymentSchedule: {
    downPayment: number;
    supplyPayment: number;
    completionPayment: number;
  };
}

export default function QuoteGeneratorPage() {
  const { user, loading, isUserApproved, signOut } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectType, setProjectType] = useState<'commercial' | 'villa' | 'apartment'>('commercial');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    method: 'phone',
    location: '',
    notes: ''
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCurtainDesigner, setShowCurtainDesigner] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [curtainMode, setCurtainMode] = useState<'structure' | 'window' | 'door'>('structure');
  const [selectedCurtainPanels, setSelectedCurtainPanels] = useState<string[]>([]);
  const [pricingCalculated, setPricingCalculated] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [generatedQuote, setGeneratedQuote] = useState<Quote | null>(null);
  const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Refs for curtain wall designer
  const curtainGridRef = useRef<HTMLDivElement>(null);
  const curtainDesignerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isUserApproved) {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, isUserApproved, router]);

  useEffect(() => {
    loadProfiles();
    if (items.length === 0) {
      addNewItem();
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  // Load profiles from localStorage (simulating Firebase)
  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      // Simulate loading profiles from localStorage
      const savedProfiles = localStorage.getItem("cocoonProfiles");
      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles(parsedProfiles);
      } else {
        // Mock profiles for demonstration
        const mockProfiles: Profile[] = [
          {
            id: "1",
            profile_code: "CW-001",
            profile_name: "Commercial Sliding Window",
            Brand: "Alumil",
            price: 850,
            min_width: 0.8,
            max_width: 3.0,
            min_height: 1.0,
            max_height: 2.5,
            system_type: "Sliding",
            glass_type: "double"
          },
          {
            id: "2",
            profile_code: "CW-002",
            profile_name: "Residential Hinged Door",
            Brand: "Alumil",
            price: 1200,
            min_width: 0.9,
            max_width: 1.2,
            min_height: 2.0,
            max_height: 2.4,
            system_type: "hinged",
            glass_type: "double"
          },
          {
            id: "3",
            profile_code: "CW-003",
            profile_name: "Curtain Wall System",
            Brand: "Alumil",
            price: 650,
            min_width: 0.5,
            max_width: 6.0,
            min_height: 0.5,
            max_height: 6.0,
            system_type: "curtain_wall",
            glass_type: "double"
          }
        ];
        setProfiles(mockProfiles);
        localStorage.setItem("cocoonProfiles", JSON.stringify(mockProfiles));
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const addNewItem = () => {
    const itemCount = items.length + 1;
    const uniqueId = generateUniqueId();
    
    const newItem: QuoteItem = {
      id: `item-${itemCount}`,
      uniqueId,
      type: 'window',
      system: '',
      quantity: 1,
      width: 0,
      height: 0,
      leaves: 2,
      glassType: 'double',
      glassAppearance: 'clear',
      color: '',
      argon: true,
      mosquito: false,
      arch: false
    };

    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const updateItemType = (itemId: string, type: QuoteItem['type']) => {
    updateItem(itemId, { type });
    
    // Initialize curtain wall data if type is curtain_wall
    if (type === 'curtain_wall') {
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
      updateItem(itemId, { curtain: curtainData });
      initCurtainWallDesigner(itemId);
    }
  };

  const initCurtainWallDesigner = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.curtain) return;

    const { cols, rows, wallWidth, wallHeight } = item.curtain;
    const panels: CurtainPanel[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const panelWidth = wallWidth / cols;
        const panelHeight = wallHeight / rows;
        
        panels.push({
          id: `${itemId}-panel-${row}-${col}`,
          x: col * panelWidth,
          y: row * panelHeight,
          width: panelWidth,
          height: panelHeight,
          type: 'structure',
          selected: false,
          merged: false,
          vertices: []
        });
      }
    }

    updateItem(itemId, {
      curtain: {
        ...item.curtain,
        panels,
        panelCount: panels.length
      }
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateItems = () => {
    return items.length > 0 && items.every(item => 
      item.type && item.system && item.width > 0 && item.height > 0
    );
  };

  const calculatePricing = () => {
    const pricedItems = items.map(item => {
      const area = item.width * item.height;
      const basePrice = item.profile?.price || 0;
      const areaPrice = basePrice * area;
      
      let optionsPrice = 0;
      if (item.argon) optionsPrice += area * 50;
      if (item.mosquito) optionsPrice += area * 30;
      if (item.arch) optionsPrice += area * 40;
      
      const totalPrice = areaPrice + optionsPrice;
      const profit = totalPrice * 0.25; // 25% profit margin
      const profitRate = 25;

      return {
        ...item,
        pricing: {
          basePrice,
          areaPrice,
          optionsPrice,
          totalPrice,
          profit,
          profitRate
        }
      };
    });

    const totals = {
      totalArea: pricedItems.reduce((sum, item) => sum + (item.width * item.height), 0),
      totalBeforeProfit: pricedItems.reduce((sum, item) => sum + (item.pricing?.areaPrice || 0), 0),
      totalProfit: pricedItems.reduce((sum, item) => sum + (item.pricing?.profit || 0), 0),
      totalProjectValue: pricedItems.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0)
    };

    const averageProfitRate = totals.totalBeforeProfit > 0 ? 
      (totals.totalProfit / totals.totalBeforeProfit) * 100 : 0;
    const pricePerM2 = totals.totalArea > 0 ? totals.totalProjectValue / totals.totalArea : 0;

    setItems(pricedItems);
    setPricingCalculated(true);
    setShowPricingBreakdown(true);

    return {
      pricedItems,
      totals: {
        ...totals,
        averageProfitRate,
        pricePerM2,
        paymentSchedule: {
          downPayment: totals.totalProjectValue * 0.8,
          supplyPayment: totals.totalProjectValue * 0.1,
          completionPayment: totals.totalProjectValue * 0.1
        }
      }
    };
  };

  const generateQuote = () => {
    const pricing = calculatePricing();
    const quoteId = `QU-${Date.now()}`;
    
    const quote: Quote = {
      id: quoteId,
      name: quoteName || `Quote ${quoteId}`,
      description: quoteDescription,
      projectType,
      items: pricing.pricedItems,
      contactInfo,
      createdAt: new Date().toISOString(),
      status: 'draft',
      totalAmount: pricing.totals.totalProjectValue,
      totalArea: pricing.totals.totalArea,
      totalProfit: pricing.totals.totalProfit,
      averageProfitRate: pricing.totals.averageProfitRate,
      pricePerM2: pricing.totals.pricePerM2,
      paymentSchedule: pricing.totals.paymentSchedule
    };

    setGeneratedQuote(quote);
    setShowSuccessModal(true);
    
    // Save to localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('cocoonQuotes') || '[]');
    savedQuotes.push(quote);
    localStorage.setItem('cocoonQuotes', JSON.stringify(savedQuotes));
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'commercial': return <Building2 size={24} />;
      case 'villa': return <HomeIcon size={24} />;
      case 'apartment': return <Building size={24} />;
      default: return <Building size={24} />;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'window': return <Square size={20} />;
      case 'door': return <DoorOpen size={20} />;
      case 'curtain_wall': return <Grid3X3 size={20} />;
      default: return <Building size={20} />;
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone size={16} />;
      case 'email': return <Mail size={16} />;
      case 'whatsapp': return <MessageSquare size={16} />;
      case 'visit': return <MapPin size={16} />;
      default: return <Phone size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72036] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#303038]">Quote Generator</h1>
          <p className="text-gray-600">Create professional quotes for your aluminum works projects</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step
                    ? 'bg-[#A72036] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <Check size={16} /> : step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-[#A72036]' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Project Type'}
                  {step === 2 && 'Items'}
                  {step === 3 && 'Contact Info'}
                  {step === 4 && 'Summary'}
                </span>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-[#A72036]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8">
          {/* Step 1: Project Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#303038]">Select Project Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'commercial', label: 'Commercial', icon: <Building2 size={24} /> },
                  { value: 'villa', label: 'Villa', icon: <HomeIcon size={24} /> },
                  { value: 'apartment', label: 'Apartment', icon: <Building size={24} /> }
                ].map((type) => (
                  <div
                    key={type.value}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      projectType === type.value
                        ? 'border-[#A72036] bg-[#A72036]/5'
                        : 'border-gray-200 hover:border-[#A72036]/50'
                    }`}
                    onClick={() => setProjectType(type.value as any)}
                  >
                    <div className="text-center">
                      <div className="text-[#A72036] mb-3">{type.icon}</div>
                      <h3 className="font-semibold text-lg">{type.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={nextStep}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#303038]">Add Items</h2>
                <Button onClick={addNewItem}>
                  <Plus size={16} /> Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Building size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No items added yet</h3>
                  <p className="text-gray-500">Add your first item to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-[#A72036]">
                            {getItemTypeIcon(item.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{item.type}</h3>
                            <p className="text-sm text-gray-600">
                              ID: {item.uniqueId} • {item.width}m × {item.height}m × {item.quantity} pcs
                            </p>
                            {item.profile && (
                              <p className="text-xs text-green-600 font-medium">
                                Profile: {item.profile.profile_name} (${item.profile.price}/m²)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => {
                              setEditingItem(item);
                              setShowItemModal(true);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                          {item.type === 'curtain_wall' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setShowCurtainDesigner(true)}
                            >
                              <Grid3X3 size={16} />
                              Design
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Item Preview */}
                      {item.svgPreview && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div dangerouslySetInnerHTML={{ __html: item.svgPreview }} />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button onClick={nextStep} disabled={!validateItems()}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#303038]">Contact Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                  placeholder="John Doe"
                />
                <Input
                  label="Phone Number"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  placeholder="+966 50 123 4567"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                placeholder="your.email@example.com"
              />

              <div>
                <label className="block mb-2 text-sm font-semibold text-[#303038]">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'phone', label: 'Phone Call', icon: <Phone size={16} /> },
                    { value: 'email', label: 'Email', icon: <Mail size={16} /> },
                    { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={16} /> },
                    { value: 'visit', label: 'Site Visit', icon: <MapPin size={16} /> }
                  ].map((method) => (
                    <div
                      key={method.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        contactInfo.method === method.value
                          ? 'border-[#A72036] bg-[#A72036]/5'
                          : 'border-gray-200 hover:border-[#A72036]/50'
                      }`}
                      onClick={() => setContactInfo({...contactInfo, method: method.value as any})}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-[#A72036]">{method.icon}</div>
                        <span className="text-sm font-medium">{method.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Project Location"
                value={contactInfo.location}
                onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})}
                placeholder="City, District"
              />

              <div>
                <label className="block mb-2 text-sm font-semibold text-[#303038]">
                  Additional Notes
                </label>
                <textarea
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo({...contactInfo, notes: e.target.value})}
                  placeholder="Any special requirements or notes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036] focus:ring-2 focus:ring-[#A72036]/20"
                  rows={4}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button onClick={nextStep}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#303038]">Summary & Quote Request</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#303038] mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project Type:</span>
                      <span className="font-semibold capitalize">{projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-semibold">{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Method:</span>
                      <span className="font-semibold capitalize">{contactInfo.method}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#303038] mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="font-semibold">{contactInfo.name}</p>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                    <p className="text-gray-600">{contactInfo.email}</p>
                    <p className="text-gray-600">{contactInfo.location}</p>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#303038] mb-4">Items Summary</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="text-[#A72036]">
                          {getItemTypeIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{item.type}</p>
                          <p className="text-sm text-gray-600">
                            {item.width}m × {item.height}m × {item.quantity} pcs
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#A72036]">
                          ${((item.profile?.price || 0) * item.width * item.height * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {!pricingCalculated && (
                <Button onClick={calculatePricing} className="w-full">
                  <Calculator size={16} /> Calculate Pricing
                </Button>
              )}

              {pricingCalculated && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[#303038] mb-4">Pricing Breakdown</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{item.type} - {item.uniqueId}</h4>
                            <span className="font-semibold text-[#A72036]">
                              ${item.pricing?.totalPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span>${item.pricing?.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Area Price:</span>
                              <span>${item.pricing?.areaPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Options:</span>
                              <span>${item.pricing?.optionsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Profit:</span>
                              <span className="text-green-600">${item.pricing?.profit.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[#303038] mb-4">Project Totals</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Area:</span>
                        <span className="font-semibold">{items.reduce((sum, item) => sum + (item.width * item.height), 0).toFixed(2)} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Before Profit:</span>
                        <span className="font-semibold">
                          ${items.reduce((sum, item) => sum + (item.pricing?.areaPrice || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit:</span>
                        <span className="font-semibold text-green-600">
                          ${items.reduce((sum, item) => sum + (item.pricing?.profit || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Profit Rate:</span>
                        <span className="font-semibold text-green-600">
                          {((items.reduce((sum, item) => sum + (item.pricing?.profit || 0), 0) / 
                             items.reduce((sum, item) => sum + (item.pricing?.areaPrice || 0), 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per m²:</span>
                        <span className="font-semibold text-[#A72036]">
                          ${(items.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0) / 
                              items.reduce((sum, item) => sum + (item.width * item.height), 0)).toFixed(2)}/m²
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3 font-bold text-lg">
                        <span>Total Project Value:</span>
                        <span className="text-[#A72036]">
                          ${items.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-green-50 border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Schedule
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Down Payment (80%):</span>
                        <span className="font-semibold text-green-800">
                          ${(items.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0) * 0.8).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supply Payment (10%):</span>
                        <span className="font-semibold text-green-800">
                          ${(items.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0) * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Payment (10%):</span>
                        <span className="font-semibold text-green-800">
                          ${(items.reduce((sum, item) => sum + (item.pricing?.totalPrice || 0), 0) * 0.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-orange-50 border-orange-200">
                    <h3 className="text-lg font-semibold text-[#303038] mb-4 flex items-center gap-2">
                      <Info size={20} className="text-orange-600" />
                      Final Recommendation
                    </h3>
                    <p className="text-gray-700">
                      Based on your project details, we recommend using high-quality aluminum profiles with thermal break technology for optimal energy efficiency. 
                      Consider upgrading to double-glazed units with low-E coating for better insulation performance.
                    </p>
                  </Card>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <div className="flex space-x-3">
                  <Button variant="secondary" onClick={() => setShowSaveModal(true)}>
                    <Save size={16} /> Save Draft
                  </Button>
                  <Button onClick={generateQuote}>
                    <Download size={16} /> Generate Quote
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Item Editor */}
      {editingItem && (
        <ItemEditor
          item={editingItem}
          profiles={profiles}
          onSave={(updatedItem) => {
            setItems(items.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ));
            setShowItemModal(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setShowItemModal(false);
            setEditingItem(null);
          }}
          isOpen={showItemModal}
        />
      )}

      {/* Curtain Wall Designer */}
      {showCurtainDesigner && editingItem && editingItem.curtain && (
        <Modal
          isOpen={showCurtainDesigner}
          onClose={() => setShowCurtainDesigner(false)}
          title="Curtain Wall Designer"
        >
          <CurtainWallDesigner
            data={editingItem.curtain}
            onUpdate={(updatedCurtainData) => {
              setItems(items.map(item =>
                item.id === editingItem.id
                  ? { ...item, curtain: updatedCurtainData }
                  : item
              ));
            }}
            onClose={() => setShowCurtainDesigner(false)}
          />
        </Modal>
      )}

      {/* Save Quote Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Quote"
      >
        <div className="space-y-4">
          <Input
            label="Quote Name"
            value={quoteName}
            onChange={(e) => setQuoteName(e.target.value)}
            placeholder="Enter a name for this quote..."
          />
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">
              Description (Optional)
            </label>
            <textarea
              value={quoteDescription}
              onChange={(e) => setQuoteDescription(e.target.value)}
              placeholder="Add any notes or description for this quote..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036] focus:ring-2 focus:ring-[#A72036]/20"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => setShowSaveModal(false)} className="flex-1">
              <Save size={16} /> Save Quote
            </Button>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Quote Generated Successfully!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-[#303038]">Quote Ready!</h3>
          <p className="text-gray-600">
            Your quote has been generated successfully. Quote ID: {generatedQuote?.id}
          </p>
          
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button className="flex-1">
              <FileSpreadsheet size={16} className="mr-2" />
              Export Excel
            </Button>
            <Button className="flex-1">
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
            <Button variant="secondary" className="flex-1">
              <Printer size={16} className="mr-2" />
              Print Quote
            </Button>
            <Button variant="secondary" className="flex-1">
              <History size={16} className="mr-2" />
              View History
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
