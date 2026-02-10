// @ts-check
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'

export default defineConfig(
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  ts.configs.recommended,
  ts.configs.stylistic,
  stylistic.configs.recommended,
  unicorn.configs.recommended,
)
