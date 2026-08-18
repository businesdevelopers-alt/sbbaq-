import React, { useState } from 'react';
import { 
  FileCheck2, 
  PenTool, 
  ShieldCheck, 
  Fingerprint, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus, 
  Copy, 
  ExternalLink, 
  Lock, 
  Building2, 
  Sparkles, 
  Smartphone, 
  FileText, 
  FolderLock, 
  AlertTriangle,
  X,
  Share2,
  Check
} from 'lucide-react';
import { 
  Establishment, 
  Branch, 
  DocumentItem, 
  LegalDocument, 
  DigitalSignatureRecord,
  TeamMember 
} from '../types';
import { DigitalSignatureModal, SignatureResult } from './DigitalSignatureModal';

interface DigitalSignatureSuiteProps {
  establishment: Establishment;
  branches: Branch[];
  documents: DocumentItem[];
  legalDocuments: LegalDocument[];
  signaturesList: DigitalSignatureRecord[];
  onAddSignatureRecord: (record: DigitalSignatureRecord) => void;
  onSignDocumentItem: (docId: string, sigResult: SignatureResult) => void;
  onSignLegalDocument: (legalDocId: string, sigResult: SignatureResult) => void;
  onOpenLegalEditor?: (doc: LegalDocument) => void;
  showToast: (message: string) => void;
}

