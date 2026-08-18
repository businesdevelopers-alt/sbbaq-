import React from 'react';
import { 
  Calculator, 
  TrendingUp,
  PlusCircle, 
  RotateCw, 
  ShieldAlert, 
  FileSpreadsheet, 
  Sparkles, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Clock,
  Scale,
  Bell,
  Users
} from 'lucide-react';
import { CustomerGoalType } from '../types';

interface GoalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goal: CustomerGoalType) => void;
  establishmentName: string;
}

export const GoalSelectorModal: React.FC<GoalSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectGoal,
  establishmentName,
}) => {
  if (!isOpen) return null;

  const goals = [
    {
      id: 'calculate_cost' as CustomerGoalType,
      title: 'حساب تكلفة وتراخيص المنشأة',
      description: 'حساب الرسوم الحكومية التقديرية ورسوم سبّاق والضريبة لمنشأتك أو فرعك الجديد قبل التقديم.',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-700',
      badge: 'شفافية فورية',
    },
    {
      id: 'fees_planning' as CustomerGoalType,
      title: 'التخطيط المالي والميزانية التقديرية المتراكمة',
      description: 'استعراض رسم بياني للرسوم الحكومية التقديرية المتراكمة على مدار السنة المالية القادمة (12 شهراً) لتخصيص السيولة بدقة.',
      icon: TrendingUp,
      color: 'from-teal-600 to-emerald-800',
      badge: 'مخطط 12 شهراً',
    },
    {
      id: 'sector_benchmark' as CustomerGoalType,
      title: 'مقارنة متوسط القطاع (Benchmarking)',
      description: 'مقارنة نسبة امتثال منشأتك مع متوسط القطاع ومنافسيك في نفس النشاط والمدينة وتحديد الفجوات النظامية.',
      icon: Scale,
      color: 'from-purple-600 to-indigo-800',
      badge: 'معياري ومقارن',
    },
    {
      id: 'proactive_alerts' as CustomerGoalType,
      title: 'التنبيه الذكي بالاستباق (60، 30، 7 أيام)',
      description: 'استعراض الإشعارات التنبؤية المبكرة قبل انتهاء الرخص والوثائق بـ 60 و 30 و 7 أيام وسداد الرسوم وتفادي الغرامات.',
      icon: Bell,
      color: 'from-amber-600 to-rose-700',
      badge: 'استباقي ذكي',
    },
    {
      id: 'team_permissions' as CustomerGoalType,
      title: 'إدارة صلاحيات الفريق والموظفين وسجل التدقيق',
      description: 'إضافة الموظفين وتعيين صلاحياتهم (أخصائي محاسبة، مسؤول تراخيص، مدير امتثال) ومتابعة سجل نشاط كل مستخدم.',
      icon: Users,
      color: 'from-indigo-600 to-purple-800',
      badge: 'حوكمة وصلاحيات',
    },
    {
      id: 'issue_service' as CustomerGoalType,
      title: 'إصدار خدمة أو ترخيص جديد',
      description: 'إصدار السجل التجاري، رخصة بلدي، ترخيص سلامة الدفاع المدني، ملف قوى، أو شهادات الموارد البشرية.',
      icon: PlusCircle,
      color: 'from-blue-600 to-indigo-700',
      badge: 'تأسيس وتوسع',
    },
    {
      id: 'renew_license' as CustomerGoalType,
      title: 'تجديد ترخيص ساري أو منتهي',
      description: 'تجديد فوري للتراخيص البلدية، السلامة، السجلات التجارية، عقود النظافة، والاشتراكات السنوية.',
      icon: RotateCw,
      color: 'from-amber-500 to-orange-600',
      badge: 'استباقي وسريع',
    },
    {
      id: 'monitor_licenses' as CustomerGoalType,
      title: 'إضافة التراخيص ومتابعة انتهائها والرصد الوقائي',
      description: 'مراقبة تواريخ الانتهاء (90، 60، 30، 15، 7، 3، 1 يوم) وحساب مؤشر مخاطر المنشأة تلقائياً.',
      icon: Clock,
      color: 'from-purple-600 to-indigo-800',
      badge: 'حماية مستمرة',
    },
    {
      id: 'resolve_violation' as CustomerGoalType,
      title: 'معالجة مخالفة أو إعداد اعتراض رسمي',
      description: 'تشخيص المخالفات البلدية ومخالفات السلامة وصياغة لوائح اعتراض نظامية محكمة لخفض أو إلغاء الغرامة.',
      icon: ShieldAlert,
      color: 'from-rose-600 to-red-700',
      badge: 'حل عاجل',
    },
    {
      id: 'build_compliance_file' as CustomerGoalType,
      title: 'بناء ملف امتثال رقمي متكامل لمنشأتي',
      description: 'أرشفة السجلات والمستندات والشهادات والفروع والموظفين لإعادة استخدامها في كل المعاملات الحكومية.',
      icon: FileSpreadsheet,
      color: 'from-teal-600 to-emerald-800',
      badge: 'ملف موحد',
    },
    {
      id: 'ai_consultation' as CustomerGoalType,
      title: 'أحتاج مساعدة ذكية في تحديد الخدمات المناسبة',
      description: 'استشارة المساعد الذكي "اسأل سبّاق" لتحديد الالتزامات والتراخيص المطلوبة حسب نشاطك ومدينتك.',
      icon: Sparkles,
      color: 'from-amber-600 to-yellow-600',
      badge: 'مساعد ذكي AI',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>رحلة العميل الموجهة في سبّاق</span>
          </div>
          <h2 className="text-2xl font-bold font-['Cairo'] tracking-tight">
            ماذا تريد أن تنجز اليوم؟
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            اختر هدفك لتخصيص الشاشات والأسئلة لخدمة منشأتك: <strong className="text-emerald-300">{establishmentName}</strong>
          </p>
        </div>

        {/* Goals Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => {
                  onSelectGoal(goal.id);
                  onClose();
                }}
                className="group text-right p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 px-2 py-0.5 rounded-md transition-colors">
                      {goal.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors font-['Cairo'] mb-1">
                    {goal.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>الانتقال والتنفيذ</span>
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>يتم حفظ جميع بياناتك ومستنداتك رقمياً لإعادة استخدامها في كل طلب.</span>
          <button 
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-medium"
          >
            تخطي ومتابعة للوحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
