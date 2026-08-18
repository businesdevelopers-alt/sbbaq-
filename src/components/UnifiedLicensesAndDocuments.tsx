import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Clock, 
  FolderLock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Upload,
  Calendar,
  Layers,
  CheckCircle2,
  Fingerprint,
  PenTool
} from 'lucide-react';
import { 
  License, 
  Branch, 
  Establishment, 
  DocumentItem, 
  LegalDocument, 
  LegalContractTemplate,
  DigitalSignatureRecord 
} from '../types';
import { LicensesMonitor } from './LicensesMonitor';
import { CompanyDocumentsVault } from './CompanyDocumentsVault';
import { CompanyLegalDocumentsLibrary } from './CompanyLegalDocumentsLibrary';
import { DigitalSignatureSuite } from './DigitalSignatureSuite';
import { SignatureResult } from './DigitalSignatureModal';

interface UnifiedLicensesAndDocumentsProps {
  establishment: Establishment;
  branches: Branch[];
  licenses: License[];
  documents: DocumentItem[];
  legalDocuments: LegalDocument[];
  signaturesList?: DigitalSignatureRecord[];
  initialSubTab?: 'licenses' | 'vault' | 'legal' | 'signatures';
  onInstantRenewLicense: (license: License) => void;
  onAddNewLicense: () => void;
  onUploadDocument: (newDoc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onScanDocumentAI?: (fileData: string, mimeType: string) => Promise<any>;
  onOpenLegalEditor: (doc?: LegalDocument, template?: LegalContractTemplate) => void;
  onSaveLegalDocument: (doc: LegalDocument) => void;
  onDeleteLegalDocument: (id: string) => void;
  onAddSignatureRecord?: (record: DigitalSignatureRecord) => void;
  onSignDocumentItem?: (docId: string, sigResult: SignatureResult) => void;
  onSignLegalDocument?: (legalDocId: string, sigResult: SignatureResult) => void;
  onConsultSpecialist?: (topic: string) => void;
  showToast: (message: string) => void;
}

export const UnifiedLicensesAndDocuments: React.FC<UnifiedLicensesAndDocumentsProps> = ({
  establishment,
  branches,
  licenses,
  documents,
  legalDocuments,
  signaturesList = [],
  initialSubTab = 'licenses',
  onInstantRenewLicense,
  onAddNewLicense,
  onUploadDocument,
  onDeleteDocument,
  onScanDocumentAI,
  onOpenLegalEditor,
  onSaveLegalDocument,
  onDeleteLegalDocument,
  onAddSignatureRecord,
  onSignDocumentItem,
  onSignLegalDocument,
  onConsultSpecialist,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'licenses' | 'vault' | 'legal' | 'signatures'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Statistics & Summary
  const estLicenses = licenses.filter(l => l.establishmentId === establishment.id);
  const expiredLicensesCount = estLicenses.filter(l => l.status === 'expired').length;
  const expiringLicensesCount = estLicenses.filter(l => l.status === 'near_expiry' || l.status === 'critical').length;
  const validLicensesCount = estLicenses.filter(l => l.status === 'active').length;

  const estDocs = documents.filter(d => d.establishmentId === establishment.id);
  const validDocsCount = estDocs.filter(d => d.status === 'valid').length;
  const expiringDocsCount = estDocs.filter(d => d.status === 'expiring_soon' || d.status === 'expired').length;

  const estSignatures = signaturesList.filter(s => s.establishmentId === establishment.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>إدارة الوثائق الموحدة • الحافظة والأرشيف الرقمي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Cairo'] tracking-tight">
              التراخيص والمستندات والحافظة الرقمية
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-['Cairo']">
              مركز موحد لمراقبة الرخص الحكومية، إدارة الأرشيف الرقمي والشهادات، ومسودات التجديد التلقائي لـ <span className="text-emerald-400 font-bold">{establishment.name}</span>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xs text-slate-300 mb-1">الرخص الحكومية</div>
              <div className="text-2xl font-black text-white font-['Cairo']">{estLicenses.length}</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                {validLicensesCount} سارية
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xs text-slate-300 mb-1">المستندات والشهادات</div>
              <div className="text-2xl font-black text-white font-['Cairo']">{estDocs.length}</div>
              <div className="text-[10px] text-blue-300 font-bold mt-0.5">
                {validDocsCount} معتمدة
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xs text-slate-300 mb-1">تنبيهات الانتهاء</div>
              <div className="text-2xl font-black text-rose-400 font-['Cairo']">
                {expiredLicensesCount + expiringLicensesCount + expiringDocsCount}
              </div>
              <div className="text-[10px] text-rose-300 font-bold mt-0.5">
                بحاجة لاتخاذ إجراء
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('licenses')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'licenses'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>التراخيص والشهادات الحكومية</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'licenses' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {estLicenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('vault')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'vault'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>المستندات والحافظة الرقمية</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'vault' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {estDocs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('legal')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'legal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>العقود واللوائح القانونية</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'legal' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {legalDocuments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('signatures')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'signatures'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>التوقيع والاعتماد الرقمي</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'signatures' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {estSignatures.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeSubTab === 'licenses' && (
        <div className="animate-in fade-in duration-200">
          <LicensesMonitor
            licenses={licenses}
            branches={branches}
            activeEstablishment={establishment}
            onInstantRenew={onInstantRenewLicense}
            onAddNewLicense={onAddNewLicense}
          />
        </div>
      )}

      {activeSubTab === 'vault' && (
        <div className="animate-in fade-in duration-200">
          <CompanyDocumentsVault
            establishment={establishment}
            branches={branches}
            documents={documents}
            licenses={licenses}
            onUploadDocument={onUploadDocument}
            onDeleteDocument={onDeleteDocument}
            onRenewLicense={(licId) => {
              const found = licenses.find(l => l.id === licId);
              if (found) onInstantRenewLicense(found);
            }}
            onConsultSpecialist={onConsultSpecialist}
            onScanDocumentAI={onScanDocumentAI}
            showToast={showToast}
          />
        </div>
      )}

      {activeSubTab === 'legal' && (
        <div className="animate-in fade-in duration-200">
          <CompanyLegalDocumentsLibrary
            establishment={establishment}
            branches={branches}
            documents={legalDocuments}
            onOpenEditor={onOpenLegalEditor}
            onUpdateDocument={onSaveLegalDocument}
            onDeleteDocument={onDeleteLegalDocument}
            showToast={showToast}
          />
        </div>
      )}

      {activeSubTab === 'signatures' && (
        <div className="animate-in fade-in duration-200">
          <DigitalSignatureSuite
            establishment={establishment}
            branches={branches}
            documents={documents}
            legalDocuments={legalDocuments}
            signaturesList={signaturesList}
            onAddSignatureRecord={onAddSignatureRecord || (() => {})}
            onSignDocumentItem={onSignDocumentItem || (() => {})}
            onSignLegalDocument={onSignLegalDocument || (() => {})}
            onOpenLegalEditor={onOpenLegalEditor}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  );
};
