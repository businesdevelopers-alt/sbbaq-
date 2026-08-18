import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Scale, 
  ArrowLeft,
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import { Establishment, License, ComplianceViolation } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AskSabbaqAIProps {
  isOpen: boolean;
  onClose: () => void;
  activeEstablishment: Establishment;
  licenses: License[];
  violations: ComplianceViolation[];
}

export const AskSabbaqAI: React.FC<AskSabbaqAIProps> = ({
  isOpen,
  onClose,
  activeEstablishment,
  licenses,
  violations,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `مرحباً بك! أنا «سبّاق الذكي» مستشارك التنظيمي في الامتثال الحكومي السعودي.
أنا مطلع على اشتراطات منشأتك (${activeEstablishment.name}) وتراخيصك الحالية.
يمكنك سؤالي عن التراخيص المطلوبة، شروط الأنشطة، حساب الرسوم، أو صياغة الاعتراضات النظامية على المخالفات. كيف أساعدك اليوم؟`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'ما هي التراخيص الإلزامية لافتتاح مطعم أو مقهى في الرياض؟',
    'كيف يتم حساب رسوم الرخصة البلدية بناءً على المساحة واللوحة؟',
    'ما هي مهل تصحيح المخالفات البلدية لتفادي مضاعفة الغرامة؟',
    'صغ لي صيغة اعتراض رسمية على مخالفة عدم تجديد ترخيص سلامة.',
    'ما هي متطلبات التوطين ونسب نطاقات المعتمدة في منصة قوى؟',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Gather context
      const context = {
        establishmentName: activeEstablishment.name,
        city: activeEstablishment.city,
        activity: activeEstablishment.isicActivities.join('، '),
        licensesCount: licenses.filter(l => l.establishmentId === activeEstablishment.id).length,
        nearExpiryLicenses: licenses.filter(l => l.establishmentId === activeEstablishment.id && l.daysRemaining <= 30).map(l => `${l.name} (متبقي ${l.daysRemaining} يوم)`),
        violations: violations.filter(v => v.establishmentId === activeEstablishment.id).map(v => `${v.authority} - ${v.reason}`),
      };

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context,
        }),
      });

      const data = await response.json();
      const botReply = data.reply || 'عذراً، حدث خطأ أثناء معالجة استفسارك. يرجى المحاولة مرة أخرى.';

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: botReply,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'أعتذر، حدث تعذر في الاتصال بنظام الاستشارات الذكي. يمكنك الاستفسار مجدداً.',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Cairo']">
                  المستشار الذكي: اسأل سبّاق
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  مدعوم بـ Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-300">
                استشارات فورية في الأنظمة واللوائح والاعتراضات وتراخيص المنشآت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap pr-2">
            أسئلة شائعة:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-medium text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1 rounded-full border border-slate-200 hover:border-emerald-300 whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';

            return (
              <div
                key={idx}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 relative group ${
                  isBot
                    ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                    : 'bg-slate-900 text-white'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
                    isBot ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-400'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700 flex items-center gap-1"
                        title="نسخ النص"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl p-4 text-xs flex items-center gap-2 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>سبّاق الذكي يفحص الأنظمة واللوائح لصياغة الإجابة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="اطرح أي سؤال عن التراخيص والرسوم والاشتراطات والمخالفات..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
            <span>الاستشارات مستندة إلى أحدث لوائح وزارة البلديات، التجارة، الدفاع المدني، والموارد البشرية.</span>
            <span>سبّاق للامتثال © 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
