import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import AddTimeSlotForm from './components/AddTimeSlotForm';
import type { Player, TimeSlot } from './types';
import Modal from './components/Modal';
import PlusIcon from './components/icons/PlusIcon';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carrega as listas do banco ao iniciar
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const { data, error } = await supabase.from('timeslots').select('*');
        console.log('Supabase response:', { data, error });
        
        if (error) {
          console.error('Supabase error details:', error);
          if (error.code === 'PGRST116') {
            setErrorMsg('Tabela "timeslots" não encontrada. Execute o script SQL no Supabase primeiro.');
          } else if (error.code === '42501') {
            setErrorMsg('Permissões insuficientes. Verifique as políticas RLS no Supabase.');
          } else {
            setErrorMsg(`Erro do Supabase: ${error.message} (${error.code})`);
          }
        } else {
          setErrorMsg(null);
          setTimeSlots(data || []);
          if (!data || data.length === 0) {
            console.log('Nenhum registro encontrado, mas a conexão foi bem-sucedida');
          }
        }
      } catch (err) {
        console.error('Erro de rede ou configuração:', err);
        setErrorMsg('Erro de conexão. Verifique sua internet e as configurações do Supabase.');
      }
    };
    fetchTimeSlots();
  }, []);

  const handleAddPlayer = useCallback(async (timeSlotId: string, playerName: string) => {
    // Primeiro atualiza o estado local
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot && slot.players.length < slot.max_players) {
      const newPlayer: Player = { id: Date.now().toString(), name: playerName };
      const updatedPlayers = [...slot.players, newPlayer];
      
      // Atualiza no Supabase
      const { error } = await supabase.from('timeslots').update({ players: updatedPlayers }).eq('id', timeSlotId);
      
      if (!error) {
        setTimeSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.id === timeSlotId ? { ...slot, players: updatedPlayers } : slot
          )
        );
      }
    }
  }, [timeSlots]);

  const handleRemovePlayer = useCallback(async (timeSlotId: string, playerId: string) => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot) {
      const updatedPlayers = slot.players.filter(player => player.id !== playerId);
      
      // Atualiza no Supabase
      const { error } = await supabase.from('timeslots').update({ players: updatedPlayers }).eq('id', timeSlotId);
      
      if (!error) {
        setTimeSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.id === timeSlotId ? { ...slot, players: updatedPlayers } : slot
          )
        );
      }
    }
  }, [timeSlots]);

  const handleCreateTimeSlot = useCallback(async (time: string, listName: string, maxPlayers: number, dayOfWeek: string) => {
    const { error } = await supabase.from('timeslots').insert([{ 
      time, 
      list_name: listName, 
      max_players: maxPlayers, 
      day_of_week: dayOfWeek,
      players: []
    }]);
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

  const handleUpdateListName = useCallback(async (timeSlotId: string, newName: string) => {
    const { error } = await supabase.from('timeslots').update({ list_name: newName }).eq('id', timeSlotId);
    if (!error) {
      setTimeSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === timeSlotId ? { ...slot, list_name: newName } : slot
        )
      );
    }
  }, []);

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const day = slot.day_of_week;
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
