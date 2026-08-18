import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  FolderLock, 
  BookOpen, 
  X, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { InAppNotification } from '../types';

interface LiveNotificationToastBannerProps {
  latestNotification: InAppNotification | null;
  onClose: () => void;
  onAction: (notification: InAppNotification) => void;
}

export const LiveNotificationToastBanner: React.FC<LiveNotificationToastBannerProps> = ({
  latestNotification,
  onClose,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, onClose]);

  if (!latestNotification || !isVisible) return null;

  const isUrgent = latestNotification.priority === 'urgent' || latestNotification.type === 'violation';

  const getTypeIcon = () => {
    switch (latestNotification.type) {
      case 'violation':
        return <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />;
      case 'license_expiry':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'doc_expiry':
        return <FolderLock className="w-5 h-5 text-amber-600" />;
      case 'regulatory_update':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed top-20 left-4 sm:left-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto font-sans" dir="rtl">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
        isUrgent 
          ? 'bg-slate-900/95 text-white border-rose-500/60 ring-2 ring-rose-500/20' 
          : 'bg-white/95 text-slate-900 border-indigo-200 ring-2 ring-indigo-500/10'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isUrgent 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
          }`}>
            {getTypeIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  isUrgent ? 'bg-rose-500 text-white' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  إشعار فوري جديد
                </span>
                {latestNotification.authorityBadge && (
                  <span className={`text-[10px] font-bold ${isUrgent ? 'text-slate-300' : 'text-slate-500'}`}>
                    {latestNotification.authorityBadge}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isUrgent ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h5 className={`text-xs font-black line-clamp-1 ${isUrgent ? 'text-white' : 'text-slate-900'}`}>
              {latestNotification.title}
            </h5>

            <p className={`text-[11px] mt-0.5 line-clamp-2 ${isUrgent ? 'text-slate-300' : 'text-slate-600'}`}>
              {latestNotification.message}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                  onAction(latestNotification);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  isUrgent 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                <span>{latestNotification.actionLabel || 'معاينة واتخاذ إجراء'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <span className={`text-[10px] font-mono ${isUrgent ? 'text-slate-400' : 'text-slate-400'}`}>
                الآن
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
