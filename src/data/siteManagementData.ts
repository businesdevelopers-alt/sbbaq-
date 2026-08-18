/**
 * Sabbaq Site Management, CMS, Incoming Requests & ZATCA Invoicing Data
 * بوابة إدارة الموقع، صفحة التعريف، استلام الطلبات، وإصدار الفواتير
 */

export interface SiteSettingsConfig {
  // 1. Branding & Header / Announcement
  announcementBarActive: boolean;
  announcementBarText: string;
  announcementBarLink: string;
  announcementBarBadge: string;

  // 2. Hero Section
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  emergencyHotline: string;

  // 3. About Sabbaq & Vision 2030 (صفحة التعريف)
  aboutUsTitle: string;
  aboutUsSubtitle: string;
  aboutUsDescription: string;
  vision2030Message: string;
  coreValues: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];

  // 4. Live Statistics & Counter Metrics
  stats: {
    id: string;
    label: string;
    value: string;
    subLabel: string;
    highlight?: boolean;
  }[];

  // 5. Feature Modules Toggles (التحكم بأقسام وميزات المنصة)
  featureToggles: {
    aiAdvisor: boolean;
    feeCalculator: boolean;
    riskMap: boolean;
    suppliersMarket: boolean;
    instantOrders: boolean;
    digitalSignatures: boolean;
    zatcaInvoicing: boolean;
    autoRenewalDraft: boolean;
  };

  // 6. Pricing Plans
  pricingPlans: {
    id: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    badge?: string;
    isPopular?: boolean;
    description: string;
    features: string[];
  }[];

  // 7. FAQs
  faqItems: {
    id: string;
    category: string;
    question: string;
    answer: string;
    isFeatured?: boolean;
  }[];

  // 8. Contact & Company Info
  contactInfo: {
    companyNameAr: string;
    companyNameEn: string;
    crNumber: string;
    vatNumber: string;
    addressAr: string;
    phone: string;
    supportEmail: string;
    salesEmail: string;
    whatsappNumber: string;
    workingHours: string;
    twitterHandle: string;
    linkedinUrl: string;
  };
}

export type IncomingRequestStatus = 
  | 'new'
  | 'under_review'
  | 'quote_sent'
  | 'converted_to_order'
  | 'completed'
  | 'rejected';

export type IncomingRequestPriority = 'urgent' | 'high' | 'normal';

export type IncomingRequestChannel = 
  | 'landing_page'
  | 'public_services'
  | 'contact_form'
  | 'ai_assistant'
  | 'marketplace'
  | 'direct_phone';

export interface IncomingRequest {
  id: string;
  requestNumber: string;
  clientName: string;
  companyName: string;
  crNumber?: string;
  phone: string;
  email: string;
  city: string;
  serviceCategory: string;
  requestedServices: string[];
  notes: string;
  status: IncomingRequestStatus;
  priority: IncomingRequestPriority;
  channel: IncomingRequestChannel;
  createdAt: string;
  estimatedBudget: number;
  assignedSpecialist?: string;
  convertedOrderId?: string;
  issuedInvoiceNumber?: string;
  internalNotes?: string;
  attachmentsCount?: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'mada' | 'sadad' | 'bank_transfer' | 'visa' | 'tamara' | 'cash';

export interface TaxInvoiceItem {
  id: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  govFee: number; // رسوم حكومية معفاة/أمانة
  discount: number;
  taxableAmount: number; // المبلغ الخاضع للضريبة (أتعاب سبّاق)
  vatRate: number; // 0.15 (15%)
  vatAmount: number;
  totalWithVat: number; // إجمالي البند شاملاً الضريبة والرسوم
}

export interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'tax_invoice' | 'simplified_tax_invoice';
  issueDate: string;
  dueDate: string;
  supplyDate?: string;
  
  // Seller Data (منصة سبّاق)
  sellerName: string;
  sellerCR: string;
  sellerVatNumber: string;
  sellerAddress: string;
  sellerBuildingNo?: string;
  sellerPostalCode?: string;
  sellerCity?: string;

