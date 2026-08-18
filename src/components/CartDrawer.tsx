import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Building2, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Clock,
  PieChart as PieChartIcon,
  Landmark,
  Sparkles,
  Receipt,
  Percent,
  RotateCw,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { OrderItem, ServiceCatalogItem, Establishment } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onRemoveItem: (id: string) => void;
  onSubmitOrder: (customNotes: string, autoApproved?: boolean) => void;
  activeEstablishment: Establishment;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onSubmitOrder,
  activeEstablishment,
}) => {
  const [customNotes, setCustomNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoApproved, setIsAutoApproved] = useState(true);

  if (!isOpen) return null;

  const totalGov = cartItems.reduce((sum, item) => sum + item.govFee, 0);
  const totalSabbaq = cartItems.reduce((sum, item) => sum + item.sabbaqFee, 0);
  const totalVat = cartItems.reduce((sum, item) => sum + item.vat, 0);
  const grandTotal = totalGov + totalSabbaq + totalVat;

  const govPercentage = grandTotal > 0 ? Math.round((totalGov / grandTotal) * 100) : 0;
  const sabbaqPercentage = grandTotal > 0 ? Math.round((totalSabbaq / grandTotal) * 100) : 0;
  const vatPercentage = grandTotal > 0 ? Math.max(0, 100 - govPercentage - sabbaqPercentage) : 0;

  // Check if cart contains recurring / renewal services
  const hasRenewalServices = cartItems.some(i => 
    i.type === 'renewal' || 
    i.serviceName.includes('تجديد') || 
    i.serviceName.includes('رخصة') ||
    i.serviceName.includes('شهادة') ||
    i.serviceName.includes('اشتراك')
  );

  // Chart data
  const costBreakdownData = useMemo(() => {
    if (grandTotal === 0) return [];
    return [
      {
        name: 'الرسوم الحكومية الرسمية',
        value: totalGov,
        percentage: govPercentage,
        color: '#0284C7', // Sky / Blue
        description: 'تسدد 100% مباشرة للجهات الحكومية (بلدي، سلامة، قوى، مقيم، ZATCA)'
      },
      {
        name: 'رسوم وأتعاب منصة سبّاق',
        value: totalSabbaq,
        percentage: sabbaqPercentage,
        color: '#059669', // Emerald
        description: 'أتعاب التدقيق الهندسي، إعداد الملفات، المتابعة والزيارات الميدانية'
      },
      {
        name: 'ضريبة القيمة المضافة (15%)',
        value: totalVat,
        percentage: vatPercentage,
        color: '#D97706', // Amber
        description: 'الضريبة النظامية المقررة من هيئة الزكاة والضريبة والجمارك'
      }
    ].filter(item => item.value > 0);
  }, [totalGov, totalSabbaq, totalVat, grandTotal, govPercentage, sabbaqPercentage, vatPercentage]);

  const handleSubmit = () => {
    if (!agreedTerms) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitOrder(customNotes, isAutoApproved);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-right min-w-[190px] space-y-1 font-['Cairo'] text-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              {data.percentage}%
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 text-[11px]">
            <span className="text-slate-400">المبلغ:</span>
            <strong className="text-white font-bold">{formatSAR(data.value)}</strong>
          </div>
          <p className="text-[10px] text-slate-300 pt-0.5 leading-tight">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 left-5 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold font-['Cairo']">سلة الخدمات والطلبات</h2>
            </div>
            <p className="text-xs text-slate-300">
              مراجعة الخدمات الحكومية المختارة للتنفيذ عبر فريق سبّاق مع تفصيل الرسوم
            </p>

            {/* Establishment Info Pill */}
            <div className="mt-3 bg-white/10 rounded-xl p-2.5 flex items-center gap-2 text-xs border border-white/10">
              <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 block text-[10px]">المنشأة المستفيدة:</span>
                <strong className="text-white truncate">{activeEstablishment.name}</strong>
              </div>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-sm">سلة الطلبات فارغة حالياً</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  تصفح دليل الخدمات أو استخدم حاسبة الرسوم لإضافة التراخيص التي ترغب بتنفيذها.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Cost Breakdown & Visual Chart Section */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <div className="flex items-center gap-1.5">
                      <PieChartIcon className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-slate-900 font-['Cairo']">
                        ملخص وتقسيم التكاليف والرسوم
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      إجمالي: {formatSAR(grandTotal)}
                    </span>
                  </div>

                  {/* Visual Donut Chart + Share Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Donut Chart */}
                    <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                      <div className="w-full h-36 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={costBreakdownData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={36}
                              outerRadius={56}
                              paddingAngle={3}
                              stroke="#ffffff"
                              strokeWidth={2}
                            >
                              {costBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-xs font-black text-slate-900 font-['Cairo']">
                            {cartItems.length}
                          </span>
                          <span className="text-[9px] text-slate-500 font-semibold">
                            خدمات
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Breakdown Bars */}
                    <div className="sm:col-span-7 space-y-2 text-xs">
                      {/* Government Fees Row */}
                      <div className="bg-sky-50/70 border border-sky-100 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-950 flex items-center gap-1 text-[11px]">
                            <Landmark className="w-3.5 h-3.5 text-sky-700" />
                            <span>الرسوم الحكومية:</span>
                          </span>
                          <div className="text-right">
                            <strong className="text-sky-900 font-mono">{formatSAR(totalGov)}</strong>
                            <span className="text-[10px] text-sky-700 mr-1 font-bold">({govPercentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-sky-200/60 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${govPercentage}%` }} />
                        </div>
                      </div>

                      {/* Sabbaq Platform Fees Row */}
                      <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            <span>أتعاب منصة سبّاق:</span>
                          </span>
                          <div className="text-right">
                            <strong className="text-emerald-900 font-mono">{formatSAR(totalSabbaq)}</strong>
                            <span className="text-[10px] text-emerald-700 mr-1 font-bold">({sabbaqPercentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${sabbaqPercentage}%` }} />
                        </div>
                      </div>

                      {/* VAT Row */}
                      <div className="bg-amber-50/70 border border-amber-100 p-2 rounded-xl flex items-center justify-between text-[11px]">
                        <span className="text-amber-900 font-semibold flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-amber-700" />
                          <span>ضريبة القيمة المضافة (15%):</span>
                        </span>
                        <div className="text-right">
                          <strong className="text-amber-950 font-mono">{formatSAR(totalVat)}</strong>
                          <span className="text-[10px] text-amber-700 mr-1 font-bold">({vatPercentage}%)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>الخدمات المضافة في السلة ({cartItems.length}):</span>
                    <span>تفاصيل التكلفة لكل معاملة</span>
                  </div>

                  {cartItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            {item.authority}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm font-['Cairo'] mt-1">
                            {item.serviceName}
                          </h4>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Distinct Fees Grid for each Item */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="border-l border-slate-200/80 pl-2">
                          <span className="text-[10px] text-slate-500 block">رسوم حكومية</span>
                          <strong className="text-sky-800 font-mono font-bold text-[11px]">
                            {formatSAR(item.govFee)}
                          </strong>
                        </div>
                        <div className="border-l border-slate-200/80 pl-2">
                          <span className="text-[10px] text-slate-500 block">أتعاب سبّاق</span>
                          <strong className="text-emerald-800 font-mono font-bold text-[11px]">
                            {formatSAR(item.sabbaqFee)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">شامل الضريبة</span>
                          <strong className="text-slate-900 font-mono font-extrabold text-[11px]">
                            {formatSAR(item.total)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Additional Notes Box */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ملاحظات أو توجيهات إضافية لفريق سبّاق (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="مثال: يرجى التنسيق معي بخصوص موعد معاينة البلدية أو زيارة الدفاع المدني..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3.5">
              
              {/* Separate Summary Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-sky-50/80 border border-sky-200/80 p-2.5 rounded-xl">
                  <span className="text-[10px] text-sky-800 font-semibold block">إجمالي الرسوم الحكومية:</span>
                  <strong className="text-sm font-bold text-sky-950 font-mono block mt-0.5">
                    {formatSAR(totalGov)}
                  </strong>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-semibold block">أتعاب منصة سبّاق:</span>
                  <strong className="text-sm font-bold text-emerald-950 font-mono block mt-0.5">
                    {formatSAR(totalSabbaq)}
                  </strong>
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>ضريبة القيمة المضافة (15% على رسوم الخدمات):</span>
                  <span className="font-mono font-semibold">{formatSAR(totalVat)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900 font-['Cairo']">
                  <span>المبلغ الإجمالي المعتمد:</span>
                  <span className="text-emerald-700 font-mono">{formatSAR(grandTotal)}</span>
                </div>
              </div>

              {/* Auto-Approval Option for Annual License Renewals */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isAutoApproved 
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md ${isAutoApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 font-['Cairo'] flex items-center gap-1.5">
                        <span>اعتماد تلقائي لطلبات تجديد الرخص السنوية</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                          تنفيذ فوري
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pr-6">
                      إرسال الطلب فورياً ومباشرة إلى الفريق المختص فور موافقتك على الرسوم التقديرية لتسريع إجراءات التجديد وتفادي أي انقطاع نظامي أو غرامات.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={isAutoApproved}
                      onChange={(e) => setIsAutoApproved(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {isAutoApproved && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/70 flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      مفعل: سيتم تخطي مرحلة انتظار اعتماد عرض السعر والبدء المباشر بالمطابقة والرفع الحكومي.
                    </span>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded-xs mt-0.5"
                />
                <span>
                  أوافق على الشروط والأحكام وتفويض فريق سبّاق لمراجعة الطلب والمطابقة مع الجهات الحكومية والبدء بالتنفيذ.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                disabled={cartItems.length === 0 || !agreedTerms || isSubmitting}
                onClick={handleSubmit}
                className={`w-full py-3 px-4 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-['Cairo'] text-sm ${
                  isAutoApproved 
                    ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/30' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? (
                  <span>جاري إرسال الطلب وإحالته للفريق المختص فورياً...</span>
                ) : isAutoApproved ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-200" />
                    <span>موافقة على الرسوم وإرسال فوري للفريق المختص (اعتماد تلقائي)</span>
                  </>
                ) : (
                  <>
                    <span>إرسال الطلب لمراجعة فريق سبّاق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isAutoApproved 
                    ? 'يتم تحويل الطلب فوراً إلى حالة التنفيذ وتعيين أخصائي المعاملات' 
                    : 'يتم إصدار رقم طلب رئيسي وتعيين مستشار مختص فور الإرسال'}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
