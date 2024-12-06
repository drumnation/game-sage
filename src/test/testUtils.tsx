/* eslint-disable react-refresh/only-export-components */
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from '../store/store';
import { theme } from '../styles/theme';
import { ConfigProvider } from 'antd';

// Separate file for the wrapper component
export function TestProviders({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: theme.colors.primary,
                            colorBgBase: theme.colors.background,
                        },
                    }}
                >
                    {children}
                </ConfigProvider>
            </ThemeProvider>
        </Provider>
    );
}

// Custom render function
function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) {
    return rtlRender(ui, { wrapper: TestProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { render }; 