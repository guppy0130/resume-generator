import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import stylistic from '@stylistic/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([{
  extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),

  plugins: {
    '@typescript-eslint': typescriptEslint,
    '@stylistic': stylistic,
  },

  languageOptions: {
    globals: {
      ...globals.node,
    },

    parser: tsParser,
  },

  rules: {
    indent: ['error', 2, {
      SwitchCase: 1,
    }],

    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 0,
    '@stylistic/linebreak-style': ['error', process.platform == 'win32' ? 'windows' : 'unix'],
    '@stylistic/ban-ts-comment': 'off',
  },
}]);
