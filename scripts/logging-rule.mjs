import ts from 'typescript';

const SAFE_LOGGER_FILE = 'shared/observability/safe-logger.ts';

const isGlobalConsole = (node) => {
    if (ts.isIdentifier(node)) return node.text === 'console';
    if (ts.isPropertyAccessExpression(node)) {
        return ts.isIdentifier(node.expression)
            && (node.expression.text === 'globalThis' || node.expression.text === 'window')
            && node.name.text === 'console';
    }
    if (ts.isElementAccessExpression(node)) {
        return ts.isIdentifier(node.expression)
            && (node.expression.text === 'globalThis' || node.expression.text === 'window')
            && ts.isStringLiteralLike(node.argumentExpression)
            && node.argumentExpression.text === 'console';
    }
    return false;
};

const consoleMethod = (node) => {
    if (ts.isPropertyAccessExpression(node) && isGlobalConsole(node.expression)) {
        return node.name.text;
    }
    if (ts.isElementAccessExpression(node) && isGlobalConsole(node.expression)) {
        return ts.isStringLiteralLike(node.argumentExpression)
            ? node.argumentExpression.text
            : '[dynamic]';
    }
    return null;
};

/** Finds direct console access without matching comments or string literals. */
export const findUnsafeConsoleReferences = (source, filePath) => {
    const normalizedPath = filePath.replaceAll('\\', '/').replace(/^\.\//, '');
    const sourceFile = ts.createSourceFile(
        normalizedPath,
        source,
        ts.ScriptTarget.Latest,
        true,
        normalizedPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const violations = [];

    const visit = (node) => {
        const method = consoleMethod(node);
        if (method !== null && !(normalizedPath === SAFE_LOGGER_FILE && method === 'error')) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            violations.push(`${normalizedPath}:${line + 1}:${character + 1}: uso directo de console.${method}; usa safeLogger`);
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return violations;
};
