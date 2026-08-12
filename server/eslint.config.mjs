import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Architecture guard: Supabase access is ONLY allowed inside repositories.
    files: ['src/modules/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@supabase/supabase-js', message: 'Supabase must only be used inside repository files (module/*/repository).' }],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.repository.ts'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
  {
    // Express.Request augmentation requires the `declare global { namespace Express {} }` shape.
    files: ['src/shared/types/express.ts'],
    rules: { '@typescript-eslint/no-namespace': 'off' },
  },
);