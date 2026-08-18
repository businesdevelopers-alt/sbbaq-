import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  FileText, 
  Plus, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Edit2,
  Trash2,
  FolderOpen,
  Eye,
  Download,
  Check,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
import { Establishment, Branch, DocumentItem, TeamMember, UserActivityLog } from '../types';
import { DocumentCameraScanner } from './DocumentCameraScanner';
import { TeamPermissionsManager } from './TeamPermissionsManager';

interface EstablishmentProfileProps {
  establishment: Establishment;
  branches: Branch[];
  documents: DocumentItem[];
  teamMembers?: TeamMember[];
  activityLogs?: UserActivityLog[];
  initialTab?: 'info' | 'branches' | 'team_permissions' | 'documents' | 'workforce';
  onUpdateEstablishment: (updated: Establishment) => void;
  onAddBranch: (branch: Partial<Branch>) => void;
  onUploadDocument: (doc: Partial<DocumentItem>) => void;
  onScanDocumentAI: (fileData: string, mimeType: string) => Promise<any>;
  onAddMember?: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  onUpdateMember?: (member: TeamMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onToggleMemberStatus?: (memberId: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast?: (msg: string) => void;
}

export const EstablishmentProfile: React.FC<EstablishmentProfileProps> = ({
  establishment,
  branches,
  documents,
  teamMembers = [],
  activityLogs = [],
  initialTab = 'info',
  onUpdateEstablishment,
  onAddBranch,
  onUploadDocument,
  onScanDocumentAI,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onToggleMemberStatus,
  onConsultSpecialist,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'branches' | 'team_permissions' | 'documents' | 'workforce'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Branch form state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState(establishment.city);
  const [newBranchDistrict, setNewBranchDistrict] = useState('');
  const [newBranchArea, setNewBranchArea] = useState<number>(100);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'commercial' | 'municipal' | 'safety' | 'labor' | 'tax' | 'contracts'>('commercial');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [docFileString, setDocFileString] = useState<string>('');
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiScanSuccess, setAiScanSuccess] = useState<string | null>(null);

  const currentBranches = branches.filter(b => b.establishmentId === establishment.id);
  const currentDocs = documents.filter(d => d.establishmentId === establishment.id);
  const currentTeamMembers = teamMembers.filter(m => m.establishmentId === establishment.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setDocFileString(base64);
        if (!docTitle) {
          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }

        // Auto trigger AI extraction if image or PDF
        setIsScanningAI(true);
        try {
          const res = await onScanDocumentAI(base64, file.type || 'image/jpeg');
          if (res) {
            if (res.title) setDocTitle(res.title);
            if (res.expiryDate) setDocExpiryDate(res.expiryDate);
            setAiScanSuccess(`تم استخراج البيانات بنجاح: ${res.documentType || 'مستند رسمي'} - ينتهي في: ${res.expiryDate || 'غير محدد'}`);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsScanningAI(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName) return;

    onAddBranch({
      establishmentId: establishment.id,
      name: newBranchName,
      city: newBranchCity,
      district: newBranchDistrict || 'حي الياسمين',
      areaSquareMeters: newBranchArea,
      crNumber: `${establishment.crNumber}-01`,
      nationalAddress: `السعودية، ${newBranchCity}، ${newBranchDistrict}`,
      employeesCount: 4,
      isMainBranch: false,
    });

    setNewBranchName('');
    setIsAddBranchOpen(false);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    onUploadDocument({
      establishmentId: establishment.id,
      title: docTitle,
      category: docCategory,
      expiryDate: docExpiryDate || '2027-12-30',
      status: 'valid',
      fileUrl: docFileString || 'https://example.com/doc.pdf',
      fileSize: '1.2 MB',
      isMandatory: true,
      lastVerifiedAt: new Date().toISOString().split('T')[0],
    });

    setDocTitle('');
    setDocExpiryDate('');
    setDocFileString('');
    setAiScanSuccess(null);
    setIsUploadDocOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5 border border-emerald-100">
            <Building2 className="w-3.5 h-3.5" />
            <span>الملف الرقمي الموحد للمنشأة والفروع</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            {establishment.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            الرقم الموحد: {establishment.unifiedNumber} • السجل الرئيسي: {establishment.crNumber} • {establishment.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadDocOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع مستند للأرشيف (AI Scan)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors shrink-0 ${
            activeTab === 'info' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          البيانات الأساسية والعنوان
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'branches' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>الفروع والمواقع</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {currentBranches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('team_permissions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'team_permissions' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>الفريق والصلاحيات والمفوضين</span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {currentTeamMembers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'documents' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>أرشيف المستندات والشهادات</span>
          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {currentDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workforce')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors shrink-0 ${
            activeTab === 'workforce' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          القوى العاملة والتوطين (قوى)
        </button>
      </div>

      {/* Tab 1: Establishment Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-['Cairo'] border-b border-slate-100 pb-2">
              الهوية القانونية والتجارية
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">الاسم التجاري الرسمي:</span>
                <strong className="text-slate-900">{establishment.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">الرقم الموحد 700:</span>
                <strong className="text-slate-900 font-mono">{establishment.unifiedNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">رقم السجل التجاري الرئيسي:</span>
                <strong className="text-slate-900 font-mono">{establishment.crNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">الكيان القانوني:</span>
                <strong className="text-slate-900">{establishment.legalForm}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">تاريخ التأسيس:</span>
                <strong className="text-slate-900">{establishment.establishedYear}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">رقم التواصل المعتمد:</span>
                <strong className="text-slate-900 font-mono">{establishment.contactPhone}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-['Cairo'] border-b border-slate-100 pb-2">
              العنوان الوطني والأنشطة الاقتصادية (ISIC4)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المدينة والمنطقة:</span>
                <strong className="text-slate-900">{establishment.city} - {establishment.district}</strong>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">العنوان الوطني الموحد (SPL):</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                  {establishment.nationalAddress}
                </p>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">الأنشطة الاقتصادية المعتمدة:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {establishment.isicActivities.map((act, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 font-medium text-[11px] px-2.5 py-1 rounded-lg border border-emerald-100">
                      ✓ {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">فروع ومواقع المنشأة</h3>
              <p className="text-xs text-slate-500">كل فرع له تراخيصه البلدية ومساحته وعقود إيجاره المستقلة</p>
            </div>
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">{branch.name}</h4>
                      <span className="text-[11px] text-slate-400">{branch.city} - {branch.district}</span>
                    </div>
                  </div>
                  {branch.isMainBranch && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      الفرع الرئيسي
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block text-[11px]">مساحة المحل:</span>
                    <strong className="text-slate-800">{branch.areaSquareMeters} م²</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">السجل التجاري الفرعي:</span>
                    <strong className="text-slate-800 font-mono">{branch.crNumber || 'تحت الإجراء'}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 block text-[11px]">العنوان الوطني:</span>
                    <span className="text-slate-700 text-[11px] truncate block">{branch.nationalAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Documents Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                أرشيف المستندات والشهادات الرقمية
              </h3>
              <p className="text-xs text-slate-500">
                المستندات المحفوظة هنا يُعاد استخدامها آلياً في جميع الطلبات والتراخيص بدون تكرار الرفع
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCameraScannerOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition-colors shadow-2xs border border-slate-700"
                title="التقاط صورة للوثيقة بالكاميرا ومسحها ذكياً"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>مسح بالكاميرا (AI)</span>
              </button>

              <button
                onClick={() => setIsUploadDocOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>إضافة مستند للأرشيف</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      doc.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : doc.status === 'expiring_soon'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {doc.status === 'valid' ? 'ساري ومعتمد' : doc.status === 'expiring_soon' ? 'يقترب من الانتهاء' : 'منتهي الصلاحية'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm font-['Cairo'] mb-1">
                    {doc.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>تاريخ الانتهاء: <strong className="text-slate-800">{doc.expiryDate}</strong></div>
                    <div>الحجم: {doc.fileSize} • آخر تدقيق: {doc.lastVerifiedAt}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح للربط الآلي</span>
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-slate-900 p-1"
                    title="معاينة الملف"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Workforce & Qiwa */}
      {activeTab === 'workforce' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                بيانات القوى العاملة ومؤشر نطاقات (منصة قوى)
              </h3>
              <p className="text-xs text-slate-500">
                المتابعة المباشرة للتوطين وتجديد رخص العمل والإقامات
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              النطاق: الأخضر المرتفع
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">إجمالي العمالة المسجلة:</span>
              <strong className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
                {establishment.totalEmployees} موظف
              </strong>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">الموظفون السعوديون:</span>
              <strong className="text-2xl font-extrabold text-emerald-700 font-['Cairo']">
                {establishment.saudiEmployees} سعودي
              </strong>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">نسبة التوطين الحالية:</span>
              <strong className="text-2xl font-extrabold text-blue-700 font-['Cairo']">
                {establishment.saudizationPercentage.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Team & Permissions (إدارة الفريق والصلاحيات والمفوضين) */}
      {activeTab === 'team_permissions' && (
        <div className="space-y-6">
          {onAddMember && onUpdateMember && onDeleteMember && onToggleMemberStatus ? (
            <TeamPermissionsManager
              establishment={establishment}
              branches={branches}
              teamMembers={teamMembers}
              activityLogs={activityLogs}
              onAddMember={onAddMember}
              onUpdateMember={onUpdateMember}
              onDeleteMember={onDeleteMember}
              onToggleMemberStatus={onToggleMemberStatus}
              onConsultSpecialist={onConsultSpecialist}
              showToast={showToast || (() => {})}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">إدارة فريق العمل والمفوضين</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يوجد {currentTeamMembers.length} أعضاء ومفوضين مسجلين لهذه المنشأة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveBranch} className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-['Cairo']">إضافة فرع جديد</h3>
              <button type="button" onClick={() => setIsAddBranchOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفرع</label>
              <input
                type="text"
                required
                placeholder="مثال: فرع حي الصحافة، فرع طريق الملك..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدينة</label>
                <input
                  type="text"
                  required
                  value={newBranchCity}
                  onChange={(e) => setNewBranchCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المساحة (م²)</label>
                <input
                  type="number"
                  required
                  value={newBranchArea}
                  onChange={(e) => setNewBranchArea(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                حفظ الفرع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveDocument} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">رفع مستند جديد للأرشيف</h3>
                <span className="text-xs text-slate-500">مع ميزة الفحص الذكي للتواريخ (AI OCR)</span>
              </div>
              <button type="button" onClick={() => setIsUploadDocOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* File drop zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-emerald-50/20 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">اسحب الملف هنا أو انقر للاختيار من جهازك</p>
              <span className="text-[10px] text-slate-400 block mt-1">يدعم الصور وملفات PDF حتى 10 ميجابايت</span>
            </div>

            {isScanningAI && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>جاري قراءة المستند بالذكاء الاصطناعي واستخراج تواريخ الانتهاء والبيانات...</span>
              </div>
            )}

            {aiScanSuccess && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold">
                ✓ {aiScanSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم / عنوان المستند</label>
              <input
                type="text"
                required
                placeholder="مثال: رخصة بلدي 1447، شهادة الزكاة والدخل..."
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
                <select
                  value={docCategory}
                  onChange={(e: any) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="commercial">سجلات تجارية وعقود تأسيس</option>
                  <option value="municipal">رخص بلدية وإشغال</option>
                  <option value="safety">تراخيص سلامة ودفاع مدني</option>
                  <option value="labor">موارد بشرية وقوى وتأمينات</option>
                  <option value="tax">زكاة وضريبة ودخل</option>
                  <option value="contracts">عقود إيجار ونظافة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  required
                  value={docExpiryDate}
                  onChange={(e) => setDocExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadDocOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                حفظ في الأرشيف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Camera Scanner Modal */}
      <DocumentCameraScanner
        establishment={establishment}
        branches={branches}
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onSaveDocument={(doc) => onUploadDocument(doc)}
        onScanDocumentAI={onScanDocumentAI}
        initialCategory="cr"
      />

    </div>
  );
};
