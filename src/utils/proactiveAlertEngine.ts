import { 
  License, 
  DocumentItem, 
  Establishment, 
  Branch, 
  ProactiveAlertItem, 
  ProactiveAlertSummary,
  ProactiveAlertWindow,
  ProactiveTimeRangeFilter
} from '../types';

/**
 * Time range filter preset definitions with Arabic labels and badges
 */
export interface TimeRangeOptionDef {
  id: ProactiveTimeRangeFilter;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
}

export const PROACTIVE_TIME_RANGE_OPTIONS: TimeRangeOptionDef[] = [
  {
    id: 'all',
    label: 'كافة الآجال والتواريخ',
    shortLabel: 'الكل',
    badge: 'الكل',
    description: 'عرض جميع التراخيص والوثائق المسجلة'
  },
  {
    id: 'next_30_days',
    label: 'خلال الشهر القادم (30 يوماً)',
    shortLabel: 'الشهر القادم',
    badge: '≤ 30 يوم',
    description: 'تراخيص تنتهي خلال الـ 30 يوماً القادمة'
  },
  {
    id: 'this_quarter',
    label: 'هذا الربع الحالي',
    shortLabel: 'هذا الربع',
    badge: 'الربع الحالي',
    description: 'تراخيص تنتهي ضمن الربع السنوي الحالي'
  },
  {
    id: 'next_quarter',
    label: 'الربع القادم',
    shortLabel: 'الربع القادم',
    badge: 'الربع القادم',
    description: 'تراخيص تنتهي ضمن الربع السنوي التالي'
  },
  {
    id: 'this_year',
    label: 'السنة الحالية',
    shortLabel: 'السنة الحالية',
    badge: 'السنة الحالية',
    description: 'تراخيص تنتهي خلال العام الجاري'
  },
  {
    id: 'next_60_days',
    label: 'خلال 60 يوماً القادمة',
    shortLabel: '60 يوماً',
    badge: '≤ 60 يوم',
    description: 'تراخيص تنتهي خلال الشهرين القادمين'
  },
  {
    id: 'next_90_days',
    label: 'خلال 90 يوماً القادمة',
    shortLabel: '90 يوماً',
    badge: '≤ 90 يوم',
    description: 'تراخيص تنتهي خلال 3 أشهر قادمة'
  },
  {
    id: 'this_month',
    label: 'هذا الشهر الحالي',
    shortLabel: 'هذا الشهر',
    badge: 'الشهر الحالي',
    description: 'تراخيص تنتهي بنهاية الشهر التقويمي الحالي'
  },
  {
    id: 'next_year',
    label: 'السنة القادمة',
    shortLabel: 'السنة القادمة',
    badge: 'السنة القادمة',
    description: 'تراخيص تنتهي خلال العام الميلادي القادم'
  },
  {
    id: 'expired_past',
    label: 'منتهية الصلاحية مسبقاً',
    shortLabel: 'المنتهية',
    badge: 'منتهية',
    description: 'تراخيص تجاوزت تاريخ انتهائها وتتطلب معالجة فورية'
  },
  {
    id: 'custom',
    label: 'نطاق زمني مخصص (من - إلى)',
    shortLabel: 'مخصص',
    badge: 'مخصص',
    description: 'تحديد فترة زمنية مخصصة بواسطة التقويم'
  }
];

/**
 * Checks if a given expiry date falls within the selected ProactiveTimeRangeFilter
 */
