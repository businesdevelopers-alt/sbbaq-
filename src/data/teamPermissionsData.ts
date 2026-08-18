import { 
  TeamMember, 
  UserActivityLog, 
  PermissionGroupDefinition, 
  EnterpriseRole, 
  PermissionKey 
} from '../types';

export const PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    id: 'licenses',
    title: 'إدارة التراخيص والرخص البلدية',
    description: 'التحكم في متابعة وتجديد وإصدار رخص بلدي، سلامة الدفاع المدني، والسجلات التجارية.',
    icon: '📜',
    permissions: [
      { key: 'licenses.view', label: 'استعراض التراخيص والشهادات', description: 'الاطلاع على قائمة التراخيص وتواريخ الصلاحية وتفاصيل الفروع.' },
      { key: 'licenses.renew', label: 'طلب وتأكيد تجديد التراخيص', description: 'تقديم طلبات التجديد الفوري وسداد الرسوم وإصدار الترخيص.' },
      { key: 'licenses.edit', label: 'تعديل وتحديث بيانات التراخيص', description: 'تعديل بيانات الترخيص أو إضافة ملاحظات وتحديث أرقام الرخص.' },
      { key: 'licenses.export', label: 'تصدير وطباعة تقارير التراخيص', description: 'تحميل ملفات PDF وتقارير Excel لكافة التراخيص الحكومية.' },
    ]
  },
  {
    id: 'documents',
    title: 'محفظة المستندات والعقود الموثقة',
    description: 'إدارة الأرشيف الرقمي، عقود إيجار، واعتماد مسودات التجديد التلقائي.',
    icon: '📁',
    permissions: [
      { key: 'documents.view', label: 'استعراض وتحميل المستندات', description: 'الاطلاع على جميع الوثائق في محفظة الشركة وتنزيل النسخ.' },
      { key: 'documents.upload', label: 'رفع واستخراج المستندات الذكي', description: 'إضافة وثائق جديدة واستخدام المسح الضوئي الذكي (OCR).' },
      { key: 'documents.delete', label: 'أرشفة وحذف المستندات', description: 'حذف أو نقل الوثائق غير النشطة إلى سلة الأرشيف.' },
      { key: 'documents.ejar_auto_renewal', label: 'اعتماد مسودات التجديد التلقائي', description: 'الموافقة على مسودات عقود الإيجار وعقود الصيانة المتكررة.' },
    ]
  },
  {
    id: 'fees',
    title: 'المالية، الرسوم الحكومية والتخطيط المالي',
    description: 'الوصول إلى حاسبة الرسوم، سداد الفواتير الحكومية، ومنحنى الميزانيات.',
    icon: '💰',
    permissions: [
      { key: 'fees.view', label: 'استعراض الرسوم وتوقعات الميزانية', description: 'الاطلاع على منحنى الرسوم المتراكمة وحاسبة الرسوم البلدية.' },
      { key: 'fees.pay_bills', label: 'سداد فواتير سداد والرسوم الحكومية', description: 'إتمام عمليات الدفع الإلكتروني وفواتير الخدمات الحكومية.' },
      { key: 'fees.export_budget', label: 'تصدير تقارير الميزانية السنوية', description: 'تنزيل خطط الميزانية والرسوم بصيغة جداول بيانات معتمدة.' },
    ]
  },
  {
    id: 'violations',
    title: 'المخالفات، الرقابة والاعتراضات القانونية',
    description: 'متابعة ضبطيات البلديات والجهات والاعتراض عليها عبر المنصات.',
    icon: '⚖️',
    permissions: [
      { key: 'violations.view', label: 'استعراض سجل المخالفات والتفتيش', description: 'الاطلاع على المخالفات المسجلة وحالتها وقيم الغرامات.' },
      { key: 'violations.object', label: 'تقديم وصياغة لوائح الاعتراض', description: 'استخدام الذكاء الاصطناعي لتوليد وصياغة مذكرات الاعتراض ورفعها.' },
      { key: 'violations.pay', label: 'سداد وتسوية الغرامات المالية', description: 'سداد مبالغ المخالفات الحكومية إلكترونياً.' },
    ]
  },
  {
    id: 'benchmarks_and_branches',
    title: 'مقارنة متوسط القطاع وإدارة الفروع',
    description: 'تحليل الأداء المعياري ومتابعة فروع المنشأة ونطاقات المخاطر.',
    icon: '📊',
    permissions: [
      { key: 'benchmarks.view', label: 'استعراض مقارنة متوسط القطاع', description: 'الاطلاع على رادار الامتثال ومقارنة الأداء مع منافسي القطاع.' },
      { key: 'benchmarks.export', label: 'تصدير التقارير المعيارية', description: 'تحميل تقارير المقارنة المعيارية والتحليل التنافسي.' },
      { key: 'branches.view', label: 'استعراض بيانات الفروع', description: 'الاطلاع على الخريطة الجغرافية ومؤشرات مخاطر الفروع.' },
      { key: 'branches.manage', label: 'إضافة وتعديل بيانات الفروع', description: 'تعديل مواقع الفروع والمساحات وإضافة فروع تجارية جديدة.' },
    ]
  },
  {
    id: 'team_and_security',
    title: 'إدارة الفريق، الصلاحيات والأمان',
    description: 'إضافة الموظفين، تعيين الأدوار، ومراجعة سجلات النشاط وتدقيق العمليات.',
    icon: '👥',
    permissions: [
      { key: 'team.view', label: 'استعراض قائمة الموظفين والأدوار', description: 'الاطلاع على بيانات فريق العمل والمسميات الوظيفية.' },
      { key: 'team.manage_members', label: 'إضافة وتعديل صلاحيات الموظفين', description: 'دعوة موظفين جدد، تغيير أدوارهم، أو تجميد حساباتهم.' },
      { key: 'team.view_activity', label: 'الاطلاع على سجل النشاط والتدقيق', description: 'مراجعة كافة العمليات والإجراءات التي نفذها المستخدمون بالكامل.' },
    ]
  },
  {
    id: 'ai_assistant',
    title: 'الذكاء الاصطناعي والمستشار الذكي «سبّاق»',
    description: 'الاستفادة من المساعد الآلي وتحليل اللوائح والتفويض.',
    icon: '✨',
    permissions: [
      { key: 'ai.chat', label: 'استشارة المساعد الذكي غير المحدودة', description: 'طرح الأسئلة القانونية والبلدية والحصول على استشارات فورية.' },
      { key: 'ai.expert_delegation', label: 'طلب إسناد المهام للمختصين القانونيين', description: 'طلب مراجعة بشرية متقدمة من نخبة معقبي ومستشاري سبّاق.' },
    ]
  }
];

