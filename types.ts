export interface Player {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  listname?: string;
  dayofweek: string;
  players: Player[];
  maxplayers: number;
}
