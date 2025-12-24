
import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANTE PARA NETLIFY:
 * Para que las variables sean visibles en el navegador, 
 * DEBEN empezar por VITE_ en el panel de Netlify.
 */

// Intentamos obtener las variables de las 3 fuentes posibles en orden de prioridad
const getInitialConfig = () => {
  // 1. Prioridad Máxima: Variables de entorno (Inyectadas en el build)
  // Fix: Accessing environment variables through process.env instead of import.meta.env
  // to resolve "Property 'env' does not exist on type 'ImportMeta'" TypeScript errors.
  const viteUrl = (process.env as any).VITE_SUPABASE_URL;
  const viteKey = (process.env as any).VITE_SUPABASE_ANON_KEY;

  // 2. Segunda Prioridad: LocalStorage (Configuración manual del dueño)
  const localUrl = localStorage.getItem('hamilton_supabase_url');
  const localKey = localStorage.getItem('hamilton_supabase_key');

  return {
    url: (viteUrl || localUrl || '').trim(),
    key: (viteKey || localKey || '').trim(),
    source: viteUrl ? 'system' : (localUrl ? 'manual' : 'none')
  };
};

let config = getInitialConfig();

// Inicializar el cliente solo si tenemos datos
export let supabase = (config.url && config.key) 
  ? createClient(config.url, config.key) 
  : null;

/**
 * Actualiza la configuración (útil para pruebas locales)
 */
export const updateConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('hamilton_supabase_url', newUrl.trim());
  localStorage.setItem('hamilton_supabase_key', newKey.trim());
  window.location.reload(); // Recargamos para aplicar cambios globales
};

export const clearConfig = () => {
  localStorage.removeItem('hamilton_supabase_url');
  localStorage.removeItem('hamilton_supabase_key');
  window.location.reload();
};

/**
 * Verifica si la conexión es real
 */
export const checkConnection = async () => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('hamilton_results').select('id').limit(1);
    return !error;
  } catch (err) {
    return false;
  }
};

/**
 * Guarda el resultado
 */
export const saveTestResult = async (
  userName: string, 
  score: number, 
  category: string, 
  answers: Record<number, number>
) => {
  if (!supabase) {
    return { error: "Base de datos no configurada en Netlify. Revisa las variables VITE_.", data: null };
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
    return { data: null, error: err.message || "Error de conexión" };
  }
};
