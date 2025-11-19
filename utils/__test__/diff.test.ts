import { diffCourses, Change } from '../diff';

describe('utils/diff', () => {
    describe('diffCourses', () => {
        const baseCourse: any = {
            id: 1,
            name: 'Test Course',
            description: 'Original description',
            modules: [],
        };

        it('should detect course property updates', () => {
            const original = { ...baseCourse };
            const modified = { ...baseCourse, description: 'Updated description' };

            const changes = diffCourses(original, modified);

            expect(changes).toHaveLength(1);
            expect(changes[0]).toMatchObject({
                type: 'course',
                action: 'updated',
                path: { course: 1, property: 'description' },
                data: { description: 'Updated description' },
            });
        });

        it('should detect multiple property updates', () => {
            const original = { ...baseCourse, price: 100 };
            const modified = { ...baseCourse, price: 150, description: 'New desc' };

            const changes = diffCourses(original, modified);

            expect(changes.length).toBeGreaterThanOrEqual(2);
            expect(changes.some(c => c.path.property === 'price')).toBe(true);
            expect(changes.some(c => c.path.property === 'description')).toBe(true);
        });

        it('should detect added module', () => {
            const original = { ...baseCourse, modules: [] };
            const modified = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'New Module', classes: [] },
                ],
            };

            const changes = diffCourses(original, modified);

            const addedModule = changes.find(c => c.type === 'module' && c.action === 'added');
            expect(addedModule).toBeDefined();
            expect(addedModule?.path.module).toBe(1);
        });

        it('should detect deleted module', () => {
            const original = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'Module to Delete', classes: [] },
                ],
            };
            const modified = { ...baseCourse, modules: [] };

            const changes = diffCourses(original, modified);

            const deletedModule = changes.find(c => c.type === 'module' && c.action === 'deleted');
            expect(deletedModule).toBeDefined();
            expect(deletedModule?.path.module).toBe(1);
        });

        it('should detect updated module property', () => {
            const original = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'Original Title', classes: [] },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'Updated Title', classes: [] },
                ],
            };

            const changes = diffCourses(original, modified);

            const updatedModule = changes.find(
                c => c.type === 'module' && c.action === 'updated' && c.path.property === 'title'
            );
            expect(updatedModule).toBeDefined();
            expect(updatedModule?.data).toEqual({ title: 'Updated Title' });
        });

        it('should detect added class in module', () => {
            const original = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'Module', classes: [] },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        classes: [
                            { id: 10, title: 'New Class', videoDuration: 300 },
                        ],
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const addClass = changes.find(c => c.type === 'class' && c.action === 'added');
            expect(addClass).toBeDefined();
            expect(addClass?.path.class).toBe(10);
            expect(addClass?.path.module).toBe(1);
        });

        it('should detect deleted class from module', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        classes: [
                            { id: 10, title: 'Class to Delete', videoDuration: 300 },
                        ],
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    { id: 1, title: 'Module', classes: [] },
                ],
            };

            const changes = diffCourses(original, modified);

            const deleteClass = changes.find(c => c.type === 'class' && c.action === 'deleted');
            expect(deleteClass).toBeDefined();
            expect(deleteClass?.path.class).toBe(10);
        });

        it('should detect updated class property', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        classes: [
                            { id: 10, title: 'Original Class', videoDuration: 300 },
                        ],
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        classes: [
                            { id: 10, title: 'Original Class', videoDuration: 600 },
                        ],
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const updatedClass = changes.find(
                c => c.type === 'class' && c.action === 'updated' && c.path.property === 'videoDuration'
            );
            expect(updatedClass).toBeDefined();
            expect(updatedClass?.data).toEqual({ videoDuration: 600 });
        });

        it('should detect quiz changes in module', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: { id: 5, title: 'Quiz', questions: [] },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: { id: 5, title: 'Updated Quiz', questions: [] },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const updatedQuiz = changes.find(
                c => c.type === 'quiz' && c.action === 'updated' && c.path.property === 'title'
            );
            expect(updatedQuiz).toBeDefined();
        });

        it('should detect added question to quiz', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: { id: 5, title: 'Quiz', questions: [] },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                { id: 20, title: 'New Question', points: 10, options: [] },
                            ],
                        },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const addedQuestion = changes.find(c => c.type === 'question' && c.action === 'added');
            expect(addedQuestion).toBeDefined();
            expect(addedQuestion?.path.question).toBe(20);
        });

        it('should detect deleted question from quiz', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                { id: 20, title: 'Question to Delete', points: 10, options: [] },
                            ],
                        },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: { id: 5, title: 'Quiz', questions: [] },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const deletedQuestion = changes.find(c => c.type === 'question' && c.action === 'deleted');
            expect(deletedQuestion).toBeDefined();
            expect(deletedQuestion?.path.question).toBe(20);
        });

        it('should detect added option to question', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                { id: 20, title: 'Question', points: 10, options: [] },
                            ],
                        },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'Option A', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const addedOption = changes.find(c => c.type === 'option' && c.action === 'added');
            expect(addedOption).toBeDefined();
            expect(addedOption?.path.option).toBe(30);
        });

        it('should detect updated option isCorrect value', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'Option A', isCorrect: false },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'Option A', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const updatedOption = changes.find(
                c => c.type === 'option' && c.action === 'updated' && c.path.property === 'isCorrect'
            );
            expect(updatedOption).toBeDefined();
            expect(updatedOption?.data).toEqual({ isCorrect: true });
        });

        it('should return empty array when no changes', () => {
            const course = { ...baseCourse, modules: [] };

            const changes = diffCourses(course, course);

            expect(changes).toEqual([]);
        });

        it('should handle complex nested changes', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module 1',
                        classes: [
                            { id: 10, title: 'Class 1', videoDuration: 300 },
                        ],
                        quiz: {
                            id: 5,
                            title: 'Quiz 1',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question 1',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'A', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                description: 'Updated',
                modules: [
                    {
                        id: 1,
                        title: 'Updated Module 1',
                        classes: [
                            { id: 10, title: 'Class 1', videoDuration: 600 },
                            { id: 11, title: 'New Class', videoDuration: 400 },
                        ],
                        quiz: {
                            id: 5,
                            title: 'Quiz 1',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question 1',
                                    points: 15,
                                    options: [
                                        { id: 30, value: 'A', isCorrect: false },
                                        { id: 31, value: 'B', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            expect(changes.length).toBeGreaterThan(0);
            expect(changes.some(c => c.path.property === 'description')).toBe(true);
            expect(changes.some(c => c.type === 'module' && c.path.property === 'title')).toBe(true);
            expect(changes.some(c => c.type === 'class' && c.action === 'added')).toBe(true);
            expect(changes.some(c => c.type === 'option' && c.action === 'added')).toBe(true);
        });

        it('should preserve path context through nesting', () => {
            const original = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'A', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };
            const modified = {
                ...baseCourse,
                modules: [
                    {
                        id: 1,
                        title: 'Module',
                        quiz: {
                            id: 5,
                            title: 'Quiz',
                            questions: [
                                {
                                    id: 20,
                                    title: 'Question',
                                    points: 10,
                                    options: [
                                        { id: 30, value: 'Updated A', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            };

            const changes = diffCourses(original, modified);

            const optionChange = changes.find(c => c.type === 'option' && c.action === 'updated');
            expect(optionChange?.path).toMatchObject({
                course: 1,
                module: 1,
                quiz: 5,
                question: 20,
                option: 30,
                property: 'value',
            });
        });
    });
});
