/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/__tests__/*.test.ts'],
  testPathIgnorePatterns: ['/__mocks__/'],
  coverageReporters: ['lcov', 'html', 'text'],
};
