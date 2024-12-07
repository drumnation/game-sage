import styled from 'styled-components';
import { Slider as AntSlider } from 'antd';

export const StyledSlider = styled(AntSlider)`
    .ant-slider-handle {
        border-color: var(--ant-primary-color);
        
        &:hover {
            border-color: var(--ant-primary-color);
        }
    }

    .ant-slider-track {
        background-color: var(--ant-primary-color);
    }
`; 