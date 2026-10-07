/**
 * Verify GitHub webhook signature using HMAC-SHA256
 * GitHub sends the signature in the X-Hub-Signature-256 header
 * Format: "sha256=<hex_digest>"
 */
export declare function verifyWebhookSignature(payload: Buffer | string, signatureHeader: string, secret: string): boolean;
/**
 * Generate a test signature for development/testing
 */
export declare function generateTestSignature(payload: string, secret: string): string;
/**
 * Extract installation ID from webhook payload
 */
export declare function getInstallationId(payload: unknown): number | undefined;
/**
 * Check if webhook event is from a supported event type
 */
export declare function isSupportedEvent(event: string): boolean;
/**
 * Parse GitHub event from headers
 */
export declare function parseGitHubEvent(headers: Record<string, string | string[] | undefined>): string | undefined;
/**
 * Parse GitHub delivery ID from headers
 */
export declare function parseGitHubDelivery(headers: Record<string, string | string[] | undefined>): string | undefined;
//# sourceMappingURL=github-webhook.d.ts.map