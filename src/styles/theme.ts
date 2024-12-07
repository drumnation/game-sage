import { DefaultTheme } from 'styled-components';

/**
 * Application theme following design system guidelines
 */
export const theme: DefaultTheme = {
  colors: {
    background: '#141414',
    surface: '#1f1f1f',
    primary: '#1890ff',
    text: '#ffffff',
    textPrimary: '#ffffff',
    textSecondary: '#8c8c8c',
    divider: '#303030',
    error: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: '4px',
  transitions: {
    default: 'all 0.2s ease'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
  }
};

// Type declaration for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      primary: string;
      text: string;
      textPrimary: string;
      textSecondary: string;
      divider: string;
      error: string;
      success: string;
      warning: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: string;
    transitions: {
      default: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
  }
} 