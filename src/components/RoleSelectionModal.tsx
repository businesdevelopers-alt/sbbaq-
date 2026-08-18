import React from 'react';
import { ShieldCheck, Building2, Briefcase, Users, ArrowLeft, CheckCircle2, Lock, Store, Truck } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSelectRole: (role: UserRole) => void;
  currentActiveRole: UserRole;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectRole,
  currentActiveRole,
}) => {
  if (!isOpen) return null;

  const availableRoles: { role: UserRole; title: string; subtitle: string; icon: React.ElementType; color: string; badge: string }[] = [
    {
      role: 'customer',
      title: 'بوابة المنشأة والعميل',
      subtitle: `إدارة منشأة ${currentUser.establishmentName}، التراخيص، الفروع والامتثال`,
      icon: Building2,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Portal'
    },
    {
      role: 'supplier',
      title: 'بوابة المورد ومزود حلول الامتثال',
      subtitle: 'استقبال طلبات التوريد، تقديم عروض الأسعار، وتوثيق عقود الصيانة والاعتماد',
      icon: Store,
      color: 'from-violet-600 to-purple-800',
      badge: 'Supplier'
    },
    {
      role: 'admin',
      title: 'إدارة سبّاق المركزية (HQ)',
      subtitle: 'الرقابة المركزية، إدارة العملاء، إسناد المعاملات، الحوكمة والتشريعات',
      icon: ShieldCheck,
      color: 'from-blue-600 to-indigo-800',
      badge: 'Admin'
    },
    {
      role: 'partner_agent',
      title: 'بوابة المعقب والشريك الميداني',
      subtitle: 'استلام المعاملات الحكومية، إنجاز المهام الميدانية واستحقاق العمولات',
      icon: Briefcase,
      color: 'from-amber-600 to-orange-700',
      badge: 'Partner'
    }
  ];

  // Filter roles based on user's authorized roles or allow all in demo/admin mode
  const authorizedRoles = availableRoles.filter(r => 
    currentUser.roles?.includes(r.role) || 
    currentUser.role === r.role ||
    (currentUser.role === 'admin' && (r.role === 'admin' || r.role === 'customer' || r.role === 'supplier' || r.role === 'partner_agent')) ||
    (currentUser.role === 'client' && (r.role === 'customer' || r.role === 'supplier')) ||
    (currentUser.role === 'customer') // allow quick demo switching
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Cairo'] animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-white/10">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold font-['Cairo']">
            تحديد بيئة العمل والصلاحية
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            حسابك <strong className="text-white">{currentUser.name}</strong> يمتلك صلاحيات متعددة. يرجى اختيار لوحة التحكم التي تود الانتقال إليها:
          </p>
        </div>

        {/* Roles List */}
        <div className="p-6 space-y-3">
          {authorizedRoles.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentActiveRole === item.role || (currentActiveRole === 'client' && item.role === 'customer');

            return (
              <button
                key={item.role}
                onClick={() => {
                  onSelectRole(item.role);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-4 cursor-pointer group ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      النشطة حالياً
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-200 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
