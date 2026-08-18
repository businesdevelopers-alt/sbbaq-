import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RotateCw, 
  Plus, 
  Filter, 
  Search, 
  Building2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Download, 
  Coins, 
  Scale, 
  SlidersHorizontal, 
  Info,
  Landmark,
  Flame,
  Briefcase,
  Receipt,
  Users,
  LayoutGrid,
  List,
  RefreshCcw,
  X,
  ArrowUpDown,
  Tag,
  Zap,
  Check,
  TrendingDown
} from 'lucide-react';
import { License, Branch, Establishment, LicensePenaltyEvaluation } from '../types';
import { 
  getLicenseStatusBadge, 
  formatSAR, 
  calculateAllLicensesEstimatedFines, 
  evaluateLicensePenalty 
} from '../utils/complianceEngine';
import { COMPLIANCE_RULES } from '../data/complianceData';

interface LicensesMonitorProps {
  licenses: License[];
  branches: Branch[];
  activeEstablishment: Establishment;
  onInstantRenew: (license: License) => void;
  onAddNewLicense: () => void;
}

type StatusFilterType = 'all' | 'expired' | 'critical' | 'near_expiry' | 'active' | 'mandatory' | 'alert_triggered';
type SortOptionType = 'expiry_asc' | 'expiry_desc' | 'fines_desc' | 'name_asc' | 'authority_asc';
type ViewModeType = 'cards' | 'table';

