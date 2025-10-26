import dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local explicitamente
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Verificar se a variável foi carregada
if (!process.env.POSTGRES_URL) {
  console.error('\n❌ POSTGRES_URL não encontrado!');
  console.error('Certifique-se de que o arquivo .env.local existe na raiz do projeto.\n');
  process.exit(1);
}

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

/**
 * Script de Migration - Criar Super Admin
 * 
 * Este script cria um super administrador no banco de dados
 * para gerenciamento da aplicação administrativa.
 * 
 * Credenciais:
 * Email: thalesbcaires@gmail.com
 * Senha: admin
 */

async function createSuperAdmin() {
  const email = 'thalesbcaires@gmail.com';
  const password = 'admin';
  const name = 'Thales Caires';
  
  console.log('\n🚀 Iniciando migration: Criar Super Admin\n');
  console.log('━'.repeat(60));
  
  try {
    // 1. Verificar se já existe
    console.log('\n📋 Verificando se usuário já existe...');
    
    const existingUser = await sql`
      SELECT id, email, role, active 
      FROM "User" 
      WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      console.log(`\n⚠️  Usuário já existe no banco!`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Ativo: ${user.active ? 'Sim' : 'Não'}`);
      
      if (user.role !== 'super_admin') {
        console.log(`\n⚠️  ATENÇÃO: O usuário existe mas não é super_admin!`);
        console.log(`   Role atual: ${user.role}`);
        console.log(`\n   Para atualizar para super_admin, execute:`);
        console.log(`   UPDATE "User" SET role = 'super_admin' WHERE email = '${email}';`);
      }
      
      if (!user.active) {
        console.log(`\n⚠️  ATENÇÃO: O usuário existe mas está inativo!`);
        console.log(`\n   Para ativar, execute:`);
        console.log(`   UPDATE "User" SET active = true WHERE email = '${email}';`);
      }
      
      console.log('\n✅ Migration finalizada (usuário já existia)\n');
      return;
    }

    // 2. Gerar hash da senha
    console.log(`\n🔐 Gerando hash da senha...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`   ✓ Hash gerado com sucesso`);

    // 3. Gerar ID único
    const userId = createId();
    console.log(`\n🆔 ID gerado: ${userId}`);

    // 4. Criar usuário no banco
    console.log(`\n💾 Criando super admin no banco...`);
    
    const now = new Date().toISOString();
    
    await sql`
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
        ${userId},
        ${email},
        ${name},
        ${hashedPassword},
        'super_admin',
        true,
        NULL,
        NULL,
        ${now},
        ${now}
      )
    `;

    console.log(`   ✓ Super admin criado com sucesso!`);

    // 5. Verificar criação
    console.log(`\n🔍 Verificando criação...`);
    
    const verifyUser = await sql`
      SELECT id, email, name, role, active, "createdAt"
      FROM "User"
      WHERE email = ${email}
    `;

    if (verifyUser.rows.length > 0) {
      const user = verifyUser.rows[0];
      console.log(`\n✅ Usuário criado e verificado com sucesso!\n`);
      console.log('━'.repeat(60));
      console.log(`\n📋 DETALHES DO SUPER ADMIN:\n`);
      console.log(`   ID:         ${user.id}`);
      console.log(`   Email:      ${user.email}`);
      console.log(`   Nome:       ${user.name}`);
      console.log(`   Role:       ${user.role}`);
      console.log(`   Ativo:      ${user.active ? 'Sim' : 'Não'}`);
      console.log(`   Criado em:  ${new Date(user.createdAt).toLocaleString('pt-BR')}`);
      console.log(`\n━`.repeat(60));
      console.log(`\n🔑 CREDENCIAIS DE ACESSO:\n`);
      console.log(`   URL:   http://localhost:3000/login`);
      console.log(`   Email: ${email}`);
      console.log(`   Senha: ${password}`);
      console.log(`\n━`.repeat(60));
      console.log(`\n✨ Pronto! Você já pode fazer login no painel administrativo.\n`);
    } else {
      throw new Error('Usuário não foi encontrado após criação');
    }

  } catch (error: any) {
    console.error(`\n❌ Erro durante a migration:\n`);
    
    if (error.code === '23505') {
      console.error(`   Erro: Usuário com este email já existe (duplicate key)`);
    } else if (error.code === '42P01') {
      console.error(`   Erro: Tabela "User" não encontrada`);
      console.error(`   Certifique-se de que o banco de dados está configurado corretamente`);
    } else if (error.message?.includes('connect')) {
      console.error(`   Erro de conexão com o banco de dados`);
      console.error(`   Verifique as variáveis de ambiente em .env.local`);
    } else {
      console.error(`   ${error.message}`);
    }
    
    console.error(`\n   Stack trace:`);
    console.error(`   ${error.stack}\n`);
    
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar migration
console.log('');
createSuperAdmin();

