export class ProfileImageInvalidError extends Error {
    constructor() {
        super('La foto de perfil no es válida.');
        this.name = 'ProfileImageInvalidError';
    }
}
