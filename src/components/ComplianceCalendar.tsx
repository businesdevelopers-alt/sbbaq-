import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  RotateCw,
  Sparkles,
  Filter,
  ExternalLink,
  Info,
  Building2,
  ArrowLeft,
  Plus,
  Download,
  Share2,
  Search,
  Bell,
  Check,
  X,
  Layers,
  MapPin,
  DollarSign,
  Briefcase,
  Receipt,
  ShieldCheck,
  Flame,
  FileCheck2,
  CalendarCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { License, DocumentItem, ComplianceViolation, Establishment, Branch } from '../types';
import { formatSAR } from '../utils/complianceEngine';

export type CalendarEventType =
  | 'license_expiry'
  | 'document_expiry'
  | 'regulatory_filing'
  | 'violation_objection_deadline'
  | 'inspection_scheduled'
  | 'custom_reminder';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  authority: string;
  authorityKey: 'balady' | 'civil_defense' | 'zatca' | 'gosi' | 'qiwa' | 'commerce' | 'other';
  status: 'expired' | 'urgent' | 'upcoming' | 'good';
  daysRemaining: number;
  cost?: number;
  branchName?: string;
  originalItem?: License | DocumentItem | ComplianceViolation | any;
  description?: string;
  actionText?: string;
  isStatutory?: boolean;
  isCustom?: boolean;
}

interface ComplianceCalendarProps {
  establishment: Establishment;
  licenses: License[];
  documents: DocumentItem[];
  violations: ComplianceViolation[];
  branches?: Branch[];
  onRenewLicense?: (license: License) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenObjectionModal?: (violation: ComplianceViolation) => void;
  showToast?: (message: string) => void;
}