export const ROLE_PRESETS: Record<EnterpriseRole, {
  title: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  defaultPermissions: PermissionKey[];
}> = {
  owner: {
    title: 'مالك المنشأة / المفوض الرئيسي',
    badge: 'صلاحية مطلقة',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-slate-800',
    description: 'كامل الصلاحيات دون قيود؛ إدارة الحسابات المالية، التراخيص، الفريق، والسياسات.',
    defaultPermissions: [
      'licenses.view', 'licenses.renew', 'licenses.edit', 'licenses.export',
      'documents.view', 'documents.upload', 'documents.delete', 'documents.ejar_auto_renewal',
      'fees.view', 'fees.pay_bills', 'fees.export_budget',
      'violations.view', 'violations.object', 'violations.pay',
      'benchmarks.view', 'benchmarks.export',
      'branches.view', 'branches.manage',
      'team.view', 'team.manage_members', 'team.view_activity',
      'ai.chat', 'ai.expert_delegation'
    ]
  },
  licenses_specialist: {
    title: 'مسؤول التراخيص والبلديات',
    badge: 'تراخيص وعقود',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    description: 'متابعة تواريخ انتهاء رخص بلدي، سلامة، والسجلات، وتجديدها ورفع الوثائق والتنبيهات الاستباقية.',
    defaultPermissions: [
      'licenses.view', 'licenses.renew', 'licenses.edit', 'licenses.export',
      'documents.view', 'documents.upload', 'documents.ejar_auto_renewal',
      'branches.view',
      'ai.chat'
    ]
  },
  accounting_specialist: {
    title: 'أخصائي المحاسبة والرسوم الحكومية',
    badge: 'مالية ومدفوعات',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    description: 'التحكم في حاسبة الرسوم، سداد الفواتير الحكومية، تخطيط الميزانيات، وتصدير التقارير المالية.',
    defaultPermissions: [
      'fees.view', 'fees.pay_bills', 'fees.export_budget',
      'licenses.view', 'licenses.export',
      'documents.view',
      'benchmarks.view',
      'ai.chat'
    ]
  },
  compliance_officer: {
    title: 'مدير الامتثال والحوكمة',
    badge: 'حوكمة ورقابة',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300',
    description: 'مراقبة درجات المخاطر، إدارة المخالفات والاعتراضات، المقارنة المعيارية للقطاع، ومراجعة التدقيق.',
    defaultPermissions: [
      'licenses.view', 'licenses.renew', 'licenses.export',
      'documents.view', 'documents.upload',
      'violations.view', 'violations.object',
      'benchmarks.view', 'benchmarks.export',
      'branches.view',
      'team.view', 'team.view_activity',
      'ai.chat', 'ai.expert_delegation'
    ]
  },
  branch_manager: {
    title: 'مدير فرع',
    badge: 'فرع محدد',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    description: 'صلاحيات تشغيلية محددة لفرع معين لمتابعة الرخص والشهادات الصحية ومستندات الموقع.',
    defaultPermissions: [
      'licenses.view', 'licenses.renew',
      'documents.view', 'documents.upload',
      'violations.view',
      'branches.view',
      'ai.chat'
    ]
  },
  legal_advisor: {
    title: 'مستشار قانوني',
    badge: 'لوائح واعتراضات',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-300',
    description: 'مراجعة وتدقيق العقود القانونية، إعداد لوائح الاعتراض على المخالفات، ومتابعة النزاعات التنظيمية.',
    defaultPermissions: [
      'violations.view', 'violations.object',
      'documents.view', 'documents.upload',
      'licenses.view',
      'benchmarks.view',
      'ai.chat', 'ai.expert_delegation'
    ]
  },
  custom: {
    title: 'صلاحيات مخصصة',
    badge: 'مخصص',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    description: 'تخصيص يدوي دقيق لقائمة الصلاحيات حسب حاجة الموظف وطبيعة مهامه التشغيلية.',
    defaultPermissions: [
      'licenses.view',
      'documents.view',
      'ai.chat'
    ]
  }
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-emp-1',
    establishmentId: 'est-1',
    name: 'عبدالعزيز السبيعي',
    email: 'a.subaie@al-maedah.sa',
    phone: '0555123456',
    nationalIdOrIqama: '1084920194',
    jobTitle: 'المدير العام والمالك المفوض',
    department: 'الإدارة التنفيذية',
    role: 'owner',
    roleTitle: 'مالك المنشأة / المفوض الرئيسي',
    assignedBranchIds: ['all'],
    permissions: ROLE_PRESETS.owner.defaultPermissions,
    status: 'active',
    avatar: '👨‍💼',
    joinedAt: '2021-04-12',
    lastActiveAt: 'منذ 5 دقائق',
    twoFactorEnabled: true,
    nafathVerified: true,
    dailyActionsCount: 14,
    notes: 'المفوض الرئيسي لدى وزارة التجارة ومنصة بلدي وقوى.'
  },
  {
    id: 'user-emp-2',
    establishmentId: 'est-1',
    name: 'فيصل المطيري',
    email: 'f.almutairi@al-maedah.sa',
    phone: '0567890123',
    nationalIdOrIqama: '1092837461',
    jobTitle: 'مسؤول التراخيص والعلاقات الحكومية',
    department: 'الشؤون الإدارية والحكومية',
    role: 'licenses_specialist',
    roleTitle: 'مسؤول التراخيص والبلديات',
    assignedBranchIds: ['all'],
    permissions: ROLE_PRESETS.licenses_specialist.defaultPermissions,
    status: 'active',
    avatar: '👨‍💻',
    joinedAt: '2023-02-15',
    lastActiveAt: 'اليوم 10:45 ص',
    twoFactorEnabled: true,
    nafathVerified: true,
    dailyActionsCount: 8,
    notes: 'مكلف بمتابعة رخص الدفاع المدني وبلدي وتجديد الشهادات الصحية لجميع الفروع.'
  },
  {
    id: 'user-emp-3',
    establishmentId: 'est-1',
    name: 'ريم الشمري',
    email: 'reem.shammari@al-maedah.sa',
    phone: '0541239876',
    nationalIdOrIqama: '1073829104',
    jobTitle: 'أخصائية المحاسبة والرسوم الحكومية',
    department: 'الإدارة المالية',
    role: 'accounting_specialist',
    roleTitle: 'أخصائي المحاسبة والرسوم الحكومية',
    assignedBranchIds: ['all'],
    permissions: ROLE_PRESETS.accounting_specialist.defaultPermissions,
    status: 'active',
    avatar: '👩‍💼',
    joinedAt: '2023-08-01',
    lastActiveAt: 'اليوم 09:15 ص',
    twoFactorEnabled: true,
    nafathVerified: true,
    dailyActionsCount: 5,
    notes: 'مسؤولة عن التخطيط المالي وسداد فواتير سداد الحكومية ومتابعة الميزانيات التراكمية.'
  },
  {
    id: 'user-emp-4',
    establishmentId: 'est-1',
    name: 'م. طارق العمري',
    email: 'tariq.amri@al-maedah.sa',
    phone: '0534567890',
    nationalIdOrIqama: '1058291038',
    jobTitle: 'مدير الامتثال والجودة التشغيلية',
    department: 'إدارة الامتثال والجودة',
    role: 'compliance_officer',
    roleTitle: 'مدير الامتثال والحوكمة',
    assignedBranchIds: ['all'],
    permissions: ROLE_PRESETS.compliance_officer.defaultPermissions,
    status: 'active',
    avatar: '👨‍🔬',
    joinedAt: '2024-01-10',
    lastActiveAt: 'أمس 04:30 م',
    twoFactorEnabled: true,
    nafathVerified: true,
    dailyActionsCount: 11,
    notes: 'مكلف بمتابعة زيارات التفتيش والاعتراض على المخالفات ومطابقة معايير كود البناء.'
  },
  {
    id: 'user-emp-5',
    establishmentId: 'est-1',
    name: 'خالد الدوسري',
    email: 'k.aldosari@al-maedah.sa',
    phone: '0559876543',
    nationalIdOrIqama: '1049281726',
    jobTitle: 'مدير فرع العليا (المقر الرئيسي)',
    department: 'العمليات الميدانية',
    role: 'branch_manager',
    roleTitle: 'مدير فرع',
    assignedBranchIds: ['br-1'],
    permissions: ROLE_PRESETS.branch_manager.defaultPermissions,
    status: 'active',
    avatar: '👨‍💼',
    joinedAt: '2024-06-20',
    lastActiveAt: 'منذ ساعتين',
    twoFactorEnabled: false,
    nafathVerified: true,
    dailyActionsCount: 3,
    notes: 'مدير ميداني لفرع العليا بالرياض - متابعة الاشتراطات الصحية لعمال الفرع.'
  },
  {
    id: 'user-emp-6',
    establishmentId: 'est-1',
    name: 'نورة الزهراني',
    email: 'noura.z@al-maedah.sa',
    phone: '0503344556',
    nationalIdOrIqama: '1088273645',
    jobTitle: 'مستشارة قانونية ومسؤولة الاعتراضات',
    department: 'الإدارة القانونية',
    role: 'legal_advisor',
    roleTitle: 'مستشار قانوني',
    assignedBranchIds: ['all'],
    permissions: ROLE_PRESETS.legal_advisor.defaultPermissions,
    status: 'pending_activation',
    avatar: '👩‍⚖️',
    joinedAt: '2026-08-10',
    lastActiveAt: 'بانتظار قبول الدعوة والتحقق عبر نفاذ',
    twoFactorEnabled: false,
    nafathVerified: false,
    dailyActionsCount: 0,
    notes: 'تم إرسال دعوة الانضمام للمنصة لصياغة مذكرات الاعتراض القانونية.'
  }
];

