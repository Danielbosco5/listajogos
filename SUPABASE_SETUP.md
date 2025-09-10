# ❌ ERRO: Chave API do Supabase inválida!

## Como corrigir:

### 1. Obter credenciais corretas do Supabase:
   - Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
   - Vá em Settings → API
   - Copie a URL e a chave "anon public"

### 2. Atualizar credenciais:
   - Abra o arquivo `.env`
   - Substitua pelos valores corretos:
   ```
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

### 3. Criar tabela no Supabase:
   - No painel do Supabase, vá em SQL Editor
   - Execute o conteúdo do arquivo `supabase/init.sql`

### 4. Verificar configuração:
   ```bash
   npx tsx test-db.ts
   ```

### Credenciais atuais (INVÁLIDAS):
- URL: https://xuvmolypqreekoetjked.supabase.co
- Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (EXPIRADA/INVÁLIDA)

## 🔧 Status do projeto:
- ✅ Código corrigido e funcionando
- ✅ Dependências instaladas
- ✅ Estrutura do banco definida
- ❌ Credenciais do Supabase inválidas
- ❌ Tabela não criada no banco

Depois de corrigir as credenciais, o projeto funcionará perfeitamente!
