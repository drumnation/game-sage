import styled from 'styled-components';

export const ScreenshotContainer = styled.div`
    display: flex;
    height: 100vh;
    border: 2px solid red;
`;

export const ScreenshotSider = styled.div`
    width: 300px;
    padding: 16px;
    background-color: ${({ theme }) => theme.colors.background};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    overflow-y: auto;
    border: 2px solid blue;
`;

export const ScreenshotContent = styled.main`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background};
    overflow: hidden;
    min-height: 100%;
    border: 2px solid green;
`;

export const MainPreviewContainer = styled.div`
    height: 40vh;
    min-height: 300px;
    max-height: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    border: 2px solid yellow;

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
`;

export const GameAdviceContainer = styled.div`
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    border: 2px solid orange;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
`;

export const TimelineContainer = styled.div`
    height: 80px;
    padding: 8px 16px;
    background-color: rgba(0, 0, 0, 0.03);
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    display: flex;
    gap: 16px;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
`;

interface TimelineItemProps {
    $isSelected?: boolean;
}

export const TimelineItem = styled.div<TimelineItemProps>`
    flex: 0 0 auto;
    width: 100px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid ${props => props.$isSelected ? '#1890ff' : 'transparent'};
    transition: all 0.2s ease;

    &:hover {
        border-color: #1890ff;
    }

    img {
        width: 100%;
        height: 60px;
        object-fit: cover;
    }

    .time {
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: ${({ theme }) => theme.colors.textSecondary};
        background-color: ${props => props.$isSelected ? 'rgba(24, 144, 255, 0.1)' : 'transparent'};
    }
`;

export const NoScreenshotsMessage = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 18px;
    gap: 16px;
    text-align: center;
    border: 2px solid purple;

    .icon {
        font-size: 48px;
        opacity: 0.5;
    }

    .message {
        font-weight: 500;
    }

    .subtitle {
        font-size: 14px;
        opacity: 0.7;
    }
`;

export const ControlsPanel = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 16px;
`; 