import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'prisma/app/generated/**',
      'node_modules/**',
      '**/__test__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '__mocks__/**',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Course modules are domain values, not Node's global `module` object.
      '@next/next/no-assign-module-variable': 'off',
      // Existing UI state synchronization predates the React 19 hook rule.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/*.config.js', 'prisma/seed.ts', 'tailwind.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['src/app/global-error.tsx'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
];

export default config;
