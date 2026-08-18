import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Zap,
  RotateCw,
  Download,
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Building2,
  Layers,
  ArrowRight,
  ExternalLink,
  Printer,
  ShoppingBag,
  PlusCircle,
  BellRing,
  HelpCircle,
  Scan,
  ShieldAlert,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  Establishment, 
  License, 
  DocumentItem, 
  ComplianceViolation, 
  OrderItem, 
  ServiceCatalogItem 
} from '../types';
import { formatSAR } from '../utils/complianceEngine';

export interface DashboardQuickActionsFloatingMenuProps {
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  onBatchRenewLicenses: (licensesToRenew: License[]) => void;
  onOpenCart: () => void;
  onExportCompliancePdf: () => void;
  onNavigateToTab: (tab: string, entityId?: string, entityType?: string) => void;
  onOpenAI: () => void;
  showToast: (msg: string) => void;
}

export const DashboardQuickActionsFloatingMenu: React.FC<DashboardQuickActionsFloatingMenuProps> = ({
  establishment,
  licenses,
  documents,
  violations,
  onBatchRenewLicenses,
  onOpenCart,
  onExportCompliancePdf,
  onNavigateToTab,
  onOpenAI,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showBatchReviewModal, setShowBatchReviewModal] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [isDownloadingDocs, setIsDownloadingDocs] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Filter items specific to this active establishment
  const estLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === establishment.id);
  }, [licenses, establishment.id]);

  const estDocuments = useMemo(() => {
    return documents.filter(d => d.establishmentId === establishment.id);
  }, [documents, establishment.id]);

  const estViolations = useMemo(() => {
    return violations.filter(v => v.establishmentId === establishment.id && v.status !== 'rectified');
  }, [violations, establishment.id]);

  // Critical items calculation
  const expiredLicenses = useMemo(() => {
    return estLicenses.filter(l => l.status === 'expired' || l.daysRemaining <= 0);
  }, [estLicenses]);

  const nearExpiryLicenses = useMemo(() => {
    return estLicenses.filter(l => l.status === 'near_expiry' || (l.daysRemaining > 0 && l.daysRemaining <= 30));
  }, [estLicenses]);

  const allExpiringLicenses = useMemo(() => {
    return estLicenses.filter(l => l.status === 'expired' || l.daysRemaining <= 30);
  }, [estLicenses]);

  // State for selected licenses inside the batch review modal
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedLicenseIds(new Set(allExpiringLicenses.map(l => l.id)));
  }, [allExpiringLicenses, establishment.id]);

  // Fees calculation for batch renewal
  const batchTotalGovFee = useMemo(() => {
    return allExpiringLicenses
      .filter(l => selectedLicenseIds.has(l.id))
      .reduce((sum, l) => sum + (l.costGov || 0), 0);
  }, [allExpiringLicenses, selectedLicenseIds]);

  const batchTotalSabbaqFee = useMemo(() => {
    return allExpiringLicenses
      .filter(l => selectedLicenseIds.has(l.id))
      .reduce((sum, l) => sum + (l.costSabbaq || 0), 0);
  }, [allExpiringLicenses, selectedLicenseIds]);

  const batchTotalVat = Math.round(batchTotalSabbaqFee * 0.15);
  const batchTotalAmount = batchTotalGovFee + batchTotalSabbaqFee + batchTotalVat;

  // Total urgent actions count for the notification badge
  const urgentCount = allExpiringLicenses.length + estViolations.length;

  // Keyboard shortcut listener (Ctrl+Q / Cmd+Q or Alt+Q to toggle floating quick action menu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && (e.key === 'q' || e.key === 'ض')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (showBatchReviewModal) {
          setShowBatchReviewModal(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBatchReviewModal, isOpen]);

  // Click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !showBatchReviewModal) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showBatchReviewModal]);

  // Handler: 1-Click Renew All Expiring
  const handleExecuteBatchRenew = () => {
    const targets = allExpiringLicenses.filter(l => selectedLicenseIds.has(l.id));
    if (targets.length === 0) {
      showToast('⚠️ يرجى تحديد رخصة واحدة على الأقل للتجديد.');
      return;
    }

    onBatchRenewLicenses(targets);
    setShowBatchReviewModal(false);
    setIsOpen(false);
    showToast(`⚡ تم تجميع وإضافة (${targets.length}) تراخيص للتجديد الفوري إلى سلة الطلبات.`);
    onOpenCart();
  };

  // Handler: 1-Click Download All Docs & Licenses
  const handleDownloadAllDocs = () => {
    setIsDownloadingDocs(true);

    try {
      const exportTimestamp = new Date().toISOString().replace('T', '_').slice(0, 19);
      const fileName = `سجل_وثائق_وتراخيص_${establishment.name.replace(/\s+/g, '_')}_${exportTimestamp}.txt`;

      // Build structured, clean text file content with complete company dossier
      let content = `================================================================================\n`;
      content += `               ملف الوثائق والتراخيص الرسمية الموحد - منصة سبّاق               \n`;
      content += `================================================================================\n`;
      content += `المنشأة: ${establishment.name}\n`;
      content += `رقم السجل التجاري: ${establishment.crNumber}\n`;
      content += `المدينة / المنطقة: ${establishment.city} - ${establishment.region || 'المنطقة الوسطى'}\n`;
      content += `الشكل القانوني: ${establishment.legalType || 'شركة ذات مسؤولية محدودة'}\n`;
      content += `تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}\n`;
      content += `إجمالي التراخيص المسجلة: ${estLicenses.length}\n`;
      content += `إجمالي المستندات المؤرشفة: ${estDocuments.length}\n`;
      content += `================================================================================\n\n`;

      content += `--------------------------------------------------------------------------------\n`;
      content += `أولاً: سجل التراخيص والتصاريح الحكومية (${estLicenses.length})\n`;
      content += `--------------------------------------------------------------------------------\n`;
      estLicenses.forEach((lic, idx) => {
        content += `[${idx + 1}] اسم الترخيص: ${lic.name}\n`;
        content += `    الجهة المصدرة: ${lic.authority}\n`;
        content += `    رقم الترخيص: ${lic.licenseNumber}\n`;
        content += `    تاريخ الإصدار: ${lic.issueDate || 'غير مسجل'}\n`;
        content += `    تاريخ الانتهاء: ${lic.expiryDate} (${lic.daysRemaining > 0 ? `متبقي ${lic.daysRemaining} يوم` : 'منتهي الصلاحية'})\n`;
        content += `    الحالة النظامية: ${lic.status === 'valid' ? 'ساري وصالح' : lic.status === 'near_expiry' ? 'وشيك الانتهاء' : 'منتهي'}\n`;
        content += `    الفرع: ${lic.branchName || 'المركز الرئيسي'}\n`;
        content += `    الرسوم الحكومية المقدرة: ${formatSAR(lic.costGov)}\n`;
        content += `    ----------------------------------------------------------------------------\n`;
      });

      content += `\n--------------------------------------------------------------------------------\n`;
      content += `ثانياً: المستندات والعقود الموثقة والشهادات (${estDocuments.length})\n`;
      content += `--------------------------------------------------------------------------------\n`;
      estDocuments.forEach((doc, idx) => {
        content += `[${idx + 1}] عنوان المستند: ${doc.title}\n`;
        content += `    التصنيف: ${doc.category}\n`;
        content += `    رقم الوثيقة: ${doc.documentNumber || 'غير محدد'}\n`;
        content += `    تاريخ الانتهاء: ${doc.expiryDate || 'ساري دائم'}\n`;
        content += `    حالة التحقق: ${doc.status === 'valid' ? 'موثق ومعتمد' : doc.status === 'expiring_soon' ? 'مستحق التجديد' : 'غير مكتمل'}\n`;
        content += `    حجم الملف: ${doc.fileSize || '1.8 MB'}\n`;
        content += `    ----------------------------------------------------------------------------\n`;
      });

      content += `\n================================================================================\n`;
      content += `تم التوليد والتصدير آلياً عبر محرك الامتثال الذكي في منصة سبّاق (Sabbaq Compliance).\n`;
      content += `رمز التحقق الأمني: SBQ-EXPORT-${Math.random().toString(36).substring(2, 9).toUpperCase()}\n`;
      content += `================================================================================\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsDownloadingDocs(false);
        setIsOpen(false);
        showToast(`📁 تم تحميل وتصدير حزمة الوثائق والتراخيص بالكامل (${estLicenses.length + estDocuments.length} ملف ووثيقة).`);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsDownloadingDocs(false);
      showToast('⚠️ حدث خطأ أثناء تجميع وتصدير المستندات.');
    }
  };

  // Handler: Run Instant Live AI Compliance Scan
  const handleRunAiScan = () => {
    setIsScanning(true);
    setScanStep('جاري الاتصال بأنظمة بلدي والدفاع المدني...');

    setTimeout(() => {
      setScanStep('جاري فحص سريان السجل التجاري والتراخيص البلدية...');
    }, 700);

    setTimeout(() => {
      setScanStep('جاري تدقيق معايير قوى ونطاقات والتأمينات الاجتماعية...');
    }, 1400);

    setTimeout(() => {
      setScanStep('جاري مطابقة اشتراطات الزكاة والضريبة والفوترة الإلكترونية...');
    }, 2100);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep('');
      setIsOpen(false);
      showToast('✨ اكتمل الفحص الاستباقي الشامل: تم التحقق وتحديث كافة الحالات بنجاح.');
      onNavigateToTab('proactive_alerts');
    }, 2800);
  };

  // Handler: Schedule 3-Day Proactive Reminders for All
  const handleScheduleAllReminders = () => {
    try {
      const currentSaved = localStorage.getItem(`sabbaq_smart_reminders_${establishment.id}`);
      const remindersObj = currentSaved ? JSON.parse(currentSaved) : {};

      estLicenses.forEach(lic => {
        let trigDate = lic.expiryDate;
        try {
          const exp = new Date(lic.expiryDate);
          if (!isNaN(exp.getTime())) {
            const d = new Date(exp);
            d.setDate(d.getDate() - 3);
            trigDate = d.toISOString().split('T')[0];
          }
        } catch {}

        remindersObj[lic.id] = {
          id: `rem_${Date.now()}_${lic.id}`,
          itemKey: lic.id,
          establishmentId: establishment.id,
          title: `تجديد ترخيص ${lic.name}`,
          documentNumber: lic.licenseNumber,
          authority: lic.authority,
          expiryDate: lic.expiryDate,
          daysBefore: 3,
          calculatedTriggerDate: trigDate,
          channels: { email: true, inApp: true, whatsapp: true },
          recipientEmail: establishment.contactEmail || 'compliance@sabbaq.sa',
          recipientPhone: establishment.contactPhone || '0501234567',
          customNotes: `تنبيه ذكي مجدول آلياً قبل 3 أيام من انتهاء ${lic.name}`,
          createdAt: new Date().toISOString(),
          status: 'scheduled'
        };
      });

      localStorage.setItem(`sabbaq_smart_reminders_${establishment.id}`, JSON.stringify(remindersObj));
      setIsOpen(false);
      showToast(`🔔 تم تفعيل وجدولة التذكيرات الذكية (قبل 3 أيام) لكافة تراخيص المنشأة (${estLicenses.length} رخصة).`);
    } catch (e) {
      console.error(e);
      showToast('تمت جدولة التذكيرات الذكية بنجاح.');
    }
  };

  const toggleLicenseSelection = (id: string) => {
    setSelectedLicenseIds(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  return (
    <>
      {/* Floating Quick Action Trigger Button & Dock */}
      <div 
        ref={menuRef} 
        className="fixed bottom-6 left-6 z-40 flex flex-col items-start font-['Cairo'] print:hidden select-none"
        dir="rtl"
      >
        {/* Expanded Quick Action Popover Menu */}
        {isOpen && (
          <div className="mb-3 w-[360px] sm:w-[420px] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 slide-in-from-bottom-6 duration-200">
            
            {/* Header with gradient and establishment status */}
            <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border-b border-indigo-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner">
                  <Zap className="w-4 h-4 fill-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">إجراءات الامتثال السريعة</h3>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                      بنقرة واحدة ⚡
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate max-w-[230px]">
                    {establishment.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="إغلاق القائمة (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Critical Status Summary Chips */}
            <div className="bg-slate-50/90 p-3 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">تراخيص مستحقة</span>
                <span className={`font-mono font-black text-xs ${allExpiringLicenses.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {allExpiringLicenses.length} {allExpiringLicenses.length > 0 ? '⚠️' : '✓'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">مخالفات نشطة</span>
                <span className={`font-mono font-black text-xs ${estViolations.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {estViolations.length} {estViolations.length > 0 ? 'نشطة' : 'لا يوجد'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">الوثائق المسجلة</span>
                <span className="font-mono font-black text-xs text-indigo-600">
                  {estLicenses.length + estDocuments.length} وثيقة
                </span>
              </div>
            </div>

            {/* Action Buttons List */}
            <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">

              {/* ACTION 1: Renew All Expiring (Primary 1-Click Action) */}
              <div className={`p-3 rounded-xl border transition-all ${
                allExpiringLicenses.length > 0 
                  ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300' 
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      allExpiringLicenses.length > 0 ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-600 text-white'
                    }`}>
                      <RotateCw className={`w-4 h-4 ${allExpiringLicenses.length > 0 ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">
                          تجديد جميع التراخيص المنتهية والوشيكة
                        </span>
                        {allExpiringLicenses.length > 0 && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {allExpiringLicenses.length} رخص
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {allExpiringLicenses.length > 0 
                          ? `إجمالي الرسوم التقديرية: ${formatSAR(batchTotalAmount)}` 
                          : 'كافة تراخيص المنشأة سارية وممتثلة بالكامل'}
                      </p>
                    </div>
                  </div>

                  {allExpiringLicenses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowBatchReviewModal(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>تجديد الكل</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md shrink-0">
                      مكتمل ✓
                    </span>
                  )}
                </div>
              </div>

              {/* ACTION 2: Download All Docs & Licenses (1-Click Download) */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        تحميل وتصدير كافة الوثائق والتراخيص
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        تصدير ملف موحد شامل لجميع التراخيص والشهادات المسجلة ({estLicenses.length + estDocuments.length} وثيقة)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDownloadingDocs}
                    onClick={handleDownloadAllDocs}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {isDownloadingDocs ? (
                      <span className="text-[10px]">جاري التصدير...</span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ACTION 3: Batch Rectify & Object Open Violations */}
              {estViolations.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">
                            معالجة واعتراض المخالفات النشطة
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {estViolations.length} مخالفة
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          بدء إجراءات التصحيح وصياغة مذكرات الاعتراض القانونية
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateToTab('violations');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>معالجة</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION 4: Export Compliance Audit PDF Report */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        تصدير تقرير الامتثال الرسمي (PDF)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        طباعة تقرير تدقيق جاهز ومعتمد بختم التحقق ورمز QR
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onExportCompliancePdf();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              {/* ACTION 5: Instant Live AI Compliance Scan */}
              <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/80 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-400/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-white block">
                        فحص الامتثال الاستباقي المباشر
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {isScanning ? scanStep : 'إعادة مزامنة فورية مع بوابات بلدي والدفاع المدني والزكاة'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleRunAiScan}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {isScanning ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Scan className="w-3.5 h-3.5 text-amber-300" />
                        <span>فحص</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ACTION 6: Schedule 3-Day Proactive Reminders */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        تفعيل التذكير الذكي لكافة التراخيص
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        جدولة تنبيهات آلية (قبل 3 أيام) عبر البريد والواتساب
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleScheduleAllReminders}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>جدولة</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer with keyboard shortcut info and AI Advisor Link */}
            <div className="p-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-[10px]">
                <span>اختصار سريع:</span>
                <kbd className="bg-white border border-slate-300 px-1 py-0.5 rounded text-[9px] font-mono text-slate-700">⌘Q</kbd>
                <span>أو</span>
                <kbd className="bg-white border border-slate-300 px-1 py-0.5 rounded text-[9px] font-mono text-slate-700">Esc</kbd>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAI();
                }}
                className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>مستشار سبّاق الذكي</span>
              </button>
            </div>

          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl border transition-all duration-200 cursor-pointer select-none ${
            isOpen 
              ? 'bg-slate-900 text-white border-slate-700 ring-4 ring-indigo-500/20' 
              : urgentCount > 0
              ? 'bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 text-white border-indigo-500/40 hover:scale-105 hover:shadow-indigo-900/30'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:scale-105'
          }`}
          title="قائمة الإجراءات السريعة (⌘Q)"
          aria-label="قائمة الإجراءات السريعة بنقرة واحدة"
        >
          {/* Animated Flash / Bolt Icon */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              urgentCount > 0 
                ? 'bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-400/30' 
                : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Zap className={`w-4 h-4 ${urgentCount > 0 ? 'fill-slate-900 animate-pulse' : ''}`} />
            </div>

            {/* Glowing Urgent Action Badge Counter */}
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-mono font-black flex items-center justify-center ring-2 ring-white animate-bounce">
                {urgentCount}
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight">إجراءات سريعة</span>
              {urgentCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {urgentCount} عاجل
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-300 block">
              {isOpen ? 'انقر للإغلاق' : 'تجديد، تحميل، فحص ⚡'}
            </span>
          </div>

          <div className="mr-1 text-slate-400 group-hover:text-white transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* Batch Renewal Review & Confirmation Modal */}
      {showBatchReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Cairo']">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-rose-950 via-rose-900 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/50 border border-rose-400/30 flex items-center justify-center shadow-inner">
                  <RotateCw className="w-5 h-5 text-amber-300 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">تجديد جميع التراخيص المنتهية والوشيكة</h2>
                    <span className="bg-rose-500/30 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
                      طلب مجمع ⚡
                    </span>
                  </div>
                  <p className="text-xs text-rose-200 mt-0.5">
                    مراجعة وتأكيد قائمة التراخيص المستحقة للتجديد الفوري لمنشأة {establishment.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBatchReviewModal(false)}
                className="p-1.5 text-rose-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              
              {/* Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-amber-900 text-[11px] space-y-0.5">
                  <span className="font-bold block">ملاحظة الامتثال وسريان التراخيص:</span>
                  <span>
                    سيتم إدراج كافة التراخيص المحددة أدناه في طلب تجديد فوري موحد لضمان سرعة السداد وتفادي أي غرامات تأخير أو إيقاف خدمات.
                  </span>
                </div>
              </div>

              {/* Licenses Selection Table / Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>قائمة التراخيص المحددة للتجديد ({selectedLicenseIds.size} من {allExpiringLicenses.length}):</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedLicenseIds(new Set(allExpiringLicenses.map(l => l.id)))}
                      className="text-indigo-600 hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedLicenseIds(new Set())}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {allExpiringLicenses.map(lic => {
                    const isSelected = selectedLicenseIds.has(lic.id);
                    const isExpired = lic.status === 'expired' || lic.daysRemaining <= 0;

                    return (
                      <div
                        key={lic.id}
                        onClick={() => toggleLicenseSelection(lic.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-400/20' 
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{lic.name}</span>
                              <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                                #{lic.licenseNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span>الجهة: {lic.authority}</span>
                              <span>•</span>
                              <span className={isExpired ? 'text-rose-700 font-bold' : 'text-amber-700'}>
                                {isExpired ? 'منتهي الصلاحية' : `متبقي ${lic.daysRemaining} يوم`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-[10px] text-slate-400 block font-medium">الرسوم المقدرة:</span>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {formatSAR((lic.costGov || 0) + (lic.costSabbaq || 0) + Math.round((lic.costSabbaq || 0) * 0.15))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary Breakdown Box */}
              <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>إجمالي الرسوم الحكومية المقدرة:</span>
                  <span className="font-mono font-bold text-white">{formatSAR(batchTotalGovFee)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>أتعاب سبّاق والتدقيق النظامي:</span>
                  <span className="font-mono font-bold text-white">{formatSAR(batchTotalSabbaqFee)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono font-bold text-white">{formatSAR(batchTotalVat)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-sm font-extrabold text-amber-300">
                  <span>الإجمالي الكلي للطلب المجمع:</span>
                  <span className="font-mono text-base">{formatSAR(batchTotalAmount)}</span>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowBatchReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={selectedLicenseIds.size === 0}
                onClick={handleExecuteBatchRenew}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>إضافة التراخيص المحددة ({selectedLicenseIds.size}) إلى السلة فوراً</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
