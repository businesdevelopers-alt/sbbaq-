export type UserRole = 'customer' | 'admin' | 'partner_agent' | 'client' | 'supplier';

export type EstablishmentType = 'company' | 'establishment' | 'foreign_branch' | 'holding';

export interface Establishment {
  id: string;
  name: string;
  crNumber: string;
  unifiedNumber?: string; // الرقم الموحد 700
  type?: EstablishmentType;
  legalForm: string;
  city: string;
  district?: string;
  nationalAddress?: string;
  mainActivity?: string;
  subActivity?: string;
  isicActivities: string[];
  isicCode?: string;
  establishedYear?: string;
  registrationDate?: string;
  crExpiryDate?: string;
  branchesCount: number;
  employeesCount?: number;
  totalEmployees: number;
  saudiEmployees: number;
  foreignEmployees?: number;
  saudizationPercentage: number;
  complianceScore?: number; // 0-100
  riskScore?: number;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  logo?: string;
}

export interface Branch {
  id: string;
  establishmentId: string;
  name: string;
  branchCode?: string;
  city: string;
  district: string;
  street?: string;
  nationalAddress?: string;
  crNumber?: string;
  baladyLicenseNumber?: string;
  civilDefenseNumber?: string;
  areaSquareMeters?: number;
  employeesCount: number;
  status?: 'active' | 'under_licensing' | 'suspended';
  isMainBranch?: boolean;
  riskScore?: number;
  coordinates?: { lat: number; lng: number };
  municipality?: string; // e.g. بلدية العليا الفرعية
  inspectionZoneDensity?: 'high' | 'medium' | 'low'; // كثافة الحملات الرقابية بالحي
  lastInspectionDate?: string;
  activeCampaigns?: string[]; // حملات تفتيشية جارية في هذا النطاق
}

export type GeoRiskLayerType = 'all_risk' | 'inspection_radar' | 'fines_violations' | 'expiring_licenses';

export interface InspectionHotspot {
  id: string;
  name: string;
  city: string;
  district: string;
  authority: string;
  campaignTitle: string;
  intensity: 'critical' | 'high' | 'moderate';
  focusSector: string;
  activeUntil: string;
  coordinates: { lat: number; lng: number };
  branchesImpactedCount: number;
}

export type LicenseStatus = 'active' | 'near_expiry' | 'expired' | 'under_renewal' | 'suspended';

export interface License {
  id: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  name: string;
  authority: string; // e.g. وزارة التجارة، أمانة الرياض (بلدي)، الدفاع المدني (سلامة)، هيئة الزكاة، إلخ
  authorityLogo?: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  status: LicenseStatus;
  daysRemaining: number;
  costGov: number;
  costSabbaq: number;
  documentUrl?: string;
  isMandatory: boolean;
  alertTriggered?: boolean;
  notes?: string;
}

export type DocumentCategory = 
  | 'cr' 
  | 'articles_of_assoc' 
  | 'balady' 
  | 'salama' 
  | 'gosi' 
  | 'zatca' 
  | 'saudization' 
  | 'lease_contract' 
  | 'health_cert' 
  | 'chamber' 
  | 'commercial'
  | 'municipal'
  | 'safety'
  | 'labor'
  | 'tax'
  | 'contracts'
  | 'other';

export type ContractType = 
  | 'lease' 
  | 'safety_maintenance' 
  | 'pest_cleaning' 
  | 'waste_management' 
  | 'qiwa_subscription' 
  | 'muqeem_subscription' 
  | 'employment_contract' 
  | 'vendor_service' 
  | 'other';

export interface ContractParty {
  role: 'lessor_provider' | 'lessee_client';
  name: string;
  crOrId?: string;
  representativeName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  isModified?: boolean;
}

export interface ContractComplianceCheck {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'info';
  note: string;
}

