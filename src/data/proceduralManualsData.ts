import { 
  ProceduralManualReference, 
  ViolationProceduralAnalysis 
} from '../types';

export const SAUDI_PROCEDURAL_MANUALS: ProceduralManualReference[] = [
  {
    id: 'man-balady-fines',
    authority: 'وزارة البلديات والإسكان (أمانة الرياض / كافة الأمانات)',
    authorityKey: 'balady',
    manualName: 'الدليل الإجرائي للائحة الجزاءات عن المخالفات البلدية المحدثة',
    versionOrYear: 'الإصدار المحدث 1445هـ / 2024م',
    statutoryBasis: 'قرار مجلس الوزراء رقم (92) واللائحة التنفيذية لرقابة الأنشطة التجارية والمهنية',
    officialPortal: 'منصة بلدي الموحدة - balady.gov.sa',
    gracePeriodGuidelines: 'تمنح المنشأة مهلة تصحيحية لا تقل عن 14 يوماً لمعالجة الملاحظات غير الحرجة دون تطبيق الغرامة للمرة الأولى، مع إمكانية تمديد المهلة عبر منصة بلدي.',
    objectionWindowDays: 60,
    objectionChannel: 'بوابة الاعتراضات على المخالفات البلدية بمنصة بلدي ومنصة إيفاء الوطنية',
    reductionInitiatives: 'تخفيض 25% من قيمة الغرامة عند السداد خلال 45 يوماً من تاريخ الإشعار.',
    description: 'الدليل المعتمد لضبط وتصنيف المخالفات البلدية، اشتراطات واجهات المحلات، عقود النظافة وإدارة النفايات، الشهادات الصحية للعاملين، ومطابقة الرخص التجارية.'
  },
  {
    id: 'man-civil-defense-safety',
    authority: 'المديرية العامة للدفاع المدني',
    authorityKey: 'civil_defense',
    manualName: 'الدليل الإجرائي للتفتيش الوقائي وضبط مخالفات لوائح السلامة',
    versionOrYear: 'تحديث كود البناء السعودي 2024م (SBC 801)',
    statutoryBasis: 'نظام الدفاع المدني ولائحة شروط السلامة وسبل الحماية للمنشآت والمحلات',
    officialPortal: 'بوابة سلامة الإلكترونية - salamah.gov.sa',
    gracePeriodGuidelines: 'مهلة تصحيح من 7 إلى 15 يوماً لإجراء الصيانة التعاقدية ورفع تقرير السلامة الفني المعتمد للمخالفات الإنشائية والتشغيلية المتوسطة.',
    objectionWindowDays: 30,
    objectionChannel: 'إدارة السلامة الميدانية بالدفاع المدني ولجنة النظر في مخالفات السلامة',
    reductionInitiatives: 'إلغاء الغرامة أو إيقاف إجراءات الإغلاق في حال تقديم عقد صيانة معتمد وتقرير فني يثبت سلامة المنظومة قبل انقضاء المهلة.',
    description: 'الدليل الملزم لكواشف الدخان، شبكات الرش الآلي، مخارج الطوارئ، فحص مضخات الحريق، وعقود الصيانة الدورية الإلزامية مع الشركات المرخصة.'
  },
  {
    id: 'man-qiwa-labor',
    authority: 'وزارة الموارد البشرية والتنمية الاجتماعية',
    authorityKey: 'labor_qiwa',
    manualName: 'الدليل الإجرائي للرقابة والتفتيش على منشآت القطاع الخاص وجدول المخالفات',
    versionOrYear: 'تحديث القرار الوزاري رقم (1446-2024)',
    statutoryBasis: 'نظام العمل ولائحته التنفيذية وقرارات التوطين والاشتراطات المهنية',
    officialPortal: 'منصة قوى للأعمال - qiwa.sa',
    gracePeriodGuidelines: 'مهلة 30 يوماً لتصحيح أوضاع التوطين وتوثيق العقود الإلكترونية ولوائح تنظيم العمل قبل تثبيت الغرامة القطعية.',
    objectionWindowDays: 60,
    objectionChannel: 'خدمة الاعتراض على مخالفات العمل عبر منصة قوى الموحدة',
    reductionInitiatives: 'مبادرة تسوية المخالفات وتخفيضها بنسبة تصل إلى 80% عند توظيف سعودي وتصحيح المخالفة خلال المهلة.',
    description: 'الدليل الإجرائي للتحقق من نسب التوطين بنطاقات، توثيق 100% من عقود الموظفين، اشتراطات بيئة العمل، لائحة تنظيم العمل الداخلية، وحماية الأجور WPS.'
  },
  {
    id: 'man-zatca-tax',
    authority: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
    authorityKey: 'zatca',
    manualName: 'الدليل الإجرائي للامتثال الميداني وضوابط الفوترة الإلكترونية وضريبة القيمة المضافة',
    versionOrYear: 'المرحلة الثانية (الربط والتكامل) 2024-2026م',
    statutoryBasis: 'نظام ضريبة القيمة المضافة ونظام الفوترة الإلكترونية (فاتورة)',
    officialPortal: 'منصة زاتكا الإلكترونية - zatca.gov.sa',
    gracePeriodGuidelines: 'إشعار بالإنذار مع مهلة تصحيح 7 أيام للمرة الأولى في مخالفات عرض رمز QR وإصدار الفواتير الضريبية المبسطة.',
    objectionWindowDays: 30,
    objectionChannel: 'بوابة الاعتراضات الزكوية والضريبية بالهيئة ثم الأمانة العامة للجان الضريبية (GSTC)',
    reductionInitiatives: 'مبادرة الإعفاء من الغرامات والتنازل عن الجزاءات المالية في حال الإفصاح الطوعي والتسجيل الفوري.',
    description: 'الدليل الإجرائي لضوابط الفوترة الإلكترونية، إصدار فواتير تتضمن رمز الاستجابة السريعة QR، تسجيل ضريبة القيمة المضافة، والاحتفاظ بالسجلات المحاسبية.'
  },
  {
    id: 'man-commerce-inspection',
    authority: 'وزارة التجارة',
    authorityKey: 'commerce',
    manualName: 'الدليل الإجرائي لرقابة المنشآت والامتثال التجاري ومكافحة التستر',
    versionOrYear: 'تحديث نظام الشركات الجديد 1445هـ / 2024م',
    statutoryBasis: 'نظام مكافحة التستر التجاري ونظام الأسماء التجارية ونظام السجل التجاري',
    officialPortal: 'المركز السعودي للأعمال ومنصة وزارة التجارة - mc.gov.sa',
    gracePeriodGuidelines: 'مهلة 15 يوماً لتحديث وتعديل بيانات السجل وتطابق الاسم التجاري واللوحة وفتح الحساب البنكي التجاري.',
    objectionWindowDays: 60,
    objectionChannel: 'منصة الاعتراضات بوزارة التجارة أو لجان الفصل في المنازعات والمخالفات التجارية',
    reductionInitiatives: 'الإعفاء من عقوبات التستر والرسوم لمن يبادر بطلب التصحيح وفق البرنامج الوطني لمكافحة التستر التجاري.',
    description: 'التحقق من الدفع الإلكتروني المكتمل، وجود رقم السجل التجاري على المطبوعات واللوحات، عدم وجود شبهات تستر تجاري، وتحديث بيانات السجلات الفرعية.'
  },
  {
    id: 'man-sfda-food',
    authority: 'الهيئة العامة للغذاء والدواء (SFDA)',
    authorityKey: 'sfda',
    manualName: 'الدليل الإجرائي للرقابة والتفتيش على المنشآت الغذائية ومستودعات التخزين',
    versionOrYear: 'تحديث لائحة سلامة الغذاء 2024م',
    statutoryBasis: 'نظام الغذاء ولائحته التنفيذية واشتراطات الهيئة العامة للغذاء والدواء',
    officialPortal: 'بوابة الهيئة العامة للغذاء والدواء - sfda.gov.sa',
    gracePeriodGuidelines: 'مهلة تصحيح من 3 إلى 10 أيام للمخالفات الفنية غير المهددة للصحة العامة، مع إعادة التفتيش والتحقق.',
    objectionWindowDays: 30,
    objectionChannel: 'بوابة التظلمات والاعتراضات الإلكترونية بالهيئة',
    reductionInitiatives: 'تخفيض الغرامة بنسبة 50% عند الاستجابة الفورية وتصحيح ظروف التخزين المعتمدة.',
    description: 'الدليل الإجرائي لمطابقة درجات حرارة التخزين، بطاقات البيانات الغذائية، منع الملوثات المتبادلة، واشتراطات النقل المبرد والجاف.'
  },
  {
    id: 'man-ejar-contracts',
    authority: 'الهيئة العامة للعقار (شبكة إيجار)',
    authorityKey: 'ejar',
    manualName: 'الدليل الإجرائي لتوثيق العقود الإيجارية التجارية وإلزامية الربط بالرخص البلدية',
    versionOrYear: 'تحديث اللائحة التنفيذية لشبكة إيجار 2024م',
    statutoryBasis: 'قرار مجلس الوزراء رقم (292) بإلزامية تسجيل وتوثيق عقود الإيجار التجارية في شبكة إيجار',
    officialPortal: 'منصة إيجار - ejar.sa',
    gracePeriodGuidelines: 'مهلة 15 يوماً لتسجيل العقد وتوثيقه إلكترونياً من قبل المؤجر والمستأجر قبل إيقاف تحديث الرخصة البلدية.',
    objectionWindowDays: 30,
    objectionChannel: 'مركز خدمة المستفيدين بالهيئة العامة للعقار ومنصة إيجار',
    description: 'ضوابط توثيق عقود الإيجار الموحدة للمقرات والمحلات والمستودعات كشرط إلزامي لسريان الرخص البلدية وفتح السجلات الفرعية.'
  },
  {
    id: 'man-gosi-safety',
    authority: 'المؤسسة العامة للتأمينات الاجتماعية (GOSI)',
    authorityKey: 'gosi',
    manualName: 'الدليل الإجرائي للامتثال التأميني والسلامة والصحة المهنية',
    versionOrYear: 'إصدار 2024م',
    statutoryBasis: 'نظام التأمينات الاجتماعية وفرع الأخطار المهنية',
    officialPortal: 'بوابة التأمينات أونلاين - gosi.gov.sa',
    gracePeriodGuidelines: 'مهلة 15 يوماً لتسجيل المشتركين بدوام كامل وتحديث الأجور الحقيقية وتوفير معدات الحماية المهنية.',
    objectionWindowDays: 30,
    objectionChannel: 'بوابة اللجان الابتدائية والاستئنافية بالتأمينات الاجتماعية',
    description: 'الدليل الإجرائي للتحقق من تسجيل كافة العاملين فور التحاقهم بالعمل، التبليغ عن إصابات العمل، وتوفير متطلبات السلامة المهنية.'
  }
];

