module.exports = {
  // 기본 포맷팅
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',

  // JSX 설정
  jsxSingleQuote: true,

  // 후행 쉼표
  trailingComma: 'es5',

  // 공백
  bracketSpacing: true,
  bracketSameLine: false,

  // 화살표 함수
  arrowParens: 'avoid',

  // 범위
  rangeStart: 0,
  rangeEnd: Infinity,

  // 파서 옵션
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',

  // HTML 공백 민감도
  htmlWhitespaceSensitivity: 'css',

  // Vue 파일 들여쓰기
  vueIndentScriptAndStyle: false,

  // 줄 끝 문자
  endOfLine: 'lf',

  // 임베디드 언어 포맷팅
  embeddedLanguageFormatting: 'auto',

  // 싱글 속성 HTML 요소
  singleAttributePerLine: false,

  // 파일별 설정 오버라이드
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
};