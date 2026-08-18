import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Globe, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Save,
  Key
} from 'lucide-react';
import { Establishment } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment;
  showToast?: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  establishment,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'preferences'>('notifications');
  
  // Notification Channels State
  const [channels, setChannels] = useState({
    whatsapp: true,
    sms: true,
    email: true,
    inApp: true,
  });

  // Threshold alerts
  const [alertDays, setAlertDays] = useState({
    day60: true,
    day30: true,
    day7: true,
    dayExpired: true,
    newViolation: true,
    feeDue: true,
  });

  // Security options
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);

  if (!isOpen) return null;

  const handleSave = () => {
    showToast?.('تم حفظ تفضيلات المنصة وإعدادات الإشعارات بنجاح.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-['Cairo']">
                إعدادات المنصة والتنبيهات
              </h3>
              <p className="text-xs text-slate-300">
                تخصيص قنوات الإشعارات الاستباقية والأمان لـ {establishment.name}
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>قنوات والتنبيهات الاستباقية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>الأمان والنفاذ الوطني</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'border-emerald-600 text-emerald-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>العرض والتفضيلات</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              
              {/* Channel Toggles */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2.5">
                  قنوات استلام التنبيهات والإنذارات:
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">واتساب للأعمال</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={(e) => setChannels(p => ({ ...p, whatsapp: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">رسائل نصية SMS</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels(p => ({ ...p, sms: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">البريد الإلكتروني</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels(p => ({ ...p, email: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-700">إشعارات داخل المنصة</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={(e) => setChannels(p => ({ ...p, inApp: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                </div>
              </div>

              {/* Threshold Alerts */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2.5">
                  مواعيد الإنذار الاستباقي قبل انتهاء الصلاحية:
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'day60', label: 'إنذار مبكر قبل 60 يوماً من الانتهاء', desc: 'بدء التخطيط المالي وتجهيز العقود' },
                    { key: 'day30', label: 'إنذار تنفيذي قبل 30 يوماً من الانتهاء', desc: 'رفع طلب التجديد عبر منصة بلدي أو سلامة' },
                    { key: 'day7', label: 'إنذار حرج قبل 7 أيام من الانتهاء', desc: 'تنبيه فوري لتفادي غرامات التأخير' },
                    { key: 'newViolation', label: 'رصد مخالفة جديدة فور تسجيلها', desc: 'إشعار فوري للاستفادة من مهلة الاعتراض والتخفيض' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={(alertDays as any)[item.key]}
                        onChange={(e) => setAlertDays(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-1"
                      />
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950 font-['Cairo']">
                    الربط مع النفاذ الوطني الموحد (نفاذ)
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    منشأتك مفوضة ومحمية بالتحقق الثنائي عبر تطبيق نفاذ لتوثيق كافة عمليات إصدار وتجديد التراخيص الحكومية وتفويض فريق العمل.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">إلزامية التحقق بخطوتين (2FA)</span>
                    <span className="text-[11px] text-slate-500 block">طلب رمز التحقق عند تسجيل الدخول من جهاز جديد</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                </label>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">مهلة انتهاء الجلسة التلقائي (بالدقائق):</label>
                  <select
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة (مستحسن)</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={120}>ساعتان</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">لغة واجهة المنصة:</label>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                    العربية (افتراضي)
                  </button>
                  <button type="button" className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs">
                    English (Soon)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">التقويم المعتمد للمواعيد والتراخيص:</label>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-2xs">
                    الميلادي والتحويل الهجري
                  </button>
                  <button type="button" className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs">
                    أم القرى (الهجري فقط)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ التفضيلات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