// Pre-packaged Seed Analysis for Initial Violations
export const INITIAL_VIOLATIONS_ANALYSIS: Record<string, ViolationProceduralAnalysis> = {
  'viol-1': {
    violationId: 'viol-1',
    violationNumber: 'VIO-BLD-2026-44019',
    authority: 'أمانة منطقة الرياض (بلدي)',
    detectedDate: '2026-08-10',
    manual: {
      name: 'الدليل الإجرائي للائحة الجزاءات عن المخالفات البلدية المحدثة (1445هـ)',
      articleNumber: 'البند 4 / المادة 12 (مخالفات الواجهات وعقود النظافة التجارية والشهادات الصحية)',
      clauseText: 'يُلزم صاحب المنشأة بإبراز ملصق التفتيش الصحي المعتمد في واجهة المحل، وإبرام عقد نظافة تجاري ساري المفعول مع إحدى الشركات المؤهلة وربطه إلكترونياً بمنصة بلدي.',
      officialPortal: 'منصة بلدي الموحدة (balady.gov.sa) - خدمة الاعتراض وإدارة الرخص',
      gracePeriodDays: 14,
      objectionWindowDays: 60,
      penaltyMultiplierRisk: 'في حال انقضاء مهلة الـ 14 يوماً دون تصحيح أو اعتراض، تتضاعف الغرامة إلى 6,000 ر.س ويتم إيقاف خدمة تجديد الرخص في بلدي تلقائياً.'
    },
    rootCauseDiagnosis: {
      primaryCause: 'انتهاء عقد النظافة التجاري وعدم تثبيت رمز QR وملصق الشهادات الصحية المحدث في الواجهة الزجاجية للفرع الرئيسي.',
      operationalGap: 'غياب التنبيه التلقائي المبكر قبل 30 يوماً من انتهاء عقد النظافة، وتأخر طباعة وتثبيت ملصقات الامتثال المعتمدة بعد آخر زيارة تفتيش.',
      riskLevel: 'high',
      severityScore: 78
    },
    correctiveActionPlan: [
      {
        id: 'step-1',
        stepNumber: 1,
        phase: 'immediate_containment',
        phaseLabel: 'الإيقاف الفوري واحتواء المخالفة',
        actionTitle: 'إصدار مسودة عقد نظافة تجاري موحد وربطه ببلدي',
        detailedProcedure: 'التعاقد الفوري مع إحدى شركات النظافة المعتمدة من أمانة الرياض (أو تفعيل مسودة التجديد الجاهزة في سبّاق) لرفع العقد إلكترونياً إلى نظام بلدي لإثبات السريان.',
        requiredRole: 'مسؤول الامتثال / مدير الفرع',
        proceduralManualArticleRef: 'المادة 12/2 من الدليل الإجرائي لرقابة النظافة التجارية',
        estimatedDurationHours: 4,
        estimatedCostSAR: 1800,
        isCompleted: false,
        evidenceRequired: 'عقد النظافة المعتمد والموثق إلكترونياً برقم ترخيص ساري',
        quickActionType: 'order_service',
        quickActionTarget: 'srv-clean'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        phase: 'field_rectification',
        phaseLabel: 'التصحيح الميداني في المنشأة',
        actionTitle: 'طباعة وتثبيت ملصق التفتيش الصحي ورمز QR في واجهة المحل',
        detailedProcedure: 'طباعة ملصق الامتثال الصحي المعتمد المتضمن قائمة العمالة الحاملة للشهادات الصحية سارية المفعول، وتثبيته في مكان بارز على واجهة المحل الزجاجية بارتفاع 1.5 متر وفق مواصفات الدليل البلدي.',
        requiredRole: 'مدير فرع العليا',
        proceduralManualArticleRef: 'المادة 4/1 من الدليل الإجرائي لواجهات المحلات والملصقات',
        estimatedDurationHours: 2,
        estimatedCostSAR: 50,
        isCompleted: false,
        evidenceRequired: 'صورتان فوتوغرافيتان واضحتان للواجهة الأمامية توضحان تثبيت الملصق ورمز QR',
        quickActionType: 'upload_doc',
        quickActionTarget: 'doc-balady-photo'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        phase: 'evidence_upload',
        phaseLabel: 'رفع إثباتات المعالجة عبر منصة بلدي',
        actionTitle: 'تقديم طلب إثبات التصحيح عبر خدمة تصحيح الملاحظات ببلدي',
        detailedProcedure: 'الدخول إلى بوابة بلدي، واختيار طلب معالجة المخالفة رقم (VIO-BLD-2026-44019)، وإرفاق العقد الموثق وصور الواجهة لطلب الزيارة التحققية أو الإغلاق الآلي.',
        requiredRole: 'مسؤول الامتثال لمنصة سبّاق',
        proceduralManualArticleRef: 'المادة 19 من اللائحة التنفيذية لإنهاء المخالفات البلدية',
        estimatedDurationHours: 1,
        estimatedCostSAR: 0,
        isCompleted: false,
        evidenceRequired: 'رقم طلب تصحيح المخالفة الصادر من منصة بلدي',
        quickActionType: 'gov_portal_link',
        quickActionTarget: 'https://balady.gov.sa'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        phase: 'closure_verification',
        phaseLabel: 'طلب إلغاء أو تخفيض الغرامة بنسبة 25%',
        actionTitle: 'الاستفادة من مبادرة السداد المخفض أو التقدم بلائحة اعتراض',
        detailedProcedure: 'في حال ثبوت تقديم طلب التجديد المسبق، يتم رفع لائحة الاعتراض الذكية المصاغة في سبّاق عبر منصة بلدي لإلغاء الغرامة، أو السداد الفوري خلال 45 يوماً بخصم 25% (2,250 ر.س بدلاً من 3,000 ر.س).',
        requiredRole: 'المستشار القانوني / المحاسب',
        proceduralManualArticleRef: 'المادة 23 من لائحة الجزاءات البلدية ومبادرة التخفيض الوطني',
        estimatedDurationHours: 1,
        estimatedCostSAR: 0,
        isCompleted: false,
        evidenceRequired: 'إشعار قبول الاعتراض أو إيصال سداد الفاتورة المخفضة',
        quickActionType: 'generate_objection',
        quickActionTarget: 'viol-1'
      }
    ],
    requiredEvidenceList: [
      {
        id: 'ev-1',
        title: 'عقد نظافة تجاري ساري المفعول مع شركة معتمدة',
        description: 'وثيقة العقد المبرم ومطابقة رقم الترخيص البلدي للمنشأة',
        isAvailableInVault: true,
        vaultDocId: 'doc-9',
        sampleFormat: 'ملف PDF إلكتروني معتمد'
      },
      {
        id: 'ev-2',
        title: 'صور ميدانية لواجهة الفرع تثبت تثبيت الملصق ورمز QR',
        description: 'صورة نهارية واضحة تظهر واجهة المحل كاملة مع الملصق المعتمد',
        isAvailableInVault: false,
        sampleFormat: 'صورة عالية الدقة JPG/PNG'
      },
      {
        id: 'ev-3',
        title: 'كشف سريان الشهادات الصحية للعمالة في الفرع',
        description: 'شهادات صحية سارية صادرة من منصة بلدي لكافة معدي الأطعمة (8 عمال)',
        isAvailableInVault: true,
        vaultDocId: 'lic-6',
        sampleFormat: 'شهادات رسمية منصة بلدي'
      }
    ],
    financialImpact: {
      originalFineSAR: 3000,
      escalatedFineIfIgnoredSAR: 6000,
      correctionEstimatedCostSAR: 1850,
      netSavedSAR: 4150,
      potentialDiscountRate: 25,
      discountedFineSAR: 2250
    },
    objectionFeasibility: {
      score: 75,
      verdict: 'recommended',
      legalGrounds: [
        'وجود طلب تجديد مسبق لعقد النظافة قيد المعالجة قبل تاريخ التفتيش الميداني.',
        'استيفاء كافة العمالة للشهادات الصحية سارية المفعول دون أي مخالفات بيولوجية.',
        'حق المنشأة النظامي في الاستفادة من مهلة الـ 14 يوماً التصحيحية للمرة الأولى بموجب المادة 4 من اللائحة المحدثة.'
      ],
      recommendedLetterDraft: 'نظراً لأن منشأتنا (شركة المائدة الأصيلة) قد قامت برفع طلب تجديد عقد النظافة التجاري واستيفاء الشهادات الصحية لكافة الكوادر العاملة قبل رصد الملاحظة، واستناداً إلى المادة (4) من الدليل الإجرائي للائحة الجزاءات البلدية المحدثة التي تمنح مهلة 14 يوماً تصحيحية دون غرامة، نلتمس التكرم بقبول الاعتراض وإلغاء الغرامة المسجلة برقم VIO-BLD-2026-44019...'
    },
    lastAnalyzedAt: '2026-08-15'
  },

  'viol-2': {
    violationId: 'viol-2',
    violationNumber: 'VIO-CD-2026-1184',
    authority: 'المديرية العامة للدفاع المدني',
    detectedDate: '2026-08-05',
    manual: {
      name: 'الدليل الإجرائي للتفتيش الوقائي وضبط مخالفات السلامة والوقاية من الحريق (SBC 801)',
      articleNumber: 'المادة 7 / الفقرة ج (فحص وصيانة أجهزة الإنذار والمكافحة التلقائية وتحديث السجلات)',
      clauseText: 'يجب على المنشأة إجراء الفحص الفني الدوري لكواشف الدخان ومضخات الحريق وشبكات الإطفاء كل 3 أشهر بواسطة شركة معتمدة، ورفع التقرير الفني إلى بوابة سلامة فور اكتماله.',
      officialPortal: 'بوابة سلامة الإلكترونية (salamah.gov.sa) - خدمة التقارير الفنية',
      gracePeriodDays: 15,
      objectionWindowDays: 20,
      penaltyMultiplierRisk: 'عدم معالجة متطلبات السلامة قبل انقضاء الـ 15 يوماً يعرّض المنشأة للإغلاق الإداري الاحترازي وتثبيت غرامة 5,000 ر.س وسحب ترخيص سلامة.'
    },
    rootCauseDiagnosis: {
      primaryCause: 'تأخر شركة صيانة السلامة المتعاقد معها في تنفيذ الفحص الفني الربع سنوي لصمامات المضخات وكواشف الدخان في فرع جدة.',
      operationalGap: 'عدم وجود تتبع آلي لتواريخ الصيانة الدورية مع مقاول السلامة، وغياب التوثيق الفوري لتقارير الاختبار الميداني في منصة سلامة.',
      riskLevel: 'critical',
      severityScore: 92
    },
    correctiveActionPlan: [
      {
        id: 'step-cd-1',
        stepNumber: 1,
        phase: 'immediate_containment',
        phaseLabel: 'الإيقاف الفوري واحتواء المخاطر',
        actionTitle: 'استدعاء عاجل لفنيي شركة السلامة المعتمدة لإجراء الفحص',
        detailedProcedure: 'إصدار أمر تشغيلي عاجل لشركة الصيانة المعتمدة (بموجب العقد الساري) لإجراء المعايرة الميدانية لكواشف الدخان واختبار ضغط صمامات المضخات خلال 24 ساعة.',
        requiredRole: 'مدير فرع جدة / مهندس السلامة',
        proceduralManualArticleRef: 'المادة 7/ج من الدليل الإجرائي للسلامة والوقاية من الحريق',
        estimatedDurationHours: 6,
        estimatedCostSAR: 1200,
        isCompleted: false,
        evidenceRequired: 'تقرير فني موقع ومختوم من مهندس معتمد مرخص من الدفاع المدني',
        quickActionType: 'order_service',
        quickActionTarget: 'srv-salama'
      },
      {
        id: 'step-cd-2',
        stepNumber: 2,
        phase: 'field_rectification',
        phaseLabel: 'التصحيح الميداني واستبدال الحساسات التالفة',
        actionTitle: 'استبدال الحساسات المنتهية وصيانة لوحة التحكم الرئيسية',
        detailedProcedure: 'استبدال بطاريات كواشف الدخان وتأهيل صمامات الرشاشات المائية والتأكد من مطابقة ضغط الشبكة لـ 6 بار، وتحديث ملصق تاريخ الاختبار التالي على لوحة الإنذار.',
        requiredRole: 'فني السلامة المعتمد',
        proceduralManualArticleRef: 'كود البناء السعودي SBC 801 - الفصل التاسع لأنظمة الإطفاء',
        estimatedDurationHours: 4,
        estimatedCostSAR: 400,
        isCompleted: false,
        evidenceRequired: 'شهادة إنجاز أعمال صيانة ومعايرة معتمدة',
        quickActionType: 'upload_doc',
        quickActionTarget: 'doc-salama-report'
      },
      {
        id: 'step-cd-3',
        stepNumber: 3,
        phase: 'evidence_upload',
        phaseLabel: 'رفع التقرير عبر بوابة سلامة الإلكترونية',
        actionTitle: 'الرفع الآلي للتقرير الفني المحدث لبوابة سلامة للدفاع المدني',
        detailedProcedure: 'تقوم شركة الصيانة المرخصة برفع التقرير الفني برقم المخالفة (VIO-CD-2026-1184) إلى منصة سلامة لإثبات تدارك الملاحظة وإشعار شعبة السلامة بجدة آلياً.',
        requiredRole: 'شركة الصيانة المعتمدة / مسؤول الامتثال',
        proceduralManualArticleRef: 'المادة 15 من لائحة شروط وإجراءات تراخيص سلامة',
        estimatedDurationHours: 1,
        estimatedCostSAR: 0,
        isCompleted: false,
        evidenceRequired: 'رقم إشعار قبول التقرير في منصة سلامة',
        quickActionType: 'gov_portal_link',
        quickActionTarget: 'https://salamah.gov.sa'
      },
      {
        id: 'step-cd-4',
        stepNumber: 4,
        phase: 'closure_verification',
        phaseLabel: 'طلب إغلاق المخالفة وسحب الإخطار',
        actionTitle: 'تقديم طلب مراجعة وسحب المخالفة لدى إدارة الدفاع المدني بجدة',
        detailedProcedure: 'تقديم لائحة إثبات استيفاء معايير الوقاية قبل موعد الإغلاق، وإرفاق ما يثبت سريان عقد الصيانة الدورية لمنع تحصيل الغرامة وإعادة تصنيف الفرع إلى فئة آمن.',
        requiredRole: 'مسؤول الامتثال لمنصة سبّاق',
        proceduralManualArticleRef: 'المادة 21 من لائحة لجان النظر في مخالفات الدفاع المدني',
        estimatedDurationHours: 2,
        estimatedCostSAR: 0,
        isCompleted: false,
        evidenceRequired: 'إشعار سحب المخالفة وتجديد تصريح سلامة لفرع جدة',
        quickActionType: 'generate_objection',
        quickActionTarget: 'viol-2'
      }
    ],
    requiredEvidenceList: [
      {
        id: 'ev-cd-1',
        title: 'عقد صيانة أنظمة السلامة والإطفاء ساري المفعول',
        description: 'عقد مبرم مع مؤسسة صيانة معتمدة ومرخصة من الدفاع المدني',
        isAvailableInVault: true,
        vaultDocId: 'doc-8',
        sampleFormat: 'عقد رسمي مصدق'
      },
      {
        id: 'ev-cd-2',
        title: 'تقرير فني معتمد لفحص كواشف الدخان والمضخات',
        description: 'تقرير صادر من مهندس سلامة مرخص يثبت جاهزية منظومة الإطفاء والإنذار',
        isAvailableInVault: false,
        sampleFormat: 'تقرير فني PDF معتمد من سلامة'
      },
      {
        id: 'ev-cd-3',
        title: 'ترخيص سلامة المنشأة السابق وسجل الصيانة الدوري',
        description: 'ملف السجل الوقائي الداخلي للفرع لتوضيح سجل التزام المنشأة',
        isAvailableInVault: true,
        vaultDocId: 'lic-2',
        sampleFormat: 'ترخيص رسمي صادر من الدفاع المدني'
      }
    ],
    financialImpact: {
      originalFineSAR: 5000,
      escalatedFineIfIgnoredSAR: 15000,
      correctionEstimatedCostSAR: 1600,
      netSavedSAR: 13400,
      potentialDiscountRate: 50,
      discountedFineSAR: 2500
    },
    objectionFeasibility: {
      score: 85,
      verdict: 'recommended',
      legalGrounds: [
        'وجود عقد صيانة دورية ساري مع شركة معتمدة يثبت انتظام المنشأة في متابعة اشتراطات الوقاية.',
        'تنفيذ أعمال المعايرة واستبدال الحساسات خلال مهلة التصحيح النظامية (15 يوماً).',
        'رفع التقرير الفني لمنصة سلامة بموجب المادة (7/ج) مما يستوجب إسقاط المخالفة أو منح التخفيض الأقصى.'
      ],
      recommendedLetterDraft: 'إلى سعادة رئيس لجنة النظر في مخالفات السلامة بالدفاع المدني بمحافظة جدة، نود إحاطة سعادتكم بأن منشأتنا (شركة المائدة الأصيلة - فرع طريق الكورنيش) قد باشرت فوراً استدعاء شركة الصيانة المعتمدة واستكمال المعايرة الفنية الشاملة لكواشف الدخان ومضخات الحريق ورفع التقرير المعتمد لمنصة سلامة، ونلتمس قبول الاعتراض وسحب المخالفة رقم VIO-CD-2026-1184...'
    },
    lastAnalyzedAt: '2026-08-15'
  }
};
