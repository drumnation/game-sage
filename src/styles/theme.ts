export const theme = {
  colors: {
    background: '#1E1E1E',
    surface: '#252526',
    primary: '#007ACC',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#404040',
    hover: '#2A2D2E'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
} as const;

export type Theme = typeof theme; 