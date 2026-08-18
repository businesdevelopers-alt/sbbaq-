import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Unlock, 
  FileText, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Smartphone, 
  Building2, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Share2, 
  Send, 
  Eye, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  RefreshCw,
  Layers,
  ArrowLeft,
  Mail,
  Phone,
  UserCheck,
  UserX,
  CreditCard,
  Scale,
  Zap
} from 'lucide-react';
import { 
  Establishment, 
  Branch, 
  TeamMember, 
  UserActivityLog, 
  EnterpriseRole, 
  PermissionKey, 
  UserActivityActionType 
} from '../types';
import { 
  PERMISSION_GROUPS, 
  ROLE_PRESETS 
} from '../data/teamPermissionsData';

interface TeamPermissionsManagerProps {
  establishment: Establishment;
  branches: Branch[];
  teamMembers: TeamMember[];
  activityLogs: UserActivityLog[];
  onAddMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onToggleMemberStatus: (memberId: string) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast: (msg: string) => void;
}

export const TeamPermissionsManager: React.FC<TeamPermissionsManagerProps> = ({
  establishment,
  branches,
  teamMembers,
  activityLogs,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onToggleMemberStatus,
  onConsultSpecialist,
  showToast,
}) => {
  // Navigation tabs within this module
  const [viewTab, setViewTab] = useState<'members' | 'activity_logs' | 'roles_matrix'>('members');
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | EnterpriseRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_activation' | 'suspended'>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');

  // Modal State for Add / Edit Member
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('الإدارة العامة');
  const [formRole, setFormRole] = useState<EnterpriseRole>('licenses_specialist');
  const [formAssignedBranches, setFormAssignedBranches] = useState<string[]>(['all']);
  const [formPermissions, setFormPermissions] = useState<PermissionKey[]>(
    ROLE_PRESETS.licenses_specialist.defaultPermissions
  );
  const [formTwoFactor, setFormTwoFactor] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('licenses');

  // Stats calculation
  const totalMembers = teamMembers.length;
  const activeMembersCount = teamMembers.filter(m => m.status === 'active').length;
  const nafathVerifiedCount = teamMembers.filter(m => m.nafathVerified).length;
  const totalDailyActions = teamMembers.reduce((sum, m) => sum + (m.dailyActionsCount || 0), 0);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchJob = m.jobTitle.toLowerCase().includes(q);
        const matchDept = m.department.toLowerCase().includes(q);
        const matchPhone = m.phone.includes(q);
        if (!matchName && !matchEmail && !matchJob && !matchDept && !matchPhone) {
          return false;
        }
      }
      return true;
    });
  }, [teamMembers, roleFilter, statusFilter, searchQuery]);

  // Filtered activity logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      if (selectedUserFilter !== 'all' && log.userId !== selectedUserFilter) return false;
      if (actionTypeFilter !== 'all' && log.actionType !== actionTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = log.userName.toLowerCase().includes(q);
        const matchTitle = log.actionTitle.toLowerCase().includes(q);
        const matchDetails = log.actionDetails.toLowerCase().includes(q);
        const matchIp = log.ipAddress.includes(q);
        if (!matchUser && !matchTitle && !matchDetails && !matchIp) {
          return false;
        }
      }
      return true;
    });
  }, [activityLogs, selectedUserFilter, actionTypeFilter, searchQuery]);

  // Open modal for adding a new member
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('05');
    setFormNationalId('');
    setFormJobTitle('مسؤول علاقات حكومية وتراخيص');
    setFormDepartment('الشؤون الإدارية');
    setFormRole('licenses_specialist');
    setFormAssignedBranches(['all']);
    setFormPermissions(ROLE_PRESETS.licenses_specialist.defaultPermissions);
    setFormTwoFactor(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing an existing member
  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormNationalId(member.nationalIdOrIqama || '');
    setFormJobTitle(member.jobTitle);
    setFormDepartment(member.department);
    setFormRole(member.role);
    setFormAssignedBranches(member.assignedBranchIds);
    setFormPermissions(member.permissions);
    setFormTwoFactor(member.twoFactorEnabled);
    setFormNotes(member.notes || '');
    setIsModalOpen(true);
  };

  // Handle Preset Role Selection in Modal
  const handleRolePresetSelect = (presetKey: EnterpriseRole) => {
    setFormRole(presetKey);
    setFormPermissions(ROLE_PRESETS[presetKey].defaultPermissions);
  };

  // Toggle single permission key
  const handleTogglePermission = (permKey: PermissionKey) => {
    if (formPermissions.includes(permKey)) {
      setFormPermissions(formPermissions.filter(k => k !== permKey));
      setFormRole('custom'); // switch to custom when manually modified
    } else {
      setFormPermissions([...formPermissions, permKey]);
    }
  };

  // Toggle whole permission group
  const handleToggleGroup = (groupId: string) => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId);
    if (!group) return;
    const groupKeys = group.permissions.map(p => p.key);
    const allPresent = groupKeys.every(k => formPermissions.includes(k));

    if (allPresent) {
      setFormPermissions(formPermissions.filter(k => !groupKeys.includes(k)));
      setFormRole('custom');
    } else {
      const combined = Array.from(new Set([...formPermissions, ...groupKeys]));
      setFormPermissions(combined);
    }
  };

  // Save Member (Add or Update)
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('يرجى كتابة اسم الموظف بالكامل.');
      return;
    }
    if (!formEmail.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني للموظف.');
      return;
    }

    const roleInfo = ROLE_PRESETS[formRole] || ROLE_PRESETS.custom;

    if (editingMember) {
      // Update existing
      const updated: TeamMember = {
        ...editingMember,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        nationalIdOrIqama: formNationalId.trim(),
        jobTitle: formJobTitle.trim(),
        department: formDepartment.trim(),
        role: formRole,
        roleTitle: roleInfo.title,
        assignedBranchIds: formAssignedBranches,
        permissions: formPermissions,
        twoFactorEnabled: formTwoFactor,
        notes: formNotes.trim(),
      };
      onUpdateMember(updated);
      showToast(`تم تحديث صلاحيات وبيانات «${updated.name}» بنجاح.`);
    } else {
      // Create new
      const newMember: Omit<TeamMember, 'id' | 'joinedAt'> = {
        establishmentId: establishment.id,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        nationalIdOrIqama: formNationalId.trim(),
        jobTitle: formJobTitle.trim(),
        department: formDepartment.trim(),
        role: formRole,
        roleTitle: roleInfo.title,
        assignedBranchIds: formAssignedBranches,
        permissions: formPermissions,
        status: 'pending_activation',
        avatar: formRole === 'accounting_specialist' ? '👩‍💼' : '👨‍💼',
        lastActiveAt: 'بانتظار قبول الدعوة وتوثيق نفاذ',
        twoFactorEnabled: formTwoFactor,
        nafathVerified: false,
        dailyActionsCount: 0,
        notes: formNotes.trim(),
      };
      onAddMember(newMember);
      showToast(`تم إرسال دعوة الانضمام للموظف «${newMember.name}» مع تعيين دور «${roleInfo.title}».`);
    }

    setIsModalOpen(false);
  };

  // Send WhatsApp invite link to employee
  const handleShareInviteWhatsApp = (member: TeamMember) => {
    const inviteUrl = `https://sabbaq.sa/invite/${member.id}?est=${establishment.crNumber}`;
    const text = `السلام عليكم ${member.name}،
تمت دعوتك للانضمام إلى منصة سبّاق للامتثال الحكومي الخاصة بـ «${establishment.name}» بدور (${member.roleTitle}).
يرجى قبول الدعوة وتسجيل الدخول عبر النفاذ الوطني الموحد:
${inviteUrl}`;
    const cleanPhone = member.phone.replace(/^0/, '966').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`تم فتح تطبيق واتساب لإرسال رابط الدعوة إلى ${member.name}`);
  };

  // Switch to specific user's logs
  const handleViewUserLogs = (memberId: string) => {
    setSelectedUserFilter(memberId);
    setViewTab('activity_logs');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Quick Stats & Add Member CTA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 border border-indigo-400/40">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black font-['Cairo'] text-white">
                    إدارة صلاحيات المنشأة وفريق العمل
                  </h2>
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                    مصفوفة الأدوار والتدقيق الأمني
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  تتيح لك منصة سبّاق إضافة وتفويض الموظفين وتخصيص صلاحياتهم بدقة (أخصائي محاسبة، مسؤول تراخيص، مدير امتثال، مدير فرع) مع ربط التحقق بالنفاذ الوطني الموحد وسجل نشاط مفصل لكل مستخدم.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة موظف وتحديد الصلاحيات</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="طباعة سجل الصلاحيات"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            </div>
          </div>

          {/* 4 Multi-Metric Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">إجمالي فريق العمل</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {totalMembers}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {activeMembersCount} نشط
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300">موثق عبر نفاذ</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {nafathVerifiedCount}
                </span>
                <span className="text-[10px] text-slate-300">
                  {Math.round((nafathVerifiedCount / (totalMembers || 1)) * 100)}% موثق
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300">العمليات اليومية</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {totalDailyActions}
                </span>
                <span className="text-[10px] text-amber-200/80">عملية مسجلة</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300">سجل التدقيق الأمني</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {activityLogs.length}
                </span>
                <span className="text-[10px] text-purple-200/80">سجل مدقق ومؤرخ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs: Team Members vs Activity Log vs Roles Matrix */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewTab('members')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'members'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>قائمة الموظفين والصلاحيات</span>
            <span className="bg-indigo-900/40 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {teamMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('activity_logs')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'activity_logs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>سجل نشاط وتدقيق المستخدمين</span>
            <span className="bg-indigo-900/40 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {activityLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('roles_matrix')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'roles_matrix'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>مصفوفة الأدوار الجاهزة (Presets)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewTab === 'members' && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد أو المسمى..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-8 pl-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          )}

          {viewTab === 'activity_logs' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">كافة الموظفين</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.roleTitle})</option>
                ))}
              </select>

              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="بحث في سجل العمليات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-8 pl-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. VIEW 1: Team Members Directory Cards */}
      {viewTab === 'members' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-bold">تصفية حسب الدور:</span>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  roleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('licenses_specialist')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  roleFilter === 'licenses_specialist' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                مسؤول تراخيص
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('accounting_specialist')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  roleFilter === 'accounting_specialist' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                أخصائي محاسبة
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('compliance_officer')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  roleFilter === 'compliance_officer' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                مدير امتثال
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('branch_manager')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  roleFilter === 'branch_manager' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                مدير فرع
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">الحالة:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
              >
                <option value="all">كافة الحالات</option>
                <option value="active">نشط ومفعل</option>
                <option value="pending_activation">بانتظار قبول الدعوة</option>
                <option value="suspended">معلّق ومجمد</option>
              </select>
            </div>
          </div>

          {/* Members Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const rolePreset = ROLE_PRESETS[member.role] || ROLE_PRESETS.custom;
              const isOwner = member.role === 'owner';
              const isPending = member.status === 'pending_activation';
              const isSuspended = member.status === 'suspended';

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                    isSuspended 
                      ? 'border-slate-300 opacity-70 bg-slate-50' 
                      : isPending 
                      ? 'border-amber-200 bg-amber-50/10' 
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Role Color Ribbon */}
                  <div className={`h-1.5 w-full ${
                    isOwner ? 'bg-slate-900' :
                    member.role === 'licenses_specialist' ? 'bg-amber-500' :
                    member.role === 'accounting_specialist' ? 'bg-emerald-500' :
                    member.role === 'compliance_officer' ? 'bg-purple-500' :
                    member.role === 'branch_manager' ? 'bg-blue-500' : 'bg-indigo-500'
                  }`} />

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* User Header: Avatar, Name, Role Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl shrink-0 border border-slate-200 shadow-2xs">
                          {member.avatar || '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-slate-900 text-sm font-['Cairo']">
                              {member.name}
                            </h3>
                            {member.nafathVerified && (
                              <span title="موثق عبر نفاذ الوطني الموحد">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {member.jobTitle} • {member.department}
                          </p>
                        </div>
                      </div>

                      {/* Status / Role Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${rolePreset.badgeBg} ${rolePreset.badgeText} ${rolePreset.badgeBorder}`}>
                        {rolePreset.badge}
                      </span>
                    </div>

                    {/* Role Title and Description */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>الدور الوظيفي:</span>
                        <span className="text-indigo-700">{member.roleTitle}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>نطاق الفروع:</span>
                        <span className="font-bold text-slate-700">
                          {member.assignedBranchIds.includes('all') 
                            ? 'كافة الفروع والمواقع' 
                            : `${member.assignedBranchIds.length} فروع محددة`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>حجم الصلاحيات الممنوحة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {member.permissions.length} صلاحية نظامية
                        </span>
                      </div>
                    </div>

                    {/* Contact Info & Security Details */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{member.phone}</span>
                      </div>
                      {member.nationalIdOrIqama && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>الهوية / الإقامة: <span className="font-mono font-bold">{member.nationalIdOrIqama}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Security & Activity Pulse */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.lastActiveAt}</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <span>{member.dailyActionsCount || 0} عملية اليوم</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(member)}
                        className="p-2 text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="تعديل بيانات وصلاحيات الموظف"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل الصلاحيات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewUserLogs(member.id)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="عرض سجل نشاط وتدقيق هذا المستخدم"
                      >
                        <Activity className="w-3.5 h-3.5 text-purple-600" />
                        <span>سجل النشاط</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleShareInviteWhatsApp(member)}
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                          title="إعادة إرسال الدعوة عبر واتساب"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => onToggleMemberStatus(member.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isSuspended ? 'text-emerald-700 hover:bg-emerald-50' : 'text-amber-700 hover:bg-amber-50'
                            }`}
                            title={isSuspended ? 'إلغاء التجميد وتفعيل الحساب' : 'تجميد حساب الموظف مؤقتاً'}
                          >
                            {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حساب «${member.name}» وإلغاء صلاحياته؟`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="حذف حساب الموظف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VIEW 2: Detailed User Activity & Audit Logs */}
      {viewTab === 'activity_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base font-['Cairo'] flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>سجل النشاط والتدقيق الأمني الشامل للمستخدمين</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق فوري لجميع الإجراءات (تجديد الرخص، سداد الفواتير، رفع الوثائق، صياغة الاعتراضات) متضمناً الوقت ورقم الـ IP ونوع الجهاز.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedUserFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedUserFilter('all')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء فلتر المستخدم
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  showToast('تم تصدير سجل التدقيق الأمني بنجاح بصيغة CSV.');
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير السجل (Excel)</span>
              </button>
            </div>
          </div>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Activity className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">لا توجد سجلات نشاط مطابقة للبحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                    <th className="py-3 px-3">المستخدم والدور</th>
                    <th className="py-3 px-3">العملية المنفذة</th>
                    <th className="py-3 px-3">التفاصيل والبيانات المرتبطة</th>
                    <th className="py-3 px-3">الوقت والتاريخ</th>
                    <th className="py-3 px-3">عنوان IP والجهاز</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm">
                              {log.userAvatar || '👤'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{log.userName}</div>
                              <div className="text-[10px] text-slate-400">{log.userRoleTitle}</div>
                            </div>
                          </div>
                        </td>

                        {/* Action Title */}
                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                          <span className="bg-indigo-50 text-indigo-900 px-2 py-1 rounded-md text-[11px] font-bold border border-indigo-100">
                            {log.actionTitle}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="py-3 px-3 text-slate-600 max-w-xs sm:max-w-md leading-relaxed">
                          {log.actionDetails}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        {/* Device and IP */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          <div className="font-mono text-[10px] font-bold text-slate-700">{log.ipAddress}</div>
                          <div className="text-[10px] text-slate-400">{log.device}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مكتمل بنجاح</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW 3: Roles Preset Matrix Reference */}
      {viewTab === 'roles_matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-base font-['Cairo']">
                دليل مصفوفة الأدوار القياسية (Enterprise Role Templates)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                توفر منصة سبّاق حزم أدوار وظيفية معدة مسبقاً وفق المعايير السعودية لحوكمة الشركات والمنشآت التجارية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {(Object.keys(ROLE_PRESETS) as EnterpriseRole[]).map((key) => {
                const preset = ROLE_PRESETS[key];
                return (
                  <div key={key} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-sm font-['Cairo']">
                          {preset.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${preset.badgeBg} ${preset.badgeText} border ${preset.badgeBorder}`}>
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500 mb-1">
                        الصلاحيات المتضمنة ({preset.defaultPermissions.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.defaultPermissions.slice(0, 5).map(perm => (
                          <span key={perm} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            {perm}
                          </span>
                        ))}
                        {preset.defaultPermissions.length > 5 && (
                          <span className="text-[9px] font-mono bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-bold">
                            +{preset.defaultPermissions.length - 5} صلاحيات أخرى
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add / Edit Team Member with Granular Permissions */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-right font-sans">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-t-3xl flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-amber-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-['Cairo']">
                    {editingMember ? `تعديل صلاحيات: ${editingMember.name}` : 'إضافة موظف جديد وتحديد الصلاحيات'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    حدد الدور الوظيفي ونطاق الفروع ومصفوفة الصلاحيات الممنوحة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="p-6 space-y-6">
              {/* Step 1: Employee Basic Info */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                  <span>البيانات الأساسية للموظف</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم الموظف الثلاثي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: خالد محمد القحطاني"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني للعمل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="khalid@company.sa"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الجوال السعودي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهوية الوطنية / الإقامة (لربط نفاذ)
                    </label>
                    <input
                      type="text"
                      placeholder="10XXXXXXXX / 2XXXXXXXXX"
                      value={formNationalId}
                      onChange={(e) => setFormNationalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مسؤول علاقات حكومية"
                      value={formJobTitle}
                      onChange={(e) => setFormJobTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      القسم / الإدارة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الشؤون القانونية والإدارية"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Role Preset Templates */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                  <span>اختيار الدور الوظيفي الرئيسي (Role Preset)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(ROLE_PRESETS) as EnterpriseRole[]).map((key) => {
                    const preset = ROLE_PRESETS[key];
                    const isSelected = formRole === key;

                    return (
                      <div
                        key={key}
                        onClick={() => handleRolePresetSelect(key)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{preset.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Granular Permission Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">3</span>
                    <span>مصفوفة الصلاحيات التفصيلية ({formPermissions.length} صلاحية محددة)</span>
                  </h4>
                  <span className="text-[11px] text-indigo-600 font-bold">
                    يمكنك تعديل أي صلاحية بشكل مخصص
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {PERMISSION_GROUPS.map((group) => {
                    const isExpanded = expandedGroupId === group.id;
                    const groupKeys = group.permissions.map(p => p.key);
                    const selectedInGroupCount = groupKeys.filter(k => formPermissions.includes(k)).length;
                    const isAllSelected = selectedInGroupCount === groupKeys.length;

                    return (
                      <div key={group.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div
                          className="p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{group.icon}</span>
                            <div>
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                <span>{group.title}</span>
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono px-1.5 py-0.2 rounded">
                                  {selectedInGroupCount}/{groupKeys.length}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">{group.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(group.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                                isAllSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                            </button>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Group Permissions List */}
                        {isExpanded && (
                          <div className="p-3 divide-y divide-slate-100 bg-white space-y-2">
                            {group.permissions.map((perm) => {
                              const isChecked = formPermissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className="pt-2 first:pt-0 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(perm.key)}
                                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                  />
                                  <div>
                                    <div className="font-bold text-xs text-slate-800">{perm.label}</div>
                                    <p className="text-[11px] text-slate-500">{perm.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Branch Assignment & Security Controls */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">4</span>
                  <span>نطاق الفروع والأمان</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نطاق الفروع المتاحة للموظف
                    </label>
                    <select
                      value={formAssignedBranches.includes('all') ? 'all' : formAssignedBranches[0] || 'all'}
                      onChange={(e) => {
                        if (e.target.value === 'all') setFormAssignedBranches(['all']);
                        else setFormAssignedBranches([e.target.value]);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                    >
                      <option value="all">كافة الفروع والمواقع ({branches.length} فروع)</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="twoFactorToggle"
                      checked={formTwoFactor}
                      onChange={(e) => setFormTwoFactor(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <label htmlFor="twoFactorToggle" className="text-xs text-slate-700 cursor-pointer">
                      <span className="font-bold block">إلزام التحقق بخطوتين (2FA) ونفاذ</span>
                      <span className="text-[10px] text-slate-500">يتطلب تسجيل الدخول تأكيد الهوية عبر تطبيق نفاذ</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingMember ? 'حفظ تعديل الصلاحيات' : 'إرسال الدعوة وتعيين الصلاحيات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
