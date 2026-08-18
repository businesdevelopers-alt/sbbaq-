import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  Type, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  Eraser, 
  Fingerprint, 
  Smartphone, 
  Lock, 
  FileCheck, 
  QrCode, 
  Sparkles, 
  Check,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Establishment, TeamMember } from '../types';

export interface SignatureResult {
  signatureDataUrl: string;
  signatureType: 'draw' | 'type' | 'stamp' | 'stored';
  signerName: string;
  signerTitle: string;
  signerNationalId?: string;
  signerPhone?: string;
  signedAt: string;
  hijriDate: string;
  verificationCode: string;
  cryptographicHash: string;
  nafathVerified: boolean;
  nafathTransactionId?: string;
  ipAddress: string;
}

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentTypeLabel?: string;
  establishment: Establishment;
  currentUserMember?: TeamMember;
  onSignComplete: (result: SignatureResult) => void;
  showToast?: (msg: string) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentTypeLabel = 'مستند رسمي',
  establishment,
  currentUserMember,
  onSignComplete,
  showToast,
}) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload' | 'stored'>('draw');

  // Signer Details
  const [signerName, setSignerName] = useState(currentUserMember?.name || 'عبدالعزيز بن فهد السبيعي');
  const [signerTitle, setSignerTitle] = useState(currentUserMember?.roleTitle || 'الرئيس التنفيذي / المفوض العام');
  const [signerNationalId, setSignerNationalId] = useState(currentUserMember?.nationalId || '1088492019');
  const [signerPhone, setSignerPhone] = useState(currentUserMember?.phone || '+966 50 123 4567');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<string>('#065f46'); // emerald default
  const [penWidth, setPenWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Typed signature state
  const [selectedFontStyle, setSelectedFontStyle] = useState<number>(0);
  const fontStyles = [
    { id: 0, name: 'خط الرقعة المعاصر', fontClass: 'font-serif italic font-black text-2xl' },
    { id: 1, name: 'خط النسخ الإداري', fontClass: 'font-sans font-bold tracking-wider text-xl' },
    { id: 2, name: 'التوقيع الانسيابي الحديث', fontClass: 'font-mono italic font-semibold text-2xl' },
    { id: 3, name: 'ختم التوقيع المربع', fontClass: 'font-bold uppercase tracking-widest text-lg' },
  ];

  // Uploaded signature state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Nafath / Two-Factor Authentication Step
  const [requireNafath, setRequireNafath] = useState<boolean>(true);
  const [isVerifyingNafath, setIsVerifyingNafath] = useState<boolean>(false);
  const [nafathStep, setNafathStep] = useState<'idle' | 'prompt' | 'verified'>('idle');
  const [nafathNumber, setNafathNumber] = useState<number>(42);
  const [nafathCountdown, setNafathCountdown] = useState<number>(60);

  // Initialize Canvas
  useEffect(() => {
    if (isOpen && tab === 'draw') {
      setTimeout(() => {
        initCanvas();
      }, 50);
    }
  }, [isOpen, tab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-10), currentData]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setHistory([]);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevImageData = history[history.length - 1];
    ctx.putImageData(prevImageData, 0, 0);
    setHistory(prev => prev.slice(0, -1));
    if (history.length === 1) {
      setHasDrawn(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate cryptographic hash (simulated SHA256)
  const generateSimulatedHash = () => {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return `SHA256:${hash}`;
  };

  // Generate Typed Signature as DataURL
  const generateTypedSignatureSvg = () => {
    const selected = fontStyles[selectedFontStyle];
    const encodedName = encodeURIComponent(signerName || 'المفوض بالتوقيع');
    const encodedTitle = encodeURIComponent(signerTitle || 'المفوض العام');
    const encodedEst = encodeURIComponent(establishment.name);
    
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120">
      <rect width="320" height="120" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-dasharray="3,3" />
      <text x="160" y="45" font-family="sans-serif" font-weight="900" font-style="italic" font-size="20" fill="%23065f46" text-anchor="middle">${encodedName}</text>
      <text x="160" y="70" font-family="sans-serif" font-weight="bold" font-size="11" fill="%23475569" text-anchor="middle">${encodedTitle}</text>
      <text x="160" y="92" font-family="sans-serif" font-size="10" fill="%2394a3b8" text-anchor="middle">${encodedEst}</text>
    </svg>`;
  };

  // Trigger Nafath Verification Flow
  const triggerNafathPrompt = () => {
    const randomNafathNum = Math.floor(10 + Math.random() * 89);
    setNafathNumber(randomNafathNum);
    setNafathStep('prompt');
    setIsVerifyingNafath(true);
    setNafathCountdown(60);

    // Countdown timer
    const interval = setInterval(() => {
      setNafathCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmNafathApproval = () => {
    setIsVerifyingNafath(false);
    setNafathStep('verified');
    if (showToast) showToast(`تم تأكيد الهوية الرقمية عبر نفاذ بنجاح بالرقم: ${nafathNumber}`);
  };

  // Complete Signature Submit
  const handleSubmitSignature = () => {
    let finalSignatureUrl = '';

    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        if (showToast) showToast('يرجى رسم التوقيع أولاً في لوحة التوقيع.');
        return;
      }
      finalSignatureUrl = canvas.toDataURL('image/png');
    } else if (tab === 'type') {
      if (!signerName.trim()) {
        if (showToast) showToast('يرجى كتابة اسم الموقع أولاً.');
        return;
      }
      finalSignatureUrl = generateTypedSignatureSvg();
    } else if (tab === 'upload') {
      if (!uploadedImage) {
        if (showToast) showToast('يرجى رفع صورة التوقيع أو الختم أولاً.');
        return;
      }
      finalSignatureUrl = uploadedImage;
    } else {
      // Stored default signature
      finalSignatureUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="90" viewBox="0 0 220 90"><path d="M 20 50 Q 60 10 100 45 T 190 35 Q 170 70 110 65" stroke="%23065f46" stroke-width="3" fill="none" stroke-linecap="round"/><text x="110" y="82" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23065f46" text-anchor="middle">توقيع معتمد • نفاذ</text></svg>';
    }

    if (requireNafath && nafathStep !== 'verified') {
      triggerNafathPrompt();
      return;
    }

    const verificationCode = `SBQ-SIG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const cryptographicHash = generateSimulatedHash();
    const now = new Date();

    const result: SignatureResult = {
      signatureDataUrl: finalSignatureUrl,
      signatureType: tab,
      signerName: signerName.trim() || 'المفوض بالتوقيع',
      signerTitle: signerTitle.trim() || 'المفوض العام',
      signerNationalId: signerNationalId.trim(),
      signerPhone: signerPhone.trim(),
      signedAt: now.toISOString(),
      hijriDate: '28 شعبان 1447 هـ',
      verificationCode,
      cryptographicHash,
      nafathVerified: requireNafath && nafathStep === 'verified',
      nafathTransactionId: requireNafath ? `NFT-${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      ipAddress: '178.80.14.88 (الرياض، المملكة العربية السعودية)',
    };

    onSignComplete(result);
    if (showToast) {
      showToast(`تم توثيق واعتماد التوقيع الرقمي بنجاح برقم: ${verificationCode}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 text-right font-['Cairo']">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">منصة التوقيع الرقمي المعتمد</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  موثق نظامياً
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {documentTypeLabel}: <span className="text-emerald-400 font-bold">{documentTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Signer Identity Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                بيانات المفوض بالتوقيع والمنشأة
              </span>
              <span className="text-[11px] text-slate-500">
                المنشأة: <strong className="text-slate-800">{establishment.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  اسم الشخص المفوض بالتوقيع <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                  placeholder="الاسم الثلاثي أو الرباعي"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  الصفة / المسمى الوظيفي للمفوض <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                  placeholder="مثال: الرئيس التنفيذي / المدير العام"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  رقم الهوية الوطنية / الإقامة
                </label>
                <input
                  type="text"
                  value={signerNationalId}
                  onChange={(e) => setSignerNationalId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                  placeholder="10XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  رقم الجوال المعتمد في أبشر
                </label>
                <input
                  type="text"
                  value={signerPhone}
                  onChange={(e) => setSignerPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
            </div>
          </div>

          {/* Signature Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800">
                طريقة التوقيع والاعتماد:
              </label>
              {tab === 'draw' && hasDrawn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={undoLastStroke}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold px-2 py-1 bg-slate-100 rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3" />
                    تراجع
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold px-2 py-1 bg-rose-50 rounded-lg"
                  >
                    <Eraser className="w-3 h-3" />
                    مسح
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTab('draw')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  tab === 'draw'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>رسم باليد</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('type')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  tab === 'type'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>كتابة خطيّة</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  tab === 'upload'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>رفع صورة / ختم</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('stored')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  tab === 'stored'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>توقيع محفوظ</span>
              </button>
            </div>

            {/* TAB 1: DRAW CANVAS */}
            {tab === 'draw' && (
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white p-2 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-44 bg-slate-50/50 rounded-xl cursor-crosshair touch-none"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 space-y-1">
                      <PenTool className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-xs font-bold">وقع هنا باستخدام الماوس أو اللمس</span>
                    </div>
                  )}
                </div>

                {/* Color and Pen Width Picker */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">لون الحبر:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: '#065f46', label: 'أخضر ملكي' },
                        { color: '#1e3a8a', label: 'أزرق كحلي' },
                        { color: '#0f172a', label: 'أسود داكن' },
                        { color: '#991b1b', label: 'أحمر قرمزي' },
                      ].map(item => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => setPenColor(item.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            penColor === item.color ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">سُمك القلم:</span>
                    <div className="flex items-center gap-1">
                      {[2, 3, 5].map(width => (
                        <button
                          key={width}
                          type="button"
                          onClick={() => setPenWidth(width)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            penWidth === width ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {width === 2 ? 'دقيق' : width === 3 ? 'متوسط' : 'عريض'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPED SIGNATURE */}
            {tab === 'type' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fontStyles.map(font => (
                    <div
                      key={font.id}
                      onClick={() => setSelectedFontStyle(font.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedFontStyle === font.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-500 font-bold">{font.name}</span>
                        {selectedFontStyle === font.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className={`text-slate-800 py-2 border-b border-dashed border-slate-200 text-center ${font.fontClass}`}>
                        {signerName || 'عبدالعزيز السبيعي'}
                      </div>
                      <div className="text-[10px] text-slate-400 text-center mt-1">
                        {establishment.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD SIGNATURE / STAMP */}
            {tab === 'upload' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Signature"
                        className="max-h-28 mx-auto object-contain"
                      />
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        تم تحميل صورة الختم / التوقيع بنجاح (انقر للاستبدال)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-500">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <div className="text-xs font-bold text-slate-700">
                        اسحب وأفلت صورة الختم أو التوقيع هنا، أو تصفح ملفاتك
                      </div>
                      <div className="text-[10px] text-slate-400">
                        يفضل استخدام صور بصيغة PNG بخلفية شفافة بدقة عالية
                      </div>
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* TAB 4: STORED SIGNATURE */}
            {tab === 'stored' && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-950">التوقيع الرقمي الافتراضي المعتمد</h4>
                      <p className="text-[11px] text-emerald-700">بصمة موثقة ومربوطة بحساب المفوض في المنشأة</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    نشط وموثق
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800">{signerName}</div>
                    <div className="text-[10px] text-slate-500">{signerTitle} • {establishment.name}</div>
                    <div className="text-[9px] text-slate-400">رمز التوثيق: SBQ-DEFAULT-SIG-SA</div>
                  </div>
                  <div className="border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 rounded-lg text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>متاح للاعتماد الفوري</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legal Compliance & Nafath 2FA Options */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireNafath}
                  onChange={(e) => setRequireNafath(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                    <span>طلب التوثيق والتحقق عبر النفاذ الوطني الموحد (نفاذ)</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      موصى به قانونياً
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    يرسل طلب تحقق فوري إلى تطبيق نفاذ لتأكيد موافقة المفوض ومنح الوثيقة حجية قانونية قطعية أمام المحاكم والجهات التنظيمية.
                  </p>
                </div>
              </label>
            </div>

            {/* Nafath Active Verification Dialog */}
            {isVerifyingNafath && (
              <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-4 animate-in zoom-in-95 border border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black">جاري طلب التحقق عبر تطبيق نفاذ...</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-mono">
                    ينتهي خلال: {nafathCountdown} ثانية
                  </span>
                </div>

                <div className="text-center py-2">
                  <div className="text-xs text-slate-300 mb-1">الرجاء فتح تطبيق نفاذ واختيار الرقم:</div>
                  <div className="inline-block text-4xl font-black text-emerald-400 bg-white/10 px-6 py-2 rounded-2xl border border-emerald-400/40 font-mono tracking-widest">
                    {nafathNumber}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={confirmNafathApproval}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>تأكيد قبول الطلب في نفاذ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerifyingNafath(false)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {nafathStep === 'verified' && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  تم توثيق الهوية بنجاح عبر <strong>نفاذ</strong> بالرقم <strong>{nafathNumber}</strong>. البصمة الإلكترونية جاهزة للإصدار.
                </span>
              </div>
            )}

            {/* Legal Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                التوقيع محمي ببصمة تشفيرية SHA-256 وطابع زمني موثوق وفق نظام التعاملات الإلكترونية السعودي الصادر بالمرسوم الملكي رقم (م/18).
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmitSignature}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>اعتماد وتطبيق التوقيع والختم الرقمي</span>
          </button>
        </div>

      </div>
    </div>
  );
};
