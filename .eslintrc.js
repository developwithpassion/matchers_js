module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
    mocha: true
  },
  extends: ['strongloop'],
  globals: {},
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['error', { code: 120 }],
    'no-duplicate-imports': ['error'],
    'no-new-func': ['off'],
    'comma-dangle': ['off']
  }
};
