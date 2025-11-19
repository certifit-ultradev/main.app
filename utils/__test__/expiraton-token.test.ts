import { generateExpirationToken } from '../expiraton-token';
import { v4 as uuid } from 'uuid';

jest.mock('uuid');

describe('utils/expiraton-token', () => {
    describe('generateExpirationToken', () => {
        const mockUuid = uuid as jest.MockedFunction<typeof uuid>;
        const mockDate = new Date('2024-01-01T00:00:00.000Z');

        beforeEach(() => {
            jest.clearAllMocks();
            jest.useFakeTimers();
            jest.setSystemTime(mockDate);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should generate token with UUID and expiration 1 hour from now', () => {
            const mockUuidValue = 'test-uuid-1234';
            mockUuid.mockReturnValue(mockUuidValue);

            const result = generateExpirationToken();

            expect(mockUuid).toHaveBeenCalledTimes(1);
            expect(result.token).toBe(mockUuidValue);
            expect(result.expires).toEqual(new Date('2024-01-01T01:00:00.000Z'));
        });

        it('should generate different tokens on multiple calls', () => {
            mockUuid
                .mockReturnValueOnce('token-1')
                .mockReturnValueOnce('token-2')
                .mockReturnValueOnce('token-3');

            const result1 = generateExpirationToken();
            const result2 = generateExpirationToken();
            const result3 = generateExpirationToken();

            expect(result1.token).toBe('token-1');
            expect(result2.token).toBe('token-2');
            expect(result3.token).toBe('token-3');
            expect(mockUuid).toHaveBeenCalledTimes(3);
        });

        it('should generate expiration exactly 1 hour (3600000ms) from current time', () => {
            mockUuid.mockReturnValue('test-token');

            const result = generateExpirationToken();

            const currentTime = mockDate.getTime();
            const expirationTime = result.expires.getTime();
            const difference = expirationTime - currentTime;

            expect(difference).toBe(3600000); // 1 hour in milliseconds
        });

        it('should generate valid expiration date for different current times', () => {
            const testDate = new Date('2024-06-15T14:30:00.000Z');
            jest.setSystemTime(testDate);
            mockUuid.mockReturnValue('test-token');

            const result = generateExpirationToken();

            expect(result.expires).toEqual(new Date('2024-06-15T15:30:00.000Z'));
        });

        it('should return object with token and expires properties', () => {
            mockUuid.mockReturnValue('test-token');

            const result = generateExpirationToken();

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expires');
            expect(typeof result.token).toBe('string');
            expect(result.expires).toBeInstanceOf(Date);
        });
    });
});