export interface ContractRenewalDraft {
  id: string;
  documentId: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  contractType: ContractType;
  contractTypeName: string;
  title: string;
  currentContractNumber: string;
  proposedContractNumber: string;
  currentStartDate: string;
  currentEndDate: string;
  proposedStartDate: string;
  proposedEndDate: string;
  durationMonths: number;
  currentAnnualAmountSAR: number;
  proposedAnnualAmountSAR: number;
  priceDifferencePercent: number; // e.g. 0% or +3%
  paymentTerms: string; // e.g. "دفعتين نصف سنوية عبر منصة إيجار"
  paymentFrequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  lessorOrProvider: ContractParty;
  lesseeOrClient: ContractParty;
  locationDetails: {
    city: string;
    district: string;
    street?: string;
    unitNumber?: string;
    areaSquareMeters?: number;
    purpose?: string;
  };
  clauses: ContractClause[];
  complianceChecks: ContractComplianceCheck[];
  ejarSynced?: boolean;
  status: 'draft_ready' | 'reviewing' | 'approved' | 'sent_for_signature' | 'renewed';
  generatedAt: string;
  daysRemaining: number;
  autoRenewProposed: boolean;
  aiInsightsNotes: string[];
}

export interface DocumentAlertConfig {
  enabled: boolean;
  alertDaysBefore: number[]; // e.g. [60, 30, 15, 7, 1]
  channels: ('in_app' | 'sms' | 'whatsapp' | 'email')[];
  recipientPhone?: string;
  recipientEmail?: string;
  autoRenewReminder?: boolean;
  lastAlertSentAt?: string;
}

export interface SmartUploadResult {
  title: string;
  category: DocumentCategory;
  categoryLabel?: string;
  documentNumber: string;
  issuingAuthority: string;
  establishmentName?: string;
  crNumber?: string;
  issueDate: string;
  expiryDate: string;
  hijriExpiryDate?: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired';
  activity?: string;
  city?: string;
  confidenceScore: number;
  complianceNotes: string[];
  recommendedActions: string[];
  alertConfig: DocumentAlertConfig;
  filePreviewUrl?: string;
  fileSize?: string;
}

export interface DocumentItem {
  id: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  title: string;
  category: DocumentCategory;
  documentNumber?: string;
  issueDate?: string;
  expiryDate: string;
  hijriExpiryDate?: string;
  daysRemaining?: number;
  status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
  fileUrl?: string;
  fileSize?: string;
  uploadedAt?: string;
  aiExtracted?: boolean;
  authority?: string;
  isMandatory?: boolean;
  lastVerifiedAt?: string;
  alertConfig?: DocumentAlertConfig;
  isRecurring?: boolean;
  recurringInterval?: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  autoRenewEnabled?: boolean;
  autoRenewNoticeDays?: number;
  renewalDraftProposal?: ContractRenewalDraft;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
  signatureHash?: string;
  signatureDataUrl?: string;
  verificationCode?: string;
  nafathVerified?: boolean;
}

export interface DigitalSignatureRecord {
  id: string;
  documentId: string;
  documentTitle: string;
  documentType: 'legal_contract' | 'company_document' | 'license_authorization' | 'board_resolution' | 'service_order';
  establishmentId: string;
  signerName: string;
  signerTitle: string;
  signerNationalId?: string;
  signerPhone?: string;
  signatureType: 'draw' | 'type' | 'stamp' | 'stored';
  signatureDataUrl: string;
  companyStampUrl?: string;
  signedAt: string;
  hijriDate?: string;
  verificationCode: string;
  cryptographicHash: string; // SHA-256
  nafathVerified: boolean;
  nafathTransactionId?: string;
  ipAddress?: string;
  status: 'valid' | 'revoked';
}

export type ViolationStatus = 'pending_review' | 'under_objection' | 'rectified' | 'paid' | 'escalated';
export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ProceduralManualReference {
  id: string;
  authority: string;
  authorityKey: 'balady' | 'civil_defense' | 'labor_qiwa' | 'zatca' | 'commerce' | 'sfda' | 'gosi' | 'ejar' | 'other';
  manualName: string;
  versionOrYear: string;
  statutoryBasis: string;
  officialPortal: string;
  gracePeriodGuidelines: string;
  objectionWindowDays: number;
  objectionChannel: string;
  reductionInitiatives?: string;
  description: string;
}

