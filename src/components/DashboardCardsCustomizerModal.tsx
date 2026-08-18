import React, { useState } from 'react';
import { 
  X, 
  GripVertical, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  DollarSign, 
  CheckSquare, 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Layers, 
  FileText, 
  LayoutGrid,
  Zap
} from 'lucide-react';

export interface DashboardCardConfig {
  id: string;
  title: string;
  category: 'fees' | 'tasks' | 'risks' | 'alerts' | 'calendar' | 'tools' | 'services' | 'kpis';
  description: string;
  badge?: string;
  iconName: string;
  visible: boolean;
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  {
    id: 'kpis',
    title: 'مؤشرات الأداء الرئيسية ومعدل الامتثال',
    category: 'kpis',
    description: 'ملخص التراخيص النشطة، الفروع، نسبة الامتثال العامة ومؤشرات التغير اليومية.',
    badge: 'أساسي',
    iconName: 'LayoutGrid',
    visible: true,
  },
  {
    id: 'tasks',
    title: 'المطلوب منك اليوم (مركز المهام والإجراءات)',
    category: 'tasks',
    description: 'المهام العاجلة، اعتمادات عروض الأسعار، سداد الفواتير وتجديدات اليوم المستحقة.',
    badge: 'عاجل',
    iconName: 'CheckSquare',
    visible: true,
  },
  {
    id: 'fees',
    title: 'الرسوم والتكاليف والمخطط المالي التنبؤي',
    category: 'fees',
    description: 'الرسم البياني للرسوم الحكومية المتراكمة على 12 شهراً، حاسبة الرسوم، وتفصيل التكاليف.',
    badge: 'تخطيط مالي',
    iconName: 'DollarSign',
    visible: true,
  },
  {
    id: 'financial_compliance_report',
    title: 'ملخص التقرير المالي والامتثال',
    category: 'fees',
    description: 'رسم بياني يوضح تطور مؤشر الامتثال الشهري ونسبة الإنفاق على التراخيص والتوقعات المالية لرسوم تجديد التراخيص للشهور الستة القادمة.',
    badge: 'تقرير مالي وامتثال',
    iconName: 'BarChart3',
    visible: true,
  },
  {
    id: 'risks',
    title: 'مؤشر المخاطر والغرامات المحتملة والتراخيص المستحقة',
    category: 'risks',
    description: 'مقياس درجات الخطر الرقابي، رصد الغرامات المتوقعة، وقائمة التراخيص القريبة من الانتهاء.',
    badge: 'رصد وقائي',
    iconName: 'AlertTriangle',
    visible: true,
  },
  {
    id: 'upcoming_violations_forecast',
    title: 'توقعات المخالفات القادمة',
    category: 'risks',
    description: 'تحليل اتجاهات المخالفات التاريخية للمنشأة ونمذجة تنبؤية بالقطاعات والتراخيص المعرضة للمخالفات في الربع القادم بناءً على بيانات القطاع.',
    badge: 'تنبؤ ذكي',
    iconName: 'TrendingUp',
    visible: true,
  },
  {
    id: 'alerts',
    title: 'مركز التنبيهات الاستباقية والرصد الذكي',
    category: 'alerts',
    description: 'إشعارات الاستباق قبل الانتهاء بـ (60، 30، 7 أيام) مع مقترحات التجديد الفوري.',
    badge: 'استباقي',
    iconName: 'Bell',
    visible: true,
  },
  {
    id: 'calendar',
    title: 'التقويم الزمني للاستحقاقات والشهادات',
    category: 'calendar',
    description: 'متابعة مواعيد استحقاقات كافة الرخص والشهادات عبر التقويم التفاعلي.',
    badge: 'تقويم',
    iconName: 'Calendar',
    visible: true,
  },
  {
    id: 'tools',
    title: 'الأدوات الذكية (المكتبة القانونية، الخريطة، مقارنة القطاع)',
    category: 'tools',
    description: 'صياغة العقود بالذكاء، خريطة التفتيش الجغرافية، التحليل الإجرائي، ومقارنة متوسط القطاع.',
    badge: 'أدوات متقدمة',
    iconName: 'Layers',
    visible: true,
  },
  {
    id: 'services',
    title: 'دليل الخدمات والتراخيص الحكومية السريعة',
    category: 'services',
    description: 'الخدمات الأكثر طلباً مع إمكانية الإضافة السريعة للسلة وطلب التنفيذ.',
    badge: 'خدمات',
    iconName: 'FileText',
    visible: true,
  },
];

