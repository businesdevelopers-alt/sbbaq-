import { RemediationCategory } from './complianceMarketData';

export interface SupplierPerformanceKPI {
  supplierId: string;
  supplierName: string;
  commercialRegNumber: string;
  category: RemediationCategory;
  categoryLabelAr: string;
  city: string;
  regionAr: string;
  verificationLevel: 'platinum_accredited' | 'gold_verified' | 'silver_partner';
  
  // Fulfillment Time Metrics
  avgCompletionDays: number; // e.g. 2.4 days
  targetSlaDays: number; // e.g. 3.0 days
  fastestCompletionHours: number; // e.g. 6 hours
  slaComplianceRate: number; // 98.6%
  ordersCountThisPeriod: number;
  totalCompletedOrders: number;
  
  // Quality & Gov Inspection Metrics
  firstTimePassRate: number; // 99.2% نسبة قبول الفحص الحكومي من أول مرة
  rejectionRate: number; // 0.8%
  reworkRequiredCount: number;
  
  // Customer Satisfaction Metrics
  overallRating: number; // 4.92 / 5.0
  totalReviewsCount: number;
  npsScore: number; // Net Promoter Score +78
  csatPercentage: number; // 98.4%
  satisfactionBreakdown: {
    quality: number; // 4.95
    speed: number; // 4.88
    communication: number; // 4.90
    pricingFairness: number; // 4.75
    complianceAccuracy: number; // 4.98
  };
  ratingDistribution: {
    stars5: number; // count
    stars4: number;
    stars3: number;
    stars2: number;
    stars1: number;
  };
  
  // Financial & Efficiency
  avgOrderValueSAR: number;
  totalVolumeSAR: number;
  disputeRate: number; // 0.2%
  emergencyResponseAvgMins: number; // 35 minutes
  isEmergencyAvailable: boolean;
  performanceTier: 'top_performer' | 'meets_expectations' | 'needs_improvement' | 'at_risk';
  badgeTitleAr: string;
}

export interface DetailedSupplierReview {
  id: string;
  supplierId: string;
  supplierName: string;
  establishmentName: string;
  orderNumber: string;
  category: RemediationCategory;
  categoryLabelAr: string;
  rating: number; // 1-5
  speedRating: number;
  qualityRating: number;
  communicationRating: number;
  complianceRating: number;
  clientCommentAr: string;
  supplierResponseAr?: string;
  resolvedAt: string;
  completionDaysTaken: number;
  targetDays: number;
  verifiedGovPass: boolean;
  city: string;
  isPositive: boolean;
  sentiment: 'positive' | 'neutral' | 'critical';
}

export interface MonthlyPerformanceTrend {
  month: string;
  monthAr: string;
  avgCompletionDays: number;
  slaTargetDays: number;
  csatScore: number; // out of 5.0
  npsScore: number;
  totalOrdersCompleted: number;
  onTimeDeliveryRate: number;
  civilDefenseAvgDays: number;
  baladyAvgDays: number;
  zatcaAvgDays: number;
  qiwaAvgDays: number;
  healthSafetyAvgDays: number;
}

