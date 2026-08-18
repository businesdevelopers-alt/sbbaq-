import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { TopHeader } from '../components/TopHeader';
import { CustomerQuickActionBar } from '../components/CustomerQuickActionBar';
import {
  Establishment,
  UserAccount,
  License,
  DocumentItem,
  Branch,
  InAppNotification,
  AuthMode
} from '../types';

interface CustomerLayoutProps {
  currentUser: UserAccount | null;
  activeEstablishment: Establishment;
  establishments: Establishment[];
  onSelectEstablishment: (est: Establishment) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  urgentAlertsCount: number;
  licenses: License[];
  documents: DocumentItem[];
  branches: Branch[];
  notifications: InAppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearReadNotifications: () => void;
  onAddNotification: (n: any) => void;
  onNavigateToTab: (tab: string, entityId?: string, entityType?: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenGoalSelector: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenTour: () => void;
  onOpenRoleSelector: () => void;
  onInstantRenewLicense: (license: License) => void;
  onConsultSpecialist: (topic: string) => void;
  onOpenAuth: (mode: AuthMode) => void;
  onLogout: () => void;
  onOpenPublicServices: (slug?: string) => void;
  showToast: (msg: string) => void;
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  currentUser,
  activeEstablishment,
  establishments,
  onSelectEstablishment,
  activeTab,
  setActiveTab,
  urgentAlertsCount,
  licenses,
  documents,
  branches,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onClearReadNotifications,
  onAddNotification,
  onNavigateToTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  cartItemsCount,
  onOpenCart,
  onOpenAI,
  onOpenGoalSelector,
  onOpenSupport,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenTour,
  onOpenRoleSelector,
  onInstantRenewLicense,
  onConsultSpecialist,
  onOpenAuth,
  onLogout,
  onOpenPublicServices,
  showToast,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex font-sans selection:bg-emerald-100 selection:text-emerald-900 font-['Cairo']" dir="rtl">
      
      {/* 1. Customer Sidebar Navigation */}
      <CustomerSidebar
        activeEstablishment={activeEstablishment}
        establishments={establishments}
        onSelectEstablishment={onSelectEstablishment}
        cartItemsCount={cartItemsCount}
        onOpenCart={onOpenCart}
        onOpenAI={onOpenAI}
        onOpenGoalSelector={onOpenGoalSelector}
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
        onOpenNotifications={() => setActiveTab('proactive_alerts')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentAlertsCount={urgentAlertsCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onOpenPublicServices={() => onOpenPublicServices()}
      />

      {/* 2. Main Content Wrapper (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 transition-all duration-300">
        
        {/* Top Header Bar */}
        <TopHeader
          currentRole="client"
          activeEstablishment={activeEstablishment}
          activeTab={activeTab}
          cartItemsCount={cartItemsCount}
          urgentAlertsCount={urgentAlertsCount}
          licenses={licenses}
          documents={documents}
          branches={branches}
          notifications={notifications}
          onMarkNotificationAsRead={onMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
          onDeleteNotification={onDeleteNotification}
          onClearReadNotifications={onClearReadNotifications}
          onAddNotification={onAddNotification}
          onNavigateToTab={onNavigateToTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCart={onOpenCart}
          onOpenAI={onOpenAI}
          onOpenGoalSelector={onOpenGoalSelector}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenAlertsCenter={() => setActiveTab('proactive_alerts')}
          onInstantRenewLicense={onInstantRenewLicense}
          onOpenRoleSelector={onOpenRoleSelector}
          onConsultSpecialist={onConsultSpecialist}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
          showToast={showToast}
        />

        {/* Main Application Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          
          {/* Customer Fast Quick Action Bar */}
          <CustomerQuickActionBar
            establishment={activeEstablishment}
            establishments={establishments}
            onSelectEstablishment={onSelectEstablishment}
            onOpenCommandPalette={onOpenCommandPalette}
            onOpenTour={onOpenTour}
            onOpenAI={onOpenAI}
            onOpenUploadDoc={() => setActiveTab('company_documents')}
            onOpenFeeCalculator={() => setActiveTab('calculator')}
            onOpenCROnboarding={() => onOpenAuth('onboarding')}
            onNavigateToTab={setActiveTab}
            urgentAlertsCount={urgentAlertsCount}
          />

          {/* Child Views */}
          {children}
        </main>

        {/* Customer Portal Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-bold font-['Cairo'] text-sm mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>منصة سبّاق الامتثال • بوابة المنشآت</span>
              </div>
              <p className="text-[11px] text-slate-500">
                إدارة التراخيص والوثائق الحكومية، وحساب الرسوم، والرصد الوقائي للمخالفات.
              </p>
            </div>

            <div className="text-[11px] text-slate-500">
              جميع الحقوق محفوظة © 2026 • متوافق مع لوائح التجارة، بلدي، الدفاع المدني، وقوى
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
