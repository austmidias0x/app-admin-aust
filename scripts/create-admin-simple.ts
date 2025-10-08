import dotenv from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Carregar .env.local explicitamente
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function createAdmin() {
  // Dados do novo admin
  const email = 'austmidias@gmail.com';
  const password = 'Aust@1234';
  const name = 'Aust Mídias';
  
  console.log('\n👤 Criando usuário administrador...\n');
  console.log('━'.repeat(60));
  
  try {
    // Gerar hash da senha
    console.log('\n🔒 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('   ✓ Hash gerado com sucesso');
    
    // Verificar se usuário já existe via SQL puro
    const existingUser = await prisma.$queryRaw<any[]>`
      SELECT id, email, name, role, active FROM "User" WHERE email = ${email}
    `;
    
    if (existingUser && existingUser.length > 0) {
      console.log(`\n⚠️  Usuário com email "${email}" já existe.\n`);
      console.log('   Atualizando senha...\n');
      
      // Atualizar senha via SQL puro
      await prisma.$executeRaw`
        UPDATE "User" 
        SET 
          password = ${hashedPassword},
          role = 'admin',
          active = true,
          "organizationId" = NULL,
          "updatedAt" = NOW()
        WHERE email = ${email}
      `;
      
      console.log('   ✓ Senha atualizada com sucesso');
      console.log('   ✓ Usuário configurado como admin');
      
      const userId = existingUser[0].id;
      
      // Verificar se já tem permissões
      const existingPerms = await prisma.$queryRaw<any[]>`
        SELECT id FROM "UserPermission" WHERE "userId" = ${userId}
      `;
      
      if (!existingPerms || existingPerms.length === 0) {
        // Criar permissões completas
        console.log('\n🔑 Configurando permissões de administrador...');
        await prisma.$executeRaw`
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
            gen_random_uuid(), ${userId},
            true, true, true, true, true, true,
            true, true, true, true, true, true, true,
            true, true, true,
            true, true, true, true,
            true, true,
            true, true, true,
            NOW(), NOW()
          )
        `;
        console.log('   ✓ Permissões configuradas com sucesso');
      } else {
        // Atualizar permissões existentes
        console.log('\n🔑 Atualizando permissões de administrador...');
        await prisma.$executeRaw`
          UPDATE "UserPermission" SET
            "canAccessTasks" = true, "canAccessDocuments" = true, "canAccessFinancial" = true,
            "canAccessSales" = true, "canAccessGoals" = true, "canAccessClients" = true,
            "canCreateTasks" = true, "canEditAllTasks" = true, "canEditOwnTasks" = true,
            "canDeleteTasks" = true, "canAssignTasks" = true, "canChangeTaskDates" = true, "canChangeTaskStatus" = true,
            "canCreateDocuments" = true, "canEditDocuments" = true, "canDeleteDocuments" = true,
            "canCreateTransactions" = true, "canEditTransactions" = true, "canDeleteTransactions" = true, "canViewReports" = true,
            "canManageSales" = true, "canManageFunnel" = true,
            "canManageUsers" = true, "canManageSpaces" = true, "canManageClients" = true,
            "updatedAt" = NOW()
          WHERE "userId" = ${userId}
        `;
        console.log('   ✓ Permissões atualizadas com sucesso');
      }
      
    } else {
      // Criar novo usuário via SQL puro
      console.log('\n💾 Criando usuário no banco...');
      
      const result = await prisma.$queryRaw<any[]>`
        INSERT INTO "User" (id, email, name, password, role, active, "organizationId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${email}, ${name}, ${hashedPassword}, 'admin', true, NULL, NOW(), NOW())
        RETURNING id
      `;
      
      console.log('   ✓ Usuário criado com sucesso');
      
      const userId = result[0].id;
      
      // Criar permissões completas
      console.log('\n🔑 Configurando permissões de administrador...');
      
      await prisma.$executeRaw`
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
          gen_random_uuid(), ${userId},
          true, true, true, true, true, true,
          true, true, true, true, true, true, true,
          true, true, true,
          true, true, true, true,
          true, true,
          true, true, true,
          NOW(), NOW()
        )
      `;
      
      console.log('   ✓ Permissões configuradas com sucesso');
    }
    
    console.log('\n✅ Administrador configurado com sucesso!\n');
    console.log('━'.repeat(60));
    console.log('\n📋 CREDENCIAIS DE ACESSO:\n');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   Nome:  ${name}`);
    console.log(`   Role:  admin`);
    console.log('\n━'.repeat(60));
    console.log('\n🎯 Para acessar o painel:');
    console.log('\n   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:3003/login');
    console.log(`   3. Use o email: ${email}`);
    console.log(`   4. Use a senha: ${password}\n`);
    console.log('━'.repeat(60));
    console.log('\n✨ Você poderá adicionar novos usuários pelo painel!\n');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

createAdmin();

