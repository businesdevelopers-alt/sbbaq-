import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  ShoppingCart, 
  PlusCircle, 
  RotateCw, 
  AlertTriangle, 
  FileText, 
  FolderLock,
  Upload,
  Compass,
  MapPin,
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Check,
  Scale,
  Bell,
  Users,
  GripVertical,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  DollarSign,
  CheckSquare,
  Calendar,
  SlidersHorizontal,
  Layers,
  Eye,
  EyeOff,
  FileCheck2,
  ClipboardList,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info
} from 'lucide-react';
import { 
  DashboardCardsCustomizerModal, 
  DashboardCardConfig, 
  DEFAULT_DASHBOARD_CARDS 
} from './components/DashboardCardsCustomizerModal';
import { 
  Establishment, 
  Branch, 
  License, 
  DocumentItem, 
  ComplianceViolation, 
  MasterOrder, 
  OrderItem, 
  ServiceCatalogItem, 
  ActionItemToday, 
  UserRole, 
  CustomerGoalType,
  InspectionHotspot,
  UserAccount,
  AuthMode,
  AuthPortal,
  TeamMember,
  UserActivityLog,
  InAppNotification,
  LegalDocument,
  LegalContractTemplate,
  DigitalSignatureRecord
} from './types';
import { 
  INITIAL_ESTABLISHMENTS, 
  INITIAL_BRANCHES, 
  INITIAL_LICENSES, 
  INITIAL_DOCUMENTS, 
  INITIAL_VIOLATIONS, 
  INITIAL_ORDERS, 
  INITIAL_ACTION_ITEMS, 
  INITIAL_INSPECTION_HOTSPOTS,
  SERVICE_CATALOG, 
  COMPLIANCE_RULES 
} from './data/complianceData';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACTIVITY_LOGS
} from './data/teamPermissionsData';
import {
  INITIAL_IN_APP_NOTIFICATIONS
} from './data/inAppNotificationsData';
import {
  INITIAL_LEGAL_DOCUMENTS
} from './data/legalDocumentsData';
import {
  INITIAL_DIGITAL_SIGNATURES
} from './data/digitalSignaturesData';
import { calculateEstablishmentRisk, getRiskLevelBadge, getOrderStatusBadge, formatSAR } from './utils/complianceEngine';

// Components
import { CustomerSidebar } from './components/CustomerSidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { SupplierSidebar } from './components/SupplierSidebar';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { PartnerAgentDashboard } from './components/PartnerAgentDashboard';
import { SupplierDashboard } from './components/SupplierDashboard';
import { TopHeader } from './components/TopHeader';
import { LiveNotificationToastBanner } from './components/LiveNotificationToastBanner';
import { GoalSelectorModal } from './components/GoalSelectorModal';
import { ActionCenterToday } from './components/ActionCenterToday';
import { FeeCalculator } from './components/FeeCalculator';
import { CumulativeFeesPlanningChart } from './components/CumulativeFeesPlanningChart';
import { UnifiedFinance } from './components/UnifiedFinance';
import { ServiceCatalog } from './components/ServiceCatalog';
import { CartDrawer } from './components/CartDrawer';
import { LicensesMonitor } from './components/LicensesMonitor';
import { CompanyDocumentsVault } from './components/CompanyDocumentsVault';
import { UnifiedLicensesAndDocuments } from './components/UnifiedLicensesAndDocuments';
import { AILegalContractEditor } from './components/AILegalContractEditor';
import { CompanyLegalDocumentsLibrary } from './components/CompanyLegalDocumentsLibrary';
import { GeographicRiskMap } from './components/GeographicRiskMap';
import { RiskCenter } from './components/RiskCenter';
import { SmartViolationsAnalyzer } from './components/SmartViolationsAnalyzer';
import { SectorBenchmarkDashboard } from './components/SectorBenchmarkDashboard';
import { PenaltySimulator } from './components/PenaltySimulator';
import { PenaltyForecast } from './components/PenaltyForecast';
import { BranchRiskDashboard } from './components/BranchRiskDashboard';
import { RiskSimulator } from './components/RiskSimulator';
import { SmartProactiveAlertsCenter } from './components/SmartProactiveAlertsCenter';
import { PerformanceSummaryCards } from './components/PerformanceSummaryCards';
import { TeamPermissionsManager } from './components/TeamPermissionsManager';
import { EstablishmentProfile } from './components/EstablishmentProfile';
import { OrdersManager } from './components/OrdersManager';
import { AdminDashboard } from './components/AdminDashboard';
import { AskSabbaqAI } from './components/AskSabbaqAI';
import { ObjectionModal } from './components/ObjectionModal';
import { ComplianceRulesRegistry } from './components/ComplianceRulesRegistry';
import { ComplianceCalendar } from './components/ComplianceCalendar';
import { ViolationSolutionsMapping } from './components/ViolationSolutionsMapping';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { AuthAndOnboardingPage } from './components/AuthAndOnboardingPage';
import { PublicServicesPage } from './components/PublicServicesPage';
import { OrderCheckoutModal } from './components/OrderCheckoutModal';
import { ComplianceReportPdfModal } from './components/ComplianceReportPdfModal';
import { DashboardQuickActionsFloatingMenu } from './components/DashboardQuickActionsFloatingMenu';
import { UpcomingViolationsForecastCard } from './components/UpcomingViolationsForecastCard';

