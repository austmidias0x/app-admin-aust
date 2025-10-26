import dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local explicitamente
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function updateToSuperAdmin() {
  const email = 'thalesbcaires@gmail.com';
  
  console.log('\n🔄 Atualizando usuário para Super Admin...\n');
  console.log('━'.repeat(60));
  
  try {
    const now = new Date().toISOString();
    
    await sql`
      UPDATE "User" 
      SET role = 'super_admin', "updatedAt" = ${now}
      WHERE email = ${email}
    `;
    
    console.log('\n✅ Usuário atualizado com sucesso!');
    
    // Verificar
    const user = await sql`
      SELECT id, email, name, role, active 
      FROM "User" 
      WHERE email = ${email}
    `;
    
    if (user.rows.length > 0) {
      const u = user.rows[0];
      console.log('\n📋 DETALHES ATUALIZADOS:\n');
      console.log(`   Email: ${u.email}`);
      console.log(`   Nome:  ${u.name}`);
      console.log(`   Role:  ${u.role} ✨`);
      console.log(`   Ativo: ${u.active ? 'Sim' : 'Não'}`);
      console.log('\n━'.repeat(60));
      console.log('\n🎉 Pronto! Agora você é Super Admin!\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateToSuperAdmin();