export const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({
  establishment,
  licenses,
  documents,
  violations,
  branches = [],
  onRenewLicense,
  onNavigateToTab,
  onOpenObjectionModal,
  showToast = (_msg: string) => {}
}) => {
  // Current view date state (Default to August 2026 as per application reference context)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 is August
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-15');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'statutory'>('grid');

  // Filters & Search
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAuthority, setFilterAuthority] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Custom Event Modal state
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomDate, setNewCustomDate] = useState('2026-08-25');
  const [newCustomAuthority, setNewCustomAuthority] = useState('الدفاع المدني');
  const [newCustomCost, setNewCustomCost] = useState<number | ''>(1500);
  const [newCustomNotes, setNewCustomNotes] = useState('');
  const [newCustomBranch, setNewCustomBranch] = useState('المركز الرئيسي');

  // Custom user-added events state
  const [customEvents, setCustomEvents] = useState<CalendarEventItem[]>([
    {
      id: 'custom-1',
      title: 'فحص دوري لمضخات وشبكة الإطفاء الآلية',
      date: '2026-08-22',
      type: 'custom_reminder',
      authority: 'الدفاع المدني والسلامة',
      authorityKey: 'civil_defense',
      status: 'urgent',
      daysRemaining: 7,
      cost: 1800,
      branchName: 'الفرع الرئيسي - الرياض',
      description: 'فحص واختبار لوحات الإنذار المبكر وشبكات الرش الآلي مع مقاول الصيانة المعتمد.',
      actionText: 'توثيق تقرير الفحص',
      isCustom: true
    },
    {
      id: 'custom-2',
      title: 'تجديد اشتراك منصة قوى ومقيم السنوي',
      date: '2026-09-10',
      type: 'custom_reminder',
      authority: 'وزارة الموارد البشرية',
      authorityKey: 'qiwa',
      status: 'upcoming',
      daysRemaining: 26,
      cost: 2300,
      branchName: 'كافة الفروع',
      description: 'تجديد الاشتراك الإلكتروني في بوابتي قوى ومقيم لتفادي تعليق خدمات نقل الكفالات والتأشيرات.',
      actionText: 'تجديد الاشتراك',
      isCustom: true
    }
  ]);

  // Month names in Arabic & Hijri approximations for 2026 (1448H)
  const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const HIJRI_MONTH_LABELS = [
    'رجب 1447', 'شعبان 1447', 'رمضان 1447', 'شوال 1447', 'ذو القعدة 1447', 'ذو الحجة 1447',
    'محرم 1448', 'صفر 1448', 'ربيع الأول 1448', 'ربيع الثاني 1448', 'جمادى الأولى 1448', 'جمادى الآخرة 1448'
  ];

  const DAYS_OF_WEEK = [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];

  // Statutory periodic Saudi compliance calendar items
  const STATUTORY_MILESTONES = useMemo<CalendarEventItem[]>(() => {
    return [
      {
        id: 'statutory-gosi-aug',
        title: 'سداد اشتراكات التأمينات الاجتماعية الشهرية (GOSI)',
        date: '2026-08-15',
        type: 'regulatory_filing',
        authority: 'المؤسسة العامة للتأمينات الاجتماعية',
        authorityKey: 'gosi',
        status: 'urgent',
        daysRemaining: 0,
        cost: 6500,
        branchName: 'المركز الرئيسي - الرياض',
        description: 'آخر موعد شهري نظامي لسداد اشتراكات التأمينات الاجتماعية للموظفين السعوديين وغير السعوديين لتفادي غرامات التأخير (2% شهرياً).',
        actionText: 'سداد الاشتراكات عبر سداد',
        isStatutory: true
      },
      {
        id: 'statutory-wps-aug',
        title: 'رفع ملف حماية الأجور الشهري (WPS)',
        date: '2026-08-20',
        type: 'regulatory_filing',
        authority: 'وزارة الموارد البشرية (منصة قوى)',
        authorityKey: 'qiwa',
        status: 'urgent',
        daysRemaining: 5,
        cost: 0,
        branchName: 'كافة الفروع',
        description: 'رفع وتوثيق ملف صرف رواتب العاملين لشهر يوليو عبر منصة قوى لضمان تحقيق نسبة امتثال حماية الأجور 90% فما فوق.',
        actionText: 'رفع ملف الرواتب في قوى',
        isStatutory: true
      },
      {
        id: 'statutory-zatca-vat-q3',
        title: 'تقديم وسداد إقرار ضريبة القيمة المضافة (VAT) للربع الثاني/الشهري',
        date: '2026-08-31',
        type: 'regulatory_filing',
        authority: 'هيئة الزكاة والضريبة والجمارك (زاتكا)',
        authorityKey: 'zatca',
        status: 'upcoming',
        daysRemaining: 16,
        cost: 14200,
        branchName: 'الإدارة العامة والمالية',
        description: 'إلزام نظامي برفع إقرار ضريبة القيمة المضافة وسداد المستحقات قبل نهاية الشهر لتفادي غرامة التأخير (5% إلى 25%).',
        actionText: 'رفع الإقرار عبر زاتكا',
        isStatutory: true
      },
      {
        id: 'statutory-gosi-sep',
        title: 'سداد اشتراكات التأمينات الاجتماعية لشهر أغسطس (GOSI)',
        date: '2026-09-15',
        type: 'regulatory_filing',
        authority: 'المؤسسة العامة للتأمينات الاجتماعية',
        authorityKey: 'gosi',
        status: 'upcoming',
        daysRemaining: 31,
        cost: 6500,
        branchName: 'المركز الرئيسي',
        description: 'الاستحقاق الشهري لسداد حصة المنشأة والمشتركين في التأمينات الاجتماعية.',
        actionText: 'إصدار فاتورة سداد',
        isStatutory: true
      },
      {
        id: 'statutory-e-invoicing-audit',
        title: 'فحص توافق الربط والتكامل مع منصة «فاتورة» (الفاز 2)',
        date: '2026-09-30',
        type: 'regulatory_filing',
        authority: 'هيئة الزكاة والضريبة والجمارك (زاتكا)',
        authorityKey: 'zatca',
        status: 'upcoming',
        daysRemaining: 46,
        cost: 2500,
        branchName: 'كافة الفروع',
        description: 'المراجعة الدورية لشهادات التشفير CSID وسلامة إرسال الفواتير بصيغة XML وضمان عدم وجود فواتير معلقة أو مرفوضة.',
        actionText: 'فحص الربط الفني',
        isStatutory: true
      }
    ];
  }, []);

  // Compile unified calendar events from licenses, documents, violations, statutory and custom
  const allEvents: CalendarEventItem[] = useMemo(() => {
    const events: CalendarEventItem[] = [];
    const today = new Date('2026-08-15');

    // 1. Licenses expiry dates
    licenses
      .filter((l) => l.establishmentId === establishment.id && l.expiryDate)
      .forEach((lic) => {
        const expDate = new Date(lic.expiryDate);
        const diffTime = expDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'expired' | 'urgent' | 'upcoming' | 'good' = 'good';
        if (days < 0) status = 'expired';
        else if (days <= 15) status = 'urgent';
        else if (days <= 45) status = 'upcoming';

        let authorityKey: CalendarEventItem['authorityKey'] = 'balady';
        if (lic.authority.includes('دفاع') || lic.authority.includes('سلامة')) {
          authorityKey = 'civil_defense';
        } else if (lic.authority.includes('زكاة') || lic.authority.includes('ضريبة')) {
          authorityKey = 'zatca';
        } else if (lic.authority.includes('تجارة')) {
          authorityKey = 'commerce';
        }

        const matchedBranch = branches.find((b) => b.id === lic.branchId);

        events.push({
          id: `lic-${lic.id}`,
          title: `انتهاء ترخيص: ${lic.name}`,
          date: lic.expiryDate,
          type: 'license_expiry',
          authority: lic.authority,
          authorityKey,
          status,
          daysRemaining: days,
          cost: lic.costGov + (lic.costSabbaq || 0),
          branchName: matchedBranch?.name || lic.branchName || 'الفرع الرئيسي',
          originalItem: lic,
          description: `الترخيص رقم (${lic.licenseNumber}) الصادر من ${lic.authority}. ${lic.notes || 'يتطلب سداد الرسوم وإرفاق شهادات السلامة البلدية.'}`,
          actionText: 'تجديد فوري عبر سبّاق'
        });
      });

    // 2. Documents expiry dates
    documents
      .filter((d) => d.establishmentId === establishment.id && d.expiryDate)
      .forEach((doc) => {
        const expDate = new Date(doc.expiryDate);
        const diffTime = expDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'expired' | 'urgent' | 'upcoming' | 'good' = 'good';
        if (days < 0) status = 'expired';
        else if (days <= 15) status = 'urgent';
        else if (days <= 45) status = 'upcoming';

        let authorityKey: CalendarEventItem['authorityKey'] = 'commerce';
        let authName = 'وزارة التجارة';
        if (doc.category === 'safety') {
          authName = 'الدفاع المدني';
          authorityKey = 'civil_defense';
        } else if (doc.category === 'municipal') {
          authName = 'أمانة المنطقة (بلدي)';
          authorityKey = 'balady';
        } else if (doc.category === 'tax') {
          authName = 'هيئة الزكاة والضريبة';
          authorityKey = 'zatca';
        }

        events.push({
          id: `doc-${doc.id}`,
          title: `تجديد مستند: ${doc.title}`,
          date: doc.expiryDate,
          type: 'document_expiry',
          authority: authName,
          authorityKey,
          status,
          daysRemaining: days,
          branchName: 'المركز الرئيسي',
          originalItem: doc,
          description: `المستند ${doc.isMandatory ? '(إلزامي قانوناً)' : ''} ضمن الأرشيف الرقمي للمنشأة وتوثيق العقود.`,
          actionText: 'تحديث المستند في الحافظة'
        });
      });

    // 3. Violations objection deadlines
    violations
      .filter((v) => v.establishmentId === establishment.id && v.status !== 'rectified' && v.objectionDeadline)
      .forEach((viol) => {
        const deadlineDate = new Date(viol.objectionDeadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'expired' | 'urgent' | 'upcoming' | 'good' = 'urgent';
        if (days < 0) status = 'expired';
        else if (days <= 5) status = 'urgent';

        let authorityKey: CalendarEventItem['authorityKey'] = 'balady';
        if (viol.authority.includes('دفاع') || viol.authority.includes('سلامة')) {
          authorityKey = 'civil_defense';
        } else if (viol.authority.includes('زكاة') || viol.authority.includes('ضريبة')) {
          authorityKey = 'zatca';
        }

        events.push({
          id: `viol-${viol.id}`,
          title: `مهلة اعتراض نظامية: ${viol.title}`,
          date: viol.objectionDeadline,
          type: 'violation_objection_deadline',
          authority: viol.authority,
          authorityKey,
          status,
          daysRemaining: days,
          cost: viol.fineAmount,
          branchName: viol.branchName || 'فرع المنشأة',
          originalItem: viol,
          description: `آخر موعد لتقديم لائحة الاعتراض النظامية على المخالفة رقم (${viol.violationNumber}) عبر منصة ${viol.authority} تفادياً لقطع المهلة واكتساب القرار الصفة القطعية.`,
          actionText: 'تقديم لائحة الاعتراض'
        });
      });

    // 4. Merge statutory and custom events
    events.push(...STATUTORY_MILESTONES);
    events.push(...customEvents);

    // Sort chronologically
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [establishment.id, licenses, documents, violations, branches, STATUTORY_MILESTONES, customEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      // Type filter
      if (filterType === 'licenses' && ev.type !== 'license_expiry') return false;
      if (filterType === 'statutory' && ev.type !== 'regulatory_filing') return false;
      if (filterType === 'documents' && ev.type !== 'document_expiry') return false;
      if (filterType === 'violations' && ev.type !== 'violation_objection_deadline') return false;
      if (filterType === 'custom' && ev.type !== 'custom_reminder') return false;

      // Authority filter
      if (filterAuthority !== 'all' && ev.authorityKey !== filterAuthority) return false;

      // Branch filter
      if (filterBranch !== 'all' && ev.branchName && !ev.branchName.includes(filterBranch)) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(query);
        const matchesAuth = ev.authority.toLowerCase().includes(query);
        const matchesDesc = ev.description ? ev.description.toLowerCase().includes(query) : false;
        const matchesDate = ev.date.includes(query);
        if (!matchesTitle && !matchesAuth && !matchesDesc && !matchesDate) return false;
      }

      return true;
    });
  }, [allEvents, filterType, filterAuthority, filterBranch, searchQuery]);

  // Generate 42 days grid for monthly view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; events: CalendarEventItem[] }[] = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum, isCurrentMonth: false, events: dayEvents });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum: day, isCurrentMonth: true, events: dayEvents });
    }

    // Next month filler days to complete grid (42 cells: 6 weeks)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum: i, isCurrentMonth: false, events: dayEvents });
    }

    return days;
  }, [currentYear, currentMonth, filteredEvents]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Summary Metrics KPIs
  const metrics = useMemo(() => {
    const totalCount = allEvents.length;
    const expiredCount = allEvents.filter((e) => e.status === 'expired').length;
    const urgentCount = allEvents.filter((e) => e.status === 'urgent').length;
    const upcomingCount = allEvents.filter((e) => e.status === 'upcoming' || e.status === 'good').length;
    const totalEstimatedCost = allEvents
      .filter((e) => e.cost && e.cost > 0)
      .reduce((sum, e) => sum + (e.cost || 0), 0);

    // Next critical event
    const upcomingUrgent = allEvents.filter((e) => e.daysRemaining >= 0);
    const nextEvent = upcomingUrgent.length > 0 ? upcomingUrgent[0] : null;

    return {
      totalCount,
      expiredCount,
      urgentCount,
      upcomingCount,
      totalEstimatedCost,
      nextEvent
    };
  }, [allEvents]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(2026);
    setCurrentMonth(7); // August
    setSelectedDate('2026-08-15');
  };

  // Add custom event handler
  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim() || !newCustomDate) {
      showToast('يرجى كتابة عنوان الموعد وتاريخ الاستحقاق.');
      return;
    }

    const today = new Date('2026-08-15');
    const targetDate = new Date(newCustomDate);
    const diffTime = targetDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: CalendarEventItem['status'] = 'upcoming';
    if (days < 0) status = 'expired';
    else if (days <= 15) status = 'urgent';

    let authorityKey: CalendarEventItem['authorityKey'] = 'civil_defense';
    if (newCustomAuthority.includes('بلدي')) authorityKey = 'balady';
    else if (newCustomAuthority.includes('زكاة')) authorityKey = 'zatca';
    else if (newCustomAuthority.includes('عمل') || newCustomAuthority.includes('قوى')) authorityKey = 'qiwa';
    else if (newCustomAuthority.includes('تأمينات')) authorityKey = 'gosi';

    const newEvent: CalendarEventItem = {
      id: `custom-${Date.now()}`,
      title: newCustomTitle,
      date: newCustomDate,
      type: 'custom_reminder',
      authority: newCustomAuthority,
      authorityKey,
      status,
      daysRemaining: days,
      cost: typeof newCustomCost === 'number' ? newCustomCost : undefined,
      branchName: newCustomBranch,
      description: newCustomNotes || 'موعد تدقيق وفحص داخلي مخصص للمنشأة.',
      actionText: 'إتمام الموعد وتوثيقه',
      isCustom: true
    };

    setCustomEvents((prev) => [newEvent, ...prev]);
    setIsAddEventModalOpen(false);
    setNewCustomTitle('');
    setNewCustomNotes('');
    showToast(`تمت إضافة الموعد «${newEvent.title}» إلى التقويم بنجاح.`);
  };

  // Export to .ics calendar file
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SABBAQ Saudi Compliance Calendar//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:تقويم امتثال سبّاق - ' + establishment.name
    ];

    allEvents.forEach((ev) => {
      const dateFormatted = ev.date.replace(/-/g, '');
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${ev.id}@sabbaq.sa`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateFormatted}`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:${ev.description || ''} | الجهة: ${ev.authority} | التكلفة التقديرية: ${ev.cost ? ev.cost + ' ر.س' : 'غير محدد'}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `تقويم_امتثال_${establishment.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تصدير ملف التقويم (.ics) بنجاح للمزامنة مع Google Calendar و Outlook.');
  };

  // Authority badge helper
  const getAuthorityBadge = (key: CalendarEventItem['authorityKey'], label: string) => {
    switch (key) {
      case 'civil_defense':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Flame className="w-3 h-3 text-rose-600" /><span>{label}</span></span>;
      case 'balady':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Building2 className="w-3 h-3 text-amber-600" /><span>{label}</span></span>;
      case 'zatca':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Receipt className="w-3 h-3 text-emerald-600" /><span>{label}</span></span>;
      case 'gosi':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-600" /><span>{label}</span></span>;
      case 'qiwa':
        return <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Briefcase className="w-3 h-3 text-teal-600" /><span>{label}</span></span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><FileText className="w-3 h-3 text-slate-500" /><span>{label}</span></span>;
    }
  };

  return (
    <div className="space-y-6 font-['Cairo'] pb-10 animate-fade-in">
      {/* 1. TOP HERO HEADER & ACTIONS */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>التقويم الزمني الموحد للامتثال السعودي (Compliance Timeline)</span>
              </span>

              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full font-mono border border-white/10">
                {HIJRI_MONTH_LABELS[currentMonth]} • {ARABIC_MONTHS[currentMonth]} {currentYear}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              جدول المواعيد والاستحقاقات النظامية لـ {establishment.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              رصد استباقي لكافة التراخيص البلدية، شهادات سلامة الدفاع المدني، إقرارات الزكاة وضريبة القيمة المضافة، ملفات حماية الأجور والتأمينات، والمهل القانونية للاعتراضات.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddEventModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موعد أو تدقيق مخصص</span>
            </button>

            <button
              type="button"
              onClick={handleExportICS}
              className="bg-white/10 hover:bg-white/20 text-slate-100 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="مزامنة مع Google Calendar / Outlook"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير للتقويم (.ics)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRICS KPIS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">إجمالي الاستحقاقات</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">{metrics.totalCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">موعد مسجل ومجدول</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">استحقاقات حرجة (15 يوماً)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 font-mono">{metrics.urgentCount}</p>
          <span className="text-[10px] text-amber-700 font-bold">تتطلب إجراءً سريعاً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">منتهية الصلاحية</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-extrabold text-rose-600 font-mono">{metrics.expiredCount}</p>
          <span className="text-[10px] text-rose-700 font-bold">معرضة للمخالفات فوراً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">مجدولة وسارية</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 font-mono">{metrics.upcomingCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">ضمن النطاق الآمن</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">الرسوم التقديرية المتوقعة</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-base font-extrabold text-slate-900 font-['Cairo']">
            {formatSAR(metrics.totalEstimatedCost)}
          </p>
          <span className="text-[10px] text-teal-700 font-bold">رسوم حكومية وتشغيلية</span>
        </div>
      </div>

      {/* 3. VIEW MODE & FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Switches */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>التقويم الشهري (Grid)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>المخطط الزمني (Timeline)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {filteredEvents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('statutory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'statutory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>الالتزامات والإقرارات الدورية</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الجهة، نوع الترخيص، أو التاريخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filters Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>التصنيف:</span>
            </span>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">جميع الأنواع ({allEvents.length})</option>
              <option value="licenses">تراخيص بلدي والسلامة</option>
              <option value="statutory">إقرارات زكوية وضريبية وعمل</option>
              <option value="documents">الوثائق والسجلات الرسمية</option>
              <option value="violations">مهل الاعتراضات على المخالفات</option>
              <option value="custom">مواعيد وتدقيق مخصص</option>
            </select>

            <select
              value={filterAuthority}
              onChange={(e) => setFilterAuthority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">كافة الجهات والهيئات</option>
              <option value="balady">البلديات وأمانة المنطقة (بلدي)</option>
              <option value="civil_defense">الدفاع المدني (سلامة)</option>
              <option value="zatca">هيئة الزكاة والضريبة والجمارك</option>
              <option value="gosi">التأمينات الاجتماعية (GOSI)</option>
              <option value="qiwa">وزارة الموارد البشرية (قوى)</option>
              <option value="commerce">وزارة التجارة والغرف التجارية</option>
            </select>

            {branches.length > 0 && (
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">كافة الفروع والمواقع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          {(filterType !== 'all' || filterAuthority !== 'all' || filterBranch !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setFilterAuthority('all');
                setFilterBranch('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN VIEW 1: MONTHLY GRID VIEW (عرض التقويم الشهري المربعات) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: 8 Columns Calendar Grid */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Month & Navigation Controls Bar */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                    {ARABIC_MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    الموافق {HIJRI_MONTH_LABELS[currentMonth]}
                  </span>
                </div>
              </div>

              {/* Month Stepper Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleTodayClick}
                  className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                >
                  اليوم (15 أغسطس)
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-600 pb-2 border-b border-slate-100">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={idx} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 6-Week Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dayObj, idx) => {
                const isSelected = dayObj.dateStr === selectedDate;
                const isToday = dayObj.dateStr === '2026-08-15';
                const hasExpired = dayObj.events.some((e) => e.status === 'expired');
                const hasUrgent = dayObj.events.some((e) => e.status === 'urgent');
                const hasUpcoming = dayObj.events.some((e) => e.status === 'upcoming' || e.status === 'good');

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(dayObj.dateStr)}
                    className={`min-h-[92px] p-2 rounded-2xl border text-right transition-all flex flex-col justify-between relative group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : dayObj.isCurrentMonth
                        ? 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/90'
                        : 'bg-slate-50/20 border-slate-100 text-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Top Row: Day Number & Event Count */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold font-mono rounded-lg w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                            : isSelected
                            ? 'bg-slate-900 text-white'
                            : dayObj.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayObj.dayNum}
                      </span>

                      {dayObj.events.length > 0 && (
                        <span className="text-[10px] font-extrabold bg-slate-900/10 text-slate-800 px-1.5 py-0.2 rounded-full">
                          {dayObj.events.length}
                        </span>
                      )}
                    </div>

                    {/* Event Preview Pills */}
                    <div className="space-y-1 w-full mt-1">
                      {dayObj.events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border text-right ${
                            ev.status === 'expired'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : ev.status === 'urgent'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : ev.type === 'regulatory_filing'
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                              : ev.type === 'violation_objection_deadline'
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}
                          title={`${ev.title} (${ev.authority})`}
                        >
                          {ev.title.replace('انتهاء ترخيص: ', '').replace('تجديد مستند: ', '').replace('سداد اشتراكات ', '')}
                        </div>
                      ))}
                      {dayObj.events.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-bold pr-1">
                          +{dayObj.events.length - 2} مواعيد أخرى
                        </div>
                      )}
                    </div>

                    {/* Colored Status Dot Indicators */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {hasExpired && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="يوجد موعد منتهي" />}
                      {hasUrgent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="يوجد موعد عاجل" />}
                      {!hasExpired && !hasUrgent && hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>منتهي الصلاحية</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>عاجل (خلال 15 يوماً)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>سارٍ ومجدول</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>إقرار زكوي أو عمل دوري</span>
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                * انقر على أي يوم لاستعراض تفاصيله وإجراءات التجديد
              </span>
            </div>
          </div>

          {/* Right: 4 Columns Selected Date Details Side Panel */}
          <div className="lg:col-span-4 bg-slate-50/80 rounded-3xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Panel Header */}
              <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">المواعيد المستحقة في:</span>
                  <h3 className="font-extrabold text-slate-900 text-base font-['Cairo'] flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    <span>{selectedDate}</span>
                    {selectedDate === '2026-08-15' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                        اليوم
                      </span>
                    )}
                  </h3>
                </div>

                <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
                  {selectedDateEvents.length} مواعيد
                </span>
              </div>

              {/* Event List for Selected Date */}
              {selectedDateEvents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/60 space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm font-['Cairo']">لا توجد استحقاقات في هذا التاريخ</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    جميع التراخيص والمستندات سارية ولا تتطلب أي إجراءات تصحيحية فورية في هذا اليوم.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCustomDate(selectedDate);
                      setIsAddEventModalOpen(true);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة موعد في هذا اليوم</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {selectedDateEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`bg-white p-4 rounded-2xl border transition-all space-y-2.5 shadow-2xs hover:border-slate-400 ${
                        ev.status === 'expired'
                          ? 'border-rose-300 ring-1 ring-rose-300/30'
                          : ev.status === 'urgent'
                          ? 'border-amber-300 ring-1 ring-amber-300/30'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {getAuthorityBadge(ev.authorityKey, ev.authority)}
                          <h4 className="font-bold text-slate-900 text-sm font-['Cairo'] mt-1.5 leading-snug">
                            {ev.title}
                          </h4>
                          {ev.branchName && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{ev.branchName}</span>
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            ev.status === 'expired'
                              ? 'bg-rose-100 text-rose-800'
                              : ev.status === 'urgent'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {ev.daysRemaining < 0
                            ? `منتهي (${Math.abs(ev.daysRemaining)} يوم)`
                            : ev.daysRemaining === 0
                            ? 'ينتهي اليوم'
                            : `متبقي ${ev.daysRemaining} يوم`}
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {ev.cost !== undefined && ev.cost > 0 && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-slate-500">التكلفة / الرسوم المقدرة:</span>
                          <strong className="font-bold text-slate-900 font-['Cairo']">
                            {formatSAR(ev.cost)}
                          </strong>
                        </div>
                      )}

                      {/* Action CTA Buttons */}
                      <div className="pt-1.5">
                        {ev.type === 'license_expiry' && ev.originalItem && (
                          <button
                            type="button"
                            onClick={() => onRenewLicense && onRenewLicense(ev.originalItem as License)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>تجديد فوري عبر سبّاق</span>
                          </button>
                        )}

                        {ev.type === 'document_expiry' && (
                          <button
                            type="button"
                            onClick={() => onNavigateToTab && onNavigateToTab('company_documents')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>رفع وتحديث المستند في الحافظة</span>
                          </button>
                        )}

                        {ev.type === 'violation_objection_deadline' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenObjectionModal && ev.originalItem) {
                                onOpenObjectionModal(ev.originalItem as ComplianceViolation);
                              } else if (onNavigateToTab) {
                                onNavigateToTab('risk_center');
                              }
                            }}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>تقديم لائحة الاعتراض النظامية</span>
                          </button>
                        )}

                        {ev.type === 'regulatory_filing' && (
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`تم فتح إجراء: ${ev.title}`);
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{ev.actionText || 'إتمام الإجراء النظامي'}</span>
                          </button>
                        )}

                        {ev.type === 'custom_reminder' && (
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`تم توثيق إنجاز الموعد: ${ev.title}`);
                              setCustomEvents((prev) => prev.filter((c) => c.id !== ev.id));
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تعليم كمكتمل وموثق</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Month Overview Badge */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>استحقاقات شهر {ARABIC_MONTHS[currentMonth]}:</span>
              <span className="font-bold text-slate-900">
                {allEvents.filter((e) => e.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length} مواعيد
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN VIEW 2: TIMELINE STREAM VIEW (المخطط الزمني التدريجي) */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                الخط الزمني التدريجي لكافة الالتزامات والمواعيد القادمة
              </h3>
              <p className="text-xs text-slate-500">
                مرتبة زمنياً حسب الاستحقاق الفوري لضمان عدم فوات أي موعد تجديد أو مهلة نظامية.
              </p>
            </div>

            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700 self-start sm:self-auto">
              {filteredEvents.length} استحقاق معروض
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              لا توجد استحقاقات مطابقة لمعايير البحث والفلترة.
            </div>
          ) : (
            <div className="relative border-r-2 border-slate-200 mr-4 space-y-6 pr-6">
              {filteredEvents.map((ev) => {
                const isExpired = ev.status === 'expired';
                const isUrgent = ev.status === 'urgent';

                return (
                  <div key={ev.id} className="relative group">
                    {/* Dot on timeline */}
                    <div
                      className={`absolute -right-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isExpired
                          ? 'bg-rose-500 ring-4 ring-rose-100'
                          : isUrgent
                          ? 'bg-amber-500 ring-4 ring-amber-100'
                          : ev.type === 'regulatory_filing'
                          ? 'bg-indigo-500 ring-4 ring-indigo-100'
                          : 'bg-emerald-500 ring-4 ring-emerald-100'
                      }`}
                    />

                    {/* Timeline Event Card */}
                    <div className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {ev.date}
                          </span>
                          {getAuthorityBadge(ev.authorityKey, ev.authority)}
                          {ev.isStatutory && (
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              إقرار دوري ملزم
                            </span>
                          )}
                          {ev.isCustom && (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              تدقيق مخصص
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                          {ev.title}
                        </h4>

                        {ev.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {ev.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                          {ev.branchName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{ev.branchName}</span>
                            </span>
                          )}

                          {ev.cost !== undefined && ev.cost > 0 && (
                            <span className="font-bold text-slate-900">
                              الرسوم: {formatSAR(ev.cost)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action & Status */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {ev.daysRemaining < 0
                            ? `منتهي منذ ${Math.abs(ev.daysRemaining)} يوم`
                            : ev.daysRemaining === 0
                            ? 'ينتهي اليوم'
                            : `متبقي ${ev.daysRemaining} يوم`}
                        </span>

                        {ev.type === 'license_expiry' && ev.originalItem && (
                          <button
                            type="button"
                            onClick={() => onRenewLicense && onRenewLicense(ev.originalItem as License)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>تجديد فوري</span>
                          </button>
                        )}

                        {ev.type === 'regulatory_filing' && (
                          <button
                            type="button"
                            onClick={() => showToast(`تم التوجيه لإجراء: ${ev.title}`)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{ev.actionText || 'إتمام الإقرار'}</span>
                          </button>
                        )}

                        {ev.type === 'violation_objection_deadline' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenObjectionModal && ev.originalItem) {
                                onOpenObjectionModal(ev.originalItem as ComplianceViolation);
                              } else if (onNavigateToTab) {
                                onNavigateToTab('risk_center');
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>تقديم اعتراض</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. MAIN VIEW 3: STATUTORY SAUDI REGULATORY FILING SCHEDULE (جدول الإقرارات والالتزامات الدورية) */}
      {viewMode === 'statutory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                دليل الإقرارات والمواعيد النظامية الإلزامية في المملكة العربية السعودية
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                جدول دوري شامل للمتطلبات الزكوية والضريبية وحماية الأجور واشتراكات التأمينات وفق اللوائح التنفيذية للجهات الحكومية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STATUTORY_MILESTONES.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    {getAuthorityBadge(item.authorityKey, item.authority)}
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">
                      المتبقي: <strong className="text-slate-900">{item.daysRemaining} يوم</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => showToast(`تم بدء الإجراء لـ: ${item.title}`)}
                      className="text-xs font-bold bg-slate-900 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{item.actionText}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD CUSTOM EVENT MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Cairo']">
                    إضافة موعد أو تدقيق امتثال مخصص
                  </h3>
                  <p className="text-xs text-slate-500">
                    أضف مواعيد الصيانة، الفحوصات الداخلية، أو تجديد الاشتراكات
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddEventModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان الموعد أو الإجراء *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فحص دوري لمعدات السلامة، تجديد اشتراك بلدي..."
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تاريخ الاستحقاق *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCustomDate}
                    onChange={(e) => setNewCustomDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الجهة الحكومية أو المنظومة
                  </label>
                  <select
                    value={newCustomAuthority}
                    onChange={(e) => setNewCustomAuthority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="الدفاع المدني والسلامة">الدفاع المدني والسلامة</option>
                    <option value="البلديات وأمانة المنطقة (بلدي)">البلديات وأمانة المنطقة (بلدي)</option>
                    <option value="هيئة الزكاة والضريبة والجمارك">هيئة الزكاة والضريبة والجمارك</option>
                    <option value="وزارة الموارد البشرية (قوى)">وزارة الموارد البشرية (قوى)</option>
                    <option value="التأمينات الاجتماعية (GOSI)">التأمينات الاجتماعية (GOSI)</option>
                    <option value="وزارة التجارة والغرف">وزارة التجارة والغرف</option>
                    <option value="تدقيق داخلي للمنشأة">تدقيق داخلي للمنشأة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الفرع / الموقع المستهدف
                  </label>
                  <input
                    type="text"
                    value={newCustomBranch}
                    onChange={(e) => setNewCustomBranch(e.target.value)}
                    placeholder="الفرع الرئيسي أو كافة الفروع"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الرسوم / التكلفة التقديرية (ر.س)
                  </label>
                  <input
                    type="number"
                    value={newCustomCost}
                    onChange={(e) => setNewCustomCost(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات وتفاصيل إضافية
                </label>
                <textarea
                  rows={2}
                  value={newCustomNotes}
                  onChange={(e) => setNewCustomNotes(e.target.value)}
                  placeholder="أي تعليمات أو أسماء مسؤولي الفحص والمتابعة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ الموعد في التقويم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
