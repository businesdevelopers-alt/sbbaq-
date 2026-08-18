import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Compass,
  MapPin,
  FileText,
  Calculator,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Lock,
  Zap,
  TrendingUp,
  Award,
  Users,
  Smartphone,
  Check,
  Star,
  ExternalLink,
  HelpCircle,
  PhoneCall,
  Mail,
  Fingerprint,
  Layers,
  BarChart3,
  Search,
  KeyRound,
  UserPlus,
  PlusCircle,
  Send,
  CheckCircle,
  Info,
  Tag,
  Calendar,
  DollarSign,
  X,
  ShoppingBag,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  FileCheck2,
  Briefcase
} from 'lucide-react';
import { AuthMode, AuthPortal, UserAccount, ServiceCatalogItem, MasterOrder } from '../types';
import { SERVICE_CATALOG } from '../data/complianceData';

interface LandingPageProps {
  onOpenAuth: (mode: AuthMode, portal?: AuthPortal) => void;
  onEnterAppAsGuest: () => void;
  onSelectPlan: (plan: 'basic' | 'pro' | 'enterprise') => void;
  currentUser?: UserAccount | null;
  onGoToDashboard: () => void;
  onGoToOrders?: () => void;
  services?: ServiceCatalogItem[];
  onRequestService?: (
    service: ServiceCatalogItem,
    details: {
      establishmentName?: string;
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      notes?: string;
      branchName?: string;
    }
  ) => MasterOrder | void;
  onOpenPublicServices?: (slug?: string) => void;
  onAddToCart?: (service: ServiceCatalogItem) => void;
  onInitiateCheckout?: (service: ServiceCatalogItem) => void;
  onOpenCart?: () => void;
  cartItemsCount?: number;
  hideHeaderAndFooter?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterAppAsGuest,
  onSelectPlan,
  currentUser,
  onGoToDashboard,
  onGoToOrders,
  services = SERVICE_CATALOG,
  onRequestService,
  onOpenPublicServices,
  onAddToCart,
  onInitiateCheckout,
  onOpenCart,
  cartItemsCount = 0,
  hideHeaderAndFooter = false,
}) => {
  // Active Interactive Feature Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'licenses' | 'map' | 'risk' | 'vault' | 'ai' | 'catalog'
  >('licenses');

  // ROI Calculator State
  const [calcBranches, setCalcBranches] = useState<number>(3);
  const [calcSector, setCalcSector] = useState<'food' | 'contracting' | 'retail' | 'services'>('food');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // CR Quick Search Input in Hero
  const [quickCrInput, setQuickCrInput] = useState('');

  // Services Catalog Filter & Search States
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  // Selected Service for Details Modal
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<ServiceCatalogItem | null>(null);

  // Selected Service for Quick Order
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<ServiceCatalogItem | null>(null);
  
  // Order Form State
  const [orderForm, setOrderForm] = useState({
    establishmentName: currentUser?.establishmentName || '',
    contactPerson: currentUser?.name || '',
    contactPhone: currentUser?.phone || '',
    branchName: 'الفرع الرئيسي',
    notes: '',
  });

  // Success Confirmation State for Placed Order
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderNumber: string;
    service: ServiceCatalogItem;
    details: typeof orderForm;
  } | null>(null);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Currency Formatter
  const formatSAR = (val: number) =>
    new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val);

  // Services list filtering logic
  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      serviceSearchQuery.trim() === '' ||
      srv.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      srv.authority.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      srv.code.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      (srv.popularFor && srv.popularFor.some(p => p.toLowerCase().includes(serviceSearchQuery.toLowerCase())));

    const matchesCategory =
      serviceCategoryFilter === 'all' || srv.category === serviceCategoryFilter;

    const matchesType =
      serviceTypeFilter === 'all' || srv.type === serviceTypeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleInitiateOrder = (service: ServiceCatalogItem) => {
    setSelectedServiceForOrder(service);
    setOrderForm({
      establishmentName: currentUser?.establishmentName || orderForm.establishmentName || '',
      contactPerson: currentUser?.name || orderForm.contactPerson || '',
      contactPhone: currentUser?.phone || orderForm.contactPhone || '',
      branchName: orderForm.branchName || 'الفرع الرئيسي',
      notes: '',
    });
  };

  const handleConfirmOrderSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForOrder) return;

    setIsSubmittingOrder(true);

    const generatedOrderNumber = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (onRequestService) {
      onRequestService(selectedServiceForOrder, {
        establishmentName: orderForm.establishmentName,
        contactPerson: orderForm.contactPerson,
        contactPhone: orderForm.contactPhone,
        branchName: orderForm.branchName,
        notes: orderForm.notes,
      });
    }

    setTimeout(() => {
      setIsSubmittingOrder(false);
      setOrderConfirmation({
        orderNumber: generatedOrderNumber,
        service: selectedServiceForOrder,
        details: { ...orderForm },
      });
      setSelectedServiceForOrder(null);
    }, 400);
  };

  // Calculate estimated savings based on branches and sector
  const getCalculatedSavings = () => {
    const basePenaltyRiskPerBranch = {
      food: 18000,
      contracting: 15000,
      retail: 12000,
      services: 9000,
    }[calcSector];

    const manualHandlingCost = 6000 * calcBranches;
    const estimatedPenaltyPrevention = basePenaltyRiskPerBranch * calcBranches * 0.85;
    const totalYearlySavings = estimatedPenaltyPrevention + manualHandlingCost;
    const hoursSavedPerYear = calcBranches * 45;

    return {
      totalYearlySavings: Math.round(totalYearlySavings),
      hoursSavedPerYear,
      penaltyPrevention: Math.round(estimatedPenaltyPrevention),
    };
  };

  const savings = getCalculatedSavings();

  const faqs = [
    {
      q: 'كيف تضمن منصة سبّاق تفادي الغرامات البلدية ومخالفات الدفاع المدني؟',
      a: 'تعتمد المنصة على محرك رصد وقائي ذكي يربط جميع تواريخ التراخيص (بلدي، سلامة، السجل التجاري، شهادات الزكاة، والتأمينات)، ويُطلق تنبيهات مدروسة قبل 60 و30 و15 يوماً من الانتهاء، بالإضافة إلى الخريطة الجغرافية لرصد الحملات الرقابية البلدية في نطاق فروعك لتجهيز المنشأة مسبقاً وفقاً للاشتراطات الرسمية.',
    },
    {
      q: 'هل الربط مع السجل التجاري والنفاذ الوطني آمن ومعتمد؟',
      a: 'نعم بالكامل. تطبق المنصة أعلى معايير التشفير والأمن السيبراني المتوافقة مع متطلبات الهيئة الوطنية للأمن السيبراني (NCA)، وتستخدم قنوات آمنة عبر النفاذ الوطني الموحد لمصادقة هوية المفوضين النظاميين للشركات دون تخزين كلمات المرور الحساسة.',
    },
    {
      q: 'هل يمكنني إضافة فروع متعددة ومتابعتها على الخريطة الجغرافية؟',
      a: 'بالتأكيد. تدعم المنصة إدارة الشركات متعددة الفروع والمجموعات القابضة. يمكنك تعيين كل فرع بموقعه الجغرافي الدقيق على الخريطة وتتبّع نطاق البلدية الفرعية التابع لها وحالة تراخيص كل موقع بشكل منفصل مع تقرير امتثال شامل.',
    },
    {
      q: 'كيف يساعد المساعد الذكي «سبّاق AI» في حل الاشتراطات والاعتراضات؟',
      a: 'تم تدريب مساعد سبّاق الذكي على اللائحة التنفيذية لرسوم الخدمات البلدية، كود البناء السعودي (SBC)، ولوائح الدفاع المدني ونظام العمل. يمكنه مراجعة مخالفاتك، صياغة لوائح اعتراض قانونية معتمدة لمنصة بلدي، وتوضيح متطلبات ترخيص أي نشاط بدقة متناهية.',
    },
    {
      q: 'هل يمكنني تجربة المنصة واستعراض كافة الميزات قبل الاشتراك؟',
      a: 'نعم، نوفر تجربة تفاعلية مباشرة (Live Interactive Demo) بنقرة زر واحدة تتيح لك تجربة لوحة التحكم، فحص التراخيص، محاكاة المخاطر، والخريطة الجغرافية بحساب تجريبي متكامل بدون أي التزام.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white font-['Cairo']" dir="rtl">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {!hideHeaderAndFooter && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-800/40 text-emerald-200 py-2.5 px-4 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                جديد المنظومة
              </span>
              <span className="hidden sm:inline">
                تم إطلاق الخريطة الجغرافية لرصد الحملات الرقابية البلدية وحاسبة الرسوم وفق كود البناء السعودي 2026.
              </span>
              <span className="sm:hidden">رادار التفتيش الجغرافي متاح الآن!</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth('nafath')}
                className="text-emerald-300 hover:text-white flex items-center gap-1 transition-colors text-xs font-bold"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>دخول نفاذ</span>
              </button>
              <span className="text-emerald-700">|</span>
              <span className="text-emerald-400 text-xs">خدمة العملاء: 800-124-7722</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. GLOBAL NAVIGATION BAR */}
      {!hideHeaderAndFooter && (
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black font-['Cairo'] tracking-tight text-white">
                    سبّاق <span className="text-emerald-400">الامتثال</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 font-extrabold px-2 py-0.5 rounded-full">
                    رؤية 2030
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  المنظومة الوطنية الموحدة لإدارة التراخيص والمخاطر الحكومية
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-300">
              {onOpenPublicServices ? (
                <button
                  type="button"
                  onClick={() => onOpenPublicServices()}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-black cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>دليل الخدمات</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-black border border-emerald-500/30">
                    /services
                  </span>
                </button>
              ) : (
                <a href="#services" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-black">
                  <Layers className="w-4 h-4" />
                  <span>الخدمات</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-black border border-emerald-500/30">دليل</span>
                </a>
              )}
              <a href="#features" className="hover:text-emerald-400 transition-colors">
                المميزات والأنظمة
              </a>
              <a href="#geomap" className="hover:text-emerald-400 transition-colors">
                الخريطة والرادار
              </a>
              <a href="#calculator" className="hover:text-emerald-400 transition-colors">
                حاسبة الوفورات
              </a>
              <a href="#ecosystem" className="hover:text-emerald-400 transition-colors">
                الجهات المرتبطة
              </a>
              <a href="#pricing" className="hover:text-emerald-400 transition-colors">
                الباقات
              </a>
              <a href="#faq" className="hover:text-emerald-400 transition-colors">
                الأسئلة الشائعة
              </a>
            </nav>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5">
              {currentUser ? (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>لوحة التحكم ({currentUser.name.split(' ')[0]})</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login', 'client')}
                    className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="بوابة المنشآت والشركات"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>بوابة المنشآت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('login', 'admin')}
                    className="hidden md:flex px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-blue-300 hover:text-white hover:bg-blue-900/40 rounded-xl border border-blue-800/60 transition-all items-center gap-1.5 cursor-pointer"
                    title="بوابة إدارة سبّاق (HQ Operations)"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>إدارة سبّاق</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('register', 'client')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>تسجيل جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={onEnterAppAsGuest}
                    className="hidden xl:flex bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all items-center gap-1.5 cursor-pointer"
                    title="جولة تجريبية مباشرة"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تجربة حية</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>المنصة السعودية الأولى لحماية المنشآت من المخالفات البلدية</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-['Cairo'] text-white leading-[1.2] tracking-tight">
              امتثال حكومي كامل بنسبة <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-emerald-200">100%</span> لمنشأتك،
              <br className="hidden sm:inline" /> بدون مفاجآت أو غرامات تفتيشية
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              المنظومة السحابية الموحدة لربط وتتبع تراخيص <strong className="text-white">بلدي</strong>، <strong className="text-white">سلامة الدفاع المدني</strong>، <strong className="text-white">السجل التجاري</strong>، <strong className="text-white">الزكاة والضريبة</strong>، و<strong className="text-white">قوى</strong>، مع رادار التفتيش الجغرافي الحي ومؤشر المخاطر الذكي.
            </p>

            {/* Hero Action Area */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>ابدأ حماية منشأتك مجاناً</span>
                <ArrowLeft className="w-5 h-5 text-slate-950 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onEnterAppAsGuest}
                className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700/90 text-white font-bold text-base rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>استعراض المنصة (Live Demo)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>متوافق مع كود البناء السعودي (SBC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ربط مع منصات بلدي وسلامة وزكاة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أمان سحابي وتشفير بمعايير NCA</span>
              </div>
            </div>
          </div>

          {/* KPI Stats Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-white font-['Cairo']">
                1,450+
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">منشأة تجارية مرخصة</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Cairo']">
                99.4%
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">نسبة تفادي الغرامات</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-teal-400 font-['Cairo']">
                14.2M+ ر.س
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">وفورات مالية محققة للعملاء</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-['Cairo']">
                24/7
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">رصد وتنبيهات فورية</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE FEATURE SHOWCASE (المميزات الرئيسية الحية) */}
      <section id="features" className="py-20 bg-slate-950 border-t border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-['Cairo']">
              منظومة متكاملة 360 درجة
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-white font-['Cairo']">
              كل ما تحتاجه منشأتك لتفادي المخالفات وإدارة التراخيص بكفاءة
            </p>
            <p className="text-sm sm:text-base text-slate-400">
              تصفح الوحدات الذكية في منصة سبّاق واكتشف كيف تُحدث فرقاً جذرياً في أمان أعمالك واستقرارها.
            </p>
          </div>

          {/* Feature Tabs Selector */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'licenses', label: 'مراقبة التراخيص', icon: Clock },
              { id: 'map', label: 'الخريطة ورادار التفتيش', icon: Compass },
              { id: 'risk', label: 'مؤشر المخاطر والغرامات', icon: AlertTriangle },
              { id: 'vault', label: 'محفظة المستندات الذكية', icon: FileText },
              { id: 'ai', label: 'المساعد الذكي «سبّاق AI»', icon: Sparkles },
              { id: 'catalog', label: 'التعقيب والخدمات الفورية', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Content Preview Box */}
          <div className="mt-8 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
            {activeFeatureTab === 'licenses' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    نظام مراقبة التراخيص الحكومية والتنبيهات الاستباقية
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    لا حاجة لتفقد منصات متعددة يدوياً. يقوم سبّاق بتجميع رخص بلدي، شهادات الدفاع المدني (سلامة)، السجلات التجارية، شهادات الزكاة والدخل، ورخص الدفاع المدني في جدول مركزي موحد مع عد تنازلي ذكي.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تنبيهات تلقائية عبر الرسائل النصية والبريد قبل 60، 30، و15 يوماً من الانتهاء.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>فحص فوري للاشتراطات الفنية والمتطلبات المسبقة قبل طلب التجديد.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تجديد فوري بنقرة واحدة عبر مسار الخدمات الإلكترونية.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onEnterAppAsGuest}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      <span>استعراض شاشة التراخيص في النسخة التجريبية</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    <span className="font-bold text-slate-300">التراخيص المراقبة (محاكاة حية)</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
                      نشطة ومحدثة
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-rose-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                        <div>
                          <div className="text-xs font-bold text-white">رخصة الأنشطة التجارية (بلدي)</div>
                          <div className="text-[11px] text-slate-400">فرع العليا • تنتهي خلال 4 أيام</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/50">
                        تتطلب تجديد عاجل
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-xl border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div>
                          <div className="text-xs font-bold text-white">ترخيص السلامة والوقاية (سلامة)</div>
                          <div className="text-[11px] text-slate-400">فرع التحلية • متبقي 28 يوماً</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/50">
                        قريب الانتهاء
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <div>
                          <div className="text-xs font-bold text-white">شهادة الزكاة والضريبة</div>
                          <div className="text-[11px] text-slate-400">المركز الرئيسي • سارية لـ 180 يوماً</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                        سارية ومتوافقة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    الخريطة الجغرافية للمخاطر ورادار الحملات الرقابية
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    تتبع جغرافي ذكي لجميع فروع منشأتك عبر خريطة تفاعلية تعرض نطاقات البلديات الفرعية (بلدية العليا، بلدية الروضة، إلخ) ومؤشر كثافة التفتيش الميداني في كل حي لمنع المخالفات استباقياً.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تحديد الفروع الواقعة ضمن نطاق حملات التفتيش المكثفة الحية.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>طبقات عرض متعددة: مؤشر المخاطر، المخالفات، والتراخيص الموشكة على الانتهاء.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>بطاقات تفصيلية لكل فرع مع تاريخ آخر زيارة رقابية.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onEnterAppAsGuest}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-400 hover:text-teal-300 hover:underline"
                    >
                      <span>فتح الخريطة التفاعلية في النسخة التجريبية</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span className="font-bold text-slate-300">رادار مدينة الرياض (عينة حية)</span>
                    </div>
                    <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-800">
                      حملة بلدية نشطة: نطاق العليا
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">فرع العليا - طريق الملك فهد</div>
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded">
                        كثافة رقابية: مرتفعة
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      البلدية: بلدية العليا الفرعية • رصد حملة مطابقة واجهات المحلات واللوحات الإعلانية.
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">جاهزية الامتثال: 94%</span>
                      <span className="text-slate-400">آخر زيارة: قبل 14 يوم</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'risk' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    مؤشر المخاطر التنبؤي ومحاكي الغرامات اللحظي
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    يعالج النظام خوارزمية ذكية لاحتساب نسبة الخطر القانوني والمالي لكل فرع، مع محاكي تفاعلي يحسب الغرامات التراكمية اليومية الناتجة عن التأخير في تجديد التراخيص وفق لائحة الغرامات والجزاءات البلدية المحدثة.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>احتساب دقيق للغرامات المتوقعة مع مهل السماح النظامية.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>إرشادات تصحيحية فورية لخفض نسبة الخطر ورفع نقاط الامتثال.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>صياغة لوائح اعتراض مدعمة بالسند النظامي للمخالفات القائمة.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onEnterAppAsGuest}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      <span>تجربة محاكي الغرامات في النسخة التجريبية</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    <span className="font-bold text-slate-300">مؤشر خطر المنشأة الحسابي</span>
                    <span className="text-xs font-bold text-emerald-400">مستوى منخفض (آمن)</span>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-emerald-400 font-['Cairo']">
                        18%
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">درجة الخطر التراكمي</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-white">82 / 100</div>
                      <div className="text-xs text-slate-400">نقاط الامتثال الكلي</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span>الوفورات المحققة بتفادي الغرامات:</span>
                      <span className="text-emerald-400">42,000 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>مخالفات تم الاعتراض عليها بنجاح:</span>
                      <span className="text-white font-bold">3 مخالفات</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'vault' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    محفظة المستندات الذكية مع المسح الضوئي (OCR)
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    أرشيف رقمي سحابي مشفر لجميع مستندات وعقود المنشأة الرسمية (السجل التجاري، عقد التأسيس، شهادات الآيزو، عقود الإيجار، تراخيص الإعلانات)، مع ميزة استخراج البيانات وتواريخ الانتهاء تلقائياً بالذكاء الاصطناعي.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>مسح ضوئي ذكي وتصنيف تلقائي للمستندات والشهادات.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تخزين مشفر ومطابق لضوابط أمن البيانات الوطنية.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>مشاركة آمنة ومباشرة مع مفتشي الجهات الحكومية أو البنوك.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
                    المستندات المؤرشفة والمفحوصة بالذكاء الاصطناعي
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-bold text-white">السجل التجاري الرئيسي (CR)</div>
                          <div className="text-[10px] text-slate-400">PDF • تم استخراج البيانات بنجاح</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        موثق
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-bold text-white">عقد إيجار الفرع الموحد (إيجار)</div>
                          <div className="text-[10px] text-slate-400">PDF • ساري لغاية 2027</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                        محدث
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    المساعد الذكي «سبّاق AI» للاشتراطات وكود البناء
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    مستشارك القانوني والفني المتاح على مدار الساعة. اسأله عن اشتراطات ترخيص أي نشاط، مساحات المداخل، مواقف السيارات، متطلبات الدفاع المدني، أو صيغة الاعتراض النظامي المناسب.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>إجابات فورية مع الاستشهاد بأرقام المواد واللوائح الرسمية.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>صياغة خطابات واعتراضات احترافية جاهزة للإرسال.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تحديد متطلبات كود البناء السعودي (SBC) الخاصة بموقعك.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 pb-2 border-b border-slate-800">
                    <Sparkles className="w-4 h-4" />
                    <span>محادثة استشارية فورية (عينة حية)</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-white">سؤال العميل:</strong> ما هي اشتراطات ترخيص مطبخ سحابي في مدينة الرياض؟
                  </div>

                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-xs text-emerald-100 leading-relaxed">
                    <strong className="text-emerald-300 block mb-1">رد سبّاق الذكي:</strong>
                    وفقاً للائحة المطابخ السحابية المحدثة، يلزم: توفير مساحة لا تقل عن 150م²، تركيب نظام إطفاء أوتوماتيكي (FM200 أو رذاذ مائي)، كاميرات مراقبة خارجية، وتوفير منطقة مخصصة لاستلام مندوبي التوصيل بعيداً عن صالة الإعداد.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'catalog' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                    كتالوج الخدمات الحكومية والتعقيب الإلكتروني السريع
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    تنفيذ فوري لخدمات إصدار وتجديد وتعديل رخص بلدي، شهادات الدفاع المدني، شطب وتعديل السجلات التجارية، وتحديث بيانات المنشأة مع متابعة لحظية لحالة المعاملة الحكومية.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>حساب الرسوم الحكومية التقديرية بدقة قبل الشروع في الطلب.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>متابعة مسار المعاملة خطوة بخطوة مع إشعارات الإنجاز.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>فريق معتمد من معقبي ومستشاري الامتثال المرخصين.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
                    الخدمات السريعة الأكثر طلباً
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">تجديد رخصة بلدي فورية</div>
                        <div className="text-[10px] text-slate-400">إنجاز خلال 24 ساعة</div>
                      </div>
                      <span className="text-emerald-400 font-bold">250 ر.س</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">إصدار ترخيص دفاع مدني (سلامة)</div>
                        <div className="text-[10px] text-slate-400">مع تقرير فني معتمد</div>
                      </div>
                      <span className="text-emerald-400 font-bold">450 ر.س</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4.5 COMPREHENSIVE SERVICES CATALOG SECTION (دليل الخدمات الحكومية والتراخيص) */}
      <section id="services" className="py-24 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-xs font-black shadow-inner">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>دليل الخدمات والتراخيص الحكومية المعتمدة</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-['Cairo'] tracking-tight">
              الخدمات الحكومية وتراخيص الامتثال بين يديك
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              اختر الخدمة المطلوبة واطلب تنفيذها إلكترونياً وبأعلى معايير الشفافية والسرعة، مع متابعة لحظية لحالة المعاملة في حساب منشأتك ولوحة الإدارة.
            </p>

            {onOpenPublicServices && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenPublicServices()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-emerald-950/50 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>تصفح كتالوج الخدمات بالكامل في صفحة مستقلة (/services)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Search Bar and Filters Toolbar */}
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            {/* Search and stats bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  placeholder="ابحث باسم الخدمة، الجهة المنظمة، كود الخدمة (مثل: بلدي، تجارة، سلامة، قوى)..."
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-2xl pr-12 pl-10 py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                />
                {serviceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setServiceSearchQuery('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 p-1 rounded-full"
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

                {currentUser && (
                  <button
                    type="button"
                    onClick={onGoToOrders || onGoToDashboard}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-teal-400" />
                    <span>متابعة طلباتي السابقة</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400">الجهات الحكومية والقطاعات:</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'جميع الجهات والخدمات', icon: Layers },
                  { id: 'commerce', label: 'وزارة التجارة والغرف', icon: Building2 },
                  { id: 'balady', label: 'وزارة البلديات (بلدي)', icon: MapPin },
                  { id: 'civil_defense', label: 'الدفاع المدني (سلامة)', icon: ShieldCheck },
                  { id: 'labor_qiwa', label: 'الموارد البشرية (قوى / مدد)', icon: Users },
                  { id: 'tax_zatca', label: 'هيئة الزكاة والضريبة', icon: Award },
                  { id: 'platforms', label: 'الجوازات ومنصة مقيم', icon: Fingerprint },
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = serviceCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceCategoryFilter(cat.id)}
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

            {/* Type Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold shrink-0">نوع الإجراء:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'issuance', label: 'إصدار جديد' },
                { id: 'renewal', label: 'تجديد ترخيص' },
                { id: 'amendment', label: 'تعديل وتحديث' },
                { id: 'objection', label: 'اعتراض وتصحيح' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setServiceTypeFilter(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    serviceTypeFilter === type.id
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
              <h3 className="text-lg font-bold text-white">لم يتم العثور على خدمات مطابقة للبحث</h3>
              <p className="text-xs text-slate-400">
                جرب تغيير كلمات البحث أو اختيار جهة حكومية مختلفة من القائمة أعلاه.
              </p>
              <button
                type="button"
                onClick={() => {
                  setServiceSearchQuery('');
                  setServiceCategoryFilter('all');
                  setServiceTypeFilter('all');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((srv) => {
                const typeLabel =
                  srv.type === 'issuance'
                    ? 'إصدار جديد'
                    : srv.type === 'renewal'
                    ? 'تجديد ترخيص'
                    : srv.type === 'objection'
                    ? 'اعتراض وتصحيح'
                    : srv.type === 'amendment'
                    ? 'تعديل وشطب'
                    : 'استشارة نظامية';

                const typeBadgeColor =
                  srv.type === 'issuance'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : srv.type === 'renewal'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : srv.type === 'objection'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                return (
                  <div
                    key={srv.id}
                    className="bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 duration-200"
                  >
                    <div className="p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="truncate max-w-[140px]">{srv.authority}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeBadgeColor}`}>
                            {typeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {srv.code}
                          </span>
                        </div>
                      </div>

                      {/* Service Title */}
                      <h3 className="text-base sm:text-lg font-black text-white font-['Cairo'] group-hover:text-emerald-300 transition-colors leading-snug">
                        {srv.name}
                      </h3>

                      {/* Description */}
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

                      {/* Estimated Duration & Cost Summary */}
                      <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>مدة الإنجاز المتوقعة:</span>
                          </span>
                          <span className="text-white font-bold">{srv.estimatedDays}</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>الرسوم الحكومية التقديرية:</span>
                            <span className="text-slate-200 font-bold">{formatSAR(srv.govFeeEstimated)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>أتعاب تنفيذ سبّاق:</span>
                            <span className="text-emerald-400 font-bold">{formatSAR(srv.sabbaqFee)}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex justify-between items-baseline font-bold">
                            <span className="text-xs text-white">إجمالي التكلفة المتوقعة:</span>
                            <span className="text-base text-emerald-400 font-black font-['Cairo']">
                              {formatSAR(srv.totalEstimated)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenPublicServices && srv.slug) {
                            onOpenPublicServices(srv.slug);
                          } else {
                            setSelectedServiceForDetails(srv);
                          }
                        }}
                        className="px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        title="عرض كامل متطلبات واشتراطات الخدمة"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>التفاصيل</span>
                      </button>

                      {onAddToCart && (
                        <button
                          type="button"
                          onClick={() => onAddToCart(srv)}
                          className="p-2.5 text-xs font-bold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/80 border border-teal-700/60 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                          title="إضافة الخدمة إلى سلة الطلبات"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (onInitiateCheckout) {
                            onInitiateCheckout(srv);
                          } else {
                            handleInitiateOrder(srv);
                          }
                        }}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-emerald-950/60"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>طلب الخدمة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* QUICK SERVICE ORDER MODAL (نافذة طلب الخدمة الفوري من الصفحة الرئيسية) */}
      {selectedServiceForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {selectedServiceForOrder.authority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    كود: {selectedServiceForOrder.code}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white font-['Cairo']">
                  طلب خدمة: {selectedServiceForOrder.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedServiceForOrder(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleConfirmOrderSubmission} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Fee & Time Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">الرسوم الحكومية</div>
                  <div className="text-xs font-bold text-white mt-0.5">{formatSAR(selectedServiceForOrder.govFeeEstimated)}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">أتعاب سبّاق</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{formatSAR(selectedServiceForOrder.sabbaqFee)}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">الإجمالي المتوقع</div>
                  <div className="text-xs font-black text-emerald-300 mt-0.5">{formatSAR(selectedServiceForOrder.totalEstimated)}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">مدة الإنجاز</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">{selectedServiceForOrder.estimatedDays}</div>
                </div>
              </div>

              {/* Establishment & Contact Info Inputs */}
              <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>بيانات المنشأة ومقدم الطلب:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      اسم المنشأة أو الشركة <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.establishmentName}
                      onChange={(e) => setOrderForm({ ...orderForm, establishmentName: e.target.value })}
                      placeholder="مثال: شركة المذاق العربي للخدمات الغذائية"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      اسم المفوض أو طالب الخدمة <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.contactPerson}
                      onChange={(e) => setOrderForm({ ...orderForm, contactPerson: e.target.value })}
                      placeholder="مثال: أحمد بن محمد السعدي"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      رقم الجوال للتواصل والإشعارات <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={orderForm.contactPhone}
                      onChange={(e) => setOrderForm({ ...orderForm, contactPhone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      الفرع أو المدينة المستهدفة
                    </label>
                    <input
                      type="text"
                      value={orderForm.branchName}
                      onChange={(e) => setOrderForm({ ...orderForm, branchName: e.target.value })}
                      placeholder="الفرع الرئيسي - الرياض"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    ملاحظات أو متطلبات خاصة بالمعاملة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    placeholder="أضف أي تفاصيل، مثل: السجل التجاري، رقم الرخصة السابقة، أو مواعيد مستهدفة..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="leading-relaxed">
                  يتم تدقيق المعاملة فورياً من أخصائي الامتثال المعتمد، وتظهر في حسابك في لوحة التحكم وتصلك تحديثات لحظية عبر الرسائل النصية.
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedServiceForOrder(null)}
                  className="px-5 py-3 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <span>جاري إرسال الطلب...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>تأكيد وإرسال طلب الخدمة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION SUCCESS MODAL */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-500/40 p-8 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-950/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                تم تسجيل الطلب بنجاح
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                تم إرسال طلب «{orderConfirmation.service.name}»
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                تم إنشاء المعاملة وتخصيص مستشار امتثال معتمد لمتابعتها. تظهر المعاملة الآن في حساب منشأتك ولوحة الإدارة الحكومية.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-right text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">الرقم المرجعي للطلب:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{orderConfirmation.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">المنشأة:</span>
                <span className="text-white font-bold">{orderConfirmation.details.establishmentName || 'المنشأة المسجلة'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">إجمالي التكلفة المتوقعة:</span>
                <span className="text-emerald-300 font-bold">{formatSAR(orderConfirmation.service.totalEstimated)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الأخصائي المكلف:</span>
                <span className="text-slate-300 font-medium">سعد بن فهد (أخصائي بلدي وسلامة)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmation(null);
                  if (onGoToOrders) {
                    onGoToOrders();
                  } else {
                    onGoToDashboard();
                  }
                }}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>الانتقال لمتابعة الطلب في حسابي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setOrderConfirmation(null)}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                طلب خدمة أخرى
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE DETAILS MODAL (نافذة تفاصيل الخدمة والاشتراطات) */}
      {selectedServiceForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-md">
                  كود الخدمة: {selectedServiceForDetails.code}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white font-['Cairo'] mt-1.5">
                  {selectedServiceForDetails.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  الجهة الحكومية المنظمة: {selectedServiceForDetails.authority}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedServiceForDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1.5">وصف وإجراءات الخدمة:</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {selectedServiceForDetails.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-2">المستندات والمتطلبات الإلزامية:</h4>
                <ul className="space-y-2">
                  {selectedServiceForDetails.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Table */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between text-slate-400">
                  <span>الرسوم الحكومية التقديرية:</span>
                  <strong className="text-white font-bold">{formatSAR(selectedServiceForDetails.govFeeEstimated)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>أتعاب تنفيذ سبّاق:</span>
                  <strong className="text-emerald-400 font-bold">{formatSAR(selectedServiceForDetails.sabbaqFee)}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>ضريبة القيمة المضافة 15%:</span>
                  <span>{formatSAR(selectedServiceForDetails.vatAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>إجمالي التكلفة المتوقعة:</span>
                  <span className="text-emerald-400 font-black font-['Cairo']">
                    {formatSAR(selectedServiceForDetails.totalEstimated)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedServiceForDetails(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = selectedServiceForDetails;
                  setSelectedServiceForDetails(null);
                  handleInitiateOrder(s);
                }}
                className="px-6 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>طلب الخدمة والمتابعة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE SAVINGS CALCULATOR (حاسبة الوفورات التقديرية) */}
      <section id="calculator" className="py-20 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                <Calculator className="w-3.5 h-3.5" />
                <span>حاسبة العائد الاستثماري والوفورات</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white font-['Cairo'] leading-tight">
                احسب كم ستوفر منشأتك سنوياً بتفادي الغرامات وأتمتة التراخيص
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                تتراوح غرامات التأخير في تجديد التراخيص البلدية واللوحات الإعلانية بين 5,000 و 25,000 ريال لكل مخالفة. استخدم الحاسبة التقديرية لمعرفة حجم التوفير المالي والزمني لمنشأتك.
              </p>

              {/* Inputs */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>عدد الفروع التابعة للمنشأة:</span>
                    <span className="text-emerald-400 text-sm font-black">{calcBranches} فروع</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={calcBranches}
                    onChange={(e) => setCalcBranches(parseInt(e.target.value) || 1)}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>فرع واحد</span>
                    <span>10 فروع</span>
                    <span>20 فرع</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    القطاع والنشاط الاقتصادي:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'food', label: 'مطاعم ومقاهي' },
                      { id: 'contracting', label: 'مقاولات وبناء' },
                      { id: 'retail', label: 'تجارة تجزئة' },
                      { id: 'services', label: 'خدمات وتشغيل' },
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setCalcSector(sec.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                          calcSector === sec.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Card */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 p-8 rounded-3xl border-2 border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-emerald-900/50 pb-4">
                  <span className="text-xs font-bold text-emerald-300">الوفورات السنوية التقديرية</span>
                  <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded">
                    عائد مباشر
                  </span>
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-['Cairo'] tracking-tight">
                    {savings.totalYearlySavings.toLocaleString('ar-SA')} <span className="text-xl text-white">ر.س</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    إجمالي الوفر المالي المتوقع سنوياً عبر تفادي الغرامات وأتمتة الإجراءات.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <div className="text-xl font-black text-white font-['Cairo']">
                      {savings.penaltyPrevention.toLocaleString('ar-SA')} ر.س
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">غرامات بلدية يتم تفاديها</div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <div className="text-xl font-black text-teal-300 font-['Cairo']">
                      {savings.hoursSavedPerYear} ساعة
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">وقت موظفين يتم توفيره</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ابدأ بتوفير تكاليف منشأتك الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTEGRATED SAUDI ECOSYSTEM (الجهات والأنظمة المرتبطة) */}
      <section id="ecosystem" className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div>
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              الربط والتكامل الشامل
            </h2>
            <p className="text-xl sm:text-2xl font-black text-white mt-1 font-['Cairo']">
              متوافق مع المنصات والجهات الحكومية في المملكة العربية السعودية
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'منصة بلدي', sub: 'وزارة البلديات والإسكان', icon: Building2 },
              { name: 'بوابة سلامة', sub: 'المديرية العامة للدفاع المدني', icon: ShieldCheck },
              { name: 'وزارة التجارة', sub: 'السجلات والأسماء التجارية', icon: FileText },
              { name: 'هيئة الزكاة والضريبة', sub: 'الشهادات والإقرارات', icon: Award },
              { name: 'منصة قوى', sub: 'وزارة الموارد البشرية', icon: Users },
              { name: 'التأمينات الاجتماعية', sub: 'شهادات الامتثال والنسب', icon: Layers },
            ].map((eco, idx) => {
              const EcoIcon = eco.icon;
              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <EcoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{eco.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{eco.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. PRICING & SUBSCRIPTION PLANS (باقات الاشتراك) */}
      <section id="pricing" className="py-20 bg-slate-900 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">
              باقات مرنة تناسب حجم أعمالك
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-white font-['Cairo']">
              استثمار ذكي يحمي منشأتك من آلاف الريالات من الغرامات
            </p>
            <p className="text-sm sm:text-base text-slate-400">
              جميع الباقات تشمل تجربة مجانية لمدة 14 يوماً مع دعم فني متكامل وربط فوري.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Basic Plan */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-['Cairo']">باقة المنشآت الفردية</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                    فرع واحد
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-['Cairo']">
                  149 <span className="text-xs text-slate-400 font-normal">ر.س / شهرياً</span>
                </div>
                <p className="text-xs text-slate-400">
                  مثالية للمحلات والمطاعم الفردية الناشئة التي تسعى لمراقبة دقيقة لتراخيصها.
                </p>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>مراقبة حتى 5 تراخيص لفرع واحد.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تنبيهات الرسائل النصية والبريد.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>محفظة المستندات بسعة 2 جيجابايت.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>استشارات سبّاق AI (50 استشارة شهرياً).</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPlan('basic');
                  onOpenAuth('register');
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                اختر باقة المنشآت الفردية
              </button>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="bg-gradient-to-b from-emerald-950/60 to-slate-950 p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                الأكثر طلباً للشركات
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-['Cairo']">باقة الشركات النامية</h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    حتى 5 فروع
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-400 font-['Cairo']">
                  349 <span className="text-xs text-slate-400 font-normal">ر.س / شهرياً</span>
                </div>
                <p className="text-xs text-slate-300">
                  حل متكامل للشركات ذات الفروع المتعددة مع رادار التفتيش الجغرافي الحي.
                </p>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>مراقبة غير محدودة للتراخيص لـ 5 فروع.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300">الخريطة الجغرافية ورادار التفتيش المباشر.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>محاكي الغرامات ومؤشر المخاطر التنبؤي.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>محفظة مستندات ذكية مع المسح الضوئي (OCR).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>استشارات ذكاء اصطناعي غير محدودة.</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPlan('pro');
                  onOpenAuth('register');
                }}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                اشترك الآن بـ 14 يوم تجربة مجانية
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-['Cairo']">باقة المجموعات الكبرى</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                    فروع غير محدودة
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-['Cairo']">
                  890 <span className="text-xs text-slate-400 font-normal">ر.س / شهرياً</span>
                </div>
                <p className="text-xs text-slate-400">
                  للمجموعات القابضة وسلاسل التجزئة مع مدير حساب مخصص ودعم قانوني مباشر.
                </p>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>فروع غير محدودة مع إدارة صلاحيات المستخدمين.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>مدير حساب وامتثال مخصص لمعاملاتك الحكومية.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>لوائح اعتراض قانونية معتمدة من محامين مرخصين.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تقارير امتثال تنفيذية دورية لمجلس الإدارة.</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPlan('enterprise');
                  onOpenAuth('register');
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                تواصل للاشتراك بالمجموعات
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION (الأسئلة الشائعة) */}
      <section id="faq" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">
              إجابات واضحة ومباشرة
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white font-['Cairo']">
              الأسئلة الأكثر شيوعاً حول منصة سبّاق
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-white font-['Cairo']">
                      {faq.q}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-t border-emerald-800/40 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Cairo']">
            اجعل منشأتك في أمان تام من المخالفات البلدية اليوم
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            انضم إلى مئات الشركات والمطاعم والمؤسسات في الرياض وجدة والشرقية التي تعتمد على سبّاق في استقرار وتوسيع أعمالها بثقة.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تسجيل منشأة جديدة مجاناً</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onEnterAppAsGuest}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تجربة المنصة كزائر</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. GLOBAL FOOTER */}
      {!hideHeaderAndFooter && (
        <footer className="bg-slate-950 border-t border-slate-800 py-12 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white font-['Cairo']">
                  سبّاق <span className="text-emerald-400">الامتثال</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                المنصة السعودية الذكية الشاملة لضبط الامتثال البلدي، رصد التراخيص، وإدارة المستندات الحكومية وحماية المنشآت من الغرامات.
              </p>
              <div className="text-[11px] text-slate-500">
                المملكة العربية السعودية • الرياض • طريق الملك فهد
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">الوحدات والأنظمة</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><a href="#services" className="text-emerald-400 font-bold hover:text-emerald-300">دليل الخدمات والتراخيص</a></li>
                <li><a href="#features" className="hover:text-emerald-400">مراقبة التراخيص الحكومية</a></li>
                <li><a href="#geomap" className="hover:text-emerald-400">الخريطة الجغرافية ورادار التفتيش</a></li>
                <li><a href="#features" className="hover:text-emerald-400">مؤشر المخاطر ومحاكي الغرامات</a></li>
                <li><a href="#features" className="hover:text-emerald-400">محفظة المستندات الذكية</a></li>
                <li><a href="#features" className="hover:text-emerald-400">المساعد الذكي «سبّاق AI»</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">الدخول والبوابات</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><button type="button" onClick={() => onOpenAuth('login', 'client')} className="hover:text-emerald-400 cursor-pointer">بوابة المنشآت والشركات</button></li>
                <li><button type="button" onClick={() => onOpenAuth('login', 'admin')} className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer">بوابة إدارة سبّاق (HQ Staff)</button></li>
                <li><button type="button" onClick={() => onOpenAuth('register', 'client')} className="hover:text-emerald-400 cursor-pointer">إنشاء حساب منشأة جديد</button></li>
                <li><button type="button" onClick={() => onOpenAuth('nafath', 'client')} className="hover:text-emerald-400 cursor-pointer">الدخول عبر نفاذ الوطني</button></li>
                <li><span>هاتف الدعم: 800-124-7722</span></li>
                <li><span>البريد: support@sabbaq.sa</span></li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة سبّاق لتقنية المعلومات والامتثال.
            </div>
            <div className="flex gap-4">
              <a href="#terms" className="hover:underline">الشروط والأحكام</a>
              <a href="#privacy" className="hover:underline">سياسة الخصوصية</a>
              <a href="#security" className="hover:underline">الأمن السيبراني</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