export const SUPPLIER_PERFORMANCE_METRICS: SupplierPerformanceKPI[] = [
  {
    supplierId: 'sup-01',
    supplierName: 'شركة درع السلامة للأنظمة الأمنية والدفاع المدني',
    commercialRegNumber: '1010884921',
    category: 'civil_defense',
    categoryLabelAr: 'السلامة والدفاع المدني',
    city: 'الرياض',
    regionAr: 'منطقة الرياض',
    verificationLevel: 'platinum_accredited',
    avgCompletionDays: 2.1,
    targetSlaDays: 3.5,
    fastestCompletionHours: 8,
    slaComplianceRate: 99.1,
    ordersCountThisPeriod: 84,
    totalCompletedOrders: 520,
    firstTimePassRate: 99.4,
    rejectionRate: 0.6,
    reworkRequiredCount: 2,
    overallRating: 4.94,
    totalReviewsCount: 245,
    npsScore: 82,
    csatPercentage: 98.8,
    satisfactionBreakdown: {
      quality: 4.96,
      speed: 4.92,
      communication: 4.90,
      pricingFairness: 4.80,
      complianceAccuracy: 4.99
    },
    ratingDistribution: {
      stars5: 218,
      stars4: 22,
      stars3: 4,
      stars2: 1,
      stars1: 0
    },
    avgOrderValueSAR: 6200,
    totalVolumeSAR: 520800,
    disputeRate: 0.1,
    emergencyResponseAvgMins: 28,
    isEmergencyAvailable: true,
    performanceTier: 'top_performer',
    badgeTitleAr: 'مورد بلاتيني فائق السرعة'
  },
  {
    supplierId: 'sup-02',
    supplierName: 'مؤسسة أفق التقنية لحلول الربط والفوترة السحابية',
    commercialRegNumber: '1010729381',
    category: 'zatca',
    categoryLabelAr: 'الفوترة الإلكترونية والزكاة',
    city: 'الرياض',
    regionAr: 'تغطية سحابية لجميع المناطق',
    verificationLevel: 'platinum_accredited',
    avgCompletionDays: 1.2,
    targetSlaDays: 2.0,
    fastestCompletionHours: 3,
    slaComplianceRate: 99.6,
    ordersCountThisPeriod: 142,
    totalCompletedOrders: 840,
    firstTimePassRate: 99.8,
    rejectionRate: 0.2,
    reworkRequiredCount: 1,
    overallRating: 4.91,
    totalReviewsCount: 310,
    npsScore: 85,
    csatPercentage: 99.2,
    satisfactionBreakdown: {
      quality: 4.95,
      speed: 4.98,
      communication: 4.85,
      pricingFairness: 4.82,
      complianceAccuracy: 4.99
    },
    ratingDistribution: {
      stars5: 282,
      stars4: 24,
      stars3: 3,
      stars2: 1,
      stars1: 0
    },
    avgOrderValueSAR: 2850,
    totalVolumeSAR: 404700,
    disputeRate: 0.05,
    emergencyResponseAvgMins: 15,
    isEmergencyAvailable: true,
    performanceTier: 'top_performer',
    badgeTitleAr: 'الأعلى تقييماً في الربط السحابي'
  },
  {
    supplierId: 'sup-03',
    supplierName: 'مجموعة المقياس المتكامل للمقاولات والاستشارات الهندسية',
    commercialRegNumber: '4030612984',
    category: 'balady',
    categoryLabelAr: 'التراخيص والبلديات واللافتات',
    city: 'جدة',
    regionAr: 'منطقة مكة المكرمة',
    verificationLevel: 'gold_verified',
    avgCompletionDays: 3.8,
    targetSlaDays: 4.5,
    fastestCompletionHours: 18,
    slaComplianceRate: 96.8,
    ordersCountThisPeriod: 56,
    totalCompletedOrders: 340,
    firstTimePassRate: 98.2,
    rejectionRate: 1.8,
    reworkRequiredCount: 4,
    overallRating: 4.82,
    totalReviewsCount: 165,
    npsScore: 74,
    csatPercentage: 96.4,
    satisfactionBreakdown: {
      quality: 4.88,
      speed: 4.70,
      communication: 4.80,
      pricingFairness: 4.72,
      complianceAccuracy: 4.90
    },
    ratingDistribution: {
      stars5: 138,
      stars4: 21,
      stars3: 4,
      stars2: 2,
      stars1: 0
    },
    avgOrderValueSAR: 7800,
    totalVolumeSAR: 436800,
    disputeRate: 0.3,
    emergencyResponseAvgMins: 90,
    isEmergencyAvailable: false,
    performanceTier: 'top_performer',
    badgeTitleAr: 'شريك هندسي موثوق'
  },
  {
    supplierId: 'sup-04',
    supplierName: 'شركة البيئة النقية لمعالجة النفايات والشحوم التجارية',
    commercialRegNumber: '2050192847',
    category: 'environmental',
    categoryLabelAr: 'البيئة ومصائد الشحوم',
    city: 'الدمام',
    regionAr: 'المنطقة الشرقية',
    verificationLevel: 'gold_verified',
    avgCompletionDays: 2.6,
    targetSlaDays: 3.0,
    fastestCompletionHours: 12,
    slaComplianceRate: 97.4,
    ordersCountThisPeriod: 38,
    totalCompletedOrders: 215,
    firstTimePassRate: 98.9,
    rejectionRate: 1.1,
    reworkRequiredCount: 2,
    overallRating: 4.78,
    totalReviewsCount: 98,
    npsScore: 71,
    csatPercentage: 95.8,
    satisfactionBreakdown: {
      quality: 4.82,
      speed: 4.76,
      communication: 4.70,
      pricingFairness: 4.75,
      complianceAccuracy: 4.86
    },
    ratingDistribution: {
      stars5: 79,
      stars4: 14,
      stars3: 3,
      stars2: 2,
      stars1: 0
    },
    avgOrderValueSAR: 4200,
    totalVolumeSAR: 159600,
    disputeRate: 0.2,
    emergencyResponseAvgMins: 45,
    isEmergencyAvailable: true,
    performanceTier: 'meets_expectations',
    badgeTitleAr: 'معتمد بيئياً'
  },
  {
    supplierId: 'sup-05',
    supplierName: 'مركز الركيزة للاستشارات القانونية والاعتراضات العمالية',
    commercialRegNumber: '1010649281',
    category: 'legal_consulting',
    categoryLabelAr: 'الاستشارات واللوائح والاعتراضات',
    city: 'الرياض',
    regionAr: 'منطقة الرياض',
    verificationLevel: 'platinum_accredited',
    avgCompletionDays: 2.4,
    targetSlaDays: 3.0,
    fastestCompletionHours: 6,
    slaComplianceRate: 98.5,
    ordersCountThisPeriod: 45,
    totalCompletedOrders: 190,
    firstTimePassRate: 99.1,
    rejectionRate: 0.9,
    reworkRequiredCount: 1,
    overallRating: 4.89,
    totalReviewsCount: 112,
    npsScore: 80,
    csatPercentage: 97.8,
    satisfactionBreakdown: {
      quality: 4.94,
      speed: 4.84,
      communication: 4.92,
      pricingFairness: 4.70,
      complianceAccuracy: 4.96
    },
    ratingDistribution: {
      stars5: 98,
      stars4: 11,
      stars3: 2,
      stars2: 1,
      stars1: 0
    },
    avgOrderValueSAR: 5500,
    totalVolumeSAR: 247500,
    disputeRate: 0.1,
    emergencyResponseAvgMins: 30,
    isEmergencyAvailable: true,
    performanceTier: 'top_performer',
    badgeTitleAr: 'استشارات قانونية عالية الدقة'
  },
  {
    supplierId: 'sup-06',
    supplierName: 'مؤسسة صمام الأمان للصحة المهنية ومعدات السلامة',
    commercialRegNumber: '1010552918',
    category: 'occupational_health',
    categoryLabelAr: 'السلامة والصحة المهنية',
    city: 'الرياض',
    regionAr: 'منطقة الرياض والقصيم',
    verificationLevel: 'silver_partner',
    avgCompletionDays: 3.2,
    targetSlaDays: 3.5,
    fastestCompletionHours: 14,
    slaComplianceRate: 95.2,
    ordersCountThisPeriod: 29,
    totalCompletedOrders: 140,
    firstTimePassRate: 97.1,
    rejectionRate: 2.9,
    reworkRequiredCount: 3,
    overallRating: 4.68,
    totalReviewsCount: 65,
    npsScore: 65,
    csatPercentage: 93.6,
    satisfactionBreakdown: {
      quality: 4.72,
      speed: 4.60,
      communication: 4.65,
      pricingFairness: 4.80,
      complianceAccuracy: 4.76
    },
    ratingDistribution: {
      stars5: 48,
      stars4: 12,
      stars3: 3,
      stars2: 2,
      stars1: 0
    },
    avgOrderValueSAR: 3600,
    totalVolumeSAR: 104400,
    disputeRate: 0.4,
    emergencyResponseAvgMins: 60,
    isEmergencyAvailable: true,
    performanceTier: 'meets_expectations',
    badgeTitleAr: 'توريدات سلامة معتمدة'
  },
  {
    supplierId: 'sup-07',
    supplierName: 'شركة التمكين الذكي لاستشارات قوى ومنصة مقيم',
    commercialRegNumber: '1010398271',
    category: 'qiwa_muqeem',
    categoryLabelAr: 'العمل والتشغيل وتوطين المهن',
    city: 'الرياض',
    regionAr: 'جميع مناطق المملكة (خدمة إلكترونية)',
    verificationLevel: 'platinum_accredited',
    avgCompletionDays: 1.4,
    targetSlaDays: 2.0,
    fastestCompletionHours: 4,
    slaComplianceRate: 99.2,
    ordersCountThisPeriod: 110,
    totalCompletedOrders: 620,
    firstTimePassRate: 99.5,
    rejectionRate: 0.5,
    reworkRequiredCount: 2,
    overallRating: 4.88,
    totalReviewsCount: 215,
    npsScore: 79,
    csatPercentage: 97.9,
    satisfactionBreakdown: {
      quality: 4.90,
      speed: 4.94,
      communication: 4.85,
      pricingFairness: 4.78,
      complianceAccuracy: 4.95
    },
    ratingDistribution: {
      stars5: 188,
      stars4: 21,
      stars3: 4,
      stars2: 2,
      stars1: 0
    },
    avgOrderValueSAR: 3200,
    totalVolumeSAR: 352000,
    disputeRate: 0.08,
    emergencyResponseAvgMins: 20,
    isEmergencyAvailable: true,
    performanceTier: 'top_performer',
    badgeTitleAr: 'خبير التوطين ومنصة قوى'
  },
  {
    supplierId: 'sup-08',
    supplierName: 'شركة الحماية الرقمية للأنظمة الأمنية وكاميرات المراقبة',
    commercialRegNumber: '1010892019',
    category: 'technical_security',
    categoryLabelAr: 'الأمن والأنظمة والكاميرات',
    city: 'الرياض',
    regionAr: 'منطقة الرياض والشرقية',
    verificationLevel: 'gold_verified',
    avgCompletionDays: 2.8,
    targetSlaDays: 3.5,
    fastestCompletionHours: 10,
    slaComplianceRate: 97.9,
    ordersCountThisPeriod: 42,
    totalCompletedOrders: 230,
    firstTimePassRate: 98.8,
    rejectionRate: 1.2,
    reworkRequiredCount: 2,
    overallRating: 4.84,
    totalReviewsCount: 118,
    npsScore: 76,
    csatPercentage: 96.9,
    satisfactionBreakdown: {
      quality: 4.90,
      speed: 4.80,
      communication: 4.82,
      pricingFairness: 4.74,
      complianceAccuracy: 4.92
    },
    ratingDistribution: {
      stars5: 99,
      stars4: 15,
      stars3: 3,
      stars2: 1,
      stars1: 0
    },
    avgOrderValueSAR: 6800,
    totalVolumeSAR: 285600,
    disputeRate: 0.15,
    emergencyResponseAvgMins: 40,
    isEmergencyAvailable: true,
    performanceTier: 'top_performer',
    badgeTitleAr: 'شهادات ضبط أمني معتمدة'
  }
];

