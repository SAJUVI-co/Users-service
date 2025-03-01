import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthSessionService {
  private sessions = new Map<string, { id: string; name: string }>(); // Almacena sesiones en memoria (o usar Redis)

  setSession(token: string, user: { id: string; name: string }) {
    this.sessions.set(token, user);
  }

  getSession(token: string): { id: string; name: string } | undefined {
    return this.sessions.get(token);
  }

  removeSession(token: string) {
    this.sessions.delete(token);
  }
}
