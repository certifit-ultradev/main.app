import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findUnsafeConsoleReferences } from '../logging-rule.mjs';

test('rechaza logs directos en código productivo, incluidas rutas y configuración', () => {
    for (const file of ['actions/user/register.ts', 'src/app/api/blob-upload/route.ts', 'config/env.ts']) {
        const violations = findUnsafeConsoleReferences('console.error(payload);', file);
        assert.equal(violations.length, 1);
        assert.match(violations[0], /uso directo de console\.error/);
    }
});

test('detecta accesos calculados y referencias mediante globalThis', () => {
    const source = 'console[method](body); globalThis.console.warn(error); window["console"]["log"](token);';
    assert.equal(findUnsafeConsoleReferences(source, 'services/payments.ts').length, 3);
});

test('ignora comentarios y cadenas con la palabra console', () => {
    const source = '// console.log(payload)\nconst example = "console.error(secret)";';
    assert.deepEqual(findUnsafeConsoleReferences(source, 'components/example.tsx'), []);
});

test('permite sólo el sink error de safe-logger', () => {
    const file = 'shared/observability/safe-logger.ts';
    assert.deepEqual(findUnsafeConsoleReferences('console.error(message);', file), []);
    assert.equal(findUnsafeConsoleReferences('console.log(message);', file).length, 1);
});
