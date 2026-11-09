import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EXTERNAL_HTTP_PROTOCOL_ROUTES, findLegacyHttpResponseViolations } from '../http-response-rule.mjs';

test('rechaza respuestas legacy de éxito y error en rutas HTTP propias', () => {
    const file = 'src/app/api/courses/email/route.ts';
    assert.equal(findLegacyHttpResponseViolations("return Response.json({ success: false, message: 'error' });", file).length, 1);
    assert.equal(findLegacyHttpResponseViolations("return Response.json({ 'success': true, message: 'ok' });", file).length, 1);
});

test('ignora comentarios, cadenas y sobres ApiResponse', () => {
    const file = 'src/app/api/courses/email/route.ts';
    assert.deepEqual(findLegacyHttpResponseViolations("// success: false\nconst example = 'success: true'; return Response.json(apiSuccess({ saved: true }));", file), []);
});

test('exceptúa únicamente rutas de protocolo externas documentadas', () => {
    assert.deepEqual(Object.keys(EXTERNAL_HTTP_PROTOCOL_ROUTES).sort(), [
        'src/app/api/auth/[...nextauth]/route.ts',
        'src/app/api/blob-upload/route.ts',
        'src/app/api/payment/notifications/route.ts',
    ]);
    for (const file of Object.keys(EXTERNAL_HTTP_PROTOCOL_ROUTES)) {
        assert.deepEqual(findLegacyHttpResponseViolations('return Response.json({ success: false, message: "error" });', file), []);
    }
});
