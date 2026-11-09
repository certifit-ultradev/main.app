/** Progression is based on presentation order, never on database IDs. */
export function unlockedModuleIds(
    modules: readonly { id: number; quizId: number | null }[],
    passedQuizIds: ReadonlySet<number>,
): Set<number> {
    const unlocked = new Set<number>();
    let canContinue = true;
    for (const module of modules) {
        if (!canContinue) break;
        unlocked.add(module.id);
        canContinue = module.quizId !== null && passedQuizIds.has(module.quizId);
    }
    return unlocked;
}
