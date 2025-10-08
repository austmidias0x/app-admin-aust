export interface ISessionService {
  createSession(userId: string): Promise<void>;
  destroySession(): Promise<void>;
  getSessionUserId(): Promise<string | null>;
  validateSession(): Promise<boolean>;
}

