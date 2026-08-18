import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  CreditCard, 
  Upload, 
  MessageSquare, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  Filter,
  Layers,
  PlusCircle,
  Search,
  ShoppingCart,
  Check,
  Info,
  ChevronDown,
  Tag,
  Trash2,
  FileCheck2,
  RotateCw,
  X,
  Phone,
  User,
  MapPin,
  ClipboardList,
  Landmark,
  Receipt,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { MasterOrder, OrderItem, Establishment, ServiceCatalogItem } from '../types';
import { getOrderStatusBadge, formatSAR } from '../utils/complianceEngine';
import { SERVICE_CATALOG } from '../data/complianceData';

export interface OrdersManagerProps {
  orders: MasterOrder[];
  activeEstablishment: Establishment;
  onApproveQuote: (orderId: string) => void;
  onPayOrder: (orderId: string) => void;
  onSendSpecialistMessage: (orderId: string, message: string) => void;
  onUploadMissingDoc: (orderId: string, docName: string) => void;
  services?: ServiceCatalogItem[];
  cartItems?: OrderItem[];
  onAddToCart?: (service: ServiceCatalogItem) => void;
  onRemoveFromCart?: (serviceId: string) => void;
  onSubmitCartOrder?: (details: { notes?: string; contactPerson?: string; contactPhone?: string; autoApproved?: boolean }) => void;
  onSubmitDirectOrder?: (
    service: ServiceCatalogItem,
    details: {
      notes?: string;
      contactPerson?: string;
      contactPhone?: string;
      establishmentName?: string;
      branchName?: string;
    }
  ) => void;
  onOpenCart?: () => void;
  onOpenCalculator?: () => void;
  initialSubTab?: 'tracking' | 'new_order' | 'cart';
  showToast?: (msg: string) => void;
}

type StatusCategoryKey = 'review' | 'paid' | 'in_progress' | 'completed';

