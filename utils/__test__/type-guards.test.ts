import { isQuestion, isOption, isModuleClass, isCourseModule } from '../type-guards';

describe('utils/type-guards', () => {
    describe('isQuestion', () => {
        it('should return true for valid question object', () => {
            const question = {
                title: 'Test Question',
                type: 'MULTIPLE_CHOICE',
                points: 10,
                options: [],
            };
            expect(isQuestion(question)).toBe(true);
        });

        it('should return false for object without points', () => {
            const notQuestion = {
                title: 'Test',
                type: 'TEXT',
            };
            expect(isQuestion(notQuestion)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isQuestion(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isQuestion(undefined)).toBe(false);
        });

        it('should return false for primitive types', () => {
            expect(isQuestion('string')).toBe(false);
            expect(isQuestion(123)).toBe(false);
            expect(isQuestion(true)).toBe(false);
        });

        it('should return false for empty object', () => {
            expect(isQuestion({})).toBe(false);
        });
    });

    describe('isOption', () => {
        it('should return true for valid option object', () => {
            const option = {
                value: 'Option A',
                isCorrect: true,
            };
            expect(isOption(option)).toBe(true);
        });

        it('should return true when isCorrect is false', () => {
            const option = {
                value: 'Option B',
                isCorrect: false,
            };
            expect(isOption(option)).toBe(true);
        });

        it('should return false for object without isCorrect', () => {
            const notOption = {
                value: 'Some value',
            };
            expect(isOption(notOption)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isOption(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isOption(undefined)).toBe(false);
        });

        it('should return false for empty object', () => {
            expect(isOption({})).toBe(false);
        });
    });

    describe('isModuleClass', () => {
        it('should return true for valid module class object', () => {
            const moduleClass = {
                title: 'Class Title',
                description: 'Description',
                videoDuration: 300,
                videoPath: 'path/to/video.mp4',
            };
            expect(isModuleClass(moduleClass)).toBe(true);
        });

        it('should return true with videoDuration of 0', () => {
            const moduleClass = {
                title: 'Class Title',
                videoDuration: 0,
            };
            expect(isModuleClass(moduleClass)).toBe(true);
        });

        it('should return false for object without videoDuration', () => {
            const notModuleClass = {
                title: 'Title',
                description: 'Description',
            };
            expect(isModuleClass(notModuleClass)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isModuleClass(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isModuleClass(undefined)).toBe(false);
        });

        it('should return false for empty object', () => {
            expect(isModuleClass({})).toBe(false);
        });
    });

    describe('isCourseModule', () => {
        it('should return true for valid course module object', () => {
            const courseModule = {
                title: 'Module Title',
                minRequiredPoints: 70,
                classes: [],
            };
            expect(isCourseModule(courseModule)).toBe(true);
        });

        it('should return true with minRequiredPoints of 0', () => {
            const courseModule = {
                title: 'Module',
                minRequiredPoints: 0,
            };
            expect(isCourseModule(courseModule)).toBe(true);
        });

        it('should return false for object without minRequiredPoints', () => {
            const notCourseModule = {
                title: 'Module',
                classes: [],
            };
            expect(isCourseModule(notCourseModule)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isCourseModule(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isCourseModule(undefined)).toBe(false);
        });

        it('should return false for empty object', () => {
            expect(isCourseModule({})).toBe(false);
        });
    });
});
