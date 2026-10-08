import type { FastifyPluginAsync } from 'fastify';
import { config } from '../utils/config.js';
import { verifyVerificationSignature } from '../utils/verification-signature.js';
import { verificationGate } from '../services/verification-gate.js';

export const verificationRoutes: FastifyPluginAsync = async (server) => {
  server.post<{
    Body: unknown;
    Headers: {
      'x-resonance-timestamp'?: string;
      'x-resonance-signature'?: string;
    };
  }>('/result', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const secret = config.verification.callbackSecret;
    if (secret === undefined) {
      return reply.status(503).send({ error: 'Verification callback is not configured' });
    }

    const timestamp = request.headers['x-resonance-timestamp'];
    const signature = request.headers['x-resonance-signature'];
    const rawBody = (request as typeof request & { rawBody?: Buffer }).rawBody;
    if (!timestamp || !signature || !rawBody || !verifyVerificationSignature(
      rawBody,
      timestamp,
      signature,
      secret,
      Date.now(),
      config.verification.callbackToleranceSeconds,
    )) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const outcome = await verificationGate.recordResult(request.body);
      return reply.send(outcome);
    } catch (error) {
      if (error instanceof Error && error.message.includes('schema validation')) {
        return reply.status(400).send({ error: 'Invalid verification report' });
      }
      throw error;
    }
  });
};