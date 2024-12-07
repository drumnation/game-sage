import styled from 'styled-components';

export const AppContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
`; 