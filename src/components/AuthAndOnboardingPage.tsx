import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Camera,
  Scan,
  Sliders,
  Calendar,
  DollarSign,
  Users,
  Compass,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { Establishment, License, DocumentItem, UserAccount, AuthPortal } from '../types';

export interface AuthAndOnboardingPageProps {
  initialView?: 'login' | 'register' | 'onboarding';
  initialPortal?: AuthPortal;
  onLoginSuccess: (user: UserAccount) => void;
  onCompleteOnboarding: (user: UserAccount, establishment: Establishment, initialLicenses: License[], initialDocs: DocumentItem[]) => void;
  onBackToLanding: () => void;
  showToast: (msg: string) => void;
}

// Sample CR Template Data for Instant Realistic Simulation
interface SampleCR {
  id: string;
  name: string;
  crNumber: string;
  unified700: string;
  legalForm: string;
  city: string;
  district: string;
  capital: number;
  issueDate: string;
  expiryDate: string;
  activity: string;
  isicActivities: string[];
  authorizedPerson: string;
  tag: string;
}

const SAMPLE_CRS: SampleCR[] = [
  {
    id: 'sample-food',
    name: 'شركة المذاق العربي لتقديم الوجبات الغذائية والمشروبات ذ.م.م',
    crNumber: '1010458921',
    unified700: '7001894520',
    legalForm: 'شركة ذات مسؤولية محدودة',
    city: 'الرياض',
    district: 'حي العليا - طريق الملك فهد',
    capital: 500000,
    issueDate: '2022-04-15',
    expiryDate: '2027-04-14',
    activity: 'أنشطة المطاعم والمقاهي وتقديم الوجبات السريعة وإعداد الأطعمة',
    isicActivities: ['5610 - أنشطة المطاعم وخدمات تقديم الأطعمة المتنقلة', '5630 - تقديم المشروبات'],
    authorizedPerson: 'سلطان بن عبدالعزيز المقرن',
    tag: 'مطاعم وأغذية'
  },
  {
    id: 'sample-contracting',
    name: 'مؤسسة إعمار الخليج للمقاولات العامة والإنشاءات',
    crNumber: '1010992384',
    unified700: '7002984177',
    legalForm: 'مؤسسة فردية',
    city: 'جدة',
    district: 'حي الروضة - طريق الأمير سلطان',
    capital: 300000,
    issueDate: '2021-08-10',
    expiryDate: '2026-08-09',
    activity: 'المقاولات العامة للأبنية السكنية والتجارية وأعمال الصيانة والتشغيل',
    isicActivities: ['4100 - تشييد المباني', '4322 - أعمال السباكة والتدفئة والتركيبات الميكانيكية'],
    authorizedPerson: 'م. خالد بن فهد العتيبي',
    tag: 'مقاولات وإنشاءات'
  },
  {
    id: 'sample-tech',
    name: 'شركة الأفق الذكي لتقنية المعلومات والحلول الرقمية',
    crNumber: '1010678912',
    unified700: '7003456182',
    legalForm: 'شركة مساهمة مقفلة',
    city: 'الدمام',
    district: 'حي الشاطئ الشرقي',
    capital: 1000000,
    issueDate: '2023-01-20',
    expiryDate: '2028-01-19',
    activity: 'تطوير البرمجيات والأنظمة والحلول السحابية والتجارة الإلكترونية',
    isicActivities: ['6201 - أنشطة البرمجة الحاسوبية', '6202 - أنشطة الاستشارات الحاسوبية وإدارة المرافق'],
    authorizedPerson: 'أ. فهد بن عبدالله الدوسري',
    tag: 'تقنية وتجارة إلكترونية'
  }
];

