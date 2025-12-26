module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    es6: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.ts', '.tsx']
  },
  plugins: [
    'react',
    'jsx-a11y',
    'react-hooks',
    '@typescript-eslint',
  ],
  ignorePatterns: ['**/build/*.js', '**/node-modules/*'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    indent: 'off', // handled by Prettier
    'brace-style': 'off', // handled by Prettier
    'eol-last': ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ['error', 'always'],
    'no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/typedef': ['error', { 'parameter': true, 'propertyDeclaration': false, 'variableDeclaration': false, 'memberVariableDeclaration': false }],
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  },
 };
