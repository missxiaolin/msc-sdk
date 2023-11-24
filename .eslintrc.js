module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'array-element-newline': ['error', 'consistent'],
    indent: ['error', 2, { MemberExpression: 0, SwitchCase: 1 }],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': ['error', 'always-multiline'],
    semi: 'off',
    'object-curly-spacing': ['error', 'always'],
    'max-len': ['error', 120],
    'no-new': 'off',
    'linebreak-style': 'off',
    'import/extensions': 'off',
    'eol-last': 'off',
    'no-shadow': 'off',
    'no-unused-vars': 'warn',
    'import/no-cycle': 'off',
    'arrow-parens': 'off',
    eqeqeq: 'off',
    'no-param-reassign': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'no-continue': 'off',
    'prefer-destructuring': 'off',
    'no-plusplus': 'off',
    'prefer-const': 'off',
    'global-require': 'off',
    'no-prototype-builtins': 'off',
    'consistent-return': 'off',
    'vue/require-component-is': 'off',
    'prefer-template': 'off',
    'one-var-declaration-per-line': 'off',
    'one-var': 'off',
    'import/named': 'off',
    'object-curly-newline': 'off',
    'default-case': 'off',
    'import/order': 'off',
    'no-trailing-spaces': 'off',
    'func-names': 'off',
    radix: 'off',
    'no-unused-expressions': 'off',
    'no-underscore-dangle': 'off',
    'no-bitwise': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-unresolved': 'off',
    'import/no-self-import': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-useless-path-segments': 'off',
    'import/newline-after-import': 'off',
    'no-path-concat': 'off',
    'no-restricted-syntax': 'off',
  },
};
