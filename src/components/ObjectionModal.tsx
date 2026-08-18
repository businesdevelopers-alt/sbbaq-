import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Download,
  Building2,
  AlertCircle
} from 'lucide-react';
import { ComplianceViolation, Establishment } from '../types';
import { formatSAR } from '../utils/complianceEngine';

interface ObjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: ComplianceViolation | null;
  establishment: Establishment;
}

export const ObjectionModal: React.FC<ObjectionModalProps> = ({
  isOpen,
  onClose,
  violation,
  establishment,
}) => {
  const [justification, setJustification] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('يوجد إشعار تقديم تجديد مسبق قبل ضبط المخالفة، وتقرير فني يثبت استيفاء الاشتراطات.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !violation) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentName: establishment.name,
          crNumber: establishment.crNumber,
          violationNumber: violation.violationNumber,
          authority: violation.authority,
          reason: violation.reason,
          fineAmount: violation.fineAmount,
          justification: justification || 'المحل كان قيد التجهيز وتم تقديم طلب التجديد على منصة بلدي قبل موعد التفتيش مع إرفاق عقد ساري.',
          evidence: evidenceNotes,
        }),
      });

      const data = await res.json();
      setGeneratedLetter(data.objectionLetter || 'تعذر صياغة اللائحة حالياً.');
    } catch (err) {
      console.error(err);
      setGeneratedLetter('حدث خطأ أثناء الاتصال بالنظام.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Cairo']">
                صياغة لائحة اعتراض نظامية ذكية
              </h3>
              <p className="text-xs text-slate-300">
                المخالفة: {violation.violationNumber} • الجهة: {violation.authority}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Violation Info Banner */}
          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 flex justify-between items-center">
            <div>
              <span className="text-rose-900 font-bold block">{violation.reason}</span>
              <span className="text-slate-600 text-[11px]">الغرامة الصادرة: {formatSAR(violation.fineAmount)}</span>
            </div>
            <span className="text-rose-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-rose-200">
              مهلة الاعتراض: {violation.daysLeftToObject} يوماً
            </span>
          </div>

          {!generatedLetter ? (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  أسباب ودفوع الاعتراض وتوضيح الموقف:
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="مثال: تم سداد الرسوم ورفع طلب التجديد مسبقاً برقم طلب حكومي قبل تاريخ رصد الملاحظة، والمحل مغلق للتجهيز..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  المستندات والأدلة الداعمة المتوفرة:
                </label>
                <input
                  type="text"
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-['Cairo'] text-sm"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>جاري صياغة اللائحة النظامية المعتمدة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>توليد لائحة الاعتراض بالذكاء الاصطناعي الآن</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">نص اللائحة الجاهز للتقديم:</span>
                <button
                  onClick={copyText}
                  className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ بنجاح' : 'نسخ النص'}</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed text-slate-800 max-h-96 overflow-y-auto">
                {generatedLetter}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setGeneratedLetter(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                >
                  إعادة الصياغة
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  تم واعتماد
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
