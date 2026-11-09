import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findLayerImportViolations } from '../layer-import-rule.mjs';

test('bloquea imports de persistencia en rutas API, incluso relativos o dinámicos', () => {
    assert.equal(findLayerImportViolations("import { prisma } from '@/lib/prisma'", 'src/app/api/courses/route.ts').length, 1);
    assert.equal(findLayerImportViolations("import type { Course } from '../../../../models/course'", 'src/app/api/courses/route.ts').length, 1);
    assert.equal(findLayerImportViolations("await import('@/repository/users')", 'src/app/api/courses/route.ts').length, 1);
    assert.equal(findLayerImportViolations("export { Course } from '@/models/course'", 'src/app/api/courses/route.ts').length, 1);
});

test('bloquea repositorios y mappers de persistencia en actions', () => {
    assert.equal(findLayerImportViolations("import { findUser } from '@/repository/users'", 'actions/user/list.ts').length, 1);
    assert.equal(findLayerImportViolations("const mapper = require('@/mappers/course-audience-mapper')", 'actions/courses/list.ts').length, 1);
    assert.deepEqual(findLayerImportViolations("import { toCourseEditorPatch } from '@/interfaces/actions/course-editor.mapper'", 'actions/courses/register.ts'), []);
});

test('bloquea capas superiores y cualquier modelo en repositorios', () => {
    assert.equal(findLayerImportViolations("import { registerCourse } from '@/services/courses'", 'repository/course-read.prisma.ts').length, 1);
    assert.equal(findLayerImportViolations("import { Form } from '../components/form'", 'repository/users.ts').length, 1);
    assert.equal(findLayerImportViolations("import type { Contract } from '@/interfaces/http/api-response'", 'repository/users.ts').length, 1);
    assert.equal(findLayerImportViolations("import { Course } from '@/models/course'", 'repository/wompi-api.ts').length, 1);
    assert.equal(findLayerImportViolations("import { Transaction } from '@/models/transaction'", 'repository/wompi-api.ts').length, 1);
});

test('ignora comentarios, cadenas, paquetes externos y archivos de test', () => {
    assert.deepEqual(findLayerImportViolations("// import '@/repository/users'\nconst note = \"from '@/models/course'\";", 'src/app/api/courses/route.ts'), []);
    assert.deepEqual(findLayerImportViolations("import { z } from 'zod'", 'repository/users.ts'), []);
    assert.deepEqual(findLayerImportViolations("import { Course } from '@/models/course'", 'repository/__test__/course.test.ts'), []);
});
