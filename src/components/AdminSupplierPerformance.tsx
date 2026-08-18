import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Star,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Building2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Flame,
  FileCheck2,
  DollarSign,
  Scale,
  Leaf,
  Lock,
  Users,
  Eye,
  RefreshCw,
  Share2,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';
import {
  SUPPLIER_PERFORMANCE_METRICS,
  MONTHLY_PERFORMANCE_TRENDS,
  DETAILED_CUSTOMER_REVIEWS,
  CATEGORY_COMPLETION_BENCHMARKS,
  SupplierPerformanceKPI,
  DetailedSupplierReview
} from '../data/supplierPerformanceData';
import { RemediationCategory } from '../data/complianceMarketData';
import { formatSAR } from '../utils/complianceEngine';

interface AdminSupplierPerformanceProps {
  onNavigateToTab?: (tab: string) => void;
  showToast?: (msg?: string) => void;
}

export const AdminSupplierPerformance: React.FC<AdminSupplierPerformanceProps> = ({
  onNavigateToTab,
  showToast = (_msg?: string) => {}
}) => {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'suppliers' | 'sla_turnaround' | 'reviews' | 'benchmarks'>('overview');
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');
  
  // Modal / Detailed View State
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<SupplierPerformanceKPI | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [adminReplyText, setAdminReplyText] = useState<{ [reviewId: string]: string }>({});

  // Filtered Suppliers List
  const filteredSuppliers = useMemo(() => {
    return SUPPLIER_PERFORMANCE_METRICS.filter(item => {
      const matchSearch =
        item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.commercialRegNumber.includes(searchQuery) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchRegion = selectedRegion === 'all' || item.city.includes(selectedRegion) || item.regionAr.includes(selectedRegion);
      const matchTier = selectedTier === 'all' || item.performanceTier === selectedTier;
      const matchRating = selectedRatingFilter === 'all' || item.overallRating >= Number(selectedRatingFilter);

      return matchSearch && matchCategory && matchRegion && matchTier && matchRating;
    });
  }, [searchQuery, selectedCategory, selectedRegion, selectedTier, selectedRatingFilter]);

  // Aggregate Performance Totals
  const aggregateMetrics = useMemo(() => {
    const list = SUPPLIER_PERFORMANCE_METRICS;
    const totalOrders = list.reduce((s, i) => s + i.totalCompletedOrders, 0);
    const totalReviews = list.reduce((s, i) => s + i.totalReviewsCount, 0);
    const avgDays = (list.reduce((s, i) => s + i.avgCompletionDays, 0) / list.length).toFixed(1);
    const avgSlaRate = (list.reduce((s, i) => s + i.slaComplianceRate, 0) / list.length).toFixed(1);
    const avgCsat = (list.reduce((s, i) => s + i.overallRating, 0) / list.length).toFixed(2);
    const avgFirstPass = (list.reduce((s, i) => s + i.firstTimePassRate, 0) / list.length).toFixed(1);
    const avgNps = Math.round(list.reduce((s, i) => s + i.npsScore, 0) / list.length);
    const totalVolumeSAR = list.reduce((s, i) => s + i.totalVolumeSAR, 0);

    return {
      totalOrders,
      totalReviews,
      avgDays,
      avgSlaRate,
      avgCsat,
      avgFirstPass,
      avgNps,
      totalVolumeSAR
    };
  }, []);

  // Filtered Customer Reviews
  const filteredReviews = useMemo(() => {
    return DETAILED_CUSTOMER_REVIEWS.filter(rev => {
      const matchSearch =
        rev.supplierName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.establishmentName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.clientCommentAr.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.orderNumber.toLowerCase().includes(reviewSearchQuery.toLowerCase());
      
      const matchRating = reviewFilterRating === 'all' || Math.floor(rev.rating) === reviewFilterRating;
      const matchSupplier = !selectedSupplierDetail || rev.supplierId === selectedSupplierDetail.supplierId;

      return matchSearch && matchRating && matchSupplier;
    });
  }, [reviewSearchQuery, reviewFilterRating, selectedSupplierDetail]);

  // Radar Data for Multi-Dimensional Quality
  const radarDimensionsData = useMemo(() => {
    if (selectedSupplierDetail) {
      const b = selectedSupplierDetail.satisfactionBreakdown;
      return [
        { subject: 'سرعة الإنجاز والـ SLA', score: (b.speed / 5) * 100, fullMark: 100 },
        { subject: 'جودة التنفيذ والشهادات', score: (b.quality / 5) * 100, fullMark: 100 },
        { subject: 'سهولة التواصل والدعم', score: (b.communication / 5) * 100, fullMark: 100 },
        { subject: 'عدالة وشفافية التسعير', score: (b.pricingFairness / 5) * 100, fullMark: 100 },
        { subject: 'دقة المطابقة الحكومية', score: (b.complianceAccuracy / 5) * 100, fullMark: 100 }
      ];
    }
    // Overall Average
    return [
      { subject: 'سرعة الإنجاز والـ SLA', score: 97.5, fullMark: 100 },
      { subject: 'جودة التنفيذ والشهادات', score: 98.8, fullMark: 100 },
      { subject: 'سهولة التواصل والدعم', score: 96.2, fullMark: 100 },
      { subject: 'عدالة وشفافية التسعير', score: 95.8, fullMark: 100 },
      { subject: 'دقة المطابقة الحكومية', score: 99.4, fullMark: 100 }
    ];
  }, [selectedSupplierDetail]);

  // Rating breakdown for Donut Chart
  const overallRatingDistribution = useMemo(() => {
    let s5 = 0, s4 = 0, s3 = 0, s2 = 0, s1 = 0;
    SUPPLIER_PERFORMANCE_METRICS.forEach(s => {
      s5 += s.ratingDistribution.stars5;
      s4 += s.ratingDistribution.stars4;
      s3 += s.ratingDistribution.stars3;
      s2 += s.ratingDistribution.stars2;
      s1 += s.ratingDistribution.stars1;
    });
    return [
      { name: '5 نجوم (ممتاز جداً)', value: s5, color: '#10b981', percentage: '88.5%' },
      { name: '4 نجوم (جيد جداً)', value: s4, color: '#3b82f6', percentage: '9.2%' },
      { name: '3 نجوم (متوسط)', value: s3, color: '#f59e0b', percentage: '1.6%' },
      { name: 'نجمتان أو أقل (ملاحظات)', value: s2 + s1, color: '#ef4444', percentage: '0.7%' }
    ];
  }, []);

  const handleExportCSV = () => {
    const headers = ['المورد', 'السجل التجاري', 'التصنيف', 'المدينة', 'متوسط زمن الإنجاز (أيام)', 'المستهدف SLA', 'نسبة الالتزام %', 'التقييم', 'عدد التقييمات', 'إجمالي العمليات'];
    const rows = filteredSuppliers.map(s => [
      s.supplierName,
      s.commercialRegNumber,
      s.categoryLabelAr,
      s.city,
      s.avgCompletionDays,
      s.targetSlaDays,
      `${s.slaComplianceRate}%`,
      s.overallRating,
      s.totalReviewsCount,
      s.totalCompletedOrders
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sabbaq_Supplier_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير تقرير مؤشرات أداء الموردين بنجاح (CSV)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                تحليلات الجودة والـ SLA المعتمدة
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                تحديث لحظي مباشر (Live Sync)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-['Cairo'] tracking-tight">
              لوحة تحليلات أداء الموردين ورضا العملاء
            </h1>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              مراقبة سرعة إنجاز أوامر المعالجة وتجديد التراخيص، قياس الالتزام باتفاقيات الخدمة (SLA)، ومعدلات رضا المنشآت بناءً على التقييمات المسجلة وشهادات الاعتماد الحكومي.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-indigo-300" />
              طباعة التقرير التحليلي
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير البيانات (CSV)
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('admin_suppliers')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                إدارة الموردين والاعتمادات
              </button>
            )}
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            نظرة عامة ومؤشرات الإنجاز
          </button>

          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'suppliers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            بطاقات أداء الموردين ({filteredSuppliers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('sla_turnaround')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'sla_turnaround'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            تحليلات زمن الإنجاز والـ SLA
          </button>

          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'reviews'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            تقييمات ورضا العملاء ({DETAILED_CUSTOMER_REVIEWS.length})
          </button>

          <button
            onClick={() => setActiveSubTab('benchmarks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'benchmarks'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            المقارنة المعيارية للقطاعات
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Card 1: Avg Turnaround Days */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">متوسط زمن الإنجاز</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-['Cairo']">{aggregateMetrics.avgDays}</span>
            <span className="text-xs text-slate-500 font-bold">أيام</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>أسرع بـ 38% من المستهدف (2.8 يوم)</span>
          </div>
        </div>

        {/* Card 2: SLA Adherence Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">الالتزام بالـ SLA</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-['Cairo']">{aggregateMetrics.avgSlaRate}%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span>الهدف المعياري: 95.0%+</span>
          </div>
        </div>

        {/* Card 3: CSAT Overall Rating */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">مؤشر رضا العملاء</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-['Cairo']">{aggregateMetrics.avgCsat}</span>
            <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <ThumbsUp className="w-3 h-3" />
            <span>بناءً على {aggregateMetrics.totalReviews} تقييم</span>
          </div>
        </div>

        {/* Card 4: Net Promoter Score (NPS) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">مؤشر الولاء (NPS)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-700 font-['Cairo']">+{aggregateMetrics.avgNps}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold">
            <span>مستوى عالمي ممتاز</span>
          </div>
        </div>

        {/* Card 5: Gov First-time Pass Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">القبول الحكومي الأول</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-['Cairo']">{aggregateMetrics.avgFirstPass}%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-teal-600 font-bold">
            <span>تجاوز فحص سلامة وبلدي</span>
          </div>
        </div>

        {/* Card 6: Total Completed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">الطلبات المنجزة</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-700 font-['Cairo']">{aggregateMetrics.totalOrders}</span>
            <span className="text-xs text-slate-500 font-bold">طلب</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span>قيمة: {formatSAR(aggregateMetrics.totalVolumeSAR)}</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Content Views */}

      {/* VIEW A: OVERVIEW & SLA ANALYTICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Monthly CSAT & Fulfillment Days Trend (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo'] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    المسار الزمني لسرعة الإنجاز ورضا العملاء (12 شهراً)
                  </h3>
                  <p className="text-xs text-slate-500">
                    مقارنة متوسط الأيام المستغرقة مع تصاعد معدل تقييم العملاء (CSAT out of 5.0)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-slate-600">متوسط الأيام</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">معدل الرضا (CSAT)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_PERFORMANCE_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCsat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="monthAr" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis yAxisId="left" domain={[0, 5]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[4.5, 5.0]} tick={{ fontSize: 10, fill: '#10b981' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: 'right' }}
                      formatter={(val: any, name: any) => {
                        if (name === 'avgCompletionDays') return [`${val} يوم`, 'متوسط زمن الإنجاز'];
                        if (name === 'csatScore') return [`${val} / 5.0`, 'مؤشر رضا العملاء'];
                        return [val, name];
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="avgCompletionDays" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDays)" name="avgCompletionDays" />
                    <Line yAxisId="right" type="monotone" dataKey="csatScore" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="csatScore" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="text-slate-500 text-[11px]">تحسن سرعة الإنجاز</div>
                  <div className="font-bold text-indigo-700 text-sm mt-0.5">-47% (من 3.4 إلى 1.8 يوم)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="text-slate-500 text-[11px]">ارتفاع مؤشر الرضا</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">+0.22 نقطة (إلى 4.94)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="text-slate-500 text-[11px]">نمو حجم المعاملات</div>
                  <div className="font-bold text-purple-700 text-sm mt-0.5">+145% سنوياً</div>
                </div>
              </div>
            </div>

            {/* Chart 2: Radar Dimensions Quality (1 Col) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo'] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  مصفوفة معايير الجودة والامتثال
                </h3>
                <p className="text-xs text-slate-500">
                  تقييم متكامل للأبعاد الخمسة لتجربة العميل والتدقيق الحكومي
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDimensionsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar name="الأداء العام للمنصة" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px', textAlign: 'right' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  تتميز المنصة بنسبة <strong>99.4%</strong> في دقة المطابقة الحكومية والاعتماد المباشر في منصات الدفاع المدني وزاتكا وبلدي من المحاولة الأولى.
                </p>
              </div>
            </div>
          </div>

          {/* Turnaround Time Comparison by Category */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo'] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  متوسط زمن الإنجاز (أيام) مقارنة بالحد الأقصى للـ SLA لكل قطاع
                </h3>
                <p className="text-xs text-slate-500">
                  جميع القطاعات تنجز المعاملات قبل الحد الأقصى المتفق عليه في اتفاقيات مستوى الخدمة
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-slate-600">الزمن الفعلي المنفذ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-slate-600">الحد الأقصى للـ SLA</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_COMPLETION_BENCHMARKS} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569', angle: -15, textAnchor: 'end' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: 'right' }}
                    formatter={(val: any, name: any) => {
                      if (name === 'avgDays') return [`${val} يوم`, 'الزمن الفعلي للإنجاز'];
                      if (name === 'targetDays') return [`${val} يوم`, 'الحد الأقصى للـ SLA'];
                      return [val, name];
                    }}
                  />
                  <Bar dataKey="avgDays" fill="#2563eb" radius={[6, 6, 0, 0]} name="avgDays">
                    {CATEGORY_COMPLETION_BENCHMARKS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgDays <= 1.5 ? '#10b981' : entry.avgDays <= 2.5 ? '#3b82f6' : '#6366f1'} />
                    ))}
                  </Bar>
                  <Bar dataKey="targetDays" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="targetDays" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Distribution & Top Review Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rating Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo'] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  توزيع تقييمات المنشآت والعملاء
                </h3>
                <p className="text-xs text-slate-500">إجمالي {aggregateMetrics.totalReviews} تقييم موثق بعد استلام الخدمة</p>
              </div>

              <div className="space-y-3 pt-2">
                {overallRatingDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span>{item.value} تقييم</span>
                        <span className="text-slate-400">({item.percentage})</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: item.percentage,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>97.7%</strong> من المنشآت منحت تقييم 4 نجوم فأكثر مع تكرار طلب التجديد السنوي.
                </span>
              </div>
            </div>

            {/* Recent Verified Reviews Spotlight (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo'] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    أحدث تقييمات المنشآت والشهادات الموثقة
                  </h3>
                  <p className="text-xs text-slate-500">آراء وتجارب العملاء المسجلة مباشرة بعد إنجاز وتدقيق المعاملة</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('reviews')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  عرض جميع التقييمات
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {DETAILED_CUSTOMER_REVIEWS.slice(0, 4).map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2.5 hover:bg-slate-50 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{rev.establishmentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-indigo-600 font-semibold">{rev.categoryLabelAr}</span>
                          <span>•</span>
                          <span>{rev.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-800 text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                      «{rev.clientCommentAr}»
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-slate-600">المورد: <strong>{rev.supplierName.split(' ')[0]} {rev.supplierName.split(' ')[1]}</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        أُنجز في {rev.completionDaysTaken} يوم
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: SUPPLIERS SCORECARDS & DETAILED PERFORMANCE TABLE */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم المورد، السجل التجاري، أو المدينة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="تصفية حسب القطاع والتخصص"
                  className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع القطاعات والتخصصات</option>
                  <option value="civil_defense">الدفاع المدني والسلامة</option>
                  <option value="zatca">الفوترة والزكاة (ZATCA)</option>
                  <option value="balady">التراخيص والبلديات</option>
                  <option value="qiwa_muqeem">العمل والتوطين (قوى)</option>
                  <option value="environmental">البيئة والنفايات</option>
                  <option value="technical_security">الأنظمة الأمنية والكاميرات</option>
                  <option value="legal_consulting">الاستشارات والاعتراضات</option>
                  <option value="occupational_health">الصحة والسلامة المهنية</option>
                </select>

                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  aria-label="تصفية حسب مستوى الأداء"
                  className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع مستويات الأداء</option>
                  <option value="top_performer">الأعلى أداءً (Top Performer)</option>
                  <option value="meets_expectations">مستوفٍ للشروط (Meets SLA)</option>
                  <option value="needs_improvement">يحتاج تحسين (Needs Improvement)</option>
                </select>

                <select
                  value={selectedRatingFilter}
                  onChange={(e) => setSelectedRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  aria-label="تصفية حسب التقييم"
                  className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع التقييمات</option>
                  <option value="4.8">4.8+ نجوم فما فوق</option>
                  <option value="4.5">4.5+ نجوم فما فوق</option>
                  <option value="4.0">4.0+ نجوم فما فوق</option>
                </select>

                {(searchQuery || selectedCategory !== 'all' || selectedTier !== 'all' || selectedRatingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedTier('all');
                      setSelectedRatingFilter('all');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    إعادة ضبط
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo']">
                  جدول تقييمات ومؤشرات أداء الموردين المعتمدين
                </h3>
                <p className="text-xs text-slate-500">
                  عرض {filteredSuppliers.length} مورد معتمد مع قياس سرعة الإنجاز ورضا العملاء
                </p>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                معدل الـ SLA العام: {aggregateMetrics.avgSlaRate}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">المورد والتصنيف</th>
                    <th className="py-3.5 px-4 text-center">المدينة والتغطية</th>
                    <th className="py-3.5 px-4 text-center">متوسط زمن الإنجاز</th>
                    <th className="py-3.5 px-4 text-center">الالتزام بالـ SLA</th>
                    <th className="py-3.5 px-4 text-center">القبول الحكومي</th>
                    <th className="py-3.5 px-4 text-center">تقييم العملاء</th>
                    <th className="py-3.5 px-4 text-center">الطلبات المنجزة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((supplier) => {
                    const isFaster = supplier.avgCompletionDays <= supplier.targetSlaDays;
                    return (
                      <tr key={supplier.supplierId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Supplier Info */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{supplier.supplierName}</span>
                              {supplier.verificationLevel === 'platinum_accredited' && (
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-200">
                                  بلاتيني
                                </span>
                              )}
                              {supplier.verificationLevel === 'gold_verified' && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                                  ذهبي
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>س.ت: {supplier.commercialRegNumber}</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-semibold">{supplier.categoryLabelAr}</span>
                            </div>
                          </div>
                        </td>

                        {/* City / Coverage */}
                        <td className="py-4 px-4 text-center">
                          <span className="text-slate-700 font-semibold">{supplier.city}</span>
                        </td>

                        {/* Avg Turnaround Time */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-black text-slate-900">{supplier.avgCompletionDays}</span>
                              <span className="text-[10px] text-slate-500">أيام</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              (المستهدف: {supplier.targetSlaDays} أيام)
                            </span>
                          </div>
                        </td>

                        {/* SLA Compliance % */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                              supplier.slaComplianceRate >= 98
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {supplier.slaComplianceRate}%
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
                              {supplier.slaComplianceRate >= 98 ? 'ممتاز' : 'مستوفٍ'}
                            </span>
                          </div>
                        </td>

                        {/* First-time Gov Pass */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            {supplier.firstTimePassRate}%
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-center gap-1 font-bold text-slate-900">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{supplier.overallRating}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              ({supplier.totalReviewsCount} تقييم)
                            </span>
                          </div>
                        </td>

                        {/* Orders Count */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-slate-900">{supplier.totalCompletedOrders}</span>
                            <span className="text-[10px] text-slate-400">طلب ناجح</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setSelectedSupplierDetail(supplier)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            بطاقة الأداء
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: SLA & TURNAROUND BENCHMARKS */}
      {activeSubTab === 'sla_turnaround' && (
        <div className="space-y-6">
          {/* Turnaround Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-3xl border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs">
                <Zap className="w-4 h-4 text-indigo-600" />
                أسرع زمن إنجاز مسجل
              </div>
              <div className="text-3xl font-black text-indigo-950 font-['Cairo']">3 ساعات</div>
              <p className="text-xs text-indigo-800/80">
                في قطاع الفوترة الإلكترونية وربط ZATCA مع تدريب نقاط البيع وإصدار شهادات الامتثال.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-3xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Clock className="w-4 h-4 text-emerald-600" />
                استجابة الطوارئ والتصحيح الفوري
              </div>
              <div className="text-3xl font-black text-emerald-950 font-['Cairo']">24 دقيقة</div>
              <p className="text-xs text-emerald-800/80">
                متوسط وقت مباشرة فِرق الموردين المعتمدين لطلبات التفتيش المفاجئ ورفع الحظر.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-3xl border border-purple-200/80 space-y-2">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                معدل النزاعات والاعتراضات
              </div>
              <div className="text-3xl font-black text-purple-950 font-['Cairo']">0.18%</div>
              <p className="text-xs text-purple-800/80">
                أقل من 2 حالة نزاع لكل 1,000 معاملة، مع تسوية آلية وضمان استرداد الرسوم بنسبة 100%.
              </p>
            </div>
          </div>

          {/* Detailed Category Turnaround Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Cairo']">
                جدول أوقات الإنجاز المستهدفة والفعلية حسب نوع المعاملة والجهة
              </h3>
              <p className="text-xs text-slate-500">
                مقارنة دقيقة لالتزام الموردين باتفاقيات مستوى الخدمة (SLA) المعتمدة من منصة سبّاق
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">القطاع والخدمة</th>
                    <th className="py-3.5 px-4 text-center">المستهدف الأقصى (SLA)</th>
                    <th className="py-3.5 px-4 text-center">متوسط التنفيذ الفعلي</th>
                    <th className="py-3.5 px-4 text-center">نسبة التفوق في السرعة</th>
                    <th className="py-3.5 px-4 text-center">نسبة القبول الحكومي</th>
                    <th className="py-3.5 px-4 text-center">مستوى الرضا</th>
                    <th className="py-3.5 px-4 text-center">عدد الموردين النشطين</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CATEGORY_COMPLETION_BENCHMARKS.map((bench, idx) => {
                    const speedAdvantage = Math.round(((bench.targetDays - bench.avgDays) / bench.targetDays) * 100);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {bench.category}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                          {bench.targetDays} أيام
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-indigo-700">
                          {bench.avgDays} يوم
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                            +{speedAdvantage}% أسرع
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-teal-700">
                          {bench.passRate}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold text-slate-900">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{bench.satisfaction}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-bold">
                          {bench.suppliersCount} موردين معتمدين
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW D: REVIEWS & CUSTOMER SATISFACTION FEED */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          {/* Review Filter Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث في نصوص التقييمات، اسم المنشأة، أو المورد..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reviewFilterRating}
                onChange={(e) => setReviewFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                aria-label="تصفية حسب عدد النجوم"
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              >
                <option value="all">جميع النجوم</option>
                <option value="5">5 نجوم (ممتاز)</option>
                <option value="4">4 نجوم (جيد جداً)</option>
              </select>

              {selectedSupplierDetail && (
                <button
                  onClick={() => setSelectedSupplierDetail(null)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl border border-indigo-200 font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  عرض كافة الموردين
                </button>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-['Cairo']">{rev.establishmentName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          معتمد وموثق
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        طلب رقم: <strong className="text-slate-700">{rev.orderNumber}</strong> • {rev.resolvedAt} • {rev.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-800 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Supplier & Category Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">المورد: <strong className="text-indigo-700">{rev.supplierName}</strong></span>
                    <span className="text-slate-500 font-semibold">{rev.categoryLabelAr}</span>
                  </div>

                  {/* Client Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                    «{rev.clientCommentAr}»
                  </p>

                  {/* Rating Breakdown Sub-scores */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-slate-400">السرعة</div>
                      <div className="font-bold text-slate-800">{rev.speedRating} ★</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-slate-400">الجودة</div>
                      <div className="font-bold text-slate-800">{rev.qualityRating} ★</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-slate-400">التواصل</div>
                      <div className="font-bold text-slate-800">{rev.communicationRating} ★</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-slate-400">المطابقة</div>
                      <div className="font-bold text-slate-800">{rev.complianceRating} ★</div>
                    </div>
                  </div>

                  {/* Supplier Official Response (if exists) */}
                  {rev.supplierResponseAr && (
                    <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                      <div className="font-bold text-[11px] text-indigo-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        رد المورد الرسمي:
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {rev.supplierResponseAr}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    تم الإنجاز خلال {rev.completionDaysTaken} يوم (المستهدف: {rev.targetDays} أيام)
                  </span>
                  <span className="text-slate-400 text-[11px]">معاملة مغلقة وناجحة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW E: BENCHMARKS & BEST PRACTICES */}
      {activeSubTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                معايير الأداء والامتثال المعتمدة في منصة سبّاق (Sabbaq SLA Benchmark)
              </h3>
              <p className="text-xs text-slate-500">
                الضوابط والاشتراطات الإلزامية لموردي حلول الامتثال لضمان بقاء المنشآت في المنطقة الخضراء وتجنب أي غرامات
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-xs">معيار سرعة الإنجاز (SLA)</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ألا يتجاوز زمن إنجاز المعاملة 72 ساعة كحد أقصى للخدمات الميدانية و24 ساعة للخدمات السحابية.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-xs">نسبة القبول الحكومي الأول</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  أن تحقق تقارير وشهادات المورد نسبة قبول لا تقل عن 98% لدى مفتشي البلديات والدفاع المدني وزاتكا.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-xs">الحد الأدنى للتقييم (CSAT)</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  الحفاظ على متوسط تقييم عملاء تراكمي لا يقل عن 4.6 من 5.0 نجمة مع صفر نزاعات غير محلولة.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-xs">الضمان وحماية المنشأة</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  تقديم ضمان شامل لمدة 12 شهراً وتحمل أي غرامة نظامية تنشأ عن خطأ فني أو تأخير من المورد.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Detailed Supplier Scorecard */}
      {selectedSupplierDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-['Cairo']">{selectedSupplierDetail.supplierName}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    {selectedSupplierDetail.badgeTitleAr}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  س.ت: {selectedSupplierDetail.commercialRegNumber} • {selectedSupplierDetail.categoryLabelAr} • {selectedSupplierDetail.city}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSupplierDetail(null)}
                aria-label="إغلاق بطاقة أداء المورد"
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px]">متوسط زمن الإنجاز</div>
                  <div className="text-xl font-black text-slate-900 mt-1 font-['Cairo']">
                    {selectedSupplierDetail.avgCompletionDays} يوم
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    المستهدف: {selectedSupplierDetail.targetSlaDays} يوم
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px]">الالتزام بالـ SLA</div>
                  <div className="text-xl font-black text-emerald-600 mt-1 font-['Cairo']">
                    {selectedSupplierDetail.slaComplianceRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedSupplierDetail.totalCompletedOrders} طلب منجز
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px]">تقييم العملاء (CSAT)</div>
                  <div className="text-xl font-black text-amber-500 mt-1 font-['Cairo'] flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selectedSupplierDetail.overallRating}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedSupplierDetail.totalReviewsCount} تقييم موثق
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px]">القبول الحكومي الأول</div>
                  <div className="text-xl font-black text-teal-700 mt-1 font-['Cairo']">
                    {selectedSupplierDetail.firstTimePassRate}%
                  </div>
                  <div className="text-[10px] text-teal-600 font-bold">
                    نسبة الرفض: {selectedSupplierDetail.rejectionRate}%
                  </div>
                </div>
              </div>

              {/* Radar Breakdown Chart */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs font-['Cairo']">
                  مصفوفة الأداء التفصيلية للمورد
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDimensionsData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#334155' }} />
                      <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Radar name={selectedSupplierDetail.supplierName} dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplierDetail(null);
                    setActiveSubTab('reviews');
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-200 transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  عرض كافة تقييمات هذا المورد ({selectedSupplierDetail.totalReviewsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSupplierDetail(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Export & Print Performance Report */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base font-['Cairo']">تقرير مؤشرات أداء الموردين ورضا العملاء</h3>
                  <p className="text-xs text-slate-400">تقرير رسمي معتمد لتوثيق اتفاقيات مستوى الخدمة (SLA)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="إغلاق نافذة التقرير"
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">تاريخ التقرير</span>
                  <span className="text-slate-600">{new Date().toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">إجمالي الموردين المشمولين</span>
                  <span className="text-indigo-700 font-bold">{SUPPLIER_PERFORMANCE_METRICS.length} مورد معتمد</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">متوسط زمن الإنجاز العام</span>
                  <span className="text-emerald-700 font-bold">{aggregateMetrics.avgDays} أيام (أسرع بـ 38%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">مؤشر رضا العملاء الكلي</span>
                  <span className="text-amber-600 font-bold">{aggregateMetrics.avgCsat} / 5.0 (مستوى ممتاز)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIsExportModalOpen(false);
                    showToast('جاري تحضير وطباعة التقرير التحليلي...');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  طباعة التقرير الفوري
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
