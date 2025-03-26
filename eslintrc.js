module.exports = {
  env: {
    node: true,
    browser: true
  },
  extends: ['airbnb-base'],
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
    }],
    'no-unused-vars': 0,
    'arrow-body-style': 0,
  },
};

