import styled from 'styled-components';

export const PanelContainer = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background};
    overflow: hidden;
`; 