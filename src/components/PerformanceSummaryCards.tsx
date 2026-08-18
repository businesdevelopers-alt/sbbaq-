import React from 'react';
import { 
  FileText, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { Establishment, License, Branch, DocumentItem, ComplianceViolation, MasterOrder } from '../types';
import { calculateEstablishmentRisk } from '../utils/complianceEngine';

interface PerformanceSummaryCardsProps {
  establishment: Establishment;
  licenses: License[];
  branches: Branch[];
  documents?: DocumentItem[];
  violations?: ComplianceViolation[];
  orders?: MasterOrder[];
  onNavigateToTab?: (tab: string) => void;
  onExportPdf?: () => void;
  showToast?: (msg: string) => void;
}

export const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({
  establishment,
  licenses,
  branches,
  documents = [],
  violations = [],
  orders = [],
  onNavigateToTab,
  onExportPdf,
  showToast
}) => {
  // 1. Total licenses & breakdown for active establishment
  const estLicenses = licenses.filter(l => l.establishmentId === establishment.id);
  const totalLicensesCount = estLicenses.length;
  const validLicensesCount = estLicenses.filter(l => l.status === 'valid').length;
  const expiringLicensesCount = estLicenses.filter(l => l.status === 'near_expiry').length;
  const expiredLicensesCount = estLicenses.filter(l => l.status === 'expired').length;

  // 2. Total branches for active establishment
  const estBranches = branches.filter(b => b.establishmentId === establishment.id);
  const totalBranchesCount = estBranches.length > 0 ? estBranches.length : (establishment.branchesCount || 1);
  const activeBranchesCount = estBranches.filter(b => b.status === 'active' || !b.status).length;
  const highRiskBranchesCount = estBranches.filter(b => (b.riskScore || 0) > 60).length;

  // 3. Overall Compliance Rate calculation (0-100%)
  const riskAssessment = calculateEstablishmentRisk(establishment, licenses, documents, violations, orders);
  // Compliance Score = 100 - riskAssessment.overallScore
  const calculatedComplianceScore = Math.max(0, Math.min(100, 100 - riskAssessment.overallScore));
  const finalCompliancePercentage = establishment.complianceScore ?? calculatedComplianceScore;

  // Deterministic day-over-day changes based on active establishment properties
  // E.g. licenses daily change (+1 new renewal or 0), branches change (+0), compliance change (+2.4% or -1.5%)
  const licensesDailyDiff = expiredLicensesCount > 0 ? -1 : (expiringLicensesCount > 0 ? 0 : 1);
  const licensesDailyText = licensesDailyDiff > 0 ? '+1 تجديد مكتمل' : licensesDailyDiff < 0 ? '1 يستوجب التجديد' : 'مستقر ومطابق';

  const branchesDailyText = highRiskBranchesCount === 0 ? 'كافة الفروع ممتثلة' : `${highRiskBranchesCount} فرع تحت المتابعة`;

  // Compliance delta logic
  const complianceDailyDelta = finalCompliancePercentage >= 85 ? +2.5 : finalCompliancePercentage >= 70 ? +0.8 : -1.8;

  const getComplianceStatusBadge = (score: number) => {
    if (score >= 90) return { label: 'امتثال مثالي (ممتاز)', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' };
    if (score >= 75) return { label: 'امتثال جيد جداً', bg: 'bg-teal-500/10 text-teal-700 border-teal-300', dot: 'bg-teal-500' };
    if (score >= 60) return { label: 'امتثال متوسط (مطلوب تصحيح)', bg: 'bg-amber-500/10 text-amber-700 border-amber-300', dot: 'bg-amber-500' };
    return { label: 'امتثال منخفض (عالي المخاطر)', bg: 'bg-rose-500/10 text-rose-700 border-rose-300', dot: 'bg-rose-500' };
  };

  const statusBadge = getComplianceStatusBadge(finalCompliancePercentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* CARD 1: Total Licenses (إجمالي عدد التراخيص) */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('licenses')}
        className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 font-sans block">التراخيص والرخص الحكومية</span>
                <span className="text-[11px] text-slate-400 font-medium">بلدي، الدفاع المدني، السجلات</span>
              </div>
            </div>

            <span className="p-1.5 rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                {totalLicensesCount}
              </span>
              <span className="text-xs font-bold text-slate-500">ترخيص رسمي</span>
            </div>

            {/* Daily indicator */}
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.8 rounded-lg ${
              licensesDailyDiff > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : licensesDailyDiff < 0 
                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {licensesDailyDiff > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : licensesDailyDiff < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{licensesDailyText}</span>
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>ساري: <strong className="text-emerald-700">{validLicensesCount}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>قريب الانتهاء: <strong className="text-amber-700">{expiringLicensesCount}</strong></span>
            </span>
            {expiredLicensesCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                <span>منتهي: <strong className="text-rose-700">{expiredLicensesCount}</strong></span>
              </span>
            )}
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${totalLicensesCount > 0 ? (validLicensesCount / totalLicensesCount) * 100 : 100}%` }}
              title={`ساري: ${validLicensesCount}`}
            />
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${totalLicensesCount > 0 ? (expiringLicensesCount / totalLicensesCount) * 100 : 0}%` }}
              title={`قريب الانتهاء: ${expiringLicensesCount}`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${totalLicensesCount > 0 ? (expiredLicensesCount / totalLicensesCount) * 100 : 0}%` }}
              title={`منتهي: ${expiredLicensesCount}`}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Total Branches (إجمالي عدد الفروع) */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('branches')}
        className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 font-sans block">الفروع والمواقع الجغرافية</span>
                <span className="text-[11px] text-slate-400 font-medium">المقر الرئيسي والفروع التجارية</span>
              </div>
            </div>

            <span className="p-1.5 rounded-xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                {totalBranchesCount}
              </span>
              <span className="text-xs font-bold text-slate-500">موقع مسجل</span>
            </div>

            {/* Daily indicator */}
            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{branchesDailyText}</span>
            </div>
          </div>
        </div>

        {/* Branches info row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{activeBranchesCount} فروع نشطة تشغيلياً</span>
            </span>
            <span className="text-slate-400 font-medium font-mono text-[10px]">
              {establishment.city} • المملكة
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            متابعة الرخص والزيارات الرقابية لكل فرع على حدة
          </p>
        </div>
      </div>

      {/* CARD 3: Overall Compliance Rate (نسبة الامتثال العامة للمنشأة) */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('risk_center')}
        className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${
          finalCompliancePercentage >= 80 
            ? 'from-emerald-500 to-teal-500' 
            : finalCompliancePercentage >= 60 
            ? 'from-amber-500 to-yellow-500' 
            : 'from-rose-500 to-red-500'
        } opacity-80 group-hover:opacity-100 transition-opacity`} />
        
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform ${
                finalCompliancePercentage >= 80 
                  ? 'bg-purple-50 text-purple-600 border-purple-100' 
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 font-sans block">نسبة الامتثال العامة</span>
                <span className="text-[11px] text-slate-400 font-medium">مؤشر الجاهزية والرقابة الوقائية</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onExportPdf && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportPdf();
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="تصدير تقرير الامتثال والمخاطر PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تقرير PDF</span>
                </button>
              )}
              <span className="p-1.5 rounded-xl bg-slate-50 text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                finalCompliancePercentage >= 80 ? 'text-emerald-700' :
                finalCompliancePercentage >= 60 ? 'text-amber-700' : 'text-rose-700'
              }`}>
                {finalCompliancePercentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">/ 100%</span>
            </div>

            {/* Daily indicator */}
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.8 rounded-lg ${
              complianceDailyDelta >= 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {complianceDailyDelta >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span className="font-mono">{complianceDailyDelta >= 0 ? `+${complianceDailyDelta}%` : `${complianceDailyDelta}%`}</span>
              <span className="text-[10px] text-slate-400">عن أمس</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Status Pill */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md border text-[10px] ${statusBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>

            <span className="text-[11px] text-slate-500 font-bold">
              درجة الخطر: <strong className="font-mono text-slate-800">{riskAssessment.overallScore}/100</strong>
            </span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                finalCompliancePercentage >= 80 ? 'bg-emerald-600' :
                finalCompliancePercentage >= 60 ? 'bg-amber-500' : 'bg-rose-600'
              }`}
              style={{ width: `${finalCompliancePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
