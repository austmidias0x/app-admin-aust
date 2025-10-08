import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Carrega as variáveis de ambiente do .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function scanDatabase() {
  try {
    console.log('🔍 Conectando ao banco de dados...\n');
    console.log('📊 ESTATÍSTICAS DO BANCO:\n');
    console.log('━'.repeat(60));

    // Buscar estatísticas de usuários
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { active: true } });
    const admins = await prisma.user.count({ where: { role: 'admin', organizationId: null } });
    const managers = await prisma.user.count({ where: { role: 'manager' } });
    const members = await prisma.user.count({ where: { role: 'member' } });

    console.log('\n👥 USUÁRIOS:');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   Ativos: ${activeUsers}`);
    console.log(`   Inativos: ${totalUsers - activeUsers}`);
    console.log(`\n   Admins (organizações): ${admins}`);
    console.log(`   Managers: ${managers}`);
    console.log(`   Members: ${members}`);

    // Buscar estatísticas de permissões
    const totalPermissions = await prisma.userPermission.count();
    console.log(`\n🔐 PERMISSÕES: ${totalPermissions} registros`);

    // Buscar estatísticas de outros recursos
    const totalSpaces = await prisma.space.count();
    const totalFolders = await prisma.folder.count();
    const totalLists = await prisma.list.count();
    const totalTasks = await prisma.task.count();
    const totalDocuments = await prisma.document.count();
    const totalTransactions = await prisma.transaction.count();
    const totalSales = await prisma.sale.count();
    const totalGoals = await prisma.goal.count();
    const totalClients = await prisma.client.count();
    const totalSalesFunnels = await prisma.salesFunnel.count();

    console.log('\n📦 RECURSOS:');
    console.log(`   Espaços: ${totalSpaces}`);
    console.log(`   Pastas: ${totalFolders}`);
    console.log(`   Listas: ${totalLists}`);
    console.log(`   Tarefas: ${totalTasks}`);
    console.log(`   Documentos: ${totalDocuments}`);
    console.log(`   Transações: ${totalTransactions}`);
    console.log(`   Vendas: ${totalSales}`);
    console.log(`   Metas: ${totalGoals}`);
    console.log(`   Clientes: ${totalClients}`);
    console.log(`   Funis de Vendas: ${totalSalesFunnels}`);

    // Listar organizações (admins)
    console.log('\n\n🏢 ORGANIZAÇÕES (ADMINS):\n');
    console.log('━'.repeat(60));

    const organizations = await prisma.user.findMany({
      where: {
        role: 'admin',
        organizationId: null,
      },
      include: {
        _count: {
          select: {
            members: true,
            spaces: true,
            tasks: true,
            documents: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (organizations.length === 0) {
      console.log('❌ Nenhuma organização encontrada.');
    } else {
      organizations.forEach((org, index) => {
        console.log(`\n${index + 1}. ${org.name}`);
        console.log(`   Email: ${org.email}`);
        console.log(`   Status: ${org.active ? '✅ Ativo' : '❌ Inativo'}`);
        console.log(`   Criado em: ${new Date(org.createdAt).toLocaleString('pt-BR')}`);
        console.log(`   Membros: ${org._count.members}`);
        console.log(`   Espaços: ${org._count.spaces}`);
        console.log(`   Tarefas: ${org._count.tasks}`);
        console.log(`   Documentos: ${org._count.documents}`);
        console.log(`   Transações: ${org._count.transactions}`);
      });
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ Scan concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao escanear o banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

scanDatabase();
