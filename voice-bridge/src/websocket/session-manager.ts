import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { CallSession } from '../types';
import { logger } from '../logger';

class SessionManager {
  private sessions: Map<string, CallSession> = new Map();
  // Map from Twilio CallSid to SessionId to allow lookup by call
  private callToSessionMap: Map<string, string> = new Map();

  createSession(ws: WebSocket): CallSession {
    const sessionId = randomUUID();
    const session: CallSession = {
      sessionId,
      callSid: '',
      streamSid: null,
      websocket: ws,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      currentState: 'initialized'
    };

    this.sessions.set(sessionId, session);
    logger.info({ sessionId }, 'New session created');
    return session;
  }

  getSession(sessionId: string): CallSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByCallSid(callSid: string): CallSession | undefined {
    const sessionId = this.callToSessionMap.get(callSid);
    if (sessionId) {
      return this.sessions.get(sessionId);
    }
    return undefined;
  }

  updateSession(sessionId: string, updates: Partial<CallSession>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { lastActivity: Date.now() });
      if (updates.callSid) {
        this.callToSessionMap.set(updates.callSid, sessionId);
      }
    }
  }

  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.callSid) {
        this.callToSessionMap.delete(session.callSid);
      }
      this.sessions.delete(sessionId);
      logger.info({ sessionId }, 'Session removed');
    }
  }

  cleanupExpiredSessions(maxIdleTimeMs = 3600000): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxIdleTimeMs) {
        logger.warn({ sessionId }, 'Cleaning up expired session');
        try {
          session.websocket.close(1000, 'Session expired due to inactivity');
        } catch (e) {
          logger.error({ sessionId, error: e }, 'Error closing expired session websocket');
        }
        this.removeSession(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Run cleanup periodically every 15 minutes
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 15 * 60 * 1000);