export type CorrectivePhase = 'immediate_containment' | 'field_rectification' | 'evidence_upload' | 'closure_verification';

export interface CorrectiveActionStep {
  id: string;
  stepNumber: number;
  phase: CorrectivePhase;
  phaseLabel: string;
  actionTitle: string;
  detailedProcedure: string;
  requiredRole: string; // e.g. مدير الفرع / مسؤول الامتثال / فني معتمد
  proceduralManualArticleRef: string; // Reference to article in the official manual
  estimatedDurationHours: number;
  estimatedCostSAR: number;
  isCompleted: boolean;
  evidenceRequired: string;
  quickActionType?: 'upload_doc' | 'renew_license' | 'contact_vendor' | 'gov_portal_link' | 'generate_objection' | 'order_service' | 'contract_editor';
  quickActionTarget?: string;
}

export interface RequiredEvidenceItem {
  id: string;
  title: string;
  description: string;
  isAvailableInVault: boolean;
  vaultDocId?: string;
  sampleFormat: string;
}

export interface ViolationProceduralAnalysis {
  violationId: string;
  violationNumber: string;
  authority: string;
  detectedDate: string;
  manual: {
    name: string;
    articleNumber: string;
    clauseText: string;
    officialPortal: string;
    gracePeriodDays: number;
    objectionWindowDays: number;
    penaltyMultiplierRisk: string;
  };
  rootCauseDiagnosis: {
    primaryCause: string;
    operationalGap: string;
    riskLevel: ViolationSeverity;
    severityScore: number;
  };
  correctiveActionPlan: CorrectiveActionStep[];
  requiredEvidenceList: RequiredEvidenceItem[];
  financialImpact: {
    originalFineSAR: number;
    escalatedFineIfIgnoredSAR: number;
    correctionEstimatedCostSAR: number;
    netSavedSAR: number;
    potentialDiscountRate: number; // e.g. 25 or 50%
    discountedFineSAR: number;
  };
  objectionFeasibility: {
    score: number; // 0-100%
    verdict: 'recommended' | 'optional' | 'low_chance';
    legalGrounds: string[];
    recommendedLetterDraft?: string;
  };
  lastAnalyzedAt: string;
}

export interface ComplianceViolation {
  id: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  violationNumber: string;
  authority: string;
  reason: string;
  category: string;
  fineAmount: number;
  date: string;
  gracePeriodDays: number;
  daysLeftToCorrect: number;
  objectionDeadlineDays: number;
  daysLeftToObject: number;
  status: ViolationStatus;
  severity: ViolationSeverity;
  documents?: string[];
  objectionLetterDraft?: string;
  proceduralAnalysis?: ViolationProceduralAnalysis;
}

export interface RiskFactor {
  id: string;
  factor: string;
  points: number;
  maxPoints: number;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionText: string;
  actionType: 'renew_license' | 'upload_doc' | 'handle_violation' | 'periodic_obligation' | 'complete_profile';
  targetId?: string;
}

export interface RiskAssessment {
  overallScore: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendedActions: string[];
  potentialFinesEstimated: number;
  lastCalculatedAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  code: string;
  slug?: string;
  name: string;
  category: 'commerce' | 'balady' | 'civil_defense' | 'labor_qiwa' | 'tax_zatca' | 'platforms' | 'specialized' | 'municipal' | string;
  authority: string;
  type: 'issuance' | 'renewal' | 'amendment' | 'consulting' | 'objection' | 'cancellation' | 'transfer';
  description: string;
  requiredDocuments: string[];
  govFeeEstimated: number;
  sabbaqFee: number;
  vatAmount: number;
  totalEstimated: number;
  recurringAnnualGov: number;
  estimatedDays: string;
  popularFor?: string[];
  isActive?: boolean;
  allowsDirectPayment?: boolean;
  sortOrder?: number;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  authority: string;
  type?: 'issuance' | 'renewal' | 'amendment' | 'consulting' | 'objection' | 'cancellation' | 'transfer' | string;
  branchId?: string;
  branchName?: string;
  govFee: number;
  sabbaqFee: number;
  vat: number;
  total: number;
  requiredDocs?: string[];
  uploadedDocs?: string[];
  customNotes?: string;
  status?: string;
}

