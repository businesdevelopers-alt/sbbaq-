import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  Check, 
  ExternalLink,
  ChevronLeft,
  X,
  Send,
  Zap
} from 'lucide-react';
import { 
  Establishment, 
  License, 
  DocumentItem, 
  Branch, 
  ProactiveAlertItem 
} from '../types';
import { 
  analyzeEstablishmentProactiveAlerts,
  buildProactiveWhatsAppMessage
} from '../utils/proactiveAlertEngine';

interface SmartProactiveNotificationDropdownProps {
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  branches: Branch[];
  onOpenAlertsCenter: () => void;
  onInstantRenewLicense: (license: License) => void;
  onOpenRenewalProposal?: (docItem: DocumentItem) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast: (msg: string) => void;
}

export const SmartProactiveNotificationDropdown: React.FC<SmartProactiveNotificationDropdownProps> = ({
  establishment,
  licenses,
  documents,
  branches,
  onOpenAlertsCenter,
  onInstantRenewLicense,
  onOpenRenewalProposal,
  onConsultSpecialist,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const alertSummary = React.useMemo(() => {
    return analyzeEstablishmentProactiveAlerts(
      establishment,
      licenses,
      documents,
      branches
    );
  }, [establishment, licenses, documents, branches]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (alert: ProactiveAlertItem) => {
    setIsOpen(false);
    if (alert.sourceType === 'license') {
      const lic = licenses.find(l => l.id === alert.sourceId);
      if (lic) {
        onInstantRenewLicense(lic);
        return;
      }
    } else {
      const doc = documents.find(d => d.id === alert.sourceId);
      if (doc && (doc.isRecurring || doc.category === 'lease_contract' || doc.renewalDraftProposal) && onOpenRenewalProposal) {
        onOpenRenewalProposal(doc);
        return;
      }
    }
    onOpenAlertsCenter();
  };

  const handleWhatsApp = (e: React.MouseEvent, alert: ProactiveAlertItem) => {
    e.stopPropagation();
    const encoded = buildProactiveWhatsAppMessage(alert, establishment);
    const phone = establishment.contactPhone || '0500000000';
    const cleanPhone = phone.replace(/^0/, '966').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    showToast(`تم فتح واتساب لإرسال الإشعار الاستباقي للرقم ${phone}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 hover:text-indigo-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
        title="مركز الإشعارات والتنبيه الاستباقي (60 / 30 / 7 أيام)"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        
        {/* Badge counter */}
        {alertSummary.totalAlerts > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs ${
            alertSummary.criticalUrgentCount > 0 
              ? 'bg-red-600 animate-pulse' 
              : alertSummary.count30Days > 0 
              ? 'bg-amber-500' 
              : 'bg-indigo-600'
          }`}>
            {alertSummary.totalAlerts}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans text-right">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  التنبيه الذكي بالاستباق
                </h4>
                <p className="text-[10px] text-slate-300">
                  إنذارات الانتهاء المبكرة (60، 30، 7 أيام)
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold bg-indigo-500/40 text-amber-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
              {alertSummary.totalAlerts} إشعار
            </span>
          </div>

          {/* Quick Filter Counts */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50 border-b border-slate-100 text-[10px] text-center font-bold">
            <div className="bg-red-50 text-red-800 p-1.5 rounded-lg border border-red-200">
              <span className="block font-mono text-xs">{alertSummary.count7Days}</span>
              <span>خلال 7 أيام</span>
            </div>
            <div className="bg-amber-50 text-amber-900 p-1.5 rounded-lg border border-amber-200">
              <span className="block font-mono text-xs">{alertSummary.count30Days}</span>
              <span>خلال 30 يوماً</span>
            </div>
            <div className="bg-indigo-50 text-indigo-900 p-1.5 rounded-lg border border-indigo-200">
              <span className="block font-mono text-xs">{alertSummary.count60Days}</span>
              <span>خلال 60 يوماً</span>
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {alertSummary.items.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <p>جميع التراخيص والمستندات سارية ومنتظمة.</p>
              </div>
            ) : (
              alertSummary.items.slice(0, 6).map((item) => {
                const is7Days = item.alertWindow === '7_days';
                const is30Days = item.alertWindow === '30_days';
                const isExpired = item.alertWindow === 'expired';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAction(item)}
                    className="p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-1.5 group text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isExpired 
                          ? 'bg-rose-100 text-rose-800' 
                          : is7Days 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : is30Days 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-indigo-50 text-indigo-900'
                      }`}>
                        {item.alertStageLabel}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {item.expiryDate}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {item.proactiveAdvice}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className={`font-black font-mono ${item.countdownColor}`}>
                        {item.daysRemaining < 0 ? `منتهي (${Math.abs(item.daysRemaining)}يوم)` : `متبقي ${item.daysRemaining} يوم`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleWhatsApp(e, item)}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          title="إرسال واتساب"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                        <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                          <span>{item.recommendedAction}</span>
                          <ChevronLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Button */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAlertsCenter();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>فتح مركز التنبيه الذكي بالاستباق كاملاً</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
