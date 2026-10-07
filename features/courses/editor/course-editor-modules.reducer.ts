import type {
    CourseEditorClass,
    CourseEditorModule,
    CourseEditorOption,
    CourseEditorQuestion,
} from './course-editor-form.types';

let sequence = 0;
const nextKey = (kind: string) => `${kind}-${++sequence}`;

const option = (isCorrect = false): CourseEditorOption => ({ clientKey: nextKey('option'), value: '', isCorrect });
const question = (): CourseEditorQuestion => ({
    clientKey: nextKey('question'), type: 'multiple', title: '', points: 0,
    options: [option(true), option()],
});
const courseClass = (): CourseEditorClass => ({ clientKey: nextKey('class'), title: '', description: '', video: null });

export const createEditorModule = (): CourseEditorModule => ({
    clientKey: nextKey('module'),
    title: '',
    minRequiredPoints: 0,
    classes: [courseClass()],
    quiz: { clientKey: nextKey('quiz'), title: '', description: '', questions: [] },
});

export const hydrateEditorModules = (modules: CourseEditorModule[]): CourseEditorModule[] => modules.map((module) => ({
    ...module,
    clientKey: module.clientKey ?? (module.id ? `module-${module.id}` : nextKey('module')),
    classes: module.classes.map((lesson) => ({
        ...lesson,
        clientKey: lesson.clientKey ?? (lesson.id ? `class-${lesson.id}` : nextKey('class')),
    })),
    quiz: {
        ...module.quiz,
        clientKey: module.quiz.clientKey ?? (module.quiz.id ? `quiz-${module.quiz.id}` : nextKey('quiz')),
        questions: module.quiz.questions.map((item): CourseEditorQuestion => {
            const base = {
                id: item.id,
                clientKey: item.clientKey ?? (item.id ? `question-${item.id}` : nextKey('question')),
                title: item.title,
                points: item.points,
            };
            return item.type === 'text'
                ? { ...base, type: 'text', expectedAnswer: { ...item.expectedAnswer } }
                : {
                    ...base,
                    type: 'multiple',
                    options: item.options.map((itemOption) => ({
                        ...itemOption,
                        clientKey: itemOption.clientKey ?? (itemOption.id ? `option-${itemOption.id}` : nextKey('option')),
                    })),
                };
        }),
    },
}));

export type CourseEditorModulesAction =
    | { type: 'hydrate'; modules: CourseEditorModule[] }
    | { type: 'addModule' }
    | { type: 'removeModule'; moduleIndex: number }
    | { type: 'updateModule'; moduleIndex: number; patch: Partial<Pick<CourseEditorModule, 'title' | 'minRequiredPoints'>> }
    | { type: 'addClass'; moduleIndex: number }
    | { type: 'removeClass'; moduleIndex: number; classIndex: number }
    | { type: 'updateClass'; moduleIndex: number; classIndex: number; patch: Partial<CourseEditorClass> }
    | { type: 'updateQuiz'; moduleIndex: number; patch: Partial<Pick<CourseEditorModule['quiz'], 'title' | 'description'>> }
    | { type: 'addQuestion'; moduleIndex: number }
    | { type: 'removeQuestion'; moduleIndex: number; questionIndex: number }
    | { type: 'updateQuestion'; moduleIndex: number; questionIndex: number; patch: Partial<Pick<CourseEditorQuestion, 'title' | 'points'>> }
    | { type: 'changeQuestionType'; moduleIndex: number; questionIndex: number; questionType: CourseEditorQuestion['type'] }
    | { type: 'updateExpectedAnswer'; moduleIndex: number; questionIndex: number; value: string }
    | { type: 'addOption'; moduleIndex: number; questionIndex: number }
    | { type: 'removeOption'; moduleIndex: number; questionIndex: number; optionIndex: number }
    | { type: 'updateOption'; moduleIndex: number; questionIndex: number; optionIndex: number; patch: Partial<Pick<CourseEditorOption, 'value' | 'isCorrect'>> };

const updateModuleAt = (modules: CourseEditorModule[], moduleIndex: number, transform: (module: CourseEditorModule) => CourseEditorModule) =>
    modules.map((module, index) => index === moduleIndex ? transform(module) : module);

export function courseEditorModulesReducer(
    modules: CourseEditorModule[],
    action: CourseEditorModulesAction,
): CourseEditorModule[] {
    switch (action.type) {
        case 'hydrate': return hydrateEditorModules(action.modules);
        case 'addModule': return [...modules, createEditorModule()];
        case 'removeModule': return modules.filter((_, index) => index !== action.moduleIndex);
        case 'updateModule': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, ...action.patch }));
        case 'addClass': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, classes: [...module.classes, courseClass()] }));
        case 'removeClass': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, classes: module.classes.filter((_, index) => index !== action.classIndex) }));
        case 'updateClass': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, classes: module.classes.map((lesson, index) => index === action.classIndex ? { ...lesson, ...action.patch } : lesson) }));
        case 'updateQuiz': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, ...action.patch } }));
        case 'addQuestion': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, questions: [...module.quiz.questions, question()] } }));
        case 'removeQuestion': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, questions: module.quiz.questions.filter((_, index) => index !== action.questionIndex) } }));
        case 'updateQuestion': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, questions: module.quiz.questions.map((item, index) => index === action.questionIndex ? { ...item, ...action.patch } : item) } }));
        case 'changeQuestionType': return updateModuleAt(modules, action.moduleIndex, (module) => ({
            ...module,
            quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((item, index): CourseEditorQuestion => {
                    if (index !== action.questionIndex || item.type === action.questionType) return item;
                    const base = { id: item.id, clientKey: item.clientKey, title: item.title, points: item.points };
                    return action.questionType === 'text'
                        ? { ...base, type: 'text', expectedAnswer: { value: '' } }
                        : { ...base, type: 'multiple', options: [option(true), option()] };
                }),
            },
        }));
        case 'updateExpectedAnswer': return updateModuleAt(modules, action.moduleIndex, (module) => ({
            ...module,
            quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((item, index): CourseEditorQuestion =>
                    index === action.questionIndex && item.type === 'text'
                        ? { ...item, expectedAnswer: { ...item.expectedAnswer, value: action.value } }
                        : item),
            },
        }));
        case 'addOption': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, questions: module.quiz.questions.map((item, index) => index === action.questionIndex && item.type === 'multiple' ? { ...item, options: [...item.options, option()] } : item) } }));
        case 'removeOption': return updateModuleAt(modules, action.moduleIndex, (module) => ({ ...module, quiz: { ...module.quiz, questions: module.quiz.questions.map((item, index) => index === action.questionIndex && item.type === 'multiple' ? { ...item, options: item.options.filter((_, optionIndex) => optionIndex !== action.optionIndex) } : item) } }));
        case 'updateOption': return updateModuleAt(modules, action.moduleIndex, (module) => ({
            ...module,
            quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((item, index) => {
                    if (index !== action.questionIndex || item.type !== 'multiple') return item;
                    const options = item.options.map((itemOption, optionIndex) => optionIndex === action.optionIndex
                        ? { ...itemOption, ...action.patch }
                        : action.patch.isCorrect ? { ...itemOption, isCorrect: false } : itemOption);
                    return { ...item, options };
                }),
            },
        }));
    }
}
