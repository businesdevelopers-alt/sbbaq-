import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Building2,
  FileCheck2,
  ShieldCheck,
  PlusCircle,
  Clock,
  ShoppingCart,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FileText,
  Tag,
  X,
  Layers,
  MapPin,
  Users,
  Award,
  Fingerprint,
  Send,
  Eye,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Zap,
  ShoppingBag,
  HelpCircle,
  Scale
} from 'lucide-react';
import { ServiceCatalogItem, UserAccount } from '../types';
import { formatSAR } from '../utils/complianceEngine';

export interface PublicServicesPageProps {
  services: ServiceCatalogItem[];
  cartItemIds: string[];
  onAddToCart: (service: ServiceCatalogItem) => void;
  onRemoveFromCart?: (serviceId: string) => void;
  onRequestService: (service: ServiceCatalogItem) => void;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'register' | 'nafath') => void;
  onGoToHome: () => void;
  onGoToDashboard: () => void;
  currentUser?: UserAccount | null;
  selectedSlugOrId?: string | null;
  onSelectServiceSlug?: (slug: string | null) => void;
  hideHeaderAndFooter?: boolean;
}

export const PublicServicesPage: React.FC<PublicServicesPageProps> = ({
  services,
  cartItemIds,
  onAddToCart,
  onRemoveFromCart,
  onRequestService,
  onOpenCart,
  onOpenAuth,
  onGoToHome,
  onGoToDashboard,
  currentUser,
  selectedSlugOrId,
  onSelectServiceSlug,
  hideHeaderAndFooter = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeServiceDetails, setActiveServiceDetails] = useState<ServiceCatalogItem | null>(null);

  // Sync with selectedSlugOrId prop
  useEffect(() => {
    if (selectedSlugOrId) {
      const found = services.find(
        (s) => s.slug === selectedSlugOrId || s.id === selectedSlugOrId || s.code.toLowerCase() === selectedSlugOrId.toLowerCase()
      );
      if (found) {
        setActiveServiceDetails(found);
      }
    } else {
      setActiveServiceDetails(null);
    }
  }, [selectedSlugOrId, services]);

  const categories = [
    { id: 'all', label: 'جميع الجهات والخدمات', icon: Layers },
    { id: 'commerce', label: 'وزارة التجارة والغرف', icon: Building2 },
    { id: 'balady', label: 'منصة بلدي والأمانات', icon: MapPin },
    { id: 'civil_defense', label: 'الدفاع المدني (سلامة)', icon: ShieldCheck },
    { id: 'labor_qiwa', label: 'الموارد البشرية (قوى / مدد)', icon: Users },
    { id: 'tax_zatca', label: 'الزكاة والضريبة (ZATCA)', icon: Award },
    { id: 'platforms', label: 'الجوازات ومنصة مقيم', icon: Fingerprint },
    { id: 'specialized', label: 'المخالفات والاعتراضات', icon: Scale },
  ];

  const types = [
    { id: 'all', label: 'الكل' },
    { id: 'issuance', label: 'إصدار جديد' },
    { id: 'renewal', label: 'تجديد ترخيص' },
    { id: 'amendment', label: 'تعديل وشطب' },
    { id: 'cancellation', label: 'إلغاء ونقل' },
    { id: 'objection', label: 'اعتراض وتصحيح' },
    { id: 'consulting', label: 'استشارة نظامية' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Exclude inactive if marked
      if (service.isActive === false) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.authority.toLowerCase().includes(q) ||
        service.code.toLowerCase().includes(q) ||
        (service.slug && service.slug.toLowerCase().includes(q)) ||
        (service.popularFor && service.popularFor.some((p) => p.toLowerCase().includes(q)));

      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesType = selectedType === 'all' || service.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [services, searchQuery, selectedCategory, selectedType]);

  const handleOpenDetails = (service: ServiceCatalogItem) => {
    setActiveServiceDetails(service);
    if (onSelectServiceSlug) {
      onSelectServiceSlug(service.slug || service.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetails = () => {
    setActiveServiceDetails(null);
    if (onSelectServiceSlug) {
      onSelectServiceSlug(null);
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'issuance':
        return { label: 'إصدار جديد', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'renewal':
        return { label: 'تجديد ترخيص', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'amendment':
        return { label: 'تعديل وتحديث', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'cancellation':
        return { label: 'إلغاء ونقل', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'objection':
        return { label: 'اعتراض وتصحيح', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'استشارة', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo'] selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* 1. PUBLIC TOP HEADER */}
      {!hideHeaderAndFooter && (
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={onGoToHome}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black font-['Cairo'] tracking-tight text-white">
                    سبّاق <span className="text-emerald-400">الامتثال</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 font-extrabold px-2 py-0.5 rounded-full">
                    الكتالوج العام
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  دليل الخدمات والتراخيص الحكومية المعتمدة
                </p>
              </div>
            </div>

            {/* Center Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
              <button
                onClick={onGoToHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
              <button
                onClick={handleCloseDetails}
                className={`transition-colors cursor-pointer ${
                  !activeServiceDetails ? 'text-emerald-400 font-black' : 'hover:text-emerald-400'
                }`}
              >
                دليل الخدمات
              </button>
              <button
                onClick={onGoToHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                المميزات والأنظمة
              </button>
            </div>

            {/* Right Actions (Cart + Auth/Dashboard) */}
            <div className="flex items-center gap-3">
              {/* Cart Drawer Trigger */}
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                title="سلة الخدمات المطلوبة"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">السلة</span>
                {cartItemIds.length > 0 && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cartItemIds.length}
                  </span>
                )}
              </button>

              {currentUser ? (
                <button
                  onClick={onGoToDashboard}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>لوحة تحكم المنشأة</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => onOpenAuth('nafath')}
                    className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>دخول نفاذ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium overflow-x-auto pb-1">
          <button onClick={onGoToHome} className="hover:text-emerald-400 transition-colors">
            الرئيسية
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={handleCloseDetails}
            className={activeServiceDetails ? 'hover:text-emerald-400 transition-colors' : 'text-emerald-400 font-bold'}
          >
            دليل الخدمات والتراخيص الحكومية
          </button>
          {activeServiceDetails && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-emerald-400 font-bold truncate max-w-xs">{activeServiceDetails.name}</span>
            </>
          )}
        </nav>

        {/* VIEW 1: SINGLE SERVICE DETAILED PAGE */}
        {activeServiceDetails ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Back Button & Title Header */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <button
                  onClick={handleCloseDetails}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition-all self-start cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>العودة لكتالوج الخدمات</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/60 font-bold">
                    كود الخدمة: {activeServiceDetails.code}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${getServiceTypeBadge(activeServiceDetails.type).color}`}>
                    {getServiceTypeBadge(activeServiceDetails.type).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>الجهة الحكومية المنظمة:</span>
                  <span className="text-slate-200">{activeServiceDetails.authority}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white font-['Cairo'] leading-tight">
                  {activeServiceDetails.name}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
                  {activeServiceDetails.description}
                </p>
              </div>

              {/* Quick Key Highlights Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs relative z-10">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>المدة التقديرية للإنجاز</span>
                  </div>
                  <div className="text-base font-bold text-white">{activeServiceDetails.estimatedDays}</div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>الرسوم الحكومية التقديرية</span>
                  </div>
                  <div className="text-base font-bold text-white">{formatSAR(activeServiceDetails.govFeeEstimated)}</div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>أتعاب تنفيذ سبّاق</span>
                  </div>
                  <div className="text-base font-bold text-emerald-400">{formatSAR(activeServiceDetails.sabbaqFee)}</div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                    <span>ضريبة القيمة المضافة (15%)</span>
                  </div>
                  <div className="text-base font-bold text-slate-200">{formatSAR(activeServiceDetails.vatAmount)}</div>
                </div>
              </div>
            </div>

            {/* Service Details Grid (Requirements + Pricing Breakdown + Action) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Requirements & Steps */}
              <div className="lg:col-span-2 space-y-6">
                {/* Required Documents Card */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 text-base font-black text-white font-['Cairo'] pb-3 border-b border-slate-800">
                    <FileCheck2 className="w-5 h-5 text-emerald-400" />
                    <span>المستندات والاشتراطات المطلوبة لتنفيذ الخدمة</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    يُرجى تجهيز المستندات التالية بصيغة رقمية واضحة (PDF أو صورة عالية الجودة) لرفعها أثناء استكمال الطلب:
                  </p>

                  <div className="space-y-3 pt-2">
                    {activeServiceDetails.requiredDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-200"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-white">{doc}</div>
                          <div className="text-[11px] text-slate-500">مستند إلزامي وفق متطلبات الجهة المنظمة</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SLA Guarantee & Workflow */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 text-base font-black text-white font-['Cairo'] pb-3 border-b border-slate-800">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <span>كيف يتم تنفيذ معاملتك عبر سبّاق؟</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center">1</div>
                      <div className="font-bold text-white">تقديم الطلب ورفع الوثائق</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        تحديد منشأتك ورفع المستندات وسداد رسوم المعاملة بأمان عبر مدى أو Apple Pay.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center">2</div>
                      <div className="font-bold text-white">التدقيق والإسناد الحكومي</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        يقوم معقب ومستشار مرخص بمراجعة الطلب ورفعه للنظام الحكومي ومتابعة صدور الرقم المرجعي.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-teal-600/20 text-teal-400 font-bold flex items-center justify-center">3</div>
                      <div className="font-bold text-white">صدور الترخيص والأرشفة</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        استلام الترخيص المعتمد وتحديثه فوراً في محفظة وثائق منشأتك مع تفعيل التنبيهات الوقائية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Checkout Box */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl sticky top-28">
                  <div className="text-base font-black text-white font-['Cairo'] pb-3 border-b border-slate-800 flex items-center justify-between">
                    <span>ملخص التكلفة والطلب</span>
                    <span className="text-xs font-normal text-slate-400">تسعير شفاف معتمد</span>
                  </div>

                  {/* Financial Details Table */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>الرسوم الحكومية المقدرة:</span>
                      <strong className="text-white font-mono text-sm">{formatSAR(activeServiceDetails.govFeeEstimated)}</strong>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>أتعاب تنفيذ منصة سبّاق:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{formatSAR(activeServiceDetails.sabbaqFee)}</strong>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <strong className="text-slate-200 font-mono text-sm">{formatSAR(activeServiceDetails.vatAmount)}</strong>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline font-black">
                      <span className="text-sm text-white font-['Cairo']">الإجمالي التقديري:</span>
                      <span className="text-2xl text-emerald-400 font-black font-['Cairo']">
                        {formatSAR(activeServiceDetails.totalEstimated)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => onRequestService(activeServiceDetails)}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>اطلب الخدمة الآن</span>
                    </button>

                    <button
                      onClick={() => onAddToCart(activeServiceDetails)}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                        cartItemIds.includes(activeServiceDetails.id)
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                      }`}
                    >
                      {cartItemIds.includes(activeServiceDetails.id) ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>تمت الإضافة إلى السلة ({cartItemIds.length})</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          <span>إضافة إلى سلة الخدمات</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ضمان سبّاق للأداء والامتثال</span>
                    </div>
                    <p className="leading-relaxed">
                      حفظ السلة والطلب في مسودة آمنة حتى استكمال السداد والتوثيق الرسمي.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FULL PUBLIC CATALOG BROWSER */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Catalog Hero Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl border border-slate-800 p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-bold">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>دليل الخدمات والتراخيص الحكومية المعتمدة</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white font-['Cairo'] tracking-tight">
                  كتالوج الخدمات الحكومية بين يديك
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  تصفح خدمات إصدار وتجديد وتعديل رخص بلدي، شهادات الدفاع المدني، السجلات التجارية، الزكاة والضريبة، وتأسيس ملفات العمل، واطلب تنفيذها إلكترونياً بأعلى معايير الشفافية والسرعة.
                </p>
              </div>
            </div>

            {/* Search and Filters Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-lg">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الخدمة، الجهة الحكومية، كود المعاملة، أو نوع الترخيص..."
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-2xl pr-12 pl-10 py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>متاح {filteredServices.length} خدمة</span>
                  </div>
                </div>
              </div>

              {/* Authority Category Filter Pills */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400">الجهات الحكومية المنظمة:</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Procedure Type Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold shrink-0">نوع الإجراء:</span>
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedType === type.id
                        ? 'bg-slate-200 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Cards Grid */}
            {filteredServices.length === 0 ? (
              <div className="bg-slate-900/60 p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">لم يتم العثور على خدمات مطابقة</h3>
                <p className="text-xs text-slate-400">
                  جرب تغيير كلمات البحث أو اختيار جهة حكومية مختلفة من القائمة أعلاه.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((srv) => {
                  const typeBadge = getServiceTypeBadge(srv.type);
                  const isInCart = cartItemIds.includes(srv.id);

                  return (
                    <div
                      key={srv.id}
                      className="bg-slate-900/85 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 duration-200"
                    >
                      <div className="p-6 space-y-4">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate max-w-[140px]">{srv.authority}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {srv.code}
                            </span>
                          </div>
                        </div>

                        {/* Service Title */}
                        <h3
                          onClick={() => handleOpenDetails(srv)}
                          className="text-base sm:text-lg font-black text-white font-['Cairo'] group-hover:text-emerald-300 transition-colors leading-snug cursor-pointer"
                        >
                          {srv.name}
                        </h3>

                        {/* Short Description */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {srv.description}
                        </p>

                        {/* Required Documents Preview */}
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>المستندات المطلوبة:</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {srv.requiredDocuments.length} متطلبات
                            </span>
                          </div>
                          <ul className="text-[11px] text-slate-300 space-y-1 pr-1">
                            {srv.requiredDocuments.slice(0, 2).map((doc, dIdx) => (
                              <li key={dIdx} className="flex items-center gap-1.5 truncate">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Estimated Duration & Transparent Pricing */}
                        <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>مدة الإنجاز التقديرية:</span>
                            </span>
                            <span className="text-white font-bold">{srv.estimatedDays}</span>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>الرسوم الحكومية المقدرة:</span>
                              <span className="text-slate-200 font-bold">{formatSAR(srv.govFeeEstimated)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>أتعاب منصة سبّاق:</span>
                              <span className="text-emerald-400 font-bold">{formatSAR(srv.sabbaqFee)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>ضريبة القيمة المضافة (15%):</span>
                              <span className="text-slate-300 font-bold">{formatSAR(srv.vatAmount)}</span>
                            </div>
                            <div className="pt-1.5 border-t border-slate-800 flex justify-between items-baseline font-bold">
                              <span className="text-xs text-white">الإجمالي التقديري:</span>
                              <span className="text-base text-emerald-400 font-black font-['Cairo']">
                                {formatSAR(srv.totalEstimated)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDetails(srv)}
                            className="px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>التفاصيل</span>
                          </button>

                          <button
                            onClick={() => onRequestService(srv)}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>اطلب الخدمة</span>
                          </button>
                        </div>

                        <button
                          onClick={() => onAddToCart(srv)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isInCart
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isInCart ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تمت الإضافة للسلة</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>إضافة إلى السلة</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. PUBLIC FOOTER */}
      {!hideHeaderAndFooter && (
        <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">منصة سبّاق للامتثال والتراخيص الحكومية</div>
                  <div className="text-[11px] text-slate-400">الرقم الضريبي الموحد: 30094819200003</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                <button onClick={onGoToHome} className="hover:text-emerald-400 transition-colors">
                  الرئيسية
                </button>
                <button onClick={handleCloseDetails} className="hover:text-emerald-400 transition-colors">
                  دليل الخدمات
                </button>
                <button onClick={() => onOpenAuth('login')} className="hover:text-emerald-400 transition-colors">
                  بوابة المنشأة
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500">
              جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة سبّاق لخدمات الأعمال والامتثال التنظيمي - المملكة العربية السعودية
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
