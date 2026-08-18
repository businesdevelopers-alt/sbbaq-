/**
 * أنواع وتصنيفات حلول المعالجة والامتثال
 */
export type RemediationCategory = 
  | 'civil_defense'        // الدفاع المدني والسلامة
  | 'balady'               // التراخيص والبلديات واللافتات
  | 'zatca'                // الفوترة الإلكترونية والربط
  | 'qiwa_muqeem'          // العمل والتشغيل وتوطين المهن
  | 'occupational_health'  // السلامة والصحة المهنية
  | 'legal_consulting'     // الاستشارات واللوائح والاعتراضات
  | 'environmental'        // البيئة والتخلص من النفايات
  | 'technical_security';  // الأمن السيبراني والكاميرات والربط

export type SolutionFulfillmentType = 'product' | 'service' | 'consultation' | 'integrated_bundle';

export type SupplierVerificationLevel = 'platinum_accredited' | 'gold_verified' | 'silver_certified' | 'standard';

export type SupplyRequestStatus = 
  | 'open_for_quotes'      // متاح لتلقي العروض
  | 'under_evaluation'     // قيد مراجعة العروض
  | 'quote_accepted'       // تم اختيار عرض وتأكيده
  | 'in_execution'         // جاري التنفيذ والتوريد
  | 'inspection_pending'   // بانتظار الفحص والمعاينة
  | 'completed'            // مكتمل ومطابق
  | 'cancelled';           // ملغي

export type QuoteStatus = 
  | 'submitted'            // تم التقديم
  | 'under_review'         // قيد المراجعة
  | 'shortlisted'          // في القائمة القصيرة
  | 'accepted'             // مقبول
  | 'rejected'             // مرفوض
  | 'expired';             // منتهي الصلاحية

/**
 * 1. Remediation Solution - حلول المعالجة والامتثال
 */
export interface RemediationSolution {
  id: string;
  code: string; // e.g. SOL-DEF-01
  titleAr: string;
  titleEn?: string;
  category: RemediationCategory;
  categoryLabelAr: string;
  fulfillmentType: SolutionFulfillmentType;
  fulfillmentLabelAr: string;
  descriptionAr: string;
  targetViolationsOrRequirements: string[]; // أنواع المخالفات أو الاشتراطات التي يعالجها
  targetAgencies: string[]; // الجهات الحكومية المستهدفة (بلدي، الدفاع المدني، زكاة، قوى...)
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  priceUnitAr: string; // ريال / لكل موقع، ريال / جهاز، ريال / استشارة
  estimatedLeadDays: number; // الوقت التقديري للإنجاز بالأيام
  deliverablesAr: string[]; // المخرجات والشهادات المسلّمة (تقرير سلامة معتمد، فحص كاميرات، عقد صيانة...)
  complianceWarrantyMonths: number; // مدة ضمان القبول لدى الجهة الرقابية
  iconName: string; // اسم أيقونة Lucide
  badgeLabelAr?: string;
  popularRequirement?: boolean;
  featured?: boolean;
  applicableActivitiesAr?: string[]; // الأنشطة التجارية المتوافقة (مطاعم، مقاولات، مستودعات...)
}

export type SupplierStatus = 'pending_verification' | 'approved' | 'suspended' | 'rejected';

export type SupplierDocumentType = 
  | 'commercial_registration' // السجل التجاري
  | 'zatca_tax_certificate'    // شهادة الزكاة وضريبة القيمة المضافة
  | 'gosi_certificate'         // شهادة التأمينات الاجتماعية
  | 'safety_license'           // رخصة السلامة أو ترخيص الدفاع المدني / الهيئة الهندسية
  | 'saudization_nitaqat'      // شهادة التوطين (نطاقات)
  | 'bank_iban_certificate'    // شهادة الآيبان البنكي المعتمد
  | 'chamber_membership';      // اشتراك الغرفة التجارية

export interface SupplierDocument {
  id: string;
  docType: SupplierDocumentType;
  nameAr: string;
  fileNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'verified' | 'pending_review' | 'rejected' | 'expired';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
  fileSize?: string;
}

export interface SupplierSuspensionRecord {
  id: string;
  reasonCategory: 'delayed_execution' | 'unqualified_staff' | 'customer_complaint' | 'expired_license' | 'policy_violation' | 'fraudulent_data' | 'other';
  reasonCategoryAr: string;
  detailsAr: string;
  suspendedAt: string;
  suspendedBy: string;
  expectedDuration?: string;
  status: 'active_suspension' | 'reinstated';
  reinstatedAt?: string;
  reinstatedBy?: string;
  reinstatementNotes?: string;
}

/**
 * 2. Supplier - الموردون ومزودو الخدمة المعتمدون
 */
export interface Supplier {
  id: string;
  commercialRegNumber: string;
  nameAr: string;
  nameEn?: string;
  logoUrl?: string;
  status: SupplierStatus; // 'pending_verification' | 'approved' | 'suspended' | 'rejected'
  verificationLevel: SupplierVerificationLevel;
  verificationLabelAr: string;
  city: string;
  coverageRegionsAr: string[]; // الرياض، مكة المكرمة، الشرقية...
  specialties: RemediationCategory[];
  accreditationBodiesAr: string[]; // هيئة الدفاع المدني، الهيئة العامة للمواصفات، الهيئة السعودية للمهندسين...
  rating: number; // 4.9
  reviewCount: number;
  completedOrdersCount: number;
  onTimeDeliveryRate: number; // 98%
  complianceAcceptanceRate: number; // 99.5% نسبة قبول الفحص والاعتماد الحكومي
  contactPerson: string;
  phone: string;
  email: string;
  isAvailableForEmergency: boolean; // توفر خدمات الطوارئ والتصحيح العاجل (24-48 ساعة)
  yearsInMarket: number;
  descriptionAr: string;
  registeredAt?: string;
  lastActiveAt?: string;
  bankName?: string;
  ibanNumber?: string;
  vatNumber?: string;
  documents?: SupplierDocument[];
  suspensionHistory?: SupplierSuspensionRecord[];
  currentSuspensionReason?: string;
  activeViolationsCount?: number;
}

/**
 * 3. Supply Request - طلب التوريد / استدراج عروض الأسعار
 */
