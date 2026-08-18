import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  HelpCircle, 
  Calculator, 
  FileCheck2, 
  AlertTriangle,
  LayoutDashboard,
  Layers,
  ClipboardList,
  FolderKanban,
  FolderLock,
  Compass,
  MapPin,
  BookOpen,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  LogIn,
  LogOut,
  User,
  Scale,
  TrendingUp,
  Bell,
  Users,
  PlusCircle,
  Headphones,
  Settings,
  Flame,
  FileText
} from 'lucide-react';
import { Establishment, UserRole, UserAccount, AuthMode, AuthPortal } from '../types';

export interface NavCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number | null;
  badgeColor?: string;
  items: {
    id: string;
    label: string;
    subLabel?: string;
    icon: React.ElementType;
    badge?: string | number | null;
    badgeColor?: string;
  }[];
}

interface SidebarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeEstablishment: Establishment;
  establishments: Establishment[];
  onSelectEstablishment: (est: Establishment) => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenGoalSelector: () => void;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  urgentAlertsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser?: UserAccount | null;
  onGoToLanding?: () => void;
  onOpenAuth?: (mode: AuthMode, portal?: AuthPortal) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  setCurrentRole,
  activeEstablishment,
  establishments,
  onSelectEstablishment,
  cartItemsCount,
  onOpenCart,
  onOpenAI,
  onOpenGoalSelector,
  onOpenSupport,
  onOpenSettings,
  onOpenNotifications,
  activeTab,
  setActiveTab,
  urgentAlertsCount,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onGoToLanding,
  onOpenAuth,
  onLogout,
}) => {

  // Structure of the 6 Navigation Sections
  const navCategories: NavCategory[] = [
    {
      id: 'main',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية',
          subLabel: 'الملخص التنفيذي والإجراءات',
          icon: LayoutDashboard,
        }
      ]
    },
    {
      id: 'establishment',
      label: 'المنشأة',
      icon: Building2,
      items: [
        {
          id: 'profile',
          label: 'ملف المنشأة',
          subLabel: 'بيانات المنشأة، الفروع والمواقع، الفريق والصلاحيات',
          icon: Building2,
        }
      ]
    },
    {
      id: 'compliance_risk',
      label: 'الامتثال والمخاطر',
      icon: ShieldCheck,
      badge: urgentAlertsCount > 0 ? urgentAlertsCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
      items: [
        {
          id: 'risk_center',
          label: 'المخاطر والمخالفات',
          subLabel: 'مركز المخاطر والامتثال الوقائي',
          icon: AlertTriangle,
          badge: urgentAlertsCount > 0 ? urgentAlertsCount : null,
          badgeColor: 'bg-rose-500 text-white font-bold'
        },
        {
          id: 'violations_analyzer',
          label: 'المخاطر والمخالفات',
          subLabel: 'تحليل المخالفات والخطوات التصحيحية',
          icon: Scale,
          badge: 'ذكي',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold'
        },
        {
          id: 'proactive_alerts',
          label: 'التنبيهات الاستباقية',
          subLabel: 'إنذارات 60/30/7 يوم ونواقص المستندات',
          icon: Bell,
          badge: '60/30/7',
          badgeColor: 'bg-amber-500 text-white font-bold'
        },
        {
          id: 'sector_benchmark',
          label: 'التحليلات القطاعية',
          subLabel: 'المقارنة المعيارية وخريطة المخاطر',
          icon: TrendingUp,
          badge: 'معياري',
          badgeColor: 'bg-purple-100 text-purple-800 font-semibold'
        },
        {
          id: 'rules',
          label: 'الاشتراطات والالتزامات',
          subLabel: 'سجل اللوائح والجهات والتحديثات',
          icon: BookOpen,
        }
      ]
    },
    {
      id: 'licenses_docs',
      label: 'التراخيص والوثائق',
      icon: FileCheck2,
      items: [
        {
          id: 'licenses',
          label: 'التراخيص والوثائق والحافظة',
          subLabel: 'مراقبة التراخيص، الحافظة الرقمية، والتوقيع الرقمي',
          icon: FileCheck2,
          badge: 'موحد',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold'
        }
      ]
    },
    {
      id: 'services_orders',
      label: 'الخدمات والطلبات',
      icon: Layers,
      badge: cartItemsCount > 0 ? cartItemsCount : null,
      badgeColor: 'bg-emerald-600 text-white font-bold',
      items: [
        {
          id: 'orders',
          label: 'الطلبات',
          subLabel: 'تقديم ومتابعة المعاملات، السلة وعروض الأسعار',
          icon: ClipboardList,
          badge: cartItemsCount > 0 ? `${cartItemsCount} بالسلة` : undefined,
          badgeColor: 'bg-emerald-600 text-white font-bold',
        },
        {
          id: 'services',
          label: 'دليل الخدمات',
          subLabel: 'الجهات الحكومية، المتطلبات والرسوم',
          icon: Layers,
        }
      ]
    },
    {
      id: 'finance',
      label: 'المالية',
      icon: Calculator,
      items: [
        {
          id: 'finance',
          label: 'المالية',
          subLabel: 'حاسبة الرسوم الحكومية، التخطيط المالي والميزانية',
          icon: Calculator,
          badge: 'شامل',
          badgeColor: 'bg-teal-100 text-teal-800 font-semibold'
        }
      ]
    }
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'new_order') {
      setActiveTab('orders');
    } else {
      setActiveTab(tabId);
    }
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-200/90 shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-right focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight font-['Cairo']">
                  سبّـاق
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                  الامتثال
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 block -mt-0.5">
                المنصة الوطنية لإدارة التراخيص
              </span>
            </div>
          </button>

          {/* Close button on mobile */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Establishment Selector & Context Card */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                المنشأة الحالية:
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                نشط
              </span>
            </div>
            
            <div className="relative">
              <select
                value={activeEstablishment.id}
                onChange={(e) => {
                  const found = establishments.find(es => es.id === e.target.value);
                  if (found) onSelectEstablishment(found);
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer truncate"
              >
                {establishments.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.name} ({est.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
              <span>س.ت: {activeEstablishment.crNumber}</span>
              <span>{activeEstablishment.city}</span>
            </div>

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('onboarding' as any)}
                className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all border border-emerald-200/80 cursor-pointer shadow-2xs group"
                title="إضافة منشأة جديدة بالمسح الضوئي للسجل التجاري"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>إضافة منشأة بالسجل التجاري</span>
              </button>
            )}
          </div>

          {/* Role Toggle */}
          <div className="mt-2 flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setCurrentRole('client')}
              className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all text-center ${
                currentRole === 'client'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بوابة المنشأة
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all text-center ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              إدارة سبّاق
            </button>
          </div>
        </div>

        {/* Navigation Items (Scrollable Categorized Hierarchy) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {currentRole === 'client' ? (
            <>
              {navCategories.map((category) => {
                const isSingleItemCategory = category.items.length === 1 && category.items[0].id === 'dashboard';

                if (isSingleItemCategory) {
                  const item = category.items[0];
                  const Icon = item.icon;
                  const isActive = activeTab === 'dashboard';

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right group ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm font-black shadow-emerald-900/10'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-emerald-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="leading-tight font-['Cairo'] text-[13px]">{item.label}</div>
                            <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400 font-normal'}`}>
                              {item.subLabel}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={category.id} className="space-y-1">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-2 pt-1 pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-['Cairo']">
                          {category.label}
                        </span>
                      </div>
                      {category.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${category.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                          {category.badge}
                        </span>
                      )}
                    </div>

                    {/* Section Sub-items */}
                    <div className="space-y-0.5">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id || 
                          (item.id === 'profile' && (activeTab === 'profile' || activeTab === 'branches' || activeTab === 'team_permissions')) ||
                          (item.id === 'licenses' && (activeTab === 'licenses' || activeTab === 'company_documents' || activeTab === 'legal_documents' || activeTab === 'contract_editor')) ||
                          (item.id === 'sector_benchmark' && (activeTab === 'sector_benchmark' || activeTab === 'geo_map')) ||
                          (item.id === 'finance' && (activeTab === 'finance' || activeTab === 'calculator' || activeTab === 'fees_planning'));

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-right group ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-sm font-bold shadow-emerald-900/10'
                                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                isActive 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-emerald-700'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="truncate">
                                <div className="leading-tight truncate text-[12px]">{item.label}</div>
                                {item.subLabel && (
                                  <div className={`text-[10px] truncate leading-tight mt-0.5 ${
                                    isActive ? 'text-emerald-100 font-normal' : 'text-slate-400 font-normal'
                                  }`}>
                                    {item.subLabel}
                                  </div>
                                )}
                              </div>
                            </div>

                            {item.badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                isActive 
                                  ? 'bg-white text-emerald-800' 
                                  : (item.badgeColor || 'bg-slate-100 text-slate-700')
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="space-y-2 py-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>لوحة عمليات سبّاق</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  أنت تعمل حالياً بصلاحية «إدارة العمليات»، لإسناد المعاملات وإصدار الفواتير وتحديث أرقام المعاملات الحكومية.
                </p>
              </div>

              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة التحكم والمتابعة الحكومية</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Area (بعيداً عن الوظائف الأساسية) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/90 space-y-2 shrink-0">
          
          {/* Smart AI Assistant Button */}
          <button
            onClick={() => {
              onOpenAI();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-2.5 rounded-xl shadow-xs transition-all text-right group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">المساعد الذكي (سبّاق AI)</span>
                <span className="text-[10px] text-emerald-100 block mt-0.5">استشارة فورية بالأنظمة</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Quick Support, Notifications, and Settings Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                if (onOpenSupport) onOpenSupport();
                if (isOpenMobile) onCloseMobile();
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors group text-center"
              title="الدعم الفني ومستشار الامتثال"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600" />
              <span className="text-[10px] font-bold mt-1 text-slate-700">الدعم الفني</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  handleNavClick('proactive_alerts');
                }
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors group text-center relative"
              title="مركز التنبيهات والإشعارات"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-600" />
              <span className="text-[10px] font-bold mt-1 text-slate-700">الإشعارات</span>
              {urgentAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                if (isOpenMobile) onCloseMobile();
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors group text-center"
              title="إعدادات المنصة"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600" />
              <span className="text-[10px] font-bold mt-1 text-slate-700">الإعدادات</span>
            </button>
          </div>

          {/* User Profile / Auth Status Widget */}
          <div className="pt-1.5 border-t border-slate-200/60">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    currentUser.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</span>
                      {currentUser.role === 'admin' && (
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1 rounded">إدارة</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {currentUser.role === 'admin' ? (currentUser.portalRoleTitle || 'فريق إدارة سبّاق') : currentUser.establishmentName}
                    </div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login', 'client')}
                  className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>دخول المنشأة</span>
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login', 'admin')}
                  className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>إدارة سبّاق</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
