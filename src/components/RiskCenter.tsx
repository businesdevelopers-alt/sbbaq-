import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft, 
  RotateCw, 
  FileText, 
  Upload, 
  X, 
  Scale, 
  Sparkles,
  Info,
  Clock,
  Calendar,
  Activity,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  Establishment, 
  Branch,
  License, 
  DocumentItem, 
  ComplianceViolation, 
  MasterOrder,
  RiskAssessment,
  RiskFactor
} from '../types';
import { 
  calculateEstablishmentRisk, 
  getRiskLevelBadge, 
  formatSAR 
} from '../utils/complianceEngine';

interface RiskCenterProps {
  establishment: Establishment;
  branches?: Branch[];
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  orders: MasterOrder[];
  onRenewLicense: (licenseId: string) => void;
  onUploadDoc: (docId?: string) => void;
  onOpenObjectionModal: (violation: ComplianceViolation) => void;
  onConsultSpecialist: (topic: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenViolationsAnalyzer?: (violationId?: string) => void;
  onExportPdf?: () => void;
  showToast?: (msg: string) => void;
}

export const RiskCenter: React.FC<RiskCenterProps> = ({
  establishment,
  branches = [],
  licenses,
  documents,
  violations,
  orders,
  onRenewLicense,
  onUploadDoc,
  onOpenObjectionModal,
  onConsultSpecialist,
  onNavigateToTab,
  onOpenViolationsAnalyzer,
  onExportPdf,
  showToast,
}) => {
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [chartMetric, setChartMetric] = useState<'riskScore' | 'potentialFines'>('riskScore');

  const riskAssessment: RiskAssessment = calculateEstablishmentRisk(
    establishment,
    licenses,
    documents,
    violations,
    orders
  );

  const levelBadge = getRiskLevelBadge(riskAssessment.level);
  const activeViolations = violations.filter(v => v.establishmentId === establishment.id && v.status !== 'rectified');

  // Generate 6-month historical trend data tailored to current score and establishment profile
  const currentScore = riskAssessment.overallScore;
  const currentFines = riskAssessment.potentialFinesEstimated;

  const historicalRiskData = React.useMemo(() => {
    if (establishment.id === 'est-1') {
      return [
        { month: 'مارس 2026', riskScore: 28, potentialFines: 0, event: 'جميع التراخيص سارية وبدون أي مخالفات' },
        { month: 'أبريل 2026', riskScore: 35, potentialFines: 3000, event: 'اقتراب موعد تجديد الشهادات الصحية' },
        { month: 'مايو 2026', riskScore: 46, potentialFines: 5000, event: 'إشعار انتهاء عقد النظافة التجاري' },
        { month: 'يونيو 2026', riskScore: 54, potentialFines: 10000, event: 'انتهاء تصريح سلامة الدفاع المدني' },
        { month: 'يوليو 2026', riskScore: 62, potentialFines: 15000, event: 'رصد مخالفة بلدية في فرع العليا' },
        { month: 'أغسطس 2026 (الحالي)', riskScore: currentScore, potentialFines: currentFines, event: 'تراكم رخص منتهية وتصاعد غرامات التأخير' },
      ];
    } else if (establishment.id === 'est-2') {
      return [
        { month: 'مارس 2026', riskScore: 45, potentialFines: 6000, event: 'فترة تحديث ملف قوى ونطاقات' },
        { month: 'أبريل 2026', riskScore: 38, potentialFines: 3000, event: 'توثيق 100% من عقود الموظفين' },
        { month: 'مايو 2026', riskScore: 26, potentialFines: 0, event: 'تجديد السجل التجاري واشتراك الغرفة' },
        { month: 'يونيو 2026', riskScore: 22, potentialFines: 0, event: 'امتثال تام لمعايير الفوترة الإلكترونية' },
        { month: 'يوليو 2026', riskScore: 19, potentialFines: 0, event: 'سريان كافة المستندات والتراخيص' },
        { month: 'أغسطس 2026 (الحالي)', riskScore: currentScore, potentialFines: currentFines, event: 'استقرار ممتاز في النطاق الأخضر الآمن' },
      ];
    } else if (establishment.id === 'est-3') {
      return [
        { month: 'مارس 2026', riskScore: 48, potentialFines: 5000, event: 'بدء مشاريع جديدة وزيادة العمالة' },
        { month: 'أبريل 2026', riskScore: 58, potentialFines: 12000, event: 'انخفاض نسبة التوطين واقتراب رخص العمل' },
        { month: 'مايو 2026', riskScore: 66, potentialFines: 20000, event: 'انتهاء تصريح السلامة لموقع المستودع' },
        { month: 'يونيو 2026', riskScore: 74, potentialFines: 28000, event: 'تسجيل مخالفة تأخر تجديد سجل الفرع' },
        { month: 'يوليو 2026', riskScore: 79, potentialFines: 35000, event: 'انتهاء الرخصة البلدية للمكتب الرئيسي' },
        { month: 'أغسطس 2026 (الحالي)', riskScore: currentScore, potentialFines: currentFines, event: 'مستوى حرج يستوجب التدخل والتصحيح الفوري' },
      ];
    }

    // Dynamic interpolation fallback for any custom establishment
    const delta = Math.round(currentScore / 5);
    return [
      { month: 'مارس 2026', riskScore: Math.max(10, currentScore - delta * 3), potentialFines: Math.max(0, currentFines - 15000), event: 'فحص دوري أولي للمنشأة' },
      { month: 'أبريل 2026', riskScore: Math.max(15, currentScore - delta * 2), potentialFines: Math.max(0, currentFines - 10000), event: 'متابعة المهل النظامية' },
      { month: 'مايو 2026', riskScore: Math.max(20, currentScore - delta), potentialFines: Math.max(0, currentFines - 5000), event: 'تحديث سجل التراخيص' },
      { month: 'يونيو 2026', riskScore: Math.max(25, currentScore - Math.round(delta * 0.5)), potentialFines: Math.max(0, currentFines - 2000), event: 'مراجعة متطلبات الجهات الإشرافية' },
      { month: 'يوليو 2026', riskScore: Math.max(25, currentScore - Math.round(delta * 0.2)), potentialFines: Math.max(0, currentFines - 1000), event: 'تدقيق المستندات والعقود' },
      { month: 'أغسطس 2026 (الحالي)', riskScore: currentScore, potentialFines: currentFines, event: 'التقييم الفعلي المحدث اليوم' },
    ];
  }, [establishment.id, currentScore, currentFines]);

  // Calculate 6-month trend delta
  const firstMonthScore = historicalRiskData[0].riskScore;
  const scoreChange = currentScore - firstMonthScore;
  const isWorsening = scoreChange > 0;
  const avgScore = Math.round(historicalRiskData.reduce((acc, curr) => acc + curr.riskScore, 0) / historicalRiskData.length);

  // Custom Tooltip Component for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const score = data.riskScore;
      const fines = data.potentialFines;
      const badge = getRiskLevelBadge(
        score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
      );

      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-right min-w-[230px] space-y-2 font-['Cairo'] text-xs backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.month}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">مؤشر المخاطر:</span>
              <strong className={`text-base font-extrabold ${
                score >= 60 ? 'text-rose-400' : score >= 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {score} / 100
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">الغرامات التقديرية:</span>
              <strong className="text-slate-200 font-bold">
                {formatSAR(fines)}
              </strong>
            </div>
          </div>

          {data.event && (
            <div className="text-[11px] text-slate-300 bg-slate-800/90 p-2 rounded-lg border border-slate-700 mt-1 leading-relaxed">
              <span className="text-amber-300 font-bold ml-1">📌</span>
              <span>{data.event}</span>
            </div>
          )}
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
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>الرصد الوقائي والمخاطر التنظيمية</span>
            </div>
            <h1 className="text-2xl font-bold font-['Cairo']">
              مركز مؤشر مخاطر الامتثال للمنشأة
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              تحليل رياضي فوري يقارن بيانات منشأتك وتراخيصك ومستنداتك بقواعد الامتثال الرسمية لتوقع المخالفات قبل وقوعها وتفادي الغرامات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:border-emerald-500/50"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>تصدير تقرير المخاطر (PDF)</span>
              </button>
            )}
            <button
              onClick={() => onConsultSpecialist('استشارة شاملة لتخفيض مؤشر المخاطر')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>طلب تدقيق وقائي مع مستشار سبّاق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Score & Risk Overview Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500">نتيجة مؤشر المخاطر الحالية</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${levelBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${levelBadge.dot}`}></span>
                <span>المستوى: {levelBadge.label}</span>
              </span>
            </div>