export const MONTHLY_PERFORMANCE_TRENDS: MonthlyPerformanceTrend[] = [
  {
    month: '2025-09',
    monthAr: 'سبتمبر 2025',
    avgCompletionDays: 3.4,
    slaTargetDays: 3.5,
    csatScore: 4.72,
    npsScore: 68,
    totalOrdersCompleted: 290,
    onTimeDeliveryRate: 94.8,
    civilDefenseAvgDays: 2.8,
    baladyAvgDays: 4.5,
    zatcaAvgDays: 1.6,
    qiwaAvgDays: 1.8,
    healthSafetyAvgDays: 3.8
  },
  {
    month: '2025-10',
    monthAr: 'أكتوبر 2025',
    avgCompletionDays: 3.1,
    slaTargetDays: 3.5,
    csatScore: 4.76,
    npsScore: 71,
    totalOrdersCompleted: 340,
    onTimeDeliveryRate: 95.7,
    civilDefenseAvgDays: 2.6,
    baladyAvgDays: 4.2,
    zatcaAvgDays: 1.5,
    qiwaAvgDays: 1.6,
    healthSafetyAvgDays: 3.5
  },
  {
    month: '2025-11',
    monthAr: 'نوفمبر 2025',
    avgCompletionDays: 2.9,
    slaTargetDays: 3.5,
    csatScore: 4.80,
    npsScore: 74,
    totalOrdersCompleted: 395,
    onTimeDeliveryRate: 96.8,
    civilDefenseAvgDays: 2.4,
    baladyAvgDays: 4.0,
    zatcaAvgDays: 1.4,
    qiwaAvgDays: 1.5,
    healthSafetyAvgDays: 3.3
  },
  {
    month: '2025-12',
    monthAr: 'ديسمبر 2025',
    avgCompletionDays: 2.7,
    slaTargetDays: 3.5,
    csatScore: 4.83,
    npsScore: 76,
    totalOrdersCompleted: 450,
    onTimeDeliveryRate: 97.4,
    civilDefenseAvgDays: 2.3,
    baladyAvgDays: 3.8,
    zatcaAvgDays: 1.3,
    qiwaAvgDays: 1.4,
    healthSafetyAvgDays: 3.2
  },
  {
    month: '2026-01',
    monthAr: 'يناير 2026',
    avgCompletionDays: 2.5,
    slaTargetDays: 3.0,
    csatScore: 4.85,
    npsScore: 78,
    totalOrdersCompleted: 480,
    onTimeDeliveryRate: 97.9,
    civilDefenseAvgDays: 2.2,
    baladyAvgDays: 3.6,
    zatcaAvgDays: 1.2,
    qiwaAvgDays: 1.3,
    healthSafetyAvgDays: 3.0
  },
  {
    month: '2026-02',
    monthAr: 'فبراير 2026',
    avgCompletionDays: 2.3,
    slaTargetDays: 3.0,
    csatScore: 4.88,
    npsScore: 81,
    totalOrdersCompleted: 510,
    onTimeDeliveryRate: 98.4,
    civilDefenseAvgDays: 2.1,
    baladyAvgDays: 3.4,
    zatcaAvgDays: 1.1,
    qiwaAvgDays: 1.2,
    healthSafetyAvgDays: 2.9
  },
  {
    month: '2026-03',
    monthAr: 'مارس 2026',
    avgCompletionDays: 2.2,
    slaTargetDays: 3.0,
    csatScore: 4.90,
    npsScore: 83,
    totalOrdersCompleted: 545,
    onTimeDeliveryRate: 98.7,
    civilDefenseAvgDays: 2.0,
    baladyAvgDays: 3.3,
    zatcaAvgDays: 1.1,
    qiwaAvgDays: 1.1,
    healthSafetyAvgDays: 2.8
  },
  {
    month: '2026-04',
    monthAr: 'أبريل 2026',
    avgCompletionDays: 2.1,
    slaTargetDays: 3.0,
    csatScore: 4.89,
    npsScore: 82,
    totalOrdersCompleted: 570,
    onTimeDeliveryRate: 98.5,
    civilDefenseAvgDays: 2.0,
    baladyAvgDays: 3.2,
    zatcaAvgDays: 1.0,
    qiwaAvgDays: 1.1,
    healthSafetyAvgDays: 2.7
  },
  {
    month: '2026-05',
    monthAr: 'مايو 2026',
    avgCompletionDays: 2.0,
    slaTargetDays: 3.0,
    csatScore: 4.91,
    npsScore: 84,
    totalOrdersCompleted: 605,
    onTimeDeliveryRate: 98.9,
    civilDefenseAvgDays: 1.9,
    baladyAvgDays: 3.1,
    zatcaAvgDays: 1.0,
    qiwaAvgDays: 1.0,
    healthSafetyAvgDays: 2.6
  },
  {
    month: '2026-06',
    monthAr: 'يونيو 2026',
    avgCompletionDays: 1.9,
    slaTargetDays: 2.8,
    csatScore: 4.92,
    npsScore: 85,
    totalOrdersCompleted: 640,
    onTimeDeliveryRate: 99.1,
    civilDefenseAvgDays: 1.8,
    baladyAvgDays: 3.0,
    zatcaAvgDays: 0.9,
    qiwaAvgDays: 1.0,
    healthSafetyAvgDays: 2.5
  },
  {
    month: '2026-07',
    monthAr: 'يوليو 2026',
    avgCompletionDays: 1.9,
    slaTargetDays: 2.8,
    csatScore: 4.93,
    npsScore: 86,
    totalOrdersCompleted: 680,
    onTimeDeliveryRate: 99.2,
    civilDefenseAvgDays: 1.8,
    baladyAvgDays: 2.9,
    zatcaAvgDays: 0.9,
    qiwaAvgDays: 0.9,
    healthSafetyAvgDays: 2.4
  },
  {
    month: '2026-08',
    monthAr: 'أغسطس 2026 (حالي)',
    avgCompletionDays: 1.8,
    slaTargetDays: 2.8,
    csatScore: 4.94,
    npsScore: 88,
    totalOrdersCompleted: 710,
    onTimeDeliveryRate: 99.4,
    civilDefenseAvgDays: 1.7,
    baladyAvgDays: 2.8,
    zatcaAvgDays: 0.8,
    qiwaAvgDays: 0.9,
    healthSafetyAvgDays: 2.3
  }
];

