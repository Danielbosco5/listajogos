import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xsqzthubtwyjjdwwftcv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcXp0aHVidHd5ampkd3dmdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NjI5NjgsImV4cCI6MjA0NzQzODk2OH0.3G4yLV5e7MN6pVc_vAOB6iOCxQ6lNR5nGW8hEL0NsOo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Iniciando verificação da estrutura do banco...');

async function checkAndAddWaitingListColumn() {
  try {
    // Primeiro, vamos tentar buscar uma lista existente para ver a estrutura
    console.log('📋 Verificando estrutura atual...');
    const { data: existingData, error: selectError } = await supabase
      .from('timeslots')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Erro ao verificar dados existentes:', selectError);
      return;
    }
    
    console.log('✅ Dados existentes encontrados:', existingData?.length || 0, 'listas');
    
    if (existingData && existingData.length > 0) {
      const firstRecord = existingData[0];
      console.log('🔍 Estrutura da primeira lista:', Object.keys(firstRecord));
      
      if (firstRecord.waiting_list !== undefined) {
        console.log('✅ Coluna waiting_list já existe!');
        return true;
      } else {
        console.log('❌ Coluna waiting_list não encontrada');
      }
    }
    
    // Tentar uma inserção de teste para ver se a coluna existe
    console.log('🧪 Testando inserção com waiting_list...');
    const testData = {
      time: 'TEST',
      listname: 'TEST',
      dayofweek: 'Test',
      maxplayers: 5,
      players: [],
      waiting_list: []
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('timeslots')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir com waiting_list:', insertError);
      console.log('🔧 A coluna waiting_list não existe. Tentando inserir sem ela...');
      
      // Tentar inserir sem waiting_list
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('timeslots')
        .insert([{
          time: 'TEST_FALLBACK',
          listname: 'TEST_FALLBACK',
          dayofweek: 'Test',
          maxplayers: 5,
          players: []
        }])
        .select();
      
      if (fallbackError) {
        console.error('❌ Erro mesmo sem waiting_list:', fallbackError);
      } else {
        console.log('✅ Inserção sem waiting_list funcionou');
        // Limpar dados de teste
        await supabase.from('timeslots').delete().eq('listname', 'TEST_FALLBACK');
      }
      
      return false;
    } else {
      console.log('✅ Inserção com waiting_list funcionou!');
      // Limpar dados de teste
      await supabase.from('timeslots').delete().eq('listname', 'TEST');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    return false;
  }
}

checkAndAddWaitingListColumn().then((hasWaitingList) => {
  if (hasWaitingList) {
    console.log('🎉 Banco de dados está pronto para lista de espera!');
  } else {
    console.log('⚠️ Banco de dados não suporta lista de espera. Funcionalidade limitada ao localStorage.');
  }
}).catch(console.error);
