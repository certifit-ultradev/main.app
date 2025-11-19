import { mapZodErrors } from '../zod-errors-mapper';
import { z } from 'zod';

describe('utils/zod-errors-mapper', () => {
    // Mock console.log to avoid noise in tests
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('mapZodErrors', () => {
        it('should map single validation error', () => {
            const schema = z.object({
                name: z.string().min(1),
            });

            try {
                schema.parse({ name: '' });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result).toHaveProperty('name');
                expect(result.name).toHaveProperty('type');
                expect(result.name).toHaveProperty('message');
            }
        });

        it('should map multiple validation errors', () => {
            const schema = z.object({
                name: z.string().min(1),
                email: z.string().email(),
                age: z.number().positive(),
            });

            try {
                schema.parse({ name: '', email: 'invalid', age: -1 });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(Object.keys(result).length).toBeGreaterThan(0);
                expect(result).toHaveProperty('name');
                expect(result).toHaveProperty('email');
            }
        });

        it('should join nested paths with dashes', () => {
            const schema = z.object({
                user: z.object({
                    profile: z.object({
                        name: z.string().min(1),
                    }),
                }),
            });

            try {
                schema.parse({ user: { profile: { name: '' } } });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result).toHaveProperty('user-profile-name');
                expect(result['user-profile-name']).toHaveProperty('type');
                expect(result['user-profile-name']).toHaveProperty('message');
            }
        });

        it('should map array index errors', () => {
            const schema = z.object({
                items: z.array(z.object({
                    title: z.string().min(1),
                })),
            });

            try {
                schema.parse({ items: [{ title: '' }] });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result).toHaveProperty('items-0-title');
                expect(result['items-0-title']).toHaveProperty('type');
                expect(result['items-0-title']).toHaveProperty('message');
            }
        });

        it('should include error code as type', () => {
            const schema = z.object({
                email: z.string().email(),
            });

            try {
                schema.parse({ email: 'invalid-email' });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result.email.type).toBe('invalid_string');
            }
        });

        it('should include error message', () => {
            const schema = z.object({
                name: z.string().min(5, 'Name must be at least 5 characters'),
            });

            try {
                schema.parse({ name: 'abc' });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result.name.message).toContain('5');
            }
        });

        it('should handle complex nested array errors', () => {
            const schema = z.object({
                modules: z.array(z.object({
                    quiz: z.object({
                        questions: z.array(z.object({
                            title: z.string().min(1),
                        })),
                    }),
                })),
            });

            try {
                schema.parse({
                    modules: [
                        {
                            quiz: {
                                questions: [{ title: '' }],
                            },
                        },
                    ],
                });
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result).toHaveProperty('modules-0-quiz-questions-0-title');
            }
        });

        it('should handle multiple errors in array', () => {
            const schema = z.array(z.object({
                name: z.string().min(1),
            }));

            try {
                schema.parse([{ name: '' }, { name: '' }, { name: '' }]);
            } catch (e) {
                const result = mapZodErrors(e as z.ZodError);

                expect(result).toHaveProperty('0-name');
                expect(result).toHaveProperty('1-name');
                expect(result).toHaveProperty('2-name');
            }
        });

        it('should return empty object for no errors', () => {
            // This creates a ZodError manually with no errors
            const zodError = new z.ZodError([]);

            const result = mapZodErrors(zodError);

            expect(result).toEqual({});
        });

        it('should log mapped errors to console', () => {
            const schema = z.object({
                name: z.string().min(1),
            });

            try {
                schema.parse({ name: '' });
            } catch (e) {
                mapZodErrors(e as z.ZodError);

                expect(console.log).toHaveBeenCalledWith(
                    'mappedErrors',
                    expect.any(Object)
                );
            }
        });
    });
});
