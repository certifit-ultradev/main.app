import { z } from 'zod';
import { mapEditorZodErrors } from '@/features/courses/editor/editor-form-errors';

describe('mapEditorZodErrors', () => {
    it('maps a single field error with its Zod code and message', () => {
        const parsed = z.object({ name: z.string().min(5, 'Mínimo cinco caracteres') }).safeParse({ name: '' });

        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            expect(mapEditorZodErrors(parsed.error)).toEqual(expect.objectContaining({
                name: { type: 'too_small', message: 'Mínimo cinco caracteres' },
            }));
        }
    });

    it('maps every invalid sibling field', () => {
        const parsed = z.object({
            name: z.string().min(1),
            email: z.string().email(),
            age: z.number().positive(),
        }).safeParse({ name: '', email: 'invalid', age: -1 });

        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            expect(Object.keys(mapEditorZodErrors(parsed.error))).toEqual(expect.arrayContaining(['name', 'email', 'age']));
        }
    });

    it('joins nested object paths with dashes', () => {
        const parsed = z.object({ user: z.object({ profile: z.object({ name: z.string().min(1) }) }) })
            .safeParse({ user: { profile: { name: '' } } });

        expect(parsed.success).toBe(false);
        if (!parsed.success) expect(mapEditorZodErrors(parsed.error)).toHaveProperty('user-profile-name');
    });

    it('includes array indexes in mapped paths', () => {
        const parsed = z.object({ items: z.array(z.object({ title: z.string().min(1) })) })
            .safeParse({ items: [{ title: '' }, { title: '' }] });

        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            expect(mapEditorZodErrors(parsed.error)).toEqual(expect.objectContaining({
                'items-0-title': expect.any(Object),
                'items-1-title': expect.any(Object),
            }));
        }
    });

    it('maps nested field paths without writing validation data to the console', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const schema = z.object({ modules: z.array(z.object({ title: z.string().min(1) })) });
        const parsed = schema.safeParse({ modules: [{ title: '' }] });

        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            expect(mapEditorZodErrors(parsed.error)).toEqual(expect.objectContaining({
                'modules-0-title': expect.objectContaining({ type: 'too_small' }),
            }));
        }
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('returns an empty map for a Zod error without issues', () => {
        expect(mapEditorZodErrors(new z.ZodError([]))).toEqual({});
    });
});
