module.exports = {
  testEnvironment: 'jsdom',
  rootDir: './', // Explicitly set rootDir
  testMatch: ['<rootDir>/tests/integration/**/*.test.[tj]s?(x)'], // Include both .ts and .tsx test files
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1', // For ES Modules
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  verbose: true, // Add verbose output
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};