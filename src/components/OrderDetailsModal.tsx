import React from 'react';
import {
  X,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
  CreditCard,
  Printer,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Receipt,
  FileCheck,
  Send,
  MessageSquare,
  HelpCircle,
  Landmark
} from 'lucide-react';
import { MasterOrder, OrderItem, Establishment } from '../types';
import { formatSAR, getOrderStatusBadge } from '../utils/complianceEngine';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MasterOrder | null;
  establishment?: Establishment;
  onPayOrder?: (orderId: string) => void;
  onApproveQuote?: (orderId: string) => void;
  onContactSpecialist?: (orderId: string, message: string) => void;
  showToast?: (msg: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  establishment,
  onPayOrder,
  onApproveQuote,
  onContactSpecialist,
  showToast = (_msg?: string) => {}
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'services' | 'fees' | 'gov_timeline'>('overview');
  const [specialistMessage, setSpecialistMessage] = React.useState('');
  const [isSendingMsg, setIsSendingMsg] = React.useState(false);

  if (!isOpen || !order) return null;

  const statusBadge = getOrderStatusBadge(order.status);
  const items = order.items || [];
  const govFees = order.totalGovFees ?? order.govFeeTotal ?? items.reduce((acc, it) => acc + (it.govFee || 0), 0);
  const sabbaqFees = order.totalSabbaqFees ?? order.sabbaqFeeTotal ?? items.reduce((acc, it) => acc + (it.sabbaqFee || 0), 0);
  const vat = order.totalVat ?? order.vatTotal ?? Math.round(sabbaqFees * 0.15);
  const grandTotal = order.grandTotal ?? order.totalAmount ?? (govFees + sabbaqFees + vat);

  const handlePrint = () => {
    window.print();
    showToast('جاري تحضير وطباعة تفاصيل المعاملة والسند...');
  };

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialistMessage.trim()) return;
    setIsSendingMsg(true);
    setTimeout(() => {
      if (onContactSpecialist) {
        onContactSpecialist(order.id, specialistMessage);
      }
      showToast('تم إرسال رسالتك إلى المعقب / المستشار المسؤول عن المعاملة بنجاح.');
      setSpecialistMessage('');
      setIsSendingMsg(false);
    }, 400);
  };

  // Determine governmental portal from order or items
  const govAuthority = items[0]?.authority || 'أمانة منطقة الرياض - منصة بلدي';
  const govTxNumber = (order.govTransactionNumbers && order.govTransactionNumbers.length > 0)
    ? order.govTransactionNumbers[0]
    : `GOV-${order.id.slice(-6).toUpperCase()}-2026`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-['Cairo'] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-l from-slate-900 via-slate-850 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 border border-white/15 flex items-center justify-center font-bold shadow-inner shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  {order.orderNumber || `#${order.id}`}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
                {order.paymentStatus === 'paid' && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                    مسدد بالكامل
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                تفاصيل الطلب والمعاملة الحكومية
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>تاريخ الإنشاء: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '2026-08-15'}</span>
                <span>•</span>
                <span>المنشأة: {establishment?.name || order.establishmentName || 'المنشأة الرئيسية'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="طباعة تفاصيل الطلب"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/80 border-b border-slate-200 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>نظرة عامة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'services'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>قائمة الخدمات المطلوبة ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'fees'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>تفاصيل الرسوم والفاتورة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gov_timeline')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'gov_timeline'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>حالة المعاملة الحكومية</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Summary Hero Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">إجمالي الرسوم</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block font-['Cairo']">
                    {formatSAR(grandTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400">شامل الضريبة والرسوم الحكومية</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">عدد البنود</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block font-['Cairo']">
                    {items.length} خدمات
                  </span>
                  <span className="text-[10px] text-slate-400">مدرجة في هذه المعاملة</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">الجهة الحكومية</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-900 mt-0.5 block truncate">
                    {govAuthority}
                  </span>
                  <span className="text-[10px] text-indigo-600">الربط الإلكتروني نشط</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">المعقب / المستشار</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-900 mt-0.5 block truncate">
                    {order.assignedSpecialist || 'مستشار سبّاق الميداني'}
                  </span>
                  <span className="text-[10px] text-emerald-700">متابع حتى الاعتماد</span>
                </div>
              </div>

              {/* Quick Services Peek */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>الخدمات المطلوبة في هذا الطلب</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    عرض التفاصيل الكاملة ←
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={it.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{it.serviceName || it.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {it.authority}
                          </span>
                        </div>
                        {it.branchName && (
                          <p className="text-[11px] text-slate-500 mt-0.5">الفرع: {it.branchName}</p>
                        )}
                      </div>
                      <span className="font-black text-slate-900 shrink-0 font-['Cairo']">
                        {formatSAR(it.total || (it.govFee + it.sabbaqFee + it.vat))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governmental Tracking Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-indigo-700" />
                    <span className="font-extrabold text-indigo-950">رقم المعاملة الحكومية المعتمدة:</span>
                    <span className="font-mono font-black text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {govTxNumber}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">
                    الجهة: {govAuthority} • تم التحقق من المرفقات وجاري المتابعة الميدانية والنظامية.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('gov_timeline')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>متابعة الخطوات الحكومية</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notes / Specialist Comments */}
              {order.notes && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">ملاحظات وتعليمات المعاملة:</span>
                  <p className="text-amber-800 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Services List */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  قائمة الخدمات والإجراءات المطلوبة ({items.length})
                </h3>
                <span className="text-xs text-slate-500">
                  كافة الرسوم والأتعاب الحكومية موثقة ومعتمدة
                </span>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={it.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{it.serviceName || it.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {it.authority}
                          </span>
                        </div>
                        {it.branchName && (
                          <p className="text-xs text-slate-500 mt-1 mr-7">
                            الفرع المستهدف: <span className="font-semibold text-slate-700">{it.branchName}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-left shrink-0 font-['Cairo'] mr-7 sm:mr-0">
                        <span className="text-xs font-medium text-slate-400 block">الإجمالي للبند</span>
                        <span className="text-base font-black text-slate-900">
                          {formatSAR(it.total || (it.govFee + it.sabbaqFee + it.vat))}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">الرسوم الحكومية:</span>
                        <span className="font-bold text-slate-800 font-['Cairo']">{formatSAR(it.govFee || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">أتعاب الخدمة والتعقيب:</span>
                        <span className="font-bold text-slate-800 font-['Cairo']">{formatSAR(it.sabbaqFee || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">ضريبة القيمة المضافة (15%):</span>
                        <span className="font-bold text-slate-800 font-['Cairo']">{formatSAR(it.vat || Math.round((it.sabbaqFee || 0) * 0.15))}</span>
                      </div>
                    </div>

                    {it.requiredDocs && it.requiredDocs.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-600 block mb-1">المستندات المطلوبة للإجراء:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {it.requiredDocs.map((doc, dIdx) => (
                            <span key={dIdx} className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-md border border-slate-200">
                              ✓ {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Fee Breakdown */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-600" />
                  <span>بيان الرسوم والفاتورة المعتمدة</span>
                </h3>

                <div className="divide-y divide-slate-200 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">إجمالي الرسوم الحكومية الرسمية (سداد / المنصات):</span>
                    <span className="font-bold text-slate-900 font-['Cairo']">{formatSAR(govFees)}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">أتعاب منصة سبّاق والتعقيب الفني المعتمد:</span>
                    <span className="font-bold text-slate-900 font-['Cairo']">{formatSAR(sabbaqFees)}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">ضريبة القيمة المضافة (15% على الأتعاب):</span>
                    <span className="font-bold text-slate-900 font-['Cairo']">{formatSAR(vat)}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between bg-emerald-50/60 -mx-5 px-5 font-bold text-sm text-emerald-950">
                    <span>المجموع الإجمالي المستحق:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700 font-['Cairo']">
                      {formatSAR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>معلومات السداد والفاتورة الضريبية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">حالة الدفع:</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {order.paymentStatus === 'paid' ? 'تم السداد بنجاح' : 'في انتظار السداد / الاعتماد'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">طريقة السداد:</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      مدى / سداد / تحويل بنكي
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">الرقم الضريبي لسبّاق:</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">
                      31045892100003
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Governmental Transaction Status & Timeline */}
          {activeTab === 'gov_timeline' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-l from-indigo-900 to-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-indigo-200 font-bold block">المنصة الحكومية المعنية</span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">{govAuthority}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-300">رقم المعاملة المرجعي:</span>
                    <span className="font-mono font-black text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-white/20">
                      {govTxNumber}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-xs">
                  <span className="text-slate-300 block text-[11px]">حالة الاعتماد الحكومي:</span>
                  <span className="font-extrabold text-emerald-400 text-sm block mt-0.5">
                    {order.status === 'completed' 
                      ? 'مكتملة ومصدرة' 
                      : order.status === 'submitted_to_gov' || order.status === 'awaiting_gov_reply'
                      ? 'قيد المعالجة لدى الجهة'
                      : 'قيد التدقيق والرفع الميداني'}
                  </span>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>المسار الإجرائي للمعاملة</span>
                </h4>

                <div className="relative border-r-2 border-slate-200 mr-4 pr-6 space-y-6 text-xs">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -right-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">استلام الطلب وتدقيق المستندات بالذكاء الاصطناعي</h5>
                      <p className="text-slate-500 mt-0.5">تم التحقق من مطابقة متطلبات النشاط والسجل التجاري وكروكي الموقع.</p>
                      <span className="text-[10px] text-slate-400 font-mono">مكتمل • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '2026-08-15'}</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -right-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">الرفع الإلكتروني عبر المنصة الحكومية وتوليد رقم المعاملة</h5>
                      <p className="text-slate-500 mt-0.5">تم إنشاء الطلب وربط المفوض وإصدار رقم التتبع: {govTxNumber}</p>
                      <span className="text-[10px] text-slate-400 font-mono">مكتمل • عبر بوابة {govAuthority.split('-')[0] || 'بلدي'}</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className={`absolute -right-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      order.status === 'completed'
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
                    }`}>
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">التدقيق الفني والاعتماد النهائي لدى الجهة الحكومية</h5>
                      <p className="text-slate-500 mt-0.5">
                        {order.status === 'completed'
                          ? 'تم اعتماد المعاملة وسداد الرسوم وإصدار الترخيص النهائي.'
                          : 'المعاملة قيد المراجعة لدى الموظف المختص بالبلدية / الجهة الحكومية.'}
                      </p>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        {order.status === 'completed' ? 'معتمدة ومصدرة' : 'جاري المتابعة والتحديث اليومي'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className={`absolute -right-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      order.status === 'completed'
                        ? 'bg-emerald-600 ring-4 ring-emerald-100'
                        : 'bg-slate-300'
                    }`}>
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">الأرشفة وتحديث سجل الامتثال في سبّاق</h5>
                      <p className="text-slate-500 mt-0.5">إيداع الترخيص في الخزينة الرقمية وتفعيل الإشعارات الاستباقية للتجديد القادم.</p>
                      <span className="text-[10px] text-slate-400">
                        {order.status === 'completed' ? 'مكتمل بنجاح' : 'الخطوة التالية فور الاعتماد'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct Messaging to Specialist */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-slate-900">
                    مراسلة المعقب / المستشار المعين ({order.assignedSpecialist || 'فريق سبّاق'})
                  </h4>
                </div>

                <form onSubmit={handleSendMsg} className="flex gap-2">
                  <input
                    type="text"
                    value={specialistMessage}
                    onChange={(e) => setSpecialistMessage(e.target.value)}
                    placeholder="اكتب استفسارك أو طلب التحديث المباشر هنا..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMsg || !specialistMessage.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>طباعة السند / الفاتورة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {order.paymentStatus !== 'paid' && onPayOrder && (
              <button
                type="button"
                onClick={() => {
                  onPayOrder(order.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>سداد الرسوم الآن ({formatSAR(grandTotal)})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
