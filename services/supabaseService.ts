
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * BUSCADOR DE VARIABLES ULTRA-RESILIENTE
 */
const getVar = (name: string): string => {
  // 1. Intentar desde LocalStorage (Configuración manual)
  const local = localStorage.getItem(`hamilton_${name.toLowerCase()}`);
  if (local) return local.trim();

  // 2. Intentar desde process.env (Inyección estándar)
  const env = (process.env as any);
  if (env && env[name]) return env[name].trim();

  // 3. Intentar desde import.meta.env (Estándar de Vite)
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[name]) return viteEnv[name].trim();
  } catch (e) {
    // Silencioso
  }

  return '';
};

const getFullConfig = () => ({
  url: getVar('VITE_SUPABASE_URL') || getVar('SUPABASE_URL'),
  key: getVar('VITE_SUPABASE_ANON_KEY') || getVar('SUPABASE_ANON_KEY'),
});

// Cliente persistente
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  const { url, key } = getFullConfig();
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.error("Error al crear cliente Supabase:", e);
      return null;
    }
  }
  return null;
};

// Exportamos una referencia para compatibilidad, pero usaremos getSupabase() preferentemente
export const supabase = getSupabase();

/**
 * Guarda el resultado del test
 */
export const saveTestResult = async (
  userName: string, 
  score: number, 
  category: string, 
  answers: Record<number, number>
) => {
  const client = getSupabase();
  
  if (!client) {
    const cfg = getFullConfig();
    return { 
      error: `Configuración incompleta en Netlify.\nURL: ${cfg.url ? '✅' : '❌'}\nKEY: ${cfg.key ? '✅' : '❌'}\n\nRecuerda usar el prefijo VITE_ y hacer un "Clear cache and deploy" en Netlify.`, 
      data: null 
    };
  }

  try {
    const { data, error } = await client
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
    return { data: null, error: err.message || "Error crítico de conexión" };
  }
};

export const checkConnection = async () => {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('hamilton_results').select('id').limit(1);
    return !error;
  } catch (err) {
    return false;
  }
};

export const updateConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('hamilton_vite_supabase_url', newUrl.trim());
  localStorage.setItem('hamilton_vite_supabase_anon_key', newKey.trim());
  window.location.reload();
};

export const clearConfig = () => {
  localStorage.removeItem('hamilton_vite_supabase_url');
  localStorage.removeItem('hamilton_vite_supabase_anon_key');
  window.location.reload();
};
