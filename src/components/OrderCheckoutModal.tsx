import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Lock,
  Send,
  Download,
  Receipt,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  Tag,
  Check,
  User,
  Phone,
  Mail,
  Zap,
  ExternalLink
} from 'lucide-react';
import { ServiceCatalogItem, Establishment, UserAccount, MasterOrder, OrderItem } from '../types';
import { formatSAR } from '../utils/complianceEngine';

export interface OrderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceCatalogItem | null;
  cartServices?: ServiceCatalogItem[];
  currentUser?: UserAccount | null;
  establishments: Establishment[];
  activeEstablishment?: Establishment;
  onOpenAuth: (mode: 'login' | 'register' | 'nafath') => void;
  onCompleteOrder: (order: MasterOrder) => void;
  onGoToOrders?: () => void;
  onBrowseServices?: () => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  cartServices = [],
  currentUser,
  establishments = [],
  activeEstablishment,
  onOpenAuth,
  onCompleteOrder,
  onGoToOrders,
  onBrowseServices,
}) => {
  // Services to be ordered (single or cart)
  const itemsToOrder: ServiceCatalogItem[] = selectedService
    ? [selectedService]
    : cartServices.length > 0
    ? cartServices
    : [];

  // Steps: 1 = Establishment, 2 = Docs & Info, 3 = Review & Payment, 4 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected establishment & branch
  const [selectedEstId, setSelectedEstId] = useState<string>(
    activeEstablishment?.id || (establishments.length > 0 ? establishments[0].id : '')
  );
  const [selectedBranchName, setSelectedBranchName] = useState<string>('الفرع الرئيسي');

  // New establishment inputs if user wants to add on the fly
  const [isAddingNewEst, setIsAddingNewEst] = useState(false);
  const [newEstName, setNewEstName] = useState('');
  const [newEstCr, setNewEstCr] = useState('');

  // Contact info
  const [contactPerson, setContactPerson] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Uploaded docs mapping: docName -> status / fileName
  const [uploadedDocs, setUploadedDocs] = useState<{ [docName: string]: { fileName: string; uploadedAt: string } }>({});
  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'visa_mastercard' | 'apple_pay' | 'tamara' | 'tabby'>('mada');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('5888 •••• •••• 9102');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('882');

  // Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Submission / Loading state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<MasterOrder | null>(null);

  // Keep contact in sync with logged-in user
  useEffect(() => {
    if (currentUser) {
      if (!contactPerson && currentUser.name) setContactPerson(currentUser.name);
      if (!contactPhone && currentUser.phone) setContactPhone(currentUser.phone);
      if (!contactEmail && currentUser.email) setContactEmail(currentUser.email);
    }
  }, [currentUser]);

  // Keep establishment in sync
  useEffect(() => {
    if (establishments.length > 0 && !selectedEstId) {
      setSelectedEstId(establishments[0].id);
    }
  }, [establishments, selectedEstId]);

  if (!isOpen || itemsToOrder.length === 0) return null;

  // Aggregate financial calculation
  const totalGovFee = itemsToOrder.reduce((sum, item) => sum + item.govFeeEstimated, 0);
  const totalSabbaqFee = itemsToOrder.reduce((sum, item) => sum + item.sabbaqFee, 0);
  const effectiveSabbaqFee = Math.max(0, totalSabbaqFee - discountAmount);
  const totalVat = Math.round(effectiveSabbaqFee * 0.15 * 100) / 100;
  const grandTotal = totalGovFee + effectiveSabbaqFee + totalVat;

  // Aggregate required documents
  const allRequiredDocs: string[] = Array.from(
    new Set(itemsToOrder.flatMap((item) => item.requiredDocuments))
  );

  // Selected establishment object
  const currentEst = establishments.find((e) => e.id === selectedEstId) || {
    id: 'est-custom',
    name: newEstName || currentUser?.establishmentName || 'المنشأة المستفيدة',
    crNumber: newEstCr || currentUser?.crNumber || '1010XXXXXX',
    city: 'الرياض',
  };

  const handleApplyCoupon = () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'SABBAQ2026' || code === 'VISION2030' || code === 'STARTUP') {
      const disc = Math.round(totalSabbaqFee * 0.15); // 15% discount on Sabbaq Fee
      setDiscountAmount(disc);
      setCouponSuccess(`تم تطبيق كود الخصم بنجاح! تم خصم ${formatSAR(disc)} من أتعاب سبّاق`);
    } else if (code === '') {
      setCouponError('الرجاء إدخال رمز الخصم أولاً');
    } else {
      setCouponError('كود الخصم غير صالح أو منتهي الصلاحية');
    }
  };

  const handleSimulateDocUpload = (docName: string) => {
    setUploadingDocKey(docName);
    setTimeout(() => {
      setUploadedDocs((prev) => ({
        ...prev,
        [docName]: {
          fileName: `${docName.replace(/\s+/g, '_').substring(0, 20)}_scanned.pdf`,
          uploadedAt: new Date().toLocaleTimeString('ar-SA'),
        },
      }));
      setUploadingDocKey(null);
    }, 600);
  };

  const handleRemoveUploadedDoc = (docName: string) => {
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  const handleProcessPayment = () => {
    if (!agreedToTerms) {
      alert('يُرجى الموافقة على الشروط والأحكام وسياسة الاسترداد للمتابعة.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      const orderNumber = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderItems: OrderItem[] = itemsToOrder.map((srv) => ({
        id: `itm-${Math.random().toString(36).substring(2, 9)}`,
        serviceId: srv.id,
        serviceName: srv.name,
        authority: srv.authority,
        type: srv.type,
        govFee: srv.govFeeEstimated,
        sabbaqFee: srv.sabbaqFee,
        vat: srv.vatAmount,
        total: srv.totalEstimated,
        requiredDocs: srv.requiredDocuments,
        uploadedDocs: Object.keys(uploadedDocs),
        branchName: selectedBranchName,
      }));

      const newOrder: MasterOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        establishmentId: selectedEstId || 'est-1',
        establishmentName: currentEst.name,
        status: 'awaiting_approval',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: orderItems,
        govFeeTotal: totalGovFee,
        sabbaqFeeTotal: effectiveSabbaqFee,
        vatTotal: totalVat,
        totalAmount: grandTotal,
        totalGovFees: totalGovFee,
        totalSabbaqFees: effectiveSabbaqFee,
        totalVat: totalVat,
        grandTotal: grandTotal,
        notes: orderNotes || `طلب تم إنشاؤه عبر بوابة الخدمات العامة - المنشأة: ${currentEst.name}`,
        assignedSpecialist: 'فريق تعقيب التراخيص الحكومية المعتمد',
        specialistPhone: '800-124-7722',
        quoteApproved: true,
      };

      setCreatedOrder(newOrder);
      onCompleteOrder(newOrder);
      setIsProcessingPayment(false);
      setCurrentStep(4); // Success step
    }, 1500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {currentStep === 4 ? 'تم تأكيد السداد بنجاح' : 'إتمام طلب الخدمة الحكومية'}
              </span>
              <span className="text-xs text-slate-400">
                {itemsToOrder.length === 1 ? itemsToOrder[0].code : `${itemsToOrder.length} خدمات مجمعة`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Cairo']">
              {currentStep === 4
                ? 'إيصال استلام الطلب وتأكيد السداد'
                : itemsToOrder.length === 1
                ? itemsToOrder[0].name
                : `سلة طلب الخدمات (${itemsToOrder.length} خدمات)`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar (if not yet in success) */}
        {currentStep < 4 && (
          <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 shrink-0">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-emerald-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800'}`}>1</span>
              <span>المنشأة</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 rotate-180" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-emerald-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800'}`}>2</span>
              <span>المستندات</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 rotate-180" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-emerald-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800'}`}>3</span>
              <span>المراجعة والسداد</span>
            </div>
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Guest Account Interstitial Guard if not logged in */}
          {!currentUser && currentStep < 4 ? (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-black text-white font-['Cairo']">
                  تسجيل الدخول لاستكمال طلب الخدمة
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  لضمان ربط المعاملة الحكومية بسجل منشأتك التجاري وتوفير فواتير ضريبية نظامية، يُرجى تسجيل الدخول أو الدخول السريع عبر النفاذ الوطني الموحد.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم حفظ اختيارك للخدمة مؤقتاً ولن تضيع بيانات السلة</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => onOpenAuth('nafath')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول مفوض المنشأة عبر نفاذ</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>تسجيل الدخول بكلمة المرور</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: ESTABLISHMENT & BRANCH SELECTION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white font-['Cairo'] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>تحديد المنشأة والفرع المستفيد من الخدمة</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      اختر المنشأة المسجلة باسمك أو الفرع المراد تنفيذ واستخراج التراخيص له:
                    </p>
                  </div>

                  {!isAddingNewEst && establishments.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2.5">
                        {establishments.map((est) => (
                          <label
                            key={est.id}
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              selectedEstId === est.id
                                ? 'bg-emerald-950/40 border-emerald-500/80 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="establishmentSelect"
                                checked={selectedEstId === est.id}
                                onChange={() => setSelectedEstId(est.id)}
                                className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                              />
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-white">{est.name}</div>
                                <div className="text-[11px] text-slate-400">سجل تجاري: {est.crNumber} • {est.city}</div>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-900 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded-md font-bold">
                              معتمدة
                            </span>
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingNewEst(true)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>+ إضافة سجل تجاري / منشأة أخرى</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                      <div className="text-xs font-bold text-slate-300">بيانات المنشأة الجديدة بالسجل التجاري:</div>
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1 font-bold">اسم المنشأة كما في السجل التجاري:</label>
                          <input
                            type="text"
                            value={newEstName}
                            onChange={(e) => setNewEstName(e.target.value)}
                            placeholder="مثال: شركة الروابي للتجارة والمقاولات ذ.م.م"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 font-bold">رقم السجل التجاري (10 أرقام):</label>
                          <input
                            type="text"
                            value={newEstCr}
                            onChange={(e) => setNewEstCr(e.target.value)}
                            placeholder="1010XXXXXX"
                            maxLength={10}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      {establishments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewEst(false)}
                          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          العودة للمنشآت المسجلة مسبقاً
                        </button>
                      )}
                    </div>
                  )}

                  {/* Branch name input */}
                  <div className="space-y-2 text-xs">
                    <label className="block text-slate-400 font-bold">الفرع أو الموقع المعني بالمعاملة:</label>
                    <input
                      type="text"
                      value={selectedBranchName}
                      onChange={(e) => setSelectedBranchName(e.target.value)}
                      placeholder="مثال: الفرع الرئيسي - العليا، أو فرع جدة الكورنيش"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-sans"
                    />
                  </div>

                  {/* Contact details */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <div className="text-slate-300 font-bold">بيانات مسؤول المتابعة والتواصل:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">اسم المفوض:</label>
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="الاسم الكامل"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">رقم الجوال لتحديثات WhatsApp:</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="05XXXXXXXX"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>المتابعة لرفع المستندات</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REQUIRED DOCUMENTS UPLOAD & NOTES */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white font-['Cairo'] flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>رفع المستندات الإلزامية والمتطلبات</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      يُرجى إرفاق المستندات المطلوبة أو استخدام المسودات المحفوظة في خزينة وثائق منشأتك:
                    </p>
                  </div>

                  {/* Required Docs List */}
                  <div className="space-y-3">
                    {allRequiredDocs.map((docName, idx) => {
                      const isUploaded = !!uploadedDocs[docName];
                      const isUploading = uploadingDocKey === docName;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            isUploaded
                              ? 'bg-emerald-950/30 border-emerald-600/60'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2.5">
                              <FileText className={`w-4 h-4 mt-0.5 ${isUploaded ? 'text-emerald-400' : 'text-slate-400'}`} />
                              <div>
                                <div className="font-bold text-white">{docName}</div>
                                {isUploaded ? (
                                  <div className="text-[11px] text-emerald-300">
                                    ✓ تم الرفع: {uploadedDocs[docName].fileName} ({uploadedDocs[docName].uploadedAt})
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-500">مطلوب من الجهة المنظمة</div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {isUploaded ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUploadedDoc(docName)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                                  title="حذف المستند"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isUploading}
                                  onClick={() => handleSimulateDocUpload(docName)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  {isUploading ? (
                                    <span>جاري الرفع...</span>
                                  ) : (
                                    <>
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>رفع المستند</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes / Special Instructions */}
                  <div className="space-y-2 text-xs">
                    <label className="block text-slate-400 font-bold">ملاحظات إضافية أو تفاصيل خاصة بالمعاملة (اختياري):</label>
                    <textarea
                      rows={3}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="أضف أي تفاصيل خاصة (مثلاً: رقم المعاملة السابقة، رغبة في استخراج ترخيص فوري، تعديل المساحة...)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-sans resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer"
                    >
                      الرجوع للسابق
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>المتابعة لمراجعة السعر والسداد</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER REVIEW & PAYMENT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white font-['Cairo'] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>مراجعة تفاصيل الطلب وخيارات السداد الآمن</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      راجع ملخص التكاليف والمنشأة المستفيدة قبل تأكيد السداد الإلكتروني:
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                    <div className="space-y-2 pb-3 border-b border-slate-800">
                      <div className="text-slate-400 font-bold">الخدمات المطلوبة:</div>
                      {itemsToOrder.map((srv) => (
                        <div key={srv.id} className="flex justify-between items-center text-slate-200">
                          <span className="font-bold text-white">• {srv.name}</span>
                          <span className="text-slate-400">{srv.authority}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-slate-400">المنشأة المستفيدة: </span>
                        <strong className="text-white">{currentEst.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">الفرع: </span>
                        <strong className="text-white">{selectedBranchName}</strong>
                      </div>
                    </div>

                    {/* Price Breakdown Table */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-slate-400">
                        <span>الرسوم الحكومية التقديرية:</span>
                        <span className="text-white font-mono">{formatSAR(totalGovFee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>أتعاب تنفيذ منصة سبّاق:</span>
                        <span className="text-emerald-400 font-mono font-bold">{formatSAR(totalSabbaqFee)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>الخصم المطبق:</span>
                          <span className="font-mono font-bold">- {formatSAR(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400">
                        <span>ضريبة القيمة المضافة (15% على الأتعاب):</span>
                        <span className="text-slate-300 font-mono">{formatSAR(totalVat)}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-black">
                        <span className="text-sm text-white font-['Cairo']">الإجمالي النهائي المطلوب سداده:</span>
                        <span className="text-2xl text-emerald-400 font-black font-['Cairo']">
                          {formatSAR(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code Input */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <label className="block text-slate-400 font-bold">هل لديك كود خصم أو قسيمة؟</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="أدخل كود الخصم (مثال: VISION2030)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponSuccess && <div className="text-[11px] text-emerald-400 font-bold">{couponSuccess}</div>}
                    {couponError && <div className="text-[11px] text-rose-400">{couponError}</div>}
                  </div>

                  {/* Payment Gateway Options */}
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-300 font-bold">اختر وسيلة الدفع الإلكتروني:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'mada', label: 'مدى (Mada)', badge: 'فوري' },
                        { id: 'apple_pay', label: 'Apple Pay', badge: 'نقرة واحدة' },
                        { id: 'visa_mastercard', label: 'فيزا / ماستركارد', badge: 'ائتماني' },
                        { id: 'tamara', label: 'تمارا / تابي', badge: 'قريباً' },
                      ].map((pm) => (
                        <label
                          key={pm.id}
                          className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                            paymentMethod === pm.id
                              ? 'bg-emerald-950/40 border-emerald-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === pm.id}
                              onChange={() => setPaymentMethod(pm.id as any)}
                              className="text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-[9px] bg-slate-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              {pm.badge}
                            </span>
                          </div>
                          <span className="font-bold text-xs text-white">{pm.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Card fields for Mada / Visa */}
                    {(paymentMethod === 'mada' || paymentMethod === 'visa_mastercard') && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 pt-3">
                        <div>
                          <label className="block text-slate-400 mb-1 text-[11px]">اسم حامل البطاقة:</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-slate-400 mb-1 text-[11px]">رقم البطاقة:</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1 text-[11px]">الرمز CVV:</label>
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              maxLength={3}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-900 border-slate-700"
                    />
                    <span className="leading-relaxed">
                      أوافق على <span className="text-emerald-400 underline">الشروط والأحكام</span> وسياسة الاسترداد وإلغاء المعاملات الحكومية المعتمدة لدى منصة سبّاق.
                    </span>
                  </label>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer"
                    >
                      تعديل المستندات
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPayment || !agreedToTerms}
                      onClick={handleProcessPayment}
                      className={`px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                        isProcessingPayment || !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري التحقق وسداد المبلغ...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>تأكيد الطلب وسداد {formatSAR(grandTotal)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS POST-PAYMENT CONFIRMATION */}
              {currentStep === 4 && createdOrder && (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  {/* Success Banner */}
                  <div className="bg-emerald-950/60 border border-emerald-500/50 p-6 rounded-3xl text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/80">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>

                    <h3 className="text-xl font-black text-white font-['Cairo']">
                      تم استلام طلبك وسداد الرسوم بنجاح!
                    </h3>

                    <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-mono text-emerald-400 font-bold">
                      <span>رقم الطلب الموحد:</span>
                      <span>{createdOrder.orderNumber}</span>
                    </div>

                    <p className="text-xs text-emerald-200/90 max-w-md mx-auto leading-relaxed">
                      تم إسناد المعاملة لفريق الامتثال والتعقيب الحكومي، وتم إرسال رسالة تأكيد لرقم جوالك المسجل.
                    </p>
                  </div>

                  {/* Official Tax Invoice / Receipt Box */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        <span>فاتورة ضريبية مبسطة (إيصال السداد)</span>
                      </div>
                      <button
                        onClick={handlePrintReceipt}
                        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة الإيصال</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>المنشأة: <strong className="text-white">{createdOrder.establishmentName}</strong></div>
                      <div>التاريخ: <strong className="text-white">{new Date().toLocaleDateString('ar-SA')}</strong></div>
                      <div>حالة السداد: <span className="text-emerald-400 font-bold">مدفوع بالكامل</span></div>
                      <div>حالة المعاملة: <span className="text-amber-400 font-bold">بانتظار المراجعة والإسناد</span></div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm">
                      <span className="text-white">المبلغ المدفوع:</span>
                      <span className="text-emerald-400">{formatSAR(createdOrder.grandTotal || grandTotal)}</span>
                    </div>
                  </div>

                  {/* Next Navigation Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    {onGoToOrders && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onGoToOrders();
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-4 h-4" />
                        <span>متابعة حالة الطلب في «طلباتي»</span>
                      </button>
                    )}

                    {onBrowseServices && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBrowseServices();
                        }}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>طلب خدمة حكومية أخرى</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
