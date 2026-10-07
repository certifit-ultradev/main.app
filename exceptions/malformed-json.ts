/** Thrown when an HTTP route cannot parse a request body as JSON. */
export class MalformedJsonError extends Error {
    constructor() {
        super('El cuerpo de la solicitud no contiene JSON válido');
        this.name = 'MalformedJsonError';
    }
}