interface StatusCategoryConfig {
  key: StatusCategoryKey;
  label: string;
  statuses: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

const STATUS_CATEGORIES: StatusCategoryConfig[] = [
  {
    key: 'review',
    label: 'قيد المراجعة',
    statuses: ['new', 'awaiting_contact', 'awaiting_docs', 'awaiting_approval'],
    color: '#F59E0B', // Amber
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    description: 'تدقيق المستندات، إصدار عروض الأسعار، والمراجعة المبدئية'
  },
  {
    key: 'paid',
    label: 'تم الدفع',
    statuses: ['awaiting_payment'],
    color: '#3B82F6', // Blue
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    description: 'تم اعتماد التسعير بانتظار استكمال السداد والبدء الحكومي'
  },
  {
    key: 'in_progress',
    label: 'تحت التنفيذ',
    statuses: ['in_progress', 'submitted_to_gov', 'awaiting_gov_reply'],
    color: '#8B5CF6', // Purple
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    description: 'مرفوع على المنصات الحكومية وجاري متابعة الاعتماد النهائي'
  },
  {
    key: 'completed',
    label: 'مكتمل',
    statuses: ['completed'],
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    description: 'تم إصدار التراخيص والمستندات بنجاح وتسليمها للمنشأة'
  }
];

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  activeEstablishment,
  onApproveQuote,
  onPayOrder,
  onSendSpecialistMessage,
  onUploadMissingDoc,
  services = SERVICE_CATALOG,
  cartItems = [],
  onAddToCart,
  onRemoveFromCart,
  onSubmitCartOrder,
  onSubmitDirectOrder,
  onOpenCart,
  onOpenCalculator,
  initialSubTab = 'tracking',
  showToast
}) => {
  // Main Sub-Tab State: 'tracking' (متابعة الطلبات) | 'new_order' (طلب جديد) | 'cart' (سلة الطلبات)
  const [subTab, setSubTab] = useState<'tracking' | 'new_order' | 'cart'>(initialSubTab);

  // Tracking State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [chatInput, setChatInput] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusCategoryKey | 'all'>('all');
  const [trackingSearchQuery, setTrackingSearchQuery] = useState<string>('');

  // New Order / Catalog State
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceCatalogItem | null>(null);
  const [directOrderService, setDirectOrderService] = useState<ServiceCatalogItem | null>(null);

  // Direct Order Form inputs
  const [directApplicantName, setDirectApplicantName] = useState<string>('عبدالعزيز السبيعي');
  const [directApplicantPhone, setDirectApplicantPhone] = useState<string>('0501234567');
  const [directOrderNotes, setDirectOrderNotes] = useState<string>('');
  const [directBranchName, setDirectBranchName] = useState<string>(activeEstablishment.city || 'الفرع الرئيسي');
  const [cartAutoApproved, setCartAutoApproved] = useState<boolean>(true);

  // Filter orders for active establishment
  const estOrders = useMemo(() => {
    return orders.filter(o => o.establishmentId === activeEstablishment.id);
  }, [orders, activeEstablishment.id]);

  // Group and compute metrics for each of the 4 status categories
  const statusDistributionData = useMemo(() => {
    return STATUS_CATEGORIES.map(category => {
      const matchingOrders = estOrders.filter(o => category.statuses.includes(o.status));
      const totalAmount = matchingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        key: category.key,
        name: category.label,
        value: matchingOrders.length,
        totalAmount,
        color: category.color,
        bgColor: category.bgColor,
        borderColor: category.borderColor,
        textColor: category.textColor,
        description: category.description,
        percentage: estOrders.length > 0 ? Math.round((matchingOrders.length / estOrders.length) * 100) : 0,
      };
    });
  }, [estOrders]);

  // Filtered orders list based on status category selection & search
  const filteredOrders = useMemo(() => {
    let list = estOrders;
    if (statusFilter !== 'all') {
      const catConfig = STATUS_CATEGORIES.find(c => c.key === statusFilter);
      if (catConfig) {
        list = list.filter(o => catConfig.statuses.includes(o.status));
      }
    }
    if (trackingSearchQuery.trim()) {
      const q = trackingSearchQuery.toLowerCase().trim();
      list = list.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some(i => i.serviceName.toLowerCase().includes(q) || i.authority.toLowerCase().includes(q)) ||
        (o.govTransactionNumbers && o.govTransactionNumbers.some(n => n.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [estOrders, statusFilter, trackingSearchQuery]);

  const currentOrder = filteredOrders.find(o => o.id === selectedOrderId) || filteredOrders[0] || estOrders[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentOrder) return;
    onSendSpecialistMessage(currentOrder.id, chatInput.trim());
    setChatInput('');
    if (showToast) showToast('تم إرسال رسالتك إلى مستشار سبّاق بنجاح.');
  };

  const getStepNumber = (status: string) => {
    switch (status) {
      case 'new': return 1;
      case 'awaiting_docs': return 2;
      case 'awaiting_approval': return 3;
      case 'awaiting_payment': return 4;
      case 'in_progress': return 5;
      case 'submitted_to_gov': return 6;
      case 'awaiting_gov_reply': return 6;
      case 'completed': return 7;
      default: return 1;
    }
  };

  // Categories for Service Catalog
  const categories = [
    { id: 'all', label: 'جميع الخدمات' },
    { id: 'commerce', label: 'وزارة التجارة والغرف' },
    { id: 'balady', label: 'منصة بلدي والأمانات' },
    { id: 'civil_defense', label: 'الدفاع المدني (سلامة)' },
    { id: 'labor_qiwa', label: 'الموارد البشرية (قوى)' },
    { id: 'tax_zatca', label: 'الزكاة والضريبة (ZATCA)' },
    { id: 'platforms', label: 'منصة مقيم وأبشر' },
    { id: 'specialized', label: 'المخالفات والاعتراضات' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        service.authority.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        service.code.toLowerCase().includes(catalogSearchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesType = selectedType === 'all' || service.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [services, catalogSearchQuery, selectedCategory, selectedType]);

  // Handle Direct Order Submission
  const handleConfirmDirectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directOrderService) return;

    if (onSubmitDirectOrder) {
      onSubmitDirectOrder(directOrderService, {
        contactPerson: directApplicantName,
        contactPhone: directApplicantPhone,
        notes: directOrderNotes,
        branchName: directBranchName,
        establishmentName: activeEstablishment.name
      });
    } else if (onAddToCart) {
      onAddToCart(directOrderService);
    }

    const srvName = directOrderService.name;
    setDirectOrderService(null);
    setSubTab('tracking');
    if (showToast) {
      showToast(`تم تقديم طلب «${srvName}» بنجاح وهو الآن قيد التدقيق والمراجعة.`);
    }
  };

  // Custom PieChart Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-right min-w-[210px] space-y-1.5 font-['Cairo'] text-xs backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold flex items-center gap-1.5 text-slate-100">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              <span>{data.name}</span>
            </span>
            <span className="text-[11px] font-bold bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
              {data.percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">عدد المعاملات:</span>
            <strong className="text-slate-100 font-bold">{data.value} طلب</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">إجمالي المبالغ:</span>
            <strong className="text-emerald-400 font-bold">{formatSAR(data.totalAmount)}</strong>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-snug">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  // Cart Calculations
  const cartGovTotal = cartItems.reduce((sum, item) => sum + item.govFee, 0);
  const cartSabbaqTotal = cartItems.reduce((sum, item) => sum + item.sabbaqFee, 0);
  const cartVatTotal = cartItems.reduce((sum, item) => sum + item.vat, 0);
  const cartGrandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const cartGovPercentage = cartGrandTotal > 0 ? Math.round((cartGovTotal / cartGrandTotal) * 100) : 0;
  const cartSabbaqPercentage = cartGrandTotal > 0 ? Math.round((cartSabbaqTotal / cartGrandTotal) * 100) : 0;
  const cartVatPercentage = cartGrandTotal > 0 ? Math.max(0, 100 - cartGovPercentage - cartSabbaqPercentage) : 0;

  const cartCostBreakdownData = useMemo(() => {
    if (cartGrandTotal === 0) return [];
    return [
      {
        name: 'الرسوم الحكومية الرسمية',
        value: cartGovTotal,
        percentage: cartGovPercentage,
        color: '#0284C7',
        description: 'تسدد 100% مباشرة للجهات الحكومية المعتمدة'
      },
      {
        name: 'رسوم وأتعاب منصة سبّاق',
        value: cartSabbaqTotal,
        percentage: cartSabbaqPercentage,
        color: '#059669',
        description: 'أتعاب التدقيق الهندسي، إعداد الملفات، المتابعة والتنفيذ'
      },
      {
        name: 'ضريبة القيمة المضافة (15%)',
        value: cartVatTotal,
        percentage: cartVatPercentage,
        color: '#D97706',
        description: 'الضريبة النظامية المقررة (ZATCA)'
      }
    ].filter(i => i.value > 0);
  }, [cartGovTotal, cartSabbaqTotal, cartVatTotal, cartGrandTotal, cartGovPercentage, cartSabbaqPercentage, cartVatPercentage]);

  // Custom Cart Cost Tooltip
  const CustomCartCostTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-right min-w-[190px] space-y-1 font-['Cairo'] text-xs backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-100">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              {data.percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">المبلغ:</span>
            <strong className="text-white font-bold">{formatSAR(data.value)}</strong>
          </div>
          <p className="text-[10px] text-slate-400 pt-0.5 leading-snug">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Tabs Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5 border border-emerald-100">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
            <span>مركز إدارة ومتابعة الطلبات الموحد</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            الطلبات والخدمات الحكومية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تقديم طلبات جديدة، متابعة مسار المعاملات الحكومية، اعتماد عروض الأسعار، والسداد الإلكتروني
          </p>
        </div>

        {/* Action Controls & SubTabs Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setSubTab('tracking')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                subTab === 'tracking'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>متابعة الطلبات</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {estOrders.length}
              </span>
            </button>

            <button
              onClick={() => setSubTab('new_order')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                subTab === 'new_order'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>طلب جديد (دليل الخدمات)</span>
            </button>

            <button
              onClick={() => setSubTab('cart')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                subTab === 'cart'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
              <span>السلة والمسودات</span>
              {cartItems.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Primary Button */}
          {subTab === 'tracking' ? (
            <button
              onClick={() => setSubTab('new_order')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تقديم طلب جديد</span>
            </button>
          ) : (
            <button
              onClick={() => setSubTab('tracking')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>متابعة الطلبات ({estOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TRACKING (متابعة المعاملات والطلبات)                              */}
      {/* ========================================================================= */}
      {subTab === 'tracking' && (
        <div className="space-y-6">
          
          {/* Orders Status Distribution Analytics (Recharts Pie Chart) */}
          {estOrders.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                      <span>توزيع حالة الطلبات والمعاملات</span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        (قيد المراجعة، تم الدفع، تحت التنفيذ، مكتمل)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      رصد تحليلي لحركة المعاملات وتدفق العمليات للمنشأة مع إمكانية التصفية بنقرة واحدة
                    </p>
                  </div>
                </div>

                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>إلغاء التصفية (عرض الكل)</span>
                  </button>
                )}
              </div>

              {/* Grid Layout: Pie Chart + 4 Status Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Recharts Pie Chart Visual */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50/60 rounded-2xl border border-slate-100 relative">
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="cursor-pointer"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              opacity={statusFilter === 'all' || statusFilter === entry.key ? 1 : 0.35}
                              onClick={() => {
                                setStatusFilter(prev => prev === entry.key ? 'all' : entry.key);
                              }}
                              className="cursor-pointer transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Summary Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-2xl font-black text-slate-900 font-['Cairo']">
                        {estOrders.length}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        إجمالي الطلبات
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 mt-1 text-center">
                    * انقر على أي شريحة في المخطط لتصفية الطلبات أدناه
                  </span>
                </div>

                {/* 4 Status Category Breakdown Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {statusDistributionData.map((item) => {
                    const isSelected = statusFilter === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => setStatusFilter(isSelected ? 'all' : item.key)}
                        className={`p-4 rounded-xl border text-right cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50'
                            : `${item.bgColor} ${item.borderColor} hover:border-slate-400/80`
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <h4 className={`text-xs font-bold font-['Cairo'] ${isSelected ? 'text-white' : item.textColor}`}>
                              {item.name}
                            </h4>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/15 text-white' : 'bg-white/90 text-slate-700 shadow-2xs border border-slate-200/50'
                          }`}>
                            {item.percentage}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-200/60">
                          <div className="flex items-baseline gap-1">
                            <strong className={`text-lg font-black font-['Cairo'] ${isSelected ? 'text-emerald-400' : 'text-slate-900'}`}>
                              {item.value}
                            </strong>
                            <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              معاملات
                            </span>
                          </div>
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                            {formatSAR(item.totalAmount)}
                          </span>
                        </div>

                        <p className={`text-[10px] mt-1.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* Orders Content Section */}
          {estOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-4">
              <FileText className="w-14 h-14 text-slate-300 mx-auto" />
              <div className="max-w-md mx-auto">
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  لا توجد طلبات جارية لهذه المنشأة حالياً
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك تصفح دليل الخدمات الحكومية وتقديم طلب جديد فوري لإصدار أو تجديد التراخيص ومتابعتها لحظة بلحظة.
                </p>
              </div>
              <button
                onClick={() => setSubTab('new_order')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>استعراض الخدمات وتقديم طلب جديد الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Orders Sidebar List (4 Cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                    قائمة المعاملات ({filteredOrders.length})
                  </h3>
                  {statusFilter !== 'all' && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      تصفية: {STATUS_CATEGORIES.find(c => c.key === statusFilter)?.label}
                    </span>
                  )}
                </div>

                {/* Search in Orders */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="بحث برقم الطلب، الخدمة، أو المعاملة الحكومية..."
                    value={trackingSearchQuery}
                    onChange={(e) => setTrackingSearchQuery(e.target.value)}
                    className="w-full text-xs p-2.5 pr-8 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-2.5 pointer-events-none" />
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    لا توجد طلبات تطابق معايير البحث أو التصفية المحددة.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const badge = getOrderStatusBadge(order.status);
                    const isSelected = currentOrder && currentOrder.id === order.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`p-4 rounded-2xl border text-right cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50'
                            : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : badge.bg
                          }`}>
                            {badge.label}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm font-['Cairo'] mb-1 line-clamp-1">
                          {order.items.map(i => i.serviceName).join(' + ')}
                        </h4>

                        <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t ${
                          isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                        }`}>
                          <span>{order.createdAt.split('T')[0]}</span>
                          <strong className={isSelected ? 'text-emerald-400' : 'text-slate-900'}>
                            {formatSAR(order.totalAmount)}
                          </strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Active Order Detail View (8 Cols) */}
              {currentOrder && (
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Order Header Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            رقم الطلب: {currentOrder.orderNumber}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getOrderStatusBadge(currentOrder.status).bg}`}>
                            {getOrderStatusBadge(currentOrder.status).label}
                          </span>
                          {currentOrder.isAutoApproved && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Zap className="w-3 h-3 text-emerald-600" />
                              <span>معتمد تلقائياً للتجديد السنوي</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {currentOrder.createdAt.split('T')[0]}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] mt-1.5">
                          {currentOrder.items.map(i => i.serviceName).join(' + ')}
                        </h2>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">المبلغ الإجمالي المعتمد:</span>
                        <strong className="text-lg font-extrabold text-emerald-700 font-['Cairo']">
                          {formatSAR(currentOrder.totalAmount)}
                        </strong>
                      </div>
                    </div>

                    {/* Progress Steps Indicator */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">مسار تقدم المعاملة:</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        {[
                          { step: 1, label: '1. تدقيق ومراجعة' },
                          { step: 2, label: '2. تسعير واعتماد' },
                          { step: 3, label: '3. تقديم حكومي' },
                          { step: 4, label: '4. إصدار الترخيص' },
                        ].map((s) => {
                          const curStep = getStepNumber(currentOrder.status);
                          const isDone = curStep >= s.step * 1.8;
                          const isCurrent = Math.ceil(curStep / 2) === s.step;

                          return (
                            <div
                              key={s.step}
                              className={`p-2 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : isCurrent
                                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              {s.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Banners depending on status */}
                    {currentOrder.status === 'awaiting_approval' && (
                      <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-amber-900 block">تم إصدار وتدقيق عرض السعر الرسمي</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            يرجى اعتماد عرض السعر لبدء سداد الرسوم وتكليف موظف سبّاق المختص.
                          </p>
                        </div>
                        <button
                          onClick={() => onApproveQuote(currentOrder.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
                        >
                          اعتماد عرض السعر والمتابعة
                        </button>
                      </div>
                    )}

                    {currentOrder.status === 'awaiting_payment' && (
                      <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">جاهز للدفع وبدء التنفيذ</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            سدد الفاتورة الموحدة للبدء الفوري برفع المعاملات على المنصات الحكومية.
                          </p>
                        </div>
                        <button
                          onClick={() => onPayOrder(currentOrder.id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>سداد الفاتورة الآن ({formatSAR(currentOrder.totalAmount)})</span>
                        </button>
                      </div>
                    )}

                    {/* Sub Services Breakdown Table */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs">الخدمات المشمولة في هذا الطلب:</h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                        {currentOrder.items.map((sub, idx) => (
                          <div key={sub.id || idx} className="p-3 bg-slate-50/50 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900">{sub.serviceName}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">الجهة: {sub.authority}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800">{formatSAR(sub.total)}</span>
                              <span className="text-[10px] text-slate-400 block">
                                (حكومي: {formatSAR(sub.govFee)} • سبّاق: {formatSAR(sub.sabbaqFee)})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Government Reference numbers */}
                    {currentOrder.govTransactionNumbers && currentOrder.govTransactionNumbers.length > 0 && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">أرقام المعاملات الحكومية الصادرة:</span>
                        <div className="flex flex-wrap gap-2">
                          {currentOrder.govTransactionNumbers.map((num, i) => (
                            <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono font-bold text-slate-800">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specialist Messages & Direct Chat */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          س
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">
                            المستشار المتابع: {currentOrder.assignedSpecialist || 'مستشار التراخيص - سبّاق'}
                          </h4>
                          <span className="text-[10px] text-emerald-700">متصل وجاهز للرد وتحديث المعاملة</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">محادثة موثقة ومربوطة بالطلب</span>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto p-2">
                      <div className="bg-slate-100 p-3 rounded-2xl rounded-tr-none text-xs text-slate-800 max-w-md">
                        مرحباً بك! فريق سبّاق يتابع معاملتك بدقة. إذا كان لديك أي استفسار أو ترغب برفع مستند تكميلي يمكنك إرساله هنا مباشرة.
                      </div>

                      {currentOrder.status === 'awaiting_docs' && (
                        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 max-w-md space-y-2">
                          <p>⚠️ يرجى تزويدنا بصورة واضحة من عقد الإيجار الإلكتروني المحدث لاستكمال التقديم على منصة بلدي.</p>
                          <button
                            onClick={() => onUploadMissingDoc(currentOrder.id, 'عقد الإيجار الإلكتروني')}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع المستند الآن</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chat input form */}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="اكتب رسالة أو استفسار لمستشار سبّاق..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <span>إرسال</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: NEW ORDER / SERVICE CATALOG (طلب جديد ودليل الخدمات الحكومية)      */}
      {/* ========================================================================= */}
      {subTab === 'new_order' && (
        <div className="space-y-6">
          
          {/* Search and Filters Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="ابحث عن الخدمة، الترخيص، أو الجهة (مثال: رخصة تجارية، سلامة، شهادة صحية، إقامة)..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>

              {/* Service Type Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: 'كافة المعاملات' },
                  { id: 'issue', label: 'إصدار جديد' },
                  { id: 'renewal', label: 'تجديد' },
                  { id: 'modification', label: 'تعديل ونقل' },
                  { id: 'objection', label: 'اعتراضات' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                      selectedType === type.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const isCarted = cartItems.some(i => i.serviceId === service.id);

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {service.authority}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
                        <Clock className="w-3 h-3" />
                        <span>{service.estimatedDays}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-['Cairo'] leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Required Docs Preview */}
                    {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 block">المستندات المطلوبة ({service.requiredDocuments.length}):</span>
                        <ul className="text-slate-500 space-y-0.5 pr-3 list-disc text-[10px]">
                          {service.requiredDocuments.slice(0, 2).map((doc, idx) => (
                            <li key={idx} className="line-clamp-1">{doc}</li>
                          ))}
                          {service.requiredDocuments.length > 2 && (
                            <li className="text-emerald-700 font-bold list-none">
                              +{service.requiredDocuments.length - 2} مستندات إضافية...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">التكلفة التقديرية الإجمالية:</span>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-700 font-['Cairo']">
                          {formatSAR(service.totalEstimated)}
                        </span>
                        <span className="block text-[9px] text-slate-400">
                          (حكومي: {formatSAR(service.govFeeEstimated)} • سبّاق: {formatSAR(service.sabbaqFee)})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDirectOrderService(service)}
                        className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>طلب فوري</span>
                      </button>

                      {onAddToCart && (
                        <button
                          onClick={() => {
                            onAddToCart(service);
                            if (showToast) showToast(`تمت إضافة «${service.name}» إلى سلة الطلبات.`);
                          }}
                          className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 border ${
                            isCarted
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          {isCarted ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>بالسلة</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                              <span>+ السلة</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
              لا توجد خدمات تطابق معايير البحث الحالية. يمكنك تجربة كلمات بحث أخرى.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CART & DRAFTS (سلة الطلبات والمسودات)                              */}
      {/* ========================================================================= */}
      {subTab === 'cart' && (
        <div className="space-y-6">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-4">
              <ShoppingCart className="w-14 h-14 text-slate-300 mx-auto" />
              <div className="max-w-md mx-auto">
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">سلة الطلبات فارغة</h3>
                <p className="text-xs text-slate-500 mt-1">
                  لم تقم بإضافة أي خدمات إلى السلة بعد. يمكنك تصفح دليل الخدمات وإضافة التراخيص والمعاملات المطلوبة.
                </p>
              </div>
              <button
                onClick={() => setSubTab('new_order')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>استعراض دليل الخدمات وإضافة خدمات للسلة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Cart Items List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                    عناصر السلة ({cartItems.length} خدمات)
                  </h3>
                  <button
                    onClick={() => setSubTab('new_order')}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ إضافة خدمة أخرى</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.authority}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 font-['Cairo']">
                          {item.serviceName}
                        </h4>
                        <div className="text-[11px] text-slate-400">
                          رسوم حكومية: {formatSAR(item.govFee)} • أتعاب سبّاق: {formatSAR(item.sabbaqFee)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <strong className="text-sm font-bold text-emerald-700 font-['Cairo'] block">
                            {formatSAR(item.total)}
                          </strong>
                          <span className="text-[9px] text-slate-400">شامل الضريبة</span>
                        </div>

                        {onRemoveFromCart && (
                          <button
                            onClick={() => onRemoveFromCart(item.serviceId)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary & Chart Card (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>ملخص التكاليف وتقسيم الرسوم</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {cartItems.length} معاملات
                    </span>
                  </div>

                  {/* Visual Donut Chart */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex flex-col items-center">
                    <div className="w-full h-36 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cartCostBreakdownData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={58}
                            paddingAngle={3}
                            stroke="#ffffff"
                            strokeWidth={2}
                          >
                            {cartCostBreakdownData.map((entry, index) => (
                              <Cell key={`cart-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomCartCostTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-xs font-black text-slate-900 font-['Cairo']">
                          {formatSAR(cartGrandTotal)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold">
                          الإجمالي الكلي
                        </span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-center">
                      <div className="text-[10px]">
                        <span className="text-slate-400 block">حصة الرسوم الحكومية</span>
                        <strong className="text-sky-800 font-bold font-mono">{cartGovPercentage}%</strong>
                      </div>
                      <div className="text-[10px]">
                        <span className="text-slate-400 block">حصة أتعاب المنصة</span>
                        <strong className="text-emerald-800 font-bold font-mono">{cartSabbaqPercentage}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Separate Fee Comparison Cards */}
                  <div className="space-y-2.5">
                    {/* Government Fees Box */}
                    <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                          <Landmark className="w-3.5 h-3.5 text-sky-700" />
                          <span>الرسوم الحكومية الرسمية (تقديرية):</span>
                        </span>
                        <strong className="text-sky-900 font-mono text-sm">{formatSAR(cartGovTotal)}</strong>
                      </div>
                      <div className="w-full bg-sky-200/60 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${cartGovPercentage}%` }} />
                      </div>
                      <p className="text-[10px] text-sky-800 leading-tight">
                        تسدد مباشرة للجهات الرسمية (بلدي، سلامة، قوى، مقيم، ZATCA)
                      </p>
                    </div>

                    {/* Platform Fees Box */}
                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>أتعاب خدمة واستشارات سبّاق:</span>
                        </span>
                        <strong className="text-emerald-900 font-mono text-sm">{formatSAR(cartSabbaqTotal)}</strong>
                      </div>
                      <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${cartSabbaqPercentage}%` }} />
                      </div>
                      <p className="text-[10px] text-emerald-800 leading-tight">
                        تشمل المراجعة الهندسية، تجهيز المخططات، والزيارة الميدانية
                      </p>
                    </div>

                    {/* VAT Row */}
                    <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-semibold flex items-center gap-1.5 text-[11px]">
                        <Receipt className="w-3.5 h-3.5 text-amber-700" />
                        <span>ضريبة القيمة المضافة (15%):</span>
                      </span>
                      <strong className="text-amber-950 font-mono">{formatSAR(cartVatTotal)}</strong>
                    </div>

                    {/* Auto-Approval Feature for Annual / Recurring Renewals */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      cartAutoApproved 
                        ? 'bg-emerald-50/90 border-emerald-300' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
                              <span>اعتماد تلقائي لطلبات تجديد الرخص السنوية</span>
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                              فوري
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            إرسال المعاملة فورياً ومباشرة إلى الفريق الهندسي المختص فور موافقتك على الرسوم التقديرية لتفادي غرامات انتهاء المهلة.
                          </p>
                        </div>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={cartAutoApproved}
                            onChange={(e) => setCartAutoApproved(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {cartAutoApproved && (
                        <div className="mt-2 pt-1.5 border-t border-emerald-200/70 flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
                          <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>إرسال فوري ومباشر للفريق المختص فور التأكيد</span>
                        </div>
                      )}
                    </div>

                    {/* Grand Total */}
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block font-['Cairo']">الإجمالي الكلي المعتمد:</span>
                        <span className="text-[10px] text-slate-400">يشمل التدقيق، المتابعة، والضريبة</span>
                      </div>
                      <strong className="text-xl font-black text-emerald-700 font-['Cairo']">
                        {formatSAR(cartGrandTotal)}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {onOpenCart ? (
                      <button
                        onClick={onOpenCart}
                        className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                          cartAutoApproved 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {cartAutoApproved ? (
                          <>
                            <Zap className="w-4 h-4 text-emerald-200" />
                            <span>موافقة على الرسوم وإرسال فوري للفريق (اعتماد تلقائي)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>إتمام الطلب وتأكيد المعاملات</span>
                          </>
                        )}
                      </button>
                    ) : onSubmitCartOrder ? (
                      <button
                        onClick={() => onSubmitCartOrder({ autoApproved: cartAutoApproved })}
                        className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                          cartAutoApproved 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {cartAutoApproved ? (
                          <>
                            <Zap className="w-4 h-4 text-emerald-200" />
                            <span>موافقة على الرسوم وإرسال فوري للفريق (اعتماد تلقائي)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>إتمام الطلب وتأكيد المعاملات</span>
                          </>
                        )}
                      </button>
                    ) : null}

                    {onOpenCalculator && (
                      <button
                        onClick={onOpenCalculator}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        مراجعة التكاليف عبر حاسبة الرسوم
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>ضمان سبّاق للامتثال الحكومي:</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed pr-5">
                    تتم مراجعة كافة المتطلبات وتدقيق الاشتراطات البلدية والدفاع المدني قبل الرفع الرسمي لتفادي الملاحظات أو الرفض.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT ORDER SUBMISSION (نافذة تقديم طلب فوري مباشر)                */}
      {/* ========================================================================= */}
      {directOrderService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-right font-['Cairo']">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    تقديم طلب خدمة مباشر
                  </h3>
                  <span className="text-[11px] text-slate-500 font-normal">
                    الجهة الحكومية: {directOrderService.authority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDirectOrderService(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Summary Block */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{directOrderService.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{directOrderService.description}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 shrink-0 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {formatSAR(directOrderService.totalEstimated)}
                </span>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleConfirmDirectOrder} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم مقدم الطلب / المفوض:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={directApplicantName}
                      onChange={(e) => setDirectApplicantName(e.target.value)}
                      className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجوال للتواصل:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={directApplicantPhone}
                      onChange={(e) => setDirectApplicantPhone(e.target.value)}
                      className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الفرع أو الموقع المعني بالمعاملة:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={directBranchName}
                    onChange={(e) => setDirectBranchName(e.target.value)}
                    className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو اشتراطات خاصة بالطلب:
                </label>
                <textarea
                  rows={2}
                  placeholder="أدخل أي أرقام رخص سابقة، أو اشتراطات فنية ترغب بإبلاغ المستشار بها..."
                  value={directOrderNotes}
                  onChange={(e) => setDirectOrderNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDirectOrderService(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وإرسال الطلب الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
