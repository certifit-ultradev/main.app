import { 
    ClassMapper, 
    OptionMapper, 
    QuestionMapper, 
    QuizMapper, 
    ModuleMapper, 
    CourseMapper 
} from "@/mappers/course-mapper";
import { ModuleClass } from "@/models/module-class";
import { PossibleAnswerQuestion } from "@/models/possible-answer-question";
import { QuizQuestion } from "@/models/quiz-question";
import { ModuleQuiz } from "@/models/module-quiz";
import { CourseModules } from "@/models/course-modules";
import { Course } from "@/models/course";
import { UserCourse } from "@/models/user-course";

// Mock de dependencias
jest.mock("@/utils/video", () => ({
    calculateTotalVideoDuration: jest.fn().mockReturnValue(3600),
    formatVideoDuration: jest.fn().mockReturnValue("1:00:00"),
}));

jest.mock("@/utils/classes", () => ({
    getCourseProgress: jest.fn().mockReturnValue({
        classesWithCompletion: [],
        visibleClasses: [],
        progressPercent: 50,
        currentIndex: 2,
        totalClasses: 10,
    }),
}));

describe('Course Mappers', () => {
    describe('ClassMapper', () => {
        const mockClass: ModuleClass = {
            id: 1,
            courseModuleId: 10,
            title: 'Clase de prueba',
            description: 'Descripción de la clase',
            videoPath: '/videos/clase1.mp4',
            videoDuration: 600,
            videoSize: 1024000,
        };

        describe('toDTO', () => {
            test('debería convertir ModuleClass a DTO correctamente', () => {
                const result = ClassMapper.toDTO(mockClass);

                expect(result).toEqual({
                    id: 1,
                    courseModuleId: 10,
                    title: 'Clase de prueba',
                    description: 'Descripción de la clase',
                    video: '/videos/clase1.mp4',
                    videoDuration: 600,
                    videoSize: 1024000,
                });
            });

            test('debería mapear videoPath a video', () => {
                const result = ClassMapper.toDTO(mockClass);
                
                expect(result.video).toBe(mockClass.videoPath);
            });
        });

        describe('toDTOArray', () => {
            test('debería convertir array de clases', () => {
                const classes = [mockClass, { ...mockClass, id: 2, title: 'Clase 2' }];

                const result = ClassMapper.toDTOArray(classes);

                expect(result).toHaveLength(2);
                expect(result?.[0].id).toBe(1);
                expect(result?.[1].id).toBe(2);
            });

            test('debería retornar undefined para null', () => {
                const result = ClassMapper.toDTOArray(null);

                expect(result).toBeUndefined();
            });

            test('debería retornar undefined para undefined', () => {
                const result = ClassMapper.toDTOArray(undefined);

                expect(result).toBeUndefined();
            });

            test('debería retornar array vacío para array vacío', () => {
                const result = ClassMapper.toDTOArray([]);

                expect(result).toEqual([]);
            });
        });
    });

    describe('OptionMapper', () => {
        const mockOption: PossibleAnswerQuestion = {
            id: 1,
            questionId: 5,
            value: 'Respuesta A',
            isCorrect: true,
        };

        describe('toDTO', () => {
            test('debería convertir opción correctamente', () => {
                const result = OptionMapper.toDTO(mockOption);

                expect(result).toEqual({
                    id: 1,
                    quizQuestionId: 5,
                    value: 'Respuesta A',
                    isCorrect: true,
                });
            });

            test('debería ocultar respuesta correcta cuando hideCorrectAnswer es true', () => {
                const result = OptionMapper.toDTO(mockOption, true);

                expect(result.isCorrect).toBe(false);
                expect(result.value).toBe('Respuesta A');
            });
        });

        describe('toDTOHidden', () => {
            test('debería ocultar valor para preguntas de tipo texto', () => {
                const result = OptionMapper.toDTOHidden(mockOption, 'text');

                expect(result.value).toBe('');
                expect(result.isCorrect).toBe(false);
            });

            test('debería mantener valor para preguntas multiple', () => {
                const result = OptionMapper.toDTOHidden(mockOption, 'multiple');

                expect(result.value).toBe('Respuesta A');
                expect(result.isCorrect).toBe(false);
            });
        });

        describe('toDTOArray', () => {
            test('debería convertir array de opciones', () => {
                const options = [
                    mockOption,
                    { ...mockOption, id: 2, value: 'Respuesta B', isCorrect: false }
                ];

                const result = OptionMapper.toDTOArray(options);

                expect(result).toHaveLength(2);
            });

            test('debería ocultar respuestas cuando hideCorrect es true', () => {
                const options = [mockOption];

                const result = OptionMapper.toDTOArray(options, true);

                expect(result?.[0].isCorrect).toBe(false);
            });

            test('debería retornar undefined para null', () => {
                expect(OptionMapper.toDTOArray(null)).toBeUndefined();
            });
        });
    });

    describe('QuestionMapper', () => {
        const mockQuestion: QuizQuestion = {
            id: 1,
            quizId: 10,
            title: '¿Cuál es la respuesta correcta?',
            type: 'multiple',
            points: 10,
            possibleAnswerQuestion: [
                { id: 1, questionId: 1, value: 'A', isCorrect: true },
                { id: 2, questionId: 1, value: 'B', isCorrect: false },
            ],
        };

        describe('toDTO', () => {
            test('debería convertir pregunta correctamente', () => {
                const result = QuestionMapper.toDTO(mockQuestion);

                expect(result).toEqual({
                    id: 1,
                    quizModuleId: 10,
                    title: '¿Cuál es la respuesta correcta?',
                    type: 'multiple',
                    points: 10,
                    options: expect.arrayContaining([
                        expect.objectContaining({ id: 1, isCorrect: true }),
                        expect.objectContaining({ id: 2, isCorrect: false }),
                    ]),
                });
            });

            test('debería ocultar respuestas cuando hideAnswers es true', () => {
                const result = QuestionMapper.toDTO(mockQuestion, true);

                expect(result.options?.[0].isCorrect).toBe(false);
                expect(result.options?.[1].isCorrect).toBe(false);
            });

            test('debería ocultar valor de texto cuando hideAnswers es true y tipo es text', () => {
                const textQuestion = { ...mockQuestion, type: 'text' };

                const result = QuestionMapper.toDTO(textQuestion, true);

                expect(result.options?.[0].value).toBe('');
            });
        });

        describe('toDTOArray', () => {
            test('debería convertir array de preguntas', () => {
                const questions = [mockQuestion, { ...mockQuestion, id: 2 }];

                const result = QuestionMapper.toDTOArray(questions);

                expect(result).toHaveLength(2);
            });

            test('debería retornar undefined para null', () => {
                expect(QuestionMapper.toDTOArray(null)).toBeUndefined();
            });
        });
    });

    describe('QuizMapper', () => {
        const mockQuiz: ModuleQuiz = {
            id: 1,
            courseModuleId: 5,
            title: 'Quiz del módulo',
            description: 'Descripción del quiz',
            quizQuestion: [
                {
                    id: 1,
                    quizId: 1,
                    title: 'Pregunta 1',
                    type: 'multiple',
                    points: 10,
                    possibleAnswerQuestion: [],
                },
            ],
        };

        describe('toDTO', () => {
            test('debería convertir quiz correctamente', () => {
                const result = QuizMapper.toDTO(mockQuiz);

                expect(result).toEqual({
                    id: 1,
                    courseModuleId: 5,
                    title: 'Quiz del módulo',
                    description: 'Descripción del quiz',
                    questions: expect.any(Array),
                });
            });

            test('debería retornar undefined para quiz undefined', () => {
                const result = QuizMapper.toDTO(undefined);

                expect(result).toBeUndefined();
            });

            test('debería manejar descripción null', () => {
                const quizWithoutDesc = { ...mockQuiz, description: '' };

                const result = QuizMapper.toDTO(quizWithoutDesc);

                expect(result?.description).toBe('');
            });
        });

        describe('fromArrayToDTO', () => {
            test('debería tomar el primer quiz del array', () => {
                const quizzes = [mockQuiz, { ...mockQuiz, id: 2 }];

                const result = QuizMapper.fromArrayToDTO(quizzes);

                expect(result?.id).toBe(1);
            });

            test('debería retornar undefined para array vacío', () => {
                const result = QuizMapper.fromArrayToDTO([]);

                expect(result).toBeUndefined();
            });

            test('debería retornar undefined para null', () => {
                const result = QuizMapper.fromArrayToDTO(null);

                expect(result).toBeUndefined();
            });
        });
    });

    describe('ModuleMapper', () => {
        const mockModule: CourseModules = {
            id: 1,
            courseId: 100,
            title: 'Módulo 1',
            minRequiredPoints: 70,
            moduleClass: [
                {
                    id: 1,
                    courseModuleId: 1,
                    title: 'Clase 1',
                    description: 'Desc',
                    videoPath: '/video.mp4',
                    videoDuration: 300,
                    videoSize: 1000,
                },
            ],
            moduleQuiz: [
                {
                    id: 1,
                    courseModuleId: 1,
                    title: 'Quiz 1',
                    description: 'Quiz desc',
                    quizQuestion: [],
                },
            ],
        };

        describe('toDTO', () => {
            test('debería convertir módulo correctamente', () => {
                const result = ModuleMapper.toDTO(mockModule);

                expect(result).toEqual({
                    id: 1,
                    courseId: 100,
                    title: 'Módulo 1',
                    minRequiredPoints: 70,
                    classes: expect.any(Array),
                    quiz: expect.objectContaining({ id: 1 }),
                });
            });

            test('debería ocultar respuestas del quiz cuando hideQuizAnswers es true', () => {
                const result = ModuleMapper.toDTO(mockModule, { hideQuizAnswers: true });

                expect(result.quiz).toBeDefined();
            });
        });

        describe('toDTOWithoutQuiz', () => {
            test('debería convertir módulo sin quiz', () => {
                const result = ModuleMapper.toDTOWithoutQuiz(mockModule);

                expect(result.quiz).toBeUndefined();
                expect(result.classes).toBeDefined();
            });
        });

        describe('toDTOArray', () => {
            test('debería convertir array de módulos', () => {
                const modules = [mockModule, { ...mockModule, id: 2 }];

                const result = ModuleMapper.toDTOArray(modules);

                expect(result).toHaveLength(2);
            });

            test('debería excluir quiz cuando excludeQuiz es true', () => {
                const result = ModuleMapper.toDTOArray([mockModule], { excludeQuiz: true });

                expect(result?.[0].quiz).toBeUndefined();
            });

            test('debería retornar undefined para null', () => {
                expect(ModuleMapper.toDTOArray(null)).toBeUndefined();
            });

            test('debería retornar undefined para undefined', () => {
                expect(ModuleMapper.toDTOArray(undefined)).toBeUndefined();
            });
        });
    });

    describe('CourseMapper', () => {
        const mockCourse: Course = {
            id: 1,
            canonicalId: 'curso-test',
            title: 'Curso de Prueba',
            price: 99.99,
            courseImage: '/img/course.jpg',
            instructorName: 'John Doe',
            instructorPhoto: '/img/instructor.jpg',
            category: { id: 1, name: 'Tecnología' },
            description: 'Descripción del curso',
            expiresAt: new Date('2025-12-31'),
            isActive: true,
            categoryId: 1,
            courseModules: [],
            userCourse: [],
            deleted: false,
            createdAt: new Date(),
        };

        describe('toPlainData', () => {
            test('debería convertir curso a datos públicos', () => {
                const result = CourseMapper.toPlainData(mockCourse);

                expect(result).toEqual({
                    id: 1,
                    canonicalId: 'curso-test',
                    title: 'Curso de Prueba',
                    price: 99.99,
                    courseImage: '/img/course.jpg',
                    courseDuration: '1:00:00',
                    instructorName: 'John Doe',
                    instructorPhoto: '/img/instructor.jpg',
                    category: { id: 1, name: 'Tecnología' },
                    description: 'Descripción del curso',
                    expiresAt: mockCourse.expiresAt,
                    alreadyPurchased: false,
                });
            });

            test('debería marcar como comprado cuando isAlreadyPurchased es true', () => {
                const result = CourseMapper.toPlainData(mockCourse, true);

                expect(result.alreadyPurchased).toBe(true);
            });
        });

        describe('fromUserCourseToPublicData', () => {
            const mockUserCourse: UserCourse = {
                id: 1,
                userId: 'user-123',
                courseId: 1,
                course: mockCourse,
                userClassesState: [],
                userModuleState: [],
                completedAt: null,
            };

            test('debería convertir UserCourse a datos públicos con progreso', () => {
                const result = CourseMapper.fromUserCourseToPublicData(mockUserCourse);

                expect(result).toMatchObject({
                    canonicalId: 'curso-test',
                    title: 'Curso de Prueba',
                    progressPercent: 50,
                    currentIndex: 2,
                    totalClasses: 10,
                });
            });

            test('debería lanzar error si no hay curso asociado', () => {
                const userCourseWithoutCourse = { ...mockUserCourse, course: undefined };

                expect(() => CourseMapper.fromUserCourseToPublicData(userCourseWithoutCourse as UserCourse))
                    .toThrow('UserCourse does not have associated course data');
            });

            test('debería manejar valores vacíos del curso', () => {
                const courseWithEmptyValues = {
                    ...mockCourse,
                    canonicalId: '',
                    title: '',
                    description: '',
                };
                const userCourse = { ...mockUserCourse, course: courseWithEmptyValues };

                const result = CourseMapper.fromUserCourseToPublicData(userCourse);

                expect(result.canonicalId).toBe('');
                expect(result.title).toBe('');
                expect(result.description).toBe('');
            });
        });

        describe('fromUserCoursesToPublicData', () => {
            test('debería convertir array de UserCourses', () => {
                const userCourses: UserCourse[] = [
                    {
                        id: 1,
                        userId: 'user-123',
                        courseId: 1,
                        course: mockCourse,
                        userClassesState: [],
                        userModuleState: [],
                        completedAt: null,
                    },
                    {
                        id: 2,
                        userId: 'user-123',
                        courseId: 2,
                        course: { ...mockCourse, id: 2, canonicalId: 'curso-2' },
                        userClassesState: [],
                        userModuleState: [],
                        completedAt: null,
                    },
                ];

                const result = CourseMapper.fromUserCoursesToPublicData(userCourses);

                expect(result).toHaveLength(2);
                expect(result[0].canonicalId).toBe('curso-test');
                expect(result[1].canonicalId).toBe('curso-2');
            });

            test('debería retornar array vacío para array vacío', () => {
                const result = CourseMapper.fromUserCoursesToPublicData([]);

                expect(result).toEqual([]);
            });
        });
    });
});
