import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Building2, 
  ArrowUpRight, 
  Send, 
  Phone, 
  Calendar,
  AlertCircle,
  Award,
  Upload,
  ChevronLeft
} from 'lucide-react';
import { MasterOrder, Establishment, License, UserAccount } from '../types';
import { formatSAR, getOrderStatusBadge } from '../utils/complianceEngine';

interface PartnerAgentDashboardProps {
  currentUser?: UserAccount;
  orders: MasterOrder[];
  establishments: Establishment[];
  licenses: License[];
  onUpdateOrderStatus: (orderId: string, newStatus: MasterOrder['status'], notes?: string) => void;
  onUpdateGovTransactionNumber: (orderId: string, govTx: string) => void;
  showToast?: (msg: string) => void;
}

export const PartnerAgentDashboard: React.FC<PartnerAgentDashboardProps> = ({
  currentUser,
  orders,
  establishments,
  licenses,
  onUpdateOrderStatus,
  onUpdateGovTransactionNumber,
  showToast = (_msg?: string) => {}
}) => {
  const [selectedTaskOrderId, setSelectedTaskOrderId] = useState<string | null>(orders[0]?.id || null);
  const [uploadGovNote, setUploadGovNote] = useState('');
  const [govTxInput, setGovTxInput] = useState('');

  const assignedTasks = orders.filter(o => o.assignedSpecialist?.includes(currentUser?.name || '') || o.status === 'in_progress');
  const activeTask = orders.find(o => o.id === selectedTaskOrderId) || assignedTasks[0];

  const totalCommissionsEarned = 14250;
  const pendingCommissions = 3400;

  return (
    <div className="space-y-6 font-['Cairo']">
      
      {/* Partner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 mb-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>بوابة المعقب والشريك الميداني المعتمد</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              مرحباً بك، {currentUser?.name || 'المعقب الشريك'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
              إدارة ومتابعة المعاملات الميدانية المسندة إليك، رفع أرقام القيود الحكومية وتأكيد سداد الرسوم.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[10px] text-amber-200 block">رصيد العمولات المستحقة:</span>
              <strong className="text-lg font-black text-amber-300">{formatSAR(pendingCommissions)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">مهام قيد المتابعة الميدانية</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Cairo']">
            {assignedTasks.length} معاملات
          </div>
          <span className="text-[11px] text-amber-700 font-bold block mt-1">تتطلب مراجعة الدوائر الحكومية</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">المعاملات المنجزة هذا الشهر</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-['Cairo']">
            28 معاملة
          </div>
          <span className="text-[11px] text-emerald-800 font-bold block mt-1">نسبة الالتزام بالوقت: 98%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">إجمالي العمولات المحولة</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-['Cairo']">
            {formatSAR(totalCommissionsEarned)}
          </div>
          <span className="text-[11px] text-blue-800 font-bold block mt-1">محولة إلى حسابك البنكي</span>
        </div>
      </div>

      {/* Main Task Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tasks List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">المعاملات المسندة إليك</h3>
            <span className="text-xs text-slate-500">اختر معاملة لإرفاق إثبات الإنجاز ورقم القيد</span>
          </div>

          <div className="divide-y divide-slate-100">
            {assignedTasks.map((order) => {
              const est = establishments.find(e => e.id === order.establishmentId);
              const badge = getOrderStatusBadge(order.status);
              const isSelected = activeTask?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedTaskOrderId(order.id)}
                  className={`p-4 transition-colors cursor-pointer text-xs space-y-2 ${
                    isSelected ? 'bg-amber-50/70 border-r-4 border-r-amber-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm font-['Cairo'] mt-0.5">
                        {est?.name || 'منشأة عميل'}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-amber-700 font-bold block text-sm">عمولة: {formatSAR(450)}</span>
                      <span className="text-[10px] text-slate-400">المدينة: {est?.city || 'الرياض'}</span>
                    </div>
                  </div>

                  <div className="text-slate-600 text-[11px]">
                    الخدمات: {order.items.map(i => i.serviceName).join(' ، ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Task Details & Action (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          {activeTask ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <span className="font-mono font-bold text-base text-slate-900">{activeTask.orderNumber}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                  {establishments.find(e => e.id === activeTask.establishmentId)?.name}
                </h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تسجيل رقم المعاملة الحكومية:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="مثال: GOV-1447-38910"
                      value={govTxInput}
                      onChange={(e) => setGovTxInput(e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (govTxInput) {
                          onUpdateGovTransactionNumber(activeTask.id, govTxInput);
                          setGovTxInput('');
                          showToast('تم تسجيل رقم المعاملة الحكومية بنجاح.');
                        }
                      }}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات وتقرير الميدان:</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب نتيجة الزيارة الميدانية أو مراجعة البلدية والدفاع المدني..."
                    value={uploadGovNote}
                    onChange={(e) => setUploadGovNote(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(activeTask.id, 'completed', uploadGovNote);
                      showToast('تم تأكيد إنجاز المعاملة وإرسالها لتدقيق إدارة سبّاق.');
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    تأكيد إنجاز المعاملة واستحقاق العمولة
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              حدد معاملة للبدء في تنفيذ الإجراء الميداني.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
