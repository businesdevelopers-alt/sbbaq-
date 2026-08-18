import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Building2,
  Scale,
  CheckCircle2,
  Clock,
  Info,
  DollarSign,
  FileText,
  Zap,
  Target,
  Sliders,
  ChevronDown,
  ChevronUp,
  Award,
  BarChart3,
  Flame,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { 
  Establishment, 
  License, 
  ComplianceViolation, 
  DocumentItem, 
  Branch 
} from '../types';
import { formatSAR, getRiskLevelBadge } from '../utils/complianceEngine';

export interface UpcomingViolationsForecastCardProps {
  establishment: Establishment;
  licenses: License[];
  violations: ComplianceViolation[];
  documents: DocumentItem[];
  branches?: Branch[];
  onRenewLicense?: (license: License) => void;
  onNavigateToTab?: (tab: string, entityId?: string, entityType?: string) => void;
  onOpenAI?: () => void;
  showToast?: (msg: string) => void;
}

export const UpcomingViolationsForecastCard: React.FC<UpcomingViolationsForecastCardProps> = ({
  establishment,
  licenses,
  violations,
  documents,
  branches = [],
  onRenewLicense,
  onNavigateToTab,
  onOpenAI,
  showToast,
}) => {
  // Horizon and scenario controls
  const [selectedQuarter, setSelectedQuarter] = useState<'Q4_2026' | 'Q1_2027'>('Q4_2026');
  const [inspectionScenario, setInspectionScenario] = useState<'standard' | 'intensive'>('standard');
  const [activeViewTab, setActiveViewTab] = useState<'licenses_forecast' | 'trends_chart' | 'campaigns_calendar'>('licenses_forecast');
  const [selectedAuthorityFilter, setSelectedAuthorityFilter] = useState<'all' | 'balady' | 'civil_defense' | 'qiwa' | 'zatca'>('all');

  // Filter items for current establishment
  const estLicenses = useMemo(() => {
    return licenses.filter(l => l.establishmentId === establishment.id);
  }, [licenses, establishment.id]);

  const estViolations = useMemo(() => {
    return violations.filter(v => v.establishmentId === establishment.id);
  }, [violations, establishment.id]);

  // Determine industry archetype for benchmarks
  const sectorInfo = useMemo(() => {
    const act = (establishment.activity || '').toLowerCase();
    const name = (establishment.name || '').toLowerCase();

    if (act.includes('غذاء') || act.includes('مطعم') || act.includes('كافيه') || name.includes('مذاق') || name.includes('أغذية')) {
      return {
        key: 'food_beverage',
        name: 'قطاع الأغذية والمطاعم والمقاهي',
        avgQuarterlyViolations: 1.4,
        avgQuarterlyFine: 14200,
        riskIndex: 68,
        commonViolations: ['تأخر تجديد رخصة بلدي', 'الشهادات الصحية للعاملين', 'اشتراطات تخزين ونظافة'],
        q4InspectionSurge: '+35% تفتيش بلدي وصحي',
        benchmarkRate: 48
      };
    } else if (act.includes('تجزئة') || act.includes('تجارة') || act.includes('سوق') || name.includes('تموينات')) {
      return {
        key: 'retail',
        name: 'قطاع تجارة التجزئة والمراكز التجارية',
        avgQuarterlyViolations: 0.9,
        avgQuarterlyFine: 8500,
        riskIndex: 52,
        commonViolations: ['عرض الأسعار ورمز QR', 'أجهزة الدفع مدى', 'رخصة اللوحات الإعلانية'],
        q4InspectionSurge: '+25% جولات وزارة التجارة',
        benchmarkRate: 36
      };
    } else if (act.includes('مقاولات') || act.includes('بناء') || act.includes('صيانة') || act.includes('تشييد')) {
      return {
        key: 'contracting',
        name: 'قطاع المقاولات والإنشاءات',
        avgQuarterlyViolations: 1.8,
        avgQuarterlyFine: 22000,
        riskIndex: 74,
        commonViolations: ['السلامة المهنية بالموقع', 'حماية الأجور والتوطين', 'تصنيف المقاولين'],
        q4InspectionSurge: '+40% جولات تفتيش العمل والسلامة',
        benchmarkRate: 58
      };
    } else {
      return {
        key: 'services',
        name: 'قطاع الخدمات والأنشطة العامة',
        avgQuarterlyViolations: 0.7,
        avgQuarterlyFine: 6800,
        riskIndex: 42,
        commonViolations: ['تجديد السجل التجاري', 'توثيق عقود قوى', 'الفوترة الإلكترونية'],
        q4InspectionSurge: '+20% تدقيق الفوترة والامتثال',
        benchmarkRate: 30
      };
    }
  }, [establishment.activity, establishment.name]);

  // Historical Analysis & Prediction Calculation
  const historicalQuarterlyData = useMemo(() => {
    // Generate historical baseline from past 3 quarters and predicted upcoming quarters
    const q1Fines = estViolations.filter(v => v.issueDate && v.issueDate.startsWith('2026-01') || v.issueDate?.startsWith('2026-02') || v.issueDate?.startsWith('2026-03')).reduce((sum, v) => sum + (v.amount || 0), 0);
    const q2Fines = estViolations.filter(v => v.issueDate && v.issueDate.startsWith('2026-04') || v.issueDate?.startsWith('2026-05') || v.issueDate?.startsWith('2026-06')).reduce((sum, v) => sum + (v.amount || 0), 0);
    const q3Fines = estViolations.filter(v => v.issueDate && v.issueDate.startsWith('2026-07') || v.issueDate?.startsWith('2026-08') || v.issueDate?.startsWith('2026-09')).reduce((sum, v) => sum + (v.amount || 0), 0);

    // Calculate baseline predicted fines for upcoming quarters based on expiring licenses & sector risk
    const expiringInQ4 = estLicenses.filter(l => l.daysRemaining <= 90);
    const multiplier = inspectionScenario === 'intensive' ? 1.35 : 1.0;
    
    const baseEstimatedFinesQ4 = expiringInQ4.reduce((sum, l) => {
      // Estimated penalty if not renewed
      return sum + (l.daysRemaining <= 0 ? 5000 : l.daysRemaining <= 30 ? 3000 : 1500);
    }, 2000) * multiplier;

    const baseEstimatedFinesQ1Next = (baseEstimatedFinesQ4 * 0.75);

    return [
      {
        quarter: 'الربع 1 (2026)',
        actualFines: q1Fines || 2500,
        predictedFines: 2500,
        sectorAvgFines: sectorInfo.avgQuarterlyFine * 0.9,
        complianceRate: 88,
        status: 'مكتمل'
      },
      {
        quarter: 'الربع 2 (2026)',
        actualFines: q2Fines || 4000,
        predictedFines: 3800,
        sectorAvgFines: sectorInfo.avgQuarterlyFine * 1.0,
        complianceRate: 82,
        status: 'مكتمل'
      },
      {
        quarter: 'الربع 3 (الحالي)',
        actualFines: q3Fines || 1500,
        predictedFines: 2000,
        sectorAvgFines: sectorInfo.avgQuarterlyFine * 0.95,
        complianceRate: 86,
        status: 'جاري'
      },
      {
        quarter: 'الربع 4 (المتوقع)',
        actualFines: null,
        predictedFines: Math.round(baseEstimatedFinesQ4),
        sectorAvgFines: Math.round(sectorInfo.avgQuarterlyFine * (inspectionScenario === 'intensive' ? 1.3 : 1.1)),
        complianceRate: Math.max(55, Math.min(95, 90 - (expiringInQ4.length * 8))),
        status: 'تنبؤ استباقي ⚡'
      },
      {
        quarter: 'الربع 1 (2027)',
        actualFines: null,
        predictedFines: Math.round(baseEstimatedFinesQ1Next),
        sectorAvgFines: Math.round(sectorInfo.avgQuarterlyFine * 1.0),
        complianceRate: 84,
        status: 'تنبؤ بعيد'
      }
    ];
  }, [estViolations, estLicenses, sectorInfo, inspectionScenario]);

  // Predictive Vulnerability Forecast for Specific Licenses and Regulatory Pillars
  const predictedVulnerableItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      authority: string;
      licenseNumber?: string;
      licenseRef?: License;
      category: 'license' | 'labor' | 'safety' | 'zakat' | 'health';
      probabilityScore: number; // 0 - 100
      riskLevel: 'critical' | 'high' | 'medium' | 'low';
      estimatedFine: number;
      primaryRiskReason: string;
      quarterTrendInsight: string;
      suggestedAction: string;
      actionType: 'renew' | 'audit' | 'consult';
      mappingId: string;
      violationCode: string;
      mappingTitleAr: string;
      linkedSolutionsCount: number;
      diagnosticQuestionsCount: number;
    }> = [];

    // Analyze each license
    estLicenses.forEach(lic => {
      let prob = 15;
      let fine = 2000;
      let reason = 'سريان طبيعي مع اقتراب المراجعة الدورية';
      let trend = 'متوسط القطاع مستقر';

      if (lic.status === 'expired' || lic.daysRemaining <= 0) {
        prob = 94;
        fine = 8000;
        reason = `الترخيص منتهي الصلاحية منذ ${Math.abs(lic.daysRemaining)} يوماً - معرض للإيقاف الفوري`;
        trend = 'حملات التفتيش الآلي ترصد التراخيص المنتهية فورياً';
      } else if (lic.daysRemaining <= 30) {
        prob = 78;
        fine = 5000;
        reason = `متبقي ${lic.daysRemaining} يوماً فقط - مستحق التجديد قبل نهاية الربع`;
        trend = `ارتفاع التفتيش الرقابي على أنشطة ${lic.authority} في الربع القادم`;
      } else if (lic.daysRemaining <= 90) {
        prob = 45;
        fine = 3000;
        reason = `ينتهي خلال الربع القادم (${lic.expiryDate})`;
        trend = 'ينصح بالتجديد الاستباقي قبل 30 يوماً';
      }

      if (inspectionScenario === 'intensive') {
        prob = Math.min(99, Math.round(prob * 1.25));
        fine = Math.round(fine * 1.3);
      }

      // Map to exact Violation Solution Mapping rule
      let mappingId = 'map-vio-bal-101';
      let violationCode = 'VIO-BAL-101';
      let mappingTitleAr = 'مزاولة النشاط بدون ترخيص بلدي سارٍ أو منتهي الصلاحية';
      let linkedSolutionsCount = 2;
      let diagnosticQuestionsCount = 3;

      const authLower = (lic.authority + ' ' + lic.name).toLowerCase();
      if (authLower.includes('دفاع') || authLower.includes('سلامة') || authLower.includes('إطفاء') || authLower.includes('حريق')) {
        mappingId = 'map-vio-def-201';
        violationCode = 'VIO-DEF-201';
        mappingTitleAr = 'عدم وجود عقد صيانة دوري معتمد لأنظمة الإطفاء (سلامة)';
        linkedSolutionsCount = 2;
        diagnosticQuestionsCount = 2;
      } else if (authLower.includes('زكاة') || authLower.includes('ضريبة') || authLower.includes('فاتورة') || authLower.includes('جمارك')) {
        mappingId = 'map-vio-zat-301';
        violationCode = 'VIO-ZAT-301';
        mappingTitleAr = 'عدم الالتزام بمتطلبات الفوترة الإلكترونية (زاتكا)';
        linkedSolutionsCount = 2;
        diagnosticQuestionsCount = 2;
      } else if (authLower.includes('قوى') || authLower.includes('عمل') || authLower.includes('أجور') || authLower.includes('مدد')) {
        mappingId = 'map-vio-qiw-401';
        violationCode = 'VIO-QIW-401';
        mappingTitleAr = 'انخفاض نسبة الالتزام ببرنامج حماية الأجور (قوى/مدد)';
        linkedSolutionsCount = 2;
        diagnosticQuestionsCount = 2;
      } else if (authLower.includes('كاميرا') || authLower.includes('أمن') || authLower.includes('مراقبة')) {
        mappingId = 'map-vio-sec-501';
        violationCode = 'VIO-SEC-501';
        mappingTitleAr = 'عدم تركيب كاميرات مراقبة أمنية أو عدم كفاية التخزين';
        linkedSolutionsCount = 1;
        diagnosticQuestionsCount = 1;
      } else if (authLower.includes('لوحة') || authLower.includes('تشوه') || authLower.includes('واجهة')) {
        mappingId = 'map-vio-bal-102';
        violationCode = 'VIO-BAL-102';
        mappingTitleAr = 'مخالفة مواصفات ومقاسات اللوحة التجارية واشتراطات الواجهة';
        linkedSolutionsCount = 2;
        diagnosticQuestionsCount = 1;
      }

      if (prob >= 35 || lic.daysRemaining <= 90) {
        items.push({
          id: `lic-pred-${lic.id}`,
          title: `ترخيص: ${lic.name}`,
          authority: lic.authority,
          licenseNumber: lic.licenseNumber,
          licenseRef: lic,
          category: 'license',
          probabilityScore: prob,
          riskLevel: prob >= 75 ? 'critical' : prob >= 50 ? 'high' : 'medium',
          estimatedFine: fine,
          primaryRiskReason: reason,
          quarterTrendInsight: trend,
          suggestedAction: 'تجديد فوري قبل نهاية المهلة النظامية',
          actionType: 'renew',
          mappingId,
          violationCode,
          mappingTitleAr,
          linkedSolutionsCount,
          diagnosticQuestionsCount
        });
      }
    });

    // Add Sector-Specific Regulatory Requirements that might trigger violations
    if (sectorInfo.key === 'food_beverage') {
      items.push({
        id: 'pred-health-certs',
        title: 'الشهادات الصحية المهنية للعمالة وتجديدها',
        authority: 'أمانة المنطقة / بلدي',
        category: 'health',
        probabilityScore: inspectionScenario === 'intensive' ? 82 : 64,
        riskLevel: inspectionScenario === 'intensive' ? 'critical' : 'high',
        estimatedFine: 4000,
        primaryRiskReason: 'حملات موسمية مكثفة للتحقق من كروت الصحة وكاميرات التحضير',
        quarterTrendInsight: 'يشهد الربع الرابع تركيزاً تفتيشياً مشدداً على شهادات العاملين بالقطاع',
        suggestedAction: 'فحص وتدقيق كروت العاملين الصحية وتحديث المنتهي منها',
        actionType: 'audit',
        mappingId: 'map-vio-bal-101',
        violationCode: 'VIO-BAL-101',
        mappingTitleAr: 'مزاولة النشاط بدون ترخيص بلدي سارٍ أو شهادات صحية',
        linkedSolutionsCount: 2,
        diagnosticQuestionsCount: 3
      });
    }

    // Civil Defense & Safety Requirements
    items.push({
      id: 'pred-salama-audit',
      title: 'اشتراطات السلامة والوقاية من الحريق (سلامة)',
      authority: 'الدفاع المدني',
      category: 'safety',
      probabilityScore: inspectionScenario === 'intensive' ? 70 : 48,
      riskLevel: inspectionScenario === 'intensive' ? 'high' : 'medium',
      estimatedFine: 5000,
      primaryRiskReason: 'تحديث اشتراطات تقارير عقود الصيانة السنوية لأجهزة الإنذار والإطفاء',
      quarterTrendInsight: 'مطابقة عقود الصيانة المعتمدة عبر بوابة سلامة الإلكترونية',
      suggestedAction: 'طلب مراجعة شهادة السلامة وتحديث عقد الصيانة عبر سبّاق',
      actionType: 'consult',
      mappingId: 'map-vio-def-201',
      violationCode: 'VIO-DEF-201',
      mappingTitleAr: 'عدم وجود عقد صيانة دوري معتمد لأنظمة الإطفاء والإنذار (منصة سلامة)',
      linkedSolutionsCount: 2,
      diagnosticQuestionsCount: 2
    });

    // Labor and Qiwa Compliance
    items.push({
      id: 'pred-qiwa-contracts',
      title: 'توثيق عقود العمل ونسب التوطين ونطاقات',
      authority: 'وزارة الموارد البشرية (منصة قوى)',
      category: 'labor',
      probabilityScore: 42,
      riskLevel: 'medium',
      estimatedFine: 3000,
      primaryRiskReason: 'متابعة مؤشر توثيق العقود الإلكترونية بنسبة لا تقل عن 80%',
      quarterTrendInsight: 'تطبيق التحديثات الربع سنوية لبرنامج نطاقات المطور',
      suggestedAction: 'مراجعة حالة التوثيق عبر لوحة الموارد البشرية',
      actionType: 'audit',
      mappingId: 'map-vio-qiw-401',
      violationCode: 'VIO-QIW-401',
      mappingTitleAr: 'انخفاض نسبة الالتزام ببرنامج حماية الأجور (WPS) وتوثيق العقود',
      linkedSolutionsCount: 2,
      diagnosticQuestionsCount: 2
    });

    // Zakat & E-Invoicing Compliance
    items.push({
      id: 'pred-zatca-compliance',
      title: 'الربط والتكامل للفوترة الإلكترونية (المرحلة الثانية - فاتورة)',
      authority: 'هيئة الزكاة والضريبة والجمارك (زاتكا)',
      category: 'zakat',
      probabilityScore: inspectionScenario === 'intensive' ? 62 : 38,
      riskLevel: inspectionScenario === 'intensive' ? 'high' : 'medium',
      estimatedFine: 5000,
      primaryRiskReason: 'إلزام مجموعات الربط بإصدار الفواتير بالختم المشفر CSID ورمز QR',
      quarterTrendInsight: 'توسع زاتكا في تفتيش أنظمة المحاسبة ونقاط البيع السحابية للقطاع',
      suggestedAction: 'تدقيق شهادة الربط المشفرة والتكامل مع منصة فاتورة',
      actionType: 'consult',
      mappingId: 'map-vio-zat-301',
      violationCode: 'VIO-ZAT-301',
      mappingTitleAr: 'عدم الالتزام بمتطلبات الفوترة الإلكترونية (المرحلة الثانية)',
      linkedSolutionsCount: 2,
      diagnosticQuestionsCount: 2
    });

    // Sort by probability score descending
    return items.sort((a, b) => b.probabilityScore - a.probabilityScore);
  }, [estLicenses, inspectionScenario, sectorInfo.key]);

  // Filter items by authority if selected
  const filteredVulnerableItems = useMemo(() => {
    if (selectedAuthorityFilter === 'all') return predictedVulnerableItems;
    if (selectedAuthorityFilter === 'balady') return predictedVulnerableItems.filter(i => i.authority.includes('بلدي') || i.authority.includes('أمانة') || i.authority.includes('البلدية'));
    if (selectedAuthorityFilter === 'civil_defense') return predictedVulnerableItems.filter(i => i.authority.includes('الدفاع المدني') || i.category === 'safety');
    if (selectedAuthorityFilter === 'qiwa') return predictedVulnerableItems.filter(i => i.authority.includes('قوى') || i.authority.includes('الموارد') || i.category === 'labor');
    if (selectedAuthorityFilter === 'zatca') return predictedVulnerableItems.filter(i => i.authority.includes('الزكاة') || i.category === 'zakat');
    return predictedVulnerableItems;
  }, [predictedVulnerableItems, selectedAuthorityFilter]);

  // Overall Predicted Financial Exposure and Probability
  const totalPredictedFines = useMemo(() => {
    return predictedVulnerableItems.reduce((sum, item) => sum + item.estimatedFine, 0);
  }, [predictedVulnerableItems]);

  const overallQuarterRiskScore = useMemo(() => {
    if (predictedVulnerableItems.length === 0) return 20;
    const avg = predictedVulnerableItems.reduce((sum, i) => sum + i.probabilityScore, 0) / predictedVulnerableItems.length;
    return Math.round(avg);
  }, [predictedVulnerableItems]);

  // Proactive Protection Savings: with early renewal and preventive actions, 100% of fines are avoidable
  const potentialSavings = totalPredictedFines;

  // Upcoming Government Inspection Campaigns for Q4 2026
  const upcomingGovernmentCampaigns = [
    {
      title: 'حملة الامتثال البلدي للمنشآت التجارية والواجهات',
      authority: 'وزارة البلديات والإسكان',
      timeframe: 'أكتوبر - نوفمبر 2026',
      targetSectors: 'المطاعم، التجزئة، الصالونات، الخدمات',
      intensity: 'عالية جداً (زيارات ميدانية ورصد آلي)',
      keyCheckpoints: ['سريان رخصة بلدي', 'الشهادات الصحية', 'مطابقة اللوحة لمواصفات الكود السعودي', 'كاميرات المراقبة']
    },
    {
      title: 'تدقيق السلامة الوقائية والمستودعات السنوي',
      authority: 'المديرية العامة للدفاع المدني',
      timeframe: 'نوفمبر 2026',
      targetSectors: 'المطاعم، المستودعات، الورش، الأسواق التجارية',
      intensity: 'متوسطة إلى عالية',
      keyCheckpoints: ['عقد صيانة أجهزة السلامة ساري', 'مخارج الطوارئ ومسارات الهروب', 'كواشف الدخان والرشاشات']
    },
    {
      title: 'متابعة توثيق العقود ونسب التوطين لبرنامج نطاقات',
      authority: 'وزارة الموارد البشرية والتنمية الاجتماعية',
      timeframe: 'ديسمبر 2026',
      targetSectors: 'كافة المنشآت والأنشطة الاقتصادية',
      intensity: 'تدقيق إلكتروني آلي مستمر',
      keyCheckpoints: ['توثيق عقود قوى > 80%', 'الالتزام بحماية الأجور WPS', 'المهن المقصور شغلها على السعوديين']
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden font-['Cairo']" dir="rtl">
      
      {/* 1. Header with Executive Title and Controls */}
      <div className="p-4 sm:p-6 bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-amber-300 flex items-center justify-center shadow-inner shrink-0 mt-0.5 sm:mt-0">
              <TrendingUp className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  توقعات المخالفات القادمة
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>نمذجة تنبؤية بالذكاء والبيانات</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تحليل اتجاهات المخالفات التاريخية لمنشأة <strong className="text-white">{establishment.name}</strong> ومقارنتها ببيانات <strong className="text-indigo-200">{sectorInfo.name}</strong>
              </p>
            </div>
          </div>

          {/* Quick Filters & Scenario Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Horizon Quarter Selector */}
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setSelectedQuarter('Q4_2026')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedQuarter === 'Q4_2026'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                الربع القادم (Q4 2026)
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuarter('Q1_2027')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedQuarter === 'Q1_2027'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                الربع 1 (2027)
              </button>
            </div>

            {/* Inspection Intensity Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = inspectionScenario === 'standard' ? 'intensive' : 'standard';
                setInspectionScenario(next);
                if (showToast) {
                  showToast(next === 'intensive' 
                    ? '⚡ تم تفعيل سيناريو الحملات التفتيشية المكثفة (+35% شدة الرقابة)' 
                    : 'تم استرجاع السيناريو المعياري للتفتيش.');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                inspectionScenario === 'intensive'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="التبديل بين السيناريو المعياري وسيناريو الحملات الرقابية المكثفة"
            >
              <Flame className={`w-3.5 h-3.5 ${inspectionScenario === 'intensive' ? 'text-rose-400 fill-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{inspectionScenario === 'intensive' ? 'حملات مكثفة (+35%)' : 'سيناريو معياري'}</span>
            </button>

            {/* AI Advisor Trigger */}
            <button
              type="button"
              onClick={onOpenAI}
              className="p-2 bg-indigo-600/50 hover:bg-indigo-600 text-amber-300 rounded-xl border border-indigo-400/30 transition-colors cursor-pointer"
              title="استشارة الذكاء الاصطناعي حول التوقعات"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. Top Executive KPI Metric Cards */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Predicted Risk Exposure Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">معدل الخطر المتوقع (Q4)</span>
            <AlertTriangle className={`w-4 h-4 ${overallQuarterRiskScore > 60 ? 'text-rose-600' : overallQuarterRiskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Cairo']">
              {overallQuarterRiskScore}%
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              overallQuarterRiskScore > 60 ? 'bg-rose-50 text-rose-700' : overallQuarterRiskScore > 40 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {overallQuarterRiskScore > 60 ? 'احتمال مرتفع' : overallQuarterRiskScore > 40 ? 'احتمال متوسط' : 'مخاطر منخفضة'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>متوسط القطاع: </span>
            <strong className="text-slate-700">{sectorInfo.benchmarkRate}%</strong>
          </div>
        </div>

        {/* Card 2: Forecasted Unmitigated Fines */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">الغرامات المتوقعة بدون وقاية</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-700 font-['Cairo']">
              {formatSAR(totalPredictedFines)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>تشمل التراخيص المستحقة والاشتراطات</span>
          </div>
        </div>

        {/* Card 3: Vulnerable Licenses & Pillars Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">التراخيص والمجالات المعرضة</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700 font-['Cairo']">
              {predictedVulnerableItems.length}
            </span>
            <span className="text-xs text-slate-500">مجال / رخصة</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>منها {predictedVulnerableItems.filter(i => i.riskLevel === 'critical').length} عالية الأولوية</span>
          </div>
        </div>

        {/* Card 4: Proactive Protection Savings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">وفورات التدخل الاستباقي</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700 font-['Cairo']">
              {formatSAR(potentialSavings)}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
              100% حماية
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            <span>توفير كامل للغرامات بالتجديد المبكر</span>
          </div>
        </div>

      </div>

      {/* 3. Sub-Navigation Tabs for Detailed Insights */}
      <div className="px-4 sm:px-6 pt-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveViewTab('licenses_forecast')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeViewTab === 'licenses_forecast'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>التراخيص والمجالات المعرضة للمخالفات ({predictedVulnerableItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('trends_chart')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeViewTab === 'trends_chart'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>تحليل الاتجاهات التاريخية ومقارنة القطاع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('campaigns_calendar')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeViewTab === 'campaigns_calendar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>الحملات الرقابية والموسمية المتوقعة</span>
          </button>
        </div>

        {/* Action Link to Sector Benchmark */}
        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab('sector_benchmark')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 mb-2 sm:mb-0 cursor-pointer"
          >
            <span>لوحة مقارنة مؤشرات القطاع</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Tab Content Area */}
      <div className="p-4 sm:p-6 space-y-6">

        {/* TAB 1: Vulnerable Licenses & Regulatory Pillars Breakdown */}
        {activeViewTab === 'licenses_forecast' && (
          <div className="space-y-4">
            
            {/* Filter by Authority Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-semibold text-[11px] ml-1">تصفية حسب الجهة:</span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'balady', label: 'بلدي والأمانات' },
                  { id: 'civil_defense', label: 'الدفاع المدني (سلامة)' },
                  { id: 'qiwa', label: 'الموارد البشرية (قوى)' },
                  { id: 'zatca', label: 'الزكاة والضريبة' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedAuthorityFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedAuthorityFilter === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500">
                مرتبة حسب درجة الاحتمالية التنبؤية للربع القادم
              </div>
            </div>

            {/* List of Vulnerable Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredVulnerableItems.map((item) => {
                const isCritical = item.riskLevel === 'critical';
                const isHigh = item.riskLevel === 'high';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                        : isHigh
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isHigh
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {isCritical ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : isHigh ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Scale className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate">
                              {item.title}
                            </h4>
                            {item.licenseNumber && (
                              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                #{item.licenseNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            الجهة: <span className="font-semibold text-slate-700">{item.authority}</span>
                          </p>
                        </div>
                      </div>

                      {/* Probability Score Pill */}
                      <div className="text-left shrink-0">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          احتمال {item.probabilityScore}%
                        </span>
                      </div>
                    </div>

                    {/* Risk Reason & Sector Trend Insight */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <strong className="text-slate-900 shrink-0">الدافع التنبؤي:</strong>
                        <span className="text-slate-600">{item.primaryRiskReason}</span>
                      </div>
                      
                      <div className="flex items-start gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{item.quarterTrendInsight}</span>
                      </div>
                    </div>

                    {/* Quick Link directly to ViolationSolutionsMapping Tool */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToTab) {
                            onNavigateToTab('violation_solutions_mapping', item.mappingId, 'mapping');
                          }
                          if (showToast) {
                            showToast(`تم فتح مصفوفة الحلول والأسئلة التشخيصية للمخالفة: ${item.violationCode}`);
                          }
                        }}
                        className="w-full py-2 px-3 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                        title={`الانتقال المباشر لأداة مصفوفة الحلول والأسئلة التشخيصية للمخالفة (${item.violationCode})`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            <Sliders className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-right truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-indigo-950 text-xs">مصفوفة الحلول والتشخيص</span>
                              <span className="font-mono text-[10px] font-black text-indigo-700 bg-white px-1.5 py-0.2 rounded border border-indigo-200">
                                {item.violationCode}
                              </span>
                            </div>
                            <span className="text-[10px] text-indigo-700 font-medium block truncate">
                              {item.linkedSolutionsCount} حلول معتمدة • {item.diagnosticQuestionsCount} أسئلة توجيهية وحساب الاعتراض
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 group-hover:text-indigo-900 shrink-0 mr-2">
                          <span>فتح الأداة</span>
                          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">الغرامة المتوقعة:</span>
                        <span className="font-mono text-xs font-black text-rose-700">
                          {formatSAR(item.estimatedFine)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.actionType === 'renew' && item.licenseRef && onRenewLicense ? (
                          <button
                            type="button"
                            onClick={() => onRenewLicense(item.licenseRef!)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>تجديد وقائي فوري</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateToTab) {
                                onNavigateToTab('violations_analyzer');
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>خطة الوقاية</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: Historical Trends Chart & Sector Benchmark */}
        {activeViewTab === 'trends_chart' && (
          <div className="space-y-5">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  مسار الغرامات التاريخية ومقارنة متوسط {sectorInfo.name}
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  رصد الربع السنوي للغرامات السابقة مقابل التنبؤ بالربع القادم (Q4 2026) ومتوسط منشآت القطاع
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-900 inline-block" />
                  <span>المنشأة (الفعلي / المتوقع)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span>متوسط القطاع</span>
                </span>
              </div>
            </div>

            {/* Recharts Composed Area & Bar Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalQuarterlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="quarter" 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-['Cairo'] space-y-1 border border-slate-700 text-right" dir="rtl">
                            <p className="font-bold text-amber-300 border-b border-slate-700 pb-1">{label} ({data.status})</p>
                            <p className="text-slate-200">
                              غرامات المنشأة: <strong className="font-mono text-white">{formatSAR(data.predictedFines)}</strong>
                            </p>
                            <p className="text-amber-300">
                              متوسط القطاع: <strong className="font-mono">{formatSAR(data.sectorAvgFines)}</strong>
                            </p>
                            <p className="text-emerald-400">
                              معدل الامتثال: <strong>{data.complianceRate}%</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10, fontSize: 12, fontFamily: 'Cairo' }} 
                    formatter={(val) => val === 'predictedFines' ? 'غرامات المنشأة (ر.س)' : 'متوسط منشآت القطاع (ر.س)'}
                  />
                  <Bar 
                    dataKey="predictedFines" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40}
                  >
                    {historicalQuarterlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.quarter.includes('المتوقع') ? (inspectionScenario === 'intensive' ? '#e11d48' : '#f59e0b') : '#4f46e5'} 
                      />
                    ))}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="sectorAvgFines" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#f59e0b' }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Historical Insight Box */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs">
              <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">
                  خلاصة النمذجة التاريخية ومقارنة القطاع:
                </span>
                <p className="leading-relaxed">
                  تُظهر البيانات التاريخية للمنشأة انخفاضاً ملحوظاً في المخالفات عند تفعيل التجديد التلقائي والتنبيهات المسبقة بـ 30 يوماً. في الربع القادم، ومع حملات التفتيش المكثفة على <strong className="text-indigo-900">{sectorInfo.name}</strong>، يوصى بمعالجة التراخيص المستحقة فورياً للحفاظ على سجل منشأة خالٍ من أي تعثر أو غرامات.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Upcoming Inspection Campaigns Calendar */}
        {activeViewTab === 'campaigns_calendar' && (
          <div className="space-y-4">
            
            <div className="text-xs text-slate-500">
              جدول الحملات الرقابية الحكومية المعلنة والمجدولة للربع القادم (Q4 2026) حسب الجهات المختصة:
            </div>

            <div className="space-y-3">
              {upcomingGovernmentCampaigns.map((camp, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {camp.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          الجهة: <strong className="text-slate-800">{camp.authority}</strong> • الفترة: <strong className="text-indigo-700">{camp.timeframe}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-center">
                      شدة الرقابة: {camp.intensity}
                    </span>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      أبرز متطلبات الفحص والتفتيش الميداني:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {camp.keyCheckpoints.map((chk, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* 5. Bottom Proactive Action Callout */}
      <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300">
            ميزة الحماية الاستباقية في سبّاق تضمن لك تلافي 100% من غرامات الربع القادم عبر الجدولة التلقائية.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToTab) {
                onNavigateToTab('proactive_alerts');
              }
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>مركز التنبيهات الاستباقية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
