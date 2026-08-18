import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Download,
  Printer,
  Sparkles,
  Zap,
  Clock,
  Filter,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Coins,
  Scale,
  Landmark,
  Briefcase,
  Users,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Establishment, License, Branch } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface CumulativeFeesPlanningChartProps {
  establishments: Establishment[];
  activeEstablishment: Establishment;
  licenses: License[];
  branches?: Branch[];
  onSelectEstablishment?: (est: Establishment) => void;
  onInstantRenewLicense?: (license: License) => void;
  onNavigateToTab?: (tab: string) => void;
}

// 12 Months timeline definition starting from current fiscal horizon (Aug 2026 - Jul 2027)
interface MonthFiscalData {
  monthIndex: number;
  monthKey: string; // e.g. "2026-08"
  monthNameAr: string; // e.g. "أغسطس 2026"
  quarter: string; // "Q3 2026"
  // Breakdown by authority for the active establishment
  baladyFees: number;
  salamahFees: number;
  commerceFees: number;
  laborQiwaFees: number;
  muqeemPassportsFees: number;
  zatcaTaxFees: number;
  totalMonthlyFees: number;
  cumulativeFees: number;
  cumulativeWithPenalties: number;
  expiringLicensesCount: number;
  expiringLicensesNames: string[];
  isPeakMonth: boolean;
  // Multi-establishment cumulative metrics
  est1Cumulative?: number;
  est2Cumulative?: number;
  est3Cumulative?: number;
  allEstTotalCumulative?: number;
}

