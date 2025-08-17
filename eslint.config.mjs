import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.node },
rules: {
      'no-unused-vars': 'off',
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'no-undef':'off'
    },
},
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
]);
