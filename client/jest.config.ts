import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-calendar$': '<rootDir>/__mocks__/react-calendar.tsx',
    '^react-calendar/dist/Calendar.css$': '<rootDir>/__mocks__/empty.ts',
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
