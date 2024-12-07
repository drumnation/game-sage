import styled from 'styled-components';
import { Button } from 'antd';

export const StyledButton = styled(Button)`
    min-width: 120px;
    &.ant-btn-loading {
        opacity: 0.7;
    }
`; 