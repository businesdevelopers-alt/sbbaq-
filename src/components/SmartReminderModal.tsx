import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  Building2,
  Send
} from 'lucide-react';
import { ProactiveAlertItem, Establishment } from '../types';

export interface SmartReminderData {
  id: string;
  itemKey: string; // unique item id (item.id or documentNumber)
  establishmentId: string;
  title: string;
  documentNumber: string;
  authority: string;
  expiryDate: string;
  daysBefore: number; // e.g. 3 (default)
  customReminderDate?: string;
  calculatedTriggerDate: string;
  channels: {
    email: boolean;
    inApp: boolean;
    whatsapp: boolean;
  };
  recipientEmail: string;
  recipientPhone: string;
  customNotes: string;
  createdAt: string;
  status: 'scheduled' | 'sent' | 'cancelled';
}

interface SmartReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProactiveAlertItem | null;
  establishment: Establishment;
  existingReminder?: SmartReminderData | null;
  onSaveReminder: (reminder: SmartReminderData) => void;
  onDeleteReminder?: (reminderId: string) => void;
  showToast: (msg: string) => void;
}

export const SmartReminderModal: React.FC<SmartReminderModalProps> = ({
  isOpen,
  onClose,
  item,
  establishment,
  existingReminder,
  onSaveReminder,
  onDeleteReminder,
  showToast
}) => {
  // Preset options for days before
  const presetDays = [
    { days: 3, label: 'قبل 3 أيام', tag: 'الموصى به ⭐', desc: 'المهلة المثالية للمراجعة والسداد' },
    { days: 1, label: 'قبل يوم واحد', tag: 'تنبيه عاجل ⚡', desc: 'آخر فرصة لتفادي الغرامات' },
    { days: 7, label: 'قبل أسبوع (7 أيام)', tag: 'استباقي', desc: 'وقت كافٍ لتجهيز المتطلبات' },
    { days: 15, label: 'قبل 15 يوماً', tag: 'مبكر', desc: 'تنسيق متقدم مع الجهات الحكومية' },
    { days: 30, label: 'قبل شهر (30 يوماً)', tag: 'تخطيط مالي', desc: 'إدراج التكاليف في ميزانية الشهر' },
    { days: 0, label: 'تاريخ مخصص 📅', tag: 'يدوي', desc: 'حدد يوماً محدداً للإشعار' },
  ];

  const [selectedDaysBefore, setSelectedDaysBefore] = useState<number>(3);
  const [customDate, setCustomDate] = useState<string>('');
  const [channels, setChannels] = useState<{
    email: boolean;
    inApp: boolean;
    whatsapp: boolean;
  }>({
    email: true,
    inApp: true,
    whatsapp: false
  });
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Load existing reminder or initialize defaults
  useEffect(() => {
    if (!item) return;

    if (existingReminder) {
      setSelectedDaysBefore(existingReminder.daysBefore);
      setCustomDate(existingReminder.customReminderDate || '');
      setChannels(existingReminder.channels);
      setRecipientEmail(existingReminder.recipientEmail || establishment.contactEmail || 'compliance@sabbaq.sa');
      setRecipientPhone(existingReminder.recipientPhone || establishment.contactPhone || '0501234567');
      setCustomNotes(existingReminder.customNotes || '');
    } else {
      setSelectedDaysBefore(3); // Default: 3 days prior as requested
      setChannels({ email: true, inApp: true, whatsapp: false });
      setRecipientEmail(establishment.contactEmail || 'compliance@sabbaq.sa');
      setRecipientPhone(establishment.contactPhone || '0501234567');
      setCustomNotes(`تنبيه استباقي: يرجى استكمال إجراءات تجديد ${item.title} رقم (${item.documentNumber}) وسداد الرسوم الحكومية تفادياً لأي غرامات انقطاع أو إيقاف خدمات.`);
    }
  }, [existingReminder, item, establishment, isOpen]);

  if (!isOpen || !item) return null;

  // Calculate target reminder date
  const calculateTriggerDate = (): string => {
    if (selectedDaysBefore === 0 && customDate) {
      return customDate;
    }

    try {
      const exp = new Date(item.expiryDate);
      if (isNaN(exp.getTime())) return item.expiryDate;
      
      const targetDate = new Date(exp);
      targetDate.setDate(targetDate.getDate() - selectedDaysBefore);
      
      return targetDate.toISOString().split('T')[0];
    } catch {
      return item.expiryDate;
    }
  };

  const triggerDateString = calculateTriggerDate();

  // Format date in Arabic for display
  const formatArabicDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleToggleChannel = (channel: 'email' | 'inApp' | 'whatsapp') => {
    setChannels(prev => {
      const updated = { ...prev, [channel]: !prev[channel] };
      // Ensure at least one channel is selected
      if (!updated.email && !updated.inApp && !updated.whatsapp) {
        showToast('يجب اختيار قناة إشعار واحدة على الأقل');
        return prev;
      }
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!channels.email && !channels.inApp && !channels.whatsapp) {
      showToast('⚠️ يرجى تفعيل قناة إشعار واحدة على الأقل (البريد، المنصة، أو واتساب)');
      return;
    }

    if (channels.email && !recipientEmail.trim()) {
      showToast('⚠️ يرجى إدخال البريد الإلكتروني لاستلام الإشعار');
      return;
    }

    const newReminder: SmartReminderData = {
      id: existingReminder ? existingReminder.id : `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      itemKey: item.id,
      establishmentId: establishment.id,
      title: item.title,
      documentNumber: item.documentNumber,
      authority: item.authority,
      expiryDate: item.expiryDate,
      daysBefore: selectedDaysBefore,
      customReminderDate: selectedDaysBefore === 0 ? customDate : undefined,
      calculatedTriggerDate: triggerDateString,
      channels,
      recipientEmail: recipientEmail.trim(),
      recipientPhone: recipientPhone.trim(),
      customNotes: customNotes.trim(),
      createdAt: existingReminder ? existingReminder.createdAt : new Date().toISOString(),
      status: 'scheduled'
    };

    onSaveReminder(newReminder);
    showToast(`🔔 تم حفظ وجدولة التذكير الذكي بنجاح (${selectedDaysBefore === 0 ? 'تاريخ مخصص' : `قبل الموعد بـ ${selectedDaysBefore} أيام`})`);
    onClose();
  };

  const handleDelete = () => {
    if (existingReminder && onDeleteReminder) {
      onDeleteReminder(existingReminder.id);
      showToast('🗑️ تم إلغاء التذكير الذكي المجدول');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">جدولة تذكير ذكي للرخصة</h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30">
                  قبل 3 أيام
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                تنبيه استباقي ذكي لضمان استكمال التجديد وسداد الرسوم قبل الموعد النهائي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Target License Info Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{item.title}</span>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                  #{item.documentNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span>الجهة: {item.authority}</span>
                {item.branchName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {item.branchName}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium">تاريخ الانتهاء الرسمي:</span>
              <span className="font-mono text-xs font-black text-rose-700">{item.expiryDate}</span>
            </div>
          </div>

          {/* Timing Selector (Preset Options) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>توقيت إرسال التذكير:</span>
              </span>
              <span className="text-slate-400 font-normal text-[11px]">اختر متى ترغب في استلام التنبيه</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presetDays.map(preset => {
                const isSelected = selectedDaysBefore === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setSelectedDaysBefore(preset.days)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {preset.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        preset.days === 3 
                          ? 'bg-amber-100 text-amber-800'
                          : isSelected 
                          ? 'bg-indigo-200/60 text-indigo-900' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {preset.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input when selected */}
            {selectedDaysBefore === 0 && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in-50">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  تحديد تاريخ الإشعار المخصص:
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Dynamic Calculation Date Highlight Banner */}
          <div className="bg-indigo-950 text-white p-3 rounded-xl flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 block font-semibold">موعد إطلاق التذكير الآلي:</span>
                <span className="font-mono text-xs font-black text-amber-300">
                  {triggerDateString} ({formatArabicDate(triggerDateString)})
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-indigo-800/80 px-2 py-1 rounded-md text-indigo-200 border border-indigo-700 shrink-0">
              {selectedDaysBefore === 0 ? 'مخصص' : `قبل الموعد بـ ${selectedDaysBefore} أيام`}
            </span>
          </div>

          {/* Notification Channels Selection */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>قنوات استلام التذكير:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Email Channel */}
              <div 
                onClick={() => handleToggleChannel('email')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  channels.email 
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/20' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                  channels.email ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {channels.email && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>البريد الإلكتروني</span>
                  </span>
                  <span className="text-[10px] text-slate-500">رسالة تذكير مفصلة مع رابط السداد</span>
                </div>
              </div>

              {/* In-App Platform Channel */}
              <div 
                onClick={() => handleToggleChannel('inApp')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  channels.inApp 
                    ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/20' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                  channels.inApp ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {channels.inApp && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    <span>إشعار بالمنصة</span>
                  </span>
                  <span className="text-[10px] text-slate-500">تنبيه بارز فوري بلوحة التحكم</span>
                </div>
              </div>

              {/* WhatsApp Channel */}
              <div 
                onClick={() => handleToggleChannel('whatsapp')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  channels.whatsapp 
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                  channels.whatsapp ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {channels.whatsapp && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تطبيق واتساب</span>
                  </span>
                  <span className="text-[10px] text-slate-500">إشعار مباشر على جوال المسؤول</span>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Input Fields for selected channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {channels.email && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  البريد الإلكتروني للتنبيه:
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}

            {channels.whatsapp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رقم الواتساب المسجل:
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Custom Notes / Instructions */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              نص التذكير / ملاحظات فريق الامتثال (اختياري):
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="اكتب ملاحظات إضافية للتذكير..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <div>
              {existingReminder && onDeleteReminder && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء التذكير</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{existingReminder ? 'تحديث التذكير الذكي' : 'حفظ وجدولة التذكير'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
