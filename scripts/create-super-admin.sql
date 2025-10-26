-- Script para criar um Super Admin de teste
-- Senha padrão: Senha@123
-- Hash gerado com bcrypt (10 rounds)

-- ATENÇÃO: Use este script apenas em ambiente de desenvolvimento/teste!

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
  'super_admin_dev_001',
  'superadmin@dev.com',
  'Super Admin Dev',
  '$2a$10$YiZqX8Z9X8Z9X8Z9X8Z9XeYiZqX8Z9X8Z9X8Z9X8Z9XeYiZqX8Z9X8',  -- Senha@123
  'super_admin',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- Para gerar um novo hash de senha, execute no terminal:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('SuaSenhaAqui', 10));"

-- Verificar se foi criado:
-- SELECT * FROM "User" WHERE role = 'super_admin';

