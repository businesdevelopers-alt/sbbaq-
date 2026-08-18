import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck,
  Headphones,
  Sparkles
} from 'lucide-react';
import { Establishment } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment;
  showToast?: (msg: string) => void;
  onOpenAI?: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  establishment,
  showToast,
  onOpenAI,
}) => {
  const [topic, setTopic] = useState<'licensing' | 'technical' | 'fees' | 'violations' | 'general'>('licensing');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast?.('يرجى كتابة عنوان المشكلة والتفاصيل.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketNumber(generatedTicket);
      setIsSuccess(true);
      showToast?.(`تم فتح تذكرة الدعم الفني بنجاح رقم: ${generatedTicket}`);
    }, 800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-['Cairo']">
                الدعم الفني ومستشار الامتثال
              </h3>
              <p className="text-xs text-teal-200/80">
                فريق سبّاق جاهز لمساعدتك في أي استفسار أو معاملة حكومية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 font-['Cairo']">
                  تم استلام طلبك بنجاح!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  رقم تذكرة المتابعة: <strong className="text-emerald-700 font-mono text-sm">{ticketNumber}</strong>
                </p>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  سيقوم أخصائي الامتثال والتراخيص بالتواصل معك خلال ساعات العمل الرسمية عبر البريد الإلكتروني أو الهاتف المسجل للمنشأة.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Quick AI Advisor Switch */}
              {onOpenAI && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block font-['Cairo']">
                        هل تحتاج إجابة فورية عن الأنظمة؟
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        اسأل مستشار سبّاق الذكي المدرب على اللوائح والاشتراطات السعودية
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAI();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
                  >
                    استشارة فورية
                  </button>
                </div>
              )}

              {/* Topic Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  تصنيف الطلب
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { id: 'licensing', label: 'تجديد وإصدار التراخيص' },
                    { id: 'violations', label: 'اعتراض ومعالجة مخالفة' },
                    { id: 'fees', label: 'استفسار مالي ورسوم' },
                    { id: 'technical', label: 'مشكلة تقنية بالمنصة' },
                    { id: 'general', label: 'استفسار عام' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTopic(t.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all text-xs ${
                        topic === t.id
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  عنوان الموضوع
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: استفسار حول مهلة تجديد رخصة بلدي للفرع..."
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Priority */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-500">مستوى الأهمية:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'normal'}
                    onChange={() => setPriority('normal')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>عادي (خلال 24 ساعة)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-rose-700">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'urgent'}
                    onChange={() => setPriority('urgent')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>عاجل (خلال ساعتين)</span>
                </label>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  تفاصيل المشكلة أو الاستفسار
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="يرجى ذكر رقم المعاملة أو الترخيص إن وجد..."
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Direct Contacts Info */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800">قنوات التواصل المباشر:</div>
                <div className="flex flex-wrap items-center gap-4 text-slate-700">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>الهاتف الموحد:</strong> 920000000
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <strong>البريد:</strong> support@sabbaq.sa
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <strong>أوقات العمل:</strong> الأحد - الخميس (8 ص - 6 م)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال التذكرة'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
