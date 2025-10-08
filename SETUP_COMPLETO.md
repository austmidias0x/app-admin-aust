# 🎯 Setup Completo - Passo a Passo

## 📋 Checklist de Setup

Siga estes passos para configurar o painel administrativo:

---

## 1️⃣ Clone/Instale Dependências

```bash
# Instale as dependências
npm install
```

✅ **Status:** Dependências instaladas

---

## 2️⃣ Configure o Banco de Dados

### Opção A: Copiar .env.local Existente

Se você já tem o `.env.local` da aplicação principal:

```bash
# Copie o arquivo .env.local da aplicação principal para cá
cp /caminho/para/aplicacao-principal/.env.local .
```

### Opção B: Criar .env.local Novo

1. Acesse o [Painel do Vercel](https://vercel.com)
2. Vá no seu projeto
3. Clique em **"Storage"** no menu lateral
4. Selecione seu banco **Postgres**
5. Clique na aba **".env.local"**
6. Copie **TODAS** as variáveis

7. Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Crie o arquivo
touch .env.local
```

8. Cole as variáveis copiadas:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"
```

---

## 3️⃣ Teste a Conexão com o Banco

```bash
npm run db:scan
```

**Saída esperada:**
```
🔍 Conectando ao banco de dados...

📊 TABELAS ENCONTRADAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Tabela: User
─────────────────────────────────────────────────────────────

Colunas:
  • id: text (not null)
  • email: text (not null)
  • name: text (not null)
  • password: text (not null)
  • role: text (not null)
  • active: boolean (not null) DEFAULT true
  ...
```

✅ **Se viu a lista de tabelas:** Conexão OK, vá para o próximo passo  
❌ **Se deu erro:** Verifique o `.env.local` e tente novamente

---

## 4️⃣ Crie o Super Admin

```bash
npm run migrate:superadmin
```

**Saída esperada:**
```
🚀 Iniciando migration: Criar Super Admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Verificando se usuário já existe...

🔐 Gerando hash da senha...
   ✓ Hash gerado com sucesso

🆔 ID gerado: clxxx1234567890abcdef

💾 Criando super admin no banco...
   ✓ Super admin criado com sucesso!

🔍 Verificando criação...

✅ Usuário criado e verificado com sucesso!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DETALHES DO SUPER ADMIN:

   ID:         clxxx1234567890abcdef
   Email:      thalesbcaires@gmail.com
   Nome:       Thales Caires
   Role:       super_admin
   Ativo:      Sim
   Criado em:  03/10/2025 18:30:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 CREDENCIAIS DE ACESSO:

   URL:   http://localhost:3000/login
   Email: thalesbcaires@gmail.com
   Senha: admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Pronto! Você já pode fazer login no painel administrativo.
```

✅ **Super admin criado com sucesso!**

---

## 5️⃣ Inicie o Servidor

```bash
npm run dev
```

**Saída esperada:**
```
  ▲ Next.js 15.5.4 (Turbopack)
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 1.2s
```

✅ **Servidor rodando!**

---

## 6️⃣ Faça Login

1. Abra o navegador: [http://localhost:3000](http://localhost:3000)

2. Você será redirecionado para: [http://localhost:3000/login](http://localhost:3000/login)

3. Use as credenciais:
   ```
   Email: thalesbcaires@gmail.com
   Senha: admin
   ```

4. Clique em **"Entrar"**

✅ **Se logou com sucesso:** Você verá o dashboard!  
❌ **Se deu erro:** Veja a seção de troubleshooting abaixo

---

## 7️⃣ Verifique o Dashboard

Após o login, você deve ver:

- ✅ Header com seu nome: **"Thales Caires • Super Admin"**
- ✅ Botão "Sair" no canto superior direito
- ✅ 6 cards de métricas (Total, Ativos, Inativos, etc)
- ✅ Dropdown "Selecionar Organização" (para super admin)
- ✅ Filtros de busca
- ✅ Botão verde **"Novo Usuário"**
- ✅ Tabela de usuários (pode estar vazia inicialmente)

---

## 8️⃣ Teste Criar Usuário

1. Clique em **"Novo Usuário"**

2. Preencha o formulário:
   ```
   Nome: João Silva
   Email: joao@teste.com
   Senha: senha123
   Função: Member
   ```

3. Configure permissões (marque algumas checkboxes)

4. Clique em **"Criar Usuário"**

✅ **Usuário criado!** Ele deve aparecer na tabela

---

## ✅ Setup Completo!

Parabéns! 🎉 O painel administrativo está funcionando perfeitamente.

---

## 🔧 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Escanear estrutura do banco
npm run db:scan

# Criar/recriar super admin
npm run migrate:superadmin

# Gerar hash de senha
npm run hash-password MinhaSenh@

# Build para produção
npm run build

# Iniciar produção
npm start
```

---

## ⚠️ Troubleshooting

### Erro: "Não autenticado"

**Problema:** Cookie não está sendo salvo

**Solução:**
1. Limpe os cookies do navegador (F12 → Application → Cookies)
2. Tente fazer logout: `http://localhost:3000/api/auth/logout`
3. Faça login novamente

---

### Erro: "Email ou senha incorretos"

**Problema:** Credenciais erradas ou usuário não existe

**Solução:**
1. Verifique se digitou corretamente:
   - Email: `thalesbcaires@gmail.com`
   - Senha: `admin`

2. Verifique se o usuário foi criado:
   ```bash
   npm run db:scan
   ```
   Procure por "User" e veja se tem registros

3. Recrie o super admin:
   ```bash
   npm run migrate:superadmin
   ```

---

### Erro: "Acesso negado"

**Problema:** Usuário não tem role adequado

**Solução:**
Verifique o role do usuário no banco:

```sql
SELECT email, role, active FROM "User" WHERE email = 'thalesbcaires@gmail.com';
```

O role deve ser `super_admin` ou `admin`.

Se não for, atualize:
```sql
UPDATE "User" SET role = 'super_admin' WHERE email = 'thalesbcaires@gmail.com';
```

---

### Erro de Conexão com Banco

**Problema:** `.env.local` incorreto ou banco indisponível

**Solução:**
1. Verifique se o arquivo `.env.local` existe
2. Teste a conexão:
   ```bash
   npm run db:scan
   ```
3. Se falhar, obtenha novas credenciais do Vercel
4. Verifique se o banco não está pausado no painel do Vercel

---

### Página em Branco após Login

**Problema:** JavaScript não carregou ou erro de build

**Solução:**
1. Abra o console do navegador (F12)
2. Veja se há erros
3. Reinicie o servidor:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

### Migration Diz que Usuário Já Existe

**Problema:** Você executou a migration mais de uma vez

**Solução:**
Isso é **normal e seguro**! O script é idempotente.

Se você quiser recriar:
```sql
DELETE FROM "User" WHERE email = 'thalesbcaires@gmail.com';
```

Depois execute novamente:
```bash
npm run migrate:superadmin
```

---

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente no painel:
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis do `.env.local`
3. Deploy automático!

### Alterar Senha em Produção

⚠️ **IMPORTANTE:** Altere a senha padrão "admin" imediatamente!

**Opção 1:** Via interface (futuro update)

**Opção 2:** Via SQL:
```sql
-- Gere o hash da nova senha
-- npm run hash-password NovaSenhaForte@2024

UPDATE "User" 
SET password = '$2a$10$...hash...aqui...' 
WHERE email = 'thalesbcaires@gmail.com';
```

---

## 📚 Documentação Adicional

- **README.md** - Documentação completa da aplicação
- **QUICK_START.md** - Guia rápido de início
- **IMPLEMENTACAO.md** - Relatório técnico detalhado
- **MIGRATION_GUIDE.md** - Guia específico de migration
- **CREDENTIALS_EXEMPLO.md** - Exemplos de credenciais para testes

---

## 🎯 Próximos Passos

Após o setup:

1. ✅ Explore o dashboard
2. ✅ Crie alguns usuários de teste
3. ✅ Teste as permissões
4. ✅ Configure usuários reais da sua equipe
5. ✅ Integre com a aplicação principal

---

**Está tudo pronto! Aproveite o painel administrativo! 🎉**

