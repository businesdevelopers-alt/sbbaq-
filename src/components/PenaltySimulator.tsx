import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Flame, 
  Users, 
  FileText, 
  Scale, 
  DollarSign, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Sliders, 
  Layers, 
  Zap, 
  Clock, 
  ArrowUpRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Establishment, License, ComplianceViolation, DocumentItem } from '../types';
import { formatSAR, getRiskLevelBadge } from '../utils/complianceEngine';

interface PenaltySimulatorProps {
  establishment: Establishment;
  licenses: License[];
  violations: ComplianceViolation[];
  documents: DocumentItem[];
  onConsultSpecialist?: (topic: string) => void;
  onRenewLicense?: (licenseId: string) => void;
}

export interface SimulationState {
  // Municipal (Balady) factors
  expiredBaladyLicenses: number;
  baladyDelayDays: number;
  nearExpiryBaladyLicenses: number;
  unrectifiedBaladyViolations: number;
  baladyViolationGraceOverdue: boolean;

  // Civil Defense (Salamah) factors
  expiredSalamahPermits: number;
  salamahSafetyEquipmentMissing: boolean;

  // Labor & Saudization (Qiwa & MHRSD) factors
  saudizationLevel: 'platinum' | 'high_green' | 'mid_green' | 'yellow' | 'red';
  uncontractedEmployeesCount: number;
  wageProtectionDelayed: boolean;

  // Commercial & ZATCA factors
  expiredCR: boolean;
  crDelayMonths: number;
  eInvoicingNonCompliant: boolean;

  // Projection Horizon
  simulationHorizonDays: 0 | 15 | 30 | 60;
}