export type OrderStatus = 
  | 'new' 
  | 'awaiting_contact' 
  | 'awaiting_docs' 
  | 'awaiting_approval' 
  | 'awaiting_payment' 
  | 'in_progress' 
  | 'submitted_to_gov' 
  | 'awaiting_gov_reply' 
  | 'completed' 
  | 'cancelled';

export interface OrderNote {
  id: string;
  sender: 'client' | 'sabbaq' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface MasterOrder {
  id: string;
  orderNumber: string; // e.g. SBQ-2026-8942
  establishmentId: string;
  establishmentName?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  govFeeTotal?: number;
  sabbaqFeeTotal: number;
  vatTotal?: number;
  totalAmount: number;
  totalGovFees?: number;
  totalSabbaqFees?: number;
  totalVat?: number;
  grandTotal?: number;
  notes?: string;
  assignedSpecialist?: string;
  specialistPhone?: string;
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  quoteApproved?: boolean;
  isAutoApproved?: boolean;
  autoRenewAnnual?: boolean;
  missingDocsCount?: number;
  notesHistory?: OrderNote[];
  completionCertificateUrl?: string;
  govTransactionNumbers?: string[];
}

export type ActionItemType = 
  | 'upload_doc' 
  | 'approve_quote' 
  | 'pay_invoice' 
  | 'renew_license' 
  | 'handle_violation' 
  | 'reply_specialist' 
  | 'periodic_obligation';

export interface ActionItemToday {
  id: string;
  establishmentId?: string;
  title: string;
  subtitle: string;
  priority: 'urgent' | 'high' | 'normal';
  type: ActionItemType;
  relatedEntityId?: string;
  relatedId?: string;
  actionLabel: string;
  actionUrl?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface FinancialPenaltyRule {
  baseFine: number; // Base initial fine in SAR upon expiration/violation
  dailyFineRate: number; // Daily compounding rate in SAR for each day after grace period
  maxFineCap?: number; // Maximum statutory fine limit in SAR
  gracePeriodDays: number; // Grace period before daily fine applies
  perUnitMultiplier?: number; // Quantity/unit multiplier (e.g. per employee, per branch)
  applicableKeywords: string[]; // Keywords to match licenses accurately
  legalCitation: string; // Official Saudi legal regulation reference
  penaltyFormulaDescription: string; // Readable formula explanation in Arabic
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  activity?: string;
  activityCategory: string;
  entityType?: string;
  city?: string;
  authority: string;
  requirementName?: string;
  isMandatory?: boolean;
  validityMonths?: number;
  renewalLeadDays?: number;
  alertWindowDays?: number[];
  riskPoints: number;
  riskReason: string;
  preventiveAction?: string;
  sourceLaw?: string;
  penaltyRule?: FinancialPenaltyRule;
  lastReviewed?: string;
  approvedBy?: string;
  approvalStatus?: 'approved' | 'draft';
}

export interface LicensePenaltyEvaluation {
  licenseId: string;
  licenseName: string;
  licenseNumber: string;
  authority: string;
  branchName?: string;
  establishmentId: string;
  issueDate?: string;
  expiryDate: string;
  currentDate: string;
  isExpired: boolean;
  daysExpired: number;
  daysRemaining: number;
  matchedRuleId: string;
  matchedRuleTitle: string;
  baseFine: number;
  dailyFineAccumulated: number;
  daysBeyondGrace: number;
  totalEstimatedFine: number;
  projectedFineIfExpired: number;
  gracePeriodDays: number;
  legalCitation: string;
  penaltyFormulaDescription: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionRequired: string;
}

export interface LicensesFineReport {
  currentDate: string;
  totalLicensesChecked: number;
  expiredLicensesCount: number;
  nearExpiryLicensesCount: number;
  activeCompliantLicensesCount: number;
  totalCurrentEstimatedFines: number;
  totalProjectedFines: number;
  breakdownByAuthority: Record<string, { count: number; fines: number; projectedFines: number }>;
  evaluatedLicenses: LicensePenaltyEvaluation[];
  highestRiskLicense?: LicensePenaltyEvaluation;
  criticalActions: string[];
}

export type CustomerGoalType = 
  | 'calculate_cost' 
  | 'fees_planning'
  | 'sector_benchmark'
  | 'proactive_alerts'
  | 'team_permissions'
  | 'issue_service' 
  | 'renew_license' 
  | 'monitor_licenses' 
  | 'resolve_violation' 
  | 'build_compliance_file' 
  | 'ai_consultation';

export type AuthPortal = 'client' | 'admin';

export type AuthMode = 'login' | 'register' | 'nafath' | 'forgot_password' | 'otp_verify' | 'admin_login';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalIdOrIqama?: string;
  nationalId?: string;
  crNumber?: string;
  establishmentName: string;
  role: UserRole;
  roles?: UserRole[]; // If user has multi-role access
  assignedEstablishmentIds?: string[]; // Allowed establishments for customer/agent
  portalRoleTitle?: string;
  staffDepartment?: string;
  partnerAgencyName?: string;
  avatar?: string;
  isVerified: boolean;
  authProvider: 'password' | 'nafath' | 'demo' | 'admin_staff' | 'partner_agent';
  createdAt: string;
  subscriptionPlan?: 'basic' | 'pro' | 'enterprise';
}

export interface PartnerAgentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  agencyName: string;
  licenseNumber: string;
  city: string;
  coverageZones: string[];
  status: 'active' | 'pending_verification' | 'suspended';
  completedTransactions: number;
  activeOrdersCount: number;
  rating: number;
  commissionBalanceSAR: number;
  assignedTasks: {
    id: string;
    orderId: string;
    clientName: string;
    taskTitle: string;
    authority: string;
    dueDate: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'submitted_gov';
    feeSAR: number;
  }[];
}

