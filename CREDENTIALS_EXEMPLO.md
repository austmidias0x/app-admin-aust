# 🔐 Credenciais de Exemplo (Apenas Desenvolvimento)

## ⚠️ ATENÇÃO
Este arquivo contém exemplos para ambiente de desenvolvimento.
**NUNCA** commit este arquivo com credenciais reais!

---

## 📋 Exemplo de `.env.local`

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Conexão com Vercel Postgres
POSTGRES_URL="postgres://default:XXXXX@XXXXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb"
POSTGRES_PRISMA_URL="postgres://default:XXXXX@XXXXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:XXXXX@XXXXX.us-east-1.postgres.vercel-storage.com/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="XXXXX.us-east-1.postgres.vercel-storage.com"
POSTGRES_PASSWORD="XXXXX"
POSTGRES_DATABASE="verceldb"

# Environment
NODE_ENV="development"
```

---

## 👤 Criando Primeiro Super Admin

### Método 1: Via SQL (Recomendado)

1. Gere o hash da senha:
```bash
npm run hash-password MinhaSenhaSegura@2024
```

2. Execute no banco (substitua EMAIL, NOME e HASH):

```sql
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  role,
  active,
  "organizationId",
  "parentUserId",
  "createdAt",
  "updatedAt"
) VALUES (
  'super_admin_' || substring(md5(random()::text) from 1 for 12),
  'admin@seudominio.com',  -- ← SEU EMAIL
  'Administrador Sistema', -- ← SEU NOME
  '$2a$10$...hash...aqui...',  -- ← HASH GERADO
  'super_admin',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);
```

### Método 2: Usar Admin Existente

Se você já tem um usuário com role `admin` ou `super_admin` na aplicação principal:

1. Acesse: `http://localhost:3000/login`
2. Use as credenciais existentes
3. Pronto! ✅

---

## 🧪 Usuários de Teste (Exemplo)

### Super Admin
```
Email: superadmin@teste.com
Senha: SuperAdmin@123
Role: super_admin
Descrição: Pode gerenciar múltiplas organizações
```

### Admin (Organização 1)
```
Email: admin1@empresa1.com
Senha: Admin@123
Role: admin
Descrição: Dono da Empresa 1
```

### Manager
```
Email: manager@empresa1.com
Senha: Manager@123
Role: manager
Descrição: Gerente da Empresa 1
```

### Member
```
Email: member@empresa1.com
Senha: Member@123
Role: member
Descrição: Membro da Empresa 1
```

---

## 🔧 Script Completo de Setup (Desenvolvimento)