export function isDateWithinTimeRange(
  expiryDateStr: string,
  filter: ProactiveTimeRangeFilter,
  customStart?: string,
  customEnd?: string,
  baseDate: Date = new Date()
): boolean {
  if (!expiryDateStr) return false;
  if (filter === 'all') return true;

  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return false;

  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffDays = Math.ceil((expiryDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const curYear = today.getFullYear();
  const curMonth = today.getMonth(); // 0-indexed (0: Jan, ..., 11: Dec)
  const curQuarter = Math.floor(curMonth / 3); // 0: Q1, 1: Q2, 2: Q3, 3: Q4

  switch (filter) {
    case 'expired_past':
      return diffDays < 0;

    case 'next_30_days':
      return diffDays >= 0 && diffDays <= 30;

    case 'next_60_days':
      return diffDays >= 0 && diffDays <= 60;

    case 'next_90_days':
      return diffDays >= 0 && diffDays <= 90;

    case 'this_month': {
      return expiry.getFullYear() === curYear && expiry.getMonth() === curMonth;
    }

    case 'next_month': {
      const nextMonthYear = curMonth === 11 ? curYear + 1 : curYear;
      const nextMonth = curMonth === 11 ? 0 : curMonth + 1;
      return expiry.getFullYear() === nextMonthYear && expiry.getMonth() === nextMonth;
    }

    case 'this_quarter': {
      const qStartMonth = curQuarter * 3;
      const qEndMonth = qStartMonth + 2;
      return (
        expiry.getFullYear() === curYear &&
        expiry.getMonth() >= qStartMonth &&
        expiry.getMonth() <= qEndMonth
      );
    }

    case 'next_quarter': {
      const nextQ = (curQuarter + 1) % 4;
      const nextQYear = curQuarter === 3 ? curYear + 1 : curYear;
      const qStartMonth = nextQ * 3;
      const qEndMonth = qStartMonth + 2;
      return (
        expiry.getFullYear() === nextQYear &&
        expiry.getMonth() >= qStartMonth &&
        expiry.getMonth() <= qEndMonth
      );
    }

    case 'this_year': {
      return expiry.getFullYear() === curYear;
    }

    case 'next_year': {
      return expiry.getFullYear() === curYear + 1;
    }

    case 'custom': {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return expiryDay >= start && expiryDay <= end;
      } else if (customStart) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        return expiryDay >= start;
      } else if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return expiryDay <= end;
      }
      return true;
    }

    default:
      return true;
  }
}

/**
 * Returns formatted text describing the time range bounds
 */
export function getTimeRangeDescriptionText(
  filter: ProactiveTimeRangeFilter,
  customStart?: string,
  customEnd?: string,
  baseDate: Date = new Date()
): string {
  const curYear = baseDate.getFullYear();
  const curMonth = baseDate.getMonth() + 1;
  const curQuarter = Math.floor(baseDate.getMonth() / 3) + 1;

  switch (filter) {
    case 'all':
      return 'كافة الفترات الزمنية';
    case 'next_30_days':
      return 'التراخيص التي تنتهي خلال الـ 30 يوماً القادمة';
    case 'next_60_days':
      return 'التراخيص التي تنتهي خلال الـ 60 يوماً القادمة';
    case 'next_90_days':
      return 'التراخيص التي تنتهي خلال الـ 90 يوماً القادمة';
    case 'this_month':
      return `شهر ${curMonth} / ${curYear}`;
    case 'next_month':
      return `الشهر القادم (${curMonth === 12 ? 1 : curMonth + 1} / ${curMonth === 12 ? curYear + 1 : curYear})`;
    case 'this_quarter':
      return `الربع الحالي Q${curQuarter} (${curYear})`;
    case 'next_quarter':
      return `الربع القادم Q${curQuarter === 4 ? 1 : curQuarter + 1} (${curQuarter === 4 ? curYear + 1 : curYear})`;
    case 'this_year':
      return `عام ${curYear}`;
    case 'next_year':
      return `عام ${curYear + 1}`;
    case 'expired_past':
      return 'التراخيص والوثائق المنتهية الصلاحية';
    case 'custom':
      if (customStart && customEnd) {
        return `من ${customStart} إلى ${customEnd}`;
      } else if (customStart) {
        return `ابتداءً من ${customStart}`;
      } else if (customEnd) {
        return `حتى تاريخ ${customEnd}`;
      }
      return 'نطاق زمني مخصص';
    default:
      return '';
  }
}

