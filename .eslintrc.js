module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // TypeScript 규칙
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'warn',

    // 일반 규칙
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': 'off', // TypeScript 규칙 사용
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'array-callback-return': 'error',
    'no-loop-func': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'no-useless-escape': 'error',
    'no-param-reassign': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'implicit-arrow-linebreak': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true
    }, {
      enforceForRenamedProperties: false
    }],

    // 네이밍 컨벤션
    '@typescript-eslint/naming-convention': [
      'error',
      // Interfaces는 I 접두사
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      // Types는 T 접두사
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        prefix: ['T']
      },
      // Enums는 E 접두사
      {
        selector: 'enum',
        format: ['PascalCase'],
        prefix: ['E']
      },
      // Variables는 camelCase
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE']
      },
      // Functions는 camelCase
      {
        selector: 'function',
        format: ['camelCase']
      },
      // Classes는 PascalCase
      {
        selector: 'class',
        format: ['PascalCase']
      },
      // Methods는 camelCase
      {
        selector: 'method',
        format: ['camelCase']
      }
    ]
  },
  overrides: [
    // Backend specific rules
    {
      files: ['backend/**/*.ts'],
      env: {
        node: true,
        jest: true
      },
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
      ]
    },
    // Frontend specific rules
    {
      files: ['frontend/**/*.{ts,tsx}'],
      env: {
        browser: true,
        es2022: true,
        jest: true
      },
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      plugins: [
        'react',
        'react-hooks'
      ],
      settings: {
        react: {
          version: 'detect'
        }
      },
      rules: {
        'react/react-in-jsx-scope': 'off', // React 17+
        'react/prop-types': 'off', // TypeScript handles this
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn'
      }
    },
    // Test files
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      env: {
        jest: true
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.js', // Ignore JS config files at root
    '.eslintrc.js'
  ]
};