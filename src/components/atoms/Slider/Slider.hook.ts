import { useCallback } from 'react';
import type { SliderProps } from './Slider.types';

export const useSlider = (props: SliderProps) => {
    const handleChange = useCallback(
        (value: number) => {
            props.onChange?.(value);
        },
        [props.onChange]
    );

    return { handleChange };
}; 