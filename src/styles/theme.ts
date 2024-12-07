import 'styled-components';
import type { Theme } from './theme.types';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme { }
}

export const theme: Theme = {
  colors: {
    background: '#ffffff',
    primary: '#1890ff',
    text: '#000000',
    textPrimary: '#262626',
    textSecondary: '#8c8c8c',
    surface: '#f5f5f5'
  },
  borderRadius: '4px',
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  }
}; 