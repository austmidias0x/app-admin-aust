# 🚀 Guia de Migration - Super Admin

## 📋 Sobre

Este script cria automaticamente um super administrador no banco de dados para acessar o painel administrativo.

**Credenciais configuradas:**
- **Email:** thalesbcaires@gmail.com
- **Senha:** admin
- **Nome:** Thales Caires
- **Role:** super_admin

---

## ⚙️ Pré-requisitos

### 1. Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado com as credenciais do Vercel Postgres:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
# ... etc
```

### 2. Dependências Instaladas

```bash
npm install
```

---

## 🚀 Como Executar

### Comando Principal:

```bash
npm run migrate:superadmin
```

---

## 📊 O que o Script Faz

1. **Verifica** se o usuário já existe no banco
2. **Gera** hash seguro da senha com bcrypt (10 rounds)
3. **Cria** ID único com CUID2
4. **Insere** o super admin na tabela `User`
5. **Verifica** a criação
6. **Exibe** as credenciais de acesso

---

## ✅ Saída Esperada (Sucesso)

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

---

## ⚠️ Cenários Especiais

### Usuário Já Existe

Se o usuário já existe, o script irá:
- ✅ Detectar e informar
- ✅ Mostrar detalhes do usuário existente
- ✅ Sugerir comandos SQL se precisar atualizar

**Exemplo de saída:**

```
⚠️  Usuário já existe no banco!
   ID: clxxx1234567890abcdef
   Email: thalesbcaires@gmail.com
   Role: admin
   Ativo: Sim

⚠️  ATENÇÃO: O usuário existe mas não é super_admin!
   Role atual: admin

   Para atualizar para super_admin, execute:
   UPDATE "User" SET role = 'super_admin' WHERE email = 'thalesbcaires@gmail.com';

✅ Migration finalizada (usuário já existia)
```

### Usuário Inativo

Se o usuário existe mas está inativo:

```
⚠️  ATENÇÃO: O usuário existe mas está inativo!

   Para ativar, execute:
   UPDATE "User" SET active = true WHERE email = 'thalesbcaires@gmail.com';
```

---

## ❌ Erros Comuns

### 1. Erro de Conexão

**Erro:**
```
❌ Erro durante a migration:
   Erro de conexão com o banco de dados
   Verifique as variáveis de ambiente em .env.local
```

**Solução:**
- Verifique se o arquivo `.env.local` existe
- Confirme que as credenciais do Vercel Postgres estão corretas
- Teste a conexão: `npm run db:scan`

---

### 2. Tabela Não Encontrada

**Erro:**
```
❌ Erro durante a migration:
   Erro: Tabela "User" não encontrada
   Certifique-se de que o banco de dados está configurado corretamente
```

**Solução:**
- Certifique-se de que o banco de dados da aplicação principal está configurado
- Verifique se as tabelas foram criadas
- Execute `npm run db:scan` para ver as tabelas existentes

---

### 3. Email Duplicado

**Erro:**
```
❌ Erro durante a migration:
   Erro: Usuário com este email já existe (duplicate key)
```

**Solução:**
- Execute o script novamente, ele irá detectar e informar sobre o usuário existente
- Ou delete o usuário existente antes de executar novamente:
  ```sql
  DELETE FROM "User" WHERE email = 'thalesbcaires@gmail.com';
  ```

---

## 🔧 Alterando as Credenciais

Se você quiser usar credenciais diferentes, edite o arquivo:

`scripts/create-super-admin.ts`

```typescript
const email = 'seuemail@exemplo.com';     // ← Altere aqui
const password = 'suasenha';               // ← Altere aqui
const name = 'Seu Nome';                   // ← Altere aqui
```

Depois execute:
```bash
npm run migrate:superadmin
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE - Produção:

1. **Altere a senha padrão imediatamente após o primeiro login**
2. **Use senhas fortes** (mínimo 12 caracteres, números, símbolos)
3. **Não commite** o arquivo `create-super-admin.ts` com credenciais reais
4. **Use variáveis de ambiente** para credenciais em produção

### 📝 Recomendações:

- Senha com mínimo 12 caracteres
- Incluir letras maiúsculas e minúsculas
- Incluir números
- Incluir símbolos especiais (@, #, $, %, etc)

**Exemplo de senha forte:**
```
Th@les#2025$Admin!
```

---

## 🧪 Testando

### 1. Execute a migration:
```bash
npm run migrate:superadmin
```

### 2. Inicie o servidor:
```bash
npm run dev
```

### 3. Acesse o painel:
```
http://localhost:3000/login
```

### 4. Faça login:
```
Email: thalesbcaires@gmail.com
Senha: admin
```

### 5. Verifique:
- ✅ Login bem-sucedido
- ✅ Redirecionado para dashboard
- ✅ Nome aparece no header: "Thales Caires • Super Admin"
- ✅ Dropdown de organizações visível

---

## 🔄 Re-executando o Script

Você pode executar o script quantas vezes quiser:
- Se o usuário **não existe**: Será criado
- Se o usuário **já existe**: Será detectado e informado, sem duplicação

Isso torna o script **idempotente** e seguro para re-execução.

---

## 📊 Verificando no Banco

Para verificar manualmente no banco após a migration:

```sql
-- Ver todos os super admins
SELECT id, email, name, role, active, "createdAt" 
FROM "User" 
WHERE role = 'super_admin';

-- Ver usuário específico
SELECT id, email, name, role, active, "createdAt" 
FROM "User" 
WHERE email = 'thalesbcaires@gmail.com';
```

---

## 🗑️ Removendo o Super Admin

Se precisar remover (cuidado!):

```sql
-- Desativar (soft delete)
UPDATE "User" 
SET active = false, "updatedAt" = NOW() 
WHERE email = 'thalesbcaires@gmail.com';

-- Ou deletar permanentemente (não recomendado)
DELETE FROM "User" 
WHERE email = 'thalesbcaires@gmail.com';
```

---

## 🎯 Próximos Passos

Após criar o super admin:

1. ✅ Faça login no painel
2. ✅ Altere a senha padrão (se em produção)
3. ✅ Crie outras organizações/admins conforme necessário
4. ✅ Configure permissões dos usuários

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do terminal
2. Execute `npm run db:scan` para testar conexão
3. Verifique se o `.env.local` está correto
4. Veja a documentação no `README.md`

---

**Bom uso! 🚀**

