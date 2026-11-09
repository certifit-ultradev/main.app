/** Pure string normalization; it is not tied to a course or framework. */
export const toSnakeCase = (text: string): string => text.toLowerCase().replace(/\s+/g, '_');
