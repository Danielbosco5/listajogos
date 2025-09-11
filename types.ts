export interface Player {
  id: string;
  name: string;
  addedAt?: string; // Para controlar ordem na lista de espera
}

export interface TimeSlot {
  id: string;
  time: string;
  listname?: string;
  dayofweek: string;
  players: Player[];
  waitingList?: Player[]; // Nova lista de espera
  maxplayers: number;
  created_at?: string;
}
