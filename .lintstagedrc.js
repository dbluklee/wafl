module.exports = {
  // TypeScript files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // JavaScript files
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // JSON files
  '*.json': [
    'prettier --write',
    'git add'
  ],

  // Markdown files
  '*.md': [
    'prettier --write',
    'git add'
  ],

  // YAML files
  '*.{yaml,yml}': [
    'prettier --write',
    'git add'
  ],

  // CSS/SCSS files
  '*.{css,scss,sass}': [
    'prettier --write',
    'git add'
  ],

  // Package.json files
  'package.json': [
    'prettier --write',
    'git add'
  ]
};