  // Buyer Data (العميل / المنشأة)
  buyerName: string;
  buyerCompany: string;
  buyerCR?: string;
  buyerVatNumber?: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerCity: string;

  // Items
  items: TaxInvoiceItem[];

  // Totals
  govFeesTotal: number;
  taxableAmountTotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;

  // Payment & Status
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  paidAmount?: number;
  bankAccountName?: string;
  bankIban?: string;
  relatedOrderId?: string;
  relatedRequestId?: string;
  notes?: string;
  zatcaQrBase64?: string;
}

// Initial Default Site Settings
export const INITIAL_SITE_SETTINGS: SiteSettingsConfig = {
  announcementBarActive: true,
  announcementBarText: 'منصة سبّاق تفوز باعتماد وزارة البلديات والإسكان كأول منصة وطنية لأتمتة الامتثال البلدي والتجاري 100%!',
  announcementBarLink: '#services',
  announcementBarBadge: 'إعلان رسمي',

  heroBadge: 'المنصة الوطنية الرائدة للامتثال وإصدار التراخيص الفورية',
  heroTitle: 'حماية منشأتك من الغرامات البلدية والتجارية',
  heroHighlight: 'بسرعة البرق وبدقة هندسية موثقة',
  heroSubtitle: 'نظام رقمي متكامل يدير كافة رخصك وسجلاتك وعقود سلامة وإيجار، يربطك بالمعقبين والمهندسين المعتمدين، ويصدر فواتيرك الضريبية المعتمدة فورياً.',
  primaryCtaText: 'ابدأ فحص امتثال منشأتك مجاناً',
  secondaryCtaText: 'استعراض دليل الخدمات والأسعار',
  emergencyHotline: '920088991',

  aboutUsTitle: 'منصة سبّاق: درعك الرقمي للريادة والامتثال المؤسسي',
  aboutUsSubtitle: 'نبتكر أحدث الحلول الرقمية لتمكين قطاع الأعمال السعودي من تحقيق الامتثال الكامل وخفض تكاليف التشغيل ومخاطر الإغلاق.',
  aboutUsDescription: 'تأسست سبّاق بهدف إحداث نقلة نوعية في تجربة إدارة التراخيص والامتثال الحكومي للمنشآت في المملكة العربية السعودية. نوفر لوحة تحكم ذكية تجمع كافة متطلبات وزارات التجارة، والبلديات والإسكان (بلدي)، والدفاع المدني (سلامة)، وهيئة الزكاة والضريبة والجمارك (ZATCA)، ووزارة الموارد البشرية، في نافذة موحدة مع شبكة من الموردين والمعقبين المرخصين.',
  vision2030Message: 'مساهمة وطنية استراتيجية في تحقيق مستهدفات رؤية المملكة 2030 لتطوير بيئة ممارسة الأعمال وتعزيز التحول الرقمي الشامل لقطاع المنشآت الصغيرة والمتوسطة.',
  
  coreValues: [
    {
      id: 'val-1',
      title: 'السرعة القياسية (24-48 ساعة)',
      description: 'نلتزم بإنجاز التراخيص وتجديد الشهادات في أوقات قياسية تضمن استمرار أعمالك دون أي توقف.',
      icon: 'Zap'
    },
    {
      id: 'val-2',
      title: 'الاعتماد الحكومي الرسمي 100%',
      description: 'جميع خدماتنا ومعقبونا ومهندسونا معتمدون رسمياً من الجهات الرقابية ومنصات بلدي وسلامة وزاتكا.',
      icon: 'ShieldCheck'
    },
    {
      id: 'val-3',
      title: 'الشفافية المطلقة والفوترة المعتمدة',
      description: 'فواتير ضريبية مفصلة تفصل بين الرسوم الحكومية الرسمية وأتعاب التنفيذ مع توفير باركود ZATCA الفوري.',
      icon: 'FileText'
    },
    {
      id: 'val-4',
      title: 'الذكاء الاصطناعي الاستباقي',
      description: 'خوارزميات تنبؤية تحذرك من مواعيد انتهاء الرخص ومخاطر المخالفات قبل حدوثها بما لا يقل عن 60 يوماً.',
      icon: 'Sparkles'
    }
  ],

  stats: [
    {
      id: 'st-1',
      label: 'منشأة وفرع تجاري محمي',
      value: '+52,400',
      subLabel: 'في كافة مناطق المملكة',
      highlight: true
    },
    {
      id: 'st-2',
      label: 'نسبة تجنب الغرامات',
      value: '%99.6',
      subLabel: 'وفق مؤشرات الربع الأخير'
    },
    {
      id: 'st-3',
      label: 'معاملة ورخصة منجزة',
      value: '+185,000',
      subLabel: 'منذ انطلاق المنصة'
    },
    {
      id: 'st-4',
      label: 'مورد ومعقب شريك معتمد',
      value: '+450',
      subLabel: 'تغطية جغرافية شاملة'
    }
  ],

  featureToggles: {
    aiAdvisor: true,
    feeCalculator: true,
    riskMap: true,
    suppliersMarket: true,
    instantOrders: true,
    digitalSignatures: true,
    zatcaInvoicing: true,
    autoRenewalDraft: true
  },

  pricingPlans: [
    {
      id: 'plan-starter',
      name: 'باقة الانطلاق (المنشأة الفردية)',
      monthlyPrice: 199,
      annualPrice: 1990,
      description: 'مثالية للمتاجر والمحلات الفردية والأنشطة الصغيرة ذات الفرع الواحد.',
      features: [
        'مراقبة حتى 5 رخص وسجلات تجارية',
        'تنبيهات استباقية قبل الانتهاء عبر SMS والواتساب',
        'حاسبة الرسوم الحكومية التقديرية',
        'خصم 15% على خدمات التعقيب والتنفيذ',
        'دعم فني عبر تذاكر النظام'
      ]
    },
    {
      id: 'plan-pro',
      name: 'باقة الأعمال والنمو (شامل الامتثال)',
      monthlyPrice: 499,
      annualPrice: 4990,
      badge: 'الأكثر طلباً واختياراً',
      isPopular: true,
      description: 'مخصصة للشركات المتوسطة وسلاسل الفروع (حتى 5 فروع).',
      features: [
        'مراقبة غير محدودة لكافة الرخص والشهادات',
        'خريطة المخاطر الجغرافية وتتبع حملات التفتيش البلدية',
        'مستشار سبّاق الذكي (AI Legal Advisor) على مدار الساعة',
        'أولوية الإسناد لأسرع المعقبين والمهندسين المعتمدين',
        'إصدار فواتير ضريبية وسندات إلكترونية ZATCA فورية',
        'خزينة الوثائق القانونية والتوقيع الرقمي المعتمد'
      ]
    },
    {
      id: 'plan-enterprise',
      name: 'باقة الشركات الكبرى والمجموعات',
      monthlyPrice: 1499,
      annualPrice: 14990,
      badge: 'إدارة متكاملة VIP',
      description: 'للشركات القابضة، الفنادق، المصانع، والمجموعات متعددة الأنشطة والفروع.',
      features: [
        'إدارة متعددة الفروع والشركات التابعة بدون سقف',
        'مدير حساب تنفيذي مخصص ومستشار قانوني معتمد',
        'زيارات تفتيش وتدقيق ميداني دورية',
        'ربط API مخصص مع أنظمة ERP والفوترة للمجموعة',
        'تأمين وضمان ضد غرامات التأخير غير المبررة',
        'تقارير امتثال شهرية جاهزة لمجلس الإدارة'
      ]
    }
  ],

  faqItems: [
    {
      id: 'faq-1',
      category: 'عام',
      question: 'كيف تحميني منصة سبّاق من الغرامات البلدية والتجارية؟',
      answer: 'تقوم المنصة بربط وتتبع كافة رخصك وسجلاتك وشهادات الدفاع المدني وعقود إيجار منشآتك، وترسل تنبيهات مبكرة قبل حلول مواعيد التجديد الإلزامية بـ 60 و 30 و 15 يوماً، مع توفير خيار التجديد الفوري بضغطة زر واحدة عبر شبكة معقبين ومهندسين مرخصين.',
      isFeatured: true
    },
    {
      id: 'faq-2',
      category: 'الفواتير',
      question: 'هل الفواتير الصادرة من سبّاق معتمدة لدى هيئة الزكاة والضريبة والجمارك (ZATCA)؟',
      answer: 'نعم، 100%. كافة فواتير سبّاق الضريبية متوافقة تماماً مع متطلبات المرحلة الثانية للفوترة الإلكترونية (فاتورة) وتتضمن رمز الاستجابة السريعة (QR Code) المشفر ورقم التسجيل الضريبي لكافة الأطراف.',
      isFeatured: true
    },
    {
      id: 'faq-3',
      category: 'الخدمات',
      question: 'ما هي سرعة إنجاز معاملات إصدار وتجديد الرخص عبر المنصة؟',
      answer: 'تتم معظم المعاملات الروتينية (كتجديد السجلات، شهادات الزكاة والتأمينات) خلال ساعات معدودة، بينما تستغرق رخص بلدي ورخص سلامة الهندسية ما بين 24 إلى 48 ساعة عمل كحد أقصى مع توفير خاصية المسار السريع للطوارئ.',
      isFeatured: true
    },
    {
      id: 'faq-4',
      category: 'الأسعار',
      question: 'كيف يتم احتساب الرسوم وأتعاب التنفيذ؟',
      answer: 'نعتمد مبدأ الشفافية التامة؛ حيث تُفصل الرسوم الحكومية الرسمية (وهي مبالغ تُسدد للجهات الحكومية دون أي زيادة) عن أتعاب خدمة سبّاق الثابتة والموضحة مسبقاً قبل تأكيد الطلب.',
      isFeatured: false
    }
  ],

  contactInfo: {
    companyNameAr: 'شركة سبّاق لتقنية المعلومات وحلول الامتثال ذ.م.م',
    companyNameEn: 'Sabbaq Compliance Technology Co. LLC',
    crNumber: '1010884920',
    vatNumber: '310188492000003',
    addressAr: 'المملكة العربية السعودية، الرياض، طريق الملك فهد، برج الفيصلية، الطابق 18',
    phone: '920088991',
    supportEmail: 'care@sabbaq.sa',
    salesEmail: 'enterprise@sabbaq.sa',
    whatsappNumber: '0558899100',
    workingHours: 'من الأحد إلى الخميس: 8:00 ص - 6:00 م (خدمات الطوارئ 24/7)',
    twitterHandle: '@SabbaqKSA',
    linkedinUrl: 'https://linkedin.com/company/sabbaq-sa'
  }
};

