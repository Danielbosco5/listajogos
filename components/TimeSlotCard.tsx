import React, { useState, useRef, useEffect } from 'react';
import type { TimeSlot } from '../types';
import UsersIcon from './icons/UsersIcon';
import SparklesIcon from './icons/SparklesIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onAddPlayer: (playerName: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onRemoveTimeSlot: () => void;
  onUpdateListName: (newName: string) => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ timeSlot, onAddPlayer, onRemovePlayer, onRemoveTimeSlot, onUpdateListName }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [listName, setListName] = useState(timeSlot.listname || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const isFull = timeSlot.players.length >= timeSlot.maxplayers;
  const spotsLeft = timeSlot.maxplayers - timeSlot.players.length;

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && !isFull) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };
  
  const handleListNameBlur = () => {
    setIsEditingName(false);
    onUpdateListName(listName);
  };

  const handleListNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleListNameBlur();
    } else if (e.key === 'Escape') {
      setListName(timeSlot.listname || '');
      setIsEditingName(false);
    }
  };

  const handleRemoveClick = () => {
    const senha = window.prompt('Digite a senha de guardião para excluir:');
    if (senha !== '@Seduc2025') {
      window.alert('Senha incorreta. Exclusão não permitida.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja remover o horário "${timeSlot.time}"? Esta ação não pode ser desfeita.`)) {
      onRemoveTimeSlot();
    }
  };

  const visiblePlayers = timeSlot.players;

  return (
    <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col h-full transition-all duration-300 hover:border-teal-500 hover:shadow-teal-500/10 group/card">
       <button
        onClick={handleRemoveClick}
        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover/card:opacity-100"
        aria-label="Remover horário"
      >
        <TrashIcon className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <h3 className="text-2xl font-bold text-white">{timeSlot.time}</h3>
        <div
          className="group/name flex items-center gap-2 cursor-pointer mt-1"
          onClick={() => setIsEditingName(true)}
        >
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onBlur={handleListNameBlur}
              onKeyDown={handleListNameKeyDown}
              className="text-lg font-semibold text-teal-400 bg-transparent border-b border-teal-500 focus:outline-none w-full"
            />
          ) : (
            <>
              <h4 className="text-lg font-semibold text-teal-400 truncate">{listName || 'Nome da Lista'}</h4>
              <PencilIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-end items-center -mt-8 mb-4">
        <div className="flex items-center gap-2 text-slate-300 bg-slate-700 px-3 py-1 rounded-full text-sm font-medium">
          <UsersIcon className="w-4 h-4" />
          <span>{timeSlot.players.length} / {timeSlot.maxplayers}</span>
        </div>
      </div>

      <div className="flex-grow mb-4 min-h-[100px]">
        {timeSlot.players.length > 0 ? (
          <>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              {visiblePlayers.map((player) => (
                <li key={player.id} className="group/player flex justify-between items-center rounded-md hover:bg-slate-700/50 pr-2">
                  <span className="truncate py-1 pl-2">{player.name}</span>
                  <button
                      onClick={() => onRemovePlayer(player.id)}
                      className="ml-2 text-slate-500 hover:text-red-400 opacity-0 group-hover/player:opacity-100 transition-opacity"
                      aria-label={`Remover ${player.name}`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-slate-400 text-center pt-8">Nenhum jogador na lista. Seja o primeiro!</p>
        )}
      </div>

      <form onSubmit={handleAddPlayerSubmit} className="mt-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder={isFull ? "Horário Lotado" : "Seu nome"}
            disabled={isFull}
            className="flex-grow bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isFull || !newPlayerName.trim()}
            className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-400 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
        <p className={`text-xs mt-2 text-right font-medium ${spotsLeft > 3 ? 'text-slate-400' : 'text-amber-400'}`}>
          {spotsLeft > 0 ? `${spotsLeft} vagas restantes` : 'Nenhuma vaga restante'}
        </p>
      </form>
    </div>
  );
};

export default TimeSlotCard;