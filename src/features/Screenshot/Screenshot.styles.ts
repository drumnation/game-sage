import styled from 'styled-components';
import { Layout } from 'antd';
import { Card } from 'antd';

/**
 * Main container for the screenshot feature
 */
export const ScreenshotContainer = styled(Layout)`
    height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius};
    overflow: hidden;

    .ant-layout-sider {
        background-color: ${({ theme }) => theme.colors.surface};
        border-right: 1px solid ${({ theme }) => theme.colors.divider};
    }

    .ant-layout-content {
        padding: ${({ theme }) => theme.spacing.md};
        background-color: ${({ theme }) => theme.colors.background};
    }
`;

/**
 * Container for screenshot controls
 */
export const ControlsContainer = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.divider};
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
    overflow: auto;
    height: calc(100vh - 200px);
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
`;

export const MetadataContainer = styled.div`
    margin-top: 8px;
    color: #8c8c8c;
    font-size: 12px;
`; 