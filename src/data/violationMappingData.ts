import { ViolationSeverity } from '../types';
import { MOCK_REMEDIATION_SOLUTIONS, RemediationSolution } from './complianceMarketData';

export type DiagnosticQuestionType = 'yes_no' | 'multiple_choice' | 'evidence_required' | 'numeric_input';

export type DiagnosticOutcomePath = 
  | 'objection'            // يرجح الاعتراض القانوني وإلغاء الغرامة
  | 'direct_solution'      // يتطلب معالجة فورية وتجديد ترخيص
  | 'supplier_request'     // يتطلب تعاقد مع مورد معتمد أو مقاول
  | 'urgent_containment'   // احتواء عاجل لتفادي إغلاق المنشأة
  | 'field_inspection';    // يحتاج معاينة ميدانية فنية

export interface DiagnosticOption {
  id: string;
  labelAr: string;
  outcomePath: DiagnosticOutcomePath;
  pathLabelAr: string;
  guidanceAr: string;
  objectionScoreImpact: number; // e.g. +35, -20 (for calculated objection viability)
  suggestedSolutionCodes?: string[]; // e.g. ["SOL-BAL-02", "SOL-LEG-06"]
}

export interface DiagnosticQuestion {
  id: string;
  questionTextAr: string;
  descriptionAr?: string;
  type: DiagnosticQuestionType;
  isMandatory: boolean;
  orderIndex: number;
  saudiLawArticleRef?: string;
  options: DiagnosticOption[];
  evidenceTipAr?: string;
}

export interface LinkedSolutionRecommendation {
  solutionId: string; // references RemediationSolution id (e.g. sol-cd-01)
  solutionCode: string; // e.g. SOL-DEF-01
  solutionTitleAr: string;
  recommendationLevel: 'primary' | 'preventive' | 'alternative';
  recommendationLevelLabelAr: string;
  effectivenessPercent: number; // e.g. 98%
  priorityRank: number; // 1, 2, 3
  customEstimatedPriceSAR?: number;
  customEstimatedLeadDays?: number;
  adminNotesAr?: string;
}

export interface ViolationSolutionMapping {
  id: string;
  violationCode: string; // e.g. VIO-BAL-101
  titleAr: string;
  titleEn?: string;
  authority: string; // e.g. وزارة البلديات والإسكان (بلدي)
  authorityCategory: 'balady' | 'civil_defense' | 'zatca' | 'qiwa_labor' | 'commerce' | 'sfda' | 'general';
  categoryLabelAr: string;
  severity: ViolationSeverity;
  standardFineMinSAR: number;
  standardFineMaxSAR: number;
  gracePeriodDays: number; // مهلة التصحيح
  objectionWindowDays: number; // مهلة الاعتراض النظامية
  statutoryArticleRef: string; // السند النظامي واللائحة
  officialManualUrl?: string;
  status: 'active' | 'draft' | 'archived';
  descriptionAr: string;
  impactSummaryAr: string;
  linkedSolutions: LinkedSolutionRecommendation[];
  diagnosticQuestions: DiagnosticQuestion[];
  keywords: string[];
  createdAt?: string;
  updatedAt?: string;
  updatedBy: string;
}

/**
 * قاعدة البيانات المرجعية لمصفوفة ربط المخالفات بالحلول والأسئلة التشخيصية
 */
