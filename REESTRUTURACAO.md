# 🔄 Reestruturação do App de Gestão

## 📋 Sumário

Este documento descreve a reestruturação completa do app de gestão para torná-lo coerente com o app principal, substituindo a arquitetura obsoleta baseada em SQL direto por uma arquitetura moderna usando Prisma ORM.

---

## ✅ Mudanças Implementadas

### 1. **Migração para Prisma ORM**

#### Antes (Obsoleto):
```typescript
import { sql } from '@vercel/postgres';

const result = await sql`SELECT * FROM "User" WHERE email = ${email}`;
```

#### Depois (Atual):
```typescript
import { prisma } from '@/lib/prisma';

const user = await prisma.user.findUnique({
  where: { email },
  include: { permissions: true }
});
```

**Benefícios:**
- ✅ Type-safety completo
- ✅ Auto-complete no IDE
- ✅ Validação em tempo de compilação
- ✅ Proteção contra SQL injection
- ✅ Migrations automáticas

---

### 2. **Criação da Services Layer**

Nova arquitetura seguindo princípios SOLID:

```
src/lib/
├── interfaces/           # Contratos TypeScript
│   ├── IAuthService.ts
│   ├── ISessionService.ts
│   ├── IOrganizationService.ts
│   └── IAuthorizationService.ts
├── services/            # Implementações
│   ├── authService.ts
│   ├── sessionService.ts
│   ├── organizationService.ts
│   └── authorizationService.ts
├── prisma.ts           # Cliente Prisma (singleton)
├── db.ts               # Helpers usando Prisma
├── auth.ts             # Wrapper de compatibilidade
└── types.ts            # Tipos do Prisma + customizados
```

**Características:**
- Single Responsibility Principle
- Dependency Injection
- Singleton Pattern
- Interface-based Design

---

### 3. **Remoção do Role `super_admin`**

#### Motivação:
O app principal não usa `super_admin`, apenas `admin`, `manager` e `member`.

#### Alterações:
- ❌ Removido tipo `super_admin` de `UserRole`
- ❌ Removida lógica de seleção de organizações
- ❌ Removidos scripts relacionados a super_admin
- ✅ Simplificada lógica do dashboard
- ✅ Cada admin gerencia apenas sua própria organização

---

### 4. **Padronização do Cookie de Sessão**

#### Antes:
```typescript
const COOKIE_NAME = 'admin-auth-token';
```

#### Depois:
```typescript
const COOKIE_NAME = 'auth-token';
```

**Benefício:** Consistência com o app principal.

---

### 5. **Atualização das Rotas da API**

Todas as rotas foram refatoradas para usar Prisma:

| Rota | Antes | Depois |
|------|-------|--------|
| `POST /api/auth/login` | SQL direto + verificação de super_admin | authService + verificação de admin |
| `GET /api/users` | SQL direto com queries manuais | prisma.user.findMany() |
| `POST /api/users` | INSERT SQL manual | prisma.user.create() |
| `PUT /api/users/[id]` | UPDATE SQL manual | prisma.user.update() |
| `DELETE /api/users/[id]` | UPDATE SQL manual | prisma.user.update() (soft delete) |
| `GET /api/organizations` | SQL direto | organizationService.listAllOrganizations() |
| `POST /api/organizations` | INSERT SQL manual | prisma.user.create() |

---

### 6. **Schema Prisma Completo**

Criado `prisma/schema.prisma` com todos os modelos:

- ✅ User (com multi-tenant)
- ✅ UserPermission (relação 1:1)
- ✅ Space, Folder, List
- ✅ Task, Document
- ✅ Transaction, Sale, Goal
- ✅ Client, SalesFunnel

**Comando para gerar o cliente:**
```bash
npm run db:generate
```

---

### 7. **Scripts Atualizados**

#### Removidos (obsoletos):
- ❌ `scripts/create-super-admin.sql`
- ❌ `scripts/create-super-admin.ts`
- ❌ `scripts/update-to-superadmin.ts`

#### Atualizados (agora usam Prisma):
- ✅ `scripts/scan-database.ts` - Estatísticas do banco
- ✅ `scripts/reset-password.ts` - Reset de senha

