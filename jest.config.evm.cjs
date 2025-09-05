module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/test/evm/**/*.test.js"
  ],
  moduleFileExtensions: ["js", "json"],
  transform: {
    "^.+\\.js$": [
      "babel-jest",
      { presets: ["@babel/preset-env"] }
    ]
  },
  verbose: true
};