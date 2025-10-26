# Guia de Gerenciamento de Sub-usuários

## Visão Geral

O sistema agora permite que contas admin (contas mães) gerenciem sub-usuários com diferentes níveis de permissão. Esta funcionalidade implementa um sistema hierárquico onde:

- **SuperAdmin**: Pode gerenciar todas as contas e sub-usuários
- **Admin**: Pode gerenciar apenas seus próprios sub-usuários
- **Manager**: Sub-usuário com permissões amplas
- **Member**: Sub-usuário com permissões básicas

## Estrutura do Sistema

### Hierarquia de Usuários

```
SuperAdmin (austmidias@gmail.com)
├── Admin 1 (Conta Mãe)
│   ├── Manager 1 (Sub-usuário)
│   ├── Manager 2 (Sub-usuário)
│   ├── Member 1 (Sub-usuário)
│   └── Member 2 (Sub-usuário)
├── Admin 2 (Conta Mãe)
│   ├── Manager 3 (Sub-usuário)
│   └── Member 3 (Sub-usuário)
└── ...
```

### Tipos de Usuário

#### 1. SuperAdmin
- **Email**: `austmidias@gmail.com`
- **Permissões**: Acesso total ao sistema
- **Pode**: Gerenciar todas as contas admin e sub-usuários

#### 2. Admin (Conta Mãe)
- **Role**: `admin`
- **Permissões**: Gerenciar apenas seus próprios sub-usuários
- **Pode**: Criar, editar, ativar/desativar sub-usuários

#### 3. Manager (Sub-usuário)
- **Role**: `manager`
- **Permissões**: Amplas, mas limitadas à organização
- **Pode**: Acessar a maioria dos módulos e funcionalidades

#### 4. Member (Sub-usuário)
- **Role**: `member`
- **Permissões**: Básicas, limitadas
- **Pode**: Acessar apenas funcionalidades essenciais

## Como Usar

### 1. Acessando o Dashboard

1. Faça login no sistema
2. No dashboard, você verá a lista de contas admin
3. Para contas que têm sub-usuários, aparecerá um botão "Ver sub-usuários"

### 2. Visualizando Sub-usuários

1. Clique em "Ver sub-usuários" na linha da conta admin
2. A seção se expandirá mostrando todos os sub-usuários
3. Você verá informações como:
   - Nome e email
   - Função (Manager/Member)
   - Status (Ativo/Inativo)
   - Atividade (tarefas, documentos, vendas)

### 3. Criando Sub-usuários

1. Clique no botão "Novo Sub-usuário" (verde) na seção expandida
2. Preencha o formulário:
   - **Nome**: Nome completo do usuário
   - **Email**: Email único no sistema
   - **Senha**: Senha inicial (mínimo 6 caracteres)
   - **Função**: Manager ou Member
   - **Status**: Ativo/Inativo
3. Configure as permissões específicas
4. Clique em "Criar"

### 4. Editando Sub-usuários

1. Clique no ícone de edição (lápis) na linha do sub-usuário
2. Modifique as informações necessárias
3. Ajuste as permissões conforme necessário
4. Clique em "Atualizar"

### 5. Gerenciando Status

- **Ativar/Desativar**: Clique no ícone de pausa/play
- **Reativar**: Para usuários inativos, clique no ícone de play
- **Excluir**: 
  - SuperAdmin: Exclusão permanente
  - Admin: Desativação (soft delete)

## Sistema de Permissões

### Permissões por Módulo

#### Acesso a Módulos
- **Tarefas**: Visualizar e gerenciar tarefas
- **Documentos**: Acessar documentos
- **Financeiro**: Ver transações financeiras
- **Vendas**: Acessar módulo de vendas
- **Metas**: Visualizar e gerenciar metas
- **Clientes**: Acessar cadastro de clientes

#### Permissões de Tarefas
- **Criar tarefas**: Criar novas tarefas
- **Editar todas as tarefas**: Modificar qualquer tarefa
- **Editar próprias tarefas**: Modificar apenas tarefas próprias
- **Excluir tarefas**: Remover tarefas
- **Atribuir tarefas**: Designar responsáveis
- **Alterar datas**: Modificar prazos
- **Alterar status**: Mudar status das tarefas

