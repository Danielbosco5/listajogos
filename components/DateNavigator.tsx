
import React from 'react';

interface DateNavigatorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, setSelectedDate }) => {
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(selectedDate);

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg max-w-2xl mx-auto mb-8 border border-slate-700">
      <button
        onClick={() => changeDate(-1)}
        className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
      >
        Anterior
      </button>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">{formattedDate}</h2>
        {isToday && <span className="text-sm text-teal-400 font-medium">Hoje</span>}
      </div>
      <button
        onClick={() => changeDate(1)}
        className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
      >
        Próximo
      </button>
    </div>
  );
};

export default DateNavigator;
