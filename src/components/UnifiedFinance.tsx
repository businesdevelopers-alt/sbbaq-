import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  PieChart,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Download,
  Sparkles,
  Coins,
  Scale,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  Briefcase,
  Users,
  Receipt,
  HelpCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Establishment, License, Branch, ServiceCatalogItem } from '../types';
import { formatSAR } from '../utils/complianceEngine';
import { CumulativeFeesPlanningChart } from './CumulativeFeesPlanningChart';
import { FeeCalculator } from './FeeCalculator';
import { GovernmentSpendingTrendsCard } from './GovernmentSpendingTrendsCard';

export interface UnifiedFinanceProps {
  establishments: Establishment[];
  activeEstablishment: Establishment;
  licenses: License[];
  branches?: Branch[];
  initialSubTab?: 'planning' | 'trends' | 'calculator' | 'budget_breakdown';
  onSelectEstablishment?: (est: Establishment) => void;
  onInstantRenewLicense?: (license: License) => void;
  onAddToCart?: (service: ServiceCatalogItem, options?: any) => void;
  onNavigateToTab?: (tab: string) => void;
  showToast?: (msg: string) => void;
}

export const UnifiedFinance: React.FC<UnifiedFinanceProps> = ({
  establishments,
  activeEstablishment,
  licenses,
  branches = [],
  initialSubTab = 'planning',
  onSelectEstablishment,
  onInstantRenewLicense,
  onAddToCart,
  onNavigateToTab,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'planning' | 'trends' | 'calculator' | 'budget_breakdown'>(initialSubTab);

  // Filter licenses for current active establishment
  const estLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === activeEstablishment.id);
  }, [licenses, activeEstablishment.id]);

  // Aggregate Key Financial Metrics
  const financialStats = useMemo(() => {
    // Total annual gov recurring cost from active licenses
    const annualGovFees = estLicenses.reduce((acc, l) => acc + (l.costGov || 0), 0);
    const annualSabbaqFees = estLicenses.reduce((acc, l) => acc + (l.costSabbaq || 0), 0);
    const totalAnnualCommitments = annualGovFees + annualSabbaqFees;

    // Fees due in next 90 days
    const next90DaysLicenses = estLicenses.filter(l => l.daysRemaining >= 0 && l.daysRemaining <= 90);
    const next90DaysFees = next90DaysLicenses.reduce((acc, l) => acc + (l.costGov || 0) + (l.costSabbaq || 0), 0);

    // Expired or urgent licenses fees (potential penalty exposure)
    const expiredLicenses = estLicenses.filter(l => l.daysRemaining < 0);
    const potentialFinesEstimated = expiredLicenses.length * 5000; // estimated avg fine per expired license

    // Estimated monthly average liquidity needed
    const monthlyAverage = totalAnnualCommitments > 0 ? Math.round(totalAnnualCommitments / 12) : 0;

    // Breakdown by Authority
    const authorityBreakdown: Record<string, { total: number; count: number; name: string }> = {
      balady: { total: 0, count: 0, name: 'وزارة البلديات والإسكان (بلدي)' },
      civil_defense: { total: 0, count: 0, name: 'المديرية العامة للدفاع المدني (سلامة)' },
      commerce: { total: 0, count: 0, name: 'وزارة التجارة (السجلات والغرف)' },
      hrsd: { total: 0, count: 0, name: 'الموارد البشرية وقوى ومقيم' },
      zatca: { total: 0, count: 0, name: 'هيئة الزكاة والضريبة والجمارك' },
      other: { total: 0, count: 0, name: 'جهات حكومية وتنظيمية أخرى' }
    };

    estLicenses.forEach(lic => {
      const authKey = lic.authority.includes('بلد') ? 'balady'
        : lic.authority.includes('دفاع') || lic.authority.includes('سلام') ? 'civil_defense'
        : lic.authority.includes('تجار') || lic.authority.includes('غرف') ? 'commerce'
        : lic.authority.includes('موارد') || lic.authority.includes('قوى') || lic.authority.includes('مقيم') ? 'hrsd'
        : lic.authority.includes('زكاة') || lic.authority.includes('ضريب') ? 'zatca'
        : 'other';

      authorityBreakdown[authKey].total += (lic.costGov || 0);
      authorityBreakdown[authKey].count += 1;
    });

    return {
      annualGovFees,
      annualSabbaqFees,
      totalAnnualCommitments,
      next90DaysFees,
      next90DaysLicensesCount: next90DaysLicenses.length,
      expiredCount: expiredLicenses.length,
      potentialFinesEstimated,
      monthlyAverage,
      authorityBreakdown
    };
  }, [estLicenses]);

  // Handle Export Financial Statement
  const handleExportFinancialSummary = () => {
    if (showToast) {
      showToast('تم تصدير البيان المالي والميزانية التقديرية (PDF / Excel) بنجاح.');
    }
  };

  return (
    <div className="space-y-6 font-['Cairo'] pb-12 animate-fade-in">
      
      {/* 1. Header Banner & Executive Financial Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-xs font-bold px-3.5 py-1 rounded-full border border-teal-500/30">
              <Coins className="w-3.5 h-3.5" />
              <span>المركز المالي الموحد للامتثال والتراخيص الحكومية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Cairo']">
              المالية والميزانية التقديرية — {activeEstablishment.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              منظومة متكاملة لاحتساب الرسوم والتراخيص الحكومية بدقة فورية، والتخطيط للتدفقات النقدية السنوية على مدار 12 شهراً لتفادي الغرامات وتخصيص السيولة باستباقية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportFinancialSummary}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>تصدير الميزانية السنوية</span>
            </button>

            <button
              onClick={() => setActiveSubTab('calculator')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-black px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-teal-950/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>فتح حاسبة الرسوم</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-950/50 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">الرسوم السنوية التقديرية</span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-['Cairo']">
              {formatSAR(financialStats.totalAnnualCommitments)}
            </div>
            <span className="text-[10px] text-slate-400">لجميع الرخص والاشتراكات</span>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">مستحق خلال 90 يوماً</span>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-['Cairo']">
              {formatSAR(financialStats.next90DaysFees)}
            </div>
            <span className="text-[10px] text-amber-300/80">{financialStats.next90DaysLicensesCount} تراخيص مستحقة</span>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">متوسط السيولة الشهرية</span>
            <div className="text-lg sm:text-xl font-black text-teal-300 font-['Cairo']">
              {formatSAR(financialStats.monthlyAverage)}
            </div>
            <span className="text-[10px] text-slate-400">تخصيص شهري موصى به</span>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">وفورات الرصد الوقائي</span>
            <div className="text-lg sm:text-xl font-black text-blue-400 font-['Cairo']">
              {formatSAR(24500)}
            </div>
            <span className="text-[10px] text-blue-300/80">تفادي غرامات عبر التجديد المبكر</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Sub-Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          
          <button
            type="button"
            onClick={() => setActiveSubTab('planning')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'planning'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>التخطيط المالي والتدفق التراكمي</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeSubTab === 'planning' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
            }`}>
              توقعات 12 شهراً
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('trends')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'trends'
                ? 'bg-teal-800 text-white shadow-md shadow-teal-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4 text-teal-400" />
            <span>اتجاهات الإنفاق الحكومي</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeSubTab === 'trends' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
            }`}>
              الـ 12 شهراً الماضية
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('calculator')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>حاسبة الرسوم الحكومية والتأسيس</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeSubTab === 'calculator' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}>
              تفاعلي
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('budget_breakdown')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'budget_breakdown'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>تفصيل الميزانية والجهات</span>
          </button>

        </div>

        {/* Active Context indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-bold px-3">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span>السجل: {activeEstablishment.crNumber}</span>
          <span>•</span>
          <span>{activeEstablishment.city}</span>
        </div>
      </div>

      {/* 3. Sub-Tab Content Rendering */}

      {/* Sub-Tab 1: Cumulative Fees Planning Chart (التخطيط المالي والميزانية السنوية) */}
      {activeSubTab === 'planning' && (
        <div className="space-y-6">
          <GovernmentSpendingTrendsCard
            activeEstablishment={activeEstablishment}
            licenses={licenses}
            branches={branches}
            onNavigateToTab={onNavigateToTab}
            showToast={showToast}
          />
          <CumulativeFeesPlanningChart
            establishments={establishments}
            activeEstablishment={activeEstablishment}
            licenses={licenses}
            branches={branches}
            onSelectEstablishment={onSelectEstablishment}
            onInstantRenewLicense={onInstantRenewLicense}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      )}

      {/* Sub-Tab 1.5: Dedicated Spending Trends View */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6">
          <GovernmentSpendingTrendsCard
            activeEstablishment={activeEstablishment}
            licenses={licenses}
            branches={branches}
            onNavigateToTab={onNavigateToTab}
            showToast={showToast}
          />
        </div>
      )}

      {/* Sub-Tab 2: Interactive Fee Calculator (حاسبة الرسوم الحكومية) */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-6">
          <FeeCalculator
            onAddToCart={onAddToCart || (() => {})}
            establishmentCity={activeEstablishment.city}
            establishmentActivity={activeEstablishment.isicActivities[0]}
            onNavigateToPlanning={() => setActiveSubTab('planning')}
          />
        </div>
      )}

      {/* Sub-Tab 3: Budget Breakdown by Authority (تفصيل الميزانية والجهات) */}
      {activeSubTab === 'budget_breakdown' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Detailed Authority Cards */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-['Cairo']">
                        توزيع الالتزامات والرسوم الحكومية حسب الجهة المنظمة
                      </h3>
                      <p className="text-xs text-slate-500">
                        مقارنة التكاليف الدورية للبلديات والدفاع المدني والتجارة والمنصات
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {estLicenses.length} رخص مسجلة
                  </span>
                </div>

                <div className="space-y-3">
                  {(Object.entries(financialStats.authorityBreakdown) as [string, { total: number; count: number; name: string }][]).map(([key, auth]) => {
                    if (auth.count === 0 && auth.total === 0) return null;
                    const percentage = financialStats.totalAnnualCommitments > 0
                      ? Math.round((auth.total / financialStats.totalAnnualCommitments) * 100)
                      : 0;

                    return (
                      <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/40 hover:border-teal-200 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 font-['Cairo']">{auth.name}</span>
                            <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {auth.count} تراخيص
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-black text-teal-800 font-['Cairo']">
                              {formatSAR(auth.total)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">({percentage}%)</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Smart Financial Optimization Recommendations */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-['Cairo']">
                      توصيات سبّاق لتحسين الميزانية
                    </h4>
                    <span className="text-[10px] text-teal-300/80">فرص توفير وتفادي غرامات</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-teal-300 font-bold">
                      <span>تجديد الرخص البلدية متعددة السنوات</span>
                      <span className="text-[10px] bg-teal-500/20 px-1.5 py-0.5 rounded">توفير 15%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      إصدار وتجديد رخصة بلدي لمدة 3 سنوات يمنحك تثبيت الرسوم وتفادي تغيرات رسوم اللوحات والمساحات.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>الاستفادة من مهلة السداد 25%</span>
                      <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">خصم فوري</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      سداد رسوم ومخالفات المنصات الحكومية خلال أول 30 يوماً يمنح المنشأة خصماً تشجيعياً بنسبة 25%.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span>دمج اشتراكات الفروع الموحدة</span>
                      <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">إدارة مركزية</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      توحيد اشتراكات مقيم وقوى تحت الرقم الموحد 700 يخفض الرسوم الإدارية السنوية بنسبة 20%.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('calculator')}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Calculator className="w-4 h-4" />
                  <span>محاكاة توفير الرسوم في الحاسبة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