export const LicensesMonitor: React.FC<LicensesMonitorProps> = ({
  licenses,
  branches,
  activeEstablishment,
  onInstantRenew,
  onAddNewLicense,
}) => {
  // Main filter states
  const [filterStatus, setFilterStatus] = useState<StatusFilterType>('all');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Display & simulation states - Default to automatic nearest expiry sorting for optimal priority management
  const [sortBy, setSortBy] = useState<SortOptionType>('expiry_asc');
  const [autoPrioritySortEnabled, setAutoPrioritySortEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewModeType>('cards');
  const [showFinesBreakdown, setShowFinesBreakdown] = useState<boolean>(true);
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-08-15');
  const [selectedPenaltyModal, setSelectedPenaltyModal] = useState<LicensePenaltyEvaluation | null>(null);

  // Run automated penalty calculation across active establishment's licenses
  const estLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === activeEstablishment.id);
  }, [licenses, activeEstablishment.id]);

  const fineReport = useMemo(() => {
    return calculateAllLicensesEstimatedFines(estLicenses, COMPLIANCE_RULES, simulatedDate);
  }, [estLicenses, simulatedDate]);

  // Extract dynamic list of authorities with their counts
  const authorityStats = useMemo(() => {
    const map = new Map<string, number>();
    estLicenses.forEach(lic => {
      const auth = lic.authority.trim();
      map.set(auth, (map.get(auth) || 0) + 1);
    });

    const list: { name: string; count: number; icon: string }[] = [];
    map.forEach((count, name) => {
      let icon = '🏛️';
      if (name.includes('دفاع') || name.includes('سلامة')) icon = '🚒';
      else if (name.includes('تجارة') || name.includes('غرفة')) icon = '💼';
      else if (name.includes('زكاة') || name.includes('ضريبة')) icon = '📊';
      else if (name.includes('موارد') || name.includes('قوى') || name.includes('عمل')) icon = '👥';
      else if (name.includes('صحي') || name.includes('طبي')) icon = '🩺';
      else if (name.includes('بلدي') || name.includes('أمانة')) icon = '🏛️';

      list.push({ name, count, icon });
    });

    return list.sort((a, b) => b.count - a.count);
  }, [estLicenses]);

  // Status counts
  const counts = useMemo(() => {
    const expired = estLicenses.filter(l => l.status === 'expired' || l.daysRemaining < 0).length;
    const critical = estLicenses.filter(l => (l.status === 'expired' || l.daysRemaining <= 15) && l.daysRemaining >= 0).length;
    const nearExpiry = estLicenses.filter(l => l.daysRemaining <= 30 && l.daysRemaining >= 0).length;
    const active = estLicenses.filter(l => l.daysRemaining > 30).length;
    const mandatory = estLicenses.filter(l => l.isMandatory).length;
    const alertTriggered = estLicenses.filter(l => l.alertTriggered || l.daysRemaining <= 30).length;

    return {
      all: estLicenses.length,
      expired,
      critical,
      nearExpiry,
      active,
      mandatory,
      alertTriggered
    };
  }, [estLicenses]);

  // Filter & sort logic
  const filteredAndSortedLicenses = useMemo(() => {
    return estLicenses
      .filter((lic) => {
        // Search query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          lic.name.toLowerCase().includes(q) ||
          lic.authority.toLowerCase().includes(q) ||
          lic.licenseNumber.toLowerCase().includes(q) ||
          (lic.branchName && lic.branchName.toLowerCase().includes(q)) ||
          (lic.notes && lic.notes.toLowerCase().includes(q));

        // Authority filter
        const matchesAuthority = 
          selectedAuthority === 'all' || 
          lic.authority === selectedAuthority ||
          lic.authority.toLowerCase().includes(selectedAuthority.toLowerCase());

        // Branch filter
        const matchesBranch = selectedBranch === 'all' || lic.branchId === selectedBranch;

        // Status filter
        let matchesStatus = true;
        if (filterStatus === 'expired') {
          matchesStatus = lic.status === 'expired' || lic.daysRemaining < 0;
        } else if (filterStatus === 'critical') {
          matchesStatus = (lic.status === 'expired' || lic.daysRemaining <= 15) && lic.daysRemaining >= 0;
        } else if (filterStatus === 'near_expiry') {
          matchesStatus = lic.daysRemaining <= 30 && lic.daysRemaining >= 0;
        } else if (filterStatus === 'active') {
          matchesStatus = lic.daysRemaining > 30;
        } else if (filterStatus === 'mandatory') {
          matchesStatus = lic.isMandatory;
        } else if (filterStatus === 'alert_triggered') {
          matchesStatus = !!lic.alertTriggered || lic.daysRemaining <= 30;
        }

        return matchesSearch && matchesAuthority && matchesBranch && matchesStatus;
      })
      .sort((a, b) => {
        // Effective sorting
        const currentSort = autoPrioritySortEnabled ? 'expiry_asc' : sortBy;

        if (currentSort === 'expiry_asc') {
          // Nearest expiration date first (expired < 0, then 1, 2, 3... days)
          return a.daysRemaining - b.daysRemaining;
        }
        if (currentSort === 'expiry_desc') {
          return b.daysRemaining - a.daysRemaining;
        }
        if (currentSort === 'fines_desc') {
          const fineA = evaluateLicensePenalty(a, COMPLIANCE_RULES, simulatedDate).totalEstimatedFine;
          const fineB = evaluateLicensePenalty(b, COMPLIANCE_RULES, simulatedDate).totalEstimatedFine;
          return fineB - fineA;
        }
        if (currentSort === 'name_asc') {
          return a.name.localeCompare(b.name, 'ar');
        }
        if (currentSort === 'authority_asc') {
          return a.authority.localeCompare(b.authority, 'ar');
        }
        return 0;
      });
  }, [estLicenses, searchQuery, selectedAuthority, selectedBranch, filterStatus, sortBy, autoPrioritySortEnabled, simulatedDate]);

  // Active filters count
  const activeFiltersCount = 
    (filterStatus !== 'all' ? 1 : 0) +
    (selectedAuthority !== 'all' ? 1 : 0) +
    (selectedBranch !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setFilterStatus('all');
    setSelectedAuthority('all');
    setSelectedBranch('all');
    setSearchQuery('');
  };

  const handleToggleAutoPrioritySort = () => {
    if (!autoPrioritySortEnabled) {
      setAutoPrioritySortEnabled(true);
      setSortBy('expiry_asc');
    } else {
      setAutoPrioritySortEnabled(false);
    }
  };

  const getAuthorityBadgeIcon = (authorityName: string) => {
    if (authorityName.includes('دفاع') || authorityName.includes('سلامة')) return <Flame className="w-3.5 h-3.5 text-rose-600" />;
    if (authorityName.includes('تجارة') || authorityName.includes('غرفة')) return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
    if (authorityName.includes('زكاة') || authorityName.includes('ضريبة')) return <Receipt className="w-3.5 h-3.5 text-amber-600" />;
    if (authorityName.includes('موارد') || authorityName.includes('قوى') || authorityName.includes('عمل')) return <Users className="w-3.5 h-3.5 text-indigo-600" />;
    return <Landmark className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const getPriorityRankBadge = (index: number, daysRemaining: number) => {
    if (daysRemaining < 0) {
      return {
        label: `أولوية #1 (منتهية - متأخر ${Math.abs(daysRemaining)} يوم)`,
        color: 'bg-rose-600 text-white border-rose-700',
        ring: 'border-rose-400/80 bg-rose-50/20'
      };
    }
    if (daysRemaining <= 15) {
      return {
        label: `أولوية قصوى #${index + 1} (متبقي ${daysRemaining} يوم)`,
        color: 'bg-red-600 text-white border-red-700',
        ring: 'border-red-400/80 bg-red-50/20'
      };
    }
    if (daysRemaining <= 30) {
      return {
        label: `أولوية عاجلة #${index + 1} (متبقي ${daysRemaining} يوم)`,
        color: 'bg-amber-600 text-white border-amber-700',
        ring: 'border-amber-400/80 bg-amber-50/20'
      };
    }
    return {
      label: `أولوية مستقرة #${index + 1} (سارٍ)`,
      color: 'bg-slate-700 text-white border-slate-800',
      ring: 'border-slate-200'
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Metric Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5 border border-emerald-100">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>نظام مراقبة التراخيص وإدارة الأولويات الاستباقية</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            مراقبة التراخيص الحكومية وترتيب الأولويات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            فحص استباقي وتصنيف فوري حسب السلطة المانحة وحالة الصلاحية، مع الترتيب التلقائي حسب التاريخ الأقرب للانتهاء.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Auto-Priority Button in Header */}
          <button
            onClick={handleToggleAutoPrioritySort}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border shadow-xs transition-all cursor-pointer ${
              autoPrioritySortEnabled
                ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="الترتيب التلقائي الذكي حسب الأقرب انتهاءً لتسهيل إدارة الأولويات"
          >
            <Zap className={`w-4 h-4 ${autoPrioritySortEnabled ? 'text-amber-600 fill-amber-600' : 'text-slate-500'}`} />
            <span>{autoPrioritySortEnabled ? 'الترتيب التلقائي بالأولوية: مفعّل' : 'تفعيل الترتيب التلقائي بالأولوية'}</span>
          </button>

          <button
            onClick={onAddNewLicense}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ترخيص للمراقبة</span>
          </button>
        </div>
      </div>

      {/* Automated Estimated Fines Calculator & Warning Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30">
              <Coins className="w-4 h-4" />
              <span>التقييم المالي الآلي للغرامات (COMPLIANCE_RULES)</span>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-400 block font-medium">إجمالي الغرامات المستحقة حالياً (المنتهية):</span>
                <span className="text-3xl font-extrabold text-rose-400 font-['Cairo']">
                  {formatSAR(fineReport.totalCurrentEstimatedFines)}
                </span>
              </div>

              <div className="border-r border-slate-700 pr-4">
                <span className="text-xs text-slate-400 block font-medium">مخاطر الغرامات المتوقعة عند الانتهاء (قريبة الأجل):</span>
                <span className="text-2xl font-bold text-amber-400 font-['Cairo']">
                  {formatSAR(fineReport.totalProjectedFines)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              تعتمد الحسبة تلقائياً على جداول الجزاءات الرسمية للبلديات والدفاع المدني والتجارة والشهادات الصحية، محتسبة الغرامة الأساسية + غرامة التأخير اليومية التراكمية.
            </p>
          </div>

          {/* Date Simulator & Breakdown Toggle */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>تاريخ الفحص والمقارنة:</span>
              </span>
              <input
                type="date"
                value={simulatedDate}
                onChange={(e) => setSimulatedDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSimulatedDate('2026-08-15')}
                className={`flex-1 text-[11px] py-1 px-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  simulatedDate === '2026-08-15' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                اليوم (15 أغسطس 2026)
              </button>
              <button
                onClick={() => setSimulatedDate('2026-09-15')}
                className={`flex-1 text-[11px] py-1 px-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  simulatedDate === '2026-09-15' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                محاكاة (+30 يوم)
              </button>
            </div>

            <button
              onClick={() => setShowFinesBreakdown(!showFinesBreakdown)}
              className="w-full text-xs font-bold text-slate-200 bg-slate-700/60 hover:bg-slate-700 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showFinesBreakdown ? 'إخفاء جدول تفصيل الجزاءات' : 'عرض تفصيل الجزاءات والسند النظامي'}</span>
              {showFinesBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* Detailed Fine Table Dropdown */}
        {showFinesBreakdown && (
          <div className="mt-6 pt-5 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>جدول التحليل المالي للجزاءات حسب قواعد الامتثال (تاريخ المقارنة: {simulatedDate})</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                مفحوص: {fineReport.totalLicensesChecked} تراخيص | منتهي: {fineReport.expiredLicensesCount}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/40">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 text-[11px]">
                    <th className="p-2.5 font-bold">الترخيص / الجهة</th>
                    <th className="p-2.5 font-bold">تاريخ الانتهاء</th>
                    <th className="p-2.5 font-bold">الحالة والمدة</th>
                    <th className="p-2.5 font-bold">القاعدة والسند النظامي</th>
                    <th className="p-2.5 font-bold">الغرامة الأساسية</th>
                    <th className="p-2.5 font-bold">الغرامة التراكمية</th>
                    <th className="p-2.5 font-bold">إجمالي الغرامة التقديرية</th>
                    <th className="p-2.5 font-bold text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fineReport.evaluatedLicenses.map((evalItem) => (
                    <tr 
                      key={evalItem.licenseId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        evalItem.isExpired ? 'bg-rose-950/20' : evalItem.daysRemaining <= 15 ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="p-2.5">
                        <div className="font-bold text-slate-200">{evalItem.licenseName}</div>
                        <div className="text-[10px] text-slate-400">{evalItem.authority} {evalItem.branchName ? `(${evalItem.branchName})` : ''}</div>
                      </td>
                      <td className="p-2.5 text-slate-300 font-mono text-[11px]">
                        {evalItem.expiryDate}
                      </td>
                      <td className="p-2.5">
                        {evalItem.isExpired ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-900/30 px-2 py-0.5 rounded border border-rose-800/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>منتهي منذ {evalItem.daysExpired} يوم</span>
                          </span>
                        ) : evalItem.daysRemaining <= 30 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-800/40">
                            <Clock className="w-3 h-3" />
                            <span>متبقي {evalItem.daysRemaining} يوم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>سارٍ (+{evalItem.daysRemaining} يوم)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 max-w-xs">
                        <div className="text-[11px] text-slate-300 font-medium truncate" title={evalItem.matchedRuleTitle}>
                          {evalItem.matchedRuleTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate" title={evalItem.legalCitation}>
                          {evalItem.legalCitation}
                        </div>
                      </td>
                      <td className="p-2.5 font-bold text-slate-200">
                        {formatSAR(evalItem.baseFine)}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">
                        {evalItem.isExpired ? (
                          <span>+{formatSAR(evalItem.dailyFineAccumulated)} <span className="text-[10px] text-slate-400">({evalItem.daysBeyondGrace} يوم)</span></span>
                        ) : (
                          <span className="text-slate-500">0 ر.س</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {evalItem.isExpired ? (
                          <strong className="text-rose-400 font-bold text-sm block font-['Cairo']">
                            {formatSAR(evalItem.totalEstimatedFine)}
                          </strong>
                        ) : (
                          <div>
                            <span className="text-slate-400 block text-[10px]">المتوقع عند الانتهاء:</span>
                            <span className="text-amber-400 font-bold">{formatSAR(evalItem.projectedFineIfExpired)}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setSelectedPenaltyModal(evalItem)}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
                        >
                          التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Status Metric Cards (Interactive Quick Filter Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* All Licenses */}
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-700 shadow-md' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-bold ${filterStatus === 'all' ? 'text-slate-200' : 'text-slate-600'}`}>
              كافة التراخيص
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              filterStatus === 'all' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
            }`}>
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Cairo']">
            {counts.all}
          </div>
          <span className={`text-[11px] mt-1 block truncate ${filterStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            {estLicenses.length} ترخيص وشهادة مسجلة
          </span>
        </button>

        {/* Expired Status */}
        <button
          onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === 'expired' 
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-md' 
              : 'bg-white border-slate-200 hover:border-rose-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-rose-700">تراخيص منتهية (مخالفة)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-['Cairo']">
            {counts.expired}
          </div>
          <span className="text-[11px] text-rose-600/90 mt-1 block truncate font-medium">
            {counts.expired > 0 ? `غرامة: ${formatSAR(fineReport.totalCurrentEstimatedFines)}` : 'لا توجد تراخيص منتهية'}
          </span>
        </button>

        {/* Near Expiry Status */}
        <button
          onClick={() => setFilterStatus(filterStatus === 'near_expiry' ? 'all' : 'near_expiry')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === 'near_expiry' 
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-md' 
              : 'bg-white border-slate-200 hover:border-amber-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-800">تستحق التجديد (≤ 30 يوم)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-['Cairo']">
            {counts.nearExpiry}
          </div>
          <span className="text-[11px] text-amber-700/90 mt-1 block truncate font-medium">
            {counts.critical > 0 ? `${counts.critical} رخصة حرجة (≤ 15 يوم)` : 'استباقية التجديد'}
          </span>
        </button>

        {/* Active Status */}
        <button
          onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === 'active' 
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-md' 
              : 'bg-white border-slate-200 hover:border-emerald-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-800">تراخيص سارية ومطابقة</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-['Cairo']">
            {counts.active}
          </div>
          <span className="text-[11px] text-emerald-700/90 mt-1 block truncate font-medium">
            صلاحية أكثر من شهر
          </span>
        </button>

      </div>

      {/* SECTION 2: Quick Filter Hub (Authority Filter Pills + Status Tabs + Advanced Search & Priority Auto-Sort) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        
        {/* TOP ROW OF HUB: Authority Quick Pills (فلاتر سريعة حسب السلطة المانحة) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800 font-['Cairo']">
                فلاتر التصنيف السريعة حسب السلطة المانحة:
              </h3>
            </div>
            {selectedAuthority !== 'all' && (
              <button
                onClick={() => setSelectedAuthority('all')}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض كل الجهات</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {/* All Authorities Pill */}
            <button
              onClick={() => setSelectedAuthority('all')}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedAuthority === 'all'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>🌐</span>
              <span>كافة الجهات المانحة</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedAuthority === 'all' ? 'bg-emerald-950/60 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {estLicenses.length}
              </span>
            </button>

            {/* Dynamic Authority Pills */}
            {authorityStats.map((auth) => {
              const isSelected = selectedAuthority === auth.name;
              return (
                <button
                  key={auth.name}
                  onClick={() => setSelectedAuthority(isSelected ? 'all' : auth.name)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">{auth.icon}</span>
                  <span className="truncate max-w-[200px]">{auth.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {auth.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE ROW OF HUB: Status Sub-Filters & Quick Toggles */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Quick Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-bold ml-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>حالة التراخيص:</span>
            </span>

            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({counts.all})
            </button>

            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'expired'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>منتهية ({counts.expired})</span>
            </button>

            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'critical'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>حرجة (≤ 15 يوم) ({counts.critical})</span>
            </button>

            <button
              onClick={() => setFilterStatus('near_expiry')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'near_expiry'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>قريبة الأجل ({counts.nearExpiry})</span>
            </button>

            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>سارية ({counts.active})</span>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'mandatory' ? 'all' : 'mandatory')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'mandatory'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>إلزامية ({counts.mandatory})</span>
            </button>
          </div>

          {/* View Mode Toggle & Clear Filters */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>مسح الفلاتر ({activeFiltersCount})</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="عرض الجدول المدمج"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW OF HUB: Search, Branch Selector, Priority Sort Toggle & Sort Selector */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (4 Cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الترخيص، السلطة المانحة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">🏢 جميع الفروع والمقرات</option>
              {branches.filter(b => b.establishmentId === activeEstablishment.id).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Auto Priority Sort Toggle Button (2 Cols) */}
          <div className="md:col-span-2">
            <button
              onClick={handleToggleAutoPrioritySort}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                autoPrioritySortEnabled 
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="ترتيب تلقائي حسب التاريخ الأقرب للانتهاء لإدارة الأولويات"
            >
              <Zap className={`w-3.5 h-3.5 ${autoPrioritySortEnabled ? 'fill-white' : 'text-slate-500'}`} />
              <span className="truncate">الأقرب انتهاءً</span>
            </button>
          </div>

          {/* Sort By Dropdown (3 Cols) */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>فرز:</span>
            </span>
            <select
              value={autoPrioritySortEnabled ? 'expiry_asc' : sortBy}
              onChange={(e) => {
                const val = e.target.value as SortOptionType;
                setSortBy(val);
                if (val !== 'expiry_asc') {
                  setAutoPrioritySortEnabled(false);
                } else {
                  setAutoPrioritySortEnabled(true);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="expiry_asc">⚡ الأقرب انتهاءً (الأولوية الذكية)</option>
              <option value="expiry_desc">📅 الأبعد انتهاءً</option>
              <option value="fines_desc">💰 الأعلى غرامة مالية تقديرية</option>
              <option value="name_asc">🔤 اسم الترخيص (أبجدياً)</option>
              <option value="authority_asc">🏛️ السلطة المانحة</option>
            </select>
          </div>

        </div>

        {/* PRIORITY AUTO-SORT STATUS BANNER */}
        {autoPrioritySortEnabled && (
          <div className="bg-gradient-to-l from-amber-50 via-amber-50/70 to-emerald-50/60 border border-amber-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
              <span className="font-bold">
                تم تفعيل الترتيب التلقائي الذكي حسب الأقرب انتهاءً:
              </span>
              <span className="text-amber-800 text-[11px] hidden sm:inline">
                يتم فرز التراخيص من الأكثر إلحاحاً وحرجاً لتسريع إجراءات التجديد وتفادي الغرامات المالية.
              </span>
            </div>

            <span className="bg-amber-200/70 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
              إدارة الأولويات نشطة
            </span>
          </div>
        )}

        {/* ACTIVE FILTERS BREADCRUMBS BAR (If any active) */}
        {activeFiltersCount > 0 && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-emerald-900">
              <span className="font-bold">الفلاتر المطبقة ({filteredAndSortedLicenses.length} من {estLicenses.length} رخصة):</span>
              
              {selectedAuthority !== 'all' && (
                <span className="bg-white text-emerald-950 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span>الجهة: {selectedAuthority}</span>
                  <button onClick={() => setSelectedAuthority('all')} className="hover:text-rose-600 font-bold">✕</button>
                </span>
              )}

              {filterStatus !== 'all' && (
                <span className="bg-white text-emerald-950 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span>الحالة: {
                    filterStatus === 'expired' ? 'منتهية' :
                    filterStatus === 'critical' ? 'حرجة (≤ 15 يوم)' :
                    filterStatus === 'near_expiry' ? 'قريبة الأجل' :
                    filterStatus === 'active' ? 'سارية' :
                    filterStatus === 'mandatory' ? 'إلزامية' : 'تنبيه نشط'
                  }</span>
                  <button onClick={() => setFilterStatus('all')} className="hover:text-rose-600 font-bold">✕</button>
                </span>
              )}

              {selectedBranch !== 'all' && (
                <span className="bg-white text-emerald-950 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span>الفرع: {branches.find(b => b.id === selectedBranch)?.name || selectedBranch}</span>
                  <button onClick={() => setSelectedBranch('all')} className="hover:text-rose-600 font-bold">✕</button>
                </span>
              )}

              {searchQuery && (
                <span className="bg-white text-emerald-950 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span>بحث: «{searchQuery}»</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-600 font-bold">✕</button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-800 underline cursor-pointer"
            >
              إلغاء جميع الفلاتر
            </button>
          </div>
        )}

      </div>

      {/* SECTION 3: Main Licenses View (Cards OR Table View) */}
      {filteredAndSortedLicenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Cairo']">
            لا توجد تراخيص مطابقة لمعايير الفلترة المحددة
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            لم نتمكن من العثور على أي ترخيص يطابق السلطة المانحة أو الحالة المحددة. جرب تفريغ الفلاتر أو البحث بكلمة مختلفة.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط جميع الفلاتر</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* === CARDS VIEW === */
        <div className="space-y-3.5">
          {filteredAndSortedLicenses.map((lic, index) => {
            const badge = getLicenseStatusBadge(lic.status, lic.daysRemaining);
            const penaltyEval = evaluateLicensePenalty(lic, COMPLIANCE_RULES, simulatedDate);
            const isNearOrExpired = lic.daysRemaining <= 30;
            const priorityRank = getPriorityRankBadge(index, lic.daysRemaining);

            return (
              <div
                key={lic.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${priorityRank.ring}`}
              >
                <div className="space-y-2.5 flex-1">
                  
                  {/* Category, Priority Rank & Status Pill Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Auto Priority Rank Badge */}
                    {autoPrioritySortEnabled && (
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md flex items-center gap-1 border shadow-2xs ${priorityRank.color}`}>
                        <Zap className="w-3 h-3 fill-white" />
                        <span>{priorityRank.label}</span>
                      </span>
                    )}

                    {/* Clickable Authority Chip (Direct Filter Shortcut) */}
                    <button
                      type="button"
                      onClick={() => setSelectedAuthority(lic.authority)}
                      title="انقر لتصفية التراخيص حسب هذه الجهة"
                      className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      {getAuthorityBadgeIcon(lic.authority)}
                      <span>{lic.authority}</span>
                    </button>

                    {lic.branchName && (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        <span>{lic.branchName}</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                      {lic.daysRemaining < 0 ? (
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                      ) : lic.daysRemaining <= 30 ? (
                        <Clock className="w-3 h-3 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{badge.label}</span>
                    </span>

                    {/* Calculated Penalty Badge */}
                    {penaltyEval.isExpired ? (
                      <button 
                        type="button"
                        onClick={() => setSelectedPenaltyModal(penaltyEval)}
                        className="cursor-pointer text-[11px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-rose-200 transition-colors"
                      >
                        <Coins className="w-3 h-3" />
                        <span>غرامة تقديرية مستحقة: {formatSAR(penaltyEval.totalEstimatedFine)}</span>
                      </button>
                    ) : penaltyEval.daysRemaining <= 30 ? (
                      <button 
                        type="button"
                        onClick={() => setSelectedPenaltyModal(penaltyEval)}
                        className="cursor-pointer text-[11px] font-semibold text-amber-800 bg-amber-100/80 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-200 transition-colors"
                      >
                        <Coins className="w-3 h-3" />
                        <span>مخاطر غرامة عند الانتهاء: {formatSAR(penaltyEval.projectedFineIfExpired)}</span>
                      </button>
                    ) : null}

                    {lic.isMandatory && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        إلزامي نظاماً
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                      {lic.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>رقم الترخيص: <strong className="text-slate-800 font-mono">{lic.licenseNumber}</strong></span>
                      <span>تاريخ الإصدار: <span className="text-slate-700">{lic.issueDate}</span></span>
                      <span>تاريخ الانتهاء: <strong className="text-slate-900">{lic.expiryDate}</strong></span>
                    </div>
                  </div>

                  {/* Legal Citation & Penalty Brief */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        ⚖️ السند النظامي: {penaltyEval.legalCitation}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        معادلة الاحتساب: {penaltyEval.penaltyFormulaDescription}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPenaltyModal(penaltyEval)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold whitespace-nowrap self-end sm:self-auto cursor-pointer"
                    >
                      عرض تفاصيل الجزاء &larr;
                    </button>
                  </div>
                </div>

                {/* Right Action / Renewal Area */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block text-[11px]">رسوم التجديد التقديرية:</span>
                    <strong className="text-sm font-bold text-slate-900">{formatSAR(lic.costGov + lic.costSabbaq)}</strong>
                    <span className="text-[10px] text-slate-400 block">({formatSAR(lic.costGov)} حكومي + {formatSAR(lic.costSabbaq)} سبّاق)</span>
                  </div>

                  {isNearOrExpired ? (
                    <button
                      onClick={() => onInstantRenew(lic)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>تحويل التنبيه لطلب تجديد فوري</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onInstantRenew(lic)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>تجديد مبكر</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* === TABLE VIEW === */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-bold">
                  {autoPrioritySortEnabled && <th className="p-3.5">الأولوية</th>}
                  <th className="p-3.5">الترخيص ورقم المستند</th>
                  <th className="p-3.5">السلطة المانحة</th>
                  <th className="p-3.5">الفرع / المقر</th>
                  <th className="p-3.5">تاريخ الانتهاء</th>
                  <th className="p-3.5">حالة الصلاحية</th>
                  <th className="p-3.5">الغرامة التقديرية</th>
                  <th className="p-3.5">الرسوم الإجمالية</th>
                  <th className="p-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedLicenses.map((lic, index) => {
                  const badge = getLicenseStatusBadge(lic.status, lic.daysRemaining);
                  const penaltyEval = evaluateLicensePenalty(lic, COMPLIANCE_RULES, simulatedDate);
                  const priorityRank = getPriorityRankBadge(index, lic.daysRemaining);

                  return (
                    <tr 
                      key={lic.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        lic.daysRemaining < 0 ? 'bg-rose-50/30' : lic.daysRemaining <= 15 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {autoPrioritySortEnabled && (
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityRank.color}`}>
                            #{index + 1}
                          </span>
                        </td>
                      )}

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{lic.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{lic.licenseNumber}</div>
                      </td>

                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAuthority(lic.authority)}
                          className="font-bold text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {getAuthorityBadgeIcon(lic.authority)}
                          <span className="truncate max-w-[140px]">{lic.authority}</span>
                        </button>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {lic.branchName || 'المركز الرئيسي'}
                      </td>

                      <td className="p-3.5 text-slate-800 font-mono font-medium">
                        {lic.expiryDate}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {penaltyEval.isExpired ? (
                          <span className="text-rose-600 font-bold font-['Cairo']">
                            {formatSAR(penaltyEval.totalEstimatedFine)}
                          </span>
                        ) : penaltyEval.daysRemaining <= 30 ? (
                          <span className="text-amber-600 font-medium">
                            {formatSAR(penaltyEval.projectedFineIfExpired)} (متوقع)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0 ر.س</span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 font-['Cairo']">
                        {formatSAR(lic.costGov + lic.costSabbaq)}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onInstantRenew(lic)}
                          className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>تجديد</span>
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

      {/* Penalty Detail Modal */}
      {selectedPenaltyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
                  تفصيل احتساب الغرامة وفق قواعد الامتثال
                </h3>
              </div>
              <button
                onClick={() => setSelectedPenaltyModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">الترخيص:</span>
                  <strong className="text-slate-900">{selectedPenaltyModal.licenseName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الجهة المشرفة:</span>
                  <span className="text-slate-800 font-medium">{selectedPenaltyModal.authority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ الانتهاء:</span>
                  <span className="text-slate-900 font-mono font-bold">{selectedPenaltyModal.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حالة الصلاحية:</span>
                  <span className={`font-bold ${selectedPenaltyModal.isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedPenaltyModal.isExpired ? `منتهي منذ ${selectedPenaltyModal.daysExpired} يوم` : `سارٍ (متبقي ${selectedPenaltyModal.daysRemaining} يوم)`}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                <span className="font-bold text-rose-900 block">تفصيل عناصر الغرامة المالية:</span>
                
                <div className="flex justify-between text-slate-700">
                  <span>الغرامة الأساسية الأولية:</span>
                  <strong className="text-slate-900">{formatSAR(selectedPenaltyModal.baseFine)}</strong>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>غرامة التأخير اليومية ({selectedPenaltyModal.daysBeyondGrace} يوم بعد المهلة):</span>
                  <strong className="text-slate-900">+{formatSAR(selectedPenaltyModal.dailyFineAccumulated)}</strong>
                </div>

                <div className="pt-2 border-t border-rose-200 flex justify-between text-sm font-bold text-rose-900 font-['Cairo']">
                  <span>إجمالي الغرامة التقديرية المحتسبة:</span>
                  <span className="text-base text-rose-600">
                    {selectedPenaltyModal.isExpired ? formatSAR(selectedPenaltyModal.totalEstimatedFine) : formatSAR(selectedPenaltyModal.projectedFineIfExpired)}
                  </span>
                </div>
              </div>

              {/* Legal Citation */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-amber-900 font-bold block">⚖️ السند واللائحة التنظيمية:</span>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {selectedPenaltyModal.legalCitation}
                </p>
                <span className="text-amber-700 block text-[10px] mt-1">
                  معادلة الاحتساب: {selectedPenaltyModal.penaltyFormulaDescription}
                </span>
              </div>

              {/* Action */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-900 font-bold block">💡 الإجراء الوقائي المطلوب:</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  {selectedPenaltyModal.actionRequired}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const targetLic = licenses.find(l => l.id === selectedPenaltyModal.licenseId);
                  if (targetLic) onInstantRenew(targetLic);
                  setSelectedPenaltyModal(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تقديم طلب تجديد فوري وإيقاف الغرامة</span>
              </button>

              <button
                onClick={() => setSelectedPenaltyModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
