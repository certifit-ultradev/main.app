const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const config = {
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    /*transform: {
        '^.+\\.[tj]sx?$': 'babel-jest', // Use babel-jest for JavaScript and TypeScript files
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(next-auth|@auth)/)',
    ],*/
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\](?!next-auth|@next-auth|@auth)[/\\\\]', // Transform ESM modules in node_modules
    ],
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: {
                module: 'ESNext',
            },
        },
    },
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)



