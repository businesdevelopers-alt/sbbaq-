import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ComplianceRule } from '../types';

interface ComplianceRulesRegistryProps {
  rules: ComplianceRule[];
}

export const ComplianceRulesRegistry: React.FC<ComplianceRulesRegistryProps> = ({ rules }) => {
  const [search, setSearch] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');

  const authorities = ['all', 'وزارة البلديات والإسكان', 'الدفاع المدني (سلامة)', 'وزارة التجارة', 'وزارة الموارد البشرية (قوى)'];

  const filteredRules = rules.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.activityCategory.toLowerCase().includes(search.toLowerCase());
    const matchAuth = selectedAuthority === 'all' || r.authority === selectedAuthority;
    return matchSearch && matchAuth;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5 border border-emerald-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>سجل وقواعد الامتثال الحكومي الرسمي</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            قواعد واشتراطات الامتثال التنظيمي في المملكة
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            الدليل الشامل للالتزامات والتراخيص وتفادي الغرامات حسب كل نشاط وجهة حكومية
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث في القواعد والاشتراطات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {authorities.map((auth) => (
          <button
            key={auth}
            onClick={() => setSelectedAuthority(auth)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedAuthority === auth
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {auth === 'all' ? 'جميع الجهات التنظيمية' : auth}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all shadow-xs space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {rule.authority}
              </span>
              <div className="flex items-center gap-1.5">
                {rule.penaltyRule && (
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    غرامة أساسية: {rule.penaltyRule.baseFine.toLocaleString()} ر.س
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  +{rule.riskPoints} نقطة
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Cairo']">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {rule.description}
              </p>
            </div>

            {/* Financial Penalty Predefined Configuration */}
            {rule.penaltyRule && (
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
                  <span>💰 قاعدة الجزاء المالي التلقائي:</span>
                  <span>سقف أقصى: {rule.penaltyRule.maxFineCap?.toLocaleString() || 'غير محدد'} ر.س</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-rose-100">
                  <div>
                    <span className="text-slate-500 block text-[10px]">الغرامة الأساسية:</span>
                    <strong className="text-slate-900">{rule.penaltyRule.baseFine.toLocaleString()} ر.س</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">غرامة التأخير اليومية:</span>
                    <strong className="text-slate-900">{rule.penaltyRule.dailyFineRate.toLocaleString()} ر.س / يوم</strong>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 leading-normal">
                  <strong>السند:</strong> {rule.penaltyRule.legalCitation}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <div>
                <span className="text-slate-500 text-[11px] block">الأثر على المنشأة والمخالفة:</span>
                <strong className="text-rose-700">{rule.riskReason}</strong>
              </div>
              <div className="pt-1 border-t border-slate-200/60 flex justify-between text-[11px]">
                <span className="text-slate-500">النشاط المستهدف:</span>
                <span className="text-slate-700 font-medium">{rule.activityCategory}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
