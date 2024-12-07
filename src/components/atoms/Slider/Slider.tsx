import { type FC } from 'react';
import type { SliderProps } from './Slider.types';
import { StyledSlider } from './Slider.styles';
import { useSlider } from './Slider.hook';

/**
 * A reusable slider component that wraps Ant Design's Slider with our custom styling.
 * 
 * @component
 * @example
 * ```tsx
 * <Slider 
 *   min={0} 
 *   max={100} 
 *   defaultValue={30} 
 *   onChange={(value) => console.log(value)} 
 * />
 * ```
 */
export const Slider: FC<SliderProps> = (props) => {
    const { handleChange } = useSlider(props);

    return (
        <StyledSlider {...props} onChange={handleChange} />
    );
}; 