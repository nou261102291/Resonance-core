import { pino } from 'pino';
import { config } from './config.js';
const loggerOptions = {
    level: config.logging.level,
    ...(config.logging.prettyPrint && config.env !== 'production'
        ? { transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            } }
        : {}),
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        service: 'resonance-core',
        version: process.env.npm_package_version ?? '0.1.0',
        env: config.env,
    },
};
export const logger = pino(loggerOptions);
export function createChildLogger(bindings) {
    return logger.child(bindings);
}
export function createRequestLogger(requestId, metadata) {
    return logger.child({
        requestId,
        ...metadata,
    });
}
//# sourceMappingURL=logger.js.map