export const INITIAL_VIOLATION_SOLUTIONS_MAPPINGS: ViolationSolutionMapping[] = [
  {
    id: 'map-vio-bal-101',
    violationCode: 'VIO-BAL-101',
    titleAr: 'مزاولة النشاط التجاري بدون ترخيص بلدي سارٍ أو منتهي الصلاحية',
    titleEn: 'Operating Commercial Activity with Expired or Unissued Municipal License',
    authority: 'وزارة البلديات والإسكان (بلدي)',
    authorityCategory: 'balady',
    categoryLabelAr: 'البلديات والتراخيص',
    severity: 'critical',
    standardFineMinSAR: 2000,
    standardFineMaxSAR: 10000,
    gracePeriodDays: 10,
    objectionWindowDays: 60,
    statutoryArticleRef: 'المادة (3) من لائحة الجزاءات والغرامات البلدية الصادرة بقرار مجلس الوزراء رقم (92)',
    officialManualUrl: 'https://balady.gov.sa/regulations/penalties',
    status: 'active',
    descriptionAr: 'رصد تشغيل المحل أو الفرع برخصة بلدية منتهية الصلاحية أو عدم استكمال إجراءات إصدار الترخيص الفوري أو الإنشائي قبل مباشرة النشاط.',
    impactSummaryAr: 'غرامة تصاعدية تبدأ من 2,000 ريال وتتضاعف عند التكرار، مع احتمالية إشعار بإغلاق المحل إدارياً وتجميد الخدمات البلدية المرتبطة بالسجل التجاري.',
    keywords: ['رخصة بلدية', 'بلدي', 'انتهاء ترخيص', 'مزاولة نشاط', 'إغلاق المحل'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-balady-02',
        solutionCode: 'SOL-BAL-02',
        solutionTitleAr: 'تصحيح اشتراطات واجهات المحلات واللوحات التجارية وإصدار رخصة بلدي الفورية',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 99,
        priorityRank: 1,
        customEstimatedPriceSAR: 2500,
        customEstimatedLeadDays: 2,
        adminNotesAr: 'يشمل تدقيق السجل التجاري وعقد الإيجار الإلكتروني والرفع المباشر عبر منصة بلدي.'
      },
      {
        solutionId: 'sol-legal-06',
        solutionCode: 'SOL-LEG-06',
        solutionTitleAr: 'إعداد مذكرات الاعتراض القانوني على المخالفات البلدية (حال وجود طلب تجديد مسبق قيد المعالجة)',
        recommendationLevel: 'alternative',
        recommendationLevelLabelAr: 'مسار اعتراضي بديل',
        effectivenessPercent: 85,
        priorityRank: 2,
        customEstimatedPriceSAR: 1500,
        customEstimatedLeadDays: 1,
        adminNotesAr: 'يستخدم في حال تم رصد المخالفة وكان طلب التجديد مرفوعاً في منصة بلدي قبل تاريخ الزيارة التفتيشية.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-bal-101-1',
        questionTextAr: 'هل تم تقديم طلب تجديد الرخصة عبر منصة بلدي قبل تاريخ تحرير المخالفة؟',
        descriptionAr: 'يفيد في إثبات حسن النية وبدء الإجراءات النظامية لتقديم اعتراض قانوني قوي.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 1,
        saudiLawArticleRef: 'المادة (12) من لائحة تنظيم التراخيص البلدية',
        evidenceTipAr: 'إرفاق لقطة شاشة لرقم الطلب وتاريخ التقديم في منصة بلدي',
        options: [
          {
            id: 'opt-bal-101-1a',
            labelAr: 'نعم، يوجد طلب مقدم ورقم معاملة سابقة',
            outcomePath: 'objection',
            pathLabelAr: 'ترشيح الاعتراض القانوني',
            guidanceAr: 'يمكنك الاعتراض لدى لجنة النظر في المخالفات البلدية بموجب رقم الطلب لإلغاء الغرامة.',
            objectionScoreImpact: 45,
            suggestedSolutionCodes: ['SOL-LEG-06']
          },
          {
            id: 'opt-bal-101-1b',
            labelAr: 'لا، لم يتم تقديم أي طلب تجديد مسبقاً',
            outcomePath: 'direct_solution',
            pathLabelAr: 'إصدار/تجديد فوري مباشر',
            guidanceAr: 'يتوجب التجديد الفوري خلال مهلة الـ 10 أيام لتفادي مضاعفة الغرامة وإغلاق المحل.',
            objectionScoreImpact: -25,
            suggestedSolutionCodes: ['SOL-BAL-02']
          }
        ]
      },
      {
        id: 'q-bal-101-2',
        questionTextAr: 'هل عقد الإيجار الإلكتروني للموقع موثق وساري المفعول في شبكة (إيجار)؟',
        descriptionAr: 'شرط إلزامي لقبول تجديد الرخصة الفورية عبر الربط التقني بين بلدي وإيجار.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 2,
        options: [
          {
            id: 'opt-bal-101-2a',
            labelAr: 'نعم، العقد موثق وسارٍ في منصة إيجار',
            outcomePath: 'direct_solution',
            pathLabelAr: 'جاهزية التجديد المباشر',
            guidanceAr: 'يمكن البدء الفوري بإصدار وتجديد الرخصة في أقل من 24 ساعة.',
            objectionScoreImpact: 10,
            suggestedSolutionCodes: ['SOL-BAL-02']
          },
          {
            id: 'opt-bal-101-2b',
            labelAr: 'لا، العقد منتهٍ أو ورقي غير مسجل في إيجار',
            outcomePath: 'supplier_request',
            pathLabelAr: 'توثيق العقد أولاً',
            guidanceAr: 'يلزم توثيق العقد في إيجار أولاً قبل محاولة تجديد الرخصة البلدية.',
            objectionScoreImpact: -15
          }
        ]
      },
      {
        id: 'q-bal-101-3',
        questionTextAr: 'هل تم إشعار المنشأة بإنذار رسمي مسبق قبل فرض الغرامة المالية؟',
        descriptionAr: 'تشترط لائحة الجزاءات البلدية توجيه إنذار أولي للمخالفات غير الجسيمة قبل إصدار الغرامة.',
        type: 'multiple_choice',
        isMandatory: false,
        orderIndex: 3,
        saudiLawArticleRef: 'المادة (5) فقرة ب من دليل التفتيش والرقابة البلدية الموحد',
        options: [
          {
            id: 'opt-bal-101-3a',
            labelAr: 'لم يتم توجيه أي إنذار وتم إصدار الغرامة مباشرة في الزيارة الأولى',
            outcomePath: 'objection',
            pathLabelAr: 'عيب إجرائي يدعم الاعتراض',
            guidanceAr: 'عدم توجيه إنذار مسبق يعد سبباً جوهرياً لقبول الاعتراض وإلغاء قرار المخالفة أو تخفيضه.',
            objectionScoreImpact: 35,
            suggestedSolutionCodes: ['SOL-LEG-06']
          },
          {
            id: 'opt-bal-101-3b',
            labelAr: 'تم استلام إنذار سابق وانقضت مهلة التصحيح الممنوحة',
            outcomePath: 'direct_solution',
            pathLabelAr: 'تسوية وتصحيح فوري',
            guidanceAr: 'الاعتراض ضعيف الجدوى؛ الأفضل السداد والتصحيح للاستفادة من خصم الـ 25% على السداد المبكر.',
            objectionScoreImpact: -30,
            suggestedSolutionCodes: ['SOL-BAL-02']
          }
        ]
      }
    ]
  },
  {
    id: 'map-vio-def-201',
    violationCode: 'VIO-DEF-201',
    titleAr: 'عدم وجود عقد صيانة دوري معتمد لأنظمة الإطفاء والإنذار (منصة سلامة)',
    titleEn: 'Absence of Certified Salama Fire Maintenance Contract',
    authority: 'المديرية العامة للدفاع المدني (سلامة)',
    authorityCategory: 'civil_defense',
    categoryLabelAr: 'السلامة والدفاع المدني',
    severity: 'critical',
    standardFineMinSAR: 3000,
    standardFineMaxSAR: 20000,
    gracePeriodDays: 7,
    objectionWindowDays: 30,
    statutoryArticleRef: 'المادة (14) من نظام الدفاع المدني ولائحة شروط السلامة والوقاية من الحريق',
    officialManualUrl: 'https://salamah.gov.sa/requirements',
    status: 'active',
    descriptionAr: 'عدم إبرام المنشأة لعقد صيانة سنوي مع شركة معتمدة ومسجلة في بوابة سلامة لصيانة كواشف الحريق وشبكات الرش والمضخات وطفايات الحريق.',
    impactSummaryAr: 'إيقاف ترخيص الدفاع المدني الفوري، حظر تجديد الرخصة البلدية آلياً، وغرامة تصل إلى 20,000 ريال مع إشعار بالإغلاق التحفظي حال وجود خطورة حالية.',
    keywords: ['دفاع مدني', 'سلامة', 'عقد صيانة', 'طفايات حريق', 'إنذار حريق', 'كواشف دخان'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-cd-01',
        solutionCode: 'SOL-DEF-01',
        solutionTitleAr: 'تأهيل وتوريد شبكات إنذار ومكافحة الحريق وعقد صيانة الدفاع المدني (سلامة)',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 99,
        priorityRank: 1,
        customEstimatedPriceSAR: 3500,
        customEstimatedLeadDays: 3,
        adminNotesAr: 'توثيق العقد مباشرة عبر بوابة سلامة وإصدار شهادة الفحص الفني المعتمدة.'
      },
      {
        solutionId: 'sol-legal-06',
        solutionCode: 'SOL-LEG-06',
        solutionTitleAr: 'إعداد طلب مهلة استثنائية أو اعتراض على تقدير حجم المنشأة',
        recommendationLevel: 'preventive',
        recommendationLevelLabelAr: 'حل وقائي مساند',
        effectivenessPercent: 75,
        priorityRank: 2,
        customEstimatedPriceSAR: 1200,
        customEstimatedLeadDays: 1,
        adminNotesAr: 'طلب تمديد مهلة التصحيح للأنشطة الكبيرة التي تتطلب أعمال تركيب إنشائية.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-def-201-1',
        questionTextAr: 'هل شبكة الإنذار وأجهزة الإطفاء موجودة وسليمة ولكن العقد منتهي فقط؟',
        descriptionAr: 'يحدد ما إذا كان المطلوب مجرد تجديد وثيقة أم أعمال توريد وتركيب ميدانية.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 1,
        options: [
          {
            id: 'opt-def-201-1a',
            labelAr: 'نعم، الأجهزة كاملة وسليمة وتتطلب توثيق العقد والفحص الدوري فقط',
            outcomePath: 'direct_solution',
            pathLabelAr: 'توثيق عقد فوري سريع (24-48 ساعة)',
            guidanceAr: 'يمكن لمزود الخدمة المعتمد معاينة الموقع وتوثيق العقد عبر بوابة سلامة خلال 48 ساعة.',
            objectionScoreImpact: 20,
            suggestedSolutionCodes: ['SOL-DEF-01']
          },
          {
            id: 'opt-def-201-1b',
            labelAr: 'لا، توجد نواقص في الطفايات أو تعطل في لوحة الإنذار والمضخات',
            outcomePath: 'supplier_request',
            pathLabelAr: 'استدراج عروض توريد وصيانة شاملة',
            guidanceAr: 'يتطلب الأمر طرح طلب توريد واستبدال الأجهزة التالفة قبل اعتماد عقد الصيانة.',
            objectionScoreImpact: -20,
            suggestedSolutionCodes: ['SOL-DEF-01']
          }
        ]
      },
      {
        id: 'q-def-201-2',
        questionTextAr: 'ما هي المساحة الإجمالية المقدرة للموقع بالمتر المربع؟',
        descriptionAr: 'لتحديد اشتراطات الدفاع المدني الخاصة بنظام الرش الآلي أو الاكتفاء بالطفايات والكواشف.',
        type: 'multiple_choice',
        isMandatory: true,
        orderIndex: 2,
        options: [
          {
            id: 'opt-def-201-2a',
            labelAr: 'أقل من 150 متر مربع (نشاط منخفض الخطورة)',
            outcomePath: 'direct_solution',
            pathLabelAr: 'إجراءات مبسطة وتكلفة منخفضة',
            guidanceAr: 'يكتفي بطفايات يدوية مطابقة وكواشف دخان مستقلة مع عقد صيانة مبسط.',
            objectionScoreImpact: 15,
            suggestedSolutionCodes: ['SOL-DEF-01']
          },
          {
            id: 'opt-def-201-2b',
            labelAr: 'بين 150 إلى 500 متر مربع',
            outcomePath: 'direct_solution',
            pathLabelAr: 'اشتراطات قياسية',
            guidanceAr: 'يتطلب لوحة تحكم رئيسية ومخارج طوارئ مضاءة مع شهادة فحص معتمدة.',
            objectionScoreImpact: 5,
            suggestedSolutionCodes: ['SOL-DEF-01']
          },
          {
            id: 'opt-def-201-2c',
            labelAr: 'أكثر من 500 متر مربع أو نشاط صناعي / مستودع',
            outcomePath: 'supplier_request',
            pathLabelAr: 'استدراج عروض مقاولي سلامة معتمدين',
            guidanceAr: 'يلزم مخطط سلامة هندسي معتمد وشبكة إطفاء متكاملة.',
            objectionScoreImpact: 0,
            suggestedSolutionCodes: ['SOL-DEF-01']
          }
        ]
      }
    ]
  },
  {
    id: 'map-vio-zat-301',
    violationCode: 'VIO-ZAT-301',
    titleAr: 'عدم الالتزام بمتطلبات الفوترة الإلكترونية (المرحلة الثانية - الربط والتكامل فاتورة)',
    titleEn: 'Non-Compliance with ZATCA Phase 2 E-Invoicing Integration Requirements',
    authority: 'هيئة الزكاة والضريبة والجمارك (زاتكا)',
    authorityCategory: 'zatca',
    categoryLabelAr: 'الزكاة والضريبة والجمارك',
    severity: 'critical',
    standardFineMinSAR: 5000,
    standardFineMaxSAR: 50000,
    gracePeriodDays: 14,
    objectionWindowDays: 30,
    statutoryArticleRef: 'المادة (53) من اللائحة التنفيذية لضريبة القيمة المضافة وضوابط الفوترة الإلكترونية',
    officialManualUrl: 'https://zatca.gov.sa/e-invoicing',
    status: 'active',
    descriptionAr: 'عدم ربط نظام المحاسبة ونقاط البيع الخاصة بالمنشأة مع منصة (فاتورة) التابعة للهيئة، أو إصدار فواتير دون الختم الرقمي المشفر (CSID) أو بدون رمز QR متوافق.',
    impactSummaryAr: 'غرامات مالية تبدأ من 5,000 ريال وتصل إلى 50,000 ريال، مع إمكانية تعليق الشهادة الضريبية وإيقاف الاستيراد والتعاملات الحكومية.',
    keywords: ['زاتكا', 'فاتورة', 'المرحلة الثانية', 'CSID', 'رمز الاستجابة', 'الربط والتكامل'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-zatca-03',
        solutionCode: 'SOL-ZAT-03',
        solutionTitleAr: 'تكامل الربط والفوترة الإلكترونية (المرحلة الثانية - الربط والتكامل فاتورة)',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 99,
        priorityRank: 1,
        customEstimatedPriceSAR: 2200,
        customEstimatedLeadDays: 2,
        adminNotesAr: 'ربط سحابي فوري مع توليد الشهادات المشفرة وتدريب المحاسبين.'
      },
      {
        solutionId: 'sol-legal-06',
        solutionCode: 'SOL-LEG-06',
        solutionTitleAr: 'إعداد اعتراض ضريبي مبني على عدم شمول المنشأة في المجموعة المحددة أو وجود عائق تقني معتمد',
        recommendationLevel: 'alternative',
        recommendationLevelLabelAr: 'اعتراض ضريبي بديل',
        effectivenessPercent: 80,
        priorityRank: 2,
        customEstimatedPriceSAR: 2000,
        customEstimatedLeadDays: 2,
        adminNotesAr: 'يستخدم إذا تم شمول المنشأة بالخطأ قبل بلوغ حد الإيراد السنوي الملزم للمجموعة المعلنة.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-zat-301-1',
        questionTextAr: 'هل إيرادات المنشأة السنوية الخاضعة للضريبة تتجاوز الحد الأدنى المعلن للمجموعة التي تم إشعاركم بها؟',
        descriptionAr: 'تحدد زاتكا مجموعات الربط بناءً على حجم الإيرادات السنوية في الإقرارات السابقة.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 1,
        saudiLawArticleRef: 'قرارات الهيئة بشأن تحديد الفئات المستهدفة بالمرحلة الثانية',
        options: [
          {
            id: 'opt-zat-301-1a',
            labelAr: 'لا، الإيرادات أقل من الحد الإلزامي للمجموعة المحددة في الإشعار',
            outcomePath: 'objection',
            pathLabelAr: 'اعتراض قانوني قوي لعدم سريان الإلزام',
            guidanceAr: 'يمكن تقديم اعتراض وإرفاق الإقرارات الضريبية السابقة لإلغاء المخالفة ومنح استثناء حتى حلول موعد المجموعة الفعلية.',
            objectionScoreImpact: 50,
            suggestedSolutionCodes: ['SOL-LEG-06']
          },
          {
            id: 'opt-zat-301-1b',
            labelAr: 'نعم، المنشأة تقع ضمن الفئة الملزمة المعلنة',
            outcomePath: 'direct_solution',
            pathLabelAr: 'تنفيذ الربط والتكامل فوراً',
            guidanceAr: 'يجب ربط برنامج الكاشير والمحاسبة فوراً مع فاتورة لتجنب تراكم الغرامات اليومية.',
            objectionScoreImpact: -35,
            suggestedSolutionCodes: ['SOL-ZAT-03']
          }
        ]
      },
      {
        id: 'q-zat-301-2',
        questionTextAr: 'ما هو النظام المحاسبي أو برنامج نقاط البيع (POS) المستخدم في المنشأة حالياً؟',
        descriptionAr: 'يحدد سهولة التكامل أو الحاجة لترقية النظام.',
        type: 'multiple_choice',
        isMandatory: true,
        orderIndex: 2,
        options: [
          {
            id: 'opt-zat-301-2a',
            labelAr: 'نظام سحابي حديث متوافق ويدعم واجهة API زاتكا',
            outcomePath: 'direct_solution',
            pathLabelAr: 'تفعيل الربط في دقائق',
            guidanceAr: 'يتطلب استخراج رمز OTP من بوابة فاتورة وتوليد شهادة CSID.',
            objectionScoreImpact: 10,
            suggestedSolutionCodes: ['SOL-ZAT-03']
          },
          {
            id: 'opt-zat-301-2b',
            labelAr: 'برنامج قديم أو جهاز كاشير تقليدي غير مربوط بالإنترنت',
            outcomePath: 'supplier_request',
            pathLabelAr: 'ترقية نظام وتوريد كاشير متوافق',
            guidanceAr: 'يتطلب تزويد المنشأة بحزمة كاشير سحابية متوافقة بالكامل مع زاتكا.',
            objectionScoreImpact: -15,
            suggestedSolutionCodes: ['SOL-ZAT-03']
          }
        ]
      }
    ]
  },
  {
    id: 'map-vio-qiw-401',
    violationCode: 'VIO-QIW-401',
    titleAr: 'انخفاض نسبة الالتزام ببرنامج حماية الأجور (WPS) عبر منصة مدد عن 90%',
    titleEn: 'Wage Protection System Compliance Below 90% via Mudad Platform',
    authority: 'وزارة الموارد البشرية والتنمية الاجتماعية (قوى)',
    authorityCategory: 'qiwa_labor',
    categoryLabelAr: 'العمل والتشغيل (قوى ومقيم)',
    severity: 'high',
    standardFineMinSAR: 1000,
    standardFineMaxSAR: 15000,
    gracePeriodDays: 30,
    objectionWindowDays: 30,
    statutoryArticleRef: 'القرار الوزاري رقم (1321) بشأن برنامج حماية الأجور وقواعد التفتيش',
    officialManualUrl: 'https://qiwa.sa/wage-protection',
    status: 'active',
    descriptionAr: 'عدم رفع ملف مسيرات الرواتب الشهرية المعتمد عبر منصة مدد، أو تدني نسبة الرواتب المصروفة عبر القنوات البنكية عن نسبة الـ 90% المقررة نظامياً.',
    impactSummaryAr: 'إيقاف خدمات الاستقدام ونقل الخدمات وتجديد رخص العمل تدريجياً، مع غرامة قدرها 1,000 ريال عن كل عامل لم يستلم أجره عبر النظام.',
    keywords: ['حماية الأجور', 'مدد', 'قوى', 'مسيرات رواتب', 'توطين', 'نطاقات'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-qiwa-04',
        solutionCode: 'SOL-QIW-04',
        solutionTitleAr: 'حزمة لوائح تنظيم العمل وتوثيق العقود واشتراطات نطاقات وقوى',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 98,
        priorityRank: 1,
        customEstimatedPriceSAR: 1500,
        customEstimatedLeadDays: 2,
        adminNotesAr: 'رفع مسيرات الرواتب عبر منصة مدد ومعالجة التبريرات النظامية للموظفين المجازين.'
      },
      {
        solutionId: 'sol-legal-06',
        solutionCode: 'SOL-LEG-06',
        solutionTitleAr: 'توثيق التبريرات النظامية للاستقطاعات والغياب ورفع اعتراض لوزارة الموارد البشرية',
        recommendationLevel: 'preventive',
        recommendationLevelLabelAr: 'حل وقائي مساند',
        effectivenessPercent: 88,
        priorityRank: 2,
        customEstimatedPriceSAR: 1000,
        customEstimatedLeadDays: 1,
        adminNotesAr: 'رفع مبررات الإجازات غير مدفوعة الأجر أو الخروج النهائي لتصحيح النسبة المئوية آلياً.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-qiw-401-1',
        questionTextAr: 'هل سبب انخفاض النسبة ناتج عن عمالة في إجازة، خروج نهائي، أو هروب؟',
        descriptionAr: 'تتيح منصة مدد رفع مبررات نظامية رسمية تستثني العامل من النسبة المحسوبة.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 1,
        options: [
          {
            id: 'opt-qiw-401-1a',
            labelAr: 'نعم، توجد مبررات رسمية وإشعارات خروج أو إجازات موثقة',
            outcomePath: 'objection',
            pathLabelAr: 'رفع المبررات وإلغاء المخالفة فوراً',
            guidanceAr: 'يمكن رفع التبريرات عبر منصة مدد وإعادة تقييم نسبة الالتزام لتصبح 100% وإسقاط المخالفة.',
            objectionScoreImpact: 40,
            suggestedSolutionCodes: ['SOL-QIW-04', 'SOL-LEG-06']
          },
          {
            id: 'opt-qiw-401-1b',
            labelAr: 'لا، الرواتب لم تصرف في موعدها عبر البنك أو تم صرفها نقداً',
            outcomePath: 'direct_solution',
            pathLabelAr: 'صرف الرواتب عبر النظام البنكي فوراً',
            guidanceAr: 'يتوجب تحويل الرواتب فوراً عبر حساب الرواتب المعتمد ورفع الملف للشهر الحالي.',
            objectionScoreImpact: -30,
            suggestedSolutionCodes: ['SOL-QIW-04']
          }
        ]
      },
      {
        id: 'q-qiw-401-2',
        questionTextAr: 'هل عقود جميع الموظفين موثقة إلكترونياً بنسبة 100% في منصة قوى؟',
        descriptionAr: 'توثيق العقود يمنع الخلافات العمالية ويضمن صحة حساب الرواتب في مدد.',
        type: 'yes_no',
        isMandatory: false,
        orderIndex: 2,
        options: [
          {
            id: 'opt-qiw-401-2a',
            labelAr: 'نعم، كافة العقود موثقة ومطابقة للأجور الفعلية',
            outcomePath: 'direct_solution',
            pathLabelAr: 'بيانات سليمة ومكتملة',
            guidanceAr: 'لا توجد ثغرات تعاقدية؛ التركيز على انتظام التحويل البنكي الشهري.',
            objectionScoreImpact: 10
          },
          {
            id: 'opt-qiw-401-2b',
            labelAr: 'لا، توجد عقود معلقة أو غير موثقة بعد',
            outcomePath: 'supplier_request',
            pathLabelAr: 'استكمال توثيق العقود في قوى',
            guidanceAr: 'يلزم توثيق العقود في قوى لتفادي مخالفات إضافية وتيسير رفع ملفات الأجور.',
            objectionScoreImpact: -15,
            suggestedSolutionCodes: ['SOL-QIW-04']
          }
        ]
      }
    ]
  },
  {
    id: 'map-vio-sec-501',
    violationCode: 'VIO-SEC-501',
    titleAr: 'عدم تركيب كاميرات مراقبة أمنية أو عدم كفاية مدة حفظ التسجيلات عن 30 يوماً',
    titleEn: 'Failure to Install MOI Compliant Security CCTV or Inadequate 30-Day Storage',
    authority: 'وزارة البلديات والإسكان / الأمن العام',
    authorityCategory: 'commerce',
    categoryLabelAr: 'الأمن والسلامة التقنية',
    severity: 'medium',
    standardFineMinSAR: 2000,
    standardFineMaxSAR: 8000,
    gracePeriodDays: 14,
    objectionWindowDays: 60,
    statutoryArticleRef: 'نظام استخدام كاميرات المراقبة الأمنية الصادر بالمرسوم الملكي رقم (م/35)',
    officialManualUrl: 'https://balady.gov.sa/cctv-specifications',
    status: 'active',
    descriptionAr: 'عدم تغطية مداخل ومخارج المنشأة والممرات العامة بكاميرات مراقبة عالية الدقة IP، أو استخدام وحدات تخزين لا تكفي لحفظ التسجيلات لمدة لا تقل عن 31 يوماً وفق متطلبات الرقابة.',
    impactSummaryAr: 'غرامة بلدية وأمنية تتراوح بين 2,000 و 8,000 ريال، وعدم الموافقة على تجديد الترخيص البلدي أو إصدار شهادة إتمام المنشأة.',
    keywords: ['كاميرات مراقبة', 'CCTV', 'الأمن العام', 'التسجيلات 30 يوم', 'بلدي'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-cctv-05',
        solutionCode: 'SOL-SEC-05',
        solutionTitleAr: 'توريد وتركيب كاميرات المراقبة الأمنية والربط مع المنصة المركزية (عين)',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 99,
        priorityRank: 1,
        customEstimatedPriceSAR: 3200,
        customEstimatedLeadDays: 2,
        adminNotesAr: 'تركيب نظام كامل مع هاردسك تخزين لا يقل عن 2 تيرابايت وشهادة تركيب معتمدة للبلدية.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-sec-501-1',
        questionTextAr: 'هل توجد كاميرات مراقبة بالموقع ولكنها معطلة أو سعة التخزين منخفضة؟',
        descriptionAr: 'لتحديد ما إذا كان الحل يتطلب تركيب نظام جديد كلياً أم مجرد استبدال وحدة التخزين وصيانة التوصيلات.',
        type: 'multiple_choice',
        isMandatory: true,
        orderIndex: 1,
        options: [
          {
            id: 'opt-sec-501-1a',
            labelAr: 'الكاميرات موجودة وتعمل، والملاحظة فقط على مدة التخزين أو وضوح الرؤية',
            outcomePath: 'direct_solution',
            pathLabelAr: 'ترقية وحدة التخزين والصيانة الفورية',
            guidanceAr: 'يمكن ترقية القرص الصلب NVR وتحديث زوايا الرؤية وإصدار شهادة المطابقة خلال 24 ساعة.',
            objectionScoreImpact: 15,
            suggestedSolutionCodes: ['SOL-SEC-05']
          },
          {
            id: 'opt-sec-501-1b',
            labelAr: 'لا توجد أي كاميرات مراقبة مركبة في المنشأة إطلاقاً',
            outcomePath: 'supplier_request',
            pathLabelAr: 'توريد وتركيب نظام كامل متوافق',
            guidanceAr: 'يتوجب التعاقد مع مورد معتمد لتوريد وتركيب النظام وإصدار شهادة الامتثال لرفعها للبلدية.',
            objectionScoreImpact: -30,
            suggestedSolutionCodes: ['SOL-SEC-05']
          }
        ]
      }
    ]
  },
  {
    id: 'map-vio-bal-102',
    violationCode: 'VIO-BAL-102',
    titleAr: 'مخالفة مواصفات ومقاسات اللوحة التجارية واشتراطات التشوه البصري للواجهة',
    titleEn: 'Commercial Signage & Storefront Visual Distortion Non-Compliance',
    authority: 'وزارة البلديات والإسكان (بلدي)',
    authorityCategory: 'balady',
    categoryLabelAr: 'البلديات والتراخيص',
    severity: 'medium',
    standardFineMinSAR: 1000,
    standardFineMaxSAR: 5000,
    gracePeriodDays: 14,
    objectionWindowDays: 60,
    statutoryArticleRef: 'الدليل التنظيمي للوحات التجارية ومعالجة التشوه البصري (كود البناء السعودي)',
    officialManualUrl: 'https://balady.gov.sa/signage-guidelines',
    status: 'active',
    descriptionAr: 'عدم تطابق أبعاد اللوحة التجارية مع ترخيص البلدية، أو وجود بروز غير نظامي، أو تلف في الإضاءة والواجهة بما يشكل تشوهاً بصرياً.',
    impactSummaryAr: 'غرامة بلدية فورية تبدأ من 1,000 ريال، مع إلزام المنشأة بإزالة اللوحة المخالفة أو تعديلها خلال مهلة محددة.',
    keywords: ['لوحة تجارية', 'واجهة المحل', 'تشوه بصري', 'بلدي', 'مقاسات اللوحة'],
    updatedAt: '2026-08-16T12:00:00Z',
    updatedBy: 'فريق الحوكمة والتشريعات - إدارة سبّاق',
    linkedSolutions: [
      {
        solutionId: 'sol-balady-02',
        solutionCode: 'SOL-BAL-02',
        solutionTitleAr: 'تصحيح اشتراطات واجهات المحلات واللوحات التجارية والكاميرات (امتثال بلدي)',
        recommendationLevel: 'primary',
        recommendationLevelLabelAr: 'حل أساسي إلزامي',
        effectivenessPercent: 97,
        priorityRank: 1,
        customEstimatedPriceSAR: 2200,
        customEstimatedLeadDays: 3,
        adminNotesAr: 'تعديل مقاسات اللوحة والرفع الهندسي على منصة بلدي قبل انتهاء مهلة التصحيح.'
      },
      {
        solutionId: 'sol-legal-06',
        solutionCode: 'SOL-LEG-06',
        solutionTitleAr: 'إعداد اعتراض فني مصور يثبت مطابقة اللوحة للترخيص الصادر',
        recommendationLevel: 'alternative',
        recommendationLevelLabelAr: 'اعتراض مدعم بالصور والمخططات',
        effectivenessPercent: 82,
        priorityRank: 2,
        customEstimatedPriceSAR: 1200,
        customEstimatedLeadDays: 1,
        adminNotesAr: 'إذا كانت اللوحة مطابقة للترخيص الصادر مسبقاً وتم رصد المخالفة نتيجة تقدير تفتيشي غير دقيق.'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'q-bal-102-1',
        questionTextAr: 'هل اللوحة الحالية مطابقة للترخيص الصادر مسبقاً من البلدية دون أي تعديل؟',
        descriptionAr: 'يفيد في إثبات أن المنشأة ملتزمة بالترخيص الممنوح وأن الرصد التفتيشي قد يكون وقع في خطأ بالقياس.',
        type: 'yes_no',
        isMandatory: true,
        orderIndex: 1,
        options: [
          {
            id: 'opt-bal-102-1a',
            labelAr: 'نعم، اللوحة مطابقة تماماً للمقاسات المذكورة في رخصة البلدية السارية',
            outcomePath: 'objection',
            pathLabelAr: 'اعتراض قانوني مع إرفاق صورة الرخصة',
            guidanceAr: 'يمكن تقديم اعتراض وإرفاق رخصة البلدية وصور اللوحة مع مسطرة القياس لإلغاء المخالفة.',
            objectionScoreImpact: 45,
            suggestedSolutionCodes: ['SOL-LEG-06']
          },
          {
            id: 'opt-bal-102-1b',
            labelAr: 'لا، تم تغيير اللوحة أو إضافة بروز دون تعديل الرخصة',
            outcomePath: 'direct_solution',
            pathLabelAr: 'تعديل اللوحة أو تعديل الترخيص',
            guidanceAr: 'يجب تعديل اللوحة لتطابق الاشتراطات أو رفع طلب تعديل بيانات اللوحة في منصة بلدي.',
            objectionScoreImpact: -25,
            suggestedSolutionCodes: ['SOL-BAL-02']
          }
        ]
      }
    ]
  }
];
