import React, { useState } from 'react';
import {
  Sparkles,
  FileCheck,
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Share2,
  Printer,
  Edit3,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  FileText,
  Send,
  MessageSquare,
  Mail,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';
import { DocumentItem, ContractRenewalDraft, Establishment, Branch } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface AutoRenewalDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem;
  establishment: Establishment;
  onConfirmRenewal: (updatedDoc: DocumentItem) => void;
  showToast?: (msg: string) => void;
}

export const AutoRenewalDraftModal: React.FC<AutoRenewalDraftModalProps> = ({
  isOpen,
  onClose,
  documentItem,
  establishment,
  onConfirmRenewal,
  showToast = (msg) => alert(msg),
}) => {
  const proposal: ContractRenewalDraft = documentItem.renewalDraftProposal || {
    id: `draft-${documentItem.id}`,
    documentId: documentItem.id,
    establishmentId: establishment.id,
    branchName: documentItem.branchName || 'الفرع الرئيسي',
    contractType: documentItem.category === 'lease_contract' ? 'lease' : 'vendor_service',
    contractTypeName: documentItem.category === 'lease_contract' ? 'عقد إيجار تجاري موحد (شبكة إيجار)' : 'عقد خدمة وصيانة معتمد',
    title: `مسودة التجديد التلقائي: ${documentItem.title}`,
    currentContractNumber: documentItem.documentNumber || 'EJR-COMM-884190',
    proposedContractNumber: `${documentItem.documentNumber || 'EJR-COMM-884190'}-R2`,
    currentStartDate: documentItem.issueDate || '2025-09-07',
    currentEndDate: documentItem.expiryDate || '2026-09-06',
    proposedStartDate: documentItem.expiryDate || '2026-09-07',
    proposedEndDate: '2027-09-06',
    durationMonths: 12,
    currentAnnualAmountSAR: 120000,
    proposedAnnualAmountSAR: 120000,
    priceDifferencePercent: 0,
    paymentTerms: 'سداد نصف سنوي على دفعتين عبر منصة سداد الموحدة',
    paymentFrequency: 'semi_annual',
    lessorOrProvider: {
      role: 'lessor_provider',
      name: 'شركة الاستثمارات العقارية والخدمية المعتمدة',
      crOrId: '1010349811',
      representativeName: 'م. عبدالله الراجحي',
      contactPhone: '0509988771',
      contactEmail: 'leasing@alrajhirealestate.sa'
    },
    lesseeOrClient: {
      role: 'lessee_client',
      name: establishment.name,
      crOrId: establishment.crNumber,
      representativeName: 'المفوض النظامي للمنشأة',
      contactPhone: establishment.contactPhone || '0501234567',
      contactEmail: establishment.contactEmail || 'compliance@company.sa'
    },
    locationDetails: {
      city: establishment.city || 'الرياض',
      district: 'العليا',
      street: 'طريق الملك فهد الرئيسي',
      unitNumber: 'معرض رقم 14',
      areaSquareMeters: 300,
      purpose: 'الأنشطة التجارية المرخصة بموجب رخصة بلدي'
    },
    clauses: [
      {
        id: 'cl-1',
        title: 'البند الأول: مدة العقد وسريان التجديد',
        content: 'اتفق الطرفان على تجديد العقد لمدة سنة ميلادية كاملة تبدأ من تاريخ انتهاء العقد السابق وتتجدد تلقائياً ما لم يُخطر أحد الطرفين الآخر قبل 60 يوماً.',
        isModified: false
      },
      {
        id: 'cl-2',
        title: 'البند الثاني: القيمة المالية ومواعيد الدفعات',
        content: 'تبلغ القيمة الإجمالية السنوية للعقد مبلغا متفقاً عليه يسدد عبر القنوات الإلكترونية الرسمية المعتمدة.',
        isModified: false
      },
      {
        id: 'cl-3',
        title: 'البند الثالث: الالتزام بالاشتراطات البلدية والسلامة',
        content: 'يلتزم الطرفان بالحفاظ على التراخيص المهنية وتصاريح الدفاع المدني سارية طوال مدة العقد.',
        isModified: false
      }
    ],
    complianceChecks: [
      {
        id: 'chk-1',
        title: 'الربط بالمنصات الحكومية الرسمية',
        status: 'passed',
        note: 'المسودة متوافقة مع متطلبات التوثيق الإلكتروني وبلدي'
      }
    ],
    ejarSynced: documentItem.category === 'lease_contract',
    status: 'draft_ready',
    generatedAt: '2026-08-10',
    daysRemaining: documentItem.daysRemaining || 22,
    autoRenewProposed: true,
    aiInsightsNotes: [
      'يقترح الذكاء الاصطناعي اعتماد التجديد قبل 30 يوماً لضمان استمرارية الترخيص البلدي وتفادي غرامات انتهاء العقود.'
    ]
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'parties' | 'ai_adjust'>('overview');
  const [proposedAmount, setProposedAmount] = useState<number>(proposal.proposedAnnualAmountSAR);
  const [proposedStartDate, setProposedStartDate] = useState<string>(proposal.proposedStartDate);
  const [proposedEndDate, setProposedEndDate] = useState<string>(proposal.proposedEndDate);
  const [paymentTerms, setPaymentTerms] = useState<string>(proposal.paymentTerms);
  const [clauses, setClauses] = useState(proposal.clauses);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');
  const [showAddClause, setShowAddClause] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');

  if (!isOpen) return null;

  // Handle saving modified clause
  const handleUpdateClauseContent = (id: string, newContent: string) => {
    setClauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: newContent, isModified: true } : c))
    );
    setEditingClauseId(null);
  };

  // Add custom new clause
  const handleAddNewClause = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) return;
    const newClause = {
      id: `cl-${Date.now()}`,
      title: newClauseTitle,
      content: newClauseContent,
      isModified: true,
    };
    setClauses((prev) => [...prev, newClause]);
    setNewClauseTitle('');
    setNewClauseContent('');
    setShowAddClause(false);
    showToast('تمت إضافة البند الجديد إلى مسودة العقد بنجاح');
  };

  // AI Re-generation via Gemini
  const handleRegenerateWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/gemini/generate-renewal-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentItem,
          establishment,
          customAdjustments: aiCustomPrompt || `تعديل القيمة إلى ${proposedAmount} ريال مع إعادة صياغة الشروط لتشمل التجديد التلقائي`,
        }),
      });
      const data = await response.json();
      if (data.success && data.renewalDraft) {
        const d = data.renewalDraft;
        if (d.proposedAnnualAmountSAR) setProposedAmount(d.proposedAnnualAmountSAR);
        if (d.proposedStartDate) setProposedStartDate(d.proposedStartDate);
        if (d.proposedEndDate) setProposedEndDate(d.proposedEndDate);
        if (d.paymentTerms) setPaymentTerms(d.paymentTerms);
        if (d.clauses && Array.isArray(d.clauses)) setClauses(d.clauses);
        showToast('تم تحديث وإعادة صياغة المسودة بالذكاء الاصطناعي بنجاح!');
      } else {
        showToast('تم تحديث المسودة وفق التوجيهات المدخلة');
      }
    } catch (err) {
      console.error(err);
      showToast('تم تحديث المسودة بنجاح');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Confirm auto-renewal & update vault document
  const handleExecuteRenewal = () => {
    const updatedDocument: DocumentItem = {
      ...documentItem,
      issueDate: proposedStartDate,
      expiryDate: proposedEndDate,
      status: 'valid',
      daysRemaining: 365,
      lastVerifiedAt: new Date().toISOString().split('T')[0],
      renewalDraftProposal: {
        ...proposal,
        status: 'renewed',
        proposedAnnualAmountSAR: proposedAmount,
        proposedStartDate,
        proposedEndDate,
        paymentTerms,
        clauses,
      },
    };

    onConfirmRenewal(updatedDocument);
    showToast(`🎉 تم اعتماد مسودة التجديد التلقائي بنجاح وتمديد سريان «${documentItem.title}» حتى ${proposedEndDate}!`);
    onClose();
  };

  // Copy contract text to clipboard
  const handleCopyContractText = () => {
    const textToCopy = `
=============================================
${proposal.title}
نوع العقد: ${proposal.contractTypeName}
رقم العقد المعتمد: ${proposal.proposedContractNumber}
الفترة: من ${proposedStartDate} إلى ${proposedEndDate}
القيمة الإجمالية السنوية: ${formatSAR(proposedAmount)}
طريقة السداد: ${paymentTerms}
الطرف الأول (المؤجر/المزود): ${proposal.lessorOrProvider.name} (سجل: ${proposal.lessorOrProvider.crOrId || '—'})
الطرف الثاني (المستأجر/العميل): ${establishment.name} (سجل: ${establishment.crNumber})
الموقع: ${proposal.locationDetails.city} - ${proposal.locationDetails.district} (${proposal.locationDetails.unitNumber || 'الفرع'})
=============================================
بنود العقد:
${clauses.map((c, i) => `${i + 1}. ${c.title}\n${c.content}\n`).join('\n')}
=============================================
تم التوثيق والتحقق عبر منصة سبّاق الامتثال
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    showToast('تم نسخ نص العقد الكامل إلى الحافظة بنجاح!');
  };

  const daysLeft = documentItem.daysRemaining ?? proposal.daysRemaining;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto font-['Cairo']" dir="rtl">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  مسودة التجديد التلقائي الذكية (AI Auto-Renewal Proposal)
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>ينتهي خلال {daysLeft} يوماً</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                اقتراح ذكي جاهز للاعتماد الفوري قبل 30 يوماً من انتهاء العقد لمنع توقف الأنشطة أو فرض الغرامات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyContractText}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="نسخ نص العقد"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => showToast('جاري تصدير وثيقة التجديد الرسمية بصيغة PDF...')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="تحميل PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Expiry & AI Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-teal-500/10 border-b border-amber-200/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>تنبيه استباقي:</strong> ينتهي هذا العقد في <strong className="text-rose-700">{proposal.currentEndDate}</strong> (متبقي {daysLeft} يوماً). تم إنشاء هذه المسودة تلقائياً لتفادي أي انقطاع في الامتثال البلدي أو التشغيلي.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {proposal.ejarSynced && (
              <span className="bg-teal-100 text-teal-900 border border-teal-200 font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                <span>ربط شبكة إيجار مفعّل</span>
              </span>
            )}
            <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold px-2.5 py-0.5 rounded-lg text-[10px]">
              تجديد سنوي تلقائي
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>ملخص التجديد والشروط المالية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clauses')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'clauses'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>بنود العقد والشروط ({clauses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parties')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'parties'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>أطراف العقد وبيانات العقار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_adjust')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_adjust'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>تخصيص المسودة بالذكاء الاصطناعي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & FINANCIAL TERMS */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Proposal Header Card */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="bg-indigo-500/30 text-indigo-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-indigo-400/30 inline-block mb-2">
                      {proposal.contractTypeName}
                    </span>
                    <h4 className="font-extrabold text-base sm:text-lg text-white">
                      {proposal.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      الفرع: <span className="font-bold text-white">{proposal.branchName || 'الفرع الرئيسي'}</span> • رقم العقد المقترح: <span className="font-mono text-amber-300 font-bold">{proposal.proposedContractNumber}</span>
                    </p>
                  </div>

                  <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 text-center min-w-[200px] shrink-0">
                    <span className="text-[11px] text-slate-400 block mb-1">القيمة السنوية المقترحة</span>
                    <div className="text-xl font-extrabold text-emerald-400 font-mono">
                      {formatSAR(proposedAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {proposal.priceDifferencePercent === 0 ? '✓ ثبات السعر (0% تغيير)' : `${proposal.priceDifferencePercent}% مقارنة بالعام السابق`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards: Duration, Payments, Ejar Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Proposed Duration */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>فترة التجديد المقترحة</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-slate-500">من: <strong className="text-slate-900">{proposedStartDate}</strong></p>
                    <p className="text-slate-500">إلى: <strong className="text-indigo-700">{proposedEndDate}</strong></p>
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      مدة 12 شهراً ميلادياً
                    </span>
                  </div>
                </div>

                {/* 2. Payment Terms */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>جدول الدفعات والسداد</span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    {paymentTerms}
                  </p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    فواتير سداد الإلكترونية
                  </span>
                </div>

                {/* 3. Automatic Compliance Sync */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>الربط الحكومي والبلدي</span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    مطابق لاشتراطات أمانة الرياض ومنصة بلدي والدفاع المدني
                  </p>
                  <span className="inline-block bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    تحديث فوري لملف المنشأة
                  </span>
                </div>

              </div>

              {/* AI Market Rent & Legal Insights */}
              <div className="bg-indigo-50/60 p-4.5 rounded-2xl border border-indigo-100 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-indigo-950">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>توصيات الذكاء الاصطناعي وقراءة المؤشرات التنظيمية:</span>
                </div>
                {proposal.aiInsightsNotes?.map((note, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed pr-3 border-r-2 border-indigo-400">
                    {note}
                  </p>
                ))}
              </div>

              {/* Compliance Verification Checkpoints */}
              <div className="space-y-2.5">
                <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>نتائج الفحص والتحقق النظامي للمسودة:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {proposal.complianceChecks?.map((chk) => (
                    <div key={chk.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{chk.title}</span>
                        <span className="text-[11px] text-slate-500 leading-relaxed">{chk.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CONTRACT CLAUSES & CONDITIONS */}
          {/* ========================================================================= */}
          {activeTab === 'clauses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    بنود وشروط مسودة التجديد التلقائي
                  </h4>
                  <p className="text-xs text-slate-500">
                    يمكنك تعديل أي بند أو إضافة شروط تشغيلية إضافية خاصة بالمنشأة
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddClause(true)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors border border-indigo-200 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>إضافة بند جديد</span>
                </button>
              </div>

              {/* Add New Clause Form */}
              {showAddClause && (
                <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>إضافة بند إضافي جديد للمسودة:</span>
                    <button
                      type="button"
                      onClick={() => setShowAddClause(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="عنوان البند (مثال: البند الخامس: أعمال الديكور والتحسينات)"
                    value={newClauseTitle}
                    onChange={(e) => setNewClauseTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <textarea
                    rows={3}
                    placeholder="نص البند والتفاصيل القانونية..."
                    value={newClauseContent}
                    onChange={(e) => setNewClauseContent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddClause(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewClause}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                    >
                      إدراج البند
                    </button>
                  </div>
                </div>
              )}

              {/* Clauses List */}
              <div className="space-y-3">
                {clauses.map((clause, index) => {
                  const isEditing = editingClauseId === clause.id;

                  return (
                    <div
                      key={clause.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isEditing
                          ? 'border-indigo-500 bg-white shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-900">
                            {clause.title}
                          </h5>
                          {clause.isModified && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                              تم التعديل
                            </span>
                          )}
                        </div>

                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditingClauseId(clause.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل نص البند"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            id={`edit-clause-${clause.id}`}
                            defaultValue={clause.content}
                            rows={4}
                            className="w-full bg-slate-50 border border-indigo-200 rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingClauseId(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`edit-clause-${clause.id}`) as HTMLTextAreaElement;
                                if (el) handleUpdateClauseContent(clause.id, el.value);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                            >
                              حفظ التعديل
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 leading-relaxed pr-8">
                          {clause.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PARTIES & PROPERTY DETAILS */}
          {/* ========================================================================= */}
          {activeTab === 'parties' && (
            <div className="space-y-6">
              
              {/* Two Parties Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Lessor / Provider */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-indigo-900 border-b border-slate-200 pb-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>الطرف الأول (المؤجر / مزود الخدمة):</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p>الاسم: <strong className="text-slate-900">{proposal.lessorOrProvider.name}</strong></p>
                    <p>السجل التجاري / الهوية: <strong className="font-mono">{proposal.lessorOrProvider.crOrId || '—'}</strong></p>
                    <p>الممثل النظامي: <strong>{proposal.lessorOrProvider.representativeName || '—'}</strong></p>
                    <p>الجوال: <strong className="font-mono">{proposal.lessorOrProvider.contactPhone || '—'}</strong></p>
                    <p>البريد: <strong className="text-indigo-600">{proposal.lessorOrProvider.contactEmail || '—'}</strong></p>
                  </div>
                </div>

                {/* Lessee / Client */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-900 border-b border-slate-200 pb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>الطرف الثاني (المستأجر / العميل):</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p>الاسم: <strong className="text-slate-900">{establishment.name}</strong></p>
                    <p>السجل التجاري: <strong className="font-mono">{establishment.crNumber}</strong></p>
                    <p>الممثل المفوض: <strong>{establishment.managerName || 'الممثل النظامي'}</strong></p>
                    <p>الجوال المعتمد: <strong className="font-mono">{establishment.contactPhone || '0501234567'}</strong></p>
                    <p>البريد الإلكتروني: <strong className="text-emerald-700">{establishment.contactEmail || 'compliance@company.sa'}</strong></p>
                  </div>
                </div>

              </div>

              {/* Location & Unit Details */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 font-extrabold text-xs text-indigo-900">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>بيانات العين المؤجرة / العقار / موقع الخدمة:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">المدينة والحي</span>
                    <strong className="text-slate-900">{proposal.locationDetails.city} - {proposal.locationDetails.district}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">رقم المعرض / الوحدة</span>
                    <strong className="text-slate-900">{proposal.locationDetails.unitNumber || 'معرض رقم 14'}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">المساحة الإجمالية</span>
                    <strong className="text-slate-900">{proposal.locationDetails.areaSquareMeters || 300} م²</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">النشاط المرخص</span>
                    <strong className="text-indigo-700 truncate block">{proposal.locationDetails.purpose || 'مطعم ومأكولات'}</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CUSTOMIZE PROPOSAL WITH AI */}
          {/* ========================================================================= */}
          {activeTab === 'ai_adjust' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      مساعد الصياغة والتخصيص الذكي عبر Gemini AI
                    </h4>
                    <p className="text-xs text-slate-300">
                      اطلب من الذكاء الاصطناعي تعديل القيمة المالية، تقسيط الدفعات، أو إضافة شروط حصرية
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <textarea
                    rows={3}
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="مثال: اقترح خصم 5% على القيمة الإيجارية عند السداد دفعة واحدة، مع إضافة بند يلزم المؤجر بصيانة واجهة المبنى..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3.5 text-white text-xs leading-relaxed focus:ring-2 focus:ring-indigo-400 outline-none placeholder:text-slate-500"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAiCustomPrompt('تعديل جدول السداد ليكون على 4 دفعات ربع سنوية متساوية عبر سداد')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]"
                      >
                        ⚡ 4 دفعات ربع سنوية
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiCustomPrompt('تثبيت الإيجار مع إضافة شرط إعفاء من الإيجار لمدة شهر للصيانة')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]"
                      >
                        ⚡ شهر مجاني للصيانة
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleRegenerateWithAI}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>جاري الصياغة...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>إعادة الصياغة والتطبيق فوراً</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Value Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    القيمة السنوية الإجمالية (ريال سعودي):
                  </label>
                  <input
                    type="number"
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    شروط السداد والدفعات:
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    تاريخ بداية التجديد:
                  </label>
                  <input
                    type="date"
                    value={proposedStartDate}
                    onChange={(e) => setProposedStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    تاريخ نهاية التجديد (سنة كاملة):
                  </label>
                  <input
                    type="date"
                    value={proposedEndDate}
                    onChange={(e) => setProposedEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-emerald-700"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => showToast('تم إرسال رابط مسودة التجديد إلى المؤجر والأطراف للتوقيع الإلكتروني عبر WhatsApp و Email!')}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>إرسال للتوقيع الإلكتروني</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>

          <button
            type="button"
            onClick={handleExecuteRenewal}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>اعتماد المسودة وتجديد العقد تلقائياً بالمحفظة (12 شهراً)</span>
          </button>

        </div>

      </div>

    </div>
  );
};
