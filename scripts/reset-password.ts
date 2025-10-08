import dotenv from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Carregar .env.local explicitamente
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function resetPassword() {
  // ALTERE O EMAIL E A SENHA AQUI
  const email = 'thalesbcaires@gmail.com';
  const newPassword = 'admin';
  
  console.log('\n🔐 Resetando senha do usuário...\n');
  console.log('━'.repeat(60));
  
  try {
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      console.log(`\n❌ Usuário com email "${email}" não encontrado.\n`);
      return;
    }

    // Gerar novo hash
    console.log('\n🔒 Gerando novo hash da senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('   ✓ Hash gerado com sucesso');
    
    // Atualizar no banco
    console.log('\n💾 Atualizando senha no banco...');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
    
    console.log('   ✓ Senha atualizada com sucesso');
    
    console.log('\n✅ Senha resetada com sucesso!\n');
    console.log('━'.repeat(60));
    console.log('\n📋 DETALHES DO USUÁRIO:\n');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome:  ${user.name}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`   Ativo: ${user.active ? 'Sim' : 'Não'}`);
    console.log('\n━'.repeat(60));
    console.log('\n🔑 NOVA SENHA:\n');
    console.log(`   Senha: ${newPassword}`);
    console.log('\n━'.repeat(60));
    console.log('\n🎯 Acesse: http://localhost:3003/login');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${newPassword}\n`);
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetPassword();
