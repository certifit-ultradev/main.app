import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';

const isWithin = (path, root) => path === root || path.startsWith(`${root}/`);
const isProductionSource = (file) => /\.(ts|tsx)$/.test(file)
    && !/(^|\/)(__test__|__mocks__)(\/|$)|\.(test|spec)\.(ts|tsx)$/.test(file);

const normalizeSpecifier = (file, specifier) => {
    if (specifier.startsWith('@/')) return specifier.slice(2);
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) return null;
    return relative(process.cwd(), resolve(dirname(resolve(file)), specifier)).replaceAll('\\', '/');
};

const moduleSpecifiers = (source, file) => {
    const syntax = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, syntax);
    const references = [];
    const visit = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
            && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            references.push(node.moduleSpecifier.text);
        }
        if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)
            && node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) {
            references.push(node.moduleReference.expression.text);
        }
        if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])
            && (node.expression.kind === ts.SyntaxKind.ImportKeyword
                || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
            references.push(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
    };
    visit(tree);
    return references;
};

export function findLayerImportViolations(source, file) {
    if (!isProductionSource(file)) return [];
    const violations = [];
    for (const specifier of moduleSpecifiers(source, file)) {
        const target = normalizeSpecifier(file, specifier);
        if (!target) continue;

        if (isWithin(file, 'src/app/api') && (
            isWithin(target, 'models') || isWithin(target, 'repository') || isWithin(target, 'mappers')
            || isWithin(target, 'lib/prisma') || isWithin(target, 'prisma')
        )) {
            violations.push(`${file}: ruta API importa persistencia (${specifier})`);
        }
        if (isWithin(file, 'actions') && (
            isWithin(target, 'models') || isWithin(target, 'repository') || isWithin(target, 'mappers')
            || isWithin(target, 'lib/prisma') || isWithin(target, 'prisma')
        )) {
            violations.push(`${file}: action importa persistencia (${specifier})`);
        }
        if (isWithin(file, 'repository')) {
            if (['services', 'actions', 'components', 'features', 'interfaces', 'src/app'].some((root) => isWithin(target, root))) {
                violations.push(`${file}: repositorio importa una capa superior o contrato de UI (${specifier})`);
            }
            if (isWithin(target, 'models')) {
                violations.push(`${file}: repositorio expone una clase de models (${specifier})`);
            }
        }
    }
    return violations;
}
