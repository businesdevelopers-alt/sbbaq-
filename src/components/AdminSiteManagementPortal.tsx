import React, { useState, useMemo } from 'react';
import {
  Globe,
  Layout,
  FileText,
  Inbox,
  Receipt,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Download,
  Printer,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Check,
  X,
  Zap,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  QrCode,
  Share2,
  MessageSquare,
  RefreshCw,
  Copy,
  Layers,
  HelpCircle,
  TrendingUp,
  Tag,
  Briefcase
} from 'lucide-react';
import {
  SiteSettingsConfig,
  IncomingRequest,
  IncomingRequestStatus,
  IncomingRequestPriority,
  TaxInvoice,
  TaxInvoiceItem,
  InvoiceStatus,
  PaymentMethod,
  INITIAL_SITE_SETTINGS,
  INITIAL_INCOMING_REQUESTS,
  INITIAL_TAX_INVOICES,
  generateZatcaTlvQrBase64,
  numberToArabicWords
} from '../data/siteManagementData';
import { formatSAR } from '../utils/complianceEngine';
import { MasterOrder, ServiceCatalogItem } from '../types';

interface AdminSiteManagementPortalProps {
  initialSubTab?: 'site_cms' | 'incoming_requests' | 'invoicing';
  onNavigateToTab?: (tab: string) => void;
  showToast: (msg: string) => void;
  services?: ServiceCatalogItem[];
  orders?: MasterOrder[];
  onConvertRequestToOrder?: (request: IncomingRequest) => void;
}

