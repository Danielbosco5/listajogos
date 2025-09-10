import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import AddTimeSlotForm from './components/AddTimeSlotForm';
import type { Player, TimeSlot } from './types';
import Modal from './components/Modal';
import PlusIcon from './components/icons/PlusIcon';

declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carrega as listas do banco ao iniciar
  useEffect(() => {
    const fetchTimeSlots = async () => {
      const { data, error } = await supabase.from('timeslots').select('*');
      console.log('Supabase data:', data, 'Error:', error);
      if (error) {
        setErrorMsg('Erro ao conectar ao banco Supabase. Verifique as variáveis de ambiente e a tabela.');
      } else if (!data || data.length === 0) {
        setErrorMsg('Nenhuma lista encontrada. Crie uma nova lista para começar.');
      } else {
        setErrorMsg(null);
        setTimeSlots(data);
      }
    };
    fetchTimeSlots();
  }, []);

  const handleAddPlayer = useCallback(async (timeSlotId: string, playerName: string) => {
    // Adiciona jogador localmente (pode ser adaptado para persistir no banco se necessário)
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.id === timeSlotId && slot.players.length < slot.maxPlayers) {
          const newPlayer: Player = { id: Date.now().toString(), name: playerName };
          return { ...slot, players: [...slot.players, newPlayer] };
        }
        return slot;
      })
    );
  }, []);

  const handleRemovePlayer = useCallback((timeSlotId: string, playerId: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.id === timeSlotId) {
          const updatedPlayers = slot.players.filter(player => player.id !== playerId);
          return { ...slot, players: updatedPlayers };
        }
        return slot;
      })
    );
  }, []);

  const handleCreateTimeSlot = useCallback(async (time: string, listName: string, maxPlayers: number, dayOfWeek: string) => {
    const { error } = await supabase.from('timeslots').insert([{ time, listName, maxPlayers, dayOfWeek }]);
    if (!error) {
      const { data } = await supabase.from('timeslots').select('*');
      setTimeSlots(data || []);
      setIsAddingSlot(false);
    }
  }, []);

  const handleRemoveTimeSlot = useCallback(async (timeSlotId: string) => {
    await supabase.from('timeslots').delete().eq('id', timeSlotId);
    const { data } = await supabase.from('timeslots').select('*');
    setTimeSlots(data || []);
  }, []);

  const handleUpdateListName = useCallback((timeSlotId: string, newName: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === timeSlotId ? { ...slot, listName: newName } : slot
      )
    );
  }, []);

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const day = slot.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    // Sort by time within the day group
    acc[day].sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const weekDaysOrder = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  
  const sortedDays = Object.keys(groupedSlots).sort((a, b) => weekDaysOrder.indexOf(a) - weekDaysOrder.indexOf(b));

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          {errorMsg ? (
            <div className="text-center text-red-400 mt-8 py-16 bg-slate-800/50 rounded-lg border-2 border-dashed border-red-700">
              <h3 className="text-xl font-semibold">{errorMsg}</h3>
              <p className="mt-2">Verifique o console do navegador para detalhes.</p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="space-y-12">
              {sortedDays.map(day => (
                <section key={day} aria-labelledby={`day-heading-${day}`}>
                  <h2 id={`day-heading-${day}`} className="text-3xl font-bold text-teal-400 mb-6 border-b-2 border-slate-700 pb-2">
                    {day}
                  </h2>
                  <ScheduleView 
                    timeSlots={groupedSlots[day]}
                    onAddPlayer={handleAddPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    onRemoveTimeSlot={handleRemoveTimeSlot}
                    onUpdateListName={handleUpdateListName}
                  />
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-8 py-16 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
              <h3 className="text-xl font-semibold text-white">Nenhuma lista de jogos criada.</h3>
              <p className="mt-2">Use o botão <span className="font-bold text-teal-400">+</span> para criar a primeira lista de jogos.</p>
            </div>
          )}
        </main>
        <footer className="text-center py-8 mt-12 text-slate-500">
          <p>&copy; {new Date().getFullYear()} SEDUC GO. Todos os direitos reservados.</p>
        </footer>
      </div>

      <button
        onClick={() => setIsAddingSlot(true)}
        className="fixed bottom-6 right-6 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 z-40"
        aria-label="Adicionar Novo Horário"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {isAddingSlot && (
        <Modal title="Criar Nova Lista de Jogos" onClose={() => setIsAddingSlot(false)}>
          <AddTimeSlotForm 
            onAdd={handleCreateTimeSlot} 
            onCancel={() => setIsAddingSlot(false)} 
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
