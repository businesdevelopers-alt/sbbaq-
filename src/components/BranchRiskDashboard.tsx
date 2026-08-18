import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  RotateCw,
  Eye,
  Filter,
  BarChart3,
  Activity,
  Compass,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Establishment, Branch, License, ComplianceViolation, MasterOrder } from '../types';
import { formatSAR, getRiskLevelBadge } from '../utils/complianceEngine';

interface BranchRiskDashboardProps {
  establishment: Establishment;
  branches: Branch[];
  licenses: License[];
  violations: ComplianceViolation[];
  orders?: MasterOrder[];
  onRenewLicense?: (licenseId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onConsultSpecialist?: (topic: string) => void;
}

// Distinct vibrant colors for branch visualization
const BRANCH_COLORS = [
  '#2563eb', // Royal Blue
  '#059669', // Emerald
  '#dc2626', // Crimson Red
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#475569', // Slate
];

export const BranchRiskDashboard: React.FC<BranchRiskDashboardProps> = ({
  establishment,
  branches,
  licenses,
  violations,
  orders,
  onRenewLicense,
  onNavigateToTab,
  onConsultSpecialist
}) => {
  // Filter branches for this establishment
  const establishmentBranches = useMemo(() => {
    const matched = branches.filter(b => b.establishmentId === establishment.id);
    if (matched.length > 0) return matched;
    
    // Fallback if no matching branches exist: generate main and secondary branch
    return [
      {
        id: `br-main-${establishment.id}`,
        establishmentId: establishment.id,
        name: `الفرع الرئيسي - ${establishment.district || 'المركز'}`,
        branchCode: 'MAIN-01',
        city: establishment.city,
        district: establishment.district || 'الوسط',
        employeesCount: establishment.totalEmployees || 15,
        isMainBranch: true,
        riskScore: establishment.riskScore || 45,
        status: 'active' as const,
        municipality: `أمانة ${establishment.city}`,
        inspectionZoneDensity: 'medium' as const,
        lastInspectionDate: '2026-07-20',
        activeCampaigns: ['حملة الامتثال البلدي الشامل']
      }
    ];
  }, [branches, establishment]);

  // Selected branch filter for line chart focus
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [metricMode, setMetricMode] = useState<'riskScore' | 'potentialFines' | 'complianceScore'>('riskScore');
  const [radarSelectedBranchId, setRadarSelectedBranchId] = useState<string>(
    establishmentBranches[0]?.id || ''
  );

  // Generate deterministic 6-month historical trend dataset for each branch
  const { monthlyTrends, branchTrajectories, branchStats } = useMemo(() => {
    const months = [
      'مارس 2026',
      'أبريل 2026',
      'مايو 2026',
      'يونيو 2026',
      'يوليو 2026',
      'أغسطس 2026 (الحالي)',
    ];

    // Build specific historical trends for each branch based on current riskScore and profile
    const trajectories: Record<string, number[]> = {};
    const fineTrajectories: Record<string, number[]> = {};

    establishmentBranches.forEach((branch, idx) => {
      const currentScore = branch.riskScore ?? (40 + (idx * 15) % 50);
      
      // Compute 6-month trajectory based on branch ID or profile
      if (branch.id === 'br-1') {
        // High risk escalation
        trajectories[branch.id] = [32, 40, 52, 60, 68, currentScore]; // current ~72
        fineTrajectories[branch.id] = [0, 2000, 5000, 10000, 15000, 25000];
      } else if (branch.id === 'br-2') {
        // Excellent improvement
        trajectories[branch.id] = [48, 42, 35, 32, 30, currentScore]; // current ~30
        fineTrajectories[branch.id] = [5000, 4000, 2000, 0, 0, 0];
      } else if (branch.id === 'br-3') {
        // Critical beach/coastal branch
        trajectories[branch.id] = [55, 62, 70, 76, 80, currentScore]; // current ~85
        fineTrajectories[branch.id] = [6000, 12000, 20000, 28000, 35000, 48000];
      } else if (branch.id === 'br-4') {
        // Moderate fluctuating
        trajectories[branch.id] = [38, 45, 40, 48, 44, currentScore]; // current ~45
        fineTrajectories[branch.id] = [2000, 4000, 3000, 6000, 5000, 6000];
      } else if (branch.id === 'br-5' || branch.id === 'br-6') {
        // Tech company branches
        trajectories[branch.id] = [20, 22, 18, 16, 15, currentScore];
        fineTrajectories[branch.id] = [0, 0, 0, 0, 0, 0];
      } else if (branch.id === 'br-7' || branch.id === 'br-8') {
        // Construction branches
        trajectories[branch.id] = [50, 60, 72, 78, 82, currentScore];
        fineTrajectories[branch.id] = [5000, 12000, 22000, 30000, 40000, 55000];
      } else {
        // Generic fallback calculation
        const base = Math.max(15, currentScore - 15);
        trajectories[branch.id] = [
          base,
          Math.min(95, base + 4),
          Math.min(95, base + 8),
          Math.min(95, base + 11),
          Math.min(95, base + 13),
          currentScore
        ];
        fineTrajectories[branch.id] = [
          0,
          Math.max(0, currentScore * 50),
          Math.max(0, currentScore * 100),
          Math.max(0, currentScore * 150),
          Math.max(0, currentScore * 200),
          Math.max(0, currentScore * 250)
        ];
      }
    });

    // Structure data for Recharts LineChart
    const monthlyData = months.map((m, monthIdx) => {
      const row: any = { month: m };
      let sumRisk = 0;
      let sumFines = 0;

      establishmentBranches.forEach((branch) => {
        const score = trajectories[branch.id][monthIdx];
        const fines = fineTrajectories[branch.id][monthIdx];
        const compliance = Math.max(5, 100 - score);

        row[`${branch.id}_risk`] = score;
        row[`${branch.id}_fines`] = fines;
        row[`${branch.id}_compliance`] = compliance;
        
        sumRisk += score;
        sumFines += fines;
      });

      row.avg_risk = Math.round(sumRisk / establishmentBranches.length);
      row.total_fines = sumFines;
      row.avg_compliance = Math.max(5, 100 - row.avg_risk);

      return row;
    });

    // Compute stats per branch
    const stats = establishmentBranches.map((branch, idx) => {
      const traj = trajectories[branch.id] || [40, 40, 40, 40, 40, 40];
      const fineTraj = fineTrajectories[branch.id] || [0, 0, 0, 0, 0, 0];
      const startScore = traj[0];
      const endScore = traj[traj.length - 1];
      const delta = endScore - startScore;
      const currentFine = fineTraj[fineTraj.length - 1];
      const isImproving = delta < 0;

      // Count licenses for this branch
      const branchLicenses = licenses.filter(
        l => l.establishmentId === establishment.id
      );
      // Count violations
      const branchViolations = violations.filter(
        v => v.establishmentId === establishment.id && (v.branchName?.includes(branch.district) || v.branchName?.includes(branch.name) || idx === 0)
      );

      return {
        branch,
        startScore,
        currentScore: endScore,
        delta,
        isImproving,
        currentFine,
        color: BRANCH_COLORS[idx % BRANCH_COLORS.length],
        licensesCount: branchLicenses.length,
        violationsCount: branchViolations.length,
        riskLevel: endScore >= 80 ? 'critical' : endScore >= 60 ? 'high' : endScore >= 30 ? 'medium' : 'low'
      };
    });

    return {
      monthlyTrends: monthlyData,
      branchTrajectories: trajectories,
      branchStats: stats
    };
  }, [establishmentBranches, establishment.id, licenses, violations]);

  // Overall Highest Risk and Most Improved Branches
  const highestRiskBranch = useMemo(() => {
    return [...branchStats].sort((a, b) => b.currentScore - a.currentScore)[0];
  }, [branchStats]);

  const mostImprovedBranch = useMemo(() => {
    return [...branchStats].sort((a, b) => a.delta - b.delta)[0];
  }, [branchStats]);

  const totalBranchesFines = useMemo(() => {
    return branchStats.reduce((acc, curr) => acc + curr.currentFine, 0);
  }, [branchStats]);

  const enterpriseAvgRisk = useMemo(() => {
    if (branchStats.length === 0) return 0;
    return Math.round(branchStats.reduce((acc, curr) => acc + curr.currentScore, 0) / branchStats.length);
  }, [branchStats]);

  // Radar chart data for compliance pillars across selected branch
  const radarData = useMemo(() => {
    const targetBranch = branchStats.find(b => b.branch.id === radarSelectedBranchId) || branchStats[0];
    const score = targetBranch ? targetBranch.currentScore : 50;

    // Derived 5-pillar scores (100 is perfect, 0 is full violation)
    const baladyScore = Math.max(10, 100 - (score * 1.1));
    const civilDefenseScore = Math.max(15, 100 - (score * 0.95));
    const qiwaScore = Math.max(25, 100 - (score * 0.7));
    const zatcaScore = Math.max(30, 100 - (score * 0.5));
    const healthSafetyScore = Math.max(10, 100 - (score * 1.05));

    // Enterprise average pillars
    const avgScore = enterpriseAvgRisk;
    const avgBalady = Math.max(10, 100 - (avgScore * 1.1));
    const avgCivilDefense = Math.max(15, 100 - (avgScore * 0.95));
    const avgQiwa = Math.max(25, 100 - (avgScore * 0.7));
    const avgZatca = Math.max(30, 100 - (avgScore * 0.5));
    const avgHealthSafety = Math.max(10, 100 - (avgScore * 1.05));

    return [
      {
        pillar: 'التراخيص البلدية (بلدي)',
        branchScore: Math.round(baladyScore),
        benchmark: Math.round(avgBalady),
        fullMark: 100
      },
      {
        pillar: 'السلامة والدفاع المدني',
        branchScore: Math.round(civilDefenseScore),
        benchmark: Math.round(avgCivilDefense),
        fullMark: 100
      },
      {
        pillar: 'التوطين وقوى والعمل',
        branchScore: Math.round(qiwaScore),
        benchmark: Math.round(avgQiwa),
        fullMark: 100
      },
      {
        pillar: 'الزكاة والفوترة الإلكترونية',
        branchScore: Math.round(zatcaScore),
        benchmark: Math.round(avgZatca),
        fullMark: 100
      },
      {
        pillar: 'الصحة والبيئة المهنية',
        branchScore: Math.round(healthSafetyScore),
        benchmark: Math.round(avgHealthSafety),
        fullMark: 100
      },
    ];
  }, [radarSelectedBranchId, branchStats, enterpriseAvgRisk]);

  // Custom LineChart Tooltip
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-right min-w-[260px] space-y-2.5 font-['Cairo'] text-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{label}</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
              مقارنة الفروع
            </span>
          </div>

          <div className="space-y-2 divide-y divide-slate-800">
            {payload.map((entry: any, i: number) => {
              const branchId = entry.dataKey.replace('_risk', '').replace('_fines', '').replace('_compliance', '');
              const isAvg = entry.dataKey.startsWith('avg_') || entry.dataKey.startsWith('total_');
              const branch = establishmentBranches.find(b => b.id === branchId);
              const branchName = isAvg ? 'المتوسط العام للمنشأة' : (branch?.name || entry.name);

              return (
                <div key={i} className="pt-1.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`truncate max-w-[150px] ${isAvg ? 'font-bold text-amber-300' : 'text-slate-200'}`}>
                      {branchName}
                    </span>
                  </div>
                  <strong className={`font-extrabold ${
                    metricMode === 'riskScore'
                      ? entry.value >= 60 ? 'text-rose-400' : entry.value >= 30 ? 'text-amber-400' : 'text-emerald-400'
                      : metricMode === 'potentialFines' ? 'text-rose-300' : 'text-emerald-300'
                  }`}>
                    {metricMode === 'riskScore'
                      ? `${entry.value} / 100`
                      : metricMode === 'potentialFines'
                      ? formatSAR(entry.value)
                      : `${entry.value}%`}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Branches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block mb-1">
              إجمالي فروع المنشأة المراقبة
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-extrabold text-slate-900 font-['Cairo']">
                {establishmentBranches.length}
              </strong>
              <span className="text-xs text-slate-500">فروع نشطة</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مربوطة بالرقابة المستمرة</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Enterprise Average Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block mb-1">
              متوسط مؤشر المخاطر للمنشأة
            </span>
            <div className="flex items-baseline gap-2">
              <strong className={`text-2xl font-extrabold font-['Cairo'] ${
                enterpriseAvgRisk >= 60 ? 'text-rose-700' : enterpriseAvgRisk >= 30 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {enterpriseAvgRisk}
              </strong>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {enterpriseAvgRisk >= 60 ? 'نطاق مخاطر مرتفع' : enterpriseAvgRisk >= 30 ? 'نطاق تنبيهي متوسط' : 'نطاق آمن وممتثل'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            enterpriseAvgRisk >= 60 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : enterpriseAvgRisk >= 30 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Highest Risk Branch */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs text-rose-800 font-bold block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>الفرع الأكثر خطورة حالياً</span>
            </span>
            <h4 className="font-bold text-slate-900 text-sm truncate font-['Cairo']" title={highestRiskBranch?.branch.name}>
              {highestRiskBranch?.branch.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-extrabold text-rose-700">
                مؤشر: {highestRiskBranch?.currentScore}/100
              </span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                +{highestRiskBranch?.delta} خلال 6 أشهر
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Most Improved Branch */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs text-emerald-800 font-bold block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>الفرع الأكثر تحسناً (6 أشهر)</span>
            </span>
            <h4 className="font-bold text-slate-900 text-sm truncate font-['Cairo']" title={mostImprovedBranch?.branch.name}>
              {mostImprovedBranch?.branch.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-extrabold text-emerald-700">
                مؤشر: {mostImprovedBranch?.currentScore}/100
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {mostImprovedBranch?.delta} نقطة (تحسن)
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main 6-Month Evolution Line Chart Component */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                  <span>مسار واتجاهات مخاطر الامتثال عبر فروع المنشأة (آخر 6 أشهر)</span>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                    مارس 2026 - أغسطس 2026
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  مقارنة حية لتقلبات مؤشر المخاطر والغرامات التقديرية بين كافة الفروع لرصد الفروع الصاعدة في المخاطر وتداركها
                </p>
              </div>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setMetricMode('riskScore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  metricMode === 'riskScore'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مؤشر المخاطر (0 - 100)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('potentialFines')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  metricMode === 'potentialFines'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الغرامات التقديرية (ر.س)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('complianceScore')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  metricMode === 'complianceScore'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نسبة الامتثال (%)
              </button>
            </div>
          </div>
        </div>

        {/* Branch Interactive Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1 ml-1">
            <Filter className="w-3.5 h-3.5" />
            <span>عرض الفروع:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedBranchId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              selectedBranchId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>جميع الفروع ({establishmentBranches.length})</span>
          </button>

          {branchStats.map((item) => (
            <button
              key={item.branch.id}
              type="button"
              onClick={() => setSelectedBranchId(item.branch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedBranchId === item.branch.id
                  ? 'bg-white text-slate-900 shadow-xs ring-2'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              style={{
                borderColor: selectedBranchId === item.branch.id ? item.color : undefined,
                ...(selectedBranchId === item.branch.id ? { ['--tw-ring-color' as any]: item.color } : {})
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.branch.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                item.currentScore >= 60 ? 'bg-rose-100 text-rose-800' : item.currentScore >= 30 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {item.currentScore}
              </span>
            </button>
          ))}
        </div>

        {/* Recharts Main LineChart Container */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrends}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, Alexandria, sans-serif' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              
              <YAxis 
                domain={metricMode === 'riskScore' || metricMode === 'complianceScore' ? [0, 100] : ['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, Alexandria, sans-serif' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(val) => {
                  if (metricMode === 'potentialFines') {
                    return val >= 1000 ? `${(val/1000).toFixed(0)}k` : `${val}`;
                  }
                  return `${val}`;
                }}
              />

              <Tooltip content={<CustomLineTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'Cairo, sans-serif' }} 
              />

              {/* Reference Lines for Risk Benchmarks */}
              {metricMode === 'riskScore' && (
                <>
                  <ReferenceLine 
                    y={60} 
                    stroke="#f43f5e" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'حد الخطر المرتفع (60)', 
                      position: 'top', 
                      fill: '#e11d48', 
                      fontSize: 10, 
                      fontFamily: 'Cairo, sans-serif' 
                    }} 
                  />
                  <ReferenceLine 
                    y={30} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'النطاق الأخضر الآمن (30)', 
                      position: 'bottom', 
                      fill: '#059669', 
                      fontSize: 10, 
                      fontFamily: 'Cairo, sans-serif' 
                    }} 
                  />
                </>
              )}

              {/* Dynamic Lines for Each Branch */}
              {branchStats.map((item) => {
                const isHidden = selectedBranchId !== 'all' && selectedBranchId !== item.branch.id;
                if (isHidden) return null;

                const dataKeySuffix = metricMode === 'riskScore' ? '_risk' : metricMode === 'potentialFines' ? '_fines' : '_compliance';
                const key = `${item.branch.id}${dataKeySuffix}`;

                return (
                  <Line
                    key={item.branch.id}
                    type="monotone"
                    dataKey={key}
                    name={item.branch.name}
                    stroke={item.color}
                    strokeWidth={selectedBranchId === item.branch.id ? 4 : 2.5}
                    dot={{ 
                      r: 4.5, 
                      strokeWidth: 2, 
                      fill: '#ffffff',
                      stroke: item.color 
                    }}
                    activeDot={{ 
                      r: 7, 
                      strokeWidth: 3, 
                      fill: item.color,
                      stroke: '#ffffff' 
                    }}
                    animationDuration={1000}
                  />
                );
              })}

              {/* Average Line when viewing all branches */}
              {selectedBranchId === 'all' && (
                <Line
                  type="monotone"
                  dataKey={metricMode === 'riskScore' ? 'avg_risk' : metricMode === 'potentialFines' ? 'total_fines' : 'avg_compliance'}
                  name={metricMode === 'potentialFines' ? 'إجمالي الغرامات' : 'المتوسط العام للمنشأة'}
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Key Insight Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              📊 التقييم المقارن للفروع:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              يوجد <strong>{branchStats.filter(b => b.riskLevel === 'high' || b.riskLevel === 'critical').length} فروع</strong> في النطاق الخطر تستلزم تدخل إداري فوري، بينما <strong>{branchStats.filter(b => b.riskLevel === 'low').length} فروع</strong> تحقق الامتثال الأخضر المستدام.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              📈 أكثر الفروع تصاعداً في المخاطر:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              فرع «<strong>{highestRiskBranch?.branch.name}</strong>» تصاعد بنسبة <strong>+{highestRiskBranch?.delta} نقطة</strong> نتيجة تراكم الشهادات الصحية وتأخر تجديد رخصة السلامة.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              🛡️ الوفر المالي المتحقق:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              نجح فرع «<strong>{mostImprovedBranch?.branch.name}</strong>» في تفادي غرامات متوقعة تفوق <strong>15,000 ر.س</strong> عبر المعالجة المبكرة لاشتراطات الواجهة.
            </p>
          </div>
        </div>

      </div>

      {/* Dual Analysis Grid: Bar Comparison & 5-Pillar Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bar Chart: Current Risk vs Fines by Branch (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  مقارنة الفروع الحالية: مؤشر المخاطر والغرامات التقديرية
                </h3>
                <span className="text-xs text-slate-500">
                  تحليل مباشر لدرجة الخطورة والالتزامات المالية المتوقعة لكل فرع
                </span>
              </div>
            </div>

            <div className="w-full h-72 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchStats.map(s => ({
                    name: s.branch.name.split('-')[0].trim(),
                    riskScore: s.currentScore,
                    fineExposure: Math.round(s.currentFine / 100), // scaled for dual readability
                    rawFine: s.currentFine,
                    color: s.color,
                    branchObj: s
                  }))}
                  margin={{ top: 15, right: 10, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any, item: any) => {
                      if (name === 'مؤشر المخاطر') return [`${val} / 100`, name];
                      return [formatSAR(item.payload.rawFine), 'الغرامات التقديرية'];
                    }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px', textAlign: 'right' }}
                  />
                  <ReferenceLine y={60} stroke="#f43f5e" strokeDasharray="3 3" />
                  <Bar 
                    dataKey="riskScore" 
                    name="مؤشر المخاطر" 
                    radius={[8, 8, 0, 0]}
                  >
                    {branchStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.currentScore >= 80 ? '#dc2626' : entry.currentScore >= 60 ? '#ea580c' : entry.currentScore >= 30 ? '#d97706' : '#16a34a'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
              <span>مخاطر حرجة (&gt;=60)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>مخاطر متوسطة (30 - 59)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
              <span>نطاق آمن (&lt;30)</span>
            </span>
          </div>
        </div>

        {/* Radar Chart: 5 Pillars Compliance Radar (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                  رادار محاور الامتثال الخمسة
                </h3>
                <span className="text-xs text-slate-500">
                  مقارنة ركائز الامتثال للفرع مع المعيار العام
                </span>
              </div>
            </div>

            {/* Branch Selector for Radar */}
            <div className="mb-2">
              <select
                value={radarSelectedBranchId}
                onChange={(e) => setRadarSelectedBranchId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {establishmentBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    رادار فرع: {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="pillar" 
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Cairo, sans-serif' }} 
                  />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                  <Radar
                    name="درجة امتثال الفرع"
                    dataKey="branchScore"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="متوسط المنشأة"
                    dataKey="benchmark"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.15}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px', textAlign: 'right' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Cairo, sans-serif' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
            <span>كلما اتسعت المساحة الخضراء نحو الأطراف، دلّ ذلك على نضج وسلامة الامتثال.</span>
          </div>
        </div>

      </div>

      {/* Detailed Branch Benchmark & Action Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg font-['Cairo']">
              جدول المقارنة الشامل ومصفوفة مخاطر الفروع
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ترتيب الفروع وتتبع الحملات التفتيشية التابعة لبلدية كل نطاق مع الإجراءات الوقائية المقترحة
            </p>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('geo_map')}
              className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 self-start"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>عرض الفروع على الخريطة الجغرافية</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">الفرع والرمز</th>
                <th className="py-3 px-3">المدينة والحي</th>
                <th className="py-3 px-3">مؤشر المخاطر</th>
                <th className="py-3 px-3">مسار 6 أشهر</th>
                <th className="py-3 px-3">الغرامات المحتملة</th>
                <th className="py-3 px-3">كثافة الرقابة بالحي</th>
                <th className="py-3 px-3">الحملات النشطة</th>
                <th className="py-3 px-3 text-center">الإجراء الموصى به</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchStats
                .sort((a, b) => b.currentScore - a.currentScore)
                .map((item) => {
                  const b = item.branch;
                  const badge = getRiskLevelBadge(item.riskLevel);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Branch Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 font-['Cairo'] flex items-center gap-1">
                              <span>{b.name}</span>
                              {b.isMainBranch && (
                                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                                  رئيسي
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {b.branchCode || b.id} • {b.employeesCount} موظفين
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* City & District */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 font-medium">{b.city}</div>
                        <div className="text-[10px] text-slate-400">{b.district}</div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-extrabold font-['Cairo'] ${
                            item.currentScore >= 60 ? 'text-rose-700' : item.currentScore >= 30 ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {item.currentScore}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>

                      {/* 6-Month Delta */}
                      <td className="py-3.5 px-3">
                        {item.delta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+{item.delta} نقطة</span>
                          </span>
                        ) : item.delta < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>{item.delta} نقطة</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">ثابت (0)</span>
                        )}
                      </td>

                      {/* Potential Fines */}
                      <td className="py-3.5 px-3">
                        <strong className="text-slate-900 font-extrabold font-['Cairo']">
                          {formatSAR(item.currentFine)}
                        </strong>
                      </td>

                      {/* Inspection Density */}
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          b.inspectionZoneDensity === 'high'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : b.inspectionZoneDensity === 'medium'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {b.inspectionZoneDensity === 'high' ? '🔴 كثافة رقابية عالية' : b.inspectionZoneDensity === 'medium' ? '🟡 كثافة متوسطة' : '🟢 رقابة اعتيادية'}
                        </span>
                      </td>

                      {/* Active Campaigns */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        {b.activeCampaigns && b.activeCampaigns.length > 0 ? (
                          <div className="text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded-lg border border-slate-200 line-clamp-2">
                            {b.activeCampaigns.join(' • ')}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">لا توجد حملات معلنة</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBranchId(b.id);
                              setRadarSelectedBranchId(b.id);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="عرض في الرادار والمنحنى"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onConsultSpecialist && (
                            <button
                              onClick={() => onConsultSpecialist(`تدقيق وقائي عاجل لفرع ${b.name}`)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors shrink-0"
                            >
                              طلب تدقيق
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
