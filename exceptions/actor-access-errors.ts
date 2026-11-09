/** An authenticated actor must verify their email before using this endpoint. */
export class EmailUnverifiedError extends Error {
    constructor() {
        super('El correo electrónico debe estar verificado.');
        this.name = 'EmailUnverifiedError';
    }
}

/** An authenticated actor lacks the required role. */
export class InsufficientRoleError extends Error {
    constructor() {
        super('No tienes permisos para esta operación.');
        this.name = 'InsufficientRoleError';
    }
}
