import { Question } from './types';

export const QUESTIONS: Question[] = [
  { id: 1, text: "Me siento más nervioso y ansioso de lo normal.", isReverse: false },
  { id: 2, text: "Siento miedo sin ver razón para ello.", isReverse: false },
  { id: 3, text: "Me enfado con facilidad o siento momentos de mal humor.", isReverse: false },
  { id: 4, text: "Siento como si me derrumbara o me fuera a desintegrar.", isReverse: false },
  { id: 5, text: "Siento que todo va bien y nada malo puede suceder.", isReverse: true },
  { id: 6, text: "Los brazos y las piernas me ponen trémulos y me tiemblan.", isReverse: false },
  { id: 7, text: "Me siento molesto por los dolores de cabeza, cuello y espalda.", isReverse: false },
  { id: 8, text: "Me siento débil y me canso con facilidad.", isReverse: false },
  { id: 9, text: "Me siento tranquilo y puedo permanecer sentado fácilmente.", isReverse: true },
  { id: 10, text: "Siento que mi corazón late con rapidez.", isReverse: false },
  { id: 11, text: "Estoy preocupado por los momentos de mareo que siento.", isReverse: false },
  { id: 12, text: "Tengo períodos de desmayos o algo así.", isReverse: false },
  { id: 13, text: "Puedo respirar bien, con facilidad.", isReverse: true },
  { id: 14, text: "Siento adormecimiento y hormigueo en los dedos de las manos y de los pies.", isReverse: false },
  { id: 15, text: "Me siento molesto por los dolores de estomago y digestiones.", isReverse: false },
  { id: 16, text: "Tengo que orinar con mucha frecuencia.", isReverse: false },
  { id: 17, text: "Mis manos la siento secas y cálidas.", isReverse: true },
  { id: 18, text: "Siento que mi cara se enrojece y me ruborizo.", isReverse: false },
  { id: 19, text: "Puedo dormir con facilidad y descansar bien.", isReverse: true },
  { id: 20, text: "Tengo pesadillas.", isReverse: false },
];

export const SCORING_RANGES = [
  { 
    max: 14, 
    label: "Normal", 
    color: "text-green-600", 
    bg: "bg-green-100",
    recommendations: [
      "Mantener hábitos de sueño regulares.",
      "Practicar actividad física al menos 3 veces por semana.",
      "Continuar con prácticas de autocuidado y tiempo de ocio."
    ]
  },
  { 
    max: 18, 
    label: "Leve", 
    color: "text-yellow-600", 
    bg: "bg-yellow-100",
    recommendations: [
      "Iniciarse en técnicas de respiración diafragmática.",
      "Evaluar y organizar la carga de tareas diarias.",
      "Practicar mindfulness o meditación guiada 10 minutos al día."
    ]
  },
  { 
    max: 25, 
    label: "Moderada", 
    color: "text-orange-600", 
    bg: "bg-orange-100",
    recommendations: [
      "Reducir el consumo de cafeína y otros estimulantes.",
      "Establecer límites claros entre el trabajo y la vida personal.",
      "Considerar la consulta con un profesional para gestionar el estrés."
    ]
  },
  { 
    max: 33, 
    label: "Severa", 
    color: "text-red-600", 
    bg: "bg-red-100",
    recommendations: [
      "Priorizar la búsqueda de apoyo profesional psicológico.",
      "Hablar con personas de confianza sobre su estado emocional.",
      "Practicar técnicas de relajación muscular progresiva."
    ]
  },
  { 
    max: 100, 
    label: "Extremadamente Severa", 
    color: "text-red-800", 
    bg: "bg-red-200",
    recommendations: [
      "Búsqueda inmediata de asistencia profesional especializada.",
      "Evitar la toma de decisiones importantes bajo este estado.",
      "Asegurar un entorno de apoyo constante y seguro."
    ]
  },
];

export const OPTIONS = [
  { value: 1, label: "Raramente" },
  { value: 2, label: "Algunas veces" },
  { value: 3, label: "Muchas veces" },
  { value: 4, label: "Siempre" },
];

export const getScoreCategory = (score: number) => {
  for (const range of SCORING_RANGES) {
    if (score <= range.max) return range;
  }
  return SCORING_RANGES[SCORING_RANGES.length - 1];
};