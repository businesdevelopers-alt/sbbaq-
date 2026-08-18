import React, { useState, useMemo } from 'react';
import { 
  Branch, 
  License, 
  ComplianceViolation, 
  Establishment, 
  InspectionHotspot, 
  GeoRiskLayerType 
} from '../types';
import {
  MapPin,
  Compass,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Clock,
  Coins,
  Radar,
  Flame,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Phone,
  Store,
  Navigation,
  Check,
  TrendingUp
} from 'lucide-react';

interface GeographicRiskMapProps {
  establishment: Establishment;
  branches: Branch[];
  licenses: License[];
  violations: ComplianceViolation[];
  hotspots?: InspectionHotspot[];
  onSelectBranch?: (branch: Branch) => void;
  onAddBranch?: (branch: Partial<Branch>) => void;
  onRenewLicense?: (licenseId: string) => void;
  onOpenObjectionModal?: (violation: ComplianceViolation) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast: (msg: string) => void;
}

// Saudi regions and major city coordinate definitions for vector canvas mapping
interface CityGeoConfig {
  id: string;
  name: string;
  region: string;
  svgX: number; // percentage 0-100 on SVG viewbox
  svgY: number; // percentage 0-100 on SVG viewbox
  lat: number;
  lng: number;
  zoomLevel: number;
}

const SAUDI_CITIES: Record<string, CityGeoConfig> = {
  'الرياض': { id: 'ruh', name: 'الرياض', region: 'منطقة الرياض', svgX: 58, svgY: 48, lat: 24.7136, lng: 46.6753, zoomLevel: 1 },
  'جدة': { id: 'jed', name: 'جدة', region: 'منطقة مكة المكرمة', svgX: 28, svgY: 60, lat: 21.5892, lng: 39.1235, zoomLevel: 1 },
  'الدمام': { id: 'dmm', name: 'الدمام', region: 'المنطقة الشرقية', svgX: 74, svgY: 43, lat: 26.4344, lng: 50.1033, zoomLevel: 1 },
  'الخبر': { id: 'khb', name: 'الخبر', region: 'المنطقة الشرقية', svgX: 75, svgY: 45, lat: 26.2886, lng: 50.2084, zoomLevel: 1 },
  'مكة المكرمة': { id: 'mak', name: 'مكة المكرمة', region: 'منطقة مكة المكرمة', svgX: 30, svgY: 62, lat: 21.4133, lng: 39.8672, zoomLevel: 1 },
  'المدينة المنورة': { id: 'med', name: 'المدينة المنورة', region: 'منطقة المدينة المنورة', svgX: 30, svgY: 46, lat: 24.4754, lng: 39.5932, zoomLevel: 1 },
  'أبها': { id: 'abh', name: 'أبها', region: 'منطقة عسير', svgX: 39, svgY: 78, lat: 18.2164, lng: 42.5053, zoomLevel: 1 },
  'تبوك': { id: 'tbk', name: 'تبوك', region: 'منطقة تبوك', svgX: 22, svgY: 25, lat: 28.3838, lng: 36.5550, zoomLevel: 1 },
  'بريدة': { id: 'bry', name: 'بريدة', region: 'منطقة القصيم', svgX: 52, svgY: 38, lat: 26.3592, lng: 43.9818, zoomLevel: 1 },
};

