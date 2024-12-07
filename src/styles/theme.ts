import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      primary: string;
      text: string;
    };
    borderRadius: string;
    spacing: {
      small: string;
      medium: string;
      large: string;
    };
    typography: {
      fontSize: {
        small: string;
        medium: string;
        large: string;
      };
      fontWeight: {
        normal: number;
        bold: number;
      };
    };
  }
}

export const theme = {
  colors: {
    background: '#ffffff',
    primary: '#1890ff',
    text: '#000000',
  },
  borderRadius: '4px',
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  typography: {
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
    fontWeight: {
      normal: 400,
      bold: 600,
    },
  },
}; 