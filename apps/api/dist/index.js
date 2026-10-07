import Fastify from 'fastify';
import { webhookRoutes } from './routes/webhook.js';
import { healthRoutes } from './routes/health.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
async function buildServer() {
    const server = Fastify({
        logger: logger,
        trustProxy: true,
        bodyLimit: 1024 * 1024, // 1MB max payload
    });
    server.removeContentTypeParser('application/json');
    server.addContentTypeParser('application/json', { parseAs: 'buffer' }, (request, body, done) => {
        const rawBody = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8');
        request.rawBody = rawBody;
        try {
            done(null, JSON.parse(rawBody.toString('utf-8')));
        }
        catch (error) {
            done(error instanceof Error ? error : new Error('Invalid JSON payload'));
        }
    });
    // Register routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(webhookRoutes, { prefix: '/webhook' });
    // Global error handler
    server.setErrorHandler((error, request, reply) => {
        request.log.error({ err: error }, 'Unhandled error');
        if (error.validation) {
            return reply.status(400).send({
                error: 'Validation Error',
                message: error.message,
                details: error.validation,
            });
        }
        return reply.status(500).send({
            error: 'Internal Server Error',
            message: config.env === 'production' ? 'An unexpected error occurred' : error.message,
        });
    });
    // 404 handler
    server.setNotFoundHandler((request, reply) => {
        return reply.status(404).send({
            error: 'Not Found',
            message: `Route ${request.method} ${request.url} not found`,
        });
    });
    return server;
}
async function start() {
    try {
        const server = await buildServer();
        const address = await server.listen({
            port: config.port,
            host: config.host,
        });
        server.log.info(`🚀 Resonance Core API listening at ${address}`);
        server.log.info(`Environment: ${config.env}`);
        server.log.info(`Webhook endpoint: ${address}/webhook/github`);
        // Graceful shutdown
        const shutdown = async (signal) => {
            server.log.info({ signal }, 'Shutting down...');
            await server.close();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
}
// Only start if not imported (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}
export { buildServer };
//# sourceMappingURL=index.js.map