// Enterprise Team & Permissions Management (إدارة صلاحيات المنشأة وفريق العمل)
export type EnterpriseRole = 
  | 'owner'                 // مالك المنشأة / المفوض الرئيسي
  | 'compliance_officer'    // مدير الامتثال والحوكمة
  | 'licenses_specialist'   // مسؤول التراخيص والبلديات
  | 'accounting_specialist' // أخصائي المحاسبة والرسوم الحكومية
  | 'branch_manager'        // مدير فرع
  | 'legal_advisor'         // مستشار قانوني
  | 'custom';               // صلاحيات مخصصة

export type PermissionKey =
  // تراخيص وبلديات
  | 'licenses.view'
  | 'licenses.renew'
  | 'licenses.edit'
  | 'licenses.export'
  // مستندات وعقود
  | 'documents.view'
  | 'documents.upload'
  | 'documents.delete'
  | 'documents.ejar_auto_renewal'
  // مالية ورسوم
  | 'fees.view'
  | 'fees.pay_bills'
  | 'fees.export_budget'
  // مخالفات واعتراضات
  | 'violations.view'
  | 'violations.object'
  | 'violations.pay'
  // مقارنات وتقارير
  | 'benchmarks.view'
  | 'benchmarks.export'
  // فروع
  | 'branches.view'
  | 'branches.manage'
  // إدارة الفريق والصلاحيات
  | 'team.view'
  | 'team.manage_members'
  | 'team.view_activity'
  // الذكاء الاصطناعي
  | 'ai.chat'
  | 'ai.expert_delegation';

export interface PermissionGroupDefinition {
  id: string;
  title: string;
  description: string;
  icon?: string;
  permissions: {
    key: PermissionKey;
    label: string;
    description: string;
  }[];
}

export interface TeamMember {
  id: string;
  establishmentId: string;
  name: string;
  email: string;
  phone: string;
  nationalIdOrIqama?: string;
  jobTitle: string;
  department: string;
  role: EnterpriseRole;
  roleTitle: string;
  assignedBranchIds: string[]; // ['all'] or specific branch IDs
  permissions: PermissionKey[];
  status: 'active' | 'pending_activation' | 'suspended' | 'invited';
  avatar?: string;
  joinedAt: string;
  lastActiveAt: string;
  twoFactorEnabled: boolean;
  nafathVerified: boolean;
  dailyActionsCount?: number;
  notes?: string;
}

