import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module', // ✅ Changed from 'commonjs' to 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'no-undef': 'off',
    },
  },
]);
