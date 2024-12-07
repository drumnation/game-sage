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
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

export const SceneIndicators = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    .ant-tag {
        margin: 0;
    }
`;

export const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 44px;
    padding: 4px;

    .timestamp {
        font-size: 16px;
        font-weight: 600;
        color: #000000;
        padding: 4px 8px;
        border-radius: 4px;
        letter-spacing: 0.5px;
        background-color: rgba(0, 0, 0, 0.06);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .scene-score {
        background-color: rgba(0, 0, 0, 0.1);
        color: ${({ theme }) => theme.colors.textPrimary};
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        transition: all 0.3s ease;
        white-space: nowrap;

        &.significant {
            background-color: rgba(82, 196, 26, 0.2);
            color: #52c41a;
            font-weight: bold;
        }
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
`; 