export const INITIAL_ACTIVITY_LOGS: UserActivityLog[] = [
  {
    id: 'log-101',
    establishmentId: 'est-1',
    userId: 'user-emp-2',
    userName: 'فيصل المطيري',
    userRoleTitle: 'مسؤول التراخيص والبلديات',
    userAvatar: '👨‍💻',
    actionType: 'license_renew',
    actionTitle: 'بدء إجراءات تجديد رخصة بلدي فورياً',
    actionDetails: 'تم إنشاء مسودة تجديد رخصة الأنشطة التجارية لفرع الصحافة (رقم: BAL-2024-99120) وسداد الرسوم التقديرية 1,850 ر.س.',
    timestamp: '2026-08-15 10:45:12',
    ipAddress: '212.138.112.45',
    device: 'Chrome 127 - Windows 11',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityId: 'lic-1',
    relatedEntityType: 'license'
  },
  {
    id: 'log-102',
    establishmentId: 'est-1',
    userId: 'user-emp-3',
    userName: 'ريم الشمري',
    userRoleTitle: 'أخصائية المحاسبة والرسوم الحكومية',
    userAvatar: '👩‍💼',
    actionType: 'budget_export',
    actionTitle: 'تصدير خطة الميزانية التراكمية (12 شهراً)',
    actionDetails: 'تم تحميل تقرير التخطيط المالي للرسوم الحكومية المتوقعة للعام المالي 2026-2027 بصيغة Excel المعتمدة.',
    timestamp: '2026-08-15 09:15:40',
    ipAddress: '188.50.21.90',
    device: 'Safari 17 - macOS Sonoma',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityType: 'system'
  },
  {
    id: 'log-103',
    establishmentId: 'est-1',
    userId: 'user-emp-4',
    userName: 'م. طارق العمري',
    userRoleTitle: 'مدير الامتثال والحوكمة',
    userAvatar: '👨‍🔬',
    actionType: 'violation_objection',
    actionTitle: 'توليد مذكرة اعتراض بالذكاء الاصطناعي',
    actionDetails: 'صياغة مذكرة اعتراض قانونية نظامية على مخالفة بلدي رقم #M-90218 (عدم تجديد تصريح اللوحة) استناداً للائحة الجزاءات البلدية المحدثة.',
    timestamp: '2026-08-14 16:30:19',
    ipAddress: '212.138.112.45',
    device: 'Firefox 128 - macOS',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityId: 'viol-1',
    relatedEntityType: 'violation'
  },
  {
    id: 'log-104',
    establishmentId: 'est-1',
    userId: 'user-emp-1',
    userName: 'عبدالعزيز السبيعي',
    userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
    userAvatar: '👨‍💼',
    actionType: 'team_member_added',
    actionTitle: 'دعوة مستشار قانوني جديد وتعيين الصلاحيات',
    actionDetails: 'تمت إضافة الأستاذة نورة الزهراني بدور مستشار قانوني مع منحها صلاحيات إدارة المخالفات والاعتراضات ومراجعة العقود.',
    timestamp: '2026-08-10 14:10:05',
    ipAddress: '93.168.204.12',
    device: 'Safari Mobile - iOS 18',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'info',
    relatedEntityId: 'user-emp-6',
    relatedEntityType: 'team_member'
  },
  {
    id: 'log-105',
    establishmentId: 'est-1',
    userId: 'user-emp-2',
    userName: 'فيصل المطيري',
    userRoleTitle: 'مسؤول التراخيص والبلديات',
    userAvatar: '👨‍💻',
    actionType: 'document_upload',
    actionTitle: 'رفع واستخراج شهادة فحص أدوات السلامة (OCR)',
    actionDetails: 'تم رفع شهادة صيانة أنظمة الإنذار والإطفاء لفرع جدة، واستخراج تاريخ الانتهاء تلقائياً عبر محرك سبّاق الذكي.',
    timestamp: '2026-08-08 11:22:33',
    ipAddress: '212.138.112.45',
    device: 'Chrome 127 - Windows 11',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityId: 'doc-12',
    relatedEntityType: 'document'
  },
  {
    id: 'log-106',
    establishmentId: 'est-1',
    userId: 'user-emp-3',
    userName: 'ريم الشمري',
    userRoleTitle: 'أخصائية المحاسبة والرسوم الحكومية',
    userAvatar: '👩‍💼',
    actionType: 'fee_payment',
    actionTitle: 'سداد فاتورة سداد للرخصة التجارية',
    actionDetails: 'تم سداد فاتورة ترخيص بلدي برقم سداد #992819481 بقيمة 2,400 ر.س عبر بوابة الدفع الإلكتروني.',
    timestamp: '2026-08-05 13:05:44',
    ipAddress: '188.50.21.90',
    device: 'Safari 17 - macOS Sonoma',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityType: 'order'
  },
  {
    id: 'log-107',
    establishmentId: 'est-1',
    userId: 'user-emp-5',
    userName: 'خالد الدوسري',
    userRoleTitle: 'مدير فرع',
    userAvatar: '👨‍💼',
    actionType: 'ai_consultation',
    actionTitle: 'استشارة المساعد الذكي حول اشتراطات واجهة المطعم',
    actionDetails: 'استفسار عن المتطلبات البلدية الجديدة للوحات الإعلانية والبروز المعماري وفق كود البناء السعودي.',
    timestamp: '2026-08-03 15:40:22',
    ipAddress: '176.224.89.15',
    device: 'Edge 126 - Windows 10',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'info',
    relatedEntityType: 'system'
  },
  {
    id: 'log-108',
    establishmentId: 'est-1',
    userId: 'user-emp-1',
    userName: 'عبدالعزيز السبيعي',
    userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
    userAvatar: '👨‍💼',
    actionType: 'nafath_auth',
    actionTitle: 'تسجيل دخول وتوثيق نفاذ الوطني الموحد',
    actionDetails: 'تم التحقق من الهوية الوطنية بنجاح عبر تطبيق نفاذ (الرمز: 48).',
    timestamp: '2026-08-01 08:30:00',
    ipAddress: '93.168.204.12',
    device: 'Safari Mobile - iOS 18',
    location: 'الرياض، المملكة العربية السعودية',
    status: 'success',
    relatedEntityType: 'system'
  }
];
