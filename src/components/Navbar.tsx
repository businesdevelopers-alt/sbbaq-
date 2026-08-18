import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Bell, 
  UserCheck, 
  ArrowLeftRight,
  PlusCircle,
  HelpCircle,
  Calculator,
  FileCheck2
} from 'lucide-react';
import { Establishment, UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeEstablishment: Establishment;
  establishments: Establishment[];
  onSelectEstablishment: (est: Establishment) => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenGoalSelector: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  urgentAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeEstablishment,
  establishments,
  onSelectEstablishment,
  cartItemsCount,
  onOpenCart,
  onOpenAI,
  onOpenGoalSelector,
  activeTab,
  setActiveTab,
  urgentAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner / Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            المنصة الوطنية للامتثال والتراخيص الحكومية
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">
            الربط الاستباقي مع: وزارة التجارة • بلدي • سلامة • قوى • مقيم • الزكاة ZATCA
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Goal Launcher */}
          <button
            onClick={onOpenGoalSelector}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium transition-colors bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ماذا تريد أن تنجز اليوم؟</span>
          </button>

          {/* Role Toggle */}
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => setCurrentRole('client')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                currentRole === 'client'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              بوابة المنشأة
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إدارة سبّاق
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-right focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight font-['Cairo']">
                    سبّـاق
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    الامتثال
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block -mt-0.5">
                  إدارة التراخيص والرصد الوقائي
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links for Client */}
          {currentRole === 'client' ? (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                الرئيسية
              </button>

              <button
                onClick={() => setActiveTab('risk_center')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'risk_center'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>مؤشر المخاطر والامتثال</span>
                {urgentAlertsCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {urgentAlertsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('licenses')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'licenses'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                مراقبة التراخيص
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === 'calculator'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>حاسبة الرسوم</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'services'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                دليل الخدمات
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                متابعة الطلبات
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                الملف الرقمي الموحد
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'rules'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                سجل القواعد
              </button>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                لوحة عمليات وتحكم إدارة سبّاق (Admin Center)
              </span>
            </nav>
          )}

          {/* Action Tools & Establishment Selector */}
          <div className="flex items-center gap-2.5">
            {/* Active Establishment Selector */}
            {currentRole === 'client' && (
              <div className="relative group">
                <select
                  value={activeEstablishment.id}
                  onChange={(e) => {
                    const found = establishments.find(es => es.id === e.target.value);
                    if (found) onSelectEstablishment(found);
                  }}
                  className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 pr-8 pl-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} ({est.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xs transition-all hover:scale-[1.02]"
              title="المساعد الذكي: اسأل سبّاق"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">اسأل سبّاق الذكي</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="سلة الطلبات"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-t border-slate-100 overflow-x-auto bg-slate-50/50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('risk_center')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'risk_center' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          المخاطر والامتثال
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'licenses' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          مراقبة التراخيص
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'calculator' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          حاسبة الرسوم
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'services' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          دليل الخدمات
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          الطلبات
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-600'
          }`}
        >
          الملف الموحد
        </button>
      </div>
    </header>
  );
};
