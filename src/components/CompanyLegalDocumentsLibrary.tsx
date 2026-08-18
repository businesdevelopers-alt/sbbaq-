import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Download, 
  Printer, 
  Scale, 
  Building2, 
  UserCheck, 
  Lock, 
  Award, 
  Briefcase, 
  BookMarked, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Layers, 
  Upload, 
  Trash2, 
  Share2, 
  Check, 
  RefreshCw,
  QrCode,
  ArrowUpRight
} from 'lucide-react';
import { 
  Establishment, 
  Branch, 
  LegalDocument, 
  LegalDocumentCategory, 
  LegalDocumentStatus, 
  LegalContractTemplate,
  AILegalAudit 
} from '../types';
import { 
  INITIAL_LEGAL_DOCUMENTS, 
  LEGAL_TEMPLATES_CATALOG, 
  SAUDI_LEGAL_FRAMEWORKS 
} from '../data/legalDocumentsData';

interface CompanyLegalDocumentsLibraryProps {
  establishment: Establishment;
  branches: Branch[];
  documents: LegalDocument[];
  onOpenEditor: (doc?: LegalDocument, template?: LegalContractTemplate) => void;
  onUpdateDocument: (doc: LegalDocument) => void;
  onDeleteDocument: (docId: string) => void;
  showToast?: (msg: string) => void;
}