export const AuthAndOnboardingPage: React.FC<AuthAndOnboardingPageProps> = ({
  initialView = 'login',
  initialPortal = 'client',
  onLoginSuccess,
  onCompleteOnboarding,
  onBackToLanding,
  showToast,
}) => {
  // Portal selection: 'client' (بوابة المنشآت) | 'admin' (بوابة إدارة سبّاق)
  const [selectedPortal, setSelectedPortal] = useState<AuthPortal>(initialPortal);

  // Navigation tabs: 'login' | 'register' | 'onboarding'
  const [activeMainTab, setActiveMainTab] = useState<'login' | 'register' | 'onboarding'>(initialView);

  // Login Form State (Client)
  const [loginIdentifier, setLoginIdentifier] = useState('manager@sabbaq-food.sa');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Login Form State
  const [adminStaffId, setAdminStaffId] = useState('SBQ-ADM-8802');
  const [adminEmail, setAdminEmail] = useState('admin.salem@sabbaq.sa');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [admin2faToken, setAdmin2faToken] = useState('749210');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Nafath SSO Login Modal / State
  const [nafathId, setNafathId] = useState('');
  const [nafathNumber, setNafathNumber] = useState<number | null>(null);
  const [nafathStatus, setNafathStatus] = useState<'idle' | 'waiting' | 'approved'>('idle');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1); // 1: form, 2: OTP
  const [otpValues, setOtpValues] = useState(['5', '9', '2', '1']);
  const [otpTimer, setOtpTimer] = useState(60);

  // User Account created during registration / login
  const [registeredUser, setRegisteredUser] = useState<UserAccount | null>(null);

  // ONBOARDING WIZARD STEPS:
  // 1: Upload / Scan CR (ارفع سجلك التجاري)
  // 2: AI OCR Scanning Animation (المسح الضوئي الذكي)
  // 3: Verify & Confirm Extracted Data (تسجيل وتأكيد المعلومات)
  // 4: Complete Profile (إكمال الملف التعريفي: الموظفين، العنوان، التراخيص)
  // 5: Celebration & Launch Dashboard (اكتمال الإعداد)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Uploaded CR File State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    previewUrl?: string;
  } | null>(null);
  const [selectedSampleCR, setSelectedSampleCR] = useState<SampleCR>(SAMPLE_CRS[0]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // OCR Processing Checklist & Animation
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPhase, setOcrPhase] = useState<'reading' | 'extracting' | 'validating' | 'done'>('reading');
  const [ocrChecklist, setOcrChecklist] = useState({
    qrCode: false,
    crNumber: false,
    unified700: false,
    legalForm: false,
    activities: false,
    validity: false
  });

  // Extracted CR Data (Editable in Step 3)
  const [crData, setCrData] = useState<{
    crNumber: string;
    unified700: string;
    establishmentName: string;
    legalForm: string;
    city: string;
    district: string;
    issueDate: string;
    expiryDate: string;
    capital: number;
    activity: string;
    isicCode: string;
    authorizedPerson: string;
  }>({
    crNumber: SAMPLE_CRS[0].crNumber,
    unified700: SAMPLE_CRS[0].unified700,
    establishmentName: SAMPLE_CRS[0].name,
    legalForm: SAMPLE_CRS[0].legalForm,
    city: SAMPLE_CRS[0].city,
    district: SAMPLE_CRS[0].district,
    issueDate: SAMPLE_CRS[0].issueDate,
    expiryDate: SAMPLE_CRS[0].expiryDate,
    capital: SAMPLE_CRS[0].capital,
    activity: SAMPLE_CRS[0].activity,
    isicCode: '5610',
    authorizedPerson: SAMPLE_CRS[0].authorizedPerson
  });

  // Profile Details (Step 4)
  const [profileTotalEmployees, setProfileTotalEmployees] = useState(14);
  const [profileSaudiEmployees, setProfileSaudiEmployees] = useState(5);
  const [profileBranchesCount, setProfileBranchesCount] = useState(1);
  const [profileNationalAddress, setProfileNationalAddress] = useState('الرياض 12214 - حي العليا - مبنى 7412');
  const [profilePostalCode, setProfilePostalCode] = useState('12214');
  const [profileAdditionalNumber, setProfileAdditionalNumber] = useState('3219');
  const [profileComplianceOfficer, setProfileComplianceOfficer] = useState('');
  const [profileContactPhone, setProfileContactPhone] = useState('');
  const [profileContactEmail, setProfileContactEmail] = useState('');

  // Selected Initial Licenses to activate
  const [selectedLicenses, setSelectedLicenses] = useState<{
    balady: boolean;
    salama: boolean;
    zatca: boolean;
    gosi: boolean;
    chamber: boolean;
  }>({
    balady: true,
    salama: true,
    zatca: true,
    gosi: true,
    chamber: true
  });

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regStep === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, otpTimer]);

  // Nafath SSO timer simulation
  useEffect(() => {
    let nafathTimer: NodeJS.Timeout;
    if (nafathStatus === 'waiting') {
      nafathTimer = setTimeout(() => {
        setNafathStatus('approved');
        setTimeout(() => {
          const loggedUser: UserAccount = {
            id: `usr-nafath-${Date.now()}`,
            name: 'سلطان بن عبدالعزيز المقرن',
            email: 'sultan@sabbaq-food.sa',
            phone: '0501234567',
            nationalIdOrIqama: nafathId || '1087492140',
            crNumber: '1010458921',
            establishmentName: 'شركة المذاق العربي لتقديم الوجبات الغذائية',
            role: 'client',
            isVerified: true,
            authProvider: 'nafath',
            createdAt: new Date().toISOString()
          };
          onLoginSuccess(loggedUser);
          showToast('تم التحقق والمصادقة بنجاح عبر النفاذ الوطني الموحد.');
        }, 1200);
      }, 3500);
    }
    return () => clearTimeout(nafathTimer);
  }, [nafathStatus, nafathId, onLoginSuccess, showToast]);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      const user: UserAccount = {
        id: `usr-${Date.now()}`,
        name: 'سلطان بن عبدالعزيز المقرن',
        email: loginIdentifier.includes('@') ? loginIdentifier : 'sultan@arabianflavors.sa',
        phone: '0501234567',
        nationalIdOrIqama: '1088776655',
        establishmentName: 'شركة المذاق العربي للخدمات الغذائية',
        crNumber: '1010458921',
        role: 'client',
        isVerified: true,
        authProvider: 'password',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      showToast(`مرحباً بك مجدداً، ${user.name}`);
    }, 900);
  };

  // Quick Demo Login
  const handleQuickDemo = (sample: SampleCR) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      const user: UserAccount = {
        id: `usr-demo-${sample.id}`,
        name: sample.authorizedPerson,
        email: `manager@${sample.id}.sa`,
        phone: '0555123456',
        nationalIdOrIqama: '1098765432',
        establishmentName: sample.name,
        crNumber: sample.crNumber,
        role: 'client',
        isVerified: true,
        authProvider: 'demo',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      showToast(`تم تسجيل الدخول بحساب تجريبي: ${sample.name}`);
    }, 700);
  };

  // Handle Admin Staff Login Submit
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      showToast('يرجى إدخال البريد الإلكتروني الرسمي وكلمة المرور.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      const adminUser: UserAccount = {
        id: `adm-${Date.now()}`,
        name: 'م. عبدالعزيز بن سعد السالم',
        email: adminEmail,
        phone: '0509988776',
        nationalIdOrIqama: '1022334455',
        establishmentName: 'إدارة عمليات ورقابة منصة سبّاق',
        crNumber: '7001928374',
        role: 'admin',
        portalRoleTitle: 'مدير عمليات الامتثال والرقابة',
        staffDepartment: 'operations',
        isVerified: true,
        authProvider: 'admin_staff',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(adminUser);
      showToast(`مرحباً بك في بوابة إدارة العمليات، ${adminUser.name}`);
    }, 850);
  };

  // Admin Presets Quick Login
  const handleAdminPresetLogin = (preset: {
    name: string;
    email: string;
    roleTitle: string;
    dept: string;
    staffId: string;
  }) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      const adminUser: UserAccount = {
        id: `adm-preset-${preset.staffId}`,
        name: preset.name,
        email: preset.email,
        phone: '0509988776',
        nationalIdOrIqama: '1022334455',
        establishmentName: 'منظومة سبّاق للامتثال والحوكمة',
        crNumber: '7001928374',
        role: 'admin',
        portalRoleTitle: preset.roleTitle,
        staffDepartment: preset.dept,
        isVerified: true,
        authProvider: 'admin_staff',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(adminUser);
      showToast(`تم الدخول بصلاحية: ${preset.roleTitle}`);
    }, 700);
  };

  // Handle Register Form Submit (Step 1 -> OTP Step 2)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة لإنشاء الحساب.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (!regAgreeTerms) {
      showToast('يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية.');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      setRegStep(2);
      setOtpTimer(60);
      showToast(`تم إرسال رمز التحقق إلى الجوال ${regPhone}`);
    }, 800);
  };

  // Handle Verify OTP and transition to Onboarding
  const handleVerifyOtp = () => {
    const newUser: UserAccount = {
      id: `usr-new-${Date.now()}`,
      name: regFullName,
      email: regEmail,
      phone: regPhone,
      nationalIdOrIqama: regNationalId || '1088997766',
      establishmentName: 'منشأة قيد التسجيل',
      role: 'client',
      isVerified: true,
      authProvider: 'password',
      createdAt: new Date().toISOString()
    };
    setRegisteredUser(newUser);
    setProfileComplianceOfficer(regFullName);
    setProfileContactPhone(regPhone);
    setProfileContactEmail(regEmail);

    showToast('تم التحقق من الحساب بنجاح! ننتقل الآن لرفع السجل التجاري.');
    setActiveMainTab('onboarding');
    setOnboardingStep(1);
  };

  // Trigger OCR Scan on selected or uploaded CR
  const handleStartOcrScan = (sample?: SampleCR) => {
    const target = sample || selectedSampleCR;
    if (sample) {
      setSelectedSampleCR(sample);
      setCrData({
        crNumber: sample.crNumber,
        unified700: sample.unified700,
        establishmentName: sample.name,
        legalForm: sample.legalForm,
        city: sample.city,
        district: sample.district,
        issueDate: sample.issueDate,
        expiryDate: sample.expiryDate,
        capital: sample.capital,
        activity: sample.activity,
        isicCode: sample.isicActivities[0].split(' - ')[0],
        authorizedPerson: sample.authorizedPerson
      });
      setUploadedFile({
        name: `سجل_تجاري_${sample.crNumber}.pdf`,
        size: '1.4 ميجابايت',
        type: 'application/pdf'
      });
    }

    setOnboardingStep(2);
    setOcrProgress(0);
    setOcrPhase('reading');
    setOcrChecklist({
      qrCode: false,
      crNumber: false,
      unified700: false,
      legalForm: false,
      activities: false,
      validity: false
    });

    // Step-by-step simulated AI OCR progress
    setTimeout(() => {
      setOcrProgress(25);
      setOcrChecklist(prev => ({ ...prev, qrCode: true, crNumber: true }));
      setOcrPhase('extracting');
    }, 800);

    setTimeout(() => {
      setOcrProgress(60);
      setOcrChecklist(prev => ({ ...prev, unified700: true, legalForm: true }));
      setOcrPhase('validating');
    }, 1600);

    setTimeout(() => {
      setOcrProgress(90);
      setOcrChecklist(prev => ({ ...prev, activities: true, validity: true }));
    }, 2400);

    setTimeout(() => {
      setOcrProgress(100);
      setOcrPhase('done');
      showToast('اكتمل المسح الضوئي بالذكاء الاصطناعي واستخراج البيانات بنجاح!');
      setTimeout(() => {
        setOnboardingStep(3);
      }, 600);
    }, 3000);
  };

  // Handle File Input from Device
  const handleCustomFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت`,
        type: file.type || 'application/pdf'
      });
      handleStartOcrScan();
    }
  };

  // Finalize Onboarding and Launch App
  const handleFinalizeEstablishment = () => {
    const userToUse: UserAccount = registeredUser || {
      id: `usr-${Date.now()}`,
      name: crData.authorizedPerson || 'سلطان المقرن',
      email: profileContactEmail || 'manager@sabbaq-food.sa',
      phone: profileContactPhone || '0501234567',
      nationalIdOrIqama: '1088776655',
      establishmentName: crData.establishmentName,
      crNumber: crData.crNumber,
      role: 'client',
      isVerified: true,
      authProvider: 'password',
      createdAt: new Date().toISOString()
    };

    const saudiRatio = profileTotalEmployees > 0 
      ? Number(((profileSaudiEmployees / profileTotalEmployees) * 100).toFixed(1)) 
      : 30;

    const newEstablishment: Establishment = {
      id: `est-${Date.now()}`,
      name: crData.establishmentName,
      crNumber: crData.crNumber,
      unifiedNumber: crData.unified700,
      legalForm: crData.legalForm,
      city: crData.city,
      district: crData.district,
      nationalAddress: profileNationalAddress,
      mainActivity: crData.activity,
      isicActivities: [crData.activity],
      isicCode: crData.isicCode,
      establishedYear: crData.issueDate ? crData.issueDate.split('-')[0] : '2023',
      registrationDate: crData.issueDate,
      crExpiryDate: crData.expiryDate,
      branchesCount: profileBranchesCount,
      totalEmployees: profileTotalEmployees,
      saudiEmployees: profileSaudiEmployees,
      foreignEmployees: profileTotalEmployees - profileSaudiEmployees,
      saudizationPercentage: saudiRatio,
      complianceScore: 94,
      riskScore: 20,
      contactPerson: profileComplianceOfficer || crData.authorizedPerson,
      contactPhone: profileContactPhone || '0501234567',
      contactEmail: profileContactEmail || userToUse.email
    };

    // Generate Initial Standard Licenses for this establishment
    const initialLicenses: License[] = [];
    if (selectedLicenses.balady) {
      initialLicenses.push({
        id: `lic-balady-${Date.now()}`,
        establishmentId: newEstablishment.id,
        name: 'رخصة بلدي للأنشطة التجارية',
        authority: 'وزارة البلديات والإسكان (بلدي)',
        licenseNumber: `BLD-44${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: '2024-01-10',
        expiryDate: '2026-01-09',
        status: 'active',
        daysRemaining: 510,
        costGov: 1200,
        costSabbaq: 450,
        isMandatory: true
      });
    }
    if (selectedLicenses.salama) {
      initialLicenses.push({
        id: `lic-salama-${Date.now()}`,
        establishmentId: newEstablishment.id,
        name: 'تصريح سلامة الدفاع المدني',
        authority: 'المديرية العامة للدفاع المدني (سلامة)',
        licenseNumber: `SLM-99${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: '2024-03-01',
        expiryDate: '2025-02-28',
        status: 'active',
        daysRemaining: 195,
        costGov: 800,
        costSabbaq: 350,
        isMandatory: true
      });
    }

    // Generate Initial Documents Vault
    const initialDocs: DocumentItem[] = [
      {
        id: `doc-cr-${Date.now()}`,
        establishmentId: newEstablishment.id,
        title: 'السجل التجاري الموثق',
        category: 'cr',
        documentNumber: crData.crNumber,
        authority: 'وزارة التجارة',
        issueDate: crData.issueDate,
        expiryDate: crData.expiryDate,
        status: 'valid',
        fileUrl: '#',
        fileSize: uploadedFile?.size || '1.4 ميجابايت',
        uploadedAt: new Date().toISOString().split('T')[0],
        lastVerifiedAt: new Date().toISOString().split('T')[0]
      }
    ];

    onCompleteOnboarding(userToUse, newEstablishment, initialLicenses, initialDocs);
    showToast(`مبارك! تم إكمال ملف المنشأة «${newEstablishment.name}» وتفعيل مركز الامتثال.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white font-['Cairo'] tracking-tight">
                سَـبّـاق <span className="text-emerald-400 font-bold text-xs sm:text-sm">للامتثال الحكومي</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                نظام الشركات الذكي
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              تسجيل الدخول وإعداد المنشأة بالمسح الضوئي للسجل التجاري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span>العودة للرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl relative z-10">

          {/* Nav Switcher: Login vs Register vs Onboarding */}
          {activeMainTab !== 'onboarding' && (
            <div className="flex items-center justify-center mb-6">
              <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMainTab('login')}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                    activeMainTab === 'login'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMainTab('register')}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                    activeMainTab === 'register'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>تسجيل حساب جديد</span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                    خطوة بخطوة
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('onboarding');
                    setOnboardingStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="المسح المباشر للسجل التجاري"
                >
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline">مسح السجل التجاري فوراً</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: LOGIN (تسجيل الدخول) */}
          {/* ============================================================ */}
          {activeMainTab === 'login' && (
            <div className="bg-slate-950/90 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in backdrop-blur-xl">
              
              {/* Portal Selector Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPortal('client')}
                  className={`py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-start gap-3 transition-all cursor-pointer ${
                    selectedPortal === 'client'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedPortal === 'client' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="leading-tight font-black font-['Cairo']">بوابة المنشآت والشركات</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">تتبع التراخيص، النفاذ الوطني، والامتثال</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPortal('admin')}
                  className={`py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-start gap-3 transition-all cursor-pointer ${
                    selectedPortal === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-950/50 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedPortal === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="leading-tight font-black font-['Cairo']">بوابة إدارة سبّاق (Admin HQ)</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">فريق العمليات، مستشاري التراخيص، والرقابة</div>
                  </div>
                </button>
              </div>

              {selectedPortal === 'client' ? (
                <>
                  <div className="text-center space-y-2 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                      دخول بوابة المنشآت والشركات
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      تابع التراخيص، المخاطر، الفروع، والمستندات بامتثال فوري وآمن
                    </p>
                  </div>

                  {/* Login Options: Standard vs Nafath */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Form Column */}
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          البريد الإلكتروني أو رقم السجل التجاري
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="manager@company.sa أو 1010xxxxxx"
                            className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 pr-10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            required
                          />
                          <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-300">
                            كلمة المرور
                          </label>
                          <button
                            type="button"
                            onClick={() => showToast('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.')}
                            className="text-[11px] text-emerald-400 hover:underline cursor-pointer font-bold"
                          >
                            نسيت كلمة المرور؟
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 pr-10 pl-10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            required
                          />
                          <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-500 hover:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>تذكرني على هذا الجهاز</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingIn ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري التحقق وتسجيل الدخول...</span>
                          </>
                        ) : (
                          <>
                            <span>دخول لوحة تحكم المنشأة</span>
                            <ArrowLeft className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <span className="text-xs text-slate-400">ليس لديك حساب بعد؟ </span>
                        <button
                          type="button"
                          onClick={() => setActiveMainTab('register')}
                          className="text-xs font-black text-emerald-400 hover:underline cursor-pointer"
                        >
                          سجل منشأتك الآن وارفع السجل التجاري
                        </button>
                      </div>
                    </form>

                    {/* Right Column: Nafath SSO + Quick Demo Login */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-r border-slate-800 pt-6 md:pt-0 md:pr-8">
                      
                      {/* Nafath Login Box */}
                      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black">
                              <Fingerprint className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white font-['Cairo']">
                                النفاذ الوطني الموحد (نفاذ)
                              </h4>
                              <span className="text-[10px] text-slate-400">مصادقة المفوض النظامي للمنشأة</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                            معتمد رسمي
                          </span>
                        </div>

                        {nafathStatus === 'idle' && (
                          <div className="space-y-3 pt-1">
                            <input
                              type="text"
                              maxLength={10}
                              value={nafathId}
                              onChange={(e) => setNafathId(e.target.value.replace(/\D/g, ''))}
                              placeholder="أدخل رقم الهوية الوطنية أو الإقامة (10 أرقام)"
                              className="w-full bg-slate-950 text-white text-xs font-semibold rounded-xl border border-slate-800 p-3 text-center tracking-widest placeholder-slate-500 focus:outline-none focus:border-teal-500"
                            />
                            <button
                              type="button"
                              disabled={nafathId.length < 10}
                              onClick={() => {
                                setNafathNumber(Math.floor(10 + Math.random() * 90));
                                setNafathStatus('waiting');
                              }}
                              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Fingerprint className="w-4 h-4" />
                              <span>طلب المصادقة عبر تطبيق نفاذ</span>
                            </button>
                          </div>
                        )}

                        {nafathStatus === 'waiting' && (
                          <div className="text-center py-3 space-y-2 bg-slate-950/80 rounded-xl border border-teal-500/30 p-3">
                            <span className="text-xs text-slate-300 block">
                              افتح تطبيق نفاذ على جوالك وأكّد الرقم التالي:
                            </span>
                            <div className="text-3xl font-black text-teal-400 font-mono tracking-widest animate-pulse">
                              {nafathNumber}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                              <span>في انتظار قبول الطلب بالتطبيق...</span>
                            </div>
                          </div>
                        )}

                        {nafathStatus === 'approved' && (
                          <div className="text-center py-3 text-emerald-400 text-xs font-black flex items-center justify-center gap-2 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تمت المصادقة بنجاح! جاري توجيهك...</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Demo Accounts */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>تجربة سريعة بحسابات منشآت نموذجية:</span>
                        </span>

                        <div className="grid grid-cols-1 gap-2">
                          {SAMPLE_CRS.map(sample => (
                            <button
                              key={sample.id}
                              type="button"
                              onClick={() => handleQuickDemo(sample)}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 pr-1">
                                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                                  {sample.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  سجل: {sample.crNumber} • {sample.city}
                                </div>
                              </div>
                              <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                                {sample.tag}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </>
              ) : (
                /* ADMIN / SABBAQ HQ LOGIN VIEW */
                <div className="space-y-6">
                  <div className="text-center space-y-2 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                      دخول بوابة إدارة سبّاق (HQ Operations)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      مخصصة لفريق العمليات، مستشاري التراخيص، وإدارة ومتابعة طلبات المنشآت
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Admin Form Column */}
                    <form onSubmit={handleAdminLoginSubmit} className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>مصادقة موظفي سبّاق 2FA</span>
                        </span>
                        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
                          SABBAQ-STAFF
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          البريد الإلكتروني المهني (@sabbaq.sa)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin.salem@sabbaq.sa"
                            className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-xl border border-slate-800 p-3 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                          />
                          <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            الرقم الوظيفي
                          </label>
                          <input
                            type="text"
                            value={adminStaffId}
                            onChange={(e) => setAdminStaffId(e.target.value)}
                            placeholder="SBQ-ADM-8802"
                            className="w-full bg-slate-950 text-white font-mono text-xs rounded-xl border border-slate-800 p-3 text-center focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            رمز التحقق الثنائي (2FA)
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={admin2faToken}
                            onChange={(e) => setAdmin2faToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="749210"
                            className="w-full bg-slate-950 text-blue-300 font-mono tracking-widest text-xs font-bold rounded-xl border border-slate-800 p-3 text-center focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          كلمة المرور الإدارية
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-xl border border-slate-800 p-3 pr-10 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                          />
                          <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        {isLoggingIn ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري التحقق من صلاحيات الإدارة...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>دخول لوحة تحكم العمليات</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Admin Presets Column */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>دخول سريع بصلاحيات أدوار إدارة سبّاق:</span>
                      </span>

                      <div className="space-y-2">
                        {[
                          {
                            name: 'م. عبدالعزيز بن سعد السالم',
                            email: 'salem@sabbaq.sa',
                            roleTitle: 'مدير العمليات والرقابة الفنية',
                            dept: 'operations',
                            staffId: 'SBQ-OP-101',
                            tag: 'إدارة كاملة',
                            desc: 'اعتماد الطلبات، إدارة الفروع، ومراجعة سجلات الامتثال'
                          },
                          {
                            name: 'أ. ريم بنت خالد الخالدي',
                            email: 'reem.k@sabbaq.sa',
                            roleTitle: 'مستشارة تراخيص أولى (بلدي والدفاع المدني)',
                            dept: 'licensing',
                            staffId: 'SBQ-LIC-204',
                            tag: 'تراخيص ومعاملات',
                            desc: 'إصدار التراخيص، معالجة الملاحظات، وإعداد خطط التصحيح'
                          },
                          {
                            name: 'د. فيصل بن عبدالله القحطاني',
                            email: 'faisal.q@sabbaq.sa',
                            roleTitle: 'مشرف الامتثال القانوني والاعتراضات',
                            dept: 'legal_compliance',
                            staffId: 'SBQ-LEG-305',
                            tag: 'قانوني ورقابي',
                            desc: 'صياغة مذكرات الاعتراض، فحص المخالفات، واستشارات قوى'
                          }
                        ].map((preset) => (
                          <button
                            key={preset.staffId}
                            type="button"
                            onClick={() => handleAdminPresetLogin(preset)}
                            className="w-full text-right p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-white group-hover:text-blue-300">
                                {preset.name}
                              </span>
                              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
                                {preset.tag}
                              </span>
                            </div>
                            <div className="text-[11px] text-blue-400 font-medium">
                              {preset.roleTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {preset.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: REGISTER NEW USER (تسجيل حساب جديد) */}
          {/* ============================================================ */}
          {activeMainTab === 'register' && (
            <div className="bg-slate-950/90 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6 animate-fade-in backdrop-blur-xl">
              
              <div className="text-center space-y-2 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                  إنشاء حساب منشأة جديد
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  سجل بيانات المفوض ثم انتقل مباشرة لرفع ومسح السجل التجاري
                </p>
              </div>

              {/* Progress Steps Header */}
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto py-2">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${regStep === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${regStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</span>
                  <span>بيانات الحساب</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-800" />
                <div className={`flex items-center gap-1.5 text-xs font-bold ${regStep === 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${regStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</span>
                  <span>التحقق OTP</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-800" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>مسح السجل</span>
                </div>
              </div>

              {/* Step 1: Account Form */}
              {regStep === 1 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        الاسم الكامل للمفوض / المالك *
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="مثال: سلطان بن عبدالعزيز المقرن"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        رقم الهوية الوطنية / الإقامة
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={regNationalId}
                        onChange={(e) => setRegNationalId(e.target.value.replace(/\D/g, ''))}
                        placeholder="10xxxxxxxx (10 أرقام)"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        البريد الإلكتروني للعمل *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@company.sa"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        رقم الجوال السعودي *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="05xxxxxxxx"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 text-right font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        كلمة المرور *
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="8 خانات على الأقل"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        تأكيد كلمة المرور *
                      </label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور"
                        className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 p-3.5 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regAgreeTerms}
                        onChange={(e) => setRegAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <span className="leading-relaxed">
                        أوافق على <span className="text-emerald-400 font-bold">شروط وأحكام منصة سبّاق</span> وسياسة معالجة بيانات الامتثال والتكامل مع الأنظمة الحكومية وفق معايير الهيئة الوطنية للأمن السيبراني.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('login')}
                      className="text-xs text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      لدي حساب بالفعل
                    </button>

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري التسجيل...</span>
                        </>
                      ) : (
                        <>
                          <span>المتابعة إلى التحقق</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {regStep === 2 && (
                <div className="max-w-md mx-auto space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white font-['Cairo']">
                      أدخل رمز التحقق (OTP)
                    </h3>
                    <p className="text-xs text-slate-400">
                      تم إرسال رمز التحقق المكون من 4 أرقام إلى جوالك <span className="text-emerald-400 font-mono font-bold">{regPhone}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 dir-ltr">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => {
                          const newVals = [...otpValues];
                          newVals[idx] = e.target.value.replace(/\D/g, '');
                          setOtpValues(newVals);
                        }}
                        className="w-12 h-14 bg-slate-900 text-white text-xl font-bold font-mono text-center rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    ))}
                  </div>

                  <div className="text-xs text-slate-400">
                    {otpTimer > 0 ? (
                      <span>إعادة إرسال الرمز خلال <strong className="text-emerald-400 font-mono">{otpTimer}</strong> ثانية</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(60);
                          showToast('تم إعادة إرسال رمز التحقق.');
                        }}
                        className="text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        إعادة إرسال الرمز الآن
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      تعديل البيانات
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>تأكيد الرمز وبدء رفع السجل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: ONBOARDING WIZARD (ارفع سجلك التجاري + مسح ضوئي + إكمال الملف) */}
          {/* ============================================================ */}
          {activeMainTab === 'onboarding' && (
            <div className="bg-slate-950/95 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-10 space-y-8 animate-fade-in backdrop-blur-xl">
              
              {/* Wizard Steps Header */}
              <div className="border-b border-slate-800/80 pb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>إعداد المنشأة بالذكاء الاصطناعي</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                      {onboardingStep === 1 && 'الخطوة 1: ارفع سجلك التجاري'}
                      {onboardingStep === 2 && 'الخطوة 2: جاري المسح الضوئي الذكي (AI OCR)...'}
                      {onboardingStep === 3 && 'الخطوة 3: تسجيل وتأكيد المعلومات المستخرجة'}
                      {onboardingStep === 4 && 'الخطوة 4: إكمال الملف التعريفي والتراخيص'}
                      {onboardingStep === 5 && 'الخطوة 5: تم توثيق المنشأة بنجاح!'}
                    </h2>
                  </div>

                  {/* Step indicators */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className={`h-2 rounded-full transition-all ${
                          s === onboardingStep
                            ? 'w-8 bg-emerald-500'
                            : s < onboardingStep
                            ? 'w-4 bg-emerald-600/60'
                            : 'w-2 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING STEP 1: UPLOAD / SELECT COMMERCIAL REGISTRATION */}
              {/* ------------------------------------------------------------ */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-white block font-bold">لماذا نحتاج السجل التجاري؟</strong>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        يقوم محرك سبّاق بقراءة السجل التجاري المعتمد من وزارة التجارة لاستخراج رقم 700، الأنشطة المعتمدة، تاريخ الصلاحية، والشكل القانوني تلقائياً وبدقة 100% دون الحاجة للإدخال اليدوي.
                      </p>
                    </div>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-900/40 hover:bg-slate-900/80 rounded-3xl p-8 text-center transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleCustomFileInput}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-3 max-w-sm mx-auto pointer-events-none">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white font-['Cairo']">
                          اسحب وأفلت وثيقة السجل التجاري هنا
                        </h4>
                        <p className="text-xs text-slate-400 pt-1">
                          أو انقر لاختيار ملف من جهازك (PDF، JPG، PNG بحد أقصى 15 ميجابايت)
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                        <Zap className="w-3 h-3" />
                        <span>يدعم الاستخراج الفوري عبر الذكاء الاصطناعي</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample CRs for Instant One-Click Testing */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>أو جرّب فوراً بسجل تجاري نموذجي معتمد:</span>
                      </span>
                      <span className="text-[11px] text-slate-500">اختر من النماذج التالية للبدء فوراً</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SAMPLE_CRS.map(sample => (
                        <div
                          key={sample.id}
                          onClick={() => handleStartOcrScan(sample)}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 p-4 rounded-2xl transition-all cursor-pointer space-y-2 group relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                              {sample.tag}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {sample.crNumber}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                            {sample.name}
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                            <span>{sample.city}</span>
                            <span className="text-emerald-400 font-bold group-hover:translate-x-[-4px] transition-transform flex items-center gap-1 text-[10px]">
                              <span>مسح واختبار</span>
                              <ChevronLeft className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING STEP 2: AI OCR SCANNING ANIMATION */}
              {/* ------------------------------------------------------------ */}
              {onboardingStep === 2 && (
                <div className="py-6 space-y-8 max-w-xl mx-auto text-center">
                  
                  {/* Holographic Document Scanner Canvas */}
                  <div className="relative w-full max-w-sm mx-auto h-64 bg-slate-900 rounded-3xl border-2 border-emerald-500/60 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
                    
                    {/* Glowing Laser Scan Bar */}
                    <div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse pointer-events-none transition-all duration-300"
                      style={{ top: `${ocrProgress}%` }}
                    />

                    {/* Watermark Document Header */}
                    <div className="flex items-center justify-between text-slate-500 text-[10px] border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>وزارة التجارة - المملكة العربية السعودية</span>
                      </div>
                      <span className="font-mono">سجل تجاري رقم {crData.crNumber}</span>
                    </div>

                    {/* Abstract scanned text skeleton */}
                    <div className="space-y-2 text-right opacity-70">
                      <div className="h-3 bg-emerald-500/20 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-700 rounded w-full" />
                      <div className="h-2.5 bg-slate-700 rounded w-5/6" />
                      <div className="h-2.5 bg-slate-700 rounded w-2/3" />
                    </div>

                    {/* Bottom Status */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">حالة المسح الذكي:</span>
                      <span className="text-emerald-400 font-bold font-mono">{ocrProgress}% مكتمل</span>
                    </div>
                  </div>

                  {/* Processing Status Text & Checklist */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white font-['Cairo'] flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                        <span>جاري استخراج الحقول الرسمية ومطابقة الأنظمة...</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        يقوم نموذج الذكاء الاصطناعي بتحليل الرموز وقراءة الأنشطة والشكل القانوني
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-right text-xs">
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.qrCode ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.qrCode ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">الباركود والختم</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.crNumber ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.crNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">رقم السجل التجاري</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.unified700 ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.unified700 ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">الرقم الموحد 700</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.legalForm ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.legalForm ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">الكيان القانوني</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.activities ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.activities ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">الأنشطة ISIC</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${ocrChecklist.validity ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${ocrChecklist.validity ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold">الصلاحية والتاريخ</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING STEP 3: CONFIRM & VERIFY EXTRACTED INFORMATION */}
              {/* ------------------------------------------------------------ */}
              {onboardingStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Verified Header Banner */}
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-white font-['Cairo']">
                            تم استخراج بيانات السجل التجاري بنجاح
                          </h3>
                          <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                            تطابق 100%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          يمكنك مراجعة وتعديل أي بيان قبل الانتقال لإكمال الملف التعريفي
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      إعادة المسح أو استبدال الملف
                    </button>
                  </div>

                  {/* Extracted Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الاسم التجاري للمنشأة *
                      </label>
                      <input
                        type="text"
                        value={crData.establishmentName}
                        onChange={(e) => setCrData({ ...crData, establishmentName: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        رقم السجل التجاري (CR Number) *
                      </label>
                      <input
                        type="text"
                        value={crData.crNumber}
                        onChange={(e) => setCrData({ ...crData, crNumber: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الرقم الوطني الموحد (700) *
                      </label>
                      <input
                        type="text"
                        value={crData.unified700}
                        onChange={(e) => setCrData({ ...crData, unified700: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الكيان والشكل القانوني
                      </label>
                      <input
                        type="text"
                        value={crData.legalForm}
                        onChange={(e) => setCrData({ ...crData, legalForm: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        المدينة والمقر الرئيسي
                      </label>
                      <input
                        type="text"
                        value={crData.city}
                        onChange={(e) => setCrData({ ...crData, city: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الحي والموقع
                      </label>
                      <input
                        type="text"
                        value={crData.district}
                        onChange={(e) => setCrData({ ...crData, district: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        تاريخ الإصدار
                      </label>
                      <input
                        type="date"
                        value={crData.issueDate}
                        onChange={(e) => setCrData({ ...crData, issueDate: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        تاريخ انتهاء السجل التجاري *
                      </label>
                      <input
                        type="date"
                        value={crData.expiryDate}
                        onChange={(e) => setCrData({ ...crData, expiryDate: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الأنشطة التجارية المعتمدة في السجل
                      </label>
                      <textarea
                        rows={2}
                        value={crData.activity}
                        onChange={(e) => setCrData({ ...crData, activity: e.target.value })}
                        className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      السابق
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnboardingStep(4)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>تأكيد والانتقال لإكمال الملف التعريفي</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING STEP 4: COMPLETE ESTABLISHMENT PROFILE */}
              {/* ------------------------------------------------------------ */}
              {onboardingStep === 4 && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white font-['Cairo'] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>إكمال الملف التعريفي وتفاصيل التشغيل</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      بيانات القوى العاملة، العنوان الوطني، وربط التراخيص الأساسية
                    </p>
                  </div>

                  {/* Section 1: Workforce & Saudization */}
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                          القوى العاملة ونسبة التوطين (نطاقات)
                        </h4>
                      </div>
                      
                      <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                        نسبة التوطين: {profileTotalEmployees > 0 ? ((profileSaudiEmployees / profileTotalEmployees) * 100).toFixed(1) : 0}% (نطاق أخضر مرتفع)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          إجمالي عدد الموظفين *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={profileTotalEmployees}
                          onChange={(e) => setProfileTotalEmployees(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          عدد الموظفين السعوديين *
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={profileTotalEmployees}
                          value={profileSaudiEmployees}
                          onChange={(e) => setProfileSaudiEmployees(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          عدد الفروع التشغيلية *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={profileBranchesCount}
                          onChange={(e) => setProfileBranchesCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: National Address */}
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                        العنوان الوطني المعتمد (SPL)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          العنوان الوطني الكامل *
                        </label>
                        <input
                          type="text"
                          value={profileNationalAddress}
                          onChange={(e) => setProfileNationalAddress(e.target.value)}
                          placeholder="الرياض - حي العليا - شارع التحلية"
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          الرمز البريدي
                        </label>
                        <input
                          type="text"
                          value={profilePostalCode}
                          onChange={(e) => setProfilePostalCode(e.target.value)}
                          placeholder="12214"
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Initial Licenses to Connect */}
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                          التراخيص والشهادات الحكومية المرتبطة
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">حدد التراخيص المتوفرة حالياً</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      <label className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLicenses.balady}
                            onChange={(e) => setSelectedLicenses({ ...selectedLicenses, balady: e.target.checked })}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">رخصة بلدي التجارية</span>
                            <span className="text-[10px] text-slate-400">وزارة البلديات والإسكان</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                          إلزامية
                        </span>
                      </label>

                      <label className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLicenses.salama}
                            onChange={(e) => setSelectedLicenses({ ...selectedLicenses, salama: e.target.checked })}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">تصريح سلامة الدفاع المدني</span>
                            <span className="text-[10px] text-slate-400">المديرية العامة للدفاع المدني</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                          إلزامية
                        </span>
                      </label>

                      <label className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLicenses.zatca}
                            onChange={(e) => setSelectedLicenses({ ...selectedLicenses, zatca: e.target.checked })}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">شهادة الزكاة وضريبة القيمة المضافة</span>
                            <span className="text-[10px] text-slate-400">هيئة الزكاة والضريبة والجمارك (ZATCA)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                          ضريبية
                        </span>
                      </label>

                      <label className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLicenses.gosi}
                            onChange={(e) => setSelectedLicenses({ ...selectedLicenses, gosi: e.target.checked })}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">شهادة التأمينات الاجتماعية</span>
                            <span className="text-[10px] text-slate-400">المؤسسة العامة للتأمينات الاجتماعية (GOSI)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                          تأمينية
                        </span>
                      </label>

                    </div>
                  </div>

                  {/* Section 4: Contact & Compliance Officer */}
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                        مسؤول الامتثال والتواصل
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          اسم المسؤول *
                        </label>
                        <input
                          type="text"
                          value={profileComplianceOfficer || crData.authorizedPerson}
                          onChange={(e) => setProfileComplianceOfficer(e.target.value)}
                          placeholder="الاسم الكامل"
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          رقم جوال الإشعارات *
                        </label>
                        <input
                          type="tel"
                          value={profileContactPhone}
                          onChange={(e) => setProfileContactPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold font-mono rounded-xl border border-slate-800 p-3 text-right focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          البريد الإلكتروني للتقارير *
                        </label>
                        <input
                          type="email"
                          value={profileContactEmail}
                          onChange={(e) => setProfileContactEmail(e.target.value)}
                          placeholder="compliance@company.sa"
                          className="w-full bg-slate-950 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-800 p-3 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      السابق
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnboardingStep(5)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>حفظ وإطلاق المنشأة في النظام</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING STEP 5: CELEBRATION & LAUNCH DASHBOARD */}
              {/* ------------------------------------------------------------ */}
              {onboardingStep === 5 && (
                <div className="py-6 space-y-8 max-w-xl mx-auto text-center animate-fade-in">
                  
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                    <Award className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>تم توثيق المنشأة وتفعيل التنبيهات الاستباقية</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                      أهلاً بك في منصة سبّاق للامتثال
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      تم إنشاء ملف منشأة <strong className="text-white">«{crData.establishmentName}»</strong> بنجاح وحساب مؤشر الامتثال ومصفوفة المخاطر اللحظية.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-xl font-black text-emerald-400 font-mono">94%</span>
                      <span className="text-[11px] text-slate-400 block font-bold">مؤشر الامتثال الأولي</span>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-xl font-black text-indigo-400 font-mono">0 ر.س</span>
                      <span className="text-[11px] text-slate-400 block font-bold">مخالفات متوقعة</span>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {Object.values(selectedLicenses).filter(Boolean).length + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-bold">تراخيص موثقة</span>
                    </div>
                  </div>

                  {/* Launch Action Button */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleFinalizeEstablishment}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base py-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>الانتقال إلى لوحة التحكم الرئيسية</span>
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalizeEstablishment}
                      className="text-xs text-slate-400 hover:text-emerald-400 font-bold transition-colors cursor-pointer"
                    >
                      أو الدخول مباشرة لـ «محاكي المخاطر والمستندات»
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Footer Info */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-slate-500 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منصة سبّاق للامتثال المؤسسي © {new Date().getFullYear()} — متوافق مع لوائح وزارة التجارة والبلديات</span>
          <span className="text-[11px] text-emerald-400 font-bold">تشفير وأمان معتمد 256-bit SSL</span>
        </div>
      </footer>

    </div>
  );
};
