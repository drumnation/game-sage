import React from 'react';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from './store/store';
import { MainApp } from './pages/MainApp';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme as appTheme } from './styles/theme';

const App: React.FC = () => {
  const { message } = AntApp.useApp();

  const handleError = (error: Error) => {
    message.error(error.message);
  };

  return (
    <Provider store={store}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <AntApp>
          <ThemeProvider theme={appTheme}>
            <GlobalStyle />
            <MainApp onError={handleError} />
          </ThemeProvider>
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