export const AdminSiteManagementPortal: React.FC<AdminSiteManagementPortalProps> = ({
  initialSubTab = 'site_cms',
  onNavigateToTab,
  showToast,
  services = [],
  orders = [],
  onConvertRequestToOrder
}) => {
  // Active Main Sub-Tab within the Portal
  const [activeSubTab, setActiveSubTab] = useState<'site_cms' | 'incoming_requests' | 'invoicing'>(initialSubTab);

  // ----------------------------------------------------
  // 1. SITE CMS & LANDING PAGE STATE
  // ----------------------------------------------------
  const [siteSettings, setSiteSettings] = useState<SiteSettingsConfig>(INITIAL_SITE_SETTINGS);
  const [isCmsDirty, setIsCmsDirty] = useState(false);
  const [cmsActiveSection, setCmsActiveSection] = useState<'announcement' | 'hero' | 'about_vision' | 'stats' | 'features' | 'pricing' | 'faqs' | 'contact'>('hero');
  
  // FAQ Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<{ id?: string; category: string; question: string; answer: string; isFeatured?: boolean } | null>(null);

  // Pricing Plan Modal
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{ id: string; name: string; monthlyPrice: number; annualPrice: number; badge?: string; isPopular?: boolean; description: string; featuresStr: string } | null>(null);

  // ----------------------------------------------------
  // 2. INCOMING REQUESTS STATE
  // ----------------------------------------------------
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>(INITIAL_INCOMING_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestFilterStatus, setRequestFilterStatus] = useState<IncomingRequestStatus | 'all'>('all');
  const [requestFilterPriority, setRequestFilterPriority] = useState<IncomingRequestPriority | 'all'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedSpecialistName, setAssignedSpecialistName] = useState('سعد بن فهد (مستشار بلدي وتجاري)');

  // ----------------------------------------------------
  // 3. INVOICING & ZATCA TAX INVOICE STATE
  // ----------------------------------------------------
  const [invoices, setInvoices] = useState<TaxInvoice[]>(INITIAL_TAX_INVOICES);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<TaxInvoice | null>(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<InvoiceStatus | 'all'>('all');

  // New Invoice Form State
  const [newInvoiceForm, setNewInvoiceForm] = useState<{
    invoiceType: 'tax_invoice' | 'simplified_tax_invoice';
    buyerName: string;
    buyerCompany: string;
    buyerCR: string;
    buyerVatNumber: string;
    buyerAddress: string;
    buyerPhone: string;
    buyerEmail: string;
    buyerCity: string;
    issueDate: string;
    dueDate: string;
    paymentMethod: PaymentMethod;
    notes: string;
    items: {
      description: string;
      category: string;
      quantity: number;
      unitPrice: number;
      govFee: number;
      discount: number;
      isGovFee: boolean;
    }[];
  }>({
    invoiceType: 'tax_invoice',
    buyerName: '',
    buyerCompany: '',
    buyerCR: '',
    buyerVatNumber: '',
    buyerAddress: '',
    buyerPhone: '05',
    buyerEmail: '',
    buyerCity: 'الرياض',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'mada',
    notes: 'الرسوم الحكومية معفاة من ضريبة القيمة المضافة لكونها مدفوعات أمانة للجهات الرسمية.',
    items: [
      {
        description: 'أتعاب خدمة إصدار وتجديد رخصة نشاط تجاري بلدي - سبّاق',
        category: 'service_fee',
        quantity: 1,
        unitPrice: 450,
        govFee: 0,
        discount: 0,
        isGovFee: false
      },
      {
        description: 'الرسوم الحكومية التقديرية للبلدية والدفاع المدني (أمانة)',
        category: 'gov_fee',
        quantity: 1,
        unitPrice: 1200,
        govFee: 1200,
        discount: 0,
        isGovFee: true
      }
    ]
  });

  // Calculate Form Totals
  const formCalculatedTotals = useMemo(() => {
    let govTotal = 0;
    let taxableTotal = 0;
    let vatTotal = 0;
    let discountTotal = 0;

    newInvoiceForm.items.forEach(item => {
      if (item.isGovFee) {
        govTotal += Number(item.govFee || item.unitPrice || 0) * Number(item.quantity || 1);
      } else {
        const lineTaxable = Math.max(0, (Number(item.unitPrice || 0) * Number(item.quantity || 1)) - Number(item.discount || 0));
        taxableTotal += lineTaxable;
        vatTotal += lineTaxable * 0.15;
        discountTotal += Number(item.discount || 0);
      }
    });

    const grandTotal = govTotal + taxableTotal + vatTotal;

    return {
      govTotal,
      taxableTotal,
      vatTotal,
      discountTotal,
      grandTotal
    };
  }, [newInvoiceForm.items]);

  // Invoice KPI Metrics
  const invoiceMetrics = useMemo(() => {
    const totalCount = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    
    const totalBilled = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalCollected = paidInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalPending = pendingInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalVatCollected = paidInvoices.reduce((sum, i) => sum + i.vatTotal, 0);
    const totalGovFeesTransferred = paidInvoices.reduce((sum, i) => sum + i.govFeesTotal, 0);

    return {
      totalCount,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      totalBilled,
      totalCollected,
      totalPending,
      totalVatCollected,
      totalGovFeesTransferred
    };
  }, [invoices]);

  // Incoming Requests Metrics
  const requestsMetrics = useMemo(() => {
    const total = incomingRequests.length;
    const newCount = incomingRequests.filter(r => r.status === 'new').length;
    const urgentCount = incomingRequests.filter(r => r.priority === 'urgent').length;
    const convertedCount = incomingRequests.filter(r => r.status === 'converted_to_order').length;
    const totalEstimatedValue = incomingRequests.reduce((sum, r) => sum + (r.estimatedBudget || 0), 0);

    return {
      total,
      newCount,
      urgentCount,
      convertedCount,
      totalEstimatedValue
    };
  }, [incomingRequests]);

  // ----------------------------------------------------
  // ACTIONS: SITE CMS
  // ----------------------------------------------------
  const handleSaveCmsSettings = () => {
    setIsCmsDirty(false);
    showToast('تم حفظ ونشر إعدادات الموقع وصفحة التعريف بنجاح!');
  };

  const handleResetCmsDefaults = () => {
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setIsCmsDirty(true);
    showToast('تمت استعادة الإعدادات الافتراضية للموقع.');
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question.trim()) return;

    if (editingFaq.id) {
      setSiteSettings(prev => ({
        ...prev,
        faqItems: prev.faqItems.map(f => f.id === editingFaq.id ? { ...f, ...editingFaq } as any : f)
      }));
      showToast('تم تحديث السؤال الشائع.');
    } else {
      const newFaq = {
        id: `faq-${Date.now()}`,
        category: editingFaq.category || 'عام',
        question: editingFaq.question,
        answer: editingFaq.answer,
        isFeatured: Boolean(editingFaq.isFeatured)
      };
      setSiteSettings(prev => ({
        ...prev,
        faqItems: [...prev.faqItems, newFaq]
      }));
      showToast('تمت إضافة السؤال الشائع الجديد.');
    }

    setIsCmsDirty(true);
    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (faqId: string) => {
    setSiteSettings(prev => ({
      ...prev,
      faqItems: prev.faqItems.filter(f => f.id !== faqId)
    }));
    setIsCmsDirty(true);
    showToast('تم حذف السؤال الشائع.');
  };

  // ----------------------------------------------------
  // ACTIONS: INCOMING REQUESTS
  // ----------------------------------------------------
  const handleUpdateRequestStatus = (reqId: string, newStatus: IncomingRequestStatus) => {
    setIncomingRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    if (selectedRequest?.id === reqId) {
      setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast('تم تحديث حالة الطلب بنجاح.');
  };

  const handleConvertRequestToOrder = (request: IncomingRequest) => {
    const generatedOrderNum = `ORD-1447-${Math.floor(100 + Math.random() * 900)}`;
    setIncomingRequests(prev => prev.map(r => r.id === request.id ? {
      ...r,
      status: 'converted_to_order',
      convertedOrderId: generatedOrderNum
    } : r));

    if (selectedRequest?.id === request.id) {
      setSelectedRequest(prev => prev ? { ...prev, status: 'converted_to_order', convertedOrderId: generatedOrderNum } : null);
    }

    if (onConvertRequestToOrder) {
      onConvertRequestToOrder(request);
    }

    showToast(`تم قبول الطلب وتحويله إلى أمر عمل رسمي: ${generatedOrderNum}`);
  };

  const handleCreateInvoiceForRequest = (request: IncomingRequest) => {
    const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const govEst = Math.round(request.estimatedBudget * 0.6);
    const serviceFee = Math.max(350, request.estimatedBudget - govEst);
    const vat = Math.round(serviceFee * 0.15 * 100) / 100;
    const grand = govEst + serviceFee + vat;

    const newInv: TaxInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      invoiceType: 'tax_invoice',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      supplyDate: new Date().toISOString().split('T')[0],
      sellerName: siteSettings.contactInfo.companyNameAr,
      sellerCR: siteSettings.contactInfo.crNumber,
      sellerVatNumber: siteSettings.contactInfo.vatNumber,
      sellerAddress: siteSettings.contactInfo.addressAr,
      sellerCity: 'الرياض',
      sellerPostalCode: '12214',

      buyerName: request.clientName,
      buyerCompany: request.companyName,
      buyerCR: request.crNumber || '1010000000',
      buyerVatNumber: `310${request.crNumber || '1010000000'}00003`,
      buyerAddress: `${request.city}، المملكة العربية السعودية`,
      buyerPhone: request.phone,
      buyerEmail: request.email,
      buyerCity: request.city,

      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `الرسوم الحكومية التقديرية للمعاملة (${request.requestedServices.join(' - ')}) - أمانة`,
          category: 'gov_fee',
          quantity: 1,
          unitPrice: govEst,
          govFee: govEst,
          discount: 0,
          taxableAmount: 0,
          vatRate: 0.15,
          vatAmount: 0,
          totalWithVat: govEst
        },
        {
          id: `item-${Date.now()}-2`,
          description: `أتعاب منصة سبّاق للتدقيق والإنجاز الهندسي والإشراف الميداني`,
          category: 'service_fee',
          quantity: 1,
          unitPrice: serviceFee,
          govFee: 0,
          discount: 0,
          taxableAmount: serviceFee,
          vatRate: 0.15,
          vatAmount: vat,
          totalWithVat: serviceFee + vat
        }
      ],

      govFeesTotal: govEst,
      taxableAmountTotal: serviceFee,
      vatTotal: vat,
      discountTotal: 0,
      grandTotal: grand,

      status: 'pending',
      paymentMethod: 'mada',
      bankAccountName: 'شركة سبّاق لتقنية المعلومات - مصرف الراجحي',
      bankIban: 'SA4480000456608010123456',
      relatedRequestId: request.id,
      notes: `فاتورة صادرة بناءً على طلب المعاملة رقم ${request.requestNumber}. الرسوم الحكومية معفاة من الضريبة.`
    };

    setInvoices(prev => [newInv, ...prev]);
    setIncomingRequests(prev => prev.map(r => r.id === request.id ? { ...r, issuedInvoiceNumber: invNum, status: 'quote_sent' } : r));
    
    if (selectedRequest?.id === request.id) {
      setSelectedRequest(prev => prev ? { ...prev, issuedInvoiceNumber: invNum, status: 'quote_sent' } : null);
    }

    showToast(`تم إصدار الفاتورة الضريبية رقم ${invNum} للطلب بنجاح!`);
    setActiveSubTab('invoicing');
    setSelectedInvoiceForView(newInv);
  };

  // ----------------------------------------------------
  // ACTIONS: INVOICING
  // ----------------------------------------------------
  const handleSaveNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceForm.buyerName.trim() || newInvoiceForm.items.length === 0) {
      showToast('يرجى تعبئة بيانات العميل وإضافة بند واحد على الأقل.');
      return;
    }

    const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const items: TaxInvoiceItem[] = newInvoiceForm.items.map((item, idx) => {
      if (item.isGovFee) {
        const val = Number(item.govFee || item.unitPrice || 0);
        return {
          id: `item-${Date.now()}-${idx}`,
          description: item.description,
          category: 'gov_fee',
          quantity: Number(item.quantity || 1),
          unitPrice: val,
          govFee: val,
          discount: 0,
          taxableAmount: 0,
          vatRate: 0.15,
          vatAmount: 0,
          totalWithVat: val * Number(item.quantity || 1)
        };
      } else {
        const price = Number(item.unitPrice || 0);
        const qty = Number(item.quantity || 1);
        const disc = Number(item.discount || 0);
        const taxable = Math.max(0, (price * qty) - disc);
        const vat = taxable * 0.15;
        return {
          id: `item-${Date.now()}-${idx}`,
          description: item.description,
          category: 'service_fee',
          quantity: qty,
          unitPrice: price,
          govFee: 0,
          discount: disc,
          taxableAmount: taxable,
          vatRate: 0.15,
          vatAmount: vat,
          totalWithVat: taxable + vat
        };
      }
    });

    const newInv: TaxInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      invoiceType: newInvoiceForm.invoiceType,
      issueDate: newInvoiceForm.issueDate,
      dueDate: newInvoiceForm.dueDate,
      supplyDate: newInvoiceForm.issueDate,
      sellerName: siteSettings.contactInfo.companyNameAr,
      sellerCR: siteSettings.contactInfo.crNumber,
      sellerVatNumber: siteSettings.contactInfo.vatNumber,
      sellerAddress: siteSettings.contactInfo.addressAr,
      sellerCity: 'الرياض',
      sellerPostalCode: '12214',

      buyerName: newInvoiceForm.buyerName,
      buyerCompany: newInvoiceForm.buyerCompany || newInvoiceForm.buyerName,
      buyerCR: newInvoiceForm.buyerCR,
      buyerVatNumber: newInvoiceForm.buyerVatNumber,
      buyerAddress: newInvoiceForm.buyerAddress || `${newInvoiceForm.buyerCity}، المملكة العربية السعودية`,
      buyerPhone: newInvoiceForm.buyerPhone,
      buyerEmail: newInvoiceForm.buyerEmail,
      buyerCity: newInvoiceForm.buyerCity,

      items,
      govFeesTotal: formCalculatedTotals.govTotal,
      taxableAmountTotal: formCalculatedTotals.taxableTotal,
      vatTotal: formCalculatedTotals.vatTotal,
      discountTotal: formCalculatedTotals.discountTotal,
      grandTotal: formCalculatedTotals.grandTotal,

      status: 'pending',
      paymentMethod: newInvoiceForm.paymentMethod,
      bankAccountName: 'شركة سبّاق لتقنية المعلومات - مصرف الراجحي',
      bankIban: 'SA4480000456608010123456',
      notes: newInvoiceForm.notes
    };

    setInvoices(prev => [newInv, ...prev]);
    setIsCreateInvoiceModalOpen(false);
    setSelectedInvoiceForView(newInv);
    showToast(`تم إنشاء وإصدار الفاتورة الضريبية رقم ${invNum} بنجاح.`);
  };

  const handleMarkInvoiceAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? {
      ...inv,
      status: 'paid',
      paidAt: new Date().toISOString(),
      paidAmount: inv.grandTotal
    } : inv));

    if (selectedInvoiceForView?.id === invoiceId) {
      setSelectedInvoiceForView(prev => prev ? {
        ...prev,
        status: 'paid',
        paidAt: new Date().toISOString(),
        paidAmount: prev.grandTotal
      } : null);
    }

    showToast('تم تسجيل سداد الفاتورة بالكامل وإصدار سند القبض الإلكتروني.');
  };

  // Filtered Lists
  const filteredIncomingRequests = useMemo(() => {
    return incomingRequests.filter(r => {
      if (requestFilterStatus !== 'all' && r.status !== requestFilterStatus) return false;
      if (requestFilterPriority !== 'all' && r.priority !== requestFilterPriority) return false;
      if (requestSearchQuery.trim()) {
        const q = requestSearchQuery.toLowerCase().trim();
        const matchName = r.clientName.toLowerCase().includes(q);
        const matchCompany = r.companyName.toLowerCase().includes(q);
        const matchReqNum = r.requestNumber.toLowerCase().includes(q);
        const matchPhone = r.phone.includes(q);
        const matchCity = r.city.toLowerCase().includes(q);
        return matchName || matchCompany || matchReqNum || matchPhone || matchCity;
      }
      return true;
    });
  }, [incomingRequests, requestFilterStatus, requestFilterPriority, requestSearchQuery]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      if (invoiceFilterStatus !== 'all' && i.status !== invoiceFilterStatus) return false;
      if (invoiceSearchQuery.trim()) {
        const q = invoiceSearchQuery.toLowerCase().trim();
        const matchInvNum = i.invoiceNumber.toLowerCase().includes(q);
        const matchBuyer = i.buyerName.toLowerCase().includes(q);
        const matchCompany = i.buyerCompany.toLowerCase().includes(q);
        const matchCR = (i.buyerCR || '').includes(q);
        return matchInvNum || matchBuyer || matchCompany || matchCR;
      }
      return true;
    });
  }, [invoices, invoiceFilterStatus, invoiceSearchQuery]);

  return (
    <div className="space-y-6 font-['Cairo']" id="admin-site-management-portal">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>بوابة إدارة الموقع، استقبال الطلبات، وإصدار الفواتير المركزية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مركز التحكم بالموقع وصفحة التعريف والفوترة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تحكم كامل في نصوص ورسائل صفحة الهبوط والتعريف، أتمتة استقبال ومعالجة طلبات العملاء الواردة من الموقع، وتوليد الفواتير الضريبية وسندات القبض المعتمدة لـ ZATCA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeSubTab === 'site_cms' && (
              <>
                <button
                  type="button"
                  onClick={handleSaveCmsSettings}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>نشر التغييرات على الموقع الحي</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCmsDefaults}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                  <span>استعادة الافتراضي</span>
                </button>
              </>
            )}

            {activeSubTab === 'incoming_requests' && (
              <button
                type="button"
                onClick={() => {
                  showToast(`تم تصدير كشف بـ ${incomingRequests.length} طلبات واردة (Excel).`);
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-300" />
                <span>تصدير الطلبات الواردة</span>
              </button>
            )}

            {activeSubTab === 'invoicing' && (
              <button
                type="button"
                id="btn-open-create-invoice"
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إصدار فاتورة ضريبية جديدة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Tab 1: Site CMS & About Page */}
          <button
            type="button"
            id="tab-btn-site-cms"
            onClick={() => setActiveSubTab('site_cms')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'site_cms'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Layout className="w-4 h-4 text-indigo-400" />
            <span>التحكم بالموقع وصفحة التعريف (CMS)</span>
            {isCmsDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Tab 2: Incoming Requests */}
          <button
            type="button"
            id="tab-btn-incoming-requests"
            onClick={() => setActiveSubTab('incoming_requests')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'incoming_requests'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>استلام ومعالجة الطلبات الواردة</span>
            {requestsMetrics.newCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                {requestsMetrics.newCount} جديد
              </span>
            )}
          </button>

          {/* Tab 3: Invoicing & ZATCA */}
          <button
            type="button"
            id="tab-btn-invoicing"
            onClick={() => setActiveSubTab('invoicing')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'invoicing'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>إصدار الفواتير الضريبية (ZATCA)</span>
            <span className="bg-emerald-950/40 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
              {invoices.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden md:flex items-center gap-3">
          <span>نظام الفوترة: <strong>متوافق مع ZATCA المرحلة 2</strong></span>
          <span>•</span>
          <span>الإصدار: <strong>v2.8.4 Enterprise</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: SITE CMS & ABOUT PAGE (التحكم بالموقع وصفحة التعريف) */}
      {/* ========================================================================= */}
      {activeSubTab === 'site_cms' && (
        <div className="space-y-6">
          
          {/* Section Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'announcement', label: 'شريط الإعلانات', icon: Tag },
              { id: 'hero', label: 'الواجهة الرئيسية (Hero)', icon: Layout },
              { id: 'about_vision', label: 'من نحن ورؤية 2030', icon: ShieldCheck },
              { id: 'stats', label: 'الأرقام والإحصائيات', icon: TrendingUp },
              { id: 'features', label: 'الميزات والخدمات', icon: Sliders },
              { id: 'pricing', label: 'خطط الأسعار والباقات', icon: DollarSign },
              { id: 'faqs', label: 'الأسئلة الشائعة (FAQ)', icon: HelpCircle },
              { id: 'contact', label: 'بيانات الاتصال والتراخيص', icon: Phone }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = cmsActiveSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setCmsActiveSection(sec.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs ring-2 ring-indigo-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[11px] leading-tight line-clamp-1">{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* CMS Card: Active Section Editor */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            
            {/* 1.1 Announcement Bar */}
            {cmsActiveSection === 'announcement' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">إدارة شريط الإعلانات العلوي الترويجي</h3>
                    <p className="text-xs text-slate-500">يظهر في أعلى كل صفحات الموقع العام للتنبيهات العاجلة والعروض</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.announcementBarActive}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, announcementBarActive: e.target.checked }));
                        setIsCmsDirty(true);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700">تفعيل الشريط في الموقع</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">نص الإعلان أو التنبيه الرسمي *</label>
                    <input
                      type="text"
                      value={siteSettings.announcementBarText}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, announcementBarText: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">شارة الإعلان (Badge)</label>
                    <input
                      type="text"
                      value={siteSettings.announcementBarBadge}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, announcementBarBadge: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="bg-slate-950 text-white p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {siteSettings.announcementBarBadge}
                    </span>
                    <span className="text-slate-200 line-clamp-1">{siteSettings.announcementBarText}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">معاينة مباشرة</span>
                </div>
              </div>
            )}

            {/* 1.2 Hero Section */}
            {cmsActiveSection === 'hero' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">واجهة الموقع الرئيسية (Hero Section)</h3>
                  <p className="text-xs text-slate-500">تعديل العنوان الرئيسي، العنوان الفرعي، ونصوص أزرار الإجراءات الرئيسية</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">شارة الواجهة (Hero Badge)</label>
                    <input
                      type="text"
                      value={siteSettings.heroBadge}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, heroBadge: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">خط الطوارئ الساخن (Emergency Hotline)</label>
                    <input
                      type="text"
                      value={siteSettings.emergencyHotline}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, emergencyHotline: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">العنوان الرئيسي (Hero Title)</label>
                    <input
                      type="text"
                      value={siteSettings.heroTitle}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, heroTitle: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">النص المميز الملون (Highlighted Span)</label>
                    <input
                      type="text"
                      value={siteSettings.heroHighlight}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, heroHighlight: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">الوصف التوضيحي (Hero Subtitle)</label>
                    <textarea
                      rows={2}
                      value={siteSettings.heroSubtitle}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, heroSubtitle: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-indigo-500 outline-hidden leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">نص الزر الرئيسي (Primary CTA)</label>
                    <input
                      type="text"
                      value={siteSettings.primaryCtaText}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, primaryCtaText: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">نص الزر الثانوي (Secondary CTA)</label>
                    <input
                      type="text"
                      value={siteSettings.secondaryCtaText}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, secondaryCtaText: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 1.3 About Us & Vision 2030 (صفحة التعريف) */}
            {cmsActiveSection === 'about_vision' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">صفحة التعريف: من نحن، رسالتنا ورؤية المملكة 2030</h3>
                  <p className="text-xs text-slate-500">صياغة الرسالة المؤسسية، القيم الجوهرية، والمساهمة في بيئة الأعمال السعودية</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">عنوان قسم التعريف (About Title)</label>
                    <input
                      type="text"
                      value={siteSettings.aboutUsTitle}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, aboutUsTitle: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">شرح موجز (About Subtitle)</label>
                    <input
                      type="text"
                      value={siteSettings.aboutUsSubtitle}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, aboutUsSubtitle: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">البيان التعريفي الشامل لشركة ومنصة سبّاق *</label>
                    <textarea
                      rows={3}
                      value={siteSettings.aboutUsDescription}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, aboutUsDescription: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                    <label className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>رسالة الالتزام برؤية المملكة 2030 (Saudi Vision 2030 Alignment)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettings.vision2030Message}
                      onChange={(e) => {
                        setSiteSettings(prev => ({ ...prev, vision2030Message: e.target.value }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-medium text-xs leading-relaxed text-emerald-950 mt-1"
                    />
                  </div>
                </div>

                {/* Core Values List */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">القيم الجوهرية الأربعة المعروضة:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siteSettings.coreValues.map((val, idx) => (
                      <div key={val.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{val.title}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">قيمة {idx + 1}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{val.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1.4 Live Stats */}
            {cmsActiveSection === 'stats' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">الأرقام والإحصائيات المعروضة (Live Counter Metrics)</h3>
                  <p className="text-xs text-slate-500">تحديث إحصائيات النجاح والتغطية المعروضة لزوار الموقع والعملاء</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {siteSettings.stats.map((stat, idx) => (
                    <div key={stat.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 text-[11px]">عنوان الإحصائية:</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...siteSettings.stats];
                            newStats[idx].label = e.target.value;
                            setSiteSettings(prev => ({ ...prev, stats: newStats }));
                            setIsCmsDirty(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 text-[11px]">القيمة الرقمية (Value):</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...siteSettings.stats];
                            newStats[idx].value = e.target.value;
                            setSiteSettings(prev => ({ ...prev, stats: newStats }));
                            setIsCmsDirty(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-black text-indigo-700 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 text-[11px]">الوصف الفرعي:</label>
                        <input
                          type="text"
                          value={stat.subLabel}
                          onChange={(e) => {
                            const newStats = [...siteSettings.stats];
                            newStats[idx].subLabel = e.target.value;
                            setSiteSettings(prev => ({ ...prev, stats: newStats }));
                            setIsCmsDirty(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1.5 Feature Modules Toggles */}
            {cmsActiveSection === 'features' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">التحكم بميزات وأقسام المنصة (Feature Flags & Modules)</h3>
                  <p className="text-xs text-slate-500">إظهار أو إخفاء أي ميزة رقمية في الموقع العام أو حسابات العملاء فورياً</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'aiAdvisor', label: 'المستشار الذكي (Ask Sabbaq AI)', desc: 'محرك الإجابة القانونية وحساب الغرامات بالذكاء الاصطناعي' },
                    { key: 'feeCalculator', label: 'حاسبة الرسوم الحكومية التقديرية', desc: 'حساب تكاليف رخص بلدي، سلامة، والسجلات مسبقاً' },
                    { key: 'riskMap', label: 'خريطة المخاطر الجغرافية وتتبع الحملات', desc: 'الخريطة التفاعلية للبلاغات والزيارات الرقابية' },
                    { key: 'suppliersMarket', label: 'متجر مزودي وحلول الامتثال المعتمدين', desc: 'بوابة طلب عروض الأسعار من شركات السلامة والمقاولات' },
                    { key: 'instantOrders', label: 'استقبال طلبات التعقيب الفورية', desc: 'إتاحة زر طلب الخدمة المباشر من صفحات الكتالوج' },
                    { key: 'digitalSignatures', label: 'منظومة العقود والتوقيع الرقمي', desc: 'إنشاء ومراجعة العقود والتفويضات إلكترونياً' },
                    { key: 'zatcaInvoicing', label: 'محرك الفوترة الإلكترونية ZATCA', desc: 'تفعيل إصدار الفواتير مع باركود الاستجابة السريعة' },
                    { key: 'autoRenewalDraft', label: 'مسودات التجديد التلقائي الاستباقي', desc: 'اقتراح طلبات التجديد قبل 30 يوماً من انتهاء الرخص' }
                  ].map(f => {
                    const isEnabled = (siteSettings.featureToggles as any)[f.key];
                    return (
                      <div
                        key={f.key}
                        className={`p-4 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                          isEnabled ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{f.label}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{f.desc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSiteSettings(prev => ({
                              ...prev,
                              featureToggles: {
                                ...prev.featureToggles,
                                [f.key]: !isEnabled
                              }
                            }));
                            setIsCmsDirty(true);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                            isEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {isEnabled ? 'مفعل' : 'معطل'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1.6 Pricing Plans */}
            {cmsActiveSection === 'pricing' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">باقات الاشتراك والأسعار (Subscription Plans)</h3>
                    <p className="text-xs text-slate-500">تعديل رسوم الباقات الشهرية والسنوية والميزات المضمنة في كل باقة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {siteSettings.pricingPlans.map((plan, idx) => (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-3xl border space-y-4 text-xs relative ${
                        plan.isPopular ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-2 ring-indigo-400/20' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {plan.badge && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full absolute -top-2.5 right-4">
                          {plan.badge}
                        </span>
                      )}

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">{plan.name}</h4>
                        <p className="text-slate-500 text-[11px]">{plan.description}</p>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">السعر الشهري:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={plan.monthlyPrice}
                              onChange={(e) => {
                                const updated = [...siteSettings.pricingPlans];
                                updated[idx].monthlyPrice = Number(e.target.value);
                                setSiteSettings(prev => ({ ...prev, pricingPlans: updated }));
                                setIsCmsDirty(true);
                              }}
                              className="w-20 p-1 bg-white border border-slate-200 rounded text-left font-bold text-xs"
                            />
                            <span className="text-slate-400">ر.س</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">السعر السنوي:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={plan.annualPrice}
                              onChange={(e) => {
                                const updated = [...siteSettings.pricingPlans];
                                updated[idx].annualPrice = Number(e.target.value);
                                setSiteSettings(prev => ({ ...prev, pricingPlans: updated }));
                                setIsCmsDirty(true);
                              }}
                              className="w-20 p-1 bg-white border border-slate-200 rounded text-left font-bold text-xs"
                            />
                            <span className="text-slate-400">ر.س</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-700 block text-[11px]">الميزات ({plan.features.length}):</span>
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1.7 FAQs Management */}
            {cmsActiveSection === 'faqs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">إدارة الأسئلة الشائعة (FAQ Management)</h3>
                    <p className="text-xs text-slate-500">إضافة وتعديل وحذف إجابات الاستفسارات المتكررة لعملاء المنصة</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq({ category: 'عام', question: '', answer: '', isFeatured: true });
                      setIsFaqModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة سؤال جديد</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {siteSettings.faqItems.map((faq) => (
                    <div key={faq.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm font-['Cairo']">{faq.question}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                            {faq.category}
                          </span>
                          {faq.isFeatured && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              مميز
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">{faq.answer}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFaq(faq);
                            setIsFaqModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1.8 Contact & Legal Information */}
            {cmsActiveSection === 'contact' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">بيانات الاتصال والتراخيص الرسمية للشركة</h3>
                  <p className="text-xs text-slate-500">تظهر في تذييل الموقع (Footer) وعلى الفواتير والعقود الرسمية</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">الاسم التجاري الرسمي (عربي) *</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.companyNameAr}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, companyNameAr: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">رقم السجل التجاري (CR Number) *</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.crNumber}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, crNumber: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">الرقم الضريبي ZATCA (15 رقم) *</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.vatNumber}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, vatNumber: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">رقم الهاتف الموحد</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.phone}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">رقم واتساب الأعمال</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.whatsappNumber}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, whatsappNumber: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">البريد الإلكتروني للعناية بالعملاء</label>
                    <input
                      type="email"
                      value={siteSettings.contactInfo.supportEmail}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, supportEmail: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="font-bold text-slate-700">العنوان الوطني والرئيسي المسجل</label>
                    <input
                      type="text"
                      value={siteSettings.contactInfo.addressAr}
                      onChange={(e) => {
                        setSiteSettings(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, addressAr: e.target.value }
                        }));
                        setIsCmsDirty(true);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: INCOMING REQUESTS (استلام ومعالجة الطلبات الواردة) */}
      {/* ========================================================================= */}
      {activeSubTab === 'incoming_requests' && (
        <div className="space-y-5">
          
          {/* Incoming Requests KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">إجمالي الطلبات الواردة</span>
              <strong className="text-2xl font-black text-slate-900 font-['Cairo'] block mt-1">
                {requestsMetrics.total}
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">من كافة قنوات الموقع</span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 block">طلبات جديدة لم تُعالج</span>
              <strong className="text-2xl font-black text-amber-900 font-['Cairo'] block mt-1">
                {requestsMetrics.newCount}
              </strong>
              <span className="text-[10px] text-amber-700 font-bold">تتطلب تدقيق وقبول</span>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-800 block">طلبات طارئة وعاجلة</span>
              <strong className="text-2xl font-black text-rose-900 font-['Cairo'] block mt-1">
                {requestsMetrics.urgentCount}
              </strong>
              <span className="text-[10px] text-rose-700 font-bold">مهلة استجابة 2 ساعة</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 block">تحولت لأوامر عمل وفواتير</span>
              <strong className="text-2xl font-black text-emerald-900 font-['Cairo'] block mt-1">
                {requestsMetrics.convertedCount}
              </strong>
              <span className="text-[10px] text-emerald-700 font-bold">قيد التنفيذ والمتابعة</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم، اسم المنشأة، رقم الطلب، الجوال أو المدينة..."
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={requestFilterStatus}
                onChange={(e) => setRequestFilterStatus(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">كافة حالات الطلب</option>
                <option value="new">طلبات جديدة ({requestsMetrics.newCount})</option>
                <option value="under_review">قيد المراجعة والتدقيق</option>
                <option value="quote_sent">تم إصدار فاتورة / عرض سعر</option>
                <option value="converted_to_order">تم التحويل لأمر عمل</option>
                <option value="completed">مكتمل بنجاح</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={requestFilterPriority}
                onChange={(e) => setRequestFilterPriority(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">كافة درجات الأولوية</option>
                <option value="urgent">عاجل وطارئ (24-48h)</option>
                <option value="high">مرتفع</option>
                <option value="normal">عادي</option>
              </select>
            </div>
          </div>

          {/* Requests Grid / Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* List Column (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700">قائمة الطلبات الواردة ({filteredIncomingRequests.length})</span>
                <span className="text-[11px] text-slate-400">انقر على أي طلب لعرض تفاصيله الكاملة</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredIncomingRequests.map(req => {
                  const isSelected = selectedRequest?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected ? 'bg-indigo-50/70 border-r-4 border-r-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{req.requestNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'new' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              req.status === 'converted_to_order' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'quote_sent' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {req.status === 'new' ? 'طلب جديد' :
                               req.status === 'under_review' ? 'قيد التدقيق' :
                               req.status === 'quote_sent' ? 'تم التسعير والفوترة' :
                               req.status === 'converted_to_order' ? 'أمر عمل رسمي' : 'مكتمل'}
                            </span>
                            {req.priority === 'urgent' && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Zap className="w-3 h-3 text-rose-600" />
                                <span>عاجل</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{req.companyName}</h4>
                          <span className="text-slate-500 text-[11px] block">{req.clientName} • {req.city}</span>
                        </div>

                        <div className="text-right">
                          <strong className="text-emerald-700 font-bold block">{formatSAR(req.estimatedBudget)}</strong>
                          <span className="text-[10px] text-slate-400">{req.createdAt.split('T')[0]}</span>
                        </div>
                      </div>

                      <div className="text-slate-600 text-[11px] line-clamp-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        الخدمات: {req.requestedServices.join(' • ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Request Detail Panel (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-5">
              {selectedRequest ? (
                <>
                  <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-base">{selectedRequest.requestNumber}</span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          قناة: {selectedRequest.channel}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1">{selectedRequest.companyName}</h3>
                      <span className="text-slate-500 text-xs">المسؤول: {selectedRequest.clientName}</span>
                    </div>

                    <span className="text-emerald-700 font-black text-base">{formatSAR(selectedRequest.estimatedBudget)}</span>
                  </div>

                  {/* Contact Info Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-800">{selectedRequest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-800 truncate">{selectedRequest.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-800">{selectedRequest.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-800">سجل: {selectedRequest.crNumber || 'غير محدد'}</span>
                    </div>
                  </div>

                  {/* Notes & Requested Services */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">الخدمات المطلوبة بالتفصيل:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.requestedServices.map((srv, sIdx) => (
                        <span key={sIdx} className="bg-indigo-50 text-indigo-900 font-bold px-2.5 py-1 rounded-lg border border-indigo-100 text-[11px]">
                          {srv}
                        </span>
                      ))}
                    </div>

                    {selectedRequest.notes && (
                      <div className="mt-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                        <strong className="block mb-0.5">ملاحظات العميل:</strong>
                        {selectedRequest.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions & Conversion */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block text-xs">الإجراءات والتحويل الفوري:</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Convert to Order */}
                      <button
                        type="button"
                        onClick={() => handleConvertRequestToOrder(selectedRequest)}
                        className="p-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تحويل لأمر عمل فوري</span>
                      </button>

                      {/* Create Invoice */}
                      <button
                        type="button"
                        onClick={() => handleCreateInvoiceForRequest(selectedRequest)}
                        className="p-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>إصدار فاتورة ضريبية</span>
                      </button>
                    </div>

                    {/* WhatsApp Quick Message */}
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `مرحباً ${selectedRequest.clientName}، معك منصة سبّاق للامتثال والتراخيص بخصوص طلبكم رقم ${selectedRequest.requestNumber}. يسعدنا خدمتكم والتواصل معكم لاستكمال الإجراءات.`;
                        window.open(`https://wa.me/966${selectedRequest.phone.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>مراسلة العميل عبر واتساب بمسودة جاهزة</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                  <p>حدد طلباً من القائمة لعرض بياناته وإجراء التحويل أو الفوترة.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: INVOICING & ZATCA (إصدار الفواتير الضريبية المعتمدة ZATCA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'invoicing' && (
        <div className="space-y-5">
          
          {/* Invoice Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">إجمالي الفواتير الصادرة</span>
              <strong className="text-2xl font-black text-slate-900 font-['Cairo'] block mt-1">
                {formatSAR(invoiceMetrics.totalBilled)}
              </strong>
              <span className="text-[10px] text-slate-400">{invoiceMetrics.totalCount} فاتورة ضريبية</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 block">المبالغ المحصلة والمسددة</span>
              <strong className="text-2xl font-black text-emerald-900 font-['Cairo'] block mt-1">
                {formatSAR(invoiceMetrics.totalCollected)}
              </strong>
              <span className="text-[10px] text-emerald-700 font-bold">{invoiceMetrics.paidCount} مسددة بالكامل</span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 block">الفواتير المعلقة بانتظار السداد</span>
              <strong className="text-2xl font-black text-amber-900 font-['Cairo'] block mt-1">
                {formatSAR(invoiceMetrics.totalPending)}
              </strong>
              <span className="text-[10px] text-amber-700 font-bold">{invoiceMetrics.pendingCount} فاتورة مستحقة</span>
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-800 block">ضريبة القيمة المضافة ZATCA (15%)</span>
              <strong className="text-2xl font-black text-indigo-900 font-['Cairo'] block mt-1">
                {formatSAR(invoiceMetrics.totalVatCollected)}
              </strong>
              <span className="text-[10px] text-indigo-700 font-bold">إقرار ضريبي معتمد</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة، اسم المنشأة، السجل التجاري، أو اسم العميل..."
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value as any)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
              >
                <option value="all">كافة الحالات</option>
                <option value="paid">مسددة بالكامل ({invoiceMetrics.paidCount})</option>
                <option value="pending">بانتظار السداد ({invoiceMetrics.pendingCount})</option>
                <option value="overdue">متأخرة</option>
              </select>

              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>فاتورة جديدة</span>
              </button>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">رقم الفاتورة</th>
                    <th className="p-3.5">المنشأة / العميل</th>
                    <th className="p-3.5">تاريخ الإصدار</th>
                    <th className="p-3.5">الرسوم الحكومية</th>
                    <th className="p-3.5">أتعاب سبّاق</th>
                    <th className="p-3.5">الضريبة (15%)</th>
                    <th className="p-3.5">الإجمالي الصافي</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{inv.buyerCompany}</span>
                        <span className="text-[11px] text-slate-400">{inv.buyerName}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono">
                        {inv.issueDate}
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium font-mono">
                        {formatSAR(inv.govFeesTotal)}
                      </td>
                      <td className="p-3.5 text-slate-800 font-bold font-mono">
                        {formatSAR(inv.taxableAmountTotal)}
                      </td>
                      <td className="p-3.5 text-indigo-700 font-mono">
                        {formatSAR(inv.vatTotal)}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-emerald-700 font-black font-mono text-sm block">
                          {formatSAR(inv.grandTotal)}
                        </strong>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          inv.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.status === 'paid' ? 'مسددة بالكامل' : 'بانتظار السداد'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="عرض الفاتورة والباركود"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {inv.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleMarkInvoiceAsPaid(inv.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              تسجيل سداد
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW & PRINT OFFICIAL TAX INVOICE (معاينة الفاتورة الضريبية الرسمية) */}
      {/* ========================================================================= */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header & Print Bar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">الفاتورة الضريبية الرسمية (معتمدة ZATCA)</span>
                <span className="font-mono text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">
                  {selectedInvoiceForView.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الفاتورة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForView(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Saudi Tax Invoice Template */}
            <div className="p-6 sm:p-8 space-y-6 text-xs bg-white text-slate-800" id="official-tax-invoice-paper">
              
              {/* Header Grid: Sabbaq Logo, Title, QR Code */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                      س
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-slate-900 font-['Cairo']">منصة سبّاق للامتثال والخدمات</h2>
                      <span className="text-[10px] text-slate-500">Sabbaq Compliance & Enterprise Services Co.</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                    <p>السجل التجاري: <strong className="font-mono text-slate-900">{selectedInvoiceForView.sellerCR}</strong></p>
                    <p>الرقم الضريبي ZATCA: <strong className="font-mono text-indigo-900">{selectedInvoiceForView.sellerVatNumber}</strong></p>
                    <p>{selectedInvoiceForView.sellerAddress}</p>
                  </div>
                </div>

                {/* ZATCA Phase 2 QR Code Box */}
                <div className="flex flex-col items-center p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-24 h-24 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1">ZATCA QR Compliant</span>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">رقم الفاتورة:</span>
                  <strong className="font-mono text-slate-900 text-sm">{selectedInvoiceForView.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تاريخ الإصدار:</span>
                  <strong className="font-mono text-slate-900">{selectedInvoiceForView.issueDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تاريخ الاستحقاق:</span>
                  <strong className="font-mono text-slate-900">{selectedInvoiceForView.dueDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">حالة السداد:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedInvoiceForView.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInvoiceForView.status === 'paid' ? 'مسددة' : 'مستحقة السداد'}
                  </span>
                </div>
              </div>

              {/* Bill To (بيانات العميل) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 block">فاتورة موجهة إلى (Bill To):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedInvoiceForView.buyerCompany}</h4>
                    <span className="text-slate-500">المسؤول: {selectedInvoiceForView.buyerName}</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-600 sm:text-left">
                    <p>السجل التجاري: <strong className="font-mono">{selectedInvoiceForView.buyerCR || '1010000000'}</strong></p>
                    <p>الرقم الضريبي: <strong className="font-mono">{selectedInvoiceForView.buyerVatNumber || '310000000000003'}</strong></p>
                    <p>{selectedInvoiceForView.buyerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">بيان الخدمة أو الرسوم</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3">سعر الوحدة</th>
                      <th className="p-3">الخاضع للضريبة</th>
                      <th className="p-3">الضريبة (15%)</th>
                      <th className="p-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceForView.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{item.description}</span>
                          {item.category === 'gov_fee' && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                              رسوم حكومية أمانة (معفاة من الضريبة)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 font-mono">{formatSAR(item.unitPrice)}</td>
                        <td className="p-3 font-mono">{formatSAR(item.taxableAmount)}</td>
                        <td className="p-3 font-mono text-indigo-700">{formatSAR(item.vatAmount)}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{formatSAR(item.totalWithVat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary Grid */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                
                {/* Tafqeet & Bank Info (Left/Right) */}
                <div className="space-y-2 flex-1">
                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-emerald-900 text-xs">
                    <strong className="block mb-0.5 text-emerald-950 font-bold">المبلغ كتابةً (Tafqeet):</strong>
                    <span className="font-bold">{numberToArabicWords(selectedInvoiceForView.grandTotal)}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block">بيانات الحساب البنكي للسداد:</span>
                    <p>البنك: <strong>مصرف الراجحي (Al Rajhi Bank)</strong></p>
                    <p>الآيبان: <strong className="font-mono text-slate-900">{selectedInvoiceForView.bankIban}</strong></p>
                  </div>
                </div>

                {/* Totals Calculation Box */}
                <div className="w-full sm:w-72 bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>الرسوم الحكومية:</span>
                    <span className="font-mono">{formatSAR(selectedInvoiceForView.govFeesTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>أتعاب الخدمات:</span>
                    <span className="font-mono">{formatSAR(selectedInvoiceForView.taxableAmountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-300">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-mono font-bold">{formatSAR(selectedInvoiceForView.vatTotal)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-black text-emerald-400">
                    <span>الإجمالي المستحق:</span>
                    <span className="font-mono text-base">{formatSAR(selectedInvoiceForView.grandTotal)}</span>
                  </div>
                </div>

              </div>

              {/* Invoice Footer Notes */}
              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-3 text-center">
                هذه الفاتورة تم إنشاؤها إلكترونياً وتعتبر وثيقة رسمية خاضعة للائحة الفوترة الإلكترونية لدى هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW TAX INVOICE (نموذج إصدار فاتورة ضريبية جديدة) */}
      {/* ========================================================================= */}
      {isCreateInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm">إصدار فاتورة ضريبية جديدة (ZATCA Compliant)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewInvoice} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Buyer Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1">1. بيانات المنشأة والعميل:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">اسم المنشأة / الشركة *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شركة المذاق الذهبي"
                      value={newInvoiceForm.buyerCompany}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerCompany: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">اسم المسؤول / المستلم *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: م. أحمد الغامدي"
                      value={newInvoiceForm.buyerName}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerName: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">رقم السجل التجاري</label>
                    <input
                      type="text"
                      placeholder="1010XXXXXX"
                      value={newInvoiceForm.buyerCR}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerCR: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">الرقم الضريبي للعميل (إن وجد)</label>
                    <input
                      type="text"
                      placeholder="310XXXXXXXXXXXX"
                      value={newInvoiceForm.buyerVatNumber}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerVatNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">رقم الجوال *</label>
                    <input
                      type="text"
                      required
                      value={newInvoiceForm.buyerPhone}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerPhone: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">المدينة</label>
                    <input
                      type="text"
                      value={newInvoiceForm.buyerCity}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, buyerCity: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table in Form */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h4 className="font-bold text-slate-900 text-sm">2. بنود الفاتورة والرسوم:</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setNewInvoiceForm(prev => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            description: 'بند خدمة إضافي',
                            category: 'service_fee',
                            quantity: 1,
                            unitPrice: 300,
                            govFee: 0,
                            discount: 0,
                            isGovFee: false
                          }
                        ]
                      }));
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند جديد</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newInvoiceForm.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...newInvoiceForm.items];
                            newItems[idx].description = e.target.value;
                            setNewInvoiceForm({ ...newInvoiceForm, items: newItems });
                          }}
                          placeholder="وصف الخدمة أو الرسوم الحكومية..."
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                        {newInvoiceForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewInvoiceForm(prev => ({
                                ...prev,
                                items: prev.items.filter((_, iIdx) => iIdx !== idx)
                              }));
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <label className="font-bold text-slate-500 block">السعر / الرسوم (ر.س):</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...newInvoiceForm.items];
                              newItems[idx].unitPrice = Number(e.target.value);
                              setNewInvoiceForm({ ...newInvoiceForm, items: newItems });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-500 block">الكمية:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...newInvoiceForm.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setNewInvoiceForm({ ...newInvoiceForm, items: newItems });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-500 block">خصم (ر.س):</label>
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={(e) => {
                              const newItems = [...newInvoiceForm.items];
                              newItems[idx].discount = Number(e.target.value);
                              setNewInvoiceForm({ ...newInvoiceForm, items: newItems });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 pt-4">
                          <input
                            type="checkbox"
                            checked={item.isGovFee}
                            onChange={(e) => {
                              const newItems = [...newInvoiceForm.items];
                              newItems[idx].isGovFee = e.target.checked;
                              newItems[idx].category = e.target.checked ? 'gov_fee' : 'service_fee';
                              setNewInvoiceForm({ ...newInvoiceForm, items: newItems });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="font-bold text-slate-700">رسوم حكومية أمانة (معفاة)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Totals Summary */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-slate-400 text-xs block">إجمالي الرسوم والخدمات:</span>
                  <span className="text-sm font-bold text-slate-200">
                    حكومي: {formatSAR(formCalculatedTotals.govTotal)} • أتعاب: {formatSAR(formCalculatedTotals.taxableTotal)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-indigo-300 text-xs block">شامل الضريبة 15%:</span>
                  <strong className="text-xl font-black text-emerald-400 font-mono">
                    {formatSAR(formCalculatedTotals.grandTotal)}
                  </strong>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Receipt className="w-4 h-4" />
                  <span>إصدار الفاتورة الضريبية الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FAQ EDIT / ADD MODAL */}
      {/* ========================================================================= */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingFaq.id ? 'تعديل السؤال الشائع' : 'إضافة سؤال شائع جديد'}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">تصنيف السؤال</label>
                <input
                  type="text"
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  placeholder="مثال: عام، بلدي، الفواتير، التراخيص..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نص السؤال *</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="اكتب السؤال بوضوح..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الإجابة النموذجية الشاملة *</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="اكتب الإجابة المفصلة..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  حفظ السؤال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
