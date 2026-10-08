import { z } from 'zod';
declare const VerificationRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    installationId: z.ZodNumber;
    repositoryId: z.ZodNumber;
    owner: z.ZodString;
    repo: z.ZodString;
    pullNumber: z.ZodNumber;
    result: z.ZodUnknown;
}, "strict", z.ZodTypeAny, {
    requestId: string;
    installationId: number;
    owner: string;
    repo: string;
    repositoryId: number;
    pullNumber: number;
    result?: unknown;
}, {
    requestId: string;
    installationId: number;
    owner: string;
    repo: string;
    repositoryId: number;
    pullNumber: number;
    result?: unknown;
}>;
export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;
export interface VerificationOutcome {
    status: 'passed' | 'failed' | 'stale';
    candidateSha: string;
}
export declare class VerificationGate {
    recordResult(input: unknown): Promise<VerificationOutcome>;
}
export declare const verificationGate: VerificationGate;
export {};
//# sourceMappingURL=verification-gate.d.ts.map