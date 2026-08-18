import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  BellRing,
  Sparkles, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  CheckCircle2, 
  FileText, 
  Send, 
  Filter, 
  Calendar, 
  Info, 
  Zap, 
  Building2, 
  Layers,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Share2,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  MessageSquareQuote,
  CalendarDays
} from 'lucide-react';
import { 
  Establishment, 
  License, 
  DocumentItem, 
  Branch, 
  ProactiveAlertItem,
  ProactiveAlertWindow,
  ProactiveTimeRangeFilter,
  MasterOrder
} from '../types';
import { 
  analyzeEstablishmentProactiveAlerts, 
  buildProactiveWhatsAppMessage,
  isDateWithinTimeRange,
  PROACTIVE_TIME_RANGE_OPTIONS,
  getTimeRangeDescriptionText
} from '../utils/proactiveAlertEngine';
import { formatSAR } from '../utils/complianceEngine';
import { RenewalOrderWizardModal } from './RenewalOrderWizardModal';
import { LicenseRenewalMiniForecastChart } from './LicenseRenewalMiniForecastChart';
import { SmartReminderModal, SmartReminderData } from './SmartReminderModal';

interface SmartProactiveAlertsCenterProps {
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  branches: Branch[];
  onInstantRenewLicense: (license: License) => void;
  onOpenRenewalProposal?: (docItem: DocumentItem) => void;
  onConsultSpecialist?: (topic: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onCreateOrder?: (order: MasterOrder) => void;
  showToast: (msg: string) => void;
}

export const SmartProactiveAlertsCenter: React.FC<SmartProactiveAlertsCenterProps> = ({
  establishment,
  licenses,
  documents,
  branches,
  onInstantRenewLicense,
  onOpenRenewalProposal,
  onConsultSpecialist,
  onNavigateToTab,
  onCreateOrder,
  showToast,
}) => {
  // Filters State
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<'all' | ProactiveAlertWindow>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<ProactiveTimeRangeFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');

  // Interactive Card & Modal State
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [openMenuAlertId, setOpenMenuAlertId] = useState<string | null>(null);
  const [activeWizardAlert, setActiveWizardAlert] = useState<ProactiveAlertItem | null>(null);
  const [activeReminderAlert, setActiveReminderAlert] = useState<ProactiveAlertItem | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);
  const [copiedAlertId, setCopiedAlertId] = useState<string | null>(null);

