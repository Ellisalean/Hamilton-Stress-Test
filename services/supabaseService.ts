import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL && SUPABASE_KEY;

const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

/**
 * Guarda el resultado de un test en la tabla 'hamilton_results'
 */
export const saveTestResult = async (
  userName: string, 
  score: number, 
  category: string, 
  answers: Record<number, number>
) => {
  if (!supabase) {
    console.warn("Supabase no configurado. Simulando éxito localmente.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return { error: null, data: { id: 'mock-id' } };
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
      ]);
      
    return { data, error };
  } catch (err) {
    console.error("Error en Supabase:", err);
    return { data: null, error: err };
  }
};

/**
 * Guarda un nuevo suscriptor en la tabla 'test_subscribers'
 */
export const subscribeUser = async (email: string, userName?: string) => {
  if (!supabase) {
    console.warn("Supabase no configurado. Simulando suscripción.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return { error: null, data: { success: true } };
  }

  try {
    const { data, error } = await supabase
      .from('test_subscribers')
      .insert([
        { 
          email: email, 
          user_name: userName,
          created_at: new Date().toISOString()
        }
      ]);
      
    return { data, error };
  } catch (err) {
    console.error("Error en suscripción:", err);
    return { data: null, error: err };
  }
};
