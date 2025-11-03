import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Buscando usuário austmidias@gmail.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'austmidias@gmail.com' },
      include: { permissions: true },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados.\n');
      return;
    }

    console.log('✅ Usuário encontrado!\n');
    console.log('📋 Detalhes:');
    console.log('━'.repeat(60));
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Nome: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Ativo: ${user.active ? '✅ Sim' : '❌ Não'}`);
    console.log(`OrganizationId: ${user.organizationId || 'null (É uma organização)'}`);
    console.log(`Senha (hash): ${user.password.substring(0, 20)}...`);
    console.log(`Criado em: ${new Date(user.createdAt).toLocaleString('pt-BR')}`);
    console.log(`Atualizado em: ${new Date(user.updatedAt).toLocaleString('pt-BR')}`);
    
    if (user.permissions) {
      console.log('\n🔐 Permissões:');
      console.log(`   canManageUsers: ${user.permissions.canManageUsers}`);
      console.log(`   canAccessTasks: ${user.permissions.canAccessTasks}`);
    } else {
      console.log('\n⚠️  Sem permissões associadas');
    }
    
    console.log('\n━'.repeat(60));

    // Verificar se a senha é hash ou texto plano
    if (user.password.startsWith('$2')) {
      console.log('✅ Senha está em formato hash (bcrypt)');
    } else {
      console.log('⚠️  Senha está em TEXTO PLANO (não é hash bcrypt)');
    }

    // Listar todos os usuários
    console.log('\n\n👥 TODOS OS USUÁRIOS NO BANCO:\n');
    console.log('━'.repeat(60));
    
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    allUsers.forEach((u, index) => {
      console.log(`\n${index + 1}. ${u.name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Ativo: ${u.active ? '✅' : '❌'}`);
      console.log(`   OrganizationId: ${u.organizationId || 'null'}`);
    });

    console.log('\n' + '━'.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkUser();

