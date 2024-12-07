import styled from 'styled-components';
import { Card } from '@atoms';

interface StyledCardProps {
    $isSelected?: boolean;
}

/**
 * Styled card component for screenshots
 * Extends the base Card atom with screenshot-specific styling
 */
export const StyledScreenshotCard = styled(Card) <StyledCardProps>`
    border: ${props => props.$isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
    margin-bottom: 16px;
    cursor: pointer;

    &:hover {
        border-color: #1890ff;
    }

    img {
        width: 100%;
        height: auto;
        object-fit: contain;
    }

    .timestamp {
        margin-top: 8px;
        font-size: 12px;
        color: ${({ theme }) => theme.colors.textSecondary};
    }
`; 