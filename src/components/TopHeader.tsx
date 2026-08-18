import React from 'react';
import { 
  Menu, 
  Sparkles, 
  ShoppingCart, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle,
  Building2,
  Calculator,
  Calendar,
  Layers,
  Clock,
  FolderKanban,
  FolderLock,
  Compass,
  ClipboardList,
  BookOpen,
  LayoutDashboard,
  Globe,
  LogIn,
  LogOut,
  User,
  Bell,
  Scale,
  Users,
  TrendingUp,
  MapPin,
  Search,
  PlusCircle
} from 'lucide-react';
import { Establishment, UserRole, UserAccount, AuthMode, AuthPortal, License, DocumentItem, Branch, InAppNotification } from '../types';
import { InAppNotificationBell } from './InAppNotificationBell';
import { SmartProactiveNotificationDropdown } from './SmartProactiveNotificationDropdown';

interface TopHeaderProps {
  currentRole: UserRole;
  activeEstablishment: Establishment;
  activeTab: string;
  cartItemsCount: number;
  urgentAlertsCount: number;
  licenses?: License[];
  documents?: DocumentItem[];
  branches?: Branch[];
  notifications?: InAppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearReadNotifications?: () => void;
  onAddNotification?: (notification: Omit<InAppNotification, 'id' | 'createdAt'>) => void;
  onNavigateToTab?: (tab: string, entityId?: string, entityType?: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenGoalSelector: () => void;
  onOpenCommandPalette?: () => void;
  onOpenAlertsCenter?: () => void;
  onInstantRenewLicense?: (license: License) => void;
  onOpenRenewalProposal?: (docItem: DocumentItem) => void;
  onConsultSpecialist?: (topic: string) => void;
  onOpenRoleSelector?: () => void;
  currentUser?: UserAccount | null;
  onGoToLanding?: () => void;
  onOpenAuth?: (mode: AuthMode, portal?: AuthPortal) => void;
  onLogout?: () => void;
  showToast?: (msg: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentRole,
  activeEstablishment,
  activeTab,
  cartItemsCount,
  urgentAlertsCount,
  licenses = [],
  documents = [],
  branches = [],
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onMarkAllNotificationsAsRead = () => {},
  onDeleteNotification = () => {},
  onClearReadNotifications = () => {},
  onAddNotification = () => {},
  onNavigateToTab,
  onOpenMobileSidebar,
  onOpenCart,
  onOpenAI,
  onOpenGoalSelector,
  onOpenCommandPalette,
  onOpenAlertsCenter,
  onInstantRenewLicense,
  onOpenRenewalProposal,
  onConsultSpecialist,
  onOpenRoleSelector,
  currentUser,
  onGoToLanding,
  onOpenAuth,
  onLogout,
  showToast = () => {},
}) => {
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'الرئيسية', icon: LayoutDashboard };
      case 'profile':
        return { title: 'ملف المنشأة', icon: Building2 };
      case 'branches':
        return { title: 'الفروع والمواقع', icon: MapPin };
      case 'team_permissions':
        return { title: 'الفريق والصلاحيات', icon: Users };
      case 'risk_center':
        return { title: 'مركز الامتثال', icon: AlertTriangle };
      case 'violations_analyzer':
        return { title: 'المخاطر والمخالفات', icon: Scale };
      case 'proactive_alerts':
        return { title: 'التنبيهات الاستباقية', icon: Bell };
      case 'sector_benchmark':
        return { title: 'التحليلات القطاعية والمقارنة المعيارية', icon: TrendingUp };
      case 'geo_map':
        return { title: 'الخريطة الجغرافية للمخاطر ورصد الفروع', icon: Compass };
      case 'rules':
        return { title: 'الاشتراطات والالتزامات', icon: BookOpen };
      case 'licenses':
        return { title: 'التراخيص والشهادات', icon: Clock };
      case 'calendar':
        return { title: 'التقويم الزمني للامتثال والمواعيد النظامية', icon: Calendar };
      case 'company_documents':
        return { title: 'المستندات والحافظة الرقمية', icon: FolderLock };
      case 'legal_documents':
        return { title: 'المكتبة القانونية والعقود', icon: Scale };
      case 'contract_editor':
        return { title: 'محرر العقود واللوائح بالذكاء الاصطناعي', icon: Sparkles };
      case 'services':
        return { title: 'دليل الخدمات والمعاملات', icon: Layers };
      case 'orders':
        return { title: 'متابعة الطلبات والمعاملات', icon: ClipboardList };
      case 'calculator':
        return { title: 'حاسبة الرسوم التقديرية', icon: Calculator };
      case 'fees_planning':
        return { title: 'التخطيط المالي والرسوم المتراكمة', icon: TrendingUp };
      case 'admin_violation_solutions_mapping':
      case 'violation_solutions_mapping':
        return { title: 'واجهة ربط المخالفات بالحلول والأسئلة التشخيصية', icon: Scale };
      case 'admin_kpis':
        return { title: 'لوحة المؤشرات العامة والرقابة المركزية', icon: LayoutDashboard };
      case 'admin_regulations':
        return { title: 'كتالوج الخدمات والتراخيص الحكومية', icon: Scale };
      case 'admin_orders':
        return { title: 'إدارة الطلبات والمعاملات وإسناد المعقبين', icon: ClipboardList };
      case 'admin_clients':
        return { title: 'إدارة المنشآت والعملاء', icon: Building2 };
      case 'admin_documents':
        return { title: 'مركز تدقيق المستندات والموافقات', icon: FolderLock };
      case 'supplier_requests':
        return { title: 'سوق طلبات عروض الأسعار (RFQs)', icon: Search };
      case 'supplier_quotes':
        return { title: 'عروض الأسعار المقدمة للمنشآت', icon: ClipboardList };
      case 'supplier_orders':
        return { title: 'المشاريع والطلبات المعمدة قيد التنفيذ', icon: Clock };
      case 'supplier_catalog':
        return { title: 'كتالوج حلول وباقات الامتثال المعتمدة', icon: Layers };
      case 'supplier_dashboard':
        return { title: 'بوابة المورد ومزود حلول الامتثال', icon: ShieldCheck };
      default:
        return { title: 'منصة سبّاق الامتثال', icon: ShieldCheck };
    }
  };

  const currentTabInfo = getTabInfo(activeTab);
  const TabIcon = currentTabInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left section in RTL (Right visually): Mobile toggle + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Current Page Breadcrumb / Title */}
          <div className="flex items-center gap-2.5 truncate">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 items-center justify-center shrink-0 border border-emerald-100">
              <TabIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-black text-slate-900 font-['Cairo'] tracking-tight truncate">
                {currentRole === 'admin'
                  ? 'لوحة تحكم إدارة العمليات (Admin)'
                  : currentRole === 'supplier'
                  ? 'بوابة المورد ومزود حلول الامتثال'
                  : currentRole === 'partner_agent'
                  ? 'بوابة المعقب والشريك الميداني'
                  : currentTabInfo.title}
              </h2>
              <span className="hidden md:inline text-[11px] text-slate-500">
                {currentRole === 'supplier' ? 'مزود حلول معتمد • حلول الدفاع المدني، بلدي، وزاتكا' : `${activeEstablishment.name} • ${activeEstablishment.city}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right section in RTL (Left visually): Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Command Palette Search Button */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/90 text-slate-700 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all border border-slate-200 cursor-pointer shadow-2xs group"
              title="البحث الشامل والأوامر السريعة (Ctrl+K / ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
              <span className="hidden sm:inline">بحث سريع</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-white border border-slate-300 rounded text-[9px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Live In-App Notifications Bell (مخالفات جديدة، انتهاء وثائق وتراخيص، تحديثات نظامية) */}
          {currentRole === 'client' && (
            <InAppNotificationBell
              establishment={activeEstablishment}
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onDeleteNotification={onDeleteNotification}
              onClearReadNotifications={onClearReadNotifications}
              onAddNotification={onAddNotification}
              onNavigateToTab={onNavigateToTab}
              onInstantRenewLicense={(licId) => {
                const lic = licenses.find(l => l.id === licId);
                if (lic && onInstantRenewLicense) onInstantRenewLicense(lic);
              }}
              onOpenRenewalProposal={(docId) => {
                const doc = documents.find(d => d.id === docId);
                if (doc && onOpenRenewalProposal) onOpenRenewalProposal(doc);
              }}
              showToast={showToast}
            />
          )}

          {/* Start New Order Button for Client */}
          {currentRole === 'client' && (
            <button
              onClick={() => onNavigateToTab ? onNavigateToTab('services') : onOpenGoalSelector()}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              title="تقديم طلب خدمة أو ترخيص جديد"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ابدأ طلبًا جديدًا</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            title="المساعد الذكي: اسأل سبّاق"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">المساعد الذكي</span>
          </button>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${currentRole === 'admin' ? 'bg-blue-600' : currentRole === 'supplier' ? 'bg-purple-600' : currentRole === 'partner_agent' ? 'bg-amber-600' : 'bg-emerald-500'}`}></span>
              <span className="font-bold text-slate-800 truncate max-w-[100px] hidden sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                currentRole === 'admin' 
                  ? 'bg-blue-100 text-blue-800' 
                  : currentRole === 'supplier'
                  ? 'bg-purple-100 text-purple-800'
                  : currentRole === 'partner_agent'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentRole === 'admin' ? 'إدارة' : currentRole === 'supplier' ? 'مورد' : currentRole === 'partner_agent' ? 'معقب' : 'منشأة'}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5 rounded transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
            title="سلة الطلبات"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

