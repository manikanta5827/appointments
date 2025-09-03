export default {
  testEnvironment: 'node',
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'service/**/*.js',
    'repository/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true
};