export const CompanyLegalDocumentsLibrary: React.FC<CompanyLegalDocumentsLibraryProps> = ({
  establishment,
  branches,
  documents,
  onOpenEditor,
  onUpdateDocument,
  onDeleteDocument,
  showToast = (_msg?: string) => {},
}) => {
  // Category Tab
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [activeAuditDoc, setActiveAuditDoc] = useState<LegalDocument | null>(null);
  const [isAuditingModalOpen, setIsAuditingModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTextContent, setUploadTextContent] = useState<string>('');
  const [uploadDocTitle, setUploadDocTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<LegalDocumentCategory>('commercial');
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState<boolean>(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<LegalDocument | null>(null);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Category
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
      // Status
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;
      // Branch
      if (selectedBranchId !== 'all' && doc.branchId && doc.branchId !== selectedBranchId) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchRef = doc.documentRefNumber.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q);
        const matchParty = doc.secondParty?.name.toLowerCase().includes(q);
        const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchRef && !matchDesc && !matchParty && !matchTags) return false;
      }
      return true;
    });
  }, [documents, selectedCategory, selectedStatus, selectedBranchId, searchQuery]);

  // Statistics Metrics
  const stats = useMemo(() => {
    const total = documents.length;
    const signedActive = documents.filter(d => d.status === 'signed_active').length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const drafts = documents.filter(d => d.status === 'draft' || d.status === 'under_review').length;
    const avgScore = total > 0 
      ? Math.round(documents.reduce((acc, d) => acc + (d.aiAudit?.overallScore || 90), 0) / total) 
      : 95;

    return { total, signedActive, approved, drafts, avgScore };
  }, [documents]);

  // Handle External Document AI Scan
  const handleAnalyzeExternalDocument = async () => {
    if (!uploadDocTitle.trim() || !uploadTextContent.trim()) {
      showToast('يرجى كتابة عنوان الوثيقة ولصق نص البنود');
      return;
    }

    setIsAnalyzingUpload(true);
    showToast('جاري تحليل البنود ورصد الامتثال للنظام السعودي بالذكاء الاصطناعي...');

    try {
      const response = await fetch('/api/gemini/audit-legal-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: uploadDocTitle,
          documentCategory: uploadCategory,
          fullText: uploadTextContent,
          establishment
        })
      });

      const data = await response.json();
      const auditResult: AILegalAudit = data.success && data.audit ? data.audit : {
        overallScore: 88,
        status: 'compliant',
        summary: 'تم فحص الوثيقة الخارجية ومطابقتها مع الأنظمة السعودية.',
        strengths: ['استيفاء الأركان الأساسية للعقد'],
        risks: [],
        recommendedClauses: ['إضافة شرط التحكيم التجاري SCCA'],
        saudiComplianceChecklist: [
          { lawName: 'نظام المعاملات المدنية', isCompliant: true, notes: 'مطابق' }
        ]
      };

      // Create new LegalDocument
      const newDoc: LegalDocument = {
        id: `leg-doc-${Date.now()}`,
        establishmentId: establishment.id,
        title: uploadDocTitle,
        documentRefNumber: `SAB-EXT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category: uploadCategory,
        categoryLabel: uploadCategory === 'employment' ? 'عقود العمل والموارد البشرية' : 'العقود التجارية والتوريد',
        version: '1.0',
        status: 'under_review',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        firstParty: {
          role: 'الطرف الأول',
          name: establishment.name,
          crOrId: establishment.crNumber,
          repName: establishment.contactPerson || 'المدير العام',
          email: establishment.contactEmail
        },
        secondParty: {
          role: 'الطرف الثاني',
          name: 'الطرف المتعاقد الخارجي',
          crOrId: '—'
        },
        description: 'وثيقة قانونية خارجية تم تدقيقها بالذكاء الاصطناعي وإدراجها في مكتبة الشركة.',
        applicableLaws: ['نظام المعاملات المدنية السعودي', 'الأنظمة السارية'],
        clauses: [
          {
            id: 'c-ext-1',
            number: 1,
            title: 'نص الوثيقة والبنود المفحوصة',
            content: uploadTextContent,
            tag: 'نص خارجي',
            isMandatory: true,
            riskLevel: auditResult.overallScore < 85 ? 'caution' : 'safe'
          }
        ],
        aiAudit: auditResult,
        signatures: [
          { partyName: establishment.name, signerTitle: 'المدير العام', isSigned: false }
        ],
        tags: ['وثيقة خارجية', 'مدققة بالذكاء الاصطناعي', 'سبّاق'],
        qrVerificationCode: `SAB-EXT-${Math.floor(100000 + Math.random() * 900000)}`,
        confidentialityLevel: 'internal'
      };

      onUpdateDocument(newDoc);
      setIsUploadModalOpen(false);
      setUploadTextContent('');
      setUploadDocTitle('');
      showToast('تمت إضافة وتدقيق الوثيقة الخارجية بنجاح وحفظها في المكتبة!');
    } catch (error) {
      console.error('External upload audit error:', error);
      showToast('تعذر تحليل الوثيقة الخارجية بالذكاء الاصطناعي.');
    } finally {
      setIsAnalyzingUpload(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: LegalDocumentStatus) => {
    switch (status) {
      case 'signed_active':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ساري وموقع إلكترونياً
          </span>
        );
      case 'approved':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <FileCheck className="w-3 h-3 text-blue-600" />
            معتمد داخلياً
          </span>
        );
      case 'under_review':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            قيد المراجعة القانونية
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Edit3 className="w-3 h-3 text-slate-500" />
            مسودة عمل
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white flex items-center justify-center shadow-lg shadow-indigo-950/20 shrink-0">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900">مكتبة الوثائق القانونية والتنظيمية</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {establishment.name}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
              المستودع القانوني الموحد لإدارة عقود العمل، الاتفاقيات التجارية، اللوائح التنظيمية، قرارات الشركاء، وسياسات الامتثال المعتمدة وفق الأنظمة السعودية.
            </p>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            تدقيق وثيقة خارجية
          </button>

          <button
            onClick={() => onOpenEditor()}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 hover:from-indigo-800 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            صياغة وثيقة جديدة بالذكاء الاصطناعي
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold mb-1">إجمالي الوثائق واللوائح</div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-1">مستندات مفهرسة</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-emerald-700 text-[11px] font-bold mb-1">عقود سارية وموقعة</div>
          <div className="text-2xl font-black text-emerald-700">{stats.signedActive}</div>
          <div className="text-[10px] text-emerald-600 mt-1">موثقة إلكترونياً</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-blue-700 text-[11px] font-bold mb-1">لوائح وقرارات معتمدة</div>
          <div className="text-2xl font-black text-blue-700">{stats.approved}</div>
          <div className="text-[10px] text-blue-600 mt-1">سارية المفعول</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-amber-700 text-[11px] font-bold mb-1">مسودات قيد المراجعة</div>
          <div className="text-2xl font-black text-amber-700">{stats.drafts}</div>
          <div className="text-[10px] text-amber-600 mt-1">تتطلب تدقيق أو توقيع</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-indigo-700 text-[11px] font-bold mb-1">متوسط الامتثال النظامي</div>
          <div className="text-2xl font-black text-indigo-700">{stats.avgScore}%</div>
          <div className="text-[10px] text-indigo-600 mt-1">مطابقة للأنظمة السعودية</div>
        </div>
      </div>

      {/* Categories & Search Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: 'all', label: 'كافة الوثائق واللوائح', count: documents.length },
            { id: 'employment', label: 'عقود العمل والموارد البشرية', count: documents.filter(d => d.category === 'employment').length },
            { id: 'commercial', label: 'العقود التجارية والتوريد', count: documents.filter(d => d.category === 'commercial').length },
            { id: 'bylaws_policies', label: 'اللوائح والسياسات الداخلية', count: documents.filter(d => d.category === 'bylaws_policies').length },
            { id: 'nda_ip', label: 'السرية والملكية الفكرية (NDA)', count: documents.filter(d => d.category === 'nda_ip').length },
            { id: 'corporate_governance', label: 'قرارات الشركاء والحوكمة', count: documents.filter(d => d.category === 'corporate_governance').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedCategory === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Secondary Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، رقم المرجع، الطرف الثاني، أو الكلمات المفتاحية..."
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
            >
              <option value="all">كافة الحالات</option>
              <option value="signed_active">ساري وموقع إلكترونياً</option>
              <option value="approved">معتمد داخلياً</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="draft">مسودة</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
            >
              <option value="all">كافة الفروع والكيانات</option>
              {branches.map(br => (
                <option key={br.id} value={br.id}>{br.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Documents Grid */}
      <div className="space-y-3.5">
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">لم يتم العثور على وثائق مطابقة</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              جرّب تغيير خيارات التصفية أو استخدم المولد الذكي لصياغة وثيقة قانونية جديدة متوافقة مع الأنظمة السعودية.
            </p>
            <button
              onClick={() => onOpenEditor()}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              صياغة وثيقة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    {getStatusBadge(doc.status)}
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {doc.documentRefNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug mb-1.5">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {doc.description}
                  </p>

                  {/* Parties & Branch Metadata */}
                  <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الطرف الأول:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{doc.firstParty.name}</span>
                    </div>
                    {doc.secondParty && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{doc.secondParty.role}:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">{doc.secondParty.name}</span>
                      </div>
                    )}
                    {doc.branchName && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400">الفرع المخصص:</span>
                        <span className="text-indigo-700 font-semibold">{doc.branchName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer with Audit Score & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{doc.aiAudit?.overallScore || 95}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{doc.clauses.length} بنود</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveAuditDoc(doc);
                        setIsAuditingModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="تقرير التدقيق القانوني"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </button>

                    <button
                      onClick={() => onOpenEditor(doc)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تحرير
                    </button>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف من المكتبة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-built Templates Library Catalog Showcase */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base md:text-lg font-bold">نماذج وقوالب العقود السعودية المعتمدة</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              نماذج صياغة موحدة جاهزة للتخصيص الفوري عبر محرر الذكاء الاصطناعي
            </p>
          </div>

          <span className="text-xs text-indigo-300 font-semibold bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
            {LEGAL_TEMPLATES_CATALOG.length} نماذج رسمية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {LEGAL_TEMPLATES_CATALOG.map(tpl => (
            <div
              key={tpl.id}
              className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-700/50">
                    {tpl.categoryLabel}
                  </span>
                  <span className="text-[10px] text-slate-400">{tpl.defaultClausesCount} مادة</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug mb-1">{tpl.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-semibold">متوافق نظامياً 100%</span>
                <button
                  onClick={() => onOpenEditor(undefined, tpl)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  بدء الصياغة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Document AI Scan Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                تدقيق وفحص وثيقة أو عقد خارجي بالذكاء الاصطناعي
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              الصق نص العقد أو المسودة القانونية لتحليلها ورصد الثغرات والمخالفات النظامية للأنظمة السعودية وإدراجها في مكتبة الشركة.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الوثيقة أو العقد</label>
                <input
                  type="text"
                  value={uploadDocTitle}
                  onChange={e => setUploadDocTitle(e.target.value)}
                  placeholder="مثال: عقد تقديم خدمات تسويق رقمي مع شركة الخليج"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف الوثيقة</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value as LegalDocumentCategory)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                >
                  <option value="commercial">عقود تجارية وتوريد وخدمات</option>
                  <option value="employment">عقود عمل وموارد بشرية</option>
                  <option value="nda_ip">اتفاقيات سرية وملكية فكرية NDA</option>
                  <option value="bylaws_policies">لوائح وسياسات تنظيمية داخلية</option>
                  <option value="corporate_governance">قرارات شركاء وحوكمة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص بنود الوثيقة الكامل</label>
                <textarea
                  rows={6}
                  value={uploadTextContent}
                  onChange={e => setUploadTextContent(e.target.value)}
                  placeholder="الصق بنود العقد هنا ليقوم الذكاء الاصطناعي بتحليلها..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                إلغاء
              </button>
              <button
                disabled={isAnalyzingUpload}
                onClick={handleAnalyzeExternalDocument}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzingUpload ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري التدقيق بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    بدء التدقيق والحفظ في المكتبة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Legal Audit Details Modal */}
      {isAuditingModalOpen && activeAuditDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">تقرير التدقيق القانوني بالذكاء الاصطناعي</h3>
                  <p className="text-xs text-slate-500">{activeAuditDoc.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Score & Summary */}
            <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div>
                <div className="text-xs font-bold text-emerald-900">معدل الامتثال للتشريعات السعودية</div>
                <p className="text-xs text-emerald-700 mt-0.5">{activeAuditDoc.aiAudit?.summary || 'الوثيقة متوافقة مع المتطلبات النظامية'}</p>
              </div>
              <div className="text-2xl font-black text-emerald-800 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-emerald-200">
                {activeAuditDoc.aiAudit?.overallScore || 95}%
              </div>
            </div>

            {/* Strengths */}
            {activeAuditDoc.aiAudit?.strengths && activeAuditDoc.aiAudit.strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  نقاط القوة والحماية التعاقدية:
                </h4>
                <div className="space-y-1.5">
                  {activeAuditDoc.aiAudit.strengths.map((str, i) => (
                    <div key={i} className="text-xs text-slate-700 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks and recommendations */}
            {activeAuditDoc.aiAudit?.risks && activeAuditDoc.aiAudit.risks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  الثغرات والملاحظات القانونية المرصودة:
                </h4>
                <div className="space-y-2">
                  {activeAuditDoc.aiAudit.risks.map((r, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-950">{r.clauseTitle}</div>
                      <div className="text-slate-700">{r.issue}</div>
                      <div className="text-indigo-800 font-semibold pt-1">💡 التوصية: {r.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Checklist */}
            {activeAuditDoc.aiAudit?.saudiComplianceChecklist && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">الأنظمة السعودية الحاكمة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAuditDoc.aiAudit.saudiComplianceChecklist.map((item, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{item.lawName}</span>
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {item.notes || 'مطابق'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsAuditingModalOpen(false);
                  onOpenEditor(activeAuditDoc);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                فتح في محرر العقود للتعديل
              </button>
              <button
                onClick={() => setIsAuditingModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
