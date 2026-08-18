import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Building2,
  Scale,
  MapPin,
  Users,
  Calculator,
  Layers,
  FolderLock,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  DollarSign,
  Compass,
  Upload,
  Plus,
  HelpCircle,
  X,
  CornerDownLeft,
  Command
} from 'lucide-react';
import { Establishment, License, DocumentItem, ComplianceViolation, Branch, ServiceCatalogItem } from '../types';
import { COMPLIANCE_RULES, SERVICE_CATALOG } from '../data/complianceData';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment;
  establishments?: Establishment[];
  onSelectEstablishment?: (est: Establishment) => void;
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  branches: Branch[];
  onNavigateToTab: (tab: string, entityId?: string, entityType?: string) => void;
  onOpenAI: () => void;
  onOpenUploadDoc?: (docId?: string) => void;
  onOpenFeeCalculator?: () => void;
  onOpenGoalSelector?: () => void;
  showToast?: (msg: string) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'action' | 'license' | 'document' | 'violation' | 'service' | 'branch' | 'rule';
  categoryLabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  establishment,
  establishments = [],
  onSelectEstablishment,
  licenses,
  documents,
  violations,
  branches,
  onNavigateToTab,
  onOpenAI,
  onOpenUploadDoc,
  onOpenFeeCalculator,
  onOpenGoalSelector,
  showToast
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategoryFilter('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape & key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Build searchable index
  const allResults: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Quick Navigation & Top Actions
    items.push(
      {
        id: 'action-simulator',
        title: 'محاكي المخاطر والمستندات (What-If Simulator)',
        subtitle: 'اختبر تأثير إضافة أو حذف المستندات على مؤشر الامتثال والغرامات',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Sliders,
        badge: 'أداة تفاعلية',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        action: () => onNavigateToTab('risk_center'),
      },
      {
        id: 'action-ask-ai',
        title: 'المساعد الذكي (اسأل سبّاق الامتثال)',
        subtitle: 'استفسر عن اشتراطات البلديات، الدفاع المدني، واللوائح الحكومية',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Sparkles,
        badge: 'ذكاء اصطناعي',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        action: () => onOpenAI(),
      },
      {
        id: 'action-upload-doc',
        title: 'رفع وتوثيق مستند جديد (Smart Vault)',
        subtitle: 'إيداع عقد، ترخيص، شهادة تأهيل أو سجل تجاري للمنشأة',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Upload,
        badge: 'أرشيف',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        action: () => {
          if (onOpenUploadDoc) onOpenUploadDoc();
          else onNavigateToTab('company_documents');
        },
      },
      {
        id: 'action-fee-calc',
        title: 'حاسبة الرسوم الحكومية التقديرية',
        subtitle: 'حساب رسوم الرخص البلدية، الدفاع المدني، وتأهيل الأنشطة',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Calculator,
        badge: 'حاسبة مالية',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        action: () => {
          if (onOpenFeeCalculator) onOpenFeeCalculator();
          else onNavigateToTab('calculator');
        },
      },
      {
        id: 'action-violations',
        title: 'محلل المخالفات والخطوات التصحيحية الذكي',
        subtitle: 'فحص المخالفات المرصودة والاعتراض النظامي خلال المهلة',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Scale,
        badge: 'امتثال',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        action: () => onNavigateToTab('violations_analyzer'),
      },
      {
        id: 'action-contract-editor',
        title: 'محرر وصائغ العقود الذكي بالذكاء الاصطناعي',
        subtitle: 'صياغة عقود العمل، الإيجار التجاري، والتوريد متوافقة مع الأنظمة السعودية',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: FileText,
        badge: 'صائغ عقود',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        action: () => onNavigateToTab('contract_editor'),
      },
      {
        id: 'action-branches-map',
        title: 'الخريطة الجغرافية ومؤشرات الفروع',
        subtitle: 'استعراض مواقع الفروع ومستويات المخاطر المكانية',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Compass,
        badge: 'فروع',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        action: () => onNavigateToTab('geo_map'),
      },
      {
        id: 'action-violation-solutions-mapping',
        title: 'واجهة ربط المخالفات بالحلول والأسئلة التشخيصية',
        subtitle: 'إدارة وتخصيص الحلول المقترحة وشجرة الأسئلة التشخيصية للمخالفات',
        category: 'action',
        categoryLabel: 'إجراءات سريعة',
        icon: Sliders,
        badge: 'إدارة الامتثال',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        action: () => onNavigateToTab('admin_violation_solutions_mapping'),
      }
    );

    // 2. Licenses
    licenses
      .filter(l => l.establishmentId === establishment.id)
      .forEach(lic => {
        const isExp = lic.status === 'expired';
        const isSoon = lic.status === 'expiring_soon';
        items.push({
          id: `lic-${lic.id}`,
          title: lic.name,
          subtitle: `${lic.authority} • رقم الترخيص: ${lic.licenseNumber} • ينتهي: ${lic.expiryDate}`,
          category: 'license',
          categoryLabel: 'التراخيص والشهادات',
          icon: Clock,
          badge: isExp ? 'منتهي الصلاحية' : isSoon ? 'ينتهي قريباً' : 'ساري وموثق',
          badgeColor: isExp
            ? 'bg-rose-100 text-rose-800 border-rose-300'
            : isSoon
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          action: () => onNavigateToTab('licenses', lic.id, 'license'),
        });
      });

    // 3. Documents
    documents
      .filter(d => d.establishmentId === establishment.id)
      .forEach(doc => {
        const isExp = doc.status === 'expired';
        items.push({
          id: `doc-${doc.id}`,
          title: doc.title,
          subtitle: `${doc.authority || 'الجهة المصدرة'} • رقم الوثيقة: ${doc.documentNumber || 'غير محدد'}`,
          category: 'document',
          categoryLabel: 'المستندات والوثائق',
          icon: FolderLock,
          badge: isExp ? 'منتهي' : doc.status === 'valid' ? 'ساري' : 'ينتهي قريباً',
          badgeColor: isExp ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          action: () => onNavigateToTab('company_documents', doc.id, 'document'),
        });
      });

    // 4. Violations
    violations
      .filter(v => v.establishmentId === establishment.id)
      .forEach(viol => {
        items.push({
          id: `viol-${viol.id}`,
          title: viol.title,
          subtitle: `${viol.authority} • الغرامة: ${viol.fineAmount.toLocaleString('ar-SA')} ر.س • المهلة: ${viol.graceDaysRemaining} يوم`,
          category: 'violation',
          categoryLabel: 'المخالفات والرصد',
          icon: AlertTriangle,
          badge: viol.severity === 'high' || viol.severity === 'critical' ? 'حرج' : 'مخالفة مرصودة',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          action: () => onNavigateToTab('violations_analyzer', viol.id, 'violation'),
        });
      });

    // 5. Branches
    branches
      .filter(b => b.establishmentId === establishment.id)
      .forEach(br => {
        items.push({
          id: `branch-${br.id}`,
          title: br.name,
          subtitle: `${br.city} - ${br.district} • عدد التراخيص: ${br.licensesCount || 0} • الخطر: ${br.riskLevel || 'منخفض'}`,
          category: 'branch',
          categoryLabel: 'الفروع والمواقع',
          icon: MapPin,
          badge: br.status === 'active' ? 'نشط' : 'تحت المراجعة',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          action: () => onNavigateToTab('branches', br.id, 'branch'),
        });
      });

    // 6. Regulatory Rules
    COMPLIANCE_RULES.slice(0, 15).forEach(rule => {
      items.push({
        id: `rule-${rule.id}`,
        title: rule.title,
        subtitle: `${rule.authority} • الغرامات حتى: ${rule.penaltyRule.maxFineCap.toLocaleString('ar-SA')} ر.س`,
        category: 'rule',
        categoryLabel: 'اللوائح والاشتراطات',
        icon: BookOpen,
        badge: rule.isMandatory ? 'إلزامي' : 'نظامي',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
        action: () => onNavigateToTab('rules', rule.id, 'rule'),
      });
    });

    // 7. Services Catalog
    SERVICE_CATALOG.slice(0, 15).forEach(serv => {
      items.push({
        id: `serv-${serv.id}`,
        title: serv.name,
        subtitle: `${serv.authority} • المدة: ${serv.estimatedDays} • الرسوم: ${serv.totalEstimated.toLocaleString('ar-SA')} ر.س`,
        category: 'service',
        categoryLabel: 'دليل الخدمات',
        icon: Layers,
        badge: serv.type === 'issuance' ? 'إصدار' : serv.type === 'renewal' ? 'تجديد' : 'استشاري',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        action: () => onNavigateToTab('services', serv.id, 'service'),
      });
    });

    return items;
  }, [licenses, documents, violations, branches, establishment.id]);

  // Filter based on query and activeCategoryFilter
  const filteredResults = useMemo(() => {
    let list = allResults;

    if (activeCategoryFilter !== 'all') {
      list = list.filter(item => item.category === activeCategoryFilter);
    }

    if (!query.trim()) {
      return list.slice(0, 20);
    }

    const cleanQ = query.toLowerCase().trim();
    return list.filter(item => {
      return (
        item.title.toLowerCase().includes(cleanQ) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(cleanQ)) ||
        item.categoryLabel.toLowerCase().includes(cleanQ)
      );
    }).slice(0, 30);
  }, [allResults, query, activeCategoryFilter]);

  if (!isOpen) return null;

  const categoriesList = [
    { id: 'all', label: 'الكل' },
    { id: 'action', label: 'إجراءات سريعة' },
    { id: 'license', label: 'التراخيص' },
    { id: 'document', label: 'المستندات' },
    { id: 'violation', label: 'المخالفات' },
    { id: 'branch', label: 'الفروع' },
    { id: 'service', label: 'الخدمات' },
    { id: 'rule', label: 'الاشتراطات' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 md:pt-20 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="ابحث عن ترخيص، وثيقة، مخالفة، خدمة حكومية، فرع، أو إجراء سريع..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none text-right pr-1 pl-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-200/80 text-slate-600 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold">
            <span>Esc للخروج</span>
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

        {/* Categories Filter Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategoryFilter(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-slate-50"
        >
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">لم يتم العثور على نتائج مطابقة لـ «{query}»</p>
              <p className="text-xs text-slate-400">جرّب البحث بكلمات أخرى مثل "بلدي"، "سلامة"، "عقد"، "مخالفة"، "رسوم"، أو "محاكي".</p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border border-emerald-200 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-['Cairo']">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {item.categoryLabel}
                    </span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isSelected ? 'text-emerald-700 bg-emerald-100' : 'text-slate-300'
                    }`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px]">↓</kbd>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px]">Enter</kbd>
              <span>للاختيار</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px]">Esc</kbd>
              <span>للإغلاق</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>منصة سبّاق الامتثال الموحدة</span>
          </div>
        </div>

      </div>
    </div>
  );
};
