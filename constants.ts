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
      "Optimización del Descanso: Asegura una higiene del sueño estricta (7-8 horas) para consolidar tu resiliencia emocional ante desafíos futuros.",
      "Práctica de Ocio Activo: Integra actividades que no tengan una meta productiva (hobbies, lectura) para desconectar el sistema de alerta de tu cerebro.",
      "Mantenimiento Físico: Continúa con actividad cardiovascular regular, ya que ayuda a metabolizar las pequeñas dosis diarias de cortisol de forma natural."
    ]
  },
  { 
    max: 18, 
    label: "Ansiedad Leve", 
    color: "text-yellow-600", 
    bg: "bg-yellow-100",
    recommendations: [
      "Identificación de Estresores: Lleva un registro simple de qué momentos del día aumentan tu inquietud para identificar patrones o detonantes específicos.",
      "Técnicas de Micro-respiración: Implementa la respiración en caja (4x4) durante momentos de transición entre tareas para resetear tu sistema nervioso.",
      "Gestión de Cargas: Revisa tu agenda semanal y prioriza tareas esenciales, delegando o posponiendo aquellas que generan presión innecesaria."
    ]
  },
  { 
    max: 25, 
    label: "Ansiedad Moderada", 
    color: "text-orange-600", 
    bg: "bg-orange-100",
    recommendations: [
      "Establecimiento de Límites Digitales: Reduce el consumo de noticias y redes sociales, especialmente 2 horas antes de dormir, para disminuir la sobreestimulación mental.",
      "Movimiento como Liberación: Practica ejercicios de estiramiento o yoga para liberar la tensión muscular acumulada en cuello y espalda por la ansiedad.",
      "Soporte Social Activo: Comparte tu estado con personas de confianza; verbalizar la ansiedad ayuda a reducir su impacto y proporciona una nueva perspectiva."
    ]
  },
  { 
    max: 33, 
    label: "Ansiedad Severa", 
    color: "text-red-600", 
    bg: "bg-red-100",
    recommendations: [
      "Consulta con Especialista: Te recomendamos encarecidamente agendar una sesión con un psicólogo para trabajar herramientas cognitivo-conductuales de manejo.",
      "Relajación Muscular Progresiva: Practica la técnica de Jacobson (tensar y relajar grupos musculares) para combatir los síntomas físicos intensos de la ansiedad.",
      "Simplificación Radical: Reduce temporalmente tus compromisos a lo mínimo vital para permitir que tu cuerpo y mente salgan del estado de alerta constante."
    ]
  },
  { 
    max: 100, 
    label: "Ansiedad Muy Severa", 
    color: "text-red-800", 
    bg: "bg-red-200",
    recommendations: [
      "Intervención Profesional Inmediata: Busca apoyo psicológico o psiquiátrico urgente. Este nivel de ansiedad requiere un acompañamiento clínico especializado.",
      "Entorno de Seguridad: Comunica tu situación a tu círculo más cercano para asegurar una red de apoyo que pueda asistirte en tareas cotidianas.",
      "Suspensión de Decisiones: Evita tomar cambios importantes de vida (trabajo, pareja, finanzas) hasta que tu nivel de ansiedad se haya estabilizado profesionalmente."
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