  // Scheduled Smart Reminders State (persisted per establishment in localStorage)
  const [scheduledReminders, setScheduledReminders] = useState<Record<string, SmartReminderData>>(() => {
    try {
      const saved = localStorage.getItem(`sabbaq_smart_reminders_${establishment.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Pagination State (e.g. 6 items per page for clean desktop 3-col x 2-row layout)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Compute proactive alerts with exact deduplication and sorting
  const alertSummary = useMemo(() => {
    return analyzeEstablishmentProactiveAlerts(
      establishment,
      licenses,
      documents,
      branches
    );
  }, [establishment, licenses, documents, branches]);

  // Extract unique authorities and document types for filter dropdowns
  const availableAuthorities = useMemo(() => {
    const auths = new Set<string>();
    alertSummary.items.forEach(i => {
      if (i.authority) auths.add(i.authority);
    });
    return Array.from(auths);
  }, [alertSummary.items]);

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return alertSummary.items.filter(item => {
      // 1. Urgency Window Filter
      if (activeUrgencyFilter !== 'all' && item.alertWindow !== activeUrgencyFilter) {
        return false;
      }
      // 2. Time Range Filter
      if (!isDateWithinTimeRange(item.expiryDate, selectedTimeRange, customStartDate, customEndDate)) {
        return false;
      }
      // 3. Branch Filter
      if (selectedBranchId !== 'all' && item.branchId !== selectedBranchId) {
        return false;
      }
      // 4. Authority Filter
      if (selectedAuthority !== 'all' && item.authority !== selectedAuthority) {
        return false;
      }
      // 5. Document Type Filter
      if (selectedDocType !== 'all') {
        if (selectedDocType === 'license' && item.sourceType !== 'license') return false;
        if (selectedDocType === 'contract' && item.category !== 'lease_contract' && !item.isRecurring) return false;
        if (selectedDocType === 'document' && item.sourceType !== 'document') return false;
      }
      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAuth = item.authority.toLowerCase().includes(q);
        const matchesNum = item.documentNumber.toLowerCase().includes(q);
        const matchesBranch = (item.branchName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuth && !matchesNum && !matchesBranch) {
          return false;
        }
      }
      return true;
    });
  }, [
    alertSummary.items, 
    activeUrgencyFilter, 
    selectedTimeRange, 
    customStartDate, 
    customEndDate, 
    selectedBranchId, 
    selectedAuthority, 
    selectedDocType, 
    searchQuery
  ]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleFilterChange = (filterUpdater: () => void) => {
    filterUpdater();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveUrgencyFilter('all');
    setSelectedTimeRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setSelectedBranchId('all');
    setSelectedAuthority('all');
    setSelectedDocType('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    activeUrgencyFilter !== 'all' || 
    selectedTimeRange !== 'all' || 
    customStartDate !== '' || 
    customEndDate !== '' || 
    searchQuery.trim() !== '' || 
    selectedBranchId !== 'all' || 
    selectedAuthority !== 'all' || 
    selectedDocType !== 'all';

  // Toggle card expandable details
  const toggleCardDetails = (id: string) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Simulate AI Rescan
  const handleRescan = () => {
    setIsRescanning(true);
    setTimeout(() => {
      setIsRescanning(false);
      showToast(`تم اكتمال الفحص الذكي: تم تدقيق ${alertSummary.totalAnalyzed} وثيقة وترخيص بنجاح.`);
    }, 800);
  };

  // Trigger primary action: Open Renewal Order Wizard Modal
  const handlePrimaryAction = (item: ProactiveAlertItem) => {
    setActiveWizardAlert(item);
  };

  // Copy alert info
  const handleCopyAlert = (item: ProactiveAlertItem) => {
    const text = `تنبيه سبّاق: ${item.title}\nالجهة: ${item.authority}\nالفرع: ${item.branchName || 'الرئيسي'}\nرقم: ${item.documentNumber}\nتاريخ الانتهاء: ${item.expiryDate} (متبقي ${item.daysRemaining} يوم)`;
    navigator.clipboard.writeText(text);
    setCopiedAlertId(item.id);
    showToast('تم نسخ بيانات التنبيه إلى الحافظة.');
    setTimeout(() => setCopiedAlertId(null), 2000);
    setOpenMenuAlertId(null);
  };

  // Send WhatsApp message
  const handleSendWhatsApp = (item: ProactiveAlertItem) => {
    const encoded = buildProactiveWhatsAppMessage(item, establishment);
    const phone = establishment.contactPhone || '0500000000';
    const cleanPhone = phone.replace(/^0/, '966').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    showToast(`تم تجهيز رسالة التنبيه للمسؤول عبر واتساب.`);
    setOpenMenuAlertId(null);
  };

  // Smart Reminder Management Handlers
  const handleOpenReminderModal = (item: ProactiveAlertItem) => {
    setActiveReminderAlert(item);
    setOpenMenuAlertId(null);
  };

  const handleSaveReminder = (reminder: SmartReminderData) => {
    setScheduledReminders(prev => {
      const updated = { ...prev, [reminder.itemKey]: reminder };
      try {
        localStorage.setItem(`sabbaq_smart_reminders_${establishment.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save smart reminder to localStorage:', e);
      }
      return updated;
    });
  };

  const handleDeleteReminder = (reminderId: string) => {
    setScheduledReminders(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key].id === reminderId) {
          delete updated[key];
        }
      });
      try {
        localStorage.setItem(`sabbaq_smart_reminders_${establishment.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete smart reminder from localStorage:', e);
      }
      return updated;
    });
  };

  // Active Time Range Option definition
  const activeTimeRangeDef = useMemo(() => {
    return PROACTIVE_TIME_RANGE_OPTIONS.find(o => o.id === selectedTimeRange) || PROACTIVE_TIME_RANGE_OPTIONS[0];
  }, [selectedTimeRange]);

  return (
    <div className="space-y-6 font-['Cairo']">
      
      {/* 1. Page Header & Statistical Summary directly at top of content */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        
        {/* Header Title & Subtitle with Quick Rescan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  التنبيه الذكي بالاستباق
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  محرك التنبؤ (60 / 30 / 7 أيام)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                متابعة استباقية لتواريخ انتهاء الرخص والسجلات والمستندات بفرز آلي حسب الأولوية لتفادي الغرامات وإيقاف الخدمات.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRescan}
              disabled={isRescanning}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="إعادة الفحص الذكي للتواريخ"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRescanning ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isRescanning ? 'جاري الفحص...' : 'تحديث الفحص'}</span>
            </button>
          </div>
        </div>

        {/* 5 Concise Statistical Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* Total Alerts */}
          <button
            type="button"
            onClick={() => handleFilterChange(() => setActiveUrgencyFilter('all'))}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeUrgencyFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400">إجمالي التنبيهات</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black font-mono ${activeUrgencyFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
                {alertSummary.totalAlerts}
              </span>
              <span className="text-[10px] opacity-75">وثيقة نشطة</span>
            </div>
          </button>

          {/* Expired (Red) */}
          <button
            type="button"
            onClick={() => handleFilterChange(() => setActiveUrgencyFilter('expired'))}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeUrgencyFilter === 'expired'
                ? 'bg-red-700 text-white border-red-700 ring-2 ring-red-500/30 shadow-xs'
                : 'bg-red-50/70 hover:bg-red-100/70 border-red-200 text-red-900'
            }`}
          >
            <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>منتهي الصلاحية</span>
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-red-700">
                {alertSummary.countExpired}
              </span>
              <span className="text-[10px] text-red-600">إجراء عاجل</span>
            </div>
          </button>

          {/* 7 Days Critical (Red) */}
          <button
            type="button"
            onClick={() => handleFilterChange(() => setActiveUrgencyFilter('7_days'))}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeUrgencyFilter === '7_days'
                ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-500/30 shadow-xs'
                : 'bg-red-50/70 hover:bg-red-100/70 border-red-200 text-red-900'
            }`}
          >
            <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>حرج (≤ 7 أيام)</span>
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-red-700">
                {alertSummary.count7Days}
              </span>
              <span className="text-[10px] text-red-600">سداد فوري</span>
            </div>
          </button>

          {/* 30 Days Operational (Orange) */}
          <button
            type="button"
            onClick={() => handleFilterChange(() => setActiveUrgencyFilter('30_days'))}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeUrgencyFilter === '30_days'
                ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-500/30 shadow-xs'
                : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>استباقي (≤ 30 يوماً)</span>
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-amber-800">
                {alertSummary.count30Days}
              </span>
              <span className="text-[10px] text-amber-700">بدء المعاملات</span>
            </div>
          </button>

          {/* 60 Days Early (Blue) */}
          <button
            type="button"
            onClick={() => handleFilterChange(() => setActiveUrgencyFilter('60_days'))}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeUrgencyFilter === '60_days'
                ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                : 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-900'
            }`}
          >
            <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مبكر (≤ 60 يوماً)</span>
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-blue-800">
                {alertSummary.count60Days}
              </span>
              <span className="text-[10px] text-blue-700">تخطيط الميزانية</span>
            </div>
          </button>

        </div>
      </div>

      {/* 2. Structured Clear Filter Controls (Time Range, Branch, Authority, Doc Type, Urgency, Search) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        
        {/* Quick Time Range Preset Pills */}
        <div className="space-y-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>تصفية سريعة بالنطاق الزمني:</span>
            </div>
            {selectedTimeRange !== 'all' && (
              <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {getTimeRangeDescriptionText(selectedTimeRange, customStartDate, customEndDate)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all' as ProactiveTimeRangeFilter, label: 'كافة الآجال' },
              { id: 'next_30_days' as ProactiveTimeRangeFilter, label: 'خلال الشهر القادم' },
              { id: 'this_quarter' as ProactiveTimeRangeFilter, label: 'هذا الربع' },
              { id: 'next_quarter' as ProactiveTimeRangeFilter, label: 'الربع القادم' },
              { id: 'this_year' as ProactiveTimeRangeFilter, label: 'السنة الحالية' },
              { id: 'next_60_days' as ProactiveTimeRangeFilter, label: 'خلال 60 يوماً' },
              { id: 'custom' as ProactiveTimeRangeFilter, label: 'نطاق مخصص 📅' }
            ].map(pill => {
              const isActive = selectedTimeRange === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleFilterChange(() => setSelectedTimeRange(pill.id))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Picker (Expanded when selectedTimeRange === 'custom') */}
        {selectedTimeRange === 'custom' && (
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <span>حدد نطاق تاريخ انتهاء الصلاحية المخصص:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setDate(today.getDate() + 30);
                    setCustomStartDate(today.toISOString().split('T')[0]);
                    setCustomEndDate(nextMonth.toISOString().split('T')[0]);
                    setCurrentPage(1);
                  }}
                  className="text-[10px] bg-white hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-200 cursor-pointer"
                >
                  +30 يوم
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const next90 = new Date(today);
                    next90.setDate(today.getDate() + 90);
                    setCustomStartDate(today.toISOString().split('T')[0]);
                    setCustomEndDate(next90.toISOString().split('T')[0]);
                    setCurrentPage(1);
                  }}
                  className="text-[10px] bg-white hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-200 cursor-pointer"
                >
                  +90 يوم
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const endOfYear = new Date(today.getFullYear(), 11, 31);
                    setCustomStartDate(today.toISOString().split('T')[0]);
                    setCustomEndDate(endOfYear.toISOString().split('T')[0]);
                    setCurrentPage(1);
                  }}
                  className="text-[10px] bg-white hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-md border border-indigo-200 cursor-pointer"
                >
                  حتى نهاية السنة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  من تاريخ (البداية):
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => handleFilterChange(() => setCustomStartDate(e.target.value))}
                  className="w-full bg-white border border-indigo-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  إلى تاريخ (الانتهاء):
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => handleFilterChange(() => setCustomEndDate(e.target.value))}
                  className="w-full bg-white border border-indigo-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                {(customStartDate || customEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>مسح التواريخ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standard Multi-Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-8 pl-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleFilterChange(() => setSearchQuery(''))}
                className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Range Dropdown */}
          <div className="relative">
            <select
              value={selectedTimeRange}
              onChange={(e) => handleFilterChange(() => setSelectedTimeRange(e.target.value as ProactiveTimeRangeFilter))}
              className="w-full bg-slate-50 border border-indigo-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              {PROACTIVE_TIME_RANGE_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranchId}
              onChange={(e) => handleFilterChange(() => setSelectedBranchId(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">كافة الفروع والمواقع ({branches.length})</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Authority Filter */}
          <div>
            <select
              value={selectedAuthority}
              onChange={(e) => handleFilterChange(() => setSelectedAuthority(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">كافة الجهات الحكومية</option>
              {availableAuthorities.map((auth, idx) => (
                <option key={idx} value={auth}>{auth}</option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <select
              value={selectedDocType}
              onChange={(e) => handleFilterChange(() => setSelectedDocType(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">كافة أنواع الوثائق</option>
              <option value="license">التراخيص المهنية والبلدية</option>
              <option value="contract">عقود الإيجار والخدمات</option>
              <option value="document">المستندات والسجلات الرقمية</option>
            </select>
          </div>

          {/* Urgency Level Filter + Reset */}
          <div className="flex items-center gap-2">
            <select
              value={activeUrgencyFilter}
              onChange={(e) => handleFilterChange(() => setActiveUrgencyFilter(e.target.value as any))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">كافة مستويات الاستعجال</option>
              <option value="expired">منتهي الصلاحية</option>
              <option value="7_days">حرج جداً (≤ 7 أيام)</option>
              <option value="30_days">استباقي (≤ 30 يوماً)</option>
              <option value="60_days">مبكر (≤ 60 يوماً)</option>
              <option value="safe">سارٍ ومنتظم</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                title="تفريغ جميع الفلاتر"
              >
                تفريغ
              </button>
            )}
          </div>

        </div>

        {/* Active Results Summary & Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              عرض <strong className="text-slate-800">{filteredItems.length}</strong> ترخيص ووثيقة مطابقة للبحث والفرز
            </span>

            {/* Active Range Badge */}
            {selectedTimeRange !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200 text-[11px] font-bold">
                <Calendar className="w-3 h-3" />
                <span>النطاق: {activeTimeRangeDef.shortLabel}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setSelectedTimeRange('all'))}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Custom Dates Badge */}
            {(customStartDate || customEndDate) && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-lg border border-purple-200 text-[11px] font-bold">
                <span>{customStartDate || 'البداية'} ⟵ {customEndDate || 'النهاية'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setCurrentPage(1);
                  }}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Urgency Badge */}
            {activeUrgencyFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200 text-[11px] font-bold">
                <span>الاستعجال: {activeUrgencyFilter}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setActiveUrgencyFilter('all'))}
                  className="hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
            >
              إعادة ضبط كافة الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* 3. Proactive Alert Cards: 3 in row on Desktop, 1 on Mobile */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">
              لا توجد تراخيص أو وثائق مطابقة للنطاق الزمني المحدد
            </h3>
            <p className="text-xs text-slate-500">
              {selectedTimeRange === 'custom' 
                ? 'لم يتم العثور على تراخيص تنتهي ضمن التواريخ المحددة. جرب توسيع النطاق الزمني.'
                : 'جميع التراخيص والوثائق سارية خارج هذا النطاق، أو تم تطبيق شروط فرز إضافية.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-200"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((item) => {
            const isExpired = item.alertWindow === 'expired' || item.daysRemaining < 0;
            const is7Days = item.alertWindow === '7_days' || (item.daysRemaining >= 0 && item.daysRemaining <= 7);
            const is30Days = item.alertWindow === '30_days' || (item.daysRemaining > 7 && item.daysRemaining <= 30);
            const is60Days = item.alertWindow === '60_days' || (item.daysRemaining > 30 && item.daysRemaining <= 60);
            const isSafe = !isExpired && !is7Days && !is30Days && !is60Days;

            // Unified Visual States:
            // Red: Expired & <= 7 Days
            // Orange: <= 30 Days
            // Blue: <= 60 Days
            // Emerald: Safe (> 60 Days)
            const isRed = isExpired || is7Days;
            const isOrange = is30Days;
            const isBlue = is60Days;
            const isGreen = isSafe;

            const isExpanded = expandedCardIds.has(item.id);
            const isMenuOpen = openMenuAlertId === item.id;
            const itemReminder = scheduledReminders[item.id];

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-visible relative group ${
                  isRed
                    ? 'border-red-200 hover:border-red-300'
                    : isOrange
                    ? 'border-amber-200 hover:border-amber-300'
                    : isBlue
                    ? 'border-blue-200 hover:border-blue-300'
                    : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                {/* Visual Top Ribbon Color */}
                <div className={`h-1.5 w-full rounded-t-2xl ${
                  isRed 
                    ? 'bg-red-600' 
                    : isOrange 
                    ? 'bg-amber-500' 
                    : isBlue 
                    ? 'bg-blue-600' 
                    : 'bg-emerald-500'
                }`} />

                <div className="p-4 sm:p-5 space-y-3.5">
                  
                  {/* Card Header: Status Badge + Authority + Options Menu (⋮) */}
                  <div className="flex items-start justify-between gap-2 relative">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                      isRed
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : isOrange
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : isBlue
                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {is7Days && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                      <span>{item.alertStageLabel}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Smart Reminder Quick Indicator / Button */}
                      {itemReminder ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReminderModal(item)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                          title="تذكير ذكي مجدول - انقر للتعديل"
                        >
                          <BellRing className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span className="font-mono">قبل {itemReminder.daysBefore} أيام</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReminderModal(item)}
                          className="p-1 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="جدولة تذكير ذكي (قبل 3 أيام)"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}

                      <span className="text-xs text-slate-500 font-medium truncate max-w-[95px]" title={item.authority}>
                        {item.authorityLogo} {item.authority}
                      </span>

                      {/* Dropdown Options Kebab (⋮) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuAlertId(isMenuOpen ? null : item.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="خيارات إضافية"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setOpenMenuAlertId(null)} />
                            <div className="absolute left-0 top-6 z-30 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in-50 zoom-in-95">
                              
                              {/* Schedule / Edit Smart Reminder Menu Item */}
                              <button
                                type="button"
                                onClick={() => handleOpenReminderModal(item)}
                                className="w-full text-right px-3.5 py-2 hover:bg-indigo-50 text-indigo-900 font-bold flex items-center gap-2 cursor-pointer"
                              >
                                <BellRing className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{itemReminder ? 'تعديل التذكير الذكي' : 'جدولة تذكير ذكي (قبل 3 أيام)'}</span>
                              </button>

                              {onConsultSpecialist && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onConsultSpecialist(`استشارة بشأن تجديد ${item.title} رقم ${item.documentNumber}`);
                                    setOpenMenuAlertId(null);
                                  }}
                                  className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>طلب استشارة مختص</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSendWhatsApp(item)}
                                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5 text-emerald-600" />
                                <span>إرسال تذكير عبر واتساب</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyAlert(item)}
                                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>نسخ بيانات التنبيه</span>
                              </button>

                              {onNavigateToTab && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onNavigateToTab(item.sourceType === 'license' ? 'licenses' : 'company_documents');
                                    setOpenMenuAlertId(null);
                                  }}
                                  className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  <span>عرض في محفظة الوثائق</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* License / Document Title */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {/* Branch & Doc Number */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 font-bold">
                        #{item.documentNumber}
                      </span>
                      {item.branchName && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{item.branchName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standardized Dates & Days Remaining Box */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">تاريخ الانتهاء:</span>
                      <span className="font-mono font-bold text-slate-800">{item.expiryDate}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">المدة المتبقية:</span>
                      <span className={`font-mono font-black ${
                        isRed 
                          ? 'text-red-700' 
                          : isOrange 
                          ? 'text-amber-700' 
                          : isBlue 
                          ? 'text-blue-700' 
                          : 'text-emerald-700'
                      }`}>
                        {item.daysRemaining < 0 
                          ? `منتهي منذ ${Math.abs(item.daysRemaining)} يوماً` 
                          : `متبقي ${item.daysRemaining} يوماً`}
                      </span>
                    </div>
                  </div>

                  {/* 3-Year Financial Forecast Mini Chart */}
                  <LicenseRenewalMiniForecastChart
                    baseGovFee={item.costGovEstimated !== undefined ? item.costGovEstimated : 1200}
                    expiryDate={item.expiryDate}
                    category={item.category}
                    title={item.title}
                    authority={item.authority}
                    themeColor={isRed ? 'red' : isOrange ? 'amber' : isBlue ? 'blue' : 'emerald'}
                  />

                  {/* Expandable Details Accordion Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleCardDetails(item.id)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Hidden detailed breakdown inside view details */}
                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-xs space-y-2.5 animate-in fade-in-50">
                        
                        {/* If smart reminder is scheduled for this item, display reminder banner */}
                        {itemReminder && (
                          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-950 block text-[11px]">
                                  تذكير ذكي مجدول: قبل الانتهاء بـ {itemReminder.daysBefore} أيام
                                </span>
                                <span className="text-[10px] text-amber-800 font-mono block mt-0.5">
                                  تاريخ الإرسال: {itemReminder.calculatedTriggerDate}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-700">
                                  <span>القنوات:</span>
                                  {itemReminder.channels.email && <span className="bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300/50">البريد الإلكتروني</span>}
                                  {itemReminder.channels.inApp && <span className="bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300/50">إشعار المنصة</span>}
                                  {itemReminder.channels.whatsapp && <span className="bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300/50">واتساب</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenReminderModal(item)}
                              className="px-2 py-1 rounded-md bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                            >
                              تعديل
                            </button>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>توجيه الاستباق الذكي:</span>
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {item.proactiveAdvice}
                          </p>
                        </div>

                        <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">الرسوم الحكومية المقدرة:</span>
                          <span className="font-bold font-mono text-slate-800">
                            {formatSAR(item.costGovEstimated || 1200)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* 8. Card Footer: ONLY ONE Prominent Primary Action Button */}
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handlePrimaryAction(item)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isRed
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : isOrange
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isBlue
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isGreen ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>{isGreen ? 'تجديد مبكر / ترقية' : 'تجديد الآن'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 10. Clean Pagination Controls */}
      {filteredItems.length > itemsPerPage && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-center sm:text-right">
            عرض صفحة <strong className="text-slate-800">{currentPage}</strong> من أصل <strong className="text-slate-800">{totalPages}</strong> ({filteredItems.length} تنبيه إجمالي)
          </span>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-xl font-bold font-mono transition-colors cursor-pointer ${
                  currentPage === p
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 11. Smart Reminder Modal (قبل موعد التجديد النهائي بـ 3 أيام) */}
      <SmartReminderModal
        isOpen={!!activeReminderAlert}
        onClose={() => setActiveReminderAlert(null)}
        item={activeReminderAlert}
        establishment={establishment}
        existingReminder={activeReminderAlert ? scheduledReminders[activeReminderAlert.id] : null}
        onSaveReminder={handleSaveReminder}
        onDeleteReminder={handleDeleteReminder}
        showToast={showToast}
      />

      {/* 12. Full Multi-Step Renewal Order Wizard Modal */}
      <RenewalOrderWizardModal
        alertItem={activeWizardAlert}
        establishment={establishment}
        documents={documents}
        isOpen={!!activeWizardAlert}
        onClose={() => setActiveWizardAlert(null)}
        onCreateOrder={(order) => {
          if (onCreateOrder) onCreateOrder(order);
        }}
        onNavigateToOrders={(orderId) => {
          if (onNavigateToTab) {
            onNavigateToTab('new_order');
            showToast(`تم فتح متابعة الطلب رقم ${orderId}`);
          }
        }}
        showToast={showToast}
      />

    </div>
  );
};
