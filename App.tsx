import React, { useState, useMemo } from 'react';
import { QUESTIONS, OPTIONS, getScoreCategory } from './constants';
import { TestStep } from './types';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { saveTestResult, subscribeUser } from './services/supabaseService';
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
  Sparkles,
  Mail,
  Instagram,
  Twitter,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    const { error } = await subscribeUser(userEmail, userName);
    setIsSubscribing(false);
    if (!error) {
      setSubscribed(true);
    } else {
      alert("Hubo un error al suscribirte. Inténtalo de nuevo.");
    }
  };

  const shareUrl = window.location.origin + "/";
  const shareText = `*Hamilton Stress Test* 💓\n\nHola, acabo de realizar mi valoración de ansiedad y mi resultado es: *${resultData.label}* (${score}/80).\n\n¿Quieres saber cómo estás tú? Haz el test gratuito aquí 👇\n${shareUrl}`;

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hamilton Stress Test',
          text: `Mi resultado: ${resultData.label} (${score}/80). Haz tu test aquí:`,
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
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
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
        Mide tu salud emocional con rigor clínico. Un análisis rápido para entender tu nivel de estrés actual.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-sm">
          <input
            type="text"
            placeholder="Introduce tu nombre"
            className="w-full px-4 py-3 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        
        <Button fullWidth onClick={handleStart} disabled={!userName.trim()} className="h-14 rounded-2xl text-lg group">
          Empezar Test
          <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-slate-400 text-sm font-medium">
        <ShieldCheck className="w-4 h-4" />
        Tus datos están protegidos y son privados
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-xl mx-auto px-4 py-8 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep('intro')} className="text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest">Cancelar</button>
          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-black tracking-wider">
            {currentQuestionIndex + 1} / {QUESTIONS.length}
          </span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 mb-8 min-h-[350px] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BrainCircuit className="w-32 h-32 text-slate-900" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 leading-snug relative z-10 tracking-tight">
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
                    : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary-500 bg-primary-500 scale-110' : 'border-slate-300 group-hover:border-primary-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                </div>
                <span className={`font-black transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-500'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="rounded-2xl h-14 px-8">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="flex-1 rounded-2xl h-14 shadow-xl shadow-primary-500/30 text-lg font-black tracking-tight">
          {isLastQuestion ? 'Obtener Resultados' : 'Continuar'}
          {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/80 overflow-hidden mb-10 border border-slate-100">
        <div className={`p-10 md:p-16 text-center relative overflow-hidden ${resultData.bg}`}>
          <div className="relative inline-block mb-8">
            <div className={`absolute inset-0 animate-pulse-ring ${resultData.color.replace('text', 'bg')} rounded-full opacity-30`}></div>
            <div className="relative bg-white p-4 rounded-full shadow-lg animate-heartbeat">
              <BrainCircuit className={`w-10 h-10 ${resultData.color}`} />
            </div>
          </div>
          <h2 className={`text-8xl font-black mb-2 tracking-tighter ${resultData.color}`}>{score}<span className="text-2xl font-bold opacity-30">/80</span></h2>
          <h3 className={`text-4xl font-black tracking-tight ${resultData.color}`}>{resultData.label}</h3>
        </div>

        <div className="p-8 md:p-16 bg-white">
          <div className="text-center mb-12">
            <p className="text-xl text-slate-600 leading-relaxed">
              Hola <span className="text-slate-900 font-black">{userName}</span>, según la escala Hamilton, tu nivel de estrés se clasifica como <span className="font-bold underline decoration-primary-500 underline-offset-4">{resultData.label.toLowerCase()}</span>.
            </p>
          </div>

          {/* Viral Sharing Section */}
          <div className="relative mb-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-cyan-400 rounded-[2.5rem] blur opacity-25"></div>
            <div className="relative bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl border border-white/5">
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-primary-400 uppercase text-[10px] font-black tracking-[0.3em]">
                    <TrendingUp className="w-3 h-3" />
                    Viraliza el bienestar emocional
                  </div>
                  <h4 className="text-3xl font-black mb-4 tracking-tight">¡Comparte tu resultado!</h4>
                  <p className="text-slate-400 mb-6 text-sm font-medium">Ayuda a tus amigos y familiares a ser conscientes de su nivel de estrés.</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <button onClick={handleShareWhatsApp} className="bg-[#25D366] hover:scale-105 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95 text-sm uppercase tracking-tight">
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </button>
                    <button onClick={handleShareNative} className="bg-primary-500 hover:scale-105 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95 text-sm uppercase tracking-tight">
                      <Share2 className="w-5 h-5" /> Compartir
                    </button>
                    <button onClick={handleCopyLink} className="bg-white/10 hover:bg-white/20 px-5 py-4 rounded-2xl font-black border border-white/10 transition-all flex items-center gap-2 backdrop-blur-sm active:scale-95">
                      {showCopyFeedback ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Capture Section */}
          <div className="mb-16 p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-inner">
            {subscribed ? (
              <div className="text-center py-6 animate-in zoom-in duration-500">
                <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-white">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 text-2xl mb-2 tracking-tight">¡Bienvenido a la comunidad!</h4>
                <p className="text-slate-600 font-medium">Hemos guardado tu correo. Muy pronto recibirás contenido exclusivo para tu bienestar.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary-100 p-2 rounded-xl">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">Hackea tu Estrés</h4>
                </div>
                <p className="text-slate-600 mb-8 text-base font-medium leading-relaxed">Únete a más de 500 personas que reciben guías prácticas y ejercicios semanales de psicología para dominar su ansiedad.</p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    required
                    placeholder="Escribe tu mejor email..."
                    className="flex-1 px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 outline-none focus:border-primary-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <button 
                    disabled={isSubscribing}
                    className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-primary-600/20 active:scale-95 uppercase text-sm tracking-widest"
                  >
                    {isSubscribing ? 'Conectando...' : 'Unirme'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-slate-400 mt-4 text-center font-bold uppercase tracking-widest">Cero spam. Solo valor clínico.</p>
              </>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-6 mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h4 className="text-3xl font-black text-slate-800 tracking-tight">Plan de Acción</h4>
            </div>
            {resultData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-6 p-8 rounded-[2rem] bg-white border border-slate-100 transition-all hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-100/30 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 font-black shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm group-hover:rotate-6">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-bold text-lg leading-relaxed pt-1 group-hover:text-slate-900 transition-colors">{rec}</p>
              </div>
            ))}
          </div>

          {/* Social Follow Section */}
          <div className="flex flex-col items-center justify-center py-12 border-t border-slate-100 gap-8">
            <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">Comunidad de bienestar</p>
            <div className="flex gap-8">
              <a href="#" className="p-5 bg-slate-50 rounded-full text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all hover:scale-110 active:scale-95 shadow-sm border border-slate-100"><Instagram className="w-7 h-7" /></a>
              <a href="#" className="p-5 bg-slate-50 rounded-full text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all hover:scale-110 active:scale-95 shadow-sm border border-slate-100"><Twitter className="w-7 h-7" /></a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {saveStatus === 'success' ? (
              <div className="flex-1 p-6 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center gap-3 font-black border-2 border-green-100 animate-in slide-in-from-top-2"><CheckCircle2 className="w-6 h-6" /> RESULTADOS EN LA NUBE</div>
            ) : (
              <Button className="flex-1 h-20 rounded-2xl text-xl font-black shadow-2xl uppercase tracking-widest" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Enviando..." : "Guardar Registro"}
              </Button>
            )}
            <Button variant="outline" className="flex-1 h-20 rounded-2xl text-xl font-black uppercase tracking-widest border-2" onClick={() => {
              setAnswers({});
              setStep('intro');
              setCurrentQuestionIndex(0);
              setSaveStatus('idle');
              setSubscribed(false);
              setUserEmail('');
            }}>
              Repetir
            </Button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-8">
        Basado en el Inventario de Hamilton para Ansiedad (HARS)
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
      <main className="pb-24 pt-4">
        {step === 'intro' && renderIntro()}
        {step === 'test' && renderTest()}
        {step === 'results' && renderResults()}
      </main>
    </div>
  );
};

export default App;