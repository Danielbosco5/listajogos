import React, { useState } from 'react';
import { MAX_PLAYERS_PER_SLOT } from '../constants';

interface AddTimeSlotFormProps {
  onAdd: (time: string, listName: string, maxPlayers: number, dayOfWeek: string) => void;
  onCancel: () => void;
}

const weekDays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

const AddTimeSlotForm: React.FC<AddTimeSlotFormProps> = ({ onAdd, onCancel }) => {
  const [time, setTime] = useState('');
  const [listName, setListName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(MAX_PLAYERS_PER_SLOT);
  const [dayOfWeek, setDayOfWeek] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time.trim() && dayOfWeek) {
      onAdd(time.trim(), listName.trim(), maxPlayers, dayOfWeek);
      setTime('');
      setListName('');
      setDayOfWeek('');
      setMaxPlayers(MAX_PLAYERS_PER_SLOT);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-slate-300 mb-1">Dia da Semana</label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>Selecione um dia</option>
              {weekDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-300 mb-1">Horário (ex: 18:00)</label>
            <input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="18:00 - 19:00"
              required
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="listName" className="block text-sm font-medium text-slate-300 mb-1">Nome da Lista (Opcional)</label>
            <input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Futebol dos Amigos"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
           <div>
            <label htmlFor="maxPlayers" className="block text-sm font-medium text-slate-300 mb-1">Max. Jogadores</label>
            <input
              id="maxPlayers"
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || 1)}
              min="1"
              required
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-400 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={!time.trim() || !dayOfWeek}
          >
            Salvar Horário
          </button>
        </div>
      </form>
  );
};

export default AddTimeSlotForm;