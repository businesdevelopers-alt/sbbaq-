import React from 'react';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Scale,
  FileCheck2,
  DollarSign,
  Users,
  Briefcase,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Sliders,
  ChevronLeft,
  Search,
  Flame,
  Zap,
  HelpCircle,
  ExternalLink,
  Lock,
  Globe,
  Store,
  Receipt,
  Inbox,
  TrendingUp
} from 'lucide-react';
import { UserAccount } from '../types';

export interface AdminNavCategory {
  id: string;
  label: string;
  items: {
    id: string;
    label: string;
    subLabel?: string;
    icon: React.ElementType;
    badge?: string | number | null;
    badgeColor?: string;
  }[];
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: UserAccount;
  onLogout: () => void;
  pendingOrdersCount?: number;
  pendingDocsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onLogout,
  pendingOrdersCount = 4,
  pendingDocsCount = 2
}) => {

  const navCategories: AdminNavCategory[] = [
    {
      id: 'core_operations',
      label: 'العمليات والتحكم المركزي',
      items: [
        {
          id: 'admin_kpis',
          label: 'لوحة المؤشرات العامة',
          subLabel: 'مؤشرات الأداء الشاملة والرقابة',
          icon: LayoutDashboard
        },
        {
          id: 'admin_site_cms',
          label: 'بوابة إدارة الموقع وصفحة التعريف',
          subLabel: 'التحكم بالمحتوى، استلام الطلبات، والفوترة',
          icon: Globe,
          badge: 'جديد متكامل',
          badgeColor: 'bg-indigo-600 text-white font-bold'
        },
        {
          id: 'admin_clients',
          label: 'إدارة العملاء والمنشآت',
          subLabel: 'سجل الشركات، السجلات والفروع',
          icon: Building2,
          badge: '320+',
          badgeColor: 'bg-indigo-900/60 text-indigo-200'
        },
        {
          id: 'admin_orders',
          label: 'المعاملات وإسناد الطلبات',
          subLabel: 'خط المعالجة والإسناد للمختصين والمعقبين',
          icon: ClipboardList,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} جارية` : undefined,
          badgeColor: 'bg-blue-600 text-white font-bold'
        }
      ]
    },
    {
      id: 'compliance_governance',
      label: 'التشريعات والمستندات',
      items: [
        {
          id: 'admin_regulations',
          label: 'التراخيص والخدمات والتشريعات',
          subLabel: 'محرك القواعد، الأسعار والغرامات',
          icon: Scale
        },
        {
          id: 'admin_violation_solutions_mapping',
          label: 'ربط المخالفات والحلول والأسئلة',
          subLabel: 'تعيين الحلول المقترحة والأسئلة التشخيصية',
          icon: Sliders,
          badge: 'جديد ذكي',
          badgeColor: 'bg-indigo-600 text-white font-bold'
        },
        {
          id: 'admin_documents',
          label: 'مراجعة المستندات والموافقات',
          subLabel: 'تدقيق السجلات والعقود والتفويضات',
          icon: FileCheck2,
          badge: pendingDocsCount > 0 ? `${pendingDocsCount} تدقيق` : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-black'
        }
      ]
    },
    {
      id: 'finance_partners',
      label: 'المالية والشركاء والموردين',
      items: [
        {
          id: 'admin_finance',
          label: 'الفواتير والعمولات والمدفوعات',
          subLabel: 'إيرادات المنصة، الرسوم وتوزيع العمولات',
          icon: DollarSign
        },
        {
          id: 'admin_suppliers',
          label: 'إدارة موردي وحلول الامتثال',
          subLabel: 'التحقق من المستندات، الإيقاف والاعتماد',
          icon: Store,
          badge: '10 موردين',
          badgeColor: 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
        },
        {
          id: 'admin_performance',
          label: 'مؤشرات أداء الموردين والـ SLA',
          subLabel: 'سرعة الإنجاز، مؤشر الرضا، وتقارير الجودة',
          icon: TrendingUp,
          badge: 'تقارير حية',
          badgeColor: 'bg-indigo-600 text-white font-bold'
        },
        {
          id: 'admin_partners',
          label: 'المعقبين والشركاء الميدانيين',
          subLabel: 'شبكة المعقبين، التغطية والتقييمات',
          icon: Briefcase,
          badge: '28 شريك',
          badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-800'
        }
      ]
    },
    {
      id: 'security_governance',
      label: 'الحوكمة والنظام',
      items: [
        {
          id: 'admin_users',
          label: 'المستخدمين والأدوار والصلاحيات',
          subLabel: 'فريق العمل، مصفوفة RBAC والأذونات',
          icon: Users
        },
        {
          id: 'admin_audit',
          label: 'التقارير وسجل العمليات',
          subLabel: 'سجل الرقابة والأحداث وتتبع التغييرات',
          icon: History
        },
        {
          id: 'admin_settings',
          label: 'إعدادات المنصة والربط الحكومي',
          subLabel: 'بوابات نفاذ، بلدي، سلامة وزاتكا',
          icon: Settings
        }
      ]
    }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-slate-950 text-slate-100 border-l border-slate-800/90 shadow-2xl lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out font-['Cairo'] ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / HQ Brand Logo */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-900 to-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-lg shadow-blue-950/50 border border-blue-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">
                  إدارة سبّـاق
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">
                  HQ Admin
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 block -mt-0.5">
                مركز العمليات والرقابة المركزية
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Clearance & Security Status Badge */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-inner flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-[11px] font-black text-slate-200 block">نطاق الإدارة المركزية</span>
                <span className="text-[10px] text-slate-400">صلاحيات كاملة (Super Admin)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded">
              v3.8-Live
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navCategories.map((category) => (
            <div key={category.id} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {category.label}
              </div>

              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-950/40 border border-blue-400/30'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-900 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{item.label}</div>
                          {item.subLabel && (
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                              }`}
                            >
                              {item.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold ${
                            item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Admin Staff User Status & Visit Public Site */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/80 shrink-0 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-white text-xs font-bold flex items-center justify-between border border-slate-800 transition-colors"
            title="فتح الصفحة العامة للموقع في نافذة جديدة"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>زيارة الموقع</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">/ (عام)</span>
          </a>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-blue-300/90 truncate">
                  {currentUser.portalRoleTitle || 'مدير العمليات المركزية'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="تسجيل الخروج من لوحة الإدارة"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
