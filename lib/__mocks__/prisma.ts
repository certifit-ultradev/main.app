export const prisma = {
    user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
    otpVerification: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
};