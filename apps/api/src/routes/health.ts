import { FastifyPluginAsync } from 'fastify';
import { config } from '../utils/config.js';

export const healthRoutes: FastifyPluginAsync = async (server) => {
  // Liveness probe - always returns 200 if server is running
  server.get('/live', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'alive' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async () => {
    return { status: 'alive', timestamp: new Date().toISOString() };
  });

  // Readiness probe - checks dependencies
  server.get('/ready', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not_ready'] },
            checks: {
              type: 'object',
              properties: {
                config: { type: 'boolean' },
                nebius: { type: 'boolean' },
                tavily: { type: 'boolean' },
                github: { type: 'boolean' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'not_ready' },
            checks: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const checks = {
      config: true, // If we're here, config loaded successfully
      nebius: !!config.nebius.apiKey,
      tavily: !!config.tavily.apiKey,
      github: !!config.github.appId && !!config.github.privateKey && !!config.github.webhookSecret,
    };

    const allReady = Object.values(checks).every(Boolean);
    const status = allReady ? 'ready' : 'not_ready';

    if (!allReady) {
      reply.status(503);
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  });

  // Startup probe - for Kubernetes
  server.get('/startup', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'started' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async () => {
    return { status: 'started', timestamp: new Date().toISOString() };
  });

  // Version/info endpoint
  server.get('/info', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            env: { type: 'string' },
            nodeVersion: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async () => {
    return {
      name: 'Resonance Core API',
      version: process.env.npm_package_version ?? '0.1.0',
      env: config.env,
      nodeVersion: process.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });
};