export type UserActivityActionType = 
  | 'license_renew'
  | 'license_issue'
  | 'document_upload'
  | 'document_delete'
  | 'ejar_contract_renew'
  | 'fee_payment'
  | 'budget_export'
  | 'violation_objection'
  | 'violation_settle'
  | 'team_member_added'
  | 'team_member_updated'
  | 'team_member_status'
  | 'permission_changed'
  | 'login'
  | 'nafath_auth'
  | 'report_download'
  | 'ai_consultation';

export interface UserActivityLog {
  id: string;
  establishmentId: string;
  userId: string;
  userName: string;
  userRoleTitle: string;
  userAvatar?: string;
  actionType: UserActivityActionType;
  actionTitle: string;
  actionDetails: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location?: string;
  status: 'success' | 'warning' | 'failed' | 'info';
  relatedEntityId?: string;
  relatedEntityType?: 'license' | 'document' | 'violation' | 'team_member' | 'order' | 'system';
}

export type ProactiveAlertWindow = '60_days' | '30_days' | '7_days' | 'expired' | 'safe';

export type ProactiveTimeRangeFilter = 
  | 'all'            // كافة الفترات والتواريخ
  | 'next_30_days'   // خلال 30 يوماً القادمة (الشهر القادم)
  | 'next_60_days'   // خلال 60 يوماً القادمة
  | 'next_90_days'   // خلال 90 يوماً القادمة
  | 'this_month'     // هذا الشهر الحالي
  | 'next_month'     // الشهر القادم
  | 'this_quarter'   // هذا الربع الحالي
  | 'next_quarter'   // الربع القادم
  | 'this_year'      // السنة الحالية
  | 'next_year'      // السنة القادمة
  | 'expired_past'   // منتهية الصلاحية
  | 'custom';        // نطاق زمني مخصص

export interface ProactiveAlertItem {
  id: string;
  sourceType: 'license' | 'document';
  sourceId: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  title: string;
  authority: string;
  authorityLogo?: string;
  documentNumber: string;
  issueDate?: string;
  expiryDate: string;
  daysRemaining: number;
  alertWindow: ProactiveAlertWindow;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'info';
  category?: string;
  costGovEstimated?: number;
  costSabbaqEstimated?: number;
  isMandatory: boolean;
  isRecurring?: boolean;
  renewalDraftProposal?: ContractRenewalDraft;
  recommendedAction: string;
  proactiveAdvice: string;
  alertStageLabel: string;
  countdownColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  notificationChannels: ('in_app' | 'whatsapp' | 'email' | 'sms')[];
  lastNotifiedAt?: string;
  dismissedInApp?: boolean;
}

export interface ProactiveAlertSummary {
  totalAnalyzed: number;
  totalAlerts: number;
  count60Days: number;
  count30Days: number;
  count7Days: number;
  countExpired: number;
  countSafe?: number;
  criticalUrgentCount: number;
  items: ProactiveAlertItem[];
}

export type NotificationType = 
  | 'violation' 
  | 'doc_expiry' 
  | 'license_expiry' 
  | 'regulatory_update' 
  | 'team_action' 
  | 'system';

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'info';

export interface InAppNotification {
  id: string;
  establishmentId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  actionLabel?: string;
  targetTab?: string;
  targetEntityId?: string;
  targetEntityType?: 'violation' | 'license' | 'document' | 'branch' | 'team_member' | 'system';
  authorityBadge?: string;
  fineAmount?: number;
  daysRemaining?: number;
  metadata?: Record<string, any>;
}

// -------------------------------------------------------------
// Legal Documents & Contract Drafter Types (محرر العقود والمكتبة القانونية)
// -------------------------------------------------------------

