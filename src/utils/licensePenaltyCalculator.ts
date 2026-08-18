import { 
  License, 
  ComplianceRule, 
  LicensePenaltyEvaluation, 
  LicensesFineReport 
} from '../types';
import { COMPLIANCE_RULES } from '../data/complianceData';

/**
 * Normalizes a date to start-of-day (UTC/local) for accurate day difference calculations.
 */
function normalizeDate(dateInput: Date | string): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  // If invalid date, fallback to now
  if (isNaN(d.getTime())) return new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Matches a given license against the predefined COMPLIANCE_RULES using authority,
 * title, requirement name, and domain-specific keywords.
 */
export function matchComplianceRuleForLicense(
  license: License, 
  rules: ComplianceRule[] = COMPLIANCE_RULES
): ComplianceRule {
  const licName = (license.name || '').toLowerCase();
  const licAuth = (license.authority || '').toLowerCase();
  const licNotes = (license.notes || '').toLowerCase();
  const combinedText = `${licName} ${licAuth} ${licNotes}`;

  // 1. Match by applicableKeywords on penaltyRule
  for (const rule of rules) {
    if (rule.penaltyRule?.applicableKeywords) {
      const hasKeywordMatch = rule.penaltyRule.applicableKeywords.some(kw => 
        combinedText.includes(kw.toLowerCase())
      );
      if (hasKeywordMatch) {
        return rule;
      }
    }
  }

  // 2. Match by rule title or requirement name
  for (const rule of rules) {
    if (rule.requirementName && combinedText.includes(rule.requirementName.toLowerCase())) {
      return rule;
    }
    if (rule.title && combinedText.includes(rule.title.toLowerCase())) {
      return rule;
    }
  }

  // 3. Match by authority keywords
  for (const rule of rules) {
    if (rule.authority && licAuth.includes(rule.authority.toLowerCase())) {
      return rule;
    }
  }

  // 4. Default fallback rule if no exact match found
  return rules[0] || {
    id: 'rule-generic-fallback',
    title: 'الامتثال للتراخيص النظامية العامة',
    description: 'الالتزام بسريان التراخيص والعقود المعتمدة لمزاولة النشاط الاقتصادي',
    activityCategory: 'عام',
    authority: license.authority || 'الجهة الحكومية المختصة',
    isMandatory: true,
    riskPoints: 25,
    riskReason: 'مزاولة النشاط برخصة منتهية يترتب عليه غرامة عدم امتثال فورية وإيقاف الخدمات.',
    penaltyRule: {
      baseFine: 3000,
      dailyFineRate: 50,
      maxFineCap: 15000,
      gracePeriodDays: 0,
      applicableKeywords: [],
      legalCitation: 'لائحة الجزاءات والغرامات النظامية المعتمدة',
      penaltyFormulaDescription: 'غرامة أساسية 3,000 ر.س + 50 ر.س/يوم تأخير',
      severity: 'medium',
    }
  };
}

/**
 * Evaluates the penalty for a single license by comparing its expiryDate against the reference date.
 */
export function evaluateLicensePenalty(
  license: License,
  rules: ComplianceRule[] = COMPLIANCE_RULES,
  referenceDate: Date | string = new Date()
): LicensePenaltyEvaluation {
  const curDate = normalizeDate(referenceDate);
  const expDate = normalizeDate(license.expiryDate);

  const diffMs = expDate.getTime() - curDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = diffDays < 0 || license.status === 'expired';
  const daysExpired = isExpired ? Math.max(1, Math.abs(diffDays)) : 0;
  const daysRemaining = diffDays;

  const matchedRule = matchComplianceRuleForLicense(license, rules);
  const penaltyRule = matchedRule.penaltyRule || {
    baseFine: 3000,
    dailyFineRate: 50,
    maxFineCap: 15000,
    gracePeriodDays: 0,
    applicableKeywords: [],
    legalCitation: matchedRule.sourceLaw || 'لائحة الجزاءات النظامية',
    penaltyFormulaDescription: 'غرامة أساسية 3,000 ر.س + 50 ر.س/يوم',
    severity: 'medium',
  };

  let daysBeyondGrace = 0;
  let dailyFineAccumulated = 0;
  let totalEstimatedFine = 0;

  if (isExpired) {
    daysBeyondGrace = Math.max(0, daysExpired - penaltyRule.gracePeriodDays);
    dailyFineAccumulated = daysBeyondGrace * penaltyRule.dailyFineRate;
    const rawFine = penaltyRule.baseFine + dailyFineAccumulated;
    totalEstimatedFine = penaltyRule.maxFineCap 
      ? Math.min(penaltyRule.maxFineCap, rawFine)
      : rawFine;
  }

  // Projected fine if near_expiry license stays expired for 15 days
  const projectedFineIfExpired = penaltyRule.baseFine + (penaltyRule.dailyFineRate * 15);

  let severity: 'critical' | 'high' | 'medium' | 'low' = penaltyRule.severity;
  if (isExpired) {
    severity = totalEstimatedFine >= 10000 ? 'critical' : 'high';
  } else if (daysRemaining <= 15) {
    severity = 'high';
  } else if (daysRemaining <= 30) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  let actionRequired = 'الترخيص سارٍ ومطابق للاشتراطات.';
  if (isExpired) {
    actionRequired = `تقديم طلب تجديد فوري لـ (${license.name}) وإيقاف تراكم الغرامة اليومية (${penaltyRule.dailyFineRate} ر.س/يوم).`;
  } else if (daysRemaining <= 15) {
    actionRequired = `متبقي ${daysRemaining} يوماً فقط - بدء التجديد فوراً لتفادي غرامة أولية قدرها ${penaltyRule.baseFine.toLocaleString()} ر.س.`;
  } else if (daysRemaining <= 30) {
    actionRequired = `جدولة التجديد الاستباقي قبل تاريخ ${license.expiryDate}.`;
  }

  return {
    licenseId: license.id,
    licenseName: license.name,
    licenseNumber: license.licenseNumber,
    authority: license.authority,
    branchName: license.branchName,
    establishmentId: license.establishmentId,
    issueDate: license.issueDate,
    expiryDate: license.expiryDate,
    currentDate: curDate.toISOString().split('T')[0],
    isExpired,
    daysExpired,
    daysRemaining,
    matchedRuleId: matchedRule.id,
    matchedRuleTitle: matchedRule.title,
    baseFine: penaltyRule.baseFine,
    dailyFineAccumulated,
    daysBeyondGrace,
    totalEstimatedFine,
    projectedFineIfExpired,
    gracePeriodDays: penaltyRule.gracePeriodDays,
    legalCitation: penaltyRule.legalCitation,
    penaltyFormulaDescription: penaltyRule.penaltyFormulaDescription,
    severity,
    actionRequired,
  };
}

