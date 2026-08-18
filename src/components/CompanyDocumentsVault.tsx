import React, { useState, useMemo, useRef } from 'react';
import {
  FolderLock,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Copy,
  Share2,
  Plus,
  Sparkles,
  Zap,
  Building2,
  Calendar,
  Shield,
  ShieldCheck,
  Tag,
  ExternalLink,
  RefreshCw,
  X,
  Camera,
  Layers,
  FileCheck,
  QrCode,
  Printer,
  ChevronDown,
  Info,
  Check,
  SlidersHorizontal,
  Grid,
  List,
  Flame,
  Scale,
  Users,
  Briefcase,
  Bell,
  BellRing
} from 'lucide-react';
import { Establishment, Branch, DocumentItem, DocumentCategory, License } from '../types';
import { formatSAR } from '../utils/complianceEngine';
import { DocumentCameraScanner } from './DocumentCameraScanner';
import { SmartDocumentUploadModal } from './SmartDocumentUploadModal';
import { AutoRenewalDraftModal } from './AutoRenewalDraftModal';
import { DigitalSignatureModal, SignatureResult } from './DigitalSignatureModal';
import { PenTool, Fingerprint } from 'lucide-react';

interface CompanyDocumentsVaultProps {
  establishment: Establishment;
  branches: Branch[];
  documents: DocumentItem[];
  licenses: License[];
  onUploadDocument: (newDoc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onRenewLicense?: (licenseId: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  onScanDocumentAI?: (fileData: string, mimeType: string) => Promise<any>;
  showToast?: (message: string) => void;
}

// Category Configuration with Arabic Titles and Icons
const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  all: { label: 'جميع المستندات', icon: FolderLock, color: 'text-slate-700', bg: 'bg-slate-100' },
  recurring_contracts: { label: 'مسودات التجديد التلقائي (30 يوماً)', icon: Sparkles, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  cr: { label: 'السجلات والهويات التجارية', icon: Briefcase, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  balady: { label: 'الرخص والشهادات البلدية', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  salama: { label: 'الدفاع المدني والسلامة', icon: Flame, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  zatca: { label: 'الزكاة والضريبة والجمارك', icon: Scale, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  gosi: { label: 'التأمينات الاجتماعية وقوى', icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  articles_of_assoc: { label: 'عقود التأسيس والملاحق', icon: FileText, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  lease_contract: { label: 'عقود الإيجار الموثقة (إيجار)', icon: FileCheck, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  health_cert: { label: 'الشهادات الصحية والمهنية', icon: ShieldCheck, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  other: { label: 'مستندات وتفاويض أخرى', icon: Tag, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
};

// Helper for Days Remaining Calculation
const getDaysRemaining = (expiryDateStr: string) => {
  if (!expiryDateStr) return 0;
  const today = new Date();
  const exp = new Date(expiryDateStr);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const CompanyDocumentsVault: React.FC<CompanyDocumentsVaultProps> = ({
  establishment,
  branches,
  documents,
  licenses,
  onUploadDocument,
  onDeleteDocument,
  onRenewLicense,
  onConsultSpecialist,
  onScanDocumentAI,
  showToast = (msg) => alert(msg),
}) => {
  // Filters & View States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [selectedRenewalDoc, setSelectedRenewalDoc] = useState<DocumentItem | null>(null);
  const [signingDoc, setSigningDoc] = useState<DocumentItem | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('cr');
  const [uploadDocNumber, setUploadDocNumber] = useState('');
  const [uploadAuthority, setUploadAuthority] = useState('');
  const [uploadIssueDate, setUploadIssueDate] = useState('2025-01-01');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('2027-01-01');
  const [uploadBranchId, setUploadBranchId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanningOCR, setIsScanningOCR] = useState<boolean>(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter documents belonging to this establishment
  const estDocuments = useMemo(() => {
    return documents.filter(d => d.establishmentId === establishment.id);
  }, [documents, establishment.id]);

  // Statistics
  const stats = useMemo(() => {
    const total = estDocuments.length;
    const valid = estDocuments.filter(d => d.status === 'valid').length;
    const expiring = estDocuments.filter(d => d.status === 'expiring_soon').length;
    const expired = estDocuments.filter(d => d.status === 'expired').length;
    const completeness = total > 0 ? Math.round(((valid + expiring) / total) * 100) : 0;

    return { total, valid, expiring, expired, completeness };
  }, [estDocuments]);

  // Filtered documents list based on search, category, status, and branch
  const filteredDocuments = useMemo(() => {
    return estDocuments.filter(doc => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'recurring_contracts') {
          const days = getDaysRemaining(doc.expiryDate);
          return (doc.isRecurring || doc.category === 'lease_contract' || doc.renewalDraftProposal) && (days <= 30 || doc.renewalDraftProposal?.autoRenewProposed);
        } else if (activeCategory === 'gosi' && (doc.category === 'gosi' || doc.category === 'saudization' || doc.category === 'labor')) {
          // match
        } else if (activeCategory === 'zatca' && (doc.category === 'zatca' || doc.category === 'tax')) {
          // match
        } else if (doc.category !== activeCategory) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }

      // Branch filter
      if (selectedBranchId !== 'all') {
        if (selectedBranchId === 'main' && doc.branchId) return false;
        if (selectedBranchId !== 'main' && doc.branchId !== selectedBranchId) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchNum = (doc.documentNumber || '').toLowerCase().includes(q);
        const matchAuth = (doc.authority || '').toLowerCase().includes(q);
        const matchBranch = (doc.branchName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchNum && !matchAuth && !matchBranch) {
          return false;
        }
      }

      return true;
    });
  }, [estDocuments, activeCategory, statusFilter, selectedBranchId, searchQuery]);

  // Recurring contract auto-renewal draft proposals (<= 30 days before expiry)
  const autoRenewProposals = useMemo(() => {
    return estDocuments.filter(d => {
      const days = getDaysRemaining(d.expiryDate);
      return (d.isRecurring || d.category === 'lease_contract' || d.renewalDraftProposal) && (days <= 30 || d.renewalDraftProposal?.autoRenewProposed);
    });
  }, [estDocuments]);

  // Handle File Selection with Simulated AI OCR Auto-Fill
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(objectUrl);

    // Trigger AI OCR Scan simulation
    setIsScanningOCR(true);
    setTimeout(() => {
      setIsScanningOCR(false);
      
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('cr') || fileNameLower.includes('سجل') || fileNameLower.includes('تجاري')) {
        setUploadCategory('cr');
        setUploadTitle('السجل التجاري الرئيسي المحدث');
        setUploadDocNumber('1010' + Math.floor(100000 + Math.random() * 900000));
        setUploadAuthority('وزارة التجارة');
        setUploadExpiryDate('2027-04-15');
      } else if (fileNameLower.includes('balady') || fileNameLower.includes('بلدي') || fileNameLower.includes('رخصة')) {
        setUploadCategory('balady');
        setUploadTitle('رخصة بلدي لممارسة النشاط');
        setUploadDocNumber('BLD-RUH-2026-' + Math.floor(1000 + Math.random() * 9000));
        setUploadAuthority('أمانة منطقة الرياض (بلدي)');
        setUploadExpiryDate('2027-08-20');
      } else if (fileNameLower.includes('salama') || fileNameLower.includes('سلامة') || fileNameLower.includes('دفاع')) {
        setUploadCategory('salama');
        setUploadTitle('تصريح سلامة والوقاية من الحريق');
        setUploadDocNumber('CD-RUH-' + Math.floor(10000 + Math.random() * 90000));
        setUploadAuthority('المديرية العامة للدفاع المدني');
        setUploadExpiryDate('2027-06-30');
      } else if (fileNameLower.includes('zatca') || fileNameLower.includes('ضريبة') || fileNameLower.includes('زكاة')) {
        setUploadCategory('zatca');
        setUploadTitle('شهادة تسجيل ضريبة القيمة المضافة ZATCA');
        setUploadDocNumber('300' + Math.floor(10000000000 + Math.random() * 90000000000) + '00003');
        setUploadAuthority('هيئة الزكاة والضريبة والجمارك');
        setUploadExpiryDate('2027-12-31');
      } else if (fileNameLower.includes('contract') || fileNameLower.includes('عقد') || fileNameLower.includes('إيجار')) {
        setUploadCategory('lease_contract');
        setUploadTitle('عقد إيجار تجاري موثق (شبكة إيجار)');
        setUploadDocNumber('EJR-2026-' + Math.floor(100000 + Math.random() * 900000));
        setUploadAuthority('الهيئة العامة للعقار (إيجار)');
        setUploadExpiryDate('2027-09-01');
      } else {
        if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        if (!uploadDocNumber) setUploadDocNumber('DOC-' + Math.floor(10000 + Math.random() * 90000));
        if (!uploadAuthority) setUploadAuthority('الجهة الرسمية المختصة');
      }
    }, 1100);
  };

  // Submit Upload Document
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast('يرجى كتابة عنوان أو اسم المستند');
      return;
    }

    const selectedBranch = branches.find(b => b.id === uploadBranchId);

    // Calculate status based on expiry
    const today = new Date();
    const expDate = new Date(uploadExpiryDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let docStatus: 'valid' | 'expiring_soon' | 'expired' = 'valid';
    if (diffDays < 0) {
      docStatus = 'expired';
    } else if (diffDays <= 30) {
      docStatus = 'expiring_soon';
    }

    const newDocItem: DocumentItem = {
      id: `doc-${Date.now()}`,
      establishmentId: establishment.id,
      branchId: uploadBranchId || undefined,
      branchName: selectedBranch ? selectedBranch.name : 'الفرع الرئيسي',
      title: uploadTitle,
      category: uploadCategory,
      documentNumber: uploadDocNumber || `DOC-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: uploadIssueDate,
      expiryDate: uploadExpiryDate,
      status: docStatus,
      fileUrl: uploadedPreviewUrl || '/docs/sample_official.pdf',
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      aiExtracted: true,
      authority: uploadAuthority || 'الجهة الحكومية المختصة',
      isMandatory: true,
      lastVerifiedAt: new Date().toISOString().split('T')[0],
    };

    onUploadDocument(newDocItem);
    showToast(`تم حفظ المستند "${uploadTitle}" بنجاح في محفظة الشركة!`);

    // Reset & close
    setUploadTitle('');
    setUploadDocNumber('');
    setUploadAuthority('');
    setSelectedFile(null);
    setUploadedPreviewUrl('');
    setIsUploadModalOpen(false);
  };

  // Copy Document Number
  const handleCopyNumber = (doc: DocumentItem) => {
    if (doc.documentNumber) {
      navigator.clipboard.writeText(doc.documentNumber);
      setCopiedDocId(doc.id);
      showToast(`تم نسخ رقم المستند: ${doc.documentNumber}`);
      setTimeout(() => setCopiedDocId(null), 2500);
    }
  };

  // Download All as ZIP package (simulated)
  const handleDownloadAllZip = () => {
    showToast(`جاري تجميع وأرشفة ${estDocuments.length} مستند في ملف مضغوط واحد (ZIP)...`);
    setTimeout(() => {
      showToast(`تم تحميل ملف "محفظة_مستندات_${establishment.name}.zip" بنجاح!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
              <FolderLock className="w-3.5 h-3.5" />
              <span>الحافظة الرقمية الموحدة للوثائق الرسمية</span>
            </div>
            <h1 className="text-2xl font-bold font-['Cairo']">
              محفظة مستندات الشركة والأوراق الرسمية
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              حافظة مشفرة وآمنة لحفظ وتنظيم كافة صور ومستندات السجلات التجارية، التراخيص البلدية، شهادات السلامة، والزكاة والضرائب، مع إمكانية الوصول والمشاركة والتجديد الفوري.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2 border border-indigo-400/40"
              title="الرفع الذكي والتصنيف التلقائي للمستندات واستخراج تاريخ الانتهاء وضبط التنبيهات"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>الرفع الذكي والتصنيف (AI Upload)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/30 transition-all flex items-center gap-2 border border-emerald-400/30"
              title="التقاط صورة للوثيقة الورقية بالكاميرا واستخراج البيانات عبر الذكاء الاصطناعي"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span>مسح بالكاميرا (AI Scanner)</span>
            </button>

            <button
              onClick={handleDownloadAllZip}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              title="تحميل جميع المستندات في ملف واحد"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>تحميل الحافظة (ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Portfolio Health & Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Docs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">إجمالي المستندات</span>
            <FolderLock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
            {stats.total} <span className="text-xs font-normal text-slate-500">وثيقة</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">مؤرشفة في السحابة الآمنة</span>
        </div>

        {/* Card 2: Valid Docs */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="font-bold">مستندات سارية</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-['Cairo']">
            {stats.valid} <span className="text-xs font-normal text-emerald-600">سارية</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1">وضع نظامي مطابق 100%</span>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-bold">قاربت على الانتهاء</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-['Cairo']">
            {stats.expiring} <span className="text-xs font-normal text-amber-600">خلال 30 يوم</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1">ينصح بالتجديد الاستباقي</span>
        </div>

        {/* Card 4: Expired Docs */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span className="font-bold">منتهية / متأخرة</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-['Cairo']">
            {stats.expired} <span className="text-xs font-normal text-rose-600">منتهية</span>
          </div>
          <span className="text-[11px] text-rose-700 mt-1">تتطلب تجديد فوري لإيقاف الغرامة</span>
        </div>

        {/* Card 5: Readiness Percentage */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-indigo-900 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
            <span className="font-bold">اكتمال الحافظة</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-['Cairo']">
            {stats.completeness}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${stats.completeness}%` }}
            />
          </div>
        </div>

      </div>

      {/* 2.5 Proactive Auto-Renewal Proposals Section (Before 30 Days Expiry) */}
      {autoRenewProposals.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    مسودات التجديد التلقائي الاستباقية للعقود المتكررة
                  </h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {autoRenewProposals.length} مسودة مقترحة
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  يقوم النظام بالذكاء الاصطناعي بإعداد مسودة تجديد متكاملة لعقود الإيجار والصيانة قبل 30 يوماً من انتهائها لاعتمادها وتفادي الغرامات.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('recurring_contracts')}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-indigo-400/30 transition-all self-start sm:self-auto cursor-pointer"
            >
              عرض كافة العقود المتكررة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {autoRenewProposals.map((doc) => {
              const daysLeft = getDaysRemaining(doc.expiryDate);
              const p = doc.renewalDraftProposal;

              return (
                <div
                  key={doc.id}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-indigo-400/30 hover:border-indigo-400/60 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-indigo-400/30">
                        {p?.contractTypeName || (doc.category === 'lease_contract' ? 'عقد إيجار تجاري (إيجار)' : 'عقد دوري')}
                      </span>
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>متبقي {daysLeft} يوماً</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-xs leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                      {doc.title}
                    </h4>

                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-700/60 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">تاريخ الانتهاء:</span>
                        <span className="text-rose-300 font-bold">{doc.expiryDate}</span>
                      </div>
                      {p?.proposedAnnualAmountSAR && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">القيمة المقترحة للتجديد:</span>
                          <span className="text-emerald-400 font-bold font-mono">{formatSAR(p.proposedAnnualAmountSAR)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRenewalDoc(doc)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>استعراض واعتماد مسودة التجديد</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Filter Bar & Category Pills */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Top Controls: Search + Status + Branch + View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم السجل، اسم الرخصة، الجهة الحكومية، أو الفرع..."
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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

          {/* Status & Branch Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="valid">ساري فقط</option>
              <option value="expiring_soon">قاربت على الانتهاء</option>
              <option value="expired">منتهية الصلاحية</option>
            </select>

            {/* Branch Dropdown */}
            {branches.length > 0 && (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">كافة الفروع والمواقع</option>
                <option value="main">المركز الرئيسي فقط</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="عرض شبكي"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="عرض جدول"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {Object.entries(CATEGORY_MAP).map(([key, item]) => {
            const Icon = item.icon;
            const count = key === 'all' 
              ? estDocuments.length 
              : estDocuments.filter(d => {
                  if (key === 'gosi') return d.category === 'gosi' || d.category === 'saudization' || d.category === 'labor';
                  if (key === 'zatca') return d.category === 'zatca' || d.category === 'tax';
                  return d.category === key;
                }).length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  activeCategory === key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                  activeCategory === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. Documents Rendering: Grid View or Table View */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FolderLock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
            لم يتم العثور على مستندات تطابق البحث
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يمكنك تغيير معايير التصفية أو البدء برفع صورة أو مستند جديد لحفظه في محفظة مستندات الشركة.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>رفع مستند جديد الآن</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP.other;
            const CatIcon = catInfo.icon;
            const daysLeft = getDaysRemaining(doc.expiryDate);
            const isExpired = doc.status === 'expired' || daysLeft < 0;
            const isExpiringSoon = doc.status === 'expiring_soon' || (daysLeft >= 0 && daysLeft <= 30);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-slate-300"
              >
                {/* Card Top: Category & Status */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <CatIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span className="truncate max-w-[130px]">{catInfo.label.split(' ')[0]}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isExpired
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isExpiringSoon
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isExpired ? 'منتهي الصلاحية' : isExpiringSoon ? 'ينتهي قريباً' : 'ساري وموثق'}
                      </span>

                      {doc.isSigned && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Fingerprint className="w-3 h-3 text-emerald-700" />
                          <span>موقع</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document Title & Number */}
                  <h3 className="font-bold text-slate-900 text-sm font-['Cairo'] group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>

                  {doc.documentNumber && (
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <span className="font-mono text-slate-700 font-bold text-[11px] tracking-wide">
                        {doc.documentNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(doc)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                        title="نسخ رقم المستند"
                      >
                        {copiedDocId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Issuing Authority & Branch */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الجهة المصدرة:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{doc.authority || 'الجهة الحكومية'}</span>
                    </div>

                    {doc.branchName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الموقع / الفرع:</span>
                        <span className="text-slate-700 truncate max-w-[170px]">{doc.branchName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-400">تاريخ الانتهاء:</span>
                      <span className={`font-bold font-['Cairo'] ${
                        isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-700' : 'text-slate-800'
                      }`}>
                        {doc.expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Days remaining and Alert Badge */}
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المهلة المتبقية:</span>
                      <span className={`font-extrabold ${
                        isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {isExpired 
                          ? `متأخر منذ ${Math.abs(daysLeft)} يوم` 
                          : `متبقي ${daysLeft} يوماً`}
                      </span>
                    </div>

                    {doc.alertConfig?.enabled !== false && (
                      <div className="flex items-center justify-between text-[10px] bg-indigo-50/60 px-2 py-0.5 rounded-md border border-indigo-100 text-indigo-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Bell className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>التنبيه الآلي نشط</span>
                        </span>
                        <span className="font-bold">
                          {doc.alertConfig?.channels?.includes('whatsapp') ? 'WhatsApp/SMS' : 'تطبيق/إيميل'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Card Footer: Action Buttons */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                  
                  {/* Proactive Auto-Renewal Draft Button if Recurring or Lease */}
                  {(doc.isRecurring || doc.category === 'lease_contract' || doc.renewalDraftProposal) && (
                    <button
                      type="button"
                      onClick={() => setSelectedRenewalDoc(doc)}
                      className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 border border-indigo-400/30 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>استعراض مسودة التجديد التلقائي (30 يوماً)</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>معاينة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSigningDoc(doc)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-2xs transition-colors"
                      title={doc.isSigned ? "إعادة توقيع واعتماد المستند" : "توقيع المستند إلكترونياً"}
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        showToast(`جاري تحميل ملف "${doc.title}"...`);
                      }}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                      title="تحميل الملف"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {(isExpired || isExpiringSoon) && onConsultSpecialist && (
                      <button
                        type="button"
                        onClick={() => onConsultSpecialist(`تجديد مستند ${doc.title} رقم ${doc.documentNumber}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl shadow-2xs transition-colors"
                        title="طلب تجديد فوري عبر سبّاق"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف مستند "${doc.title}" من المحفظة؟`)) {
                          onDeleteDocument(doc.id);
                          showToast(`تم حذف المستند بنجاح.`);
                        }
                      }}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="حذف المستند"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5 pr-5">اسم المستند والوثيقة</th>
                  <th className="p-3.5">النوع والتصنيف</th>
                  <th className="p-3.5">رقم الوثيقة</th>
                  <th className="p-3.5">الجهة المصدرة</th>
                  <th className="p-3.5">الموقع / الفرع</th>
                  <th className="p-3.5">تاريخ الانتهاء</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 pl-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredDocuments.map((doc) => {
                  const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP.other;
                  const daysLeft = getDaysRemaining(doc.expiryDate);
                  const isExpired = doc.status === 'expired' || daysLeft < 0;
                  const isExpiringSoon = doc.status === 'expiring_soon' || (daysLeft >= 0 && daysLeft <= 30);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pr-5 font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.title}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {catInfo.label.split(' ')[0]}
                      </td>
                      <td className="p-3.5 font-mono text-slate-800 font-bold">
                        {doc.documentNumber || '—'}
                      </td>
                      <td className="p-3.5 text-slate-600 truncate max-w-[150px]">
                        {doc.authority || '—'}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {doc.branchName || 'الفرع الرئيسي'}
                      </td>
                      <td className="p-3.5 font-['Cairo']">
                        {doc.expiryDate}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isExpired
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : isExpiringSoon
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {isExpired ? 'منتهي' : isExpiringSoon ? 'ينتهي قريباً' : 'ساري'}
                          </span>
                          {doc.isSigned && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <Fingerprint className="w-2.5 h-2.5" />
                              <span>موقع</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 pl-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {(doc.isRecurring || doc.category === 'lease_contract' || doc.renewalDraftProposal) && (
                            <button
                              type="button"
                              onClick={() => setSelectedRenewalDoc(doc)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                              title="استعراض مسودة التجديد التلقائي (30 يوماً)"
                            >
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigningDoc(doc)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                            title={doc.isSigned ? "إعادة توقيع واعتماد المستند" : "توقيع المستند إلكترونياً"}
                          >
                            <PenTool className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`جاري تحميل ${doc.title}...`)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="تحميل"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`حذف ${doc.title}؟`)) onDeleteDocument(doc.id);
                            }}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 5. Smart Document Upload Modal */}
      <SmartDocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        establishment={establishment}
        branches={branches}
        onSaveDocument={onUploadDocument}
        onOpenLiveCamera={() => setIsCameraModalOpen(true)}
        showToast={showToast}
        onScanDocumentAI={onScanDocumentAI}
      />

      {/* 6. Interactive Official Document Viewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto font-['Cairo']">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 relative my-8 text-right">
            
            {/* Top Bar with Print & Close */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  معاينة الوثيقة الرسمية
                </span>
                <span className="text-xs text-slate-400">
                  {previewDoc.fileSize || '1.2 MB'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="طباعة"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`تم تحميل نسخة المستند "${previewDoc.title}"`);
                  }}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="تحميل"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Simulated Saudi Certificate Canvas */}
            <div className="bg-gradient-to-b from-amber-50/20 via-white to-slate-50 p-6 sm:p-8 rounded-2xl border-2 border-emerald-800/30 shadow-inner relative overflow-hidden space-y-6">
              
              {/* Emblem Header */}
              <div className="flex items-center justify-between border-b-2 border-emerald-800/20 pb-4 text-center">
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-700">المملكة العربية السعودية</p>
                  <p className="text-xs font-extrabold text-emerald-900">{previewDoc.authority || 'الجهة الحكومية المختصة'}</p>
                </div>

                <div className="w-12 h-12 rounded-full bg-emerald-900 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                </div>

                <div className="text-left text-[11px] text-slate-600">
                  <p>رقم التحقق: {previewDoc.documentNumber}</p>
                  <p>تاريخ التحقق: {previewDoc.lastVerifiedAt || '2026-08-01'}</p>
                </div>
              </div>

              {/* Document Certificate Title */}
              <div className="text-center space-y-1 py-2">
                <span className="text-xs font-bold text-emerald-800 tracking-wider">
                  وثيقة إلكترونية رسمية معتمدة
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">
                  {previewDoc.title}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  رقم الوثيقة: {previewDoc.documentNumber}
                </p>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">اسم المنشأة:</span>
                  <strong className="text-slate-900 font-bold">{establishment.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">السجل التجاري:</span>
                  <strong className="text-slate-900 font-mono font-bold">{establishment.crNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">المدينة / الفرع:</span>
                  <strong className="text-slate-900 font-bold">{previewDoc.branchName || establishment.city}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">تاريخ الإصدار:</span>
                  <strong className="text-slate-900 font-['Cairo']">{previewDoc.issueDate || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">تاريخ الانتهاء:</span>
                  <strong className={`font-bold font-['Cairo'] ${
                    previewDoc.status === 'expired' ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {previewDoc.expiryDate}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">حالة الوثيقة:</span>
                  <strong className="text-emerald-700 font-bold">موثقة ومطابقة في النظام</strong>
                </div>
              </div>

              {/* Official Seal & QR Code Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1.5 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
                    <QrCode className="w-11 h-11 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">رمز الاستجابة السريع (QR Validation)</p>
                    <p>مسجل عبر منصة سبّاق للربط الحكومي</p>
                    <p className="text-emerald-700 font-semibold">✓ وثيقة سارية مشفرة بتقنية SHA-256</p>
                    {previewDoc.isSigned && (
                      <p className="text-indigo-700 font-bold">
                        ✓ موقعة بواسطة: {previewDoc.signedBy || 'المفوض النظامي'} {previewDoc.nafathVerified ? '(موثق بنفاذ)' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center flex flex-col items-center">
                  {previewDoc.signatureDataUrl ? (
                    <div className="border border-emerald-300 bg-emerald-50/50 p-2 rounded-xl text-center">
                      <img src={previewDoc.signatureDataUrl} alt="التوقيع" className="h-10 max-w-[120px] object-contain mx-auto" />
                      <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">توقيع معتمد</span>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-800/40 flex items-center justify-center text-emerald-800 text-[10px] font-bold rotate-12">
                      ختم الاعتماد الرقمي
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopyNumber(previewDoc)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ رقم المستند</span>
              </button>

              <div className="flex items-center gap-2">
                {previewDoc.status === 'expired' && onConsultSpecialist && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(null);
                      onConsultSpecialist(`تجديد عاجل لمستند ${previewDoc.title}`);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>طلب تجديد فوري للمستند</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  إغلاق المعاينة
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Document Camera Scanner Modal */}
      <DocumentCameraScanner
        establishment={establishment}
        branches={branches}
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSaveDocument={onUploadDocument}
        onScanDocumentAI={onScanDocumentAI || (async () => ({ title: 'مستند رسمي' }))}
        showToast={showToast}
        initialCategory="cr"
      />

      {/* 7. Auto-Renewal Smart Proposal Modal (Within 30 Days Expiry) */}
      {selectedRenewalDoc && (
        <AutoRenewalDraftModal
          isOpen={!!selectedRenewalDoc}
          onClose={() => setSelectedRenewalDoc(null)}
          documentItem={selectedRenewalDoc}
          establishment={establishment}
          onConfirmRenewal={(updatedDoc) => {
            onUploadDocument(updatedDoc);
            setSelectedRenewalDoc(null);
          }}
          showToast={showToast}
        />
      )}

      {/* 8. Digital Signature Modal */}
      {signingDoc && (
        <DigitalSignatureModal
          isOpen={!!signingDoc}
          onClose={() => setSigningDoc(null)}
          documentTitle={signingDoc.title}
          documentTypeLabel={CATEGORY_MAP[signingDoc.category]?.label || 'مستند رسمي'}
          establishment={establishment}
          onSignComplete={(result) => {
            const updatedDoc: DocumentItem = {
              ...signingDoc,
              isSigned: true,
              signedBy: result.signerName,
              signedAt: result.signedAt,
              verificationCode: result.verificationCode,
              signatureHash: result.cryptographicHash,
              signatureDataUrl: result.signatureDataUrl,
              nafathVerified: result.nafathVerified
            };
            onUploadDocument(updatedDoc);
            setSigningDoc(null);
            showToast(`تم توثيق وتوقيع المستند "${signingDoc.title}" برمز التحقق: ${result.verificationCode}`);
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
};
