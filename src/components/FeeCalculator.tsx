import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Building2, 
  FileText, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Check, 
  ShoppingCart, 
  HelpCircle,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  TrendingUp,
  Flame,
  Store
} from 'lucide-react';
import { formatSAR } from '../utils/complianceEngine';
import { ServiceCatalogItem } from '../types';

interface FeeCalculatorProps {
  onAddToCart: (service: ServiceCatalogItem, options?: any) => void;
  establishmentCity?: string;
  establishmentActivity?: string;
  onNavigateToPlanning?: () => void;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  onAddToCart,
  establishmentCity = 'الرياض',
  establishmentActivity = 'مطاعم وإعاشة',
  onNavigateToPlanning,
}) => {
  // Configurable Parameters
  const [activeStep, setActiveStep] = useState<number>(1);
  const [entityType, setEntityType] = useState<'company' | 'establishment'>('company');
  const [isNewEstablishment, setIsNewEstablishment] = useState<boolean>(true);
  const [city, setCity] = useState<string>(establishmentCity);
  const [activityCategory, setActivityCategory] = useState<string>('food_beverage'); // food_beverage, retail, contracting, tech, industrial
  const [areaSquareMeters, setAreaSquareMeters] = useState<number>(120);
  const [signboardMeters, setSignboardMeters] = useState<number>(6);
  const [hasCivilDefenseRequired, setHasCivilDefenseRequired] = useState<boolean>(true);
  const [foreignEmployeesCount, setForeignEmployeesCount] = useState<number>(6);
  const [saudiEmployeesCount, setSaudiEmployeesCount] = useState<number>(2);
  const [yearsDuration, setYearsDuration] = useState<number>(1);

  // Selected Services in Calculator
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: boolean }>({
    cr: true,
    chamber: true,
    articles_of_assoc: true,
    balady_license: true,
    cleaning_contract: true,
    salama_defense: true,
    qiwa_platform: true,
    muqeem_platform: true,
    madad_wages: true,
    zatca_einvoice: true,
  });

  const toggleService = (key: string) => {
    setSelectedServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculations Engine
  const calculations = useMemo(() => {
    let govCommerce = 0;
    let sabbaqCommerce = 0;
    let recurringCommerce = 0;

    // 1. Commerce
    if (selectedServices.cr) {
      const crGov = isNewEstablishment ? (entityType === 'company' ? 1200 : 200) * yearsDuration : (entityType === 'company' ? 1200 : 200) * yearsDuration;
      govCommerce += crGov;
      sabbaqCommerce += isNewEstablishment ? 450 : 300;
      recurringCommerce += (entityType === 'company' ? 1200 : 200);
    }
    if (selectedServices.chamber) {
      const chamberGov = (entityType === 'company' ? 2000 : 500) * yearsDuration;
      govCommerce += chamberGov;
      sabbaqCommerce += 200;
      recurringCommerce += (entityType === 'company' ? 2000 : 500);
    }
    if (selectedServices.articles_of_assoc && entityType === 'company') {
      govCommerce += 500; // توثيق ونشر
      sabbaqCommerce += 600;
    }

    // 2. Balady & Municipal
    let govBalady = 0;
    let sabbaqBalady = 0;
    let recurringBalady = 0;

    if (selectedServices.balady_license) {
      // Municipal formula: base fee + area factor + inspection + signboard
      const baseAreaRate = activityCategory === 'food_beverage' ? 20 : 15; // SAR per m2
      const baladyFee = Math.max(1200, areaSquareMeters * baseAreaRate) * yearsDuration;
      const signboardFee = signboardMeters * 250 * yearsDuration;
      const inspectionFee = 500;
      govBalady += baladyFee + signboardFee + inspectionFee;
      sabbaqBalady += 850;
      recurringBalady += (baladyFee + signboardFee);
    }

    if (selectedServices.cleaning_contract) {
      const cleaningGov = activityCategory === 'food_beverage' ? 1800 : 1200;
      govBalady += cleaningGov * yearsDuration;
      sabbaqBalady += 350;
      recurringBalady += cleaningGov;
    }

    // 3. Civil Defense / Salama
    let govSalama = 0;
    let sabbaqSalama = 0;
    let recurringSalama = 0;

    if (selectedServices.salama_defense && hasCivilDefenseRequired) {
      const salamaGov = 1200 * yearsDuration;
      govSalama += salamaGov;
      sabbaqSalama += 600;
      recurringSalama += 1200;
    }

    // 4. Labor & Platforms
    let govPlatforms = 0;
    let sabbaqPlatforms = 0;
    let recurringPlatforms = 0;

    if (selectedServices.qiwa_platform) {
      const qiwaAnnual = (foreignEmployeesCount + saudiEmployeesCount) > 5 ? 1265 : 700;
      govPlatforms += qiwaAnnual * yearsDuration;
      sabbaqPlatforms += 450;
      recurringPlatforms += qiwaAnnual;
    }

    if (selectedServices.muqeem_platform && foreignEmployeesCount > 0) {
      const muqeemAnnual = foreignEmployeesCount > 5 ? 1150 : 550;
      govPlatforms += muqeemAnnual * yearsDuration;
      sabbaqPlatforms += 350;
      recurringPlatforms += muqeemAnnual;
    }

    if (selectedServices.madad_wages) {
      const madadAnnual = 575 * yearsDuration;
      govPlatforms += madadAnnual;
      sabbaqPlatforms += 250;
      recurringPlatforms += 575;
    }

    if (selectedServices.zatca_einvoice) {
      govPlatforms += 0; // ZATCA registration is free
      sabbaqPlatforms += 650;
      recurringPlatforms += 0;
    }

    // Totals
    const totalGov = govCommerce + govBalady + govSalama + govPlatforms;
    const totalSabbaq = sabbaqCommerce + sabbaqBalady + sabbaqSalama + sabbaqPlatforms;
    const vatSabbaq = totalSabbaq * 0.15;
    const grandTotalFirstYear = totalGov + totalSabbaq + vatSabbaq;
    const totalRecurringAnnualGov = recurringCommerce + recurringBalady + recurringSalama + recurringPlatforms;

    return {
      govCommerce,
      sabbaqCommerce,
      govBalady,
      sabbaqBalady,
      govSalama,
      sabbaqSalama,
      govPlatforms,
      sabbaqPlatforms,
      totalGov,
      totalSabbaq,
      vatSabbaq,
      grandTotalFirstYear,
      totalRecurringAnnualGov,
    };
  }, [
    entityType,
    isNewEstablishment,
    city,
    activityCategory,
    areaSquareMeters,
    signboardMeters,
    hasCivilDefenseRequired,
    foreignEmployeesCount,
    saudiEmployeesCount,
    yearsDuration,
    selectedServices,
  ]);

  const handleAddAllToCart = () => {
    const bundleService: ServiceCatalogItem = {
      id: `bundle-calc-${Date.now()}`,
      code: 'CALC-BUNDLE',
      name: `باقة التراخيص والخدمات المحسوبة (${entityType === 'company' ? 'شركة' : 'مؤسسة'} - ${city})`,
      category: 'specialized',
      authority: 'منظومة التراخيص الحكومية الموحدة',
      type: isNewEstablishment ? 'issuance' : 'renewal',
      description: `تشمل الخدمات المختارة في الحاسبة لمساحة ${areaSquareMeters} م² وعمالة ${foreignEmployeesCount + saudiEmployeesCount} فرد.`,
      requiredDocuments: ['السجل التجاري', 'عقد الإيجار الإلكتروني', 'بيانات المفوض'],
      govFeeEstimated: calculations.totalGov,
      sabbaqFee: calculations.totalSabbaq,
      vatAmount: calculations.vatSabbaq,
      totalEstimated: calculations.grandTotalFirstYear,
      recurringAnnualGov: calculations.totalRecurringAnnualGov,
      estimatedDays: '3-5 أيام عمل',
      popularFor: ['حاسبة الرسوم المعتمدة'],
    };

    onAddToCart(bundleService);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>حاسبة الرسوم التقديرية الشفافة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cairo'] tracking-tight">
            حساب تكاليف التراخيص والخدمات الحكومية
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            احسب الرسوم الحكومية الرسمية المتوقعة ورسوم تنفيذ سبّاق والضريبة بدقة وشفافية متناهية قبل تقديم أي طلب.
          </p>
        </div>

        {onNavigateToPlanning && (
          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={onNavigateToPlanning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>مخطط الرسوم المتراكمة السنوية</span>
            </button>
          </div>
        )}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Phase 1: Establishment Basics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base font-['Cairo']">
                1. بيانات المنشأة ونوع الكيان
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع الكيان القانوني
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntityType('company')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      entityType === 'company'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    شركة (ذ.م.م / مساهمة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType('establishment')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      entityType === 'establishment'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    مؤسسة فردية
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  حالة المعاملة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewEstablishment(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      isNewEstablishment
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    تأسيس / إصدار جديد
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewEstablishment(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      !isNewEstablishment
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    تجديد دوري سنوي
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المدينة الرئيسية
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="الرياض">منطقة الرياض (أمانة الرياض)</option>
                  <option value="جدة">محافظة جدة (أمانة جدة)</option>
                  <option value="الدمام">المنطقة الشرقية (الدمام والخبر)</option>
                  <option value="مكة المكرمة">منطقة مكة المكرمة</option>
                  <option value="المدينة المنورة">منطقة المدينة المنورة</option>
                  <option value="أبها">منطقة عسير (أبها وخميس مشيط)</option>
                  <option value="القصيم">منطقة القصيم (بريدة وعنيزة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  قطاع النشاط الرئيسي
                </label>
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="food_beverage">مطاعم ومقاهي وإعاشة (اشتراطات صحية)</option>
                  <option value="retail">تجارة تجزئة وجملة ومتاجر</option>
                  <option value="contracting">مقاولات وإنشاءات وتشغيل</option>
                  <option value="tech">تقنية معلومات واستشارات وخدمات</option>
                  <option value="industrial">صناعي ومصانع وورش ومستودعات</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phase 2: Municipal & Civil Defense Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Store className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base font-['Cairo']">
                2. تفاصيل الموقع والرخصة البلدية والسلامة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مساحة المحل / الموقع (م²)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={areaSquareMeters}
                    onChange={(e) => setAreaSquareMeters(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 pl-8 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-2 text-xs text-slate-400">م²</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  طول اللوحة الإعلانية (م)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={signboardMeters}
                    onChange={(e) => setSignboardMeters(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 pl-8 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-2 text-xs text-slate-400">متر</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مدة الترخيص (سنوات)
                </label>
                <select
                  value={yearsDuration}
                  onChange={(e) => setYearsDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>سنة واحدة (1)</option>
                  <option value={2}>سنتين (2)</option>
                  <option value={3}>ثلاث سنوات (3)</option>
                  <option value={5}>خمس سنوات (5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phase 3: Manpower & Platforms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base font-['Cairo']">
                3. القوى العاملة والمنصات الحكومية
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عدد العمالة الوافدة
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={foreignEmployeesCount}
                  onChange={(e) => setForeignEmployeesCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عدد الموظفين السعوديين
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={saudiEmployeesCount}
                  onChange={(e) => setSaudiEmployeesCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Phase 4: Included Services Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                الخدمات والتراخيص المشمولة في الحساب
              </h3>
              <span className="text-xs text-slate-500">انقر لتحديد أو استبعاد أي بند</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'cr', label: 'السجل التجاري (وزارة التجارة)' },
                { key: 'chamber', label: 'اشتراك الغرفة التجارية' },
                { key: 'articles_of_assoc', label: 'عقد التأسيس والنشر (للشركات)' },
                { key: 'balady_license', label: 'الرخصة البلدية لممارسة النشاط' },
                { key: 'cleaning_contract', label: 'عقد النظافة التجاري المعتمد' },
                { key: 'salama_defense', label: 'ترخيص سلامة (الدفاع المدني)' },
                { key: 'qiwa_platform', label: 'اشتراك منصة قوى والتوثيق' },
                { key: 'muqeem_platform', label: 'اشتراك منصة مقيم للجوازات' },
                { key: 'madad_wages', label: 'نظام حماية الأجور (منصة مدد)' },
                { key: 'zatca_einvoice', label: 'الفوترة الإلكترونية والزكاة ZATCA' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedServices[item.key]
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedServices[item.key]}
                    onChange={() => toggleService(item.key)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span className="text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Live Calculation Results Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-lg p-6 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 font-['Cairo']">
                  بيان التكاليف التقديرية
                </h3>
                <span className="text-xs text-slate-500">
                  {entityType === 'company' ? 'شركة' : 'مؤسسة'} • {city} • {yearsDuration} سنة
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                حساب فوري
              </span>
            </div>

            {/* Breakdown Categories */}
            <div className="space-y-3 text-xs mb-5">
              
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">منظومة التجارة والغرفة:</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatSAR(calculations.govCommerce)}</span>
                  <span className="text-[10px] text-slate-400 block">+ {formatSAR(calculations.sabbaqCommerce)} تنفيذ</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">رخص بلدي والنظافة:</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatSAR(calculations.govBalady)}</span>
                  <span className="text-[10px] text-slate-400 block">+ {formatSAR(calculations.sabbaqBalady)} تنفيذ</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">ترخيص سلامة والدفاع المدني:</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatSAR(calculations.govSalama)}</span>
                  <span className="text-[10px] text-slate-400 block">+ {formatSAR(calculations.sabbaqSalama)} تنفيذ</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">منصات قوى ومقيم ومدد:</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatSAR(calculations.govPlatforms)}</span>
                  <span className="text-[10px] text-slate-400 block">+ {formatSAR(calculations.sabbaqPlatforms)} تنفيذ</span>
                </div>
              </div>

            </div>

            {/* Separated Totals (Required Transparency) */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-200 mb-5">
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">إجمالي الرسوم الحكومية الرسمية:</span>
                <strong className="text-slate-900 font-bold">{formatSAR(calculations.totalGov)}</strong>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">رسوم خدمات تنفيذ سبّاق:</span>
                <strong className="text-emerald-700 font-bold">{formatSAR(calculations.totalSabbaq)}</strong>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">ضريبة القيمة المضافة (15% على الخدمة):</span>
                <strong className="text-slate-700 font-medium">{formatSAR(calculations.vatSabbaq)}</strong>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block font-['Cairo']">
                    إجمالي السنة الأولى:
                  </span>
                  <span className="text-[10px] text-slate-500">شامل الحكومي والخدمة والضريبة</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-lg text-emerald-700 font-['Cairo']">
                    {formatSAR(calculations.grandTotalFirstYear)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">الرسوم السنوية المتكررة لاحقاً:</span>
                <strong className="text-slate-700">{formatSAR(calculations.totalRecurringAnnualGov)} / سنة</strong>
              </div>

            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddAllToCart}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-['Cairo'] text-sm"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>إضافة التراخيص المحسوبة لسلة الطلبات</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-2.5 leading-relaxed">
              * جميع الرسوم الحكومية تقديرية وتعتمد بدقة على موقع المحل ونوع النشاط المعتمد لدى الجهة.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
