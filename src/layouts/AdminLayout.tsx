import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { TopHeader } from '../components/TopHeader';
import {
  UserAccount,
  Establishment,
  License,
  DocumentItem,
  Branch,
  InAppNotification,
  AuthMode
} from '../types';

interface AdminLayoutProps {
  currentUser: UserAccount;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  pendingOrdersCount: number;
  pendingDocsCount: number;
  activeEstablishment: Establishment;
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
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenGoalSelector: () => void;
  onOpenCommandPalette: () => void;
  onOpenRoleSelector: () => void;
  onInstantRenewLicense: (license: License) => void;
  onConsultSpecialist: (topic: string) => void;
  onOpenAuth: (mode: AuthMode) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  pendingOrdersCount,
  pendingDocsCount,
  activeEstablishment,
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
  cartItemsCount,
  onOpenCart,
  onOpenAI,
  onOpenGoalSelector,
  onOpenCommandPalette,
  onOpenRoleSelector,
  onInstantRenewLicense,
  onConsultSpecialist,
  onOpenAuth,
  onLogout,
  showToast,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white font-['Cairo']" dir="rtl">
      
      {/* 1. Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
        pendingOrdersCount={pendingOrdersCount}
        pendingDocsCount={pendingDocsCount}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 transition-all duration-300">
        
        {/* Top Header Bar configured for Admin */}
        <TopHeader
          currentRole="admin"
          activeEstablishment={activeEstablishment}
          activeTab={activeTab}
          cartItemsCount={cartItemsCount}
          urgentAlertsCount={0}
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
          onOpenAlertsCenter={() => setActiveTab('admin_audit')}
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
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-bold font-['Cairo'] text-sm mb-1">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>إدارة منصة سبّاق الامتثال (HQ Operations & Compliance Control)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                مركز المراقبة والتحكم الموحد، إدارة المنشآت، إسناد المعاملات وتدقيق المستندات الرسمية.
              </p>
            </div>

            <div className="text-[11px] text-slate-500">
              نظام إدارة العمليات المركزية v3.8 • جميع الحقوق محفوظة © 2026
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
