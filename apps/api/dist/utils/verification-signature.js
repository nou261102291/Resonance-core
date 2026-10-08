import { createHmac, timingSafeEqual } from 'node:crypto';
export function verifyVerificationSignature(payload, timestampHeader, signatureHeader, secret, nowMs = Date.now(), toleranceSeconds = 300) {
    if (!/^\d{10}$/.test(timestampHeader) || !/^sha256=[a-f0-9]{64}$/i.test(signatureHeader)) {
        return false;
    }
    const timestampMs = Number(timestampHeader) * 1000;
    if (Math.abs(nowMs - timestampMs) > toleranceSeconds * 1000) {
        return false;
    }
    const providedDigest = Buffer.from(signatureHeader.slice('sha256='.length), 'hex');
    const expectedDigest = createHmac('sha256', secret)
        .update(timestampHeader)
        .update('.')
        .update(payload)
        .digest();
    return providedDigest.length === expectedDigest.length && timingSafeEqual(providedDigest, expectedDigest);
}
//# sourceMappingURL=verification-signature.js.map