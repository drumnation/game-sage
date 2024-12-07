import styled from 'styled-components';
import { Button as AntButton } from 'antd';

export const styleConstants = {
    transitions: {
        hover: '0.2s transform ease-in-out'
    }
};

export const StyledButton = styled(AntButton)`
    transition: ${styleConstants.transitions.hover};

    &:hover {
        transform: translateY(-1px);
    }
`; 