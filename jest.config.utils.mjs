export default {
  testEnvironment: "node",
  rootDir: "./",
  testMatch: [
    "<rootDir>/src/utils/**/*.test.[tj]s"
  ],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
        babelConfig: {
          presets: [
            ["@babel/preset-env", { targets: { node: "current" } }],
            "@babel/preset-typescript"
          ]
        }
      }
    ]
  },
  verbose: true,
  // Add timeout for long-running tests
  testTimeout: 10000,
};