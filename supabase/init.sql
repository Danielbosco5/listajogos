-- Cria a tabela de horários
CREATE TABLE timeslots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time TEXT NOT NULL,
  list_name TEXT,
  day_of_week TEXT NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 10,
  players JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cria uma política de segurança para permitir leitura pública
ALTER TABLE timeslots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de horários"
  ON timeslots FOR SELECT
  USING (true);

-- Cria uma política de segurança para permitir inserção anônima
CREATE POLICY "Permitir inserção anônima de horários"
  ON timeslots FOR INSERT
  WITH CHECK (true);

-- Cria uma política de segurança para permitir atualização anônima
CREATE POLICY "Permitir atualização anônima de horários"
  ON timeslots FOR UPDATE
  USING (true);

-- Cria uma política de segurança para permitir deleção anônima
CREATE POLICY "Permitir deleção anônima de horários"
  ON timeslots FOR DELETE
  USING (true);
