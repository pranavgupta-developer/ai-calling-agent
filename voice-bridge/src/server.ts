import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { config } from './config';
import { logger } from './logger';
import { healthRoutes } from './routes/health';
import { setupWebSocketConnection } from './websocket/handlers';

async function buildServer() {
  const server = fastify({
    logger: false
  });

  // Log incoming requests
  server.addHook('onRequest', (request, reply, done) => {
    logger.info({ method: request.method, url: request.url }, 'Incoming request');
    done();
  });

  // Register WebSocket support
  await server.register(websocketPlugin, {
    options: {
      maxPayload: 1048576, // 1MB payload limit to prevent large payloads from crashing
    }
  });

  // Register health route
  await server.register(healthRoutes);

  // Register WebSocket route for Media Streams
  server.register(async function (fastifyInstance) {
    fastifyInstance.get('/ws/media', { websocket: true }, (socket, req) => {
      logger.info({ ip: req.ip }, 'New WebSocket connection attempt to /ws/media');
      setupWebSocketConnection(socket);
    });
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal, closing server gracefully');
    try {
      await server.close();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  return server;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    });
    logger.info(`Server listening on ${config.HOST}:${config.PORT}`);
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

// Ensure unhandled rejections are logged
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection at promise');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception thrown');
  process.exit(1);
});

start();
