import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSubUsers() {
  try {
    console.log('🧪 Testando funcionalidade de sub-usuários...\n');

    // 1. Buscar uma conta admin existente
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      include: { members: true }
    });

    if (!admin) {
      console.log('❌ Nenhuma conta admin encontrada. Crie uma conta admin primeiro.');
      return;
    }

    console.log(`✅ Conta admin encontrada: ${admin.name} (${admin.email})`);
    console.log(`   Sub-usuários atuais: ${admin.members.length}\n`);

    // 2. Criar um sub-usuário manager
    const managerPassword = await bcrypt.hash('123456', 12);
    const manager = await prisma.user.create({
      data: {
        email: `manager.${Date.now()}@teste.com`,
        name: 'Manager Teste',
        password: managerPassword,
        role: 'manager',
        organizationId: admin.id,
        active: true
      }
    });

    console.log(`✅ Manager criado: ${manager.name} (${manager.email})`);

    // 3. Criar permissões para o manager
    await prisma.userPermission.create({
      data: {
        userId: manager.id,
        canAccessTasks: true,
        canAccessDocuments: true,
        canAccessFinancial: true,
        canAccessSales: true,
        canAccessGoals: true,
        canAccessClients: true,
        canCreateTasks: true,
        canEditAllTasks: true,
        canEditOwnTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
        canChangeTaskDates: true,
        canChangeTaskStatus: true,
        canCreateDocuments: true,
        canEditDocuments: true,
        canDeleteDocuments: true,
        canCreateTransactions: true,
        canEditTransactions: true,
        canDeleteTransactions: true,
        canViewReports: true,
        canManageSales: true,
        canManageFunnel: true,
        canManageUsers: false,
        canManageSpaces: true,
        canManageClients: true
      }
    });

    console.log(`✅ Permissões do manager criadas`);

    // 4. Criar um sub-usuário member
    const memberPassword = await bcrypt.hash('123456', 12);
    const member = await prisma.user.create({
      data: {
        email: `member.${Date.now()}@teste.com`,
        name: 'Member Teste',
        password: memberPassword,
        role: 'member',
        organizationId: admin.id,
        active: true
      }
    });

    console.log(`✅ Member criado: ${member.name} (${member.email})`);

    // 5. Criar permissões básicas para o member
    await prisma.userPermission.create({
      data: {
        userId: member.id,
        canAccessTasks: true,
        canAccessDocuments: false,
        canAccessFinancial: false,
        canAccessSales: false,
        canAccessGoals: false,
        canAccessClients: false,
        canCreateTasks: false,
        canEditAllTasks: false,
        canEditOwnTasks: true,
        canDeleteTasks: false,
        canAssignTasks: false,
        canChangeTaskDates: false,
        canChangeTaskStatus: true,
        canCreateDocuments: false,
        canEditDocuments: false,
        canDeleteDocuments: false,
        canCreateTransactions: false,
        canEditTransactions: false,
        canDeleteTransactions: false,
        canViewReports: false,
        canManageSales: false,
        canManageFunnel: false,
        canManageUsers: false,
        canManageSpaces: false,
        canManageClients: false
      }
    });

    console.log(`✅ Permissões do member criadas`);

    // 6. Verificar a estrutura criada
    const updatedAdmin = await prisma.user.findUnique({
      where: { id: admin.id },
      include: {
        members: {
          include: {
            permissions: true
          }
        }
      }
    });

    console.log(`\n📊 Estrutura final:`);
    console.log(`   Admin: ${updatedAdmin?.name}`);
    console.log(`   Total de sub-usuários: ${updatedAdmin?.members.length}`);
    
    updatedAdmin?.members.forEach((subUser, index) => {
      console.log(`   ${index + 1}. ${subUser.name} (${subUser.role}) - ${subUser.active ? 'Ativo' : 'Inativo'}`);
      console.log(`      Permissões: ${subUser.permissions ? 'Configuradas' : 'Não configuradas'}`);
    });

    // 7. Testar consultas
    console.log(`\n🔍 Testando consultas:`);
    
    // Buscar sub-usuários da organização
    const subUsers = await prisma.user.findMany({
      where: {
        organizationId: admin.id,
        role: { in: ['manager', 'member'] }
      },
      include: {
        permissions: true
      }
    });

    console.log(`   Sub-usuários encontrados: ${subUsers.length}`);
    
    // Buscar apenas managers
    const managers = await prisma.user.findMany({
      where: {
        organizationId: admin.id,
        role: 'manager'
      }
    });

    console.log(`   Managers encontrados: ${managers.length}`);
    
    // Buscar apenas members
    const members = await prisma.user.findMany({
      where: {
        organizationId: admin.id,
        role: 'member'
      }
    });

    console.log(`   Members encontrados: ${members.length}`);

    console.log(`\n✅ Teste de sub-usuários concluído com sucesso!`);
    console.log(`\n📝 Próximos passos:`);
    console.log(`   1. Acesse o dashboard do sistema`);
    console.log(`   2. Clique em "Ver sub-usuários" na conta admin ${admin.name}`);
    console.log(`   3. Teste criar, editar e gerenciar sub-usuários`);
    console.log(`   4. Verifique as permissões granulares`);

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testSubUsers();
