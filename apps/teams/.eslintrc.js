const { resolve } = require('node:path');

const project = resolve(__dirname, './tsconfig.json');

module.exports = {
  extends: ['@elba-security/eslint-config-custom/next', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
};
