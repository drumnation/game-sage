import type { SliderSingleProps } from 'antd';

/**
 * Props for the Slider component.
 * Extends Ant Design's SliderSingleProps to maintain consistency with the design system.
 * 
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
export type SliderProps = SliderSingleProps; 