export function profileInitials(name: string, lastName: string): string {
    const first = Array.from(name.trim())[0] ?? '';
    const surname = Array.from(lastName.trim())[0] ?? '';
    return `${first}${surname}`.toLocaleUpperCase('es-CO') || '?';
}
