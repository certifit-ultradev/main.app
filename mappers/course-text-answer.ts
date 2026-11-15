type LegacyTextOption = Readonly<{ value: string; isCorrect: boolean }>;

/** Adapter-only compatibility for text rows written before the column migration. */
export function resolveTextAnswer(
    expectedAnswer: string | null | undefined,
    legacyOptions: readonly LegacyTextOption[],
): string | null {
    if (expectedAnswer !== null && expectedAnswer !== undefined) {
        return expectedAnswer.trim() ? expectedAnswer : null;
    }
    if (legacyOptions.length !== 1 || !legacyOptions[0].isCorrect || !legacyOptions[0].value.trim()) {
        return null;
    }
    return legacyOptions[0].value;
}
