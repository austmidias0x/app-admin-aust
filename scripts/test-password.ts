import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const email = 'austmidias@gmail.com';
    
    console.log('🔍 Testando senha para:', email);
    console.log('Digite a senha que você está tentando usar:');
    console.log('(Por segurança, você precisará inserir a senha quando solicitado)\n');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado!');
    console.log(`Hash armazenado: ${user.password.substring(0, 30)}...\n`);

    // Solicitar senha via process.argv para teste
    const testPassword = process.argv[2];
    
    if (!testPassword) {
      console.log('⚠️  Use: npx tsx scripts/test-password.ts "sua-senha"\n');
      console.log('Informações do hash:');
      console.log(`   Starts with $2: ${user.password.startsWith('$2')}`);
      console.log(`   Length: ${user.password.length}`);
      console.log(`   Full hash: ${user.password}`);
      return;
    }

    console.log('🔐 Testando senha...\n');

    const isValid = await bcrypt.compare(testPassword, user.password);

    if (isValid) {
      console.log('✅ SENHA CORRETA! O hash bate com a senha fornecida.');
      console.log('   O problema está em outro lugar no fluxo de login.\n');
    } else {
      console.log('❌ SENHA INCORRETA! O hash não bate com a senha fornecida.');
      console.log('   Você precisa redefinir a senha para este usuário.\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testPassword();

