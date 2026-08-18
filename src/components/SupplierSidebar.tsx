import React from 'react';
import {
  Store,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  Search,
  Award,
  Zap,
  MapPin,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  HelpCircle,
  Headphones,
  Settings,
  X,
  Layers,
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, AuthMode } from '../types';
import { MOCK_SUPPLIERS } from '../data/complianceMarketData';

interface SupplierSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: UserAccount | null;
  onGoToLanding?: () => void;
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
  onOpenAI?: () => void;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
  onOpenRoleSelector?: () => void;
}

export const SupplierSidebar: React.FC<SupplierSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onGoToLanding,
  onOpenAuth,
  onLogout,
  onOpenAI,
  onOpenSupport,
  onOpenSettings,
  onOpenRoleSelector
}) => {
  const supplierProfile = MOCK_SUPPLIERS[0];

  const navItems = [
    {
      id: 'supplier_requests',
      label: 'سوق طلبات العروض (RFQs)',
      subLabel: 'استقبال طلبات التوريد والحلول',
      icon: Search,
      badge: 'جديد',
      badgeColor: 'bg-indigo-600 text-white'
    },
    {
      id: 'supplier_quotes',
      label: 'عروضي المقدمة',
      subLabel: 'متابعة موقف الترسية والمفاضلة',
      icon: Send,
      badge: null
    },
    {
      id: 'supplier_orders',
      label: 'الطلبات المعمدة والتنفيذ',
      subLabel: 'المشاريع الجارية وشهادات الإنجاز',
      icon: CheckCircle2,
      badge: '2',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'supplier_catalog',
      label: 'كتالوج حلول الامتثال',
      subLabel: 'باقات السلامة، بلدي، وزاتكا',
      icon: Layers,
      badge: null
    },
    {
      id: 'services',
      label: 'دليل الاشتراطات والخدمات',
      subLabel: 'التراخيص والأنظمة الرسمية',
      icon: ShoppingBag,
      badge: null
    }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isOpenMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base font-['Cairo'] text-white">سبّاق الامتثال</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30">
                  المورد
                </span>
              </div>
              <p className="text-[11px] text-slate-400">بوابة الموردين والحلول المعتمدة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Supplier Info Card */}
        <div className="p-4 mx-3 mt-3 bg-gradient-to-br from-slate-800/80 to-indigo-950/50 rounded-2xl border border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
              {supplierProfile.verificationLabelAr}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>قبول 100%</span>
            </span>
          </div>
          <h4 className="font-bold text-xs text-white leading-tight font-['Cairo'] line-clamp-1">
            {supplierProfile.nameAr}
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            معتمد لدى الدفاع المدني وهيئة الزكاة
          </p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-1.5 block">
            إدارة التوريد والمنافسات
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (activeTab === 'supplier_dashboard' && item.id === 'supplier_requests') ||
              (activeTab === 'dashboard' && item.id === 'supplier_requests');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-right p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs block font-['Cairo'] truncate">
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {item.subLabel}
                      </span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-1.5 block">
              أدوات الشريك والمورد
            </span>

            <button
              type="button"
              onClick={() => {
                if (onOpenAI) onOpenAI();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full text-right p-3 rounded-2xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs block font-['Cairo']">مستشار سبّاق الذكي</span>
                <span className="text-[10px] text-slate-500 block">استفسارات الاشتراطات والتسعير</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer & Role Switch */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {onOpenRoleSelector && (
            <button
              type="button"
              onClick={() => {
                onOpenRoleSelector();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>تبديل بيئة العمل (الصلاحية)</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">مورد</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
            <button
              type="button"
              onClick={onGoToLanding}
              className="hover:text-white transition-colors"
            >
              الرئيسية العامة
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
