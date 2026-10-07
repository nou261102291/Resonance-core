import { createHmac, timingSafeEqual } from 'crypto';
import { createChildLogger } from './logger.js';

const log = createChildLogger({ component: 'github-webhook' });

/**
 * Verify GitHub webhook signature using HMAC-SHA256
 * GitHub sends the signature in the X-Hub-Signature-256 header
 * Format: "sha256=<hex_digest>"
 */
export function verifyWebhookSignature(
  payload: Buffer | string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader) {
    log.debug('No signature header provided');
    return false;
  }

  if (!signatureHeader.startsWith('sha256=')) {
    log.debug('Signature header does not use sha256');
    return false;
  }

  const expectedSignature = signatureHeader.slice(7); // Remove 'sha256=' prefix
  const payloadString = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf-8');

  // Compute HMAC-SHA256
  const hmac = createHmac('sha256', secret);
  hmac.update(payloadString);
  const computedSignature = hmac.digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const computedBuffer = Buffer.from(computedSignature, 'hex');
    
    if (expectedBuffer.length !== computedBuffer.length) {
      log.debug('Signature length mismatch');
      return false;
    }

    return timingSafeEqual(expectedBuffer, computedBuffer);
  } catch (error) {
    log.error({ err: error }, 'Error during signature verification');
    return false;
  }
}

/**
 * Generate a test signature for development/testing
 */
export function generateTestSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload, 'utf-8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Extract installation ID from webhook payload
 */
export function getInstallationId(payload: unknown): number | undefined {
  const p = payload as any;
  return p.installation?.id;
}

/**
 * Check if webhook event is from a supported event type
 */
export function isSupportedEvent(event: string): boolean {
  return ['workflow_run', 'check_run'].includes(event);
}

/**
 * Parse GitHub event from headers
 */
export function parseGitHubEvent(headers: Record<string, string | string[] | undefined>): string | undefined {
  const event = headers['x-github-event'];
  return Array.isArray(event) ? event[0] : event;
}

/**
 * Parse GitHub delivery ID from headers
 */
export function parseGitHubDelivery(headers: Record<string, string | string[] | undefined>): string | undefined {
  const delivery = headers['x-github-delivery'];
  return Array.isArray(delivery) ? delivery[0] : delivery;
}