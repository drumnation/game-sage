import { DefaultTheme } from 'styled-components';

const baseTheme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: '4px',
  transitions: {
    default: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};

export const theme: DefaultTheme = {
  colors: {
    primary: '#1890ff',
    background: '#141414',
    surface: '#1f1f1f',
    text: '#ffffff',
    textPrimary: '#ffffff',
    textSecondary: '#8c8c8c',
    divider: '#303030',
    error: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14'
  },
  ...baseTheme
};

export const lightTheme: DefaultTheme = {
  colors: {
    primary: '#1890ff',
    background: '#f0f2f5',
    surface: '#ffffff',
    text: '#000000',
    textPrimary: '#000000',
    textSecondary: '#8c8c8c',
    divider: '#f0f0f0',
    error: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14'
  },
  ...baseTheme
}; 