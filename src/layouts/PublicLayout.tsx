import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Building2,
  LogIn,
  UserPlus,
  ShoppingCart,
  Menu,
  X,
  Fingerprint,
  ArrowLeft,
  LogOut,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { UserAccount, AuthMode, AuthPortal } from '../types';

interface PublicLayoutProps {
  currentUser?: UserAccount | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: AuthMode, portal?: AuthPortal) => void;
  onLogout?: () => void;
  cartItemsCount?: number;
  onOpenCart?: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentUser,
  currentPath,
  onNavigate,
  onOpenAuth,
  onLogout,
  cartItemsCount = 0,
  onOpenCart,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(path);
  };

  const handleScrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (currentPath !== '/') {
      onNavigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dashboardPath = currentUser?.role === 'admin' ? '/admin' : '/portal';
  const dashboardTitle = currentUser?.role === 'admin' ? 'لوحة إدارة سبّاق (HQ)' : 'لوحة تحكم المنشأة';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Cairo'] selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* 1. TOP PUBLIC ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 text-emerald-200 py-2 px-4 text-xs font-semibold shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
              المنظومة الوطنية
            </span>
            <span className="hidden sm:inline">
              منصة سبّاق الامتثال الموحدة لإصدار وتجديد التراخيص وإدارة الامتثال الحكومي للمنشآت في المملكة.
            </span>
            <span className="sm:hidden">منصة التراخيص والامتثال الموحدة</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!currentUser && (
              <button
                type="button"
                onClick={() => onOpenAuth('nafath')}
                className="text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors text-xs font-bold cursor-pointer"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>دخول نفاذ الموحد</span>
              </button>
            )}
            <span className="text-emerald-700 hidden sm:inline">|</span>
            <span className="text-emerald-400 text-xs hidden sm:inline">الرقم الموحد: 800-124-7722</span>
          </div>
        </div>
      </div>

      {/* 2. PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo: Clicking always takes visitor to public home '/' */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="flex items-center gap-3.5 text-right hover:opacity-90 transition-opacity cursor-pointer group"
            title="سبّاق الامتثال - الصفحة الرئيسية"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Cairo']">
                  سبّاق <span className="text-emerald-400">الامتثال</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 font-extrabold px-2 py-0.5 rounded-full hidden sm:inline">
                  سعودي 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                دليل التراخيص والخدمات والرقابة الاستباقية للمنشآت
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-300">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-emerald-400 font-black' : ''
              }`}
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() => handleNav('/services')}
              className={`hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPath.startsWith('/services') ? 'text-emerald-400 font-black' : ''
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>دليل الخدمات</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-black border border-emerald-500/30">
                /services
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScrollToSection('features')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              كيف تعمل المنصة
            </button>

            <button
              type="button"
              onClick={() => handleScrollToSection('pricing')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              الباقات والأسعار
            </button>

            <button
              type="button"
              onClick={() => handleScrollToSection('faq')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              الأسئلة الشائعة
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Cart Icon Button (if items exist) */}
            {cartItemsCount > 0 && onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-all cursor-pointer"
                title="سلة الخدمات والطلبات"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </button>
            )}

            {/* If LOGGED IN: Replace "Login" with "لوحة التحكم" */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNav(dashboardPath)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Building2 className="w-4 h-4" />
                  <span>لوحة التحكم</span>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* If GUEST: Show Login and Start / Order buttons */
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNav('/login')}
                  className="px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="تسجيل الدخول"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('/services')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>اطلب خدمة</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-2 pt-2 text-sm font-bold">
              <button
                type="button"
                onClick={() => handleNav('/')}
                className={`w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors ${
                  currentPath === '/' ? 'bg-emerald-950/40 text-emerald-400' : 'text-slate-300'
                }`}
              >
                الرئيسية
              </button>

              <button
                type="button"
                onClick={() => handleNav('/services')}
                className={`w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between ${
                  currentPath.startsWith('/services') ? 'bg-emerald-950/40 text-emerald-400' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>دليل الخدمات والتراخيص</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">كتالوج عام</span>
              </button>

              <button
                type="button"
                onClick={() => handleScrollToSection('features')}
                className="w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
              >
                كيف تعمل المنصة
              </button>

              <button
                type="button"
                onClick={() => handleScrollToSection('pricing')}
                className="w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
              >
                الباقات والأسعار
              </button>

              <button
                type="button"
                onClick={() => handleScrollToSection('faq')}
                className="w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
              >
                الأسئلة الشائعة
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => handleNav(dashboardPath)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-center"
                >
                  الانتقال إلى لوحة التحكم
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleNav('/login')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-center border border-slate-700"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('/register')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-center"
                  >
                    إنشاء حساب جديد
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. PUBLIC CONTENT AREA */}
      <main className="flex-1">
        {children}
      </main>

      {/* 4. PUBLIC FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-14 border-t border-slate-800 shrink-0 font-['Cairo']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-black text-lg text-white block">منصة سبّـاق الامتثال</span>
                  <span className="text-[11px] text-emerald-400 font-bold">المنظومة الوطنية الموحدة لتراخيص المنشآت</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                المنصة المتكاملة لحوكمة التراخيص، حساب الرسوم البلدية، فحص العقود، الرصد الوقائي للغرامات، وطلب الخدمات الحكومية المعتمدة لجميع منشآت المملكة.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  متوافق مع مستهدفات رؤية 2030
                </span>
              </div>
            </div>

            {/* Fast Links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">الروابط الرئيسية</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => handleNav('/')} className="hover:text-emerald-400 transition-colors">
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/services')} className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-emerald-400 font-bold">
                    <span>دليل الخدمات والتراخيص</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleScrollToSection('features')} className="hover:text-emerald-400 transition-colors">
                    كيف تعمل المنصة
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleScrollToSection('pricing')} className="hover:text-emerald-400 transition-colors">
                    الباقات والأسعار
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleScrollToSection('faq')} className="hover:text-emerald-400 transition-colors">
                    الأسئلة الشائعة
                  </button>
                </li>
              </ul>
            </div>

            {/* Popular Gov Services */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">أبرز الخدمات الحكومية</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => handleNav('/services/balady-commercial-license')} className="hover:text-emerald-400 transition-colors text-right">
                    إصدار رخصة بلدي تجارية
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/services/salama-safety-permit')} className="hover:text-emerald-400 transition-colors text-right">
                    تصريح سلامة الدفاع المدني
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/services/commercial-register-issuance')} className="hover:text-emerald-400 transition-colors text-right">
                    إصدار وتعديل السجل التجاري
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/services/ejar-commercial-contract')} className="hover:text-emerald-400 transition-colors text-right">
                    توثيق عقد إيجار إلكتروني
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/services/food-health-license')} className="hover:text-emerald-400 transition-colors text-right">
                    الشهادات الصحية والغذاء
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">التواصل والدعم</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>الرقم الموحد: 800-124-7722</span>
                </li>
                <li>البريد: care@sabbaq.sa</li>
                <li>المقر الرئيسي: الرياض، طريق الملك فهد</li>
                <li>أوقات العمل: الأحد - الخميس (8 ص - 6 م)</li>
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleNav('/login')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    دخول المنشآت المصرحة ←
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-right">
            <div>
              جميع الحقوق محفوظة © 2026 منصة سبّاق الامتثال • معتمدة ومتوافقة مع لوائح التجارة، بلدي، الدفاع المدني وقوى.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-emerald-400 cursor-pointer">سياسة الخصوصية</span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer">الشروط والأحكام</span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer">اتفاقية مستوى الخدمة (SLA)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
