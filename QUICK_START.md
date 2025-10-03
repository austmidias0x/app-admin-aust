# 🚀 Guia de Início Rápido

## 1️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e cole suas credenciais do Vercel Postgres:

```env
POSTGRES_URL="postgres://default:..."
POSTGRES_PRISMA_URL="postgres://default:..."
POSTGRES_URL_NON_POOLING="postgres://default:..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"
```

## 2️⃣ Instalar Dependências

```bash
npm install
```

## 3️⃣ (Opcional) Escanear Banco de Dados

Para ver a estrutura do banco:

```bash
npm run db:scan
```

## 4️⃣ Criar Super Admin (Apenas Primeira Vez)

### Opção A: Usar conta existente
Se você já tem um admin na aplicação principal, pule para o passo 5.

### Opção B: Criar via SQL

1. Gere o hash da sua senha:
```bash
npm run hash-password MinhaSenh@123
```

2. Copie o hash gerado

3. Execute este SQL no seu banco (substitua `YOUR_HASH_HERE`):

```sql
INSERT INTO "User" (
  id, email, name, password, role, active,
  "organizationId", "parentUserId", "createdAt", "updatedAt"
) VALUES (
  'super_admin_001',
  'admin@seudominio.com',
  'Seu Nome',
  'YOUR_HASH_HERE',
  'super_admin',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);
```

## 5️⃣ Iniciar Aplicação

```bash
npm run dev
```

## 6️⃣ Acessar Painel

Abra: [http://localhost:3000](http://localhost:3000)

**Login**: Use o email e senha do admin/super_admin criado.

---

## 🎯 Primeiros Passos

### Criar seu primeiro usuário:

1. Clique em **"Novo Usuário"**
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@empresa.com`
   - Senha: `senha123` (ou deixe em branco para usar `Senha@123`)
   - Role: `Member`
3. Configure as permissões (ex: marque apenas "Tasks" e "Documents")
4. Clique em **"Criar Usuário"**

### Testar na aplicação principal:

1. Abra a aplicação principal
2. Faça login com `joao@empresa.com` e a senha definida
3. Verifique que ele só tem acesso aos módulos permitidos

---

## 🔧 Comandos Úteis

```bash
# Iniciar em dev
npm run dev

# Escanear banco
npm run db:scan

# Gerar hash de senha
npm run hash-password MinhaSenh@

# Build para produção
npm run build

# Iniciar produção
npm start
```

---

## ⚠️ Problemas Comuns

### "Não autenticado"
- Verifique se as variáveis `.env.local` estão corretas
- Tente limpar cookies do navegador

### "Acesso negado"
- Confirme que o usuário tem role `admin` ou `super_admin`
- Verifique se o campo `active` está `true`

### Erro de conexão
- Execute `npm run db:scan` para testar a conexão
- Verifique se as credenciais do Vercel Postgres estão corretas

---

**Pronto! 🎉 Agora você pode gerenciar usuários da sua aplicação.**

