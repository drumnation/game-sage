import React from 'react';
import { ConfigProvider, App as AntApp, theme as antTheme } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { MainApp } from './pages/MainApp';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme as appTheme } from './styles/theme';

// Inner component that uses AntApp.useApp hook
const AppContent: React.FC = () => {
  const { message } = AntApp.useApp();

  const handleError = (error: Error) => {
    message.error(error.message);
  };

  return (
    <>
      <GlobalStyle />
      <MainApp onError={handleError} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            algorithm: antTheme.darkAlgorithm,
            token: {
              colorPrimary: appTheme.colors.primary,
              colorLink: appTheme.colors.primary,
              colorPrimaryHover: '#FF8533',
              colorPrimaryActive: '#FF4D00'
            }
          }}
        >
          <AntApp>
            <AppContent />
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
