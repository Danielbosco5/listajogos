import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://xuvmolypqreekoetjked.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dm1vbHlwcXJlZWtvZXRqa2VkIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTc1Mjc0NDEsImV4cCI6MjA3MzEwMzQ0MX0.rONiTJsWdaLdqQPeBT0NYNKNbb3BkReCXblYgr68dGs';

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export interface TimeSlotTable {
  id: string;
  time: string;
  listName?: string;
  dayOfWeek: string;
  maxPlayers: number;
  players: {
    id: string;
    name: string;
  }[];
  created_at?: string;
}
