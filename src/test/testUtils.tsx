/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

function render(ui: React.ReactElement, options = {}) {
    return rtlRender(
        <ThemeProvider theme={theme}>
            {ui}
        </ThemeProvider>,
        options
    );
}

export * from '@testing-library/react';
export { render }; 