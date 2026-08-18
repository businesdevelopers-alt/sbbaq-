import React from 'react';
import {
  Search,
  Sliders,
  Sparkles,
  Upload,
  Calculator,
  Scale,
  Building2,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  Bell,
  Compass,
  FileText,
  Scan,
  PlusCircle,
  Printer,
  Calendar
} from 'lucide-react';
import { Establishment, License, DocumentItem, ComplianceViolation } from '../types';

interface CustomerQuickActionBarProps {
  establishment: Establishment;
  establishments?: Establishment[];
  onSelectEstablishment?: (est: Establishment) => void;
  onOpenCommandPalette: () => void;
  onOpenTour: () => void;
  onOpenAI: () => void;
  onOpenUploadDoc?: () => void;
  onOpenFeeCalculator?: () => void;
  onOpenCROnboarding?: () => void;
  onExportCompliancePdf?: () => void;
  onNavigateToTab: (tab: string) => void;
  urgentAlertsCount?: number;
}

export const CustomerQuickActionBar: React.FC<CustomerQuickActionBarProps> = ({
  establishment,
  establishments = [],
  onSelectEstablishment,
  onOpenCommandPalette,
  onOpenTour,
  onOpenAI,
  onOpenUploadDoc,
  onOpenFeeCalculator,
  onOpenCROnboarding,
  onExportCompliancePdf,
  onNavigateToTab,
  urgentAlertsCount = 0
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 mb-6 flex flex-wrap items-center justify-between gap-3 transition-all">
      
      {/* Right Side (RTL): Search Trigger + Establishment Selector */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
        {/* Global Search Shortcut Button (Ctrl+K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex-1 max-w-sm bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
          title="البحث الشامل في التراخيص والمستندات والأنظمة"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span className="truncate">بحث سريع في التراخيص والوثائق والمخالفات...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Establishment Switcher Dropdown (if multiple) */}
        {establishments.length > 1 && onSelectEstablishment && (
          <div className="relative hidden md:block">
            <select
              value={establishment.id}
              onChange={(e) => {
                const found = establishments.find(est => est.id === e.target.value);
                if (found) onSelectEstablishment(found);
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/80 pr-7 pl-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
            >
              {establishments.map(est => (
                <option key={est.id} value={est.id}>
                  {est.name} ({est.city})
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Left Side (RTL): Fast One-Click Action Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
        
        {/* Compliance Calendar */}
        <button
          type="button"
          onClick={() => onNavigateToTab('calendar')}
          className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200/90 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="التقويم الزمني للامتثال والمواعيد النظامية"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>التقويم الزمني</span>
        </button>

        {/* Risk Simulator */}
        <button
          type="button"
          onClick={() => onNavigateToTab('risk_center')}
          className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/90 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="محاكاة أثر الوثائق والتراخيص على الامتثال"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>محاكي المخاطر</span>
        </button>

        {/* Upload Doc */}
        <button
          type="button"
          onClick={() => {
            if (onOpenUploadDoc) onOpenUploadDoc();
            else onNavigateToTab('company_documents');
          }}
          className="shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="إيداع مستند جديد بالحافظة الرقمية"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-600" />
          <span>إيداع مستند</span>
        </button>

        {/* Fee Calculator */}
        <button
          type="button"
          onClick={() => {
            if (onOpenFeeCalculator) onOpenFeeCalculator();
            else onNavigateToTab('calculator');
          }}
          className="shrink-0 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/90 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="حاسبة الرسوم الحكومية التقديرية"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-600" />
          <span>حاسبة الرسوم</span>
        </button>

        {/* Violations */}
        <button
          type="button"
          onClick={() => onNavigateToTab('violations_analyzer')}
          className="shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200/90 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="فحص المخالفات المرصودة والخطوات التصحيحية"
        >
          <Scale className="w-3.5 h-3.5 text-rose-600" />
          <span>فحص المخالفات</span>
        </button>

        {/* Export Compliance PDF */}
        {onExportCompliancePdf && (
          <button
            type="button"
            onClick={onExportCompliancePdf}
            className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="تصدير تقرير الامتثال والمخاطر الشامل بصيغة PDF"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>تقرير PDF</span>
          </button>
        )}

        {/* Scan & Setup CR */}
        {onOpenCROnboarding && (
          <button
            type="button"
            onClick={onOpenCROnboarding}
            className="shrink-0 bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200/90 text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="مسح سجل تجاري جديد وإعداد المنشأة"
          >
            <Scan className="w-3.5 h-3.5 text-teal-600" />
            <span>مسح سجل تجاري</span>
          </button>
        )}

        {/* Guided Tour */}
        <button
          type="button"
          onClick={onOpenTour}
          className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          title="دليل الاستخدام السريع"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">دليل الاستخدام</span>
        </button>

      </div>

    </div>
  );
};