// Initial Mock Incoming Requests (استلام الطلبات الواردة)
export const INITIAL_INCOMING_REQUESTS: IncomingRequest[] = [
  {
    id: 'req-101',
    requestNumber: 'REQ-2026-0811',
    clientName: 'عبدالرحمن إبراهيم الخالدي',
    companyName: 'شركة السفرة الذهبية لتقديم الوجبات',
    crNumber: '1010774891',
    phone: '0501239874',
    email: 'ceo@goldentable.sa',
    city: 'الرياض',
    serviceCategory: 'balady',
    requestedServices: ['تجديد رخصة بلدية فورية (بلدي)', 'إصدار تقرير سلامة معتمد (منصة سلامة)'],
    notes: 'لدينا تفتيش بلدي بعد غد ونحتاج تجديد رخصة الفرع بشارع التحلية فوراً وتحديث عقد سلامة.',
    status: 'new',
    priority: 'urgent',
    channel: 'landing_page',
    createdAt: '2026-08-16T19:40:00',
    estimatedBudget: 2450,
    attachmentsCount: 2
  },
  {
    id: 'req-102',
    requestNumber: 'REQ-2026-0812',
    clientName: 'أ. ليلى فهد الشمري',
    companyName: 'مؤسسة أفق التقنية للاتصالات',
    crNumber: '1010992384',
    phone: '0554433112',
    email: 'ops@ofouq-tech.com',
    city: 'الدمام',
    serviceCategory: 'zatca',
    requestedServices: ['الربط والتكامل مع منصة فاتورة (ZATCA Phase 2)', 'تحديث شهادة الزكاة والدخل'],
    notes: 'نرغب في ربط نظام نقاط البيع السحابي مع هيئة الزكاة والضريبة والجمارك لعدد 3 فروع.',
    status: 'under_review',
    priority: 'high',
    channel: 'public_services',
    createdAt: '2026-08-16T18:15:00',
    estimatedBudget: 3800,
    assignedSpecialist: 'م. راكان الدوسري',
    attachmentsCount: 1
  },
  {
    id: 'req-103',
    requestNumber: 'REQ-2026-0813',
    clientName: 'م. يوسف المنصور',
    companyName: 'مجموعة المروج للمقاولات العامة',
    crNumber: '4030612984',
    phone: '0543322119',
    email: 'mansour@almorouj-sa.com',
    city: 'جدة',
    serviceCategory: 'legal_consulting',
    requestedServices: ['صياغة لائحة اعتراض قانونية على مخالفة بلدية', 'استشارة هندسية لتعديل واجهة المحل'],
    notes: 'تم تسجيل مخالفة تشوه بصري بقيمة 10,000 ريال ونرغب بتقديم اعتراض رسمي قبل انتهاء مهلة الـ 10 أيام.',
    status: 'quote_sent',
    priority: 'high',
    channel: 'ai_assistant',
    createdAt: '2026-08-16T16:20:00',
    estimatedBudget: 1850,
    assignedSpecialist: 'المستشار القانوني سفيان الحازمي',
    issuedInvoiceNumber: 'INV-2026-0081'
  },
  {
    id: 'req-104',
    requestNumber: 'REQ-2026-0814',
    clientName: 'سلطان عبدالعزيز المقرن',
    companyName: 'مقهى ومحمص رشفة البن',
    crNumber: '1010334812',
    phone: '0569988771',
    email: 'rashfa.cafe@gmail.com',
    city: 'الرياض',
    serviceCategory: 'civil_defense',
    requestedServices: ['تجهيز وتركيب شبكة إنذار حريق معتمدة', 'شهادة فحص منصة سلامة السنوية'],
    notes: 'الموقع جاهز وننتظر تقرير مهندس معتمد لإصدار رخصة التشغيل الأولى.',
    status: 'converted_to_order',
    priority: 'normal',
    channel: 'marketplace',
    createdAt: '2026-08-15T14:30:00',
    estimatedBudget: 4200,
    assignedSpecialist: 'شركة درع السلامة لأنظمة الإطفاء',
    convertedOrderId: 'ORD-1447-091',
    issuedInvoiceNumber: 'INV-2026-0079'
  },
  {
    id: 'req-105',
    requestNumber: 'REQ-2026-0815',
    clientName: 'د. هند العتيبي',
    companyName: 'مجمع واحة الشفاء الطبي',
    crNumber: '1010558821',
    phone: '0538877665',
    email: 'info@wahat-shifa.med.sa',
    city: 'الرياض',
    serviceCategory: 'commerce',
    requestedServices: ['تعديل عقد التأسيس وإضافة شريك', 'تجديد السجل التجاري الرئيسي والفرعي'],
    notes: 'طلب عاجل لاستكمال أوراق الشراكة لدى وزارة التجارة.',
    status: 'completed',
    priority: 'normal',
    channel: 'contact_form',
    createdAt: '2026-08-14T11:00:00',
    estimatedBudget: 1600,
    assignedSpecialist: 'سعد بن فهد',
    convertedOrderId: 'ORD-1447-088',
    issuedInvoiceNumber: 'INV-2026-0075'
  }
];

