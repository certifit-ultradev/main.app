import { unlockedModuleIds } from '@/application/courses/module-access';

describe('unlockedModuleIds', () => {
    const modules = [
        { id: 20, quizId: 21 },
        { id: 10, quizId: 11 },
        { id: 30, quizId: 31 },
    ];

    it('opens only the first module before any quiz is passed', () => {
        expect([...unlockedModuleIds(modules, new Set())]).toEqual([20]);
    });

    it('uses presentation order and stops at the first failed quiz', () => {
        expect([...unlockedModuleIds(modules, new Set([21, 31]))]).toEqual([20, 10]);
        expect([...unlockedModuleIds(modules, new Set([21, 11]))]).toEqual([20, 10, 30]);
    });

    it('does not unlock a later module when the preceding module has no quiz', () => {
        expect([...unlockedModuleIds([{ id: 1, quizId: null }, { id: 2, quizId: 3 }], new Set([3]))]).toEqual([1]);
    });
});
