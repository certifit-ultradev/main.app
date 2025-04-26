export const twilio = {
    verify: {
        v2: {
            services: jest.fn().mockReturnThis(),
            verifications: {
                create: jest.fn(),
                update: jest.fn(),

            },
            verificationChecks: {
                create: jest.fn(),
            },
        },
    },
};
