module.exports = {
  testEnvironment: "jsdom",
  rootDir: "./",
  testMatch: [
    "<rootDir>/test/services/**/*.test.[tj]s?(x)",
    "<rootDir>/src/**/*.test.[tj]s?(x)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@workers/(.*)$": "<rootDir>/src/workers/$1",
    "^@docs/(.*)$": "<rootDir>/docs/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^three-stdlib/(.*)$": "<rootDir>/node_modules/three-stdlib/$1",
    "^@preact/signals-react/(.*)$":
      "<rootDir>/node_modules/@preact/signals-react/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      { 
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
          "@babel/preset-react"
        ]
      },
    ],
    "^.+\\.(js|jsx)$": [
      "babel-jest",
      { 
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-react"
        ]
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@preact|gamba-react-v2|gamba-react-ui-v2|@react-three/drei|lucide-react|hardhat-gas-reporter)/)",
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.services.js", "<rootDir>/jest.setup.text-encoding.js"],
  // Add timeout for long-running tests
  testTimeout: 10000,
};