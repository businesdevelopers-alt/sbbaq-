import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  FileCheck2,
  TrendingDown,
  DollarSign,
  QrCode,
  Sparkles,
  Sliders,
  Eye,
  Award
} from 'lucide-react';
import {
  Establishment,
  License,
  DocumentItem,
  RiskAssessment,
  Branch,
  ActionItemToday
} from '../types';
import { formatSAR, calculateEstablishmentRisk, calculateTotalEstimatedFines } from '../utils/complianceEngine';

export interface ComplianceReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  riskAssessment?: RiskAssessment | null;
  branches: Branch[];
  actionItems?: ActionItemToday[];
}

export const ComplianceReportPdfModal: React.FC<ComplianceReportPdfModalProps> = ({
  isOpen,
  onClose,
  establishment,
  licenses,
  documents,
  riskAssessment,
  branches,
  actionItems = [],
}) => {
  // Customization Options
  const [includeLicenses, setIncludeLicenses] = useState(true);
  const [includeRiskMatrix, setIncludeRiskMatrix] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeBranches, setIncludeBranches] = useState(true);
  const [includeActionPlan, setIncludeActionPlan] = useState(true);
  const [reportNote, setReportNote] = useState('تقرير صادر آلياً ومعتمد لأغراض التدقيق الداخلي والرقابة الوقائية وإدارة المخاطر الحكومية.');

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute key stats
  const calculatedRisk = riskAssessment || calculateEstablishmentRisk(establishment, licenses, documents, [], []);
  const healthScore = establishment.complianceScore ?? Math.max(0, Math.min(100, 100 - calculatedRisk.overallScore));
  const totalExposure = calculatedRisk.potentialFines || calculateTotalEstimatedFines(licenses);

  const activeLicenses = licenses.filter(l => l.status === 'valid' || l.status === 'active');
  const expiringSoonLicenses = licenses.filter(l => l.status === 'expiring_soon' || l.daysRemaining <= 30);
  const expiredLicenses = licenses.filter(l => l.status === 'expired' || l.daysRemaining <= 0);

  const validDocs = documents.filter(d => d.status === 'verified' || d.status === 'valid');
  const missingOrExpiringDocs = documents.filter(d => d.status === 'expiring_soon' || d.status === 'expired' || d.status === 'missing');

  const reportId = `SBQ-REP-${establishment.crNumber ? establishment.crNumber.slice(-4) : '2026'}-${Date.now().toString().slice(-4)}`;
  const currentDateFormatted = new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 85) return 'مستوى امتثال مرتفع (آمن)';
    if (score >= 60) return 'مستوى امتثال متوسط (يتطلب متابعة)';
    return 'مستوى امتثال حرج (مخاطر غرامات وإغلاق)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-['Cairo'] animate-in fade-in duration-200">
      
      {/* Container Box */}
      <div className="bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Modal Controls Header (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">تصدير تقرير الامتثال والمخاطر الشامل (PDF)</h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                  جاهز للطباعة والتحميل
                </span>
              </div>
              <p className="text-xs text-slate-400">
                منشأة: {establishment.name} • سجل تجاري: {establishment.crNumber || '1010XXXXXX'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Customizer Bar (Hidden in Print) */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300 shrink-0 print:hidden">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>الأقسام المضمنة:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={includeLicenses}
              onChange={(e) => setIncludeLicenses(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
            />
            <span>جرد التراخيص ({licenses.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={includeRiskMatrix}
              onChange={(e) => setIncludeRiskMatrix(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
            />
            <span>مصفوفة ومحاكي المخاطر</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={includeDocuments}
              onChange={(e) => setIncludeDocuments(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
            />
            <span>الوثائق والشهادات ({documents.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={includeActionPlan}
              onChange={(e) => setIncludeActionPlan(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
            />
            <span>خطة العمل والتوصيات</span>
          </label>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-800/40 print:bg-white print:p-0 print:overflow-visible">
          
          <div
            ref={printAreaRef}
            id="printable-compliance-report"
            className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl max-w-3xl mx-auto space-y-8 print:shadow-none print:rounded-none print:p-8 print:max-w-none print:m-0 border border-slate-200 print:border-none"
            dir="rtl"
          >
            {/* 1. OFFICIAL DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-950 font-['Cairo'] tracking-tight">
                      منصة سبّاق الامتثال
                    </h1>
                    <div className="text-xs font-bold text-emerald-800">
                      المنظومة الوطنية الموحدة لضبط التراخيص والمخاطر الحكومية
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      معتمد وفق اشتراطات كود البناء ولوائح وزارة البلديات والدفاع المدني
                    </div>
                  </div>
                </div>

                <div className="text-left space-y-1 text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block font-mono font-bold text-slate-800">
                    {reportId}
                  </div>
                  <div className="text-[11px] text-slate-500 block">
                    تاريخ الإصدار: {currentDateFormatted}
                  </div>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="bg-slate-950 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black font-['Cairo']">
                    تقرير المراجعة التنظيمية ومؤشر الامتثال والمخاطر
                  </h2>
                  <p className="text-xs text-slate-300">
                    Compliance & Regulatory Risk Assessment Official Certificate
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-md">
                    سري وموثق
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ESTABLISHMENT PROFILE INFO TABLE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">اسم المنشأة / الشركة:</span>
                <strong className="text-slate-900 font-bold text-xs truncate block">{establishment.name}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">رقم السجل التجاري:</span>
                <strong className="text-slate-900 font-mono font-bold text-xs">{establishment.crNumber || '1010XXXXXX'}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">النشاط التجاري والقطاع:</span>
                <strong className="text-slate-900 font-bold text-xs truncate block">{establishment.sector || 'تجاري / خدمات'}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">المدينة والفروع:</span>
                <strong className="text-slate-900 font-bold text-xs">{establishment.city || 'الرياض'} ({branches.length} فروع)</strong>
              </div>
            </div>

            {/* 3. EXECUTIVE HEALTH SCORE & RISK MATRIX SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Score Box */}
              <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between text-center ${getScoreColor(healthScore)}`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">مؤشر الامتثال الكلي</span>
                  <div className="text-4xl font-black font-['Cairo'] my-2">
                    {healthScore}<span className="text-xl font-normal"> / 100</span>
                  </div>
                </div>
                <div className="text-xs font-bold py-1 px-2 rounded-lg bg-white/70 border border-current">
                  {getScoreBadgeText(healthScore)}
                </div>
              </div>

              {/* Exposure Forecast */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between md:col-span-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-rose-600" />
                      <span>حجم التعرض المالي والغرامات التقديرية المحتملة</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {formatSAR(totalExposure)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    تم تقدير المخاطر المالية وفق جدول لائحة الغرامات والجزاءات البلدية المعتمدة وجدول مخالفات الدفاع المدني ونظام العمل.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-emerald-600 font-bold block">تراخيص سارية</span>
                    <strong className="text-slate-900 font-bold">{activeLicenses.length}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-amber-600 font-bold block">قريبة الانتهاء</span>
                    <strong className="text-slate-900 font-bold">{expiringSoonLicenses.length}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-rose-600 font-bold block">منتهية / حرجة</span>
                    <strong className="text-slate-900 font-bold">{expiredLicenses.length}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* 4. LICENSES INVENTORY TABLE */}
            {includeLicenses && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo'] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>جرد وتفاصيل التراخيص الحكومية المعتمدة</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">إجمالي: {licenses.length} تراخيص</span>
                </div>

                <table className="w-full text-right text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <th className="p-2.5 border-l border-slate-200">الترخيص / الخدمة</th>
                      <th className="p-2.5 border-l border-slate-200">الجهة الحكومية</th>
                      <th className="p-2.5 border-l border-slate-200">رقم الترخيص</th>
                      <th className="p-2.5 border-l border-slate-200">تاريخ الانتهاء</th>
                      <th className="p-2.5 border-l border-slate-200">الحالة التنظيمية</th>
                      <th className="p-2.5">المخاطر التقديرية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((lic, idx) => (
                      <tr key={lic.id || idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">
                          {lic.name}
                        </td>
                        <td className="p-2.5 border-l border-slate-200 text-slate-700">
                          {lic.authority}
                        </td>
                        <td className="p-2.5 border-l border-slate-200 font-mono text-slate-600">
                          {lic.licenseNumber || '—'}
                        </td>
                        <td className="p-2.5 border-l border-slate-200 font-mono text-slate-700">
                          {lic.expiryDate}
                          {lic.daysRemaining !== undefined && (
                            <span className="text-[10px] text-slate-500 block">
                              ({lic.daysRemaining > 0 ? `متبقي ${lic.daysRemaining} يوم` : 'منتهي'})
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 border-l border-slate-200">
                          {lic.status === 'valid' || lic.status === 'active' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                              ساري
                            </span>
                          ) : lic.status === 'expiring_soon' ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-200">
                              قريب الانتهاء
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-200">
                              منتهي / حرج
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700">
                          {lic.potentialPenalty ? formatSAR(lic.potentialPenalty) : 'لا يوجد'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. LEGAL DOCUMENTS & VAULT STATUS */}
            {includeDocuments && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo'] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-teal-700" />
                    <span>موقف المستندات والشهادات القانونية الرسمية</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    {validDocs.length} مكتمل • {missingOrExpiringDocs.length} يتطلب إجراء
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {documents.map((doc, idx) => {
                    const isValid = doc.status === 'verified' || doc.status === 'valid';
                    return (
                      <div
                        key={doc.id || idx}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          isValid ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-500 block">{doc.category || 'مستند حكومي'}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-600">{doc.expiryDate || 'ساري'}</span>
                          <span className={isValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {isValid ? 'مكتمل ومعتمد' : 'يتطلب تحديث'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. RECOMMENDED ACTION PLAN & COMPLIANCE TASKS */}
            {includeActionPlan && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo'] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>خطة الإجراءات التصحيحية والتوصيات الاستباقية الموصى بها</span>
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                    <strong className="text-emerald-950 font-bold block">1. تجديد وتحديث التراخيص المعرضة للإيقاف:</strong>
                    <p className="text-emerald-900 text-[11px] leading-relaxed">
                      البدء الفوري في إجراءات تجديد الرخص التي تقل صلاحيتها عن 30 يوماً لتجنب إيقاف الخدمات البنكية ورسوم الغرامات التصاعدية.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                    <strong className="text-blue-950 font-bold block">2. الرقابة الوقائية الميدانية للوحات واشتراطات كود البناء:</strong>
                    <p className="text-blue-900 text-[11px] leading-relaxed">
                      التأكد من مطابقة مقاسات اللوحات الإعلانية لكود بلدي المعتمد ووجود طفايات الحريق وصلاحية عقود الصيانة الدورية.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-950 font-bold block">3. التوثيق الإلكتروني لعقود الإيجار والشهادات الصحية:</strong>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      ربط كافة العقود بشبكة إيجار الموحدة وتحديث كروت الفحص الطبي للعاملين في الأنشطة الغذائية والصحية.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. OFFICIAL VERIFICATION & FOOTER SIGNATURE */}
            <div className="pt-6 border-t-2 border-slate-900 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs">
                
                {/* QR Code & Verification */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center p-1">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-600 space-y-0.5">
                    <strong className="text-slate-900 block font-bold">التحقق الإلكتروني</strong>
                    <span>امسح الرمز للتحقق من صحة وصلاحية بيانات التقرير الرسمية</span>
                  </div>
                </div>

                {/* Audit Authority Seal */}
                <div className="text-center space-y-1 border-x border-slate-200 px-4">
                  <div className="text-[10px] text-slate-500">جهة التقييم والتدقيق</div>
                  <strong className="text-xs text-slate-900 block font-bold font-['Cairo']">
                    وحدة الامتثال وإدارة المخاطر - سبّاق
                  </strong>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    معتمد ومطابق رقمياً
                  </span>
                </div>

                {/* Official Stamp Simulation */}
                <div className="text-left space-y-1">
                  <div className="text-[10px] text-slate-500">الختم الرقمي والتوقيع</div>
                  <div className="inline-block p-2 rounded-xl border-2 border-dashed border-emerald-700 text-emerald-800 font-black text-xs">
                    سبّاق • SABBAQ COMPLIANCE
                  </div>
                </div>

              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                جميع الحقوق محفوظة © {new Date().getFullYear()} منصة سبّاق لتقنية المعلومات والامتثال • الرياض، المملكة العربية السعودية
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
