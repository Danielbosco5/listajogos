export interface Player {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  list_name?: string;
  day_of_week: string;
  players: Player[];
  max_players: number;
  created_at?: string;
}
