
import React, { useState, useMemo } from 'react';
import { QUESTIONS, OPTIONS, getScoreCategory } from './constants';
import { TestStep } from './types';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { saveTestResult } from './services/supabaseService';
import { 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BrainCircuit,
  Copy,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const score = useMemo(() => {
    let total = 0;
    Object.entries(answers).forEach(([qId, val]) => {
      const value = val as number;
      const question = QUESTIONS.find(q => q.id === parseInt(qId));
      if (!question) return;
      if (question.isReverse) total += (5 - value);
      else total += value;
    });
    return total;
  }, [answers]);

  const resultData = useMemo(() => getScoreCategory(score), [score]);
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleStart = () => {
    if (userName.trim()) {
      setStep('test');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    if (saveStatus === 'success' || isSaving) return;
    setIsSaving(true);
    const result = await saveTestResult(userName, score, resultData.label, answers);
    setIsSaving(false);
    
    if (result.error) {
      setSaveStatus('error');
      // No alertamos para no romper la estética, el botón cambiará de estado o se manejará silenciosamente
    } else {
      setSaveStatus('success');
    }
  };

  const shareUrl = window.location.origin + "/";
  const shareText = `*Hamilton Stress Test* 💓\n\nHola, acabo de realizar mi valoración de ansiedad y mi resultado es: *${resultData.label}* (${score}/80).\n\n¿Quieres saber cómo estás tú? Haz el test gratuito aquí 👇\n${shareUrl}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative mb-12">
        <div className="absolute inset-0 animate-pulse-ring bg-primary-500 rounded-full"></div>
        <div className="relative bg-white p-7 rounded-[2rem] shadow-2xl shadow-primary-500/20 animate-heartbeat">
          <Activity className="w-16 h-16 text-primary-600" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
        Test de Estrés de <span className="text-primary-600">Hamilton</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-500 mb-14 max-w-lg leading-relaxed font-medium">
        Mide tu salud emocional con rigor clínico. Un análisis de 20 preguntas para entender tu nivel de ansiedad actual.
      </p>

      <div className="w-full max-w-sm space-y-5">
        <div className="bg-white p-2 rounded-[1.5rem] border-2 border-slate-100 focus-within:border-primary-500 transition-all shadow-sm focus-within:shadow-xl focus-within:shadow-primary-500/10">
          <input
            type="text"
            placeholder="Escribe tu nombre"
            className="w-full px-4 py-4 bg-transparent outline-none text-slate-900 placeholder:text-slate-300 font-bold text-xl text-center"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          />
        </div>
        
        <Button fullWidth onClick={handleStart} disabled={!userName.trim()} className="h-20 rounded-[1.5rem] text-xl font-black uppercase tracking-widest group shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
          Comenzar Test
          <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mt-20 flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Valoración Privada y Segura
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-xl mx-auto px-4 py-8 w-full animate-in slide-in-from-right-8 fade-in duration-500">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setStep('intro')} className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.3em]">Cerrar Test</button>
          <span className="bg-white border border-slate-100 text-slate-900 px-5 py-2 rounded-full text-xs font-black shadow-sm">
            {currentQuestionIndex + 1} <span className="text-slate-300 mx-1">/</span> {QUESTIONS.length}
          </span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] p-8 md:p-14 mb-10 min-h-[420px] flex flex-col justify-center relative border border-slate-50 transition-all">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-14 leading-[1.2] tracking-tight">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {OPTIONS.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center group ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50 shadow-lg translate-x-3' 
                    : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-2 mr-6 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary-500 bg-primary-500 scale-110' : 'border-slate-200'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`text-xl font-bold transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-500'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-5">
        <Button variant="ghost" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="rounded-2xl h-16 px-8 font-black uppercase text-[10px] tracking-widest">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="flex-1 rounded-[1.5rem] h-20 shadow-2xl shadow-primary-500/30 text-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
          {isLastQuestion ? 'Resultados' : 'Siguiente'}
          {!isLastQuestion && <ChevronRight className="w-6 h-6 ml-1" />}
        </Button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-white rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.1)] overflow-hidden mb-14 border border-slate-100">
        <div className={`p-14 md:p-24 text-center relative overflow-hidden ${resultData.bg}`}>
          <div className="relative inline-block mb-12">
            <div className={`absolute inset-0 animate-pulse-ring ${resultData.color.replace('text', 'bg')} rounded-full opacity-20`}></div>
            <div className="relative bg-white p-8 rounded-full shadow-2xl animate-heartbeat">
              <BrainCircuit className={`w-14 h-14 ${resultData.color}`} />
            </div>
          </div>
          <p className={`text-xs font-black uppercase tracking-[0.6em] mb-5 opacity-70 ${resultData.color}`}>Tu Valoración</p>
          <h2 className={`text-7xl md:text-9xl font-black mb-6 tracking-tighter ${resultData.color}`}>{score}<span className="text-3xl font-bold opacity-30">/80</span></h2>
          <div className={`inline-block px-10 py-4 rounded-full bg-white shadow-2xl ${resultData.color} text-2xl md:text-3xl font-black tracking-tight`}>
            {resultData.label}
          </div>
        </div>

        <div className="p-10 md:p-24 bg-white">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 tracking-tight">Análisis para {userName}</h3>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium">
              Según el Inventario de Hamilton, tu nivel de ansiedad es <span className={`font-black underline decoration-4 underline-offset-8 ${resultData.color}`}>{resultData.label.toLowerCase()}</span>.
            </p>
          </div>

          <div className="grid gap-8 mb-24">
            {resultData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-8 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-100/20 group cursor-default animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 rounded-[1.5rem] bg-white border-2 border-slate-100 flex items-center justify-center text-primary-600 font-black shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm group-hover:-rotate-3 text-2xl">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-bold text-xl leading-relaxed pt-2 group-hover:text-slate-900 transition-colors">{rec}</p>
              </div>
            ))}
          </div>

          <div className="relative mb-24">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-600 via-primary-400 to-cyan-400 rounded-[3.5rem] blur-2xl opacity-20"></div>
            <div className="relative bg-slate-950 rounded-[3.5rem] p-12 text-white overflow-hidden shadow-2xl border border-white/5 text-center">
              <h4 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">¡Comparte el Bienestar!</h4>
              <p className="text-slate-400 mb-12 text-lg md:text-xl font-medium">Ayuda a tus conocidos a medir su nivel de ansiedad de forma gratuita.</p>
              <div className="flex flex-wrap justify-center gap-5">
                <button onClick={handleShareWhatsApp} className="bg-[#25D366] hover:scale-105 active:scale-95 px-10 py-6 rounded-[1.5rem] font-black flex items-center gap-4 transition-all shadow-2xl shadow-green-500/30 text-base uppercase tracking-widest">
                  <MessageCircle className="w-7 h-7" /> WhatsApp
                </button>
                <button onClick={handleCopyLink} className="bg-white/5 hover:bg-white/10 px-8 py-6 rounded-[1.5rem] font-black border border-white/10 transition-all flex items-center gap-4 active:scale-95">
                  {showCopyFeedback ? <CheckCircle2 className="w-7 h-7 text-green-400" /> : <Copy className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {saveStatus === 'success' ? (
              <div className="flex-1 p-7 bg-green-500 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black shadow-2xl shadow-green-500/40 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-9 h-9" /> 
                <span className="text-xl">¡RESULTADO GUARDADO!</span>
              </div>
            ) : (
              <Button className="flex-1 h-24 rounded-[2rem] text-2xl font-black shadow-2xl uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Procesando..." : "Guardar mi Perfil"}
              </Button>
            )}
            <Button variant="outline" className="flex-1 h-24 rounded-[2rem] text-2xl font-black uppercase tracking-[0.2em] border-2 hover:bg-slate-50 transition-all" onClick={() => {
              setAnswers({});
              setStep('intro');
              setCurrentQuestionIndex(0);
              setSaveStatus('idle');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>
              Reiniciar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 font-sans">
      <main className="pb-32 pt-6">
        {step === 'intro' && renderIntro()}
        {step === 'test' && renderTest()}
        {step === 'results' && renderResults()}
      </main>
    </div>
  );
};

export default App;