#### Permissões de Documentos
- **Criar documentos**: Criar novos documentos
- **Editar documentos**: Modificar documentos
- **Excluir documentos**: Remover documentos

#### Permissões Financeiras
- **Criar transações**: Registrar transações
- **Editar transações**: Modificar transações
- **Excluir transações**: Remover transações
- **Ver relatórios**: Acessar relatórios financeiros

#### Permissões de Vendas
- **Gerenciar vendas**: Controlar processo de vendas
- **Gerenciar funil**: Configurar funil de vendas

#### Permissões de Gerenciamento
- **Gerenciar espaços**: Criar e modificar espaços
- **Gerenciar clientes**: Cadastrar e editar clientes

### Permissões Padrão por Função

#### Manager
- ✅ Acesso a todos os módulos
- ✅ Todas as permissões de tarefas
- ✅ Todas as permissões de documentos
- ✅ Todas as permissões financeiras
- ✅ Todas as permissões de vendas
- ✅ Gerenciar espaços e clientes
- ❌ Gerenciar outros usuários

#### Member
- ✅ Acesso a tarefas
- ✅ Editar próprias tarefas
- ✅ Alterar status de tarefas
- ❌ Todas as outras permissões

## API Endpoints

### Sub-usuários por Organização

#### GET `/api/organizations/[organizationId]/sub-users`
Lista todos os sub-usuários de uma organização

**Parâmetros de Query:**
- `search`: Buscar por nome ou email
- `role`: Filtrar por função (manager/member)
- `active`: Filtrar por status (true/false)

#### POST `/api/organizations/[organizationId]/sub-users`
Cria um novo sub-usuário

**Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com",
  "password": "senha123",
  "role": "manager",
  "permissions": {
    "canAccessTasks": true,
    "canCreateTasks": true
  }
}
```

#### GET `/api/organizations/[organizationId]/sub-users/[subUserId]`
Busca um sub-usuário específico

#### PUT `/api/organizations/[organizationId]/sub-users/[subUserId]`
Atualiza um sub-usuário

#### DELETE `/api/organizations/[organizationId]/sub-users/[subUserId]`
Remove um sub-usuário (soft delete)

#### DELETE `/api/organizations/[organizationId]/sub-users/[subUserId]?hard=true`
Remove permanentemente um sub-usuário (apenas SuperAdmin)

#### POST `/api/organizations/[organizationId]/sub-users/[subUserId]/reactivate`
Reativa um sub-usuário desativado

#### GET `/api/organizations/[organizationId]/sub-users/stats`
Obtém estatísticas dos sub-usuários

## Segurança

### Controle de Acesso

1. **SuperAdmin**: Acesso total
2. **Admin**: Apenas seus próprios sub-usuários
3. **Sub-usuários**: Sem acesso ao sistema de gerenciamento

### Validações

- Email único no sistema
- Senha mínima de 6 caracteres
- Verificação de organização válida
- Controle de permissões granulares

### Auditoria

- Todas as ações são registradas
- Histórico de alterações mantido
- Logs de acesso disponíveis

## Troubleshooting

### Problemas Comuns

#### 1. "Email já está em uso"
- Verifique se o email não está sendo usado por outro usuário
- Use um email único

#### 2. "Organização não encontrada"
- Verifique se a conta admin existe
- Confirme se o ID da organização está correto

#### 3. "Sem permissão para gerenciar usuários"
- Verifique se você tem permissão de admin
- Confirme se está tentando gerenciar a organização correta

#### 4. Sub-usuários não aparecem
- Verifique se a conta tem sub-usuários
- Confirme se os sub-usuários estão ativos
- Recarregue a página

### Logs e Debug

Para debug, verifique:
1. Console do navegador (F12)
2. Logs do servidor
3. Banco de dados (tabela `User` e `UserPermission`)

## Próximos Passos

1. **Teste a funcionalidade** criando alguns sub-usuários
2. **Configure permissões** específicas para cada usuário
3. **Monitore o uso** através das estatísticas
4. **Ajuste permissões** conforme necessário

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte os logs do sistema
3. Teste com o script `scripts/test-subusers.ts`
4. Entre em contato com o administrador do sistema