export default function App() {
  // Authentication & Landing View State
  const [viewMode, setViewMode] = useState<'app' | 'landing' | 'auth_onboarding' | 'public_services'>('app');
  const [authOnboardingInitialView, setAuthOnboardingInitialView] = useState<'login' | 'register' | 'onboarding'>('login');
  const [authInitialPortal, setAuthInitialPortal] = useState<AuthPortal>('client');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>({
    id: 'usr-1',
    name: 'سلطان بن عبدالعزيز المقرن',
    email: 'sultan@arabianflavors.sa',
    phone: '0501234567',
    nationalId: '1088776655',
    establishmentName: 'شركة المذاق العربي للخدمات الغذائية',
    crNumber: '1010458921',
    role: 'client',
    isVerified: true,
    authProvider: 'password',
    createdAt: '2026-01-10',
    subscriptionPlan: 'pro'
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>('login');

  // Public Catalog & Checkout Navigation State
  const [activePublicServiceSlug, setActivePublicServiceSlug] = useState<string | null>(null);
  const [checkoutService, setCheckoutService] = useState<ServiceCatalogItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  // Global State
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [establishments, setEstablishments] = useState<Establishment[]>(INITIAL_ESTABLISHMENTS);
  const [activeEstablishmentId, setActiveEstablishmentId] = useState<string>(INITIAL_ESTABLISHMENTS[0].id);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [licenses, setLicenses] = useState<License[]>(INITIAL_LICENSES);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [violations, setViolations] = useState<ComplianceViolation[]>(INITIAL_VIOLATIONS);
  const [orders, setOrders] = useState<MasterOrder[]>(INITIAL_ORDERS);
  const [actionItems, setActionItems] = useState<ActionItemToday[]>(INITIAL_ACTION_ITEMS);
  const [hotspots, setHotspots] = useState<InspectionHotspot[]>(INITIAL_INSPECTION_HOTSPOTS);
  const [servicesList, setServicesList] = useState<ServiceCatalogItem[]>(SERVICE_CATALOG);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_IN_APP_NOTIFICATIONS);
  const [latestIncomingNotification, setLatestIncomingNotification] = useState<InAppNotification | null>(null);

  // Legal Documents & AI Contract Editor State
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>(INITIAL_LEGAL_DOCUMENTS);
  const [editingLegalDoc, setEditingLegalDoc] = useState<LegalDocument | null>(null);
  const [editingLegalTemplate, setEditingLegalTemplate] = useState<LegalContractTemplate | null>(null);
  const [signaturesList, setSignaturesList] = useState<DigitalSignatureRecord[]>(INITIAL_DIGITAL_SIGNATURES);

  // Navigation and Modals State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isCompliancePdfOpen, setIsCompliancePdfOpen] = useState<boolean>(false);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState<boolean>(false);
  const [objectionViolation, setObjectionViolation] = useState<ComplianceViolation | null>(null);
  const [selectedViolationForAnalyzer, setSelectedViolationForAnalyzer] = useState<string | null>(null);
  const [openDashboardAccordion, setOpenDashboardAccordion] = useState<string | null>(null);

  const toggleDashboardAccordion = (accordionId: string) => {
    setOpenDashboardAccordion(prev => prev === accordionId ? null : accordionId);
  };

  // Dashboard Cards Customization & Drag-and-Drop Order State
  const [isCardsCustomizerOpen, setIsCardsCustomizerOpen] = useState<boolean>(false);
  const [isDashboardReorderMode, setIsDashboardReorderMode] = useState<boolean>(false);
  const [dashboardCards, setDashboardCards] = useState<DashboardCardConfig[]>(() => {
    try {
      const saved = localStorage.getItem('sabbaq_dashboard_cards_order_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((c: any) => c.id));
          const missing = DEFAULT_DASHBOARD_CARDS.filter(d => !ids.has(d.id));
          return [...parsed, ...missing];
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard layout', e);
    }
    return DEFAULT_DASHBOARD_CARDS;
  });

  const [draggedDashboardIndex, setDraggedDashboardIndex] = useState<number | null>(null);
  const [dragOverDashboardIndex, setDragOverDashboardIndex] = useState<number | null>(null);

  const handleSaveDashboardCards = (updated: DashboardCardConfig[]) => {
    setDashboardCards(updated);
    try {
      localStorage.setItem('sabbaq_dashboard_cards_order_v2', JSON.stringify(updated));
    } catch (e) {}
    showToast('تم حفظ ترتيب بطاقات لوحة التحكم بنجاح.');
  };

  const handleResetDashboardCards = () => {
    setDashboardCards(DEFAULT_DASHBOARD_CARDS);
    try {
      localStorage.removeItem('sabbaq_dashboard_cards_order_v2');
    } catch (e) {}
    showToast('تمت استعادة الترتيب الافتراضي لبطاقات لوحة التحكم.');
  };

  const handleMoveDashboardCard = (index: number, direction: 'up' | 'down') => {
    const visibleCards = dashboardCards.filter(c => c.visible);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visibleCards.length) return;

    const sourceCard = visibleCards[index];
    const targetCard = visibleCards[targetIndex];

    const updated = [...dashboardCards];
    const fullSourceIndex = updated.findIndex(c => c.id === sourceCard.id);
    const fullTargetIndex = updated.findIndex(c => c.id === targetCard.id);

    if (fullSourceIndex !== -1 && fullTargetIndex !== -1) {
      const [item] = updated.splice(fullSourceIndex, 1);
      updated.splice(fullTargetIndex, 0, item);
      handleSaveDashboardCards(updated);
    }
  };

  const handleDropDashboardCard = (targetIndex: number) => {
    if (draggedDashboardIndex === null || draggedDashboardIndex === targetIndex) {
      setDraggedDashboardIndex(null);
      setDragOverDashboardIndex(null);
      return;
    }

    const visibleCards = dashboardCards.filter(c => c.visible);
    const sourceCard = visibleCards[draggedDashboardIndex];
    const targetCard = visibleCards[targetIndex];

    if (!sourceCard || !targetCard) {
      setDraggedDashboardIndex(null);
      setDragOverDashboardIndex(null);
      return;
    }

    const updated = [...dashboardCards];
    const fullSourceIndex = updated.findIndex(c => c.id === sourceCard.id);
    const fullTargetIndex = updated.findIndex(c => c.id === targetCard.id);

    if (fullSourceIndex !== -1 && fullTargetIndex !== -1) {
      const [item] = updated.splice(fullSourceIndex, 1);
      updated.splice(fullTargetIndex, 0, item);
      handleSaveDashboardCards(updated);
    }

    setDraggedDashboardIndex(null);
    setDragOverDashboardIndex(null);
  };

  const handleApplyPreset = (preset: 'fees' | 'tasks' | 'risks' | 'default') => {
    let orderedIds: string[] = [];
    if (preset === 'fees') {
      orderedIds = ['fees', 'kpis', 'tasks', 'risks', 'alerts', 'calendar', 'tools', 'services'];
    } else if (preset === 'tasks') {
      orderedIds = ['tasks', 'alerts', 'kpis', 'fees', 'risks', 'calendar', 'tools', 'services'];
    } else if (preset === 'risks') {
      orderedIds = ['risks', 'alerts', 'kpis', 'fees', 'tasks', 'calendar', 'tools', 'services'];
    } else {
      orderedIds = DEFAULT_DASHBOARD_CARDS.map(c => c.id);
    }

    const newArr: DashboardCardConfig[] = [];
    orderedIds.forEach(id => {
      const found = dashboardCards.find(c => c.id === id) || DEFAULT_DASHBOARD_CARDS.find(c => c.id === id);
      if (found) {
        newArr.push({ ...found, visible: true });
      }
    });
    handleSaveDashboardCards(newArr);
  };

  // Global Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenViolationsAnalyzer = (violationId?: string) => {
    setSelectedViolationForAnalyzer(violationId || null);
    setActiveTab('violations_analyzer');
  };

  // Notifications Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAuth = (mode: AuthMode | 'onboarding' = 'login', portal: AuthPortal = 'client') => {
    setAuthOnboardingInitialView(mode === 'register' ? 'register' : mode === 'onboarding' ? 'onboarding' : 'login');
    setAuthInitialPortal(portal);
    setViewMode('auth_onboarding');
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    
    // Multi-role users trigger role selection modal
    if (user.roles && user.roles.length > 1) {
      setViewMode('app');
      setIsRoleSelectionOpen(true);
      return;
    }

    setViewMode('app');
    if (user.role === 'admin') {
      setCurrentRole('admin');
      setActiveTab('admin_kpis');
      showToast(`مرحباً بك في لوحة إدارة سبّاق (HQ Operations)، ${user.name}`);
    } else if (user.role === 'partner_agent') {
      setCurrentRole('partner_agent');
      setActiveTab('partner_dashboard');
      showToast(`مرحباً بك في بوابة المعقب والشريك الميداني، ${user.name}`);
    } else {
      setCurrentRole('client');
      setActiveTab('dashboard');
      showToast(`مرحباً بك في بوابة المنشآت، ${user.name}`);
    }
  };

  // RBAC Access Control Guard
  useEffect(() => {
    if (currentRole === 'client' || currentRole === 'customer') {
      if (activeTab.startsWith('admin_')) {
        setActiveTab('dashboard');
        showToast('تنبيه أمني: غير مصرح لحساب المنشأة بالوصول إلى لوحة إدارة سبّاق المركزية.');
      }
    }
  }, [currentRole, activeTab]);

  const handleCompleteOnboarding = (
    user: UserAccount,
    newEst: Establishment,
    initialLicenses: License[],
    initialDocs: DocumentItem[]
  ) => {
    setCurrentUser(user);
    setEstablishments(prev => [newEst, ...prev]);
    setActiveEstablishmentId(newEst.id);
    if (initialLicenses && initialLicenses.length > 0) {
      setLicenses(prev => [...initialLicenses, ...prev]);
    }
    if (initialDocs && initialDocs.length > 0) {
      setDocuments(prev => [...initialDocs, ...prev]);
    }
    setViewMode('app');
    setActiveTab('dashboard');
    showToast(`أهلاً بك في منصة سبّاق! تم توثيق المنشأة «${newEst.name}» وتفعيل مركز الامتثال بنجاح.`);
  };

  const handleRegisterSuccess = (user: UserAccount, establishmentData?: any) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    
    // If new establishment was registered, add it to state and select it
    if (establishmentData) {
      const newEst: Establishment = {
        id: `est-${Date.now()}`,
        name: establishmentData.name || 'منشأة جديدة',
        crNumber: establishmentData.crNumber || '1010998877',
        legalForm: 'شركة ذات مسؤولية محدودة',
        city: establishmentData.city || 'الرياض',
        district: establishmentData.district || 'العليا',
        nationalAddress: `الرياض - ${establishmentData.district || 'العليا'}`,
        mainActivity: establishmentData.activity || 'مطاعم وتقديم وجبات',
        isicActivities: [establishmentData.activity || 'مطاعم وتقديم وجبات'],
        branchesCount: 1,
        totalEmployees: 12,
        saudiEmployees: 4,
        saudizationPercentage: 33.3,
        complianceScore: 92,
        riskScore: 25,
        contactPerson: user.name,
        contactPhone: user.phone || '0500000000',
        contactEmail: user.email,
        registrationDate: new Date().toISOString().split('T')[0]
      };
      setEstablishments(prev => [newEst, ...prev]);
      setActiveEstablishmentId(newEst.id);
    }
    
    setViewMode('app');
    showToast(`أهلاً بك في منصة سبّاق، تم إنشاء الحساب وربط المنشأة بنجاح.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('auth_onboarding');
    setAuthOnboardingInitialView('login');
    showToast('تم تسجيل الخروج بنجاح.');
  };

  const activeEstablishment = establishments.find(e => e.id === activeEstablishmentId) || establishments[0];

  // Calculated Metrics
  const activeRisk = calculateEstablishmentRisk(
    activeEstablishment,
    licenses,
    documents,
    violations,
    orders
  );

  const urgentAlertsCount = licenses.filter(
    l => l.establishmentId === activeEstablishment.id && (l.status === 'expired' || l.daysRemaining <= 15)
  ).length + violations.filter(v => v.establishmentId === activeEstablishment.id && v.status !== 'rectified').length;

  // Handlers
  const handleAddToCart = (service: ServiceCatalogItem, customOptions?: any) => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      authority: service.authority,
      govFee: service.govFeeEstimated,
      sabbaqFee: service.sabbaqFee,
      vat: service.vatAmount,
      total: service.totalEstimated,
      status: 'pending',
    };

    setCartItems(prev => [...prev, newItem]);
    showToast(`تمت إضافة «${service.name}» إلى سلة الطلبات.`);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    showToast('تم حذف الخدمة من السلة.');
  };

  const handleSubmitOrder = (customNotes: string, autoApproved?: boolean) => {
    const orderNumber = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalGov = cartItems.reduce((s, i) => s + i.govFee, 0);
    const totalSabbaq = cartItems.reduce((s, i) => s + i.sabbaqFee, 0);
    const totalVat = cartItems.reduce((s, i) => s + i.vat, 0);
    const totalAmount = totalGov + totalSabbaq + totalVat;

    const newOrder: MasterOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      establishmentId: activeEstablishment.id,
      status: autoApproved ? 'in_progress' : 'awaiting_approval',
      quoteApproved: !!autoApproved,
      isAutoApproved: !!autoApproved,
      autoRenewAnnual: !!autoApproved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [...cartItems],
      govFeeTotal: totalGov,
      sabbaqFeeTotal: totalSabbaq,
      vatTotal: totalVat,
      totalAmount,
      notes: autoApproved 
        ? `${customNotes ? customNotes + ' | ' : ''}[معتمد تلقائياً للتجديد السنوي الفوري - تم تجاوز مرحلة انتظار اعتماد عرض السعر بناءً على موافقة العميل على الرسوم التقديرية]` 
        : customNotes,
      assignedSpecialist: 'سعد بن فهد (أخصائي بلدي وسلامة)',
      govTransactionNumbers: autoApproved ? [`GOV-AUTO-1447-${Math.floor(10000 + Math.random() * 90000)}`] : [],
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);

    // Add to Action items
    const newAction: ActionItemToday = {
      id: `act-${Date.now()}`,
      establishmentId: activeEstablishment.id,
      type: autoApproved ? 'pay_invoice' : 'approve_quote',
      title: autoApproved 
        ? `طلب التجديد السنوي ${orderNumber} (معتمد تلقائياً - قيد التنفيذ المباشر)` 
        : `اعتماد عرض سعر الطلب ${orderNumber}`,
      subtitle: autoApproved 
        ? `أحيل الطلب فورياً للمستشار المختص لإتمام التجديد بإجمالي رسوم تقديرية ${formatSAR(totalAmount)}` 
        : `تم تدقيق الرسوم الحكومية ورسوم سبّاق بإجمالي ${formatSAR(totalAmount)}`,
      actionLabel: autoApproved ? 'متابعة المعاملة والتنفيذ' : 'اعتماد عرض السعر والدفع',
      actionUrl: `/orders/${newOrder.id}`,
      priority: autoApproved ? 'urgent' : 'high',
      relatedEntityId: newOrder.id,
      dueDate: autoApproved ? 'جاري التنفيذ الفوري' : 'خلال 48 ساعة',
    };
    setActionItems(prev => [newAction, ...prev]);

    if (autoApproved) {
      showToast(`تم تفعيل الاعتماد التلقائي وإرسال الطلب ${orderNumber} فورياً للفريق المختص للبدء بالتنفيذ.`);
    } else {
      showToast(`تم إنشاء الطلب بنجاح برقم مرجعي: ${orderNumber}`);
    }
    setActiveTab('orders');
  };

  const handleRequestServiceFromLanding = (
    service: ServiceCatalogItem,
    details: {
      establishmentName?: string;
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      notes?: string;
      branchName?: string;
    }
  ) => {
    const orderNumber = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const govFee = service.govFeeEstimated;
    const sabbaqFee = service.sabbaqFee;
    const vat = service.vatAmount;
    const totalAmount = service.totalEstimated;

    const estName = details.establishmentName || activeEstablishment?.name || 'منشأة عميل سبّاق';

    const newOrderItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      serviceName: service.name,
      authority: service.authority,
      type: service.type,
      govFee,
      sabbaqFee,
      vat,
      total: totalAmount,
      customNotes: details.notes || '',
      status: 'pending',
    };

    const newOrder: MasterOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      establishmentId: activeEstablishment?.id || 'est-1',
      establishmentName: estName,
      status: 'awaiting_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [newOrderItem],
      govFeeTotal: govFee,
      sabbaqFeeTotal: sabbaqFee,
      vatTotal: vat,
      totalAmount,
      notes: details.notes
        ? `${details.notes} | مقدم الطلب: ${details.contactPerson || currentUser?.name || 'زائر'} - الجوال: ${details.contactPhone || currentUser?.phone || 'غير مسجل'}`
        : `طلب خدمة مباشرة من الصفحة الرئيسية | مقدم الطلب: ${details.contactPerson || currentUser?.name || 'زائر'} - الجوال: ${details.contactPhone || currentUser?.phone || 'غير مسجل'}`,
      assignedSpecialist: 'سعد بن فهد (أخصائي بلدي وسلامة)',
      govTransactionNumbers: [],
    };

    setOrders(prev => [newOrder, ...prev]);

    // Add to Action items
    const newAction: ActionItemToday = {
      id: `act-${Date.now()}`,
      establishmentId: activeEstablishment?.id || 'est-1',
      type: 'approve_quote',
      title: `اعتماد عرض سعر الطلب ${orderNumber} (${service.name})`,
      subtitle: `تم تدقيق الرسوم الحكومية ورسوم سبّاق بإجمالي ${formatSAR(newOrder.totalAmount)}`,
      actionLabel: 'اعتماد عرض السعر والدفع',
      actionUrl: `/orders/${newOrder.id}`,
      priority: 'high',
      relatedEntityId: newOrder.id,
      dueDate: 'خلال 24 ساعة',
    };
    setActionItems(prev => [newAction, ...prev]);

    showToast(`تم استلام طلب «${service.name}» برقم: ${orderNumber} وإدراجه في لوحة التحكم والإدارة.`);
    return newOrder;
  };

  // URL routing synchronization for public services
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/services' || path === '/services/') {
        setViewMode('public_services');
        setActivePublicServiceSlug(null);
      } else if (path.startsWith('/services/')) {
        const slug = path.replace('/services/', '').replace(/\/$/, '').trim();
        if (slug) {
          setViewMode('public_services');
          setActivePublicServiceSlug(slug);
        }
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateToPublicServices = (slug?: string) => {
    setActivePublicServiceSlug(slug || null);
    setViewMode('public_services');
    if (slug) {
      window.history.pushState({}, '', `/services/${slug}`);
    } else {
      window.history.pushState({}, '', '/services');
    }
  };

  const handleAdminUpdateService = (updated: ServiceCatalogItem) => {
    setServicesList(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    showToast(`تم حفظ وتحديث بيانات الخدمة «${updated.name}» بنجاح.`);
  };

  const handleAdminAddService = (newService: ServiceCatalogItem) => {
    setServicesList(prev => [newService, ...prev]);
    showToast(`تمت إضافة خدمة «${newService.name}» بنجاح إلى الكتالوج.`);
  };

  const handleAdminToggleServiceStatus = (serviceId: string) => {
    setServicesList(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const nextActive = !s.isActive;
          showToast(`تم ${nextActive ? 'تفعيل' : 'تعطيل'} ظهور الخدمة في الكتالوج.`);
          return { ...s, isActive: nextActive };
        }
        return s;
      })
    );
  };

  const handleOpenCheckout = (service: ServiceCatalogItem) => {
    setCheckoutService(service);
    setIsCheckoutModalOpen(true);
  };

  const handleSubmitCheckout = (orderData: {
    service: ServiceCatalogItem;
    establishmentName: string;
    crNumber?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    branchName: string;
    notes?: string;
    paymentMethod: 'invoice' | 'direct_card' | 'bank_transfer';
    uploadedDocuments: { name: string; size: string; uploadedAt: string }[];
    isGuest: boolean;
  }) => {
    const orderNumber = `SBQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const govFee = orderData.service.govFeeEstimated;
    const sabbaqFee = orderData.service.sabbaqFee;
    const vat = Math.round(sabbaqFee * 0.15);
    const totalAmount = govFee + sabbaqFee + vat;
    const isDirect = orderData.paymentMethod === 'direct_card';

    const newOrder: MasterOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      establishmentId: activeEstablishment?.id || 'est-guest',
      status: isDirect ? 'in_progress' : 'awaiting_approval',
      quoteApproved: isDirect,
      isAutoApproved: isDirect,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          serviceId: orderData.service.id,
          serviceName: orderData.service.name,
          authority: orderData.service.authority,
          type: orderData.service.type,
          govFee,
          sabbaqFee,
          vat,
          total: totalAmount,
          status: isDirect ? 'in_progress' : 'pending',
        },
      ],
      govFeeTotal: govFee,
      sabbaqFeeTotal: sabbaqFee,
      vatTotal: vat,
      totalAmount,
      notes: `${orderData.notes ? orderData.notes + ' | ' : ''}طلب من الكتالوج العام (${orderData.establishmentName} - ${orderData.contactName} - ${orderData.contactPhone})`,
      assignedSpecialist: 'فريق العمليات الحكومية الموحد',
      govTransactionNumbers: isDirect ? [`GOV-AUTO-1447-${Math.floor(10000 + Math.random() * 90000)}`] : [],
    };

    setOrders(prev => [newOrder, ...prev]);

    const newAction: ActionItemToday = {
      id: `act-${Date.now()}`,
      establishmentId: activeEstablishment?.id || 'est-guest',
      type: isDirect ? 'pay_invoice' : 'approve_quote',
      title: isDirect
        ? `طلب رقم ${orderNumber} (${orderData.service.name}) - قيد التنفيذ المباشر`
        : `اعتماد عرض سعر الطلب ${orderNumber} (${orderData.service.name})`,
      subtitle: `الرسوم الحكومية ورسوم سبّاق بإجمالي ${formatSAR(totalAmount)}`,
      actionLabel: isDirect ? 'متابعة المعاملة' : 'اعتماد وعرض الفاتورة',
      actionUrl: `/orders/${newOrder.id}`,
      priority: isDirect ? 'urgent' : 'high',
      relatedEntityId: newOrder.id,
      dueDate: isDirect ? 'جاري المتابعة الآن' : 'خلال 24 ساعة',
    };
    setActionItems(prev => [newAction, ...prev]);

    showToast(`تم إنشاء طلبك بنجاح برقم ${orderNumber}.`);
    setIsCheckoutModalOpen(false);
    setCheckoutService(null);
  };

  const handleInstantRenewLicense = (license: License) => {
    const renewService: ServiceCatalogItem = {
      id: `renew-${license.id}`,
      code: 'RENEW-INSTANT',
      name: `تجديد ترخيص: ${license.name}`,
      category: 'municipal',
      authority: license.authority,
      type: 'renewal',
      description: `طلب تجديد فوري للترخيص رقم ${license.licenseNumber} التابع للمنشأة قبل انتهاء المهلة النظامية.`,
      requiredDocuments: ['الترخيص السابق', 'عقد الإيجار الإلكتروني', 'السجل التجاري'],
      govFeeEstimated: license.costGov,
      sabbaqFee: license.costSabbaq,
      vatAmount: license.costSabbaq * 0.15,
      totalEstimated: license.costGov + license.costSabbaq + (license.costSabbaq * 0.15),
      recurringAnnualGov: license.costGov,
      estimatedDays: '1-3 أيام عمل',
    };

    handleAddToCart(renewService);
    setIsCartOpen(true);
  };

  const handleBatchRenewLicenses = (licensesToRenew: License[]) => {
    if (!licensesToRenew || licensesToRenew.length === 0) return;

    const newOrderItems: OrderItem[] = licensesToRenew.map(license => {
      const govFee = license.costGov || 0;
      const sabbaqFee = license.costSabbaq || 0;
      const vat = Math.round(sabbaqFee * 0.15);
      const total = govFee + sabbaqFee + vat;

      return {
        id: `batch-item-${license.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        serviceId: `renew-${license.id}`,
        serviceName: `تجديد ترخيص: ${license.name}`,
        authority: license.authority,
        type: 'renewal',
        govFee,
        sabbaqFee,
        vat,
        total,
        status: 'pending',
        customNotes: `تجديد فوري مجمع للترخيص رقم ${license.licenseNumber} التابع للمنشأة قبل انتهاء المهلة النظامية.`
      };
    });

    setCartItems(prev => [...prev, ...newOrderItems]);
  };

  const handleApproveQuote = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'awaiting_payment', updatedAt: new Date().toISOString() };
      }
      return o;
    }));
    showToast('تم اعتماد عرض السعر بنجاح! يرجى سداد الفاتورة للبدء بالتنفيذ.');
  };

  const handlePayOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: 'in_progress', 
          updatedAt: new Date().toISOString(),
          govTransactionNumbers: [`GOV-1447-${Math.floor(10000 + Math.random() * 90000)}`] 
        };
      }
      return o;
    }));
    setActionItems(prev => prev.filter(a => a.relatedEntityId !== orderId));
    showToast('تم استلام الدفعة بنجاح وبدأ فريق سبّاق التنفيذ ورفع المعاملة الحكومية.');
  };

  const handleSendSpecialistMessage = (orderId: string, message: string) => {
    showToast('تم إرسال رسالتك لمستشار المعاملة بنجاح.');
  };

  const handleActionItemClick = (item: ActionItemToday) => {
    if (item.type === 'approve_quote' || item.type === 'pay_invoice') {
      setActiveTab('orders');
    } else if (item.type === 'renew_license') {
      setActiveTab('licenses');
    } else if (item.type === 'handle_violation') {
      handleOpenViolationsAnalyzer(item.relatedEntityId);
    } else if (item.type === 'upload_doc') {
      setActiveTab('company_documents');
    } else {
      setActiveTab('orders');
    }
  };

  const handleSelectGoal = (goal: CustomerGoalType) => {
    switch (goal) {
      case 'calculate_cost':
        setActiveTab('calculator');
        break;
      case 'fees_planning':
        setActiveTab('fees_planning');
        break;
      case 'sector_benchmark':
        setActiveTab('sector_benchmark');
        break;
      case 'proactive_alerts':
        setActiveTab('proactive_alerts');
        break;
      case 'team_permissions':
        setActiveTab('team_permissions');
        break;
      case 'issue_service':
        setActiveTab('services');
        break;
      case 'renew_license':
        setActiveTab('licenses');
        break;
      case 'monitor_licenses':
        setActiveTab('licenses');
        break;
      case 'resolve_violation':
        setActiveTab('risk_center');
        break;
      case 'build_compliance_file':
        setActiveTab('company_documents');
        break;
      case 'ai_consultation':
        setIsAIOpen(true);
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  const handleScanDocumentAI = async (fileData: string, mimeType: string) => {
    try {
      const res = await fetch('/api/gemini/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, mimeType }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleAddTeamMember = (newMemberData: Omit<TeamMember, 'id' | 'joinedAt'>) => {
    const newId = `user-emp-${Date.now()}`;
    const newMember: TeamMember = {
      ...newMemberData,
      id: newId,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setTeamMembers(prev => [newMember, ...prev]);

    const newLog: UserActivityLog = {
      id: `log-${Date.now()}`,
      establishmentId: activeEstablishmentId,
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'عبدالعزيز السبيعي',
      userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
      userAvatar: '👨‍💼',
      actionType: 'team_member_added',
      actionTitle: `إضافة عضو فريق وتعيين دور «${newMember.roleTitle}»`,
      actionDetails: `تمت دعوة ${newMember.name} (${newMember.jobTitle}) وتعيين صلاحيات ${newMember.permissions.length} إجراء نظامي.`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      ipAddress: '212.138.112.45',
      device: 'Chrome 127 - Windows 11',
      status: 'success',
      relatedEntityId: newId,
      relatedEntityType: 'team_member'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    const newLog: UserActivityLog = {
      id: `log-${Date.now()}`,
      establishmentId: activeEstablishmentId,
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'عبدالعزيز السبيعي',
      userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
      userAvatar: '👨‍💼',
      actionType: 'permission_changed',
      actionTitle: `تحديث صلاحيات الموظف «${updatedMember.name}»`,
      actionDetails: `تم تعديل الصلاحيات الممنوحة إلى (${updatedMember.permissions.length}) صلاحية بدور (${updatedMember.roleTitle}).`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      ipAddress: '212.138.112.45',
      device: 'Chrome 127 - Windows 11',
      status: 'success',
      relatedEntityId: updatedMember.id,
      relatedEntityType: 'team_member'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteTeamMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    if (member) {
      const newLog: UserActivityLog = {
        id: `log-${Date.now()}`,
        establishmentId: activeEstablishmentId,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'عبدالعزيز السبيعي',
        userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
        userAvatar: '👨‍💼',
        actionType: 'team_member_status',
        actionTitle: `حذف حساب الموظف «${member.name}»`,
        actionDetails: `تم إلغاء وصول وصلاحيات الحساب نهائياً من المنشأة.`,
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
        ipAddress: '212.138.112.45',
        device: 'Chrome 127 - Windows 11',
        status: 'warning',
        relatedEntityId: memberId,
        relatedEntityType: 'team_member'
      };
      setActivityLogs(prev => [newLog, ...prev]);
      showToast(`تم حذف حساب «${member.name}» بنجاح.`);
    }
  };

  const handleToggleMemberStatus = (memberId: string) => {
    setTeamMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const newStatus = m.status === 'suspended' ? 'active' : 'suspended';
        showToast(`تم ${newStatus === 'active' ? 'تفعيل' : 'تجميد'} حساب «${m.name}» بنجاح.`);
        
        const newLog: UserActivityLog = {
          id: `log-${Date.now()}`,
          establishmentId: activeEstablishmentId,
          userId: currentUser?.id || 'usr-1',
          userName: currentUser?.name || 'عبدالعزيز السبيعي',
          userRoleTitle: 'مالك المنشأة / المفوض الرئيسي',
          userAvatar: '👨‍💼',
          actionType: 'team_member_status',
          actionTitle: `${newStatus === 'active' ? 'تفعيل' : 'تجميد'} حساب الموظف «${m.name}»`,
          actionDetails: `تم تغيير حالة الحساب إلى (${newStatus === 'active' ? 'نشط ومفعل' : 'معلق ومجمد'}).`,
          timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
          ipAddress: '212.138.112.45',
          device: 'Chrome 127 - Windows 11',
          status: newStatus === 'active' ? 'success' : 'warning',
          relatedEntityId: memberId,
          relatedEntityType: 'team_member'
        };
        setActivityLogs(lPrev => [newLog, ...lPrev]);
        
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  // In-App Notifications Handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('تم تحديد كافة الإشعارات كمقروءة');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearReadNotifications = () => {
    const readCount = notifications.filter(n => n.isRead).length;
    setNotifications(prev => prev.filter(n => !n.isRead));
    showToast(`تم مسح ${readCount} إشعار مقروء بنجاح.`);
  };

  const handleAddNotification = (newNotifData: Omit<InAppNotification, 'id' | 'createdAt'>) => {
    const newNotif: InAppNotification = {
      ...newNotifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
    setLatestIncomingNotification(newNotif);
  };

  const handleNavigateFromNotification = (tab: string, entityId?: string, entityType?: string) => {
    setActiveTab(tab);
    if (entityType === 'violation' && entityId) {
      const v = violations.find(item => item.id === entityId);
      if (v) {
        setObjectionViolation(v);
      }
    }
  };

  // Legal Documents & Contracts Handlers
  const handleSaveLegalDocument = (doc: LegalDocument) => {
    setLegalDocuments(prev => {
      const exists = prev.some(d => d.id === doc.id);
      if (exists) {
        return prev.map(d => d.id === doc.id ? doc : d);
      }
      return [doc, ...prev];
    });
    showToast(`تم حفظ الوثيقة القانونية «${doc.title}» بنجاح.`);
  };

  const handleDeleteLegalDocument = (docId: string) => {
    setLegalDocuments(prev => prev.filter(d => d.id !== docId));
    showToast('تم حذف الوثيقة من المكتبة القانونية.');
  };

  const handleOpenLegalEditor = (doc?: LegalDocument, template?: LegalContractTemplate) => {
    setEditingLegalDoc(doc || null);
    setEditingLegalTemplate(template || null);
    setActiveTab('contract_editor');
  };

  if (viewMode === 'auth_onboarding') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <AuthAndOnboardingPage
          initialView={authOnboardingInitialView}
          initialPortal={authInitialPortal}
          onLoginSuccess={handleLoginSuccess}
          onCompleteOnboarding={handleCompleteOnboarding}
          onBackToLanding={() => setViewMode('landing')}
          showToast={showToast}
        />
      </div>
    );
  }

  if (viewMode === 'public_services') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <PublicServicesPage
          services={servicesList}
          cartItemIds={cartItems.map(c => c.serviceId || c.id)}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onRequestService={handleOpenCheckout}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={handleOpenAuth}
          onGoToHome={() => {
            setViewMode('landing');
            window.history.pushState({}, '', '/');
          }}
          onGoToDashboard={() => setViewMode('app')}
          currentUser={currentUser}
          selectedSlugOrId={activePublicServiceSlug || undefined}
          onSelectServiceSlug={(slug) => {
            setActivePublicServiceSlug(slug || null);
            if (slug) {
              window.history.pushState({}, '', `/services/${slug}`);
            } else {
              window.history.pushState({}, '', '/services');
            }
          }}
        />

        {/* Order Checkout Modal */}
        <OrderCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => {
            setIsCheckoutModalOpen(false);
            setCheckoutService(null);
          }}
          selectedService={checkoutService}
          currentUser={currentUser}
          establishments={establishments}
          activeEstablishment={activeEstablishment}
          onOpenAuth={(mode) => handleOpenAuth(mode, 'client')}
          onCompleteOrder={(order) => {
            setOrders(prev => [order, ...prev]);
            showToast(`تم استلام طلبك بنجاح برقم: ${order.orderNumber}`);
          }}
          onGoToOrders={() => {
            setIsCheckoutModalOpen(false);
            setViewMode('app');
            setActiveTab('orders');
          }}
          onBrowseServices={() => {
            setIsCheckoutModalOpen(false);
            handleNavigateToPublicServices();
          }}
        />

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onSubmitOrder={handleSubmitOrder}
          activeEstablishment={activeEstablishment}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          initialPortal={authInitialPortal}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          showToast={showToast}
        />
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterAppAsGuest={() => {
            setViewMode('app');
          }}
          onSelectPlan={() => {
            handleOpenAuth('register');
          }}
          currentUser={currentUser}
          onGoToDashboard={() => setViewMode('app')}
          onGoToOrders={() => {
            setViewMode('app');
            setActiveTab('orders');
          }}
          services={servicesList}
          onRequestService={handleRequestServiceFromLanding}
          onOpenPublicServices={handleNavigateToPublicServices}
          onAddToCart={handleAddToCart}
          onInitiateCheckout={handleOpenCheckout}
          onOpenCart={() => setIsCartOpen(true)}
          cartItemsCount={cartItems.length}
        />

        {/* Order Checkout Modal */}
        <OrderCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => {
            setIsCheckoutModalOpen(false);
            setCheckoutService(null);
          }}
          selectedService={checkoutService}
          currentUser={currentUser}
          establishments={establishments}
          activeEstablishment={activeEstablishment}
          onOpenAuth={(mode) => handleOpenAuth(mode, 'client')}
          onCompleteOrder={(order) => {
            setOrders(prev => [order, ...prev]);
            showToast(`تم استلام طلبك بنجاح برقم: ${order.orderNumber}`);
          }}
          onGoToOrders={() => {
            setIsCheckoutModalOpen(false);
            setViewMode('app');
            setActiveTab('orders');
          }}
          onBrowseServices={() => {
            setIsCheckoutModalOpen(false);
            handleNavigateToPublicServices();
          }}
        />

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onSubmitOrder={handleSubmitOrder}
          activeEstablishment={activeEstablishment}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          initialPortal={authInitialPortal}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex font-sans selection:bg-emerald-100 selection:text-emerald-900" dir="rtl">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live In-App Notification Toast Banner */}
      <LiveNotificationToastBanner
        latestNotification={latestIncomingNotification}
        onClose={() => setLatestIncomingNotification(null)}
        onAction={(notif) => {
          if (notif.targetTab) {
            handleNavigateFromNotification(notif.targetTab, notif.targetEntityId, notif.targetEntityType);
          }
        }}
      />

      {/* Main Sidebar Navigation: Conditionally rendered based on currentRole */}
      {currentRole === 'admin' ? (
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser || {
            id: 'adm-1',
            name: 'م. عبدالعزيز بن سعد السالم',
            email: 'admin@sabbaq.sa',
            phone: '0509988776',
            role: 'admin',
            isVerified: true,
            authProvider: 'admin_staff',
            establishmentName: 'إدارة عمليات ورقابة منصة سبّاق',
            createdAt: '2026-01-01'
          }}
          onLogout={handleLogout}
          pendingOrdersCount={orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
          pendingDocsCount={documents.filter(d => d.status === 'under_review').length}
        />
      ) : currentRole === 'supplier' ? (
        <SupplierSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          onGoToLanding={() => setViewMode('landing')}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRoleSelector={() => setIsRoleSelectionOpen(true)}
        />
      ) : (
        <CustomerSidebar
          activeEstablishment={activeEstablishment}
          establishments={establishments}
          onSelectEstablishment={(est) => {
            setActiveEstablishmentId(est.id);
            showToast(`تم التبديل إلى: ${est.name}`);
          }}
          cartItemsCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenGoalSelector={() => setIsGoalSelectorOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNotifications={() => setActiveTab('proactive_alerts')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          urgentAlertsCount={urgentAlertsCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          onGoToLanding={() => setViewMode('landing')}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onOpenPublicServices={() => handleNavigateToPublicServices()}
          onOpenUploadDoc={() => setActiveTab('company_documents')}
          onOpenFeeCalculator={() => setActiveTab('calculator')}
          onOpenCROnboarding={() => handleOpenAuth('onboarding')}
          onExportCompliancePdf={() => setIsCompliancePdfOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
        />
      )}

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 transition-all duration-300">
        
        {/* Top Header Bar */}
        <TopHeader
          currentRole={currentRole}
          activeEstablishment={activeEstablishment}
          activeTab={activeTab}
          cartItemsCount={cartItems.length}
          urgentAlertsCount={urgentAlertsCount}
          licenses={licenses}
          documents={documents}
          branches={branches}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onDeleteNotification={handleDeleteNotification}
          onClearReadNotifications={handleClearReadNotifications}
          onAddNotification={handleAddNotification}
          onNavigateToTab={handleNavigateFromNotification}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenGoalSelector={() => setIsGoalSelectorOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAlertsCenter={() => setActiveTab('proactive_alerts')}
          onInstantRenewLicense={handleInstantRenewLicense}
          onOpenRoleSelector={() => setIsRoleSelectionOpen(true)}
          onConsultSpecialist={(topic) => {
            setIsAIOpen(true);
            showToast(`جاري استشارة سبّاق الذكي بخصوص: ${topic}`);
          }}
          currentUser={currentUser}
          onGoToLanding={() => setViewMode('landing')}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          showToast={showToast}
        />

        {/* Main Application Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* VIEW: Admin Role Active */}
        {currentRole === 'admin' ? (
          <AdminDashboard
            activeTab={activeTab}
            onNavigateAdminTab={(tab) => setActiveTab(tab)}
            orders={orders}
            establishments={establishments}
            licenses={licenses}
            violations={violations}
            services={servicesList}
            documents={documents}
            onUpdateOrderStatus={(orderId, newStatus) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
              showToast(`تم تحديث حالة الطلب إلى: ${newStatus}`);
            }}
            onAssignSpecialist={(orderId, spec) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedSpecialist: spec } : o));
              showToast(`تم تعيين المستشار / المعقب: ${spec}`);
            }}
            onUpdateGovTransactionNumber={(orderId, govTx) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, govTransactionNumbers: [...(o.govTransactionNumbers || []), govTx] } : o));
              showToast(`تم إضافة رقم المعاملة الحكومية: ${govTx}`);
            }}
            onUpdateService={handleAdminUpdateService}
            onAddService={handleAdminAddService}
            onToggleServiceStatus={handleAdminToggleServiceStatus}
            showToast={showToast}
          />
        ) : currentRole === 'partner_agent' ? (
          <PartnerAgentDashboard
            currentUser={currentUser || undefined}
            orders={orders}
            establishments={establishments}
            licenses={licenses}
            onUpdateOrderStatus={(orderId, newStatus, notes) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, notes: notes ? `${o.notes || ''} | تقرير المعقب: ${notes}` : o.notes, updatedAt: new Date().toISOString() } : o));
              showToast(`تم تحديث حالة المعاملة بنجاح.`);
            }}
            onUpdateGovTransactionNumber={(orderId, govTx) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, govTransactionNumbers: [...(o.govTransactionNumbers || []), govTx] } : o));
              showToast(`تم تسجيل رقم المعاملة الحكومية: ${govTx}`);
            }}
            showToast={showToast}
          />
        ) : currentRole === 'supplier' ? (
          <SupplierDashboard
            currentUser={currentUser || undefined}
            onNavigateTab={(tab) => setActiveTab(tab)}
            showToast={showToast}
          />
        ) : (
          /* VIEW: Client Role Active */
          <>
            {/* Dashboard Home View - Refined Concise Layout */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Clean Establishment Context Header */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-['Cairo']">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {activeEstablishment.name}
                        </h1>
                        <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                          سجل تجاري: {activeEstablishment.crNumber}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {activeEstablishment.city || 'الرياض'} • {activeEstablishment.legalType || 'شركة ذات مسؤولية محدودة'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        لوحة التحكم المركزية للامتثال المؤسسي ومتابعة التراخيص والمخاطر والطلبات
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('public_services')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>طلب خدمة جديدة</span>
                    </button>

                    <button
                      onClick={() => setIsCompliancePdfOpen(true)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>تقرير الامتثال (PDF)</span>
                    </button>

                    <button
                      onClick={() => setIsAIOpen(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>استشارة سبّاق الذكي</span>
                    </button>
                  </div>
                </div>

                {/* 1. Four Core KPI Metric Cards */}
                <PerformanceSummaryCards
                  establishment={activeEstablishment}
                  licenses={licenses}
                  branches={branches}
                  documents={documents}
                  violations={violations}
                  orders={orders}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onExportPdf={() => setIsCompliancePdfOpen(true)}
                  showToast={showToast}
                />

                {/* 2. Compliance Calendar (التقويم الزمني للامتثال والمواعيد النظامية) */}
                <ComplianceCalendar
                  establishment={activeEstablishment}
                  licenses={licenses}
                  documents={documents}
                  violations={violations}
                  branches={branches}
                  onRenewLicense={handleInstantRenewLicense}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onOpenObjectionModal={(viol) => setObjectionViolation(viol)}
                  showToast={showToast}
                />

                {/* 3. Top 5 Urgent Tasks & Actions */}
                {(() => {
                  const estActionItems = actionItems
                    .filter(a => a.establishmentId === activeEstablishment.id)
                    .sort((a, b) => {
                      const priorityWeight: Record<string, number> = { urgent: 3, high: 2, medium: 1, normal: 0 };
                      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                    });
                  const top5Tasks = estActionItems.slice(0, 5);

                  const getActionTypeIcon = (type: string) => {
                    switch (type) {
                      case 'renew_license':
                        return <RotateCw className="w-4 h-4 text-amber-600" />;
                      case 'auto_renew_contract':
                      case 'renew_contract':
                        return <Sparkles className="w-4 h-4 text-indigo-600" />;
                      case 'handle_violation':
                        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
                      case 'approve_quote':
                        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                      case 'pay_invoice':
                        return <DollarSign className="w-4 h-4 text-blue-600" />;
                      case 'upload_doc':
                        return <Upload className="w-4 h-4 text-indigo-600" />;
                      default:
                        return <Clock className="w-4 h-4 text-slate-600" />;
                    }
                  };

                  const getTaskPriorityBadge = (priority: string) => {
                    switch (priority) {
                      case 'urgent':
                        return { label: 'عاجل جداً', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
                      case 'high':
                        return { label: 'أولوية مرتفعة', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
                      default:
                        return { label: 'إجراء معلق', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
                    }
                  };

                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden font-['Cairo']">
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base font-bold text-slate-900">
                                أهم 5 مهام وإجراءات اليوم
                              </h2>
                              <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                {estActionItems.length} إجراء معلق
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              إجراءات الاستحقاق والتجديدات المباشرة لحماية الامتثال وسريان التراخيص
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('proactive_alerts')}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>مركز التنبيهات الاستباقية</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 divide-y divide-slate-100">
                        {top5Tasks.length === 0 ? (
                          <div className="py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-slate-800 text-sm">ممتاز! لا توجد إجراءات معلقة أو متأخرة اليوم</p>
                            <p className="text-xs text-slate-500 mt-0.5">كافة التراخيص والمستندات والطلبات محدثة وممتثلة بالكامل.</p>
                          </div>
                        ) : (
                          top5Tasks.map((item, idx) => {
                            const pBadge = getTaskPriorityBadge(item.priority);
                            return (
                              <div
                                key={item.id}
                                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                                    {getActionTypeIcon(item.type)}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pBadge.bg}`}>
                                        {pBadge.label}
                                      </span>
                                      {item.dueDate && (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                          الموعد: {item.dueDate}
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                      {item.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 sm:self-center">
                                  <button
                                    onClick={() => handleActionItemClick(item)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  >
                                    <span>{item.actionLabel || 'تنفيذ الإجراء'}</span>
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Violations & Risk Summary (ملخص المخاطر والمخالفات) */}
                {(() => {
                  const estViolations = violations.filter(v => v.establishmentId === activeEstablishment.id);
                  const activeViolationsCount = estViolations.filter(v => v.status === 'open' || v.status === 'under_objection').length;
                  const totalFineAmount = estViolations.reduce((acc, v) => acc + (v.amount || 0), 0);

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-['Cairo']">
                      {/* Left: Risk Indicator & Score (5 Cols) */}
                      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                مؤشر المخاطر والغرامات المحتملة
                              </h3>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRiskLevelBadge(activeRisk.level).bg}`}>
                              المستوى: {getRiskLevelBadge(activeRisk.level).label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 py-3.5 my-1">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <span className="text-2xl font-extrabold text-slate-900 block font-['Cairo']">
                                {activeRisk.overallScore} / 100
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">مؤشر الخطر الحسابي</span>
                            </div>

                            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-center">
                              <span className="text-2xl font-extrabold text-rose-700 block font-['Cairo']">
                                {formatSAR(activeRisk.potentialFinesEstimated)}
                              </span>
                              <span className="text-[11px] text-rose-800 font-medium">غرامات محتملة متوقعة</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700 block text-[11px]">أبرز عوامل الخطر المؤثرة:</span>
                            {activeRisk.factors.length > 0 ? (
                              activeRisk.factors.slice(0, 2).map((f) => (
                                <div key={f.id} className="truncate flex items-center justify-between">
                                  <span className="truncate">• {f.factor}</span>
                                  <span className="font-bold text-rose-700 shrink-0">+{f.points} نقطة</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-emerald-700 font-medium">لا توجد عوامل خطر حرجة مرصودة حالياً.</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setActiveTab('risk_center')}
                            className="flex-1 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>مركز المخاطر والمخالفات</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveTab('violations_analyzer')}
                            className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                            <span>التحليل الإجرائي</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Active Violations List peek (7 Cols) */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <Scale className="w-5 h-5 text-rose-600" />
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                المخالفات المرصودة ومهلة السداد
                              </h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {activeViolationsCount} مخالفة نشطة • الإجمالي: {formatSAR(totalFineAmount)}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 mt-2">
                            {estViolations.length === 0 ? (
                              <div className="py-8 text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <p className="font-bold text-slate-800 text-sm">سجل المنشأة سليم تماماً</p>
                                <p className="text-xs text-slate-500 mt-0.5">لم يتم تسجيل أي مخالفات أو غرامات على هذه المنشأة.</p>
                              </div>
                            ) : (
                              estViolations.slice(0, 3).map((viol) => (
                                <div key={viol.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                        {viol.authority}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-900 truncate">
                                        {viol.title}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate">{viol.description}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {formatSAR(viol.amount)}
                                    </span>
                                    <button
                                      onClick={() => handleOpenViolationsAnalyzer()}
                                      className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      خطة التصحيح
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ميزة الرصد تحميك من مضاعفة الغرامة وتضمن خصم 25%</span>
                          </span>
                          <button
                            onClick={() => setActiveTab('violation_solutions_mapping')}
                            className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>دليل حلول المخالفات</span>
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3.5 Upcoming Violations Forecast Card (توقعات المخالفات القادمة بناءً على البيانات التاريخية وبيانات القطاع) */}
                <UpcomingViolationsForecastCard
                  establishment={activeEstablishment}
                  licenses={licenses}
                  violations={violations}
                  documents={documents}
                  branches={branches}
                  onRenewLicense={handleInstantRenewLicense}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onOpenAI={() => setIsAIOpen(true)}
                  showToast={showToast}
                />

                {/* 4. Compact Table for 4 Closest Licenses (جدول مختصر لأقرب 4 تراخيص) & 5. Orders Summary (ملخص الطلبات) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-['Cairo']">
                  
                  {/* 4. Compact 4 Licenses Table (7 Cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            أقرب 4 تراخيص للاستحقاق والتجديد
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('licenses')}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض كافة التراخيص ({licenses.filter(l => l.establishmentId === activeEstablishment.id).length})</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="overflow-x-auto mt-2">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100 text-[11px]">
                              <th className="py-2 font-medium">الترخيص والجهة</th>
                              <th className="py-2 font-medium">رقم الترخيص</th>
                              <th className="py-2 font-medium">الاستحقاق</th>
                              <th className="py-2 font-medium text-left">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[...licenses]
                              .filter(l => l.establishmentId === activeEstablishment.id)
                              .sort((a, b) => a.daysRemaining - b.daysRemaining)
                              .slice(0, 4)
                              .map((lic) => {
                                const isExpired = lic.daysRemaining < 0;
                                const isNear = lic.daysRemaining <= 15;

                                return (
                                  <tr key={lic.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-2.5 font-bold text-slate-900">
                                      <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        <div>
                                          <span className="block text-slate-900">{lic.name}</span>
                                          <span className="text-[10px] text-slate-400 font-normal">{lic.authority}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2.5 font-mono text-slate-600 text-[11px]">
                                      {lic.licenseNumber}
                                    </td>
                                    <td className="py-2.5">
                                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isExpired 
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                          : isNear 
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}>
                                        {isExpired ? `منتهي (${Math.abs(lic.daysRemaining)} يوم)` : `متبقي ${lic.daysRemaining} يوم`}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-left">
                                      <button
                                        onClick={() => handleInstantRenewLicense(lic)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                      >
                                        تجديد فوري
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>نظام التنبيهات يفعل الإشعارات التلقائية قبل 60، 30، و 7 أيام</span>
                      <button
                        onClick={() => setActiveTab('calendar')}
                        className="font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>عرض التقويم الزمني</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Orders Summary (5 Cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-teal-600" />
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            ملخص المعاملات والطلبات
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض الكل ({orders.filter(o => o.establishmentId === activeEstablishment.id).length})</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 mt-2">
                        {orders.filter(o => o.establishmentId === activeEstablishment.id).length === 0 ? (
                          <div className="py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-slate-800 text-sm">لا توجد طلبات جارية حالياً</p>
                            <p className="text-xs text-slate-500 mt-0.5">يمكنك طلب تراخيص جديدة أو خدمات تعقيب واستشارات عبر المنصة.</p>
                          </div>
                        ) : (
                          orders
                            .filter(o => o.establishmentId === activeEstablishment.id)
                            .slice(0, 3)
                            .map((order) => {
                              const sBadge = getOrderStatusBadge(order.status);
                              return (
                                <div key={order.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="font-mono text-[11px] font-bold text-slate-700">
                                        #{order.id.slice(-5)}
                                      </span>
                                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${sBadge.bg}`}>
                                        {sBadge.label}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 truncate font-semibold">
                                      {order.items && order.items.length > 0 ? order.items[0].name : 'معاملة ترخيص وخدمات امتثال'}
                                    </p>
                                    <span className="text-[10px] text-slate-400">
                                      المعقب/المستشار: {order.assignedSpecialist || 'جاري التعيين'}
                                    </span>
                                  </div>

                                  <div className="text-left shrink-0">
                                    <span className="font-extrabold text-slate-900 text-xs block font-['Cairo']">
                                      {formatSAR(order.totalAmount)}
                                    </span>
                                    <button
                                      onClick={() => setActiveTab('orders')}
                                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 mt-0.5"
                                    >
                                      متابعة
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveTab('public_services')}
                        className="w-full py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-teal-200 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>تقديم طلب خدمة جديد</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW: Unified Finance & Budget Planning (المالية، حاسبة الرسوم والميزانية التقديرية) */}
            {(activeTab === 'finance' || activeTab === 'fees_planning' || activeTab === 'calculator') && (
              <UnifiedFinance
                establishments={establishments}
                activeEstablishment={activeEstablishment}
                licenses={licenses}
                branches={branches}
                initialSubTab={activeTab === 'calculator' ? 'calculator' : 'planning'}
                onSelectEstablishment={(est) => {
                  setActiveEstablishmentId(est.id);
                  showToast(`تم التبديل إلى: ${est.name}`);
                }}
                onInstantRenewLicense={handleInstantRenewLicense}
                onAddToCart={handleAddToCart}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Service Catalog */}
            {activeTab === 'services' && (
              <ServiceCatalog
                services={servicesList}
                onAddToCart={handleAddToCart}
                cartItemIds={cartItems.map(i => i.serviceId)}
              />
            )}

            {/* VIEW: Compliance Calendar (التقويم الزمني للامتثال والمواعيد النظامية) */}
            {activeTab === 'calendar' && (
              <ComplianceCalendar
                establishment={activeEstablishment}
                licenses={licenses}
                documents={documents}
                violations={violations}
                branches={branches}
                onRenewLicense={handleInstantRenewLicense}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenObjectionModal={(viol) => setObjectionViolation(viol)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Unified Licenses, Documents & Vault (التراخيص والوثائق والحافظة والتوقيع الرقمي) */}
            {(activeTab === 'licenses' || activeTab === 'company_documents' || activeTab === 'legal_documents' || activeTab === 'digital_signatures') && (
              <UnifiedLicensesAndDocuments
                establishment={activeEstablishment}
                branches={branches}
                licenses={licenses}
                documents={documents}
                legalDocuments={legalDocuments}
                signaturesList={signaturesList}
                initialSubTab={
                  activeTab === 'company_documents' 
                    ? 'vault' 
                    : activeTab === 'legal_documents' 
                    ? 'legal' 
                    : activeTab === 'digital_signatures' 
                    ? 'signatures' 
                    : 'licenses'
                }
                onInstantRenewLicense={handleInstantRenewLicense}
                onAddNewLicense={() => {
                  setActiveTab('services');
                  showToast('اختر نوع الترخيص المراد إضافته أو إصداره من دليل الخدمات.');
                }}
                onUploadDocument={(newDoc) => {
                  setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
                  showToast(`تم حفظ وتحديث المستند «${newDoc.title}» في الحافظة الرقمية.`);
                }}
                onDeleteDocument={(docId) => {
                  setDocuments(prev => prev.filter(d => d.id !== docId));
                  showToast('تم حذف المستند بنجاح.');
                }}
                onScanDocumentAI={handleScanDocumentAI}
                onOpenLegalEditor={handleOpenLegalEditor}
                onSaveLegalDocument={handleSaveLegalDocument}
                onDeleteLegalDocument={handleDeleteLegalDocument}
                onAddSignatureRecord={(newRecord) => {
                  setSignaturesList(prev => [newRecord, ...prev]);
                  showToast(`تم توثيق سجل التوقيع الرقمي بالرمز: ${newRecord.verificationCode}`);
                }}
                onSignDocumentItem={(docId, sigResult) => {
                  setDocuments(prev => prev.map(d => d.id === docId ? {
                    ...d,
                    isSigned: true,
                    signedBy: sigResult.signerName,
                    signedAt: sigResult.signedAt,
                    verificationCode: sigResult.verificationCode,
                    signatureHash: sigResult.cryptographicHash,
                    signatureDataUrl: sigResult.signatureDataUrl,
                    nafathVerified: sigResult.nafathVerified
                  } : d));
                  showToast(`تم اعتماد وتوقيع المستند رقمياً برمز: ${sigResult.verificationCode}`);
                }}
                onSignLegalDocument={(legalDocId, sigResult) => {
                  setLegalDocuments(prev => prev.map(ld => ld.id === legalDocId ? {
                    ...ld,
                    status: 'signed_active',
                    signatures: ld.signatures.map((sig, idx) => idx === 0 ? {
                      ...sig,
                      isSigned: true,
                      signedDate: sigResult.signedAt.split('T')[0],
                      signerTitle: `${sigResult.signerName} (${sigResult.signerTitle})`,
                      verificationCode: sigResult.verificationCode,
                      signatureDataUrl: sigResult.signatureDataUrl
                    } : sig)
                  } : ld));
                  showToast(`تم توثيق وتوقيع العقد رقمياً بالرمز: ${sigResult.verificationCode}`);
                }}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري فتح استشارة سبّاق الذكي: ${topic}`);
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: AI Legal Contract Editor (محرر العقود واللوائح بالذكاء الاصطناعي) */}
            {activeTab === 'contract_editor' && (
              <AILegalContractEditor
                establishment={activeEstablishment}
                branches={branches}
                initialDocument={editingLegalDoc || undefined}
                initialTemplate={editingLegalTemplate || undefined}
                onSaveDocument={(doc) => {
                  handleSaveLegalDocument(doc);
                }}
                onBackToLibrary={() => {
                  setActiveTab('legal_documents');
                  setEditingLegalDoc(null);
                  setEditingLegalTemplate(null);
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: Geographic Risk Map (الخريطة الجغرافية للمخاطر) */}
            {activeTab === 'geo_map' && (
              <GeographicRiskMap
                establishment={activeEstablishment}
                branches={branches}
                licenses={licenses}
                violations={violations}
                hotspots={hotspots}
                onAddBranch={(newBranchData) => {
                  const newBranch: Branch = {
                    id: `branch-${Date.now()}`,
                    establishmentId: activeEstablishment.id,
                    name: newBranchData.name || 'فرع جديد',
                    city: newBranchData.city || 'الرياض',
                    district: newBranchData.district || 'حي النزهة',
                    areaSquareMeters: newBranchData.areaSquareMeters || 120,
                    employeesCount: newBranchData.employeesCount || 5,
                    nationalAddress: newBranchData.nationalAddress || 'المملكة العربية السعودية',
                    crNumber: newBranchData.crNumber,
                    coordinates: newBranchData.coordinates || { lat: 24.7136, lng: 46.6753 },
                    municipality: newBranchData.municipality || 'بلدية العليا الفرعية',
                    inspectionZoneDensity: newBranchData.inspectionZoneDensity || 'medium',
                    lastInspectionDate: newBranchData.lastInspectionDate || new Date().toISOString().split('T')[0],
                    activeCampaigns: newBranchData.activeCampaigns || ['حملة الامتثال البلدي']
                  };
                  setBranches(prev => [...prev, newBranch]);
                  showToast(`تمت إضافة الفرع بنجاح: ${newBranch.name}`);
                }}
                onRenewLicense={(licId) => {
                  const found = licenses.find(l => l.id === licId);
                  if (found) handleInstantRenewLicense(found);
                }}
                onOpenObjectionModal={(viol) => setObjectionViolation(viol)}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري استشارة سبّاق الذكي: ${topic}`);
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: Smart Violations & Procedural Manuals Analyzer (أداة التحليل الذكية للمخالفات والأدلة الإجرائية) */}
            {activeTab === 'violations_analyzer' && (
              <SmartViolationsAnalyzer
                establishment={activeEstablishment}
                branches={branches}
                violations={violations}
                documents={documents}
                initialSelectedViolationId={selectedViolationForAnalyzer}
                onOpenObjectionModal={(viol) => setObjectionViolation(viol)}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري استشارة سبّاق الذكي: ${topic}`);
                }}
                onUploadDoc={() => setActiveTab('company_documents')}
                onRenewLicense={(licId) => {
                  const found = licenses.find(l => l.id === licId);
                  if (found) handleInstantRenewLicense(found);
                }}
                onBack={() => setActiveTab('risk_center')}
                showToast={showToast}
              />
            )}

            {/* VIEW: Proactive Risk Center & Violations */}
            {activeTab === 'risk_center' && (
              <RiskCenter
                establishment={activeEstablishment}
                branches={branches}
                licenses={licenses}
                documents={documents}
                violations={violations}
                orders={orders}
                onRenewLicense={(licId) => {
                  const found = licenses.find(l => l.id === licId);
                  if (found) handleInstantRenewLicense(found);
                }}
                onUploadDoc={() => setActiveTab('company_documents')}
                onOpenObjectionModal={(viol) => setObjectionViolation(viol)}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري استشارة سبّاق الذكي بخصوص: ${topic}`);
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenViolationsAnalyzer={handleOpenViolationsAnalyzer}
                onExportPdf={() => setIsCompliancePdfOpen(true)}
                showToast={showToast}
              />
            )}

            {/* VIEW: Unified Digital File & Profile (ملف المنشأة - يشمل البيانات الأساسية، الفروع، والفريق والصلاحيات) */}
            {(activeTab === 'profile' || activeTab === 'branches' || activeTab === 'team_permissions') && (
              <EstablishmentProfile
                establishment={activeEstablishment}
                branches={branches}
                documents={documents}
                teamMembers={teamMembers}
                activityLogs={activityLogs}
                initialTab={activeTab === 'branches' ? 'branches' : activeTab === 'team_permissions' ? 'team_permissions' : 'info'}
                onUpdateEstablishment={(updated) => {
                  setEstablishments(prev => prev.map(e => e.id === updated.id ? updated : e));
                  showToast('تم حفظ بيانات المنشأة بنجاح.');
                }}
                onAddBranch={(newBranch) => {
                  const b: Branch = {
                    id: `branch-${Date.now()}`,
                    establishmentId: activeEstablishment.id,
                    name: newBranch.name || 'فرع جديد',
                    city: newBranch.city || activeEstablishment.city,
                    district: newBranch.district || 'حي جديد',
                    areaSquareMeters: newBranch.areaSquareMeters || 100,
                    nationalAddress: newBranch.nationalAddress || 'المملكة العربية السعودية',
                    crNumber: newBranch.crNumber,
                    employeesCount: newBranch.employeesCount || 2,
                    isMainBranch: false,
                  };
                  setBranches(prev => [...prev, b]);
                  showToast(`تمت إضافة الفرع «${b.name}» بنجاح.`);
                }}
                onUploadDocument={(newDoc) => {
                  const d: DocumentItem = {
                    id: `doc-${Date.now()}`,
                    establishmentId: activeEstablishment.id,
                    title: newDoc.title || 'مستند رسمي',
                    category: newDoc.category || 'commercial',
                    status: 'valid',
                    expiryDate: newDoc.expiryDate || '2027-12-30',
                    fileUrl: newDoc.fileUrl || '#',
                    fileSize: '1.4 MB',
                    isMandatory: true,
                    lastVerifiedAt: new Date().toISOString().split('T')[0],
                  };
                  setDocuments(prev => [d, ...prev]);
                  showToast(`تم حفظ المستند «${d.title}» في الأرشيف الرقمي.`);
                }}
                onScanDocumentAI={handleScanDocumentAI}
                onAddMember={handleAddTeamMember}
                onUpdateMember={handleUpdateTeamMember}
                onDeleteMember={handleDeleteTeamMember}
                onToggleMemberStatus={handleToggleMemberStatus}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري استشارة سبّاق الذكي بخصوص: ${topic}`);
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: Unified Orders Manager (الطلبات: متابعة المعاملات، طلب جديد، والسلة) */}
            {(activeTab === 'orders' || activeTab === 'new_order') && (
              <OrdersManager
                orders={orders}
                activeEstablishment={activeEstablishment}
                onApproveQuote={handleApproveQuote}
                onPayOrder={handlePayOrder}
                onSendSpecialistMessage={handleSendSpecialistMessage}
                onUploadMissingDoc={(orderId, docName) => {
                  showToast(`تم استلام المستند: ${docName}`);
                }}
                services={servicesList}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onSubmitCartOrder={(details) => handleSubmitOrder(details.notes || '', details.autoApproved)}
                onSubmitDirectOrder={handleRequestServiceFromLanding}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenCalculator={() => setActiveTab('calculator')}
                initialSubTab={activeTab === 'new_order' ? 'new_order' : 'tracking'}
                showToast={showToast}
              />
            )}

            {/* VIEW: Saudi Compliance Rules Registry */}
            {activeTab === 'rules' && (
              <ComplianceRulesRegistry rules={COMPLIANCE_RULES} />
            )}

            {/* VIEW: Sector Benchmark Dashboard (مقارنة متوسط القطاع) */}
            {activeTab === 'sector_benchmark' && (
              <SectorBenchmarkDashboard
                establishment={activeEstablishment}
                branches={branches}
                licenses={licenses}
                violations={violations}
                orders={orders}
                onRenewLicense={(licId) => {
                  const found = licenses.find(l => l.id === licId);
                  if (found) handleInstantRenewLicense(found);
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onConsultSpecialist={(topic) => {
                  setIsAIOpen(true);
                  showToast(`جاري استشارة سبّاق الذكي بخصوص: ${topic}`);
                }}
                showToast={showToast}
              />
            )}

            {/* VIEW: Smart Proactive Alerts Center (مركز التنبيه الذكي بالاستباق - 60، 30، 7 أيام) */}
            {activeTab === 'proactive_alerts' && (
              <div className="space-y-6">
                <SmartProactiveAlertsCenter
                  establishment={activeEstablishment}
                  licenses={licenses}
                  documents={documents}
                  branches={branches}
                  onInstantRenewLicense={handleInstantRenewLicense}
                  onCreateOrder={(newOrder) => {
                    setOrders(prev => [newOrder, ...prev]);
                    // Add an action item for today
                    const actionItem = {
                      id: `action-renew-${Date.now()}`,
                      establishmentId: activeEstablishment.id,
                      title: `متابعة تنفيذ طلب التجديد: ${newOrder.items[0]?.serviceName || 'تجديد ترخيص'}`,
                      subtitle: `رقم الطلب: ${newOrder.orderNumber} - قيد المتابعة والتنفيذ الحكومي`,
                      priority: 'high' as const,
                      type: 'renew_license' as const,
                      relatedId: newOrder.id,
                      dueDate: 'خلال 24 ساعة',
                    };
                    setActionItems(prev => [actionItem, ...prev]);
                  }}
                  onOpenRenewalProposal={(doc) => {
                    setActiveTab('company_documents');
                    showToast(`تم فتح مسودة التجديد التلقائي لـ: ${doc.title}`);
                  }}
                  onConsultSpecialist={(topic) => {
                    setIsAIOpen(true);
                    showToast(`جاري استشارة سبّاق الذكي بخصوص: ${topic}`);
                  }}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  showToast={showToast}
                />
              </div>
            )}

            {/* VIEW: Violation Solutions Mapping & Diagnostic Questions */}
            {(activeTab === 'admin_violation_solutions_mapping' || activeTab === 'violation_solutions_mapping') && (
              <ViolationSolutionsMapping
                onNavigateToTab={(tab) => setActiveTab(tab)}
                showToast={showToast}
              />
            )}
          </>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        activeEstablishment={activeEstablishment}
      />

      {/* Goal Selector Modal ("ماذا تريد أن تنجز اليوم؟") */}
      <GoalSelectorModal
        isOpen={isGoalSelectorOpen}
        onClose={() => setIsGoalSelectorOpen(false)}
        onSelectGoal={handleSelectGoal}
        establishmentName={activeEstablishment.name}
      />

      {/* AI Assistant Modal ("اسأل سبّاق") */}
      <AskSabbaqAI
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        activeEstablishment={activeEstablishment}
        licenses={licenses}
        violations={violations}
      />

      {/* Smart Objection Letter Generator Modal */}
      <ObjectionModal
        isOpen={!!objectionViolation}
        onClose={() => setObjectionViolation(null)}
        violation={objectionViolation}
        establishment={activeEstablishment}
      />

      {/* User Login & Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Technical Support Modal ("الدعم الفني ومستشار الامتثال") */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        establishment={activeEstablishment}
        showToast={showToast}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Platform Settings & Preferences Modal ("إعدادات المنصة") */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        establishment={activeEstablishment}
        showToast={showToast}
      />

      {/* Global Command Palette Search & Actions Modal (Spotlight ⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        establishment={activeEstablishment}
        establishments={establishments}
        onSelectEstablishment={(est) => {
          setActiveEstablishmentId(est.id);
          showToast(`تم التبديل إلى منشأة: ${est.name}`);
        }}
        licenses={licenses}
        documents={documents}
        violations={violations}
        branches={branches}
        onNavigateToTab={(tab, entityId, entityType) => {
          setActiveTab(tab);
          if (entityType === 'violation' && entityId) {
            setSelectedViolationForAnalyzer(entityId);
          }
        }}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenUploadDoc={() => setActiveTab('company_documents')}
        onOpenFeeCalculator={() => setActiveTab('calculator')}
        onOpenGoalSelector={() => setIsGoalSelectorOpen(true)}
        showToast={showToast}
      />

      {/* Interactive Customer Guided Tour & Quick Start Modal */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        establishment={activeEstablishment}
        licenses={licenses}
        documents={documents}
        violations={violations}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Dashboard Cards Customizer Modal (تخصيص ترتيب البطاقات بالسحب والإفلات) */}
      <DashboardCardsCustomizerModal
        isOpen={isCardsCustomizerOpen}
        onClose={() => setIsCardsCustomizerOpen(false)}
        cards={dashboardCards}
        onSave={handleSaveDashboardCards}
        onResetDefaults={handleResetDashboardCards}
      />

      {/* Compliance & Risk Official PDF Report Modal */}
      <ComplianceReportPdfModal
        isOpen={isCompliancePdfOpen}
        onClose={() => setIsCompliancePdfOpen(false)}
        establishment={activeEstablishment}
        licenses={licenses.filter(l => l.establishmentId === activeEstablishment.id)}
        documents={documents.filter(d => d.establishmentId === activeEstablishment.id)}
        branches={branches.filter(b => b.establishmentId === activeEstablishment.id)}
        actionItems={actionItems.filter(a => a.establishmentId === activeEstablishment.id)}
      />

      {/* Multi-Role Profile Selection Modal (RBAC Switcher) */}
      {currentUser && (
        <RoleSelectionModal
          isOpen={isRoleSelectionOpen}
          onClose={() => setIsRoleSelectionOpen(false)}
          currentUser={currentUser}
          currentActiveRole={currentRole}
          onSelectRole={(role) => {
            setCurrentRole(role);
            if (role === 'admin') {
              setActiveTab('admin_kpis');
              showToast('تم التبديل إلى لوحة إدارة سبّاق المركزية');
            } else if (role === 'supplier') {
              setActiveTab('supplier_requests');
              showToast('تم التبديل إلى بوابة المورد ومزود حلول الامتثال');
            } else if (role === 'partner_agent') {
              setActiveTab('partner_dashboard');
              showToast('تم التبديل إلى بوابة المعقب والشريك الميداني');
            } else {
              setActiveTab('dashboard');
              showToast('تم التبديل إلى بوابة المنشأة');
            }
          }}
        />
      )}

      {/* Floating Quick Action Menu for 1-Click Operations (Renew All, Download All Docs, AI Scan, etc.) */}
      {currentRole === 'client' && viewMode === 'app' && (
        <DashboardQuickActionsFloatingMenu
          establishment={activeEstablishment}
          licenses={licenses}
          documents={documents}
          violations={violations}
          onBatchRenewLicenses={handleBatchRenewLicenses}
          onOpenCart={() => setIsCartOpen(true)}
          onExportCompliancePdf={() => setIsCompliancePdfOpen(true)}
          onNavigateToTab={(tab, entityId, entityType) => {
            setActiveTab(tab);
            if (entityType === 'violation' && entityId) {
              setSelectedViolationForAnalyzer(entityId);
            }
          }}
          onOpenAI={() => setIsAIOpen(true)}
          showToast={showToast}
        />
      )}

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-bold font-['Cairo'] text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>منصة سبّاق الامتثال (Sabbaq Compliance)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              المنصة الوطنية الموحدة لإدارة التراخيص والمستندات الحكومية، وحساب الرسوم، والرصد الوقائي للمخالفات.
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
}