export interface SupplyRequest {
  id: string;
  requestNumber: string; // e.g. REQ-2026-0814
  establishmentId: string;
  establishmentName: string;
  branchId?: string;
  branchName?: string;
  linkedViolationId?: string; // إذا كان الطلب ناتجاً عن مخالفة محددة
  linkedRequirementId?: string;
  solutionId?: string; // الحل المختار من الكتالوج (إن وجد)
  titleAr: string;
  category: RemediationCategory;
  urgencyLevel: 'normal' | 'urgent_inspection' | 'deadline_approaching' | 'emergency';
  deadlineDate: string; // آخر موعد لتلقي العروض
  targetExecutionDate?: string; // الموعد المستهدف للإنجاز
  status: SupplyRequestStatus;
  statusLabelAr: string;
  locationCity: string;
  locationAddressDetails?: string;
  scopeDescriptionAr: string;
  requiredDeliverablesAr: string[];
  maxBudget?: number;
  quotesReceivedCount: number;
  selectedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

/**
 * 4. Supplier Quote - عرض السعر المقدم من المورد
 */
export interface SupplierQuote {
  id: string;
  quoteNumber: string; // e.g. QT-9941
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierVerificationLevel: SupplierVerificationLevel;
  supplierRating: number;
  priceSAR: number;
  vatSAR: number;
  totalSAR: number;
  proposedExecutionDays: number;
  validUntil: string; // تاريخ صلاحية العرض
  status: QuoteStatus;
  statusLabelAr: string;
  proposalSummaryAr: string;
  deliverablesOfferedAr: string[];
  includedWarrantyMonths: number;
  hasOfficialCertificationLetter: boolean; // يشمل خطاب اعتماد رسمي للمنصة الرقابية
  technicalNotes?: string;
  submittedAt: string;
  isBestValue?: boolean;
}

/**
 * 5. Order Status History - سجل تتبع دورة حياة وتغير حالات طلبات التوريد
 */
export interface OrderStatusHistoryItem {
  id: string;
  requestId: string;
  requestNumber: string;
  previousStatus?: SupplyRequestStatus;
  newStatus: SupplyRequestStatus;
  statusLabelAr: string;
  changedBy: string; // e.g. "المورد: شركة درع السلامة" أو "مدير الامتثال" أو "النظام الآلي"
  timestamp: string;
  commentsAr: string;
  attachmentsCount?: number;
  actionRequiredFrom?: 'establishment' | 'supplier' | 'government_inspector' | 'none';
}

// ============================================================================
// البيانات التجريبية الغنية والواقعية للسوق السعودي (MOCK DATA)
// ============================================================================

/**
 * 1. كتالوج حلول الامتثال والتوريد الذكي
 */
export const MOCK_REMEDIATION_SOLUTIONS: RemediationSolution[] = [
  {
    id: 'sol-cd-01',
    code: 'SOL-DEF-01',
    titleAr: 'تأهيل وتوريد شبكات إنذار ومكافحة الحريق وعقد صيانة الدفاع المدني (سلامة)',
    titleEn: 'Fire Alarm & Fighting System Overhaul with Salama Maintenance Contract',
    category: 'civil_defense',
    categoryLabelAr: 'السلامة والدفاع المدني',
    fulfillmentType: 'integrated_bundle',
    fulfillmentLabelAr: 'باقة توريد وتركيب وعقد صيانة',
    descriptionAr: 'حل متكامل يشمل فحص وتوريد طفايات الحريق، كواشف الدخان والحرارة، مضخات الحريق، وإصدار عقد صيانة إلكتروني معتمد عبر منصة سلامة لمدة عام كامل.',
    targetViolationsOrRequirements: [
      'عدم وجود عقد صيانة لأنظمة الوقاية من الحريق',
      'انتهاء صلاحية طفايات الحريق أو عدم ملاءمتها للمساحة',
      'تعطل لوحة التحكم بإنذار الحريق أو كواشف الدخان'
    ],
    targetAgencies: ['المديرية العامة للدفاع المدني', 'منصة سلامة', 'أمانة المنطقة'],
    estimatedPriceMin: 3500,
    estimatedPriceMax: 12000,
    priceUnitAr: 'ريال / للمنشأة (حسب المساحة ونوع النشاط)',
    estimatedLeadDays: 4,
    deliverablesAr: [
      'عقد صيانة ساري وموثق عبر بوابة سلامة',
      'تقرير فحص فني وشهادة تركيب معتمدة',
      'تجهيز طفايات الحريق وكواشف الدخان مع ملصقات الفحص الدوري'
    ],
    complianceWarrantyMonths: 12,
    iconName: 'ShieldAlert',
    badgeLabelAr: 'الأعلى طلباً',
    popularRequirement: true,
    featured: true,
    applicableActivitiesAr: ['مطاعم ومقاهي', 'مستودعات وتخزين', 'مراكز تجارية', 'مكاتب ومقرات إدارية']
  },
  {
    id: 'sol-balady-02',
    code: 'SOL-BAL-02',
    titleAr: 'تصحيح اشتراطات واجهات المحلات واللوحات التجارية والكاميرات (امتثال بلدي)',
    titleEn: 'Storefront & Signage Compliance Overhaul (Balady Regulations)',
    category: 'balady',
    categoryLabelAr: 'البلديات والتراخيص',
    fulfillmentType: 'service',
    fulfillmentLabelAr: 'خدمة فحص وتعديل ميداني',
    descriptionAr: 'معالجة التشوه البصري، ضبط مقاسات ومواصفات اللوحات الإعلانية وفق كود البناء السعودي ودليل اللوحات التجارية المعتمد من وزارة البلديات والإسكان.',
    targetViolationsOrRequirements: [
      'مخالفة مقاسات اللوحة التجارية لترخيص البلدية',
      'وجود تشوه بصري أو بروز غير مطابق في واجهة المحل',
      'عدم تركيب كاميرات مراقبة أمنية خارجية وفق اشتراطات بلدي'
    ],
    targetAgencies: ['وزارة البلديات والإسكان', 'أمانات المناطق', 'منصة بلدي'],
    estimatedPriceMin: 2200,
    estimatedPriceMax: 7800,
    priceUnitAr: 'ريال / للواجهة',
    estimatedLeadDays: 3,
    deliverablesAr: [
      'تقرير فني بالامتثال الهندسي للوحة والواجهة',
      'صور فوتوغرافية ومخطط معتمد للرفع على منصة بلدي',
      'معالجة الملاحظات الرقابية قبل انتهاء مهلة التصحيح'
    ],
    complianceWarrantyMonths: 6,
    iconName: 'Building2',
    badgeLabelAr: 'معتمد بلدي',
    popularRequirement: true,
    featured: true,
    applicableActivitiesAr: ['تجارة التجزئة', 'محلات الخدمات', 'مطاعم وسياحة', 'مراكز صيانة']
  },
  {
    id: 'sol-zatca-03',
    code: 'SOL-ZAT-03',
    titleAr: 'تكامل الربط والفوترة الإلكترونية (المرحلة الثانية - الربط والتكامل فاتورة)',
    titleEn: 'ZATCA Phase 2 E-Invoicing (Fatoora) Integration & Compliance Audit',
    category: 'zatca',
    categoryLabelAr: 'الزكاة والضريبة والجمارك',
    fulfillmentType: 'service',
    fulfillmentLabelAr: 'حل تقني وتدقيق برمجي',
    descriptionAr: 'ربط أنظمة نقاط البيع وبرامج المحاسبة (ERP / POS) مباشرة مع بوابة هيئة الزكاة والضريبة والجمارك (فاتورة)، وإصدار شهادات الامتثال Cryptographic Stamps وتوليد QR Code المتوافق.',
    targetViolationsOrRequirements: [
      'عدم الربط مع منصة فاتورة في الموعد الإلزامي للمجموعة',
      'إصدار فواتير ضريبية مبسطة تفتقر لرمز الاستجابة السريعة المشفر',
      'عدم توفر متطلبات منع التلاعب والأرشفة السحابية'
    ],
    targetAgencies: ['هيئة الزكاة والضريبة والجمارك (ZATCA)', 'منصة فاتورة'],
    estimatedPriceMin: 1800,
    estimatedPriceMax: 6500,
    priceUnitAr: 'ريال / للمنشأة ونقاط البيع',
    estimatedLeadDays: 2,
    deliverablesAr: [
      'شهادة ربط وتكامل فني معتمدة من ZATCA',
      'تدريب وتأهيل المحاسبين على آلية الإلغاء والاشعارات المدينة/الدائنة',
      'ضمان فني ضد أخطاء المزامنة والرفض'
    ],
    complianceWarrantyMonths: 12,
    iconName: 'Receipt',
    badgeLabelAr: 'ربط سحابي فوري',
    popularRequirement: true,
    featured: true,
    applicableActivitiesAr: ['جميع الأنشطة الملزمة بالمرحلة الثانية', 'شركات التوريد', 'الخدمات المهنية', 'المتاجر والمطاعم']
  },
  {
    id: 'sol-qiwa-04',
    code: 'SOL-QIW-04',
    titleAr: 'حزمة لوائح تنظيم العمل وتوثيق العقود واشتراطات نطاقات وقوى',
    titleEn: 'Qiwa Internal Regulations, Contract Attestation & Saudization Matrix',
    category: 'qiwa_muqeem',
    categoryLabelAr: 'العمل والتشغيل (قوى ومقيم)',
    fulfillmentType: 'consultation',
    fulfillmentLabelAr: 'استشارات ولوائح قانونية عمالية',
    descriptionAr: 'صياغة واعتماد لائحة تنظيم العمل الداخلية إلكترونياً عبر قوى، تسوية نسب التوطين وحساب وزن المنشأة في نطاقات، وتدقيق توثيق عقود 100% من العاملين.',
    targetViolationsOrRequirements: [
      'عدم وجود لائحة تنظيم عمل داخلية معتمدة لمنشأة تتجاوز 10 عمال',
      'تدني نسبة توثيق العقود عبر منصة قوى عن النسبة الإلزامية',
      'وجود مخالفات في اشتراطات بيئة العمل ومقرات السكن للعمالة'
    ],
    targetAgencies: ['وزارة الموارد البشرية والتنمية الاجتماعية', 'منصة قوى', 'منصة مدد'],
    estimatedPriceMin: 1500,
    estimatedPriceMax: 4500,
    priceUnitAr: 'ريال / حزمة متكاملة',
    estimatedLeadDays: 3,
    deliverablesAr: [
      'لائحة تنظيم عمل موحدة وموثقة بوزارة الموارد البشرية',
      'مصفوفة خطة التوطين وتفادي النزول للنطاق الأحمر أو الأصفر',
      'تقرير اكتمال توثيق العقود وربط منصة مدد لحماية الأجور'
    ],
    complianceWarrantyMonths: 6,
    iconName: 'Briefcase',
    badgeLabelAr: 'قانوني معتمد',
    popularRequirement: false,
    featured: false,
    applicableActivitiesAr: ['الشركات ذات الكثافة العمالية', 'المقاولات والتشغيل والصيانة', 'المؤسسات الفردية', 'الضيافة']
  },
  {
    id: 'sol-cctv-05',
    code: 'SOL-SEC-05',
    titleAr: 'توريد وتركيب كاميرات المراقبة الأمنية والربط مع المنصة المركزية (عين)',
    titleEn: 'Security CCTV Supply, Calibration & MOI/Balady Link Certification',
    category: 'technical_security',
    categoryLabelAr: 'الأمن والرقابة التقنية',
    fulfillmentType: 'product',
    fulfillmentLabelAr: 'توريد وتجهيز وشهادة إنجاز',
    descriptionAr: 'توفير كاميرات مراقبة عالية الدقة IP بدقة 4K مع أجهزة تسجيل NVR وتخزين 31-60 يوماً حسب متطلبات الأمن العام والبلديات، وتقديم شهادة ضبط زوايا الكاميرات.',
    targetViolationsOrRequirements: [
      'عدم تركيب كاميرات مراقبة أمنية في المنشأة',
      'عدم تغطية مداخل ومخارج المنشأة أو انخفاض مدة حفظ التسجيلات عن 30 يوماً',
      'عدم وجود عقد صيانة لكاميرات المراقبة'
    ],
    targetAgencies: ['الأمن العام / الشرطة', 'وزارة البلديات والإسكان', 'الدفاع المدني'],
    estimatedPriceMin: 3200,
    estimatedPriceMax: 9500,
    priceUnitAr: 'ريال / نظام كامل شامل 4 إلى 8 كاميرات والتخزين',
    estimatedLeadDays: 2,
    deliverablesAr: [
      'شهادة تركيب كاميرات معتمدة للتقديم للبلدية والجهات الأمنية',
      'عقد صيانة دوري لمدة عام',
      'تجهيز تطبيق المراقبة عن بعد للمالك والإدارة'
    ],
    complianceWarrantyMonths: 24,
    iconName: 'Camera',
    badgeLabelAr: 'ضمان سنتين',
    popularRequirement: true,
    featured: true,
    applicableActivitiesAr: ['المحلات التجارية', 'المجمعات السكنية', 'الفنادق والشقق المفروشة', 'محطات الوقود', 'الصيدليات']
  },
  {
    id: 'sol-legal-06',
    code: 'SOL-LEG-06',
    titleAr: 'إعداد مذكرات الاعتراض القانوني على المخالفات البلدية والعمالية',
    titleEn: 'Legal Objection Briefs & Grievance Drafting for Penalties',
    category: 'legal_consulting',
    categoryLabelAr: 'الاستشارات والاعتراضات القانونية',
    fulfillmentType: 'consultation',
    fulfillmentLabelAr: 'صياغة قانونية ومتابعة اعتراض',
    descriptionAr: 'دراسة وتحليل الأسانيد النظامية للمخالفة المرصودة، وصياغة مذكرة اعتراض قانونية متخصصة مدعمة بالأدلة والبراهين ورفعها عبر البوابات الرسمية قبل انتهاء المهلة النظامية.',
    targetViolationsOrRequirements: [
      'مخالفات بلدية باهظة تم تحريرها دون مراعاة فترة الإنذار',
      'غرامات كيدية أو غير مطابقة للواقع الميداني للمنشأة',
      'قرارات إدارية بإغلاق المنشأة أو تجميد السجل'
    ],
    targetAgencies: ['لجان الفصل في المخالفات البلدية', 'المحاكم الإدارية (ديوان المظالم)', 'لجان وزارة الموارد البشرية'],
    estimatedPriceMin: 900,
    estimatedPriceMax: 3500,
    priceUnitAr: 'ريال / للمخالفة أو المذكرة',
    estimatedLeadDays: 1,
    deliverablesAr: [
      'مذكرة اعتراض نظامية مفصلة وموقعة من محامٍ مرخص',
      'ملف الأدلة والمستندات الداعمة',
      'متابعة حالة الاعتراض حتى صدور القرار النهائي'
    ],
    complianceWarrantyMonths: 3,
    iconName: 'FileText',
    badgeLabelAr: 'تنفيذ خلال 24 ساعة',
    popularRequirement: false,
    featured: false,
    applicableActivitiesAr: ['كافة المنشآت التي صدرت بحقها مخالفات أو غرامات']
  }
];

/**
 * 2. موردون ومزودو خدمات معتمدون ومصنفون
 */
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    commercialRegNumber: '1010884921',
    nameAr: 'شركة درع السلامة لأنظمة الإطفاء والإنذار المعتمدة',
    nameEn: 'Safety Shield Fire & Alarm Certified Co.',
    logoUrl: '',
    status: 'approved',
    verificationLevel: 'platinum_accredited',
    verificationLabelAr: 'شريك بلاتيني معتمد',
    city: 'الرياض',
    coverageRegionsAr: ['منطقة الرياض', 'المنطقة الشرقية', 'منطقة مكة المكرمة'],
    specialties: ['civil_defense', 'occupational_health'],
    accreditationBodiesAr: ['المديرية العامة للدفاع المدني', 'الهيئة السعودية للمهندسين', 'منصة سلامة'],
    rating: 4.95,
    reviewCount: 248,
    completedOrdersCount: 512,
    onTimeDeliveryRate: 99.1,
    complianceAcceptanceRate: 100.0,
    contactPerson: 'م. تركي القحطاني',
    phone: '0501122334',
    email: 'b2b@safetyshield-sa.com',
    isAvailableForEmergency: true,
    yearsInMarket: 9,
    registeredAt: '2024-03-15',
    lastActiveAt: '2026-08-16',
    bankName: 'مصرف الراجحي',
    ibanNumber: 'SA4480000456608010123456',
    vatNumber: '310188492100003',
    descriptionAr: 'شركة رائدة معتمدة من الدفاع المدني ومنصة سلامة متخصصة في توريد وتركيب وصيانة شبكات مكافحة الحريق مع إصدار العقود الإلكترونية الفورية.',
    documents: [
      {
        id: 'doc-sup01-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري الرئيسي',
        fileNumber: '1010884921',
        issueDate: '2021-02-10',
        expiryDate: '2028-02-10',
        status: 'verified',
        verifiedAt: '2024-03-16',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '1.8 MB'
      },
      {
        id: 'doc-sup01-2',
        docType: 'safety_license',
        nameAr: 'ترخيص المديرية العامة للدفاع المدني (فئة أ)',
        fileNumber: 'CD-RYD-99824',
        issueDate: '2023-01-01',
        expiryDate: '2027-01-01',
        status: 'verified',
        verifiedAt: '2024-03-16',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '2.4 MB'
      },
      {
        id: 'doc-sup01-3',
        docType: 'zatca_tax_certificate',
        nameAr: 'شهادة تسجيل ضريبة القيمة المضافة ZATCA',
        fileNumber: '310188492100003',
        issueDate: '2022-05-15',
        expiryDate: '2027-12-31',
        status: 'verified',
        verifiedAt: '2024-03-16',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '950 KB'
      },
      {
        id: 'doc-sup01-4',
        docType: 'bank_iban_certificate',
        nameAr: 'خطاب الآيبان البنكي المعتمد - مصرف الراجحي',
        fileNumber: 'BNK-IBAN-2024-91',
        issueDate: '2024-01-10',
        expiryDate: '2029-01-10',
        status: 'verified',
        verifiedAt: '2024-03-16',
        verifiedBy: 'الإدارة المالية - سبّاق',
        fileUrl: '#',
        fileSize: '1.1 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-02',
    commercialRegNumber: '1010729381',
    nameAr: 'مؤسسة أفق التقنية لحلول الربط والفوترة السحابية',
    nameEn: 'Tech Horizon Cloud Invoicing & ERP Solutions',
    logoUrl: '',
    status: 'approved',
    verificationLevel: 'platinum_accredited',
    verificationLabelAr: 'شريك بلاتيني معتمد',
    city: 'الرياض',
    coverageRegionsAr: ['جميع مناطق المملكة (تغطية سحابية وفنية)'],
    specialties: ['zatca', 'technical_security'],
    accreditationBodiesAr: ['هيئة الزكاة والضريبة والجمارك (مزود حلول معتمد)', 'هيئة الاتصالات والفضاء والتقنية'],
    rating: 4.9,
    reviewCount: 310,
    completedOrdersCount: 840,
    onTimeDeliveryRate: 98.6,
    complianceAcceptanceRate: 99.8,
    contactPerson: 'أ. خالد السبيعي',
    phone: '0559988776',
    email: 'sales@techhorizon-sa.com',
    isAvailableForEmergency: true,
    yearsInMarket: 7,
    registeredAt: '2023-11-20',
    lastActiveAt: '2026-08-16',
    bankName: 'البنك الأهلي السعودي',
    ibanNumber: 'SA1210000020109988776655',
    vatNumber: '310172938100003',
    descriptionAr: 'مزود حلول فوترة إلكترونية وربط POS معتمد رسمي لدى هيئة الزكاة والضريبة والجمارك مع ضمان التكامل التام بنسبة 100% دون أي انقطاع.',
    documents: [
      {
        id: 'doc-sup02-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري للبرمجيات وتقنية المعلومات',
        fileNumber: '1010729381',
        issueDate: '2020-04-12',
        expiryDate: '2027-04-12',
        status: 'verified',
        verifiedAt: '2023-11-21',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '1.5 MB'
      },
      {
        id: 'doc-sup02-2',
        docType: 'zatca_tax_certificate',
        nameAr: 'شهادة اعتماد مزود حلول الفوترة - ZATCA',
        fileNumber: 'ZATCA-EINV-2023-410',
        issueDate: '2023-08-01',
        expiryDate: '2027-08-01',
        status: 'verified',
        verifiedAt: '2023-11-21',
        verifiedBy: 'الإدارة الفنية - سبّاق',
        fileUrl: '#',
        fileSize: '2.1 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-03',
    commercialRegNumber: '4030612984',
    nameAr: 'مجموعة المقياس المتكامل للمقاولات والاستشارات الهندسية',
    nameEn: 'Integrated Measure Contracting & Engineering Consultancy',
    logoUrl: '',
    status: 'approved',
    verificationLevel: 'gold_verified',
    verificationLabelAr: 'شريك ذهبي موثق',
    city: 'جدة',
    coverageRegionsAr: ['منطقة مكة المكرمة', 'منطقة المدينة المنورة'],
    specialties: ['balady', 'civil_defense', 'environmental'],
    accreditationBodiesAr: ['وزارة البلديات والإسكان (مكتب هندسي معتمد)', 'الهيئة السعودية للمهندسين'],
    rating: 4.82,
    reviewCount: 165,
    completedOrdersCount: 340,
    onTimeDeliveryRate: 96.5,
    complianceAcceptanceRate: 98.9,
    contactPerson: 'م. عبدالله باحارث',
    phone: '0543322110',
    email: 'info@almiqyas-eng.com',
    isAvailableForEmergency: false,
    yearsInMarket: 11,
    registeredAt: '2024-01-05',
    lastActiveAt: '2026-08-15',
    bankName: 'بنك الرياض',
    ibanNumber: 'SA5520000001099887711223',
    vatNumber: '310403061200003',
    descriptionAr: 'مكتب هندسي استشاري معتمد لإصدار رخص البناء وشهادات الامتثال البلدي وتعديل واجهات المحلات ومعالجة التشوه البصري.',
    documents: [
      {
        id: 'doc-sup03-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري للاستشارات الهندسية',
        fileNumber: '4030612984',
        issueDate: '2019-09-10',
        expiryDate: '2028-09-10',
        status: 'verified',
        verifiedAt: '2024-01-08',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '1.7 MB'
      },
      {
        id: 'doc-sup03-2',
        docType: 'safety_license',
        nameAr: 'اعتماد الهيئة السعودية للمهندسين - مكتب استشاري',
        fileNumber: 'SCE-ENG-5541',
        issueDate: '2022-01-15',
        expiryDate: '2027-01-15',
        status: 'verified',
        verifiedAt: '2024-01-08',
        verifiedBy: 'الإدارة الهندسية - سبّاق',
        fileUrl: '#',
        fileSize: '2.0 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-04',
    commercialRegNumber: '1010948215',
    nameAr: 'شركة عين الرقابة للأنظمة الأمنية والاتصالات',
    nameEn: 'Monitoring Eye Security Systems & Networks',
    logoUrl: '',
    status: 'approved',
    verificationLevel: 'gold_verified',
    verificationLabelAr: 'شريك ذهبي موثق',
    city: 'الرياض',
    coverageRegionsAr: ['منطقة الرياض', 'القصيم', 'المنطقة الشرقية'],
    specialties: ['technical_security'],
    accreditationBodiesAr: ['الهيئة العليا للأمن الصناعي', 'الأمن العام'],
    rating: 4.78,
    reviewCount: 190,
    completedOrdersCount: 420,
    onTimeDeliveryRate: 97.2,
    complianceAcceptanceRate: 99.0,
    contactPerson: 'أ. فهد الشمري',
    phone: '0567788990',
    email: 'cctv@ainalriqaba.com',
    isAvailableForEmergency: true,
    yearsInMarket: 6,
    registeredAt: '2024-02-18',
    lastActiveAt: '2026-08-14',
    bankName: 'بنك الإنماء',
    ibanNumber: 'SA8805000099881122334455',
    vatNumber: '310109482100003',
    descriptionAr: 'توريد وتركيب كاميرات المراقبة الأمنية والأنظمة الذكية المطابقة للائحة اشتراطات الضبط الأمني للبلديات والأمن العام.',
    documents: [
      {
        id: 'doc-sup04-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري للأنظمة الأمنية والشبكات',
        fileNumber: '1010948215',
        issueDate: '2021-06-20',
        expiryDate: '2027-06-20',
        status: 'verified',
        verifiedAt: '2024-02-20',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '1.3 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-05',
    commercialRegNumber: '1010662391',
    nameAr: 'مكتب المستشار القانوني سفيان الحازمي للمحاماة والاستشارات التجارية',
    nameEn: 'Al-Hazmi Law Firm & Commercial Advisory',
    logoUrl: '',
    status: 'approved',
    verificationLevel: 'platinum_accredited',
    verificationLabelAr: 'مكتب قانوني مرخص وموثق',
    city: 'الرياض',
    coverageRegionsAr: ['كافة مناطق المملكة (تمثيل إلكتروني وحضوري)'],
    specialties: ['legal_consulting', 'qiwa_muqeem'],
    accreditationBodiesAr: ['وزارة العدل (ترخيص محاماة رقم 42/108)', 'الهيئة السعودية للمحامين'],
    rating: 4.98,
    reviewCount: 140,
    completedOrdersCount: 290,
    onTimeDeliveryRate: 100.0,
    complianceAcceptanceRate: 97.5,
    contactPerson: 'المحامي سفيان الحازمي',
    phone: '0505544332',
    email: 'legal@hazmi-law.com',
    isAvailableForEmergency: true,
    yearsInMarket: 14,
    registeredAt: '2023-09-01',
    lastActiveAt: '2026-08-16',
    bankName: 'بنك الجزيرة',
    ibanNumber: 'SA3360000011223344556677',
    vatNumber: '310106623900003',
    descriptionAr: 'نخبة من المستشارين القانونيين المتخصصين في الاعتراض على الجزاءات والغرامات الإدارية وصياغة لوائح الامتثال ومذكرات الترافع أمام اللجان شبه القضائية.',
    documents: [
      {
        id: 'doc-sup05-1',
        docType: 'commercial_registration',
        nameAr: 'ترخيص مزاولة مهنة المحاماة - وزارة العدل',
        fileNumber: '42/108',
        issueDate: '2015-01-10',
        expiryDate: '2030-01-10',
        status: 'verified',
        verifiedAt: '2023-09-02',
        verifiedBy: 'الإدارة القانونية - سبّاق',
        fileUrl: '#',
        fileSize: '1.9 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-06',
    commercialRegNumber: '1010992384',
    nameAr: 'شركة البيئة الخضراء للحلول البيئية ومعالجة النفايات',
    nameEn: 'Green Environment Waste Solutions & Permits',
    logoUrl: '',
    status: 'pending_verification',
    verificationLevel: 'silver_certified',
    verificationLabelAr: 'بانتظار التحقق من المستندات',
    city: 'الدمام',
    coverageRegionsAr: ['المنطقة الشرقية', 'منطقة الرياض'],
    specialties: ['environmental', 'balady'],
    accreditationBodiesAr: ['المركز الوطني للرقابة على الالتزام البيئي', 'وزارة البلديات والإسكان'],
    rating: 4.6,
    reviewCount: 42,
    completedOrdersCount: 88,
    onTimeDeliveryRate: 94.0,
    complianceAcceptanceRate: 97.0,
    contactPerson: 'م. سامي الدوسري',
    phone: '0531234567',
    email: 'compliance@green-eco.sa',
    isAvailableForEmergency: false,
    yearsInMarket: 4,
    registeredAt: '2026-08-10',
    lastActiveAt: '2026-08-16',
    bankName: 'البنك السعودي الأول (SAB)',
    ibanNumber: 'SA4450000000887766554433',
    vatNumber: '310109923800003',
    descriptionAr: 'مزود حلول معتمد لإصدار التصاريح البيئية وعقود التخلص من النفايات التجارية والصناعية الخطرة والصلبة مع إصدار شهادات المطابقة للمنشآت.',
    documents: [
      {
        id: 'doc-sup06-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري لمعالجة النفايات والحلول البيئية',
        fileNumber: '1010992384',
        issueDate: '2023-02-14',
        expiryDate: '2028-02-14',
        status: 'pending_review',
        fileUrl: '#',
        fileSize: '2.3 MB'
      },
      {
        id: 'doc-sup06-2',
        docType: 'safety_license',
        nameAr: 'تصريح المركز الوطني للرقابة على الالتزام البيئي',
        fileNumber: 'NCEC-ENV-2025-881',
        issueDate: '2025-01-01',
        expiryDate: '2027-01-01',
        status: 'pending_review',
        fileUrl: '#',
        fileSize: '3.1 MB'
      },
      {
        id: 'doc-sup06-3',
        docType: 'bank_iban_certificate',
        nameAr: 'شهادة الآيبان البنكي المعتمد - بنك ساب',
        fileNumber: 'SAB-IBAN-2026-01',
        issueDate: '2026-07-20',
        expiryDate: '2028-07-20',
        status: 'pending_review',
        fileUrl: '#',
        fileSize: '850 KB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-07',
    commercialRegNumber: '1010776512',
    nameAr: 'مؤسسة ركن الحماية للمقاولات والسلامة المهنية',
    nameEn: 'Protection Corner Safety & Contracting Est.',
    logoUrl: '',
    status: 'pending_verification',
    verificationLevel: 'standard',
    verificationLabelAr: 'قيد التدقيق الأولي',
    city: 'المدينة المنورة',
    coverageRegionsAr: ['منطقة المدينة المنورة', 'منطقة مكة المكرمة'],
    specialties: ['civil_defense', 'occupational_health'],
    accreditationBodiesAr: ['المديرية العامة للدفاع المدني'],
    rating: 4.4,
    reviewCount: 18,
    completedOrdersCount: 35,
    onTimeDeliveryRate: 91.5,
    complianceAcceptanceRate: 95.0,
    contactPerson: 'أ. ماجد الحربي',
    phone: '0554433221',
    email: 'support@rokn-himaya.com',
    isAvailableForEmergency: true,
    yearsInMarket: 3,
    registeredAt: '2026-08-12',
    lastActiveAt: '2026-08-15',
    bankName: 'مصرف الراجحي',
    ibanNumber: 'SA9980000012345678901234',
    vatNumber: '310107765100003',
    descriptionAr: 'مؤسسة متخصصة في توريد وصيانة معدات السلامة ومخارج الطوارئ وأنظمة الإنذار المبكر والتفتيش الوقائي للمحلات والمستودعات.',
    documents: [
      {
        id: 'doc-sup07-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري لمقاولات السلامة',
        fileNumber: '1010776512',
        issueDate: '2024-03-01',
        expiryDate: '2029-03-01',
        status: 'pending_review',
        fileUrl: '#',
        fileSize: '1.6 MB'
      },
      {
        id: 'doc-sup07-2',
        docType: 'zatca_tax_certificate',
        nameAr: 'شهادة تسجيل ضريبة القيمة المضافة',
        fileNumber: '310107765100003',
        issueDate: '2024-03-10',
        expiryDate: '2028-03-10',
        status: 'pending_review',
        fileUrl: '#',
        fileSize: '1.2 MB'
      }
    ],
    suspensionHistory: []
  },
  {
    id: 'sup-08',
    commercialRegNumber: '1010554190',
    nameAr: 'شركة الرواسي الهندسية لأنظمة الإنذار ومكافحة الحريق',
    nameEn: 'Al-Rawasi Engineering & Fire Alarm Systems',
    logoUrl: '',
    status: 'suspended',
    verificationLevel: 'standard',
    verificationLabelAr: 'مورد موقوف لمخالفة الالتزام',
    city: 'الرياض',
    coverageRegionsAr: ['منطقة الرياض'],
    specialties: ['civil_defense'],
    accreditationBodiesAr: ['منصة سلامة'],
    rating: 3.2,
    reviewCount: 65,
    completedOrdersCount: 110,
    onTimeDeliveryRate: 72.0,
    complianceAcceptanceRate: 84.5,
    contactPerson: 'م. عصام عبدالحميد',
    phone: '0509876543',
    email: 'ops@rawasi-fire.com',
    isAvailableForEmergency: false,
    yearsInMarket: 5,
    registeredAt: '2023-05-10',
    lastActiveAt: '2026-08-01',
    bankName: 'بنك الرياض',
    ibanNumber: 'SA7720000099887766554433',
    vatNumber: '310105541900003',
    currentSuspensionReason: 'تأخر جسيم في تسليم عقود صيانة منصة سلامة لعدد 4 عملاء وتكرار الشكاوى بخصوص عدم قبول شهادات الفحص.',
    activeViolationsCount: 3,
    descriptionAr: 'تم إيقاف المورد مؤقتاً وسحب صلاحية تلقي طلبات عروض الأسعار بناءً على تقرير جودة الامتثال وتأخر التنفيذ.',
    documents: [
      {
        id: 'doc-sup08-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري',
        fileNumber: '1010554190',
        issueDate: '2020-01-10',
        expiryDate: '2027-01-10',
        status: 'verified',
        verifiedAt: '2023-05-12',
        verifiedBy: 'الإدارة المركزية - سبّاق',
        fileUrl: '#',
        fileSize: '1.4 MB'
      },
      {
        id: 'doc-sup08-2',
        docType: 'safety_license',
        nameAr: 'ترخيص سلامة - منتهي ولم يتم التجديد',
        fileNumber: 'SLM-RYD-2023-11',
        issueDate: '2023-01-01',
        expiryDate: '2026-06-30',
        status: 'expired',
        rejectionReason: 'الترخيص منتهي الصلاحية لدى الدفاع المدني منذ 45 يوماً',
        fileUrl: '#',
        fileSize: '2.1 MB'
      }
    ],
    suspensionHistory: [
      {
        id: 'susp-01',
        reasonCategory: 'delayed_execution',
        reasonCategoryAr: 'تأخر جسيم في تنفيذ أمر التوريد وعدم إصدار شهادة سلامة في الموعد المحدد',
        detailsAr: 'تجاوز مهلة الـ 48 ساعة المقررة لتسليم عقد الصيانة المعتمد لـ 4 طلبات منشآت متعاقدة مما عرضهم لمخالفات بلدية.',
        suspendedAt: '2026-08-02',
        suspendedBy: 'فريق الرقابة والجودة - سبّاق',
        expectedDuration: 'موقوف حتى تقديم ما يثبت تجديد رخصة سلامة وتسوية الشكاوى القائمة وتحديث كفاءة الكادر.',
        status: 'active_suspension'
      }
    ]
  },
  {
    id: 'sup-09',
    commercialRegNumber: '1010443912',
    nameAr: 'مؤسسة الصقر للأمن والسلامة وكاميرات المراقبة',
    nameEn: 'Al-Saqr Safety & Security Est.',
    logoUrl: '',
    status: 'suspended',
    verificationLevel: 'gold_verified',
    verificationLabelAr: 'موقوف لانتهاء رخصة الأمن العام',
    city: 'القصيم',
    coverageRegionsAr: ['منطقة القصيم', 'منطقة حائل'],
    specialties: ['technical_security', 'civil_defense'],
    accreditationBodiesAr: ['الأمن العام'],
    rating: 4.1,
    reviewCount: 54,
    completedOrdersCount: 145,
    onTimeDeliveryRate: 88.0,
    complianceAcceptanceRate: 91.0,
    contactPerson: 'أ. يوسف العنيزي',
    phone: '0551122998',
    email: 'info@saqr-sec.sa',
    isAvailableForEmergency: false,
    yearsInMarket: 6,
    registeredAt: '2023-08-14',
    lastActiveAt: '2026-07-28',
    bankName: 'البنك العربي الوطني (ANB)',
    ibanNumber: 'SA6640000011998822334455',
    vatNumber: '310104439100003',
    currentSuspensionReason: 'انتهاء ترخيص تركيب الكاميرات الأمنية الصادر من الأمن العام وعدم تقديم الترخيص المجدد.',
    activeViolationsCount: 1,
    descriptionAr: 'تم تعليق الحساب مؤقتاً لحين رفع شهادة الترخيص الأمني المحدثة والمطابقة لاشتراطات الأمن العام.',
    documents: [
      {
        id: 'doc-sup09-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري',
        fileNumber: '1010443912',
        issueDate: '2021-04-10',
        expiryDate: '2027-04-10',
        status: 'verified',
        fileUrl: '#',
        fileSize: '1.2 MB'
      },
      {
        id: 'doc-sup09-2',
        docType: 'safety_license',
        nameAr: 'ترخيص الأمن العام للأنظمة الأمنية (منتهي)',
        fileNumber: 'PSD-QAS-2023-88',
        issueDate: '2023-07-01',
        expiryDate: '2026-07-01',
        status: 'expired',
        rejectionReason: 'ترخيص الأمن العام منتهي الصلاحية',
        fileUrl: '#',
        fileSize: '1.9 MB'
      }
    ],
    suspensionHistory: [
      {
        id: 'susp-02',
        reasonCategory: 'expired_license',
        reasonCategoryAr: 'انتهاء التراخيص المهنية والاعتماد الأمني الإلزامي',
        detailsAr: 'انتهت صلاحية ترخيص تركيب الكاميرات والأنظمة الأمنية لدى الأمن العام بتاريخ 2026-07-01 دون تجديد.',
        suspendedAt: '2026-08-05',
        suspendedBy: 'إدارة التدقيق والاعتماد - سبّاق',
        expectedDuration: 'موقوف حتى رفع الترخيص الأمني المجدد والتحقق منه.',
        status: 'active_suspension'
      }
    ]
  },
  {
    id: 'sup-10',
    commercialRegNumber: '1010332219',
    nameAr: 'مؤسسة البناء السريع لتجهيز المنشآت',
    nameEn: 'Speed Build Facility Prep Est.',
    logoUrl: '',
    status: 'rejected',
    verificationLevel: 'standard',
    verificationLabelAr: 'طلب مرفوض',
    city: 'الرياض',
    coverageRegionsAr: ['منطقة الرياض'],
    specialties: ['balady'],
    accreditationBodiesAr: [],
    rating: 3.0,
    reviewCount: 5,
    completedOrdersCount: 2,
    onTimeDeliveryRate: 65.0,
    complianceAcceptanceRate: 70.0,
    contactPerson: 'أ. بندر الشهري',
    phone: '0549988771',
    email: 'admin@speedbuild.sa',
    isAvailableForEmergency: false,
    yearsInMarket: 1,
    registeredAt: '2026-07-15',
    lastActiveAt: '2026-07-20',
    bankName: 'مصرف الإنماء',
    ibanNumber: 'SA1105000012349988776655',
    vatNumber: '310103322100003',
    descriptionAr: 'تم رفض طلب التسجيل لعدم وجود ترخيص مكتب هندسي أو سجل مقاولات متوافق مع تصنيف بلدية.',
    documents: [
      {
        id: 'doc-sup10-1',
        docType: 'commercial_registration',
        nameAr: 'السجل التجاري',
        fileNumber: '1010332219',
        issueDate: '2025-01-10',
        expiryDate: '2028-01-10',
        status: 'rejected',
        rejectionReason: 'النشاط المذكور بالسجل التجاري تجارة عامة ولا يشمل مقاولات أو خدمات استشارات هندسية',
        fileUrl: '#',
        fileSize: '1.2 MB'
      }
    ],
    suspensionHistory: []
  }
];

/**
 * 3. طلبات التوريد وعروض الأسعار الحالية
 */
export const MOCK_SUPPLY_REQUESTS: SupplyRequest[] = [
  {
    id: 'req-2026-001',
    requestNumber: 'REQ-2026-0814',
    establishmentId: 'est-1',
    establishmentName: 'شركة تقنية المستقبل لتقنية المعلومات',
    branchId: 'br-1',
    branchName: 'الفرع الرئيسي - الرياض',
    linkedViolationId: 'viol-002',
    solutionId: 'sol-cd-01',
    titleAr: 'طلب توريد وتجديد عقد صيانة شبكة إنذار الحريق وشهادة سلامة معتمدة',
    category: 'civil_defense',
    urgencyLevel: 'deadline_approaching',
    deadlineDate: '2026-08-20',
    targetExecutionDate: '2026-08-25',
    status: 'under_evaluation',
    statusLabelAr: 'قيد مراجعة العروض',
    locationCity: 'الرياض - حي العليا',
    locationAddressDetails: 'مبنى الأعمال، الدور الثاني، مساحة 450 متر مربع',
    scopeDescriptionAr: 'مطلوب فحص لوحة إنذار الحريق ومعايرة 12 كاشف دخان واستبدال 4 طفايات حريق بودرة 6 كجم مع إصدار عقد صيانة إلكتروني على منصة سلامة لمدة سنة لتفادي إيقاف رخصة البلدية.',
    requiredDeliverablesAr: [
      'عقد صيانة سلامة إلكتروني موثق',
      'تقرير فني معتمد بالجاهزية',
      'ملصقات الفحص الدوري على كافة الأجهزة'
    ],
    maxBudget: 6000,
    quotesReceivedCount: 3,
    createdAt: '2026-08-14T09:30:00Z',
    updatedAt: '2026-08-15T14:20:00Z',
    notes: 'تمت إحالة الطلب تلقائياً بناءً على كشف رادار المخاطر الاستباقي.'
  },
  {
    id: 'req-2026-002',
    requestNumber: 'REQ-2026-0819',
    establishmentId: 'est-1',
    establishmentName: 'شركة تقنية المستقبل لتقنية المعلومات',
    branchId: 'br-1',
    branchName: 'الفرع الرئيسي - الرياض',
    solutionId: 'sol-zatca-03',
    titleAr: 'تحديث وتدقيق تكامل الفوترة الإلكترونية المرحلة الثانية (ZATCA Phase 2)',
    category: 'zatca',
    urgencyLevel: 'normal',
    deadlineDate: '2026-08-28',
    targetExecutionDate: '2026-09-05',
    status: 'open_for_quotes',
    statusLabelAr: 'متاح لاستقبال العروض',
    locationCity: 'الرياض',
    scopeDescriptionAr: 'ربط نظام إدارة المبيعات والفواتير السحابية عبر API مع منصة فاتورة وتوليد الأختام الرقمية المشفرة لضمان الامتثال التام قبل الموعد الإلزامي للمجموعة.',
    requiredDeliverablesAr: [
      'شهادة الامتثال والتسجيل في منصة فاتورة',
      'فحص واختبار توليد الفواتير المبسطة والضريبية بنجاح'
    ],
    maxBudget: 4500,
    quotesReceivedCount: 2,
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-16T08:00:00Z'
  },
  {
    id: 'req-2026-003',
    requestNumber: 'REQ-2026-0798',
    establishmentId: 'est-1',
    establishmentName: 'شركة تقنية المستقبل لتقنية المعلومات',
    solutionId: 'sol-legal-06',
    titleAr: 'صياغة مذكرة اعتراض على مخالفة بلدية تتعلق ببروز اللوحة الإعلانية',
    category: 'legal_consulting',
    urgencyLevel: 'urgent_inspection',
    deadlineDate: '2026-08-18',
    targetExecutionDate: '2026-08-19',
    status: 'quote_accepted',
    statusLabelAr: 'تم قبول العرض والتعميد',
    locationCity: 'الرياض',
    scopeDescriptionAr: 'مخالفة بقيمة 5,000 ريال صادرة من أمانة منطقة الرياض دون توجيه إنذار أولي نظامي. مطلوب إعداد لائحة اعتراض وفق اللائحة التنفيذية لنظام البلديات ورفعها عبر بلدي.',
    requiredDeliverablesAr: [
      'مذكرة اعتراض قانونية متخصصة وموقعة',
      'إشعار تقديم وتوثيق المعاملة عبر منصة بلدي'
    ],
    maxBudget: 2500,
    quotesReceivedCount: 4,
    selectedQuoteId: 'qt-1003',
    createdAt: '2026-08-12T16:00:00Z',
    updatedAt: '2026-08-14T10:15:00Z'
  }
];

/**
 * 4. عروض الأسعار التنافسية المقدمة للطلبات
 */
export const MOCK_SUPPLIER_QUOTES: SupplierQuote[] = [
  {
    id: 'qt-1001',
    quoteNumber: 'QT-9921',
    requestId: 'req-2026-001',
    supplierId: 'sup-01',
    supplierName: 'شركة درع السلامة لأنظمة الإطفاء والإنذار المعتمدة',
    supplierVerificationLevel: 'platinum_accredited',
    supplierRating: 4.95,
    priceSAR: 4200,
    vatSAR: 630,
    totalSAR: 4830,
    proposedExecutionDays: 3,
    validUntil: '2026-08-25',
    status: 'shortlisted',
    statusLabelAr: 'في القائمة القصيرة',
    proposalSummaryAr: 'يشمل العرض الفحص الميداني الشامل واستبدال 4 طفايات بودرة بأخرى معتمدة ذات كفاءة عالية، وبرمجة لوحة الإنذار، وتوثيق عقد الصيانة على منصة سلامة خلال 48 ساعة من التوقيع.',
    deliverablesOfferedAr: [
      'عقد صيانة سلامة إلكتروني موثق لعام كامل',
      'شهادة اختبار شبكة الإنذار والمضخات',
      'ضمان شامل على كافة القطع لمدة 12 شهراً'
    ],
    includedWarrantyMonths: 12,
    hasOfficialCertificationLetter: true,
    technicalNotes: 'يمكن بدء التنفيذ صباح يوم الغد.',
    submittedAt: '2026-08-14T15:30:00Z',
    isBestValue: true
  },
  {
    id: 'qt-1002',
    quoteNumber: 'QT-9925',
    requestId: 'req-2026-001',
    supplierId: 'sup-03',
    supplierName: 'مجموعة المقياس المتكامل للمقاولات والاستشارات الهندسية',
    supplierVerificationLevel: 'gold_verified',
    supplierRating: 4.82,
    priceSAR: 5100,
    vatSAR: 765,
    totalSAR: 5865,
    proposedExecutionDays: 4,
    validUntil: '2026-08-22',
    status: 'under_review',
    statusLabelAr: 'قيد المراجعة الفنية',
    proposalSummaryAr: 'يشمل الكشف الهندسي وإصدار المخطط المعتمد بالإضافة إلى عقد الصيانة الإلكتروني وشهادة السلامة.',
    deliverablesOfferedAr: [
      'عقد صيانة سلامة سنوي',
      'مخطط سلامة هندسي محدث',
      'فحص كواشف الدخان والإنذار'
    ],
    includedWarrantyMonths: 12,
    hasOfficialCertificationLetter: true,
    submittedAt: '2026-08-15T09:10:00Z',
    isBestValue: false
  },
  {
    id: 'qt-1003',
    quoteNumber: 'QT-9874',
    requestId: 'req-2026-003',
    supplierId: 'sup-05',
    supplierName: 'مكتب المستشار القانوني سفيان الحازمي للمحاماة والاستشارات التجارية',
    supplierVerificationLevel: 'platinum_accredited',
    supplierRating: 4.98,
    priceSAR: 1800,
    vatSAR: 270,
    totalSAR: 2070,
    proposedExecutionDays: 1,
    validUntil: '2026-08-20',
    status: 'accepted',
    statusLabelAr: 'تم القبول والتعميد',
    proposalSummaryAr: 'صياغة مذكرة اعتراض قانونية مستندة إلى المادة (4) من اللائحة التنفيذية لجزاءات المخالفات البلدية، ورفعها ومتابعتها إلكترونياً حتى إلغاء الغرامة.',
    deliverablesOfferedAr: [
      'مذكرة اعتراض نظامية مسببة ومحررة بموجب ترخيص المحاماة',
      'رفع التظلم ومتابعة جدول جلسات النظر',
      'تقرير بنتيجة القرار الإداري'
    ],
    includedWarrantyMonths: 3,
    hasOfficialCertificationLetter: true,
    submittedAt: '2026-08-13T10:00:00Z',
    isBestValue: true
  },
  {
    id: 'qt-1004',
    quoteNumber: 'QT-9960',
    requestId: 'req-2026-002',
    supplierId: 'sup-02',
    supplierName: 'مؤسسة أفق التقنية لحلول الربط والفوترة السحابية',
    supplierVerificationLevel: 'platinum_accredited',
    supplierRating: 4.9,
    priceSAR: 2800,
    vatSAR: 420,
    totalSAR: 3220,
    proposedExecutionDays: 2,
    validUntil: '2026-08-30',
    status: 'submitted',
    statusLabelAr: 'عرض جديد مستلم',
    proposalSummaryAr: 'ربط مباشر عبر API مع خوادم ZATCA، إصدار شهادات Cryptographic Stamp وتدريب الفريق على الامتثال لمعايير الفوترة الإلكترونية للمرحلة الثانية.',
    deliverablesOfferedAr: [
      'بوابة ربط سحابية متوافقة 100% مع ZATCA',
      'شهادة اجتياز بيئة الاختبار والفحص الحي',
      'دعم فني وضمان استمرارية لمدة عام'
    ],
    includedWarrantyMonths: 12,
    hasOfficialCertificationLetter: true,
    submittedAt: '2026-08-16T09:40:00Z',
    isBestValue: true
  }
];

/**
 * 5. سجل تتبع الحالات ومراحل التنفيذ (Audit Trail & Order Timeline)
 */
export const MOCK_ORDER_STATUS_HISTORY: OrderStatusHistoryItem[] = [
  {
    id: 'hist-001',
    requestId: 'req-2026-003',
    requestNumber: 'REQ-2026-0798',
    newStatus: 'open_for_quotes',
    statusLabelAr: 'إنشاء طلب استدراج العروض',
    changedBy: 'النظام الآلي (رادار الاعتراضات)',
    timestamp: '2026-08-12T16:00:00Z',
    commentsAr: 'تم إطلاق طلب استدراج العروض وتوجيهه للمكاتب القانونية المعتمدة في الرياض.',
    actionRequiredFrom: 'none'
  },
  {
    id: 'hist-002',
    requestId: 'req-2026-003',
    requestNumber: 'REQ-2026-0798',
    previousStatus: 'open_for_quotes',
    newStatus: 'under_evaluation',
    statusLabelAr: 'اكتمال تلقي العروض',
    changedBy: 'مدير الامتثال',
    timestamp: '2026-08-13T12:30:00Z',
    commentsAr: 'تم استلام 4 عروض أسعار تنافسية من المكاتب المعتمدة وجاري المفاضلة.',
    attachmentsCount: 4,
    actionRequiredFrom: 'establishment'
  },
  {
    id: 'hist-003',
    requestId: 'req-2026-003',
    requestNumber: 'REQ-2026-0798',
    previousStatus: 'under_evaluation',
    newStatus: 'quote_accepted',
    statusLabelAr: 'قبول عرض مكتب المحامي سفيان الحازمي',
    changedBy: 'الرئيس التنفيذي / المفوض',
    timestamp: '2026-08-14T10:15:00Z',
    commentsAr: 'تم اختيار العرض الأفضل قيمة ومطابقة وتم تعميد المكتب للبدء في صياغة مذكرة الاعتراض.',
    actionRequiredFrom: 'supplier'
  },
  {
    id: 'hist-004',
    requestId: 'req-2026-001',
    requestNumber: 'REQ-2026-0814',
    newStatus: 'open_for_quotes',
    statusLabelAr: 'إنشاء طلب توريد شبكة الإنذار وعقد سلامة',
    changedBy: 'مسؤول الامتثال والسلامة',
    timestamp: '2026-08-14T09:30:00Z',
    commentsAr: 'تم إنشاء الطلب لتفادي مخالفة انتهاء عقد صيانة الدفاع المدني.',
    actionRequiredFrom: 'none'
  },
  {
    id: 'hist-005',
    requestId: 'req-2026-001',
    requestNumber: 'REQ-2026-0814',
    previousStatus: 'open_for_quotes',
    newStatus: 'under_evaluation',
    statusLabelAr: 'قيد مراجعة وتقييم العروض',
    changedBy: 'النظام الذكي',
    timestamp: '2026-08-15T14:20:00Z',
    commentsAr: 'تم تلقي 3 عروض مؤهلة من مزودي خدمات سلامة معتمدين وتحديد العرض الأفضل قيمة.',
    attachmentsCount: 3,
    actionRequiredFrom: 'establishment'
  }
];

/**
 * وظائف مساعدة لاحتساب إحصائيات السوق والتوريد
 */
export function getRemediationSolutionsByCategory(category?: RemediationCategory | 'all'): RemediationSolution[] {
  if (!category || category === 'all') return MOCK_REMEDIATION_SOLUTIONS;
  return MOCK_REMEDIATION_SOLUTIONS.filter(s => s.category === category);
}

export function getSuppliersBySpecialty(specialty?: RemediationCategory | 'all'): Supplier[] {
  if (!specialty || specialty === 'all') return MOCK_SUPPLIERS;
  return MOCK_SUPPLIERS.filter(sup => sup.specialties.includes(specialty));
}

export function getQuotesForRequest(requestId: string): SupplierQuote[] {
  return MOCK_SUPPLIER_QUOTES.filter(q => q.requestId === requestId);
}

export function getHistoryForRequest(requestId: string): OrderStatusHistoryItem[] {
  return MOCK_ORDER_STATUS_HISTORY
    .filter(h => h.requestId === requestId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const REMEDIATION_CATEGORIES_INFO: Record<RemediationCategory, { labelAr: string; iconName: string; color: string }> = {
  civil_defense: { labelAr: 'الدفاع المدني والسلامة', iconName: 'Flame', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  balady: { labelAr: 'التراخيص والبلديات واللافتات', iconName: 'Building2', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  zatca: { labelAr: 'الفوترة الإلكترونية والزكاة', iconName: 'DollarSign', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  qiwa_muqeem: { labelAr: 'العمل والتشغيل وتوطين المهن', iconName: 'Users', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  occupational_health: { labelAr: 'السلامة والصحة المهنية', iconName: 'ShieldCheck', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  legal_consulting: { labelAr: 'الاستشارات واللوائح والاعتراضات', iconName: 'Scale', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  environmental: { labelAr: 'البيئة والتخلص من النفايات', iconName: 'Leaf', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  technical_security: { labelAr: 'الأمن والأنظمة والكاميرات', iconName: 'Lock', color: 'text-slate-600 bg-slate-50 border-slate-200' }
};

