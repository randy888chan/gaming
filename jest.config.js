// jest.config.js
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
  // FIX: This pattern tells Jest to transform these specific modules instead of ignoring them
  transformIgnorePatterns: [
    '/node_modules/(?!(@preact|gamba-react-v2|gamba-react-ui-v2)/)',
  ],
  verbose: true, // Add verbose output
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
