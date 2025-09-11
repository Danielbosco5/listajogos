/* 
INSTRUÇÕES PARA ADICIONAR COLUNA WAITING_LIST NO SUPABASE:

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Vá para o projeto: xsqzthubtwyjjdwwftcv
3. Navegue para SQL Editor
4. Execute o comando abaixo:
*/

ALTER TABLE timeslots ADD COLUMN IF NOT EXISTS waiting_list JSONB DEFAULT '[]'::jsonb;

/* 
Após executar o comando acima, a lista de espera funcionará perfeitamente!

Você pode verificar se funcionou executando:
*/

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'timeslots';

/*
Você deve ver a coluna 'waiting_list' listada com data_type 'jsonb' e column_default '[]'::jsonb
*/
