import { z } from "zod";
import { ErrMap } from "./types";

export function mapZodErrors(e: z.ZodError) {
    const mappedErrors = e.errors.reduce<ErrMap>((acc, error) => {
        const path = error.path.join('-');
        acc[path] = {
            type: error.code,
            message: error.message
        };
        return acc;
    }, {});
    console.log("mappedErrors", mappedErrors);
    return mappedErrors;
}


// 0-quiz-questions-0-title
// 0-quiz-questions-0-title