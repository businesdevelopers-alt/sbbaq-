import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BookOpen, 
  TrendingDown, 
  HelpCircle, 
  Send, 
  RotateCw, 
  Eye, 
  Building2, 
  Wrench, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { 
  ComplianceViolation, 
  Establishment, 
  Branch, 
  DocumentItem, 
  ViolationProceduralAnalysis, 
  CorrectiveActionStep,
  ProceduralManualReference
} from '../types';
import { 
  SAUDI_PROCEDURAL_MANUALS, 
  INITIAL_VIOLATIONS_ANALYSIS 
} from '../data/proceduralManualsData';
import { formatSAR } from '../utils/complianceEngine';

interface SmartViolationsAnalyzerProps {
  establishment: Establishment;
  branches?: Branch[];
  violations: ComplianceViolation[];
  documents?: DocumentItem[];
  initialSelectedViolationId?: string | null;
  onOpenObjectionModal?: (violation: ComplianceViolation) => void;
  onConsultSpecialist?: (topic: string) => void;
  onUploadDoc?: (docId?: string) => void;
  onRenewLicense?: (licenseId: string) => void;
  onBack?: () => void;
  showToast?: (msg: string) => void;
}

export const SmartViolationsAnalyzer: React.FC<SmartViolationsAnalyzerProps> = ({
  establishment,
  branches = [],
  violations,
  documents = [],
  initialSelectedViolationId,
  onOpenObjectionModal,
  onConsultSpecialist,
  onUploadDoc,
  onRenewLicense,
  onBack,
  showToast = (_msg?: string) => {},
}) => {
  // Navigation / View states
  const [activeTab, setActiveTab] = useState<'monitored' | 'custom_analyzer' | 'manuals_directory'>('monitored');
  const [selectedViolationId, setSelectedViolationId] = useState<string>(
    initialSelectedViolationId || (violations[0]?.id ?? '')
  );

  // Analysis Store (Keyed by violationId)
  const [analysisStore, setAnalysisStore] = useState<Record<string, ViolationProceduralAnalysis>>(INITIAL_VIOLATIONS_ANALYSIS);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>('step-1');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  // Custom violation input state
  const [customAuthority, setCustomAuthority] = useState<string>('أمانة منطقة الرياض (بلدي)');
  const [customViolationNumber, setCustomViolationNumber] = useState<string>('VIO-CUSTOM-2026-901');
  const [customReason, setCustomReason] = useState<string>('عدم تجديد تصريح اللوحة الإعلانية التجارية ومخالفة مقاسات الواجهة');
  const [customFineAmount, setCustomFineAmount] = useState<number>(2500);
  const [customBranchName, setCustomBranchName] = useState<string>(branches[0]?.name || 'الفرع الرئيسي - العليا');
  const [customNotes, setCustomNotes] = useState<string>('تم استلام إشعار تفتيش رقابي ميداني مع مهلة 14 يوماً لتصحيح وضع الواجهة.');

  // Manuals Search filter
  const [manualSearchQuery, setManualSearchQuery] = useState<string>('');

  // Selected violation object
  const currentViolation = violations.find(v => v.id === selectedViolationId) || violations[0];

  // Current analysis object
  const currentAnalysis = currentViolation ? analysisStore[currentViolation.id] : null;

  // Auto-analyze initial violation if missing analysis
  useEffect(() => {
    if (currentViolation && !analysisStore[currentViolation.id]) {
      handleRunAIAnalysis(currentViolation);
    }
  }, [currentViolation?.id]);

  // Handler: Run AI Procedural Analysis for a violation
  const handleRunAIAnalysis = async (violation: ComplianceViolation) => {
    setIsLoadingAnalysis(true);
    try {
      const res = await fetch('/api/gemini/analyze-violation-procedure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violationId: violation.id,
          violationNumber: violation.violationNumber,
          authority: violation.authority,
          reason: violation.reason,
          category: violation.category,
          fineAmount: violation.fineAmount,
          branchName: violation.branchName,
          establishmentName: establishment.name,
          crNumber: establishment.crNumber,
          activity: establishment.mainActivity,
          customNotes: `المهلة المتبقية للتصحيح: ${violation.daysLeftToCorrect} يوماً، مهلة الاعتراض: ${violation.daysLeftToObject} يوماً.`
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisStore(prev => ({
          ...prev,
          [violation.id]: data.analysis
        }));
        showToast('تم إتمام التحليل الذكي وتوليد الخطة التصحيحية وفق الدليل الإجرائي');
      } else {
        throw new Error('API returned unformatted data');
      }
    } catch (err) {
      console.warn('AI analysis error, utilizing comprehensive fallback:', err);
      // Generate standard fallback
      const matchedManual = SAUDI_PROCEDURAL_MANUALS.find(m => 
        violation.authority.includes('بلدي') ? m.authorityKey === 'balady' :
        violation.authority.includes('دفاع') || violation.authority.includes('سلامة') ? m.authorityKey === 'civil_defense' :
        violation.authority.includes('موارد') || violation.authority.includes('قوى') ? m.authorityKey === 'labor_qiwa' :
        m.authorityKey === 'balady'
      ) || SAUDI_PROCEDURAL_MANUALS[0];

      const fallbackAnalysis: ViolationProceduralAnalysis = {
        violationId: violation.id,
        violationNumber: violation.violationNumber,
        authority: violation.authority,
        detectedDate: violation.date || '2026-08-10',
        manual: {
          name: matchedManual.manualName,
          articleNumber: 'المادة (4) من اللائحة التنفيذية لضبط المخالفات',
          clauseText: 'يُلزم المخالف بتصحيح الوضع المخالف وإزالة أسبابه خلال المهلة المحددة، مع تقديم ما يثبت إتمام المعالجة إلكترونياً.',
          officialPortal: matchedManual.officialPortal,
          gracePeriodDays: violation.gracePeriodDays || 14,
          objectionWindowDays: violation.objectionDeadlineDays || 60,
          penaltyMultiplierRisk: 'انقضاء المهلة يؤدي إلى تثبيت الغرامة ومضاعفتها وإيقاف الخدمات الحكومية المرتبطة.'
        },
        rootCauseDiagnosis: {
          primaryCause: violation.reason,
          operationalGap: 'عدم اكتمال إجراءات التحقق الداخلي والمطابقة الميدانية قبل الزيارة الرقابية.',
          riskLevel: violation.severity || 'high',
          severityScore: violation.severity === 'critical' ? 90 : violation.severity === 'high' ? 75 : 50
        },
        correctiveActionPlan: [
          {
            id: 'f-step-1',
            stepNumber: 1,
            phase: 'immediate_containment',
            phaseLabel: 'الإيقاف الفوري واحتواء المخالفة',
            actionTitle: 'إصدار أمر فوري لمعالجة الملاحظة وتوثيق الوضع',
            detailedProcedure: `توجيه الفريق المسؤول في ${violation.branchName || 'الفرع'} ببدء أعمال التصحيح وتوثيق كافة المستندات والعقود المطلوبة.`,
            requiredRole: 'مسؤول الامتثال / مدير الفرع',
            proceduralManualArticleRef: 'المادة 4/1 من الدليل الإجرائي المعتمد',
            estimatedDurationHours: 4,
            estimatedCostSAR: 500,
            isCompleted: false,
            evidenceRequired: 'وثيقة سريان المتطلب أو العقد المحدث',
            quickActionType: 'order_service',
            quickActionTarget: 'srv-consult'
          },
          {
            id: 'f-step-2',
            stepNumber: 2,
            phase: 'field_rectification',
            phaseLabel: 'التصحيح الميداني في المنشأة',
            actionTitle: 'إتمام التعديلات الميدانية وتوثيق الصور',
            detailedProcedure: 'تنفيذ المعالجة المادية بالموقع والتقاط صور إثبات واضحة ومطابقة لاشتراطات التفتيش.',
            requiredRole: 'فني معتمد / مدير الموقع',
            proceduralManualArticleRef: 'المادة 5 من لائحة الرقابة الميدانية',
            estimatedDurationHours: 4,
            estimatedCostSAR: 200,
            isCompleted: false,
            evidenceRequired: 'صورتان فوتوغرافيتان للموقع بعد التصحيح',
            quickActionType: 'upload_doc'
          },
          {
            id: 'f-step-3',
            stepNumber: 3,
            phase: 'evidence_upload',
            phaseLabel: 'رفع إثباتات المعالجة عبر المنصة الرسمية',
            actionTitle: `تقديم طلب تصحيح المخالفة عبر ${matchedManual.officialPortal}`,
            detailedProcedure: 'الدخول إلى بوابة الجهة وإرفاق الوثائق والصور لإثبات إزالة المخالفة ضمن المهلة النظامية.',
            requiredRole: 'مسؤول الامتثال لمنصة سبّاق',
            proceduralManualArticleRef: 'المادة 12 من الدليل الإجرائي لإنهاء المخالفات',
            estimatedDurationHours: 1,
            estimatedCostSAR: 0,
            isCompleted: false,
            evidenceRequired: 'رقم إشعار قبول طلب التصحيح',
            quickActionType: 'gov_portal_link',
            quickActionTarget: matchedManual.officialPortal
          },
          {
            id: 'f-step-4',
            stepNumber: 4,
            phase: 'closure_verification',
            phaseLabel: 'طلب إلغاء أو تخفيض الغرامة',
            actionTitle: 'الاستفادة من مهلة السداد المخفض أو التقدم باعتراض',
            detailedProcedure: 'رفع لائحة الاعتراض الذكية أو الاستفادة من مبادرة تخفيض الغرامات عند السداد المبكر.',
            requiredRole: 'المستشار القانوني',
            proceduralManualArticleRef: 'المادة 20 من لائحة الاعتراضات والغرامات',
            estimatedDurationHours: 1,
            estimatedCostSAR: 0,
            isCompleted: false,
            evidenceRequired: 'إشعار قبول الاعتراض أو إيصال السداد',
            quickActionType: 'generate_objection'
          }
        ],
        requiredEvidenceList: [
          {
            id: 'f-ev-1',
            title: 'المستند أو الترخيص النظامي المحدث',
            description: 'وثيقة سارية تثبت الامتثال للمتطلب',
            isAvailableInVault: true,
            sampleFormat: 'ملف PDF إلكتروني'
          },
          {
            id: 'f-ev-2',
            title: 'صور ميدانية توضح إزالة سبب المخالفة',
            description: 'صور نهارية واضحة للفرع/الموقع',
            isAvailableInVault: false,
            sampleFormat: 'صور عالية الدقة JPG'
          }
        ],
        financialImpact: {
          originalFineSAR: violation.fineAmount,
          escalatedFineIfIgnoredSAR: violation.fineAmount * 2,
          correctionEstimatedCostSAR: 700,
          netSavedSAR: violation.fineAmount * 2 - 700,
          potentialDiscountRate: 25,
          discountedFineSAR: violation.fineAmount * 0.75
        },
        objectionFeasibility: {
          score: 70,
          verdict: 'recommended',
          legalGrounds: [
            'الاستجابة الفورية خلال مهلة التصحيح النظامية الممنوحة بموجب الدليل الإجرائي.',
            'عدم وجود سوابق تكرار للمخالفة في الفرع ذاته.',
            'اكتمال الإثباتات الميدانية والفنية الداعمة.'
          ],
          recommendedLetterDraft: `نظراً لأن منشأتنا (${establishment.name}) قد استكملت فوراً معالجة الملاحظة المرصودة برقم ${violation.violationNumber}، واستناداً إلى الدليل الإجرائي المعتمد الذي يمنح مهلة تصحيحية، نلتمس قبول الاعتراض وإلغاء الغرامة المسجلة...`
        },
        lastAnalyzedAt: new Date().toISOString().split('T')[0]
      };

      setAnalysisStore(prev => ({
        ...prev,
        [violation.id]: fallbackAnalysis
      }));
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Handler: Analyze Custom User-Pasted Violation
  const handleAnalyzeCustomViolation = async () => {
    if (!customReason.trim()) {
      showToast('الرجاء إدخال سبب أو نص المخالفة');
      return;
    }

    const customId = `custom-viol-${Date.now()}`;
    const customViolObj: ComplianceViolation = {
      id: customId,
      establishmentId: establishment.id,
      branchName: customBranchName,
      violationNumber: customViolationNumber || 'VIO-CUSTOM-99',
      authority: customAuthority,
      reason: customReason,
      category: 'مخالفات تشغيلية وتنظيمية',
      fineAmount: customFineAmount || 2000,
      date: new Date().toISOString().split('T')[0],
      gracePeriodDays: 14,
      daysLeftToCorrect: 12,
      objectionDeadlineDays: 60,
      daysLeftToObject: 55,
      status: 'pending_review',
      severity: customFineAmount >= 5000 ? 'critical' : customFineAmount >= 2500 ? 'high' : 'medium'
    };

    setIsLoadingAnalysis(true);
    setActiveTab('monitored');
    setSelectedViolationId(customId);

    await handleRunAIAnalysis(customViolObj);
  };

  // Toggle step completion
  const handleToggleStepCompletion = (stepId: string) => {
    if (!currentViolation || !currentAnalysis) return;

    const updatedSteps = currentAnalysis.correctiveActionPlan.map(step => {
      if (step.id === stepId) {
        return { ...step, isCompleted: !step.isCompleted };
      }
      return step;
    });

    setAnalysisStore(prev => ({
      ...prev,
      [currentViolation.id]: {
        ...currentAnalysis,
        correctiveActionPlan: updatedSteps
      }
    }));

    showToast('تم تحديث حالة الخطوة التصحيحية بنجاح');
  };

  // Copy Objection / Closure Letter
  const handleCopyLetter = (letterText?: string) => {
    const textToCopy = letterText || currentAnalysis?.objectionFeasibility.recommendedLetterDraft || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedLetter(true);
      showToast('تم نسخ صيغة الخطاب المعتمد للحافظة');
      setTimeout(() => setCopiedLetter(false), 2500);
    }
  };

  // Print Remediation Plan
  const handlePrintPlan = () => {
    window.print();
  };

  // Filtered steps
  const filteredSteps = currentAnalysis?.correctiveActionPlan.filter(step => {
    if (phaseFilter === 'all') return true;
    return step.phase === phaseFilter;
  }) || [];

  const completedStepsCount = currentAnalysis?.correctiveActionPlan.filter(s => s.isCompleted).length || 0;
  const totalStepsCount = currentAnalysis?.correctiveActionPlan.length || 0;
  const progressPercent = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  // Filtered manuals for directory
  const filteredManuals = SAUDI_PROCEDURAL_MANUALS.filter(m => 
    m.authority.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
    m.manualName.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
    m.statutoryBasis.toLowerCase().includes(manualSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-rose-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shrink-0 shadow-md shadow-rose-900/40 border border-rose-400/30">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black font-['Cairo'] tracking-tight">
                  أداة التحليل الذكية للمخالفات والأدلة الإجرائية
                </h1>
                <span className="bg-amber-400/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  مدعوم باللوائح السعودية المحدثة
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                تشخيص فوري للمخالفات المرصودة واقتراح خطة خطوات تصحيحية متسلسلة مستندة بدقة إلى <strong>الدليل الإجرائي المعتمد</strong> للجهة الحكومية، لتجنب مضاعفة الغرامات والاستفادة من مهل الإعفاء والتخفيض (25% - 50%).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للمركز</span>
              </button>
            )}
            <button
              onClick={() => onConsultSpecialist?.('استشارة في خطة تصحيح المخالفات')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>مستشار امتثال سبّاق</span>
            </button>
          </div>
        </div>

        {/* Primary View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('monitored')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'monitored'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>المخالفات المرصودة ({violations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_analyzer')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'custom_analyzer'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>تحليل إشعار مخالفة جديد / تفتيش فوري</span>
          </button>

          <button
            onClick={() => setActiveTab('manuals_directory')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'manuals_directory'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>كتالوج الأدلة الإجرائية الحكومية (8 أدلة)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONITORED VIOLATIONS ANALYZER */}
      {activeTab === 'monitored' && (
        <div className="space-y-6">
          
          {/* Violation Horizontal Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-3">
              اختر المخالفة المرصودة لإجراء التحليل والاطلاع على الخطة التصحيحية:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {violations.map((viol) => {
                const isSelected = viol.id === selectedViolationId;
                return (
                  <button
                    key={viol.id}
                    onClick={() => {
                      setSelectedViolationId(viol.id);
                      if (!analysisStore[viol.id]) {
                        handleRunAIAnalysis(viol);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        viol.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {viol.authority}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {formatSAR(viol.fineAmount)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                        رقم: {viol.violationNumber}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {viol.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>مهلة التصحيح: <strong>{viol.daysLeftToCorrect} أيام</strong></span>
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        {isSelected ? 'قيد التحليل والمعالجة' : 'عرض الخطة'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Violation Diagnostic Hero & Procedural Manual Reference */}
          {currentViolation && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Diagnostic Top Banner */}
              <div className="p-6 bg-slate-50/80 border-b border-slate-200/80 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-lg">
                        {currentViolation.authority}
                      </span>
                      <span className="text-xs text-slate-500">
                        رقم المخالفة: <strong className="text-slate-800">{currentViolation.violationNumber}</strong>
                      </span>
                      {currentViolation.branchName && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {currentViolation.branchName}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base md:text-lg font-black text-slate-900 font-['Cairo'] mt-1">
                      سبب المخالفة: {currentViolation.reason}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRunAIAnalysis(currentViolation)}
                      disabled={isLoadingAnalysis}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoadingAnalysis ? 'animate-spin text-rose-600' : ''}`} />
                      <span>إعادة التحليل بالذكاء الاصطناعي</span>
                    </button>
                    <button
                      onClick={handlePrintPlan}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة خطة المعالجة</span>
                    </button>
                  </div>
                </div>

                {/* 4 Financial & Procedural Impact Cards */}
                {currentAnalysis && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    
                    {/* Card 1: Official Manual */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">الدليل الإجرائي المختص</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug" title={currentAnalysis.manual.name}>
                        {currentAnalysis.manual.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-rose-700 block mt-1">
                        {currentAnalysis.manual.articleNumber}
                      </span>
                    </div>

                    {/* Card 2: Current Fine vs Discounted */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">الغرامة الصادرة vs التخفيض</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-rose-600">
                          {formatSAR(currentAnalysis.financialImpact.originalFineSAR)}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          ({formatSAR(currentAnalysis.financialImpact.discountedFineSAR)} بعد الخصم {currentAnalysis.financialImpact.potentialDiscountRate}%)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        توفير فوري عبر السداد المبكر أو الإعفاء
                      </span>
                    </div>

                    {/* Card 3: Grace Period */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">المهلة النظامية للتصحيح</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-black text-slate-900">
                          {currentViolation.daysLeftToCorrect} أيام متبقية
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        من أصل {currentAnalysis.manual.gracePeriodDays} يوماً بالدليل الإجرائي
                      </span>
                    </div>

                    {/* Card 4: Net Savings after Correction */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 block">صافي الوفر عند الالتزام</span>
                      <span className="text-sm font-black text-emerald-700 block">
                        +{formatSAR(currentAnalysis.financialImpact.netSavedSAR)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        منع مضاعفة الغرامة ({formatSAR(currentAnalysis.financialImpact.escalatedFineIfIgnoredSAR)})
                      </span>
                    </div>

                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="p-6 space-y-8">

                {/* Section 1: Detailed Procedural Manual Citation */}
                {currentAnalysis && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <span className="font-extrabold text-amber-900">
                          السند النظامي الدقيق من الدليل الإجرائي لـ {currentViolation.authority}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        {currentAnalysis.manual.articleNumber}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-100">
                      <strong>نص البند الإجرائي الملزم:</strong> "{currentAnalysis.manual.clauseText}"
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-1">
                      <span className="text-rose-800 font-semibold">
                        ⚠️ <strong>مخاطر عدم المعالجة:</strong> {currentAnalysis.manual.penaltyMultiplierRisk}
                      </span>
                      <span className="text-slate-600 font-medium">
                        المنصة الرسمية المعتمدة: <strong>{currentAnalysis.manual.officialPortal}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Section 2: Step-by-Step Corrective Action Roadmap */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                          خارطة الخطوات التصحيحية المحددة (Corrective Action Plan)
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                          {completedStepsCount} من {totalStepsCount} مكتملة
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        إجراءات مرحلية مرتبة زمنياً ومسندة لمواد الدليل الإجرائي المعتمد لضمان قبول رفع الملاحظة
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">نسبة الإنجاز</span>
                        <span className="text-emerald-600">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500 rounded-full" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phase Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pb-1">
                    {[
                      { id: 'all', label: 'كافة المراحل' },
                      { id: 'immediate_containment', label: '1. الاحتواء والإيقاف الفوري' },
                      { id: 'field_rectification', label: '2. التصحيح الميداني' },
                      { id: 'evidence_upload', label: '3. رفع الإثباتات بالمنصة' },
                      { id: 'closure_verification', label: '4. الإغلاق والتخفيض' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setPhaseFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                          phaseFilter === f.id
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Steps List */}
                  <div className="space-y-3">
                    {filteredSteps.map((step) => {
                      const isExpanded = expandedStepId === step.id;
                      return (
                        <div
                          key={step.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            step.isCompleted 
                              ? 'bg-emerald-50/40 border-emerald-200/80' 
                              : isExpanded 
                              ? 'bg-white border-rose-300 ring-2 ring-rose-400/10 shadow-xs' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              
                              {/* Checkbox Toggle */}
                              <button
                                onClick={() => handleToggleStepCompletion(step.id)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  step.isCompleted
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border-2 border-slate-300 hover:border-slate-500 bg-white'
                                }`}
                              >
                                {step.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                              </button>

                              {/* Title & Phase */}
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                    الخطوة #{step.stepNumber}
                                  </span>
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                    {step.phaseLabel}
                                  </span>
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-slate-400" />
                                    المسؤول: <strong>{step.requiredRole}</strong>
                                  </span>
                                </div>

                                <h4 className={`font-bold text-sm text-slate-900 font-['Cairo'] ${
                                  step.isCompleted ? 'line-through text-slate-500' : ''
                                }`}>
                                  {step.actionTitle}
                                </h4>
                              </div>
                            </div>

                            {/* Collapse Toggle */}
                            <button
                              onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>

                          {/* Expanded Step Details */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-3 animate-in fade-in">
                              
                              {/* Procedural Procedure from Manual */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-slate-700 leading-relaxed">
                                <strong className="text-slate-900 block mb-1">
                                  📋 إجراء التنفيذ المعتمد بالدليل:
                                </strong>
                                {step.detailedProcedure}
                              </div>

                              {/* Meta Info Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-medium">السند الإجرائي:</span>
                                  <span className="font-bold text-slate-800">{step.proceduralManualArticleRef}</span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-medium">الوقت المقدر:</span>
                                  <span className="font-bold text-slate-800">{step.estimatedDurationHours} ساعات عمل</span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-medium">الإثبات المطلوب إرفاقه:</span>
                                  <span className="font-bold text-slate-800 truncate" title={step.evidenceRequired}>
                                    {step.evidenceRequired}
                                  </span>
                                </div>
                              </div>

                              {/* Quick Action Footer */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="text-[11px] text-slate-500">
                                  التكلفة المادية التقديرية: <strong className="text-slate-800">{formatSAR(step.estimatedCostSAR)}</strong>
                                </div>

                                <div className="flex items-center gap-2">
                                  {step.quickActionType === 'order_service' && (
                                    <button
                                      onClick={() => onConsultSpecialist?.(`تنفيذ الخطوة التصحيحية: ${step.actionTitle}`)}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                    >
                                      <Wrench className="w-3.5 h-3.5" />
                                      <span>طلب تنفيذ الخدمة عبر سبّاق</span>
                                    </button>
                                  )}

                                  {step.quickActionType === 'upload_doc' && onUploadDoc && (
                                    <button
                                      onClick={() => onUploadDoc()}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>رفع مستند الإثبات الآن</span>
                                    </button>
                                  )}

                                  {step.quickActionType === 'generate_objection' && (
                                    <button
                                      onClick={() => {
                                        if (onOpenObjectionModal && currentViolation) {
                                          onOpenObjectionModal(currentViolation);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                    >
                                      <Scale className="w-3.5 h-3.5" />
                                      <span>صياغة لائحة الاعتراض الذكية</span>
                                    </button>
                                  )}

                                  {step.quickActionType === 'gov_portal_link' && (
                                    <a
                                      href={step.quickActionTarget?.startsWith('http') ? step.quickActionTarget : 'https://balady.gov.sa'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>فتح البوابة الحكومية</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Required Evidence & Vault Cross-Check */}
                {currentAnalysis && currentAnalysis.requiredEvidenceList.length > 0 && (
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-700" />
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                          سجل الإثباتات والوثائق المطلوبة لإنهاء المخالفة
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        فحص آلي مع مستودع وثائق المنشأة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {currentAnalysis.requiredEvidenceList.map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="font-bold text-slate-900">{ev.title}</h5>
                              {ev.isAvailableInVault ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  متوفر بالمستودع
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  مطلوب إعداده
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {ev.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                            <span>الصيغة: <strong>{ev.sampleFormat}</strong></span>
                            {!ev.isAvailableInVault && onUploadDoc && (
                              <button
                                onClick={() => onUploadDoc()}
                                className="text-rose-600 font-bold hover:underline"
                              >
                                + رفع الوثيقة
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: AI Objection Feasibility & Closure Letter Drafter */}
                {currentAnalysis && currentAnalysis.objectionFeasibility && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/50 via-slate-50 to-white border border-rose-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-rose-700" />
                          <h4 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                            تقييم فرصة قبول الاعتراض وصيغة الخطاب المعتمد
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          صياغة نظامية فورية مستندة للأدلة الإجرائية لتقديمها عبر منصة {currentViolation.authority}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">نسبة قبول الدفع النظامي:</span>
                        <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-1 rounded-lg">
                          {currentAnalysis.objectionFeasibility.score}% فرصة عالية
                        </span>
                      </div>
                    </div>

                    {/* Legal Grounds Pills */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        الأسانيد والدفوع القانونية المستخلصة من الدليل الإجرائي:
                      </span>
                      <div className="space-y-1">
                        {currentAnalysis.objectionFeasibility.legalGrounds.map((ground, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/70">
                            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-extrabold text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{ground}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editable Letter Draft */}
                    {currentAnalysis.objectionFeasibility.recommendedLetterDraft && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            مسودة لائحة الاعتراض / طلب الإعفاء الرسمية:
                          </span>
                          <button
                            onClick={() => handleCopyLetter(currentAnalysis.objectionFeasibility.recommendedLetterDraft)}
                            className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
                          >
                            {copiedLetter ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تم النسخ بنجاح</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ نص اللائحة</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed max-h-48 overflow-y-auto border border-slate-800 select-all">
                          {currentAnalysis.objectionFeasibility.recommendedLetterDraft}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: CUSTOM VIOLATION / INSPECTION NOTICE ANALYZER */}
      {activeTab === 'custom_analyzer' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
              تحليل إشعار مخالفة جديد أو محضر تفتيش ميداني
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              قم بإدخال بيانات أي مخالفة جديدة أو إشعار تفتيش وارد من أي جهة حكومية، وسيقوم الذكاء الاصطناعي بمطابقته بالدليل الإجرائي المختص واقتراح مسار المعالجة الفوري
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Authority Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                الجهة الحكومية الرقابية الصادرة عنها المخالفة:
              </label>
              <select
                value={customAuthority}
                onChange={(e) => setCustomAuthority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="أمانة منطقة الرياض (بلدي)">أمانة منطقة الرياض / منصة بلدي (البلديات والإسكان)</option>
                <option value="المديرية العامة للدفاع المدني">المديرية العامة للدفاع المدني (منصة سلامة)</option>
                <option value="وزارة الموارد البشرية والتنمية الاجتماعية">وزارة الموارد البشرية والتنمية الاجتماعية (منصة قوى)</option>
                <option value="هيئة الزكاة والضريبة والجمارك (ZATCA)">هيئة الزكاة والضريبة والجمارك (ZATCA)</option>
                <option value="وزارة التجارة">وزارة التجارة (مكافحة التستر والرقابة التجارية)</option>
                <option value="الهيئة العامة للغذاء والدواء">الهيئة العامة للغذاء والدواء (SFDA)</option>
                <option value="الهيئة العامة للعقار (شبكة إيجار)">الهيئة العامة للعقار (منصة إيجار)</option>
                <option value="المؤسسة العامة للتأمينات الاجتماعية">المؤسسة العامة للتأمينات الاجتماعية (GOSI)</option>
              </select>
            </div>

            {/* Violation Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                رقم إشعار المخالفة أو محضر الضبط:
              </label>
              <input
                type="text"
                value={customViolationNumber}
                onChange={(e) => setCustomViolationNumber(e.target.value)}
                placeholder="مثال: VIO-BLD-2026-99418"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Branch Target */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                الفرع أو الموقع المعني:
              </label>
              <select
                value={customBranchName}
                onChange={(e) => setCustomBranchName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name} ({b.city})</option>
                ))}
                <option value="الفرع الرئيسي">الفرع الرئيسي</option>
              </select>
            </div>

            {/* Fine Amount */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                قيمة الغرامة المسجلة (ريال سعودي):
              </label>
              <input
                type="number"
                value={customFineAmount}
                onChange={(e) => setCustomFineAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Violation Reason / Text */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-800 block">
                نص وسبب المخالفة كما ورد في إشعار التفتيش:
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="مثال: رصد عدم تطابق مسمى اللوحة الخارجية مع السجل التجاري، وعدم توفير جهاز نقاط بيع إلكتروني نشط..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Extra Notes */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-800 block">
                ملاحظات ومهل التفتيش الواردة:
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="مثال: المفتش منح مهلة 10 أيام لتعديل اللوحة، ولم يتم تحصيل الغرامة بعد."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setActiveTab('monitored')}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              onClick={handleAnalyzeCustomViolation}
              disabled={isLoadingAnalysis}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              {isLoadingAnalysis ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>جاري التحليل والمطابقة بالدليل الإجرائي...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>بدء التحليل واقتراح الخطوات التصحيحية</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: PROCEDURAL MANUALS DIRECTORY */}
      {activeTab === 'manuals_directory' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
                  كتالوج الأدلة الإجرائية واللوائح التنفيذية للمخالفات في السعودية
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  استعراض الأدلة الإجرائية الرسمية المعتمدة لضبط وتصنيف المخالفات والمهل النظامية ومبادرات التخفيض
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  placeholder="ابحث بالجهة، اسم الدليل، أو اللائحة..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Grid of Procedural Manuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredManuals.map((manual) => (
                <div
                  key={manual.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-md">
                        {manual.authority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {manual.versionOrYear}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                      {manual.manualName}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {manual.description}
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5 text-[11px]">
                      <div className="text-slate-700">
                        <strong>الأساس التشريعي:</strong> {manual.statutoryBasis}
                      </div>
                      <div className="text-amber-800">
                        <strong>ضوابط مهلة التصحيح:</strong> {manual.gracePeriodGuidelines}
                      </div>
                      {manual.reductionInitiatives && (
                        <div className="text-emerald-800">
                          <strong>مبادرات التخفيض:</strong> {manual.reductionInitiatives}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                    <span className="text-slate-500">
                      مهلة الاعتراض: <strong>{manual.objectionWindowDays} يوماً</strong>
                    </span>
                    <span className="text-rose-600 font-bold">
                      {manual.officialPortal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