```sql
-- ====================================
-- SCRIPT DE SETUP COMPLETO
-- ====================================
-- ATENÇÃO: Apenas para desenvolvimento!
-- ====================================

-- 1. Super Admin
INSERT INTO "User" (id, email, name, password, role, active, "organizationId", "parentUserId", "createdAt", "updatedAt")
VALUES (
  'super_001',
  'super@dev.local',
  'Super Admin Dev',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- senha: senha123
  'super_admin',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 2. Admin (Empresa 1)
INSERT INTO "User" (id, email, name, password, role, active, "organizationId", "parentUserId", "createdAt", "updatedAt")
VALUES (
  'admin_001',
  'admin@empresa1.local',
  'Admin Empresa 1',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- senha: senha123
  'admin',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 3. Permissões do Admin (todas habilitadas)
INSERT INTO "UserPermission" (
  id, "userId",
  "canAccessTasks", "canAccessDocuments", "canAccessFinancial",
  "canAccessSales", "canAccessGoals", "canAccessClients",
  "canCreateTasks", "canEditAllTasks", "canEditOwnTasks",
  "canDeleteTasks", "canAssignTasks", "canChangeTaskDates", "canChangeTaskStatus",
  "canCreateDocuments", "canEditDocuments", "canDeleteDocuments",
  "canCreateTransactions", "canEditTransactions", "canDeleteTransactions", "canViewReports",
  "canManageSales", "canManageFunnel",
  "canManageUsers", "canManageSpaces", "canManageClients",
  "createdAt", "updatedAt"
) VALUES (
  'perm_001', 'admin_001',
  true, true, true, true, true, true,
  true, true, true, true, true, true, true,
  true, true, true,
  true, true, true, true,
  true, true,
  true, true, true,
  NOW(), NOW()
);

-- 4. Manager (Empresa 1)
INSERT INTO "User" (id, email, name, password, role, active, "organizationId", "parentUserId", "createdAt", "updatedAt")
VALUES (
  'manager_001',
  'manager@empresa1.local',
  'Manager Empresa 1',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- senha: senha123
  'manager',
  true,
  'admin_001', -- pertence ao admin_001
  NULL,
  NOW(),
  NOW()
);

-- 5. Permissões do Manager (moderadas)
INSERT INTO "UserPermission" (
  id, "userId",
  "canAccessTasks", "canAccessDocuments", "canAccessFinancial",
  "canAccessSales", "canAccessGoals", "canAccessClients",
  "canCreateTasks", "canEditAllTasks", "canEditOwnTasks",
  "canDeleteTasks", "canAssignTasks", "canChangeTaskDates", "canChangeTaskStatus",
  "canCreateDocuments", "canEditDocuments", "canDeleteDocuments",
  "canCreateTransactions", "canEditTransactions", "canDeleteTransactions", "canViewReports",
  "canManageSales", "canManageFunnel",
  "canManageUsers", "canManageSpaces", "canManageClients",
  "createdAt", "updatedAt"
) VALUES (
  'perm_002', 'manager_001',
  true, true, false, false, true, true,
  true, true, true, false, true, true, true,
  true, true, false,
  false, false, false, true,
  false, false,
  false, true, false,
  NOW(), NOW()
);

-- 6. Member (Empresa 1)
INSERT INTO "User" (id, email, name, password, role, active, "organizationId", "parentUserId", "createdAt", "updatedAt")
VALUES (
  'member_001',
  'member@empresa1.local',
  'Membro Empresa 1',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- senha: senha123
  'member',
  true,
  'admin_001', -- pertence ao admin_001
  NULL,
  NOW(),
  NOW()
);

-- 7. Permissões do Member (básicas)
INSERT INTO "UserPermission" (
  id, "userId",
  "canAccessTasks", "canAccessDocuments", "canAccessFinancial",
  "canAccessSales", "canAccessGoals", "canAccessClients",
  "canCreateTasks", "canEditAllTasks", "canEditOwnTasks",
  "canDeleteTasks", "canAssignTasks", "canChangeTaskDates", "canChangeTaskStatus",
  "canCreateDocuments", "canEditDocuments", "canDeleteDocuments",
  "canCreateTransactions", "canEditTransactions", "canDeleteTransactions", "canViewReports",
  "canManageSales", "canManageFunnel",
  "canManageUsers", "canManageSpaces", "canManageClients",
  "createdAt", "updatedAt"
) VALUES (
  'perm_003', 'member_001',
  true, true, false, false, false, false,
  true, false, true, false, false, true, true,
  true, false, false,
  false, false, false, false,
  false, false,
  false, false, false,
  NOW(), NOW()
);

-- ====================================
-- Verificar criação
-- ====================================
SELECT email, name, role, active FROM "User" WHERE email LIKE '%@%local';
```

---

## 🧪 Testando o Sistema

### 1. **Testar Super Admin:**
```
URL: http://localhost:3000/login
Email: super@dev.local
Senha: senha123

✅ Deve ver dropdown de organizações
✅ Pode selecionar "Empresa 1"
✅ Pode ver e gerenciar todos os usuários
```

### 2. **Testar Admin:**
```
URL: http://localhost:3000/login
Email: admin@empresa1.local
Senha: senha123

✅ Vê apenas usuários da sua organização
✅ Pode criar novos usuários
✅ Pode editar permissões
✅ Pode ativar/desativar usuários
```

### 3. **Testar Manager:**
```
URL: http://localhost:3000/login
Email: manager@empresa1.local
Senha: senha123

❌ Não deve conseguir acessar (apenas admin/super_admin permitidos)
```

### 4. **Testar Member:**
```
URL: http://localhost:3000/login
Email: member@empresa1.local
Senha: senha123

❌ Não deve conseguir acessar (apenas admin/super_admin permitidos)
```

---

## 🔒 Senhas Padrão

**Hash para "senha123":**
```
$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
```

**Para gerar novo hash:**
```bash
npm run hash-password SuaSenhaAqui
```

---

## ⚠️ Lembrete de Segurança

### ❌ **NÃO FAÇA em Produção:**
- Usar senhas fracas como "senha123"
- Commitar credenciais no git
- Compartilhar `.env.local`
- Deixar usuários de teste ativos

### ✅ **FAÇA em Produção:**
- Senhas fortes (mínimo 12 caracteres, números, símbolos)
- Variáveis de ambiente no painel da Vercel
- Troca periódica de senhas
- Auditoria de acessos
- 2FA para super admins

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o `.env.local`
2. Execute `npm run db:scan` para testar conexão
3. Veja logs do console do browser (F12)
4. Verifique logs do terminal

---

**Bom uso! 🚀**

