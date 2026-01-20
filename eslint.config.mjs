import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/adjacent-overload-signatures': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/unified-signatures': 'warn',
      '@typescript-eslint/no-unused-vars': ['off'], // handled by TypeScript compiler
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-prototype-builtins': 'off',

      // Import rules
      'import/no-duplicates': 'warn',
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // General code quality
      curly: ['warn', 'all'],
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      'for-direction': 'warn',
      'no-bitwise': 'warn',
      'no-caller': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-debugger': 'warn',
      'no-duplicate-case': 'warn',
      'no-duplicate-imports': 'warn',
      'no-eval': 'warn',
      'no-invalid-this': 'off', // handled by @typescript-eslint
      'no-new-wrappers': 'warn',
      'no-restricted-syntax': ['warn', 'ForInStatement'],
      'no-sparse-arrays': 'warn',
      'no-throw-literal': 'warn',
      'no-unused-expressions': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-object-spread': 'warn',
      'prefer-template': 'warn',
      radix: 'warn',
      'use-isnan': 'warn',

      // Style rules (keeping minimal as Prettier handles most)
      'brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      'max-len': ['warn', { code: 140, ignoreUrls: true, ignoreStrings: true }],
      quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ['warn', 'always'],

      // Disable rules handled by TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
    },
  },
  prettierConfig,
];
