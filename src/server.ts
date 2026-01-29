import app from './app';
import { config } from './config';
import logger from './config/logger';
import prisma from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════╗
║  Wellbeing App Backend Server                          ║
║  Environment: ${config.env.padEnd(41)}║
║  Port: ${config.port.toString().padEnd(47)}║
║  API Version: ${config.apiVersion.padEnd(42)}║
║  API Docs: http://localhost:${config.port}/api-docs${' '.padEnd(14)}║
╚════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
