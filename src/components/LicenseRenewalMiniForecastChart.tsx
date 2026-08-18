import React, { useState } from 'react';
import { TrendingUp, Coins, Calendar, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { formatSAR } from '../utils/complianceEngine';

interface LicenseRenewalMiniForecastChartProps {
  baseGovFee: number;
  expiryDate?: string;
  category?: string;
  title?: string;
  authority?: string;
  themeColor?: 'red' | 'amber' | 'blue' | 'emerald';
}

export const LicenseRenewalMiniForecastChart: React.FC<LicenseRenewalMiniForecastChartProps> = ({
  baseGovFee,
  expiryDate,
  category,
  title = '',
  authority = '',
  themeColor = 'indigo'
}) => {
  const [hoveredYearIndex, setHoveredYearIndex] = useState<number | null>(null);

  // Determine starting fiscal year from expiry date
  let startYear = 2026;
  if (expiryDate) {
    const parsedYear = new Date(expiryDate).getFullYear();
    if (!isNaN(parsedYear) && parsedYear >= 2024 && parsedYear <= 2040) {
      startYear = parsedYear;
    }
  }

  // Exact government fee resolution from complianceData
  // If baseGovFee is provided, use it. If 0 (e.g. VAT certificate which is free gov fee), handle appropriately.
  let validBaseFee = typeof baseGovFee === 'number' ? baseGovFee : 1200;
  if (validBaseFee === 0 && (title.includes('ضريب') || authority.includes('الزكاة') || title.includes('ZATCA'))) {
    validBaseFee = 0;
  } else if (validBaseFee === 0) {
    validBaseFee = 500;
  }

  // Generate 3 upcoming fiscal years forecast data based on standard Saudi Government licensing fee cycles
  const forecastData = [
    {
      year: startYear,
      yearLabel: `${startYear}م`,
      subLabel: 'السنة المالية 1',
      govFee: validBaseFee,
      total: validBaseFee,
      isCurrentCycle: true
    },
    {
      year: startYear + 1,
      yearLabel: `${startYear + 1}م`,
      subLabel: 'السنة المالية 2',
      govFee: validBaseFee,
      total: validBaseFee,
      isCurrentCycle: false
    },
    {
      year: startYear + 2,
      yearLabel: `${startYear + 2}م`,
      subLabel: 'السنة المالية 3',
      govFee: validBaseFee,
      total: validBaseFee,
      isCurrentCycle: false
    }
  ];

  const total3Years = forecastData.reduce((acc, item) => acc + item.total, 0);
  const maxVal = Math.max(...forecastData.map(d => d.total), 1);

  // Color mappings matching alert card urgency level
  const colorMap = {
    red: {
      bar: 'from-rose-500 to-red-600',
      activeBar: 'from-rose-600 to-red-700',
      text: 'text-rose-700',
      bg: 'bg-red-50/70',
      border: 'border-red-100',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      tag: 'bg-rose-100/70 text-rose-900',
      indicator: 'bg-rose-500'
    },
    amber: {
      bar: 'from-amber-500 to-orange-500',
      activeBar: 'from-amber-600 to-orange-600',
      text: 'text-amber-700',
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
      tag: 'bg-amber-100/70 text-amber-900',
      indicator: 'bg-amber-500'
    },
    blue: {
      bar: 'from-blue-500 to-indigo-600',
      activeBar: 'from-blue-600 to-indigo-700',
      text: 'text-blue-700',
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      badge: 'bg-blue-50 text-blue-900 border-blue-200',
      tag: 'bg-blue-100/70 text-blue-900',
      indicator: 'bg-blue-500'
    },
    emerald: {
      bar: 'from-emerald-500 to-teal-600',
      activeBar: 'from-emerald-600 to-teal-700',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      tag: 'bg-emerald-100/70 text-emerald-900',
      indicator: 'bg-emerald-500'
    },
    indigo: {
      bar: 'from-indigo-500 to-blue-600',
      activeBar: 'from-indigo-600 to-blue-700',
      text: 'text-indigo-700',
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      tag: 'bg-indigo-100/70 text-indigo-900',
      indicator: 'bg-indigo-500'
    }
  };

  const currentTheme = colorMap[themeColor as keyof typeof colorMap] || colorMap.indigo;

  return (
    <div className="bg-slate-50/95 rounded-xl p-2.5 border border-slate-200/90 space-y-2 select-none">
      
      {/* Header with Title & Total 3-Year Sum */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>توقعات الرسوم الحكومية (3 سنوات):</span>
        </div>
        <span className="font-mono text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 shadow-2xs">
          إجمالي: {formatSAR(total3Years)}
        </span>
      </div>

      {/* Mini Chart Graphic: 3 Comparative Fiscal Year Columns */}
      <div className="relative pt-1.5 pb-0.5">
        
        {/* Background Grid Guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
        </div>

        <div className="grid grid-cols-3 gap-2 items-end relative z-10">
          {forecastData.map((item, idx) => {
            const heightPercent = validBaseFee === 0 
              ? 25 
              : Math.max(Math.round((item.total / maxVal) * 100), 38);
            const isHovered = hoveredYearIndex === idx;

            return (
              <div 
                key={item.year}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                onMouseEnter={() => setHoveredYearIndex(idx)}
                onMouseLeave={() => setHoveredYearIndex(null)}
              >
                {/* Cost Label Tag on top of the bar */}
                <span className={`text-[9.5px] font-mono font-bold transition-colors ${
                  isHovered ? currentTheme.text : 'text-slate-600'
                }`}>
                  {validBaseFee === 0 ? 'مجاناً' : `${formatSAR(item.total).replace('ر.س', '').trim()} `}
                  {validBaseFee > 0 && <span className="text-[8.5px] font-normal text-slate-400">ر.س</span>}
                </span>

                {/* Vertical Bar */}
                <div className="w-full bg-slate-200/70 h-10 rounded-lg flex items-end p-0.5 overflow-hidden transition-all duration-200">
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-md bg-gradient-to-t transition-all duration-300 shadow-2xs ${
                      isHovered ? currentTheme.activeBar : currentTheme.bar
                    }`}
                  />
                </div>

                {/* Year Label Under the bar */}
                <div className="text-center">
                  <span className={`text-[10px] font-mono font-bold block leading-none transition-colors ${
                    isHovered ? 'text-slate-900 underline font-black' : 'text-slate-600'
                  }`}>
                    {item.yearLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Tooltip Info Banner on Hover */}
      {hoveredYearIndex !== null && (
        <div className="p-1.5 rounded-lg bg-slate-800 text-white text-[10px] flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentTheme.indicator}`}></span>
            <span className="font-bold">{forecastData[hoveredYearIndex].yearLabel} ({forecastData[hoveredYearIndex].subLabel})</span>
          </div>
          <div className="font-mono font-bold text-amber-300">
            {validBaseFee === 0 ? 'معفاة من الرسوم (0 ر.س)' : formatSAR(forecastData[hoveredYearIndex].total)}
          </div>
        </div>
      )}

    </div>
  );
};
