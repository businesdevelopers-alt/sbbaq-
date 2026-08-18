import React, { useState, useMemo } from 'react';
import {
  Store,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Zap,
  MapPin,
  Calendar,
  ChevronRight,
  Eye,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  SlidersHorizontal,
  ExternalLink,
  History,
  FileCheck2,
  Receipt,
  Camera,
  Briefcase,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Star
} from 'lucide-react';
import {
  RemediationCategory,
  RemediationSolution,
  Supplier,
  SupplyRequest,
  SupplierQuote,
  OrderStatusHistoryItem,
  UserAccount
} from '../types';
import {
  MOCK_REMEDIATION_SOLUTIONS,
  MOCK_SUPPLIERS,
  MOCK_SUPPLY_REQUESTS,
  MOCK_SUPPLIER_QUOTES,
  MOCK_ORDER_STATUS_HISTORY
} from '../data/complianceMarketData';
import { formatSAR } from '../utils/complianceEngine';

interface SupplierDashboardProps {
  currentUser?: UserAccount;
  onNavigateTab?: (tab: string) => void;
  showToast: (msg: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  currentUser,
  onNavigateTab,
  showToast
}) => {
  // Current active supplier (Default to first platinum supplier in mock data)
  const [activeSupplier, setActiveSupplier] = useState<Supplier>(() => {
    return MOCK_SUPPLIERS[0];
  });

  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'my_quotes' | 'active_orders' | 'catalog' | 'performance'>('requests');

  // Data states
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(MOCK_SUPPLY_REQUESTS);
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>(MOCK_SUPPLIER_QUOTES);
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistoryItem[]>(MOCK_ORDER_STATUS_HISTORY);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RemediationCategory | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<SupplyRequest | null>(null);
  const [selectedRequestForHistory, setSelectedRequestForHistory] = useState<SupplyRequest | null>(null);
  const [selectedRequestForStatusUpdate, setSelectedRequestForStatusUpdate] = useState<SupplyRequest | null>(null);

  // Emergency toggle
  const [isAvailableForEmergency, setIsAvailableForEmergency] = useState(activeSupplier.isAvailableForEmergency);

  // Quote Form State
  const [quotePriceSAR, setQuotePriceSAR] = useState<number>(3500);
  const [quoteLeadDays, setQuoteLeadDays] = useState<number>(3);
  const [quoteProposalSummary, setQuoteProposalSummary] = useState<string>('');
  const [quoteIncludedWarrantyMonths, setQuoteIncludedWarrantyMonths] = useState<number>(12);
  const [quoteHasLetter, setQuoteHasLetter] = useState<boolean>(true);
  const [quoteTechnicalNotes, setQuoteTechnicalNotes] = useState<string>('');

  // Status Update Form State
  const [newOrderStatus, setNewOrderStatus] = useState<SupplyRequest['status']>('in_execution');
  const [statusComment, setStatusComment] = useState<string>('');

  // Category mapping
  const categoryLabels: Record<RemediationCategory, { label: string; icon: any; color: string }> = {
    civil_defense: { label: 'الدفاع المدني والسلامة', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    balady: { label: 'البلديات والتراخيص', icon: Building2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    zatca: { label: 'الزكاة والفوترة الإلكترونية', icon: Receipt, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    qiwa_muqeem: { label: 'العمل والتشغيل (قوى)', icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    occupational_health: { label: 'السلامة والصحة المهنية', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    legal_consulting: { label: 'الاستشارات والاعتراضات', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    environmental: { label: 'البيئة والتخلص من النفايات', icon: Layers, color: 'text-green-600 bg-green-50 border-green-200' },
    technical_security: { label: 'الأمن والرقابة والكاميرات', icon: Camera, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return supplyRequests.filter((req) => {
      const matchSearch =
        req.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.locationCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || req.category === selectedCategory;
      const matchUrgency = selectedUrgency === 'all' || req.urgencyLevel === selectedUrgency;

      return matchSearch && matchCategory && matchUrgency;
    });
  }, [supplyRequests, searchQuery, selectedCategory, selectedUrgency]);

  // Supplier's submitted quotes
  const myQuotes = useMemo(() => {
    return supplierQuotes.filter((q) => q.supplierId === activeSupplier.id);
  }, [supplierQuotes, activeSupplier.id]);

  // Supplier's active won orders
  const myActiveOrders = useMemo(() => {
    const acceptedQuoteRequestIds = supplierQuotes
      .filter((q) => q.supplierId === activeSupplier.id && q.status === 'accepted')
      .map((q) => q.requestId);

    return supplyRequests.filter((r) => acceptedQuoteRequestIds.includes(r.id) || r.selectedQuoteId?.startsWith(activeSupplier.id));
  }, [supplyRequests, supplierQuotes, activeSupplier.id]);

  // KPIs
  const stats = useMemo(() => {
    const totalQuotesSubmitted = myQuotes.length;
    const acceptedQuotes = myQuotes.filter((q) => q.status === 'accepted').length;
    const activeOrdersCount = myActiveOrders.filter((o) => o.status === 'in_execution' || o.status === 'quote_accepted').length;
    const totalRevenueSAR = myQuotes
      .filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + q.totalSAR, 0);

    const winRate = totalQuotesSubmitted > 0 ? Math.round((acceptedQuotes / totalQuotesSubmitted) * 100) : 0;

    return {
      totalQuotesSubmitted,
      acceptedQuotes,
      activeOrdersCount,
      totalRevenueSAR,
      winRate,
      openRequestsMarketCount: supplyRequests.filter((r) => r.status === 'open_for_quotes' || r.status === 'under_evaluation').length
    };
  }, [myQuotes, myActiveOrders, supplyRequests]);

  // Handle opening quote modal for a request
  const handleOpenQuoteModal = (req: SupplyRequest) => {
    setSelectedRequestForQuote(req);
    // Suggest price based on solution or budget
    if (req.maxBudget) {
      setQuotePriceSAR(Math.round(req.maxBudget * 0.85));
    } else {
      setQuotePriceSAR(3200);
    }
    setQuoteLeadDays(req.urgencyLevel === 'urgent_inspection' ? 1 : 3);
    setQuoteProposalSummary(`تقديم حل امتثال متكامل لتلبية متطلبات ${req.titleAr} وفق الاشتراطات الرسمية المعتمدة مع توثيق إلكتروني فوري.`);
    setQuoteIncludedWarrantyMonths(12);
    setQuoteHasLetter(true);
    setQuoteTechnicalNotes('');
  };

  // Handle submitting quote
  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForQuote) return;

    const vat = Math.round(quotePriceSAR * 0.15);
    const total = quotePriceSAR + vat;

    const newQuote: SupplierQuote = {
      id: `qt-${Date.now()}`,
      quoteNumber: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: selectedRequestForQuote.id,
      supplierId: activeSupplier.id,
      supplierName: activeSupplier.nameAr,
      supplierVerificationLevel: activeSupplier.verificationLevel,
      supplierRating: activeSupplier.rating,
      priceSAR: quotePriceSAR,
      vatSAR: vat,
      totalSAR: total,
      proposedExecutionDays: quoteLeadDays,
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'submitted',
      statusLabelAr: 'تم التقديم للعميل',
      proposalSummaryAr: quoteProposalSummary,
      deliverablesOfferedAr: selectedRequestForQuote.requiredDeliverablesAr || ['شهادة إنجاز معتمدة', 'عقد صيانة موثق'],
      includedWarrantyMonths: quoteIncludedWarrantyMonths,
      hasOfficialCertificationLetter: quoteHasLetter,
      technicalNotes: quoteTechnicalNotes,
      submittedAt: new Date().toISOString(),
      isBestValue: quotePriceSAR <= (selectedRequestForQuote.maxBudget || 5000)
    };

    setSupplierQuotes((prev) => [newQuote, ...prev]);

    // Update request quotes count and status
    setSupplyRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequestForQuote.id
          ? {
              ...r,
              quotesReceivedCount: (r.quotesReceivedCount || 0) + 1,
              status: 'under_evaluation',
              statusLabelAr: 'قيد مراجعة العروض',
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    // Add to history
    const historyItem: OrderStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      requestId: selectedRequestForQuote.id,
      requestNumber: selectedRequestForQuote.requestNumber,
      previousStatus: selectedRequestForQuote.status,
      newStatus: 'under_evaluation',
      statusLabelAr: 'تقديم عرض سعر جديد',
      changedBy: `المورد: ${activeSupplier.nameAr}`,
      timestamp: new Date().toISOString(),
      commentsAr: `تم تقديم عرض سعر بقيمة ${formatSAR(total)} مع الالتزام بالإنجاز خلال ${quoteLeadDays} أيام.`,
      actionRequiredFrom: 'establishment'
    };
    setOrderHistory((prev) => [historyItem, ...prev]);

    showToast(`تم إرسال عرض السعر بنجاح برقم: ${newQuote.quoteNumber}`);
    setSelectedRequestForQuote(null);
  };

  // Handle updating order status
  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForStatusUpdate) return;

    const statusLabels: Record<SupplyRequest['status'], string> = {
      open_for_quotes: 'متاح للعروض',
      under_evaluation: 'قيد المراجعة',
      quote_accepted: 'تم القبول والتعميد',
      in_execution: 'جاري التنفيذ الميداني',
      inspection_pending: 'بانتظار الفحص والمعاينة الحكومية',
      completed: 'مكتمل ومطابق 100%',
      cancelled: 'ملغي'
    };

    setSupplyRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequestForStatusUpdate.id
          ? {
              ...r,
              status: newOrderStatus,
              statusLabelAr: statusLabels[newOrderStatus] || newOrderStatus,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    const historyItem: OrderStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      requestId: selectedRequestForStatusUpdate.id,
      requestNumber: selectedRequestForStatusUpdate.requestNumber,
      previousStatus: selectedRequestForStatusUpdate.status,
      newStatus: newOrderStatus,
      statusLabelAr: statusLabels[newOrderStatus],
      changedBy: `المورد: ${activeSupplier.nameAr}`,
      timestamp: new Date().toISOString(),
      commentsAr: statusComment || `تم تحديث مرحلة الإنجاز إلى: ${statusLabels[newOrderStatus]}`,
      actionRequiredFrom: newOrderStatus === 'completed' ? 'none' : 'establishment'
    };
    setOrderHistory((prev) => [historyItem, ...prev]);

    showToast(`تم تحديث حالة الطلب ${selectedRequestForStatusUpdate.requestNumber} بنجاح.`);
    setSelectedRequestForStatusUpdate(null);
    setStatusComment('');
  };

  return (
    <div className="space-y-6 font-['Cairo'] pb-12">
      {/* 1. Supplier Top Hero & Accreditation Profile Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1 rounded-full">
                <Store className="w-3.5 h-3.5" />
                <span>بوابة المورد ومزود حلول الامتثال المعتمد</span>
              </span>

              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold px-3 py-1 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeSupplier.verificationLabelAr}</span>
              </span>

              <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono">
                س.ت: {activeSupplier.commercialRegNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeSupplier.nameAr}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeSupplier.descriptionAr}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>المقر: {activeSupplier.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{activeSupplier.rating}</span>
                <span className="text-slate-400">({activeSupplier.reviewCount} تقييم موثق)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>نسبة القبول الحكومي:</span>
                <span className="font-bold text-emerald-300 font-mono">{activeSupplier.complianceAcceptanceRate}%</span>
              </div>
            </div>
          </div>

          {/* Supplier Quick Controls & Emergency Readiness */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className={`w-4 h-4 ${isAvailableForEmergency ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>طوارئ التفتيش والمخالفات العاجلة (24-48 ساعة)</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {isAvailableForEmergency ? 'مفعل: تستقبل طلبات التدخل السريع قبل انتهاء مهل الاعتراض' : 'معطل: استقبال الطلبات العادية فقط'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAvailableForEmergency((prev) => {
                    const next = !prev;
                    showToast(next ? 'تم تفعيل استقبال طلبات طوارئ التفتيش الفورية.' : 'تم إيقاف استقبال طلبات الطوارئ.');
                    return next;
                  });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isAvailableForEmergency ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailableForEmergency ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>الهيئات المعتمدة:</span>
              <span className="font-bold text-emerald-400 text-right">
                {activeSupplier.accreditationBodiesAr.join(' • ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">سوق الطلبات المتاحة</span>
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">{stats.openRequestsMarketCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">متاح للتقديم</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">عروضي المقدمة</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">{stats.totalQuotesSubmitted}</p>
          <span className="text-[10px] text-slate-400 font-medium">عرض مسجل</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">العقود المعمدة</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 font-mono">{stats.acceptedQuotes}</p>
          <span className="text-[10px] text-amber-700 font-bold">تم اختيار العرض</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">قيد التنفيذ والتوريد</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-extrabold text-teal-700 font-mono">{stats.activeOrdersCount}</p>
          <span className="text-[10px] text-teal-600 font-bold">مشاريع جارية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">نسبة الفوز بالعروض</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 font-mono">{stats.winRate}%</p>
          <span className="text-[10px] text-emerald-700 font-medium">معدل الترسية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">العوائد المعتمدة</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-base font-extrabold text-indigo-950 font-['Cairo']">{formatSAR(stats.totalRevenueSAR)}</p>
          <span className="text-[10px] text-indigo-600 font-bold">شامل الضريبة</span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>سوق طلبات عروض الأسعار (RFQs)</span>
            <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              {stats.openRequestsMarketCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('my_quotes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'my_quotes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>عروضي المقدمة ومتابعتها</span>
            <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {myQuotes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('active_orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'active_orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>الطلبات المعمدة وقيد التنفيذ</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {myActiveOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>كتالوج الحلول المعتمدة</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">تبديل حساب المورد التجريبي:</span>
          <select
            value={activeSupplier.id}
            onChange={(e) => {
              const found = MOCK_SUPPLIERS.find((s) => s.id === e.target.value);
              if (found) {
                setActiveSupplier(found);
                setIsAvailableForEmergency(found.isAvailableForEmergency);
                showToast(`تم التبديل إلى حساب المورد: ${found.nameAr}`);
              }
            }}
            className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {MOCK_SUPPLIERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr} ({s.verificationLabelAr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. SUB-TAB 1: REQUESTS MARKET (سوق طلبات عروض الأسعار) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم المنشأة، نوع الاحتياج، أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>التصنيف:</span>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="all">جميع القطاعات والتصنيفات</option>
                <option value="civil_defense">الدفاع المدني والسلامة</option>
                <option value="balady">البلديات والتراخيص</option>
                <option value="zatca">الفوترة والربط الإلكتروني</option>
                <option value="technical_security">الأمن والكاميرات</option>
                <option value="legal_consulting">الاستشارات والاعتراضات</option>
                <option value="qiwa_muqeem">العمل والتشغيل</option>
              </select>

              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="all">جميع مستويات الإلحاح</option>
                <option value="emergency">طوارئ وتفتيش عاجل (24 ساعة)</option>
                <option value="deadline_approaching">مهلة تصحيحية تقترب</option>
                <option value="normal">عادي ومجدول</option>
              </select>
            </div>
          </div>

          {/* Requests Grid */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد طلبات توريد مطابقة لمعايير البحث</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جرب تغيير خيارات الفلترة أو إعادة ضبط شريط البحث لاستعراض كافة طلبات عروض الأسعار المطروحة.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedUrgency('all');
                }}
                className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRequests.map((req) => {
                const catInfo = categoryLabels[req.category] || {
                  label: 'امتثال عام',
                  icon: ShieldCheck,
                  color: 'text-slate-600 bg-slate-50 border-slate-200'
                };
                const CatIcon = catInfo.icon;
                const existingQuote = supplierQuotes.find(
                  (q) => q.requestId === req.id && q.supplierId === activeSupplier.id
                );

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                            {req.requestNumber}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${catInfo.color}`}>
                            <CatIcon className="w-3 h-3" />
                            <span>{catInfo.label}</span>
                          </span>
                        </div>

                        {req.urgencyLevel === 'emergency' || req.urgencyLevel === 'urgent_inspection' ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>عاجل / تفتيش رقابي</span>
                          </span>
                        ) : req.urgencyLevel === 'deadline_approaching' ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>مهلة تصحيح</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            مجدول
                          </span>
                        )}
                      </div>

                      {/* Title & Organization */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {req.titleAr}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.establishmentName}</span>
                          {req.branchName && <span className="text-slate-400">• {req.branchName}</span>}
                        </p>
                      </div>

                      {/* Description Scope */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        {req.scopeDescriptionAr}
                      </p>

                      {/* Deliverables tags */}
                      {req.requiredDeliverablesAr && req.requiredDeliverablesAr.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500">المخرجات والشهادات المطلوبة:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {req.requiredDeliverablesAr.map((deliv, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{deliv}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location and Deadlines */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">الموقع:</span>
                          <span className="font-semibold text-slate-700">{req.locationCity}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">آخر موعد للعروض:</span>
                          <span className="font-bold text-slate-900 font-mono">{req.deadlineDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">الميزانية المستهدفة:</span>
                          <span className="font-extrabold text-emerald-700 font-mono">
                            {req.maxBudget ? formatSAR(req.maxBudget) : 'مفتوح للتنافس'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRequestForHistory(req)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>سجل التتبع ({orderHistory.filter((h) => h.requestId === req.id).length})</span>
                      </button>

                      {existingQuote ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>عرضك مقدم ({formatSAR(existingQuote.totalSAR)})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModal(req)}
                            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            تعديل العرض
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(req)}
                          className="bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-300" />
                          <span>تقديم عرض سعر فوري</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 2: MY QUOTES (عروضي المقدمة ومتابعتها) */}
      {activeSubTab === 'my_quotes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  سجل عروض الأسعار المقدمة من {activeSupplier.nameAr}
                </h3>
                <p className="text-xs text-slate-500">
                  متابعة حالة العروض التنافسية المقدمة للشركات والمنشآت وتواريخ صلاحيتها وموقف الترسية.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                إجمالي العروض: {myQuotes.length}
              </span>
            </div>

            {myQuotes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                لم تقدم أي عروض أسعار حتى الآن. تصفح سوق الطلبات المتاحة لتقديم أول عرض.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myQuotes.map((quote) => {
                  const req = supplyRequests.find((r) => r.id === quote.requestId);
                  const isAccepted = quote.status === 'accepted';
                  const isShortlisted = quote.status === 'shortlisted';

                  return (
                    <div key={quote.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {quote.quoteNumber}
                          </span>
                          <span className="text-xs text-slate-400">• لطلب {req?.requestNumber || quote.requestId}</span>
                          {quote.isBestValue && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              <span>الأفضل قيمة ومطابقة</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900">
                          {req?.titleAr || 'طلب توريد وحل امتثال'}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{quote.proposalSummaryAr}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span>مدة الإنجاز: <strong className="text-slate-700">{quote.proposedExecutionDays} أيام</strong></span>
                          <span>الضمان: <strong className="text-slate-700">{quote.includedWarrantyMonths} شهر</strong></span>
                          <span>صالح حتى: <strong className="text-slate-700 font-mono">{quote.validUntil}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">القيمة الإجمالية:</span>
                          <span className="text-base font-extrabold text-slate-900 font-['Cairo']">
                            {formatSAR(quote.totalSAR)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">شامل الضريبة ({formatSAR(quote.vatSAR)})</span>
                        </div>

                        <div>
                          {isAccepted ? (
                            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>مقبول ومعمد للبدء</span>
                            </span>
                          ) : isShortlisted ? (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>في القائمة القصيرة</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>قيد مراجعة المنشأة</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 3: ACTIVE WON ORDERS & EXECUTION (الطلبات المعمدة وقيد التنفيذ) */}
      {activeSubTab === 'active_orders' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  المشاريع والطلبات المعمدة قيد التنفيذ والتوريد
                </h3>
                <p className="text-xs text-slate-500">
                  تحديث مراحل الإنجاز الميداني، إرفاق تقارير الفحص والاعتماد وإصدار شهادات الامتثال للعملاء.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {myActiveOrders.length} طلبات قيد الإنجاز
              </span>
            </div>

            {myActiveOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                لا توجد طلبات معمدة جارية حالياً. فور قبول عروض الأسعار ستظهر هنا لمتابعة خطوات التنفيذ.
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                              {order.requestNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{order.establishmentName}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-1">{order.titleAr}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {order.statusLabelAr}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequestForStatusUpdate(order);
                              setNewOrderStatus(order.status);
                              setStatusComment('');
                            }}
                            className="bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            تحديث مرحلة الطلب
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar and Steps */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2 rounded-lg ${order.status !== 'open_for_quotes' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                            1. قبول العرض والتعميد
                          </div>
                          <div className={`p-2 rounded-lg ${order.status === 'in_execution' || order.status === 'inspection_pending' || order.status === 'completed' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                            2. التوريد والتنفيذ الميداني
                          </div>
                          <div className={`p-2 rounded-lg ${order.status === 'inspection_pending' || order.status === 'completed' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                            3. الفحص والاعتماد الحكومي
                          </div>
                          <div className={`p-2 rounded-lg ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                            4. اكتمال الامتثال والمطابقة
                          </div>
                        </div>
                      </div>

                      {/* Scope & Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                        <span>الموقع: {order.locationCity} {order.locationAddressDetails ? `(${order.locationAddressDetails})` : ''}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedRequestForHistory(order)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>عرض سجل التحديثات الزمني كامل</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. SUB-TAB 4: CATALOG SOLUTIONS (كتالوج حلول الامتثال المعتمدة) */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  كتالوج حلول وحزم الامتثال والتوريد الذكي
                </h3>
                <p className="text-xs text-slate-500">
                  الحلول المعيارية المعروضة للمنشآت لمعالجة المخالفات واشتراطات الدفاع المدني والبلديات والزكاة.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_REMEDIATION_SOLUTIONS.map((sol) => {
                const catInfo = categoryLabels[sol.category] || {
                  label: sol.categoryLabelAr,
                  icon: ShieldCheck,
                  color: 'text-slate-600 bg-slate-50 border-slate-200'
                };
                const CatIcon = catInfo.icon;

                return (
                  <div
                    key={sol.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white flex flex-col justify-between space-y-4 shadow-2xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {sol.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${catInfo.color}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catInfo.label}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {sol.titleAr}
                      </h4>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {sol.descriptionAr}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400">يعالج اشتراطات ومخالفات:</span>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          {sol.targetViolationsOrRequirements.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-rose-500 font-bold">•</span>
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">النطاق السعري التقديري:</span>
                        <span className="text-xs font-extrabold text-emerald-700 font-mono">
                          {formatSAR(sol.estimatedPriceMin)} - {formatSAR(sol.estimatedPriceMax)}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        ضمان {sol.complianceWarrantyMonths} شهر
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 1: SUBMIT / EDIT QUOTE MODAL */}
      {/* ---------------------------------------------------------------------- */}
      {selectedRequestForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Cairo']">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-['Cairo']">تقديم عرض سعر تنافسي رسمي</h3>
                  <p className="text-xs text-slate-300">
                    طلب رقم <span className="font-mono text-amber-300">{selectedRequestForQuote.requestNumber}</span> • {selectedRequestForQuote.establishmentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForQuote(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
              {/* Request Scope Summary Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{selectedRequestForQuote.titleAr}</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    الميزانية المستهدفة: {selectedRequestForQuote.maxBudget ? formatSAR(selectedRequestForQuote.maxBudget) : 'غير محددة'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedRequestForQuote.scopeDescriptionAr}
                </p>
              </div>

              {/* Price & Execution Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    السعر المقترح (بدون ضريبة):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      max={1000000}
                      step={50}
                      required
                      value={quotePriceSAR}
                      onChange={(e) => setQuotePriceSAR(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-2.5 text-sm font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ر.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>ضريبة 15%: {formatSAR(Math.round(quotePriceSAR * 0.15))}</span>
                    <span className="font-bold text-indigo-900">الإجمالي: {formatSAR(quotePriceSAR + Math.round(quotePriceSAR * 0.15))}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    مدة التنفيذ والتوريد المقترحة:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={quoteLeadDays}
                      onChange={(e) => setQuoteLeadDays(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      أيام
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">يوم عمل من تاريخ التعميد الفعلي</p>
                </div>
              </div>

              {/* Proposal Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملخص المقترح الفني والحل التنفيذي:
                </label>
                <textarea
                  rows={3}
                  required
                  value={quoteProposalSummary}
                  onChange={(e) => setQuoteProposalSummary(e.target.value)}
                  placeholder="وضح تفاصيل الأجهزة، المخططات، والخطوات الفنية المعتمدة..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Warranties & Accreditations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    مدة ضمان الامتثال وقبول الفحص:
                  </label>
                  <select
                    value={quoteIncludedWarrantyMonths}
                    onChange={(e) => setQuoteIncludedWarrantyMonths(Number(e.target.value))}
                    className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value={3}>3 أشهر</option>
                    <option value={6}>6 أشهر</option>
                    <option value={12}>12 شهراً (عام كامل - موصى به)</option>
                    <option value={24}>24 شهراً (سنتان)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="hasCertLetter"
                    checked={quoteHasLetter}
                    onChange={(e) => setQuoteHasLetter(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="hasCertLetter" className="text-xs font-bold text-slate-700 cursor-pointer">
                    يشمل خطاب اعتماد وتوثيق إلكتروني رسمي للجهة الرقابية
                  </label>
                </div>
              </div>

              {/* Technical notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات أو اشتراطات فنية إضافية (اختياري):
                </label>
                <input
                  type="text"
                  value={quoteTechnicalNotes}
                  onChange={(e) => setQuoteTechnicalNotes(e.target.value)}
                  placeholder="مثال: يلزم توفير مصدر طاقة كهربائية في الموقع قبل بدء التركيب"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForQuote(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-slate-900 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد وإرسال العرض للعميل ({formatSAR(quotePriceSAR + Math.round(quotePriceSAR * 0.15))})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 2: TIMELINE AUDIT HISTORY MODAL */}
      {/* ---------------------------------------------------------------------- */}
      {selectedRequestForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Cairo']">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">سجل تتبع ومراحل الطلب</h3>
                  <p className="text-xs text-slate-300 font-mono">{selectedRequestForHistory.requestNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForHistory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-slate-200">
                {orderHistory
                  .filter((h) => h.requestId === selectedRequestForHistory.id)
                  .map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4 pr-1">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 ring-4 ring-white text-xs font-bold z-10">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{item.statusLabelAr}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.timestamp.replace('T', ' ').substring(0, 16)}</span>
                        </div>
                        <p className="text-xs text-slate-600">{item.commentsAr}</p>
                        <span className="text-[10px] text-indigo-600 font-semibold block">بواسطة: {item.changedBy}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-4 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForHistory(null)}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2 rounded-xl"
                >
                  إغلاق السجل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 3: UPDATE ORDER STATUS MODAL */}
      {/* ---------------------------------------------------------------------- */}
      {selectedRequestForStatusUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Cairo']">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">تحديث مرحلة التنفيذ للطلب</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForStatusUpdate(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الجديدة:</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                >
                  <option value="in_execution">جاري التنفيذ والتوريد الميداني</option>
                  <option value="inspection_pending">بانتظار الفحص والمعاينة الحكومية</option>
                  <option value="completed">مكتمل ومطابق 100% (إصدار الشهادة النهائية)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تقرير الإنجاز / ملاحظات التحديث:</label>
                <textarea
                  rows={3}
                  required
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="وضح ما تم إنجازه، مثل: تم تركيب كواشف الدخان وإصدار عقد الصيانة الإلكتروني على سلامة..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForStatusUpdate(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  حفظ وتحديث المرحلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
