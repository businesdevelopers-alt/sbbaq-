import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  ThumbsUp,
  AlertCircle,
  FileCheck2,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Sparkles,
  Layers,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Flame,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { Supplier, RemediationCategory } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface SupplierPerformanceTabProps {
  activeSupplier: Supplier;
  onNavigateTab?: (tab: string) => void;
  showToast: (msg: string) => void;
}

interface ClientReviewItem {
  id: string;
  establishmentName: string;
  city: string;
  sectorAr: string;
  rating: number; // 1 - 5
  date: string;
  projectTitle: string;
  category: RemediationCategory;
  categoryLabelAr: string;
  promisedDays: number;
  actualDays: number;
  completedAheadOfTime: boolean;
  commentAr: string;
  verifiedGovAcceptance: boolean;
  inspectionPassedFirstTime: boolean;
  tags: string[];
}

export const SupplierPerformanceTab: React.FC<SupplierPerformanceTabProps> = ({
  activeSupplier,
  onNavigateTab,
  showToast
}) => {
  // Timeframe filter
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '180d' | 'year'>('180d');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<'all' | '5' | '4' | '3'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');

  // Sample historical data based on timeframe
  const speedTrendData = useMemo(() => {
    return [
      { month: 'أكتوبر 2025', promisedAvgDays: 4.5, actualAvgDays: 3.4, completedOrders: 18, emergencySpeedHours: 4.8, onTimeRate: 96 },
      { month: 'نوفمبر 2025', promisedAvgDays: 4.2, actualAvgDays: 3.1, completedOrders: 24, emergencySpeedHours: 4.2, onTimeRate: 97 },
      { month: 'ديسمبر 2025', promisedAvgDays: 4.0, actualAvgDays: 2.9, completedOrders: 29, emergencySpeedHours: 3.9, onTimeRate: 98 },
      { month: 'يناير 2026', promisedAvgDays: 3.8, actualAvgDays: 2.7, completedOrders: 33, emergencySpeedHours: 3.5, onTimeRate: 99 },
      { month: 'فبراير 2026', promisedAvgDays: 3.5, actualAvgDays: 2.5, completedOrders: 38, emergencySpeedHours: 3.1, onTimeRate: 99 },
      { month: 'مارس 2026 (حالي)', promisedAvgDays: 3.5, actualAvgDays: 2.4, completedOrders: 42, emergencySpeedHours: 2.8, onTimeRate: 99.5 }
    ];
  }, [timeframe]);

  // Client satisfaction monthly progression
  const satisfactionTrendData = useMemo(() => {
    return [
      { month: 'أكتوبر', csatScore: 4.78, satisfactionPct: 95.6, reviewsCount: 16, repeatClientRate: 78 },
      { month: 'نوفمبر', csatScore: 4.82, satisfactionPct: 96.4, reviewsCount: 22, repeatClientRate: 80 },
      { month: 'ديسمبر', csatScore: 4.86, satisfactionPct: 97.2, reviewsCount: 26, repeatClientRate: 82 },
      { month: 'يناير', csatScore: 4.90, satisfactionPct: 98.0, reviewsCount: 31, repeatClientRate: 84 },
      { month: 'فبراير', csatScore: 4.92, satisfactionPct: 98.4, reviewsCount: 36, repeatClientRate: 85 },
      { month: 'مارس', csatScore: 4.95, satisfactionPct: 99.0, reviewsCount: 40, repeatClientRate: 88 }
    ];
  }, [timeframe]);

  // Quality Pillars (محاور الجودة ورضا المنشآت)
  const qualityPillarsData = useMemo(() => {
    return [
      { pillar: 'سرعة الاستجابة وتقديم العروض', scorePct: 99.2, industryAvgPct: 82.0, rating: 4.96 },
      { pillar: 'الالتزام الصارم بمواعيد التسليم', scorePct: 98.6, industryAvgPct: 79.5, rating: 4.93 },
      { pillar: 'المطابقة والقبول الحكومي الفوري', scorePct: 99.5, industryAvgPct: 86.0, rating: 4.98 },
      { pillar: 'عدالة ووضوح التسعير والمواصفات', scorePct: 96.8, industryAvgPct: 81.0, rating: 4.84 },
      { pillar: 'خدمة ما بعد التوريد والضمان', scorePct: 97.4, industryAvgPct: 77.0, rating: 4.87 }
    ];
  }, []);

  // Category speed breakdown
  const categorySpeedData = useMemo(() => {
    return [
      { category: 'الدفاع المدني والسلامة', avgDays: 2.2, ordersCount: 48, passRate: 100 },
      { category: 'البلديات والتراخيص', avgDays: 3.1, ordersCount: 34, passRate: 98.5 },
      { category: 'الفوترة والربط مع زكاة', avgDays: 1.2, ordersCount: 26, passRate: 100 },
      { category: 'السلامة والصحة المهنية', avgDays: 2.8, ordersCount: 21, passRate: 99.0 },
      { category: 'الكاميرات والرقابة الأمنية', avgDays: 2.5, ordersCount: 19, passRate: 98.8 }
    ];
  }, []);

  // Mock verified client reviews
  const verifiedReviews: ClientReviewItem[] = useMemo(() => {
    return [
      {
        id: 'rev-01',
        establishmentName: 'شركة مطاعم القصر الماسية',
        city: 'الرياض',
        sectorAr: 'المطاعم والإعاشة',
        rating: 5,
        date: 'منذ 3 أيام',
        projectTitle: 'تركيب وصيانة شبكة إنذار وإطفاء الحريق واستخراج تقرير سلامة إلكتروني',
        category: 'civil_defense',
        categoryLabelAr: 'الدفاع المدني',
        promisedDays: 4,
        actualDays: 2,
        completedAheadOfTime: true,
        commentAr: 'سرعة استثنائية في إنجاز التقرير الفني واعتماده عبر منصة سلامة خلال 48 ساعة فقط، مما أنقذنا من غرامة انتهاء مهلة التفتيش البلدي.',
        verifiedGovAcceptance: true,
        inspectionPassedFirstTime: true,
        tags: ['سرعة فائقة', 'اعتماد فوري', 'طاقم مهني']
      },
      {
        id: 'rev-02',
        establishmentName: 'مجموعة الأفق للخدمات الطبية المتقدمة',
        city: 'الرياض',
        sectorAr: 'الرعاية الصحية',
        rating: 5,
        date: 'منذ أسبوع',
        projectTitle: 'توفير مخارج طوارئ ومخططات كود البناء السعودي للمجمع الطبي',
        category: 'civil_defense',
        categoryLabelAr: 'الدفاع المدني',
        promisedDays: 5,
        actualDays: 3,
        completedAheadOfTime: true,
        commentAr: 'تعامل احترافي ومهندسون معتمدون لدى هيئة المهندسين، تم إنجاز الفحص والتقرير قبل الموعد المتفق عليه بيومين كاملين.',
        verifiedGovAcceptance: true,
        inspectionPassedFirstTime: true,
        tags: ['مطابقة كود البناء', 'دقة بالمواعيد']
      },
      {
        id: 'rev-03',
        establishmentName: 'شركة مسارات اللوجستية والتخزين',
        city: 'الدمام',
        sectorAr: 'النقل واللوجستيات',
        rating: 5,
        date: 'منذ 10 أيام',
        projectTitle: 'تصحيح اشتراطات السلامة واللوحات الإرشادية لكاميرات المراقبة الأمنية',
        category: 'technical_security',
        categoryLabelAr: 'الأمن والرقابة',
        promisedDays: 3,
        actualDays: 2,
        completedAheadOfTime: true,
        commentAr: 'استجابة سريعة جداً لطلب الطوارئ بعد زيارة المفتش، تم توفير كافة النواقص واعتماد شهادة الضبط الأمني دون أي تأخير.',
        verifiedGovAcceptance: true,
        inspectionPassedFirstTime: true,
        tags: ['تدخل طوارئ', 'جودة توريد']
      },
      {
        id: 'rev-04',
        establishmentName: 'مؤسسة البرج للمقاولات والتطوير',
        city: 'جدة',
        sectorAr: 'التشييد والبناء',
        rating: 4,
        date: 'منذ أسبوعين',
        projectTitle: 'إعداد خطة السلامة والصحة المهنية وتوريد معدات الوقاية الشخصية',
        category: 'occupational_health',
        categoryLabelAr: 'السلامة المهنية',
        promisedDays: 4,
        actualDays: 3,
        completedAheadOfTime: true,
        commentAr: 'الخدمة ممتازة والمعدات مطابقة للمواصفات القياسية السعودية، تم قبول الملف من أول مراجعة تفتيشية لمكتب العمل.',
        verifiedGovAcceptance: true,
        inspectionPassedFirstTime: true,
        tags: ['مطابقة للمواصفات', 'توفير شامل']
      },
      {
        id: 'rev-05',
        establishmentName: 'سلسلة مقاهي إكليل الشرق',
        city: 'الرياض',
        sectorAr: 'الأغذية والمشروبات',
        rating: 5,
        date: 'منذ 18 يوماً',
        projectTitle: 'تجديد عقود الصيانة الدورية وتحديث شهادات الوقاية السنوية',
        category: 'civil_defense',
        categoryLabelAr: 'الدفاع المدني',
        promisedDays: 2,
        actualDays: 1,
        completedAheadOfTime: true,
        commentAr: 'إصدار فوري لعقد الصيانة على منصة سلامة في نفس اليوم مع توفير زيارة فحص ميدانية سريعة. نعتمد عليهم في كافة فروعنا.',
        verifiedGovAcceptance: true,
        inspectionPassedFirstTime: true,
        tags: ['إنجاز بنفس اليوم', 'شريك دائم']
      }
    ];
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return verifiedReviews.filter((rev) => {
      const matchRating = selectedRatingFilter === 'all' || rev.rating.toString() === selectedRatingFilter;
      const matchSearch =
        rev.establishmentName.includes(reviewSearchQuery) ||
        rev.commentAr.includes(reviewSearchQuery) ||
        rev.projectTitle.includes(reviewSearchQuery) ||
        rev.sectorAr.includes(reviewSearchQuery);
      return matchRating && matchSearch;
    });
  }, [verifiedReviews, selectedRatingFilter, reviewSearchQuery]);

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo']">
      {/* 1. Header & Performance Badge Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white border border-slate-700 shadow-xl relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>مورد بلاتيني معتمد • المرتبة الأولى في سرعة الإنجاز</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>نسبة قبول حكومي: 99.5%</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
              <span>لوحة أداء المورد ومستوى رضا المنشآت (SLA & CSAT)</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تحليل فوري لمؤشرات كفاءة التوريد، سرعة الاستجابة لطلبات عروض الأسعار (RFQs)، ومعدل رضا العملاء وتكرار الشراء عبر منصة سبّاق.
            </p>
          </div>

          {/* Timeframe selector controls */}
          <div className="flex flex-col sm:flex-row items-end lg:items-center gap-3 shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10">
            <span className="text-xs font-semibold text-slate-300 pr-2">فترة التقرير:</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: '30d', label: '30 يوم' },
                { id: '90d', label: '3 أشهر' },
                { id: '180d', label: '6 أشهر' },
                { id: 'year', label: '2026' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTimeframe(t.id as any);
                    showToast(`تم تحديث مؤشرات الأداء لفترة: ${t.label}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeframe === t.id
                      ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Core Speed & Quality KPIs Grid (مؤشرات الأداء الرئيسية لسرعة الإنجاز والرضا) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Response Speed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">سرعة الرد على العروض</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">1.8</span>
            <span className="text-xs font-bold text-slate-500">ساعة</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>أسرع بـ 74% من السوق</span>
          </div>
        </div>

        {/* KPI 2: Average Fulfillment Days */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">متوسط مدة الإنجاز</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">2.4</span>
            <span className="text-xs font-bold text-slate-500">يوم عمل</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المستهدف: أقل من 3.5 أيام</span>
          </div>
        </div>

        {/* KPI 3: On-Time Delivery Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">الالتزام بالمواعيد</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-indigo-900 font-mono">98.6%</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-indigo-700 font-bold">
            <span>SLA On-Time Completion</span>
          </div>
        </div>

        {/* KPI 4: Emergency 24h Handling */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">استجابة طوارئ التفتيش</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-rose-700 font-mono">100%</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-rose-700 font-bold">
            <span>خلال 3.5 ساعات كمتوسط</span>
          </div>
        </div>

        {/* KPI 5: Client CSAT Rating */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">مؤشر رضا المنشآت</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-600 font-mono">4.95</span>
            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-700 font-bold">
            <span>99% تقييم إيجابي (124 عميل)</span>
          </div>
        </div>

        {/* KPI 6: Repeat Client Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold text-slate-700">تكرار الطلب والولاء</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-purple-700 font-mono">88.0%</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-purple-700 font-bold">
            <span>منشآت تطلب عقوداً دورية</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Charts Grid (الرسوم البيانية التفاعلية للأداء والرضا) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Fulfillment Speed Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  تطور سرعة إنجاز الطلبات (أيام التسليم الفعلية مقابل المستهدفة)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة متوسط أيام الإنجاز الفعلي مقابل الموعد المحدد في العروض مع عدد الطلبات المنفذة
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
              تسارع في الإنجاز بنسبة 29%
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={speedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="days" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 6]} />
                <YAxis yAxisId="orders" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const actual = payload.find((p) => p.dataKey === 'actualAvgDays')?.value;
                      const promised = payload.find((p) => p.dataKey === 'promisedAvgDays')?.value;
                      const orders = payload.find((p) => p.dataKey === 'completedOrders')?.value;
                      const onTime = (payload[0].payload as any).onTimeRate;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-['Cairo'] space-y-1.5">
                          <p className="font-bold border-b border-slate-800 pb-1 text-emerald-400">{label}</p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">متوسط الأيام الفعلية:</span>
                            <span className="font-mono font-bold text-white">{actual} أيام</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">الموعد المستهدف بالعرض:</span>
                            <span className="font-mono font-bold text-amber-300">{promised} أيام</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">الطلبات المنجزة:</span>
                            <span className="font-mono font-bold text-indigo-300">{orders} طلب</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[10px] text-emerald-400">
                            <span>نسبة الالتزام بالمواعيد:</span>
                            <span className="font-bold font-mono">{onTime}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'actualAvgDays') return 'الأيام الفعلية للإنجاز';
                    if (value === 'promisedAvgDays') return 'الموعد المستهدف في العرض';
                    if (value === 'completedOrders') return 'عدد الطلبات المكتملة';
                    return value;
                  }}
                />
                <Bar yAxisId="orders" dataKey="completedOrders" fill="#e0e7ff" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Line yAxisId="days" type="monotone" dataKey="promisedAvgDays" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                <Line yAxisId="days" type="monotone" dataKey="actualAvgDays" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>معدل الإنجاز قبل الموعد: <strong>89.4% من إجمالي العمليات المنفذة</strong></span>
            </span>
            <span className="text-[11px] text-slate-400">تحديث تلقائي عبر منصة سلامة وبلدي</span>
          </div>
        </div>

        {/* Chart 2: Client Satisfaction Index Trend (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  مؤشر رضا المنشآت والتقييم الشهري
                </h3>
              </div>
              <span className="font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-mono">
                4.95 / 5.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تطور تقييمات المنشآت المستفيدة ونسبة التقييمات الإيجابية (CSAT)
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={satisfactionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="csatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[4.5, 5.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-['Cairo'] space-y-1.5">
                          <p className="font-bold border-b border-slate-800 pb-1 text-amber-400">{label}</p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">معدل التقييم:</span>
                            <span className="font-mono font-bold text-amber-300">{d.csatScore} / 5.0</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">نسبة الرضا العام:</span>
                            <span className="font-mono font-bold text-emerald-400">{d.satisfactionPct}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">التقييمات المسجلة:</span>
                            <span className="font-mono font-bold text-white">{d.reviewsCount} تقييم</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[10px] text-purple-300">
                            <span>نسبة تكرار الطلب:</span>
                            <span className="font-bold font-mono">{d.repeatClientRate}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="csatScore" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#csatGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">5 نجوم</span>
              <span className="font-extrabold text-slate-900 font-mono">92%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">4 نجوم</span>
              <span className="font-extrabold text-slate-900 font-mono">7%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">أقل من 4</span>
              <span className="font-extrabold text-slate-900 font-mono">1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Pillars of Quality & Category Breakdown (محاور الجودة وسرعة الإنجاز حسب التصنيف) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quality Pillars Progress Bar (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  معايير رضا المنشآت (Quality Pillars)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">مقارنة بمتوسط السوق</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تقييم المنشآت للمورد في خمسة أبعاد تشغيلية وفنية معتمدة
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {qualityPillarsData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.pillar}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-700">{item.scorePct}%</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.rating} ★)</span>
                  </div>
                </div>

                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  {/* Industry average marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    style={{ right: `${item.industryAvgPct}%` }}
                    title={`متوسط السوق: ${item.industryAvgPct}%`}
                  />
                  {/* Supplier Score Bar */}
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${item.scorePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="text-emerald-600 font-semibold">+{(item.scorePct - item.industryAvgPct).toFixed(1)}% أعلى من متوسط الموردين</span>
                  <span>متوسط السوق: {item.industryAvgPct}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900 mt-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              يمنحك هذا الأداء المتفوق أولوية الظهور في <strong>«القائمة الموصى بها»</strong> للمنشآت عند استدراج عروض الأسعار التلقائية.
            </p>
          </div>
        </div>

        {/* Speed & Volume by Regulatory Category (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  سرعة الإنجاز والاعتماد حسب الجهة والقطاع
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono">148 طلب منفذ</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متوسط أيام التنفيذ ونسبة اجتياز المعاينة والتفتيش الحكومي
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySpeedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-['Cairo'] space-y-1">
                          <p className="font-bold border-b border-slate-800 pb-1 text-emerald-400">{d.category}</p>
                          <p className="text-slate-300">متوسط الإنجاز: <span className="font-bold text-white font-mono">{d.avgDays} أيام</span></p>
                          <p className="text-slate-300">إجمالي الطلبات: <span className="font-bold text-indigo-300 font-mono">{d.ordersCount} طلب</span></p>
                          <p className="text-slate-300">نسبة الاجتياز والاعتماد: <span className="font-bold text-emerald-400 font-mono">{d.passRate}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgDays" fill="#4f46e5" radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>أعلى نسبة اعتماد: <strong>الدفاع المدني (100%)</strong></span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>أسرع تنفيذ: <strong>أنظمة الزكاة (1.2 يوم)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Verified Client Reviews & Feedback (سجل تقييمات وآراء المنشآت الموثقة) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                سجل آراء وتقييمات المنشآت الموثقة
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تقييمات حقيقية مرتبطة بطلبات تنفيذ وتوريد منجزة ومعتمدة رسمياً
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث في تقييمات المنشآت..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRatingFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedRatingFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setSelectedRatingFilter('5')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedRatingFilter === '5' ? 'bg-amber-100 text-amber-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>5</span>
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedRatingFilter('4')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedRatingFilter === '4' ? 'bg-slate-200 text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>4</span>
                <Star className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.length === 0 ? (
            <div className="col-span-2 py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-600">لا توجد تقييمات مطابقة لبحثك</p>
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 p-4.5 flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  {/* Top row: Client info & Rating */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-600" />
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{rev.establishmentName}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{rev.sectorAr}</span>
                        <span>•</span>
                        <span>{rev.city}</span>
                        <span>•</span>
                        <span className="text-slate-400">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span className="text-xs font-extrabold text-amber-900 font-mono">{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Project scope & speed tag */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs space-y-1 mb-2.5">
                    <span className="text-[10px] font-bold text-indigo-700 block">{rev.categoryLabelAr}</span>
                    <p className="text-slate-800 font-bold leading-snug line-clamp-1">{rev.projectTitle}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>تم الإنجاز في {rev.actualDays} أيام (الموعد: {rev.promisedDays} أيام)</span>
                      </span>
                      {rev.completedAheadOfTime && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          أسرع من الموعد
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.commentAr}"
                  </p>
                </div>

                {/* Bottom badges & tags */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>فحص حكومي معتمد من أول زيارة</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {rev.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="bg-slate-200/70 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. AI Performance & SLA Optimization Recommendations (توصيات سبّاق لتحسين سرعة الإنجاز والترتيب) */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-6 text-white border border-indigo-900/50 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">توصيات سبّاق الذكية لتعزيز تصنيف المورد وسرعة الإنجاز</h3>
              <p className="text-xs text-slate-300">خطوات تشغيلية لزيادة معدل الفوز بالعقود والحفاظ على الدرع البلاتيني</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            معدل استحقاق الترقية: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>الرد على العروض في أقل من ساعتين</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تقديم عروض الأسعار خلال أول 120 دقيقة يرفع احتمالية ترسية العقد بنسبة <strong>+43%</strong> لدى المنشآت التي تواجه زيارات تفتيش وشيكة.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
              <span>إرفاق خطابات الضمان والشهادات مسبقاً</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إرفاق مسودة خطاب الاعتماد المعتمد لدى الجهة الرقابية يزيد من ثقة العميل ويقلل مدة مراجعة العرض إلى أقل من 24 ساعة.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Users className="w-4 h-4" />
              <span>تفعيل باقات الصيانة السنوية الدورية</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              عرض عقود الصيانة الدورية الآلية يرفع نسبة ولاء العملاء وتكرار الشراء إلى أكثر من <strong>85%</strong> مع دخل متكرر مضمون.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
