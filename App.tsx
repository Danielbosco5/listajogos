import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import AddTimeSlotForm from './components/AddTimeSlotForm';
import type { Player, TimeSlot } from './types';
import Modal from './components/Modal';
import PasswordModal from './components/PasswordModal';
import PlusIcon from './components/icons/PlusIcon';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    type: 'removePlayer' | 'deleteTimeSlot' | 'createTimeSlot';
    timeSlotId: string;
    playerId: string;
    playerName: string;
    onConfirmAction?: () => void;
  }>({
    isOpen: false,
    type: 'removePlayer',
    timeSlotId: '',
    playerId: '',
    playerName: '',
    onConfirmAction: undefined
  });

  // Estado para controlar se o banco suporta waiting_list
  const [supportsWaitingList, setSupportsWaitingList] = useState(false);

  // Carrega as listas do banco ao iniciar
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const { data, error } = await supabase.from('timeslots').select('*');
        console.log('Supabase response:', { data, error });
        
        if (error) {
          console.error('Supabase error details:', error);
          setIsOfflineMode(true);
          if (error.code === 'PGRST116') {
            setErrorMsg('Modo Offline: Tabela não encontrada no Supabase. Você pode criar listas localmente.');
          } else if (error.code === '42501') {
            setErrorMsg('Modo Offline: Permissões insuficientes no Supabase. Você pode criar listas localmente.');
          } else {
            setErrorMsg(`Modo Offline: ${error.message}. Você pode criar listas localmente.`);
          }
          
          // Carrega dados locais se existirem
          const localData = localStorage.getItem('timeSlots');
          if (localData) {
            setTimeSlots(JSON.parse(localData));
          }
        } else {
          setIsOfflineMode(false);
          setErrorMsg(null);
          
          // Verificar se o banco suporta waiting_list
          const hasWaitingListSupport = data && data.length > 0 && 
            data[0].hasOwnProperty('waiting_list');
          setSupportsWaitingList(hasWaitingListSupport);
          
          if (hasWaitingListSupport) {
            console.log('✅ Banco suporta lista de espera');
          } else {
            console.log('⚠️ Banco não suporta lista de espera - usando apenas localStorage para essa funcionalidade');
          }
          
          // Mapear waiting_list para waitingList
          const mappedData = (data || []).map(slot => ({
            ...slot,
            waitingList: slot.waiting_list || []
          }));
          setTimeSlots(mappedData);
          if (!data || data.length === 0) {
            console.log('Nenhum registro encontrado, mas a conexão foi bem-sucedida');
          }
        }
      } catch (err) {
        console.error('Erro de rede ou configuração:', err);
        setIsOfflineMode(true);
        setErrorMsg('Modo Offline: Erro de conexão. Você pode criar listas localmente.');
        
        // Carrega dados locais se existirem
        const localData = localStorage.getItem('timeSlots');
        if (localData) {
          setTimeSlots(JSON.parse(localData));
        }
      }
    };
    fetchTimeSlots();
  }, []);

  const handleAddPlayer = useCallback(async (timeSlotId: string, playerName: string) => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot) {
      const newPlayer: Player = { 
        id: Date.now().toString(), 
        name: playerName,
        addedAt: new Date().toISOString()
      };
      
      let updatedSlot;
      
      if (slot.players.length < slot.maxplayers) {
        // Adiciona à lista principal
        updatedSlot = {
          ...slot,
          players: [...slot.players, newPlayer]
        };
      } else {
        // Adiciona à lista de espera
        const currentWaitingList = slot.waitingList || [];
        updatedSlot = {
          ...slot,
          waitingList: [...currentWaitingList, newPlayer]
        };
        
        // Avisa se a lista de espera não será persistida
        if (!isOfflineMode && !supportsWaitingList) {
          alert('⚠️ Jogador adicionado à lista de espera LOCALMENTE. Para persistir no banco, execute o script SQL no dashboard do Supabase (veja INSTRUCOES_SUPABASE.sql)');
        }
      }
      
      if (isOfflineMode) {
        // Modo offline
        const updatedSlots = timeSlots.map(s => 
          s.id === timeSlotId ? updatedSlot : s
        );
        setTimeSlots(updatedSlots);
        localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
        return;
      }
      
      // Atualiza no Supabase
      const updateData: any = { players: updatedSlot.players };
      
      // Inclui waiting_list se o banco suportar
      if (supportsWaitingList && updatedSlot.waitingList) {
        updateData.waiting_list = updatedSlot.waitingList;
      }
      
      const { error } = await supabase.from('timeslots').update(updateData).eq('id', timeSlotId);
      
      if (!error) {
        setTimeSlots(prevSlots => 
          prevSlots.map(s => 
            s.id === timeSlotId ? updatedSlot : s
          )
        );
      } else {
        console.error('Erro ao adicionar jogador:', error);
        // Fallback para modo offline
        const updatedSlots = timeSlots.map(s => 
          s.id === timeSlotId ? updatedSlot : s
        );
        setTimeSlots(updatedSlots);
        localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      }
    }
  }, [timeSlots, isOfflineMode, supportsWaitingList]);

  const handleRemovePlayer = useCallback(async (timeSlotId: string, playerId: string) => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot) {
      const player = slot.players.find(p => p.id === playerId) || 
                   (slot.waitingList || []).find(p => p.id === playerId);
      
      if (player) {
        setPasswordModal({
          isOpen: true,
          type: 'removePlayer',
          timeSlotId,
          playerId,
          playerName: player.name
        });
      }
    }
  }, [timeSlots]);

  const handlePasswordConfirm = useCallback(async (password: string) => {
    if (password !== '@Seduc2025') {
      alert('Senha incorreta. Operação não permitida.');
      setPasswordModal(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const { type, onConfirmAction } = passwordModal;
    
    if (type === 'removePlayer') {
      const { timeSlotId, playerId } = passwordModal;
      const slot = timeSlots.find(s => s.id === timeSlotId);
      
      if (slot) {
        // Verifica se o jogador está na lista principal ou na lista de espera
        const isInMainList = slot.players.some(player => player.id === playerId);
        const isInWaitingList = slot.waitingList?.some(player => player.id === playerId) || false;
        
        if (!isInMainList && !isInWaitingList) {
          alert('Jogador não encontrado.');
          setPasswordModal(prev => ({ ...prev, isOpen: false }));
          return;
        }
        
        let updatedPlayers = slot.players;
        let updatedWaitingList = slot.waitingList || [];
        
        if (isInMainList) {
          // Remove da lista principal
          updatedPlayers = slot.players.filter(player => player.id !== playerId);
          
          // Se há alguém na lista de espera, promove o primeiro
          if (updatedWaitingList.length > 0) {
            // Ordena por data de adição (mais antigo primeiro)
            updatedWaitingList.sort((a, b) => {
              const dateA = new Date(a.addedAt || 0).getTime();
              const dateB = new Date(b.addedAt || 0).getTime();
              return dateA - dateB;
            });
            
            // Promove o primeiro da lista de espera
            const promotedPlayer = updatedWaitingList[0];
            updatedPlayers.push(promotedPlayer);
            updatedWaitingList = updatedWaitingList.slice(1);
          }
        } else {
          // Remove da lista de espera
          updatedWaitingList = updatedWaitingList.filter(player => player.id !== playerId);
        }
        
        const updatedSlot = {
          ...slot,
          players: updatedPlayers,
          waitingList: updatedWaitingList
        };
        
        if (isOfflineMode) {
          // Modo offline
          const updatedSlots = timeSlots.map(s => 
            s.id === timeSlotId ? updatedSlot : s
          );
          setTimeSlots(updatedSlots);
          localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
        } else {
        // Atualiza no Supabase
        const updateData: any = { 
          players: updatedSlot.players
        };
        
        // Inclui waiting_list se o banco suportar
        if (supportsWaitingList && updatedSlot.waitingList) {
          updateData.waiting_list = updatedSlot.waitingList;
        }
        
        const { error } = await supabase.from('timeslots').update(updateData).eq('id', timeSlotId);          if (!error) {
            setTimeSlots(prevSlots => 
              prevSlots.map(s => 
                s.id === timeSlotId ? updatedSlot : s
              )
            );
          } else {
            console.error('Erro ao remover jogador:', error);
            // Fallback para modo offline
            const updatedSlots = timeSlots.map(s => 
              s.id === timeSlotId ? updatedSlot : s
            );
            setTimeSlots(updatedSlots);
            localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
          }
        }
      }
    } else if (onConfirmAction) {
      // Para outros tipos (deleteTimeSlot, createTimeSlot), executa a ação
      onConfirmAction();
    }
    
    setPasswordModal(prev => ({ ...prev, isOpen: false }));
  }, [timeSlots, isOfflineMode, passwordModal]);

  const handlePasswordCancel = useCallback(() => {
    setPasswordModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleCreateTimeSlotRequest = useCallback((time: string, listName: string, maxPlayers: number, dayOfWeek: string) => {
    setPasswordModal({
      isOpen: true,
      type: 'createTimeSlot',
      timeSlotId: '',
      playerId: '',
      playerName: '',
      onConfirmAction: () => handleCreateTimeSlot(time, listName, maxPlayers, dayOfWeek)
    });
  }, []);

  const handleCreateTimeSlot = useCallback(async (time: string, listName: string, maxPlayers: number, dayOfWeek: string) => {
    if (isOfflineMode) {
      // Modo offline - salva localmente
      console.log('Criando lista em modo offline:', { time, listName, maxPlayers, dayOfWeek });
      
      const newTimeSlot: TimeSlot = {
        id: crypto.randomUUID(),
        time,
        listname: listName,
        maxplayers: maxPlayers,
        dayofweek: dayOfWeek,
        players: [],
        waitingList: [],
        created_at: new Date().toISOString()
      };
      
      const updatedSlots = [...timeSlots, newTimeSlot];
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      setIsAddingSlot(false);
      setErrorMsg('Lista criada em modo offline. Os dados serão perdidos ao recarregar a página.');
      return;
    }
    
    try {
      console.log('Criando lista com dados:', { time, listName, maxPlayers, dayOfWeek });
      
      const insertData: any = { 
        time, 
        listname: listName, 
        maxplayers: maxPlayers, 
        dayofweek: dayOfWeek,
        players: []
      };
      
      // Inclui waiting_list se o banco suportar
      if (supportsWaitingList) {
        insertData.waiting_list = [];
      }
      
      const { data, error } = await supabase.from('timeslots').insert([insertData]).select();
      
      if (error) {
        console.error('Erro ao criar lista:', error);
        setErrorMsg(`Erro ao criar lista: ${error.message}`);
        return;
      }
      
      console.log('Lista criada com sucesso:', data);
      
      // Recarrega todos os dados
      const { data: allData, error: fetchError } = await supabase.from('timeslots').select('*');
      if (fetchError) {
        console.error('Erro ao recarregar dados:', fetchError);
        setErrorMsg(`Lista criada, mas erro ao recarregar: ${fetchError.message}`);
      } else {
        // Mapear waiting_list para waitingList
        const mappedData = (allData || []).map(slot => ({
          ...slot,
          waitingList: slot.waiting_list || []
        }));
        setTimeSlots(mappedData);
        setErrorMsg(null);
      }
      
      setIsAddingSlot(false);
    } catch (err) {
      console.error('Erro geral ao criar lista:', err);
      setErrorMsg('Erro de rede ou configuração. Ativando modo offline...');
      setIsOfflineMode(true);
      
      // Fallback para modo offline
      const newTimeSlot: TimeSlot = {
        id: crypto.randomUUID(),
        time,
        listname: listName,
        maxplayers: maxPlayers,
        dayofweek: dayOfWeek,
        players: [],
        waitingList: [],
        created_at: new Date().toISOString()
      };
      
      const updatedSlots = [...timeSlots, newTimeSlot];
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      setIsAddingSlot(false);
    }
  }, [isOfflineMode, timeSlots, supportsWaitingList]);

  const handleDeleteTimeSlotRequest = useCallback((timeSlotId: string) => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot) {
      setPasswordModal({
        isOpen: true,
        type: 'deleteTimeSlot',
        timeSlotId,
        playerId: '',
        playerName: '',
        onConfirmAction: () => handleRemoveTimeSlot(timeSlotId)
      });
    }
  }, [timeSlots]);

  const handleRemoveTimeSlot = useCallback(async (timeSlotId: string) => {
    if (isOfflineMode) {
      // Modo offline
      const updatedSlots = timeSlots.filter(slot => slot.id !== timeSlotId);
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      return;
    }
    
    try {
      const { error } = await supabase.from('timeslots').delete().eq('id', timeSlotId);
      if (!error) {
        const { data } = await supabase.from('timeslots').select('*');
        setTimeSlots(data || []);
      } else {
        console.error('Erro ao remover lista:', error);
        // Fallback para modo offline
        const updatedSlots = timeSlots.filter(slot => slot.id !== timeSlotId);
        setTimeSlots(updatedSlots);
        localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      }
    } catch (err) {
      console.error('Erro geral ao remover lista:', err);
      // Fallback para modo offline
      const updatedSlots = timeSlots.filter(slot => slot.id !== timeSlotId);
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
    }
  }, [timeSlots]);

  const handleUpdateListName = useCallback(async (timeSlotId: string, newName: string) => {
    if (isOfflineMode) {
      // Modo offline
      const updatedSlots = timeSlots.map(slot => 
        slot.id === timeSlotId ? { ...slot, listname: newName } : slot
      );
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      return;
    }
    
    const { error } = await supabase.from('timeslots').update({ listname: newName }).eq('id', timeSlotId);
    if (!error) {
      setTimeSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === timeSlotId ? { ...slot, listname: newName } : slot
        )
      );
    } else {
      console.error('Erro ao atualizar nome:', error);
      // Fallback para modo offline
      const updatedSlots = timeSlots.map(slot => 
        slot.id === timeSlotId ? { ...slot, listname: newName } : slot
      );
      setTimeSlots(updatedSlots);
      localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
    }
  }, [timeSlots]);

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const day = slot.dayofweek;
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
        
        {/* Indicador de modo offline */}
        {isOfflineMode && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-400 font-semibold">🔒 Modo Offline</span>
              <span className="ml-2 text-yellow-200">Dados salvos localmente</span>
            </div>
          </div>
        )}
        
        <main className="mt-8">
          {errorMsg ? (
            <div className={`text-center mt-8 py-16 rounded-lg border-2 border-dashed ${
              isOfflineMode 
                ? 'text-yellow-400 bg-yellow-900/20 border-yellow-700' 
                : 'text-red-400 bg-slate-800/50 border-red-700'
            }`}>
              <h3 className="text-xl font-semibold">{errorMsg}</h3>
              <p className="mt-2">
                {isOfflineMode 
                  ? "Suas listas funcionarão normalmente, mas os dados não serão salvos permanentemente."
                  : "Verifique o console do navegador para detalhes."
                }
              </p>
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
                    onRemoveTimeSlot={handleDeleteTimeSlotRequest}
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
            onAdd={handleCreateTimeSlotRequest} 
            onCancel={() => setIsAddingSlot(false)} 
          />
        </Modal>
      )}

      {passwordModal.isOpen && (
        <PasswordModal
          isOpen={passwordModal.isOpen}
          title="Senha de Guardião"
          message={
            passwordModal.type === 'removePlayer' 
              ? `Digite a senha para remover ${passwordModal.playerName}:`
              : passwordModal.type === 'deleteTimeSlot'
              ? 'Digite a senha de guardião para excluir esta lista:'
              : passwordModal.type === 'createTimeSlot'
              ? 'Digite a senha de guardião para criar uma nova lista:'
              : 'Digite a senha de guardião:'
          }
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
        />
      )}
    </div>
  );
};

export default App;
