import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Printer, 
  Download, 
  Copy, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  QrCode, 
  Check, 
  X, 
  Maximize2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Send,
  Zap,
  Info
} from 'lucide-react';
import { 
  Establishment, 
  LegalDocument, 
  LegalClause, 
  LegalContractTemplate, 
  LegalDocumentCategory,
  AILegalAudit,
  Branch
} from '../types';
import { 
  LEGAL_TEMPLATES_CATALOG, 
  SAUDI_LEGAL_FRAMEWORKS, 
  SAUDI_STANDARD_CLAUSES_PRESETS 
} from '../data/legalDocumentsData';
import { DigitalSignatureModal, SignatureResult } from './DigitalSignatureModal';

interface AILegalContractEditorProps {
  establishment: Establishment;
  branches: Branch[];
  initialDocument?: LegalDocument | null;
  initialTemplate?: LegalContractTemplate | null;
  onSaveDocument: (doc: LegalDocument) => void;
  onBackToLibrary: () => void;
  showToast?: (msg: string) => void;
}

export const AILegalContractEditor: React.FC<AILegalContractEditorProps> = ({
  establishment,
  branches,
  initialDocument,
  initialTemplate,
  onSaveDocument,
  onBackToLibrary,
  showToast = (_msg?: string) => {},
}) => {
  // Mode selection: 'wizard' | 'editor' | 'preview'
  const [activeView, setActiveView] = useState<'editor' | 'wizard' | 'preview'>(
    initialDocument ? 'editor' : initialTemplate ? 'wizard' : 'wizard'
  );

  // Selected template in wizard
  const [selectedTemplate, setSelectedTemplate] = useState<LegalContractTemplate | null>(
    initialTemplate || LEGAL_TEMPLATES_CATALOG[0]
  );

  // Form Fields for AI Generation Wizard
  const [wizardFields, setWizardFields] = useState<Record<string, string>>({
    secondPartyName: 'شركة التميز للخدمات التجارية ذ.م.م',
    secondPartyId: '1010998877',
    secondPartyRep: 'خالد بن ناصر العتيبي',
    secondPartyRole: 'الطرف الثاني (المتعاقد)',
    customDirectives: 'صياغة متكاملة وفق أحدث أحكام نظام المعاملات المدنية، مع تشديد شروط حماية حقوق الملكية الفكرية وسرية المعلومات.',
    governingTone: 'protective', // 'protective' | 'balanced' | 'flexible'
  });

  // Current Working Document State
  const [documentState, setDocumentState] = useState<LegalDocument>(() => {
    if (initialDocument) {
      return JSON.parse(JSON.stringify(initialDocument));
    }
    const tpl = initialTemplate || LEGAL_TEMPLATES_CATALOG[0];
    return {
      id: `leg-doc-${Date.now()}`,
      establishmentId: establishment.id,
      branchId: branches[0]?.id,
      branchName: branches[0]?.name || 'الفرع الرئيسي',
      title: tpl.title,
      documentRefNumber: `SAB-LEG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: tpl.category,
      categoryLabel: tpl.categoryLabel,
      version: '1.0',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      firstParty: {
        role: 'الطرف الأول (صاحب العمل / المنشأة)',
        name: establishment.name,
        crOrId: establishment.crNumber,
        repName: establishment.contactPerson || 'المدير العام المفوض',
        repTitle: 'الممثل النظامي',
        nationalAddress: `${establishment.city} - المملكة العربية السعودية`,
        email: establishment.contactEmail || 'legal@company.sa',
        phone: establishment.contactPhone || '0500000000',
      },
      secondParty: {
        role: 'الطرف الثاني',
        name: 'الطرف المتعاقد الثاني',
        crOrId: '10XXXXXXXX',
        repName: 'الممثل النظامي',
        repTitle: 'المدير المفوض',
        nationalAddress: 'الرياض - المملكة العربية السعودية',
        email: 'party2@example.sa',
        phone: '05XXXXXXXX',
      },
      description: tpl.description,
      applicableLaws: tpl.applicableSaudiLaws,
      clauses: JSON.parse(JSON.stringify(tpl.sampleClauses)),
      aiAudit: {
        overallScore: 94,
        status: 'compliant',
        summary: 'المسودة الأولية متوافقة مع القوالب المعتمدة في المملكة العربية السعودية.',
        strengths: ['استيفاء الديباجة والشروط الشكلية', 'توافق البنود مع الأنظمة المنظمة للنشاط'],
        risks: [],
        recommendedClauses: ['إضافة شرط التحكيم التجاري عبر SCCA بالرياض'],
        saudiComplianceChecklist: [
          { lawName: 'نظام المعاملات المدنية السعودي', isCompliant: true, notes: 'مطابق' },
          { lawName: 'نظام العمل / الشركات', isCompliant: true, notes: 'متوافق' }
        ]
      },
      signatures: [
        {
          partyName: establishment.name,
          signerTitle: establishment.contactPerson || 'المدير العام',
          isSigned: false,
        },
        {
          partyName: 'الطرف الثاني',
          signerTitle: 'المفوض بالتوقيع',
          isSigned: false,
        }
      ],
      tags: ['عقد ذكي', 'مسودة سبّاق', 'سعودي'],
      language: 'ar',
      qrVerificationCode: `SAB-VERIFY-${Math.floor(100000 + Math.random() * 900000)}`,
      confidentialityLevel: 'internal',
    };
  });

  // AI Generation & Refinement states
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isAuditingAI, setIsAuditingAI] = useState<boolean>(false);
  const [refiningClauseId, setRefiningClauseId] = useState<string | null>(null);
  const [clauseRefinementPrompt, setClauseRefinementPrompt] = useState<string>('');
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedLawFilter, setSelectedLawFilter] = useState<string>('all');
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signerNameInput, setSignerNameInput] = useState<string>(establishment.contactPerson || 'عبدالعزيز السبيعي');

  // Trigger Full AI Drafting
  const handleGenerateWithAI = async () => {
    if (!selectedTemplate) return;
    setIsGeneratingAI(true);
    showToast('جاري استدعاء نموذج الذكاء الاصطناعي وصياغة العقد بالأنظمة السعودية...');

    try {
      const response = await fetch('/api/gemini/draft-legal-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          category: selectedTemplate.category,
          promptTitle: selectedTemplate.title,
          userRequirements: wizardFields.customDirectives,
          formFields: wizardFields,
          establishment,
          parties: {
            firstParty: documentState.firstParty,
            secondParty: {
              name: wizardFields.secondPartyName || 'الطرف الثاني',
              crOrId: wizardFields.secondPartyId,
              repName: wizardFields.secondPartyRep,
              role: wizardFields.secondPartyRole || 'الطرف الثاني'
            }
          },
          tone: wizardFields.governingTone,
          governingLaws: selectedTemplate.applicableSaudiLaws
        })
      });

      const data = await response.json();
      if (data.success && data.document) {
        const generated = data.document;
        setDocumentState(prev => ({
          ...prev,
          title: generated.title || prev.title,
          documentRefNumber: generated.documentRefNumber || prev.documentRefNumber,
          category: (generated.category as LegalDocumentCategory) || prev.category,
          categoryLabel: generated.categoryLabel || prev.categoryLabel,
          description: generated.description || prev.description,
          applicableLaws: generated.applicableLaws || prev.applicableLaws,
          clauses: generated.clauses && generated.clauses.length > 0 ? generated.clauses : prev.clauses,
          aiAudit: generated.aiAudit || prev.aiAudit,
          tags: generated.tags || prev.tags,
          updatedAt: new Date().toISOString().split('T')[0]
        }));
        showToast('تمت صياغة الوثيقة القانونية ومطابقتها للأنظمة السعودية بنجاح!');
        setActiveView('editor');
      } else {
        showToast('تم إنشاء مسودة محسنة بالاعتماد على القالب القانوني.');
        setActiveView('editor');
      }
    } catch (error) {
      console.error('AI Drafting Error:', error);
      showToast('تعذر الاتصال بالذكاء الاصطناعي، تم استخدام القالب المعياري.');
      setActiveView('editor');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Run Deep AI Legal Audit
  const handleRunLegalAudit = async () => {
    setIsAuditingAI(true);
    showToast('جاري تدقيق البنود ورصد المخاطر القانونية بالذكاء الاصطناعي...');

    try {
      const response = await fetch('/api/gemini/audit-legal-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: documentState.title,
          documentCategory: documentState.categoryLabel,
          clauses: documentState.clauses,
          establishment
        })
      });

      const data = await response.json();
      if (data.success && data.audit) {
        setDocumentState(prev => ({
          ...prev,
          aiAudit: data.audit
        }));
        showToast(`اكتمل التدقيق بنجاح! نسبة الامتثال: ${data.audit.overallScore}%`);
      }
    } catch (error) {
      console.error('Audit Error:', error);
      showToast('تعذر إكمال التدقيق الآلي.');
    } finally {
      setIsAuditingAI(false);
    }
  };

  // Refine single clause with AI
  const handleRefineClauseAI = async (clause: LegalClause, customInstruction?: string) => {
    setRefiningClauseId(clause.id);
    const instructionText = customInstruction || clauseRefinementPrompt || 'إعادة صياغة البند ليكون أكثر حماية وتقليلاً للمسؤولية التعاقدية في إطار الأنظمة السعودية';

    try {
      const response = await fetch('/api/gemini/refine-legal-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: clause.title,
          currentContent: clause.content,
          instruction: instructionText,
          context: documentState.title,
          objective: 'حماية حقوق المنشأة والامتثال للنظام السعودي'
        })
      });

      const data = await response.json();
      if (data.success && data.clause) {
        setDocumentState(prev => ({
          ...prev,
          clauses: prev.clauses.map(c => 
            c.id === clause.id 
              ? { 
                  ...c, 
                  title: data.clause.title || c.title,
                  content: data.clause.content || c.content,
                  standardLawRef: data.clause.saudiLawRef || c.standardLawRef,
                  explanation: data.clause.explanation || c.explanation,
                  isModified: true 
                } 
              : c
          )
        }));
        showToast('تمت إعادة صياغة البند وتحديث مرجعيته النظامية!');
        setRefiningClauseId(null);
        setClauseRefinementPrompt('');
      }
    } catch (error) {
      console.error('Clause Refinement Error:', error);
      showToast('تعذر تحسين البند.');
      setRefiningClauseId(null);
    }
  };

  // Add a standard clause preset
  const handleAddPresetClause = (preset: typeof SAUDI_STANDARD_CLAUSES_PRESETS[0]) => {
    const newClause: LegalClause = {
      id: `cl-${Date.now()}`,
      number: documentState.clauses.length + 1,
      title: preset.title,
      content: preset.content,
      tag: preset.tag,
      isMandatory: false,
      standardLawRef: preset.lawRef,
      riskLevel: 'safe'
    };

    setDocumentState(prev => ({
      ...prev,
      clauses: [...prev.clauses, newClause]
    }));
    showToast(`تمت إضافة بند: ${preset.title}`);
  };

  // Add custom blank clause
  const handleAddBlankClause = () => {
    const newClause: LegalClause = {
      id: `cl-${Date.now()}`,
      number: documentState.clauses.length + 1,
      title: `البند رقم (${documentState.clauses.length + 1})`,
      content: 'نص البند القانوني الجديد...',
      tag: 'مخصص',
      isMandatory: false,
      riskLevel: 'safe'
    };

    setDocumentState(prev => ({
      ...prev,
      clauses: [...prev.clauses, newClause]
    }));
    setEditingClauseId(newClause.id);
  };

  // Delete a clause
  const handleDeleteClause = (clauseId: string) => {
    setDocumentState(prev => {
      const filtered = prev.clauses.filter(c => c.id !== clauseId);
      // Renumber
      const renumbered = filtered.map((c, idx) => ({ ...c, number: idx + 1 }));
      return { ...prev, clauses: renumbered };
    });
    showToast('تم حذف البند وإعادة ترقيم الوثيقة.');
  };

  // Update clause field
  const handleUpdateClause = (clauseId: string, updates: Partial<LegalClause>) => {
    setDocumentState(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === clauseId ? { ...c, ...updates, isModified: true } : c)
    }));
  };

  // Move clause up / down
  const handleMoveClause = (index: number, direction: 'up' | 'down') => {
    const newClauses = [...documentState.clauses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newClauses.length) return;

    const temp = newClauses[index];
    newClauses[index] = newClauses[targetIndex];
    newClauses[targetIndex] = temp;

    // Renumber
    const renumbered = newClauses.map((c, idx) => ({ ...c, number: idx + 1 }));
    setDocumentState(prev => ({ ...prev, clauses: renumbered }));
  };

  // Save to library
  const handleSaveToLibrary = () => {
    const docToSave: LegalDocument = {
      ...documentState,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSaveDocument(docToSave);
    showToast('تم حفظ الوثيقة بنجاح في مكتبة الوثائق القانونية للشركة!');
  };

  // Copy full document text
  const handleCopyFullText = () => {
    const textLines = [
      documentState.title,
      `رقم المرجع: ${documentState.documentRefNumber}`,
      `التاريخ: ${documentState.effectiveDate || documentState.createdAt}`,
      '----------------------------------------',
      `الطرف الأول: ${documentState.firstParty.name} (سجل: ${documentState.firstParty.crOrId || '—'})`,
      `الطرف الثاني: ${documentState.secondParty?.name || '—'} (سجل/هوية: ${documentState.secondParty?.crOrId || '—'})`,
      '----------------------------------------',
      'الديباجة والبنود:',
      ...documentState.clauses.map(c => `\nالمادة (${c.number}): ${c.title}\n${c.content}\n${c.standardLawRef ? `(السند النظامي: ${c.standardLawRef})` : ''}`),
      '----------------------------------------',
      'توقيع الأطراف:',
      `توقيع الطرف الأول: ${documentState.firstParty.name}`,
      `توقيع الطرف الثاني: ${documentState.secondParty?.name || 'الطرف الثاني'}`
    ].join('\n');

    navigator.clipboard.writeText(textLines);
    setIsCopied(true);
    showToast('تم نسخ النص الكامل للعقد إلى الحافظة.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handle Electronic Signing
  const handleApplySignatureResult = (result: SignatureResult) => {
    setDocumentState(prev => ({
      ...prev,
      status: 'signed_active',
      signatures: prev.signatures.map((sig, idx) => 
        idx === 0 
          ? {
              ...sig,
              isSigned: true,
              signedDate: result.signedAt.split('T')[0],
              signerTitle: `${result.signerName} (${result.signerTitle})`,
              verificationCode: result.verificationCode,
              signatureDataUrl: result.signatureDataUrl
            }
          : sig
      )
    }));
    setIsSignModalOpen(false);
    showToast(`تم توثيق واعتماد التوقيع الرقمي بنجاح بالرمز: ${result.verificationCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation and Control Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 text-white flex items-center justify-center shadow-md shadow-indigo-900/20 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">محرر وصائغ العقود بالذكاء الاصطناعي</h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                نظام المعاملات والعمل السعودي
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              صياغة، تدقيق، وتخصيص اللوائح والعقود والاتفاقيات بالاعتماد على التشريعات والأنظمة السعودية المعتمدة
            </p>
          </div>
        </div>

        {/* View Switcher and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveView('wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'wizard'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              المولد الذكي
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'editor'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              محرر البنود ({documentState.clauses.length})
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'preview'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              المعاينة والطباعة
            </button>
          </div>

          <button
            onClick={handleSaveToLibrary}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            حفظ في المكتبة
          </button>

          <button
            onClick={onBackToLibrary}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            العودة للمكتبة
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: AI GENERATION WIZARD (المولد الذكي) */}
      {/* ========================================================================= */}
      {activeView === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Column: Template Picker & AI Parameters */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Select Template */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="text-base font-bold text-slate-900">اختر القالب أو النموذج القانوني الأساسي</h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">({LEGAL_TEMPLATES_CATALOG.length} نماذج معتمدة)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {LEGAL_TEMPLATES_CATALOG.map(tpl => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setDocumentState(prev => ({
                          ...prev,
                          title: tpl.title,
                          category: tpl.category,
                          categoryLabel: tpl.categoryLabel,
                          description: tpl.description,
                          applicableLaws: tpl.applicableSaudiLaws,
                          clauses: JSON.parse(JSON.stringify(tpl.sampleClauses))
                        }));
                      }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-right flex flex-col justify-between ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-600/10'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {tpl.categoryLabel}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">{tpl.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{tpl.defaultClausesCount} مادة نظامية</span>
                        <span className="text-indigo-700 font-semibold">{tpl.popularFor.substring(0, 30)}...</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Parameters & Second Party Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-bold text-slate-900">تخصيص أطراف العقد والمتطلبات التشريعية</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطرف الثاني (الموظف / الشريك / المورد)</label>
                  <input
                    type="text"
                    value={wizardFields.secondPartyName}
                    onChange={e => setWizardFields({ ...wizardFields, secondPartyName: e.target.value })}
                    placeholder="مثال: خالد بن ناصر العتيبي"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهوية الوطنية / السجل التجاري للطرف الثاني</label>
                  <input
                    type="text"
                    value={wizardFields.secondPartyId}
                    onChange={e => setWizardFields({ ...wizardFields, secondPartyId: e.target.value })}
                    placeholder="10XXXXXXXX"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">صفة الطرف الثاني في العقد</label>
                  <input
                    type="text"
                    value={wizardFields.secondPartyRole}
                    onChange={e => setWizardFields({ ...wizardFields, secondPartyRole: e.target.value })}
                    placeholder="مثال: الطرف الثاني (الموظف) أو (المورد المعتمد)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">أسلوب الصياغة والحماية القانونية</label>
                  <select
                    value={wizardFields.governingTone}
                    onChange={e => setWizardFields({ ...wizardFields, governingTone: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-semibold text-slate-800"
                  >
                    <option value="protective">حماية مشددة للمنشأة (شروط وقائية وصارمة)</option>
                    <option value="balanced">صياغة متوازنة (المعايير القياسية للطرفين)</option>
                    <option value="flexible">صياغة ميسرة ومرنة (شراكات وتعاون أولي)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Suggested Fields per template */}
              {selectedTemplate?.suggestedFields && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    المحددات المالية والزمنية للقالب ({selectedTemplate.title})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {selectedTemplate.suggestedFields.map(field => (
                      <div key={field.key}>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                          type="text"
                          defaultValue={field.defaultValue || ''}
                          placeholder={field.placeholder}
                          onChange={e => setWizardFields({ ...wizardFields, [field.key]: e.target.value })}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directives for Gemini AI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>توجيهات إضافية وملاحظات خاصة لصياغة الذكاء الاصطناعي</span>
                  <span className="text-[10px] text-slate-400 font-normal">اختياري - Gemini 3.7 Flash</span>
                </label>
                <textarea
                  rows={3}
                  value={wizardFields.customDirectives}
                  onChange={e => setWizardFields({ ...wizardFields, customDirectives: e.target.value })}
                  placeholder="مثال: النص على حظر المنافسة لمدة سنتين في الرياض، وتحديد غرامة تأخير 2% لكل أسبوع، وإحالة النزاع للتحكيم التجاري."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none leading-relaxed"
                />
              </div>

              {/* Generate Action Button */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveView('editor')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  تخطي والتعديل اليدوي على القالب
                </button>

                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleGenerateWithAI}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 hover:from-indigo-800 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري الصياغة بالذكاء الاصطناعي...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      توليد وصياغة الوثيقة القانونية بالذكاء الاصطناعي
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Saudi Legal Frameworks Reference Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold">المرجعيات التشريعية المعتمدة</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يتم ربط كل بند تعاقدي بالمواد والأحكام الصادرة في الأنظمة واللوائح السعودية الحديثة لحماية المنشأة من البطلان والنزاعات القضائية.
              </p>
            </div>

            <div className="space-y-2.5">
              {SAUDI_LEGAL_FRAMEWORKS.map(law => (
                <div key={law.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{law.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${law.badgeColor}`}>
                      معتمد
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{law.authority}</p>
                  <div className="flex flex-wrap gap-1">
                    {law.keyArticles.slice(0, 3).map((art, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: VISUAL CLAUSE EDITOR & AI LEGAL AUDITOR (محرر البنود) */}
      {/* ========================================================================= */}
      {activeView === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Clauses List (Col 8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Document Header Card in Editor */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {documentState.categoryLabel}
                </span>
                <input
                  type="text"
                  value={documentState.title}
                  onChange={e => setDocumentState({ ...documentState, title: e.target.value })}
                  className="text-base font-bold text-slate-900 block mt-1 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 outline-none w-full"
                />
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>المرجع: {documentState.documentRefNumber}</span>
                  <span>•</span>
                  <span>الإصدار: v{documentState.version}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{documentState.clauses.length} بنود قانونية</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddBlankClause}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة مادة
                </button>
                <button
                  onClick={handleRunLegalAudit}
                  disabled={isAuditingAI}
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {isAuditingAI ? 'جاري الفحص...' : 'تدقيق الامتثال بالذكاء الاصطناعي'}
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="space-y-3.5">
              {documentState.clauses.map((clause, idx) => {
                const isEditing = editingClauseId === clause.id;
                const isRefining = refiningClauseId === clause.id;

                return (
                  <div 
                    key={clause.id} 
                    className={`bg-white rounded-2xl border transition-all ${
                      isEditing ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Clause Header Bar */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center">
                          {clause.number}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={clause.title}
                            onChange={e => handleUpdateClause(clause.id, { title: e.target.value })}
                            className="text-xs font-bold text-slate-900 bg-white border border-slate-300 px-2 py-1 rounded-md outline-none focus:ring-1 focus:ring-indigo-500 w-64 md:w-80"
                          />
                        ) : (
                          <h4 className="text-xs font-bold text-slate-900">{clause.title}</h4>
                        )}

                        {clause.standardLawRef && (
                          <span className="hidden sm:inline-block text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                            {clause.standardLawRef}
                          </span>
                        )}

                        {clause.isModified && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                            مُعدّل
                          </span>
                        )}
                      </div>

                      {/* Reorder and Action Tools */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveClause(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                          title="تحريك لأعلى"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveClause(idx, 'down')}
                          disabled={idx === documentState.clauses.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                          title="تحريك لأسفل"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingClauseId(isEditing ? null : clause.id)}
                          className={`p-1.5 rounded transition-colors ${
                            isEditing ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title={isEditing ? 'حفظ التعديل' : 'تعديل النص'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteClause(clause.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="حذف البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Clause Content Body */}
                    <div className="p-4 space-y-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={4}
                            value={clause.content}
                            onChange={e => handleUpdateClause(clause.id, { content: e.target.value })}
                            className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={clause.standardLawRef || ''}
                              onChange={e => handleUpdateClause(clause.id, { standardLawRef: e.target.value })}
                              placeholder="السند النظامي (مثال: المادة 83 من نظام العمل)"
                              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex-1 outline-none"
                            />
                            <button
                              onClick={() => setEditingClauseId(null)}
                              className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg"
                            >
                              تم
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                          {clause.content}
                        </p>
                      )}

                      {/* Explanation / Law reference footer */}
                      {clause.explanation && (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                          <span>{clause.explanation}</span>
                        </div>
                      )}

                      {/* AI Quick Refine Toolbar for this Clause */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold">تحسين البند بالذكاء الاصطناعي:</span>
                          <button
                            onClick={() => handleRefineClauseAI(clause, 'إعادة صياغة البند لتشديد الحماية القانونية وتقليل مسؤولية المنشأة')}
                            disabled={isRefining}
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded transition-colors"
                          >
                            ⚡ تعزيز الحماية
                          </button>
                          <button
                            onClick={() => handleRefineClauseAI(clause, 'إعادة صياغة البند بلغة تصالحية متوازنة مع الحفاظ على الحقوق')}
                            disabled={isRefining}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded transition-colors"
                          >
                            ⚖️ صياغة متوازنة
                          </button>
                          <button
                            onClick={() => handleRefineClauseAI(clause, 'إضافة شروط جزائية واضحة للتعويض عن الإخلال وفق نظام المعاملات المدنية')}
                            disabled={isRefining}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded transition-colors"
                          >
                            🛡️ إضافة شرط جزائي
                          </button>
                        </div>

                        {isRefining && (
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            جاري المعالجة...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Presets Quick Insert Drawer */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  إدراج بنود نظامية قياسية جاهزة (Saudi Standard Clauses)
                </h4>
                <span className="text-[11px] text-slate-500">انقر للإضافة الفورية للمسودة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {SAUDI_STANDARD_CLAUSES_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all text-right flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {preset.tag}
                        </span>
                        <span className="text-[10px] text-slate-400">{preset.lawRef}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mb-1">{preset.title}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{preset.content}</p>
                    </div>
                    <button
                      onClick={() => handleAddPresetClause(preset)}
                      className="mt-2.5 w-full py-1 text-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      إدراج في العقد
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Legal Audit & Parties (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI Legal Audit Score Card */}
            {documentState.aiAudit && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">تقرير التدقيق القانوني الذكي</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-black border border-emerald-200">
                    <span>{documentState.aiAudit.overallScore}%</span>
                    <span className="text-[10px] font-medium">امتثال</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {documentState.aiAudit.summary}
                </p>

                {/* Strengths */}
                {documentState.aiAudit.strengths.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      نقاط القوة والحماية المحققة:
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-600 pr-4 list-disc">
                      {documentState.aiAudit.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detected Risks / Alerts */}
                {documentState.aiAudit.risks && documentState.aiAudit.risks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      ملاحظات وثغرات تحتاج معالجة:
                    </h4>
                    <div className="space-y-2">
                      {documentState.aiAudit.risks.map((r, i) => (
                        <div key={i} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] space-y-1">
                          <div className="font-bold text-amber-900">{r.clauseTitle}</div>
                          <div className="text-slate-700">{r.issue}</div>
                          <div className="text-indigo-800 font-semibold">💡 التوصية: {r.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Saudi Laws Checklist */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-800 mb-2">مطابقة الأنظمة السعودية:</h4>
                  <div className="space-y-1.5">
                    {documentState.aiAudit.saudiComplianceChecklist.map((chk, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-800 font-medium">{chk.lawName}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {chk.notes || 'مطابق'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRunLegalAudit}
                  disabled={isAuditingAI}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditingAI ? 'animate-spin' : ''}`} />
                  إعادة فحص الامتثال
                </button>
              </div>
            )}

            {/* Parties Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900">أطراف الوثيقة القانونية</h3>
              
              {/* Party 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-[10px] font-bold text-indigo-700">{documentState.firstParty.role}</div>
                <div className="font-bold text-slate-900">{documentState.firstParty.name}</div>
                <div className="text-slate-500 text-[11px]">سجل تجاري: {documentState.firstParty.crOrId || '—'}</div>
                <div className="text-slate-500 text-[11px]">الممثل: {documentState.firstParty.repName} ({documentState.firstParty.repTitle})</div>
              </div>

              {/* Party 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-[10px] font-bold text-blue-700">{documentState.secondParty?.role || 'الطرف الثاني'}</div>
                <div className="font-bold text-slate-900">{documentState.secondParty?.name || '—'}</div>
                <div className="text-slate-500 text-[11px]">الهوية / السجل: {documentState.secondParty?.crOrId || '—'}</div>
                <div className="text-slate-500 text-[11px]">الممثل: {documentState.secondParty?.repName || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: OFFICIAL PREVIEW & PRINT FORM (المعاينة والطباعة الرسمية) */}
      {/* ========================================================================= */}
      {activeView === 'preview' && (
        <div className="space-y-6">
          {/* Action Toolbar above formal paper */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-md">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md">
                {documentState.status === 'signed_active' ? 'موقع وساري المفعول' : 'مسودة معتمدة'}
              </span>
              <span className="text-xs text-slate-300 font-medium">المرجع: {documentState.documentRefNumber}</span>
              <span className="text-xs text-slate-400">• كود التحقق: {documentState.qrVerificationCode}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFullText}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'تم النسخ' : 'نسخ النص'}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة رسمية / PDF
              </button>

              <button
                onClick={() => setIsSignModalOpen(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {documentState.status === 'signed_active' ? 'إعادة التوقيع والختم' : 'التوقيع والاعتماد الإلكتروني'}
              </button>
            </div>
          </div>

          {/* Formal Saudi Document Paper (A4 Style) */}
          <div className="bg-white rounded-3xl p-8 md:p-14 border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-8 text-slate-900 font-['Cairo'] print:p-0 print:border-none print:shadow-none">
            {/* Document Header with Logos & QR */}
            <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-6">
              <div>
                <div className="text-lg font-black text-slate-900">{establishment.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">سجل تجاري: {establishment.crNumber} | الرقم الموحد: {establishment.unifiedNumber || '7001984729'}</div>
                <div className="text-xs text-slate-600">{establishment.city} - المملكة العربية السعودية</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 p-1 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">{documentState.qrVerificationCode}</span>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="text-center space-y-2 py-3 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-xl font-black text-slate-900">{documentState.title}</h2>
              <div className="text-xs text-slate-600 font-semibold flex items-center justify-center gap-4">
                <span>رقم المرجع: {documentState.documentRefNumber}</span>
                <span>تاريخ التحرير: {documentState.effectiveDate || documentState.createdAt}م</span>
                <span>الإصدار: {documentState.version}</span>
              </div>
            </div>

            {/* Parties Preamble (الديباجة) */}
            <div className="space-y-4 text-xs leading-relaxed text-justify bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80">
              <p className="font-bold text-slate-900">
                بعون الله وتوفيقه، تم الاتفاق والتعاقد في يوم {new Date().toLocaleDateString('ar-SA')}م بين كل من:
              </p>
              
              <div className="space-y-2 pr-4 border-r-2 border-indigo-600">
                <p>
                  <strong className="text-slate-900">1. الطرف الأول: </strong>
                  {documentState.firstParty.name}، سجل تجاري رقم ({documentState.firstParty.crOrId})، وعنوانها الوطني: {documentState.firstParty.nationalAddress}، ويمثلها في التوقيع: {documentState.firstParty.repName} بصفته ({documentState.firstParty.repTitle}).
                </p>
                <p>
                  <strong className="text-slate-900">2. الطرف الثاني: </strong>
                  {documentState.secondParty?.name || 'الطرف المتعاقد الثاني'}، رقم الهوية/السجل: ({documentState.secondParty?.crOrId || '—'})، وعنوانه: {documentState.secondParty?.nationalAddress || 'المملكة العربية السعودية'}، ويمثله: {documentState.secondParty?.repName || 'المفوض بالتوقيع'}.
                </p>
              </div>

              <p className="text-slate-700 italic pt-2">
                "وحيث تلاقت إرادة الطرفين بكامل الأهلية المعتبرة شرعاً ونظاماً، فقد اتفقا على البنود والشروط النظامية الآتية:"
              </p>
            </div>

            {/* Document Clauses Section */}
            <div className="space-y-6 pt-2">
              {documentState.clauses.map(clause => (
                <div key={clause.id} className="space-y-1.5 text-xs text-justify">
                  <h3 className="font-black text-slate-900 flex items-center justify-between">
                    <span>المادة ({clause.number}): {clause.title}</span>
                    {clause.standardLawRef && (
                      <span className="text-[10px] font-normal text-slate-500">[{clause.standardLawRef}]</span>
                    )}
                  </h3>
                  <p className="text-slate-800 leading-relaxed pr-3 border-r-2 border-slate-200 whitespace-pre-wrap">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Applicable Law and Jurisdiction Notice */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 text-center space-y-1">
              <div className="font-bold text-slate-900">القانون الواجب التطبيق والاختصاص القضائي</div>
              <p>يخضع هذا العقد ويفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، وحُرر من نسختين أصليتين بيد كل طرف نسخة للعمل بموجبها.</p>
            </div>

            {/* Signatures & Seals Block */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
              {/* First Party Signature */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-900">توقيع وختم الطرف الأول</div>
                <div className="text-slate-600">{documentState.firstParty.name}</div>
                <div className="h-16 flex items-center justify-center">
                  {documentState.signatures[0]?.isSigned ? (
                    <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-black shadow-xs flex items-center gap-2 rotate-[-3deg]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>معتمد وموقع إلكترونياً</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">بانتظار التوقيع</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  المفوض: {documentState.firstParty.repName}
                </div>
              </div>

              {/* Second Party Signature */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-900">توقيع الطرف الثاني</div>
                <div className="text-slate-600">{documentState.secondParty?.name || 'الطرف الثاني'}</div>
                <div className="h-16 flex items-center justify-center">
                  {documentState.signatures[1]?.isSigned ? (
                    <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-black shadow-xs flex items-center gap-2 rotate-[2deg]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>موقع ومعتمد</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">بانتظار التوقيع</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  المفوض: {documentState.secondParty?.repName || 'الممثل النظامي'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Suite Modal */}
      {isSignModalOpen && (
        <DigitalSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          documentTitle={documentState.title}
          documentTypeLabel="عقد ولوائح قانونية"
          establishment={establishment}
          onSignComplete={handleApplySignatureResult}
          showToast={showToast}
        />
      )}
    </div>
  );
};