export const DETAILED_CUSTOMER_REVIEWS: DetailedSupplierReview[] = [
  {
    id: 'rev-01',
    supplierId: 'sup-01',
    supplierName: 'شركة درع السلامة للأنظمة الأمنية والدفاع المدني',
    establishmentName: 'شركة المذاق العربي للخدمات الغذائية',
    orderNumber: 'REQ-2026-0814',
    category: 'civil_defense',
    categoryLabelAr: 'السلامة والدفاع المدني',
    rating: 5,
    speedRating: 5,
    qualityRating: 5,
    communicationRating: 5,
    complianceRating: 5,
    clientCommentAr: 'سرعة استجابة استثنائية! تم فحص 4 فروع وتركيب كواشف الدخان وإصدار عقد سلامة الإلكتروني وتوثيقه لدى الدفاع المدني في أقل من 24 ساعة وتجنبنا غرامة وشيكة.',
    supplierResponseAr: 'شكراً لثقتكم الغالية، نسعد دائماً بخدمتكم وتوفير أعلى معايير الأمان المعتمدة لدى الدفاع المدني.',
    resolvedAt: '2026-08-14',
    completionDaysTaken: 1.0,
    targetDays: 3.0,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-02',
    supplierId: 'sup-02',
    supplierName: 'مؤسسة أفق التقنية لحلول الربط والفوترة السحابية',
    establishmentName: 'سلسلة مقاهي أروما نجد',
    orderNumber: 'REQ-2026-0792',
    category: 'zatca',
    categoryLabelAr: 'الفوترة الإلكترونية والزكاة',
    rating: 5,
    speedRating: 5,
    qualityRating: 5,
    communicationRating: 5,
    complianceRating: 5,
    clientCommentAr: 'تم الربط والتكامل مع منصة فاتورة (ZATCA Phase 2) لـ 8 نقاط بيع سحابياً في غضون 4 ساعات فقط مع تدريب المحاسبين واختبار إرسال الفواتير التجريبية بنجاح 100%.',
    supplierResponseAr: 'فخورون بخدمة علامتكم التجارية المتميزة وضمان الامتثال التام مع متطلبات هيئة الزكاة.',
    resolvedAt: '2026-08-12',
    completionDaysTaken: 0.5,
    targetDays: 2.0,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-03',
    supplierId: 'sup-03',
    supplierName: 'مجموعة المقياس المتكامل للمقاولات والاستشارات الهندسية',
    establishmentName: 'شركة البناء والعمران الحديث',
    orderNumber: 'REQ-2026-0711',
    category: 'balady',
    categoryLabelAr: 'التراخيص والبلديات واللافتات',
    rating: 4.8,
    speedRating: 4.5,
    qualityRating: 5,
    communicationRating: 4.8,
    complianceRating: 5,
    clientCommentAr: 'فريق هندسي محترف للغاية، قاموا بالرفع المساحي وتعديل واجهة المحل لإزالة التشوه البصري ورفع التقرير عبر منصة بلدي وحصلنا على شهادة الامتثال الفوري.',
    resolvedAt: '2026-08-08',
    completionDaysTaken: 3.0,
    targetDays: 4.0,
    verifiedGovPass: true,
    city: 'جدة',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-04',
    supplierId: 'sup-05',
    supplierName: 'مركز الركيزة للاستشارات القانونية والاعتراضات العمالية',
    establishmentName: 'مؤسسة الرياض اللوجستية',
    orderNumber: 'REQ-2026-0688',
    category: 'legal_consulting',
    categoryLabelAr: 'الاستشارات واللوائح والاعتراضات',
    rating: 5,
    speedRating: 4.8,
    qualityRating: 5,
    communicationRating: 5,
    complianceRating: 5,
    clientCommentAr: 'تم صياغة لائحة اعتراضية محكمة ضد مخالفة توطين غير مستحقة وتم قبول الاعتراض وإلغاء الغرامة البالغة 20,000 ريال بالكامل واسترداد الرسوم.',
    supplierResponseAr: 'يسرنا حماية حقوقكم وضمان التطبيق القانوني السليم لأنظمة العمل والتوطين.',
    resolvedAt: '2026-08-05',
    completionDaysTaken: 2.0,
    targetDays: 3.0,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-05',
    supplierId: 'sup-07',
    supplierName: 'شركة التمكين الذكي لاستشارات قوى ومنصة مقيم',
    establishmentName: 'شركة مطابخ الضيافة الفاخرة',
    orderNumber: 'REQ-2026-0650',
    category: 'qiwa_muqeem',
    categoryLabelAr: 'العمل والتشغيل وتوطين المهن',
    rating: 5,
    speedRating: 5,
    qualityRating: 4.9,
    communicationRating: 4.8,
    complianceRating: 5,
    clientCommentAr: 'تمت معالجة مؤشر نطاقات ورفع نسبة التوطين وتحديث عقود قوى الموثقة لـ 32 موظف خلال يوم واحد، مما سمح بتجديد رخص العمل دون أي تعطيل.',
    resolvedAt: '2026-08-01',
    completionDaysTaken: 1.0,
    targetDays: 2.0,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-06',
    supplierId: 'sup-04',
    supplierName: 'شركة البيئة النقية لمعالجة النفايات والشحوم التجارية',
    establishmentName: 'مطاعم نكهات الشرق البحرية',
    orderNumber: 'REQ-2026-0599',
    category: 'environmental',
    categoryLabelAr: 'البيئة ومصائد الشحوم',
    rating: 4.6,
    speedRating: 4.5,
    qualityRating: 4.8,
    communicationRating: 4.5,
    complianceRating: 4.9,
    clientCommentAr: 'تنظيف وتفريغ مصائد الشحوم مع توثيق التقرير وإصدار شهادة التخلص المعتمدة من الأمانة. الخدمة ممتازة وفريق العمل منظم.',
    resolvedAt: '2026-07-28',
    completionDaysTaken: 2.5,
    targetDays: 3.0,
    verifiedGovPass: true,
    city: 'الدمام',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-07',
    supplierId: 'sup-08',
    supplierName: 'شركة الحماية الرقمية للأنظمة الأمنية وكاميرات المراقبة',
    establishmentName: 'مجمعات العناية الطبية',
    orderNumber: 'REQ-2026-0542',
    category: 'technical_security',
    categoryLabelAr: 'الأمن والأنظمة والكاميرات',
    rating: 4.9,
    speedRating: 4.8,
    qualityRating: 5,
    communicationRating: 4.8,
    complianceRating: 5,
    clientCommentAr: 'تركيب نظام كاميرات مراقبة وتخزين سحابي مطابق للمواصفات الأمنية لوزارة الداخلية وإصدار شهادة الضبط الأمني وتفادي إغلاق المنشأة.',
    resolvedAt: '2026-07-22',
    completionDaysTaken: 2.0,
    targetDays: 3.5,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  },
  {
    id: 'rev-08',
    supplierId: 'sup-06',
    supplierName: 'مؤسسة صمام الأمان للصحة المهنية ومعدات السلامة',
    establishmentName: 'مصانع المواد الغذائية المتحدة',
    orderNumber: 'REQ-2026-0498',
    category: 'occupational_health',
    categoryLabelAr: 'السلامة والصحة المهنية',
    rating: 4.5,
    speedRating: 4.3,
    qualityRating: 4.7,
    communicationRating: 4.6,
    complianceRating: 4.8,
    clientCommentAr: 'توريد حقائب الإسعافات الأولية وتجهيز أدوات السلامة المهنية ومخارج الطوارئ مع لوحات إرشادية واضحة.',
    resolvedAt: '2026-07-15',
    completionDaysTaken: 3.0,
    targetDays: 3.5,
    verifiedGovPass: true,
    city: 'الرياض',
    isPositive: true,
    sentiment: 'positive'
  }
];

