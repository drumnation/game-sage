import styled from 'styled-components';
import { Card } from '@atoms';

interface StyledCardProps {
    $isSelected?: boolean;
}

export const ImageContainer = styled.div`
    width: 100%;
    height: 200px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
    border-radius: 4px;
    margin-bottom: 8px;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

export const StyledScreenshotCard = styled(Card) <StyledCardProps>`
    width: 300px;
    padding: 8px;
    border: ${props => props.$isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
    margin: 8px;
    cursor: pointer;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
        border-color: #1890ff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .timestamp {
        margin-top: 8px;
        font-size: 12px;
        color: ${({ theme }) => theme.colors.textSecondary};
        text-align: center;
    }
`; 