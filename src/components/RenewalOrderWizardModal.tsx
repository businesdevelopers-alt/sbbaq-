import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Upload, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Sparkles, 
  Zap, 
  Check, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { 
  ProactiveAlertItem, 
  Establishment, 
  MasterOrder, 
  DocumentItem 
} from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface RenewalOrderWizardModalProps {
  alertItem: ProactiveAlertItem | null;
  establishment: Establishment;
  documents: DocumentItem[];
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: MasterOrder) => void;
  onNavigateToOrders?: (orderId: string) => void;
  showToast: (msg: string) => void;
}

export const RenewalOrderWizardModal: React.FC<RenewalOrderWizardModalProps> = ({
  alertItem,
  establishment,
  documents,
  isOpen,
  onClose,
  onCreateOrder,
  onNavigateToOrders,
  showToast,
}) => {
  if (!isOpen || !alertItem) return null;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: 'uploaded' | 'auto_attached' }[]>([
    { name: 'السجل_التجاري_المعتمد.pdf', size: '1.4 MB', status: 'auto_attached' }
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'credit' | 'apple_pay' | 'sadad'>('mada');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<MasterOrder | null>(null);

  // Financial calculations
  const govFee = alertItem.costGovEstimated || 1200;
  const sabbaqFee = alertItem.costSabbaqEstimated || 450;
  const vat = Math.round(sabbaqFee * 0.15);
  const totalAmount = govFee + sabbaqFee + vat;

  // Required docs list
  const requiredDocs = [
    { title: 'نسخة الترخيص / الوثيقة السابقة', isRequired: true },
    { title: 'عقد الإيجار الإلكتروني المعتمد أو صك الملكية', isRequired: true },
    { title: 'السجل التجاري الساري للمنشأة', isRequired: true },
    { title: 'شهادة الدفاع المدني / تقرير السلامة (إن وجد)', isRequired: false },
  ];

  // Handle document upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [
        ...prev,
        { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, status: 'uploaded' }
      ]);
      showToast(`تم رفع المستند «${file.name}» بنجاح.`);
    }
  };

  // One-click auto attach from establishment vault
  const handleAutoAttachFromVault = () => {
    const estDocs = documents.filter(d => d.establishmentId === establishment.id);
    const newItems = estDocs.slice(0, 3).map(d => ({
      name: `${d.title}.pdf`,
      size: d.fileSize || '1.1 MB',
      status: 'auto_attached' as const
    }));

    setUploadedFiles(prev => {
      const existingNames = new Set(prev.map(p => p.name));
      const filtered = newItems.filter(n => !existingNames.has(n.name));
      return [...prev, ...filtered];
    });

    showToast('تم سحب وإرفاق الوثائق المعتمدة تلقائياً من محفظة المنشأة.');
  };

  // Step 1 -> Step 2
  const handleProceedToQuotation = () => {
    if (uploadedFiles.length === 0) {
      showToast('يرجى إرفاق المستندات المطلوبة أو استخدام السحب التلقائي.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 (Approve Quotation & Create Master Order in State)
  const handleApproveQuotation = () => {
    const orderNum = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const govTxNum = `GOV-${alertItem.authority.substring(0, 3)}-1447-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: MasterOrder = {
      id: `order-renew-${Date.now()}`,
      orderNumber: orderNum,
      establishmentId: establishment.id,
      establishmentName: establishment.name,
      status: 'awaiting_payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          serviceId: alertItem.sourceId,
          serviceName: `تجديد: ${alertItem.title}`,
          authority: alertItem.authority,
          type: 'renewal',
          govFee,
          sabbaqFee,
          vat,
          total: totalAmount,
          status: 'pending'
        }
      ],
      govFeeTotal: govFee,
      sabbaqFeeTotal: sabbaqFee,
      vatTotal: vat,
      totalAmount,
      totalGovFees: govFee,
      totalSabbaqFees: sabbaqFee,
      totalVat: vat,
      grandTotal: totalAmount,
      quoteApproved: true,
      notes: `طلب تجديد فوري استباقي عبر مركز التنبيهات الذكي (${alertItem.title} - رقم: ${alertItem.documentNumber} - الفرع: ${alertItem.branchName || 'الرئيسي'})`,
      assignedSpecialist: 'فريق المعاملات والتراخيص الحكومية الموحد',
      govTransactionNumbers: [govTxNum],
      paymentStatus: 'unpaid'
    };

    setCreatedOrder(newOrder);
    onCreateOrder(newOrder);
    setCurrentStep(3);
    showToast(`تم إنشاء الطلب رقم ${orderNum} واعتماد عرض السعر بنجاح.`);
  };

  // Step 3 -> Step 4 (Payment execution)
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      if (createdOrder) {
        createdOrder.paymentStatus = 'paid';
        createdOrder.status = 'in_progress';
      }
      setCurrentStep(4);
      showToast('تم السداد بنجاح وبدأ فريق سبّاق إجراءات إصدار وتجديد الترخيص.');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Cairo']">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  إجراء تجديد فوري: {alertItem.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {establishment.name} • الفرع: {alertItem.branchName || 'الرئيسي'} • رقم: #{alertItem.documentNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Visual Stepper */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold">
            {/* Step 1 */}
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-indigo-700' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep > 1 ? 'bg-emerald-600 text-white' : currentStep === 1 ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className="hidden sm:inline">رفع المستندات</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-indigo-700' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className="hidden sm:inline">عرض السعر والاعتماد</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-indigo-700' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep > 3 ? 'bg-emerald-600 text-white' : currentStep === 3 ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <span className="hidden sm:inline">السداد الإلكتروني</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 4 */}
            <div className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 4 ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep === 4 ? <Check className="w-3.5 h-3.5" /> : '4'}
              </div>
              <span className="hidden sm:inline">المتابعة والتنفيذ</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: Upload Documents */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 space-y-1">
                  <h4 className="font-bold">المستندات المطلوبة لتجديد هذا الترخيص</h4>
                  <p className="text-indigo-800 leading-relaxed">
                    يرجى التحقق من توفر المستندات المطلوبة أدناه، يمكنك إرفاقها مباشرة أو الاستفادة من ميزة السحب التلقائي من محفظة المنشأة.
                  </p>
                </div>
              </div>

              {/* Required Docs Checklist */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800">قائمة المستندات المعتمدة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {requiredDocs.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{doc.title}</span>
                      </span>
                      {doc.isRequired && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                          إلزامي
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone & Auto-attach */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 p-5 rounded-2xl text-center space-y-3 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div>
                    <p className="font-bold text-xs text-slate-800">اسحب وأفلت الملفات هنا، أو انقر للاختيار</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">الصيغ المدعومة: PDF, PNG, JPG (الحد الأقصى 10MB لكل ملف)</p>
                  </div>
                  <label className="inline-block bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer">
                    تصفح المستندات
                    <input type="file" onChange={handleFileUpload} className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">لديك مستندات مخزنة مسبقاً؟</span>
                  <button
                    type="button"
                    onClick={handleAutoAttachFromVault}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>سحب تلقائي من محفظة المنشأة</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">المستندات المرفقة جاهزة للتقديم ({uploadedFiles.length}):</h4>
                  <div className="space-y-1.5">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800">{file.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {file.status === 'auto_attached' ? 'محفظة سبّاق' : 'تم الرفع'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Quotation & Approval */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm">عرض السعر المعتمد للتجديد</h4>
                    <p className="text-xs text-slate-400 mt-0.5">صادر من منصة سبّاق للامتثال المؤسسي</p>
                  </div>
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg">
                    شامل الرسوم والضريبة
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1. الرسوم الحكومية الرسمية المقدرة ({alertItem.authority}):</span>
                    <span className="font-bold font-mono text-white">{formatSAR(govFee)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>2. أتعاب سبّاق للإنجاز والتسريع والمتابعة الحكومية:</span>
                    <span className="font-bold font-mono text-white">{formatSAR(sabbaqFee)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>3. ضريبة القيمة المضافة (15% على أتعاب سبّاق):</span>
                    <span className="font-bold font-mono text-white">{formatSAR(vat)}</span>
                  </div>

                  <div className="border-t border-slate-700 pt-3 flex items-center justify-between text-sm">
                    <span className="font-black text-amber-300">إجمالي المبلغ المستحق:</span>
                    <span className="font-black font-mono text-xl text-amber-400">{formatSAR(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees & Terms */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ضمانات سبّاق للتجديد الفوري:</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px] leading-relaxed">
                  <li>متابعة المعاملة لحظياً مع الجهة الحكومية المختصة وتقديم التقرير النهائي.</li>
                  <li>استرداد كامل الرسوم في حال عدم القدرة على تنفيذ الخدمة لأسباب نظامية.</li>
                  <li>حفظ وتحديث نسخة الترخيص الجديد فور صدوره في محفظة المنشأة الرقمية.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <div>
                  <h4 className="font-bold text-xs">المبلغ الإجمالي المعتمد للسداد:</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">رقم الطلب: {createdOrder?.orderNumber || 'SBQ-2026-8910'}</p>
                </div>
                <span className="text-xl font-black font-mono text-emerald-800">
                  {formatSAR(totalAmount)}
                </span>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-slate-800">اختر طريقة السداد المفضلة:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'mada' ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">بطاقة مدى</span>
                      <input type="radio" name="pay" checked={paymentMethod === 'mada'} onChange={() => setPaymentMethod('mada')} className="accent-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">سداد فوري عبر بطاقات البنوك السعودية</span>
                  </label>

                  <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'credit' ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">فيزا / ماستركارد</span>
                      <input type="radio" name="pay" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="accent-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">البطاقات الائتمانية والشركات</span>
                  </label>

                  <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'apple_pay' ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">Apple Pay</span>
                      <input type="radio" name="pay" checked={paymentMethod === 'apple_pay'} onChange={() => setPaymentMethod('apple_pay')} className="accent-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">سداد سريع بلمسة واحدة</span>
                  </label>

                  <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'sadad' ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">فاتورة سداد</span>
                      <input type="radio" name="pay" checked={paymentMethod === 'sadad'} onChange={() => setPaymentMethod('sadad')} className="accent-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">رمز المفوتر: 144 عبر التطبيق البنكي</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Live Order Tracking */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  تم إنشاء طلب التجديد وبدء التنفيذ بنجاح!
                </h3>
                <p className="text-xs text-slate-500">
                  تم قيد الطلب في حساب منشأتك وتوجيهه للمعقب والمستشار الحكومي المختص.
                </p>
              </div>

              {/* Order Key Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-right space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">رقم الطلب في سبّاق:</span>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    {createdOrder?.orderNumber || 'SBQ-2026-8910'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">رقم المعاملة الحكومية:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {createdOrder?.govTransactionNumbers?.[0] || 'GOV-1447-98124'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">المعقب والمستشار المخصص:</span>
                  <span className="font-bold text-slate-800">
                    {createdOrder?.assignedSpecialist || 'فريق المعاملات الحكومية الموحد'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الحالة الراهنة:</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                    قيد المعالجة والإصدار الحكومي
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {currentStep > 1 && currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الخطوة السابقة</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleProceedToQuotation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>مراجعة عرض السعر</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleApproveQuotation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>اعتماد عرض السعر والانتقال للسداد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProcessPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>جاري معالجة السداد...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>تأكيد السداد الفوري ({formatSAR(totalAmount)})</span>
                </>
              )}
            </button>
          )}

          {currentStep === 4 && (
            <div className="flex items-center gap-2 w-full justify-end">
              {onNavigateToOrders && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (createdOrder) {
                      onNavigateToOrders(createdOrder.id);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>متابعة الطلب في قائمة الطلبات</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
