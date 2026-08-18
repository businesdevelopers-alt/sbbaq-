import React, { useState, useEffect } from 'react';
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
  FolderLock,
  Compass,
  MapPin,
  X,
  Clock,
  ArrowUpRight,
  CheckCircle2,
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
  FileText,
  ShoppingBag,
  ChevronDown,
  Sliders,
  Upload,
  Printer,
  Scan,
  Wrench
} from 'lucide-react';
import { Establishment, UserAccount, AuthMode } from '../types';

export interface CustomerNavCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  items: {
    id: string;
    label: string;
    subLabel?: string;
    icon: React.ElementType;
    badge?: string | number | null;
    badgeColor?: string;
  }[];
}

interface CustomerSidebarProps {
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
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
  onOpenPublicServices?: () => void;
  onOpenUploadDoc?: () => void;
  onOpenFeeCalculator?: () => void;
  onOpenCROnboarding?: () => void;
  onExportCompliancePdf?: () => void;
  onOpenTour?: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
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
  onOpenAuth,
  onLogout,
  onOpenPublicServices,
  onOpenUploadDoc,
  onOpenFeeCalculator,
  onOpenCROnboarding,
  onExportCompliancePdf,
  onOpenTour,
}) => {
  // Quick tools accordion state - closed by default, persists to localStorage
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sabbaq_quick_tools_open');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleQuickTools = () => {
    setIsQuickToolsOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sabbaq_quick_tools_open', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const navCategories: CustomerNavCategory[] = [
    {
      id: 'main',
      label: 'القائمة الرئيسية',
      icon: LayoutDashboard,
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية ولوحة التحكم',
          subLabel: 'مؤشرات الأداء ومهام اليوم',
          icon: LayoutDashboard
        },
        {
          id: 'proactive_alerts',
          label: 'مركز التنبيهات الاستباقية',
          subLabel: 'إشعارات الاستحقاق (60، 30، 7 أيام)',
          icon: Bell,
          badge: urgentAlertsCount > 0 ? `${urgentAlertsCount} تنبيه` : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold animate-pulse'
        },
        {
          id: 'calendar',
          label: 'التقويم ومواعيد الاستحقاق',
          subLabel: 'مواعيد التجديد والإقرارات',
          icon: Clock
        }
      ]
    },
    {
      id: 'establishment',
      label: 'منشأتي',
      icon: Building2,
      items: [
        {
          id: 'profile',
          label: 'الملف والسجل التجاري',
          subLabel: 'الأنشطة، الكيان والمفوضين',
          icon: Building2
        },
        {
          id: 'branches',
          label: 'إدارة الفروع والمواقع',
          subLabel: 'حالة الامتثال والمخاطر لكل فرع',
          icon: MapPin
        },
        {
          id: 'licenses',
          label: 'التراخيص والرخص الرسمية',
          subLabel: 'بلدي، سلامة، الدفاع المدني وغيرها',
          icon: FileCheck2
        },
        {
          id: 'company_documents',
          label: 'خزينة الوثائق والمستندات',
          subLabel: 'الأرشيف الإلكتروني والشهادات',
          icon: FolderLock
        },
        {
          id: 'legal_documents',
          label: 'العقود واللوائح القانونية',
          subLabel: 'المحرر الذكي والمكتبة التنظيمية',
          icon: FileText
        }
      ]
    },
    {
      id: 'compliance',
      label: 'الامتثال',
      icon: ShieldCheck,
      items: [
        {
          id: 'risk_center',
          label: 'المخاطر والمخالفات',
          subLabel: 'رصد الغرامات ومستوى المخاطر',
          icon: AlertTriangle,
          badge: urgentAlertsCount > 0 ? `${urgentAlertsCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold'
        },
        {
          id: 'violations_analyzer',
          label: 'التحليل الإجرائي للمخالفات',
          subLabel: 'خطط التصحيح وحماية خصم 25%',
          icon: Sparkles
        },
        {
          id: 'sector_benchmark',
          label: 'مقارنة متوسط القطاع',
          subLabel: 'المعايير المرجعية ونطاقات التفتيش',
          icon: Compass
        },
        {
          id: 'violation_solutions_mapping',
          label: 'دليل حلول المخالفات',
          subLabel: 'الأسئلة التشخيصية والأدلة الإجرائية',
          icon: Scale
        },
        {
          id: 'rules',
          label: 'سجل اللوائح والأنظمة',
          subLabel: 'الاشتراطات والمعايير المعتمدة',
          icon: ShieldCheck
        }
      ]
    },
    {
      id: 'orders_finance',
      label: 'الطلبات والماليات',
      icon: ShoppingBag,
      items: [
        {
          id: 'orders',
          label: 'طلباتي والمعاملات الجارية',
          subLabel: 'تتبع حالة التنفيذ والتعقيب',
          icon: Layers
        },
        {
          id: 'public_services',
          label: 'دليل الخدمات والتراخيص',
          subLabel: 'طلب تراخيص وخدمات جديدة',
          icon: ShoppingBag,
          badge: 'دليل شامل',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold'
        },
        {
          id: 'finance',
          label: 'المالية وحاسبة الرسوم',
          subLabel: 'التدفق المالي 12 شهراً وحساب التكاليف',
          icon: Calculator,
          badge: 'حاسبة فورية',
          badgeColor: 'bg-teal-100 text-teal-800 font-semibold'
        }
      ]
    },
    {
      id: 'team_and_permissions',
      label: 'الفريق والصلاحيات',
      icon: Users,
      items: [
        {
          id: 'team_permissions',
          label: 'صلاحيات فريق العمل',
          subLabel: 'إدارة الأدوار والتفويضات والنفاذ',
          icon: Users
        },
        {
          id: 'digital_signatures',
          label: 'منصة التوقيع الرقمي',
          subLabel: 'سجلات التوثيق والمصادقة المعتمدة',
          icon: CheckCircle2
        }
      ]
    }
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'overview') {
      setActiveTab('dashboard');
    } else if (tabId === 'finance') {
      setActiveTab('calculator');
    } else if (tabId === 'public_services') {
      if (onOpenPublicServices) {
        onOpenPublicServices();
      } else {
        setActiveTab('services');
      }
    } else {
      setActiveTab(tabId);
    }
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  // Quick Tools items definition
  const quickToolItems = [
    {
      id: 'quick_risk_simulator',
      label: 'محاكي المخاطر',
      icon: Sliders,
      action: () => handleNavClick('risk_center'),
      isActive: activeTab === 'risk_center'
    },
    {
      id: 'quick_upload_doc',
      label: 'إيداع مستند',
      icon: Upload,
      action: () => {
        if (onOpenUploadDoc) onOpenUploadDoc();
        else handleNavClick('company_documents');
      },
      isActive: activeTab === 'company_documents'
    },
    {
      id: 'quick_fee_calculator',
      label: 'حاسبة الرسوم',
      icon: Calculator,
      action: () => {
        if (onOpenFeeCalculator) onOpenFeeCalculator();
        else handleNavClick('calculator');
      },
      isActive: activeTab === 'calculator' || activeTab === 'fees_planning'
    },
    {
      id: 'quick_violations_check',
      label: 'فحص المخالفات',
      icon: Scale,
      action: () => handleNavClick('violations_analyzer'),
      isActive: activeTab === 'violations_analyzer'
    },
    {
      id: 'quick_pdf_report',
      label: 'تقرير PDF',
      icon: Printer,
      action: () => {
        if (onExportCompliancePdf) onExportCompliancePdf();
        if (isOpenMobile) onCloseMobile();
      },
      isActive: false
    },
    {
      id: 'quick_cr_scanner',
      label: 'مسح سجل تجاري',
      icon: Scan,
      action: () => {
        if (onOpenCROnboarding) onOpenCROnboarding();
        else if (onOpenAuth) onOpenAuth('onboarding' as any);
        if (isOpenMobile) onCloseMobile();
      },
      isActive: false
    },
    {
      id: 'quick_user_guide',
      label: 'دليل الاستخدام',
      icon: HelpCircle,
      action: () => {
        if (onOpenTour) onOpenTour();
        if (isOpenMobile) onCloseMobile();
      },
      isActive: false
    }
  ];

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

      {/* Main Customer Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-200 shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out font-['Cairo'] ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <button 
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-right hover:opacity-85 transition-opacity cursor-pointer group"
            title="الرئيسية - لوحة التحكم"
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
                  بوابة المنشأة
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

        {/* Establishment Switcher & Context Card */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
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
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {navCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-400">
                {category.label}
              </div>

              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || 
                    (item.id === 'legal_documents' && activeTab === 'contract_editor') ||
                    (item.id === 'sector_benchmark' && activeTab === 'geo_map') ||
                    (item.id === 'violation_solutions_mapping' && activeTab === 'admin_violation_solutions_mapping') ||
                    (item.id === 'orders' && activeTab === 'new_order') ||
                    (item.id === 'public_services' && activeTab === 'services') ||
                    (item.id === 'finance' && (activeTab === 'calculator' || activeTab === 'fees_planning'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 group-hover:text-emerald-700 group-hover:bg-emerald-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          {item.subLabel && (
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-500'
                              }`}
                            >
                              {item.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Quick Tools Collapsible Section under Main Menu */}
                {category.id === 'main' && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={toggleQuickTools}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all cursor-pointer group ${
                        quickToolItems.some(q => q.isActive)
                          ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200/80 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      aria-expanded={isQuickToolsOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-slate-800 group-hover:text-slate-900">الأدوات السريعة</div>
                          <div className="text-[10px] text-slate-400 group-hover:text-slate-500 truncate">
                            محاكي، إيداع، حاسبة، فحص، تقرير
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                          7
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                            isQuickToolsOpen ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Collapsible Dropdown Content */}
                    {isQuickToolsOpen && (
                      <div className="mt-1 mr-3 pr-2.5 border-r-2 border-emerald-300/70 space-y-0.5 py-1">
                        {quickToolItems.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={tool.action}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-right text-xs transition-all cursor-pointer ${
                                tool.isActive
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <ToolIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    tool.isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'
                                  }`}
                                />
                                <span className="truncate">{tool.label}</span>
                              </div>
                              {tool.isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Advisor & Fast Actions Promo */}
          <div className="pt-2">
            <button
              onClick={onOpenAI}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white text-right hover:shadow-md transition-all relative overflow-hidden group cursor-pointer border border-teal-800/60"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-300">
                  <Sparkles className="w-4 h-4 text-teal-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>مستشار سبّـاق AI</span>
                </div>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-200 px-1.5 py-0.5 rounded border border-teal-500/30">
                  مساعد فوري
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                استفسر عن اشتراطات البلديات والدفاع المدني وتجنب المخالفات فوراً.
              </p>
            </button>
          </div>
        </div>

        {/* Footer / Account & Utilities Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
          
          {/* Quick Support & Settings actions */}
          <div className="flex items-center justify-between gap-1 text-slate-500">
            {onOpenSupport && (
              <button
                type="button"
                onClick={onOpenSupport}
                className="flex-1 p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="الدعم الفني والشكاوى"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span>الدعم الفني</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex-1 p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="إعدادات الحساب والتنبيهات"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>الإعدادات</span>
              </button>
            )}
          </div>

          {/* User Account Info and Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0) : 'ع'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'صاحب المنشأة'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser?.establishmentName || activeEstablishment.name}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
