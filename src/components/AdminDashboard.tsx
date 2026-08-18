import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  Building2, 
  Send, 
  Edit3, 
  Plus, 
  Sliders, 
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Scale,
  FileCheck2,
  Briefcase,
  History,
  Settings,
  ShieldCheck,
  Check,
  X,
  Filter,
  UserPlus,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Award,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { 
  MasterOrder, 
  Establishment, 
  License, 
  ComplianceViolation,
  ServiceCatalogItem,
  DocumentItem,
  UserAccount
} from '../types';
import { formatSAR, getOrderStatusBadge } from '../utils/complianceEngine';
import { ViolationSolutionsMapping } from './ViolationSolutionsMapping';
import { AdminSuppliers } from './AdminSuppliers';
import { AdminSupplierPerformance } from './AdminSupplierPerformance';
import { AdminSiteManagementPortal } from './AdminSiteManagementPortal';

interface AdminDashboardProps {
  activeTab?: string;
  onNavigateAdminTab?: (tab: string) => void;
  orders: MasterOrder[];
  establishments: Establishment[];
  licenses: License[];
  violations: ComplianceViolation[];
  services: ServiceCatalogItem[];
  documents?: DocumentItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: MasterOrder['status'], notes?: string) => void;
  onAssignSpecialist: (orderId: string, specialistName: string) => void;
  onUpdateGovTransactionNumber: (orderId: string, govTx: string) => void;
  onUpdateService?: (service: ServiceCatalogItem) => void;
  onAddService?: (service: ServiceCatalogItem) => void;
  onToggleServiceStatus?: (serviceId: string) => void;
  showToast?: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab = 'admin_kpis',
  onNavigateAdminTab,
  orders,
  establishments,
  licenses,
  violations,
  services,
  documents = [],
  onUpdateOrderStatus,
  onAssignSpecialist,
  onUpdateGovTransactionNumber,
  onUpdateService,
  onAddService,
  onToggleServiceStatus,
  showToast = (_msg?: string) => {}
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [newGovTxNumber, setNewGovTxNumber] = useState('');
  const [assigneeName, setAssigneeName] = useState('سعد بن فهد');
  const [assigneeType, setAssigneeType] = useState<'internal' | 'partner_agent'>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Service Edit / Add Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    code: string;
    slug: string;
    authority: string;
    category: ServiceCatalogItem['category'];
    type: ServiceCatalogItem['type'];
    description: string;
    requiredDocsStr: string;
    govFeeEstimated: number;
    sabbaqFee: number;
    estimatedDays: string;
    isActive: boolean;
  }>({
    name: '',
    code: '',
    slug: '',
    authority: 'وزارة التجارة',
    category: 'commerce',
    type: 'issuance',
    description: '',
    requiredDocsStr: '',
    govFeeEstimated: 0,
    sabbaqFee: 400,
    estimatedDays: '1-2 أيام عمل',
    isActive: true,
  });

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      code: `SRV-${Math.floor(10 + Math.random() * 90)}`,
      slug: '',
      authority: 'وزارة البلديات والإسكان (بلدي)',
      category: 'balady',
      type: 'issuance',
      description: '',
      requiredDocsStr: 'السجل التجاري, عقد الإيجار',
      govFeeEstimated: 1200,
      sabbaqFee: 450,
      estimatedDays: '1-2 أيام عمل',
      isActive: true,
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceCatalogItem) => {
    setEditingService(srv);
    setServiceForm({
      name: srv.name,
      code: srv.code,
      slug: srv.slug || '',
      authority: srv.authority,
      category: srv.category,
      type: srv.type,
      description: srv.description,
      requiredDocsStr: srv.requiredDocuments.join(', '),
      govFeeEstimated: srv.govFeeEstimated,
      sabbaqFee: srv.sabbaqFee,
      estimatedDays: srv.estimatedDays,
      isActive: srv.isActive !== false,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const docs = serviceForm.requiredDocsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const vat = Math.round(serviceForm.sabbaqFee * 0.15 * 100) / 100;
    const total = serviceForm.govFeeEstimated + serviceForm.sabbaqFee + vat;

    const slug =
      serviceForm.slug.trim() ||
      serviceForm.name
        .toLowerCase()
        .replace(/[\s\(\)\/]+/g, '-')
        .substring(0, 40);

    if (editingService) {
      const updated: ServiceCatalogItem = {
        ...editingService,
        name: serviceForm.name,
        code: serviceForm.code,
        slug,
        authority: serviceForm.authority,
        category: serviceForm.category,
        type: serviceForm.type,
        description: serviceForm.description,
        requiredDocuments: docs,
        govFeeEstimated: Number(serviceForm.govFeeEstimated),
        sabbaqFee: Number(serviceForm.sabbaqFee),
        vatAmount: vat,
        totalEstimated: total,
        recurringAnnualGov: editingService.recurringAnnualGov || 0,
        estimatedDays: serviceForm.estimatedDays,
        isActive: serviceForm.isActive,
      };
      if (onUpdateService) {
        onUpdateService(updated);
      }
      showToast(`تم حفظ تعديلات خدمة «${updated.name}» وتحديث التسعير العام.`);
    } else {
      const newSrv: ServiceCatalogItem = {
        id: `srv-${Date.now()}`,
        name: serviceForm.name,
        code: serviceForm.code,
        slug,
        authority: serviceForm.authority,
        category: serviceForm.category,
        type: serviceForm.type,
        description: serviceForm.description,
        requiredDocuments: docs,
        govFeeEstimated: Number(serviceForm.govFeeEstimated),
        sabbaqFee: Number(serviceForm.sabbaqFee),
        vatAmount: vat,
        totalEstimated: total,
        recurringAnnualGov: 0,
        estimatedDays: serviceForm.estimatedDays,
        isActive: serviceForm.isActive,
        allowsDirectPayment: true,
      };
      if (onAddService) {
        onAddService(newSrv);
      }
      showToast(`تمت إضافة الخدمة الحكومية الجديدة «${newSrv.name}» إلى الكتالوج العام.`);
    }
    setIsServiceModalOpen(false);
  };

  // Stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.sabbaqFeeTotal, 0);
  const totalGovFees = orders.reduce((sum, o) => sum + o.govFeeTotal, 0);
  const pendingOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const criticalLicensesCount = licenses.filter(l => l.daysRemaining <= 15).length;
  const activeViolationsCount = violations.filter(v => v.status !== 'rectified').length;

  const currentSelectedOrder = orders.find(o => o.id === selectedOrderId);

  // Field Partner Agents Mock
  const partnerAgents = [
    { id: 'pa-1', name: 'أحمد بن خالد التميمي', agency: 'مكتب التمام للتعقيب والخدمات العامة', city: 'الرياض', activeTasks: 3, completed: 84, rating: 4.9, phone: '0551122334', commissionBalance: 4250 },
    { id: 'pa-2', name: 'فيصل بن منصور الحربي', agency: 'مؤسسة إنجاز المعاملات الحكومية', city: 'جدة', activeTasks: 2, completed: 62, rating: 4.8, phone: '0543322110', commissionBalance: 2800 },
    { id: 'pa-3', name: 'عبدالله بن عمر الشمري', agency: 'مكتب الخبير للاستشارات البلدية', city: 'الدمام', activeTasks: 1, completed: 49, rating: 4.7, phone: '0567788990', commissionBalance: 1950 },
    { id: 'pa-4', name: 'ماجد بن تركي الشهري', agency: 'مكتب الرائد للتراخيص الصناعية', city: 'الرياض', activeTasks: 4, completed: 110, rating: 5.0, phone: '0501199887', commissionBalance: 6100 },
  ];

  // Admin Internal Staff
  const internalStaff = [
    { id: 'st-1', name: 'م. عبدالعزيز السالم', role: 'مدير عمليات الرقابة (Super Admin)', email: 'a.salem@sabbaq.sa', dept: 'operations', activeCases: 8 },
    { id: 'st-2', name: 'سعد بن فهد', role: 'أخصائي أول تراخيص بلدي وسلامة', email: 's.fahad@sabbaq.sa', dept: 'municipal', activeCases: 5 },
    { id: 'st-3', name: 'سارة بنت ناصر القحطاني', role: 'مستشارة الامتثال الزكوي والضريبي', email: 's.qahtani@sabbaq.sa', dept: 'zatca', activeCases: 4 },
    { id: 'st-4', name: 'م. راكان الدوسري', role: 'مدقق شهادات الدفاع المدني', email: 'r.dosari@sabbaq.sa', dept: 'safety', activeCases: 3 },
  ];

  // Audit Logs Mock
  const auditLogs = [
    { id: 'log-1', actor: 'م. عبدالعزيز السالم', action: 'اعتماد تحديث ترخيص بلدي', target: 'شركة المذاق العربي', timestamp: 'منذ 12 دقيقة', ip: '192.168.1.45' },
    { id: 'log-2', actor: 'سعد بن فهد', action: 'إسناد معاملة سلامة لمعقب شريك (أحمد التميمي)', target: 'معاملة #ORD-1447-9201', timestamp: 'منذ 35 دقيقة', ip: '192.168.1.18' },
    { id: 'log-3', actor: 'نظام التدقيق الآلي', action: 'رصد مخالفة كود بناء محتملة', target: 'مؤسسة آفاق المستقبل', timestamp: 'منذ ساعتين', ip: 'System Cron' },
    { id: 'log-4', actor: 'سارة القحطاني', action: 'تعديل جدول رسوم خدمات الدفاع المدني', target: 'محرك الأسعار المركزي', timestamp: 'منذ 4 ساعات', ip: '192.168.1.22' },
  ];

  // Resolve current active tab
  const currentTab = activeTab.startsWith('admin_') ? activeTab : 'admin_kpis';

  return (
    <div className="space-y-6 font-['Cairo']">
      
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>نطاق الإدارة المركزية والرقابة (HQ Admin Control)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              مركز العمليات والحوكمة الشاملة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              إدارة المنشآت، خط معالجة الطلبات، إسناد المعاملات للمعقبين، التدقيق المالي ومصفوفة الصلاحيات (RBAC).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-900/90 border border-slate-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الربط الحكومي: <strong>متصل ونشط (بلدي، سلامة، زاتكا)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: 1. KPI Overview (admin_kpis) */}
      {(currentTab === 'admin_kpis' || currentTab === 'admin_control') && (
        <div className="space-y-6">
          
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">الطلبات الجارية للمعالجة</span>
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-['Cairo']">
                {pendingOrdersCount} معاملة
              </div>
              <div className="text-[11px] text-blue-700 font-bold mt-1 flex items-center justify-between">
                <span>تتطلب إجراء أو إسناد</span>
                <span className="bg-blue-50 px-1.5 py-0.5 rounded">HQ Active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">تراخيص تستدعي التدخل</span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 font-['Cairo']">
                {criticalLicensesCount} ترخيص
              </div>
              <div className="text-[11px] text-amber-800 font-bold mt-1 flex items-center justify-between">
                <span>استحقاق خلال 15 يوماً</span>
                <span className="bg-amber-50 px-1.5 py-0.5 rounded">عاجل</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">مخالفات قيد الاعتراض</span>
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 font-['Cairo']">
                {activeViolationsCount} مخالفات
              </div>
              <div className="text-[11px] text-rose-800 font-bold mt-1 flex items-center justify-between">
                <span>مخاطر غرامات مرصودة</span>
                <span className="bg-rose-50 px-1.5 py-0.5 rounded">رقابة</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">عوائد خدمات سبّاق المحققة</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-['Cairo']">
                {formatSAR(totalRevenue)}
              </div>
              <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center justify-between">
                <span>رسوم حكومية: {formatSAR(totalGovFees)}</span>
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded">صافي</span>
              </div>
            </div>

          </div>

          {/* Quick Operations Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Orders Overview */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">أحدث المعاملات وطلبات الإسناد</h3>
                </div>
                <button
                  onClick={() => onNavigateAdminTab?.('admin_orders')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض خط المعالجة الكامل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const est = establishments.find(e => e.id === order.establishmentId);
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 mt-0.5">{est?.name || 'منشأة عميل'}</h4>
                        <span className="text-[11px] text-slate-500">
                          {order.items.map(i => i.serviceName).join(' ، ')}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <strong className="text-emerald-700 block font-bold">{formatSAR(order.totalAmount)}</strong>
                        <span className="text-[10px] text-slate-400">المسؤول: {order.assignedSpecialist || 'غير مسند'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field Partner Agents Status */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">المعقبين الشركاء الميدانيين</h3>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  {partnerAgents.length} متاح
                </span>
              </div>

              <div className="space-y-3">
                {partnerAgents.map((pa) => (
                  <div key={pa.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{pa.name}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        ★ {pa.rating}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{pa.agency} ({pa.city})</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <span>المهام النشطة: <strong>{pa.activeTasks}</strong></span>
                      <span>الإنجاز: <strong>{pa.completed}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: 2. Clients & Establishments Management (admin_clients) */}
      {currentTab === 'admin_clients' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">سجل العملاء والمنشآت المسجلة</h3>
              <p className="text-xs text-slate-500">إجمالي {establishments.length} منشأة مشتركة ببيانات السجلات، الفروع والأنشطة</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث باسم المنشأة أو السجل التجاري..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {establishments
              .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.crNumber.includes(searchQuery))
              .map((est) => (
                <div key={est.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-['Cairo']">{est.name}</h4>
                      <span className="text-[11px] text-slate-500 block">س.ت: {est.crNumber} • {est.city}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      نشط ومطابق
                    </span>
                  </div>

                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 text-slate-600">
                    <div className="flex justify-between">
                      <span>الرقم الموحد:</span>
                      <strong className="font-mono text-slate-800">{est.unifiedNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>الفروع المسجلة:</span>
                      <strong className="text-slate-800">{est.branchesCount} فروع</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي العمالة:</span>
                      <strong className="text-slate-800">{est.totalEmployees} موظف ({est.saudizationPercentage.toFixed(1)}% توطين)</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      التراخيص: {licenses.filter(l => l.establishmentId === est.id).length} رخصة
                    </span>
                    <button
                      onClick={() => showToast(`تم فتح الملف الرقابي لمنشأة: ${est.name}`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      الملف الرقابي
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW: 3. Orders & Assignments Pipeline (admin_orders) */}
      {currentTab === 'admin_orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Orders Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">خط معالجة وإسناد الطلبات</h3>
                <span className="text-xs text-slate-500">إجمالي {orders.length} طلبات - حدد طلباً لتحديث حالته وتكليف المعقب أو المستشار</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {orders.map((order) => {
                const est = establishments.find(e => e.id === order.establishmentId);
                const badge = getOrderStatusBadge(order.status);
                const isSelected = selectedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 transition-colors cursor-pointer text-xs space-y-2 ${
                      isSelected ? 'bg-blue-50/70 border-r-4 border-r-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm font-['Cairo'] mt-0.5">
                          {est?.name || 'منشأة عميل'}
                        </h4>
                      </div>

                      <div className="text-right">
                        <strong className="text-emerald-700 block font-bold">{formatSAR(order.totalAmount)}</strong>
                        <span className="text-[10px] text-slate-400">سبّاق: {formatSAR(order.sabbaqFeeTotal)}</span>
                      </div>
                    </div>

                    <div className="text-slate-600 text-[11px] line-clamp-1">
                      الخدمات: {order.items.map(i => i.serviceName).join(' ، ')}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>المكلف: <strong>{order.assignedSpecialist || 'غير محدد'}</strong></span>
                      <span>{order.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Order Action & Assignment Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            {currentSelectedOrder ? (
              <>
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-slate-900">{currentSelectedOrder.orderNumber}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getOrderStatusBadge(currentSelectedOrder.status).bg}`}>
                      {getOrderStatusBadge(currentSelectedOrder.status).label}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">
                    {establishments.find(e => e.id === currentSelectedOrder.establishmentId)?.name}
                  </h4>
                </div>

                {/* Status Update Actions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">تحديث مرحلة التنفيذ:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateOrderStatus(currentSelectedOrder.id, 'in_progress')}
                      className="p-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    >
                      بدء التنفيذ الفعلي
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(currentSelectedOrder.id, 'completed')}
                      className="p-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      إكمال المعاملة بنجاح
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(currentSelectedOrder.id, 'awaiting_payment')}
                      className="p-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                    >
                      طلب سداد العميل
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(currentSelectedOrder.id, 'cancelled')}
                      className="p-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    >
                      إلغاء أو تعليق
                    </button>
                  </div>
                </div>

                {/* Assignment Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">إسناد المعاملة (داخلي / معقب شريك):</label>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssigneeType('internal')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        assigneeType === 'internal' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      فريق سبّاق الداخلي
                    </button>
                    <button
                      onClick={() => setAssigneeType('partner_agent')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        assigneeType === 'partner_agent' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      معقب شريك ميداني
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      {assigneeType === 'internal' ? (
                        internalStaff.map(s => (
                          <option key={s.id} value={`${s.name} (${s.role})`}>{s.name} - {s.role}</option>
                        ))
                      ) : (
                        partnerAgents.map(pa => (
                          <option key={pa.id} value={`${pa.name} (${pa.agency})`}>{pa.name} - {pa.agency} ({pa.city})</option>
                        ))
                      )}
                    </select>
                    <button
                      onClick={() => {
                        onAssignSpecialist(currentSelectedOrder.id, assigneeName);
                        showToast(`تم إسناد المعاملة إلى: ${assigneeName}`);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      إسناد
                    </button>
                  </div>
                </div>

                {/* Gov Transaction Numbers */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">إضافة رقم قيد/معاملة حكومية:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="مثال: BALADY-1447-98210"
                      value={newGovTxNumber}
                      onChange={(e) => setNewGovTxNumber(e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      onClick={() => {
                        if (newGovTxNumber) {
                          onUpdateGovTransactionNumber(currentSelectedOrder.id, newGovTxNumber);
                          setNewGovTxNumber('');
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                يرجى تحديد طلب من القائمة لعرض تفاصيله وإسناده.
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW: 4. Regulations & Services Catalog (admin_regulations) */}
      {currentTab === 'admin_regulations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">
                  دليل الخدمات والتراخيص الحكومية (كتالوج الخدمات العام والداخلي)
                </h3>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {services.length} خدمة متوفرة
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة الرسوم الحكومية التقديرية، أتعاب سبّاق للتنفيذ، المتطلبات والمستندات، وتفعيل أو إيقاف الخدمة في الموقع العام.
              </p>
            </div>
            <button
              onClick={handleOpenAddService}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمة جديدة للكتالوج</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {services.map((srv) => {
              const isServiceActive = srv.isActive !== false;
              return (
                <div
                  key={srv.id}
                  className={`py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    !isServiceActive ? 'opacity-60 bg-slate-50/70 p-3 rounded-2xl' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-['Cairo']">{srv.name}</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {srv.authority}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {srv.code}
                      </span>
                      {srv.slug && (
                        <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          /services/{srv.slug}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isServiceActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isServiceActive ? 'نشطة ومتاحة للجمهور' : 'موقوفة مؤقتاً'}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">{srv.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">المستندات ({srv.requiredDocuments.length}):</span>
                      <span className="text-slate-600">{srv.requiredDocuments.join(' • ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">رسوم حكومية:</span>
                      <span className="text-slate-700 font-bold text-xs">{formatSAR(srv.govFeeEstimated)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">أتعاب سبّاق:</span>
                      <strong className="text-emerald-700 font-bold text-sm">{formatSAR(srv.sabbaqFee)}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">المدة:</span>
                      <span className="text-slate-700 font-semibold text-xs">{srv.estimatedDays}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleServiceStatus) {
                            onToggleServiceStatus(srv.id);
                          } else if (onUpdateService) {
                            onUpdateService({ ...srv, isActive: !isServiceActive });
                          }
                          showToast(
                            isServiceActive
                              ? `تم إيقاف خدمة «${srv.name}» من العرض العام مؤقتاً.`
                              : `تم تفعيل خدمة «${srv.name}» وإتاحتها للزوار والعملاء.`
                          );
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          isServiceActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        }`}
                        title={isServiceActive ? 'إيقاف الخدمة' : 'تفعيل الخدمة'}
                      >
                        {isServiceActive ? 'إيقاف' : 'تفعيل'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditService(srv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="تعديل تفاصيل الخدمة والرسوم"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: 4.5. Violation Solutions Mapping & Diagnostic Questions (admin_violation_solutions_mapping) */}
      {currentTab === 'admin_violation_solutions_mapping' && (
        <ViolationSolutionsMapping
          onNavigateToTab={onNavigateAdminTab}
          showToast={showToast}
        />
      )}

      {/* VIEW: 5. Documents Review & Approvals (admin_documents) */}
      {currentTab === 'admin_documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">مركز تدقيق المستندات والموافقات</h3>
              <p className="text-xs text-slate-500">مراجعة وثائق المنشآت، التفويضات، عقود الإيجار وشهادات الامتثال</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl">
              2 مستند بانتظار التدقيق
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">عقد إيجار إلكتروني موثق (إيجار)</h4>
                    <span className="text-[11px] text-slate-500">شركة المذاق العربي لتقديم الوجبات</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  قيد التدقيق
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">مرفوع بغرض تجديد رخصة بلدي للفرع الرئيسي (حي الياسمين).</p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => showToast('تم رفض المستند وإرسال ملاحظة للعميل')}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold"
                >
                  طلب إعادة رفع
                </button>
                <button
                  onClick={() => showToast('تم اعتماد وتدقيق المستند بنجاح')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  اعتماد المستند
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">تقرير سلامة فني معتمد (سلامة)</h4>
                    <span className="text-[11px] text-slate-500">مؤسسة آفاق المستقبل التجارية</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  معتمد ومطابق
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">تم فحص طفايات الحريق وكواشف الدخان ومخارج الطوارئ ومطابقتها للكود.</p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <span className="text-emerald-700 font-bold text-[11px]">تم الاعتماد بواسطة: م. راكان الدوسري</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 6. Finance & Commissions (admin_finance) */}
      {currentTab === 'admin_finance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">
              الإدارة المالية، الفواتير والعمولات
            </h3>
            <p className="text-xs text-slate-500">تتبع تدفقات الرسوم الحكومية، إيرادات سبّاق، وعمولات المعقبين الشركاء المستحقة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">إجمالي الفواتير الصادرة</span>
              <strong className="text-xl font-black text-slate-900 font-['Cairo'] block mt-1">
                {formatSAR(totalRevenue + totalGovFees)}
              </strong>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 block">عوائد منصة سبّاق المحصلة</span>
              <strong className="text-xl font-black text-emerald-800 font-['Cairo'] block mt-1">
                {formatSAR(totalRevenue)}
              </strong>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-700 block">عمولات المعقبين المستحقة</span>
              <strong className="text-xl font-black text-amber-800 font-['Cairo'] block mt-1">
                {formatSAR(15100)}
              </strong>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold font-mono text-slate-900">{o.orderNumber}</span>
                  <span className="text-slate-500 text-[11px] block">{establishments.find(e => e.id === o.establishmentId)?.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">حكومي:</span>
                    <strong className="text-slate-700">{formatSAR(o.govFeeTotal)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">سبّاق:</span>
                    <strong className="text-emerald-700">{formatSAR(o.sabbaqFeeTotal)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">الحالة:</span>
                    <span className="font-bold text-slate-900">{getOrderStatusBadge(o.status).label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: 7. Partners & Field Agents (admin_partners) */}
      {currentTab === 'admin_partners' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">شبكة المعقبين والشركاء الميدانيين</h3>
              <p className="text-xs text-slate-500">إدارة مكاتب التعقيب المعتمدة وتوزيع المهام بحسب المدن ونطاقات التغطية</p>
            </div>
            <button
              onClick={() => showToast('فتح نموذج اعتماد شريك معقب جديد')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>اعتماد معقب شريك جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerAgents.map((pa) => (
              <div key={pa.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm font-['Cairo']">{pa.name}</h4>
                    <span className="text-[11px] text-slate-500 block">{pa.agency} • {pa.city}</span>
                  </div>
                  <span className="text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                    ★ {pa.rating} (موثق)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">مهام جارية</span>
                    <strong className="text-slate-900 font-bold">{pa.activeTasks}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">معاملات منجزة</span>
                    <strong className="text-slate-900 font-bold">{pa.completed}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">رصيد العمولة</span>
                    <strong className="text-emerald-700 font-bold">{formatSAR(pa.commissionBalance)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>الجوال: <strong className="font-mono text-slate-700">{pa.phone}</strong></span>
                  <button
                    onClick={() => showToast(`إسناد معاملة جديدة إلى: ${pa.name}`)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    إسناد معاملة جديدة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: 8. Users & RBAC Matrix (admin_users) */}
      {currentTab === 'admin_users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">
                إدارة المستخدمين ومصفوفة الأدوار والصلاحيات (RBAC)
              </h3>
              <p className="text-xs text-slate-500">تحديد أدوار الموظفين، مدراء العمليات والمشرفين وفق معايير الحوكمة</p>
            </div>
            <button
              onClick={() => showToast('إضافة مستخدم إداري جديد وتعيين الصلاحيات')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة موظف / دور جديد</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {internalStaff.map((st) => (
              <div key={st.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {st.role}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{st.email} • القسم: {st.dept}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">حالات نشطة: <strong>{st.activeCases}</strong></span>
                  <button
                    onClick={() => showToast(`تعديل صلاحيات: ${st.name}`)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: 9. Audit Logs & System Activity (admin_audit) */}
      {currentTab === 'admin_audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">سجل العمليات والرقابة (Audit Trail)</h3>
            <p className="text-xs text-slate-500">تتبع كافة التعديلات، إسناد المعاملات وتغيير الحالات لضمان الشفافية والأمان</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.actor}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700">{log.action}</span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold">{log.target}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <span>{log.timestamp}</span>
                  <span className="block font-mono text-[10px] text-slate-300">IP: {log.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: 10. Platform Settings & Integration (admin_settings) */}
      {currentTab === 'admin_settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-['Cairo']">إعدادات المنصة وبوابات الربط الحكومي</h3>
            <p className="text-xs text-slate-500">حالة الربط المباشر مع النفاذ الوطني، منصة بلدي، سلامة، وهيئة الزكاة والضريبة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">النفاذ الوطني الموحد (Nafath SSO)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">متصل (Live)</span>
              </div>
              <p className="text-slate-600 text-[11px]">مفعل للمصادقة الثنائية والتحقق الفوري من الهويات والسجلات التجارية.</p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">بوابة بلدي (وزارة البلديات والإسكان)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">متصل (Live)</span>
              </div>
              <p className="text-slate-600 text-[11px]">استعلام فوري عن التراخيص البلدية والشهادات الصحية للمحلات.</p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">بوابة سلامة (الدفاع المدني)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">متصل (Live)</span>
              </div>
              <p className="text-slate-600 text-[11px]">تحديث تراخيص السلامة ومطابقة تقارير المكاتب الهندسية الفنية.</p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">هيئة الزكاة والضريبة والجمارك (ZATCA)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">متصل (Live)</span>
              </div>
              <p className="text-slate-600 text-[11px]">مطابقة الفوترة الإلكترونية ومتابعة الشهادات الزكوية السنوية.</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 11. Site Management, CMS, Incoming Requests & Invoicing (admin_site_cms) */}
      {currentTab === 'admin_site_cms' && (
        <AdminSiteManagementPortal
          onNavigateToTab={onNavigateAdminTab}
          showToast={showToast}
          services={services}
          orders={orders}
        />
      )}

      {/* VIEW: 12. Supplier Management (admin_suppliers) */}
      {currentTab === 'admin_suppliers' && (
        <AdminSuppliers
          onNavigateToTab={onNavigateAdminTab}
          showToast={showToast}
        />
      )}

      {/* VIEW: 13. Supplier Performance & SLA Analytics (admin_performance) */}
      {(currentTab === 'admin_performance' || currentTab === 'admin_performance_analytics') && (
        <AdminSupplierPerformance
          onNavigateToTab={onNavigateAdminTab}
          showToast={showToast}
        />
      )}

      {/* Service Add / Edit Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Cairo']">
                    {editingService ? `تعديل خدمة: ${editingService.name}` : 'إضافة خدمة حكومية جديدة للكتالوج'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    تحديث بيانات الخدمة والرسوم وظهورها في الكتالوج العام وصفحة الهبوط
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveService} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">اسم الخدمة الحكومية *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="مثال: تجديد رخصة الأنشطة التجارية الفورية"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الرابط المخصص (Slug) *</label>
                  <input
                    type="text"
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                    placeholder="مثال: balady-commercial-renewal"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-left"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    يستخدم للمسار المستقل: /services/{serviceForm.slug || 'service-slug'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الجهة الحكومية *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.authority}
                    onChange={(e) => setServiceForm({ ...serviceForm, authority: e.target.value })}
                    placeholder="مثال: وزارة البلديات والإسكان (بلدي)"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">التصنيف الحكومي</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value as ServiceCatalogItem['category'],
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="commerce">وزارة التجارة والغرف</option>
                    <option value="balady">وزارة البلديات (بلدي)</option>
                    <option value="civil_defense">الدفاع المدني (سلامة)</option>
                    <option value="labor_qiwa">الموارد البشرية (قوى / مدد)</option>
                    <option value="tax_zatca">هيئة الزكاة والضريبة</option>
                    <option value="platforms">الجوازات ومنصة مقيم</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">نوع الإجراء</label>
                  <select
                    value={serviceForm.type}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        type: e.target.value as ServiceCatalogItem['type'],
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="issuance">إصدار جديد</option>
                    <option value="renewal">تجديد ترخيص</option>
                    <option value="amendment">تعديل وتحديث</option>
                    <option value="objection">اعتراض وتصحيح</option>
                    <option value="consultation">استشارة نظامية</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">وصف الخدمة وشرح متطلباتها *</label>
                <textarea
                  rows={2}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="اكتب شرحاً مختصراً ودقيقاً لما تشمله هذه الخدمة..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">المستندات والوثائق المطلوبة (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={serviceForm.requiredDocsStr}
                  onChange={(e) => setServiceForm({ ...serviceForm, requiredDocsStr: e.target.value })}
                  placeholder="مثال: السجل التجاري ساري, عقد الإيجار الإلكتروني, تقرير سلامة معتمد"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pricing & Duration Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">الرسوم الحكومية التقديرية (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    value={serviceForm.govFeeEstimated}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, govFeeEstimated: Number(e.target.value) })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">أتعاب تنفيذ سبّاق (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    value={serviceForm.sabbaqFee}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, sabbaqFee: Number(e.target.value) })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs font-bold text-emerald-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">مدة الإنجاز المتوقعة</label>
                  <input
                    type="text"
                    value={serviceForm.estimatedDays}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, estimatedDays: e.target.value })
                    }
                    placeholder="مثال: 1-2 أيام عمل"
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 block">حالة الخدمة وتوفرها للجمهور</span>
                  <span className="text-[11px] text-slate-500">
                    عند التعطيل، ستختفي الخدمة من صفحة الهبوط والكتالوج العام
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setServiceForm({ ...serviceForm, isActive: !serviceForm.isActive })}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    serviceForm.isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {serviceForm.isActive ? 'مفعلة ونشطة' : 'معطلة'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingService ? 'حفظ التعديلات' : 'إضافة الخدمة الآن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
