import React from 'react';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { store, persistor } from './store/store';
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
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
          <AntApp>
            <ThemeProvider theme={appTheme}>
              <GlobalStyle />
              <MainApp onError={handleError} />
            </ThemeProvider>
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
