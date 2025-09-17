// Design System Variables extracted from Figma
export const DESIGN_TOKENS = {
  colors: {
    basicWhite: '#FFFFFF',
    bgBlack: '#000000',
    buttonBackground: 'rgba(255,255,255,0.05)',
    buttonBorder: '#777777',
  },
  fonts: {
    pretendard: 'Pretendard, sans-serif',
  },
  typography: {
    titleLight: {
      fontFamily: 'Pretendard',
      fontWeight: 800,
      fontSize: '40px',
      lineHeight: '100%',
    },
    welcomeText: {
      fontSize: '48px',
      lineHeight: '52.5px',
      fontWeight: 500,
    },
    brandText: {
      fontSize: '60px',
      lineHeight: '52.5px',
      fontWeight: 800,
    },
    bodyText: {
      fontSize: '16px',
      lineHeight: 'normal',
      fontWeight: 600,
    },
    buttonText: {
      fontSize: '20px',
      lineHeight: 'normal',
      fontWeight: 800,
    },
  },
  spacing: {
    containerPadding: '100px',
    containerPaddingY: '140.5px',
    contentGap: '50px',
    buttonGap: '18px',
  },
  dimensions: {
    containerWidth: '700px',
    containerHeight: '462.5px',
    logoSize: '60px',
    buttonHeight: '40px',
    buttonRadius: '36px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;