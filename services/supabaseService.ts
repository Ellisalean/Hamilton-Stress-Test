import { createClient } from '@supabase/supabase-js';

// Función ultra-flexible para encontrar las variables en cualquier entorno
const getEnv = (name: string): string => {
  const env = (import.meta as any)?.env || {};
  const processEnv = (typeof process !== 'undefined' ? process.env : {}) as any;
  const windowEnv = (window as any)._env_ || {};

  // Buscamos con diferentes prefijos comunes
  const possibleNames = [
    `VITE_${name}`,
    `REACT_APP_${name}`,
    name
  ];

  for (const n of possibleNames) {
    const val = env[n] || processEnv[n] || windowEnv[n];
    if (val) return val.trim();
  }

  return '';
};

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY');

// Verificación detallada para el log
const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

if (!isConfigured) {
  console.warn("⚠️ [Supabase] Faltan variables de configuración:");
  if (!SUPABASE_URL) console.warn("   - Falta URL");
  if (!SUPABASE_KEY) console.warn("   - Falta ANON_KEY");
}

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

/**
 * Verifica si la conexión con Supabase es funcional
 */
export const checkConnection = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('hamilton_results').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error("🔴 Error de conexión:", err);
    return false;
  }
};

/**
 * Guarda el resultado de un test
 */
export const saveTestResult = async (
  userName: string, 
  score: number, 
  category: string, 
  answers: Record<number, number>
) => {
  if (!supabase) {
    return { 
      error: `Configuración incompleta. URL: ${SUPABASE_URL ? '✅' : '❌'}, KEY: ${SUPABASE_KEY ? '✅' : '❌'}. Revisa Netlify.`, 
      data: null 
    };
  }

  try {
    const { data, error } = await supabase
      .from('hamilton_results')
      .insert([
        { 
          user_name: userName, 
          score: score, 
          category: category, 
          answers: answers,
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message || "Error inesperado de red" };
  }
};

/**
 * Guarda un nuevo suscriptor
 */
export const subscribeUser = async (email: string, userName?: string) => {
  if (!supabase) return { error: "No configurado", data: null };
  try {
    const { data, error } = await supabase
      .from('test_subscribers')
      .insert([{ email, user_name: userName, created_at: new Date().toISOString() }])
      .select();
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
};
