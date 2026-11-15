import { z } from 'zod';

export type EditorErrorMap = Record<string, { type: string; message: string }>;

/** Converts Zod paths into the field names used by the editor inputs. */
export function mapEditorZodErrors(error: z.ZodError): EditorErrorMap {
    return error.errors.reduce<EditorErrorMap>((mappedErrors, issue) => {
        mappedErrors[issue.path.join('-')] = { type: issue.code, message: issue.message };
        return mappedErrors;
    }, {});
}
