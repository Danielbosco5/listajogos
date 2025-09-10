import React from 'react';
import type { TimeSlot } from '../types';
import TimeSlotCard from './TimeSlotCard';

interface ScheduleViewProps {
  timeSlots: TimeSlot[];
  onAddPlayer: (timeSlotId: string, playerName:string) => void;
  onRemovePlayer: (timeSlotId: string, playerId: string) => void;
  onRemoveTimeSlot: (timeSlotId: string) => void;
  onUpdateListName: (timeSlotId: string, newName: string) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ timeSlots, onAddPlayer, onRemovePlayer, onRemoveTimeSlot, onUpdateListName }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {timeSlots.map(slot => (
        <TimeSlotCard 
          key={slot.id} 
          timeSlot={slot} 
          onAddPlayer={(playerName) => onAddPlayer(slot.id, playerName)}
          onRemovePlayer={(playerId) => onRemovePlayer(slot.id, playerId)}
          onRemoveTimeSlot={() => onRemoveTimeSlot(slot.id)}
          onUpdateListName={(newName) => onUpdateListName(slot.id, newName)}
        />
      ))}
    </div>
  );
};

export default ScheduleView;