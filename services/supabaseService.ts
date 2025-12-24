
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * BUSCADOR DE VARIABLES ENTORNO (PRODUCCIÓN)
 */
const getVar = (name: string): string => {
  // 1. Intentar desde process.env (Inyección estándar Netlify)
  const env = (process.env as any);
  if (env && env[name]) return env[name].trim();

  // 2. Intentar desde import.meta.env (Estándar de Vite)
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[name]) return viteEnv[name].trim();
  } catch (e) {}

  return '';
};

const getFullConfig = () => ({
  url: getVar('VITE_SUPABASE_URL') || getVar('SUPABASE_URL'),
  key: getVar('VITE_SUPABASE_ANON_KEY') || getVar('SUPABASE_ANON_KEY'),
});

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  const { url, key } = getFullConfig();
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      return null;
    }
  }
  return null;
};

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
    return { error: "Database not configured", data: null };
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
    return { data: null, error: err.message || "Connection Error" };
  }
};
