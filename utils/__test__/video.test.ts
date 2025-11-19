import {
    calculateTotalVideoSize,
    formatVideoSize,
    calculateTotalVideoDuration,
    formatVideoDuration,
} from '../video';

describe('utils/video', () => {
    describe('calculateTotalVideoSize', () => {
        it('should calculate total size from videoSize property', () => {
            const modules: any = [
                {
                    classes: [
                        { videoSize: 1000000 },
                        { videoSize: 2000000 },
                    ],
                },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(3000000);
        });

        it('should calculate total size from videoSize property', () => {
            const modules: any = [
                {
                    classes: [
                        { videoSize: 1000000 },
                        { videoSize: 2000000 },
                    ],
                },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(3000000);
        });

        it('should handle videoSize property when video is not File', () => {
            const modules: any = [
                {
                    classes: [
                        { video: 'path/to/video.mp4', videoSize: 1000000 },
                        { videoSize: 500000 },
                    ],
                },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(1500000);
        });

        it('should handle multiple modules', () => {
            const modules: any = [
                {
                    classes: [
                        { videoSize: 1000000 },
                    ],
                },
                {
                    classes: [
                        { videoSize: 2000000 },
                    ],
                },
                {
                    classes: [
                        { videoSize: 3000000 },
                    ],
                },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(6000000);
        });

        it('should handle missing videoSize with default 0', () => {
            const modules: any = [
                {
                    classes: [
                        { videoSize: 1000000 },
                        {},
                        { videoSize: 500000 },
                    ],
                },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(1500000);
        });

        it('should handle empty modules array', () => {
            const modules: any = [];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(0);
        });

        it('should handle modules with empty classes', () => {
            const modules: any = [
                { classes: [] },
                { classes: [] },
            ];

            const result = calculateTotalVideoSize(modules);

            expect(result).toBe(0);
        });

        it('should return undefined for undefined modules', () => {
            const result = calculateTotalVideoSize(undefined as any);

            expect(result).toBeUndefined();
        });
    });

    describe('formatVideoSize', () => {
        it('should format bytes to GB with 4 decimals', () => {
            const sizeInBytes = 1024 * 1024 * 1024; // 1 GB
            const result = formatVideoSize(sizeInBytes);

            expect(result).toBe('1.0000');
        });

        it('should format 2.5 GB correctly', () => {
            const sizeInBytes = 2.5 * 1024 * 1024 * 1024;
            const result = formatVideoSize(sizeInBytes);

            expect(result).toBe('2.5000');
        });

        it('should format small sizes with decimals', () => {
            const sizeInBytes = 100 * 1024 * 1024; // 100 MB = ~0.0977 GB
            const result = formatVideoSize(sizeInBytes);

            expect(parseFloat(result)).toBeCloseTo(0.0977, 3);
        });

        it('should handle zero size', () => {
            const result = formatVideoSize(0);

            expect(result).toBe('0.0000');
        });

        it('should format large sizes', () => {
            const sizeInBytes = 50 * 1024 * 1024 * 1024; // 50 GB
            const result = formatVideoSize(sizeInBytes);

            expect(result).toBe('50.0000');
        });
    });

    describe('calculateTotalVideoDuration', () => {
        it('should calculate total duration from modules', () => {
            const modules: any = [
                {
                    classes: [
                        { videoDuration: 300 },
                        { videoDuration: 600 },
                    ],
                },
            ];

            const result = calculateTotalVideoDuration(modules);

            expect(result).toBe(900);
        });

        it('should handle multiple modules', () => {
            const modules: any = [
                {
                    classes: [
                        { videoDuration: 300 },
                    ],
                },
                {
                    classes: [
                        { videoDuration: 450 },
                    ],
                },
                {
                    classes: [
                        { videoDuration: 250 },
                    ],
                },
            ];

            const result = calculateTotalVideoDuration(modules);

            expect(result).toBe(1000);
        });

        it('should handle missing videoDuration with default 0', () => {
            const modules: any = [
                {
                    classes: [
                        { videoDuration: 300 },
                        {},
                        { videoDuration: 200 },
                    ],
                },
            ];

            const result = calculateTotalVideoDuration(modules);

            expect(result).toBe(500);
        });

        it('should handle empty modules array', () => {
            const modules: any = [];

            const result = calculateTotalVideoDuration(modules);

            expect(result).toBe(0);
        });

        it('should handle modules with empty classes', () => {
            const modules: any = [
                { classes: [] },
            ];

            const result = calculateTotalVideoDuration(modules);

            expect(result).toBe(0);
        });

        it('should return undefined for undefined modules', () => {
            const result = calculateTotalVideoDuration(undefined as any);

            expect(result).toBeUndefined();
        });
    });

    describe('formatVideoDuration', () => {
        it('should format duration as HH hr MM mins SS sec', () => {
            const duration = 3661; // 1 hour, 1 minute, 1 second
            const result = formatVideoDuration(duration);

            expect(result).toBe('01 hr 01 mins 01 sec');
        });

        it('should format zero duration', () => {
            const result = formatVideoDuration(0);

            expect(result).toBe('00 hr 00 mins 00 sec');
        });

        it('should format only seconds', () => {
            const result = formatVideoDuration(45);

            expect(result).toBe('00 hr 00 mins 45 sec');
        });

        it('should format only minutes', () => {
            const duration = 300; // 5 minutes
            const result = formatVideoDuration(duration);

            expect(result).toBe('00 hr 05 mins 00 sec');
        });

        it('should format only hours', () => {
            const duration = 7200; // 2 hours
            const result = formatVideoDuration(duration);

            expect(result).toBe('02 hr 00 mins 00 sec');
        });

        it('should format complex duration', () => {
            const duration = 3723; // 1 hour, 2 minutes, 3 seconds
            const result = formatVideoDuration(duration);

            expect(result).toBe('01 hr 02 mins 03 sec');
        });

        it('should floor decimal seconds', () => {
            const duration = 3661.7; // Should floor to 3661
            const result = formatVideoDuration(duration);

            expect(result).toBe('01 hr 01 mins 01 sec');
        });

        it('should handle large durations', () => {
            const duration = 36000; // 10 hours
            const result = formatVideoDuration(duration);

            expect(result).toBe('10 hr 00 mins 00 sec');
        });

        it('should pad single digits with zero', () => {
            const duration = 3609; // 1 hour, 0 minutes, 9 seconds
            const result = formatVideoDuration(duration);

            expect(result).toBe('01 hr 00 mins 09 sec');
        });
    });
});
