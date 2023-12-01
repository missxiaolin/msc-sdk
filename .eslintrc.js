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
    'no-restricted-properties': 'off',
    'wrap-iife': 'off',
    'prefer-spread': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-unused-vars': 'off',
    'max-len': 'off',
    'no-lonely-if': 'off',
    'prefer-rest-params': 'off',
    'operator-linebreak': 'off',
    'function-paren-newline': 'off',
    'comma-dangle': 'off',
    'implicit-arrow-linebreak': 'off',
    'max-classes-per-file': 'off',
    'guard-for-in': 'off',
    'no-undef': 'off',
    'class-methods-use-this': 'off',
    'no-useless-constructor': 'off',
    'no-alert': 'off',
    'no-console': 'off',
    'array-element-newline': ['error', 'consistent'],
    indent: ['off', 2, { MemberExpression: 0, SwitchCase: 1 }],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: 'off',
    'object-curly-spacing': ['error', 'always'],
    'no-new': 'off',
    'linebreak-style': 'off',
    'import/extensions': 'off',
    'eol-last': 'off',
    'no-shadow': 'off',
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
