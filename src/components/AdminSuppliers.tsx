import React, { useState, useMemo } from 'react';
import {
  Store,
  Building2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileCheck2,
  FileText,
  Ban,
  RotateCcw,
  Plus,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Award,
  Star,
  Check,
  X,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Scale,
  Zap,
  TrendingUp,
  Download,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Layers,
  Briefcase
} from 'lucide-react';
import {
  Supplier,
  SupplierStatus,
  SupplierDocument,
  SupplierDocumentType,
  SupplierSuspensionRecord,
  SupplierVerificationLevel,
  RemediationCategory
} from '../types';
import { MOCK_SUPPLIERS, REMEDIATION_CATEGORIES_INFO } from '../data/complianceMarketData';
import { formatSAR } from '../utils/complianceEngine';

interface AdminSuppliersProps {
  onNavigateToTab?: (tab: string) => void;
  showToast: (msg: string) => void;
}

export const AdminSuppliers: React.FC<AdminSuppliersProps> = ({
  onNavigateToTab,
  showToast
}) => {
  // Main Suppliers State (initialized from MOCK_SUPPLIERS)
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);

  // Active Main Sub-Tab within the Suppliers Interface
  const [activeView, setActiveView] = useState<'directory' | 'pending_verification' | 'suspended_log' | 'performance_matrix'>('directory');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SupplierStatus | 'all'>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<RemediationCategory | 'all'>('all');
  const [filterVerificationLevel, setFilterVerificationLevel] = useState<SupplierVerificationLevel | 'all'>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [onlyEmergency, setOnlyEmergency] = useState(false);

  // Selected Supplier for Details / Actions
  const [selectedSupplierForDocs, setSelectedSupplierForDocs] = useState<Supplier | null>(null);
  const [selectedSupplierForSuspension, setSelectedSupplierForSuspension] = useState<Supplier | null>(null);
  const [selectedSupplierForReinstatement, setSelectedSupplierForReinstatement] = useState<Supplier | null>(null);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForProfile, setSelectedSupplierForProfile] = useState<Supplier | null>(null);
  const [activeDocPreview, setActiveDocPreview] = useState<SupplierDocument | null>(null);

  // Add / Edit Supplier Modal Form State
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<{
    commercialRegNumber: string;
    nameAr: string;
    nameEn: string;
    city: string;
    coverageRegions: string[];
    specialties: RemediationCategory[];
    verificationLevel: SupplierVerificationLevel;
    status: SupplierStatus;
    contactPerson: string;
    phone: string;
    email: string;
    bankName: string;
    ibanNumber: string;
    vatNumber: string;
    isAvailableForEmergency: boolean;
    yearsInMarket: number;
    descriptionAr: string;
  }>({
    commercialRegNumber: '',
    nameAr: '',
    nameEn: '',
    city: 'الرياض',
    coverageRegions: ['منطقة الرياض'],
    specialties: ['civil_defense'],
    verificationLevel: 'standard',
    status: 'pending_verification',
    contactPerson: '',
    phone: '05',
    email: '',
    bankName: 'مصرف الراجحي',
    ibanNumber: 'SA',
    vatNumber: '310',
    isAvailableForEmergency: true,
    yearsInMarket: 3,
    descriptionAr: ''
  });

  // Suspension Form State
  const [suspensionForm, setSuspensionForm] = useState<{
    reasonCategory: SupplierSuspensionRecord['reasonCategory'];
    reasonCategoryAr: string;
    detailsAr: string;
    expectedDuration: string;
  }>({
    reasonCategory: 'delayed_execution',
    reasonCategoryAr: 'تأخر جسيم في تنفيذ أمر التوريد وإصدار الشهادات الفنية',
    detailsAr: '',
    expectedDuration: 'إيقاف مؤقت حتى معالجة الملاحظات وتحديث التراخيص'
  });

  // Reinstatement Form State
  const [reinstatementNotes, setReinstatementNotes] = useState('');

  // Reject Document State
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Metrics summary
  const metrics = useMemo(() => {
    const total = suppliers.length;
    const pending = suppliers.filter(s => s.status === 'pending_verification').length;
    const approved = suppliers.filter(s => s.status === 'approved').length;
    const suspended = suppliers.filter(s => s.status === 'suspended').length;
    const rejected = suppliers.filter(s => s.status === 'rejected').length;

    const totalCompletedOrders = suppliers.reduce((sum, s) => sum + s.completedOrdersCount, 0);
    const avgDeliveryRate = (
      suppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / (suppliers.length || 1)
    ).toFixed(1);
    const avgComplianceRate = (
      suppliers.reduce((sum, s) => sum + s.complianceAcceptanceRate, 0) / (suppliers.length || 1)
    ).toFixed(1);

    const pendingDocsCount = suppliers.reduce((count, s) => {
      const pendingDocs = (s.documents || []).filter(d => d.status === 'pending_review').length;
      return count + pendingDocs;
    }, 0);

    return {
      total,
      pending,
      approved,
      suspended,
      rejected,
      totalCompletedOrders,
      avgDeliveryRate,
      avgComplianceRate,
      pendingDocsCount
    };
  }, [suppliers]);

  // Cities List for filter dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach(s => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [suppliers]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Sub-tab view constraint
      if (activeView === 'pending_verification' && s.status !== 'pending_verification') {
        return false;
      }
      if (activeView === 'suspended_log' && s.status !== 'suspended' && (!s.suspensionHistory || s.suspensionHistory.length === 0)) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && s.status !== filterStatus) {
        return false;
      }

      // Specialty filter
      if (filterSpecialty !== 'all' && !s.specialties.includes(filterSpecialty)) {
        return false;
      }

      // Verification Level filter
      if (filterVerificationLevel !== 'all' && s.verificationLevel !== filterVerificationLevel) {
        return false;
      }

      // City filter
      if (filterCity !== 'all' && s.city !== filterCity) {
        return false;
      }

      // Emergency filter
      if (onlyEmergency && !s.isAvailableForEmergency) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNameAr = s.nameAr.toLowerCase().includes(q);
        const matchNameEn = (s.nameEn || '').toLowerCase().includes(q);
        const matchCR = s.commercialRegNumber.includes(q);
        const matchContact = s.contactPerson.toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q);
        const matchEmail = s.email.toLowerCase().includes(q);
        const matchCity = s.city.toLowerCase().includes(q);
        return matchNameAr || matchNameEn || matchCR || matchContact || matchPhone || matchEmail || matchCity;
      }

      return true;
    });
  }, [
    suppliers,
    activeView,
    filterStatus,
    filterSpecialty,
    filterVerificationLevel,
    filterCity,
    onlyEmergency,
    searchQuery
  ]);

  // Action: Toggle Status to Approved
  const handleApproveSupplier = (supplierId: string, level?: SupplierVerificationLevel) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === supplierId) {
          const updatedDocs = (s.documents || []).map(d =>
            d.status === 'pending_review'
              ? { ...d, status: 'verified' as const, verifiedAt: new Date().toISOString().split('T')[0], verifiedBy: 'الإدارة المركزية - سبّاق' }
              : d
          );
          const targetLevel = level || (s.verificationLevel === 'standard' ? 'gold_verified' : s.verificationLevel);
          const labelAr = targetLevel === 'platinum_accredited' ? 'شريك بلاتيني معتمد' : targetLevel === 'gold_verified' ? 'شريك ذهبي موثق' : 'شريك فضي معتمد';
          return {
            ...s,
            status: 'approved',
            verificationLevel: targetLevel,
            verificationLabelAr: labelAr,
            documents: updatedDocs
          };
        }
        return s;
      })
    );
    const target = suppliers.find(s => s.id === supplierId);
    showToast(`تم اعتماد المورد وتفعيل حسابه بنجاح: ${target?.nameAr}`);
  };

  // Action: Toggle Status to Pending Verification
  const handleSetPendingSupplier = (supplierId: string) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === supplierId) {
          return {
            ...s,
            status: 'pending_verification',
            verificationLabelAr: 'قيد التدقيق والمراجعة'
          };
        }
        return s;
      })
    );
    showToast('تمت إعادة المورد إلى حالة قيد التدقيق.');
  };

  // Action: Open Suspension Modal
  const handleOpenSuspensionModal = (supplier: Supplier) => {
    setSelectedSupplierForSuspension(supplier);
    setSuspensionForm({
      reasonCategory: 'delayed_execution',
      reasonCategoryAr: 'تأخر جسيم في تنفيذ أمر التوريد وإصدار الشهادات الفنية',
      detailsAr: `رصد مخالفة عدم الالتزام بمهلة التنفيذ المحددة أو تقديم مستندات غير مكتملة لمنشأة عميل.`,
      expectedDuration: 'إيقاف مؤقت حتى معالجة الملاحظات وتحديث التراخيص'
    });
  };

  // Action: Confirm Suspension
  const handleConfirmSuspension = () => {
    if (!selectedSupplierForSuspension) return;

    const newSuspensionRecord: SupplierSuspensionRecord = {
      id: `susp-${Date.now()}`,
      reasonCategory: suspensionForm.reasonCategory,
      reasonCategoryAr: suspensionForm.reasonCategoryAr,
      detailsAr: suspensionForm.detailsAr,
      suspendedAt: new Date().toISOString().split('T')[0],
      suspendedBy: 'إدارة الرقابة والامتثال - سبّاق',
      expectedDuration: suspensionForm.expectedDuration,
      status: 'active_suspension'
    };

    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === selectedSupplierForSuspension.id) {
          return {
            ...s,
            status: 'suspended',
            verificationLabelAr: 'مورد موقوف لمخالفة الالتزام',
            currentSuspensionReason: suspensionForm.detailsAr,
            activeViolationsCount: (s.activeViolationsCount || 0) + 1,
            suspensionHistory: [newSuspensionRecord, ...(s.suspensionHistory || [])]
          };
        }
        return s;
      })
    );

    showToast(`تم إيقاف المورد وتعليق استقباله للطلبات: ${selectedSupplierForSuspension.nameAr}`);
    setSelectedSupplierForSuspension(null);
  };

  // Action: Open Reinstatement Modal
  const handleOpenReinstatementModal = (supplier: Supplier) => {
    setSelectedSupplierForReinstatement(supplier);
    setReinstatementNotes('تم استيفاء كافة الملاحظات الرقابية وتجديد الوثائق الرسمية وتسوية الشكاوى القائمة.');
  };

  // Action: Confirm Reinstatement
  const handleConfirmReinstatement = () => {
    if (!selectedSupplierForReinstatement) return;

    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === selectedSupplierForReinstatement.id) {
          const updatedHistory = (s.suspensionHistory || []).map((rec, idx) =>
            idx === 0
              ? {
                  ...rec,
                  status: 'reinstated' as const,
                  reinstatedAt: new Date().toISOString().split('T')[0],
                  reinstatedBy: 'لجنة الحوكمة والاعتماد - سبّاق',
                  reinstatementNotes: reinstatementNotes
                }
              : rec
          );

          return {
            ...s,
            status: 'approved',
            verificationLabelAr: s.verificationLevel === 'platinum_accredited' ? 'شريك بلاتيني معتمد' : 'شريك ذهبي موثق',
            currentSuspensionReason: undefined,
            suspensionHistory: updatedHistory
          };
        }
        return s;
      })
    );

    showToast(`تم رفع الإيقاف وإعادة تفعيل المورد بنجاح: ${selectedSupplierForReinstatement.nameAr}`);
    setSelectedSupplierForReinstatement(null);
  };

  // Action: Open Document Review Modal
  const handleOpenDocReview = (supplier: Supplier) => {
    setSelectedSupplierForDocs(supplier);
    setActiveDocPreview(supplier.documents?.[0] || null);
    setRejectingDocId(null);
    setRejectionReasonInput('');
  };

  // Action: Approve Single Document
  const handleApproveDoc = (docId: string) => {
    if (!selectedSupplierForDocs) return;

    const updatedDocs = (selectedSupplierForDocs.documents || []).map(d =>
      d.id === docId
        ? {
            ...d,
            status: 'verified' as const,
            verifiedAt: new Date().toISOString().split('T')[0],
            verifiedBy: 'الإدارة المركزية - سبّاق',
            rejectionReason: undefined
          }
        : d
    );

    const updatedSupplier = {
      ...selectedSupplierForDocs,
      documents: updatedDocs
    };

    setSuppliers(prev => prev.map(s => (s.id === selectedSupplierForDocs.id ? updatedSupplier : s)));
    setSelectedSupplierForDocs(updatedSupplier);

    const doc = updatedDocs.find(d => d.id === docId);
    showToast(`تم اعتماد وتوثيق المستند بنجاح: ${doc?.nameAr}`);
  };

  // Action: Reject Single Document
  const handleRejectDoc = (docId: string) => {
    if (!selectedSupplierForDocs || !rejectionReasonInput.trim()) {
      showToast('يرجى كتابة سبب رفض المستند بدقة ليتم إشعار المورد به.');
      return;
    }

    const updatedDocs = (selectedSupplierForDocs.documents || []).map(d =>
      d.id === docId
        ? {
            ...d,
            status: 'rejected' as const,
            rejectionReason: rejectionReasonInput.trim()
          }
        : d
    );

    const updatedSupplier = {
      ...selectedSupplierForDocs,
      documents: updatedDocs
    };

    setSuppliers(prev => prev.map(s => (s.id === selectedSupplierForDocs.id ? updatedSupplier : s)));
    setSelectedSupplierForDocs(updatedSupplier);
    setRejectingDocId(null);
    setRejectionReasonInput('');

    showToast('تم تسجيل رفض المستند وإرسال إشعار للمورد لإعادة رفعه.');
  };

  // Action: Approve All Docs & Activate Supplier
  const handleApproveAllDocsAndSupplier = () => {
    if (!selectedSupplierForDocs) return;

    handleApproveSupplier(selectedSupplierForDocs.id);
    setSelectedSupplierForDocs(null);
  };

  // Action: Open Add Supplier Modal
  const handleOpenAddSupplier = () => {
    setSelectedSupplierForEdit(null);
    setSupplierForm({
      commercialRegNumber: `1010${Math.floor(100000 + Math.random() * 900000)}`,
      nameAr: '',
      nameEn: '',
      city: 'الرياض',
      coverageRegions: ['منطقة الرياض'],
      specialties: ['civil_defense'],
      verificationLevel: 'gold_verified',
      status: 'pending_verification',
      contactPerson: '',
      phone: '05',
      email: '',
      bankName: 'مصرف الراجحي',
      ibanNumber: 'SA4480000',
      vatNumber: '310',
      isAvailableForEmergency: true,
      yearsInMarket: 4,
      descriptionAr: ''
    });
    setIsAddSupplierModalOpen(true);
  };

  // Action: Open Edit Supplier Modal
  const handleOpenEditSupplier = (supplier: Supplier) => {
    setSelectedSupplierForEdit(supplier);
    setSupplierForm({
      commercialRegNumber: supplier.commercialRegNumber,
      nameAr: supplier.nameAr,
      nameEn: supplier.nameEn || '',
      city: supplier.city,
      coverageRegions: supplier.coverageRegionsAr || [supplier.city],
      specialties: supplier.specialties,
      verificationLevel: supplier.verificationLevel,
      status: supplier.status,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      bankName: supplier.bankName || 'مصرف الراجحي',
      ibanNumber: supplier.ibanNumber || 'SA',
      vatNumber: supplier.vatNumber || '310',
      isAvailableForEmergency: supplier.isAvailableForEmergency,
      yearsInMarket: supplier.yearsInMarket,
      descriptionAr: supplier.descriptionAr
    });
    setIsAddSupplierModalOpen(true);
  };

  // Action: Save Add / Edit Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.nameAr.trim() || !supplierForm.commercialRegNumber.trim()) {
      showToast('يرجى تعبئة اسم المنشأة ورقم السجل التجاري.');
      return;
    }

    if (selectedSupplierForEdit) {
      // Update existing
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === selectedSupplierForEdit.id) {
            return {
              ...s,
              commercialRegNumber: supplierForm.commercialRegNumber,
              nameAr: supplierForm.nameAr,
              nameEn: supplierForm.nameEn,
              city: supplierForm.city,
              coverageRegionsAr: supplierForm.coverageRegions,
              specialties: supplierForm.specialties,
              verificationLevel: supplierForm.verificationLevel,
              status: supplierForm.status,
              contactPerson: supplierForm.contactPerson,
              phone: supplierForm.phone,
              email: supplierForm.email,
              bankName: supplierForm.bankName,
              ibanNumber: supplierForm.ibanNumber,
              vatNumber: supplierForm.vatNumber,
              isAvailableForEmergency: supplierForm.isAvailableForEmergency,
              yearsInMarket: supplierForm.yearsInMarket,
              descriptionAr: supplierForm.descriptionAr
            };
          }
          return s;
        })
      );
      showToast(`تم تحديث بيانات المورد: ${supplierForm.nameAr}`);
    } else {
      // Create new
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        commercialRegNumber: supplierForm.commercialRegNumber,
        nameAr: supplierForm.nameAr,
        nameEn: supplierForm.nameEn,
        logoUrl: '',
        status: supplierForm.status,
        verificationLevel: supplierForm.verificationLevel,
        verificationLabelAr:
          supplierForm.status === 'approved'
            ? supplierForm.verificationLevel === 'platinum_accredited'
              ? 'شريك بلاتيني معتمد'
              : 'شريك ذهبي موثق'
            : 'بانتظار التحقق من الوثائق',
        city: supplierForm.city,
        coverageRegionsAr: supplierForm.coverageRegions,
        specialties: supplierForm.specialties,
        accreditationBodiesAr: ['الجهات الرقابية الرسمية'],
        rating: 4.8,
        reviewCount: 0,
        completedOrdersCount: 0,
        onTimeDeliveryRate: 98.0,
        complianceAcceptanceRate: 99.0,
        contactPerson: supplierForm.contactPerson || 'المسؤول المعتمد',
        phone: supplierForm.phone,
        email: supplierForm.email,
        bankName: supplierForm.bankName,
        ibanNumber: supplierForm.ibanNumber,
        vatNumber: supplierForm.vatNumber,
        isAvailableForEmergency: supplierForm.isAvailableForEmergency,
        yearsInMarket: supplierForm.yearsInMarket,
        registeredAt: new Date().toISOString().split('T')[0],
        lastActiveAt: new Date().toISOString().split('T')[0],
        descriptionAr: supplierForm.descriptionAr || 'مزود معتمد ومصنف لدى منصة سبّاق لتقديم خدمات الامتثال والتجهيز الميداني.',
        documents: [
          {
            id: `doc-${Date.now()}-1`,
            docType: 'commercial_registration',
            nameAr: 'السجل التجاري',
            fileNumber: supplierForm.commercialRegNumber,
            issueDate: '2024-01-01',
            expiryDate: '2028-01-01',
            status: supplierForm.status === 'approved' ? 'verified' : 'pending_review',
            fileUrl: '#',
            fileSize: '1.5 MB'
          },
          {
            id: `doc-${Date.now()}-2`,
            docType: 'bank_iban_certificate',
            nameAr: 'شهادة الآيبان البنكي المعتمد',
            fileNumber: `IBAN-${supplierForm.commercialRegNumber}`,
            issueDate: '2024-01-01',
            expiryDate: '2029-01-01',
            status: supplierForm.status === 'approved' ? 'verified' : 'pending_review',
            fileUrl: '#',
            fileSize: '900 KB'
          }
        ],
        suspensionHistory: []
      };

      setSuppliers(prev => [newSupplier, ...prev]);
      showToast(`تم تسجيل المورد الجديد بنجاح: ${newSupplier.nameAr}`);
    }

    setIsAddSupplierModalOpen(false);
  };

  // Helper for Status Badge
  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case 'approved':
        return {
          label: 'معتمد ونشط',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          dot: 'bg-emerald-500'
        };
      case 'pending_verification':
        return {
          label: 'بانتظار التدقيق والتحقق',
          bg: 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse',
          icon: Clock,
          dot: 'bg-amber-500'
        };
      case 'suspended':
        return {
          label: 'موقوف لمخالفات',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: Ban,
          dot: 'bg-rose-600'
        };
      case 'rejected':
        return {
          label: 'طلب مرفوض',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: XCircle,
          dot: 'bg-slate-400'
        };
    }
  };

  // Helper for Level Badge
  const getVerificationLevelBadge = (level: SupplierVerificationLevel) => {
    switch (level) {
      case 'platinum_accredited':
        return { label: 'بلاتيني معتمد', bg: 'bg-gradient-to-r from-slate-900 to-indigo-950 text-indigo-200 border border-indigo-400/40' };
      case 'gold_verified':
        return { label: 'ذهبي موثق', bg: 'bg-amber-100 text-amber-900 border border-amber-300' };
      case 'silver_certified':
        return { label: 'فضي معتمد', bg: 'bg-slate-100 text-slate-700 border border-slate-200' };
      case 'standard':
      default:
        return { label: 'قياسي', bg: 'bg-slate-50 text-slate-600 border border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 font-['Cairo']" id="admin-suppliers-container">
      
      {/* Top Banner & Control Overview */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>إدارة شبكة الموردين ومزودي حلول الامتثال (B2B Marketplace Admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مركز الرقابة على الموردين وتدقيق الوثائق
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              استعراض الموردين المسجلين، التحقق الفوري من الرخص وشهادات السلامة، اعتماد وتصنيف الشركات، وتطبيق الإيقاف الإداري على الموردين المخالفين لضمان جودة وسرعة تصحيح المنشآت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToTab && (
              <button
                type="button"
                id="btn-nav-supplier-performance"
                onClick={() => onNavigateToTab('admin_performance')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/40"
              >
                <TrendingUp className="w-4 h-4 text-indigo-200" />
                <span>لوحة مؤشرات الأداء والـ SLA</span>
              </button>
            )}

            <button
              type="button"
              id="btn-add-new-supplier"
              onClick={handleOpenAddSupplier}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مورد جديد يدوياً</span>
            </button>

            <button
              type="button"
              onClick={() => {
                showToast(`تم تصدير تقرير شامل لـ ${suppliers.length} مورد معتمد ومسجل.`);
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>تصدير السجل (Excel)</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Card 1: Total Suppliers */}
        <div
          onClick={() => {
            setActiveView('directory');
            setFilterStatus('all');
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">إجمالي الموردين</span>
            <Store className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.total}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">مسجلين في المنصة</span>
        </div>

        {/* Card 2: Pending Verification */}
        <div
          onClick={() => {
            setActiveView('pending_verification');
            setFilterStatus('pending_verification');
          }}
          className={`p-4 rounded-2xl border shadow-xs transition-colors cursor-pointer ${
            activeView === 'pending_verification'
              ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-white border-amber-200 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold">بانتظار التدقيق</span>
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
          </div>
          <div className="text-2xl font-black text-amber-900 flex items-center gap-1.5">
            <span>{metrics.pending}</span>
            {metrics.pendingDocsCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                {metrics.pendingDocsCount} وثائق
              </span>
            )}
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">يتطلب مراجعة وقرار</span>
        </div>

        {/* Card 3: Approved & Active */}
        <div
          onClick={() => {
            setActiveView('directory');
            setFilterStatus('approved');
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold">معتمدون ونشطون</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {metrics.approved}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">جاهزون لتلقي الطلبات</span>
        </div>

        {/* Card 4: Suspended */}
        <div
          onClick={() => {
            setActiveView('suspended_log');
            setFilterStatus('suspended');
          }}
          className={`p-4 rounded-2xl border shadow-xs transition-colors cursor-pointer ${
            activeView === 'suspended_log'
              ? 'bg-rose-500/10 border-rose-400 ring-2 ring-rose-400/40'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold">الموقوفون لمخالفات</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">
            {metrics.suspended}
          </div>
          <span className="text-[10px] text-rose-600 font-bold block mt-0.5">معلق ومسحوب الصلاحية</span>
        </div>

        {/* Card 5: Completed Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">العقود المنفذة</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900">
            {metrics.totalCompletedOrders}
          </div>
          <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">أمر توريد وتصحيح</span>
        </div>

        {/* Card 6: Acceptance & Delivery Quality */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">قبول الاعتماد الحكومي</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            %{metrics.avgComplianceRate}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            التسليم بالميعاد: %{metrics.avgDeliveryRate}
          </span>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveView('directory');
              setFilterStatus('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'directory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>الدليل الشامل للموردين ({suppliers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('pending_verification');
              setFilterStatus('pending_verification');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'pending_verification'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>طلبات التدقيق والاعتماد</span>
            {metrics.pending > 0 && (
              <span className="bg-amber-900 text-amber-100 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('suspended_log');
              setFilterStatus('suspended');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'suspended_log'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>سجل الإيقافات والمخالفات</span>
            {metrics.suspended > 0 && (
              <span className="bg-rose-200 text-rose-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {metrics.suspended}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden md:block">
          عرض <strong>{filteredSuppliers.length}</strong> من أصل <strong>{suppliers.length}</strong> مورد
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search Input (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المورد، السجل التجاري، رقم الجوال، اسم المسؤول، أو المدينة..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter (2 Cols) */}
          <div className="lg:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-hidden"
            >
              <option value="all">كل الحالات</option>
              <option value="pending_verification">بانتظار التدقيق ({metrics.pending})</option>
              <option value="approved">معتمد ونشط ({metrics.approved})</option>
              <option value="suspended">موقوف لمخالفات ({metrics.suspended})</option>
              <option value="rejected">مرفوض ({metrics.rejected})</option>
            </select>
          </div>

          {/* Specialty Filter (2 Cols) */}
          <div className="lg:col-span-2">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-hidden"
            >
              <option value="all">كافة التخصصات والأنشطة</option>
              <option value="civil_defense">الدفاع المدني والسلامة</option>
              <option value="balady">البلديات وواجهات المحلات</option>
              <option value="zatca">الفوترة والربط الزكوي</option>
              <option value="technical_security">الكاميرات والضبط الأمني</option>
              <option value="legal_consulting">الاستشارات والاعتراضات</option>
              <option value="environmental">البيئة والتراخيص الوطنية</option>
              <option value="occupational_health">الصحة المهنية والإعاشة</option>
            </select>
          </div>

          {/* City Filter (2 Cols) */}
          <div className="lg:col-span-2">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-hidden"
            >
              <option value="all">كافة المدن والمناطق</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters (1 Col) */}
          <div className="lg:col-span-1 flex items-center">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterSpecialty('all');
                setFilterVerificationLevel('all');
                setFilterCity('all');
                setOnlyEmergency(false);
              }}
              title="إعادة تعيين الفلاتر"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">إعادة ضبط</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tags Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold text-[11px]">مستوى الاعتماد:</span>
          
          <button
            type="button"
            onClick={() => setFilterVerificationLevel('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterVerificationLevel === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>

          <button
            type="button"
            onClick={() => setFilterVerificationLevel('platinum_accredited')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterVerificationLevel === 'platinum_accredited'
                ? 'bg-indigo-900 text-indigo-100'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            ★ شريك بلاتيني
          </button>

          <button
            type="button"
            onClick={() => setFilterVerificationLevel('gold_verified')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterVerificationLevel === 'gold_verified'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ★ شريك ذهبي
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          {/* Emergency Tag Toggle */}
          <button
            type="button"
            onClick={() => setOnlyEmergency(prev => !prev)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              onlyEmergency
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>خدمات الطوارئ والتصحيح العاجل (24-48 ساعة)</span>
          </button>
        </div>
      </div>

      {/* SUPPLIERS LISTING SECTION */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              جرب تغيير معايير البحث أو تصفية الحالات أو قم بإضافة مورد جديد إلى الدليل.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterSpecialty('all');
              setFilterVerificationLevel('all');
              setFilterCity('all');
              setOnlyEmergency(false);
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            مسح الفلاتر
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => {
            const statusBadge = getStatusBadge(supplier.status);
            const levelBadge = getVerificationLevelBadge(supplier.verificationLevel);
            const StatusIcon = statusBadge.icon;

            const pendingDocs = (supplier.documents || []).filter(d => d.status === 'pending_review');
            const verifiedDocs = (supplier.documents || []).filter(d => d.status === 'verified');
            const expiredDocs = (supplier.documents || []).filter(d => d.status === 'expired');

            return (
              <div
                key={supplier.id}
                id={`supplier-card-${supplier.id}`}
                className={`bg-white rounded-3xl border transition-all shadow-xs p-5 sm:p-6 space-y-4 ${
                  supplier.status === 'suspended'
                    ? 'border-rose-300 bg-rose-50/20'
                    : supplier.status === 'pending_verification'
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row: Name, CR, Level, Status Badge */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                        <span>{statusBadge.label}</span>
                      </span>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${levelBadge.bg}`}>
                        {levelBadge.label}
                      </span>

                      {supplier.isAvailableForEmergency && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Zap className="w-3 h-3 text-rose-600" />
                          <span>طوارئ 24/48h</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-['Cairo']">
                        {supplier.nameAr}
                      </h3>
                      {supplier.nameEn && (
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                          ({supplier.nameEn})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>سجل تجاري: <strong className="font-mono text-slate-800">{supplier.commercialRegNumber}</strong></span>
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supplier.city}</span>
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <strong className="text-slate-800">{supplier.rating}</strong>
                        <span className="text-slate-400">({supplier.reviewCount} تقييم)</span>
                      </span>

                      <span>•</span>

                      <span>تاريخ التسجيل: <strong className="text-slate-700">{supplier.registeredAt || '2024-01-01'}</strong></span>
                    </div>
                  </div>

                  {/* Actions Bar (Top Right) */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Document Review Button */}
                    <button
                      type="button"
                      id={`btn-docs-${supplier.id}`}
                      onClick={() => handleOpenDocReview(supplier)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        pendingDocs.length > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/40'
                          : expiredDocs.length > 0
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>تدقيق المستندات</span>
                      {pendingDocs.length > 0 && (
                        <span className="bg-amber-900 text-amber-100 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {pendingDocs.length}
                        </span>
                      )}
                    </button>

                    {/* Status Actions */}
                    {supplier.status === 'pending_verification' && (
                      <button
                        type="button"
                        id={`btn-approve-${supplier.id}`}
                        onClick={() => handleApproveSupplier(supplier.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>اعتماد وتفعيل المورد</span>
                      </button>
                    )}

                    {supplier.status === 'approved' && (
                      <button
                        type="button"
                        id={`btn-suspend-${supplier.id}`}
                        onClick={() => handleOpenSuspensionModal(supplier)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>إيقاف المورد</span>
                      </button>
                    )}

                    {supplier.status === 'suspended' && (
                      <button
                        type="button"
                        id={`btn-reinstate-${supplier.id}`}
                        onClick={() => handleOpenReinstatementModal(supplier)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>رفع الإيقاف وإعادة التفعيل</span>
                      </button>
                    )}

                    {/* Edit Profile Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditSupplier(supplier)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="تعديل بيانات المورد"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Suspension Banner if Active */}
                {supplier.status === 'suspended' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-extrabold flex items-center gap-2">
                        <span>سبب الإيقاف الإداري الحالي:</span>
                        <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[10px] font-black">
                          مخالفة معايير الجودة والتنفيذ
                        </span>
                      </div>
                      <p className="text-rose-800">
                        {supplier.currentSuspensionReason || 'تم تعليق حساب المورد مؤقتاً لسحب صلاحيات استدراج عروض الأسعار.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {supplier.descriptionAr}
                </p>

                {/* Specialties & Accreditation Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">التخصصات المعتمدة:</span>
                  {supplier.specialties.map(specKey => {
                    const info = REMEDIATION_CATEGORIES_INFO[specKey];
                    return (
                      <span
                        key={specKey}
                        className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>{info?.labelAr || specKey}</span>
                      </span>
                    );
                  })}

                  <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

                  <span className="text-[11px] font-bold text-slate-400">نطاق التغطية:</span>
                  {supplier.coverageRegionsAr.slice(0, 3).map((reg, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {reg}
                    </span>
                  ))}
                </div>

                {/* Bottom Matrix: Operational Stats & Contact Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs">
                  
                  <div>
                    <span className="text-[10px] text-slate-400 block">العقود المنفذة بالمنصة</span>
                    <strong className="text-slate-900 font-extrabold text-sm font-['Cairo']">
                      {supplier.completedOrdersCount} معاملة
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">الالتزام بالمواعيد</span>
                    <strong className="text-emerald-700 font-extrabold text-sm font-['Cairo']">
                      %{supplier.onTimeDeliveryRate}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">نسبة قبول الفحص الحكومي</span>
                    <strong className="text-indigo-700 font-extrabold text-sm font-['Cairo']">
                      %{supplier.complianceAcceptanceRate}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">جاهزية الوثائق والتراخيص</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-slate-800">
                        {verifiedDocs.length} من {(supplier.documents || []).length} موثقة
                      </span>
                      {pendingDocs.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="يوجد وثائق بانتظار المراجعة" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Banking Information Peek */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>المسؤول: <strong>{supplier.contactPerson}</strong></span>
                    </span>

                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supplier.phone}</span>
                    </span>

                    <span className="flex items-center gap-1 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supplier.email}</span>
                    </span>
                  </div>

                  {supplier.bankName && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>البنك: <strong className="text-slate-700">{supplier.bankName}</strong></span>
                      <span className="font-mono text-slate-500">({supplier.ibanNumber?.slice(-8)}...)</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: DOCUMENT REVIEW & VERIFICATION DRAWER / MODAL  */}
      {/* ======================================================== */}
      {selectedSupplierForDocs && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-['Cairo']">
                    تدقيق مستندات ورخص: {selectedSupplierForDocs.nameAr}
                  </h3>
                  <p className="text-xs text-slate-400">
                    سجل تجاري: {selectedSupplierForDocs.commercialRegNumber} • المدينة: {selectedSupplierForDocs.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSupplierForDocs(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Guidance Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">متطلبات الاعتماد المعتمدة لدى منصة سبّاق</h4>
                  <p className="text-blue-800 mt-0.5 leading-relaxed">
                    يجب مطابقة السجل التجاري مع نشاط التوريد، والتحقق من سريان رخصة الدفاع المدني أو تصريح الهيئة الهندسية، وشهادة ضريبة القيمة المضافة ZATCA والآيبان البنكي قبل اعتماد المورد لتلقي طلبات استدراج العروض.
                  </p>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  المستندات والوثائق المرفوعة ({(selectedSupplierForDocs.documents || []).length} وثائق)
                </h4>

                <div className="space-y-3">
                  {(selectedSupplierForDocs.documents || []).map((doc) => {
                    const isVerified = doc.status === 'verified';
                    const isPending = doc.status === 'pending_review';
                    const isExpired = doc.status === 'expired';
                    const isRejected = doc.status === 'rejected';

                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                          isPending
                            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                            : isVerified
                            ? 'bg-emerald-50/20 border-emerald-200'
                            : isExpired
                            ? 'bg-rose-50/30 border-rose-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isVerified ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                            }`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm font-['Cairo']">
                                  {doc.nameAr}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-900 font-black animate-pulse'
                                    : isExpired
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {isVerified ? 'معتمد ومطابق' : isPending ? 'بانتظار المراجعة والاعتماد' : isExpired ? 'منتهي الصلاحية' : 'مرفوض'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                رقم الوثيقة: <strong className="font-mono text-slate-700">{doc.fileNumber}</strong> • تاريخ الانتهاء: <strong className="text-slate-700">{doc.expiryDate}</strong> • الحجم: {doc.fileSize || '1.2 MB'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons for Document */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {!isVerified && (
                              <button
                                type="button"
                                onClick={() => handleApproveDoc(doc.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>اعتماد المستند</span>
                              </button>
                            )}

                            {!isRejected && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (rejectingDocId === doc.id) {
                                    setRejectingDocId(null);
                                  } else {
                                    setRejectingDocId(doc.id);
                                    setRejectionReasonInput('المستند غير واضح أو منتهي الصلاحية لدى الجهة المصدرة.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                              >
                                <span>{rejectingDocId === doc.id ? 'إلغاء' : 'رفض المستند'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rejection Note Display if rejected */}
                        {doc.rejectionReason && (
                          <div className="bg-rose-100/70 border border-rose-200 p-2.5 rounded-xl text-rose-900 text-xs">
                            <strong>ملاحظة الرفض: </strong> {doc.rejectionReason}
                          </div>
                        )}

                        {/* Inline Reject Form */}
                        {rejectingDocId === doc.id && (
                          <div className="bg-white p-3 rounded-xl border border-rose-300 space-y-2 mt-2">
                            <label className="font-bold text-slate-700 block text-[11px]">
                              سبب رفض المستند (سيتم إرساله للمورد برسالة تنبيه):
                            </label>
                            <input
                              type="text"
                              value={rejectionReasonInput}
                              onChange={(e) => setRejectionReasonInput(e.target.value)}
                              placeholder="مثال: الترخيص منتهي، أو الرقم لا يطابق السجل التجاري"
                              className="w-full border border-slate-300 rounded-xl p-2 text-xs font-medium focus:border-rose-500 outline-hidden"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRejectingDocId(null)}
                                className="px-3 py-1 text-slate-500 hover:text-slate-700 font-bold"
                              >
                                تراجع
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectDoc(doc.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                              >
                                تأكيد الرفض
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified By Audit Record */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <span>حالة المورد الحالية: </span>
                  <strong className="text-slate-800 font-bold">
                    {getStatusBadge(selectedSupplierForDocs.status).label}
                  </strong>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSupplierForDocs(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                  >
                    إغلاق النافذة
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveAllDocsAndSupplier}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد جميع المستندات وتفعيل المورد</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SUSPENSION REASON & INFRACTION MODAL            */}
      {/* ======================================================== */}
      {selectedSupplierForSuspension && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-rose-950 text-white p-5 flex items-center justify-between border-b border-rose-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-400/30">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Cairo']">
                    إيقاف المورد: {selectedSupplierForSuspension.nameAr}
                  </h3>
                  <p className="text-xs text-rose-200/80">
                    تعليق الصلاحية وسحب استقبال طلبات عروض الأسعار (RFQs)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSupplierForSuspension(null)}
                className="text-rose-300 hover:text-white p-2 rounded-xl hover:bg-rose-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Infraction Category Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">تصنيف سبب الإيقاف الرقابي:</label>
                <select
                  value={suspensionForm.reasonCategory}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    let label = 'تأخر جسيم في تنفيذ أمر التوريد';
                    if (cat === 'expired_license') label = 'انتهاء الرخص المهنية والاعتماد الأمني الإلزامي';
                    if (cat === 'customer_complaint') label = 'تكرار شكاوى المنشآت بخصوص عدم قبول الاعتماد الحكومي';
                    if (cat === 'policy_violation') label = 'مخالفة لائحة المنصة وسياسة الجودة والأسعار';
                    if (cat === 'fraudulent_data') label = 'تقديم مستندات غير مطابقة أو بيانات مضللة';
                    if (cat === 'unqualified_staff') label = 'عدم توفر كادر فني معتمد أو مهندسين مرخصين';

                    setSuspensionForm({
                      ...suspensionForm,
                      reasonCategory: cat,
                      reasonCategoryAr: label
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:border-rose-500"
                >
                  <option value="delayed_execution">تأخر جسيم في تسليم عقود الصيانة أو شهادات السلامة</option>
                  <option value="expired_license">انتهاء الرخص المهنية والاعتماد الأمني الإلزامي</option>
                  <option value="customer_complaint">تكرار شكاوى المنشآت بخصوص عدم قبول الاعتماد الحكومي</option>
                  <option value="policy_violation">مخالفة لائحة المنصة وسياسة الجودة والأسعار</option>
                  <option value="fraudulent_data">تقديم مستندات غير مطابقة أو بيانات مضللة</option>
                  <option value="unqualified_staff">عدم توفر كادر فني معتمد أو مهندسين مرخصين</option>
                  <option value="other">أسباب رقابية وإدارية أخرى</option>
                </select>
              </div>

              {/* Detailed Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">تفاصيل المخالفة والملاحظات الرقابية:</label>
                <textarea
                  rows={3}
                  value={suspensionForm.detailsAr}
                  onChange={(e) => setSuspensionForm({ ...suspensionForm, detailsAr: e.target.value })}
                  placeholder="اكتب التقرير الرقابي وأرقام الطلبات أو الشكاوى المرتبطة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-rose-500 outline-hidden"
                />
              </div>

              {/* Expected Duration */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">مدة الإيقاف المقررة:</label>
                <select
                  value={suspensionForm.expectedDuration}
                  onChange={(e) => setSuspensionForm({ ...suspensionForm, expectedDuration: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="إيقاف مؤقت حتى معالجة الملاحظات وتحديث التراخيص">إيقاف مؤقت حتى استيفاء الملاحظات</option>
                  <option value="إيقاف لمدة 30 يوماً مع إنذار نهائي">إيقاف لمدة 30 يوماً</option>
                  <option value="إيقاف لمدة 90 يوماً">إيقاف لمدة 90 يوماً</option>
                  <option value="إيقاف دائم وسحب الاعتماد من المنصة">إيقاف دائم وسحب الاعتماد</option>
                </select>
              </div>

              {/* Warning box */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                <strong>تنبيه إداري: </strong> سيؤدي إيقاف المورد إلى سحب حسابه فوراً من سوق عروض الأسعار وعدم تمكينه من تقديم عروض جديدة للمنشآت حتى تسوية الملاحظات.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForSuspension(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspension}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  تأكيد إيقاف المورد
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REINSTATEMENT & REACTIVATION MODAL              */}
      {/* ======================================================== */}
      {selectedSupplierForReinstatement && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Cairo']">
                    رفع الإيقاف عن: {selectedSupplierForReinstatement.nameAr}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    إعادة تفعيل الحساب وتمكينه من تقديم عروض الأسعار
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSupplierForReinstatement(null)}
                className="text-emerald-300 hover:text-white p-2 rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">مبررات رفع الإيقاف وإعادة الاعتماد:</label>
                <textarea
                  rows={3}
                  value={reinstatementNotes}
                  onChange={(e) => setReinstatementNotes(e.target.value)}
                  placeholder="تم فحص التراخيص المحدثة وتسوية جميع المطالبات..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForReinstatement(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReinstatement}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  تأكيد إعادة التفعيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD / EDIT SUPPLIER MODAL                       */}
      {/* ======================================================== */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-['Cairo']">
                    {selectedSupplierForEdit ? `تعديل بيانات: ${selectedSupplierForEdit.nameAr}` : 'تسجيل مورد جديد في شبكة سبّاق'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    بيانات المنشأة، التراخيص، الحساب البنكي ونطاق التغطية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم المورد / المنشأة (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.nameAr}
                    onChange={(e) => setSupplierForm({ ...supplierForm, nameAr: e.target.value })}
                    placeholder="مثال: شركة درع السلامة لأنظمة الإطفاء"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم المورد (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={supplierForm.nameEn}
                    onChange={(e) => setSupplierForm({ ...supplierForm, nameEn: e.target.value })}
                    placeholder="e.g. Safety Shield Co."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم السجل التجاري *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={supplierForm.commercialRegNumber}
                    onChange={(e) => setSupplierForm({ ...supplierForm, commercialRegNumber: e.target.value })}
                    placeholder="1010XXXXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المدينة الرئيسية</label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    placeholder="الرياض، جدة، الدمام..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">سنوات الخبرة بالسوق</label>
                  <input
                    type="number"
                    min={1}
                    value={supplierForm.yearsInMarket}
                    onChange={(e) => setSupplierForm({ ...supplierForm, yearsInMarket: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">مستوى الاعتماد والتصنيف</label>
                  <select
                    value={supplierForm.verificationLevel}
                    onChange={(e) => setSupplierForm({ ...supplierForm, verificationLevel: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    <option value="platinum_accredited">شريك بلاتيني معتمد</option>
                    <option value="gold_verified">شريك ذهبي موثق</option>
                    <option value="silver_certified">شريك فضي معتمد</option>
                    <option value="standard">شريك قياسي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الحالة الأولية</label>
                  <select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    <option value="pending_verification">بانتظار تدقيق الوثائق</option>
                    <option value="approved">معتمد ومفعل مباشرة</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الشخص المسؤول / المفوض</label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    placeholder="م. تركي القحطاني"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الجوال الرسمي</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="050XXXXXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="b2b@company.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Bank & Tax Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البنك المعتمد</label>
                  <input
                    type="text"
                    value={supplierForm.bankName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, bankName: e.target.value })}
                    placeholder="مصرف الراجحي، بنك الرياض..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">رقم الآيبان (IBAN)</label>
                  <input
                    type="text"
                    value={supplierForm.ibanNumber}
                    onChange={(e) => setSupplierForm({ ...supplierForm, ibanNumber: e.target.value })}
                    placeholder="SA4480000XXXXXXXXXXXXXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نبذة تعريفية بالمنصة والخدمات</label>
                <textarea
                  rows={2}
                  value={supplierForm.descriptionAr}
                  onChange={(e) => setSupplierForm({ ...supplierForm, descriptionAr: e.target.value })}
                  placeholder="وصف تخصص الشركة وعقود الصيانة المعتمدة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Emergency Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 block">توفر خدمات الطوارئ والتصحيح العاجل</span>
                  <span className="text-[11px] text-slate-500">
                    الاستجابة الفورية لتصحيح مخالفات الرصد خلال 24 إلى 48 ساعة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSupplierForm({ ...supplierForm, isAvailableForEmergency: !supplierForm.isAvailableForEmergency })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    supplierForm.isAvailableForEmergency
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {supplierForm.isAvailableForEmergency ? 'مفعل (24-48h)' : 'غير مفعل'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{selectedSupplierForEdit ? 'حفظ التعديلات' : 'تسجيل المورد الآن'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
