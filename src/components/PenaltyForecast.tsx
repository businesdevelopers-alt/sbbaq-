import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Zap,
  DollarSign,
  ArrowRight,
  Sparkles,
  Building2,
  Flame,
  Users,
  FileText,
  Scale,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight,
  Percent,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  Establishment, 
  License, 
  ComplianceViolation, 
  DocumentItem, 
  MasterOrder 
} from '../types';
import { formatSAR, getRiskLevelBadge } from '../utils/complianceEngine';
import { calculateAllLicensesEstimatedFines, evaluateLicensePenalty } from '../utils/licensePenaltyCalculator';

interface PenaltyForecastProps {
  establishment: Establishment;
  licenses: License[];
  violations: ComplianceViolation[];
  documents: DocumentItem[];
  orders?: MasterOrder[];
  onRenewLicense?: (licenseId: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  onOpenObjectionModal?: (violation: ComplianceViolation) => void;
}

export const PenaltyForecast: React.FC<PenaltyForecastProps> = ({
  establishment,
  licenses,
  violations,
  documents,
  orders = [],
  onRenewLicense,
  onConsultSpecialist,
  onOpenObjectionModal,
}) => {
  // Selected Time Horizon for Forecast (in days)
  const [forecastDays, setForecastDays] = useState<number>(60);
  const [selectedInspectionRisk, setSelectedInspectionRisk] = useState<'normal' | 'high' | 'intensive'>('high');
  const [activeAuthorityFilter, setActiveAuthorityFilter] = useState<'all' | 'balady' | 'salamah' | 'qiwa' | 'commerce'>('all');

  // Baseline active licenses and violations for this establishment
  const estLicenses = licenses.filter(l => l.establishmentId === establishment.id);
  const estViolations = violations.filter(v => v.establishmentId === establishment.id && v.status !== 'rectified');

  // Current fines evaluation
  const licensesReport = useMemo(() => {
    return calculateAllLicensesEstimatedFines(estLicenses);
  }, [estLicenses]);

  // Current active confirmed violation total
  const currentActiveViolationsFine = estViolations.reduce((sum, v) => sum + v.fineAmount, 0);
  const currentLicensesFine = licensesReport.totalCurrentEstimatedFines;
  const currentTotalFines = currentActiveViolationsFine + currentLicensesFine;

  // Real-time calculation of forecast trajectory curve over chosen time horizon
  const forecastTimeline = useMemo(() => {
    // Generate data points at intervals: 0, 7, 15, 30, 45, 60, 90, 120, 180, 365 days
    const steps = [0, 7, 15, 30, 45, 60, 90, 180, 365].filter(d => d <= Math.max(forecastDays, 30) || d === forecastDays);
    if (!steps.includes(forecastDays)) {
      steps.push(forecastDays);
      steps.sort((a, b) => a - b);
    }

    const today = new Date();

    return steps.map((dayOffset) => {
      const futureDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dateLabel = dayOffset === 0 
        ? 'اليوم (الفعلي)' 
        : `بعد ${dayOffset} يوم`;

      // 1. Municipal Licenses fines projection on futureDate
      let baladyFines = 0;
      let salamahFines = 0;
      let qiwaFines = 0;
      let commerceFines = 0;

      estLicenses.forEach((lic) => {
        const evalResult = evaluateLicensePenalty(lic, undefined, futureDate);
        if (evalResult.isExpired) {
          const authLower = (lic.authority || '').toLowerCase();
          if (authLower.includes('بلدي') || authLower.includes('أمانة') || lic.name.includes('بلدي')) {
            baladyFines += evalResult.totalEstimatedFine;
          } else if (authLower.includes('دفاع') || authLower.includes('سلامة')) {
            salamahFines += evalResult.totalEstimatedFine;
          } else if (authLower.includes('موارد') || authLower.includes('عمل')) {
            qiwaFines += evalResult.totalEstimatedFine;
          } else {
            commerceFines += evalResult.totalEstimatedFine;
          }
        }
      });

      // 2. Violations escalation logic:
      // If days surpass correction grace (daysLeftToCorrect), double fine applies after 30 days
      estViolations.forEach((viol) => {
        let fine = viol.fineAmount;
        if (dayOffset > viol.daysLeftToCorrect) {
          // Additional late interest / penalty doubling for municipal or labor non-compliance
          if (dayOffset >= 30) {
            fine = fine * 2; // Doubled fine for unrectified violation
          }
        }
        if (viol.authority.includes('بلدي') || viol.authority.includes('أمانة')) {
          baladyFines += fine;
        } else if (viol.authority.includes('دفاع') || viol.authority.includes('سلامة')) {
          salamahFines += fine;
        } else if (viol.authority.includes('موارد') || viol.authority.includes('قوى')) {
          qiwaFines += fine;
        } else {
          commerceFines += fine;
        }
      });

      // 3. Saudization & Wage Protection delay escalation
      if (establishment.saudizationPercentage < 25 && dayOffset >= 30) {
        qiwaFines += 10000; // Red/Yellow Nitaqat administrative fine
      }
      if (dayOffset >= 60 && establishment.saudizationPercentage < 20) {
        qiwaFines += 10000; // Additional stoppage fine
      }

      // Inspection probability multiplier
      const inspectionMultiplier = selectedInspectionRisk === 'intensive' ? 1.25 : selectedInspectionRisk === 'high' ? 1.1 : 1.0;
      
      const totalProjected = Math.round((baladyFines + salamahFines + qiwaFines + commerceFines) * inspectionMultiplier);
      const preventedCostWithSabbaq = 0; // If fully compliant

      return {
        day: dayOffset,
        dateLabel,
        futureDateStr: futureDate.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalProjected,
        baladyFines: Math.round(baladyFines * inspectionMultiplier),
        salamahFines: Math.round(salamahFines * inspectionMultiplier),
        qiwaFines: Math.round(qiwaFines * inspectionMultiplier),
        commerceFines: Math.round(commerceFines * inspectionMultiplier),
        preventedCostWithSabbaq,
      };
    });
  }, [estLicenses, estViolations, establishment.saudizationPercentage, forecastDays, selectedInspectionRisk]);

  // Forecast at the exact selected horizon
  const targetForecast = forecastTimeline.find(t => t.day === forecastDays) || forecastTimeline[forecastTimeline.length - 1];
  const projectedFinesAtHorizon = targetForecast ? targetForecast.totalProjected : currentTotalFines;
  const fineEscalationDelta = projectedFinesAtHorizon - currentTotalFines;
  const growthMultiplier = currentTotalFines > 0 
    ? ((projectedFinesAtHorizon / currentTotalFines) * 100 - 100).toFixed(0) 
    : '0';

  // Cost of Compliance (Immediate Renewal via Sabbaq) vs. Projected Fines
  const complianceCostEstimation = useMemo(() => {
    // Sum estimated renewal costs for expired/near-expiry licenses
    const expiredOrNear = estLicenses.filter(l => l.status === 'expired' || l.status === 'near_expiry');
    const totalGovRenewalFees = expiredOrNear.reduce((sum, l) => sum + (l.costGov || 800), 0);
    const totalSabbaqServiceFees = expiredOrNear.reduce((sum, l) => sum + (l.costSabbaq || 450), 0);
    const totalCostToFix = totalGovRenewalFees + totalSabbaqServiceFees;
    const netSavings = Math.max(0, projectedFinesAtHorizon - totalCostToFix);
    const roiPercentage = totalCostToFix > 0 ? Math.round((netSavings / totalCostToFix) * 100) : 0;

    return {
      totalGovRenewalFees,
      totalSabbaqServiceFees,
      totalCostToFix,
      netSavings,
      roiPercentage,
      itemCount: expiredOrNear.length,
    };
  }, [estLicenses, projectedFinesAtHorizon]);

  // Upcoming Critical Regulatory Milestones
  const upcomingMilestones = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      daysRemaining: number;
      title: string;
      authority: string;
      type: 'license_expiry' | 'grace_end' | 'objection_end' | 'fine_double';
      fineRisk: number;
      severity: 'critical' | 'high' | 'medium';
      actionLabel: string;
      licenseId?: string;
      violation?: ComplianceViolation;
    }> = [];

