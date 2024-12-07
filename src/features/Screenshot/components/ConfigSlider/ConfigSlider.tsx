import React from 'react';
import { Slider as AntSlider } from 'antd';
import styled from 'styled-components';
import type { ConfigSliderProps } from './ConfigSlider.types';

const SliderContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ConfigSlider: React.FC<ConfigSliderProps> = ({
    label,
    ...sliderProps
}) => (
    <SliderContainer>
        <Label>{label}</Label>
        <AntSlider {...sliderProps} />
    </SliderContainer>
); 