import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
            background: string;
            surface: string;
            border: string;
            hover: string;
            textPrimary: string;
            textSecondary: string;
        };
        borderRadius: string;
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
    }
} 