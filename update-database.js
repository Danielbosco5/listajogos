// Script para atualizar o banco de dados Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xsqzthubtwyjjdwwftcv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcXp0aHVidHd5ampkd3dmdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NjI5NjgsImV4cCI6MjA0NzQzODk2OH0.3G4yLV5e7MN6pVc_vAOB6iOCxQ6lNR5nGW8hEL0NsOo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabase() {
  console.log('Verificando estrutura da tabela...');
  
  // Primeiro, vamos verificar se a coluna waiting_list existe
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'timeslots');
    
  if (columnsError) {
    console.error('Erro ao verificar colunas:', columnsError);
  } else {
    console.log('Colunas existentes:', columns.map(c => c.column_name));
  }
  
  // Tentar adicionar a coluna waiting_list se não existir
  try {
    console.log('Tentando adicionar coluna waiting_list...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'timeslots' AND column_name = 'waiting_list'
          ) THEN
            ALTER TABLE timeslots ADD COLUMN waiting_list JSONB DEFAULT '[]'::jsonb;
          END IF;
        END $$;
      `
    });
    
    if (error) {
      console.error('Erro ao adicionar coluna:', error);
    } else {
      console.log('Coluna waiting_list adicionada/verificada com sucesso');
    }
  } catch (err) {
    console.error('Erro na execução SQL:', err);
  }
  
  // Verificar dados existentes
  const { data: existing, error: selectError } = await supabase
    .from('timeslots')
    .select('*');
    
  if (selectError) {
    console.error('Erro ao buscar dados:', selectError);
  } else {
    console.log(`Encontradas ${existing.length} listas existentes`);
    
    // Atualizar registros que não têm waiting_list
    for (const record of existing) {
      if (!record.waiting_list) {
        const { error: updateError } = await supabase
          .from('timeslots')
          .update({ waiting_list: [] })
          .eq('id', record.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar registro ${record.id}:`, updateError);
        } else {
          console.log(`Registro ${record.id} atualizado`);
        }
      }
    }
  }
}

updateDatabase().catch(console.error);
