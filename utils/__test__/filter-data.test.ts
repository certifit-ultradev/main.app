import { cleanData } from '../filter-data';

describe('utils/filter-data', () => {
    describe('cleanData', () => {
        it('should remove undefined values from object', () => {
            const input = {
                name: 'Test',
                age: undefined,
                email: 'test@example.com',
            };
            const result = cleanData(input);
            expect(result).toEqual({
                name: 'Test',
                email: 'test@example.com',
            });
        });

        it('should remove null values from object', () => {
            const input = {
                name: 'Test',
                age: null,
                email: 'test@example.com',
            };
            const result = cleanData(input);
            expect(result).toEqual({
                name: 'Test',
                email: 'test@example.com',
            });
        });

        it('should keep zero values', () => {
            const input = {
                name: 'Test',
                age: 0,
                count: 0,
            };
            const result = cleanData(input);
            expect(result).toEqual({
                name: 'Test',
                age: 0,
                count: 0,
            });
        });

        it('should keep false boolean values', () => {
            const input = {
                active: false,
                verified: true,
            };
            const result = cleanData(input);
            expect(result).toEqual({
                active: false,
                verified: true,
            });
        });

        it('should remove empty strings', () => {
            const input = {
                name: '',
                description: 'Test',
            };
            const result = cleanData(input);
            expect(result).toEqual({
                description: 'Test',
            });
        });

        it('should handle empty object', () => {
            const input = {};
            const result = cleanData(input);
            expect(result).toEqual({});
        });

        it('should handle object with only undefined values', () => {
            const input = {
                a: undefined,
                b: undefined,
                c: undefined,
            };
            const result = cleanData(input);
            expect(result).toEqual({});
        });

        it('should handle complex object with mixed values', () => {
            const input = {
                id: 1,
                name: 'Test',
                description: undefined,
                active: true,
                count: 0,
                data: null,
                removed: undefined,
                email: 'test@test.com',
            };
            const result = cleanData(input);
            expect(result).toEqual({
                id: 1,
                name: 'Test',
                active: true,
                count: 0,
                email: 'test@test.com',
            });
        });

        it('should handle nested objects', () => {
            const input = {
                user: {
                    name: 'Test',
                    age: undefined,
                },
                settings: {
                    theme: 'dark',
                },
            };
            const result = cleanData(input);
            expect(result).toEqual({
                user: {
                    name: 'Test',
                    age: undefined,
                },
                settings: {
                    theme: 'dark',
                },
            });
        });

        it('should keep array values', () => {
            const input = {
                items: [1, 2, 3],
                empty: [],
                removed: undefined,
            };
            const result = cleanData(input);
            expect(result).toEqual({
                items: [1, 2, 3],
                empty: [],
            });
        });
    });
});
