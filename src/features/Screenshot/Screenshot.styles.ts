import styled from 'styled-components';

export const ScreenshotContainer = styled.div`
    display: flex;
    height: 100%;
`;

export const ScreenshotSider = styled.div`
    width: 300px;
    padding: 16px;
    background-color: ${({ theme }) => theme.colors.background};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ScreenshotContent = styled.main`
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
    justify-items: center;
`;

export const SettingsPanel = styled.div`
    margin-bottom: 16px;
`;

export const ControlsPanel = styled.div`
    display: flex;
    justify-content: center;
`; 