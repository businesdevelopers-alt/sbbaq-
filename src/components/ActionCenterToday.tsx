import React from 'react';
import { 
  AlertCircle, 
  Upload, 
  CheckCircle2, 
  CreditCard, 
  RotateCw, 
  FileText, 
  MessageSquare, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { ActionItemToday } from '../types';

interface ActionCenterTodayProps {
  actionItems: ActionItemToday[];
  onActionClick: (item: ActionItemToday) => void;
  onDismissItem?: (id: string) => void;
}

export const ActionCenterToday: React.FC<ActionCenterTodayProps> = ({
  actionItems,
  onActionClick,
  onDismissItem,
}) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'renew_license':
        return <RotateCw className="w-5 h-5 text-amber-600" />;
      case 'auto_renew_contract':
      case 'renew_contract':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'handle_violation':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'approve_quote':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'pay_invoice':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'upload_doc':
        return <Upload className="w-5 h-5 text-indigo-600" />;
      case 'reply_specialist':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          border: 'border-red-200 bg-red-50/40 hover:bg-red-50/80',
          badge: 'bg-red-100 text-red-800 border-red-200',
          label: 'عاجل جداً',
        };
      case 'high':
        return {
          border: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/80',
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          label: 'أولوية مرتفعة',
        };
      default:
        return {
          border: 'border-slate-200 bg-white hover:bg-slate-50',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'إجراء معلق',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-l from-slate-50 via-white to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
                المطلوب منك اليوم
              </h2>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {actionItems.length} مهام معلقة
              </span>
            </div>
            <p className="text-xs text-slate-500">
              إجراءات وموافقات ونواقص مستندات تضمن سريان تراخيصك ورفع مؤشر امتثال منشأتك
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>تحديث استباقي لحظي</span>
        </div>
      </div>

      {/* Action Items List */}
      <div className="p-4 divide-y divide-slate-100">
        {actionItems.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">ممتاز! لا توجد إجراءات متأخرة اليوم</p>
            <p className="text-xs text-slate-500 mt-1">جميع المستندات والتراخيص وعروض الأسعار محدثة بنجاح.</p>
          </div>
        ) : (
          actionItems.map((item) => {
            const pStyle = getPriorityStyle(item.priority);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border ${pStyle.border} transition-all my-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getActionIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${pStyle.badge}`}>
                        {pStyle.label}
                      </span>
                      {item.dueDate && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          الموعد الأخير: {item.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onActionClick(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
