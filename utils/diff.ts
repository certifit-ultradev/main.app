import { CourseData } from "./types";

export interface Change {
    type: string;         // Tipo de elemento que cambió
    action: string;       // 'added', 'updated', 'deleted'
    path: { [key: string]: number | string }; // Objeto con tipos como claves y IDs o propiedades como valores
    data?: any;           // Datos del elemento modificado
}

function diff(
    original: any,
    modified: any,
    path: { [key: string]: number | string | null } = {},
    changes: Change[] = [],
    parentKey: string = ''
): Change[] {
    const currentType = getItemType(modified, parentKey);
    let currentPath = { ...path };

    if (modified && modified.id !== undefined) {
        currentPath[currentType] = modified.id;
    } else if (currentType && !currentPath[currentType]) {
        currentPath[currentType] = null;
    }

    if (Array.isArray(original) && Array.isArray(modified)) {
        const originalMap = new Map();
        original.forEach((item: any, index: number) => {
            const key = item.id !== undefined ? `id_${item.id}` : `index_${index}`;
            originalMap.set(key, item);
        });

        const modifiedMap = new Map();
        modified.forEach((item: any, index: number) => {
            const key = item.id !== undefined ? `id_${item.id}` : `index_${index}`;
            modifiedMap.set(key, item);
        });

        // Detectar elementos eliminados
        for (const [key, origItem] of originalMap.entries()) {
            if (!modifiedMap.has(key)) {
                changes.push({
                    type: getItemType(origItem, parentKey),
                    action: 'deleted',
                    path: {
                        ...currentPath,
                        [getItemType(origItem, parentKey)]: origItem.id !== undefined ? origItem.id : key,
                    },
                    data: origItem,
                });
            }
        }

        // Detectar elementos agregados y actualizados
        for (const [key, modItem] of modifiedMap.entries()) {
            const origItem = originalMap.get(key);
            const itemPath = { ...currentPath };
            if (modItem.id !== undefined) {
                itemPath[getItemType(modItem, parentKey)] = modItem.id;
            } else {
                itemPath[getItemType(modItem, parentKey)] = key;
            }

            if (!origItem) {
                changes.push({
                    type: getItemType(modItem, parentKey),
                    action: 'added',
                    path: itemPath,
                    data: modItem,
                });
            } else {
                diff(origItem, modItem, itemPath, changes);
            }
        }
    } else if (isObject(original) && isObject(modified)) {
        const keys = new Set([...Object.keys(original), ...Object.keys(modified)]);
        for (const key of keys) {
            if (key === 'id') continue; // Ignorar el campo 'id'
            const origValue = original[key];
            const modValue = modified[key];

            if (isObject(origValue) || Array.isArray(origValue)) {
                diff(origValue, modValue, currentPath, changes, key);
            } else if (origValue !== modValue) {
                const propPath = { ...currentPath, property: key };
                changes.push({
                    type: currentType,
                    action: 'updated',
                    path: propPath,
                    data: { [key]: modValue },
                });
            }
        }
    }

    return changes;
}


function getItemType(item: any, parentKey: string = ''): string {
    if (!item) return 'unknown';

    if (Array.isArray(item)) {
        if (parentKey) {
            return singularize(parentKey);
        } else if (item.length > 0) {
            return getItemType(item[0]);
        } else {
            return 'unknownArray';
        }
    }

    if (item.hasOwnProperty('modules')) return 'course';
    if (item.hasOwnProperty('classes')) return 'module';
    if (item.hasOwnProperty('questions')) return 'quiz';
    if (item.hasOwnProperty('video') || item.hasOwnProperty('videoPath')) return 'class';
    if (item.hasOwnProperty('options')) return 'question';
    if (item.hasOwnProperty('correct')) return 'option';
    return parentKey || 'unknown';
}

function singularize(key: string): string {
    const singulars: { [key: string]: string } = {
        'modules': 'module',
        'classes': 'class',
        'questions': 'question',
        'options': 'option',
        'quizzes': 'quiz',
    };
    return singulars[key] || key;
}

function isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

export function diffCourses(originalCourse: CourseData, modifiedCourse: CourseData): Change[] {
    const changes: Change[] = [];
    diff(
        originalCourse,
        modifiedCourse,
        { course: originalCourse.id },
        changes,
        'course'
    );
    return changes;
}