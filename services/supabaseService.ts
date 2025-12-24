import { createClient } from '@supabase/supabase-js';

// NOTE: In a real environment, these would be in import.meta.env
// For this demo, we check if they exist, otherwise we mock the success.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL && SUPABASE_KEY;

const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const saveTestResult = async (
  userName: string, 
  score: number, 
  category: string, 
  answers: Record<number, number>
) => {
  if (!supabase) {
    console.warn("Supabase not configured. Mocking success.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    return { data: null, error: err };
  }
};