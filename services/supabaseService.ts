import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string) => {
  return (
    (import.meta as any)?.env?.[name] || 
    process.env[name] || 
    (window as any)._env_?.[name] || 
    ''
  );
};

const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL');
const SUPABASE_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY');

const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

/**
 * Verifica si la conexión con Supabase es funcional
 */
export const checkConnection = async () => {
  if (!supabase) {
    console.error("🔴 Supabase Client no inicializado. Revisa las variables en Netlify.");
    return false;
  }
  try {
    const { error } = await supabase.from('hamilton_results').select('id').limit(1);
    if (error) {
      console.error("🔴 Error al consultar tabla:", error.message);
      return false;
    }
    console.log("🟢 Conexión con Supabase establecida correctamente.");
    return true;
  } catch (err) {
    console.error("🔴 Error de red con Supabase:", err);
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
  if (!supabase) return { error: "Cliente no configurado", data: null };

  console.log(`📤 Enviando resultado para ${userName}...`);
  
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
      
    if (error) console.error("❌ Error de Supabase al insertar:", error);
    else console.log("✅ Resultado guardado exitosamente en la nube.");

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message || "Error desconocido" };
  }
};

/**
 * Guarda un nuevo suscriptor
 */
export const subscribeUser = async (email: string, userName?: string) => {
  if (!supabase) return { error: "Cliente no configurado", data: null };

  try {
    const { data, error } = await supabase
      .from('test_subscribers')
      .insert([{ email, user_name: userName, created_at: new Date().toISOString() }])
      .select();
      
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message || "Error desconocido" };
  }
};
