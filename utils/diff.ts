// utils/diffCourses.ts
import { CourseData, CourseModule, ModuleClass, QuestionOption, QuizModule, QuizQuestions } from "./types";

export type CourseElement =
  | CourseData
  | CourseModule
  | ModuleClass
  | QuizModule
  | QuizQuestions
  | QuestionOption;

export interface Change {
  type: string;
  action: "added" | "updated" | "deleted";
  path: { [key: string]: number | string | null };
  data?: CourseElement | Partial<CourseElement>;
}

function diff(
  original: any,
  modified: any,
  path: Record<string, number | string | null> = {},
  changes: Change[] = [],
  parentKey = ""
): Change[] {
  const currentType = getItemType(modified, parentKey);
  const currentPath = { ...path };

  // Asignar ID (o null) del elemento actual al path
  if (modified && modified.id !== undefined) {
    currentPath[currentType] = modified.id;
  } else if (currentType && currentPath[currentType] === undefined) {
    currentPath[currentType] = null;
  }

  /* ---------- 1. Arrays ---------- */
  if (Array.isArray(original) && Array.isArray(modified)) {
    const toMap = (arr: any[]) =>
      new Map(
        arr.map((item, idx) => [
          item.id !== undefined ? `id_${item.id}` : `index_${idx}`,
          item,
        ])
      );

    const originalMap = toMap(original);
    const modifiedMap = toMap(modified);

    // eliminados
    for (const [key, origItem] of originalMap.entries()) {
      if (!modifiedMap.has(key)) {
        changes.push({
          type: getItemType(origItem, parentKey),
          action: "deleted",
          path: {
            ...currentPath,
            [getItemType(origItem, parentKey)]: origItem.id ?? key,
          },
          data: origItem,
        });
      }
    }

    // añadidos / actualizados
    for (const [key, modItem] of modifiedMap.entries()) {
      const origItem = originalMap.get(key);
      const itemPath = {
        ...currentPath,
        [getItemType(modItem, parentKey)]: modItem.id ?? key,
      };

      if (!origItem) {
        changes.push({
          type: getItemType(modItem, parentKey),
          action: "added",
          path: itemPath,
          data: modItem,
        });
      } else {
        diff(origItem, modItem, itemPath, changes, parentKey);
      }
    }
  }

  /* ---------- 2. Objetos ---------- */
  else if (isObject(original) && isObject(modified)) {
    const keys = new Set([...Object.keys(original), ...Object.keys(modified)]);
    for (const key of keys) {
      if (key === "id") continue;

      const origValue = original[key];
      const modValue = modified[key];

      if (isObject(origValue) || Array.isArray(origValue)) {
        diff(origValue, modValue, currentPath, changes, key); // mantenemos key como parentKey
      } else if (origValue !== modValue) {
        changes.push({
          type: currentType,
          action: "updated",
          path: { ...currentPath, property: key },
          data: { [key]: modValue },
        });
      }
    }
  }

  return changes;
}

function getItemType(item: any, parentKey = ""): string {
  if (!item) return "unknown";

  // para arrays usamos el nombre del array singularizado
  if (Array.isArray(item)) return singularize(parentKey) || "unknownArray";

  // detección explícita
  if (item.modules) return "course";
  if (item.classes) return "module";
  if (item.questions) return "quiz";
  if ("video" in item || "videoPath" in item) return "class";
  if (item.options) return "question";

  if ("isCorrect" in item) return "option";

  return parentKey ? singularize(parentKey) : "unknown";
}

function singularize(key: string): string {
  const dict: Record<string, string> = {
    modules: "module",
    classes: "class",
    questions: "question",
    options: "option",
    quizzes: "quiz",
  };
  return dict[key] ?? key;
}

function isObject(o: any): o is Record<string, unknown> {
  return o && typeof o === "object" && !Array.isArray(o);
}

export function diffCourses(
  originalCourse: CourseData,
  modifiedCourse: CourseData
): Change[] {
  return diff(
    originalCourse,
    modifiedCourse,
    { course: originalCourse.id as number},
    [],
    "course"
  );
}
