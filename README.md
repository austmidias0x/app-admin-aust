# 🎯 Painel Administrativo - Gestão de Usuários

Aplicação Next.js para gerenciamento de usuários e organizações da plataforma principal.

## 🚀 Funcionalidades

### ✅ Gerenciamento de Usuários
- **Criar usuários** com roles e permissões personalizadas
- **Editar usuários** (nome, email, senha, role, permissões)
- **Ativar/Pausar usuários** (soft delete)
- **Remover usuários** (desativação permanente)
- **Filtrar usuários** por nome, email, role e status
- **Visualizar métricas** (total, ativos, inativos, por role)

### 🔐 Sistema de Permissões Granulares
- Controle de acesso a módulos (Tasks, Documents, Financial, Sales, Goals, Clients)
- Permissões específicas por funcionalidade
- Herança de permissões baseada em roles

### 👥 Roles Suportados
- **Super Admin** - Gerencia múltiplas organizações
- **Admin** - Gerencia sua organização (dono da conta)
- **Manager** - Permissões personalizadas
- **Member** - Acesso limitado

### 📊 Dashboard
- Estatísticas em tempo real
- Visualização de tarefas por usuário
- Filtros avançados
- Interface moderna e responsiva

## 🛠️ Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vercel Postgres**
- **bcryptjs** (criptografia de senhas)
- **Zod** (validação de schemas)

## 📦 Instalação

1. **Clone o repositório** (se ainda não tiver)

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Vercel Postgres Database Connection
POSTGRES_URL="postgres://default:..."
POSTGRES_PRISMA_URL="postgres://default:..."
POSTGRES_URL_NON_POOLING="postgres://default:..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"
```

> 💡 **Dica**: Copie essas variáveis diretamente do painel do Vercel:
> - Acesse seu projeto no Vercel
> - Vá em **Storage → seu banco Postgres → .env.local tab**

4. **(Opcional) Escaneie o banco de dados**:
```bash
npm run db:scan
```

Isso vai mostrar toda a estrutura do banco (tabelas, colunas, relacionamentos).

## 🚀 Iniciar o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🔑 Primeiro Acesso

Para acessar o painel, você precisa de uma conta **Admin** ou **Super Admin** da aplicação principal.

### Opção 1: Usar conta existente
Se você já tem um usuário admin na aplicação principal, use essas credenciais para fazer login.

### Opção 2: Criar super admin manualmente (apenas desenvolvimento)
Execute este SQL no seu banco de dados:

```sql
-- Crie um super admin para testes
INSERT INTO "User" (
  id, email, name, password, role, active, "organizationId", "createdAt", "updatedAt"
) VALUES (
  'super_admin_001',
  'admin@exemplo.com',
  'Super Admin',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt para gerar o hash
  'super_admin',
  true,
  NULL,
  NOW(),
  NOW()
);
```

**Senha padrão**: `Senha@123`

Para gerar o hash da senha:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Senha@123', 10));"
```

## 📖 Como Usar

### 1. Login
- Acesse `/login`
- Use credenciais de admin ou super_admin
- Será redirecionado para `/dashboard`

### 2. Gerenciar Usuários

#### ➕ Adicionar Usuário
1. Clique em **"Novo Usuário"**
2. Preencha os dados:
   - Nome completo
   - Email (único no sistema)
   - Senha (mínimo 6 caracteres)
   - Role (Admin/Manager/Member)
3. Configure as permissões:
   - Acesso a módulos
   - Permissões de tarefas
   - Permissões de gerenciamento
4. Clique em **"Criar Usuário"**

> 💡 **Dica**: Se não fornecer senha, será usada a senha padrão: `Senha@123`

#### ✏️ Editar Usuário
1. Clique no ícone de **editar** (lápis)
2. Modifique os campos desejados
3. Atualize permissões se necessário
4. Clique em **"Atualizar"**

> ⚠️ **Nota**: O email não pode ser alterado após criação

#### ⏸️ Pausar/Ativar Usuário
1. Clique no ícone de **pausar** (⏸) ou **play** (▶)
2. Confirme a ação

**Usuários pausados**:
- ❌ Não podem fazer login
- ❌ Não aparecem em atribuições
- ✅ Mantêm seus dados e histórico

#### 🗑️ Remover Usuário
1. Clique no ícone de **lixeira**
2. Confirme a remoção

**Usuários removidos**:
- ❌ Desativados permanentemente
- ✅ Dados mantidos no banco (soft delete)
- ⚠️ Não podem ser reativados via interface (necessário SQL)

### 3. Filtros

**Por busca**:
- Digite nome ou email na barra de busca

**Por role**:
- Selecione: Todas / Admin / Gerente / Membro

**Por status**:
- Selecione: Todos / Ativos / Inativos

### 4. Super Admin (Múltiplas Organizações)

Se você for **super_admin**:
1. Selecione a organização no dropdown
2. Gerencie usuários daquela organização
3. Troque de organização a qualquer momento

## 🔒 Segurança

