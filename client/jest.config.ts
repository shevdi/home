import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Resolve workspace package to TS source so Jest/ts-jest compiles it (dist is ESM-only).
    '^@shevdi-home/ui-kit$': '<rootDir>/../ui-kit/src/index.ts',
    '^react-calendar$': '<rootDir>/__mocks__/react-calendar.tsx',
    '^react-calendar/dist/Calendar.css$': '<rootDir>/__mocks__/empty.ts',
    '^.+\\.module\\.css$': '<rootDir>/__mocks__/empty.ts',
    '^.+\\.css$': '<rootDir>/__mocks__/empty.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}

export default config