// Initial Mock Tax Invoices (إصدار الفواتير الضريبية ZATCA)
export const INITIAL_TAX_INVOICES: TaxInvoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-0082',
    invoiceType: 'tax_invoice',
    issueDate: '2026-08-16',
    dueDate: '2026-08-23',
    supplyDate: '2026-08-16',
    sellerName: 'شركة سبّاق لتقنية المعلومات وحلول الامتثال ذ.م.م',
    sellerCR: '1010884920',
    sellerVatNumber: '310188492000003',
    sellerAddress: 'طريق الملك فهد، برج الفيصلية، الرياض، المملكة العربية السعودية',
    sellerCity: 'الرياض',
    sellerPostalCode: '12214',
    
    buyerName: 'شركة السفرة الذهبية لتقديم الوجبات',
    buyerCompany: 'شركة السفرة الذهبية لتقديم الوجبات',
    buyerCR: '1010774891',
    buyerVatNumber: '310177489100003',
    buyerAddress: 'حي الياسمين، طريق أنس بن مالك، الرياض',
    buyerPhone: '0501239874',
    buyerEmail: 'ceo@goldentable.sa',
    buyerCity: 'الرياض',

    items: [
      {
        id: 'inv-item-1',
        description: 'رسوم تجديد رخصة نشاط تجاري بلدي (سنة واحدة) - رسوم حكومية أمانة',
        category: 'gov_fee',
        quantity: 1,
        unitPrice: 1200,
        govFee: 1200,
        discount: 0,
        taxableAmount: 0,
        vatRate: 0.15,
        vatAmount: 0,
        totalWithVat: 1200
      },
      {
        id: 'inv-item-2',
        description: 'أتعاب التدقيق الميداني والرفع الهندسي وإصدار شهادة الامتثال الفوري - سبّاق',
        category: 'service_fee',
        quantity: 1,
        unitPrice: 450,
        govFee: 0,
        discount: 0,
        taxableAmount: 450,
        vatRate: 0.15,
        vatAmount: 67.5,
        totalWithVat: 517.5
      },
      {
        id: 'inv-item-3',
        description: 'إصدار وتوثيق تقرير سلامة معتمد (منصة سلامة الدفاع المدني) مع كاشف الحريق',
        category: 'service_fee',
        quantity: 1,
        unitPrice: 650,
        govFee: 0,
        discount: 50,
        taxableAmount: 600,
        vatRate: 0.15,
        vatAmount: 90,
        totalWithVat: 690
      }
    ],

    govFeesTotal: 1200,
    taxableAmountTotal: 1050,
    vatTotal: 157.5,
    discountTotal: 50,
    grandTotal: 2407.5,

    status: 'pending',
    paymentMethod: 'mada',
    bankAccountName: 'شركة سبّاق لتقنية المعلومات - مصرف الراجحي',
    bankIban: 'SA4480000456608010123456',
    relatedRequestId: 'req-101',
    notes: 'الفاتورة خاضعة للائحة الفوترة الإلكترونية بالمملكة العربية السعودية. الرسوم الحكومية معفاة من ضريبة القيمة المضافة لكونها مدفوعات أمانة للجهات الرسمية.'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-0081',
    invoiceType: 'simplified_tax_invoice',
    issueDate: '2026-08-16',
    dueDate: '2026-08-19',
    supplyDate: '2026-08-16',
    sellerName: 'شركة سبّاق لتقنية المعلومات وحلول الامتثال ذ.م.م',
    sellerCR: '1010884920',
    sellerVatNumber: '310188492000003',
    sellerAddress: 'طريق الملك فهد، الرياض',
    sellerCity: 'الرياض',

    buyerName: 'م. يوسف المنصور',
    buyerCompany: 'مجموعة المروج للمقاولات العامة',
    buyerCR: '4030612984',
    buyerVatNumber: '310403061200003',
    buyerAddress: 'حي الروضة، جدة',
    buyerPhone: '0543322119',
    buyerEmail: 'mansour@almorouj-sa.com',
    buyerCity: 'جدة',

    items: [
      {
        id: 'inv-item-201',
        description: 'صياغة مذكرة اعتراض قانونية وترافع إداري على مخالفة التشوه البصري',
        quantity: 1,
        unitPrice: 1500,
        govFee: 0,
        discount: 100,
        taxableAmount: 1400,
        vatRate: 0.15,
        vatAmount: 210,
        totalWithVat: 1610
      }
    ],

    govFeesTotal: 0,
    taxableAmountTotal: 1400,
    vatTotal: 210,
    discountTotal: 100,
    grandTotal: 1610,

    status: 'paid',
    paymentMethod: 'sadad',
    paidAt: '2026-08-16T17:10:00',
    paidAmount: 1610,
    bankAccountName: 'شركة سبّاق لتقنية المعلومات',
    bankIban: 'SA1210000020109988776655',
    relatedRequestId: 'req-103',
    notes: 'تم سداد الفاتورة إلكترونياً عبر نظام سداد للمدفوعات الحكومية.'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-0079',
    invoiceType: 'tax_invoice',
    issueDate: '2026-08-15',
    dueDate: '2026-08-22',
    supplyDate: '2026-08-15',
    sellerName: 'شركة سبّاق لتقنية المعلومات وحلول الامتثال ذ.م.م',
    sellerCR: '1010884920',
    sellerVatNumber: '310188492000003',
    sellerAddress: 'طريق الملك فهد، الرياض',
    sellerCity: 'الرياض',

    buyerName: 'سلطان عبدالعزيز المقرن',
    buyerCompany: 'مقهى ومحمص رشفة البن',
    buyerCR: '1010334812',
    buyerVatNumber: '310103348100003',
    buyerAddress: 'حي النخيل، الرياض',
    buyerPhone: '0569988771',
    buyerCity: 'الرياض',

    items: [
      {
        id: 'inv-item-301',
        description: 'توريد وتركيب لوحة تحكم إنذار حريق مع 4 كواشف دخان معتمدة من الدفاع المدني',
        quantity: 1,
        unitPrice: 2800,
        govFee: 0,
        discount: 0,
        taxableAmount: 2800,
        vatRate: 0.15,
        vatAmount: 420,
        totalWithVat: 3220
      },
      {
        id: 'inv-item-302',
        description: 'إصدار شهادة التفتيش والفحص السنوي عبر منصة سلامة - رسوم ترخيص',
        quantity: 1,
        unitPrice: 850,
        govFee: 0,
        discount: 0,
        taxableAmount: 850,
        vatRate: 0.15,
        vatAmount: 127.5,
        totalWithVat: 977.5
      }
    ],

    govFeesTotal: 0,
    taxableAmountTotal: 3650,
    vatTotal: 547.5,
    discountTotal: 0,
    grandTotal: 4197.5,

    status: 'paid',
    paymentMethod: 'bank_transfer',
    paidAt: '2026-08-15T16:45:00',
    paidAmount: 4197.5,
    relatedOrderId: 'ORD-1447-091',
    relatedRequestId: 'req-104',
    notes: 'تم تحويل المبلغ بالكامل لحساب مصرف الراجحي وتم اعتماد إشعار التحويل البنكي.'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2026-0075',
    invoiceType: 'tax_invoice',
    issueDate: '2026-08-14',
    dueDate: '2026-08-21',
    supplyDate: '2026-08-14',
    sellerName: 'شركة سبّاق لتقنية المعلومات وحلول الامتثال ذ.م.م',
    sellerCR: '1010884920',
    sellerVatNumber: '310188492000003',
    sellerAddress: 'طريق الملك فهد، الرياض',
    sellerCity: 'الرياض',

    buyerName: 'د. هند العتيبي',
    buyerCompany: 'مجمع واحة الشفاء الطبي',
    buyerCR: '1010558821',
    buyerVatNumber: '310105588200003',
    buyerAddress: 'طريق الملك عبدالعزيز، الرياض',
    buyerPhone: '0538877665',
    buyerCity: 'الرياض',

    items: [
      {
        id: 'inv-item-401',
        description: 'رسوم حكومية لتعديل السجل التجاري وإضافة شريك (وزارة التجارة)',
        quantity: 1,
        unitPrice: 800,
        govFee: 800,
        discount: 0,
        taxableAmount: 0,
        vatRate: 0.15,
        vatAmount: 0,
        totalWithVat: 800
      },
      {
        id: 'inv-item-402',
        description: 'أتعاب إعداد ومراجعة قرارات الشركاء والتنسيق مع كاتب العدل الإلكتروني',
        quantity: 1,
        unitPrice: 700,
        govFee: 0,
        discount: 0,
        taxableAmount: 700,
        vatRate: 0.15,
        vatAmount: 105,
        totalWithVat: 805
      }
    ],

    govFeesTotal: 800,
    taxableAmountTotal: 700,
    vatTotal: 105,
    discountTotal: 0,
    grandTotal: 1605,

    status: 'paid',
    paymentMethod: 'visa',
    paidAt: '2026-08-14T12:30:00',
    paidAmount: 1605,
    relatedOrderId: 'ORD-1447-088',
    relatedRequestId: 'req-105',
    notes: 'تمت العملية بنجاح عبر بطاقة مدى/فيزا المصرفية.'
  }
];

