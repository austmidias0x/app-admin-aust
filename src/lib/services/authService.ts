import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { sessionService } from './sessionService';
import type { IAuthService, LoginCredentials, RegisterData, AuthUser, AuthSession } from '../interfaces/IAuthService';

export class AuthService implements IAuthService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Realiza login com email e senha
   */
  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      const { email, password } = credentials;

      // Buscar usuário com permissões
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { permissions: true },
      });

      if (!user) {
        return null;
      }

      // Verificar senha
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Verificar se usuário está ativo
      if (!user.active) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Registra um novo usuário (admin)
   */
  async register(data: RegisterData): Promise<AuthUser | null> {
    try {
      const { email, password, name } = data;

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        return null;
      }

      // Hash da senha
      const hashedPassword = await this.hashPassword(password);

      // Criar usuário e permissões em uma transação
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password: hashedPassword,
          role: 'admin', // Registro público cria apenas admins
          active: true,
          organizationId: null, // Admin não tem organizationId
          permissions: {
            create: {
              // Permissões padrão para admin (todas true)
              canAccessTasks: true,
              canAccessDocuments: true,
              canAccessFinancial: true,
              canAccessSales: true,
              canAccessGoals: true,
              canAccessClients: true,
              canCreateTasks: true,
              canEditAllTasks: true,
              canEditOwnTasks: true,
              canDeleteTasks: true,
              canAssignTasks: true,
              canChangeTaskDates: true,
              canChangeTaskStatus: true,
              canCreateDocuments: true,
              canEditDocuments: true,
              canDeleteDocuments: true,
              canCreateTransactions: true,
              canEditTransactions: true,
              canDeleteTransactions: true,
              canViewReports: true,
              canManageSales: true,
              canManageFunnel: true,
              canManageUsers: true,
              canManageSpaces: true,
              canManageClients: true,
            },
          },
        },
        include: { permissions: true },
      });

      return user;
    } catch (error) {
      console.error('Register error:', error);
      return null;
    }
  }

  /**
   * Obtém o usuário autenticado atual
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userId = await sessionService.getSessionUserId();
      if (!userId) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
      });

      if (!user || !user.active) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Obtém a sessão completa do usuário autenticado
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      return { user };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Fallback: se a senha no banco não for hash (compatibilidade temporária)
      if (!hash.startsWith('$2')) {
        return password === hash;
      }

      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Verify password error:', error);
      return false;
    }
  }

  /**
   * Cria hash bcrypt da senha
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AuthService.SALT_ROUNDS);
  }
}

// Singleton
export const authService = new AuthService();