/**
 * Automated utility that compares all licenses' expiry dates against currentDate,
 * applies predefined financial penalty rules from COMPLIANCE_RULES, and returns
 * a detailed report with calculated estimated fines and projected risks.
 */
export function calculateAllLicensesEstimatedFines(
  licenses: License[],
  rules: ComplianceRule[] = COMPLIANCE_RULES,
  referenceDate: Date | string = new Date()
): LicensesFineReport {
  const curDate = normalizeDate(referenceDate);
  const curDateStr = curDate.toISOString().split('T')[0];

  const evaluatedLicenses = licenses.map(lic => 
    evaluateLicensePenalty(lic, rules, curDate)
  );

  let totalCurrentEstimatedFines = 0;
  let totalProjectedFines = 0;
  let expiredLicensesCount = 0;
  let nearExpiryLicensesCount = 0;
  let activeCompliantLicensesCount = 0;

  const breakdownByAuthority: Record<string, { count: number; fines: number; projectedFines: number }> = {};
  const criticalActions: string[] = [];

  for (const item of evaluatedLicenses) {
    if (!breakdownByAuthority[item.authority]) {
      breakdownByAuthority[item.authority] = { count: 0, fines: 0, projectedFines: 0 };
    }
    breakdownByAuthority[item.authority].count += 1;

    if (item.isExpired) {
      expiredLicensesCount += 1;
      totalCurrentEstimatedFines += item.totalEstimatedFine;
      breakdownByAuthority[item.authority].fines += item.totalEstimatedFine;
      criticalActions.push(
        `تجديد عاجل: ${item.licenseName} (منتهي منذ ${item.daysExpired} يوم) - غرامة مستحقة تقديرية: ${item.totalEstimatedFine.toLocaleString()} ر.س`
      );
    } else if (item.daysRemaining <= 30) {
      nearExpiryLicensesCount += 1;
      totalProjectedFines += item.projectedFineIfExpired;
      breakdownByAuthority[item.authority].projectedFines += item.projectedFineIfExpired;
      if (item.daysRemaining <= 15) {
        criticalActions.push(
          `إنذار وشيك: ${item.licenseName} (متبقي ${item.daysRemaining} يوم) - تفادي غرامة ${item.baseFine.toLocaleString()} ر.س`
        );
      }
    } else {
      activeCompliantLicensesCount += 1;
    }
  }

  // Find license with highest financial risk
  const sortedByFine = [...evaluatedLicenses].sort((a, b) => b.totalEstimatedFine - a.totalEstimatedFine);
  const highestRiskLicense = sortedByFine.length > 0 && sortedByFine[0].totalEstimatedFine > 0 
    ? sortedByFine[0] 
    : undefined;

  return {
    currentDate: curDateStr,
    totalLicensesChecked: licenses.length,
    expiredLicensesCount,
    nearExpiryLicensesCount,
    activeCompliantLicensesCount,
    totalCurrentEstimatedFines,
    totalProjectedFines,
    breakdownByAuthority,
    evaluatedLicenses,
    highestRiskLicense,
    criticalActions: criticalActions.length > 0 
      ? criticalActions 
      : ['جميع التراخيص المفحوصة سارية وممتثلة لقواعد الامتثال الحكومي.'],
  };
}
