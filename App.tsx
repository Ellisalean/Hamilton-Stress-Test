
import React, { useState, useMemo, useEffect } from 'react';
import { QUESTIONS, OPTIONS, getScoreCategory } from './constants';
import { TestStep } from './types';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { saveTestResult, checkConnection, updateConfig, clearConfig, getSupabase } from './services/supabaseService';
import { 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BrainCircuit,
  Copy,
  MessageCircle,
  ShieldCheck,
  Wifi,
  AlertTriangle,
  Settings,
  X,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');

  const verifyDb = async () => {
    setDbStatus('checking');
    const isOnline = await checkConnection();
    setDbStatus(isOnline ? 'online' : 'offline');
  };

  useEffect(() => {
    verifyDb();
  }, []);

  const handleSaveConfig = () => {
    if (inputUrl && inputKey) {
      updateConfig(inputUrl, inputKey);
    }
  };

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
    if (userName.trim()) setStep('test');
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) setStep('results');
    else {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSave = async () => {
    if (saveStatus === 'success') return;
    setIsSaving(true);
    const result = await saveTestResult(userName, score, resultData.label, answers);
    setIsSaving(false);
    
    if (result.error) {
      setSaveStatus('error');
      // Usamos un alert más descriptivo para ayudar al usuario
      alert(`⚠️ Problema de Configuración:\n\n${typeof result.error === 'string' ? result.error : result.error.message}`);
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

  const renderConfigModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Database className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Acceso a Nube</h3>
          </div>
          <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed font-medium">
              Si el botón sale en naranja, significa que Netlify no está enviando las llaves. Asegúrate de que empiecen por <b>VITE_</b> y haz un <b>Redeploy</b>.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Project URL</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700 transition-all"
                placeholder="https://xyz.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Anon Key</label>
              <textarea 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700 transition-all min-h-[100px] resize-none"
                placeholder="eyJhbGciOi..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={handleSaveConfig} className="h-16 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl">
              Conectar Ahora
            </Button>
            <button 
              onClick={clearConfig}
              className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
            >
              Resetear conexión
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse-ring bg-primary-500 rounded-full"></div>
        <div className="relative bg-white p-5 rounded-3xl shadow-2xl shadow-primary-500/20 animate-heartbeat">
          <Activity className="w-16 h-16 text-primary-600" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
        Test de Estrés de <span className="text-primary-600">Hamilton</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed font-medium">
        Mide tu salud emocional con rigor clínico. Un análisis rápido de 20 preguntas para entender tu nivel de estrés actual.
      </p>

      <div 
        onClick={() => setShowConfigModal(true)}
        className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${dbStatus === 'offline' ? 'border-amber-200 bg-amber-50' : 'border-slate-100'}`}
      >
        {dbStatus === 'checking' && <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />}
        {dbStatus === 'online' && <Wifi className="w-3 h-3 text-green-500" />}
        {dbStatus === 'offline' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
        <span className={`text-[10px] font-black uppercase tracking-widest ${dbStatus === 'offline' ? 'text-amber-700' : 'text-slate-400'}`}>
          {dbStatus === 'checking' ? 'Buscando Nube...' : dbStatus === 'online' ? 'Conexión Activa' : 'Configuración Pendiente'}
        </span>
        <Settings className="w-3 h-3 ml-1 opacity-40" />
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white p-2 rounded-2xl border-2 border-slate-100 focus-within:border-primary-500 transition-all shadow-sm">
          <input
            type="text"
            placeholder="Escribe tu nombre"
            className="w-full px-4 py-3 bg-transparent outline-none text-slate-900 placeholder:text-slate-300 font-bold text-lg"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        
        <Button fullWidth onClick={handleStart} disabled={!userName.trim()} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest group shadow-2xl">
          Comenzar
          <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Datos Protegidos
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-xl mx-auto px-4 py-8 w-full animate-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep('intro')} className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">Cerrar</button>
          <span className="bg-white border border-slate-100 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
            {currentQuestionIndex + 1} <span className="text-slate-300">/</span> {QUESTIONS.length}
          </span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12 mb-8 min-h-[400px] flex flex-col justify-center relative border border-slate-50">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-12 leading-tight tracking-tight">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {OPTIONS.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center group ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50 shadow-lg translate-x-2' 
                    : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-full border-2 mr-5 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary-500 bg-primary-500 scale-110' : 'border-slate-200'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-500'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="rounded-2xl h-16 px-8 font-black uppercase text-xs tracking-widest">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="flex-1 rounded-2xl h-16 shadow-2xl shadow-primary-500/20 text-lg font-black uppercase tracking-widest">
          {isLastQuestion ? 'Resultados' : 'Siguiente'}
          {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-1000">
      <div className="bg-white rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] overflow-hidden mb-12 border border-slate-100">
        <div className={`p-12 md:p-20 text-center relative overflow-hidden ${resultData.bg}`}>
          <div className="relative inline-block mb-10">
            <div className={`absolute inset-0 animate-pulse-ring ${resultData.color.replace('text', 'bg')} rounded-full opacity-20`}></div>
            <div className="relative bg-white p-6 rounded-full shadow-2xl animate-heartbeat">
              <BrainCircuit className={`w-12 h-12 ${resultData.color}`} />
            </div>
          </div>
          <p className={`text-sm font-black uppercase tracking-[0.5em] mb-4 opacity-60 ${resultData.color}`}>Puntuación</p>
          <h2 className={`text-9xl font-black mb-4 tracking-tighter ${resultData.color}`}>{score}<span className="text-3xl font-bold opacity-30">/80</span></h2>
          <div className={`inline-block px-8 py-3 rounded-full bg-white shadow-xl ${resultData.color} text-2xl font-black tracking-tight`}>
            {resultData.label}
          </div>
        </div>

        <div className="p-8 md:p-20 bg-white">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Análisis para {userName}</h3>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Según el Inventario de Hamilton, tu nivel es <span className={`font-black underline decoration-4 underline-offset-8 ${resultData.color}`}>{resultData.label.toLowerCase()}</span>.
            </p>
          </div>

          <div className="grid gap-6 mb-20">
            {resultData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-100/20 group cursor-default">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white border-2 border-slate-100 flex items-center justify-center text-primary-600 font-black shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm group-hover:-rotate-3 text-xl">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-bold text-lg leading-relaxed pt-1 group-hover:text-slate-900 transition-colors">{rec}</p>
              </div>
            ))}
          </div>

          <div className="relative mb-20">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary-600 via-primary-400 to-cyan-400 rounded-[3rem] blur-xl opacity-20"></div>
            <div className="relative bg-slate-950 rounded-[3rem] p-10 text-white overflow-hidden shadow-2xl border border-white/5 text-center">
              <h4 className="text-4xl font-black mb-6 tracking-tight">¡Comparte!</h4>
              <p className="text-slate-400 mb-10 text-lg">Ayuda a tus conocidos a medir su nivel de estrés.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={handleShareWhatsApp} className="bg-[#25D366] hover:scale-105 active:scale-95 px-8 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-green-500/20 text-sm uppercase tracking-widest">
                  <MessageCircle className="w-6 h-6" /> WhatsApp
                </button>
                <button onClick={handleCopyLink} className="bg-white/5 hover:bg-white/10 px-6 py-5 rounded-2xl font-black border border-white/10 transition-all flex items-center gap-3 active:scale-95">
                  {showCopyFeedback ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mt-16">
            {saveStatus === 'success' ? (
              <div className="flex-1 p-6 bg-green-500 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black shadow-xl shadow-green-500/30 animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8" /> 
                ¡REGISTRO GUARDADO!
              </div>
            ) : (
              <Button className="flex-1 h-20 rounded-[1.5rem] text-xl font-black shadow-2xl uppercase tracking-[0.2em]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar mi Perfil"}
              </Button>
            )}
            <Button variant="outline" className="flex-1 h-20 rounded-[1.5rem] text-xl font-black uppercase tracking-[0.2em] border-2" onClick={() => {
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <main className="pb-24 pt-4">
        {step === 'intro' && renderIntro()}
        {step === 'test' && renderTest()}
        {step === 'results' && renderResults()}
      </main>
      {showConfigModal && renderConfigModal()}
    </div>
  );
};

export default App;