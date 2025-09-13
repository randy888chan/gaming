module.exports = {
  testEnvironment: "jsdom",
  rootDir: "./",
  testMatch: [
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
    // Handle CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Handle image imports
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      { 
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript"
        ],
        plugins: [
          ["babel-plugin-styled-components", { ssr: true, displayName: true }],
        ]
      },
    ],
    "^.+\\.(js|jsx)$": [
      "babel-jest",
      { 
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }]
        ],
        plugins: [
          ["babel-plugin-styled-components", { ssr: true, displayName: true }],
        ]
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@preact|gamba-react-v2|gamba-react-ui-v2|@react-three/drei|lucide-react|hardhat-gas-reporter|@solana/wallet-adapter-react|@solana/wallet-adapter-base)/)",
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "jest-styled-components"],
  // Add timeout for long-running tests
  testTimeout: 10000,
};