export const CATEGORY_COMPLETION_BENCHMARKS = [
  { category: 'الفوترة والزكاة (ZATCA)', avgDays: 1.1, targetDays: 2.0, passRate: 99.8, satisfaction: 4.92, suppliersCount: 3 },
  { category: 'أنظمة العمل (قوى ومقيم)', avgDays: 1.2, targetDays: 2.0, passRate: 99.5, satisfaction: 4.89, suppliersCount: 4 },
  { category: 'الدفاع المدني والسلامة', avgDays: 2.1, targetDays: 3.5, passRate: 99.4, satisfaction: 4.94, suppliersCount: 5 },
  { category: 'الاستشارات القانونية', avgDays: 2.3, targetDays: 3.0, passRate: 99.1, satisfaction: 4.90, suppliersCount: 3 },
  { category: 'البيئة والنفايات', avgDays: 2.6, targetDays: 3.0, passRate: 98.9, satisfaction: 4.78, suppliersCount: 2 },
  { category: 'الأنظمة الأمنية والكاميرات', avgDays: 2.7, targetDays: 3.5, passRate: 98.8, satisfaction: 4.84, suppliersCount: 3 },
  { category: 'الصحة المهنية والإسعافات', avgDays: 3.1, targetDays: 3.5, passRate: 97.5, satisfaction: 4.70, suppliersCount: 2 },
  { category: 'المكاتب الهندسية وبلدي', avgDays: 3.5, targetDays: 4.5, passRate: 98.2, satisfaction: 4.82, suppliersCount: 4 }
];
