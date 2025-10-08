import { cookies } from 'next/headers';
import type { ISessionService } from '../interfaces/ISessionService';

export class SessionService implements ISessionService {
  private static readonly COOKIE_NAME = 'auth-token';
  private static readonly DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

  /**
   * Cria uma nova sessão armazenando o userId no cookie
   */
  async createSession(userId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SessionService.COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SessionService.DEFAULT_MAX_AGE,
      path: '/',
    });
  }

  /**
   * Destroi a sessão removendo o cookie
   */
  async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SessionService.COOKIE_NAME);
  }

  /**
   * Obtém o userId da sessão atual
   */
  async getSessionUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SessionService.COOKIE_NAME);
    return token?.value ?? null;
  }

  /**
   * Valida se existe uma sessão ativa
   */
  async validateSession(): Promise<boolean> {
    const userId = await this.getSessionUserId();
    return userId !== null;
  }
}

// Singleton
export const sessionService = new SessionService();

