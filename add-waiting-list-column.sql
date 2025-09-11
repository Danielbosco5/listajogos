-- Script SQL para adicionar a coluna waiting_list se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'timeslots' AND column_name = 'waiting_list'
  ) THEN
    ALTER TABLE timeslots ADD COLUMN waiting_list JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Coluna waiting_list adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna waiting_list já existe';
  END IF;
END $$;
