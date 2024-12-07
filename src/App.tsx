import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { Provider } from 'react-redux';
import { store } from './store/store';

const { Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const StyledHeader = styled(Header)`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
`;

const StyledContent = styled(Content)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: theme.colors.primary,
              colorBgBase: theme.colors.background,
            },
            algorithm: antTheme.darkAlgorithm,
          }}
        >
          <StyledLayout>
            <StyledHeader>
              <Title>GameSage</Title>
            </StyledHeader>
            <StyledContent>
              {/* Content will be added in future phases */}
            </StyledContent>
          </StyledLayout>
        </ConfigProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
