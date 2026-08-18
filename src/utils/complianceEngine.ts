import { 
  License, 
  DocumentItem, 
  ComplianceViolation, 
  MasterOrder, 
  Establishment, 
  RiskAssessment, 
  RiskFactor,
  ComplianceRule,
  LicensePenaltyEvaluation,
  LicensesFineReport 
} from '../types';
import { COMPLIANCE_RULES } from '../data/complianceData';
import { 
  calculateAllLicensesEstimatedFines, 
  evaluateLicensePenalty, 
  matchComplianceRuleForLicense 
} from './licensePenaltyCalculator';

export { 
  calculateAllLicensesEstimatedFines, 
  evaluateLicensePenalty, 
  matchComplianceRuleForLicense 
};

export function calculateEstablishmentRisk(
  establishment: Establishment,
  licenses: License[],
  documents: DocumentItem[],
  violations: ComplianceViolation[],
  orders: MasterOrder[],
  rules: ComplianceRule[] = COMPLIANCE_RULES,
  currentDate: Date | string = new Date()
): RiskAssessment {
  const estLicenses = licenses.filter(l => l.establishmentId === establishment.id);
  const estDocs = documents.filter(d => d.establishmentId === establishment.id);
  const estViolations = violations.filter(v => v.establishmentId === establishment.id && v.status !== 'rectified' && v.status !== 'paid');
  const estOrders = orders.filter(o => o.establishmentId === establishment.id);

  const factors: RiskFactor[] = [];
  let potentialFines = 0;

  // Run automated license penalty calculation
  const licenseFineReport = calculateAllLicensesEstimatedFines(estLicenses, rules, currentDate);
  potentialFines += licenseFineReport.totalCurrentEstimatedFines;

  // 1. Mandatory License Expiry Risk (Max 35 points)
  let licensePoints = 0;
  const expiredLicenses = estLicenses.filter(l => l.status === 'expired' || l.daysRemaining < 0);
  const urgentLicenses = estLicenses.filter(l => l.status === 'near_expiry' && l.daysRemaining >= 0 && l.daysRemaining <= 15);
  const warningLicenses = estLicenses.filter(l => l.status === 'near_expiry' && l.daysRemaining > 15 && l.daysRemaining <= 30);

  if (expiredLicenses.length > 0) {
    const pts = Math.min(35, 25 + expiredLicenses.length * 5);
    licensePoints += pts;
    
    // Detailed citation from evaluated report
    const expiredEvals = licenseFineReport.evaluatedLicenses.filter(e => e.isExpired);
    const finesDesc = expiredEvals.map(e => `${e.licenseName}: ${formatSAR(e.totalEstimatedFine)}`).join('، ');

    factors.push({
      id: 'factor-lic-expired',
      factor: `تراخيص منتهية الصلاحية (${expiredLicenses.length}) - غرامات مرصودة ${formatSAR(licenseFineReport.totalCurrentEstimatedFines)}`,
      points: pts,
      maxPoints: 35,
      reason: `يوجد ${expiredLicenses.length} ترخيص/عقد منتهي مثل (${expiredLicenses.map(l => l.name).join('، ')}). الغرامات التقديرية المحتسبة وفق اللوائح: [${finesDesc}].`,
      severity: 'critical',
      actionText: 'تجديد التراخيص المنتهية فوراً',
      actionType: 'renew_license',
      targetId: expiredLicenses[0]?.id,
    });
  } else if (urgentLicenses.length > 0) {
    const pts = Math.min(30, 18 + urgentLicenses.length * 6);
    licensePoints += pts;
    potentialFines += licenseFineReport.totalProjectedFines > 0 ? licenseFineReport.totalProjectedFines : urgentLicenses.length * 3000;
    factors.push({
      id: 'factor-lic-urgent',
      factor: `تراخيص تنتهي خلال أقل من 15 يوماً (${urgentLicenses.length})`,
      points: pts,
      maxPoints: 35,
      reason: `رخصة (${urgentLicenses.map(l => `${l.name} - متبقي ${l.daysRemaining} يوم`).join('، ')}) قريبة جداً من الانتهاء دون إتمام التجديد. الغرامات المتوقعة عند الانتهاء: ${formatSAR(licenseFineReport.totalProjectedFines)}.`,
      severity: 'high',
      actionText: 'بدء طلب التجديد الاستباقي',
      actionType: 'renew_license',
      targetId: urgentLicenses[0]?.id,
    });
  } else if (warningLicenses.length > 0) {
    const pts = Math.min(15, 8 + warningLicenses.length * 4);
    licensePoints += pts;
    factors.push({
      id: 'factor-lic-warn',
      factor: `تراخيص تستحق التجديد خلال 30 يوماً (${warningLicenses.length})`,
      points: pts,
      maxPoints: 35,
      reason: `ينصح ببدء إجراءات التجديد لـ (${warningLicenses.map(l => l.name).join('، ')}) لتفادي التأخيرات الإدارية.`,
      severity: 'medium',
      actionText: 'جدولة طلب التجديد',
      actionType: 'renew_license',
      targetId: warningLicenses[0]?.id,
    });
  }

  // 2. Missing or Expired Mandatory Documents (Max 20 points)
  let docPoints = 0;
  const expiredDocs = estDocs.filter(d => d.status === 'expired');
  const expiringDocs = estDocs.filter(d => d.status === 'expiring_soon');

  if (expiredDocs.length > 0) {
    const pts = Math.min(20, 12 + expiredDocs.length * 4);
    docPoints += pts;
    factors.push({
      id: 'factor-doc-expired',
      factor: `مستندات وشهادات منتهية بالأرشيف (${expiredDocs.length})`,
      points: pts,
      maxPoints: 20,
      reason: `مستندات رئيسية منتهية (${expiredDocs.map(d => d.title).join('، ')}) تعطل إصدار وتجديد التراخيص البلدية والعمالية.`,
      severity: 'high',
      actionText: 'تحديث ورفع المستندات الجديدة',
      actionType: 'upload_doc',
      targetId: expiredDocs[0]?.id,
    });
  } else if (expiringDocs.length > 0) {
    const pts = Math.min(10, expiringDocs.length * 4);
    docPoints += pts;
    factors.push({
      id: 'factor-doc-expiring',
      factor: `شهادات ومستندات تقترب من الانتهاء (${expiringDocs.length})`,
      points: pts,
      maxPoints: 20,
      reason: `المستندات (${expiringDocs.map(d => d.title).join('، ')}) تستلزم التحديث لتفادي توقف الطلبات.`,
      severity: 'low',
      actionText: 'مراجعة الأرشيف الرقمي',
      actionType: 'upload_doc',
    });
  }

  // 3. Periodic Obligations & Regulatory Deadlines (Max 15 points)
  let obligationPoints = 0;
  // e.g. ZATCA returns, health certs, Saudization threshold
  if (establishment.saudizationPercentage < 30) {
    const pts = 12;
    obligationPoints += pts;
    factors.push({
      id: 'factor-saudization',
      factor: 'مؤشر نسبة التوطين (نطاقات) يحتاج تحسين',
      points: pts,
      maxPoints: 15,
      reason: `نسبة السعودة الحالية ${establishment.saudizationPercentage.toFixed(1)}% قد تؤثر على إصدار التأشيرات وتجديد رخص العمل في منصة قوى.`,
      severity: 'medium',
      actionText: 'مراجعة ملف قوى ونطاقات',
      actionType: 'periodic_obligation',
    });
  }

  // 4. Stalled or Delayed Orders (Max 10 points)
  let orderPoints = 0;
  const awaitingApprovalOrDocs = estOrders.filter(o => o.status === 'awaiting_approval' || o.status === 'awaiting_docs');
  if (awaitingApprovalOrDocs.length > 0) {
    const pts = Math.min(10, awaitingApprovalOrDocs.length * 5);
    orderPoints += pts;
    factors.push({
      id: 'factor-orders-stalled',
      factor: `طلبات تنفيذ متوقفة بانتظار إجراء العميل (${awaitingApprovalOrDocs.length})`,
      points: pts,
      maxPoints: 10,
      reason: `يوجد طلبات بانتظار اعتماد عرض السعر أو رفع النواقص (${awaitingApprovalOrDocs.map(o => o.orderNumber).join('، ')}) مما يؤخر إصدار التراخيص.`,
      severity: 'medium',
      actionText: 'اعتماد العروض وسداد الرسوم',
      actionType: 'handle_violation',
      targetId: awaitingApprovalOrDocs[0]?.id,
    });
  }

  // 5. Active Government Violations (Max 10 points)
  let violationPoints = 0;
  if (estViolations.length > 0) {
    const pts = Math.min(10, estViolations.length * 5);
    violationPoints += pts;
    const totalViolFines = estViolations.reduce((sum, v) => sum + v.fineAmount, 0);
    potentialFines += totalViolFines;
    factors.push({
      id: 'factor-violations',
      factor: `مخالفات حكومية مسجلة غير مغلقة (${estViolations.length})`,
      points: pts,
      maxPoints: 10,
      reason: `إجمالي غرامات المخالفات القائمة ${totalViolFines.toLocaleString()} ر.س صادرة من (${estViolations.map(v => v.authority).join('، ')}).`,
      severity: 'critical',
      actionText: 'تقديم اعتراض أو خطة تصحيح',
      actionType: 'handle_violation',
      targetId: estViolations[0]?.id,
    });
  }

  // 6. Profile & Unresponsive alerts (Max 10 points)
  let profilePoints = 0;
  if (!establishment.unifiedNumber || !establishment.contactPhone) {
    profilePoints += 5;
    factors.push({
      id: 'factor-profile-missing',
      factor: 'بيانات المنشأة أو الرقم الموحد 700 غير مكتمل',
      points: 5,
      maxPoints: 5,
      reason: 'نقص البيانات الأساسية قد يعيق الربط الآلي مع منصات نفاذ وبلدي.',
      severity: 'low',
      actionText: 'استكمال بيانات الملف الموحد',
      actionType: 'complete_profile',
    });
  }

  const totalScore = Math.min(100, licensePoints + docPoints + obligationPoints + orderPoints + violationPoints + profilePoints);

  let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (totalScore >= 80) level = 'critical';
  else if (totalScore >= 60) level = 'high';
  else if (totalScore >= 30) level = 'medium';

  const recommendedActions: string[] = [];
  if (expiredLicenses.length > 0) {
    recommendedActions.push(`تجديد فوري لـ ${expiredLicenses.length} ترخيص منتهي لتفادي الإغلاق أو سحب الترخيص.`);
  }
  if (urgentLicenses.length > 0) {
    recommendedActions.push(`إطلاق طلبات تجديد للرخص البلدية وتراخيص السلامة التي تنتهي خلال أقل من أسبوعين.`);
  }
  if (estViolations.length > 0) {
    recommendedActions.push(`صياغة لوائح اعتراض وتصحيح الملاحظات البلدية والدفاع المدني قبل انتهاء مهلة الـ 14 يوماً.`);
  }
  if (awaitingApprovalOrDocs.length > 0) {
    recommendedActions.push('مراجعة لوحة "المطلوب منك اليوم" للموافقة على عروض الأسعار واستكمال المستندات.');
  }

  return {
    overallScore: totalScore,
    level,
    factors,
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : ['جميع التراخيص والمستندات محدثة وسارية بنجاح!'],
    potentialFinesEstimated: potentialFines,
    lastCalculatedAt: new Date().toISOString(),
  };
}