/**
 * Calculates accurate remaining days from today until expiry date (YYYY-MM-DD)
 */
export function getDaysRemainingFromDate(expiryDateStr: string, baseDate: Date = new Date()): number {
  if (!expiryDateStr) return 999;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return 999;
  
  // Set times to midnight for clean integer day calculation
  const todayMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  
  const diffTime = expiryMidnight.getTime() - todayMidnight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Comprehensive Smart Proactive Alert Engine (التنبيه الذكي بالاستباق - 60، 30، 7 أيام وما بعدها)
 * Analyzes all licenses and company documents and categorizes by warning milestones.
 */
export function analyzeEstablishmentProactiveAlerts(
  establishment: Establishment,
  licenses: License[],
  documents: DocumentItem[],
  branches: Branch[] = [],
  baseDate: Date = new Date()
): ProactiveAlertSummary {
  const estLicenses = licenses.filter(l => l.establishmentId === establishment.id);
  const estDocs = documents.filter(d => d.establishmentId === establishment.id);

  const alertItems: ProactiveAlertItem[] = [];
  const processedKeys = new Set<string>();

  // Helper to get normalized deduplication key
  const getDedupKey = (title: string, docNumber: string, branchId?: string, auth?: string) => {
    const cleanTitle = (title || '').trim().toLowerCase();
    const cleanNum = (docNumber || '').trim().toLowerCase();
    const cleanBranch = (branchId || 'main').trim().toLowerCase();
    const cleanAuth = (auth || '').trim().toLowerCase();
    return `${cleanTitle}__${cleanNum}__${cleanBranch}__${cleanAuth}`;
  };

  // 1. Process Licenses
  for (const lic of estLicenses) {
    const days = getDaysRemainingFromDate(lic.expiryDate, baseDate);
    
    let alertWindow: ProactiveAlertWindow = 'safe';
    let urgencyLevel: 'critical' | 'high' | 'medium' | 'info' = 'info';
    let alertStageLabel = `سارٍ (متبقي ${days} يوم)`;
    let badgeBg = 'bg-emerald-50 text-emerald-800';
    let badgeText = 'text-emerald-800 font-bold';
    let badgeBorder = 'border-emerald-200';
    let countdownColor = 'text-emerald-700 font-bold';
    let proactiveAdvice = `الترخيص سارٍ ومنتظم ومتبقي ${days} يوماً على موعد التجديد. يتيح النظام التخطيط المالي المبكر.`;
    let recommendedAction = 'تجديد مبكر';

    if (days < 0) {
      alertWindow = 'expired';
      urgencyLevel = 'critical';
      alertStageLabel = 'منتهي الصلاحية';
      badgeBg = 'bg-rose-100';
      badgeText = 'text-rose-900 font-bold';
      badgeBorder = 'border-rose-300';
      countdownColor = 'text-rose-700 font-black';
      proactiveAdvice = `الترخيص منتهي منذ ${Math.abs(days)} يوماً. المنشأة معرضة للإغلاق الفوري وتراكم الغرامات اليومية. يرجى تجديده الآن.`;
      recommendedAction = 'تجديد الآن';
    } else if (days <= 7) {
      alertWindow = '7_days';
      urgencyLevel = 'critical';
      alertStageLabel = 'حرج (خلال 7 أيام)';
      badgeBg = 'bg-red-50 text-red-800';
      badgeText = 'text-red-800 font-black';
      badgeBorder = 'border-red-300 shadow-2xs';
      countdownColor = 'text-red-700 font-black';
      proactiveAdvice = `متبقي ${days} أيام فقط على انتهاء الترخيص. هذه المرحلة تتطلب سداد الفاتورة وإصدار الترخيص المحدث فوراً لتجنب إيقاف السجل والغرامات.`;
      recommendedAction = 'تجديد الآن';
    } else if (days <= 30) {
      alertWindow = '30_days';
      urgencyLevel = 'high';
      alertStageLabel = 'تنبيه استباقي (30 يوماً)';
      badgeBg = 'bg-amber-50 text-amber-900';
      badgeText = 'text-amber-900 font-bold';
      badgeBorder = 'border-amber-300';
      countdownColor = 'text-amber-700 font-bold';
      proactiveAdvice = `متبقي ${days} يوماً على الانتهاء. فترة الـ 30 يوماً هي التوقيت المثالي لبدء إجراءات المنصات الحكومية وتجهيز متطلبات الفحص والاعتمادات.`;
      recommendedAction = 'تجديد الآن';
    } else if (days <= 60) {
      alertWindow = '60_days';
      urgencyLevel = 'medium';
      alertStageLabel = 'تنبيه مبكر (60 يوماً)';
      badgeBg = 'bg-blue-50 text-blue-900';
      badgeText = 'text-blue-900 font-semibold';
      badgeBorder = 'border-blue-200';
      countdownColor = 'text-blue-700 font-semibold';
      proactiveAdvice = `متبقي ${days} يوماً على الانتهاء. إشعار مبكر لتخطيط الميزانية وجمع الفحوصات والشهادات قبل الدخول في فترة الضغط.`;
      recommendedAction = 'تجديد الآن';
    }

    const dedupKey = getDedupKey(lic.name, lic.licenseNumber, lic.branchId, lic.authority);
    if (processedKeys.has(dedupKey)) {
      continue; // Skip duplicate license
    }
    processedKeys.add(dedupKey);

    const branch = branches.find(b => b.id === lic.branchId);

    alertItems.push({
      id: `alert-lic-${lic.id}`,
      sourceType: 'license',
      sourceId: lic.id,
      establishmentId: establishment.id,
      branchId: lic.branchId,
      branchName: lic.branchName || branch?.name || 'المقر الرئيسي',
      title: lic.name,
      authority: lic.authority,
      authorityLogo: lic.authorityLogo || '🏛️',
      documentNumber: lic.licenseNumber,
      issueDate: lic.issueDate,
      expiryDate: lic.expiryDate,
      daysRemaining: days,
      alertWindow,
      urgencyLevel,
      category: 'license',
      costGovEstimated: lic.costGov,
      costSabbaqEstimated: lic.costSabbaq,
      isMandatory: lic.isMandatory !== false,
      recommendedAction,
      proactiveAdvice,
      alertStageLabel,
      countdownColor,
      badgeBg,
      badgeText,
      badgeBorder,
      notificationChannels: ['in_app', 'whatsapp', 'email'],
      lastNotifiedAt: new Date().toISOString().split('T')[0]
    });
  }

  // 2. Process Company Documents Vault (e.g. Ejar lease contracts, Balady docs, Safety certs, GOSI, etc.)
  for (const doc of estDocs) {
    const docDays = getDaysRemainingFromDate(doc.expiryDate, baseDate);

    let alertWindow: ProactiveAlertWindow = 'safe';
    let urgencyLevel: 'critical' | 'high' | 'medium' | 'info' = 'info';
    let alertStageLabel = `سارٍ (متبقي ${docDays} يوم)`;
    let badgeBg = 'bg-emerald-50 text-emerald-800';
    let badgeText = 'text-emerald-800 font-bold';
    let badgeBorder = 'border-emerald-200';
    let countdownColor = 'text-emerald-700 font-bold';
    let proactiveAdvice = `المستند سارٍ ومنتظم ومتبقي ${docDays} يوماً على موعد انتهاء الصلاحية.`;
    let recommendedAction = 'عرض التفاصيل';

    const isContract = doc.category === 'lease_contract' || doc.isRecurring || !!doc.renewalDraftProposal;

    if (docDays < 0) {
      alertWindow = 'expired';
      urgencyLevel = 'critical';
      alertStageLabel = 'منتهي الصلاحية';
      badgeBg = 'bg-rose-100';
      badgeText = 'text-rose-900 font-bold';
      badgeBorder = 'border-rose-300';
      countdownColor = 'text-rose-700 font-black';
      proactiveAdvice = isContract 
        ? `العقد منتهي منذ ${Math.abs(docDays)} يوماً. يجب اعتماد مسودة التجديد أو التحديث فوراً لتجنب إيقاف الخدمات البلدية المرتبطة به.`
        : `المستند منتهي الصلاحية منذ ${Math.abs(docDays)} يوماً. يلزم التحديث الفوري لتفادي تعطل المعاملات الحكومية.`;
      recommendedAction = isContract ? 'تجديد العقد الآن' : 'تجديد الآن';
    } else if (docDays <= 7) {
      alertWindow = '7_days';
      urgencyLevel = 'critical';
      alertStageLabel = 'حرج (خلال 7 أيام)';
      badgeBg = 'bg-red-50 text-red-800';
      badgeText = 'text-red-800 font-black';
      badgeBorder = 'border-red-300 shadow-2xs';
      countdownColor = 'text-red-700 font-black';
      proactiveAdvice = isContract
        ? `متبقي ${docDays} أيام على انتهاء العقد. تم تجهيز مسودة التجديد التلقائي للاعتماد الفوري عبر شبكة إيجار.`
        : `متبقي ${docDays} أيام فقط. يرجى تجديد الوثيقة لتفادي تعليق ملف المنشأة.`;
      recommendedAction = isContract ? 'تجديد العقد الآن' : 'تجديد الآن';
    } else if (docDays <= 30) {
      alertWindow = '30_days';
      urgencyLevel = 'high';
      alertStageLabel = 'تنبيه استباقي (30 يوماً)';
      badgeBg = 'bg-amber-50 text-amber-900';
      badgeText = 'text-amber-900 font-bold';
      badgeBorder = 'border-amber-300';
      countdownColor = 'text-amber-700 font-bold';
      proactiveAdvice = isContract
        ? `متبقي ${docDays} يوماً على انتهاء العقد. صاغ النظام مسودة تجديد ذكية جاهزة للمراجعة وتحديد الشروط المالية.`
        : `متبقي ${docDays} يوماً على الانتهاء. جهز متطلبات التجديد والوثائق المساندة مسبقاً.`;
      recommendedAction = isContract ? 'مراجعة وتجديد العقد' : 'تجديد الآن';
    } else if (docDays <= 60) {
      alertWindow = '60_days';
      urgencyLevel = 'medium';
      alertStageLabel = 'تنبيه مبكر (60 يوماً)';
      badgeBg = 'bg-blue-50 text-blue-900';
      badgeText = 'text-blue-900 font-semibold';
      badgeBorder = 'border-blue-200';
      countdownColor = 'text-blue-700 font-semibold';
      proactiveAdvice = `متبقي ${docDays} يوماً على انتهاء المستند. تنبيه مبكر للمتابعة والتخطيط المالي وتفادي انتهاء الصلاحية المفاجئ.`;
      recommendedAction = 'تجديد الآن';
    }

    const dedupKey = getDedupKey(doc.title, doc.documentNumber, doc.branchId, doc.authority);
    if (processedKeys.has(dedupKey)) {
      continue; // Deduplicate
    }
    processedKeys.add(dedupKey);

    const branch = branches.find(b => b.id === doc.branchId);

    alertItems.push({
      id: `alert-doc-${doc.id}`,
      sourceType: 'document',
      sourceId: doc.id,
      establishmentId: establishment.id,
      branchId: doc.branchId,
      branchName: doc.branchName || branch?.name || 'المقر الرئيسي',
      title: doc.title,
      authority: doc.authority || 'الجهة المصدرة',
      authorityLogo: isContract ? '📄' : '📁',
      documentNumber: doc.documentNumber,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      daysRemaining: docDays,
      alertWindow,
      urgencyLevel,
      category: doc.category,
      costGovEstimated: doc.renewalDraftProposal?.proposedAnnualAmountSAR || 500,
      costSabbaqEstimated: 350,
      isMandatory: doc.isMandatory !== false,
      isRecurring: doc.isRecurring,
      renewalDraftProposal: doc.renewalDraftProposal,
      recommendedAction,
      proactiveAdvice,
      alertStageLabel,
      countdownColor,
      badgeBg,
      badgeText,
      badgeBorder,
      notificationChannels: doc.alertConfig?.channels || ['in_app', 'whatsapp', 'email'],
      lastNotifiedAt: doc.alertConfig?.lastAlertSentAt || new Date().toISOString().split('T')[0]
    });
  }

  // 3. Strict Auto-sorting Order:
  // 1. Expired (منتهي الصلاحية)
  // 2. 7_days (حرج خلال 7 أيام)
  // 3. 30_days (تنبيه استباقي 30 يوماً)
  // 4. 60_days (تنبيه مبكر 60 يوماً)
  // 5. safe (سارٍ ومنتظم)
  // Within each window, sort by daysRemaining ascending (closest to expire first)
  const windowSortRank = (item: ProactiveAlertItem): number => {
    if (item.alertWindow === 'expired' || item.daysRemaining < 0) return 1;
    if (item.alertWindow === '7_days' || (item.daysRemaining >= 0 && item.daysRemaining <= 7)) return 2;
    if (item.alertWindow === '30_days' || (item.daysRemaining > 7 && item.daysRemaining <= 30)) return 3;
    if (item.alertWindow === '60_days' || (item.daysRemaining > 30 && item.daysRemaining <= 60)) return 4;
    return 5;
  };

  alertItems.sort((a, b) => {
    const rankA = windowSortRank(a);
    const rankB = windowSortRank(b);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return a.daysRemaining - b.daysRemaining;
  });

  const count60Days = alertItems.filter(i => i.alertWindow === '60_days').length;
  const count30Days = alertItems.filter(i => i.alertWindow === '30_days').length;
  const count7Days = alertItems.filter(i => i.alertWindow === '7_days').length;
  const countExpired = alertItems.filter(i => i.alertWindow === 'expired').length;
  const countSafe = alertItems.filter(i => i.alertWindow === 'safe').length;

  return {
    totalAnalyzed: estLicenses.length + estDocs.length,
    totalAlerts: alertItems.length,
    count60Days,
    count30Days,
    count7Days,
    countExpired,
    countSafe,
    criticalUrgentCount: count7Days + countExpired,
    items: alertItems,
  };
}

/**
 * Builds formatted WhatsApp message text for a specific proactive alert
 */
export function buildProactiveWhatsAppMessage(
  alert: ProactiveAlertItem, 
  establishment: Establishment
): string {
  const urgencyWord = alert.daysRemaining <= 7 ? '🚨 تنبيه استباقي عاجل جداً' : alert.daysRemaining <= 30 ? '⚠️ تنبيه استباقي تشغيلي' : 'ℹ️ تنبيه استباقي مبكر';
  
  const text = `${urgencyWord} - منصة سبّاق للامتثال
--------------------------------
المنشأة: ${establishment.name}
الوثيقة / الترخيص: ${alert.title}
الجهة: ${alert.authority}
الفرع: ${alert.branchName || 'الرئيسي'}
رقم الوثيقة: ${alert.documentNumber}
تاريخ الانتهاء: ${alert.expiryDate}
الحالة: متبقي (${alert.daysRemaining > 0 ? alert.daysRemaining + ' يوماً' : 'منتهي الصلاحية'})
--------------------------------
التوصية الذكية:
${alert.proactiveAdvice}

الإجراء المقترح: ${alert.recommendedAction}
يمكنك التجديد ومتابعة الطلب عبر منصة سبّاق: https://sabbaq.sa`;

  return encodeURIComponent(text);
}