export const DigitalSignatureSuite: React.FC<DigitalSignatureSuiteProps> = ({
  establishment,
  branches,
  documents,
  legalDocuments,
  signaturesList,
  onAddSignatureRecord,
  onSignDocumentItem,
  onSignLegalDocument,
  onOpenLegalEditor,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'legal_contract' | 'company_document' | 'license_authorization'>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalSignatureRecord | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [targetSignDoc, setTargetSignDoc] = useState<{ id: string; title: string; type: 'doc' | 'legal' | 'custom' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Hash verification simulator state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<DigitalSignatureRecord | null | 'not_found'>(null);

  // Filter signatures
  const filteredSignatures = signaturesList.filter(sig => {
    const matchesSearch = sig.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sig.signerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sig.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sig.cryptographicHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || sig.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`تم نسخ رمز التحقق: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleVerifyHash = () => {
    if (!verifyInput.trim()) return;
    const clean = verifyInput.trim().toLowerCase();
    const found = signaturesList.find(s => 
      s.verificationCode.toLowerCase() === clean || 
      s.cryptographicHash.toLowerCase().includes(clean) ||
      s.id.toLowerCase() === clean
    );
    if (found) {
      setVerifyResult(found);
      showToast('تم التحقق من صحة الوثيقة ومطابقة البصمة الرقمية بنجاح!');
    } else {
      setVerifyResult('not_found');
      showToast('لم يتم العثور على سجل توقيع مطابق.');
    }
  };

  const handleStartSignNew = () => {
    // Open selector or sign first unsigned document
    const unsignedDoc = documents.find(d => !d.isSigned);
    if (unsignedDoc) {
      setTargetSignDoc({ id: unsignedDoc.id, title: unsignedDoc.title, type: 'doc' });
    } else {
      setTargetSignDoc({ id: 'custom-doc', title: 'مستند أو تفويض رسمي جديد', type: 'custom' });
    }
    setIsSignModalOpen(true);
  };

  const handleCompleteSigning = (result: SignatureResult) => {
    const newRecord: DigitalSignatureRecord = {
      id: `sig-rec-${Date.now()}`,
      documentId: targetSignDoc?.id || `doc-${Date.now()}`,
      documentTitle: targetSignDoc?.title || 'مستند معتمد',
      documentType: targetSignDoc?.type === 'legal' ? 'legal_contract' : 'company_document',
      establishmentId: establishment.id,
      signerName: result.signerName,
      signerTitle: result.signerTitle,
      signerNationalId: result.signerNationalId,
      signerPhone: result.signerPhone,
      signatureType: result.signatureType,
      signatureDataUrl: result.signatureDataUrl,
      signedAt: result.signedAt,
      hijriDate: result.hijriDate,
      verificationCode: result.verificationCode,
      cryptographicHash: result.cryptographicHash,
      nafathVerified: result.nafathVerified,
      nafathTransactionId: result.nafathTransactionId,
      ipAddress: result.ipAddress,
      status: 'valid',
    };

    onAddSignatureRecord(newRecord);

    if (targetSignDoc?.type === 'doc') {
      onSignDocumentItem(targetSignDoc.id, result);
    } else if (targetSignDoc?.type === 'legal') {
      onSignLegalDocument(targetSignDoc.id, result);
    }

    // Auto open certificate
    setSelectedCertificate(newRecord);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-['Cairo'] text-right">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-80 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>نظام التوقيع الرقمي والاعتمادات الإلكترونية</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              منظومة التواقيع والأختام الرسمية المعتمدة
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              توقيع واعتماد العقود والتفويضات والشهادات ببصمة مشفرة وموثقة عبر النفاذ الوطني الموحد وفق نظام التعاملات الإلكترونية السعودي.
            </p>
          </div>

          {/* Quick Sign Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleStartSignNew}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>توقيع مستند جديد</span>
            </button>
          </div>
        </div>

        {/* Statistical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-300">التواقيع النشطة</div>
            <div className="text-2xl font-black text-white mt-1">{signaturesList.length}</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">معتمدة وقانونية</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-300">توثيق عبر نفاذ</div>
            <div className="text-2xl font-black text-white mt-1">
              {signaturesList.filter(s => s.nafathVerified).length}
            </div>
            <div className="text-[10px] text-emerald-300 font-bold mt-0.5">موثقة بالهوية الرقمية</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-300">مستندات جاهزة للتوقيع</div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {documents.filter(d => !d.isSigned).length + legalDocuments.filter(l => l.status !== 'signed_active').length}
            </div>
            <div className="text-[10px] text-amber-200 font-bold mt-0.5">تتطلب اعتماد المفوض</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-300">مستوى الحماية</div>
            <div className="text-2xl font-black text-teal-300 mt-1">SHA-256</div>
            <div className="text-[10px] text-teal-200 font-bold mt-0.5">بصمة تشفيرية غير قابلة للتعديل</div>
          </div>
        </div>
      </div>

      {/* Hash Verification / Validation Tool */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">أداة التحقق من صحة التوقيع الرقمي</h3>
              <p className="text-[11px] text-slate-500">أدخل رمز التوثيق (مثال: SBQ-SIG-2026-XXXXX) أو بصمة الهاش SHA-256 للتأكد من صحة المستند</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyHash()}
              placeholder="أدخل رمز التوثيق أو كود SHA256 للتحقق الفوري..."
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
          <button
            onClick={handleVerifyHash}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
          >
            تحقق الآن
          </button>
        </div>

        {/* Verification Result Dialog */}
        {verifyResult && verifyResult !== 'not_found' && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>التوقيع أصلي ومعتمد رسمياً</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.2 rounded-full font-bold">
                    موثق بنظام سبّاق
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  الوثيقة: <strong>{verifyResult.documentTitle}</strong> | الموقع: <strong>{verifyResult.signerName}</strong> ({verifyResult.signerTitle})
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  تاريخ الاعتماد: {new Date(verifyResult.signedAt).toLocaleString('ar-SA')} • {verifyResult.hijriDate}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCertificate(verifyResult)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 shadow-xs"
            >
              عرض الشهادة الرسمية
            </button>
          </div>
        )}

        {verifyResult === 'not_found' && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-900 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong>لم يتم العثور على سجل توقيع مطابق:</strong> تأكد من كتابة رمز التوثيق بدقة أو أن الوثيقة لم يتم تعديل بصمتها التشفيرية.
            </div>
          </div>
        )}
      </div>

      {/* Signed Documents Table & Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">سجل الوثائق والتفويضات الموقعة رقمياً</h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {filteredSignatures.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم الوثيقة أو الموقع..."
                className="text-xs pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-48 sm:w-60"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
            >
              <option value="all">كافة الوثائق</option>
              <option value="legal_contract">عقود واتفاقيات</option>
              <option value="license_authorization">تفويضات وتراخيص</option>
              <option value="company_document">مستندات المنشأة</option>
            </select>
          </div>
        </div>

        {/* Signatures List */}
        {filteredSignatures.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <PenTool className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">لا توجد سجلات توقيع مطابقة للبحث</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              يمكنك توقيع أي مستند من مستودع الوثائق أو النماذج القانونية لإنشاء شهادة إلكترونية موثقة.
            </p>
            <button
              onClick={handleStartSignNew}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>توقيع مستند الآن</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSignatures.map((sig) => (
              <div
                key={sig.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Document & Signer Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-1">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {sig.documentTitle}
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {sig.documentType === 'legal_contract' ? 'عقد قانوني' : sig.documentType === 'license_authorization' ? 'تفويض ترخيص' : 'مستند منشأة'}
                      </span>
                      {sig.nafathVerified && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Fingerprint className="w-3 h-3 text-emerald-600" />
                          <span>موثق نفاذ</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span>الموقع: <strong className="text-slate-800">{sig.signerName}</strong> ({sig.signerTitle})</span>
                      <span>•</span>
                      <span>تاريخ التوقيع: {new Date(sig.signedAt).toLocaleDateString('ar-SA')} ({sig.hijriDate})</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-slate-200">
                        <QrCode className="w-3 h-3 text-slate-500" />
                        <span>{sig.verificationCode}</span>
                        <button
                          onClick={() => handleCopyCode(sig.verificationCode)}
                          className="hover:text-emerald-700 text-slate-400 mr-1"
                          title="نسخ رمز التحقق"
                        >
                          {copiedCode === sig.verificationCode ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {sig.cryptographicHash.substring(0, 24)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    onClick={() => setSelectedCertificate(sig)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض الشهادة الموثقة</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`جاري تحميل نسخة PDF المعتمدة للمستند: ${sig.documentTitle}`);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="تحميل نسخة PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Signature Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 text-right font-['Cairo']">
            
            {/* Certificate Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mx-auto mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              
              <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
                المملكة العربية السعودية • منصة سبّاق للحلول الإدارية
              </div>
              <h3 className="text-xl font-black tracking-tight">
                شهادة إثبات التوقيع والاعتماد الرقمي
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                صادرة وموثقة وفق نظام التعاملات الإلكترونية الصادر بالمرسوم الملكي رقم (م/18)
              </p>
            </div>

            {/* Certificate Body Details */}
            <div className="p-6 space-y-5">
              
              {/* Document and Est */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs text-slate-500">اسم الوثيقة المعتمدة:</div>
                <div className="text-sm font-black text-slate-900">{selectedCertificate.documentTitle}</div>
                <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المنشأة: <strong>{establishment.name}</strong> (س.ت: {establishment.crNumber})</span>
                </div>
              </div>

              {/* Signer & Nafath Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[11px] text-slate-500 font-bold">اسم المفوض بالتوقيع:</div>
                  <div className="text-xs font-bold text-slate-900">{selectedCertificate.signerName}</div>
                  <div className="text-[10px] text-slate-500">{selectedCertificate.signerTitle}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[11px] text-slate-500 font-bold">التوثيق عبر نفاذ:</div>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedCertificate.nafathVerified ? 'موثق ومطابق 100%' : 'معتمد إلكترونياً'}</span>
                  </div>
                  {selectedCertificate.nafathTransactionId && (
                    <div className="text-[10px] text-slate-500 font-mono">{selectedCertificate.nafathTransactionId}</div>
                  )}
                </div>
              </div>

              {/* Signature Visual Preview & QR Code */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-emerald-900">البصمة البصرية للتوقيع:</div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100 inline-block">
                    {selectedCertificate.signatureDataUrl.startsWith('data:image') ? (
                      <img
                        src={selectedCertificate.signatureDataUrl}
                        alt="Signature Preview"
                        className="h-12 object-contain"
                      />
                    ) : (
                      <div className="text-xs font-bold text-emerald-800 p-2">توقيع رقمي موثق</div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1 bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-xs">
                  <QrCode className="w-16 h-16 text-slate-900 mx-auto" />
                  <div className="text-[9px] font-mono text-slate-600 font-bold">{selectedCertificate.verificationCode}</div>
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>بصمة التشفير الرقمية (SHA-256):</span>
                  <span className="text-emerald-400 font-bold">SECURE-SEAL</span>
                </div>
                <div className="text-[10px] text-emerald-300 break-all bg-black/40 p-2 rounded-lg leading-relaxed">
                  {selectedCertificate.cryptographicHash}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>الطابع الزمني: {new Date(selectedCertificate.signedAt).toISOString()}</span>
                  <span>{selectedCertificate.hijriDate}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(selectedCertificate.verificationCode)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ رمز التحقق</span>
                </button>

                <button
                  onClick={() => {
                    showToast(`تم تحميل الشهادة الرقمية الرسمية للوثيقة: ${selectedCertificate.documentTitle}`);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الشهادة الموثقة</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {isSignModalOpen && targetSignDoc && (
        <DigitalSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          documentTitle={targetSignDoc.title}
          documentTypeLabel={targetSignDoc.type === 'legal' ? 'عقد قانوني' : 'مستند رسمي'}
          establishment={establishment}
          onSignComplete={handleCompleteSigning}
          showToast={showToast}
        />
      )}

    </div>
  );
};
