import React, { useState, useMemo, useEffect } from 'react';
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
  Stethoscope
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Calculate scores
  const score = useMemo(() => {
    let total = 0;
    Object.entries(answers).forEach(([qId, val]) => {
      const value = val as number;
      const question = QUESTIONS.find(q => q.id === parseInt(qId));
      if (!question) return;

      if (question.isReverse) {
        // Reverse scoring: 1->4, 2->3, 3->2, 4->1
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
    const result = await saveTestResult(
      userName,
      score,
      resultData.label,
      answers
    );
    
    setIsSaving(false);
    if (result.error) {
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
    }
  };

  // --- RENDER STEPS ---

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-4 rounded-2xl shadow-xl shadow-primary-500/10 mb-8">
        <Activity className="w-16 h-16 text-primary-600" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
        Test de Estrés de <span className="text-primary-600">Hamilton</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
        Esta herramienta evalúa su nivel de ansiedad y estrés a través de 20 preguntas estandarizadas. 
        Responda con sinceridad para obtener un resultado preciso.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
          <label htmlFor="name" className="sr-only">Su Nombre</label>
          <input
            type="text"
            id="name"
            placeholder="Ingrese su nombre para comenzar"
            className="w-full px-4 py-2 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        
        <Button 
          fullWidth 
          onClick={handleStart} 
          disabled={!userName.trim()}
          className="group"
        >
          Comenzar Test
          <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 uppercase tracking-wider font-semibold">
        Totalmente Confidencial
      </p>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-xl mx-auto px-4 py-8 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setStep('intro')} 
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <span className="text-sm font-semibold text-primary-600">
            Pregunta {currentQuestionIndex + 1} de {QUESTIONS.length}
          </span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 mb-8 min-h-[300px] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-300" />
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {OPTIONS.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group ${
                  isSelected 
                    ? 'border-primary-600 bg-primary-50 text-primary-900' 
                    : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary-600 bg-primary-600' : 'border-slate-300 group-hover:border-primary-400'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <Button 
          variant="ghost" 
          onClick={handlePrev} 
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Anterior
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!answers[currentQuestion.id]}
          className="px-8"
        >
          {isLastQuestion ? 'Finalizar' : 'Siguiente'}
          {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden mb-8">
        <div className={`p-8 md:p-12 text-center ${resultData.bg}`}>
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6">
            <BrainCircuit className={`w-8 h-8 ${resultData.color}`} />
          </div>
          <h2 className={`text-6xl font-bold mb-2 ${resultData.color}`}>
            {score}
            <span className="text-2xl font-medium text-slate-500 opacity-60 ml-1">/80</span>
          </h2>
          <p className="text-lg font-medium text-slate-600 uppercase tracking-widest mb-1">Resultado de Ansiedad</p>
          <h3 className={`text-3xl font-bold ${resultData.color}`}>{resultData.label}</h3>
        </div>

        <div className="p-8 md:p-12 bg-white">
          <div className="prose prose-slate max-w-none mb-10 text-center">
            <p className="text-slate-700 text-lg leading-relaxed">
              Hola <span className="font-bold text-slate-900">{userName}</span>, hemos completado su valoración. 
              Según la Escala de Hamilton, su puntuación sugiere un nivel de ansiedad <span className="font-bold">{resultData.label.toLowerCase()}</span>.
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h4 className="text-xl font-bold text-slate-800">Medidas Sugeridas</h4>
            </div>
            <div className="grid md:grid-cols-1 gap-4">
              {resultData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary-600 font-bold shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mb-10">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h5 className="font-bold text-blue-900 mb-1">Nota de Salud Profesional</h5>
                <p className="text-blue-800/80 text-sm leading-relaxed">
                  Este test es una herramienta de valoración preliminar diseñada para orientar sobre su estado emocional actual. 
                  <strong> No constituye un diagnóstico médico o clínico formal.</strong> Para una evaluación exhaustiva y un plan de bienestar personalizado, le recomendamos encarecidamente que consulte con un profesional de la salud mental colegiado o con su médico de cabecera. Su salud integral es lo más importante.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {saveStatus === 'success' ? (
              <div className="flex-1 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2 font-medium animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5" />
                Resultados guardados correctamente
              </div>
            ) : (
              <Button 
                className="flex-1" 
                onClick={handleSave} 
                disabled={isSaving || saveStatus === 'success'}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Resultados
                  </span>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setAnswers({});
                setStep('intro');
                setCurrentQuestionIndex(0);
                setSaveStatus('idle');
              }}
            >
              Realizar nuevo test
            </Button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Info className="w-4 h-4" />
        Basado en la Escala de Ansiedad de Hamilton (HARS)
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      <nav className="p-4 md:p-6 flex justify-center">
        {/* Placeholder for navigation/brand */}
      </nav>
      
      <main className="pb-20">
        {step === 'intro' && renderIntro()}
        {step === 'test' && renderTest()}
        {step === 'results' && renderResults()}
      </main>
    </div>
  );
};

export default App;