    // 1. Licenses expiry milestones
    estLicenses.forEach(lic => {
      const evalRes = evaluateLicensePenalty(lic);
      if (lic.status === 'expired') {
        list.push({
          id: `lic-${lic.id}`,
          date: lic.expiryDate,
          daysRemaining: -evalRes.daysExpired,
          title: `رخصة منتهية: ${lic.name}`,
          authority: lic.authority,
          type: 'license_expiry',
          fineRisk: evalRes.totalEstimatedFine,
          severity: 'critical',
          actionLabel: 'تجديد فوري لإيقاف الغرامة اليومية',
          licenseId: lic.id,
        });
      } else if (lic.status === 'near_expiry' || evalRes.daysRemaining <= 60) {
        list.push({
          id: `lic-${lic.id}`,
          date: lic.expiryDate,
          daysRemaining: evalRes.daysRemaining,
          title: `اقتراب انتهاء: ${lic.name}`,
          authority: lic.authority,
          type: 'license_expiry',
          fineRisk: evalRes.baseFine,
          severity: evalRes.daysRemaining <= 15 ? 'high' : 'medium',
          actionLabel: 'تجديد استباقي لتفادي الغرامة',
          licenseId: lic.id,
        });
      }
    });

    // 2. Violations grace and objection cutoffs
    estViolations.forEach(viol => {
      if (viol.daysLeftToCorrect > 0) {
        list.push({
          id: `viol-correct-${viol.id}`,
          date: 'خلال ' + viol.daysLeftToCorrect + ' يوم',
          daysRemaining: viol.daysLeftToCorrect,
          title: `انتهاء مهلة تصحيح مخالفة #${viol.violationNumber}`,
          authority: viol.authority,
          type: 'grace_end',
          fineRisk: viol.fineAmount,
          severity: viol.daysLeftToCorrect <= 5 ? 'critical' : 'high',
          actionLabel: 'تصحيح قبل مضاعفة الغرامة',
          violation: viol,
        });
      }
      if (viol.daysLeftToObject > 0) {
        list.push({
          id: `viol-obj-${viol.id}`,
          date: 'خلال ' + viol.daysLeftToObject + ' يوم',
          daysRemaining: viol.daysLeftToObject,
          title: `انقضاء مهلة الاعتراض النظامي #${viol.violationNumber}`,
          authority: viol.authority,
          type: 'objection_end',
          fineRisk: viol.fineAmount,
          severity: viol.daysLeftToObject <= 10 ? 'high' : 'medium',
          actionLabel: 'تقديم لائحة الاعتراض الذكية',
          violation: viol,
        });
      }
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [estLicenses, estViolations]);

  // Custom Chart Tooltip
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-right min-w-[240px] space-y-2.5 font-['Cairo'] text-xs backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.dateLabel} ({data.futureDateStr})</span>
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">إجمالي الغرامات المتوقعة:</span>
              <strong className="text-base font-extrabold text-rose-400">
                {formatSAR(data.totalProjected)}
              </strong>
            </div>