export const GeographicRiskMap: React.FC<GeographicRiskMapProps> = ({
  establishment,
  branches,
  licenses,
  violations,
  hotspots = [],
  onSelectBranch,
  onAddBranch,
  onRenewLicense,
  onOpenObjectionModal,
  onConsultSpecialist,
  showToast
}) => {
  const [activeLayer, setActiveLayer] = useState<GeoRiskLayerType>('all_risk');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'detailed_grid' | 'table'>('map');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<InspectionHotspot | null>(null);

  // New Branch Form state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('الرياض');
  const [newBranchDistrict, setNewBranchDistrict] = useState('');
  const [newBranchStreet, setNewBranchStreet] = useState('');
  const [newBranchArea, setNewBranchArea] = useState('150');
  const [newBranchEmployees, setNewBranchEmployees] = useState('5');
  const [newBranchBalady, setNewBranchBalady] = useState('');
  const [newBranchCivilDefense, setNewBranchCivilDefense] = useState('');

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchCity = selectedCity === 'all' || branch.city === selectedCity;
      const matchSearch = !searchQuery.trim() || 
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (branch.baladyLicenseNumber && branch.baladyLicenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchSearch;
    });
  }, [branches, selectedCity, searchQuery]);

  // Selected branch data
  const selectedBranch = useMemo(() => {
    return branches.find(b => b.id === selectedBranchId) || branches[0] || null;
  }, [branches, selectedBranchId]);

  // Calculate statistics per branch
  const getBranchStats = (branch: Branch) => {
    const branchLicenses = licenses.filter(l => l.branchId === branch.id || (!l.branchId && branch.isMainBranch));
    const branchViolations = violations.filter(v => v.branchId === branch.id);
    
    const expiredLicenses = branchLicenses.filter(l => l.status === 'expired' || l.daysRemaining <= 0);
    const nearExpiryLicenses = branchLicenses.filter(l => l.status === 'near_expiry' && l.daysRemaining > 0);
    const activeLicenses = branchLicenses.filter(l => l.status === 'active');
    
    const totalFines = branchViolations.reduce((sum, v) => sum + (v.status !== 'rectified' && v.status !== 'paid' ? v.fineAmount : 0), 0);
    
    // Dynamic risk score calculation if not explicitly set
    let calculatedRisk = branch.riskScore || 20;
    if (expiredLicenses.length > 0) calculatedRisk = Math.max(calculatedRisk, 85);
    if (branchViolations.some(v => v.severity === 'critical')) calculatedRisk = Math.max(calculatedRisk, 90);
    if (nearExpiryLicenses.length > 0) calculatedRisk = Math.max(calculatedRisk, 65);

    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (calculatedRisk >= 80) riskLevel = 'critical';
    else if (calculatedRisk >= 60) riskLevel = 'high';
    else if (calculatedRisk >= 35) riskLevel = 'medium';

    return {
      branchLicenses,
      branchViolations,
      expiredLicenses,
      nearExpiryLicenses,
      activeLicenses,
      totalFines,
      calculatedRisk,
      riskLevel
    };
  };

  // High-level Geo KPIs
  const geoKPIs = useMemo(() => {
    const totalCount = branches.length;
    let criticalBranchesCount = 0;
    let totalGeographicFines = 0;
    let totalExpiringSoon = 0;

    branches.forEach(b => {
      const stats = getBranchStats(b);
      if (stats.riskLevel === 'critical' || stats.riskLevel === 'high') {
        criticalBranchesCount++;
      }
      totalGeographicFines += stats.totalFines;
      totalExpiringSoon += stats.nearExpiryLicenses.length + stats.expiredLicenses.length;
    });

    const activeInspectionCount = hotspots.length;

    return {
      totalCount,
      criticalBranchesCount,
      totalGeographicFines,
      totalExpiringSoon,
      activeInspectionCount
    };
  }, [branches, licenses, violations, hotspots]);

  // Handle Add Branch submit
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchDistrict.trim()) {
      showToast('يرجى كتابة اسم الفرع والحي');
      return;
    }

    const cityCoord = SAUDI_CITIES[newBranchCity] || SAUDI_CITIES['الرياض'];
    const newId = `br-${Date.now()}`;
    const newBranchObj: Branch = {
      id: newId,
      establishmentId: establishment.id,
      name: newBranchName,
      branchCode: `${newBranchCity === 'الرياض' ? 'RUH' : newBranchCity === 'جدة' ? 'JED' : 'SA'}-0${branches.length + 1}`,
      city: newBranchCity,
      district: newBranchDistrict,
      street: newBranchStreet || `شارع ${newBranchDistrict} الرئيسي`,
      nationalAddress: `${Math.floor(1000 + Math.random() * 9000)} ${newBranchStreet || 'الشارع التجاري'}، ${newBranchDistrict}، ${newBranchCity}`,
      crNumber: `${establishment.crNumber}-00${branches.length + 1}`,
      baladyLicenseNumber: newBranchBalady || `BLD-${newBranchCity === 'الرياض' ? 'RUH' : 'SA'}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      civilDefenseNumber: newBranchCivilDefense || `CD-${Math.floor(10000 + Math.random() * 90000)}`,
      areaSquareMeters: parseInt(newBranchArea) || 150,
      employeesCount: parseInt(newBranchEmployees) || 5,
      status: 'active',
      isMainBranch: false,
      riskScore: 25,
      coordinates: {
        lat: cityCoord.lat + (Math.random() - 0.5) * 0.05,
        lng: cityCoord.lng + (Math.random() - 0.5) * 0.05,
      },
      municipality: `أمانة ${newBranchCity === 'الرياض' ? 'منطقة الرياض' : newBranchCity === 'جدة' ? 'محافظة جدة' : newBranchCity} - بلدية ${newBranchDistrict} الفرعية`,
      inspectionZoneDensity: 'medium',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      activeCampaigns: ['الرقابة الدورية على التراخيص المهنية والبلدية']
    };

    if (onAddBranch) {
      onAddBranch(newBranchObj);
    }
    setSelectedBranchId(newId);
    setIsAddBranchOpen(false);
    showToast(`تمت إضافة وتحديد موقع "${newBranchName}" على الخريطة بنجاح!`);
    
    // Reset form
    setNewBranchName('');
    setNewBranchDistrict('');
    setNewBranchStreet('');
    setNewBranchBalady('');
    setNewBranchCivilDefense('');
  };

  // Export report
  const handleExportGeoReport = () => {
    showToast('جاري استخراج تقرير التحليل الجغرافي للمخاطر بصيغة PDF...');
  };

  // Get Map Pin Color & Pulse
  const getPinVisuals = (branch: Branch) => {
    const stats = getBranchStats(branch);
    if (activeLayer === 'all_risk') {
      if (stats.riskLevel === 'critical') return { bg: 'bg-rose-600', border: 'border-rose-300', text: 'text-rose-100', pulse: true, label: 'حرج' };
      if (stats.riskLevel === 'high') return { bg: 'bg-amber-600', border: 'border-amber-300', text: 'text-amber-100', pulse: true, label: 'مرتفع' };
      if (stats.riskLevel === 'medium') return { bg: 'bg-yellow-500', border: 'border-yellow-200', text: 'text-yellow-950', pulse: false, label: 'متوسط' };
      return { bg: 'bg-emerald-600', border: 'border-emerald-300', text: 'text-emerald-100', pulse: false, label: 'آمن' };
    }
    if (activeLayer === 'inspection_radar') {
      if (branch.inspectionZoneDensity === 'high') return { bg: 'bg-indigo-600', border: 'border-indigo-300', text: 'text-indigo-100', pulse: true, label: 'تفتيش مكثف' };
      return { bg: 'bg-slate-600', border: 'border-slate-300', text: 'text-slate-100', pulse: false, label: 'اعتيادي' };
    }
    if (activeLayer === 'fines_violations') {
      if (stats.totalFines > 0) return { bg: 'bg-red-600', border: 'border-red-300', text: 'text-white', pulse: true, label: `${stats.totalFines.toLocaleString('ar-SA')} ر.س` };
      return { bg: 'bg-emerald-600', border: 'border-emerald-300', text: 'text-white', pulse: false, label: 'بلا غرامات' };
    }
    // Expiring licenses layer
    if (stats.expiredLicenses.length > 0) return { bg: 'bg-rose-700', border: 'border-rose-300', text: 'text-white', pulse: true, label: 'منتهية' };
    if (stats.nearExpiryLicenses.length > 0) return { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-slate-950', pulse: true, label: 'توشك' };
    return { bg: 'bg-teal-600', border: 'border-teal-200', text: 'text-white', pulse: false, label: 'سارية' };
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      
      {/* Top Header & Context */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0 border border-emerald-400/30">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black font-['Cairo'] tracking-tight">
                  الخريطة الجغرافية للمخاطر والامتثال الرقابي
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  رصد مباشر للمناطق والفروع
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                تحليل جغرافي متكامل لفروع منشأتك عبر مدن المملكة، مع ربط نطاقات الحملات التفتيشية البلدية (بلدي)، وتراخيص السلامة، والغرامات المرصودة لكل نطاق بلدي.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsAddBranchOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع وتحديد موقعه</span>
            </button>
            <button
              type="button"
              onClick={handleExportGeoReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">تصدير الخريطة</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700 transition-all"
              title={isFullScreen ? 'إلغاء ملء الشاشة' : 'وضع ملء الشاشة'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mini KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">الفروع على الخريطة</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {geoKPIs.totalCount} فروع
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">فروع ذات مخاطر حرجة</div>
              <div className="text-base sm:text-lg font-bold text-rose-400 mt-0.5">
                {geoKPIs.criticalBranchesCount} فروع
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">غرامات جغرافية مرصودة</div>
              <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                {geoKPIs.totalGeographicFines.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">حملات تفتيشية نشطة</div>
              <div className="text-base sm:text-lg font-bold text-indigo-300 mt-0.5">
                {geoKPIs.activeInspectionCount} نطاقات
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Filter & Layer Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Layer Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 ml-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            الطبقة:
          </span>
          <button
            type="button"
            onClick={() => setActiveLayer('all_risk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === 'all_risk'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مؤشر المخاطر الشامل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('inspection_radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === 'inspection_radar'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>رادار التفتيش البلدي</span>
            <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {hotspots.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('fines_violations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === 'fines_violations'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>المخالفات والغرامات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('expiring_licenses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeLayer === 'expiring_licenses'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تراخيص بلدي وسلامة</span>
          </button>
        </div>

        {/* View mode & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالفرع أو الحي..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الخريطة
            </button>
            <button
              type="button"
              onClick={() => setViewMode('detailed_grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'detailed_grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المناطق
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الجدول
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Geographic Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Center Canvas: Interactive Saudi Map & Geo Explorer */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCity === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              كافة مناطق المملكة ({branches.length})
            </button>
            {Object.keys(SAUDI_CITIES).map(cityName => {
              const count = branches.filter(b => b.city === cityName).length;
              if (count === 0 && selectedCity !== cityName) return null;
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => setSelectedCity(cityName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCity === cityName
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{cityName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCity === cityName ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* VIEW: Interactive Map Canvas */}
          {viewMode === 'map' && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative min-h-[480px] p-4 flex flex-col justify-between">
              
              {/* Map Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
              
              {/* Active Layer Watermark Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>الخريطة التفاعلية للمملكة العربية السعودية</span>
                  <span className="text-slate-500 font-mono">|</span>
                  <span className="text-emerald-400 font-medium">
                    {activeLayer === 'all_risk' && 'طبقة مؤشر المخاطر والامتثال'}
                    {activeLayer === 'inspection_radar' && 'طبقة رادار الحملات التفتيشية'}
                    {activeLayer === 'fines_violations' && 'طبقة الغرامات والمخالفات'}
                    {activeLayer === 'expiring_licenses' && 'طبقة التراخيص الحرجة'}
                  </span>
                </div>

                {/* Compass & Scale */}
                <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 rotate-45" />
                  <span>الشمال</span>
                </div>
              </div>

              {/* Saudi Vector Map Graphic & Dynamic Geolocation Pins */}
              <div className="relative my-4 flex items-center justify-center min-h-[380px] w-full">
                
                {/* Stylized SVG Map of Saudi Arabia Boundaries */}
                <svg
                  viewBox="0 0 1000 800"
                  className="w-full h-full max-h-[460px] opacity-75 select-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="saudiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="50%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Saudi Landmass approximate path */}
                  <path
                    d="M 230 180 
                       L 340 140 
                       L 460 170 
                       L 590 190 
                       L 720 280 
                       L 840 330 
                       L 820 440 
                       L 860 480 
                       L 820 540 
                       L 760 620 
                       L 630 680 
                       L 480 730 
                       L 380 770 
                       L 360 680 
                       L 270 590 
                       L 250 490 
                       L 200 370 
                       L 170 260 
                       Z"
                    fill="url(#saudiGrad)"
                    stroke="#334155"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    className="transition-all hover:stroke-slate-500"
                  />

                  {/* Internal Regional Boundary Lines */}
                  {/* Central / Riyadh Province */}
                  <path
                    d="M 450 320 Q 560 400 680 440 T 630 600 T 470 540 Z"
                    fill="#1e293b"
                    fillOpacity="0.5"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  {/* Western / Makkah & Madinah Province */}
                  <path
                    d="M 230 260 L 370 340 L 330 630 L 260 550 Z"
                    fill="#1e293b"
                    fillOpacity="0.4"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  {/* Eastern Province */}
                  <path
                    d="M 680 290 L 830 350 L 780 610 L 650 480 Z"
                    fill="#1e293b"
                    fillOpacity="0.4"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Major City Coordinate Markers on SVG */}
                  {Object.entries(SAUDI_CITIES).map(([name, conf]) => {
                    const cx = conf.svgX * 10;
                    const cy = conf.svgY * 8;
                    const hasBranch = branches.some(b => b.city === name);
                    return (
                      <g key={name} className="transition-all cursor-pointer" onClick={() => setSelectedCity(name)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={hasBranch ? "6" : "3.5"}
                          fill={hasBranch ? "#10b981" : "#475569"}
                          className={hasBranch ? "animate-pulse" : ""}
                        />
                        <text
                          x={cx + 12}
                          y={cy + 4}
                          fill={hasBranch ? "#e2e8f0" : "#94a3b8"}
                          fontSize="14"
                          fontWeight={hasBranch ? "bold" : "normal"}
                          fontFamily="Cairo, sans-serif"
                        >
                          {name}
                        </text>
                      </g>
                    );
                  })}

                  {/* Hotspots Radar Circles on SVG */}
                  {activeLayer === 'inspection_radar' && hotspots.map((hotspot, idx) => {
                    const cityConf = SAUDI_CITIES[hotspot.city] || SAUDI_CITIES['الرياض'];
                    const hx = cityConf.svgX * 10 + (idx === 0 ? 25 : idx === 1 ? -15 : 10);
                    const hy = cityConf.svgY * 8 + (idx === 0 ? -10 : idx === 1 ? 15 : -5);
                    return (
                      <g key={hotspot.id} className="cursor-pointer">
                        <circle
                          cx={hx}
                          cy={hy}
                          r="35"
                          fill="#6366f1"
                          fillOpacity="0.18"
                          stroke="#818cf8"
                          strokeWidth="1.5"
                          strokeDasharray="3,3"
                          className="animate-ping"
                          style={{ transformOrigin: `${hx}px ${hy}px`, animationDuration: '3s' }}
                        />
                        <circle
                          cx={hx}
                          cy={hy}
                          r="18"
                          fill="#4f46e5"
                          fillOpacity="0.3"
                          stroke="#a5b4fc"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* HTML Overlay: Interactive Pulsing Branch Pins Positioned over Map */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredBranches.map((branch, index) => {
                    const cityConf = SAUDI_CITIES[branch.city] || SAUDI_CITIES['الرياض'];
                    // Offset branches slightly if multiple in same city
                    const cityBranches = filteredBranches.filter(b => b.city === branch.city);
                    const branchIndexInCity = cityBranches.findIndex(b => b.id === branch.id);
                    const offsetX = (branchIndexInCity - (cityBranches.length - 1) / 2) * 4.5;
                    const offsetY = (branchIndexInCity % 2 === 0 ? -1 : 1) * (branchIndexInCity * 3);

                    const topPercent = Math.max(10, Math.min(88, cityConf.svgY + offsetY));
                    const leftPercent = Math.max(10, Math.min(88, cityConf.svgX + offsetX));

                    const isSelected = selectedBranchId === branch.id;
                    const visual = getPinVisuals(branch);
                    const stats = getBranchStats(branch);

                    return (
                      <div
                        key={branch.id}
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 group"
                      >
                        {/* Interactive Clickable Pin Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(branch.id);
                            if (onSelectBranch) onSelectBranch(branch);
                          }}
                          className={`relative flex items-center justify-center transition-all duration-300 transform ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                          }`}
                        >
                          {/* Pulsing ring for urgent branches */}
                          {visual.pulse && (
                            <span className={`absolute -inset-2 rounded-full ${visual.bg} opacity-50 animate-ping`} />
                          )}

                          {/* Pin Container */}
                          <div className={`w-10 h-10 rounded-2xl ${visual.bg} ${visual.text} border-2 ${visual.border} flex flex-col items-center justify-center shadow-xl shadow-black/60`}>
                            <Building2 className="w-4 h-4" />
                            <span className="text-[9px] font-black font-mono leading-none mt-0.5">
                              {stats.calculatedRisk}%
                            </span>
                          </div>

                          {/* Branch label chip */}
                          <div className={`absolute top-full mt-1.5 px-2.5 py-0.8 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold ring-2 ring-emerald-400/40'
                              : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                          }`}>
                            {branch.district || branch.name}
                          </div>
                        </button>

                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2.5 right-1/2 translate-x-1/2 w-56 bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-2xl pointer-events-none z-40 text-xs">
                          <div className="font-bold font-['Cairo'] text-sm text-emerald-400">
                            {branch.name}
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{branch.city} - {branch.district}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
                            <div>
                              <span className="text-slate-400">مؤشر الخطر: </span>
                              <span className="font-bold text-rose-400">{stats.calculatedRisk}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400">الغرامات: </span>
                              <span className="font-bold text-amber-400">{stats.totalFines} ر.س</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map Bottom Legend */}
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-slate-400 font-semibold">دليل الخريطة:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-300" />
                    <span className="text-slate-300">خطر حرج / تنتهي قريباً</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
                    <span className="text-slate-300">خطر متوسط / متطلبات وشيكة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-300" />
                    <span className="text-slate-300">ممتثل وآمن</span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>انقر على أي فرع لعرض ملف التفتيش والامتثال الخاص به</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Detailed City & Regional Grid Matrix */}
          {viewMode === 'detailed_grid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBranches.map(branch => {
                  const stats = getBranchStats(branch);
                  const isSelected = selectedBranchId === branch.id;
                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                            stats.riskLevel === 'critical' ? 'bg-rose-600' :
                            stats.riskLevel === 'high' ? 'bg-amber-600' :
                            stats.riskLevel === 'medium' ? 'bg-yellow-500 text-slate-900' : 'bg-emerald-600'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                              {branch.name}
                            </h3>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{branch.city} - {branch.district}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                          stats.riskLevel === 'critical' ? 'bg-rose-100 text-rose-800' :
                          stats.riskLevel === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          خطر {stats.calculatedRisk}%
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-slate-400 text-[10px]">تراخيص سارية</div>
                          <div className="font-bold text-slate-800 mt-0.5">{stats.activeLicenses.length}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-slate-400 text-[10px]">توشك على الانتهاء</div>
                          <div className="font-bold text-amber-600 mt-0.5">{stats.nearExpiryLicenses.length}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-slate-400 text-[10px]">غرامات مرصودة</div>
                          <div className="font-bold text-rose-600 mt-0.5">{stats.totalFines} ر.س</div>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>البلدية: {branch.municipality || 'أمانة المنطقة'}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          عرض التفاصيل <ArrowRight className="w-3 h-3 rotate-180" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: Table Comparison View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3.5">الفرع</th>
                      <th className="p-3.5">المدينة والحي</th>
                      <th className="p-3.5">البلدية المشرفة</th>
                      <th className="p-3.5">مؤشر المخاطر</th>
                      <th className="p-3.5">التراخيص الحرجة</th>
                      <th className="p-3.5">الغرامات</th>
                      <th className="p-3.5">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBranches.map(branch => {
                      const stats = getBranchStats(branch);
                      const isSelected = selectedBranchId === branch.id;
                      return (
                        <tr
                          key={branch.id}
                          onClick={() => setSelectedBranchId(branch.id)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/40 font-semibold' : ''
                          }`}
                        >
                          <td className="p-3.5 font-bold text-slate-900">
                            {branch.name}
                            {branch.isMainBranch && (
                              <span className="mr-2 bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded">
                                رئيسي
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600">{branch.city} - {branch.district}</td>
                          <td className="p-3.5 text-slate-500 max-w-xs truncate">{branch.municipality || 'أمانة المنطقة'}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.8 rounded-full font-bold ${
                              stats.riskLevel === 'critical' ? 'bg-rose-100 text-rose-800' :
                              stats.riskLevel === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {stats.calculatedRisk}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            {stats.nearExpiryLicenses.length + stats.expiredLicenses.length > 0 ? (
                              <span className="text-amber-600 font-bold">
                                {stats.nearExpiryLicenses.length + stats.expiredLicenses.length} ترخيص
                              </span>
                            ) : (
                              <span className="text-emerald-600">كافة الرخص سارية</span>
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {stats.totalFines > 0 ? `${stats.totalFines.toLocaleString('ar-SA')} ر.س` : '0 ر.س'}
                          </td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBranchId(branch.id);
                              }}
                              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                            >
                              فحص
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Municipal Inspection Blitz Hotspots Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-xs">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                  <Radar className="w-6 h-6 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base font-['Cairo']">
                      رادار حملات التفتيش البلدية والرقابة المشتركة النشطة
                    </h3>
                    <span className="bg-indigo-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      تحديث أغسطس 2026
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100/80 mt-1 max-w-2xl">
                    تتبع نطاقات الحملات التفتيشية الجارية من أمانة الرياض وأمانة جدة والدفاع المدني لضمان جاهزية فروعك وتفادي الزيارات المفاجئة.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onConsultSpecialist) {
                    onConsultSpecialist('الاستعداد لحملات التفتيش والرقابة البلدية الجارية للفروع');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>فحص جاهزية الفرع مع سبّاق AI</span>
              </button>
            </div>

            {/* Hotspots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-800/50">
              {hotspots.slice(0, 3).map(hotspot => (
                <div key={hotspot.id} className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/40 text-xs">
                  <div className="flex items-center justify-between text-indigo-200 font-bold mb-1">
                    <span>{hotspot.city} - {hotspot.district}</span>
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] px-1.5 py-0.2 rounded">
                      حملة نشطة
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {hotspot.campaignTitle}
                  </div>
                  <div className="mt-2 text-[10px] text-indigo-300 flex items-center justify-between">
                    <span>الجهة: {hotspot.authority}</span>
                    <span>سارية حتى: {hotspot.activeUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Branch Intelligence Profile & Fast Actions */}
        <div className="lg:col-span-4 space-y-4">
          {selectedBranch ? (
            (() => {
              const stats = getBranchStats(selectedBranch);
              return (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5 sticky top-6">
                  
                  {/* Branch Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {selectedBranch.branchCode || 'فرع معتمد'}
                        </span>
                        {selectedBranch.isMainBranch && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                            المقر الرئيسي
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Cairo'] mt-1.5">
                        {selectedBranch.name}
                      </h2>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedBranch.city} - {selectedBranch.district}</span>
                      </div>
                    </div>

                    {/* Risk Gauge Circle */}
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-md ${
                        stats.riskLevel === 'critical' ? 'bg-rose-600' :
                        stats.riskLevel === 'high' ? 'bg-amber-600' :
                        stats.riskLevel === 'medium' ? 'bg-yellow-500 text-slate-900' : 'bg-emerald-600'
                      }`}>
                        <span className="text-sm font-black font-mono leading-none">{stats.calculatedRisk}%</span>
                        <span className="text-[9px] font-medium mt-0.5">مؤشر الخطر</span>
                      </div>
                    </div>
                  </div>

                  {/* Address & Municipality Jurisdiction */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">العنوان الوطني:</span>
                      <span className="text-slate-800 font-mono font-medium text-left dir-ltr">
                        {selectedBranch.nationalAddress || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">النطاق الإشرافي:</span>
                      <span className="text-slate-800 font-semibold text-left">
                        {selectedBranch.municipality || 'أمانة المنطقة'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">مساحة الفرع: <b>{selectedBranch.areaSquareMeters || 180} م²</b></span>
                      <span className="text-slate-500">عدد العاملين: <b>{selectedBranch.employeesCount} موظف</b></span>
                    </div>
                  </div>

                  {/* Active Campaigns for this Branch */}
                  {selectedBranch.activeCampaigns && selectedBranch.activeCampaigns.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <span>حملات تفتيشية في نطاق هذا الفرع</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-amber-800">
                        {selectedBranch.activeCampaigns.map((camp, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{camp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Licenses tied to this Branch */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>التراخيص المرتبطة بالفرع ({stats.branchLicenses.length})</span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                      {stats.branchLicenses.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          لا توجد تراخيص مخصصة مسجلة لهذا الفرع
                        </div>
                      ) : (
                        stats.branchLicenses.map(lic => (
                          <div
                            key={lic.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                              lic.daysRemaining <= 0 ? 'bg-rose-50 border-rose-200' :
                              lic.daysRemaining <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">
                                {lic.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{lic.authority}</span>
                                <span>•</span>
                                <span className={lic.daysRemaining <= 0 ? 'text-rose-600 font-bold' : lic.daysRemaining <= 30 ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                                  {lic.daysRemaining <= 0 ? 'منتهية' : `باقي ${lic.daysRemaining} يوم`}
                                </span>
                              </div>
                            </div>

                            {lic.daysRemaining <= 30 && onRenewLicense && (
                              <button
                                type="button"
                                onClick={() => onRenewLicense(lic.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                              >
                                تجديد
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Violations tied to this branch */}
                  {stats.branchViolations.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-rose-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>المخالفات المرصودة على الفرع ({stats.branchViolations.length})</span>
                        </div>
                        <span className="font-extrabold text-rose-700">
                          {stats.totalFines.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>

                      <div className="space-y-2">
                        {stats.branchViolations.map(viol => (
                          <div key={viol.id} className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-rose-900">
                              <span>{viol.authority}</span>
                              <span>{viol.fineAmount.toLocaleString('ar-SA')} ر.س</span>
                            </div>
                            <div className="text-[11px] text-rose-800 mt-1 line-clamp-2">
                              {viol.reason}
                            </div>
                            {onOpenObjectionModal && (
                              <button
                                type="button"
                                onClick={() => onOpenObjectionModal(viol)}
                                className="mt-2 text-rose-700 hover:text-rose-900 font-bold text-[11px] underline flex items-center gap-1"
                              >
                                تقديم اعتراض قانوني فوري
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Action Buttons for Branch */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onConsultSpecialist) {
                          onConsultSpecialist(`مطابقة اشتراطات بلدية ${selectedBranch.district} وكود البناء لفرع ${selectedBranch.name}`);
                        }
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>فحص اشتراطات الحي مع سبّاق AI</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">اختر فرعاً من الخريطة لمعاينة ملفه الجغرافي والرقابي</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                    إضافة فرع وتحديد موقعه الجغرافي
                  </h3>
                  <p className="text-xs text-slate-500">
                    ربط الفرع بالنطاق البلدي والإشرافي الصحيح لحساب المخاطر تلقائياً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الفرع *</label>
                  <input
                    type="text"
                    required
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="مثال: فرع حي النرجس"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة *</label>
                  <select
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {Object.keys(SAUDI_CITIES).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحي *</label>
                  <input
                    type="text"
                    required
                    value={newBranchDistrict}
                    onChange={(e) => setNewBranchDistrict(e.target.value)}
                    placeholder="مثال: النرجس / العليا / الشاطئ"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشارع</label>
                  <input
                    type="text"
                    value={newBranchStreet}
                    onChange={(e) => setNewBranchStreet(e.target.value)}
                    placeholder="مثال: طريق الملك سلمان"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={newBranchArea}
                    onChange={(e) => setNewBranchArea(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد العاملين بالفرع</label>
                  <input
                    type="number"
                    value={newBranchEmployees}
                    onChange={(e) => setNewBranchEmployees(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم رخصة بلدي (إن وجد)</label>
                  <input
                    type="text"
                    value={newBranchBalady}
                    onChange={(e) => setNewBranchBalady(e.target.value)}
                    placeholder="BLD-RUH-2026-..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم رخصة سلامة الدفاع المدني</label>
                  <input
                    type="text"
                    value={newBranchCivilDefense}
                    onChange={(e) => setNewBranchCivilDefense(e.target.value)}
                    placeholder="CD-RUH-..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>سيتم تحديد الإحداثيات الجغرافية التقديرية ونطاق البلدية المشرفة تلقائياً بناءً على المدينة والحي.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>تثبيت الفرع على الخريطة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
