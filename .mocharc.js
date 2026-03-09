module.exports = {
  spec: 'test/**/*.test.js',
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'reports',
    reportFilename: 'test-report',
    overwrite: true,
    html: true,
    json: true,
  },
  timeout: 30000,
  exit: true,
};
