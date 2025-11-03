import dotenv from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function resetSuperAdminPassword() {
  const email = 'austmidias@gmail.com';
  const newPassword = process.argv[2] || 'Aust@2024';
  
  console.log('\n🔐 Resetando senha do SUPER ADMIN...\n');
  console.log('━'.repeat(60));
  
  try {
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

    console.log('\n📋 Usuário encontrado:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome:  ${user.name}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`   Ativo: ${user.active ? '✅ Sim' : '❌ Não'}`);

    console.log('\n🔒 Gerando novo hash da senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('   ✓ Hash gerado com sucesso');
    
    console.log('\n💾 Atualizando senha no banco...');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        active: true, // Garantir que está ativo
      },
    });
    
    console.log('   ✓ Senha atualizada com sucesso');
    
    console.log('\n✅ SENHA RESETADA COM SUCESSO!\n');
    console.log('━'.repeat(60));
    console.log('\n🔑 CREDENCIAIS DE ACESSO:\n');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${newPassword}`);
    console.log('\n━'.repeat(60));
    console.log('\n🎯 Agora você pode fazer login em: http://localhost:3003/login\n');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetSuperAdminPassword();




