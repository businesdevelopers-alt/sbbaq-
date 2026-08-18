import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  Building2,
  Filter,
  CheckCircle2,
  HelpCircle,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Scale
} from 'lucide-react';
import { Establishment, License, Branch } from '../types';
import { formatSAR } from '../utils/complianceEngine';

export interface GovernmentSpendingTrendsCardProps {
  activeEstablishment: Establishment;
  licenses: License[];
  branches?: Branch[];
  onNavigateToTab?: (tab: string) => void;
  showToast?: (msg: string) => void;
}

interface MonthlySpendingPoint {
  monthKey: string;
  monthName: string;
  quarter: string;
  actualSpending: number;     // الإنفاق الحكومي الفعلي
  estimatedBudget: number;    // الرسوم التقديرية والمخططة
  sabbaqSavings: number;      // الوفورات المحققة عبر الرصد الاستباقي
  variance: number;           // الفارق (الفعلي - التقديري)
  variancePercent: number;    // نسبة الانحراف %
  status: 'under_budget' | 'on_track' | 'over_budget';
  authorityBreakdown: {
    balady: number;
    civilDefense: number;
    commerce: number;
    laborQiwa: number;
    zatca: number;
    other: number;
  };
  keyTransactions: string[];
}

export const GovernmentSpendingTrendsCard: React.FC<GovernmentSpendingTrendsCardProps> = ({
  activeEstablishment,
  licenses,
  branches = [],
  onNavigateToTab,
  showToast
}) => {
  // View mode filters
  const [chartViewType, setChartViewType] = useState<'composed' | 'bars' | 'lines'>('composed');
  const [selectedAuthorityFilter, setSelectedAuthorityFilter] = useState<'all' | 'balady' | 'civilDefense' | 'commerce' | 'laborQiwa' | 'zatca'>('all');
  const [showSavingsLayer, setShowSavingsLayer] = useState<boolean>(true);
  const [activeMetricView, setActiveMetricView] = useState<'spending_vs_estimate' | 'variance' | 'cumulative'>('spending_vs_estimate');
  const [planningTolerance, setPlanningTolerance] = useState<number>(0); // -10% to +10% adjustment

  // 12 Months history dataset calculation based on active establishment's licenses and profile
  const monthlyTrendsData: MonthlySpendingPoint[] = useMemo(() => {
    const estLicenses = licenses.filter(l => l.establishmentId === activeEstablishment.id);
    const totalEstGov = estLicenses.reduce((sum, l) => sum + (l.costGov || 1200), 0);
    const avgMonthlyBase = totalEstGov > 0 ? totalEstGov / 12 : 2800;

    // Past 12 Months definitions (Aug 2025 - Jul 2026 / recent historical fiscal year)
    const monthConfigs = [
      { key: '2025-08', name: 'أغسطس 2025', q: 'Q3 2025', factorActual: 1.15, factorEst: 1.0, txs: ['تجديد رخصة بلدية الفرع الرئيسي', 'رسوم السجل التجاري'] },
      { key: '2025-09', name: 'سبتمبر 2025', q: 'Q3 2025', factorActual: 0.85, factorEst: 0.9, txs: ['رسوم اشتراك الغرفة التجارية', 'تحديث بيانات قوى'] },
      { key: '2025-10', name: 'أكتوبر 2025', q: 'Q4 2025', factorActual: 1.30, factorEst: 1.1, txs: ['تصاريح الدفاع المدني - سلامة', 'شهادات التوافق البيئي'] },
      { key: '2025-11', name: 'نوفمبر 2025', q: 'Q4 2025', factorActual: 0.70, factorEst: 0.8, txs: ['تجديد تراخيص لوحات إعلانية', 'اشتراك منصة بلدي'] },
      { key: '2025-12', name: 'ديسمبر 2025', q: 'Q4 2025', factorActual: 1.65, factorEst: 1.4, txs: ['الإقفال السنوي ورسوم الزكاة والدخل', 'تجديد عقود إيجار موثقة'] },
      { key: '2026-01', name: 'يناير 2026', q: 'Q1 2026', factorActual: 1.25, factorEst: 1.2, txs: ['تجديد رخص الأنشطة التجارية', 'رسوم اشتراك مقيم السنوية'] },
      { key: '2026-02', name: 'فبراير 2026', q: 'Q1 2026', factorActual: 0.90, factorEst: 0.95, txs: ['تحديث السجل التجاري الفرعي', 'فحص السلامة الوقائية'] },
      { key: '2026-03', name: 'مارس 2026', q: 'Q1 2026', factorActual: 1.40, factorEst: 1.25, txs: ['شهادات مطابقة المواصفات', 'تراخيص موسمية وتشغيلية'] },
      { key: '2026-04', name: 'أبريل 2026', q: 'Q2 2026', factorActual: 0.80, factorEst: 0.85, txs: ['رسوم الإفصاح المالي', 'سداد مستحقات منصة قوى'] },
      { key: '2026-05', name: 'مايو 2026', q: 'Q2 2026', factorActual: 1.05, factorEst: 1.0, txs: ['تجديد رخصة الدفاع المدني', 'رسوم تجديد توثيق العقود'] },
      { key: '2026-06', name: 'يونيو 2026', q: 'Q2 2026', factorActual: 1.50, factorEst: 1.35, txs: ['تجديد السجلات وتحديث الهيكل', 'رسوم إشغال الأرصفة واللوحات'] },
      { key: '2026-07', name: 'يوليو 2026', q: 'Q3 2026', factorActual: 0.95, factorEst: 1.0, txs: ['مراجعة الرخص المهنية', 'اشتراكات سنوية تنظيمية'] }
    ];

    let runningActual = 0;
    let runningEstimated = 0;

    return monthConfigs.map(m => {
      // Calculate adjusted baseline
      const baseEstimate = Math.round(avgMonthlyBase * m.factorEst * (1 + planningTolerance / 100));
      const baseActual = Math.round(avgMonthlyBase * m.factorActual);

      // Filter by authority if selected
      let multiplier = 1;
      if (selectedAuthorityFilter === 'balady') multiplier = 0.38;
      else if (selectedAuthorityFilter === 'civilDefense') multiplier = 0.22;
      else if (selectedAuthorityFilter === 'commerce') multiplier = 0.18;
      else if (selectedAuthorityFilter === 'laborQiwa') multiplier = 0.12;
      else if (selectedAuthorityFilter === 'zatca') multiplier = 0.10;

      const estimatedBudget = Math.round(baseEstimate * multiplier);
      const actualSpending = Math.round(baseActual * multiplier);
      const variance = actualSpending - estimatedBudget;
      const variancePercent = estimatedBudget > 0 ? Math.round((variance / estimatedBudget) * 100) : 0;
      const sabbaqSavings = Math.round(actualSpending * 0.18); // estimated 18% savings from avoiding penalty fines

      runningActual += actualSpending;
      runningEstimated += estimatedBudget;

      let status: 'under_budget' | 'on_track' | 'over_budget' = 'on_track';
      if (variancePercent < -5) status = 'under_budget';
      else if (variancePercent > 8) status = 'over_budget';

      return {
        monthKey: m.key,
        monthName: m.name,
        quarter: m.q,
        actualSpending,
        estimatedBudget,
        sabbaqSavings,
        variance,
        variancePercent,
        status,
        authorityBreakdown: {
          balady: Math.round(actualSpending * 0.38),
          civilDefense: Math.round(actualSpending * 0.22),
          commerce: Math.round(actualSpending * 0.18),
          laborQiwa: Math.round(actualSpending * 0.12),
          zatca: Math.round(actualSpending * 0.10),
          other: 0
        },
        keyTransactions: m.txs
      };
    });
  }, [licenses, activeEstablishment.id, selectedAuthorityFilter, planningTolerance]);

  // Aggregate Annual Statistics
  const aggregateMetrics = useMemo(() => {
    const totalActual = monthlyTrendsData.reduce((sum, d) => sum + d.actualSpending, 0);
    const totalEstimated = monthlyTrendsData.reduce((sum, d) => sum + d.estimatedBudget, 0);
    const totalSavings = monthlyTrendsData.reduce((sum, d) => sum + d.sabbaqSavings, 0);
    const totalVariance = totalActual - totalEstimated;
    const totalVariancePercent = totalEstimated > 0 ? Math.round((totalVariance / totalEstimated) * 100) : 0;

    // Peak Month
    let peakMonth = monthlyTrendsData[0];
    monthlyTrendsData.forEach(d => {
      if (d.actualSpending > peakMonth.actualSpending) {
        peakMonth = d;
      }
    });

    // Budget Adherence Score (100% minus deviation)
    const avgDeviation = monthlyTrendsData.reduce((sum, d) => sum + Math.abs(d.variancePercent), 0) / monthlyTrendsData.length;
    const adherenceScore = Math.max(0, Math.min(100, Math.round(100 - avgDeviation)));

    return {
      totalActual,
      totalEstimated,
      totalSavings,
      totalVariance,
      totalVariancePercent,
      peakMonth,
      adherenceScore
    };
  }, [monthlyTrendsData]);

  // Chart data formatting based on active metric view
  const chartDisplayData = useMemo(() => {
    let cumActual = 0;
    let cumEstimated = 0;

    return monthlyTrendsData.map(d => {
      cumActual += d.actualSpending;
      cumEstimated += d.estimatedBudget;

      return {
        ...d,
        displayActual: activeMetricView === 'cumulative' ? cumActual : d.actualSpending,
        displayEstimated: activeMetricView === 'cumulative' ? cumEstimated : d.estimatedBudget,
        displayVariance: d.variance
      };
    });
  }, [monthlyTrendsData, activeMetricView]);

  // Custom Recharts Tooltip
  const CustomSpendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: MonthlySpendingPoint = payload[0].payload;
      const isOver = dataPoint.variance > 0;

      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-700/80 shadow-2xl text-xs space-y-3 font-['Cairo'] min-w-[260px] animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="font-extrabold text-sm text-teal-300 block">{dataPoint.monthName}</span>
              <span className="text-[10px] text-slate-400 font-medium">{dataPoint.quarter} • {activeEstablishment.name}</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              dataPoint.status === 'under_budget' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : dataPoint.status === 'on_track' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {dataPoint.status === 'under_budget' ? 'وفر في الميزانية' : dataPoint.status === 'on_track' ? 'مطابق للتقديرات' : 'تجاوز في التقدير'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                <span>الإنفاق الفعلي المسجل:</span>
              </span>
              <span className="font-black font-mono text-teal-300 text-xs">
                {formatSAR(dataPoint.actualSpending)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block border border-dashed border-indigo-200" />
                <span>الرسوم التقديرية المخططة:</span>
              </span>
              <span className="font-bold font-mono text-slate-300 text-xs">
                {formatSAR(dataPoint.estimatedBudget)}
              </span>
            </div>

            {showSavingsLayer && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                  <span>وفورات الرصد الوقائي (سبّاق):</span>
                </span>
                <span className="font-bold font-mono text-emerald-400 text-xs">
                  +{formatSAR(dataPoint.sabbaqSavings)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-bold">
              <span className="text-slate-300">الفارق المالي (الانحراف):</span>
              <span className={`font-mono text-xs flex items-center gap-1 ${
                isOver ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {isOver ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isOver ? '+' : ''}{formatSAR(dataPoint.variance)} ({dataPoint.variancePercent > 0 ? `+${dataPoint.variancePercent}%` : `${dataPoint.variancePercent}%`})</span>
              </span>
            </div>
          </div>

          {/* Key transactions breakdown for month */}
          {dataPoint.keyTransactions && dataPoint.keyTransactions.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">أبرز العمليات والتراخيص في هذا الشهر:</span>
              <ul className="space-y-0.5 text-[10px] text-slate-300 list-disc list-inside">
                {dataPoint.keyTransactions.map((tx, idx) => (
                  <li key={idx} className="truncate">{tx}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 font-['Cairo'] relative overflow-hidden">
      
      {/* 1. Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 shadow-xs">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                اتجاهات الإنفاق الحكومي (الـ 12 شهراً الماضية)
              </h2>
              <span className="bg-teal-50 text-teal-800 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>مقارنة الرسوم التقديرية بالإنفاق الفعلي</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              تحليل تفاعلي متقدم يقارن الرسوم الحكومية المسددة فعلياً بالميزانية التقديرية المخططة لمساعدة الإدارة المالية في التنبؤ بالنفقات السنوية وتخصيص السيولة بدقة.
            </p>
          </div>
        </div>

        {/* View Mode & Chart Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChartViewType('composed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartViewType === 'composed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مدمج (أعمدة + مساحة)
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('bars')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartViewType === 'bars'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أعمدة مقارنة
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('lines')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartViewType === 'lines'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              خطوط اتجاه
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Actual Gov Spending */}
        <div className="bg-gradient-to-br from-teal-50/70 via-teal-50/30 to-white p-4 rounded-2xl border border-teal-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">إجمالي الإنفاق الفعلي (12 شهر)</span>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-900 font-mono">
            {formatSAR(aggregateMetrics.totalActual)}
          </div>
          <div className="text-[11px] text-teal-700 flex items-center gap-1 font-medium">
            <span>متوسط شهري:</span>
            <span className="font-bold font-mono">{formatSAR(Math.round(aggregateMetrics.totalActual / 12))}</span>
          </div>
        </div>

        {/* Total Estimated Budget */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-white p-4 rounded-2xl border border-indigo-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">الميزانية التقديرية المخططة</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
            {formatSAR(aggregateMetrics.totalEstimated)}
          </div>
          <div className="text-[11px] text-indigo-700 flex items-center gap-1 font-medium">
            <span>التباين السنوي:</span>
            <span className={`font-bold font-mono ${
              aggregateMetrics.totalVariance > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {aggregateMetrics.totalVariance > 0 ? `+${aggregateMetrics.totalVariancePercent}%` : `${aggregateMetrics.totalVariancePercent}%`}
            </span>
          </div>
        </div>

        {/* Peak Spending Month */}
        <div className="bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">ذروة الإنفاق السنوي</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950">
            {aggregateMetrics.peakMonth.monthName}
          </div>
          <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <span>المبلغ:</span>
            <span className="font-bold font-mono">{formatSAR(aggregateMetrics.peakMonth.actualSpending)}</span>
            <span className="text-[10px]">({aggregateMetrics.peakMonth.quarter})</span>
          </div>
        </div>

        {/* Budget Adherence & Prevented Penalties */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-emerald-50/30 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">مؤشر الانضباط والتوفير</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
            {aggregateMetrics.adherenceScore}%
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>وفر محقق:</span>
            <span className="font-bold font-mono">{formatSAR(aggregateMetrics.totalSavings)}</span>
          </div>
        </div>

      </div>

      {/* 3. Interactive Filters & Scenario Toolbar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Authority Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>تصفية حسب الجهة:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedAuthorityFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAuthorityFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                كافة الجهات الحكومية
              </button>

              <button
                type="button"
                onClick={() => setSelectedAuthorityFilter('balady')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAuthorityFilter === 'balady'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                البلديات والإسكان (بلدي)
              </button>

              <button
                type="button"
                onClick={() => setSelectedAuthorityFilter('civilDefense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAuthorityFilter === 'civilDefense'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                الدفاع المدني (سلامة)
              </button>

              <button
                type="button"
                onClick={() => setSelectedAuthorityFilter('commerce')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAuthorityFilter === 'commerce'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                وزارة التجارة والغرف
              </button>

              <button
                type="button"
                onClick={() => setSelectedAuthorityFilter('laborQiwa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAuthorityFilter === 'laborQiwa'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                الموارد البشرية (قوى)
              </button>
            </div>
          </div>

          {/* Metric View Switcher */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMetricView('spending_vs_estimate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMetricView === 'spending_vs_estimate'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              شهري فوري
            </button>

            <button
              type="button"
              onClick={() => setActiveMetricView('cumulative')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMetricView === 'cumulative'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              تراكمي تصاعدي
            </button>
          </div>

        </div>

        {/* Tolerance / Inflation planning slider */}
        <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span>محاكاة تغير الرسوم السنوية للعام القادم:</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-15"
                max="15"
                step="5"
                value={planningTolerance}
                onChange={(e) => setPlanningTolerance(Number(e.target.value))}
                className="w-28 accent-teal-600 cursor-pointer"
              />
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                planningTolerance > 0 ? 'bg-amber-100 text-amber-900'
                  : planningTolerance < 0 ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {planningTolerance > 0 ? `+${planningTolerance}% رسوم إضافية` : planningTolerance < 0 ? `${planningTolerance}% ترشيد وتخفيض` : 'الميزانية القياسية (0%)'}
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none text-[11px] font-bold">
            <input
              type="checkbox"
              checked={showSavingsLayer}
              onChange={(e) => setShowSavingsLayer(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600 w-4 h-4 cursor-pointer"
            />
            <span>إظهار شريط وفورات التجديد الوقائي (تجنب الغرامات)</span>
          </label>
        </div>
      </div>

      {/* 4. Primary Recharts Interactive Chart Area */}
      <div className="h-[360px] sm:h-[400px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartDisplayData}
            margin={{ top: 15, right: 10, left: 10, bottom: 25 }}
          >
            <defs>
              {/* Gradient for Actual Spending Area */}
              <linearGradient id="actualSpendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
              {/* Gradient for Estimated Budget Area */}
              <linearGradient id="estimatedBudgetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis
              dataKey="monthName"
              tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Cairo', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={45}
            />

            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k ر.س`}
              orientation="right"
            />

            <Tooltip content={<CustomSpendingTooltip />} />

            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: 15, fontFamily: 'Cairo', fontSize: 12, fontWeight: 700 }}
            />

            {/* Reference Average Line */}
            <ReferenceLine
              y={Math.round(aggregateMetrics.totalActual / 12)}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: `متوسط الإنفاق الشهري (${formatSAR(Math.round(aggregateMetrics.totalActual / 12))})`,
                fill: '#64748b',
                fontSize: 10,
                position: 'insideTopLeft'
              }}
            />

            {/* Rendering based on selected chart type */}
            {chartViewType === 'composed' && (
              <>
                <Area
                  type="monotone"
                  dataKey="displayEstimated"
                  name="الرسوم التقديرية المخططة"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#estimatedBudgetGradient)"
                />
                <Bar
                  dataKey="displayActual"
                  name="الإنفاق الحكومي الفعلي"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                {showSavingsLayer && (
                  <Line
                    type="monotone"
                    dataKey="sabbaqSavings"
                    name="وفورات الرصد الاستباقي"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                )}
              </>
            )}

            {chartViewType === 'bars' && (
              <>
                <Bar
                  dataKey="displayActual"
                  name="الإنفاق الحكومي الفعلي"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="displayEstimated"
                  name="الرسوم التقديرية المخططة"
                  fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                {showSavingsLayer && (
                  <Bar
                    dataKey="sabbaqSavings"
                    name="وفورات الرصد الاستباقي"
                    fill="#34d399"
                    radius={[6, 6, 0, 0]}
                    barSize={12}
                  />
                )}
              </>
            )}

            {chartViewType === 'lines' && (
              <>
                <Line
                  type="monotone"
                  dataKey="displayActual"
                  name="الإنفاق الحكومي الفعلي"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ fill: '#0d9488', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="displayEstimated"
                  name="الرسوم التقديرية المخططة"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6366f1', r: 4 }}
                />
                {showSavingsLayer && (
                  <Line
                    type="monotone"
                    dataKey="sabbaqSavings"
                    name="وفورات الرصد الاستباقي"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                )}
              </>
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Actionable Financial Planning Advisory Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h4 className="font-black text-sm text-teal-200">
              توصيات التخطيط المالي للعام القادم (2026 / 2027)
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            يُظهر التحليل أن ذروة التدفقات النقدية تتركز في شهري <strong className="text-white">{aggregateMetrics.peakMonth.monthName}</strong> و <strong className="text-white">ديسمبر</strong>. يُوصى باقتطاع احتياطي سيولة شهري قدره <strong className="text-teal-300 font-mono">{formatSAR(Math.round(aggregateMetrics.totalActual / 12))}</strong> لتفادي أي أثر مفاجئ على رأس المال العامل.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('smart_alerts')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>جدولة التجديدات الاستباقية</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
