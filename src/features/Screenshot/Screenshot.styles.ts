import styled from 'styled-components';
import { Layout, Card } from 'antd';

const { Sider } = Layout;

/**
 * Main container for the screenshot feature
 */
export const ScreenshotContainer = styled(Layout)`
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius};
    overflow: hidden;
`;

/**
 * Side panel for controls
 */
export const ScreenshotSider = styled(Sider)`
    background-color: ${({ theme }) => theme.colors.surface};
    border-right: 1px solid ${({ theme }) => theme.colors.divider};
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 320px !important;
    min-width: 320px !important;
    max-width: 320px !important;
    overflow-y: auto;
`;

/**
 * Settings panel container
 */
export const SettingsPanel = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

/**
 * Controls panel container
 */
export const ControlsPanel = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.surface};
    display: flex;
    justify-content: center;
    align-items: center;
    
    .ant-btn {
        width: 100%;
        height: 40px;
    }
`;

/**
 * Main content area
 */
export const ScreenshotContent = styled(Layout.Content)`
    margin-left: 320px;
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.background};
    min-height: 100vh;
    overflow-y: auto;
`;

/**
 * Container for the screenshot grid
 */
export const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.divider};
    overflow: visible;
    min-height: calc(100vh - 200px);
`;

/**
 * Card component for screenshot previews
 */
export const ScreenshotCard = styled(Card) <{ $isSelected?: boolean }>`
    margin-bottom: 16px;
    border: ${props => props.$isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: #1890ff;
    }

    img {
        width: 100%;
        height: auto;
        object-fit: contain;
    }
`;

export const MetadataContainer = styled.div`
    margin-top: 8px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`; 