            <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>البلديات والإسكان:</span>
                <span className="text-emerald-400 font-bold">{formatSAR(data.baladyFines)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>الدفاع المدني (سلامة):</span>
                <span className="text-rose-400 font-bold">{formatSAR(data.salamahFines)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>الموارد البشرية (قوى):</span>
                <span className="text-blue-400 font-bold">{formatSAR(data.qiwaFines)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>التجارة وهيئة الزكاة:</span>
                <span className="text-amber-400 font-bold">{formatSAR(data.commerceFines)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs font-semibold px-3 py-1 rounded-full border border-rose-500/30 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>استشراف وتنبؤ الغرامات المالية التراكمية</span>
            </div>
            <h2 className="text-2xl font-bold font-['Cairo']">
              توقع الغرامات والمخاطر المالية المستقبلية
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              نموذج رياضي تنبؤي يستشرف تضاعف الغرامات الحكومية وتراكم رسوم التأخير اليومية في حال عدم تجديد التراخيص أو تأخر معالجة المخالفات عبر الزمن.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onConsultSpecialist?.('استشارة استشرافية لتفادي الغرامات المتوقعة')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>خطة تجميد وتفادي الغرامات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forecasting Control Horizon & Summary Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Horizon Picker Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              اختر المدى الزمني للتوقع المالي (Time Horizon):
            </label>
            <span className="text-[11px] text-slate-500">
              تحديد الفترة الزمنية لمعرفة حجم التراكم المالي ومضاعفة الغرامات في حال عدم اتخاذ إجراء
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { days: 15, label: '15 يوماً (عاجل)' },
              { days: 30, label: '30 يوماً (شهر)' },
              { days: 60, label: '60 يوماً (شهران)' },
              { days: 90, label: '90 يوماً (ربع سنوي)' },
              { days: 180, label: '6 أشهر' },
              { days: 365, label: 'سنة كاملة' },
            ].map(pill => (
              <button
                key={pill.days}
                type="button"
                onClick={() => setForecastDays(pill.days)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  forecastDays === pill.days
                    ? 'bg-slate-900 text-white shadow-xs scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metric High-Impact KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Current Fine vs. Forecasted Fine */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold">الغرامات الفعلية اليوم</span>
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">الحالي</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
              {formatSAR(currentTotalFines)}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              تشمل {estViolations.length} مخالفات مسجلة + غرامات التراخيص المنتهية حالياً
            </p>
          </div>

          {/* Card 2: Projected Escalation at Horizon */}
          <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-rose-800 mb-2">
              <span className="font-bold">التوقع بعد {forecastDays} يوماً</span>
              <span className="text-rose-900 font-extrabold bg-rose-200/80 px-2 py-0.5 rounded">
                +{growthMultiplier}% تصاعد
              </span>
            </div>
            <div className="text-2xl font-extrabold text-rose-700 font-['Cairo']">
              {formatSAR(projectedFinesAtHorizon)}
            </div>
            <p className="text-[11px] text-rose-800 mt-2 font-medium">
              زيادة متوقعة بقيمة <strong>{formatSAR(fineEscalationDelta)}</strong> في حال التأخر
            </p>
          </div>

          {/* Card 3: Financial ROI on Immediate Compliance */}
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-2">
              <span className="font-bold">صافي الوفر عند التجديد الفوري</span>
              <span className="text-emerald-900 font-extrabold bg-emerald-200/80 px-2 py-0.5 rounded">
                وفر {complianceCostEstimation.roiPercentage}%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-['Cairo']">
              {formatSAR(complianceCostEstimation.netSavings)}
            </div>
            <p className="text-[11px] text-emerald-800 mt-2">
              تكلفة تصحيح التراخيص الآن: <strong>{formatSAR(complianceCostEstimation.totalCostToFix)}</strong> فقط
            </p>
          </div>

        </div>

        {/* Predictive Escalation Trajectory Chart */}
        <div className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span>منحنى التراكم والتصاعد المالي للغرامات عبر المدى الزمني (Forecast Curve)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة المسار المتوقع في حال عدم التدخل مقابل مسار الامتثال وتفادي الغرامات
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>مسار تفاقم الغرامات</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>المسار بعد التدخل والتصحيح</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTimeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastEscalationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="forecastCompliantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dateLabel" 
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Cairo' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomForecastTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalProjected" 
                  name="الغرامات المتوقعة" 
                  stroke="#dc2626" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#forecastEscalationGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="preventedCostWithSabbaq" 
                  name="المسار الممتثل (0 ريال)" 
                  stroke="#059669" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#forecastCompliantGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Upcoming Regulatory Critical Milestones & Deadlines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
                الجدول الزمني للمحطات التنظيمية الحرجة (Upcoming Regulatory Triggers)
              </h3>
              <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {upcomingMilestones.length} محطات استحقاق
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تواريخ انتهاء الرخص والمهل النظامية التي ستؤدي لانتقال الغرامات إلى المستوى التالي في حال عدم التجديد
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>ترتيب حسب الأولوية والاستحقاق</span>
          </div>
        </div>

        {upcomingMilestones.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">لا توجد محطات حرجة أو رخص منتهية خلال الـ 60 يوماً القادمة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMilestones.map((item) => {
              const isPast = item.daysRemaining <= 0;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    item.severity === 'critical'
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                      : item.severity === 'high'
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {item.authority}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPast ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isPast ? `متأخر منذ ${Math.abs(item.daysRemaining)} يوم` : `متبقي ${item.daysRemaining} يوم`}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                      <span>الأثر المالي المتوقع:</span>
                      <strong className="text-rose-700 font-extrabold font-['Cairo']">
                        {formatSAR(item.fineRisk)}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {item.licenseId && (
                      <button
                        type="button"
                        onClick={() => onRenewLicense?.(item.licenseId!)}
                        className="flex-1 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{item.actionLabel}</span>
                      </button>
                    )}

                    {item.violation && (
                      <button
                        type="button"
                        onClick={() => onOpenObjectionModal?.(item.violation!)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>صياغة اعتراض وتصحيح</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compliance Financial Strategy & Recommendation */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>توصية سبّاق الاستباقية</span>
          </div>
          <h3 className="text-lg font-bold font-['Cairo']">
            تجميد الغرامات المتوقعة وتوفير {formatSAR(complianceCostEstimation.netSavings)}
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            البدء الفوري في إجراءات التجديد يمنح منشأتك مهلة إلكترونية نظامية ويوقف فوراً سريان الغرامات اليومية والإنذارات الميدانية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onConsultSpecialist?.('تنفيذ حزمة الحماية الاستباقية وتجديد التراخيص')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <span>بدء خطة الامتثال الفوري</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
