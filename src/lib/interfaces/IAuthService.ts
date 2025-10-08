import type { User, UserPermission } from '@prisma/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser extends User {
  permissions?: UserPermission | null;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  register(data: RegisterData): Promise<AuthUser | null>;
  getCurrentUser(): Promise<AuthUser | null>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