export const CumulativeFeesPlanningChart: React.FC<CumulativeFeesPlanningChartProps> = ({
  establishments,
  activeEstablishment,
  licenses,
  branches = [],
  onSelectEstablishment,
  onInstantRenewLicense,
  onNavigateToTab,
}) => {
  // Mode: single establishment deep dive vs. all establishments multi-comparison
  const [viewMode, setViewMode] = useState<'single' | 'multi_compare' | 'budget_scenario'>('single');
  const [selectedEstId, setSelectedEstId] = useState<string>(activeEstablishment.id);
  
  // Custom Budget Ceiling for Financial Planning
  const [customBudgetCeiling, setCustomBudgetCeiling] = useState<number>(35000);
  const [showBudgetReference, setShowBudgetReference] = useState<boolean>(true);
  
  // Expansion Scenario Simulation Toggles
  const [includeExpansionBranch, setIncludeExpansionBranch] = useState<boolean>(false);
  const [additionalHiresCount, setAdditionalHiresCount] = useState<number>(0);
  const [chartType, setChartType] = useState<'area' | 'bar_stacked' | 'comparison'>('area');
  const [activeQuarterFilter, setActiveQuarterFilter] = useState<'all' | 'Q3_2026' | 'Q4_2026' | 'Q1_2027' | 'Q2_2027' | 'Q3_2027'>('all');

  const currentEst = useMemo(() => {
    return establishments.find(e => e.id === selectedEstId) || activeEstablishment;
  }, [establishments, selectedEstId, activeEstablishment]);

  // Current Establishment licenses
  const currentEstLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === currentEst.id);
  }, [licenses, currentEst.id]);

  // Generate 12-Month Financial Projection Model
  const fiscalProjection = useMemo(() => {
    const monthsMeta = [
      { key: '2026-08', nameAr: 'أغسطس 2026', quarter: 'Q3 2026', qKey: 'Q3_2026', monthNum: 8, year: 2026 },
      { key: '2026-09', nameAr: 'سبتمبر 2026', quarter: 'Q3 2026', qKey: 'Q3_2026', monthNum: 9, year: 2026 },
      { key: '2026-10', nameAr: 'أكتوبر 2026', quarter: 'Q4 2026', qKey: 'Q4_2026', monthNum: 10, year: 2026 },
      { key: '2026-11', nameAr: 'نوفمبر 2026', quarter: 'Q4 2026', qKey: 'Q4_2026', monthNum: 11, year: 2026 },
      { key: '2026-12', nameAr: 'ديسمبر 2026', quarter: 'Q4 2026', qKey: 'Q4_2026', monthNum: 12, year: 2026 },
      { key: '2027-01', nameAr: 'يناير 2027', quarter: 'Q1 2027', qKey: 'Q1_2027', monthNum: 1, year: 2027 },
      { key: '2027-02', nameAr: 'فبراير 2027', quarter: 'Q1 2027', qKey: 'Q1_2027', monthNum: 2, year: 2027 },
      { key: '2027-03', nameAr: 'مارس 2027', quarter: 'Q1 2027', qKey: 'Q1_2027', monthNum: 3, year: 2027 },
      { key: '2027-04', nameAr: 'أبريل 2027', quarter: 'Q2 2027', qKey: 'Q2_2027', monthNum: 4, year: 2027 },
      { key: '2027-05', nameAr: 'مايو 2027', quarter: 'Q2 2027', qKey: 'Q2_2027', monthNum: 5, year: 2027 },
      { key: '2027-06', nameAr: 'يونيو 2027', quarter: 'Q2 2027', qKey: 'Q2_2027', monthNum: 6, year: 2027 },
      { key: '2027-07', nameAr: 'يوليو 2027', quarter: 'Q3 2027', qKey: 'Q3_2027', monthNum: 7, year: 2027 },
    ];

    let runningCumulative = 0;
    let runningCumulativePenalty = 0;

    // Track for all establishments
    let est1Running = 0;
    let est2Running = 0;
    let est3Running = 0;
    let allEstRunning = 0;

    // Pre-calculate monthly license expiries for each establishment
    const getEstMonthlyLicenses = (estId: string, monthKey: string) => {
      const estLics = licenses.filter(l => l.establishmentId === estId);
      return estLics.filter(lic => {
        if (!lic.expiryDate) return false;
        return lic.expiryDate.startsWith(monthKey);
      });
    };

    // Calculate baseline platform recurring fees distribution
    const getPlatformRecurringFees = (est: Establishment, monthIndex: number) => {
      let balady = 0;
      let salamah = 0;
      let commerce = 0;
      let labor = 0;
      let muqeem = 0;
      let zatca = 0;

      const totalStaff = (est.totalEmployees || 10) + (est.id === currentEst.id ? additionalHiresCount : 0);
      const foreignStaff = (est.foreignEmployees || 6) + (est.id === currentEst.id ? Math.round(additionalHiresCount * 0.7) : 0);

      // Annual Qiwa platform subscription (e.g. Month 1 or Month 6)
      if (monthIndex === 0 || monthIndex === 6) {
        labor += totalStaff > 5 ? 1265 : 700;
      }
      // Muqeem platform annual subscription (e.g. Month 2)
      if (monthIndex === 1) {
        muqeem += foreignStaff > 5 ? 1150 : 550;
      }
      // Mudad wages protection system
      if (monthIndex === 3 || monthIndex === 9) {
        labor += 287.5; // Half-yearly madad
      }
      // ZATCA e-invoicing compliance audit / quarterly filing support
      if (monthIndex === 2 || monthIndex === 5 || monthIndex === 8 || monthIndex === 11) {
        zatca += 500;
      }
      // Labor Work Permit / Iqama renewal distribution (Amortized periodic government cost)
      if (foreignStaff > 0) {
        // Average 1-2 workers renewal per quarter (approx 2400 SAR per renewal)
        if (monthIndex % 2 === 0) {
          labor += Math.min(foreignStaff * 400, 3600);
        }
      }

      // Add simulated expansion branch cost in Month 3 (Nov 2026)
      if (includeExpansionBranch && est.id === currentEst.id && monthIndex === 3) {
        balady += 6500; // New Balady license & signboard
        salamah += 1800; // New Civil defense certificate
        commerce += 1200; // Branch CR & Chamber
      }

      return { balady, salamah, commerce, labor, muqeem, zatca };
    };

    const data: MonthFiscalData[] = monthsMeta.map((m, idx) => {
      // 1. Matched licenses expiring in this month for active selected establishment
      const monthLics = getEstMonthlyLicenses(currentEst.id, m.key);
      let licBalady = 0;
      let licSalamah = 0;
      let licCommerce = 0;
      let licLabor = 0;
      let licMuqeem = 0;
      let licZatca = 0;
      const expiringNames: string[] = [];

      monthLics.forEach(lic => {
        expiringNames.push(lic.name);
        const cost = lic.costGov || 1000;
        const auth = (lic.authority || '').toLowerCase();
        if (auth.includes('بلدي') || auth.includes('أمانة') || lic.name.includes('بلدي')) {
          licBalady += cost;
        } else if (auth.includes('دفاع') || auth.includes('سلامة')) {
          licSalamah += cost;
        } else if (auth.includes('تجارة') || auth.includes('غرفة')) {
          licCommerce += cost;
        } else if (auth.includes('قوى') || auth.includes('موارد') || auth.includes('عمل')) {
          licLabor += cost;
        } else if (auth.includes('مقيم') || auth.includes('جوازات')) {
          licMuqeem += cost;
        } else {
          licZatca += cost;
        }
      });

      // 2. Add recurring platform & periodic obligations
      const recurring = getPlatformRecurringFees(currentEst, idx);

      const baladyFees = licBalady + recurring.balady;
      const salamahFees = licSalamah + recurring.salamah;
      const commerceFees = licCommerce + recurring.commerce;
      const laborQiwaFees = licLabor + recurring.labor;
      const muqeemPassportsFees = licMuqeem + recurring.muqeem;
      const zatcaTaxFees = licZatca + recurring.zatca;

      const totalMonthlyFees = baladyFees + salamahFees + commerceFees + laborQiwaFees + muqeemPassportsFees + zatcaTaxFees;
      runningCumulative += totalMonthlyFees;

      // Penalty scenario calculation (if unrenewed, penalties accumulate at 1.8x - 2.5x)
      const penaltyMultiplier = 1 + (idx * 0.12);
      runningCumulativePenalty += Math.round(totalMonthlyFees * penaltyMultiplier + (idx > 1 ? 1500 : 0));

      // Calculate for all establishments for multi-comparison
      const est1Lics = getEstMonthlyLicenses('est-1', m.key);
      const est1Cost = est1Lics.reduce((sum, l) => sum + (l.costGov || 1000), 0) + (idx % 2 === 0 ? 1800 : 800);
      est1Running += est1Cost;

      const est2Lics = getEstMonthlyLicenses('est-2', m.key);
      const est2Cost = est2Lics.reduce((sum, l) => sum + (l.costGov || 800), 0) + (idx % 3 === 0 ? 1200 : 400);
      est2Running += est2Cost;

      const est3Lics = getEstMonthlyLicenses('est-3', m.key);
      const est3Cost = est3Lics.reduce((sum, l) => sum + (l.costGov || 1500), 0) + (idx % 2 === 0 ? 2500 : 1100);
      est3Running += est3Cost;

      allEstRunning += (est1Cost + est2Cost + est3Cost);

      return {
        monthIndex: idx,
        monthKey: m.key,
        monthNameAr: m.nameAr,
        quarter: m.quarter,
        baladyFees,
        salamahFees,
        commerceFees,
        laborQiwaFees,
        muqeemPassportsFees,
        zatcaTaxFees,
        totalMonthlyFees,
        cumulativeFees: runningCumulative,
        cumulativeWithPenalties: runningCumulativePenalty,
        expiringLicensesCount: monthLics.length,
        expiringLicensesNames: expiringNames,
        isPeakMonth: false, // will mark after max calculation
        est1Cumulative: est1Running,
        est2Cumulative: est2Running,
        est3Cumulative: est3Running,
        allEstTotalCumulative: allEstRunning,
      };
    });

    // Mark peak months
    const maxMonthly = Math.max(...data.map(d => d.totalMonthlyFees));
    data.forEach(d => {
      if (d.totalMonthlyFees === maxMonthly && maxMonthly > 0) {
        d.isPeakMonth = true;
      }
    });

    return data;
  }, [currentEst, licenses, includeExpansionBranch, additionalHiresCount]);

  // Financial KPIs Calculations
  const metrics = useMemo(() => {
    const totalAnnualGovFees = fiscalProjection[fiscalProjection.length - 1]?.cumulativeFees || 0;
    const avgMonthlyFees = Math.round(totalAnnualGovFees / 12);
    
    // Find peak month
    const peak = fiscalProjection.reduce((max, curr) => curr.totalMonthlyFees > max.totalMonthlyFees ? curr : max, fiscalProjection[0]);
    
    // Category distribution totals
    const totalBalady = fiscalProjection.reduce((s, m) => s + m.baladyFees, 0);
    const totalSalamah = fiscalProjection.reduce((s, m) => s + m.salamahFees, 0);
    const totalCommerce = fiscalProjection.reduce((s, m) => s + m.commerceFees, 0);
    const totalLabor = fiscalProjection.reduce((s, m) => s + m.laborQiwaFees, 0);
    const totalMuqeem = fiscalProjection.reduce((s, m) => s + m.muqeemPassportsFees, 0);
    const totalZatca = fiscalProjection.reduce((s, m) => s + m.zatcaTaxFees, 0);

    // Quarter Breakdown
    const q3_2026 = fiscalProjection.filter(m => m.quarter === 'Q3 2026').reduce((s, m) => s + m.totalMonthlyFees, 0);
    const q4_2026 = fiscalProjection.filter(m => m.quarter === 'Q4 2026').reduce((s, m) => s + m.totalMonthlyFees, 0);
    const q1_2027 = fiscalProjection.filter(m => m.quarter === 'Q1 2027').reduce((s, m) => s + m.totalMonthlyFees, 0);
    const q2_2027 = fiscalProjection.filter(m => m.quarter === 'Q2 2027').reduce((s, m) => s + m.totalMonthlyFees, 0);
    const q3_2027 = fiscalProjection.filter(m => m.quarter === 'Q3 2027').reduce((s, m) => s + m.totalMonthlyFees, 0);

    // Recommended Liquidity Reserve Buffer (25% buffer on peak quarter)
    const maxQuarter = Math.max(q3_2026, q4_2026, q1_2027, q2_2027);
    const recommendedBuffer = Math.round(maxQuarter * 1.25);

    // Total Projected Penalties if unmanaged
    const totalWithPenalties = fiscalProjection[fiscalProjection.length - 1]?.cumulativeWithPenalties || 0;
    const preventedPenaltySavings = totalWithPenalties - totalAnnualGovFees;

    // Budget variance
    const budgetVariance = customBudgetCeiling - totalAnnualGovFees;
    const isUnderBudget = budgetVariance >= 0;

    return {
      totalAnnualGovFees,
      avgMonthlyFees,
      peakMonthName: peak?.monthNameAr || 'نوفمبر 2026',
      peakMonthAmount: peak?.totalMonthlyFees || 0,
      totalBalady,
      totalSalamah,
      totalCommerce,
      totalLabor,
      totalMuqeem,
      totalZatca,
      quarters: { q3_2026, q4_2026, q1_2027, q2_2027, q3_2027 },
      recommendedBuffer,
      preventedPenaltySavings,
      budgetVariance,
      isUnderBudget,
    };
  }, [fiscalProjection, customBudgetCeiling]);

  // Custom Chart Tooltip
  const CustomFiscalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthFiscalData = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-right min-w-[260px] space-y-3 font-['Cairo'] text-xs backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.monthNameAr} ({data.quarter})</span>
            </span>
            {data.isPeakMonth && (
              <span className="bg-rose-500/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/40">
                ذروة استحقاق
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">الرسوم المتراكمة حتى هذا الشهر:</span>
              <strong className="text-base font-extrabold text-emerald-400">
                {formatSAR(data.cumulativeFees)}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>الرسوم المستحقة خلال الشهر فقط:</span>
              <strong className="text-sm font-bold text-amber-300">
                {formatSAR(data.totalMonthlyFees)}
              </strong>
            </div>

            {/* Authority Breakdown */}
            <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px]">
              {data.baladyFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>🏛️ البلديات والإسكان (بلدي):</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.baladyFees)}</span>
                </div>
              )}
              {data.salamahFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>🚒 الدفاع المدني (سلامة):</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.salamahFees)}</span>
                </div>
              )}
              {data.commerceFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>💼 التجارة والغرفة التجارية:</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.commerceFees)}</span>
                </div>
              )}
              {data.laborQiwaFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>👥 العمل ومنصة قوى ومدد:</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.laborQiwaFees)}</span>
                </div>
              )}
              {data.muqeemPassportsFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>🛂 الجوازات ومنصة مقيم:</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.muqeemPassportsFees)}</span>
                </div>
              )}
              {data.zatcaTaxFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>📊 هيئة الزكاة والضريبة:</span>
                  <span className="text-slate-200 font-medium">{formatSAR(data.zatcaTaxFees)}</span>
                </div>
              )}
            </div>

            {data.expiringLicensesCount > 0 && (
              <div className="border-t border-slate-800 pt-2 text-[10px] text-amber-300">
                <span>🔔 تراخيص تستحق التجديد ({data.expiringLicensesCount}): </span>
                <span className="text-slate-300">{data.expiringLicensesNames.join('، ')}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>المخطط المالي التنبؤي والميزانية السنوية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cairo'] tracking-tight">
              الرسوم الحكومية التقديرية المتراكمة على مدار السنة المالية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              رسم بياني مالي تفاعلي يستعرض التدفقات النقدية والرسوم الحكومية المتراكمة المتوقعة لكل منشأة شهرياً، لتمكين صاحب العمل من التخطيط المالي وتخصيص الميزانية بدقة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Establishment Switcher */}
            <div className="bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400 mr-1" />
              <select
                value={selectedEstId}
                onChange={(e) => {
                  setSelectedEstId(e.target.value);
                  const found = establishments.find(est => est.id === e.target.value);
                  if (found && onSelectEstablishment) onSelectEstablishment(found);
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {establishments.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="طباعة تقرير التخطيط المالي"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </button>
          </div>
        </div>
        <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Primary KPI Cards for Financial Planning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Annual Cumulative Government Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>إجمالي الميزانية الحكومية السنوية</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
              12 شهراً
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Cairo']">
            {formatSAR(metrics.totalAnnualGovFees)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-medium">
            تشمل كافة الرخص البلدية والسلامة والغرفة ومنصات قوى ومقيم
          </span>
        </div>

        {/* Card 2: Average Monthly Outflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>متوسط التدفق المالي الشهري</span>
            </span>
            <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
              شهرياً
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-800 font-['Cairo']">
            {formatSAR(metrics.avgMonthlyFees)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-medium">
            المبلغ الموصى بادخاره شهرياً لتفادي ضغط الاستحقاقات
          </span>
        </div>

        {/* Card 3: Peak Expenditure Month */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>شهر الذروة المالية الأعلى</span>
            </span>
            <span className="text-rose-700 font-extrabold bg-rose-100 border border-rose-300 px-2 py-0.5 rounded text-[10px]">
              ذروة
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-['Cairo']">
            {metrics.peakMonthName}
          </div>
          <span className="text-[11px] text-rose-800 mt-2 block font-bold">
            استحقاق مالي بقيمة: {formatSAR(metrics.peakMonthAmount)}
          </span>
        </div>

        {/* Card 4: Recommended Liquidity Reserve Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>السيولة الاحتياطية الموصى بها</span>
            </span>
            <span className="text-amber-700 font-extrabold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[10px]">
              أمان مالي
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-['Cairo']">
            {formatSAR(metrics.recommendedBuffer)}
          </div>
          <span className="text-[11px] text-amber-800 mt-2 block font-medium">
            هامش أمان لتغطية أعلى ربع سنوي وتجديد الرخص الفوري
          </span>
        </div>

      </div>

      {/* Main Chart Card & Visualization Hub */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Visual Controls & Mode Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Chart View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setViewMode('single'); setChartType('area'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single' && chartType === 'area'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>منحنى التراكم السنوي (Cumulative Area)</span>
            </button>

            <button
              onClick={() => { setViewMode('single'); setChartType('bar_stacked'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single' && chartType === 'bar_stacked'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>توزيع الرسوم الشهرية حسب الجهة (Stacked Breakdown)</span>
            </button>

            <button
              onClick={() => { setViewMode('multi_compare'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'multi_compare'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>مقارنة تراكم الرسوم بين جميع المنشآت ({establishments.length})</span>
            </button>

            <button
              onClick={() => { setViewMode('budget_scenario'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'budget_scenario'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-300" />
              <span>محاكاة الميزانية والتوسع (Budget Simulator)</span>
            </button>
          </div>

          {/* Quick Legend Indicators */}
          <div className="flex items-center gap-3 text-xs">
            {viewMode === 'single' && chartType === 'area' && (
              <>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  <span>الرسوم الحكومية الممتثلة</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <span className="w-3 h-3 rounded bg-rose-400"></span>
                  <span>المسار المتأخر (مع الغرامات)</span>
                </div>
              </>
            )}
            {viewMode === 'multi_compare' && (
              <span className="text-[11px] text-slate-500 font-medium">
                مقارنة المسار التراكمي لـ 3 منشآت مختلفة
              </span>
            )}
          </div>

        </div>

        {/* SIMULATION PANEL (If Budget Scenario View Active) */}
        {viewMode === 'budget_scenario' && (
          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4.5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-bold font-['Cairo']">
                  أدوات التخطيط المالي وسيناريوهات التوسع للمنشأة:
                </h3>
              </div>
              <span className="text-[11px] text-purple-800 font-medium">
                تعديل العوامل يؤدي لإعادة رسم المنحنى التراكمي المالي فوراً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Target Budget Ceiling Input */}
              <div className="bg-white p-3 rounded-xl border border-purple-200 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  سقف الميزانية المستهدفة (Target Budget):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    max="200000"
                    value={customBudgetCeiling}
                    onChange={(e) => setCustomBudgetCeiling(Math.max(5000, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-xs text-slate-400 font-medium">ر.س</span>
                </div>
                <span className={`text-[10px] block font-bold ${metrics.isUnderBudget ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {metrics.isUnderBudget ? `✓ فائض مخصص: ${formatSAR(metrics.budgetVariance)}` : `⚠ عجز متوقع: ${formatSAR(Math.abs(metrics.budgetVariance))}`}
                </span>
              </div>

              {/* Toggle Simulate New Branch */}
              <div className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col justify-between">
                <label className="text-[11px] font-bold text-slate-700 block">
                  محاكاة افتتاح فرع جديد (في نوفمبر 2026):
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeExpansionBranch(!includeExpansionBranch)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    includeExpansionBranch
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {includeExpansionBranch ? '✓ مشمول بالخطة (+9,500 ر.س رخص)' : '+ تضمين فرع جديد'}
                </button>
              </div>

              {/* Additional Employees Hires */}
              <div className="bg-white p-3 rounded-xl border border-purple-200 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  محاكاة زيادة عدد العمالة:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={additionalHiresCount}
                    onChange={(e) => setAdditionalHiresCount(Number(e.target.value))}
                    className="flex-1 accent-purple-700"
                  />
                  <span className="text-xs font-bold text-purple-900 font-mono w-14 text-left">
                    +{additionalHiresCount} موظف
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  أثر رسوم قوى ومقيم ورخص العمل
                </span>
              </div>

            </div>
          </div>
        )}

        {/* PRIMARY CHART RENDERING */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'multi_compare' ? (
              
              /* === MULTI-ESTABLISHMENT COMPARISON LINE CHART === */
              <LineChart data={fiscalProjection} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="monthNameAr" 
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomFiscalTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Cairo', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="est1Cumulative" 
                  name="شركة المائدة الأصيلة (مطاعم)" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#059669' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="est2Cumulative" 
                  name="شركة آفاق التقنية (تقنية)" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="est3Cumulative" 
                  name="مؤسسة رواسي البناء (مقاولات)" 
                  stroke="#d97706" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#d97706' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="allEstTotalCumulative" 
                  name="إجمالي المجموعة المتراكم" 
                  stroke="#0f172a" 
                  strokeWidth={3.5} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>

            ) : chartType === 'bar_stacked' ? (

              /* === STACKED BAR CHART BY AUTHORITY === */
              <BarChart data={fiscalProjection} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="monthNameAr" 
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomFiscalTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Cairo', fontWeight: 'bold' }}
                />
                <Bar dataKey="baladyFees" name="البلديات (بلدي)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="salamahFees" name="الدفاع المدني (سلامة)" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="commerceFees" name="التجارة والغرفة" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="laborQiwaFees" name="العمل وقوى ومدد" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="muqeemPassportsFees" name="مقيم والجوازات" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="zatcaTaxFees" name="الزكاة والضريبة" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>

            ) : (

              /* === CUMULATIVE AREA CHART WITH BUDGET REFERENCE === */
              <AreaChart data={fiscalProjection} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="govCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="govPenaltyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="monthNameAr" 
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomFiscalTooltip />} />
                {showBudgetReference && (
                  <ReferenceLine 
                    y={customBudgetCeiling} 
                    stroke="#9333ea" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ 
                      value: `سقف الميزانية: ${formatSAR(customBudgetCeiling)}`, 
                      fill: '#9333ea', 
                      fontSize: 11, 
                      fontFamily: 'Cairo', 
                      fontWeight: 'bold',
                      position: 'top' 
                    }} 
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="cumulativeWithPenalties" 
                  name="المسار المتأخر (مع تراكم الغرامات)" 
                  stroke="#e11d48" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  fillOpacity={1} 
                  fill="url(#govPenaltyGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeFees" 
                  name="الرسوم التقديرية المتراكمة الرسمية" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#govCumulativeGrad)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Quarter-by-Quarter Financial Summary Bar */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'الربع الثالث (Q3 2026)', amount: metrics.quarters.q3_2026, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
            { label: 'الربع الرابع (Q4 2026)', amount: metrics.quarters.q4_2026, color: 'bg-blue-50 text-blue-900 border-blue-200' },
            { label: 'الربع الأول (Q1 2027)', amount: metrics.quarters.q1_2027, color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
            { label: 'الربع الثاني (Q2 2027)', amount: metrics.quarters.q2_2027, color: 'bg-amber-50 text-amber-900 border-amber-200' },
            { label: 'الربع الثالث (Q3 2027)', amount: metrics.quarters.q3_2027, color: 'bg-slate-50 text-slate-900 border-slate-200' },
          ].map((q, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${q.color} text-right space-y-1`}>
              <span className="text-[10px] font-bold block truncate opacity-80">{q.label}</span>
              <strong className="text-sm font-black block font-['Cairo']">{formatSAR(q.amount)}</strong>
            </div>
          ))}
        </div>

      </div>

      {/* Authority Breakdown Stats (Horizontal Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { name: 'البلديات والإسكان', amount: metrics.totalBalady, icon: '🏛️', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900' },
          { name: 'الدفاع المدني (سلامة)', amount: metrics.totalSalamah, icon: '🚒', color: 'border-rose-200 bg-rose-50/40 text-rose-900' },
          { name: 'التجارة والغرفة', amount: metrics.totalCommerce, icon: '💼', color: 'border-blue-200 bg-blue-50/40 text-blue-900' },
          { name: 'العمل وقوى ومدد', amount: metrics.totalLabor, icon: '👥', color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900' },
          { name: 'الجوازات ومقيم', amount: metrics.totalMuqeem, icon: '🛂', color: 'border-amber-200 bg-amber-50/40 text-amber-900' },
          { name: 'الزكاة والضريبة ZATCA', amount: metrics.totalZatca, icon: '📊', color: 'border-purple-200 bg-purple-50/40 text-purple-900' },
        ].map((auth, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl border ${auth.color} flex flex-col justify-between space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-base">{auth.icon}</span>
              <span className="text-[10px] font-bold opacity-75">سنوياً</span>
            </div>
            <div>
              <span className="text-xs font-bold block truncate">{auth.name}</span>
              <strong className="text-sm font-black block font-['Cairo'] mt-0.5">{formatSAR(auth.amount)}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Month-by-Month Financial Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
              <span>جدول الاستحقاقات والتدفق المالي التقديري (شهر بشهر)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              بيان تفصيلي لكل شهر يوضح الرسوم المستحقة، التراكم حتى الشهر، والخدمات المشمولة للتخطيط المالي
            </p>
          </div>

          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg">
            المنشأة: {currentEst.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-bold">
                <th className="p-3.5">الشهر والسنة</th>
                <th className="p-3.5">الربع المالي</th>
                <th className="p-3.5">الرسوم المستحقة في الشهر</th>
                <th className="p-3.5">إجمالي الرسوم المتراكمة</th>
                <th className="p-3.5">التراخيص المستحقة للتجديد</th>
                <th className="p-3.5">مؤشر الضغط المالي</th>
                <th className="p-3.5 text-center">الإجراء الوقائي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {fiscalProjection.map((item) => (
                <tr 
                  key={item.monthKey}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.isPeakMonth ? 'bg-rose-50/30 font-semibold' : ''
                  }`}
                >
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.monthNameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.monthKey}</div>
                  </td>

                  <td className="p-3.5 text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                      {item.quarter}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <strong className="text-slate-900 font-bold font-['Cairo'] text-sm">
                      {formatSAR(item.totalMonthlyFees)}
                    </strong>
                  </td>

                  <td className="p-3.5">
                    <span className="text-emerald-700 font-extrabold font-['Cairo'] text-sm">
                      {formatSAR(item.cumulativeFees)}
                    </span>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    {item.expiringLicensesCount > 0 ? (
                      <div className="space-y-0.5">
                        <span className="text-rose-700 font-bold text-[11px] block">
                          🔔 {item.expiringLicensesCount} رخصة تستحق:
                        </span>
                        <span className="text-[11px] text-slate-600 truncate block" title={item.expiringLicensesNames.join('، ')}>
                          {item.expiringLicensesNames.join('، ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">رسوم اشتراكات ومنصات دورية</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {item.isPeakMonth ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ذروة إنفاق عالية</span>
                      </span>
                    ) : item.totalMonthlyFees > metrics.avgMonthlyFees ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>استحقاق متوسط</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تدفق مالي مستقر</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    {item.expiringLicensesCount > 0 ? (
                      <button
                        onClick={() => {
                          const target = currentEstLicenses.find(l => l.expiryDate?.startsWith(item.monthKey));
                          if (target && onInstantRenewLicense) onInstantRenewLicense(target);
                          else if (onNavigateToTab) onNavigateToTab('licenses');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>تجهيز التجديد</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">تخصيص سيولة</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Financial Planning Advice Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>نصيحة سبّاق الاستباقية للتخطيط المالي</span>
          </div>
          <h3 className="text-lg font-bold font-['Cairo']">
            توفير يصل إلى {formatSAR(metrics.preventedPenaltySavings)} عبر جدولة الدفعات المبكرة
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            الالتزام بالتجديد في مواعيد الاستحقاق المحددة بالجدول يجنب منشأتك الغرامات البلدية التراكمية وغرامات تأخير تجديد رخص العمل.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToTab ? onNavigateToTab('calculator') : null}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>فتح حاسبة الرسوم الفورية</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
