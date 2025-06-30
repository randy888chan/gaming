module.exports = {
  testEnvironment: 'jsdom',
  rootDir: './',
  testMatch: ['<rootDir>/tests/integration/**/*.test.[tj]s?(x)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^three-stdlib/(.*)$': '<rootDir>/node_modules/three-stdlib/$1',
    '^@preact/signals-react/(.*)$': '<rootDir>/node_modules/@preact/signals-react/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { presets: [['@babel/preset-react', { runtime: 'classic' }]] }],
    '^styled-components$': ['babel-jest', { presets: [['@babel/preset-react', { runtime: 'classic' }]] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@preact|gamba-react-v2|gamba-react-ui-v2|@react-three/drei)/)',
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    React: require('react'),
  },
};