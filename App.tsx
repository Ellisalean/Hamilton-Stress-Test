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
  AlertCircle,
  BrainCircuit,
  Save,
  Info,
  Lightbulb,
  Stethoscope,
  Share2,
  Copy,
  MessageCircle,
  ExternalLink,
  Sparkles
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
      if (question.isReverse) {
        total += (5 - value);
      } else {
        total += value;
      }
    });
    return total;
  }, [answers]);

  const resultData = useMemo(() => getScoreCategory(score), [score]);
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleStart = () => {
    if (userName.trim()) {
      setStep('test');
    }
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('results');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveTestResult(userName, score, resultData.label, answers);
    setIsSaving(false);
    setSaveStatus(result.error ? 'error' : 'success');
  };

  const shareTitle = "Mi Valoración de Estrés";
  const shareText = `He realizado el Test de Hamilton. Mi resultado es: ${resultData.label} (${score}/80). ¿Cómo estás tú? Descúbrelo aquí:`;
  const shareUrl = window.location.href;

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      handleShareWhatsApp();
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse-ring bg-primary-500 rounded-full"></div>
        <div className="relative bg-white p-5 rounded-3xl shadow-2xl shadow-primary-500/20 animate-heartbeat">
          <Activity className="w-16 h-16 text-primary-600" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
        Test de Estrés de <span className="text-primary-600">Hamilton</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
        Evalúe su bienestar emocional con una herramienta clínica digitalizada. 
        Un análisis rápido, privado y profesional de su nivel de ansiedad actual.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-sm">
          <input
            type="text"
            placeholder="Su nombre o pseudónimo"
            className="w-full px-4 py-3 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        
        <Button fullWidth onClick={handleStart} disabled={!userName.trim()} className="h-14 rounded-2xl text-lg group">
          Empezar Ahora
          <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      <div className="mt-12 flex items-center gap-6 text-slate-400 grayscale opacity-70">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-1"><CheckCircle2 className="w-5 h-5" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Validado</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-1"><Save className="w-5 h-5" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Seguro</span>
        </div>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-xl mx-auto px-4 py-8 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep('intro')} className="text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors">SALIR</button>
          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
            PREGUNTA {currentQuestionIndex + 1} / {QUESTIONS.length}
          </span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 mb-8 min-h-[350px] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-snug relative z-10">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3 relative z-10">
          {OPTIONS.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center group ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50/50 shadow-md translate-x-1' 
                    : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary-500 bg-primary-500 scale-110' : 'border-slate-300 group-hover:border-primary-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                </div>
                <span className={`font-bold transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-600'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="rounded-2xl">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="flex-1 rounded-2xl shadow-xl shadow-primary-500/30">
          {isLastQuestion ? 'Ver Resultados' : 'Siguiente'}
          {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/80 overflow-hidden mb-10">
        <div className={`p-10 md:p-16 text-center relative overflow-hidden ${resultData.bg}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,0,0,0.1),transparent)]" />
          
          <div className="relative inline-block mb-8">
            <div className={`absolute inset-0 animate-pulse-ring ${resultData.color.replace('text', 'bg')} rounded-full opacity-30`}></div>
            <div className="relative bg-white p-4 rounded-full shadow-lg animate-heartbeat">
              <BrainCircuit className={`w-10 h-10 ${resultData.color}`} />
            </div>
          </div>
          
          <h2 className={`text-7xl font-black mb-2 tracking-tighter ${resultData.color}`}>
            {score}<span className="text-2xl font-bold opacity-30">/80</span>
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500/60 mb-2">Ansiedad Detectada</p>
          <h3 className={`text-4xl font-black tracking-tight ${resultData.color}`}>{resultData.label}</h3>
        </div>

        <div className="p-8 md:p-16 bg-white">
          <div className="text-center mb-12">
            <p className="text-xl text-slate-600 leading-relaxed">
              Hola <span className="text-slate-900 font-black">{userName}</span>, tus respuestas sugieren un estado de bienestar con tendencia a nivel <span className="font-bold underline decoration-primary-500 underline-offset-4">{resultData.label.toLowerCase()}</span>.
            </p>
          </div>

          {/* TARJETA DE COMPARTIR TIPO "INSTAGRAM STORY" */}
          <div className="relative mb-16 animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-cyan-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 animate-pulse-ring bg-white/20 rounded-full"></div>
                  <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20 animate-heartbeat">
                    <Activity className="w-12 h-12 text-primary-400" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Certificado de Valoración</span>
                  </div>
                  <h4 className="text-2xl font-black mb-2 leading-tight">Hamilton Stress Test</h4>
                  <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                    Nivel Detectado: <span className="text-white font-bold">{resultData.label}</span>. 
                    Tú también puedes medir tu salud emocional hoy mismo.
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <button 
                      onClick={handleShareNative}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartir Ahora
                    </button>
                    <button 
                      onClick={handleShareWhatsApp}
                      className="bg-[#25D366] hover:bg-[#1ebe57] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button 
                      onClick={handleCopyLink}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl font-bold border border-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
                    >
                      {showCopyFeedback ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {showCopyFeedback ? '¡Copiado!' : 'Enlace'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                <span className="text-[10px] font-bold tracking-widest uppercase">Análisis Clínico Digital</span>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                   <ExternalLink className="w-3 h-3" />
                   {window.location.host}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-1 gap-6 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Pasos Recomendados</h4>
            </div>
            {resultData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary-600 font-black shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-bold text-lg leading-snug pt-1">{rec}</p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Stethoscope className="w-24 h-24" /></div>
            <div className="relative z-10">
              <h5 className="flex items-center gap-2 font-black text-blue-900 mb-3 text-lg">
                <AlertCircle className="w-5 h-5" />
                Aviso de Salud Profesional
              </h5>
              <p className="text-blue-800/80 text-sm font-medium leading-relaxed">
                Este sistema es una <span className="underline decoration-blue-300">herramienta de cribado preliminar</span> para uso informativo. 
                <strong> No sustituye en ningún caso el diagnóstico de un especialista.</strong> Si sientes que el estrés está afectando tu calidad de vida, te animamos a compartir este resultado con tu médico o un psicólogo colegiado para recibir el apoyo que mereces.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {saveStatus === 'success' ? (
              <div className="flex-1 p-5 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center gap-3 font-black animate-in slide-in-from-top-4">
                <CheckCircle2 className="w-6 h-6" />
                RESULTADO GUARDADO
              </div>
            ) : (
              <Button className="flex-1 h-16 rounded-2xl text-lg shadow-xl" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar en mi Perfil"}
              </Button>
            )}
            
            <Button variant="outline" className="flex-1 h-16 rounded-2xl text-lg font-black" onClick={() => {
              setAnswers({});
              setStep('intro');
              setCurrentQuestionIndex(0);
              setSaveStatus('idle');
            }}>
              Repetir Test
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center opacity-40">
        <Activity className="w-6 h-6 mb-2 text-slate-400" />
        <p className="text-center text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          Hamilton Anxiety Rating Scale (HARS) • Protocolo de Evaluación 2025
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
      <main className="pb-24">
        {step === 'intro' && renderIntro()}
        {step === 'test' && renderTest()}
        {step === 'results' && renderResults()}
      </main>
    </div>
  );
};

export default App;