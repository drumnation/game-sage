import styled from 'styled-components';
import { Card } from 'antd';

export const Container = styled.div`
    padding: 20px;
`;

export const StyledCard = styled(Card)`
    background: ${props => props.theme.colors.background};
    border-radius: ${props => props.theme.borderRadius};
`;

export const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
`;

export const ControlsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`; 