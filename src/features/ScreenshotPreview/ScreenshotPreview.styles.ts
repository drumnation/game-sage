import styled from 'styled-components';

export const PreviewContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.background};

    :fullscreen {
        background-color: ${({ theme }) => theme.colors.background};
    }
`;

export const MainPreview = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    overflow: hidden;
    position: relative;

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    :fullscreen & {
        padding: 0;
        
        img {
            max-height: calc(100vh - 200px); /* Account for timeline and analysis */
        }
    }
`;

export const TimelineSection = styled.div`
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} calc(${({ theme }) => theme.spacing.md} + 24px);
    background-color: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    :fullscreen & {
        background-color: ${({ theme }) => theme.colors.background}DD;
        backdrop-filter: blur(10px);
    }
`;

export const Controls = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    position: relative;

    .timestamp {
        position: absolute;
        left: 0;
        min-width: 100px;
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 14px;
    }

    .buttons {
        display: flex;
        gap: ${({ theme }) => theme.spacing.sm};
        padding: 4px;
        background: ${({ theme }) => theme.colors.surface}22;
        border-radius: 20px;
        backdrop-filter: blur(4px);

        .ant-btn {
            border-radius: 16px;
            
            &:hover {
                background: ${({ theme }) => theme.colors.surface}44;
            }

            &[disabled] {
                opacity: 0.5;
                background: transparent;
            }
        }
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    padding: ${({ theme }) => theme.spacing.xl};

    .icon {
        font-size: 48px;
        margin-bottom: ${({ theme }) => theme.spacing.md};
        opacity: 0.5;
    }

    .message {
        font-size: 18px;
        margin-bottom: ${({ theme }) => theme.spacing.sm};
    }

    .subtitle {
        font-size: 14px;
        opacity: 0.7;
    }
`;

export const BottomText = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
`; 