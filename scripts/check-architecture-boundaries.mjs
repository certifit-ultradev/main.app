import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findUnsafeConsoleReferences } from './logging-rule.mjs';
import { findLayerImportViolations } from './layer-import-rule.mjs';
import { findLegacyHttpResponseViolations } from './http-response-rule.mjs';

const roots = ['application', 'interfaces', 'src/app/api'];
const serverRoots = ['actions', 'application', 'interfaces', 'repository', 'services', 'src/app/api'];
const forbidden = [
    { pattern: /from\s+['"]@\/utils\/(types|schemas)['"]/, message: 'contratos legacy de utils' },
    { pattern: /from\s+['"]@\/(models|repository)\//, message: 'modelo o repositorio de persistencia' },
];

const files = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? files(path) : Promise.resolve([path]);
    }))).flat();
};

const violations = [];
const loggingRoots = [
    'actions', 'application', 'components', 'config', 'exceptions', 'features',
    'infrastructure', 'interfaces', 'lib', 'mappers', 'models', 'prisma',
    'repository', 'services', 'shared', 'src', 'utils',
];
const loggingEntryFiles = (await readdir('.', { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
    .map((entry) => entry.name);
const cliFiles = new Set(['prisma/seed.ts']);
for (const file of [
    ...loggingEntryFiles,
    ...(await Promise.all(loggingRoots.map(files))).flat(),
]) {
    if (!/\.(ts|tsx)$/.test(file) || cliFiles.has(file)
        || /(^|\/)(__test__|__mocks__)(\/|$)|\.(test|spec)\.(ts|tsx)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    violations.push(...findUnsafeConsoleReferences(source, file));
}

for (const root of roots) {
    for (const file of await files(root)) {
        if (!/\.(ts|tsx)$/.test(file) || file.includes('__test__')) continue;
        const source = await readFile(file, 'utf8');
        for (const rule of forbidden) {
            if (rule.pattern.test(source)) violations.push(`${file}: ${rule.message}`);
        }
    }
}

for (const root of ['actions', 'repository', 'src/app/api']) {
    for (const file of await files(root)) {
        if (!/\.(ts|tsx)$/.test(file)) continue;
        const source = await readFile(file, 'utf8');
        violations.push(...findLayerImportViolations(source, file));
        violations.push(...findLegacyHttpResponseViolations(source, file));
    }
}

const clientOnlyEditorSchemaImport = /from\s+['"]@\/features\/courses\/editor\/editor-form\.schema\.client['"]/;
for (const root of serverRoots) {
    for (const file of await files(root)) {
        if (!/\.(ts|tsx)$/.test(file) || file.includes('__test__')) continue;
        const source = await readFile(file, 'utf8');
        if (clientOnlyEditorSchemaImport.test(source)) {
            violations.push(`${file}: schema de editor con File importado desde servidor`);
        }
    }
}

const studentDto = await readFile('application/courses/student-course.dto.ts', 'utf8');
if (/\b(isCorrect|correct|expectedAnswer|points)\b/.test(studentDto)) {
    violations.push('application/courses/student-course.dto.ts: solución interna expuesta al estudiante');
}

const studentReader = await readFile('repository/course-read.prisma.ts', 'utf8');
if (/userCourse\s*(?:\?)?\.\s*\[\s*0\s*\]/.test(studentReader)) {
    violations.push('repository/course-read.prisma.ts: la proyección de estudiante depende de userCourse[0]');
}

const courseWriteAction = await readFile('actions/courses/register.ts', 'utf8');
if (/(ModuleMapper|from\s+['"]@\/models\/|from\s+['"]@\/utils\/types['"])/.test(courseWriteAction)) {
    violations.push('actions/courses/register.ts: la action de cursos depende de mappers o modelos de persistencia');
}

for (const file of await files('actions/auth')) {
    if (!/\.ts$/.test(file) || file.includes('__test__')) continue;
    const source = await readFile(file, 'utf8');
    if (/ServerAction(?:Request|Response)|mapErrorToServerActionResponse/.test(source)) {
        violations.push(`${file}: action de identidad usa un contrato legacy`);
    }
}

const verificationAction = await readFile('actions/auth/verification-token.ts', 'utf8');
if (/(console\.(?:log|error|warn)|sendVerificationEmailWithToken)/.test(verificationAction)) {
    violations.push('actions/auth/verification-token.ts: el flujo público de verificación expone detalles internos');
}

const userRepository = await readFile('repository/users.ts', 'utf8');
if (/(bcrypt|\.hash\s*\()/.test(userRepository)) {
    violations.push('repository/users.ts: el hashing de contraseñas debe ocurrir antes de persistir');
}

const passwordResetRepository = await readFile('repository/password-reset-token.ts', 'utf8');
if (/(bcrypt|\.hash\s*\()/.test(passwordResetRepository)) {
    violations.push('repository/password-reset-token.ts: el hashing de contraseñas debe ocurrir antes de persistir');
}

const paymentService = await readFile('services/payments.ts', 'utf8');
if (/(from\s+['"]@\/utils\/url['"]|\bas\s+(?:number|string)\b)/.test(paymentService)) {
    violations.push('services/payments.ts: pagos no debe depender de utils/url ni convertir IDs mediante casts');
}

const serviceWrapper = await readFile('utils/service-wrapper.ts', 'utf8');
if (/from\s+['"]@\/(?:exceptions\/error-encoder|lib\/prisma|prisma\/)/.test(serviceWrapper)) {
    violations.push('utils/service-wrapper.ts: un helper neutral no puede conocer encoder HTTP ni Prisma');
}

const courseService = await readFile('services/courses.ts', 'utf8');
if (/from\s+['"]@\/repository\/courses['"][\s\S]*?(?:countCourseSales|sumCourseSalesByLastMonth|sumUsersByLastMonth|findUserCourses|findCourseByCanonicalId|findUserCourseByCanonicalId)/.test(courseService)) {
    violations.push('services/courses.ts: las lecturas de curso, matrícula y analítica deben usar puertos por propósito');
}

try {
    await readFile('repository/courses.ts', 'utf8');
    violations.push('repository/courses.ts: el repositorio monolítico legacy no debe reintroducirse');
} catch (error) {
    if (error?.code !== 'ENOENT') throw error;
}

for (const file of ['repository/course-read.prisma.ts', 'repository/course-analytics.prisma.ts', 'repository/payment-course-read.prisma.ts']) {
    const source = await readFile(file, 'utf8');
    if (/from\s+['"]@\/(?:services|actions|components)\//.test(source)) {
        violations.push(`${file}: un adaptador Prisma no puede depender de servicios, actions o componentes`);
    }
}

const blobUploadRoute = await readFile('src/app/api/blob-upload/route.ts', 'utf8');
if (/@vercel\/blob|handleUpload|console\.(?:log|error|warn)/.test(blobUploadRoute)) {
    violations.push('src/app/api/blob-upload/route.ts: la ruta Blob debe delegar el proveedor y no registrar payloads');
}

const blobUploadAdapter = await readFile('infrastructure/blob/vercel-client-upload.ts', 'utf8');
if (/from\s+['"]@\/(?:services|actions|components|repository)\//.test(blobUploadAdapter)) {
    violations.push('infrastructure/blob/vercel-client-upload.ts: el adaptador Blob no puede depender de capas de aplicación o UI');
}

for (const file of await files('repository')) {
    if (!/\.ts$/.test(file) || file.includes('__test__')) continue;
    const source = await readFile(file, 'utf8');
    if (/nodemailer|createTransport(?:er)?|smtp\.mailersend/i.test(source)) {
        violations.push(`${file}: un repositorio no puede conocer Nodemailer ni SMTP`);
    }
}

for (const file of await files('application')) {
    if (!/\.ts$/.test(file) || file.includes('__test__')) continue;
    const source = await readFile(file, 'utf8');
    if (/nodemailer|createTransport(?:er)?|smtp\.mailersend/i.test(source)) {
        violations.push(`${file}: los comandos y puertos de aplicación no pueden conocer SMTP`);
    }
}

const categoryRepository = await readFile('repository/categories.ts', 'utf8');
if (/(from\s+['"]@\/models\/course-category['"]|\bPartial\s*<|CourseCategoryData)/.test(categoryRepository)) {
    violations.push('repository/categories.ts: categorías debe usar records y comandos mínimos, no modelos ni patches amplios');
}

const adminUserDto = await readFile('application/users/user.dto.ts', 'utf8');
if (/^\s*password(?:Hash)?\s*:/im.test(adminUserDto)) {
    violations.push('application/users/user.dto.ts: un DTO administrativo no puede exponer credenciales');
}

for (const file of await files('actions/user')) {
    if (!/\.ts$/.test(file) || file.includes('__test__')) continue;
    const source = await readFile(file, 'utf8');
    if (/from\s+['"]@\/utils\/types['"]/.test(source)) {
        violations.push(`${file}: action de usuarios depende de DTOs legacy de utils`);
    }
}

for (const root of ['actions', 'application', 'repository', 'services']) {
    for (const file of await files(root)) {
        if (!/\.ts$/.test(file) || file.includes('__test__')) continue;
        const source = await readFile(file, 'utf8');
        if (/from\s+['"](?:@\/|\.\.?\/)+models\/(?:otp-verification|password-reset-token|verification-token)['"]/.test(source)) {
            violations.push(`${file}: identidad usa una clase-modelo de token u OTP en lugar de un record`);
        }
        if (/expiraton-token|generateExpirationToken|findVertificationTokenByEmail/.test(source)) {
            violations.push(`${file}: usa un identificador legacy de expiración o token`);
        }
    }
}

if (violations.length > 0) {
    throw new Error(`Violaciones de arquitectura:\n${violations.join('\n')}`);
}

console.log('Architecture boundaries check passed.');
