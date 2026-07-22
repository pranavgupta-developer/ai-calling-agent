import { WebSocket } from 'ws';

export type SessionState = 'initialized' | 'connected' | 'streaming' | 'closed';

export interface CallSession {
  sessionId: string;
  callSid: string;
  streamSid: string | null;
  websocket: WebSocket;
  connectedAt: number;
  lastActivity: number;
  currentState: SessionState;
}

// Twilio Media Stream Types
export interface TwilioMediaStreamMessage {
  event: 'connected' | 'start' | 'media' | 'stop' | 'mark';
  sequenceNumber?: string;
  streamSid?: string;
  connected?: {
    protocol: string;
    version: string;
  };
  start?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters?: Record<string, string>;
  };
  media?: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string;
  };
  stop?: {
    accountSid: string;
    callSid: string;
  };
  mark?: {
    name: string;
  };
}
