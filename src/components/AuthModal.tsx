import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Smartphone,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Briefcase,
  Layers,
  MapPin,
  Check,
  Shield,
  Sliders,
  BadgeCheck,
  Users
} from 'lucide-react';
import { AuthMode, AuthPortal, UserAccount, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  initialPortal?: AuthPortal;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (newUser: UserAccount, establishmentData?: any) => void;
  showToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialPortal = 'client',
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  showToast,
}) => {
  // Selected Portal: 'client' (بوابة المنشآت) vs 'admin' (بوابة إدارة سبّاق)
  const [selectedPortal, setSelectedPortal] = useState<AuthPortal>(initialPortal);
  const [mode, setMode] = useState<AuthMode>(initialMode === 'admin_login' ? 'login' : initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Client Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('manager@sabbaq-food.sa');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Admin / Operations Login Form State
  const [adminStaffId, setAdminStaffId] = useState('SBQ-OP-401');
  const [adminEmail, setAdminEmail] = useState('a.alsalem@sabbaq.sa');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [admin2FACode, setAdmin2FACode] = useState('849201');

  // Register Form State (Client only)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regCrNumber, setRegCrNumber] = useState('');
  const [regEstablishmentName, setRegEstablishmentName] = useState('');
  const [regCity, setRegCity] = useState('الرياض');
  const [regActivity, setRegActivity] = useState('مطاعم ومقاهي ومطابخ سحابية');
  const [regBranchesCount, setRegBranchesCount] = useState(2);
  const [isLookingUpCr, setIsLookingUpCr] = useState(false);
  const [crLookupSuccess, setCrLookupSuccess] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // OTP State
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);

  // Nafath SSO State
  const [nafathId, setNafathId] = useState('');
  const [nafathNumber, setNafathNumber] = useState<number | null>(null);
  const [nafathStatus, setNafathStatus] = useState<'idle' | 'waiting' | 'approved'>('idle');

  useEffect(() => {
    if (initialMode === 'admin_login') {
      setSelectedPortal('admin');
      setMode('login');
    } else {
      setSelectedPortal(initialPortal);
      setMode(initialMode);
    }
  }, [initialMode, initialPortal, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regStep === 3 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, otpTimer]);

  useEffect(() => {
    let nafathTimer: NodeJS.Timeout;
    if (nafathStatus === 'waiting') {
      nafathTimer = setTimeout(() => {
        setNafathStatus('approved');
        setTimeout(() => {
          const loggedUser: UserAccount = {
            id: `usr-nafath-${Date.now()}`,
            name: 'أحمد بن عبد الرحمن السديري',
            email: 'a.alsudairi@almanar-holdings.sa',
            phone: '0501234567',
            nationalIdOrIqama: nafathId || '1087492140',
            crNumber: '1010884920',
            establishmentName: 'شركة المنار الوطنية للأغذية والمشروبات',
            role: 'client',
            portalRoleTitle: 'المفوض الرئيسي للمنشأة',
            isVerified: true,
            authProvider: 'nafath',
            createdAt: new Date().toISOString(),
            subscriptionPlan: 'pro',
          };
          onLoginSuccess(loggedUser);
          showToast('تم التحقق والمصادقة بنجاح عبر النفاذ الوطني الموحد إلى بوابة المنشآت.');
          onClose();
        }, 1200);
      }, 3500);
    }
    return () => clearTimeout(nafathTimer);
  }, [nafathStatus, nafathId, onLoginSuccess, showToast, onClose]);

  if (!isOpen) return null;

  // Handle Quick Demo Login for Establishments
  const handleQuickDemoLogin = (type: 'food_group' | 'contracting' | 'retail') => {
    setIsLoading(true);
    setTimeout(() => {
      let demoUser: UserAccount;
      if (type === 'food_group') {
        demoUser = {
          id: 'usr-demo-1',
          name: 'سلطان عبدالعزيز المقرن',
          email: 'sultan@sabbaq-food.sa',
          phone: '0555123456',
          crNumber: '1010482910',
          establishmentName: 'شركة التميز الذكي للمأكولات السريعة',
          role: 'client',
          portalRoleTitle: 'المدير التنفيذي ومفوض السجل',
          isVerified: true,
          authProvider: 'demo',
          createdAt: '2025-01-10',
          subscriptionPlan: 'pro',
        };
      } else if (type === 'contracting') {
        demoUser = {
          id: 'usr-demo-2',
          name: 'م. خالد فهد العتيبي',
          email: 'khalid@alotaybi-build.sa',
          phone: '0544987654',
          crNumber: '1010992384',
          establishmentName: 'مؤسسة إعمار الخليج للمقاولات العامة',
          role: 'client',
          portalRoleTitle: 'مالك المنشأة والمفوض',
          isVerified: true,
          authProvider: 'demo',
          createdAt: '2025-03-01',
          subscriptionPlan: 'basic',
        };
      } else {
        demoUser = {
          id: 'usr-demo-3',
          name: 'نورة إبراهيم الشمري',
          email: 'noura@alshammari-retail.sa',
          phone: '0567112233',
          crNumber: '2050883921',
          establishmentName: 'شركة تجارة التجزئة العصرية المحدودة',
          role: 'client',
          portalRoleTitle: 'مديرة الامتثال والعمليات',
          isVerified: true,
          authProvider: 'demo',
          createdAt: '2025-02-15',
          subscriptionPlan: 'enterprise',
        };
      }

      setIsLoading(false);
      onLoginSuccess(demoUser);
      showToast(`مرحباً بك مجدداً ${demoUser.name}! تم تسجيل الدخول إلى بوابة المنشآت.`);
      onClose();
    }, 600);
  };

  // Handle Quick Admin Operations Staff Login
  const handleAdminStaffPresetLogin = (preset: 'ops_manager' | 'licensing_advisor' | 'compliance_director') => {
    setIsLoading(true);
    setTimeout(() => {
      let adminUser: UserAccount;
      if (preset === 'ops_manager') {
        adminUser = {
          id: 'usr-admin-1',
          name: 'م. عبدالعزيز السالم',
          email: 'a.alsalem@sabbaq.sa',
          phone: '0501122334',
          establishmentName: 'إدارة العمليات المركزية - سبّاق',
          role: 'admin',
          portalRoleTitle: 'مدير العمليات الحكومية وتوزيع المعاملات',
          staffDepartment: 'إدارة العمليات الحكومية',
          isVerified: true,
          authProvider: 'admin_staff',
          createdAt: '2024-01-01',
        };
      } else if (preset === 'licensing_advisor') {
        adminUser = {
          id: 'usr-admin-2',
          name: 'أ. ريم الخالدي',
          email: 'reem.khalidi@sabbaq.sa',
          phone: '0509988776',
          establishmentName: 'فريق الاستشارات التخصصية - سبّاق',
          role: 'admin',
          portalRoleTitle: 'مستشارة التراخيص البلدية والدفاع المدني',
          staffDepartment: 'الاستشارات البلدية وسلامة',
          isVerified: true,
          authProvider: 'admin_staff',
          createdAt: '2024-03-15',
        };
      } else {
        adminUser = {
          id: 'usr-admin-3',
          name: 'د. فيصل القحطاني',
          email: 'faisalk@sabbaq.sa',
          phone: '0554433221',
          establishmentName: 'الإشراف العام والرقابة النظامية - سبّاق',
          role: 'admin',
          portalRoleTitle: 'المشرف العام وتدقيق الالتزام والأنظمة',
          staffDepartment: 'الإشراف والرقابة القانونية',
          isVerified: true,
          authProvider: 'admin_staff',
          createdAt: '2023-11-01',
        };
      }

      setIsLoading(false);
      onLoginSuccess(adminUser);
      showToast(`تم تسجيل الدخول بصلاحية إدارة سبّاق: ${adminUser.name} (${adminUser.portalRoleTitle})`);
      onClose();
    }, 600);
  };

  // Handle Client Standard Login
  const handleSubmitClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      showToast('يرجى كتابة البريد الإلكتروني أو رقم الجوال');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserAccount = {
        id: `usr-${Date.now()}`,
        name: 'عبدالله محمد السليمان',
        email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@sabbaq.sa`,
        phone: loginIdentifier.startsWith('05') ? loginIdentifier : '0505556677',
        crNumber: '1010482910',
        establishmentName: 'شركة التميز الذكي للمأكولات السريعة',
        role: 'client',
        portalRoleTitle: 'المفوض المعتمد للمنشأة',
        isVerified: true,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
        subscriptionPlan: 'pro',
      };
      onLoginSuccess(user);
      showToast('تم تسجيل الدخول بنجاح إلى بوابة المنشآت.');
      onClose();
    }, 800);
  };

  // Handle Admin Standard Login
  const handleSubmitAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور الرسمية لفريق سبّاق');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserAccount = {
        id: `usr-admin-${Date.now()}`,
        name: 'م. عبدالعزيز السالم',
        email: adminEmail,
        phone: '0501122334',
        establishmentName: 'منصة سبّاق - إدارة العمليات الحكومية',
        role: 'admin',
        portalRoleTitle: 'مدير العمليات الحكومية وتوزيع المعاملات',
        staffDepartment: 'إدارة العمليات المركزية',
        isVerified: true,
        authProvider: 'admin_staff',
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(user);
      showToast('تم التحقق من هوية المسؤول وتسجيل الدخول إلى بوابة إدارة سبّاق.');
      onClose();
    }, 850);
  };

  // CR Lookup Simulator
  const handleLookupCr = () => {
    if (!regCrNumber || regCrNumber.length < 5) {
      showToast('يرجى إدخال رقم سجل تجاري صحيح (10 أرقام)');
      return;
    }

    setIsLookingUpCr(true);
    setTimeout(() => {
      setIsLookingUpCr(false);
      setCrLookupSuccess(true);
      setRegEstablishmentName('شركة الرؤية الحديثة للتجارة والخدمات اللوجستية');
      setRegCity('الرياض');
      setRegActivity('التجارة العامة والخدمات البلدية المتخصصة');
      setRegBranchesCount(3);
      showToast('تم جلب بيانات السجل التجاري بنجاح من وزارة التجارة.');
    }, 1100);
  };

  // Start Nafath Auth
  const handleStartNafath = () => {
    if (!nafathId || nafathId.length < 10) {
      showToast('يرجى إدخال رقم هوية وطنية أو إقامة مكون من 10 أرقام');
      return;
    }
    const randomCode = Math.floor(Math.random() * 89) + 10;
    setNafathNumber(randomCode);
    setNafathStatus('waiting');
  };

  // Complete Registration
  const handleCompleteRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserAccount = {
        id: `usr-reg-${Date.now()}`,
        name: regFullName || 'المفوض المعتمد',
        email: regEmail || 'contact@newcompany.sa',
        phone: regPhone || '0500000000',
        crNumber: regCrNumber || '1010998877',
        establishmentName: regEstablishmentName || 'المنشأة الجديدة المسجلة',
        role: 'client',
        portalRoleTitle: 'المفوض الرئيسي للمنشأة',
        isVerified: true,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
        subscriptionPlan: 'pro',
      };

      const newEstData = {
        name: newUser.establishmentName,
        crNumber: newUser.crNumber,
        city: regCity,
        mainActivity: regActivity,
        branchesCount: regBranchesCount,
        contactPerson: newUser.name,
        contactPhone: newUser.phone,
        contactEmail: newUser.email,
      };

      onRegisterSuccess(newUser, newEstData);
      showToast(`تهانينا! تم إنشاء حساب المنشأة بنجاح ومرحباً بك في بوابة المنشآت.`);
      onClose();
    }, 900);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in"
      dir="rtl"
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className={`p-6 sm:p-7 relative overflow-hidden transition-colors ${
          selectedPortal === 'admin'
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white'
            : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white'
        }`}>
          {/* Subtle Decorative glow */}
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16 ${
            selectedPortal === 'admin' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
          }`}></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border ${
                selectedPortal === 'admin'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-950/40 border-blue-400/30'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-950/40 border-emerald-400/30'
              }`}>
                {selectedPortal === 'admin' ? (
                  <Sliders className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black font-['Cairo'] text-white">
                    {selectedPortal === 'admin' ? 'بوابة إدارة سبّاق (Admin)' : 'بوابة المنشآت والشركات'}
                  </h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedPortal === 'admin'
                      ? 'bg-blue-500/30 text-blue-200 border-blue-400/30'
                      : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
                  }`}>
                    {selectedPortal === 'admin' ? 'فريق العمليات والمستشارين' : 'أصحاب الأعمال والامتثال'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedPortal === 'admin'
                    ? 'تسجيل الدخول المعتمد لموظفي العمليات الحكومية ومستشاري التراخيص'
                    : 'المنظومة الوطنية لإدارة تراخيص المنشآت والحماية الاستباقية من المخالفات'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PRIMARY PORTAL SELECTION TABS */}
          <div className="mt-5 pt-3 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>اختر البوابة المطلوبة للدخول:</span>
              <span className="text-[11px] text-amber-300 font-semibold">صلاحيات وصول منفصلة</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('client');
                  setMode('login');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPortal === 'client'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>🏢 بوابة المنشآت</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('admin');
                  setMode('login');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPortal === 'admin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-300" />
                <span>🛡️ بوابة إدارة سبّاق</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs (for Client Portal only) */}
          {selectedPortal === 'client' && (
            <div className="flex items-center gap-1.5 mt-3 bg-slate-950/40 p-1 rounded-xl border border-slate-700/40">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegStep(1);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>تسجيل منشأة جديدة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('nafath');
                  setNafathStatus('idle');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mode === 'nafath'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>نفاذ</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* ========================================================= */}
          {/* SECTION A: SABBAQ OPERATIONS / ADMIN LOGIN PORTAL         */}
          {/* ========================================================= */}
          {selectedPortal === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950 font-['Cairo']">
                    منطقة الدخول المخصصة لفريق إدارة منصة سبّاق
                  </h4>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    هذه البوابة مخصصة حصرياً لمنسوبي ومستشاري سبّاق لتوزيع الطلبات ومراجعة المعاملات الحكومية وتدقيق الاشتراطات.
                  </p>
                </div>
              </div>

              {/* Admin Standard Credentials Form */}
              <form onSubmit={handleSubmitAdminLogin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الرقم الوظيفي / المعرف
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminStaffId}
                        onChange={(e) => setAdminStaffId(e.target.value)}
                        placeholder="SBQ-OP-401"
                        required
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      البريد الإداري الرسمي
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="name@sabbaq.sa"
                        required
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      كلمة المرور الإدارية
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pr-10 pl-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رمز التحقق الثنائي (2FA Token)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={admin2FACode}
                        onChange={(e) => setAdmin2FACode(e.target.value)}
                        placeholder="849201"
                        required
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري التحقق من صلاحيات إدارة سبّاق...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>الدخول إلى لوحة عمليات سبّاق</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Admin Staff Presets */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-800">
                      دخول تجريبي سريع بحسابات فريق سبّاق:
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded">
                    نقرة واحدة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdminStaffPresetLogin('ops_manager')}
                    className="p-3 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-blue-300"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                      م. عبدالعزيز السالم
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      مدير العمليات الحكومية
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">توزيع الطلبات وتعيين المستشارين</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminStaffPresetLogin('licensing_advisor')}
                    className="p-3 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-blue-300"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                      أ. ريم الخالدي
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      مستشارة بلدي وسلامة
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">معالجة التراخيص والتسعير</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminStaffPresetLogin('compliance_director')}
                    className="p-3 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-blue-300"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                      د. فيصل القحطاني
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      المشرف العام للامتثال
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">تدقيق الاشتراطات والأنظمة</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION B: ESTABLISHMENTS CLIENT PORTAL                   */}
          {/* ========================================================= */}
          {selectedPortal === 'client' && (
            <>
              {/* VIEW: LOGIN MODE */}
              {mode === 'login' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center sm:text-right">
                    <h3 className="text-lg font-extrabold text-slate-900 font-['Cairo']">
                      مرحباً بعودتك إلى بوابة المنشآت
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      أدخل بيانات حسابك المعتمد لإدارة تراخيص منشأتك ومتابعة مؤشر الامتثال.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitClientLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        البريد الإلكتروني أو رقم الجوال
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="manager@company.sa أو 05xxxxxxxx"
                          required
                          className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          كلمة المرور
                        </label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot_password')}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pr-10 pl-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 font-medium">تذكر هذا الجهاز</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري الدخول إلى بوابة المنشآت...</span>
                        </>
                      ) : (
                        <>
                          <span>دخول بوابة المنشأة</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="grow border-t border-slate-200"></div>
                    <span className="shrink mx-4 text-xs text-slate-400 font-medium">أو عبر الطرق السريعة</span>
                    <div className="grow border-t border-slate-200"></div>
                  </div>

                  {/* Nafath Quick Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('nafath');
                      setNafathStatus('idle');
                    }}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-800 transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <span>الدخول السريع عبر النفاذ الوطني الموحد (نفاذ)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                      موثوق
                    </span>
                  </button>

                  {/* Quick Preset Demo Accounts */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-extrabold text-slate-800">
                          حسابات تجريبية سريعة للمنشآت:
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">اختر منشأة للتجربة</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('food_group')}
                        className="p-3 bg-white hover:bg-emerald-50/70 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-emerald-300"
                      >
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                          سلطان المقرن
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">مطاعم وأغذية (3 فروع)</div>
                        <div className="text-[9px] text-emerald-600 font-semibold mt-1">شركة التميز الذكي</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('contracting')}
                        className="p-3 bg-white hover:bg-emerald-50/70 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-emerald-300"
                      >
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                          م. خالد العتيبي
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">مقاولات عامة وإنشاءات</div>
                        <div className="text-[9px] text-emerald-600 font-semibold mt-1">مؤسسة إعمار الخليج</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('retail')}
                        className="p-3 bg-white hover:bg-emerald-50/70 rounded-xl border border-slate-200 text-right transition-all group cursor-pointer shadow-2xs hover:border-emerald-300"
                      >
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                          نورة الشمري
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">تجارة تجزئة ومتاجر</div>
                        <div className="text-[9px] text-emerald-600 font-semibold mt-1">شركة التجزئة العصرية</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: REGISTER MODE */}
              {mode === 'register' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Step indicators */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className={`flex items-center gap-2 ${regStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        regStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        1
                      </div>
                      <span className="text-xs">السجل التجاري</span>
                    </div>

                    <div className="w-8 h-px bg-slate-200"></div>

                    <div className={`flex items-center gap-2 ${regStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        regStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        2
                      </div>
                      <span className="text-xs">بيانات المفوض</span>
                    </div>

                    <div className="w-8 h-px bg-slate-200"></div>

                    <div className={`flex items-center gap-2 ${regStep >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        regStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        3
                      </div>
                      <span className="text-xs">التحقق OTP</span>
                    </div>
                  </div>

                  {/* Step 1: CR Verification */}
                  {regStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 font-['Cairo']">
                          الخطوة الأولى: التحقق من السجل التجاري للمنشأة
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          أدخل رقم السجل التجاري المكون من 10 أرقام لجلب البيانات آلياً من وزارة التجارة.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">رقم السجل التجاري (CR Number)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={regCrNumber}
                            onChange={(e) => {
                              setRegCrNumber(e.target.value);
                              setCrLookupSuccess(false);
                            }}
                            placeholder="1010xxxxxx"
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleLookupCr}
                            disabled={isLookingUpCr}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isLookingUpCr ? 'جاري الفحص...' : 'فحص السجل'}
                          </button>
                        </div>
                      </div>

                      {/* Extracted Details */}
                      {crLookupSuccess && (
                        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2 animate-fade-in">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>تم التحقق من بيانات السجل التجاري بنجاح:</span>
                          </div>
                          <div className="text-xs text-slate-800 font-bold">{regEstablishmentName}</div>
                          <div className="text-[11px] text-slate-600">المدينة: {regCity} • النشاط: {regActivity}</div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!regCrNumber || regCrNumber.length < 5) {
                            showToast('يرجى إدخال وفحص رقم السجل التجاري أولاً');
                            return;
                          }
                          setRegStep(2);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>متابعة لبيانات المفوض</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Authorized Person Info */}
                  {regStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 font-['Cairo']">
                          الخطوة الثانية: بيانات المفوض المعتمد
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          بيانات الشخص المخول بإدارة المنشأة واستلام إشعارات الامتثال.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الثلاثي للمفوض</label>
                          <input
                            type="text"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="مثال: فهد بن عبدالعزيز الراجحي"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="name@company.sa"
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال</label>
                            <input
                              type="text"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="05xxxxxxxx"
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور للحساب</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={regAgreeTerms}
                            onChange={(e) => setRegAgreeTerms(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                          />
                          <span className="text-xs text-slate-600">أوافق على الشروط والأحكام وسياسة الخصوصية لمنصة سبّاق</span>
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          السابق
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!regFullName || !regEmail || !regPhone || !regPassword) {
                              showToast('يرجى ملء جميع بيانات المفوض المعتمد');
                              return;
                            }
                            setRegStep(3);
                            setOtpTimer(60);
                            showToast(`تم إرسال رمز التحقق OTP إلى الجوال ${regPhone}`);
                          }}
                          className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>إرسال رمز التحقق OTP</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: OTP Verification */}
                  {regStep === 3 && (
                    <div className="space-y-5 text-center">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 font-['Cairo']">
                          الخطوة الثالثة: تأكيد رمز التحقق
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          أدخل الرمز المكون من 4 أرقام المرسل إلى {regPhone || 'جوال المفوض'}.
                        </p>
                      </div>

                      <div className="flex justify-center gap-3" dir="ltr">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={otpValues[idx]}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newOtp = [...otpValues];
                              newOtp[idx] = val;
                              setOtpValues(newOtp);
                              if (val && idx < 3) {
                                const nextEl = document.getElementById(`otp-input-${idx + 1}`);
                                nextEl?.focus();
                              }
                            }}
                            className="w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden transition-all"
                          />
                        ))}
                      </div>

                      <div className="text-xs text-slate-500">
                        {otpTimer > 0 ? (
                          <span>إعادة إرسال الرمز بعد {otpTimer} ثانية</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setOtpTimer(60);
                              showToast('تمت إعادة إرسال رمز التحقق بنجاح');
                            }}
                            className="text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            إعادة إرسال الرمز الآن
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteRegister}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري التحقق وتفعيل الحساب...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                            <span>تأكيد وتفعيل الحساب والبدء</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: NAFATH SSO MODE */}
              {mode === 'nafath' && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto shadow-md">
                    <Fingerprint className="w-9 h-9" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-['Cairo']">
                      النفاذ الوطني الموحد (نفاذ)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      تسجيل دخول آمن وموثوق باستخدام بيانات الهوية الوطنية أو الإقامة عبر تطبيق نفاذ.
                    </p>
                  </div>

                  {nafathStatus === 'idle' && (
                    <div className="space-y-4 max-w-sm mx-auto text-right">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          رقم الهوية الوطنية أو الإقامة
                        </label>
                        <input
                          type="text"
                          value={nafathId}
                          onChange={(e) => setNafathId(e.target.value)}
                          placeholder="10xxxxxxxx أو 20xxxxxxxx"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleStartNafath}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>طلب المصادقة عبر نفاذ</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {nafathStatus === 'waiting' && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 max-w-sm mx-auto">
                      <div className="text-xs font-bold text-slate-600">
                        الرجاء فتح تطبيق نفاذ على هاتفك وتأكيد الرقم التالي:
                      </div>

                      <div className="w-24 h-24 rounded-3xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto text-4xl font-black shadow-inner border-2 border-emerald-500/40 animate-pulse">
                        {nafathNumber}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>بانتظار الموافقة في تطبيق نفاذ...</span>
                      </div>
                    </div>
                  )}

                  {nafathStatus === 'approved' && (
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 max-w-sm mx-auto animate-fade-in">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                      <h4 className="text-sm font-black text-emerald-950 font-['Cairo']">
                        تمت المصادقة بنجاح
                      </h4>
                      <p className="text-xs text-emerald-800">
                        جاري توجيهك إلى لوحة تحكم المنشأة...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: FORGOT PASSWORD */}
              {mode === 'forgot_password' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="text-right">
                    <h3 className="text-lg font-extrabold text-slate-900 font-['Cairo']">
                      استعادة كلمة المرور
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      أدخل بريدك الإلكتروني أو رقم الجوال المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      البريد الإلكتروني أو رقم الجوال
                    </label>
                    <input
                      type="text"
                      placeholder="name@company.sa أو 05xxxxxxxx"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToast('تم إرسال رابط استعادة كلمة المرور بنجاح');
                        setMode('login');
                      }}
                      className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      إرسال الرابط
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
