import { mergeChangesByTypeAndId, getCourseProgress, toSnakeCase } from '../classes';

describe('utils/classes', () => {
    describe('mergeChangesByTypeAndId', () => {
        it('should merge changes by type and id', () => {
            const changes: any = [
                {
                    type: 'course',
                    action: 'updated' as const,
                    path: { course: 1 },
                    data: { name: 'Updated Course', description: 'New description' },
                },
                {
                    type: 'course',
                    action: 'updated' as const,
                    path: { course: 1 },
                    data: { price: 99.99 },
                },
                {
                    type: 'module',
                    action: 'updated' as const,
                    path: { course: 1, module: 2 },
                    data: { title: 'Updated Module' },
                },
            ];

            const result = mergeChangesByTypeAndId(changes);

            expect(result).toEqual({
                course: {
                    '1': {
                        name: 'Updated Course',
                        description: 'New description',
                        price: 99.99,
                    },
                },
                module: {
                    '2': {
                        title: 'Updated Module',
                    },
                },
            });
        });

        it('should handle multiple entities of the same type', () => {
            const changes: any = [
                {
                    type: 'class',
                    action: 'updated' as const,
                    path: { course: 1, module: 1, class: 1 },
                    data: { title: 'Class 1' },
                },
                {
                    type: 'class',
                    action: 'updated' as const,
                    path: { course: 1, module: 1, class: 2 },
                    data: { title: 'Class 2' },
                },
            ];

            const result = mergeChangesByTypeAndId(changes);

            expect(result).toEqual({
                class: {
                    '1': { title: 'Class 1' },
                    '2': { title: 'Class 2' },
                },
            });
        });

        it('should merge multiple updates to the same entity', () => {
            const changes: any = [
                {
                    type: 'question',
                    action: 'updated' as const,
                    path: { course: 1, module: 1, quiz: 1, question: 5 },
                    data: { title: 'Question Title' },
                },
                {
                    type: 'question',
                    action: 'updated' as const,
                    path: { course: 1, module: 1, quiz: 1, question: 5 },
                    data: { points: 15 },
                },
            ];

            const result = mergeChangesByTypeAndId(changes);

            expect(result).toEqual({
                question: {
                    '5': {
                        title: 'Question Title',
                        points: 15,
                    },
                },
            });
        });

        it('should skip changes without mapped pathKey', () => {
            const changes: any = [
                {
                    type: 'unknown',
                    action: 'updated' as const,
                    path: { unknown: 1 },
                    data: { value: 'test' },
                },
            ];

            const result = mergeChangesByTypeAndId(changes);

            expect(result).toEqual({});
        });

        it('should skip changes without id in path', () => {
            const changes: any = [
                {
                    type: 'course',
                    action: 'updated' as const,
                    path: { module: 1 }, // No 'course' in path
                    data: { name: 'Test' },
                },
            ];

            const result = mergeChangesByTypeAndId(changes);

            expect(result).toEqual({});
        });

        it('should handle empty changes array', () => {
            const result = mergeChangesByTypeAndId([]);
            expect(result).toEqual({});
        });
    });

    describe('getCourseProgress', () => {
        it('should calculate progress correctly', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Class 1' },
                            { id: 2, title: 'Class 2' },
                            { id: 3, title: 'Class 3' },
                        ],
                    },
                ],
                classViewed: [
                    { classId: 1, completed: true },
                    { classId: 2, completed: false },
                ],
            };

            const result = getCourseProgress(course);

            expect(result).toBeDefined();
            expect(result?.totalClasses).toBe(3);
            expect(result?.progressPercent).toBe(33); // 1/3 completed
            expect(result?.currentIndex).toBe(1); // First non-completed class
        });

        it('should handle all classes completed', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Class 1' },
                            { id: 2, title: 'Class 2' },
                        ],
                    },
                ],
                classViewed: [
                    { classId: 1, completed: true },
                    { classId: 2, completed: true },
                ],
            };

            const result = getCourseProgress(course);

            expect(result?.progressPercent).toBe(100);
            expect(result?.currentIndex).toBe(1); // Last class
        });

        it('should handle no classes completed', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Class 1' },
                            { id: 2, title: 'Class 2' },
                        ],
                    },
                ],
                classViewed: [],
            };

            const result = getCourseProgress(course);

            expect(result?.progressPercent).toBe(0);
            expect(result?.currentIndex).toBe(0); // First class
        });

        it('should return correct visible classes for current + next', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Class 1' },
                            { id: 2, title: 'Class 2' },
                            { id: 3, title: 'Class 3' },
                        ],
                    },
                ],
                classViewed: [
                    { classId: 1, completed: true },
                ],
            };

            const result = getCourseProgress(course);

            expect(result?.visibleClasses).toHaveLength(2);
            expect(result?.visibleClasses[0].id).toBe(2); // Current (not completed)
            expect(result?.visibleClasses[1].id).toBe(3); // Next
        });

        it('should return correct visible classes for last class', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Class 1' },
                            { id: 2, title: 'Class 2' },
                            { id: 3, title: 'Class 3' },
                        ],
                    },
                ],
                classViewed: [
                    { classId: 1, completed: true },
                    { classId: 2, completed: true },
                ],
            };

            const result = getCourseProgress(course);

            expect(result?.visibleClasses).toHaveLength(2);
            expect(result?.visibleClasses[0].id).toBe(2); // Previous
            expect(result?.visibleClasses[1].id).toBe(3); // Current (last)
        });

        it('should handle single class', () => {
            const course: any = {
                modules: [
                    {
                        classes: [{ id: 1, title: 'Class 1' }],
                    },
                ],
                classViewed: [],
            };

            const result = getCourseProgress(course);

            expect(result?.visibleClasses).toHaveLength(1);
            expect(result?.totalClasses).toBe(1);
        });

        it('should return undefined if modules is undefined', () => {
            const course: any = {
                classViewed: [],
            };

            const result = getCourseProgress(course);

            expect(result).toBeUndefined();
        });

        it('should handle multiple modules', () => {
            const course: any = {
                modules: [
                    {
                        classes: [
                            { id: 1, title: 'Module 1 - Class 1' },
                            { id: 2, title: 'Module 1 - Class 2' },
                        ],
                    },
                    {
                        classes: [
                            { id: 3, title: 'Module 2 - Class 1' },
                        ],
                    },
                ],
                classViewed: [
                    { classId: 1, completed: true },
                ],
            };

            const result = getCourseProgress(course);

            expect(result?.totalClasses).toBe(3);
            expect(result?.progressPercent).toBe(33); // 1/3
        });
    });

    describe('toSnakeCase', () => {
        it('should convert text to snake_case', () => {
            expect(toSnakeCase('Hello World')).toBe('hello_world');
        });

        it('should handle multiple spaces', () => {
            expect(toSnakeCase('Hello   World   Test')).toBe('hello_world_test');
        });

        it('should handle already lowercase', () => {
            expect(toSnakeCase('hello world')).toBe('hello_world');
        });

        it('should handle single word', () => {
            expect(toSnakeCase('Hello')).toBe('hello');
        });

        it('should handle empty string', () => {
            expect(toSnakeCase('')).toBe('');
        });

        it('should handle mixed case', () => {
            expect(toSnakeCase('JavaScript Tutorial')).toBe('javascript_tutorial');
        });

        it('should preserve underscores from original', () => {
            expect(toSnakeCase('hello_world test')).toBe('hello_world_test');
        });
    });
});
