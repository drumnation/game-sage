import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
            background: string;
            surface: string;
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