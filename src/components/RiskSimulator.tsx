import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  HelpCircle, 
  Building2, 
  Flame, 
  Scale, 
  DollarSign, 
  Upload, 
  Download, 
  Eye, 
  Check, 
  X, 
  Info, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  FilePlus2, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Establishment, 
  License, 
  DocumentItem, 
  ComplianceViolation, 
  MasterOrder, 
  RiskAssessment,
  DocumentCategory 
} from '../types';
import { 
  calculateEstablishmentRisk, 
  getRiskLevelBadge, 
  formatSAR 
} from '../utils/complianceEngine';

interface RiskSimulatorProps {
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  orders: MasterOrder[];
  onUploadDoc?: (docId?: string) => void;
  onRenewLicense?: (licenseId?: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  onNavigateToTab?: (tab: string) => void;
  showToast?: (msg: string) => void;
}

// Catalog of potential government documents in Saudi regulatory framework
interface CatalogDocumentTemplate {
  id: string;
  title: string;
  category: DocumentCategory;
  categoryLabel: string;
  authority: string;
  description: string;
  riskImpactPoints: number; // How many risk points it eliminates
  fineAvoidanceSAR: number; // Potential fine saved
  icon: string;
  isMandatory: boolean;
}

const SAUDI_DOCUMENTS_CATALOG: CatalogDocumentTemplate[] = [
  {
    id: 'cat-salama-cert',
    title: 'شهادة ترخيص السلامة والوقاية من الحريق (سلامة)',
    category: 'salama',
    categoryLabel: 'الدفاع المدني والسلامة',
    authority: 'المديرية العامة للدفاع المدني (منصة سلامة)',
    description: 'تثبت استيفاء المنشأة لاشتراطات الوقاية من الحريق ومخارج الطوارئ ومعدات الإطفاء المعتمدة.',
    riskImpactPoints: 25,
    fineAvoidanceSAR: 15000,
    icon: '🚒',
    isMandatory: true,
  },
  {
    id: 'cat-waste-contract',
    title: 'عقد إدارة النفايات والنظافة التجارية المعتمد',
    category: 'municipal',
    categoryLabel: 'الاشتراطات البلدية',
    authority: 'أمانة المنطقة / منصة بلدي',
    description: 'عقد ساري مع ناقل نفايات تجارية معتمد، شرط أساسي لسريان وتجديد الرخصة البلدية.',
    riskImpactPoints: 18,
    fineAvoidanceSAR: 8000,
    icon: '🧹',
    isMandatory: true,
  },
  {
    id: 'cat-zatca-cert',
    title: 'شهادة تسجيل ضريبة القيمة المضافة والفوترة الإلكترونية (ZATCA)',
    category: 'zatca',
    categoryLabel: 'الزكاة والضرائب',
    authority: 'هيئة الزكاة والضريبة والجمارك',
    description: 'شهادة التسجيل الضريبي وتفعيل التكامل مع منصة فاتورة وتفادي عقوبات عدم الامتثال الضريبي.',
    riskImpactPoints: 20,
    fineAvoidanceSAR: 10000,
    icon: '📊',
    isMandatory: true,
  },
  {
    id: 'cat-fire-inspection',
    title: 'تقرير الفحص الدوري وصيانة أنظمة الإنذار والإطفاء',
    category: 'salama',
    categoryLabel: 'الدفاع المدني والسلامة',
    authority: 'شركات السلامة المعتمدة بالدفاع المدني',
    description: 'تقرير دوري نصف سنوي يؤكد جاهزية كواشف الدخان والمضخات وشبكة الرش الآلي.',
    riskImpactPoints: 12,
    fineAvoidanceSAR: 5000,
    icon: '🧯',
    isMandatory: true,
  },
  {
    id: 'cat-saudization-cert',
    title: 'شهادة السعودة ونطاقات المعتمدة (منصة قوى)',
    category: 'saudization',
    categoryLabel: 'الموارد البشرية والعمل',
    authority: 'وزارة الموارد البشرية والتنمية الاجتماعية',
    description: 'توثق نسبة التوطين في النطاق الأخضر وتتيح إصدار وتجديد رخص العمل والتأشيرات.',
    riskImpactPoints: 15,
    fineAvoidanceSAR: 6000,
    icon: '👥',
    isMandatory: true,
  },
  {
    id: 'cat-health-certs',
    title: 'الشهادات الصحية للعاملين ومعدّي الأغذية',
    category: 'health_cert',
    categoryLabel: 'الصحة والرقابة البلدية',
    authority: 'منصة بلدي / الهيئة الصحية',
    description: 'شهادات لياقة صحية إلزامية لجميع الموظفين المباشرين للمنتجات والعملاء.',
    riskImpactPoints: 16,
    fineAvoidanceSAR: 10000,
    icon: '🩺',
    isMandatory: true,
  },
  {
    id: 'cat-national-address',
    title: 'شهادة تسجيل العنوان الوطني الموحد للمنشأة',
    category: 'commercial',
    categoryLabel: 'التجارة والبيانات الموحدة',
    authority: 'البريد السعودي (سبل)',
    description: 'العنوان الوطني الرسمي لموقع المنشأة وفروعها، إلزامي لربط السجل التجاري والتراخيص.',
    riskImpactPoints: 10,
    fineAvoidanceSAR: 3000,
    icon: '📍',
    isMandatory: true,
  },
  {
    id: 'cat-cctv-contract',
    title: 'عقد صيانة كاميرات المراقبة الأمنية المعتمد (الضبط الأمني)',
    category: 'safety',
    categoryLabel: 'الأمن والسلامة',
    authority: 'الأمن العام / شركات الضبط الأمني',
    description: 'عقد صيانة دورية لنظام المراقبة التلفزيونية والتسجيل المطابق للاشتراطات الأمنية.',
    riskImpactPoints: 10,
    fineAvoidanceSAR: 5000,
    icon: '📹',
    isMandatory: false,
  },
  {
    id: 'cat-ecom-auth',
    title: 'شهادة توثيق المتجر الإلكتروني (المركز السعودي للأعمال)',
    category: 'commercial',
    categoryLabel: 'التجارة الإلكترونية',
    authority: 'المركز السعودي للأعمال',
    description: 'توثيق المتجر والحساب البنكي التجاري وحماية حقوق المستهلك للمبيعات الرقمية.',
    riskImpactPoints: 8,
    fineAvoidanceSAR: 4000,
    icon: '🌐',
    isMandatory: false,
  },
  {
    id: 'cat-chamber-sub',
    title: 'شهادة الاشتراك السنوي بالغرفة التجارية',
    category: 'chamber',
    categoryLabel: 'الغرفة التجارية',
    authority: 'اتحاد الغرف السعودية',
    description: 'تجديد الاشتراك والتصديق الإلكتروني للوثائق والوكالات التجارية.',
    riskImpactPoints: 6,
    fineAvoidanceSAR: 2000,
    icon: '🏢',
    isMandatory: false,
  }
];

export const RiskSimulator: React.FC<RiskSimulatorProps> = ({
  establishment,
  licenses,
  documents,
  violations,
  orders,
  onUploadDoc,
  onRenewLicense,
  onConsultSpecialist,
  onNavigateToTab,
  showToast
}) => {
  // 1. Baseline calculation from real current data
  const baselineDocs = useMemo(() => {
    return documents.filter(d => d.establishmentId === establishment.id);
  }, [documents, establishment.id]);

  const baselineLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === establishment.id);
  }, [licenses, establishment.id]);

  const baselineRiskAssessment: RiskAssessment = useMemo(() => {
    return calculateEstablishmentRisk(establishment, licenses, documents, violations, orders);
  }, [establishment, licenses, documents, violations, orders]);

  const baselineRiskScore = baselineRiskAssessment.overallScore;
  const baselineComplianceScore = Math.max(0, 100 - baselineRiskScore);
  const baselineFines = baselineRiskAssessment.potentialFinesEstimated;
  const baselineBadge = getRiskLevelBadge(baselineRiskAssessment.level);

  // 2. Simulated state for documents & licenses
  // Each simulated item can have status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  interface SimulatedDocItem extends DocumentItem {
    isSimulatedAdded?: boolean;
    isSimulatedModified?: boolean;
    isSimulatedDeleted?: boolean;
    simulatedStatus?: 'valid' | 'expiring_soon' | 'expired' | 'missing';
  }

  const [simulatedDocs, setSimulatedDocs] = useState<SimulatedDocItem[]>(() => {
    return baselineDocs.map(doc => ({
      ...doc,
      simulatedStatus: doc.status,
      isSimulatedModified: false,
      isSimulatedDeleted: false,
    }));
  });

  // Re-sync if establishment changes
  React.useEffect(() => {
    setSimulatedDocs(
      baselineDocs.map(doc => ({
        ...doc,
        simulatedStatus: doc.status,
        isSimulatedModified: false,
        isSimulatedDeleted: false,
      }))
    );
    setActiveScenario('custom');
  }, [establishment.id, baselineDocs]);

  // Active Scenario Presets
  const [activeScenario, setActiveScenario] = useState<'custom' | 'full_compliance' | 'missing_salama' | 'expired_balady_lease' | 'fix_expired_only'>('custom');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeViewTab, setActiveViewTab] = useState<'sandbox' | 'catalog' | 'comparison' | 'recommendations'>('sandbox');

  // Custom Document Modal
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<DocumentCategory>('municipal');
  const [customAuthority, setCustomAuthority] = useState('وزارة التجارة والبلديات');
  const [customStatus, setCustomStatus] = useState<'valid' | 'expiring_soon' | 'expired'>('valid');

  // 3. Compute Simulated Risk & Compliance Score
  // Filter out deleted docs and map active simulated status
  const effectiveSimulatedDocs: DocumentItem[] = useMemo(() => {
    return simulatedDocs
      .filter(d => !d.isSimulatedDeleted && d.simulatedStatus !== 'missing')
      .map(d => ({
        ...d,
        status: d.simulatedStatus || d.status,
      }));
  }, [simulatedDocs]);

  // Synchronize simulated licenses if corresponding documents are altered
  const effectiveSimulatedLicenses: License[] = useMemo(() => {
    return baselineLicenses.map(lic => {
      // If balady document is deleted or expired, reflect in license
      const isBalady = lic.authority.includes('بلدي') || lic.name.includes('بلدي');
      const isSalama = lic.authority.includes('سلامة') || lic.authority.includes('الدفاع المدني') || lic.name.includes('سلامة');
      
      const baladyDoc = simulatedDocs.find(d => (d.category === 'balady' || d.title.includes('بلدي')) && !d.isSimulatedDeleted);
      const salamaDoc = simulatedDocs.find(d => (d.category === 'salama' || d.title.includes('سلامة')) && !d.isSimulatedDeleted);

      if (isBalady && (!baladyDoc || baladyDoc.simulatedStatus === 'missing' || baladyDoc.isSimulatedDeleted)) {
        return { ...lic, status: 'expired', daysRemaining: -10 };
      }
      if (isBalady && baladyDoc?.simulatedStatus === 'valid') {
        return { ...lic, status: 'active', daysRemaining: 300 };
      }
      if (isSalama && (!salamaDoc || salamaDoc.simulatedStatus === 'missing' || salamaDoc.isSimulatedDeleted)) {
        return { ...lic, status: 'expired', daysRemaining: -10 };
      }
      if (isSalama && salamaDoc?.simulatedStatus === 'valid') {
        return { ...lic, status: 'active', daysRemaining: 300 };
      }
      return lic;
    });
  }, [baselineLicenses, simulatedDocs]);

  // Calculate simulated risk assessment
  const simulatedRiskAssessment: RiskAssessment = useMemo(() => {
    // Also consider missing mandatory documents penalty
    const assessment = calculateEstablishmentRisk(
      establishment,
      effectiveSimulatedLicenses,
      effectiveSimulatedDocs,
      violations,
      orders
    );

    // Calculate penalty if critical safety or municipal documents are completely missing
    let extraMissingRisk = 0;
    let extraMissingFines = 0;
    const hasSalama = effectiveSimulatedDocs.some(d => d.category === 'salama' && d.status === 'valid');
    const hasBalady = effectiveSimulatedDocs.some(d => d.category === 'balady' && d.status === 'valid');
    const hasLease = effectiveSimulatedDocs.some(d => (d.category === 'lease_contract' || d.title.includes('إيجار')) && d.status === 'valid');

    if (!hasSalama) {
      extraMissingRisk += 15;
      extraMissingFines += 10000;
    }
    if (!hasBalady) {
      extraMissingRisk += 20;
      extraMissingFines += 15000;
    }
    if (!hasLease) {
      extraMissingRisk += 10;
      extraMissingFines += 5000;
    }

    const finalScore = Math.min(100, assessment.overallScore + extraMissingRisk);
    const finalFines = assessment.potentialFinesEstimated + extraMissingFines;

    let finalLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (finalScore >= 80) finalLevel = 'critical';
    else if (finalScore >= 60) finalLevel = 'high';
    else if (finalScore >= 30) finalLevel = 'medium';

    return {
      ...assessment,
      overallScore: finalScore,
      level: finalLevel,
      potentialFinesEstimated: finalFines,
    };
  }, [establishment, effectiveSimulatedLicenses, effectiveSimulatedDocs, violations, orders]);

  const simulatedRiskScore = simulatedRiskAssessment.overallScore;
  const simulatedComplianceScore = Math.max(0, 100 - simulatedRiskScore);
  const simulatedFines = simulatedRiskAssessment.potentialFinesEstimated;
  const simulatedBadge = getRiskLevelBadge(simulatedRiskAssessment.level);

  // Delta calculations
  const complianceDelta = simulatedComplianceScore - baselineComplianceScore;
  const riskDelta = simulatedRiskScore - baselineRiskScore;
  const finesDelta = simulatedFines - baselineFines;

  // Track simulated count modifications
  const modifiedCount = simulatedDocs.filter(d => d.isSimulatedModified || d.isSimulatedAdded || d.isSimulatedDeleted).length;

  // Handlers for Sandbox Document Manipulation
  const handleToggleDocStatus = (docId: string, newStatus: 'valid' | 'expiring_soon' | 'expired' | 'missing') => {
    setActiveScenario('custom');
    setSimulatedDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        const isDeleted = newStatus === 'missing';
        return {
          ...doc,
          simulatedStatus: newStatus,
          isSimulatedDeleted: isDeleted,
          isSimulatedModified: true,
        };
      }
      return doc;
    }));
    showToast?.(`تم تحديث حالة المستند إلى (${newStatus === 'valid' ? 'ساري' : newStatus === 'expiring_soon' ? 'ينتهي قريباً' : newStatus === 'expired' ? 'منتهي' : 'محذوف/غير متوفر'}) في المحاكي.`);
  };

  const handleSimulateDeleteDoc = (docId: string) => {
    setActiveScenario('custom');
    setSimulatedDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          isSimulatedDeleted: !doc.isSimulatedDeleted,
          simulatedStatus: !doc.isSimulatedDeleted ? 'missing' : (doc.status || 'valid'),
          isSimulatedModified: true,
        };
      }
      return doc;
    }));
  };

  const handleAddCatalogDoc = (template: CatalogDocumentTemplate) => {
    // Check if already in simulatedDocs
    const exists = simulatedDocs.find(d => d.title.includes(template.title) || d.id === `sim-${template.id}`);
    if (exists && !exists.isSimulatedDeleted) {
      showToast?.(`المستند «${template.title}» موجود بالفعل في ملف المحاكاة.`);
      return;
    }

    setActiveScenario('custom');
    if (exists && exists.isSimulatedDeleted) {
      // Restore
      setSimulatedDocs(prev => prev.map(d => d.id === exists.id ? { ...d, isSimulatedDeleted: false, simulatedStatus: 'valid', isSimulatedModified: true } : d));
    } else {
      const newDoc: SimulatedDocItem = {
        id: `sim-${template.id}-${Date.now()}`,
        establishmentId: establishment.id,
        title: template.title,
        category: template.category,
        documentNumber: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemaining: 365,
        status: 'valid',
        simulatedStatus: 'valid',
        isSimulatedAdded: true,
        isSimulatedModified: true,
        isSimulatedDeleted: false,
        authority: template.authority,
        isMandatory: template.isMandatory,
        fileSize: '1.2 MB (محاكى)',
      };
      setSimulatedDocs(prev => [newDoc, ...prev]);
    }

    showToast?.(`تمت إضافة «${template.title}» إلى المحاكي وتحديث مؤشر الامتثال فورياً.`);
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setActiveScenario('custom');
    const newDoc: SimulatedDocItem = {
      id: `sim-custom-${Date.now()}`,
      establishmentId: establishment.id,
      title: customTitle.trim(),
      category: customCategory,
      documentNumber: `SIM-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + (customStatus === 'expired' ? -10 : customStatus === 'expiring_soon' ? 15 : 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysRemaining: customStatus === 'expired' ? -10 : customStatus === 'expiring_soon' ? 15 : 365,
      status: customStatus,
      simulatedStatus: customStatus,
      isSimulatedAdded: true,
      isSimulatedModified: true,
      isSimulatedDeleted: false,
      authority: customAuthority,
      isMandatory: true,
    };

    setSimulatedDocs(prev => [newDoc, ...prev]);
    setIsAddCustomModalOpen(false);
    setCustomTitle('');
    showToast?.(`تمت إضافة المستند المخصص «${newDoc.title}» إلى المحاكي بنجاح.`);
  };

  // Preset Scenario Handlers
  const handleApplyPreset = (preset: 'full_compliance' | 'missing_salama' | 'expired_balady_lease' | 'fix_expired_only' | 'reset') => {
    setActiveScenario(preset === 'reset' ? 'custom' : preset);

    if (preset === 'reset') {
      setSimulatedDocs(
        baselineDocs.map(doc => ({
          ...doc,
          simulatedStatus: doc.status,
          isSimulatedModified: false,
          isSimulatedDeleted: false,
        }))
      );
      showToast?.('تمت إعادة تعيين محاكي المخاطر إلى الحالة الواقعية الحالية للمنشأة.');
      return;
    }

    if (preset === 'full_compliance') {
      // Make all existing docs valid, undelete all, and add any missing catalog templates
      const activeTitles = new Set(baselineDocs.map(d => d.title));
      const catalogAdditions: SimulatedDocItem[] = SAUDI_DOCUMENTS_CATALOG
        .filter(cat => cat.isMandatory && !activeTitles.has(cat.title))
        .map(cat => ({
          id: `sim-full-${cat.id}`,
          establishmentId: establishment.id,
          title: cat.title,
          category: cat.category,
          documentNumber: `FULL-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysRemaining: 365,
          status: 'valid',
          simulatedStatus: 'valid',
          isSimulatedAdded: true,
          isSimulatedModified: true,
          isSimulatedDeleted: false,
          authority: cat.authority,
          isMandatory: true,
        }));

      const updatedExisting: SimulatedDocItem[] = baselineDocs.map(d => ({
        ...d,
        simulatedStatus: 'valid',
        status: 'valid',
        daysRemaining: 300,
        isSimulatedModified: true,
        isSimulatedDeleted: false,
      }));

      setSimulatedDocs([...catalogAdditions, ...updatedExisting]);
      showToast?.('تم تطبيق سيناريو الامتثال المثالي 100%: جميع التراخيص والمستندات سارية ومكتملة!');
      return;
    }

    if (preset === 'missing_salama') {
      // Simulate deleting or expiring safety certificates
      setSimulatedDocs(prev => prev.map(doc => {
        if (doc.category === 'salama' || doc.title.includes('سلامة') || doc.title.includes('دفاع مدني')) {
          return {
            ...doc,
            simulatedStatus: 'missing',
            isSimulatedDeleted: true,
            isSimulatedModified: true,
          };
        }
        return doc;
      }));
      showToast?.('تم تطبيق سيناريو: فقدان شهادة السلامة والدفاع المدني ومحاكاة ارتفاع المخاطر.');
      return;
    }

    if (preset === 'expired_balady_lease') {
      // Simulate expiring balady license and lease contract
      setSimulatedDocs(prev => prev.map(doc => {
        if (doc.category === 'balady' || doc.category === 'lease_contract' || doc.title.includes('بلدي') || doc.title.includes('إيجار')) {
          return {
            ...doc,
            simulatedStatus: 'expired',
            status: 'expired',
            daysRemaining: -15,
            isSimulatedDeleted: false,
            isSimulatedModified: true,
          };
        }
        return doc;
      }));
      showToast?.('تم تطبيق سيناريو: انتهاء رخصة بلدي وعقد الإيجار التجاري.');
      return;
    }

    if (preset === 'fix_expired_only') {
      // Fix only currently expired/expiring docs to valid
      setSimulatedDocs(prev => prev.map(doc => {
        if (doc.status === 'expired' || doc.status === 'expiring_soon' || doc.simulatedStatus === 'expired' || doc.simulatedStatus === 'expiring_soon') {
          return {
            ...doc,
            simulatedStatus: 'valid',
            daysRemaining: 365,
            isSimulatedDeleted: false,
            isSimulatedModified: true,
          };
        }
        return doc;
      }));
      showToast?.('تم تطبيق سيناريو: تصحيح وتجديد كافة المستندات المنتهية الحالية فقط.');
      return;
    }
  };

  // Filtered documents for Sandbox view
  const filteredSimulatedDocs = useMemo(() => {
    return simulatedDocs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (doc.authority && doc.authority.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (doc.documentNumber && doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCat = selectedCategoryFilter === 'all' || doc.category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [simulatedDocs, searchTerm, selectedCategoryFilter]);

  // Dimension Radar / Bar chart data (Before vs After)
  const comparisonDimensionsData = useMemo(() => {
    // 5 Regulatory Dimensions: Municipal, Safety, Regulatory Docs, Labor, ZATCA
    const getDimensionScores = (docsList: DocumentItem[], licList: License[]) => {
      // Municipal
      const baladyValid = docsList.some(d => d.category === 'balady' && d.status === 'valid') && 
                          licList.some(l => (l.authority.includes('بلدي') || l.name.includes('بلدي')) && l.status === 'active');
      const municipalScore = baladyValid ? 95 : docsList.some(d => d.category === 'balady') ? 50 : 20;

      // Safety (Civil Defense)
      const salamaValid = docsList.some(d => d.category === 'salama' && d.status === 'valid');
      const safetyScore = salamaValid ? 92 : docsList.some(d => d.category === 'salama') ? 45 : 15;

      // Statutory & Commercial Docs (CR, AoA, Lease)
      const crValid = docsList.some(d => d.category === 'cr' && d.status === 'valid');
      const leaseValid = docsList.some(d => (d.category === 'lease_contract' || d.title.includes('إيجار')) && d.status === 'valid');
      const statutoryScore = (crValid ? 50 : 20) + (leaseValid ? 45 : 15);

      // Labor & Saudization (Qiwa, GOSI)
      const gosiValid = docsList.some(d => d.category === 'gosi' && d.status === 'valid');
      const saudValid = docsList.some(d => d.category === 'saudization' && d.status === 'valid');
      const laborScore = (gosiValid ? 45 : 20) + (saudValid ? 45 : 20);

      // ZATCA & Tax
      const zatcaValid = docsList.some(d => d.category === 'zatca' && d.status === 'valid');
      const taxScore = zatcaValid ? 96 : docsList.some(d => d.category === 'zatca') ? 50 : 25;

      return {
        municipal: municipalScore,
        safety: safetyScore,
        statutory: statutoryScore,
        labor: laborScore,
        tax: taxScore,
      };
    };

    const before = getDimensionScores(baselineDocs, baselineLicenses);
    const after = getDimensionScores(effectiveSimulatedDocs, effectiveSimulatedLicenses);

    return [
      { dimension: 'الرخص البلدية', before: before.municipal, after: after.municipal },
      { dimension: 'السلامة والدفاع المدني', before: before.safety, after: after.safety },
      { dimension: 'الوثائق والعقود التجارية', before: before.statutory, after: after.statutory },
      { dimension: 'التوطين ونظام العمل', before: before.labor, after: after.labor },
      { dimension: 'الزكاة والضرائب والفوترة', before: before.tax, after: after.tax },
    ];
  }, [baselineDocs, baselineLicenses, effectiveSimulatedDocs, effectiveSimulatedLicenses]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30">
              <Sliders className="w-3.5 h-3.5 text-indigo-300 animate-spin-slow" />
              <span>أداة المحاكاة الرياضية الذكية</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded">
                What-If Simulator
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cairo'] text-white flex items-center gap-2.5">
              <span>محاكي مخاطر الامتثال وأثر المستندات</span>
              <Sparkles className="w-6 h-6 text-amber-300" />
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              اختبر فورياً ماذا يحدث لمؤشر الامتثال ومستوى المخاطر والغرامات التقديرية لمنشأتك «{establishment.name}» عند إضافة، حذف، أو تجديد أي مستند أو ترخيص حكومي دون أي تأثير على بياناتك الفعلية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleApplyPreset('reset')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>إعادة الضبط للحالة الفعلية</span>
            </button>

            <button
              type="button"
              onClick={() => onConsultSpecialist?.('استشارة خطة تحسين الامتثال المبنية على المحاكاة')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>اعتماد خطة الامتثال المثلى</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Ribbon: Live Real-Time Comparison (Before vs After) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Compliance Score */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مؤشر الامتثال الكلي (0-100%)</span>
            </span>
            {complianceDelta !== 0 && (
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                complianceDelta > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {complianceDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{complianceDelta > 0 ? `+${complianceDelta}%` : `${complianceDelta}%`}</span>
              </span>
            )}
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">بعد المحاكاة:</span>
              <strong className={`text-3xl font-black font-['Cairo'] ${
                simulatedComplianceScore >= 80 ? 'text-emerald-600' : simulatedComplianceScore >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {simulatedComplianceScore}%
              </strong>
            </div>

            <div className="text-left border-r border-slate-100 pr-4">
              <span className="text-[11px] text-slate-400 block mb-0.5">الفعلي الأصلي:</span>
              <span className="text-sm font-bold text-slate-600">
                {baselineComplianceScore}%
              </span>
            </div>
          </div>

          {/* Progress bar comparison */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  simulatedComplianceScore >= 80 ? 'bg-emerald-500' : simulatedComplianceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${simulatedComplianceScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{simulatedComplianceScore >= 80 ? 'نطاق الامتثال المتميز' : simulatedComplianceScore >= 60 ? 'نطاق الامتثال المتوسط' : 'نطاق حرج يستوجب الإجراء'}</span>
              <span>هدف: 100%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Risk Score & Level */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>مؤشر المخاطر والتصنيف</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${simulatedBadge.bg}`}>
              {simulatedBadge.label}
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">درجة الخطر المحاكاة:</span>
              <strong className={`text-3xl font-black font-['Cairo'] ${
                simulatedRiskScore >= 60 ? 'text-rose-600' : simulatedRiskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {simulatedRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </strong>
            </div>

            <div className="text-left border-r border-slate-100 pr-4">
              <span className="text-[11px] text-slate-400 block mb-0.5">الخطر الأصلي:</span>
              <span className="text-sm font-bold text-slate-600">
                {baselineRiskScore} / 100
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
            <span className={`w-2 h-2 rounded-full ${simulatedBadge.dot}`} />
            <span className="truncate">
              {riskDelta < 0 ? `انخفض الخطر بمقدار ${Math.abs(riskDelta)} نقطة` : riskDelta > 0 ? `ارتفع الخطر بمقدار ${riskDelta} نقطة` : 'لا يوجد تغيير بالخطر'}
            </span>
          </div>
        </div>

        {/* Metric 3: Potential Fines Exposure */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>الغرامات التقديرية المحتملة</span>
            </span>
            {finesDelta !== 0 && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                finesDelta < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {finesDelta < 0 ? `توفير ${formatSAR(Math.abs(finesDelta))}` : `إضافة ${formatSAR(finesDelta)}`}
              </span>
            )}
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">الغرامات المحاكاة:</span>
              <strong className="text-2xl sm:text-3xl font-black font-['Cairo'] text-slate-900">
                {formatSAR(simulatedFines)}
              </strong>
            </div>

            <div className="text-left border-r border-slate-100 pr-4">
              <span className="text-[11px] text-slate-400 block mb-0.5">الغرامات الأصلية:</span>
              <span className="text-xs font-bold text-slate-600">
                {formatSAR(baselineFines)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
            <span>الوفورات الصافية المحتملة:</span>
            <span className={`font-bold ${finesDelta < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
              {finesDelta < 0 ? formatSAR(Math.abs(finesDelta)) : '0 ر.س'}
            </span>
          </div>
        </div>

        {/* Metric 4: Simulated Documents Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>محفظة المستندات في المحاكي</span>
            </span>
            {modifiedCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200">
                {modifiedCount} معدّل
              </span>
            )}
          </div>

          <div className="my-3 flex items-center justify-between text-xs">
            <div className="text-center p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex-1 ml-1.5">
              <span className="block text-lg font-black font-mono">
                {effectiveSimulatedDocs.filter(d => d.status === 'valid').length}
              </span>
              <span className="text-[10px] font-bold">ساري ومكتمل</span>
            </div>

            <div className="text-center p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 flex-1 mr-1.5">
              <span className="block text-lg font-black font-mono">
                {simulatedDocs.filter(d => d.simulatedStatus === 'expired' || d.isSimulatedDeleted).length}
              </span>
              <span className="text-[10px] font-bold">منتهي / محذوف</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveViewTab('catalog')}
            className="w-full py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1 border border-indigo-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مستند جديد للمحاكاة</span>
          </button>
        </div>

      </div>

      {/* Preset Quick Scenarios Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm font-['Cairo']">
              سيناريوهات المحاكاة السريعة الجاهزة (Preset Scenarios)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            اضغط لتجربة الأثر على المؤشر بنقرة واحدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          
          <button
            type="button"
            onClick={() => handleApplyPreset('full_compliance')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
              activeScenario === 'full_compliance'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">الامتثال المثالي 100%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-[11px] leading-relaxed ${activeScenario === 'full_compliance' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              محاكاة سريان كافة الوثائق وتجديد التراخيص المنتهية
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('fix_expired_only')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
              activeScenario === 'fix_expired_only'
                ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">تجديد المنتهي الحالي فقط</span>
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-[11px] leading-relaxed ${activeScenario === 'fix_expired_only' ? 'text-indigo-100' : 'text-indigo-800'}`}>
              معالجة الوثائق المنتهية الحالية للمنشأة وإظهار الأثر
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('missing_salama')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
              activeScenario === 'missing_salama'
                ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                : 'bg-rose-50/70 hover:bg-rose-100 text-rose-950 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">غياب شهادة السلامة</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <p className={`text-[11px] leading-relaxed ${activeScenario === 'missing_salama' ? 'text-rose-100' : 'text-rose-800'}`}>
              محاكاة تعطل تصريح الدفاع المدني وعقوبات الإغلاق
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('expired_balady_lease')}
            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
              activeScenario === 'expired_balady_lease'
                ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                : 'bg-amber-50/70 hover:bg-amber-100 text-amber-950 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">انتهاء رخصة بلدي والإيجار</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className={`text-[11px] leading-relaxed ${activeScenario === 'expired_balady_lease' ? 'text-amber-100' : 'text-amber-800'}`}>
              محاكاة انتهاء رخصة النشاط التجاري وعقد الإيجار
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('reset')}
            className="p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">الوضع الفعلي الحالي</span>
              <RotateCcw className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إعادة المؤشر لحالته الواقعية المسجلة حالياً
            </p>
          </button>

        </div>
      </div>

      {/* Navigation Sub-Tabs inside Simulator */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          
          <button
            type="button"
            onClick={() => setActiveViewTab('sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === 'sandbox'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>مختبر المستندات التفاعلي</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
              activeViewTab === 'sandbox' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {simulatedDocs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === 'catalog'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <FilePlus2 className="w-4 h-4 text-indigo-500" />
            <span>مكتبة الاشتراطات والوثائق الحكومية</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
              activeViewTab === 'catalog' ? 'bg-white text-indigo-900' : 'bg-indigo-200 text-indigo-900'
            }`}>
              {SAUDI_DOCUMENTS_CATALOG.length} وثيقة
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === 'comparison'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'text-purple-950 bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Scale className="w-4 h-4 text-purple-500" />
            <span>المقارنة البيانية للمحاور (قبل / بعد)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === 'recommendations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>خطة العمل والتوصيات الإجرائية</span>
          </button>

        </div>

        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => setIsAddCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مستند مخصص</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Interactive Document Sandbox (Table / Grid) */}
      {activeViewTab === 'sandbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          
          {/* Filter & Search Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="بحث في مستندات المحاكي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-right"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">التصنيف:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'municipal', label: 'بلدي' },
                { id: 'salama', label: 'سلامة' },
                { id: 'zatca', label: 'زكاة وضريبة' },
                { id: 'saudization', label: 'توطين وقوى' },
                { id: 'lease_contract', label: 'عقود وإيجار' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">المستند والجهة الرسمية</th>
                  <th className="py-3 px-4">الفرع والموقع</th>
                  <th className="py-3 px-4">الحالة الأصلية</th>
                  <th className="py-3 px-4 text-center">الحالة المحاكاة (تحكم فوري)</th>
                  <th className="py-3 px-4">الأثر على مؤشر الخطر</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSimulatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      لا توجد مستندات مطابقة في المحاكي. يمكنك إضافة مستندات من تبويب «مكتبة الاشتراطات».
                    </td>
                  </tr>
                ) : (
                  filteredSimulatedDocs.map((doc) => {
                    const isDeleted = doc.isSimulatedDeleted || doc.simulatedStatus === 'missing';
                    const currentStatus = doc.simulatedStatus || doc.status;

                    return (
                      <tr 
                        key={doc.id} 
                        className={`transition-colors ${
                          isDeleted 
                            ? 'bg-rose-50/40 text-slate-400 line-through-muted' 
                            : doc.isSimulatedAdded 
                            ? 'bg-indigo-50/30' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Title & Authority */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              isDeleted ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className={`font-bold text-slate-900 ${isDeleted ? 'line-through text-slate-400' : ''}`}>
                                  {doc.title}
                                </h4>
                                {doc.isSimulatedAdded && (
                                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                    مضاف للمحاكاة
                                  </span>
                                )}
                                {doc.isSimulatedModified && !doc.isSimulatedAdded && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                    معدّل
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                {doc.authority || 'الجهة المختصة'} {doc.documentNumber && `• رقم: ${doc.documentNumber}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {doc.branchName || 'المقر الرئيسي'}
                        </td>

                        {/* Baseline Status */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            doc.status === 'valid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : doc.status === 'expiring_soon' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {doc.status === 'valid' ? 'ساري' : doc.status === 'expiring_soon' ? 'ينتهي قريباً' : 'منتهي'}
                          </span>
                        </td>

                        {/* Interactive Status Switcher Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200">
                            
                            <button
                              type="button"
                              onClick={() => handleToggleDocStatus(doc.id, 'valid')}
                              title="محاكاة المستند كساري ومحدث"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'valid' && !isDeleted
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>ساري</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleDocStatus(doc.id, 'expiring_soon')}
                              title="محاكاة اقتراب موعد الانتهاء"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'expiring_soon' && !isDeleted
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-white'
                              }`}
                            >
                              <span>ينتهي قريباً</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleDocStatus(doc.id, 'expired')}
                              title="محاكاة انتهاء الصلاحية"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'expired' && !isDeleted
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                              }`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>منتهي</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSimulateDeleteDoc(doc.id)}
                              title={isDeleted ? 'استعادة المستند للمحاكاة' : 'محاكاة حذف/غياب المستند'}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isDeleted
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isDeleted ? 'محذوف (انقر للاستعادة)' : 'حذف'}</span>
                            </button>

                          </div>
                        </td>

                        {/* Risk Impact Points */}
                        <td className="py-3.5 px-4">
                          {isDeleted ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>+15 إلى +25 نقطة خطر</span>
                            </span>
                          ) : currentStatus === 'valid' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>-10 إلى -20 نقطة خطر</span>
                            </span>
                          ) : currentStatus === 'expired' ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>+12 نقطة خطر</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">
                              +5 نقاط إنذار
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {onUploadDoc && (
                              <button
                                type="button"
                                onClick={() => onUploadDoc(doc.id)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="رفع المستند فعلياً للأرشيف"
                              >
                                <Upload className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Sandbox Footer Info */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>
                التعديلات أعلاه فورية ومخصصة لجلسة المحاكاة فقط، ولا تؤثر على السجلات الحكومية الفعلية أو الأرشيف.
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => handleApplyPreset('reset')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط المحاكي</span>
            </button>
          </div>

        </div>
      )}

      {/* VIEW 2: Saudi Regulatory Documents Catalog (Addable Templates) */}
      {activeViewTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                  <FilePlus2 className="w-4 h-4 text-indigo-600" />
                  <span>مكتبة الاشتراطات والوثائق الحكومية المعتمدة (المملكة العربية السعودية)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  انقر على أي وثيقة لمحاكاة إضافتها لملف منشأتك واكتشاف الأثر المباشر لتوفرها على رفع مؤشر الامتثال وتفادي الغرامات.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مستند مخصص</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAUDI_DOCUMENTS_CATALOG.map((item) => {
                const isAlreadyInSandbox = simulatedDocs.some(
                  d => (d.title.includes(item.title) || d.id === `sim-${item.id}`) && !d.isSimulatedDeleted
                );

                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isAlreadyInSandbox
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl p-1.5 bg-slate-100 rounded-xl">{item.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {item.title}
                              </h4>
                              {item.isMandatory && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                                  إلزامي
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {item.authority} • {item.categoryLabel}
                            </span>
                          </div>
                        </div>

                        {isAlreadyInSandbox ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>مضاف بالمحاكي</span>
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          ⚡ تخفيض الخطر: -{item.riskImpactPoints} نقطة
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          🛡️ وقاية من غرامة: {formatSAR(item.fineAvoidanceSAR)}
                        </span>
                      </div>

                      {isAlreadyInSandbox ? (
                        <button
                          type="button"
                          onClick={() => {
                            const found = simulatedDocs.find(d => d.title.includes(item.title) || d.id === `sim-${item.id}`);
                            if (found) handleSimulateDeleteDoc(found.id);
                          }}
                          className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                        >
                          إزالة من المحاكاة
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCatalogDoc(item)}
                          className="text-xs font-bold text-indigo-800 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ تجربة إضافة هذا المستند</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Dimension Comparison Chart (Recharts Radar & Bar) */}
      {activeViewTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bar Chart: Before vs After across Dimensions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>مقارنة أبعاد الامتثال (الوضع الفعلي vs الوضع المحاكى)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                نسبة الامتثال (0-100%) لكل محور تنظيمي قبل وبعد تعديلات المحاكي.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonDimensionsData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 11 }} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', textAlign: 'right', direction: 'rtl', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => val === 'before' ? 'الوضع الفعلي الحالي' : 'الوضع المحاكى المتوقع'}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar dataKey="before" name="before" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="after" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor Impact Summary Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>التشخيص الفوري لعوامل الخطر المستحدثة أو المحلولة</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تأثير التعديلات التي قمت بها في المحاكي على بنود الفحص الرقابي الرسمية.
              </p>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              
              {complianceDelta > 0 && (
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تحسن ملحوظ في الامتثال (+{complianceDelta}%)</span>
                  </div>
                  <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                    إضافة وتحديث المستندات ألغت نقاط خطر جوهرية وحققت وفورات غرامات تقديرية بقيمة {formatSAR(Math.abs(finesDelta))}.
                  </p>
                </div>
              )}

              {complianceDelta < 0 && (
                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>تراجع في الامتثال ({complianceDelta}%)</span>
                  </div>
                  <p className="text-rose-800/90 leading-relaxed text-[11px]">
                    حذف أو انتهاء بعض المستندات الأساسية (مثل السلامة أو الرخصة البلدية) أضاف غرامات خطر بقيمة {formatSAR(finesDelta)}.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">عوامل الخطر في الوضع المحاكى:</span>
                {simulatedRiskAssessment.factors.map(f => (
                  <div key={f.id} className="flex items-start justify-between text-[11px] text-slate-600 border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <span>• {f.factor}</span>
                    <span className="font-bold text-slate-800 shrink-0 font-mono">+{f.points} نقطة</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">معدل التغيير الكلي:</span>
              <span className={`font-black text-sm ${complianceDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {complianceDelta >= 0 ? `+${complianceDelta}% تحسن` : `${complianceDelta}% تراجع`}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 4: Actionable Recommendations & Roadmap */}
      {activeViewTab === 'recommendations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>خطة العمل التنفيذية للوصول لأعلى درجة امتثال (100%)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              بناءً على سيناريو المحاكاة الخاص بك، هذه هي الإجراءات العملية ذات الأولوية القصوى لرفع مؤشر منشأتك وحمايتها من الغرامات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  خطوة 1: عاجلة
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  رفع شهادة السلامة وتصريح الدفاع المدني
                </h4>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  تحديث تقرير السلامة الفني يوفر 15,000 ر.س غرامة فورية ويخفض مؤشر المخاطر بـ 25 نقطة.
                </p>
              </div>

              {onUploadDoc && (
                <button
                  type="button"
                  onClick={() => onUploadDoc()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع المستند الآن</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  خطوة 2: تجديد بلدي
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  تجديد الرخصة البلدية وعقد النظافة
                </h4>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  تجديد رخصة النشاط التجاري قبل مهلة الانتهاء يمنع تعليق السجل التجاري في منصة بلدي.
                </p>
              </div>

              {onRenewLicense && (
                <button
                  type="button"
                  onClick={() => onRenewLicense()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>بدء طلب التجديد الفوري</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  خطوة 3: استشارة
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  تدقيق وقائي مع مستشار سبّاق
                </h4>
                <p className="text-xs text-purple-900/80 leading-relaxed">
                  مراجعة فنية لكافة وثائق الفروع ومطابقتها مع التحديثات الأخيرة للوائح التنظيمية 2026.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onConsultSpecialist?.('استشارة خطة تحسين الامتثال الشاملة')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>طلب المستشار المتخصص</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Add Custom Document to Sandbox */}
      {isAddCustomModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Cairo']">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-indigo-600" />
                <span>إضافة مستند مخصص لمحاكي المخاطر</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم أو عنوان المستند <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ترخيص الهيئة العامة للغذاء والدواء"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-right text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الجهة الحكومية المصدرة
                </label>
                <input
                  type="text"
                  placeholder="مثال: أمانة منطقة الرياض / وزارة التجارة"
                  value={customAuthority}
                  onChange={(e) => setCustomAuthority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-right text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تصنيف المستند
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-hidden"
                  >
                    <option value="municipal">بلدي ورخص النشاط</option>
                    <option value="salama">دفاع مدني وسلامة</option>
                    <option value="zatca">زكاة وضريبة</option>
                    <option value="saudization">توطين وقوى</option>
                    <option value="lease_contract">عقود إيجار</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    حالة الصلاحية في المحاكاة
                  </label>
                  <select
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-hidden"
                  >
                    <option value="valid">ساري ومكتمل</option>
                    <option value="expiring_soon">ينتهي قريباً (15 يوم)</option>
                    <option value="expired">منتهي الصلاحية</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  إضافة للمحاكي فوراً
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
