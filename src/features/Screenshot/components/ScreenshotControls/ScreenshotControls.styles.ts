import styled from 'styled-components';
import { Card } from 'antd';

export const ControlsContainer = styled(Card)`
    display: flex;
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.surface};
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const ButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`; 