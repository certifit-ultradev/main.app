// Shared test setup and utilities for courses service tests

export const mockSession = {
    user: {
        id: 'user-123',
        email: 'test@test.com',
        emailVerified: new Date()
    }
};

export const mockSessionWithoutEmail = {
    user: {
        id: 'user-123',
        email: 'test@test.com',
        emailVerified: null
    }
};

export const setupMocks = (
    logPrismaError: jest.Mock,
    auth: jest.Mock,
    session = mockSession
) => {
    logPrismaError.mockImplementation(() => {});
    auth.mockResolvedValue(session);
};

export const clearAllMocks = () => {
    jest.clearAllMocks();
};
