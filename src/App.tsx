import React from 'react';
import { ConfigProvider, App as AntApp, Layout, theme } from 'antd';
import { ThemeProvider } from 'styled-components';
import { Screenshot } from './features/Screenshot/Screenshot';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme as appTheme } from './styles/theme';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <AntApp>
        <ThemeProvider theme={appTheme}>
          <GlobalStyle />
          <Layout style={{ minHeight: '100vh' }}>
            <Screenshot />
          </Layout>
        </ThemeProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
