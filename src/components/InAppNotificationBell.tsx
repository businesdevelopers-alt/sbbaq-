import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  FileText, 
  FolderLock, 
  BookOpen, 
  Check, 
  CheckCheck, 
  Trash2, 
  Send, 
  ChevronLeft, 
  Search, 
  ExternalLink, 
  Filter, 
  Flame, 
  ShieldCheck, 
  Users, 
  Volume2, 
  VolumeX,
  X,
  ArrowUpRight,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { InAppNotification, NotificationType, NotificationPriority, Establishment, License, DocumentItem } from '../types';
import { SIMULATED_NOTIFICATION_PRESETS } from '../data/inAppNotificationsData';

interface InAppNotificationBellProps {
  establishment: Establishment;
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearReadNotifications: () => void;
  onAddNotification: (notification: Omit<InAppNotification, 'id' | 'createdAt'>) => void;
  onNavigateToTab?: (tab: string, entityId?: string, entityType?: string) => void;
  onInstantRenewLicense?: (licenseId: string) => void;
  onOpenRenewalProposal?: (docId: string) => void;
  showToast?: (msg: string) => void;
}

export const InAppNotificationBell: React.FC<InAppNotificationBellProps> = ({
  establishment,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearReadNotifications,
  onAddNotification,
  onNavigateToTab,
  onInstantRenewLicense,
  onOpenRenewalProposal,
  showToast = (_msg?: string) => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'violation' | 'expiry' | 'update' | 'team'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications for active establishment
  const estNotifications = useMemo(() => {
    return notifications.filter(n => n.establishmentId === establishment.id || n.establishmentId === 'est-all');
  }, [notifications, establishment.id]);

  // Unread count
  const unreadCount = useMemo(() => {
    return estNotifications.filter(n => !n.isRead).length;
  }, [estNotifications]);

  // Urgent / High priority unread count
  const urgentCount = useMemo(() => {
    return estNotifications.filter(n => !n.isRead && (n.priority === 'urgent' || n.priority === 'high')).length;
  }, [estNotifications]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: estNotifications.length,
      violation: estNotifications.filter(n => n.type === 'violation').length,
      expiry: estNotifications.filter(n => n.type === 'doc_expiry' || n.type === 'license_expiry').length,
      update: estNotifications.filter(n => n.type === 'regulatory_update' || n.type === 'system').length,
      team: estNotifications.filter(n => n.type === 'team_action').length,
    };
  }, [estNotifications]);

  // Filtered and searched list
  const filteredNotifications = useMemo(() => {
    return estNotifications.filter(item => {
      // Category filter
      if (selectedFilter === 'violation' && item.type !== 'violation') return false;
      if (selectedFilter === 'expiry' && item.type !== 'doc_expiry' && item.type !== 'license_expiry') return false;
      if (selectedFilter === 'update' && item.type !== 'regulatory_update' && item.type !== 'system') return false;
      if (selectedFilter === 'team' && item.type !== 'team_action') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMsg = item.message.toLowerCase().includes(query);
        const matchesAuthority = item.authorityBadge?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg && !matchesAuthority) return false;
      }

      return true;
    });
  }, [estNotifications, selectedFilter, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSimulateMenu(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Play subtle chime sound using Web Audio API
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Handle clicking on a notification card
  const handleNotificationClick = (item: InAppNotification) => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    setIsOpen(false);

    if (item.targetTab && onNavigateToTab) {
      onNavigateToTab(item.targetTab, item.targetEntityId, item.targetEntityType);
      showToast(`تم التوجيه إلى: ${item.actionLabel || item.title}`);
    } else if (item.type === 'license_expiry' && item.targetEntityId && onInstantRenewLicense) {
      onInstantRenewLicense(item.targetEntityId);
    } else if (item.type === 'doc_expiry' && item.targetEntityId && onOpenRenewalProposal) {
      onOpenRenewalProposal(item.targetEntityId);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = (e: React.MouseEvent, item: InAppNotification) => {
    e.stopPropagation();
    const text = encodeURIComponent(`*🔔 إشعار من سبّاق للامتثال:*\n*${item.title}*\n${item.message}\nالمنشأة: ${establishment.name}\nالمصدر: ${item.authorityBadge || 'المنظومة الحكومية'}`);
    const phone = establishment.contactPhone || '0500000000';
    const cleanPhone = phone.replace(/^0/, '966').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    showToast(`تم فتح واتساب لإرسال الإشعار.`);
  };

  // Simulate new live notification
  const handleSimulatePreset = (preset: typeof SIMULATED_NOTIFICATION_PRESETS[0]) => {
    playNotificationChime();
    onAddNotification({
      establishmentId: establishment.id,
      type: preset.type,
      priority: preset.priority,
      title: preset.title,
      message: preset.message,
      timestamp: 'الآن',
      isRead: false,
      actionLabel: preset.actionLabel,
      targetTab: preset.targetTab,
      authorityBadge: preset.authorityBadge,
      fineAmount: (preset as any).fineAmount,
      daysRemaining: (preset as any).daysRemaining,
    });
    setShowSimulateMenu(false);
    showToast(`🔔 وصل إشعار جديد فوري: ${preset.title}`);
  };

  const getPriorityBadgeStyle = (priority: NotificationPriority, type: NotificationType) => {
    if (priority === 'urgent' || type === 'violation') {
      return {
        bg: 'bg-rose-500/10 text-rose-700 border-rose-200',
        borderLeft: 'border-r-4 border-r-rose-500',
        dot: 'bg-rose-500',
      };
    }
    if (priority === 'high' || type === 'license_expiry' || type === 'doc_expiry') {
      return {
        bg: 'bg-amber-500/10 text-amber-800 border-amber-200',
        borderLeft: 'border-r-4 border-r-amber-500',
        dot: 'bg-amber-500',
      };
    }
    if (type === 'regulatory_update') {
      return {
        bg: 'bg-blue-500/10 text-blue-800 border-blue-200',
        borderLeft: 'border-r-4 border-r-blue-500',
        dot: 'bg-blue-500',
      };
    }
    return {
      bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-200',
      borderLeft: 'border-r-4 border-r-emerald-500',
      dot: 'bg-emerald-500',
    };
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'violation':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'license_expiry':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'doc_expiry':
        return <FolderLock className="w-4 h-4 text-amber-600" />;
      case 'regulatory_update':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'team_action':
        return <Users className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSimulateMenu(false);
        }}
        className={`relative p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
          isOpen 
            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200' 
            : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-100 border-slate-200/80'
        }`}
        title="الإشعارات المباشرة والتنبيهات الفورية للمنشأة"
      >
        <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${urgentCount > 0 && !isOpen ? 'text-rose-600 animate-bounce' : ''}`} />

        {/* Counter Badge */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-[10px] font-extrabold px-1.5 h-4 sm:h-5 min-w-4 sm:min-w-5 rounded-full flex items-center justify-center shadow-xs ${
            urgentCount > 0 
              ? 'bg-rose-600 animate-pulse' 
              : 'bg-indigo-600'
          }`}>
            {unreadCount > 99 ? '+99' : unreadCount}
          </span>
        )}
      </button>

      {/* Main Notifications Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-84 sm:w-[440px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans text-right">
          
          {/* Top Gradient Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/25 border border-indigo-400/30 text-amber-300 flex items-center justify-center shadow-inner">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                    مركز الإشعارات والتنبيهات
                  </h4>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-indigo-200/80">
                  مخالفات، مواعيد انتهاء الوثائق، وتحديثات اللوائح الفورية
                </p>
              </div>
            </div>

            {/* Header Tool Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title={soundEnabled ? 'كتم صوت التنبيهات' : 'تفعيل صوت التنبيهات'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
              </button>

              <button
                type="button"
                onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                title="محاكاة وصول إشعار فوري جديد"
              >
                <PlusCircle className="w-3 h-3" />
                <span className="hidden sm:inline">محاكاة إشعار</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Popup Menu (For Demo & Testing) */}
          {showSimulateMenu && (
            <div className="p-3 bg-amber-50/90 border-b border-amber-200 space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>محاكاة وصول إشعار فوري (تجربة النظام الحي):</span>
                </span>
                <button 
                  onClick={() => setShowSimulateMenu(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {SIMULATED_NOTIFICATION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSimulatePreset(preset)}
                    className="p-2 bg-white hover:bg-amber-100/50 border border-amber-200 rounded-xl text-right text-[11px] font-bold text-slate-800 flex flex-col gap-0.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="line-clamp-1">{preset.title}</span>
                    <span className="text-[9px] text-slate-500 font-normal">{preset.authorityBadge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-[11px] font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'all' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>الكل</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                selectedFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {categoryCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('violation')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'violation' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>مخالفات ورصد</span>
              {categoryCounts.violation > 0 && (
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  selectedFilter === 'violation' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 font-bold'
                }`}>
                  {categoryCounts.violation}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('expiry')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'expiry' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>انتهاء وثائق</span>
              {categoryCounts.expiry > 0 && (
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  selectedFilter === 'expiry' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 font-bold'
                }`}>
                  {categoryCounts.expiry}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('update')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'update' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>تحديثات</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('team')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'team' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>الفريق</span>
            </button>
          </div>

          {/* Search bar inside dropdown */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث في الإشعارات والجهات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                title="تحديد كافة الإشعارات كمقروءة"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قراءة الكل</span>
              </button>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <Bell className="w-6 h-6 opacity-40" />
                </div>
                <h5 className="font-bold text-xs text-slate-700">لا توجد إشعارات حالياً</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  {searchQuery ? 'لم يتم العثور على نتائج تطابق البحث' : 'سجل الإشعارات نظيف وكافة التراخيص والمستندات محدثة.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const badgeStyle = getPriorityBadgeStyle(item.priority, item.type);
                const isUrgent = item.priority === 'urgent' || item.type === 'violation';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 transition-colors cursor-pointer group relative ${badgeStyle.borderLeft} ${
                      !item.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${badgeStyle.bg}`}>
                          {getTypeIcon(item.type)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.authorityBadge && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-slate-200">
                                {item.authorityBadge}
                              </span>
                            )}
                            
                            {isUrgent && (
                              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded animate-pulse">
                                عاجل
                              </span>
                            )}

                            {item.daysRemaining !== undefined && item.daysRemaining <= 10 && (
                              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                {item.daysRemaining > 0 ? `متبقي ${item.daysRemaining} يوم` : 'منتهي'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-slate-400">
                        <span className="text-[10px] font-mono text-slate-400 font-medium">
                          {item.timestamp}
                        </span>

                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 block shadow-xs" title="غير مقروء" />
                        )}
                      </div>
                    </div>

                    {/* Notification Title & Body */}
                    <div className="mt-1.5">
                      <h5 className={`text-xs font-bold transition-colors ${
                        !item.isRead ? 'text-slate-900 font-extrabold' : 'text-slate-800'
                      } group-hover:text-indigo-600`}>
                        {item.title}
                      </h5>

                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Card Actions & Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2 text-[10px]">
                      {item.actionLabel ? (
                        <span className="font-bold text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-0.8 rounded-lg group-hover:bg-indigo-100 transition-colors">
                          <span>{item.actionLabel}</span>
                          <ChevronLeft className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-slate-400">معاينة التفاصيل</span>
                      )}

                      <div className="flex items-center gap-1 text-slate-400">
                        {/* WhatsApp share */}
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppShare(e, item)}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="مشاركة الإشعار عبر واتساب"
                        >
                          <Send className="w-3 h-3" />
                        </button>

                        {/* Toggle read */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            item.isRead ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-indigo-100 text-indigo-600'
                          }`}
                          title={item.isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                        >
                          <Check className="w-3 h-3" />
                        </button>

                        {/* Delete notification */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(item.id);
                            showToast('تم حذف الإشعار.');
                          }}
                          className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
                          title="حذف الإشعار"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onClearReadNotifications}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>مسح المقروء</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToTab) {
                  onNavigateToTab('proactive_alerts');
                }
              }}
              className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>مركز التنبيه الذكي بالاستباق</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
