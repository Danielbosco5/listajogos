import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xuvmolypqreekoetjked.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dm1vbHlwcXJlZWtvZXRqa2VkIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTc1Mjc0NDEsImV4cCI6MjA3MzEwMzQ0MX0.rONiTJsWdaLdqQPeBT0NYNKNbb3BkReCXblYgr68dGs';

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export interface TimeSlotTable {
  id: string;
  time: string;
  list_name?: string;
  day_of_week: string;
  max_players: number;
  players: {
    id: string;
    name: string;
  }[];
  created_at?: string;
}
