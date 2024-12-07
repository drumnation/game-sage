import styled from 'styled-components';

export const PreviewContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
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
`;

export const TimelineSection = styled.div`
    height: 80px;
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    .timestamp {
        min-width: 100px;
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 14px;
    }

    .buttons {
        display: flex;
        gap: ${({ theme }) => theme.spacing.sm};
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