interface DashboardCardsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DashboardCardConfig[];
  onSave: (updatedCards: DashboardCardConfig[]) => void;
  onReset: () => void;
}

export const DashboardCardsCustomizerModal: React.FC<DashboardCardsCustomizerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onSave,
  onReset,
}) => {
  const [localCards, setLocalCards] = useState<DashboardCardConfig[]>(cards);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Sync state if cards prop changes
  React.useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...localCards];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setLocalCards(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localCards.length) return;

    const updated = [...localCards];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setLocalCards(updated);
  };

  const toggleVisibility = (id: string) => {
    setLocalCards(prev =>
      prev.map(c => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const applyPreset = (preset: 'fees' | 'tasks' | 'risks' | 'default') => {
    let orderedIds: string[] = [];
    if (preset === 'fees') {
      orderedIds = ['fees', 'kpis', 'tasks', 'risks', 'alerts', 'calendar', 'tools', 'services'];
    } else if (preset === 'tasks') {
      orderedIds = ['tasks', 'alerts', 'kpis', 'fees', 'risks', 'calendar', 'tools', 'services'];
    } else if (preset === 'risks') {
      orderedIds = ['risks', 'alerts', 'kpis', 'fees', 'tasks', 'calendar', 'tools', 'services'];
    } else {
      orderedIds = DEFAULT_DASHBOARD_CARDS.map(c => c.id);
    }

    const newArr: DashboardCardConfig[] = [];
    orderedIds.forEach(id => {
      const found = localCards.find(c => c.id === id) || DEFAULT_DASHBOARD_CARDS.find(c => c.id === id);
      if (found) {
        newArr.push({ ...found, visible: true });
      }
    });
    setLocalCards(newArr);
  };

  const handleSaveAndClose = () => {
    onSave(localCards);
    onClose();
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className="w-4 h-4 text-teal-600" />;
      case 'CheckSquare': return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Bell': return <Bell className="w-4 h-4 text-indigo-600" />;
      case 'Calendar': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'Layers': return <Layers className="w-4 h-4 text-purple-600" />;
      case 'FileText': return <FileText className="w-4 h-4 text-slate-600" />;
      default: return <LayoutGrid className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-['Cairo'] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  تخصيص وترتيب بطاقات لوحة التحكم
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  سحب وإفلات
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                اسحب البطاقات لإعادة ترتيبها أو استخدم الأسهم لتركيز الأدوات الأكثر استخداماً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ترتيب مقترح سريع:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => applyPreset('fees')}
              className="bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-slate-200 hover:border-teal-300 font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <DollarSign className="w-3 h-3 text-teal-600" />
              <span>تركيز الرسوم والتكاليف</span>
            </button>

            <button
              onClick={() => applyPreset('tasks')}
              className="bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <CheckSquare className="w-3 h-3 text-emerald-600" />
              <span>تركيز المهام والطلبات</span>
            </button>

            <button
              onClick={() => applyPreset('risks')}
              className="bg-white hover:bg-amber-50 text-amber-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>تركيز المخاطر والامتثال</span>
            </button>
          </div>
        </div>

        {/* Draggable Cards List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
            <span>الترتيب الحالي (من الأعلى إلى الأسفل):</span>
            <span>{localCards.filter(c => c.visible).length} بطاقات ظاهرة من أصل {localCards.length}</span>
          </div>

          {localCards.map((card, index) => {
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-3.5 rounded-2xl border transition-all select-none flex items-center justify-between gap-3 ${
                  isDragging
                    ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50 scale-98'
                    : isOver
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/20'
                    : !card.visible
                    ? 'bg-slate-100/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Left Handle & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    title="اسحب لإعادة الترتيب"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                    {renderIcon(card.iconName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <h4 className={`font-bold text-xs truncate ${card.visible ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {card.title}
                      </h4>
                      {card.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Controls (Arrows & Visibility) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === localCards.length - 1}
                    onClick={() => moveCard(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-slate-200 mx-1" />

                  <button
                    type="button"
                    onClick={() => toggleVisibility(card.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      card.visible
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={card.visible ? 'إخفاء من اللوحة' : 'إظهار في اللوحة'}
                  >
                    {card.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setLocalCards(DEFAULT_DASHBOARD_CARDS);
              onReset();
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الترتيب الافتراضي</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق الترتيب</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