export const PenaltySimulator: React.FC<PenaltySimulatorProps> = ({
  establishment,
  licenses,
  violations,
  documents,
  onConsultSpecialist,
  onRenewLicense,
}) => {
  // Baseline initial counts calculated from real establishment data
  const realExpiredBalady = licenses.filter(
    l => l.establishmentId === establishment.id && 
         l.status === 'expired' && 
         (l.authority.includes('بلدي') || l.authority.includes('أمانة') || l.name.includes('بلدي'))
  ).length;

  const realNearExpiryBalady = licenses.filter(
    l => l.establishmentId === establishment.id && 
         l.status === 'near_expiry' && 
         (l.authority.includes('بلدي') || l.authority.includes('أمانة') || l.name.includes('بلدي'))
  ).length;

  const realExpiredSalamah = licenses.filter(
    l => l.establishmentId === establishment.id && 
         l.status === 'expired' && 
         (l.authority.includes('دفاع مدني') || l.authority.includes('سلامة') || l.name.includes('سلامة'))
  ).length;

  const realActiveViolations = violations.filter(
    v => v.establishmentId === establishment.id && v.status !== 'rectified'
  ).length;

  const realSaudization = establishment.saudizationPercentage >= 40 
    ? 'high_green' 
    : establishment.saudizationPercentage >= 25 
    ? 'mid_green' 
    : establishment.saudizationPercentage >= 15 
    ? 'yellow' 
    : 'red';

  const defaultState: SimulationState = {
    expiredBaladyLicenses: realExpiredBalady,
    baladyDelayDays: realExpiredBalady > 0 ? 25 : 0,
    nearExpiryBaladyLicenses: realNearExpiryBalady,
    unrectifiedBaladyViolations: realActiveViolations,
    baladyViolationGraceOverdue: violations.some(v => v.establishmentId === establishment.id && v.daysLeftToCorrect <= 0),

    expiredSalamahPermits: realExpiredSalamah,
    salamahSafetyEquipmentMissing: false,

    saudizationLevel: realSaudization,
    uncontractedEmployeesCount: 0,
    wageProtectionDelayed: false,

    expiredCR: false,
    crDelayMonths: 0,
    eInvoicingNonCompliant: false,

    simulationHorizonDays: 0,
  };

  const [sim, setSim] = useState<SimulationState>(defaultState);
  const [activeCategory, setActiveCategory] = useState<'all' | 'municipal' | 'safety' | 'labor' | 'commercial'>('all');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Quick preset scenarios
  const applyPreset = (preset: 'baseline' | 'ideal' | 'moderate_delay' | 'critical_worst' | 'surprise_inspection') => {
    switch (preset) {
      case 'baseline':
        setSim({ ...defaultState });
        break;
      case 'ideal':
        setSim({
          expiredBaladyLicenses: 0,
          baladyDelayDays: 0,
          nearExpiryBaladyLicenses: 0,
          unrectifiedBaladyViolations: 0,
          baladyViolationGraceOverdue: false,
          expiredSalamahPermits: 0,
          salamahSafetyEquipmentMissing: false,
          saudizationLevel: 'platinum',
          uncontractedEmployeesCount: 0,
          wageProtectionDelayed: false,
          expiredCR: false,
          crDelayMonths: 0,
          eInvoicingNonCompliant: false,
          simulationHorizonDays: 0,
        });
        break;
      case 'moderate_delay':
        setSim({
          expiredBaladyLicenses: 1,
          baladyDelayDays: 20,
          nearExpiryBaladyLicenses: 2,
          unrectifiedBaladyViolations: 1,
          baladyViolationGraceOverdue: false,
          expiredSalamahPermits: 0,
          salamahSafetyEquipmentMissing: false,
          saudizationLevel: 'mid_green',
          uncontractedEmployeesCount: 2,
          wageProtectionDelayed: false,
          expiredCR: false,
          crDelayMonths: 0,
          eInvoicingNonCompliant: false,
          simulationHorizonDays: 15,
        });
        break;
      case 'critical_worst':
        setSim({
          expiredBaladyLicenses: 3,
          baladyDelayDays: 60,
          nearExpiryBaladyLicenses: 2,
          unrectifiedBaladyViolations: 3,
          baladyViolationGraceOverdue: true,
          expiredSalamahPermits: 2,
          salamahSafetyEquipmentMissing: true,
          saudizationLevel: 'red',
          uncontractedEmployeesCount: 6,
          wageProtectionDelayed: true,
          expiredCR: true,
          crDelayMonths: 4,
          eInvoicingNonCompliant: true,
          simulationHorizonDays: 60,
        });
        break;
      case 'surprise_inspection':
        setSim({
          expiredBaladyLicenses: 1,
          baladyDelayDays: 10,
          nearExpiryBaladyLicenses: 1,
          unrectifiedBaladyViolations: 2,
          baladyViolationGraceOverdue: true,
          expiredSalamahPermits: 1,
          salamahSafetyEquipmentMissing: true,
          saudizationLevel: 'yellow',
          uncontractedEmployeesCount: 3,
          wageProtectionDelayed: false,
          expiredCR: false,
          crDelayMonths: 0,
          eInvoicingNonCompliant: false,
          simulationHorizonDays: 0,
        });
        break;
    }
  };

  // Complex Real-Time Penalty Calculation Engine
  const simulationResults = useMemo(() => {
    // 1. Municipal (Balady) Fine Calculations
    // Base license fine: 3,000 SAR + 50 SAR/day of delay
    const baladyBasePerLic = 3000;
    const baladyDailyRate = 50;
    const effectiveBaladyDays = sim.baladyDelayDays + sim.simulationHorizonDays;
    const baladyLicFines = sim.expiredBaladyLicenses * (baladyBasePerLic + (effectiveBaladyDays * baladyDailyRate));

    // Near expiry risk if horizon passes 30 days
    const nearExpiryTurnedExpired = sim.simulationHorizonDays >= 30 ? sim.nearExpiryBaladyLicenses : 0;
    const nearExpiryProjectedFine = nearExpiryTurnedExpired * baladyBasePerLic;

    // Direct Municipal Violations: Avg 2,500 SAR. If grace overdue, multiplied by 2 (as per updated executive municipal penalties table)
    const baladyViolMultiplier = sim.baladyViolationGraceOverdue ? 2 : 1;
    const baladyViolFines = sim.unrectifiedBaladyViolations * (2500 * baladyViolMultiplier);
    
    const totalBaladyFines = baladyLicFines + nearExpiryProjectedFine + baladyViolFines;

    // 2. Civil Defense (Salamah) Fines
    // Expired safety permit: 10,000 SAR base + danger multiplier
    const salamahPermitFine = sim.expiredSalamahPermits * 10000;
    const safetyEquipFine = sim.salamahSafetyEquipmentMissing ? 7500 : 0;
    const totalSalamahFines = salamahPermitFine + safetyEquipFine;

    // 3. Labor & Saudization (Qiwa & MHRSD) Fines
    let saudizationFine = 0;
    if (sim.saudizationLevel === 'red') {
      saudizationFine = 20000; // Freeze + severe compliance fine
    } else if (sim.saudizationLevel === 'yellow') {
      saudizationFine = 10000;
    } else if (sim.saudizationLevel === 'mid_green') {
      saudizationFine = 0;
    }

    // Uncontracted employees: 1,000 SAR fine per employee (MHRSD ministerial decision)
    const uncontractedFine = sim.uncontractedEmployeesCount * 1000;
    // Wage protection delay: 3,000 SAR fine per month delayed
    const wageDelayFine = sim.wageProtectionDelayed ? 5000 : 0;
    const totalLaborFines = saudizationFine + uncontractedFine + wageDelayFine;

    // 4. Commercial (Ministry of Commerce) & Tax (ZATCA) Fines
    // Expired CR: 1,000 SAR base + 500/month
    const crFine = sim.expiredCR ? (1000 + (sim.crDelayMonths * 500)) : 0;
    // Non-compliance with E-Invoicing Phase 2: 5,000 SAR starting fine
    const zatcaFine = sim.eInvoicingNonCompliant ? 5000 : 0;
    const totalCommercialFines = crFine + zatcaFine;

    // Grand Total Potential Fines
    const grandTotalFines = totalBaladyFines + totalSalamahFines + totalLaborFines + totalCommercialFines;

    // Calculate Simulated Risk Score (0 - 100)
    let score = 5; // base baseline
    score += sim.expiredBaladyLicenses * 15;
    score += Math.min(20, Math.floor(effectiveBaladyDays / 5) * 2);
    score += sim.unrectifiedBaladyViolations * 12;
    if (sim.baladyViolationGraceOverdue) score += 10;
    score += sim.expiredSalamahPermits * 20;
    if (sim.salamahSafetyEquipmentMissing) score += 15;
    
    if (sim.saudizationLevel === 'red') score += 25;
    else if (sim.saudizationLevel === 'yellow') score += 15;
    
    score += sim.uncontractedEmployeesCount * 3;
    if (sim.wageProtectionDelayed) score += 10;
    if (sim.expiredCR) score += 10;
    if (sim.eInvoicingNonCompliant) score += 10;
    if (sim.simulationHorizonDays >= 30) score += 8;

    const simulatedRiskScore = Math.min(100, Math.max(0, score));

    // Determine Legal Escalation Severity
    let escalationStatus: {
      tier: 'safe' | 'warning' | 'financial_fine' | 'service_freeze' | 'closure_threat';
      title: string;
      color: string;
      bg: string;
      description: string;
    };

    if (simulatedRiskScore < 25) {
      escalationStatus = {
        tier: 'safe',
        title: 'امتثال نظامي ممتاز (نطاق أخضر)',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        description: 'المنشأة محصنة ضد الجولات التفتيشية وبدون أي غرامات متوقعة.',
      };
    } else if (simulatedRiskScore < 50) {
      escalationStatus = {
        tier: 'warning',
        title: 'ملاحظات وتنبيهات إنذار أولية',
        color: 'text-yellow-800',
        bg: 'bg-yellow-50 border-yellow-200',
        description: 'تنبيهات إدارية قبل تحولها لغرامات مالية في حال انقضاء المهل النظامية.',
      };
    } else if (simulatedRiskScore < 75) {
      escalationStatus = {
        tier: 'financial_fine',
        title: 'غرامات مالية مباشرة وتجميد خدمات جزئي',
        color: 'text-amber-800',
        bg: 'bg-amber-50 border-amber-300',
        description: 'إصدار فواتير سداد وغرامات تأخير مع تعليق بعض خدمات التراخيص.',
      };
    } else if (simulatedRiskScore < 90) {
      escalationStatus = {
        tier: 'service_freeze',
        title: 'إيقاف خدمات المنشأة (قوى / بلدي / التجارة)',
        color: 'text-rose-800',
        bg: 'bg-rose-50 border-rose-300',
        description: 'تعليق الاستقدام ونقل الكفالات وتجديد التراخيص عبر منصات الأعمال الحكومية.',
      };
    } else {
      escalationStatus = {
        tier: 'closure_threat',
        title: 'مستوى حرج جداً: خطر الإغلاق وإلغاء التراخيص',
        color: 'text-red-900',
        bg: 'bg-red-100 border-red-400',
        description: 'إشعار إغلاق فوري للفرع وسحب الترخيص التجاري وتضاعف الغرامات للحد الأقصى.',
      };
    }

    // Breakdown for Charts
    const authorityBreakdown = [
      {
        authority: 'البلديات والإسكان (بلدي)',
        shortName: 'بلدي',
        fines: totalBaladyFines,
        color: '#059669', // emerald
      },
      {
        authority: 'الدفاع المدني (سلامة)',
        shortName: 'سلامة',
        fines: totalSalamahFines,
        color: '#dc2626', // red
      },
      {
        authority: 'الموارد البشرية (قوى/نطاقات)',
        shortName: 'قوى',
        fines: totalLaborFines,
        color: '#2563eb', // blue
      },
      {
        authority: 'التجارة وهيئة الزكاة (ZATCA)',
        shortName: 'التجارة/الزكاة',
        fines: totalCommercialFines,
        color: '#d97706', // amber
      },
    ];

    // Priority Actionable Quick Fixes
    const quickFixes: Array<{
      title: string;
      fineImpact: number;
      authority: string;
      actionText: string;
      type: 'renew' | 'violation' | 'saudization' | 'safety';
    }> = [];

    if (baladyLicFines > 0) {
      quickFixes.push({
        title: `تجديد ${sim.expiredBaladyLicenses} رخصة بلدية منتهية وتفادي تراكم غرامة التأخير`,
        fineImpact: baladyLicFines,
        authority: 'أمانة المنطقة / بلدي',
        actionText: 'بدء تجديد الرخص فوراً',
        type: 'renew',
      });
    }

    if (totalSalamahFines > 0) {
      quickFixes.push({
        title: `إصدار وتجديد شهادة سلامة الدفاع المدني واستيفاء شروط الإطفاء`,
        fineImpact: totalSalamahFines,
        authority: 'الدفاع المدني',
        actionText: 'طلب فحص السلامة الوقائي',
        type: 'safety',
      });
    }

    if (baladyViolFines > 0) {
      quickFixes.push({
        title: `معالجة أو الاعتراض على ${sim.unrectifiedBaladyViolations} مخالفات بلدية قبل مضاعفة الغرامة`,
        fineImpact: baladyViolFines,
        authority: 'منصة بلدي',
        actionText: 'صياغة اعتراض وتصحيح',
        type: 'violation',
      });
    }

    if (totalLaborFines > 0) {
      quickFixes.push({
        title: `رفع نسبة التوطين وتوثيق عقود ${sim.uncontractedEmployeesCount} موظفين في قوى`,
        fineImpact: totalLaborFines,
        authority: 'وزارة الموارد البشرية',
        actionText: 'خطة تحسين نطاقات والعقود',
        type: 'saudization',
      });
    }

    return {
      totalBaladyFines,
      totalSalamahFines,
      totalLaborFines,
      totalCommercialFines,
      grandTotalFines,
      simulatedRiskScore,
      escalationStatus,
      authorityBreakdown,
      quickFixes,
      effectiveBaladyDays,
    };
  }, [sim]);

  // Comparison with baseline fines
  // Calculate baseline grand fines for comparison
  const baselineBaladyFine = realExpiredBalady * (3000 + 25 * 50);
  const baselineSalamahFine = realExpiredSalamah * 10000;
  const baselineViolFine = realActiveViolations * 2500;
  const baselineGrandFines = baselineBaladyFine + baselineSalamahFine + baselineViolFine;
  
  const fineDifference = simulationResults.grandTotalFines - baselineGrandFines;
  const isSaving = fineDifference < 0;

  return (
    <div className="space-y-6">
      
      {/* Top Simulator Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>أداة المحاكاة الاستشرافية التفاعلية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Cairo'] tracking-tight">
              محاكي الغرامات المالية والمخاطر التنظيمية (Penalty Simulator)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              تحكم بمرونة في متغيرات وعوامل الخطر (عدد الرخص المنتهية، أيام التأخر، التوطين، اشتراطات السلامة) وشاهد التأثير المالي المباشر على الغرامات الحكومية وتصنيف المنشأة لحظياً.
            </p>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 block w-full lg:w-auto">
              سيناريوهات سريعة:
            </span>
            <button
              onClick={() => applyPreset('baseline')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-600 transition-colors flex items-center gap-1"
              title="إعادة التعيين لبيانات المنشأة الحالية"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>الوضع الحالي</span>
            </button>
            <button
              onClick={() => applyPreset('ideal')}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
              title="محاكاة الامتثال التام 100%"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>الامتثال التام (0 ر.س)</span>
            </button>
            <button
              onClick={() => applyPreset('moderate_delay')}
              className="bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>تأخر معتاد (15 يوم)</span>
            </button>
            <button
              onClick={() => applyPreset('critical_worst')}
              className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>السيناريو الحرج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulator Dashboard: Metrics & Projection Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Fine Output Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">إجمالي الغرامات المحتسبة في المحاكاة</span>
                  <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">
                    التكلفة المالية المتوقعة
                  </h3>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${simulationResults.escalationStatus.bg} ${simulationResults.escalationStatus.color}`}>
                {simulationResults.escalationStatus.title}
              </span>
            </div>

            {/* Big Fine Number Display */}
            <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center relative overflow-hidden shadow-sm">
              <span className="text-xs text-slate-300 block font-medium mb-1">
                إجمالي الغرامات الحكومية التقديرية (SAR)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 font-['Cairo'] tracking-tight">
                {formatSAR(simulationResults.grandTotalFines)}
              </div>

              {/* Difference from baseline */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700">
                {isSaving ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">
                      توفير قدره {formatSAR(Math.abs(fineDifference))} مقارنة بالوضع الفعلي
                    </span>
                  </>
                ) : fineDifference > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">
                      ارتفاع {formatSAR(fineDifference)} عن الوضع الفعلي
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300">مطابق للوضع الفعلي الحالي</span>
                )}
              </div>
            </div>

            {/* Gauge of Simulated Risk Score */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>مؤشر مخاطر الامتثال المتوقع:</span>
                </span>
                <strong className={`text-base font-extrabold font-['Cairo'] ${
                  simulationResults.simulatedRiskScore >= 75
                    ? 'text-red-600'
                    : simulationResults.simulatedRiskScore >= 50
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}>
                  {simulationResults.simulatedRiskScore} / 100
                </strong>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    simulationResults.simulatedRiskScore >= 75
                      ? 'bg-red-600'
                      : simulationResults.simulatedRiskScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${simulationResults.simulatedRiskScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug pt-1">
                {simulationResults.escalationStatus.description}
              </p>
            </div>
          </div>

          {/* Quick Consultation Trigger */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onConsultSpecialist?.('استشارة مبنية على نتائج محاكي الغرامات لتفادي التكاليف')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>اعتماد خطة وقائية لتصفير هذه الغرامات</span>
            </button>
          </div>
        </div>

        {/* Breakdown by Authority & Interactive Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  توزيع الغرامات المالية حسب الجهات الرقابية
                </h3>
                <span className="text-xs text-slate-500">
                  مقارنة الأثر المالي بين البلديات، الدفاع المدني، الموارد البشرية، والجهات الأخرى
                </span>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                4 قطاعات حكومية
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-56 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={simulationResults.authorityBreakdown}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip 
                    formatter={(val: number) => [`${formatSAR(val)}`, 'الغرامة التقديرية']}
                    labelFormatter={(label) => {
                      const item = simulationResults.authorityBreakdown.find(a => a.shortName === label);
                      return item ? item.authority : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '12px',
                      direction: 'rtl',
                      textAlign: 'right'
                    }}
                  />
                  <Bar dataKey="fines" radius={[6, 6, 0, 0]}>
                    {simulationResults.authorityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Authority Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {simulationResults.authorityBreakdown.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-right space-y-1"
                >
                  <span className="text-[11px] font-bold text-slate-600 block truncate" title={item.authority}>
                    {item.shortName}
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                    {formatSAR(item.fines)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {simulationResults.grandTotalFines > 0 
                      ? `${Math.round((item.fines / simulationResults.grandTotalFines) * 100)}% من الإجمالي`
                      : '0%'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Horizon Slider Indicator */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>الأفق الزمني للتأخر المستقبلي:</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px]">
                {sim.simulationHorizonDays === 0 ? 'الوضع الآني (اليوم)' : `بعد ${sim.simulationHorizonDays} يوماً`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {([0, 15, 30, 60] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setSim(prev => ({ ...prev, simulationHorizonDays: days }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sim.simulationHorizonDays === days
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
                  }`}
                >
                  {days === 0 ? 'الآن' : `+${days} يوم`}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Controls / Sliders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-['Cairo']">
                لوحة التحكم في متغيرات المحاكاة (Sliders & Controls)
              </h3>
              <p className="text-xs text-slate-500">
                غيّر القيم أدناه لرؤية الحساب الفوري لأثر كل مخالفة وترخيص على تكلفة الامتثال
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع القطاعات
            </button>
            <button
              onClick={() => setActiveCategory('municipal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'municipal' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              البلديات (بلدي)
            </button>
            <button
              onClick={() => setActiveCategory('safety')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'safety' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الدفاع المدني
            </button>
            <button
              onClick={() => setActiveCategory('labor')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'labor' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الموارد البشرية
            </button>
            <button
              onClick={() => setActiveCategory('commercial')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'commercial' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              التجارة والزكاة
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Category 1: Municipal (Balady) Controls */}
          {(activeCategory === 'all' || activeCategory === 'municipal') && (
            <>
              {/* Expired Balady Lic Count */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      الرخص البلدية المنتهية:
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {sim.expiredBaladyLicenses} رخص
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={sim.expiredBaladyLicenses}
                  onChange={(e) => setSim(prev => ({ ...prev, expiredBaladyLicenses: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>0 (سارية)</span>
                  <span>5</span>
                  <span>10 رخص</span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-700">الأثر: </span>
                  3,000 ر.س غرامة أساسية لكل رخصة + 50 ر.س/يوم تأخير.
                </div>
              </div>

              {/* Balady Delay Days Slider */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      متوسط أيام التأخر في التجديد:
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {sim.baladyDelayDays} يوماً
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={sim.baladyDelayDays}
                  onChange={(e) => setSim(prev => ({ ...prev, baladyDelayDays: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>0 يوم</span>
                  <span>45 يوماً</span>
                  <span>90 يوماً</span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-700">الغرامة اليومية المتراكمة: </span>
                  {formatSAR(sim.baladyDelayDays * 50 * Math.max(1, sim.expiredBaladyLicenses))}
                </div>
              </div>

              {/* Municipal Violations & Grace Switch */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      مخالفات بلدية غير معالجة:
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {sim.unrectifiedBaladyViolations} مخالفات
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={sim.unrectifiedBaladyViolations}
                  onChange={(e) => setSim(prev => ({ ...prev, unrectifiedBaladyViolations: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                {/* Overdue Grace Toggle */}
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer pt-1">
                  <span>انقضاء مهلة التصحيح (مضاعفة 2x)</span>
                  <input
                    type="checkbox"
                    checked={sim.baladyViolationGraceOverdue}
                    onChange={(e) => setSim(prev => ({ ...prev, baladyViolationGraceOverdue: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}

          {/* Category 2: Safety & Civil Defense (Salamah) */}
          {(activeCategory === 'all' || activeCategory === 'safety') && (
            <>
              {/* Expired Salamah Permits */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      تصاريح سلامة منتهية:
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                    {sim.expiredSalamahPermits} تصريح
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={sim.expiredSalamahPermits}
                  onChange={(e) => setSim(prev => ({ ...prev, expiredSalamahPermits: parseInt(e.target.value) }))}
                  className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>0 (سارية)</span>
                  <span>2</span>
                  <span>5 تصاريح</span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-rose-100">
                  <span className="font-bold text-rose-700">الأثر: </span>
                  10,000 ر.س غرامة لكل تصريح مع خطر إغلاق المنشأة.
                </div>
              </div>

              {/* Safety Equipment Missing Toggle */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      ملاحظات على طفايات الحريق وكواشف الدخان:
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    عدم صيانة مضخات الإطفاء أو انتهاء صلاحية طفايات الحريق في الفروع
                  </p>
                </div>

                <label className="flex items-center justify-between text-xs font-bold text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200 cursor-pointer">
                  <span>وجود نقص في تجهيزات الإطفاء (+7,500 ر.س)</span>
                  <input
                    type="checkbox"
                    checked={sim.salamahSafetyEquipmentMissing}
                    onChange={(e) => setSim(prev => ({ ...prev, salamahSafetyEquipmentMissing: e.target.checked }))}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}

          {/* Category 3: Labor & Saudization (Qiwa / MHRSD) */}
          {(activeCategory === 'all' || activeCategory === 'labor') && (
            <>
              {/* Saudization Level Selector */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      نطاق التوطين (نطاقات قوى):
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {sim.saudizationLevel === 'platinum' ? 'بلاتيني' : sim.saudizationLevel === 'high_green' ? 'أخضر مرتفع' : sim.saudizationLevel === 'mid_green' ? 'أخضر متوسط' : sim.saudizationLevel === 'yellow' ? 'أصفر (إنذار)' : 'أحمر (حرج)'}
                  </span>
                </div>

                <select
                  value={sim.saudizationLevel}
                  onChange={(e) => setSim(prev => ({ ...prev, saudizationLevel: e.target.value as any }))}
                  className="w-full bg-white text-xs font-bold text-slate-800 rounded-lg p-2 border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="platinum">بلاتيني (0 ر.س - امتثال كامل)</option>
                  <option value="high_green">أخضر مرتفع (0 ر.س - آمن)</option>
                  <option value="mid_green">أخضر متوسط (0 ر.س - مستقر)</option>
                  <option value="yellow">نطاق أصفر (+10,000 ر.س - إنذار إيقاف)</option>
                  <option value="red">نطاق أحمر (+20,000 ر.س - تجميد خدمات شامل)</option>
                </select>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-blue-100">
                  {sim.saudizationLevel === 'red' 
                    ? '⚠️ تجميد كامل لنقل الكفالات وتجديد الإقامات وإصدار التأشيرات.'
                    : 'سريان طبيعي لخدمات الموارد البشرية والتأشيرات.'}
                </div>
              </div>

              {/* Uncontracted Employees Count */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      عقود غير موثقة في منصة قوى:
                    </label>
                  </div>
                  <span className="text-xs font-extrabold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {sim.uncontractedEmployeesCount} موظفين
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={sim.uncontractedEmployeesCount}
                  onChange={(e) => setSim(prev => ({ ...prev, uncontractedEmployeesCount: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>0 موظف</span>
                  <span>7</span>
                  <span>15 موظف</span>
                </div>

                {/* Wage Protection Toggle */}
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer pt-1">
                  <span>تأخر مسيرات حماية الأجور (+5,000 ر.س)</span>
                  <input
                    type="checkbox"
                    checked={sim.wageProtectionDelayed}
                    onChange={(e) => setSim(prev => ({ ...prev, wageProtectionDelayed: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}

          {/* Category 4: Commercial & ZATCA */}
          {(activeCategory === 'all' || activeCategory === 'commercial') && (
            <>
              {/* Expired CR & Delay */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      السجل التجاري (وزارة التجارة):
                    </label>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sim.expiredCR ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {sim.expiredCR ? 'منتهي' : 'سارٍ'}
                  </span>
                </div>

                <label className="flex items-center justify-between text-xs font-bold text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200 cursor-pointer">
                  <span>السجل التجاري منتهي الصلاحية</span>
                  <input
                    type="checkbox"
                    checked={sim.expiredCR}
                    onChange={(e) => setSim(prev => ({ ...prev, expiredCR: e.target.checked }))}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                {sim.expiredCR && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>أشهر التأخر في تجديد السجل:</span>
                      <span>{sim.crDelayMonths} أشهر</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={sim.crDelayMonths}
                      onChange={(e) => setSim(prev => ({ ...prev, crDelayMonths: parseInt(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* ZATCA E-Invoicing Phase 2 */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <label className="text-xs font-bold text-slate-800 font-['Cairo']">
                      الفاتورة الإلكترونية والربط (ZATCA):
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    متطلبات مرحلة الربط والتكامل وتضمين رمز الاستجابة السريعة (QR) المشفر
                  </p>
                </div>

                <label className="flex items-center justify-between text-xs font-bold text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200 cursor-pointer">
                  <span>عدم الالتزام بمتطلبات الفوترة (+5,000 ر.س)</span>
                  <input
                    type="checkbox"
                    checked={sim.eInvoicingNonCompliant}
                    onChange={(e) => setSim(prev => ({ ...prev, eInvoicingNonCompliant: e.target.checked }))}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}

        </div>

      </div>

      {/* Priority Corrective Actions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
              الإجراءات التصحيحية الأعلى أثراً مالياً (Quick Cost Reductions)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            وفر حتى {formatSAR(simulationResults.grandTotalFines)}
          </span>
        </div>

        {simulationResults.quickFixes.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">تهانينا! الإعدادات الحالية تمثل امتثالاً تاماً ولا توجد غرامات لتوفيرها</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simulationResults.quickFixes.map((fix, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {fix.authority}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 font-['Cairo']">
                      توفير: {formatSAR(fix.fineImpact)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-['Cairo']">
                    {fix.title}
                  </h4>
                </div>

                <button
                  onClick={() => onConsultSpecialist?.(`تنفيذ إجراء تصحيحي وقائي: ${fix.title}`)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{fix.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