            {/* Visual Gauge */}
            <div className="text-center my-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke={
                      riskAssessment.overallScore >= 80
                        ? '#dc2626'
                        : riskAssessment.overallScore >= 60
                        ? '#ea580c'
                        : riskAssessment.overallScore >= 30
                        ? '#ca8a04'
                        : '#16a34a'
                    }
                    strokeWidth="14"
                    strokeDasharray={452.38}
                    strokeDashoffset={452.38 - (452.38 * riskAssessment.overallScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900 font-['Cairo']">
                    {riskAssessment.overallScore}
                  </span>
                  <span className="text-xs font-bold text-slate-400 -mt-1">من 100</span>
                </div>
              </div>

              <div className="mt-2 text-xs font-semibold text-slate-600">
                {riskAssessment.overallScore < 30
                  ? 'منشأتك في النطاق الأخضر الآمن'
                  : riskAssessment.overallScore < 60
                  ? 'مخاطر متوسطة تتطلب جدولة تجديدات قادمة'
                  : riskAssessment.overallScore < 80
                  ? 'مخاطر مرتفعة - ينصح باتخاذ إجراءات فورية'
                  : 'مخاطر حرجة جداً - احتمالية غرامة أو إغلاق قائمة'}
              </div>
            </div>

            {/* Score Ranges Bar */}
            <div className="space-y-1.5 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
              <div className="flex justify-between font-bold text-slate-700">
                <span>توزيع تصنيفات المخاطر:</span>
                <span>0 - 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                <div className="bg-emerald-500 w-[30%]" title="منخفض: 0-29"></div>
                <div className="bg-yellow-500 w-[30%]" title="متوسط: 30-59"></div>
                <div className="bg-orange-500 w-[20%]" title="مرتفع: 60-79"></div>
                <div className="bg-red-600 w-[20%]" title="حرج: 80-100"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (آمن)</span>
                <span>30</span>
                <span>60</span>
                <span>80</span>
                <span>100 (حرج)</span>
              </div>
            </div>
          </div>

          {/* Potential Fines Estimate */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-red-800 font-bold block">الغرامات الحكومية المتوقعة حال عدم المعالجة:</span>
              <span className="text-slate-500 text-[11px]">بناءً على لائحة الجزاءات البلدية والسلامة</span>
            </div>
            <strong className="text-base font-extrabold text-red-700 font-['Cairo']">
              {formatSAR(riskAssessment.potentialFinesEstimated)}
            </strong>
          </div>
        </div>

        {/* Factors Breakdown List (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  عوامل ونقاط الخطر النشطة
                </h3>
                <span className="text-xs text-slate-500">
                  الأسباب المساهمة في رفع نتيجة المخاطر والإجراء الوقائي المقترح
                </span>
              </div>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                {riskAssessment.factors.length} عوامل مؤثرة
              </span>
            </div>

            <div className="space-y-3 my-2">
              {riskAssessment.factors.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">ممتاز! لا توجد عوامل خطر نشطة حالياً</p>
                </div>
              ) : (
                riskAssessment.factors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          factor.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : factor.severity === 'high'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          +{factor.points} نقطة
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-['Cairo']">
                          {factor.factor}
                        </h4>
                      </div>

                      <button
                        onClick={() => {
                          if (factor.actionType === 'renew_license') {
                            onRenewLicense(factor.targetId || '');
                          } else if (factor.actionType === 'upload_doc') {
                            onUploadDoc(factor.targetId);
                          } else if (factor.actionType === 'handle_violation') {
                            if (onNavigateToTab) {
                              onNavigateToTab('violations_analyzer');
                            }
                          } else {
                            onConsultSpecialist(factor.reason);
                          }
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 shrink-0"
                      >
                        <span>{factor.actionText}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      {factor.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Checklist Recommendation */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 mt-4">
            <span className="text-xs font-bold text-emerald-900 block mb-1">
              خطة العمل الوقائية المقترحة من سبّاق:
            </span>
            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
              {riskAssessment.recommendedActions.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* 6-Month Compliance Risk Evolution Line Chart (Recharts) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                  <span>تطور مستوى مخاطر الامتثال خلال الأشهر الستة الماضية</span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    مارس - أغسطس 2026
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  رصد بياني لمسار ومستوى التزام المنشأة عبر الأشهر الماضية مع توثيق أسباب التغير والأثر المالي التقديري
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setChartMetric('riskScore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'riskScore'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مؤشر المخاطر (0 - 100)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('potentialFines')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'potentialFines'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الغرامات التقديرية (ر.س)
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Trend Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">المؤشر الحالي:</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-extrabold text-slate-900 font-['Cairo']">
                {currentScore}
              </strong>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">مسار التغير (6 أشهر):</span>
            <div className="flex items-center gap-1.5">
              {isWorsening ? (
                <>
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                  <strong className="text-base font-extrabold text-rose-700 font-['Cairo']">
                    +{scoreChange} نقطة
                  </strong>
                  <span className="text-[10px] text-rose-600 font-semibold">(تصاعد خطر)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <strong className="text-base font-extrabold text-emerald-700 font-['Cairo']">
                    {scoreChange} نقطة
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-semibold">(تحسن ملحوظ)</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">متوسط المؤشر:</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-extrabold text-slate-800 font-['Cairo']">
                {avgScore}
              </strong>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">الذروة المسجلة:</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-extrabold text-amber-700 font-['Cairo']">
                {Math.max(...historicalRiskData.map(d => d.riskScore))}
              </strong>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Recharts LineChart Visual Container */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalRiskData}
              margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, Alexandria, sans-serif' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                domain={chartMetric === 'riskScore' ? [0, 100] : ['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, Alexandria, sans-serif' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(val) => chartMetric === 'riskScore' ? `${val}` : `${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              
              {chartMetric === 'riskScore' && (
                <>
                  <ReferenceLine 
                    y={60} 
                    stroke="#f43f5e" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'حد الخطر المرتفع (60)', 
                      position: 'top', 
                      fill: '#e11d48', 
                      fontSize: 10, 
                      fontFamily: 'Cairo, sans-serif' 
                    }} 
                  />
                  <ReferenceLine 
                    y={30} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'النطاق الأخضر الآمن (30)', 
                      position: 'bottom', 
                      fill: '#059669', 
                      fontSize: 10, 
                      fontFamily: 'Cairo, sans-serif' 
                    }} 
                  />
                </>
              )}

              <Line
                type="monotone"
                dataKey={chartMetric === 'riskScore' ? 'riskScore' : 'potentialFines'}
                name={chartMetric === 'riskScore' ? 'مؤشر المخاطر' : 'الغرامات التقديرية'}
                stroke={
                  chartMetric === 'potentialFines'
                    ? '#e11d48'
                    : currentScore >= 80
                    ? '#dc2626'
                    : currentScore >= 60
                    ? '#ea580c'
                    : currentScore >= 30
                    ? '#d97706'
                    : '#16a34a'
                }
                strokeWidth={3.5}
                dot={{ 
                  r: 5, 
                  strokeWidth: 2, 
                  fill: '#ffffff',
                  stroke: chartMetric === 'potentialFines' ? '#e11d48' : currentScore >= 60 ? '#ea580c' : '#16a34a' 
                }}
                activeDot={{ 
                  r: 8, 
                  strokeWidth: 3, 
                  fill: chartMetric === 'potentialFines' ? '#e11d48' : '#0f172a',
                  stroke: '#ffffff' 
                }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Chronological Milestone Pills */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 block mb-2">
            محطات الرصد الوقائي والأحداث المؤثرة شهرياً:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {historicalRiskData.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl border text-right space-y-1 transition-all ${
                  idx === historicalRiskData.length - 1 
                    ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30' 
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={idx === historicalRiskData.length - 1 ? 'text-emerald-900' : 'text-slate-700'}>
                    {item.month.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                    item.riskScore >= 60 ? 'bg-rose-100 text-rose-800' : item.riskScore >= 30 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {item.riskScore}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2" title={item.event}>
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmed Violations & Objections Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
                سجل المخالفات الحكومية المؤكدة والاعتراضات
              </h2>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeViolations.length} مخالفات نشطة
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة المهل النظامية للتصحيح والاعتراض، مع إمكانية إعداد لائحة اعتراض معتمدة أو تصحيح المخالفة عن طريق فريق سبّاق
            </p>
          </div>

          <button
            onClick={() => onConsultSpecialist('طلب دراسة مخالفة غير مسجلة')}
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors self-start"
          >
            + تسجيل إشعار مخالفة جديد
          </button>
        </div>

        {activeViolations.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">سجل المنشأة نظيف من أي مخالفات حكومية رسمية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeViolations.map((viol) => (
              <div
                key={viol.id}
                className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-md">
                      {viol.authority}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-['Cairo']">
                      غرامة: {formatSAR(viol.fineAmount)}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm font-['Cairo']">
                    رقم المخالفة: {viol.violationNumber}
                  </h4>
                  {viol.branchName && (
                    <span className="text-[11px] text-slate-500 block">
                      الفرع: {viol.branchName}
                    </span>
                  )}

                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-rose-100 mt-2 leading-relaxed">
                    <strong>السبب:</strong> {viol.reason}
                  </p>

                  {/* Deadlines Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mt-3">
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <span className="text-amber-800 block font-bold">مهلة التصحيح:</span>
                      <span className="text-slate-700">متبقي <strong>{viol.daysLeftToCorrect} أيام</strong></span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <span className="text-blue-800 block font-bold">مهلة الاعتراض:</span>
                      <span className="text-slate-700">متبقي <strong>{viol.daysLeftToObject} يوماً</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-100">
                  {onOpenViolationsAnalyzer && (
                    <button
                      onClick={() => onOpenViolationsAnalyzer(viol.id)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>التحليل الإجرائي والخطوات التصحيحية</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenObjectionModal(viol)}
                    className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>لائحة الاعتراض</span>
                  </button>

                  <button
                    onClick={() => onConsultSpecialist(`معالجة المخالفة رقم ${viol.violationNumber}`)}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                  >
                    طلب تنفيذ التصحيح
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
