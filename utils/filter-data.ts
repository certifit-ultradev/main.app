export function cleanData<T extends object>(data: Partial<T>): Partial<T> {
    const cleaned: Partial<T> = {};
    for (const key in data) {
        const value = data[key];
        if (value && typeof value === 'string' && value.trim() === '') {
            // Si es una cadena vacía, no lo copiamos
            continue;
        }
        if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
        }
    }
    return cleaned;
}