/**
 * ZATCA Phase 2 TLV (Tag-Length-Value) Base64 QR Code Generator
 * Standard tags:
 * 1: Seller Name
 * 2: VAT Registration Number
 * 3: Timestamp (ISO 8601)
 * 4: Invoice Total (with VAT)
 * 5: VAT Total
 */
export function generateZatcaTlvQrBase64(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVat: number,
  vatTotal: number
): string {
  try {
    const formatTLV = (tagNum: number, strVal: string): Uint8Array => {
      const encoder = new TextEncoder();
      const valBytes = encoder.encode(strVal);
      const tag = tagNum;
      const length = valBytes.length;
      const tlv = new Uint8Array(2 + length);
      tlv[0] = tag;
      tlv[1] = length;
      tlv.set(valBytes, 2);
      return tlv;
    };

    const tlv1 = formatTLV(1, sellerName);
    const tlv2 = formatTLV(2, vatNumber);
    const tlv3 = formatTLV(3, timestamp.includes('T') ? timestamp : `${timestamp}T12:00:00Z`);
    const tlv4 = formatTLV(4, totalWithVat.toFixed(2));
    const tlv5 = formatTLV(5, vatTotal.toFixed(2));

    const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
    const combined = new Uint8Array(totalLength);
    let offset = 0;

    [tlv1, tlv2, tlv3, tlv4, tlv5].forEach(chunk => {
      combined.set(chunk, offset);
      offset += chunk.length;
    });

    // Convert bytes to binary string
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (e) {
    // Fallback simple base64 string
    return btoa(`SABBAQ|${sellerName}|${vatNumber}|${timestamp}|${totalWithVat}|${vatTotal}`);
  }
}

/**
 * Arabic Currency Spell-out (Tafqeet) helper
 */
export function numberToArabicWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const riyals = Math.floor(rounded);
  const halalas = Math.round((rounded - riyals) * 100);

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (remainder > 0) {
      if (result) result += ' و ';
      if (remainder < 10) {
        result += units[remainder];
      } else if (remainder >= 11 && remainder <= 19) {
        result += teens[remainder - 10];
      } else if (u === 0) {
        result += tens[t];
      } else {
        result += `${units[u]} و ${tens[t]}`;
      }
    }
    return result;
  }

  function convertFullNumber(n: number): string {
    if (n === 0) return 'صفر';
    if (n < 1000) return convertGroup(n);
    
    const k = Math.floor(n / 1000);
    const rem = n % 1000;
    let kStr = '';
    if (k === 1) kStr = 'ألف';
    else if (k === 2) kStr = 'ألفان';
    else if (k >= 3 && k <= 10) kStr = `${units[k]} آلاف`;
    else kStr = `${convertGroup(k)} ألفاً`;

    const remStr = convertGroup(rem);
    if (!remStr) return kStr;
    return `${kStr} و ${remStr}`;
  }

  const riyalsStr = convertFullNumber(riyals);
  let finalStr = `${riyalsStr} ريال سعودي`;

  if (halalas > 0) {
    const halalasStr = convertFullNumber(halalas);
    finalStr += ` و ${halalasStr} هللة`;
  }

  return `فقط ${finalStr} لا غير`;
}
