import { sql } from '@vercel/postgres';

async function scanDatabase() {
  try {
    console.log('🔍 Conectando ao banco de dados...\n');

    // Buscar todas as tabelas
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('📊 TABELAS ENCONTRADAS:\n');
    console.log('━'.repeat(60));

    if (tablesResult.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada no schema public.');
      return;
    }

    // Para cada tabela, buscar as colunas e informações
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 Tabela: ${tableName}`);
      console.log('─'.repeat(60));

      // Buscar colunas
      const columnsResult = await sql`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `;

      console.log('\nColunas:');
      columnsResult.rows.forEach((column: any) => {
        const nullable = column.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        const type = column.character_maximum_length 
          ? `${column.data_type}(${column.character_maximum_length})`
          : column.data_type;
        const defaultValue = column.column_default ? ` DEFAULT ${column.column_default}` : '';
        
        console.log(`  • ${column.column_name}: ${type} ${nullable}${defaultValue}`);
      });

      // Buscar chaves primárias
      const primaryKeysResult = await sql`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ${tableName};
      `;

      if (primaryKeysResult.rows.length > 0) {
        console.log('\n🔑 Chaves Primárias:');
        primaryKeysResult.rows.forEach((pk: any) => {
          console.log(`  • ${pk.column_name}`);
        });
      }

      // Buscar chaves estrangeiras
      const foreignKeysResult = await sql`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ${tableName};
      `;

      if (foreignKeysResult.rows.length > 0) {
        console.log('\n🔗 Chaves Estrangeiras:');
        foreignKeysResult.rows.forEach((fk: any) => {
          console.log(`  • ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        });
      }

      // Contar registros
      const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult.rows[0].count;
      console.log(`\n📈 Total de registros: ${count}`);
      
      console.log('\n' + '━'.repeat(60));
    }

    console.log('\n✅ Scan concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao escanear o banco de dados:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

scanDatabase();

