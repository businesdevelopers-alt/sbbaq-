import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Scale,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Filter,
  CheckCircle2,
  Info,
  Calendar,
  Zap,
  Users,
  Target,
  FileCheck2,
  Download,
  Share2,
  ChevronDown
} from 'lucide-react';
import { Establishment, Branch, License, ComplianceViolation, MasterOrder } from '../types';
import { formatSAR, getRiskLevelBadge } from '../utils/complianceEngine';

interface SectorBenchmarkDashboardProps {
  establishment: Establishment;
  branches?: Branch[];
  licenses?: License[];
  violations?: ComplianceViolation[];
  orders?: MasterOrder[];
  onRenewLicense?: (licenseId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast?: (message: string) => void;
}

// Activity profiles for Saudi market benchmarks
const ACTIVITY_BENCHMARK_DATA: Record<string, {
  name: string;
  totalEstablishmentsSample: number;
  averageCompliance: number;
  topQuartileCompliance: number;
  averageFinesPerYear: number;
  averageInspectionFrequencyMonths: number;
  topViolationTypes: string[];
  pillars: {
    balady: number;
    salama: number;
    qiwa: number;
    wps: number;
    zatca: number;
    health: number;
  };
}> = {
  'food_beverage': {
    name: 'المطاعم، المقاهي وخدمات الإعاشة',
    totalEstablishmentsSample: 4820,
    averageCompliance: 66,
    topQuartileCompliance: 88,
    averageFinesPerYear: 18500,
    averageInspectionFrequencyMonths: 1.8,
    topViolationTypes: ['الشهادات الصحية المهنية', 'اشتراطات التخزين والنظافة', 'لوحة المحل ومطابقة مساحة الترخيص'],
    pillars: {
      balady: 68,
      salama: 62,
      qiwa: 70,
      wps: 74,
      zatca: 78,
      health: 58
    }
  },
  'retail_grocery': {
    name: 'تجارة التجزئة، التموينات والمراكز التجارية',
    totalEstablishmentsSample: 7350,
    averageCompliance: 71,
    topQuartileCompliance: 91,
    averageFinesPerYear: 12000,
    averageInspectionFrequencyMonths: 2.5,
    topViolationTypes: ['عرض الأسعار شامل الضريبة', 'أجهزة الدفع الإلكتروني مدى', 'رخصة الإعلانات واللوحات'],
    pillars: {
      balady: 74,
      salama: 69,
      qiwa: 72,
      wps: 80,
      zatca: 84,
      health: 70
    }
  },
  'contracting': {
    name: 'المقاولات، الإنشاءات والصيانة العامة',
    totalEstablishmentsSample: 5210,
    averageCompliance: 62,
    topQuartileCompliance: 84,
    averageFinesPerYear: 26000,
    averageInspectionFrequencyMonths: 3.2,
    topViolationTypes: ['شهادة تصنيف المقاولين', 'مخالفات السلامة المهنية بالموقع', 'نسب التوطين الفعلي وحماية الأجور'],
    pillars: {
      balady: 65,
      salama: 58,
      qiwa: 60,
      wps: 64,
      zatca: 72,
      health: 55
    }
  },
  'healthcare_pharmacy': {
    name: 'المجمعات الطبية، العيادات والصيدليات',
    totalEstablishmentsSample: 2940,
    averageCompliance: 82,
    topQuartileCompliance: 95,
    averageFinesPerYear: 9500,
    averageInspectionFrequencyMonths: 1.5,
    topViolationTypes: ['ترخيص مزاولة المهن الصحية', 'نظام تتبع الأدوية (رصد)', 'إدارة النفايات الطبية الخطرة'],
    pillars: {
      balady: 86,
      salama: 84,
      qiwa: 80,
      wps: 88,
      zatca: 90,
      health: 88
    }
  },
  'logistics_transport': {
    name: 'الخدمات اللوجستية، النقل والتخزين',
    totalEstablishmentsSample: 3180,
    averageCompliance: 68,
    topQuartileCompliance: 89,
    averageFinesPerYear: 16200,
    averageInspectionFrequencyMonths: 2.2,
    topViolationTypes: ['بطاقة تشغيل المركبات (الهيئة العامة للنقل)', 'تراخيص المستودعات من الدفاع المدني', 'تطبيق منصة وصل'],
    pillars: {
      balady: 70,
      salama: 66,
      qiwa: 68,
      wps: 76,
      zatca: 78,
      health: 64
    }
  }
};

// City benchmark weighting multipliers
const CITY_BENCHMARK_FACTORS: Record<string, {
  name: string;
  inspectionIntensity: 'high' | 'medium' | 'low';
  inspectionMultiplier: number;
  averageComplianceDelta: number;
  totalEstablishmentsInCity: number;
  leadingMunicipality: string;
}> = {
  'الرياض': {
    name: 'الرياض',
    inspectionIntensity: 'high',
    inspectionMultiplier: 1.15,
    averageComplianceDelta: +2,
    totalEstablishmentsInCity: 112400,
    leadingMunicipality: 'أمانة منطقة الرياض (بلدية العليا والروضة)'
  },
  'جدة': {
    name: 'جدة',
    inspectionIntensity: 'high',
    inspectionMultiplier: 1.10,
    averageComplianceDelta: -1,
    totalEstablishmentsInCity: 78900,
    leadingMunicipality: 'أمانة محافظة جدة (بلدية البلد والروضة)'
  },
  'الدمام': {
    name: 'الدمام والخبر (المنطقة الشرقية)',
    inspectionIntensity: 'medium',
    inspectionMultiplier: 1.05,
    averageComplianceDelta: +3,
    totalEstablishmentsInCity: 49200,
    leadingMunicipality: 'أمانة المنطقة الشرقية'
  },
  'مكة المكرمة': {
    name: 'مكة المكرمة',
    inspectionIntensity: 'high',
    inspectionMultiplier: 1.20,
    averageComplianceDelta: 0,
    totalEstablishmentsInCity: 36500,
    leadingMunicipality: 'أمانة العاصمة المقدسة'
  },
  'المدينة المنورة': {
    name: 'المدينة المنورة',
    inspectionIntensity: 'medium',
    inspectionMultiplier: 1.05,
    averageComplianceDelta: +1,
    totalEstablishmentsInCity: 28400,
    leadingMunicipality: 'أمانة منطقة المدينة المنورة'
  }
};

export const SectorBenchmarkDashboard: React.FC<SectorBenchmarkDashboardProps> = ({
  establishment,
  branches = [],
  licenses = [],
  violations = [],
  orders = [],
  onRenewLicense,
  onNavigateToTab,
  onConsultSpecialist,
  showToast = (msg) => alert(msg)
}) => {
  // Activity Selection Filter State
  const initialActivityKey = useMemo(() => {
    const act = (establishment.activity || '').toLowerCase();
    if (act.includes('غذاء') || act.includes('مطعم') || act.includes('مقهى') || act.includes('إعاشة') || act.includes('وجبات')) {
      return 'food_beverage';
    }
    if (act.includes('تجزئة') || act.includes('تموين') || act.includes('سوبرماركت') || act.includes('ملابس')) {
      return 'retail_grocery';
    }
    if (act.includes('مقاولات') || act.includes('بناء') || act.includes('تشييد') || act.includes('صيانة')) {
      return 'contracting';
    }
    if (act.includes('صحي') || act.includes('عيادة') || act.includes('صيدلية') || act.includes('طبي')) {
      return 'healthcare_pharmacy';
    }
    if (act.includes('نقل') || act.includes('شحن') || act.includes('مستودع') || act.includes('تخزين') || act.includes('لوجستي')) {
      return 'logistics_transport';
    }
    return 'food_beverage';
  }, [establishment.activity]);

  const [selectedActivity, setSelectedActivity] = useState<string>(initialActivityKey);
  const [selectedCity, setSelectedCity] = useState<string>(
    CITY_BENCHMARK_FACTORS[establishment.city] ? establishment.city : 'الرياض'
  );
  const [selectedSizeBracket, setSelectedSizeBracket] = useState<'all' | 'micro' | 'small' | 'medium' | 'large'>('small');
  const [benchmarkTimeframe, setBenchmarkTimeframe] = useState<'q3_2026' | 'h1_2026' | 'year_2026'>('q3_2026');
  const [viewTab, setViewTab] = useState<'overview' | 'radar_pillars' | 'distribution' | 'pillars_table'>('overview');
  const [isSimulatingFixes, setIsSimulatingFixes] = useState<boolean>(false);

  // Active activity and city dataset
  const activeSector = ACTIVITY_BENCHMARK_DATA[selectedActivity] || ACTIVITY_BENCHMARK_DATA['food_beverage'];
  const activeCityMeta = CITY_BENCHMARK_FACTORS[selectedCity] || CITY_BENCHMARK_FACTORS['الرياض'];

  // Calculate establishment baseline score
  const estBaseCompliance = useMemo(() => {
    // Inverse of risk score: Compliance % = 100 - RiskScore
    const risk = establishment.riskScore !== undefined ? establishment.riskScore : 42;
    let comp = Math.max(10, Math.min(98, 100 - risk));
    if (isSimulatingFixes) {
      comp = Math.min(96, comp + 16);
    }
    return comp;
  }, [establishment.riskScore, isSimulatingFixes]);

  // Sector average adjusted for city factor
  const sectorCityAvg = useMemo(() => {
    return Math.round(activeSector.averageCompliance + activeCityMeta.averageComplianceDelta);
  }, [activeSector, activeCityMeta]);

  // Top 10% Leaders in sector
  const sectorLeadersScore = useMemo(() => {
    return Math.round(activeSector.topQuartileCompliance + 4);
  }, [activeSector]);

  // Percentile Rank calculation (0 to 100%)
  const percentileRank = useMemo(() => {
    const diff = estBaseCompliance - sectorCityAvg;
    // Base 50th percentile + scaled diff
    let rank = Math.round(50 + diff * 1.8);
    if (rank > 99) rank = 99;
    if (rank < 5) rank = 5;
    return rank;
  }, [estBaseCompliance, sectorCityAvg]);

  // Pillar scores comparison: Establishment vs Sector Avg vs Sector Leaders
  const pillarComparisonData = useMemo(() => {
    const p = activeSector.pillars;
    // Derive establishment custom values based on licenses & violations
    const activeViols = violations.filter(v => v.establishmentId === establishment.id && v.status !== 'rectified');
    const hasBaladyViol = activeViols.some(v => v.category === 'municipal' || v.authority.includes('بلد'));
    const hasSalamaViol = activeViols.some(v => v.category === 'safety' || v.authority.includes('دفاع'));
    const hasLaborViol = activeViols.some(v => v.category === 'labor' || v.authority.includes('قوى'));

    const estBalady = isSimulatingFixes ? 94 : hasBaladyViol ? 58 : 82;
    const estSalama = isSimulatingFixes ? 92 : hasSalamaViol ? 52 : 78;
    const estQiwa = isSimulatingFixes ? 90 : hasLaborViol ? 60 : 84;
    const estWps = isSimulatingFixes ? 96 : 88;
    const estZatca = isSimulatingFixes ? 98 : 92;
    const estHealth = isSimulatingFixes ? 92 : 72;

    return [
      {
        subject: 'التراخيص والاشتراطات البلدية',
        pillarCode: 'balady',
        establishment: estBalady,
        sectorAvg: p.balady + activeCityMeta.averageComplianceDelta,
        sectorLeader: 94,
        fullMark: 100,
        authority: 'وزارة البلديات والإسكان (بلدي)',
        status: estBalady >= p.balady ? 'superior' : 'lagging'
      },
      {
        subject: 'السلامة والوقاية من الحريق',
        pillarCode: 'salama',
        establishment: estSalama,
        sectorAvg: p.salama + activeCityMeta.averageComplianceDelta,
        sectorLeader: 92,
        fullMark: 100,
        authority: 'المديرية العامة للدفاع المدني (سلامة)',
        status: estSalama >= p.salama ? 'superior' : 'lagging'
      },
      {
        subject: 'التوطين ونطاقات وسجلات العمل',
        pillarCode: 'qiwa',
        establishment: estQiwa,
        sectorAvg: p.qiwa + activeCityMeta.averageComplianceDelta,
        sectorLeader: 90,
        fullMark: 100,
        authority: 'وزارة الموارد البشرية (منصة قوى)',
        status: estQiwa >= p.qiwa ? 'superior' : 'lagging'
      },
      {
        subject: 'حماية الأجور وتوثيق العقود (WPS)',
        pillarCode: 'wps',
        establishment: estWps,
        sectorAvg: p.wps + activeCityMeta.averageComplianceDelta,
        sectorLeader: 96,
        fullMark: 100,
        authority: 'برنامج حماية الأجور (WPS)',
        status: estWps >= p.wps ? 'superior' : 'lagging'
      },
      {
        subject: 'الفوترة الإلكترونية والزكاة (ZATCA)',
        pillarCode: 'zatca',
        establishment: estZatca,
        sectorAvg: p.zatca + activeCityMeta.averageComplianceDelta,
        sectorLeader: 98,
        fullMark: 100,
        authority: 'هيئة الزكاة والضريبة والجمارك',
        status: estZatca >= p.zatca ? 'superior' : 'lagging'
      },
      {
        subject: 'الصحة والبيئة المهنية والشهادات',
        pillarCode: 'health',
        establishment: estHealth,
        sectorAvg: p.health + activeCityMeta.averageComplianceDelta,
        sectorLeader: 90,
        fullMark: 100,
        authority: 'أمانات المناطق ومفتشو الصحة المهنية',
        status: estHealth >= p.health ? 'superior' : 'lagging'
      }
    ];
  }, [activeSector, activeCityMeta, violations, establishment.id, isSimulatingFixes]);

  // Distribution Bell curve data (histogram intervals)
  const distributionData = useMemo(() => {
    return [
      { range: '0 - 29%', label: 'خطر حرج (< 30%)', countPct: 8, isEstablishmentHere: estBaseCompliance < 30 },
      { range: '30 - 49%', label: 'امتثال منخفض (30-49%)', countPct: 18, isEstablishmentHere: estBaseCompliance >= 30 && estBaseCompliance < 50 },
      { range: '50 - 64%', label: 'دون المتوسط (50-64%)', countPct: 26, isEstablishmentHere: estBaseCompliance >= 50 && estBaseCompliance < 65 },
      { range: '65 - 79%', label: 'المتوسط المقبول (65-79%)', countPct: 28, isEstablishmentHere: estBaseCompliance >= 65 && estBaseCompliance < 80 },
      { range: '80 - 89%', label: 'امتثال متقدم (80-89%)', countPct: 14, isEstablishmentHere: estBaseCompliance >= 80 && estBaseCompliance < 90 },
      { range: '90 - 100%', label: 'نخبة الرواد (90-100%)', countPct: 6, isEstablishmentHere: estBaseCompliance >= 90 }
    ];
  }, [estBaseCompliance]);

  // 6-Month historical comparison trend line
  const historicalTrendData = useMemo(() => {
    const offset = estBaseCompliance - sectorCityAvg;
    return [
      {
        month: 'مارس 2026',
        establishment: Math.max(20, Math.min(95, sectorCityAvg + offset - 8)),
        sectorAvg: sectorCityAvg - 4,
        topLeaders: sectorLeadersScore - 2
      },
      {
        month: 'أبريل 2026',
        establishment: Math.max(20, Math.min(95, sectorCityAvg + offset - 4)),
        sectorAvg: sectorCityAvg - 2,
        topLeaders: sectorLeadersScore - 1
      },
      {
        month: 'مايو 2026',
        establishment: Math.max(20, Math.min(95, sectorCityAvg + offset - 1)),
        sectorAvg: sectorCityAvg - 1,
        topLeaders: sectorLeadersScore
      },
      {
        month: 'يونيو 2026',
        establishment: Math.max(20, Math.min(95, sectorCityAvg + offset + 2)),
        sectorAvg: sectorCityAvg,
        topLeaders: sectorLeadersScore
      },
      {
        month: 'يوليو 2026',
        establishment: Math.max(20, Math.min(95, sectorCityAvg + offset + 1)),
        sectorAvg: sectorCityAvg + 1,
        topLeaders: sectorLeadersScore + 1
      },
      {
        month: 'أغسطس 2026 (الحالي)',
        establishment: estBaseCompliance,
        sectorAvg: sectorCityAvg,
        topLeaders: sectorLeadersScore
      }
    ];
  }, [estBaseCompliance, sectorCityAvg, sectorLeadersScore]);

  // Estimated annual fine savings or risk exposure comparison
  const finesComparison = useMemo(() => {
    const baseSectorFine = activeSector.averageFinesPerYear * activeCityMeta.inspectionMultiplier;
    // Fine exposure drops exponentially with compliance score
    const estFineRisk = Math.round(baseSectorFine * Math.pow((100 - estBaseCompliance) / (100 - sectorCityAvg), 1.6));
    const annualDifference = Math.round(baseSectorFine - estFineRisk);

    return {
      sectorAvgFine: Math.round(baseSectorFine),
      establishmentFineRisk: estFineRisk,
      annualSavings: annualDifference > 0 ? annualDifference : 0,
      excessRisk: annualDifference < 0 ? Math.abs(annualDifference) : 0,
      isPositive: annualDifference >= 0
    };
  }, [activeSector, activeCityMeta, estBaseCompliance, sectorCityAvg]);

  return (
    <div className="space-y-6 font-['Cairo'] text-slate-800" dir="rtl">
      
      {/* Header Banner with Sector & City Context Filter Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 space-y-5">
          
          {/* Top Row: Title, Badges and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 border border-white/20">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-black text-white font-['Cairo']">
                    لوحة المقارنة المعيارية بالقطاع (Sector Benchmark)
                  </h2>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    بيانات توضيحية لـ {activeCityMeta.name}
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    عينة: {activeSector.totalEstablishmentsSample.toLocaleString()} منشأة
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  قارن أداء منشأتك «{establishment.name}» مع متوسط منشآت نفس النشاط والمدينة، وتعرف على الفجوات التنظيمية وموقعك بين الرواد.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Simulate Fixes Switch */}
              <button
                type="button"
                onClick={() => {
                  setIsSimulatingFixes(!isSimulatingFixes);
                  showToast(isSimulatingFixes ? 'تم الرجوع للوضع الفعلي' : 'تم تفعيل محاكاة تصحيح كافة المخالفات وتجديد الرخص!');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  isSimulatingFixes
                    ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse font-black'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulatingFixes ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{isSimulatingFixes ? 'محاكاة التصحيح نشطة (✓)' : 'محاكاة تصحيح المخالفات'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('جاري تصدير شهادة المقارنة المعيارية للمنشأة (PDF)...');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                title="تصدير تقرير المقارنة المعيارية"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير التقرير</span>
              </button>
            </div>
          </div>

          {/* Interactive Benchmark Selectors Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
            
            {/* Activity Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-indigo-400" />
                <span>نشاط المقارنة المرجعي:</span>
              </label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="food_beverage">المطاعم، المقاهي وخدمات الإعاشة</option>
                <option value="retail_grocery">تجارة التجزئة، التموينات والمراكز</option>
                <option value="contracting">المقاولات، الإنشاءات والصيانة</option>
                <option value="healthcare_pharmacy">المجمعات الطبية والصيدليات</option>
                <option value="logistics_transport">الخدمات اللوجستية والنقل والتخزين</option>
              </select>
            </div>

            {/* City & Municipality Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>المدينة ونطاق الأمانة:</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="الرياض">الرياض (أمانة منطقة الرياض)</option>
                <option value="جدة">جدة (أمانة محافظة جدة)</option>
                <option value="الدمام">الدمام والخبر (أمانة المنطقة الشرقية)</option>
                <option value="مكة المكرمة">مكة المكرمة (أمانة العاصمة المقدسة)</option>
                <option value="المدينة المنورة">المدينة المنورة (أمانة المدينة)</option>
              </select>
            </div>

            {/* Size Bracket Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-400" />
                <span>حجم المنشأة المرجعي:</span>
              </label>
              <select
                value={selectedSizeBracket}
                onChange={(e) => setSelectedSizeBracket(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">كافة أحجام المنشآت</option>
                <option value="micro">منشآت متناهية الصغر (1-5 عمال)</option>
                <option value="small">منشآت صغيرة (6-49 عامل)</option>
                <option value="medium">منشآت متوسطة (50-249 عامل)</option>
                <option value="large">منشآت كبرى (250+ عامل)</option>
              </select>
            </div>

            {/* Benchmark Period */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>الفترة والربع السنوي:</span>
              </label>
              <select
                value={benchmarkTimeframe}
                onChange={(e) => setBenchmarkTimeframe(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="q3_2026">الربع الثالث (Q3 2026) - الحالي</option>
                <option value="h1_2026">النصف الأول (H1 2026)</option>
                <option value="year_2026">التقرير السنوي التراكمي (2026)</option>
              </select>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4 Executive KPI Cards: Compliance Gap, Percentile Rank, Fines Delta, Timing */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Compliance Gap vs Sector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">معدل الامتثال الكلي</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              estBaseCompliance >= sectorCityAvg
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}>
              {estBaseCompliance >= sectorCityAvg ? '+' : ''}{estBaseCompliance - sectorCityAvg}%
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-['Cairo']">
                {estBaseCompliance}%
              </span>
              <span className="text-xs text-slate-500 font-bold">
                مقابل {sectorCityAvg}% (متوسط القطاع)
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  estBaseCompliance >= 80 ? 'bg-emerald-500' : estBaseCompliance >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${estBaseCompliance}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            {estBaseCompliance >= sectorCityAvg ? (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                متفوق على متوسط قطاع {activeCityMeta.name} بـ {estBaseCompliance - sectorCityAvg} نقطة
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                أقل من متوسط القطاع بفارق {sectorCityAvg - estBaseCompliance} نقطة
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Percentile Rank */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الترتيب المئوي في القطاع</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-900 font-['Cairo']">
                أفضل {100 - percentileRank}%
              </span>
              <span className="text-xs text-slate-500 font-bold">
                (المئوي: {percentileRank}th)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              تتفوق منشأتك على <span className="font-bold text-indigo-700">{percentileRank}%</span> من منشآت النشاط في {activeCityMeta.name}.
            </p>
          </div>

          <div className="text-[11px] text-indigo-700 font-bold bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100 flex items-center justify-between">
            <span>نطاق الرواد (Top 10%):</span>
            <span className="font-black">يبدأ من {sectorLeadersScore}%</span>
          </div>
        </div>

        {/* KPI 3: Estimated Fines Gap */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">التعرض للغرامات السنوية</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              finesComparison.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black font-['Cairo'] ${
                finesComparison.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {finesComparison.isPositive ? formatSAR(finesComparison.annualSavings) : formatSAR(finesComparison.excessRisk)}
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                {finesComparison.isPositive ? 'توفير وقائي' : 'مخاطر إضافية'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              متوسط غرامات منشآت قطاعك: <span className="font-bold">{formatSAR(finesComparison.sectorAvgFine)}/سنة</span>
            </p>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            معدل الزيارات التفتيشية: مرة كل {activeSector.averageInspectionFrequencyMonths} أشهر
          </div>
        </div>

        {/* KPI 4: Regulatory Inspection Intensity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">كثافة الحملات الرقابية في مدينتك</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeCityMeta.inspectionIntensity === 'high'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {activeCityMeta.inspectionIntensity === 'high' ? 'حملات مكثفة' : 'حملات متوسطة'}
            </span>
          </div>

          <div>
            <div className="text-base font-bold text-slate-900">
              {activeCityMeta.leadingMunicipality}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              أبرز المخالفات المرصودة بالقطاع: <span className="font-semibold text-slate-800">{activeSector.topViolationTypes[0]}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab ? onNavigateToTab('geo_map') : null}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center justify-between group pt-1 border-t border-slate-100"
          >
            <span>استعراض نطاقات التفتيش على الخريطة</span>
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Sub-Navigation Tabs: Overview vs Radar Pillars vs Distribution vs Table */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setViewTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            viewTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>المقارنة التراكمية والتاريخية (Overview)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('radar_pillars')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            viewTab === 'radar_pillars'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>رادار ركائز الامتثال الستة (Radar View)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('distribution')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            viewTab === 'distribution'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>منحنى التوزيع المئوي للقطاع (Bell Curve)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('pillars_table')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            viewTab === 'pillars_table'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>جدول الفجوات وخطة التميز التنظيمي</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: Overview (Historical Trend + Pillar Bar Comparison) */}
      {/* ========================================================================= */}
      {viewTab === 'overview' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 6-Month Historical Comparison Line Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>تطور معدل الامتثال عبر 6 أشهر vs متوسط القطاع</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تتبع أداء منشأتك مقارنة بالمتوسط العام لقطاع {activeSector.name} في {activeCityMeta.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    منشأتك
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    متوسط القطاع
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    الرواد (Top 10%)
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs font-['Cairo'] space-y-1.5 min-w-[200px]" dir="rtl">
                              <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">{label}</p>
                              <div className="flex items-center justify-between text-indigo-300 font-bold">
                                <span>منشأتك:</span>
                                <span>{payload.find(p => p.dataKey === 'establishment')?.value}%</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>متوسط القطاع:</span>
                                <span>{payload.find(p => p.dataKey === 'sectorAvg')?.value}%</span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-400 font-bold">
                                <span>نخبة الرواد (Top 10%):</span>
                                <span>{payload.find(p => p.dataKey === 'topLeaders')?.value}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'نطاق التميز 80%', fill: '#10b981', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="establishment"
                      name="منشأتك"
                      stroke="#4f46e5"
                      strokeWidth={3.5}
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sectorAvg"
                      name="متوسط القطاع"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="topLeaders"
                      name="نخبة الرواد"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>تحديث البيانات المرجعية يتم أسبوعياً عبر رصد قرارات لجان النظر ومؤشرات منصات بلدي وقوى وزاتكا.</span>
                </div>
              </div>
            </div>

            {/* Pillars Bar Comparison Chart (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>مقارنة الركائز التنظيمية (Pillars Gap)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  نسبة الامتثال في كل مسار مقارنة بمتوسط قطاع {activeCityMeta.name}
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pillarComparisonData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      dataKey="pillarCode"
                      type="category"
                      width={65}
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      tickFormatter={(code) => {
                        const map: Record<string, string> = {
                          balady: 'بلدي',
                          salama: 'سلامة',
                          qiwa: 'قوى/عمل',
                          wps: 'حماية أجور',
                          zatca: 'زكاة وضريبة',
                          health: 'صحة مهنية'
                        };
                        return map[code] || code;
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 text-xs font-['Cairo'] space-y-1.5" dir="rtl">
                              <p className="font-bold text-white border-b border-slate-700 pb-1">{data.subject}</p>
                              <div className="flex justify-between gap-4 text-indigo-300 font-bold">
                                <span>منشأتك:</span>
                                <span>{data.establishment}%</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>متوسط القطاع:</span>
                                <span>{data.sectorAvg}%</span>
                              </div>
                              <div className="flex justify-between gap-4 text-emerald-400">
                                <span>الرواد:</span>
                                <span>{data.sectorLeader}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="establishment" name="منشأتك" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={12}>
                      {pillarComparisonData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.establishment >= entry.sectorAvg ? '#4f46e5' : '#e11d48'}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="sectorAvg" name="متوسط القطاع" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
                  أعلى من المتوسط
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                  أقل من المتوسط (بحاجة لمعالجة)
                </span>
              </div>
            </div>

          </div>

          {/* Quick Action Gap Rectification Callouts */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white p-5 rounded-3xl border border-indigo-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  خطة الوصول إلى نخبة الرواد (Top 10% Leaders)
                </h4>
                <p className="text-xs text-indigo-200/80 mt-0.5 max-w-2xl leading-relaxed">
                  تحتاج منشأتك إلى رفع ركيزة <span className="font-bold text-amber-300">{pillarComparisonData.find(p => p.establishment < p.sectorAvg)?.subject || 'التراخيص'}</span> لتحقيق المركز المئوي 90+ وتفادي أي زيارات تفتيشية مفاجئة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onConsultSpecialist ? onConsultSpecialist('خطة رفع الترتيب المعياري بالقطاع') : null}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>استشارة خبير الامتثال المعتمد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: Radar Chart of the 6 Compliance Pillars */}
      {/* ========================================================================= */}
      {viewTab === 'radar_pillars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Radar Chart Visual (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>رادار أبعاد الامتثال الستة vs متوسط القطاع ونخبة الرواد</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة شاملة لركائز الامتثال الأساسية لمنشأة «{establishment.name}»
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={pillarComparisonData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 text-xs font-['Cairo'] space-y-1.5 shadow-xl" dir="rtl">
                            <p className="font-bold text-white border-b border-slate-700 pb-1">{data.subject}</p>
                            <div className="flex justify-between gap-4 text-indigo-300 font-bold">
                              <span>منشأتك:</span>
                              <span>{data.establishment}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>متوسط قطاع {activeCityMeta.name}:</span>
                              <span>{data.sectorAvg}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                              <span>نخبة الرواد:</span>
                              <span>{data.sectorLeader}%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">{data.authority}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Radar
                    name="منشأتك"
                    dataKey="establishment"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                    strokeWidth={2.5}
                  />
                  <Radar
                    name="متوسط القطاع"
                    dataKey="sectorAvg"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Radar
                    name="نخبة الرواد"
                    dataKey="sectorLeader"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    formatter={(val) => <span className="font-bold text-slate-700">{val}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pillar Details Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider px-1">
              تحليل الفجوات بالأبعاد الستة:
            </h4>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {pillarComparisonData.map((p, idx) => {
                const diff = p.establishment - p.sectorAvg;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      diff >= 0
                        ? 'bg-white border-slate-200/90 shadow-2xs'
                        : 'bg-rose-50/50 border-rose-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{p.subject}</h5>
                        <span className="text-[10px] text-slate-500">{p.authority}</span>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {diff >= 0 ? `+${diff}%` : `${diff}%`}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>درجة المنشأة: <strong className="text-slate-900">{p.establishment}%</strong></span>
                      <span>متوسط القطاع: <strong>{p.sectorAvg}%</strong></span>
                      <span>الرواد: <strong className="text-emerald-700">{p.sectorLeader}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: Sector Distribution (Bell Curve & Percentile Positioning) */}
      {/* ========================================================================= */}
      {viewTab === 'distribution' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>منحنى التوزيع الطبيعي وموقع منشأتك بين منشآت القطاع</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع عينة الـ {activeSector.totalEstablishmentsSample.toLocaleString()} منشأة في قطاع {activeSector.name} بـ {activeCityMeta.name}
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-900">
              موقع منشأتك: <span className="text-indigo-600 font-black">{estBaseCompliance}%</span> (الشريحة: {distributionData.find(d => d.isEstablishmentHere)?.label})
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} label={{ value: 'نسبة المنشآت', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 text-xs font-['Cairo'] space-y-1" dir="rtl">
                          <p className="font-bold text-white border-b border-slate-700 pb-1">{item.label}</p>
                          <p className="text-indigo-300 font-bold">حجم الشريحة: {item.countPct}% من منشآت القطاع</p>
                          {item.isEstablishmentHere && (
                            <p className="text-amber-300 font-black bg-amber-950/80 px-2 py-0.5 rounded mt-1">
                              ✓ موقع منشأتك الحالي يقع في هذه الشريحة!
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="countPct" name="نسبة المنشآت" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isEstablishmentHere ? '#4f46e5' : '#cbd5e1'}
                      stroke={entry.isEstablishmentHere ? '#312e81' : 'none'}
                      strokeWidth={entry.isEstablishmentHere ? 2.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Takeaway Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 block">النطاق الحرج والتفتيش المكثف (0-49%)</span>
              <p className="text-xs text-rose-950 mt-1 leading-relaxed">
                26% من المنشآت تقع في هذا النطاق وتتلقى أكثر من 3.5 زيارة تفتيشية سنوية مع غرامات مضاعفة.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 block">النطاق المتوسط والمستقر (50-79%)</span>
              <p className="text-xs text-amber-950 mt-1 leading-relaxed">
                54% من المنشآت في هذا النطاق، تتميز بامتثال مقبول مع وجود فجوات في تجديد التراخيص الثانوية.
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">نخبة التميز والرخص الذاتية (80-100%)</span>
              <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                20% فقط من المنشآت تصل لهذا النطاق وتتمتع بمسارات تجديد فورية وحصانة رقابية شبه كاملة.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: Detailed Pillars Table & Optimization Roadmap */}
      {/* ========================================================================= */}
      {viewTab === 'pillars_table' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>مصفوفة تقييم الفجوات وخطة التميز التنظيمي</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تفصيل ركائز الامتثال الستة، الإجراء الوقائي الموصى به، والتأثير على الترتيب المئوي
              </p>
            </div>

            <span className="bg-indigo-50 text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100">
              عدد الركائز الخاضعة للرصد: 6 ركائز
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">المحور / الركيزة التنظيمية</th>
                  <th className="py-3 px-4">الجهة المشرفة</th>
                  <th className="py-3 px-4 text-center">درجة منشأتك</th>
                  <th className="py-3 px-4 text-center">متوسط القطاع</th>
                  <th className="py-3 px-4 text-center">نخبة الرواد</th>
                  <th className="py-3 px-4">فارق الأداء (Gap)</th>
                  <th className="py-3 px-4">الإجراء الموصى به</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pillarComparisonData.map((p, idx) => {
                  const diff = p.establishment - p.sectorAvg;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${diff >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{p.subject}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.authority}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-900">{p.establishment}%</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">{p.sectorAvg}%</td>
                      <td className="py-3.5 px-4 text-center text-emerald-700 font-bold">{p.sectorLeader}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black ${
                          diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {diff >= 0 ? `+${diff}%` : `${diff}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {diff < 0 ? (
                          <button
                            type="button"
                            onClick={() => onRenewLicense ? onRenewLicense(p.pillarCode) : onConsultSpecialist ? onConsultSpecialist(p.subject) : null}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>تصحيح الفجوة فوراً</span>
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مستقر ومطابق للاشتراطات</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>البيانات مستندة إلى المؤشرات الإحصائية العامة المحدثة لنشاط {activeSector.name} في مدينة {activeCityMeta.name}.</span>
            <span className="font-bold text-slate-700">تاريخ آخر معايرة: 15 أغسطس 2026</span>
          </div>

        </div>
      )}

    </div>
  );
};
