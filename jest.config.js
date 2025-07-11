module.exports = {
  testEnvironment: "jsdom",
  rootDir: "./",
  testMatch: [
    "<rootDir>/tests/integration/**/*.test.[tj]s?(x)",
    "<rootDir>/tests/unit/**/*.test.[tj]s?(x)",
    "<rootDir>/src/**/*.test.[tj]s?(x)",
  ],
  // extensionsToTreatAsEsm: ['.ts', '.tsx'], // Commenting this out to see if it resolves "require is not defined"
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
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      { presets: [["@babel/preset-react", { runtime: "classic" }]] },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@preact|gamba-react-v2|gamba-react-ui-v2|@react-three/drei|lucide-react|hardhat-gas-reporter)/)",
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "jest-styled-components"],
};
