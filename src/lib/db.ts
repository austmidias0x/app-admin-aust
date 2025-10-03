import { sql } from '@vercel/postgres';

export { sql };

// Helper para executar queries com tratamento de erro
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(queryText, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper para verificar se usuário existe
export async function userExists(email: string): Promise<boolean> {
  const result = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM "User" WHERE email = $1',
    [email]
  );
  return result[0].count > 0;
}

// Helper para buscar usuário por ID
export async function getUserById(id: string) {
  const result = await query(
    `SELECT 
      u.*,
      up.* 
    FROM "User" u
    LEFT JOIN "UserPermission" up ON u.id = up."userId"
    WHERE u.id = $1`,
    [id]
  );
  return result[0] || null;
}

// Helper para buscar usuário por email
export async function getUserByEmail(email: string) {
  const result = await query(
    `SELECT 
      u.*,
      up.* 
    FROM "User" u
    LEFT JOIN "UserPermission" up ON u.id = up."userId"
    WHERE u.email = $1`,
    [email]
  );
  return result[0] || null;
}

// Helper para buscar organização (admin) por ID
export async function getOrganizationById(id: string) {
  const result = await query(
    `SELECT * FROM "User" WHERE id = $1 AND role = 'admin' AND "organizationId" IS NULL`,
    [id]
  );
  return result[0] || null;
}

// Helper para listar todas as organizações
export async function listOrganizations() {
  const result = await query(
    `SELECT 
      id, 
      email, 
      name, 
      active, 
      "createdAt", 
      "updatedAt"
    FROM "User" 
    WHERE role = 'admin' AND "organizationId" IS NULL
    ORDER BY "createdAt" DESC`
  );
  return result;
}

// Helper para listar usuários de uma organização
export async function listOrganizationUsers(organizationId: string) {
  const result = await query(
    `SELECT 
      u.*,
      up."canAccessTasks",
      up."canAccessDocuments",
      up."canAccessFinancial",
      up."canAccessSales",
      up."canAccessGoals",
      up."canAccessClients",
      up."canManageUsers",
      up."canManageSpaces",
      up."canManageClients",
      (SELECT COUNT(*) FROM "Task" WHERE "assignedToId" = u.id) as tasks_count
    FROM "User" u
    LEFT JOIN "UserPermission" up ON u.id = up."userId"
    WHERE u."organizationId" = $1 OR u.id = $1
    ORDER BY u."createdAt" DESC`,
    [organizationId]
  );
  return result;
}