export function getRiskLevelBadge(level: 'low' | 'medium' | 'high' | 'critical') {
  switch (level) {
    case 'critical':
      return { label: 'حرج جداً', bg: 'bg-red-500/10 text-red-700 border-red-200', dot: 'bg-red-600' };
    case 'high':
      return { label: 'مرتفع', bg: 'bg-amber-500/10 text-amber-800 border-amber-200', dot: 'bg-amber-600' };
    case 'medium':
      return { label: 'متوسط', bg: 'bg-yellow-500/10 text-yellow-800 border-yellow-200', dot: 'bg-yellow-600' };
    case 'low':
    default:
      return { label: 'منخفض (آمن)', bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' };
  }
}

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'new':
      return { label: 'طلب جديد', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'awaiting_contact':
      return { label: 'بانتظار التواصل', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'awaiting_docs':
      return { label: 'بانتظار مستندات', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'awaiting_approval':
      return { label: 'بانتظار موافقة العميل', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'awaiting_payment':
      return { label: 'بانتظار الدفع', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    case 'in_progress':
      return { label: 'قيد التنفيذ', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
    case 'submitted_to_gov':
      return { label: 'مقدم للجهة الحكومية', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'awaiting_gov_reply':
      return { label: 'بانتظار رد الجهة', bg: 'bg-violet-50 text-violet-700 border-violet-200' };
    case 'completed':
      return { label: 'مكتمل بنجاح', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'cancelled':
      return { label: 'ملغي', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function getLicenseStatusBadge(status: string, daysRemaining: number) {
  if (status === 'expired' || daysRemaining < 0) {
    return { 
      label: `منتهي (${Math.abs(daysRemaining)} يوم)`, 
      bg: 'bg-red-50 text-red-700 border-red-200',
      badgeColor: 'text-red-700 bg-red-100',
      icon: 'AlertTriangle'
    };
  }
  if (daysRemaining <= 15) {
    return { 
      label: `ينتهي خلال ${daysRemaining} يوم`, 
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeColor: 'text-amber-800 bg-amber-100',
      icon: 'Clock'
    };
  }
  if (daysRemaining <= 30) {
    return { 
      label: `ينتهي خلال ${daysRemaining} يوم`, 
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      badgeColor: 'text-yellow-800 bg-yellow-100',
      icon: 'Clock'
    };
  }
  return { 
    label: `ساري (${daysRemaining} يوم)`, 
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeColor: 'text-emerald-700 bg-emerald-100',
    icon: 'CheckCircle'
  };
}

export function formatSAR(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount) + ' ر.س';
}

/**
 * دالة util لفحص ومسح قائمة التراخيص، ومقارنة تاريخ الانتهاء (expiryDate) بالتاريخ الحالي،
 * ثم حساب الغرامة التقديرية بدقة بناءً على القواعد والجزاءات المحددة في COMPLIANCE_RULES.
 *
 * @param licenses قائمة التراخيص المراد فحصها
 * @param rules قائمة قواعد الامتثال (افتراضياً COMPLIANCE_RULES)
 * @param currentDate التاريخ المرجعي للفحص (افتراضياً تاريخ اليوم)
 * @returns تقرير مفصل يشمل إجمالي الغرامات التقديرية، التراخيص المنتهية، وتحليل كل ترخيص وسنده النظامي
 */
export function scanLicensesAndCalculateEstimatedFines(
  licenses: License[],
  rules: ComplianceRule[] = COMPLIANCE_RULES,
  currentDate: Date | string = new Date()
): LicensesFineReport {
  return calculateAllLicensesEstimatedFines(licenses, rules, currentDate);
}

/**
 * دالة مساعدة لحساب إجمالي الغرامات التقديرية المستحقة فوراً للتراخيص المنتهية كرقم
 */
export function calculateTotalEstimatedFines(
  licenses: License[],
  rules: ComplianceRule[] = COMPLIANCE_RULES,
  currentDate: Date | string = new Date()
): number {
  const report = scanLicensesAndCalculateEstimatedFines(licenses, rules, currentDate);
  return report.totalCurrentEstimatedFines;
}

