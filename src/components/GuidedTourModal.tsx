import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Bell,
  Scale,
  FileText,
  Calculator,
  FolderLock,
  Building2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Check
} from 'lucide-react';
import { Establishment, License, DocumentItem, ComplianceViolation } from '../types';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  establishment,
  licenses,
  documents,
  violations,
  onNavigateToTab,
  onOpenAI
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'welcome',
      title: 'مرحباً بك في منصة سبّاق للامتثال الحكومي',
      subtitle: 'نظامك الذكي الموحد لإدارة التراخيص، رصد المخاطر، وحماية المنشأة من الغرامات',
      icon: ShieldCheck,
      iconColor: 'bg-emerald-600 text-white',
      badge: 'جولة الاستكشاف',
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            تم تصميم منصة سبّاق خصيصاً لمساعدة رواد الأعمال ومديري المنشآت في المملكة العربية السعودية على أتمتة الامتثال النظامي والتجاري، متابعة مواعيد التجديد بدقة متناهية، وتفادي أي عقوبات أو إغلاقات تشغيلية.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-1">
              <span className="text-lg font-black text-emerald-800 font-mono">0 ر.س</span>
              <span className="text-[11px] font-bold text-emerald-950 block">هدف الغرامات المستهدفة</span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center space-y-1">
              <span className="text-lg font-black text-indigo-800 font-mono">100%</span>
              <span className="text-[11px] font-bold text-indigo-950 block">تغطية الرخص البلدية والسلامة</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center space-y-1">
              <span className="text-lg font-black text-amber-800 font-mono">60/30/7</span>
              <span className="text-[11px] font-bold text-amber-950 block">تنبيهات استباقية دورية</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'ابدأ الجولة الإرشادية',
      action: () => setCurrentStep(1),
    },
    {
      id: 'simulator',
      title: 'محاكي المخاطر والمستندات (What-If Simulator)',
      subtitle: 'أداة رياضية ذكية لاختبار تأثير إضافة أو حذف المستندات قبل أي قرار',
      icon: Sliders,
      iconColor: 'bg-indigo-600 text-white',
      badge: 'أداة حصرية',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            يمكنك محاكاة مؤشر الامتثال ومستوى المخاطر التقديري فورياً، وتجربة سيناريوهات سريعة مثل (الامتثال المثالي 100%، أو فقدان شهادة السلامة، أو تجديد الرخص المنتهية).
          </p>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>كيف تستفيد من المحاكي؟</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
              <li>جرّب تعديل حالة أي رخصة إلى (ساري / ينتهي قريباً / منتهي / محذوف).</li>
              <li>اختر من مكتبة الاشتراطات الحكومية لمعرفة أثر إضافة عقود النظافة أو كاميرات المراقبة.</li>
              <li>استخرج خطة العمل الفورية لتخفيض المخاطر إلى الحد الأدنى.</li>
            </ul>
          </div>
        </div>
      ),
      actionLabel: 'الانتقال إلى محاكي المخاطر',
      action: () => {
        onNavigateToTab('risk_center');
        onClose();
      },
    },
    {
      id: 'alerts',
      title: 'نظام التنبيهات الاستباقية والرصد المبكر',
      subtitle: 'إنذارات مجدولة على مراحل 60 و 30 و 7 أيام قبل انتهاء أي ترخيص أو وثيقة',
      icon: Bell,
      iconColor: 'bg-amber-600 text-white',
      badge: 'رصد مبكر',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            لا داعي لتذكر تواريخ التجديد يدوياً! يتتبع النظام بصورة ذكية جميع تراخيص المنشأة وفروعها، ويرسل إشعارات فورية مع روابط تجديد مباشرة ومقترحات تلقائية لتجديد العقود.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
              <span className="font-extrabold block text-sm font-mono">60 يوماً</span>
              <span className="text-[10px]">تخطيط الميزانية</span>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
              <span className="font-extrabold block text-sm font-mono">30 يوماً</span>
              <span className="text-[10px]">تجهيز المستندات</span>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-200">
              <span className="font-extrabold block text-sm font-mono">7 أيام</span>
              <span className="text-[10px]">إنذار عاجل وحرج</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'عرض التنبيهات الاستباقية',
      action: () => {
        onNavigateToTab('proactive_alerts');
        onClose();
      },
    },
    {
      id: 'violations',
      title: 'تحليل المخالفات والاعتراض النظامي',
      subtitle: 'دليل تصحيح المخالفات وصيغ الاعتراض القانونية حسب الأنظمة السعودية',
      icon: Scale,
      iconColor: 'bg-rose-600 text-white',
      badge: 'حماية نظامية',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            عند رصد أي مخالفة من الأمانة أو التجارة أو الدفاع المدني، يقدم لك النظام تحليلاً فورياً للسبب، والخطوات التصحيحية التنفيذية، وصياغة خطابات الاعتراض النظامية لتقديمها عبر المنصات الرسمية.
          </p>
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>مهلة الاعتراض النظامية:</strong> تبدأ عادة من تاريخ الإشعار بالمخالفة وتستمر حتى 30 أو 60 يوماً حسب اللائحة. احرص على البدء بالإجراءات التصحيحية فوراً.
            </div>
          </div>
        </div>
      ),
      actionLabel: 'فتح محلل المخالفات',
      action: () => {
        onNavigateToTab('violations_analyzer');
        onClose();
      },
    },
    {
      id: 'shortcuts',
      title: 'لوحة الأوامر السريعة والبحث الذكي',
      subtitle: 'اضغط في أي وقت على Ctrl+K أو ⌘K للوصول لأي خدمة أو مستند في ثانية',
      icon: Lightbulb,
      iconColor: 'bg-purple-600 text-white',
      badge: 'تجربة مستخدم سريعة',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            استخدم شريط البحث الشامل أو محرك الذكاء الاصطناعي للإجابة عن التساؤلات، حساب الرسوم، صياغة العقود، أو التنقل بين فروع ومستندات المنشأة.
          </p>
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <kbd className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold">
                ⌘ + K / Ctrl + K
              </kbd>
              <span className="text-xs text-slate-300">فتح لوحة البحث الشامل</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">متاح في كل الشاشات</span>
          </div>
        </div>
      ),
      actionLabel: 'تم، جاهز للانطلاق!',
      action: () => onClose(),
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Progress & Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${current.iconColor} flex items-center justify-center shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 font-['Cairo']">
                  دليل الاستخدام السريع
                </span>
                <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {current.badge}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                الخطوة {currentStep + 1} من {steps.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 pt-4 flex items-center justify-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-8 bg-emerald-600' : idx < currentStep ? 'w-4 bg-emerald-300' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 font-['Cairo']">
              {current.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {current.subtitle}
            </p>
          </div>

          <div className="pt-2">
            {current.content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 ${
              currentStep === 0 ? 'text-slate-300 border-slate-200 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-200 cursor-pointer'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={current.action}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
