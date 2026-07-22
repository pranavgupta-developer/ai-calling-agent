import { WebSocket } from 'ws';
import { logger } from '../logger';
import { sessionManager } from './session-manager';
import { handleTwilioMessage } from './media-stream';
import { TwilioMediaStreamMessage } from '../types';

export function setupWebSocketConnection(ws: WebSocket) {
  const session = sessionManager.createSession(ws);
  logger.info({ sessionId: session.sessionId }, 'WebSocket connection established');

  ws.on('message', (data: Buffer | string) => {
    try {
      const messageString = data.toString('utf-8');
      const message: TwilioMediaStreamMessage = JSON.parse(messageString);
      handleTwilioMessage(session, message);
    } catch (err) {
      logger.error({ err, sessionId: session.sessionId, data: data.toString() }, 'Failed to parse or handle WebSocket message');
      // Do not crash on invalid JSON or unexpected events
    }
  });

  ws.on('close', (code, reason) => {
    logger.info({ sessionId: session.sessionId, code, reason: reason.toString() }, 'WebSocket connection closed');
    sessionManager.removeSession(session.sessionId);
  });

  ws.on('error', (err) => {
    logger.error({ err, sessionId: session.sessionId }, 'WebSocket connection error');
    // Ensure cleanup happens even if close event isn't fired
    sessionManager.removeSession(session.sessionId);
  });
  
  // Set up socket timeout detection
  ws.on('pong', () => {
    sessionManager.updateSession(session.sessionId, {}); // Update lastActivity
  });
}
