import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xuvmolypqreekoetjked.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6Ia5QUPo7PSN6-NZjOacmg_A9n5bHgA';

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