### Autenticação
- Cookie httpOnly com 7 dias de validade
- Senhas criptografadas com bcrypt (salt rounds: 10)
- Verificação de role em todas as rotas protegidas

### Autorização
- Middleware protege rotas administrativas
- APIs validam permissões do usuário autenticado
- Admin só pode gerenciar sua própria organização
- Super admin pode gerenciar qualquer organização

### Validações
- Schemas Zod para validação de entrada
- Tratamento de erros robusto
- Prevenção de SQL injection (queries parametrizadas)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login
│   │   │   ├── logout/route.ts      # Logout
│   │   │   └── me/route.ts          # Usuário atual
│   │   ├── organizations/route.ts   # Listar organizações
│   │   └── users/
│   │       ├── route.ts             # Listar/Criar usuários
│   │       └── [id]/route.ts        # Get/Update/Delete usuário
│   ├── dashboard/page.tsx           # Dashboard principal
│   ├── login/page.tsx               # Página de login
│   └── page.tsx                     # Redirect para login
├── components/
│   └── UserModal.tsx                # Modal de criar/editar usuário
├── lib/
│   ├── auth.ts                      # Helpers de autenticação
│   ├── db.ts                        # Conexão e queries do banco
│   ├── types.ts                     # TypeScript types
│   └── utils.ts                     # Funções utilitárias
├── middleware.ts                    # Proteção de rotas
└── scripts/
    └── scan-database.ts             # Scanner de banco
```

## 🎨 Interface

### Design System
- **Cores primárias**: Indigo (600/700)
- **Status**: Verde (ativo), Vermelho (inativo), Laranja (pausado)
- **Roles**: Roxo (super_admin), Azul (admin), Verde (manager), Cinza (member)

### Responsividade
- ✅ Desktop (1280px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🔄 Integração com Aplicação Principal

Este painel administrativo **compartilha o mesmo banco de dados** da aplicação principal:

### Coerência de Dados
- ✅ Usuários criados aqui aparecem na aplicação principal
- ✅ Permissões são respeitadas em ambas as aplicações
- ✅ Sistema multi-tenant mantido (organizationId)
- ✅ Soft delete não quebra relacionamentos

### Fluxo de Trabalho Recomendado

1. **Criar organização/admin** → Aplicação principal (auto-registro)
2. **Gerenciar usuários** → Este painel administrativo
3. **Uso diário** → Aplicação principal

## 📊 Permissões Disponíveis

### Módulos
- `canAccessTasks` - Acessar tarefas
- `canAccessDocuments` - Acessar documentos
- `canAccessFinancial` - Acessar financeiro
- `canAccessSales` - Acessar vendas
- `canAccessGoals` - Acessar metas
- `canAccessClients` - Acessar clientes

### Tarefas
- `canCreateTasks` - Criar tarefas
- `canEditAllTasks` - Editar qualquer tarefa
- `canEditOwnTasks` - Editar próprias tarefas
- `canDeleteTasks` - Deletar tarefas
- `canAssignTasks` - Atribuir tarefas
- `canChangeTaskDates` - Alterar datas
- `canChangeTaskStatus` - Alterar status

### Documentos
- `canCreateDocuments` - Criar documentos
- `canEditDocuments` - Editar documentos
- `canDeleteDocuments` - Deletar documentos

### Financeiro
- `canCreateTransactions` - Criar transações
- `canEditTransactions` - Editar transações
- `canDeleteTransactions` - Deletar transações
- `canViewReports` - Ver relatórios

### Vendas
- `canManageSales` - Gerenciar vendas
- `canManageFunnel` - Gerenciar funil

### Gerenciamento
- `canManageUsers` - Gerenciar usuários
- `canManageSpaces` - Gerenciar espaços
- `canManageClients` - Gerenciar clientes

## 🐛 Troubleshooting

### Erro: "Não autenticado"
- Verifique se o cookie está sendo salvo (httpOnly)
- Tente fazer logout e login novamente
- Limpe os cookies do navegador

### Erro: "Acesso negado"
- Verifique se o usuário tem role `admin` ou `super_admin`
- Confirme que o usuário está ativo no banco

### Erro: "Email já cadastrado"
- O email deve ser único no sistema
- Verifique se já existe usuário com esse email

### Erro de conexão com banco
- Confirme que as variáveis `.env.local` estão corretas
- Teste a conexão com: `npm run db:scan`

## 📝 TODO / Melhorias Futuras

- [ ] Auditoria de ações (log de alterações)
- [ ] Exportar lista de usuários (CSV/Excel)
- [ ] Reset de senha via email
- [ ] Filtros avançados (data de criação, etc)
- [ ] Paginação para listas grandes
- [ ] Gráficos e métricas avançadas
- [ ] Histórico de atividades do usuário
- [ ] Bulk actions (ativar/desativar múltiplos)
- [ ] Templates de permissões

## 📄 Licença

Uso interno.

---

**Desenvolvido com ❤️ usando Next.js e Tailwind CSS**
