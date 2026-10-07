import ts from 'typescript';

// These routes speak a third-party protocol, not this application's ApiResponse contract.
export const EXTERNAL_HTTP_PROTOCOL_ROUTES = Object.freeze({
    'src/app/api/auth/[...nextauth]/route.ts': 'NextAuth owns the session and callback responses.',
    'src/app/api/blob-upload/route.ts': 'Vercel Blob SDK requires its token/completion JSON protocol.',
    'src/app/api/payment/notifications/route.ts': 'Wompi webhook acknowledgement and retry statuses are provider-facing.',
});

/** Rejects literal legacy success flags in first-party API route response bodies. */
export function findLegacyHttpResponseViolations(source, file) {
    if (!file.startsWith('src/app/api/') || !file.endsWith('/route.ts')
        || Object.hasOwn(EXTERNAL_HTTP_PROTOCOL_ROUTES, file)) return [];

    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const violations = [];
    const visit = (node) => {
        if (ts.isObjectLiteralExpression(node)) {
            const flag = node.properties.find((property) => ts.isPropertyAssignment(property)
                && (property.name?.getText(tree) === 'success' || property.name?.getText(tree) === '"success"'
                    || property.name?.getText(tree) === "'success'"));
            if (flag && ts.isPropertyAssignment(flag)
                && (flag.initializer.kind === ts.SyntaxKind.TrueKeyword || flag.initializer.kind === ts.SyntaxKind.FalseKeyword)) {
                violations.push(`${file}: respuesta HTTP propia con bandera legacy success; usar ApiSuccess/ApiFailure`);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(tree);
    return violations;
}