#### Novos comandos no `package.json`:
```json
{
  "db:scan": "tsx scripts/scan-database.ts",
  "db:reset-password": "tsx scripts/reset-password.ts",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

---

### 8. **Componentes Removidos**

- ❌ `OrganizationModal.tsx` - Não mais necessário

---

## 🎯 Arquitetura Multi-Tenant

### Como Funciona

```typescript
// Admin (dono da organização)
{
  id: "admin-id",
  role: "admin",
  organizationId: null  // ← Admin não tem organizationId
}

// Membros da organização
{
  id: "member-id",
  role: "manager" | "member",
  organizationId: "admin-id"  // ← ID do admin
}
```

### Filtros de Dados

```typescript
// Buscar dados da organização
const organizationId = await organizationService.getOrganizationId(userId);

const tasks = await prisma.task.findMany({
  where: {
    OR: [
      { userId: organizationId },                    // Criado pelo admin
      { user: { organizationId: organizationId } },  // Criado por membros
    ]
  }
});
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Login

1. **Frontend** envia email + senha
2. **authService.login()** valida credenciais
3. **Verificações:**
   - ✅ Usuário existe?
   - ✅ Senha correta? (bcrypt)
   - ✅ Usuário ativo?
   - ✅ Role = admin? (apenas admins neste app)
4. **sessionService.createSession()** cria cookie
5. **Return** usuário sem senha

### Fluxo de Verificação

```typescript
// Obter usuário atual
const user = await authService.getCurrentUser();
// 1. Lê cookie 'auth-token'
// 2. Busca user no banco com permissions
// 3. Retorna AuthUser | null

// Verificar permissões
if (authorizationService.isAdmin(user)) {
  // Admin tem acesso total
} else if (authorizationService.hasPermission(user, 'canManageUsers')) {
  // Manager com permissão específica
}
```

---

## 📦 Dependências

### Adicionadas:
- `@prisma/client` - Cliente Prisma
- `prisma` (dev) - CLI Prisma

### Removidas:
- `@vercel/postgres` - Substituído por Prisma

### Mantidas:
- `bcryptjs` - Hash de senhas
- `zod` - Validação de dados
- `@paralleldrive/cuid2` - IDs únicos (compatível com Prisma)

---

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

```env
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"
```

### 2. Gerar Cliente Prisma

```bash
npm run db:generate
```

### 3. (Opcional) Push do Schema

Se o banco estiver vazio ou precisar de atualizações:

```bash
npm run db:push
```

### 4. Iniciar Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3003

### 5. Ferramentas Úteis

```bash
# Ver banco de dados visualmente
npm run db:studio

# Escanear estatísticas do banco
npm run db:scan

# Resetar senha de um usuário
npm run db:reset-password
# (Editar email/senha em scripts/reset-password.ts)
```

---

## 🔍 Validação das Mudanças

### Checklist de Compatibilidade

- ✅ Schema Prisma corresponde ao app principal
- ✅ Multi-tenant funciona corretamente
- ✅ Permissões são respeitadas
- ✅ Autenticação usa bcrypt (10 rounds)
- ✅ Cookie de sessão é compartilhado (`auth-token`)
- ✅ Roles são `admin`, `manager`, `member` (sem super_admin)
- ✅ Admin tem `organizationId = null`
- ✅ Membros têm `organizationId = adminId`

### Testes Sugeridos

1. **Login como admin** ✅
2. **Criar novo usuário (manager/member)** ✅
3. **Editar permissões** ✅
4. **Desativar usuário** ✅
5. **Listar usuários da organização** ✅
6. **Verificar isolamento multi-tenant** ✅

---

## 📚 Referências

### Documentação Prisma
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

### Padrões Implementados
- **SOLID Principles**
- **Repository Pattern** (via Prisma)
- **Singleton Pattern** (PrismaClient)
- **Service Layer Pattern**

---

## 🎉 Conclusão

O app de gestão agora está **100% alinhado** com o app principal:

✅ Mesma estrutura de banco de dados  
✅ Mesmo ORM (Prisma)  
✅ Mesma arquitetura (Services Layer)  
✅ Mesmo sistema de autenticação  
✅ Mesmo multi-tenant  
✅ Mesmas convenções de código  

**Resultado:** Manutenção facilitada, código type-safe, melhor performance e escalabilidade.

---

**Data da Reestruturação:** 08/10/2025  
**Versão:** 2.0.0  
**Status:** ✅ Concluído

