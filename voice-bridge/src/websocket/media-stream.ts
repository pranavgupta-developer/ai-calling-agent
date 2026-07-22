import { CallSession, TwilioMediaStreamMessage } from '../types';
import { logger } from '../logger';
import { sessionManager } from './session-manager';

export function handleTwilioMessage(session: CallSession, message: TwilioMediaStreamMessage) {
  sessionManager.updateSession(session.sessionId, {}); // Update lastActivity

  switch (message.event) {
    case 'connected':
      logger.info({ sessionId: session.sessionId, protocol: message.connected?.protocol }, 'Twilio Media Stream Connected Event');
      sessionManager.updateSession(session.sessionId, { currentState: 'connected' });
      break;

    case 'start':
      if (message.start) {
        logger.info({ 
          sessionId: session.sessionId, 
          callSid: message.start.callSid, 
          streamSid: message.start.streamSid 
        }, 'Twilio Media Stream Start Event');
        
        sessionManager.updateSession(session.sessionId, { 
          callSid: message.start.callSid,
          streamSid: message.start.streamSid,
          currentState: 'streaming'
        });
      }
      break;

    case 'media':
      if (message.media) {
        const payloadSize = Buffer.from(message.media.payload, 'base64').length;
        // In this phase we only count packets and log the size, do not process audio.
        logger.debug({ 
          sessionId: session.sessionId, 
          track: message.media.track,
          timestamp: message.media.timestamp,
          payloadSizeBytes: payloadSize 
        }, 'Twilio Media Event Received');
      }
      break;

    case 'stop':
      logger.info({ 
        sessionId: session.sessionId, 
        callSid: message.stop?.callSid 
      }, 'Twilio Media Stream Stop Event');
      sessionManager.updateSession(session.sessionId, { currentState: 'closed' });
      
      // Close the socket gracefully when Twilio stops the stream
      try {
        session.websocket.close(1000, 'Twilio stream stopped');
      } catch (err) {
        logger.error({ err, sessionId: session.sessionId }, 'Error closing socket on stop event');
      }
      break;

    case 'mark':
      logger.info({ 
        sessionId: session.sessionId, 
        name: message.mark?.name 
      }, 'Twilio Media Stream Mark Event');
      break;

    default:
      logger.warn({ sessionId: session.sessionId, event: message.event }, 'Unknown Twilio event received');
      break;
  }
}