export type LegalDocumentCategory = 
  | 'employment'           // عقود العمل والموارد البشرية
  | 'commercial'           // العقود التجارية والتوريد والخدمات
  | 'bylaws_policies'      // اللوائح التنظيمية والسياسات الداخلية
  | 'nda_ip'               // اتفاقيات السرية والملكية الفكرية
  | 'corporate_governance' // قرارات الشركاء ومستندات الحوكمة
  | 'lease_property'       // عقود الإيجار والعقارات
  | 'custom_regulation';   // تشريعات وتنظيمات مخصصة

export type LegalDocumentStatus = 
  | 'draft'          // مسودة
  | 'under_review'   // قيد المراجعة القانونية
  | 'approved'       // معتمد داخلياً
  | 'signed_active'  // موقع وساري المفعول
  | 'archived';      // مؤرشف

export interface LegalClause {
  id: string;
  number: number;
  title: string;
  content: string;
  tag?: string;
  isMandatory?: boolean;
  standardLawRef?: string; // e.g. المادة 77 من نظام العمل السعودي
  isModified?: boolean;
  riskLevel?: 'safe' | 'caution' | 'high_risk';
  explanation?: string;
}

export interface LegalDocumentParty {
  role: string; // الطرف الأول / صاحب العمل / المؤجر / العميل
  name: string;
  crOrId?: string;
  repName?: string;
  repTitle?: string;
  nationalAddress?: string;
  email?: string;
  phone?: string;
}

export interface LegalSignature {
  partyName: string;
  signerTitle: string;
  isSigned: boolean;
  signedDate?: string;
  signatureDataUrl?: string;
  verificationCode?: string;
}

export interface AILegalAuditRisk {
  clauseTitle: string;
  issue: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
  saudiLawRef: string;
}

export interface AILegalAudit {
  overallScore: number; // 0 - 100
  status: 'compliant' | 'needs_amendment' | 'high_risk';
  summary: string;
  strengths: string[];
  risks: AILegalAuditRisk[];
  recommendedClauses: string[];
  saudiComplianceChecklist: {
    lawName: string; // e.g. نظام العمل، نظام المعاملات المدنية، نظام الشركات
    isCompliant: boolean;
    notes: string;
  }[];
}

export interface LegalDocument {
  id: string;
  establishmentId: string;
  branchId?: string;
  branchName?: string;
  title: string;
  documentRefNumber: string; // e.g. SAB-LEG-2026-081
  category: LegalDocumentCategory;
  categoryLabel: string;
  version: string; // e.g. "1.0", "1.2"
  status: LegalDocumentStatus;
  createdAt: string;
  updatedAt: string;
  effectiveDate?: string;
  expiryDate?: string;
  firstParty: LegalDocumentParty;
  secondParty?: LegalDocumentParty;
  description: string;
  applicableLaws: string[]; // الأنظمة السعودية الحاكمة
  clauses: LegalClause[];
  fullTextContent?: string;
  aiAudit?: AILegalAudit;
  signatures: LegalSignature[];
  tags: string[];
  isTemplate?: boolean;
  language?: 'ar' | 'bilingual_ar_en';
  qrVerificationCode?: string;
  confidentialityLevel?: 'strictly_confidential' | 'internal' | 'public';
}

export interface LegalContractTemplate {
  id: string;
  title: string;
  category: LegalDocumentCategory;
  categoryLabel: string;
  description: string;
  iconName: string;
  applicableSaudiLaws: string[];
  popularFor: string;
  defaultClausesCount: number;
  initialPrompt: string;
  sampleClauses: LegalClause[];
  suggestedFields: {
    key: string;
    label: string;
    placeholder: string;
    defaultValue?: string;
    required: boolean;
  }[];
}

// Compliance & Remediation Marketplace Types
export type {
  RemediationCategory,
  SolutionFulfillmentType,
  SupplierVerificationLevel,
  SupplierStatus,
  SupplierDocumentType,
  SupplierDocument,
  SupplierSuspensionRecord,
  SupplyRequestStatus,
  QuoteStatus,
  RemediationSolution,
  Supplier,
  SupplyRequest,
  SupplierQuote,
  OrderStatusHistoryItem
} from './data/complianceMarketData';


