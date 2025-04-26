import { ClassViewed, CourseModule, ModuleClass, RemapedClass, RemapedCourse } from "./types";

/**
 * Retorna el último registro de cada classId,
 * pero si en la lista de registros de esa clase
 * hay alguno con completed = true, se fuerza completed = true.
 *
 * @param {Array} records - Array de objetos con {classId, completed, createdAt, ...}
 * @returns {Array} - Un arreglo con un objeto final por cada classId
 */
export function getLastRecordByClass(records) {
    // 1. Agrupamos los registros por classId
    const grouped = {};
    for (const rec of records) {
        const cId = rec.classId;
        if (!grouped[cId]) grouped[cId] = [];
        grouped[cId].push(rec);
    }
    // 2. Para cada grupo (classId), hallamos el "último" registro
    //    según la fecha (createdAt o updatedAt).
    //    Si hay al menos un `completed = true`, se lo establecemos al último registro.
    const result = [];
    for (const classId of Object.keys(grouped)) {
        let group = grouped[classId];

        // Ordena asc por la fecha, o updatedAt si prefieres
        group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        // Tomamos el último
        const last = { ...group[group.length - 1] };
        // Si ANY en la clase está completado => forzamos last.completed = true
        if (group.some((item) => item.isCompleted)) {
            last.isCompleted = true;
        }

        // Agregamos al resultado final
        result.push(last);
    }

    return result;
}

const typeToPathKey = {
    course: 'course',
    category: 'category',
    module: 'module',
    class: 'class',
    quiz: 'quiz',
    question: 'question',
    option: 'option'
};


export function mergeChangesByTypeAndId(changes) {
    // Objeto de resultado
    const grouped = {};

    for (const item of changes) {
        const { type, path, data } = item;

        // Averiguamos cuál es la clave en `path` que contiene el ID:
        const pathKey = typeToPathKey[type];
        if (!pathKey) {
            // Si no está mapeado, lo ignoras o lo manejas de otra manera
            continue;
        }

        // Obtenemos el id correspondiente (por ejemplo, path.option para type 'option')
        const id = path[pathKey];
        if (!id) {
            // Podría pasar si no hay un ID, o es undefined
            continue;
        }

        // Aseguramos que exista la "sección" para este type en grouped
        if (!grouped[type]) {
            grouped[type] = {};
        }

        // Aseguramos que exista el objeto para este ID
        if (!grouped[type][id]) {
            grouped[type][id] = {};
        }

        // Hacemos merge de las propiedades de data en el objeto
        // Por ejemplo: { text: 'Eius anim ' } se fusiona con lo que ya hubiera
        Object.assign(grouped[type][id], data);
    }

    return grouped;
}

export function getCourseProgress(course: RemapedCourse) {
    if (course.modules == undefined) {
        return;
    }    

    // Aplanar las clases
    const allClasses = course.modules.flatMap((mod: CourseModule) => mod.classes);
    

    // Crear un mapa para saber qué clases están completadas
    const viewedMap = new Map();
    course.classViewed?.forEach((cv: ClassViewed) => {
        viewedMap.set(cv.classId, cv.completed);
    });

    // Combinar la info
    const classesWithCompletion = allClasses.map<RemapedClass>((cls: ModuleClass|undefined) => {
        return {
            id: cls?.id,
            title: cls?.title,
            completed: viewedMap.get(cls?.id) || false,
        }
    });

    const totalClasses = classesWithCompletion.length;
    const completedClasses = classesWithCompletion.filter((c) => c.completed).length;

    // Progreso en porcentaje
    const progressPercent = Math.round((completedClasses / totalClasses) * 100);

    // currentIndex = primera clase NO completada, o la última si todas están completadas
    let currentIndex = classesWithCompletion.findIndex((c) => !c.completed);
    if (currentIndex === -1) {
        // todas completadas => tomar la última
        currentIndex = totalClasses - 1;
    }

    // Lógica para "mostrar la actual + la siguiente" o "si es última, mostrar la anterior + la actual"
    let visibleClasses = [];
    if (totalClasses <= 1) {
        // Edge case: solo 1 clase
        visibleClasses = classesWithCompletion;
    } else if (currentIndex === totalClasses - 1) {
        // actual es la última
        const start = Math.max(0, currentIndex - 1); // asegurarnos de no salirse de índice
        visibleClasses = classesWithCompletion.slice(start, currentIndex + 1);
    } else {
        // actual no es la última => actual + siguiente
        visibleClasses = classesWithCompletion.slice(currentIndex, currentIndex + 2);
    }

    console.log(classesWithCompletion);

    return {
        classesWithCompletion, // Todas las clases (para cálculo de %)
        visibleClasses,        // Solo las 2 que vamos a mostrar
        progressPercent,
        currentIndex,
        totalClasses,
    };
}

export function toSnakeCase(text: string): string {
    return text
        .toLowerCase()      // pasa todo a minúsculas
        .replace(/\s+/g, '_'); // reemplaza uno o más espacios por "_"
}