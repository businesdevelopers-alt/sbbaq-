import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  FileCheck2, 
  ShieldCheck, 
  PlusCircle, 
  RotateCw, 
  FileText, 
  Clock, 
  ShoppingCart, 
  Check, 
  Sparkles,
  Info,
  ChevronDown,
  Tag
} from 'lucide-react';
import { ServiceCatalogItem } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface ServiceCatalogProps {
  services: ServiceCatalogItem[];
  onAddToCart: (service: ServiceCatalogItem) => void;
  cartItemIds: string[];
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  onAddToCart,
  cartItemIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceCatalogItem | null>(null);

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

  const filteredServices = services.filter((service) => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesType = selectedType === 'all' || service.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-1.5 border border-emerald-100">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>محرك الخدمات والتراخيص الحكومية</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Cairo']">
            دليل الخدمات والتراخيص الحكومية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            استعرض التراخيص والخدمات المعتمدة وأضف ما تحتاجه لسلة طلبات واحدة لتنفيذها ومتابعتها باحترافية
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث عن ترخيص، جهة، أو خدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const isInCart = cartItemIds.includes(service.id);
          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/80 transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Authority & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {service.authority}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    service.type === 'issuance' 
                      ? 'bg-blue-50 text-blue-700' 
                      : service.type === 'renewal' 
                      ? 'bg-amber-50 text-amber-800' 
                      : service.type === 'objection'
                      ? 'bg-rose-50 text-rose-800'
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {service.type === 'issuance' ? 'إصدار جديد' : service.type === 'renewal' ? 'تجديد ترخيص' : service.type === 'objection' ? 'اعتراض وتصحيح' : 'استشارة'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base font-['Cairo'] mb-2 group-hover:text-emerald-700 transition-colors">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Requirements Peek */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المستندات المطلوبة للخدمة:</span>
                  </div>
                  <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                    {service.requiredDocuments.slice(0, 2).map((doc, idx) => (
                      <li key={idx} className="truncate">{doc}</li>
                    ))}
                    {service.requiredDocuments.length > 2 && (
                      <li className="text-emerald-700 font-semibold list-none">
                        + {service.requiredDocuments.length - 2} مستندات إضافية
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>الرسوم الحكومية التقديرية:</span>
                    <strong className="text-slate-900">{formatSAR(service.govFeeEstimated)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم تنفيذ سبّاق:</span>
                    <strong className="text-emerald-700">{formatSAR(service.sabbaqFee)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>مدة الإنجاز المتوقعة:</span>
                    <span>{service.estimatedDays}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedServiceForModal(service)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                  التفاصيل
                </button>

                <button
                  onClick={() => onAddToCart(service)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                    isInCart
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تمت الإضافة للسلة</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إضافة إلى الطلب</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  كود الخدمة: {selectedServiceForModal.code}
                </span>
                <button
                  onClick={() => setSelectedServiceForModal(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-['Cairo']">
                {selectedServiceForModal.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                الجهة المنظمة: {selectedServiceForModal.authority}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">وصف وإجراءات الخدمة:</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedServiceForModal.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">المستندات والمتطلبات الإلزامية:</h4>
                <ul className="space-y-1.5">
                  {selectedServiceForModal.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">الرسوم الحكومية التقديرية:</span>
                  <strong className="text-slate-900 font-bold">{formatSAR(selectedServiceForModal.govFeeEstimated)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">رسوم تنفيذ سبّاق:</span>
                  <strong className="text-emerald-700 font-bold">{formatSAR(selectedServiceForModal.sabbaqFee)}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>ضريبة القيمة المضافة 15%:</span>
                  <span>{formatSAR(selectedServiceForModal.vatAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>إجمالي التكلفة المتوقعة:</span>
                  <span className="text-emerald-700">{formatSAR(selectedServiceForModal.totalEstimated)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedServiceForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  onAddToCart(selectedServiceForModal);
                  setSelectedServiceForModal(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                إضافة للطلب والمتابعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
