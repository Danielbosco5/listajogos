export interface Player {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  listName?: string;
  dayOfWeek: string;
  players: Player[];
  maxPlayers: number;
}
