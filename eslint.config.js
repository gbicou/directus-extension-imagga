// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'

export default tseslint.config(
  {
    ignores: ['dist/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  stylistic.configs['recommended-flat'],
  unicorn.configs['flat/recommended'],
)
