import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  ShieldAlert,
  FileText,
  HelpCircle,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Download,
  Check,
  X,
  Layers,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  Eye,
  SlidersHorizontal,
  Bookmark,
  Award,
  ListFilter,
  Play
} from 'lucide-react';
import {
  ViolationSolutionMapping,
  DiagnosticQuestion,
  DiagnosticOption,
  LinkedSolutionRecommendation,
  INITIAL_VIOLATION_SOLUTIONS_MAPPINGS,
  DiagnosticQuestionType,
  DiagnosticOutcomePath
} from '../data/violationMappingData';
import { MOCK_REMEDIATION_SOLUTIONS, RemediationSolution } from '../data/complianceMarketData';
import { ViolationSeverity } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface ViolationSolutionsMappingProps {
  initialMappingId?: string | null;
  initialSearchQuery?: string | null;
  initialAuthorityCategory?: string | null;
  onNavigateToTab?: (tab: string, entityId?: string, entityType?: string) => void;
  showToast?: (msg: string) => void;
}

const STORAGE_KEY = 'sabbaq_violation_solutions_mappings_v1';

export const ViolationSolutionsMapping: React.FC<ViolationSolutionsMappingProps> = ({
  initialMappingId = null,
  initialSearchQuery = null,
  initialAuthorityCategory = null,
  onNavigateToTab,
  showToast = (_msg?: string) => {}
}) => {
  // 1. Data State with LocalStorage persistence
  const [mappings, setMappings] = useState<ViolationSolutionMapping[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_VIOLATION_SOLUTIONS_MAPPINGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch (e) {
      console.error('Failed to persist mappings', e);
    }
  }, [mappings]);

  // 2. Filters & View Controls
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedAuthority, setSelectedAuthority] = useState<string>(initialAuthorityCategory || 'all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedMappingId, setExpandedMappingId] = useState<string | null>(initialMappingId || mappings[0]?.id || null);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialMappingId) {
      const target = mappings.find(
        m => m.id === initialMappingId || 
             m.violationCode.toLowerCase() === initialMappingId.toLowerCase() ||
             m.id.includes(initialMappingId)
      );
      if (target) {
        setExpandedMappingId(target.id);
        setSelectedAuthority('all');
        setTimeout(() => {
          const el = document.getElementById(`mapping-card-${target.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      } else {
        setExpandedMappingId(initialMappingId);
      }
    }
    if (initialSearchQuery !== null && initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
    if (initialAuthorityCategory) {
      setSelectedAuthority(initialAuthorityCategory);
    }
  }, [initialMappingId, initialSearchQuery, initialAuthorityCategory, mappings]);

  // 3. Modal / Drawer State for Add/Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ViolationSolutionMapping | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'basic' | 'solutions' | 'questions' | 'preview'>('basic');

  // 4. Form state for Editor
  const [formData, setFormData] = useState<ViolationSolutionMapping>({
    id: '',
    violationCode: '',
    titleAr: '',
    titleEn: '',
    authority: 'وزارة البلديات والإسكان (بلدي)',
    authorityCategory: 'balady',
    categoryLabelAr: 'البلديات والتراخيص',
    severity: 'critical',
    standardFineMinSAR: 1000,
    standardFineMaxSAR: 5000,
    gracePeriodDays: 14,
    objectionWindowDays: 60,
    statutoryArticleRef: '',
    officialManualUrl: '',
    status: 'active',
    descriptionAr: '',
    impactSummaryAr: '',
    linkedSolutions: [],
    diagnosticQuestions: [],
    keywords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'مشرف الامتثال'
  });

  // 5. Solution Picker Sub-Modal inside Editor
  const [isSolutionPickerOpen, setIsSolutionPickerOpen] = useState(false);
  const [solutionPickerSearch, setSolutionPickerSearch] = useState('');

  // 6. Interactive Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorMapping, setSimulatorMapping] = useState<ViolationSolutionMapping | null>(null);
  const [simulatorAnswers, setSimulatorAnswers] = useState<{ [qId: string]: string }>({});
  const [simulatorStep, setSimulatorStep] = useState(0);

  // Helper Authorities List
  const authoritiesList = [
    { id: 'all', label: 'كافة الجهات الحكومية' },
    { id: 'balady', label: 'البلديات (بلدي)' },
    { id: 'civil_defense', label: 'الدفاع المدني (سلامة)' },
    { id: 'zatca', label: 'الزكاة والضريبة (زاتكا)' },
    { id: 'qiwa_labor', label: 'الموارد البشرية (قوى / مدد)' },
    { id: 'commerce', label: 'التجارة والأمن العام' }
  ];

  // Helper Severity Badges
  const getSeverityBadge = (sev: ViolationSeverity) => {
    switch (sev) {
      case 'critical':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
          label: 'حرجة جداً'
        };
      case 'high':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
          label: 'عالية الخطورة'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-600',
          label: 'متوسطة'
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'منخفضة / وقائية'
        };
    }
  };

  // Filtered Mappings List
  const filteredMappings = useMemo(() => {
    return mappings.filter(m => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        m.violationCode.toLowerCase().includes(q) ||
        m.titleAr.toLowerCase().includes(q) ||
        m.authority.toLowerCase().includes(q) ||
        m.statutoryArticleRef.toLowerCase().includes(q) ||
        m.keywords.some(k => k.toLowerCase().includes(q));

      // Authority
      const matchesAuthority = selectedAuthority === 'all' || m.authorityCategory === selectedAuthority;

      // Severity
      const matchesSeverity = selectedSeverity === 'all' || m.severity === selectedSeverity;

      // Status
      const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;

      return matchesQuery && matchesAuthority && matchesSeverity && matchesStatus;
    });
  }, [mappings, searchQuery, selectedAuthority, selectedSeverity, selectedStatus]);

  // Statistics calculation
  const totalViolationsCount = mappings.length;
  const totalSolutionsLinked = mappings.reduce((acc, m) => acc + m.linkedSolutions.length, 0);
  const totalDiagnosticQuestions = mappings.reduce((acc, m) => acc + m.diagnosticQuestions.length, 0);
  const totalActiveMappings = mappings.filter(m => m.status === 'active').length;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const newId = `map-vio-custom-${Date.now()}`;
    const newCode = `VIO-GEN-${Math.floor(100 + Math.random() * 900)}`;
    setEditingMapping(null);
    setFormData({
      id: newId,
      violationCode: newCode,
      titleAr: '',
      titleEn: '',
      authority: 'وزارة البلديات والإسكان (بلدي)',
      authorityCategory: 'balady',
      categoryLabelAr: 'البلديات والتراخيص',
      severity: 'high',
      standardFineMinSAR: 2000,
      standardFineMaxSAR: 8000,
      gracePeriodDays: 14,
      objectionWindowDays: 60,
      statutoryArticleRef: '',
      officialManualUrl: '',
      status: 'active',
      descriptionAr: '',
      impactSummaryAr: '',
      linkedSolutions: [],
      diagnosticQuestions: [
        {
          id: `q-${Date.now()}-1`,
          questionTextAr: 'هل تم إشعار المنشأة بإنذار مسبق قبل إصدار قرار الغرامة؟',
          descriptionAr: 'يحدد العيب الإجرائي في القرار وفرصة قبول الاعتراض.',
          type: 'yes_no',
          isMandatory: true,
          orderIndex: 1,
          options: [
            {
              id: `opt-1a`,
              labelAr: 'نعم، تم استلام إنذار سابق',
              outcomePath: 'direct_solution',
              pathLabelAr: 'معالجة وتصحيح مباشر',
              guidanceAr: 'يتوجب التجديد أو التصحيح للاستفادة من خصم السداد المبكر.',
              objectionScoreImpact: -20
            },
            {
              id: `opt-1b`,
              labelAr: 'لا، صدرت الغرامة مباشرة دون إنذار',
              outcomePath: 'objection',
              pathLabelAr: 'اعتراض قانوني على الإجراء',
              guidanceAr: 'عدم توجيه الإنذار يمثل سبباً جوهرياً لطلب إلغاء القرار.',
              objectionScoreImpact: 40
            }
          ]
        }
      ],
      keywords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'مشرف الامتثال'
    });
    setActiveEditorTab('basic');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ViolationSolutionMapping) => {
    setEditingMapping(item);
    setFormData(JSON.parse(JSON.stringify(item))); // deep copy
    setActiveEditorTab('basic');
    setIsEditorOpen(true);
  };

  // Save Mapping Form
  const handleSaveMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.violationCode.trim()) {
      showToast('يرجى كتابة عنوان المخالفة وكودها النظامي.');
      return;
    }

    const updatedItem: ViolationSolutionMapping = {
      ...formData,
      updatedAt: new Date().toISOString(),
      updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق'
    };

    if (editingMapping) {
      setMappings(prev => prev.map(m => m.id === editingMapping.id ? updatedItem : m));
      showToast(`تم تحديث مصفوفة المخالفة: ${updatedItem.violationCode}`);
    } else {
      setMappings(prev => [updatedItem, ...prev]);
      showToast(`تمت إضافة نوع المخالفة وربط الحلول: ${updatedItem.violationCode}`);
    }

    setIsEditorOpen(false);
  };

  // Duplicate Mapping
  const handleDuplicateMapping = (item: ViolationSolutionMapping) => {
    const duplicated: ViolationSolutionMapping = {
      ...JSON.parse(JSON.stringify(item)),
      id: `map-vio-dup-${Date.now()}`,
      violationCode: `${item.violationCode}-COPY`,
      titleAr: `${item.titleAr} (نسخة مكررة)`,
      status: 'draft',
      updatedAt: new Date().toISOString()
    };
    setMappings(prev => [duplicated, ...prev]);
    showToast(`تم نسخ المخالفة بنجاح: ${duplicated.violationCode}`);
  };

  // Delete Mapping
  const handleDeleteMapping = (id: string, code: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف قاعدة الربط للمخالفة (${code})؟`)) {
      setMappings(prev => prev.filter(m => m.id !== id));
      showToast(`تم حذف قاعدة الربط: ${code}`);
    }
  };

  // Toggle Active/Draft Status
  const handleToggleStatus = (id: string) => {
    setMappings(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'draft' : 'active';
        showToast(`تم تغيير حالة ${m.violationCode} إلى: ${nextStatus === 'active' ? 'نشط' : 'مسودة'}`);
        return { ...m, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return m;
    }));
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('هل تريد استعادة مصفوفة الربط المعتمدة الافتراضية وفق اللوائح السعودية؟ سيتم إعادة ضبط التعديلات.')) {
      setMappings(INITIAL_VIOLATION_SOLUTIONS_MAPPINGS);
      localStorage.removeItem(STORAGE_KEY);
      showToast('تمت استعادة مصفوفة ربط المخالفات والحلول الافتراضية.');
    }
  };

  // Export Matrix JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sabbaq_violation_solutions_matrix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير ملف مصفوفة الربط بنجاح.');
  };

  // Link a Solution from picker
  const handleAddSolutionFromCatalog = (sol: RemediationSolution) => {
    if (formData.linkedSolutions.some(ls => ls.solutionId === sol.id || ls.solutionCode === sol.code)) {
      showToast('هذا الحل مضاف بالفعل لهذه المخالفة.');
      return;
    }

    const newRecommendation: LinkedSolutionRecommendation = {
      solutionId: sol.id,
      solutionCode: sol.code,
      solutionTitleAr: sol.titleAr,
      recommendationLevel: formData.linkedSolutions.length === 0 ? 'primary' : 'preventive',
      recommendationLevelLabelAr: formData.linkedSolutions.length === 0 ? 'حل أساسي إلزامي' : 'حل وقائي مساند',
      effectivenessPercent: 98,
      priorityRank: formData.linkedSolutions.length + 1,
      customEstimatedPriceSAR: sol.estimatedPriceMin,
      customEstimatedLeadDays: sol.estimatedLeadDays,
      adminNotesAr: `حل معتمد من كتالوج حلول سبّاق (${sol.categoryLabelAr})`
    };

    setFormData(prev => ({
      ...prev,
      linkedSolutions: [...prev.linkedSolutions, newRecommendation]
    }));

    setIsSolutionPickerOpen(false);
    showToast(`تم ربط الحل: ${sol.titleAr}`);
  };

  // Remove linked solution
  const handleRemoveLinkedSolution = (solutionId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedSolutions: prev.linkedSolutions.filter(ls => ls.solutionId !== solutionId)
    }));
    showToast('تمت إزالة الحل من قائمة المقترحات.');
  };

  // Add Question to Form
  const handleAddQuestion = () => {
    const newQ: DiagnosticQuestion = {
      id: `q-${Date.now()}`,
      questionTextAr: '',
      descriptionAr: '',
      type: 'yes_no',
      isMandatory: true,
      orderIndex: formData.diagnosticQuestions.length + 1,
      options: [
        {
          id: `opt-${Date.now()}-a`,
          labelAr: 'نعم',
          outcomePath: 'direct_solution',
          pathLabelAr: 'حل مباشر وتصحيح',
          guidanceAr: '',
          objectionScoreImpact: 20
        },
        {
          id: `opt-${Date.now()}-b`,
          labelAr: 'لا',
          outcomePath: 'objection',
          pathLabelAr: 'ترشيح الاعتراض',
          guidanceAr: '',
          objectionScoreImpact: -20
        }
      ]
    };

    setFormData(prev => ({
      ...prev,
      diagnosticQuestions: [...prev.diagnosticQuestions, newQ]
    }));
  };

  // Remove Question
  const handleRemoveQuestion = (qId: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosticQuestions: prev.diagnosticQuestions.filter(q => q.id !== qId)
    }));
  };

  // Add Option to a Question
  const handleAddOptionToQuestion = (qId: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosticQuestions: prev.diagnosticQuestions.map(q => {
        if (q.id === qId) {
          const optId = `opt-${Date.now()}`;
          return {
            ...q,
            options: [
              ...q.options,
              {
                id: optId,
                labelAr: `خيار ${q.options.length + 1}`,
                outcomePath: 'direct_solution' as DiagnosticOutcomePath,
                pathLabelAr: 'حل مباشر',
                guidanceAr: '',
                objectionScoreImpact: 0
              }
            ]
          };
        }
        return q;
      })
    }));
  };

  // Remove Option from a Question
  const handleRemoveOption = (qId: string, optId: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosticQuestions: prev.diagnosticQuestions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.filter(o => o.id !== optId)
          };
        }
        return q;
      })
    }));
  };

  // Launch Simulator
  const handleStartSimulator = (mapping: ViolationSolutionMapping) => {
    setSimulatorMapping(mapping);
    setSimulatorAnswers({});
    setSimulatorStep(0);
    setIsSimulatorOpen(true);
  };

  // Calculate Simulator Results
  const simulatorResult = useMemo(() => {
    if (!simulatorMapping) return null;

    let totalObjectionScore = 50; // base 50%
    const chosenOptions: DiagnosticOption[] = [];
    const recommendedSolutionCodes: Set<string> = new Set();

    simulatorMapping.diagnosticQuestions.forEach(q => {
      const selectedOptId = simulatorAnswers[q.id];
      if (selectedOptId) {
        const foundOpt = q.options.find(o => o.id === selectedOptId);
        if (foundOpt) {
          chosenOptions.push(foundOpt);
          totalObjectionScore += foundOpt.objectionScoreImpact;
          if (foundOpt.suggestedSolutionCodes) {
            foundOpt.suggestedSolutionCodes.forEach(code => recommendedSolutionCodes.add(code));
          }
        }
      }
    });

    // Clamp score 0 - 100
    const finalScore = Math.max(5, Math.min(95, totalObjectionScore));
    const isObjectionRecommended = finalScore >= 65;

    return {
      objectionScore: finalScore,
      isObjectionRecommended,
      chosenOptions,
      recommendedSolutionCodes: Array.from(recommendedSolutionCodes)
    };
  }, [simulatorMapping, simulatorAnswers]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
              <Sliders className="w-3.5 h-3.5" />
              <span>الإدارة المركزية • محرك الامتثال والتشخيص الذكي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cairo'] tracking-tight">
              واجهة ربط المخالفات بالحلول والأسئلة التشخيصية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              تحكم كامل في قواعد الرصد الرقابي: تعيين الحلول الميدانية والتعاقدية لكل نوع مخالفة نظامية، وضبط شجرة الأسئلة التشخيصية لتوجيه العميل آلياً نحو مسار الاعتراض القانوني أو المعالجة الفورية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نوع مخالفة جديد</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-3 rounded-2xl transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
              title="تصدير مصفوفة القواعد بصيغة JSON"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>تصدير المصفوفة</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-3 rounded-2xl transition-colors border border-slate-700 cursor-pointer"
              title="استعادة الإعدادات الافتراضية للوائح السعودية"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] text-slate-400 font-bold block">أنواع المخالفات المربوطة</span>
            <div className="text-xl sm:text-2xl font-black text-white font-['Cairo'] mt-0.5">
              {totalViolationsCount} <span className="text-xs font-normal text-slate-400">قاعدة</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">منها {totalActiveMappings} نشطة فوراً</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] text-slate-400 font-bold block">الحلول المقترحة المخصصة</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-['Cairo'] mt-0.5">
              {totalSolutionsLinked} <span className="text-xs font-normal text-slate-400">حل بديل/إلزامي</span>
            </div>
            <span className="text-[10px] text-slate-300 font-bold">مرتبطة بمزودي خدمة معتمدين</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] text-slate-400 font-bold block">الأسئلة التشخيصية النشطة</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-['Cairo'] mt-0.5">
              {totalDiagnosticQuestions} <span className="text-xs font-normal text-slate-400">سؤال توجيهي</span>
            </div>
            <span className="text-[10px] text-indigo-200 font-bold">تحسب جدوى الاعتراض آلياً</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] text-slate-400 font-bold block">الجهات الحكومية المشمولة</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-['Cairo'] mt-0.5">
              6 <span className="text-xs font-normal text-slate-400">هيئات ووزارات</span>
            </div>
            <span className="text-[10px] text-slate-300 font-bold">بلدي، سلامة، زاتكا، قوى، التجارة</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        
        {/* Top Filter Row: Search & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بكود المخالفة (VIO-BAL-101)، الاسم، السند النظامي، أو الكلمات المفتاحية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Severity Filter Dropdown */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs border border-slate-200 rounded-2xl px-3 py-2.5 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة مستويات الخطورة</option>
              <option value="critical">🔴 حرجة جداً</option>
              <option value="high">🟠 عالية</option>
              <option value="medium">🟡 متوسطة</option>
              <option value="low">🟢 منخفضة</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-2xl px-3 py-2.5 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة الحالات</option>
              <option value="active">مفعلة ونشطة</option>
              <option value="draft">مسودة / قيد المراجعة</option>
              <option value="archived">مؤرشفة</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                }`}
                title="عرض البطاقات التفصيلية"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                }`}
                title="عرض الجدول المدمج"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Authority Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {authoritiesList.map(auth => {
            const isSelected = selectedAuthority === auth.id;
            const count = auth.id === 'all' 
              ? mappings.length 
              : mappings.filter(m => m.authorityCategory === auth.id).length;

            return (
              <button
                key={auth.id}
                onClick={() => setSelectedAuthority(auth.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{auth.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          عرض <strong>{filteredMappings.length}</strong> نوع مخالفة مطابق للفلاتر الحالية
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-indigo-600 hover:underline font-bold"
          >
            مسح كلمة البحث
          </button>
        )}
      </div>

      {/* MAIN CONTENT: Cards Grid View */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredMappings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base font-['Cairo']">لا توجد مخالفات مطابقة لبحثك</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جرب تغيير خيارات الفلترة أو ابحث بكلمات مختلفة، أو قم بإنشاء نوع مخالفة جديد وربطه بالحلول والأسئلة التشخيصية.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مخالفة جديدة الآن</span>
              </button>
            </div>
          ) : (
            filteredMappings.map((mapping) => {
              const sevBadge = getSeverityBadge(mapping.severity);
              const isExpanded = expandedMappingId === mapping.id;

              return (
                <div
                  key={mapping.id}
                  id={`mapping-card-${mapping.id}`}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10' 
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Card Header Top */}
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* Header Badges & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs bg-slate-900 text-white px-2.5 py-1 rounded-xl">
                          {mapping.violationCode}
                        </span>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                          {mapping.authority}
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${sevBadge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${sevBadge.dot}`} />
                          <span>{sevBadge.label}</span>
                        </span>

                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          mapping.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {mapping.status === 'active' ? 'نشطة في المحاكي' : 'مسودة'}
                        </span>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        
                        {/* Run Diagnostic Simulator Button */}
                        <button
                          onClick={() => handleStartSimulator(mapping)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                          title="تجربة محاكي التشخيص لهذه المخالفة"
                        >
                          <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                          <span>محاكي التشخيص</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(mapping)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="تعديل الربط والأسئلة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل وإدارة</span>
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicateMapping(mapping)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="نسخ وتكرار"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteMapping(mapping.id, mapping.violationCode)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Expand / Collapse */}
                        <button
                          onClick={() => setExpandedMappingId(isExpanded ? null : mapping.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title={isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                      </div>

                    </div>

                    {/* Violation Title & Description */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-['Cairo']">
                        {mapping.titleAr}
                      </h3>
                      {mapping.titleEn && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {mapping.titleEn}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {mapping.descriptionAr}
                      </p>
                    </div>

                    {/* Statutory Base & Fine Metas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                      
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-400 font-bold block">الغرامة النظامية المقررة:</span>
                        <div className="font-extrabold text-slate-900 font-['Cairo'] mt-0.5">
                          {formatSAR(mapping.standardFineMinSAR)} - {formatSAR(mapping.standardFineMaxSAR)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-400 font-bold block">المهل النظامية:</span>
                        <div className="font-bold text-slate-800 mt-0.5">
                          تصحيح: <strong>{mapping.gracePeriodDays} يوم</strong> • اعتراض: <strong>{mapping.objectionWindowDays} يوم</strong>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-400 font-bold block">السند النظامي:</span>
                        <div className="font-medium text-slate-700 truncate mt-0.5" title={mapping.statutoryArticleRef}>
                          {mapping.statutoryArticleRef || 'غير محدد'}
                        </div>
                      </div>

                    </div>

                    {/* Highlights Pills (Linked Solutions & Diagnostic Questions) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{mapping.linkedSolutions.length} حلول معالجة مربوطة</span>
                        </span>

                        <span className="text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{mapping.diagnosticQuestions.length} أسئلة تشخيصية</span>
                        </span>

                      </div>

                      <button
                        onClick={() => setExpandedMappingId(isExpanded ? null : mapping.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'إخفاء مصفوفة الربط والأسئلة' : 'عرض مصفوفة الحلول والأسئلة'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED SECTION: Detailed Solutions & Questions Tree */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 p-5 sm:p-6 border-t border-slate-200 space-y-6">
                      
                      {/* Section 1: Linked Remediation Solutions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                              الحلول المقترحة المربوطة بهذه المخالفة ({mapping.linkedSolutions.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => handleOpenEditModal(mapping)}
                            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <span>+ إدارة الحلول</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mapping.linkedSolutions.map((sol, sIdx) => {
                            const isPrimary = sol.recommendationLevel === 'primary';
                            return (
                              <div
                                key={sol.solutionId || sIdx}
                                className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-2.5 ${
                                  isPrimary ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                    isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {sol.recommendationLevelLabelAr || (isPrimary ? 'حل أساسي إلزامي' : 'حل بديل/وقائي')}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                                    {sol.solutionCode}
                                  </span>
                                </div>

                                <h5 className="font-bold text-slate-900 text-xs font-['Cairo'] line-clamp-2">
                                  {sol.solutionTitleAr}
                                </h5>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                                  <span>
                                    التكلفة التقديرية: <strong className="text-emerald-700">{formatSAR(sol.customEstimatedPriceSAR || 0)}</strong>
                                  </span>
                                  <span>
                                    المدة: <strong>{sol.customEstimatedLeadDays || 2} أيام</strong>
                                  </span>
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                                    فاعلية {sol.effectivenessPercent}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Diagnostic Questions Tree */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                              الأسئلة التشخيصية للمخالفة ({mapping.diagnosticQuestions.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => handleOpenEditModal(mapping)}
                            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <span>+ تعديل شجرة الأسئلة</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {mapping.diagnosticQuestions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                              
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0">
                                    {q.orderIndex || qIdx + 1}
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-['Cairo']">
                                      {q.questionTextAr}
                                    </h5>
                                    {q.descriptionAr && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {q.descriptionAr}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {q.isMandatory && (
                                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                                      إلزامي
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                    {q.type === 'yes_no' ? 'نعم / لا' : q.type === 'multiple_choice' ? 'خيارات متعددة' : 'مستندات وأدلة'}
                                  </span>
                                </div>
                              </div>

                              {/* Options & Guidance Output */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                {q.options.map((opt) => {
                                  const isObjectionPath = opt.outcomePath === 'objection';
                                  return (
                                    <div
                                      key={opt.id}
                                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                        isObjectionPath ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between font-bold">
                                        <span className="text-slate-800">{opt.labelAr}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                          isObjectionPath ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                                        }`}>
                                          {opt.pathLabelAr}
                                        </span>
                                      </div>
                                      {opt.guidanceAr && (
                                        <p className="text-[11px] text-slate-600 leading-snug">
                                          {opt.guidanceAr}
                                        </p>
                                      )}
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        تأثير الاعتراض: {opt.objectionScoreImpact > 0 ? `+${opt.objectionScoreImpact}%` : `${opt.objectionScoreImpact}%`}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          ))}
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TABLE VIEW: Compact Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">كود المخالفة</th>
                  <th className="p-4">اسم المخالفة والوصف</th>
                  <th className="p-4">الجهة الحكومية</th>
                  <th className="p-4">الخطورة</th>
                  <th className="p-4">الغرامة المقررة</th>
                  <th className="p-4">الحلول المربوطة</th>
                  <th className="p-4">الأسئلة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMappings.map(mapping => {
                  const sevBadge = getSeverityBadge(mapping.severity);
                  return (
                    <tr key={mapping.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-black text-slate-900 whitespace-nowrap">
                        {mapping.violationCode}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{mapping.titleAr}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{mapping.statutoryArticleRef}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-700 font-medium">
                        {mapping.authority}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevBadge.bg}`}>
                          {sevBadge.label}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 font-['Cairo']">
                        {formatSAR(mapping.standardFineMinSAR)} - {formatSAR(mapping.standardFineMaxSAR)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {mapping.linkedSolutions.length} حلول
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {mapping.diagnosticQuestions.length} أسئلة
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartSimulator(mapping)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                            title="تشغيل المحاكي"
                          >
                            <Play className="w-3.5 h-3.5 fill-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(mapping)}
                            className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMapping(mapping.id, mapping.violationCode)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MAPPING DRAWER & MODAL                                */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Cairo']">
                    {editingMapping ? `تعديل مصفوفة المخالفة (${formData.violationCode})` : 'إضافة وتخصيص نوع مخالفة جديد'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    ربط الحلول الميدانية والتعاقدية وبناء شجرة الأسئلة التشخيصية التفاعلية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Sub-Tabs Bar */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-slate-50 text-xs shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveEditorTab('basic')}
                className={`pb-3 font-bold px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEditorTab === 'basic'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. البيانات الأساسية والسند النظامي</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('solutions')}
                className={`pb-3 font-bold px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEditorTab === 'solutions'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. الحلول المقترحة المربوطة ({formData.linkedSolutions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('questions')}
                className={`pb-3 font-bold px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEditorTab === 'questions'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. شجرة الأسئلة التشخيصية ({formData.diagnosticQuestions.length})</span>
              </button>
            </div>

            {/* Form Content Area */}
            <form onSubmit={handleSaveMapping} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* TAB 1: BASIC DATA */}
              {activeEditorTab === 'basic' && (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">كود المخالفة النظامي *</label>
                      <input
                        type="text"
                        required
                        value={formData.violationCode}
                        onChange={(e) => setFormData({ ...formData, violationCode: e.target.value })}
                        placeholder="مثال: VIO-BAL-101"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">الجهة الحكومية المختصة *</label>
                      <select
                        value={formData.authorityCategory}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          let authName = 'وزارة البلديات والإسكان (بلدي)';
                          if (val === 'civil_defense') authName = 'المديرية العامة للدفاع المدني (سلامة)';
                          if (val === 'zatca') authName = 'هيئة الزكاة والضريبة والجمارك (زاتكا)';
                          if (val === 'qiwa_labor') authName = 'وزارة الموارد البشرية والتنمية الاجتماعية (قوى)';
                          if (val === 'commerce') authName = 'وزارة التجارة والأمن العام';
                          setFormData({
                            ...formData,
                            authorityCategory: val,
                            authority: authName
                          });
                        }}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="balady">وزارة البلديات والإسكان (بلدي)</option>
                        <option value="civil_defense">المديرية العامة للدفاع المدني (سلامة)</option>
                        <option value="zatca">هيئة الزكاة والضريبة والجمارك (زاتكا)</option>
                        <option value="qiwa_labor">وزارة الموارد البشرية (قوى / مدد)</option>
                        <option value="commerce">وزارة التجارة والأمن العام</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">مستوى الخطورة *</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value as ViolationSeverity })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="critical">🔴 حرجة جداً (تستدعي تدخلاً عاجلاً)</option>
                        <option value="high">🟠 عالية الخطورة</option>
                        <option value="medium">🟡 متوسطة</option>
                        <option value="low">🟢 منخفضة / وقائية</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">مسمى المخالفة بالعربية *</label>
                    <input
                      type="text"
                      required
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: مزاولة النشاط التجاري بدون ترخيص بلدي سارٍ..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">وصف المخالفة وحيثيات الرصد *</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="اكتب شرحاً تفصيلياً لما تعنيه هذه المخالفة وحالات تحريرها..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Fines & Deadlines */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">الحد الأدنى للغرامة (ر.س)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.standardFineMinSAR}
                        onChange={(e) => setFormData({ ...formData, standardFineMinSAR: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">الحد الأقصى للغرامة (ر.س)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.standardFineMaxSAR}
                        onChange={(e) => setFormData({ ...formData, standardFineMaxSAR: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold text-rose-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">مهلة التصحيح (أيام)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.gracePeriodDays}
                        onChange={(e) => setFormData({ ...formData, gracePeriodDays: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">مهلة الاعتراض النظامية (أيام)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.objectionWindowDays}
                        onChange={(e) => setFormData({ ...formData, objectionWindowDays: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">السند النظامي / رقم المادة واللائحة</label>
                      <input
                        type="text"
                        value={formData.statutoryArticleRef}
                        onChange={(e) => setFormData({ ...formData, statutoryArticleRef: e.target.value })}
                        placeholder="مثال: المادة (3) من لائحة الجزاءات البلدية..."
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">رابط الدليل الإجرائي / المنصة الرسمية</label>
                      <input
                        type="url"
                        value={formData.officialManualUrl}
                        onChange={(e) => setFormData({ ...formData, officialManualUrl: e.target.value })}
                        placeholder="https://balady.gov.sa/..."
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 block">حالة تفعيل القاعدة في محرك سبّاق</span>
                      <span className="text-[11px] text-slate-500">عند تفعيلها، ستظهر هذه التوصيات والأسئلة لجميع العملاء عند تحليل المخالفة</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'draft' : 'active' })}
                      className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                        formData.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {formData.status === 'active' ? 'مفعلة ونشطة' : 'مسودة غير منشورة'}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: LINKED SOLUTIONS MANAGEMENT */}
              {activeEditorTab === 'solutions' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                        الحلول المقترحة المخصصة لمعالجة هذه المخالفة ({formData.linkedSolutions.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        قم بتعيين الحلول الميدانية أو التعاقدية المناسبة وتحديد الأولوية ونسبة ضمان القبول الحكومي
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSolutionPickerOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ربط حل من الكتالوج</span>
                    </button>
                  </div>

                  {formData.linkedSolutions.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-2">
                      <Zap className="w-8 h-8 text-slate-300 mx-auto" />
                      <span className="font-bold text-slate-700 block">لا توجد حلول مربوطة بعد</span>
                      <p className="text-xs text-slate-400">
                        اضغط على "ربط حل من الكتالوج" لاختيار حلول الدفاع المدني، بلدي، زاتكا، أو الاستشارات القانونية.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.linkedSolutions.map((sol, idx) => (
                        <div key={sol.solutionId || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded">
                                  {sol.solutionCode}
                                </span>
                                <h5 className="font-bold text-slate-900 text-sm font-['Cairo']">
                                  {sol.solutionTitleAr}
                                </h5>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLinkedSolution(sol.solutionId)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                              title="إزالة الحل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Solution Config Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                            
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block">درجة الأولوية والتوصية:</label>
                              <select
                                value={sol.recommendationLevel}
                                onChange={(e) => {
                                  const lvl = e.target.value as any;
                                  const label = lvl === 'primary' ? 'حل أساسي إلزامي' : lvl === 'preventive' ? 'حل وقائي مساند' : 'مسار اعتراضي بديل';
                                  setFormData({
                                    ...formData,
                                    linkedSolutions: formData.linkedSolutions.map((s, sI) => sI === idx ? { ...s, recommendationLevel: lvl, recommendationLevelLabelAr: label } : s)
                                  });
                                }}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-1.5 bg-white"
                              >
                                <option value="primary">🌟 حل أساسي إلزامي</option>
                                <option value="preventive">🛡️ حل وقائي مساند</option>
                                <option value="alternative">⚖️ مسار اعتراضي بديل</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block">التكلفة المخصصة (ر.س):</label>
                              <input
                                type="number"
                                min="0"
                                value={sol.customEstimatedPriceSAR || 0}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setFormData({
                                    ...formData,
                                    linkedSolutions: formData.linkedSolutions.map((s, sI) => sI === idx ? { ...s, customEstimatedPriceSAR: val } : s)
                                  });
                                }}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-1.5 bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block">مدة الإنجاز (أيام):</label>
                              <input
                                type="number"
                                min="1"
                                value={sol.customEstimatedLeadDays || 2}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setFormData({
                                    ...formData,
                                    linkedSolutions: formData.linkedSolutions.map((s, sI) => sI === idx ? { ...s, customEstimatedLeadDays: val } : s)
                                  });
                                }}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-1.5 bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block">نسبة الفاعلية والقبول (%):</label>
                              <input
                                type="number"
                                min="10"
                                max="100"
                                value={sol.effectivenessPercent || 98}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setFormData({
                                    ...formData,
                                    linkedSolutions: formData.linkedSolutions.map((s, sI) => sI === idx ? { ...s, effectivenessPercent: val } : s)
                                  });
                                }}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-1.5 bg-white text-emerald-700"
                              />
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: DIAGNOSTIC QUESTIONS TREE */}
              {activeEditorTab === 'questions' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                        شجرة الأسئلة التشخيصية وتوجيه المسارات ({formData.diagnosticQuestions.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        الأسئلة التي تظهر للعميل في محاكي التشخيص لتحديد جدوى الاعتراض وترشيح الحل المناسب
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة سؤال تشخيصي</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.diagnosticQuestions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                        
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                              {qIdx + 1}
                            </span>
                            <span className="font-bold text-slate-700">سؤال تشخيصي #{qIdx + 1}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                            title="حذف السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 text-[11px]">نص السؤال *</label>
                          <input
                            type="text"
                            required
                            value={q.questionTextAr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({
                                ...formData,
                                diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? { ...item, questionTextAr: val } : item)
                              });
                            }}
                            placeholder="مثال: هل تم إشعار المنشأة بإنذار رسمي مسبق قبل فرض الغرامة؟"
                            className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Description & Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="font-bold text-slate-700 text-[11px]">تلميح وشرح الهدف من السؤال</label>
                            <input
                              type="text"
                              value={q.descriptionAr || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? { ...item, descriptionAr: val } : item)
                                });
                              }}
                              placeholder="يفيد في إثبات العيب الإجرائي في القرار..."
                              className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 text-[11px]">نوع الإجابة</label>
                            <select
                              value={q.type}
                              onChange={(e) => {
                                const val = e.target.value as DiagnosticQuestionType;
                                setFormData({
                                  ...formData,
                                  diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? { ...item, type: val } : item)
                                });
                              }}
                              className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                            >
                              <option value="yes_no">نعم / لا (Yes / No)</option>
                              <option value="multiple_choice">خيارات متعددة</option>
                              <option value="evidence_required">رفع وثيقة / إثبات</option>
                            </select>
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-[11px]">خيارات الإجابة والمسارات التوجيهية:</span>
                            <button
                              type="button"
                              onClick={() => handleAddOptionToQuestion(q.id)}
                              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>إضافة خيار إجابة</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={opt.id || oIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={opt.labelAr}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData({
                                        ...formData,
                                        diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? {
                                          ...item,
                                          options: item.options.map((o, oi) => oi === oIdx ? { ...o, labelAr: val } : o)
                                        } : item)
                                      });
                                    }}
                                    placeholder="نص الخيار..."
                                    className="flex-1 border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                                  />

                                  <select
                                    value={opt.outcomePath}
                                    onChange={(e) => {
                                      const path = e.target.value as DiagnosticOutcomePath;
                                      const pathLabel = path === 'objection' ? 'ترشيح الاعتراض' : path === 'direct_solution' ? 'حل فوري مباشر' : 'استدراج عروض موردين';
                                      setFormData({
                                        ...formData,
                                        diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? {
                                          ...item,
                                          options: item.options.map((o, oi) => oi === oIdx ? { ...o, outcomePath: path, pathLabelAr: pathLabel } : o)
                                        } : item)
                                      });
                                    }}
                                    className="text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-slate-50"
                                  >
                                    <option value="objection">⚖️ ترشيح الاعتراض القانوني</option>
                                    <option value="direct_solution">⚡ حل فوري مباشر</option>
                                    <option value="supplier_request">📦 استدراج عروض موردين</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(q.id, opt.id)}
                                    className="text-rose-400 hover:text-rose-600 p-1"
                                    title="حذف الخيار"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <input
                                    type="text"
                                    value={opt.guidanceAr}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData({
                                        ...formData,
                                        diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? {
                                          ...item,
                                          options: item.options.map((o, oi) => oi === oIdx ? { ...o, guidanceAr: val } : o)
                                        } : item)
                                      });
                                    }}
                                    placeholder="التوجيه والنصيحة التي تظهر للمستخدم..."
                                    className="border border-slate-200 rounded-lg p-1.5"
                                  />

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">تأثير الاعتراض (%):</span>
                                    <input
                                      type="number"
                                      value={opt.objectionScoreImpact}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setFormData({
                                          ...formData,
                                          diagnosticQuestions: formData.diagnosticQuestions.map((item, i) => i === qIdx ? {
                                            ...item,
                                            options: item.options.map((o, oi) => oi === oIdx ? { ...o, objectionScoreImpact: val } : o)
                                          } : item)
                                        });
                                      }}
                                      className="w-20 border border-slate-200 rounded-lg p-1.5 font-mono text-center font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMapping ? 'حفظ التعديلات' : 'إضافة نوع المخالفة'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SOLUTION PICKER FROM CATALOG                                     */}
      {/* ========================================================================= */}
      {isSolutionPickerOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  اختر حلاً من كتالوج حلول الامتثال المعتمدة
                </h3>
              </div>
              <button
                onClick={() => setIsSolutionPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم الحل أو الكود..."
                  value={solutionPickerSearch}
                  onChange={(e) => setSolutionPickerSearch(e.target.value)}
                  className="w-full pl-4 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 space-y-2 flex-1 text-xs">
              {MOCK_REMEDIATION_SOLUTIONS
                .filter(s => !solutionPickerSearch || s.titleAr.toLowerCase().includes(solutionPickerSearch.toLowerCase()) || s.code.toLowerCase().includes(solutionPickerSearch.toLowerCase()))
                .map(sol => (
                  <div key={sol.id} className="pt-2 pb-2 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded">
                          {sol.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {sol.categoryLabelAr}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{sol.titleAr}</h4>
                      <span className="text-[11px] text-slate-500">
                        التكلفة التقديرية: <strong>{formatSAR(sol.estimatedPriceMin)} - {formatSAR(sol.estimatedPriceMax)}</strong> • {sol.estimatedLeadDays} أيام
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSolutionFromCatalog(sol)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shrink-0 transition-colors"
                    >
                      + اختيار
                    </button>
                  </div>
                ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INTERACTIVE DIAGNOSTIC SIMULATOR (محاكي التشخيص الذكي)           */}
      {/* ========================================================================= */}
      {isSimulatorOpen && simulatorMapping && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Simulator Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                  <Play className="w-5 h-5 fill-indigo-400 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-indigo-500/30 px-2 py-0.5 rounded font-bold">
                      {simulatorMapping.violationCode}
                    </span>
                    <span className="text-xs text-indigo-200">محاكي التشخيص الذكي للمنشأة</span>
                  </div>
                  <h3 className="text-base font-bold font-['Cairo'] mt-0.5">
                    {simulatorMapping.titleAr}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions Step Progress */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  أجب عن الأسئلة التشخيصية لاختبار احتساب جدوى الاعتراض والحلول المرشحة:
                </span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                  {Object.keys(simulatorAnswers).length} من {simulatorMapping.diagnosticQuestions.length} مكتمل
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {simulatorMapping.diagnosticQuestions.map((q, qIndex) => {
                  const currentAnswer = simulatorAnswers[q.id];

                  return (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0">
                          {qIndex + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                            {q.questionTextAr}
                          </h4>
                          {q.descriptionAr && (
                            <p className="text-xs text-slate-500 mt-0.5">{q.descriptionAr}</p>
                          )}
                        </div>
                      </div>

                      {/* Options selectable */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt) => {
                          const isSelected = currentAnswer === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSimulatorAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className={isSelected ? 'text-indigo-900' : 'text-slate-800'}>{opt.labelAr}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                              </div>
                              {opt.guidanceAr && (
                                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.guidanceAr}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Dynamic Results Preview Card */}
              {simulatorResult && Object.keys(simulatorAnswers).length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-5 rounded-3xl space-y-4 border border-indigo-500/40 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <h4 className="font-extrabold text-sm font-['Cairo']">
                        النتيجة المحسوبة بمحرك التشخيص الذكي
                      </h4>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      simulatorResult.isObjectionRecommended ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {simulatorResult.isObjectionRecommended ? 'الاعتراض القانوني مرجح' : 'المعالجة الميدانية أولى'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <span className="text-[11px] text-slate-300 block">نسبة جدوى الاعتراض</span>
                      <div className="text-2xl font-black text-amber-300 font-['Cairo'] mt-0.5">
                        {simulatorResult.objectionScore}%
                      </div>
                    </div>

                    <div className="bg-white/10 p-3 rounded-2xl">
                      <span className="text-[11px] text-slate-300 block">التوصية الرئيسية</span>
                      <div className="text-xs font-bold text-emerald-300 mt-1">
                        {simulatorResult.isObjectionRecommended ? 'صياغة مذكرة اعتراض رسمية' : 'تجديد الترخيص وتصحيح الوضع'}
                      </div>
                    </div>
                  </div>

                  {/* Linked Solutions Recommended */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[11px] text-slate-300 font-bold block">الحلول الموصى بها للعميل:</span>
                    <div className="space-y-1">
                      {simulatorMapping.linkedSolutions.map((sol, idx) => (
                        <div key={idx} className="bg-white/10 p-2 rounded-xl flex items-center justify-between text-xs">
                          <span>{sol.solutionTitleAr}</span>
                          <span className="font-bold text-emerald-300">{formatSAR(sol.customEstimatedPriceSAR || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Simulator Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                إغلاق المحاكي
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
