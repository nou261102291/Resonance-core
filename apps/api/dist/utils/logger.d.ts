import { type Logger } from 'pino';
export declare const logger: Logger<never, boolean>;
export declare function createChildLogger(bindings: Record<string, unknown>): Logger;
export declare function createRequestLogger(requestId: string, metadata?: Record<string, unknown>): Logger;
//# sourceMappingURL=logger.d.ts.map